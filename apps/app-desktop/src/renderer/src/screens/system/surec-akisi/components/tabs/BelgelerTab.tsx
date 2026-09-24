import React from 'react'
import {
  FileText,
  ExternalLink,
  MoreVertical,
  Eye,
  Upload,
  Printer,
  X,
  PenLine,
  FileCheck2,
  Trash2
} from 'lucide-react'
import { Belge, TaranmisBelge } from '../../types'
import { getBelgeDurumBadge, getBelgeDurumLabel, belgeSonrakiDurum } from '../../utils/helpers'

interface BelgelerTabProps {
  belgeler: Belge[]
  selectedBelge: Belge | null
  setSelectedBelge: React.Dispatch<React.SetStateAction<Belge | null>>
  menuAcikId: number | null
  setMenuAcikId: React.Dispatch<React.SetStateAction<number | null>>
  taranmisBelgeler: TaranmisBelge[]
  surukleniyor: boolean
  setSurukleniyor: (val: boolean) => void
  onPreview: (belge: Belge) => void
  onBelgeOlustur: (id: number) => void
  onDosyalariEkle: (files: FileList | null, targetId?: number) => void
  onTaranmisBelgeSil: (id: number) => void
  onNavigateCiktiMerkezi: () => void
}

export const BelgelerTab: React.FC<BelgelerTabProps> = ({
  belgeler,
  selectedBelge,
  setSelectedBelge,
  menuAcikId,
  setMenuAcikId,
  taranmisBelgeler,
  surukleniyor,
  setSurukleniyor,
  onPreview,
  onBelgeOlustur,
  onDosyalariEkle,
  onTaranmisBelgeSil,
  onNavigateCiktiMerkezi
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Süreç Belgeleri ({belgeler.length} Belge)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Her belgeye özel imzalı PDF yükleyin veya imza durumunu güncelleyin
              </p>
            </div>
            <button
              onClick={onNavigateCiktiMerkezi}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink size={14} /> Çıktı Merkezi
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {belgeler.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBelge(b)}
                className={`relative flex items-center justify-between gap-4 px-6 py-4 cursor-pointer transition-colors ${
                  selectedBelge?.id === b.id
                    ? 'bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                      {b.ad}
                      {b.pdfDosyaAdi && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <FileCheck2 size={12} /> PDF Yüklendi
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.asama}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold ${getBelgeDurumBadge(
                      b.durum
                    )}`}
                  >
                    {getBelgeDurumLabel(b.durum)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuAcikId(menuAcikId === b.id ? null : b.id)
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Diğer işlemler"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {menuAcikId === b.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-6 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <div className="py-0.5">
                      <button
                        onClick={() => {
                          onPreview(b)
                          setMenuAcikId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Eye size={14} className="text-blue-500" /> Önizle
                      </button>

                      <label className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                        <Upload size={14} className="text-emerald-500" /> İmzalı PDF Yükle
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            setMenuAcikId(null)
                            onDosyalariEkle(e.target.files, b.id)
                          }}
                        />
                      </label>
                    </div>
                    <div className="py-0.5">
                      <button
                        onClick={() => {
                          setMenuAcikId(null)
                          onPreview(b)
                          setTimeout(() => window.print(), 300)
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Printer size={14} className="text-slate-400" /> Yazdır
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit lg:sticky lg:top-6 shadow-xs">
          {selectedBelge ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedBelge.ad}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedBelge.asama}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBelge(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <span
                className={`inline-block text-[10px] px-2.5 py-0.5 rounded-lg border font-bold ${getBelgeDurumBadge(
                  selectedBelge.durum
                )}`}
              >
                {getBelgeDurumLabel(selectedBelge.durum)}
              </span>

              {selectedBelge.pdfDosyaAdi && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <FileCheck2 size={16} /> İmzalı PDF Yüklendi
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 truncate">
                    {selectedBelge.pdfDosyaAdi}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedBelge.pdfYuklenmeTarihi}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4 py-2.5 cursor-pointer transition-colors shadow-md shadow-emerald-500/20">
                  <Upload size={16} />
                  İmzalı PDF Yükle (Teslim Al)
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => onDosyalariEkle(e.target.files, selectedBelge.id)}
                  />
                </label>

                {selectedBelge.durum !== 'imzalandı' && (
                  <button
                    onClick={() => {
                      onBelgeOlustur(selectedBelge.id)
                      setSelectedBelge((prev) =>
                        prev ? { ...prev, durum: belgeSonrakiDurum(prev.durum) } : null
                      )
                    }}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
                  >
                    <PenLine size={16} />
                    {selectedBelge.durum === 'oluşturulmadı'
                      ? 'Taslak Oluştur'
                      : selectedBelge.durum === 'taslak'
                        ? 'Onaya Gönder'
                        : selectedBelge.durum === 'oluşturuldu'
                          ? 'İmzaya Gönder'
                          : 'İmzalandı İşaretle'}
                  </button>
                )}

                <button
                  onClick={() => onPreview(selectedBelge)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
                >
                  <Eye size={16} /> İçeriği Önizle
                </button>
                <button
                  onClick={() => {
                    onPreview(selectedBelge)
                    setTimeout(() => window.print(), 300)
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
                >
                  <Printer size={16} /> Yazdır
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400 italic">
              Detayları görmek için soldan bir belge seçin
            </div>
          )}
        </div>
      </div>

      {/* TARANAN BELGE YÜKLEME */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
          Taranan İmzalı Belgeler Kütüğü ({taranmisBelgeler.length} Dosya)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
          Fiziksel imzalı belgelerin taranmış (PDF) hallerini buraya yükleyin — ilgili resmi belgeye
          otomatik bağlanır.
        </p>

        <label
          onDragOver={(e) => {
            e.preventDefault()
            setSurukleniyor(true)
          }}
          onDragLeave={() => setSurukleniyor(false)}
          onDrop={(e) => {
            e.preventDefault()
            setSurukleniyor(false)
            onDosyalariEkle(e.dataTransfer.files)
          }}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl px-6 py-8 cursor-pointer transition-colors ${
            surukleniyor
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/40'
          }`}
        >
          <Upload size={24} className={surukleniyor ? 'text-blue-500' : 'text-slate-400'} />
          <div className="text-xs text-slate-600 dark:text-slate-300 text-center font-medium">
            <span className="font-bold text-blue-600 dark:text-blue-400">PDF Seç</span> veya
            sürükleyip bırak
          </div>
          <div className="text-[10px] text-slate-400">Yalnızca PDF</div>
          <input
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => onDosyalariEkle(e.target.files)}
          />
        </label>

        {taranmisBelgeler.length > 0 && (
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {taranmisBelgeler.map((b) => {
              const bagliBelge = belgeler.find((x) => x.id === b.bagliBelgeId)
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={16} className="text-red-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-slate-900 dark:text-slate-100 font-bold truncate">
                        {b.ad}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {b.boyut} · {b.tarih}
                        {bagliBelge && (
                          <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                            → Bağlı: {bagliBelge.ad}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onTaranmisBelgeSil(b.id)}
                    className="shrink-0 text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                    title="Kaldır"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
