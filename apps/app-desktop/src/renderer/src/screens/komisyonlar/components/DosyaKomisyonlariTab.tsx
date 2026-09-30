import React from 'react'
import { CheckCircle2, Clock, FileSearch, History, Search, Zap } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface DosyaKomisyonlariTabProps {
  filteredDosyaKomisyonlar: any[]
  isDosyaKomisyonLoading: boolean
  dosyaKomisyonSearch: string
  setDosyaKomisyonSearch: (val: string) => void
  onOpenHistory: (dosya: { id: number; dosya_no: string; is_tanimi: string }) => void
  onEditDosyaKomisyon: (dosyaId: number) => void
}

export const DosyaKomisyonlariTab: React.FC<DosyaKomisyonlariTabProps> = ({
  filteredDosyaKomisyonlar,
  isDosyaKomisyonLoading,
  dosyaKomisyonSearch,
  setDosyaKomisyonSearch,
  onOpenHistory,
  onEditDosyaKomisyon
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5 min-h-[500px]">
      {/* Kart Başlığı */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              Dosya Komisyon Atamaları & Kadro Tarihçesi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tüm doğrudan temin ve ihale dosyalarının komisyon kadrolarının ve geçmiş revizyonlarının zaman çizelgesi
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 font-semibold self-end md:self-auto">
          Toplam <span className="font-extrabold text-blue-600">{filteredDosyaKomisyonlar.length}</span> temin dosyası
        </div>
      </div>

      {/* Bilgilendirme Kutusu */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5 leading-relaxed">
        <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 dark:text-slate-200 font-bold">
            Komisyon Kadro &amp; Zaman Çizelgesi Takibi:
          </strong>{' '}
          Dosyalarda tanımlanan komisyon kadroları veya yapılan üye değişiklikleri anlık versiyon snapshot'ı olarak arşivlenir.
          Geçmiş tarihli belgeler bastırılırken personellerin o dönemki vekalet unvanı ve görevleri otomatik korunur.
        </div>
      </div>

      {/* Arama Barı */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Dosya no, iş tanımı veya komisyon üyesi adı ara..."
          value={dosyaKomisyonSearch}
          onChange={(e) => setDosyaKomisyonSearch(e.target.value)}
          className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
        />
      </div>

      {/* Zaman Çizelgesi (Timeline Listesi) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-1">
        {isDosyaKomisyonLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Yükleniyor...</div>
        ) : filteredDosyaKomisyonlar.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <History className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
            <p>Aradığınız kriterlere uygun temin dosyası ve komisyon geçmişi bulunamadı.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {filteredDosyaKomisyonlar.map((d: any) => (
              <div
                key={d.id}
                className="relative p-4 rounded-2xl border bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700/60 shadow-xs transition-all duration-200"
              >
                {/* Sol Nokta */}
                <div className="absolute -left-6 top-5 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950" />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-extrabold text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                        {d.dosya_no || `Dosya #${d.id}`}
                      </span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        {d.is_tanimi || 'Tanımlanmamış İş'}
                      </span>
                      {d.history_count > 0 ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <History className="w-3 h-3" />
                          {d.history_count} Revizyon Kaydı
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                          Henüz Revizyon Yok
                        </span>
                      )}
                    </div>

                    {/* Kadrolar Özeti */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Piyasa Araştırma Kadrosu */}
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                        <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <FileSearch className="w-3.5 h-3.5" /> Piyasa Fiyat Araştırma Kadrosu
                        </div>
                        {d.piyasaMembers.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {d.piyasaMembers.map((m: any, mIdx: number) => (
                              <span
                                key={mIdx}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                  m.asil_mi === 1
                                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                }`}
                              >
                                <span className="font-bold">{m.ad_soyad}</span>
                                {m.gorev_adi && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({m.gorev_adi})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Görevli atanmadı.</span>
                        )}
                      </div>

                      {/* Muayene ve Kabul Kadrosu */}
                      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                        <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Muayene &amp; Kabul Kadrosu
                        </div>
                        {d.muayeneMembers.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {d.muayeneMembers.map((m: any, mIdx: number) => (
                              <span
                                key={mIdx}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                  m.asil_mi === 1
                                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                }`}
                              >
                                <span className="font-bold">{m.ad_soyad}</span>
                                {m.gorev_adi && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({m.gorev_adi})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Görevli atanmadı.</span>
                        )}
                      </div>
                    </div>

                    {d.lastUpdate && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono pt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Son Güncelleme:</span>
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          {new Date(d.lastUpdate).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sağ Butonlar */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                    <button
                      type="button"
                      onClick={() => onOpenHistory({ id: d.id, dosya_no: d.dosya_no, is_tanimi: d.is_tanimi })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800 transition-colors cursor-pointer shadow-2xs"
                    >
                      <History className="w-4 h-4" />
                      <span>Revizyon Çizelgesi ({d.history_count})</span>
                    </button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 rounded-xl px-3.5 py-2 shadow-xs"
                      onClick={() => onEditDosyaKomisyon(d.id)}
                    >
                      <Zap className="w-3.5 h-3.5" /> Kadroyu Düzenle
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
