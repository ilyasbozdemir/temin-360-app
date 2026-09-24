import React, { useEffect, useMemo, useState } from 'react'
import { SubScreen } from '../SubScreen'
import {
  AlertTriangle,
  Check,
  Database,
  Download,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'

interface TableInfo {
  name: string
  count: number
}

interface ColumnInfo {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: unknown
  pk: number
}

interface EditingCell {
  rowIndex: number
  colName: string
  originalValue: unknown
}

export function DatabaseBrowserScreen(): React.JSX.Element {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableSearch, setTableSearch] = useState<string>('')
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [dataSearch, setDataSearch] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'data' | 'schema' | 'console'>('data')
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Cell Editing State
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  // Add Record Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
  const [newRowData, setNewRowData] = useState<Record<string, string>>({})

  // Delete Confirm Modal State
  const [deletingRow, setDeletingRow] = useState<Record<string, unknown> | null>(null)

  // SQL Console states
  const [consoleQuery, setConsoleQuery] = useState<string>('')
  const [consoleResults, setConsoleResults] = useState<Record<string, unknown>[]>([])
  const [consoleError, setConsoleError] = useState<string | null>(null)
  const [consoleLoading, setConsoleLoading] = useState<boolean>(false)

  // Primary key column detector
  const pkColumn = useMemo(() => {
    return columns.find((c) => c.pk > 0) || columns[0]
  }, [columns])

  const loadTables = async (): Promise<void> => {
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      )
      if (res.success && res.data) {
        const list: TableInfo[] = []
        for (const t of res.data) {
          const countRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT COUNT(*) as row_count FROM ${t.name}`
          )
          list.push({
            name: t.name,
            count: countRes.success && countRes.data[0] ? countRes.data[0].row_count : 0
          })
        }
        setTables(list)
        setSelectedTable((prev) => prev || (list.length > 0 ? list[0].name : ''))
      }
    } catch (e) {
      console.error('Failed to load sqlite tables:', e)
    }
  }

  useEffect(() => {
    let isMounted = true
    const fetchInitTables = async (): Promise<void> => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      )
      if (res.success && res.data && isMounted) {
        const list: TableInfo[] = []
        for (const t of res.data) {
          const countRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT COUNT(*) as row_count FROM ${t.name}`
          )
          list.push({
            name: t.name,
            count: countRes.success && countRes.data[0] ? countRes.data[0].row_count : 0
          })
        }
        setTables(list)
        setSelectedTable((prev) => prev || (list.length > 0 ? list[0].name : ''))
      }
    }
    void fetchInitTables()
    return () => {
      isMounted = false
    }
  }, [])

  // Load table details (schema + rows)
  const loadTableDetails = async (): Promise<void> => {
    if (!selectedTable) return
    setLoading(true)
    setEditingCell(null)
    setStatusMessage(null)
    try {
      const schemaRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `PRAGMA table_info(${selectedTable})`
      )
      if (schemaRes.success) {
        setColumns(schemaRes.data || [])
      }

      const dataRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT * FROM ${selectedTable} LIMIT 200`
      )
      if (dataRes.success) {
        setRows(dataRes.data || [])
      }
    } catch (e) {
      console.error('Failed to load table details:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    if (!selectedTable) return

    const fetchDetails = async (): Promise<void> => {
      setLoading(true)
      setEditingCell(null)
      setStatusMessage(null)
      try {
        const schemaRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `PRAGMA table_info(${selectedTable})`
        )
        if (schemaRes.success && isMounted) {
          setColumns(schemaRes.data || [])
        }

        const dataRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT * FROM ${selectedTable} LIMIT 200`
        )
        if (dataRes.success && isMounted) {
          setRows(dataRes.data || [])
        }
      } catch (e) {
        console.error('Failed to load table details:', e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void fetchDetails()
    return () => {
      isMounted = false
    }
  }, [selectedTable])

  const filteredTables = useMemo(() => {
    const query = tableSearch.toLowerCase().trim()
    if (!query) return tables
    return tables.filter((t) => t.name.toLowerCase().includes(query))
  }, [tables, tableSearch])

  const filteredRows = useMemo(() => {
    const q = dataSearch.toLowerCase().trim()
    if (!q) return rows
    return rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(q)
      )
    )
  }, [rows, dataSearch])

  // Start cell editing
  const handleCellClick = (rowIndex: number, colName: string, val: unknown): void => {
    setEditingCell({ rowIndex, colName, originalValue: val })
    setEditValue(val === null || val === undefined ? '' : String(val))
  }

  // Save edited cell value to SQLite
  const handleSaveCell = async (): Promise<void> => {
    if (!editingCell || !selectedTable) return
    const row = rows[editingCell.rowIndex]
    if (!row) return

    const { colName, originalValue } = editingCell
    if (String(originalValue ?? '') === editValue.trim()) {
      setEditingCell(null)
      return
    }

    try {
      let query = ''
      const params: unknown[] = []

      if (pkColumn && row[pkColumn.name] !== undefined) {
        query = `UPDATE ${selectedTable} SET ${colName} = ? WHERE ${pkColumn.name} = ?`
        params.push(editValue.trim() === '' ? null : editValue, row[pkColumn.name])
      } else {
        const whereClauses = columns
          .map((c) => (row[c.name] === null ? `${c.name} IS NULL` : `${c.name} = ?`))
          .join(' AND ')
        const whereParams = columns.filter((c) => row[c.name] !== null).map((c) => row[c.name])
        query = `UPDATE ${selectedTable} SET ${colName} = ? WHERE ${whereClauses}`
        params.push(editValue.trim() === '' ? null : editValue, ...whereParams)
      }

      const res = await window.electron.ipcRenderer.invoke('db:query', query, params)
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Hücre (${colName}) başarıyla güncellendi.`
        })
        await loadTableDetails()
        await loadTables()
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Güncelleme başarısız oldu.'
        })
      }
    } catch (err: unknown) {
      const error = err as Error
      setStatusMessage({
        type: 'error',
        text: error.message || 'Güncelleme hatası.'
      })
    } finally {
      setEditingCell(null)
    }
  }

  // Insert new record
  const handleInsertRow = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedTable) return

    const colsToInsert = Object.keys(newRowData).filter((k) => newRowData[k].trim() !== '')
    if (colsToInsert.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'Lütfen en az bir alan doldurun.'
      })
      return
    }

    const placeholders = colsToInsert.map(() => '?').join(', ')
    const values = colsToInsert.map((k) => newRowData[k])
    const sql = `INSERT INTO ${selectedTable} (${colsToInsert.join(', ')}) VALUES (${placeholders})`

    try {
      const res = await window.electron.ipcRenderer.invoke('db:query', sql, values)
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Yeni kayıt başarıyla eklendi.'
        })
        setIsAddModalOpen(false)
        setNewRowData({})
        await loadTableDetails()
        await loadTables()
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Kayıt eklenemedi.'
        })
      }
    } catch (err: unknown) {
      const error = err as Error
      setStatusMessage({
        type: 'error',
        text: error.message || 'Ekleme hatası.'
      })
    }
  }

  // Delete row
  const handleDeleteRowConfirm = async (): Promise<void> => {
    if (!deletingRow || !selectedTable) return

    try {
      let sql = ''
      const params: unknown[] = []

      if (pkColumn && deletingRow[pkColumn.name] !== undefined) {
        sql = `DELETE FROM ${selectedTable} WHERE ${pkColumn.name} = ?`
        params.push(deletingRow[pkColumn.name])
      } else {
        const whereClauses = columns
          .map((c) => (deletingRow[c.name] === null ? `${c.name} IS NULL` : `${c.name} = ?`))
          .join(' AND ')
        params.push(
          ...columns.filter((c) => deletingRow[c.name] !== null).map((c) => deletingRow[c.name])
        )
        sql = `DELETE FROM ${selectedTable} WHERE ${whereClauses}`
      }

      const res = await window.electron.ipcRenderer.invoke('db:query', sql, params)
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Kayıt veritabanından silindi.'
        })
        setDeletingRow(null)
        await loadTableDetails()
        await loadTables()
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Silme işlemi başarısız.'
        })
      }
    } catch (err: unknown) {
      const error = err as Error
      setStatusMessage({
        type: 'error',
        text: error.message || 'Silme hatası.'
      })
    }
  }

  // Export current view data as CSV/Excel
  const handleExportCsv = (): void => {
    if (rows.length === 0 || columns.length === 0) return

    const headers = columns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(',')
    const csvLines = rows.map((r) =>
      columns
        .map((c) => {
          const val = r[c.name]
          if (val === null || val === undefined) return '""'
          return `"${String(val).replace(/"/g, '""')}"`
        })
        .join(',')
    )

    const csvContent = '\uFEFF' + [headers, ...csvLines].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${selectedTable}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Run SQL Console query
  const handleRunQuery = async (): Promise<void> => {
    if (!consoleQuery.trim()) return
    setConsoleLoading(true)
    setConsoleError(null)
    setConsoleResults([])
    try {
      const res = await window.electron.ipcRenderer.invoke('db:query', consoleQuery.trim())
      if (res.success) {
        setConsoleResults(res.data || [])
      } else {
        setConsoleError(res.error || 'Sorgu çalıştırılırken bilinmeyen bir hata oluştu.')
      }
    } catch (e) {
      const err = e as Error
      setConsoleError(err.message || 'Hata: Sorgu yürütülemedi.')
    } finally {
      setConsoleLoading(false)
    }
  }

  return (
    <SubScreen
      title="SQLite Veritabanı Gezgini & Düzenleyici"
      icon={Database}
      description="Veritabanı tablolarındaki verileri inceleyin, hücre bazında Excel gibi anında güncelleyin veya yeni kayıt ekleyin."
      hideStepper
      requireActiveDosya={false}
    >
      <div className="flex gap-6 h-[calc(100vh-240px)] min-h-[500px] mt-4 relative font-sans">
        {/* Sidebar: Tables List */}
        <div className="w-1/4 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-4 h-full bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tablo ara..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-left"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {filteredTables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer border-0 ${
                  selectedTable === t.name
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/10'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Database
                    className={`w-3.5 h-3.5 ${
                      selectedTable === t.name ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate font-mono">{t.name}</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold font-mono shrink-0 ${
                    selectedTable === t.name
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
            {filteredTables.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                Tablo bulunamadı.
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden flex flex-col h-full bg-white dark:bg-slate-900">
          {/* Top Header & Actions Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                📂 {selectedTable || 'Seçilmedi'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                ({rows.length} kayıt listeleniyor)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'data' && (
                <>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Verilerde ara..."
                      value={dataSearch}
                      onChange={(e) => setDataSearch(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 font-sans"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer border-0 shadow-sm"
                    title="Yeni Satır Ekle"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Kayıt</span>
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer border-0"
                    title="Excel / CSV Formatında İndir"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel / CSV</span>
                  </button>
                </>
              )}

              <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-sans ml-2">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer border-0 ${
                    activeTab === 'data'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Tablo Verileri (Düzenle)
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer border-0 ${
                    activeTab === 'schema'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Şema / Kolonlar
                </button>
                <button
                  onClick={() => setActiveTab('console')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer border-0 ${
                    activeTab === 'console'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  SQL Konsolu
                </button>
              </div>
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`mb-3 p-2.5 rounded-xl text-xs flex items-center justify-between font-medium animate-in fade-in shrink-0 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* System Relational Warning Banner */}
          {activeTab === 'data' && (
            <div className="mb-3 p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2 shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>⚠️ Sistem ve İlişkili ID Uyarısı:</strong> Primary Key (<code>PK</code>),
                Foreign Key (<code>FK</code> / <code>*_id</code>) veya sistem durum alanlarını
                değiştirirken veya bu satırları silerken dikkatli olun. Bu veriler diğer tablolarla
                (Dosya, Firma, Kalemler, Belge vb.) ilişkilidir.
              </span>
            </div>
          )}

          {/* Interactive Screen Content */}
          <div className="flex-1 overflow-hidden relative">
            {loading && activeTab !== 'console' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 z-10 text-xs text-slate-500 italic">
                Veriler yükleniyor...
              </div>
            ) : null}

            {/* TAB 1: INTERACTIVE DATA GRID (EXCEL-LIKE CELL EDITING) */}
            {activeTab === 'data' && (
              <div className="h-full flex flex-col justify-between">
                <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl custom-scrollbar relative bg-white dark:bg-slate-950">
                  {filteredRows.length === 0 ? (
                    <div className="text-center py-20 text-xs text-slate-400 italic">
                      Bu tabloda aramanızla eşleşen kayıt bulunamadı.
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-[11px] text-left select-none">
                      <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800 z-10">
                        <tr>
                          <th className="p-2 w-10 text-center border-r border-slate-200 dark:border-slate-800 text-slate-400">
                            #
                          </th>
                          {columns.map((c) => {
                            const isPk = c.pk === 1
                            const isFk = c.name.endsWith('_id') || (c.name === 'id' && !isPk)
                            const isSystemFlag = [
                              'durum_asama_id',
                              'aktif_mi',
                              'is_deleted',
                              'status'
                            ].includes(c.name)

                            return (
                              <th
                                key={c.name}
                                className="p-2.5 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap"
                              >
                                {c.name}
                                {isPk && (
                                  <span
                                    title="Birincil Anahtar (Kritik ID): Bu ID değiştirilirse ilişkili tüm tablolardaki bağlantılar kopabilir!"
                                    className="ml-1 text-[8px] bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-1 py-0.5 rounded uppercase font-extrabold font-sans cursor-help"
                                  >
                                    PK 🔑
                                  </span>
                                )}
                                {!isPk && isFk && (
                                  <span
                                    title="İlişkili Dış Anahtar (FK): Başka bir tablonun ID değerine işaret eder (Örn: temin_dosya_id, firma_id)."
                                    className="ml-1 text-[8px] bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 px-1 py-0.5 rounded uppercase font-extrabold font-sans cursor-help"
                                  >
                                    FK 🔗
                                  </span>
                                )}
                                {isSystemFlag && (
                                  <span
                                    title="Süreç ve Durum Kontrol Alanı: Uygulama mantığını etkiler."
                                    className="ml-1 text-[8px] bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 px-1 py-0.5 rounded uppercase font-extrabold font-sans cursor-help"
                                  >
                                    SİSTEM ⚙️
                                  </span>
                                )}
                              </th>
                            )
                          })}
                          <th className="p-2 w-12 text-center text-slate-400 font-sans">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono">
                        {filteredRows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-blue-50/30 dark:hover:bg-slate-900/40 transition-colors"
                          >
                            <td className="p-2 border-r border-slate-150 dark:border-slate-850 text-center text-slate-400 text-[10px]">
                              {rIdx + 1}
                            </td>
                            {columns.map((c) => {
                              const val = row[c.name]
                              const isEditing =
                                editingCell?.rowIndex === rIdx && editingCell?.colName === c.name
                              const isRelational = c.pk === 1 || c.name.endsWith('_id')

                              return (
                                <td
                                  key={c.name}
                                  onDoubleClick={() => handleCellClick(rIdx, c.name, val)}
                                  className={`p-2 border-r border-slate-150 dark:border-slate-850 max-w-60 truncate cursor-pointer transition-colors relative ${
                                    isEditing
                                      ? 'bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-500'
                                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                                  }`}
                                  title="Çift tıklayarak hücreyi düzenleyin"
                                >
                                  {isEditing ? (
                                    <div className="flex flex-col gap-1">
                                      {isRelational && (
                                        <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 font-sans flex items-center gap-1">
                                          <AlertTriangle className="w-2.5 h-2.5" /> İlişkili ID
                                          alanı!
                                        </span>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="text"
                                          autoFocus
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleSaveCell()
                                            }
                                            if (e.key === 'Escape') {
                                              setEditingCell(null)
                                            }
                                          }}
                                          className={`w-full bg-white dark:bg-slate-900 border rounded px-1.5 py-0.5 text-xs focus:outline-none font-mono ${
                                            isRelational ? 'border-amber-500' : 'border-blue-500'
                                          }`}
                                        />
                                        <button
                                          onClick={handleSaveCell}
                                          className="text-emerald-600 hover:text-emerald-700 cursor-pointer p-0.5 border-0 bg-transparent"
                                          title="Kaydet (Enter)"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setEditingCell(null)}
                                          className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 border-0 bg-transparent"
                                          title="İptal (Esc)"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <span>
                                      {val === null || val === undefined ? (
                                        <span className="text-slate-300 dark:text-slate-600 italic text-[10px]">
                                          NULL
                                        </span>
                                      ) : typeof val === 'object' ? (
                                        JSON.stringify(val)
                                      ) : (
                                        String(val)
                                      )}
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                            <td className="p-2 text-center">
                              <button
                                onClick={() => setDeletingRow(row)}
                                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 border-0 bg-transparent"
                                title="Kayıt Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400 font-sans italic shrink-0">
                  <span>
                    💡 * İpucu: Herhangi bir hücreye <strong>çift tıklayarak</strong> değerini
                    değiştirebilirsiniz.
                  </span>
                  <span>Sayfa başına limit: 200 kayıt</span>
                </div>
              </div>
            )}

            {/* TAB 2: SCHEMA / COLUMNS */}
            {activeTab === 'schema' && (
              <div className="h-full overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
                <table className="w-full border-collapse text-[10px] text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr className="text-slate-600 dark:text-slate-400">
                      <th className="p-3 w-16 text-center">CID</th>
                      <th className="p-3">Kolon Adı</th>
                      <th className="p-3 w-32">Veri Tipi</th>
                      <th className="p-3 w-32 text-center">Boş Değer (Nullable)</th>
                      <th className="p-3 w-32 text-center">Anahtar &amp; Tür</th>
                      <th className="p-3">Varsayılan Değer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono">
                    {columns.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 text-center text-slate-400">
                          {c.cid}
                        </td>
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 font-bold text-slate-800 dark:text-slate-200">
                          {c.name}
                        </td>
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 uppercase text-blue-600 dark:text-blue-400 font-bold">
                          {c.type || 'TEXT'}
                        </td>
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 text-center font-bold">
                          {c.notnull === 1 ? (
                            <span className="text-red-500 font-bold">NOT NULL</span>
                          ) : (
                            <span className="text-slate-400">NULLABLE</span>
                          )}
                        </td>
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 text-center">
                          {c.pk === 1 ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 rounded font-black text-[9px]">
                              PRIMARY KEY 🔑
                            </span>
                          ) : c.name.endsWith('_id') ? (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 rounded font-black text-[9px]">
                              FOREIGN KEY 🔗
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-slate-500">
                          {c.dflt_value === null ? (
                            <span className="italic text-slate-300 dark:text-slate-600">yok</span>
                          ) : (
                            String(c.dflt_value)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: SQL CONSOLE */}
            {activeTab === 'console' && (
              <div className="h-full flex flex-col gap-4 overflow-hidden">
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      SQL Sorgu Girişi (SELECT, UPDATE, INSERT, DELETE çalıştırabilirsiniz)
                    </label>
                    <button
                      onClick={() =>
                        setConsoleQuery(
                          `SELECT * FROM ${selectedTable || 'DATA_TeminDosyasi'} LIMIT 20`
                        )
                      }
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer border-0 bg-transparent"
                    >
                      Taslak Sorgu Doldur
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={consoleQuery}
                      onChange={(e) => setConsoleQuery(e.target.value)}
                      placeholder="SELECT * FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY id DESC"
                      className="flex-1 font-mono text-xs p-3 bg-slate-955 text-slate-300 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 custom-scrollbar whitespace-pre-wrap"
                    />
                    <button
                      onClick={handleRunQuery}
                      disabled={consoleLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold px-5 text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all shrink-0 cursor-pointer border-0"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${consoleLoading ? 'animate-spin' : ''}`}
                      />
                      Sorguyu Çalıştır
                    </button>
                  </div>
                </div>

                {/* Console results block */}
                <div className="flex-1 overflow-hidden relative border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
                  {consoleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 z-10 text-xs text-slate-500 italic">
                      Sorgu yürütülüyor...
                    </div>
                  )}

                  {consoleError && (
                    <div className="p-4 bg-rose-50/50 border-b border-rose-200 text-rose-800 dark:bg-rose-955/15 dark:border-rose-900/30 dark:text-rose-400 text-xs flex items-start gap-2 h-full overflow-y-auto">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-1">SQL Hatası</span>
                        <pre className="font-mono text-[10px] whitespace-pre-wrap">
                          {consoleError}
                        </pre>
                      </div>
                    </div>
                  )}

                  {!consoleError && consoleResults.length === 0 ? (
                    <div className="text-center py-20 text-xs text-slate-400 italic">
                      {consoleLoading
                        ? 'Sonuçlar bekleniyor...'
                        : 'Sorgu çalıştırıldıktan sonra sonuçlar burada listelenecektir.'}
                    </div>
                  ) : !consoleError ? (
                    <div className="h-full overflow-auto custom-scrollbar">
                      <table className="w-full border-collapse text-[10px] text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            {Object.keys(consoleResults[0] || {}).map((key) => (
                              <th
                                key={key}
                                className="p-2 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono">
                          {consoleResults.map((row, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                            >
                              {Object.keys(row).map((key) => {
                                const val = row[key]
                                return (
                                  <td
                                    key={key}
                                    className="p-2 border-r border-slate-150 dark:border-slate-850 truncate max-w-[200px] text-slate-650 dark:text-slate-400"
                                    title={
                                      val !== null && typeof val === 'object'
                                        ? JSON.stringify(val)
                                        : String(val)
                                    }
                                  >
                                    {val === null ? (
                                      <span className="text-slate-350 dark:text-slate-600 italic">
                                        NULL
                                      </span>
                                    ) : typeof val === 'object' ? (
                                      JSON.stringify(val)
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD NEW ROW */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setNewRowData({})
        }}
        title={`Yeni Kayıt Ekle: ${selectedTable}`}
        description="Aşağıdaki alanları doldurarak tabloya doğrudan veritabanı kaydı ekleyebilirsiniz."
      >
        <form onSubmit={handleInsertRow} className="space-y-4">
          <div className="max-h-96 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {columns.map((c) => {
              const isRelational = c.pk === 1 || c.name.endsWith('_id')
              return (
                <div key={c.name}>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono">
                    {c.name}
                    {c.pk === 1 && (
                      <span className="ml-1 text-[9px] text-amber-600 font-sans uppercase font-bold">
                        (Primary Key - Otomatik)
                      </span>
                    )}
                    {c.name.endsWith('_id') && (
                      <span className="ml-1 text-[9px] text-purple-600 dark:text-purple-400 font-sans uppercase font-bold">
                        (Foreign Key - İlişkili ID)
                      </span>
                    )}
                    {c.notnull === 1 && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder={c.dflt_value ? `Varsayılan: ${c.dflt_value}` : 'Değer girin...'}
                    value={newRowData[c.name] || ''}
                    onChange={(e) =>
                      setNewRowData((prev) => ({
                        ...prev,
                        [c.name]: e.target.value
                      }))
                    }
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono text-slate-800 dark:text-slate-100 ${
                      isRelational
                        ? 'border-amber-300 dark:border-amber-900/60'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              Kaydı Ekle
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: DELETE CONFIRMATION */}
      <Modal
        isOpen={deletingRow !== null}
        onClose={() => setDeletingRow(null)}
        title="Kayıt Silinecek"
        description="Bu kaydı veritabanından kalıcı olarak silmek istediğinize emin misiniz?"
      >
        <div className="space-y-4">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>Dikkat:</strong> Bu kaydın silinmesi, diğer tablolarda bu ID&apos;ye bağlı
              verilerin yetim kalmasına (ilişkili veri kaybına) yol açabilir.
            </span>
          </div>

          {deletingRow && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono max-h-40 overflow-y-auto space-y-1">
              {Object.keys(deletingRow).map((k) => (
                <div
                  key={k}
                  className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1"
                >
                  <span className="text-slate-400">{k}:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {String(deletingRow[k] ?? 'NULL')}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingRow(null)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleDeleteRowConfirm}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
              <Trash2 className="w-4 h-4" />
              Evet, Kalıcı Olarak Sil
            </button>
          </div>
        </div>
      </Modal>
    </SubScreen>
  )
}
