import React, { useState, useEffect } from 'react'
import { Check, Edit2, FileText, Package, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { YeniDosyaTabProps } from '../types'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { useDosyalarHooks } from '../dosyalar.hooks'
import { useMalzemeListesi } from '../../dosya/sub-screens/components/MalzemeListesi/useMalzemeListesi'
import { MalzemeEkleModal } from '../../dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal'
import { cn } from '../../../utils/cn'

interface LastPurchaseItem {
  kalem_adi: string
  ozelligi: string
  miktar: string
  firma: string
  fiyat: string
  tarih: string
}

export function IhtiyacListesiTab(props: YeniDosyaTabProps): React.JSX.Element {
  const { formData, setFormData, isEdit, editId, getNextTeminNo } = props
  const { activeDosyaId: workspaceDosyaId } = useWorkspaceStore()
  const { addDosya } = useDosyalarHooks()

  const targetDosyaId = editId || (formData as any)?.id || workspaceDosyaId || null
  const state = useMalzemeListesi(targetDosyaId)

  const [lastPurchases, setLastPurchases] = useState<LastPurchaseItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Ensure dossier exists in DB so items can be safely attached
  const ensureDosyaId = async (): Promise<number | null> => {
    if (targetDosyaId) return targetDosyaId

    if (!formData.konu?.trim()) {
      alert('Lütfen önce 1. Adımda (Genel Bilgiler) dosya konusunu / işin adını giriniz.')
      return null
    }

    try {
      const targetYear = formData.butce_yili || new Date().getFullYear()
      const teminNo =
        formData.temin_no?.trim() ||
        (getNextTeminNo ? getNextTeminNo(targetYear) : `${targetYear}/1`)

      const res = await addDosya({
        ...formData,
        temin_no: teminNo,
        konu: formData.konu.trim(),
        status: 'devam_ediyor'
      })

      const newId =
        (res as { lastInsertRowid?: number })?.lastInsertRowid ||
        (res as any)?.data?.lastInsertRowid ||
        (res as any)?.id

      if (newId) {
        setFormData((prev) => ({ ...prev, id: newId, temin_no: teminNo }))
        return newId
      }
    } catch (err: any) {
      alert('Dosya taslağı oluşturulurken hata oluştu: ' + err.message)
    }
    return null
  }

  // Action button handlers
  const handleOpenManualAdd = async () => {
    const dId = await ensureDosyaId()
    if (dId || targetDosyaId) {
      state.setActiveTab('new')
      state.setIsAddModalOpen(true)
    }
  }

  const handleOpenLibraryAdd = async () => {
    const dId = await ensureDosyaId()
    if (dId || targetDosyaId) {
      state.setActiveTab('library')
      state.setIsAddModalOpen(true)
    }
  }

  const handleOpenAiAdd = async () => {
    const dId = await ensureDosyaId()
    if (dId || targetDosyaId) {
      state.setActiveTab('new')
      state.setIsAddModalOpen(true)
      if (formData.konu) {
        state.setKalemAdi(formData.konu)
        state.setSearchQuery(formData.konu)
      }
    }
  }

  // Selection handlers
  const handleToggleSelectRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.size === state.items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(state.items.map((item: any) => item.id)))
    }
  }

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) {
      alert('Lütfen silinecek ihtiyaç kalemlerini seçin.')
      return
    }
    if (!confirm(`Seçilen ${ids.length} kalemi silmek istediğinize emin misiniz?`)) return

    try {
      for (const id of ids) {
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          'DELETE FROM DATA_TeminKalem WHERE id = ?',
          [id]
        )
      }
      setSelectedIds(new Set())
      if (state.loadData) state.loadData()
    } catch (err: any) {
      alert('Silme işleminde hata oluştu: ' + err.message)
    }
  }

  // Load Historical Purchases
  useEffect(() => {
    async function loadLastPurchases(): Promise<void> {
      setLoadingHistory(true)
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT kalem_adi, ozelligi, birim FROM TANIM_Kalem WHERE aktif_mi = 1 ORDER BY id DESC LIMIT 5'
        )
        if (res.success && res.data && res.data.length > 0) {
          const items = res.data.map(
            (
              item: { kalem_adi: string; ozelligi: string | null; birim: string | null },
              idx: number
            ) => ({
              kalem_adi: item.kalem_adi,
              ozelligi: item.ozelligi || 'Genel Şartnameye Uygun',
              miktar: `${(idx + 1) * 15} ${item.birim || 'Adet'}`,
              firma: '-',
              fiyat: '-',
              tarih: '-'
            })
          )
          setLastPurchases(items)
        } else {
          setLastPurchases([])
        }
      } catch (err) {
        console.error('Son alımlar yüklenirken hata oluştu:', err)
        setLastPurchases([])
      } finally {
        setLoadingHistory(false)
      }
    }
    loadLastPurchases()
  }, [])

  return (
    <>
      <MalzemeEkleModal state={state} />

      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-500 w-5 h-5" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              İhtiyaç Listesi & Alım Kalemleri
            </h2>
          </div>
          {state.items.length > 0 && (
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full">
              {state.items.length} Kalem Kayıtlı
            </span>
          )}
        </div>

        {/* ACTION BANNER */}
        <div className="bg-blue-50/80 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            <div>
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                EKAP & Taşınır Uyumlu Kalem Tanımlama
              </h3>
              <p className="text-xs text-blue-700/80 dark:text-blue-400 mt-1">
                İhale kalemlerinizi (OKAS / Taşınır kodlarıyla) ekleyerek Birim Fiyat Teklif Cetveli
                ve yaklaşık maliyet süreçlerini başlatabilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={handleOpenManualAdd}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={14} className="text-blue-600" />
                Manuel Kalem Ekle
              </button>
              <button
                type="button"
                onClick={handleOpenLibraryAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Package size={14} />+ OKAS & Kütüphaneden Aktar
              </button>
              <button
                type="button"
                onClick={handleOpenAiAdd}
                title="Yapay zeka ile malzeme önerisi ve teknik şartname açıklaması üretin."
                className="relative px-4 py-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Sparkles size={14} /> AI Kalem Bulucu
                <span className="absolute -top-2 -right-1 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-white/20 shadow-sm animate-pulse">
                  AI
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ITEMS LIST TABLE OR EMPTY STATE */}
        {state.items.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {/* Table Action Header */}
            <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === state.items.length && state.items.length > 0}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  title="Tümünü Seç"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kayıtlı Kalemler ({state.items.length} Kalem)
                </span>
              </div>

              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  Seçilenleri Sil ({selectedIds.size})
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Kalem / Malzeme Adı</th>
                    <th className="p-3">Taşınır / OKAS Kodu</th>
                    <th className="p-3 text-center w-28">Miktar</th>
                    <th className="p-3 text-center w-28">Birim</th>
                    <th className="p-3 text-center w-24">KDV (%)</th>
                    <th className="p-3 text-right w-24">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {state.items.map((item: any, idx: number) => {
                    const isEditing = state.editingId === item.id

                    return (
                      <tr
                        key={item.id || idx}
                        className={cn(
                          'hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors',
                          selectedIds.has(item.id) && 'bg-blue-50/40 dark:bg-blue-950/20'
                        )}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => handleToggleSelectRow(item.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-850 dark:text-slate-100">
                            {item.kalem_adi}
                          </div>
                          {item.aciklama && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {item.aciklama}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {item.tasinir_kodu || item.okas_kodu || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={state.editMiktar}
                              onChange={(e) => state.setEditMiktar(parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-blue-400 rounded-lg text-center font-bold text-xs bg-white dark:bg-slate-900"
                            />
                          ) : (
                            <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200">
                              {item.miktar}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <select
                              value={state.editBirim}
                              onChange={(e) => state.setEditBirim(e.target.value)}
                              className="px-2 py-1 border border-blue-400 rounded-lg text-xs bg-white dark:bg-slate-900 font-medium"
                            >
                              {(state.units || [{ ad: 'Adet' }]).map((u: any, uIdx: number) => (
                                <option key={u.ad || uIdx} value={u.ad}>
                                  {u.ad}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-400">
                              {item.birim || item.olcu_birimi || 'Adet'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={state.editKdv}
                              onChange={(e) => state.setEditKdv(parseInt(e.target.value, 10) || 0)}
                              className="w-16 px-2 py-1 border border-blue-400 rounded-lg text-center text-xs bg-white dark:bg-slate-900 font-bold"
                            />
                          ) : (
                            <span className="text-slate-600 dark:text-slate-400">
                              %{item.kdv_orani ?? 20}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => state.handleSaveEdit(item.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Kaydet"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => state.setEditingId(null)}
                                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="İptal"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => state.handleStartEdit(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Düzenle"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    confirm(`"${item.kalem_adi}" kalemini silmek istiyor musunuz?`)
                                  ) {
                                    state.handleDeleteItem(item.id)
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty State with Fast Action Buttons */
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 p-6 text-center space-y-3">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Bu Dosyaya Henüz Kalem Eklenmedi
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Doğrudan temin kapsamında alınacak mal, hizmet veya yapım işi kalemlerini
                kütüphaneden veya manuel olarak ekleyin.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={handleOpenLibraryAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Package size={14} />
                OKAS / Kütüphaneden Seç
              </button>
              <button
                type="button"
                onClick={handleOpenManualAdd}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                Manuel Kalem Gir
              </button>
            </div>
          </div>
        )}

        {/* Son Alım Fiyat Cetveli */}
        <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-emerald-500" />
                Referans Son Alım Fiyat Cetveli
              </h3>
              <p className="text-[10.5px] text-slate-500 mt-0.5">
                Önceki ihalelerdeki benzer kalemlerin fiyat geçmişi referans amaçlıdır.
              </p>
            </div>
          </div>
          <div className="max-h-[220px] overflow-auto custom-scrollbar">
            {loadingHistory ? (
              <div className="p-6 text-center text-xs text-slate-500">Yükleniyor...</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5 whitespace-nowrap">Malzeme Adı</th>
                    <th className="px-4 py-2.5 whitespace-nowrap">Özelliği</th>
                    <th className="px-4 py-2.5 whitespace-nowrap text-right">Miktarı</th>
                    <th className="px-4 py-2.5 whitespace-nowrap">Kazanan Firma</th>
                    <th className="px-4 py-2.5 whitespace-nowrap text-right">Fiyatı</th>
                    <th className="px-4 py-2.5 whitespace-nowrap text-right">Tarihi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {lastPurchases.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium">{item.kalem_adi}</td>
                      <td className="px-4 py-2.5 text-slate-500">{item.ozelligi}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{item.miktar}</td>
                      <td className="px-4 py-2.5">{item.firma}</td>
                      <td className="px-4 py-2.5 text-right font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                        {item.fiyat}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{item.tarih}</td>
                    </tr>
                  ))}
                  {lastPurchases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                        Henüz referans alım kaydı bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
