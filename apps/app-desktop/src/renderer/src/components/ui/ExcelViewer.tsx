import React, { useState, useEffect } from 'react'
import { FileSpreadsheet, Loader2 } from 'lucide-react'

interface ExcelViewerProps {
  fileUrl: string
}

export function ExcelViewer({ fileUrl }: ExcelViewerProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([])
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [activeSheet, setActiveSheet] = useState<string>('')
  const [workbook, setWorkbook] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const loadExcel = async () => {
      setLoading(true)
      setError('')
      try {
        const [res, XLSX] = await Promise.all([fetch(fileUrl), import('xlsx')])
        if (!res.ok) throw new Error('Dosya okunamadı.')
        const arrayBuffer = await res.arrayBuffer()
        const wb = XLSX.read(arrayBuffer, { type: 'array' })

        if (!isMounted) return
        setWorkbook(wb)
        setSheetNames(wb.SheetNames)

        if (wb.SheetNames.length > 0) {
          setActiveSheet(wb.SheetNames[0])
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
            header: 1,
            defval: ''
          })
          setData(rows)
        }
      } catch (e: any) {
        if (isMounted) setError(e.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadExcel()
    return () => {
      isMounted = false
    }
  }, [fileUrl])

  const handleSheetChange = async (name: string) => {
    if (!workbook) return
    setActiveSheet(name)
    const XLSX = await import('xlsx')
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: '' })
    setData(rows)
  }

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p className="text-sm font-medium">Excel tablosu yükleniyor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-red-500 border border-red-100">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-md font-bold text-red-700 mb-2">Önizleme Hatası</h3>
          <p className="text-sm text-red-600/80 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Tabs */}
      {sheetNames.length > 1 && (
        <div className="flex flex-none overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
          {sheetNames.map((name) => (
            <button
              key={name}
              onClick={() => handleSheetChange(name)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeSheet === name
                  ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-955">
        {data.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-max">
            <tbody>
              {data.map((row, rIndex) => (
                <tr
                  key={rIndex}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {row.map((cell: any, cIndex: number) => (
                    <td
                      key={cIndex}
                      className={`border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm whitespace-nowrap ${
                        rIndex === 0
                          ? 'bg-slate-100 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <p>Bu sayfa boş.</p>
          </div>
        )}
      </div>
    </div>
  )
}
