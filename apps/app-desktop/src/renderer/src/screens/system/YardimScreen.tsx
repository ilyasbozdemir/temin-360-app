import React, { useState } from 'react'
import {
  Cpu,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  HelpCircle
} from 'lucide-react'
import { ExcelViewer } from '../../components/ui/ExcelViewer'
import {
  DOCUMENTS,
  DogrudanTeminSurecAkisi,
  UygulamaRehberi,
  EkonomikVeFonksiyonelKodlarRehberi,
  DogrudanTeminMuhasebeRehberi,
  StandartDosyaPlaniRehberi
} from './yardim'

export default function YardimScreen(): React.JSX.Element {
  const [activeDoc, setActiveDoc] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const docId = searchParams.get('doc')
    if (docId) {
      for (const group of DOCUMENTS) {
        const found = group.items.find((item) => item.id === docId)
        if (found) return found
      }
    }
    return DOCUMENTS[0].items[0]
  })

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
      <div className="flex-none p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
          <HelpCircle className="w-7 h-7 text-blue-600" />
          Yardım ve Faydalı Dokümanlar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Sistemi kullanırken faydalanabileceğiniz resmi mevzuat, kullanım kılavuzları ve muhasebat
          tablolarına buradan ulaşabilirsiniz.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Document List */}
        <div className="w-[340px] flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {DOCUMENTS.map((group) => (
            <div key={group.category} className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-3">
                {group.category}
              </h2>
              {group.items.map((doc) => {
                const isExcel = doc.file.endsWith('.xls') || doc.file.endsWith('.xlsx')
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                      activeDoc.id === doc.id
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 dark:bg-slate-955 dark:hover:bg-slate-900 dark:hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isExcel ? (
                        <FileSpreadsheet
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            activeDoc.id === doc.id
                              ? 'text-green-600 dark:text-green-500'
                              : 'text-slate-400'
                          }`}
                        />
                      ) : (
                        <FileText
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            activeDoc.id === doc.id ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                      )}
                      <div>
                        <h3
                          className={`text-sm font-semibold mb-1 leading-tight ${
                            activeDoc.id === doc.id
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {doc.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-normal">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
          <div className="flex-none p-3 bg-white dark:bg-slate-955 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              {activeDoc.id === 'uygulamamizi_yakindan_taniyalim' ? (
                <Cpu className="w-4 h-4 text-blue-500" />
              ) : activeDoc.file.endsWith('.xls') || activeDoc.file.endsWith('.xlsx') ? (
                <FileSpreadsheet className="w-4 h-4 text-green-500" />
              ) : (
                <FileText className="w-4 h-4 text-blue-500" />
              )}
              {activeDoc.title}
            </h2>
            <div className="flex items-center gap-2">
              {activeDoc.id !== 'uygulamamizi_yakindan_taniyalim' &&
                activeDoc.id !== 'standart_dosya_plani_ve_saklama_rehberi' &&
                activeDoc.id !== 'ekonomik_ve_fonksiyonel_kodlar_rehberi' &&
                activeDoc.id !== 'dogrudan_temin_islem_sureci' &&
                activeDoc.id !== 'dogrudan_temin_muhasebe_rehberi' && (
                  <>
                    <a
                      href={activeDoc.file}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Yeni Sekmede Aç / Dışarıda Görüntüle"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Dışarıda Aç
                    </a>
                    <a
                      href={activeDoc.file}
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      İndir
                    </a>
                  </>
                )}
            </div>
          </div>

          <div className="flex-1 w-full h-full relative z-0 overflow-hidden bg-white dark:bg-slate-955">
            {activeDoc.id === 'uygulamamizi_yakindan_taniyalim' ? (
              <UygulamaRehberi />
            ) : activeDoc.id === 'standart_dosya_plani_ve_saklama_rehberi' ? (
              <StandartDosyaPlaniRehberi />
            ) : activeDoc.id === 'ekonomik_ve_fonksiyonel_kodlar_rehberi' ? (
              <EkonomikVeFonksiyonelKodlarRehberi />
            ) : activeDoc.id === 'dogrudan_temin_islem_sureci' ? (
              <DogrudanTeminSurecAkisi />
            ) : activeDoc.id === 'dogrudan_temin_muhasebe_rehberi' ? (
              <DogrudanTeminMuhasebeRehberi />
            ) : activeDoc.file.endsWith('.pdf') ? (
              <div className="p-4 w-full h-full">
                <iframe
                  src={`${activeDoc.file}#view=FitH`}
                  className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white"
                  title={activeDoc.title}
                />
              </div>
            ) : activeDoc.file.endsWith('.xls') || activeDoc.file.endsWith('.xlsx') ? (
              <ExcelViewer fileUrl={activeDoc.file} />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center text-center max-w-sm">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-400">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {activeDoc.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-8">Önizleme desteklenmiyor.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
