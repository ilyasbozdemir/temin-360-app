import React, { useState, useMemo } from 'react'
import {
  Plus,
  LayoutTemplate,
  Edit,
  Calendar,
  History,
  Trash2,
  Search,
  Sparkles
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { useSablonlar, Sablon, useSablonHistory, useDeleteSablon } from '../sablonlar.hooks'

function SablonHistoryModal({
  sablon,
  isOpen,
  onClose,
  onEdit
}: {
  sablon: Sablon | null
  isOpen: boolean
  onClose: () => void
  onEdit: (s: Sablon) => void
}) {
  const { data: history, isLoading } = useSablonHistory(sablon?.parent_id || sablon?.id || null)
  const deleteSablon = useDeleteSablon()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${sablon?.ad || ''} Versiyon Geçmişi`}
      description="Bu şablonun geçmiş versiyonları"
    >
      {isLoading ? (
        <div className="flex justify-center p-4 text-slate-500 text-sm">Yükleniyor...</div>
      ) : history?.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-4">Geçmiş bulunamadı.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {history?.map((s) => (
            <div
              key={s.id}
              className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:border-purple-200 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    v{s.versiyon}
                  </span>
                  {s.aktif_mi === 1 && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded uppercase">
                      Aktif
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(
                      s.created_at.replace(' ', 'T') + (s.created_at.includes('Z') ? '' : 'Z')
                    ).toLocaleString('tr-TR')}
                  </span>
                  {s.aktif_mi === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (
                          confirm(`v${s.versiyon} versiyonunu silmek istediğinize emin misiniz?`)
                        ) {
                          deleteSablon.mutate(s.id)
                        }
                      }}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Bu versiyonu sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {s.aciklama || 'Açıklama yok'}
              </p>
              {s.aktif_mi === 0 && (
                <Button
                  onClick={() => {
                    onEdit(s)
                    onClose()
                  }}
                  variant="outline"
                  className="w-full text-xs py-1.5 h-auto"
                >
                  <Edit className="w-3.5 h-3.5 mr-2" /> Bu Versiyonu İncele / Düzenle
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

export function SablonListesi({
  onEdit,
  onCreate,
  onOpenPlayground
}: {
  onEdit: (s: Sablon) => void
  onCreate: () => void
  onOpenPlayground?: () => void
}) {
  const { data: sablonlar, isLoading } = useSablonlar()
  const [historySablon, setHistorySablon] = useState<Sablon | null>(null)
  const deleteSablon = useDeleteSablon()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSablonlar = useMemo(() => {
    if (!sablonlar) return []
    if (!searchQuery.trim()) return sablonlar
    const lowerQuery = searchQuery.toLowerCase()
    return sablonlar.filter(
      (s) =>
        s.ad.toLowerCase().includes(lowerQuery) ||
        (s.kategori && s.kategori.toLowerCase().includes(lowerQuery)) ||
        (s.aciklama && s.aciklama.toLowerCase().includes(lowerQuery))
    )
  }, [sablonlar, searchQuery])

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <SablonHistoryModal
        sablon={historySablon}
        isOpen={!!historySablon}
        onClose={() => setHistorySablon(null)}
        onEdit={onEdit}
      />

      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-purple-500" />
            Şablon Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sistemdeki tüm şablonları yönetin, düzenleyin veya yeni şablon oluşturun.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Şablonlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-48 sm:w-64 text-slate-800 dark:text-slate-200 transition-all"
            />
          </div>

          {onOpenPlayground && (
            <Button
              onClick={onOpenPlayground}
              variant="outline"
              className="border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 font-bold flex items-center gap-1.5 px-3 py-2 text-xs shadow-2xs whitespace-nowrap cursor-pointer"
              title="Form Builder v2 Oyun Alanı (Playground) Aç"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              Form Builder v2 (Oyun Alanı)
            </Button>
          )}

          <Button
            onClick={onCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 px-4 shadow-md whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Yeni Şablon
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            Yükleniyor...
          </div>
        ) : !filteredSablonlar || filteredSablonlar.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <LayoutTemplate className="w-12 h-12 mb-2 text-slate-300" />
            <p>
              {searchQuery ? 'Aramanızla eşleşen şablon bulunamadı.' : 'Henüz şablon bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-8">
            {Object.entries(
              filteredSablonlar.reduce(
                (acc, sablon) => {
                  const kat = sablon.kategori || 'Genel Şablonlar'
                  if (!acc[kat]) acc[kat] = []
                  acc[kat].push(sablon)
                  return acc
                },
                {} as Record<string, Sablon[]>
              )
            )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([kategori, sabs]) => (
                <div key={kategori} className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">
                    {kategori}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sabs.map((sablon) => (
                      <div
                        key={sablon.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-900/50 transition-all group flex flex-col"
                      >
                        <div
                          className="flex items-start justify-between mb-3 cursor-pointer"
                          onClick={() => onEdit(sablon)}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 hover:text-purple-600 transition-colors">
                              {sablon.ad}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1">
                              {sablon.dosya_adi}
                              {sablon.dosya_adi.endsWith(`.${sablon.dosya_turu}`)
                                ? ''
                                : `.${sablon.dosya_turu}`}
                            </p>
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              setHistorySablon(sablon)
                            }}
                            className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/55 text-purple-700 dark:text-purple-400 text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                            title="Versiyon Geçmişi"
                          >
                            v{sablon.versiyon}
                          </div>
                        </div>

                        <p
                          className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[40px] mb-4 cursor-pointer"
                          onClick={() => onEdit(sablon)}
                        >
                          {sablon.aciklama || 'Açıklama yok'}
                        </p>

                        {(sablon.created_at || sablon.updated_at) && (
                          <div
                            className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 cursor-pointer"
                            onClick={() => onEdit(sablon)}
                          >
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                                Son Güncelleme
                              </span>
                              <span className="line-clamp-1 leading-relaxed">
                                {new Date(
                                  (sablon.updated_at || sablon.created_at).replace(' ', 'T') +
                                    ((sablon.updated_at || sablon.created_at).includes('Z')
                                      ? ''
                                      : 'Z')
                                ).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              setHistorySablon(sablon)
                            }}
                            variant="ghost"
                            className="flex-1 justify-center text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          >
                            <History className="w-3.5 h-3.5 mr-2" /> Versiyon Geçmişi
                          </Button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (
                                confirm(
                                  `'${sablon.ad}' şablonunu silmek istediğinize emin misiniz?`
                                )
                              ) {
                                deleteSablon.mutate(sablon.id)
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Şablonu Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
