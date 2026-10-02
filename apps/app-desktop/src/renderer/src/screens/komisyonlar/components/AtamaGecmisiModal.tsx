import React from 'react'
import { Clock } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'

interface AtamaGecmisiModalProps {
  historyDosya: {
    id: number
    dosya_no: string
    is_tanimi: string
  } | null
  onClose: () => void
  historyLogs: any[]
  isHistoryLoading: boolean
}

export const AtamaGecmisiModal: React.FC<AtamaGecmisiModalProps> = ({
  historyDosya,
  onClose,
  historyLogs,
  isHistoryLoading
}) => {
  if (!historyDosya) return null

  return (
    <Modal
      isOpen={!!historyDosya}
      onClose={onClose}
      title={`Komisyon Atama Geçmişi (${historyDosya.dosya_no || `Dosya #${historyDosya.id}`})`}
      description={
        historyDosya.is_tanimi || 'Bu dosya için geçmişte yapılmış komisyon kadrosu değişiklikleri.'
      }
      className="max-w-4xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-1">
        {isHistoryLoading ? (
          <div className="p-8 text-center text-slate-500">Yükleniyor...</div>
        ) : historyLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic">
            Bu dosyaya ait herhangi bir geçmiş değişiklik kaydı bulunmuyor.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
            {historyLogs.map((log: any) => {
              let membersData: any[] = []
              try {
                membersData = JSON.parse(log.snapshot_data || '[]')
              } catch (_) {
                membersData = []
              }

              const isYaklasik = log.komisyon_turu === 'yaklasik_maliyet'

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Indicator Node */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider border ${
                            isYaklasik
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isYaklasik
                            ? 'Piyasa Fiyat Araştırma Kadrosu'
                            : 'Muayene & Kabul Kadrosu'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {log.islem_turu || 'Güncelleme'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </div>
                    </div>

                    {/* Snapshot Members List */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Kayıtlı Kadro Listesi ({membersData.length} Görevli)
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {membersData.map((m: any, mIdx: number) => (
                          <div
                            key={mIdx}
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  m.asil_mi === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate">
                                {m.personel_ad_soyad || 'Atanmamış'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold truncate ml-2">
                              {m.gorev_adi || 'Üye'} ({m.asil_mi === 1 ? 'Asil' : 'Yedek'})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
