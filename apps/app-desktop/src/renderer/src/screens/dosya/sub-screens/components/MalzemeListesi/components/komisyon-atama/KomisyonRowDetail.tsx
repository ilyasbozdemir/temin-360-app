import React, { useState } from 'react'
import { Calendar, FileText, Settings } from 'lucide-react'
import type { KomisyonRow, PersonelItem } from './types'
import { HizliKadroBelgeSecimModal } from '@renderer/screens/komisyonlar/components/hizli-kadro/HizliKadroBelgeSecimModal'

interface KomisyonRowDetailProps {
  row: KomisyonRow
  personeller: PersonelItem[]
  onRowFieldChange?: (sira: number, field: keyof KomisyonRow, value: any) => void
}

export const KomisyonRowDetail: React.FC<KomisyonRowDetailProps> = ({
  row,
  personeller,
  onRowFieldChange
}) => {
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const assignedPerson = personeller.find((p) => p.id === row.personelId)
  const selectedDocCount = Array.isArray(row.hedefBelgeler) ? row.hedefBelgeler.length : 0

  return (
    <tr className="bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/40 animate-in fade-in duration-150">
      <td colSpan={5} className="p-3.5 pl-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-800/80 shadow-2xs">
          {/* Vekalet / Özel Görev Unvanı */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              🏷️ Görevdeki Özelleştirilmiş Unvan (Vekalet)
            </label>
            <input
              type="text"
              value={row.vekaletUnvani || ''}
              onChange={(e) => onRowFieldChange?.(row.sira, 'vekaletUnvani', e.target.value)}
              placeholder="Örn: Şube Müdürü V., İnşaat Mühendisi"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold focus:border-blue-500 outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Boş bırakılırsa personelin varsayılan unvanı resmi belgelerde kullanılır.
            </span>
          </div>

          {/* Görev Tarih Aralığı */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-500" />
              Görev Yapacağı Süre Aralığı
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={row.baslangicTarihi || ''}
                onChange={(e) => onRowFieldChange?.(row.sira, 'baslangicTarihi', e.target.value)}
                className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[11px] font-mono focus:border-blue-500 outline-none"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="date"
                value={row.bitisTarihi || ''}
                onChange={(e) => onRowFieldChange?.(row.sira, 'bitisTarihi', e.target.value)}
                className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[11px] font-mono focus:border-blue-500 outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Görevlendirme olurundaki başlama-bitiş tarihlerini belirler.
            </span>
          </div>

          {/* Belge Kapsamı & Özel Şablon Seçimi */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-blue-500" />
              Belgelerde Görünürlük Kapsamı
            </label>
            <div className="flex items-center gap-1.5 w-full">
              <select
                value={row.belgeKapsami || 'tumu'}
                onChange={(e) => {
                  const val = e.target.value
                  onRowFieldChange?.(row.sira, 'belgeKapsami', val)
                  if (val === 'ozel') {
                    setIsDocModalOpen(true)
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="tumu">📄 Tüm Belgelerde Görünsün</option>
                <option value="piyasa_arastirma">🛒 Sadece Fiyat Araştırma</option>
                <option value="muayene_kabul">🔬 Sadece Muayene & Kabul</option>
                <option value="olur_onay">📑 Sadece Olur / Onay Yazılarında</option>
                <option value="ozel">
                  🎯 Özel Şablon Seçimi {selectedDocCount > 0 ? `(${selectedDocCount})` : ''}
                </option>
                <option value="gizli">🚫 Hiçbir Belgede (Gizli)</option>
              </select>
              {row.belgeKapsami === 'ozel' && (
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(true)}
                  className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors shrink-0 cursor-pointer"
                  title="Şablonları Seç & Düzenle"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Bu personelin hangi resmi belge şablonlarında imzacı olarak çıkacağını seçin.
            </span>
          </div>
        </div>

        {/* Granüler Şablon Seçim Modalı */}
        {isDocModalOpen && (
          <HizliKadroBelgeSecimModal
            isOpen={isDocModalOpen}
            onClose={() => setIsDocModalOpen(false)}
            memberName={assignedPerson?.ad_soyad || ''}
            memberGorev={row.gorev}
            selectedDocs={row.hedefBelgeler || []}
            onSave={(docs) => {
              onRowFieldChange?.(row.sira, 'hedefBelgeler', docs)
              setIsDocModalOpen(false)
            }}
          />
        )}
      </td>
    </tr>
  )
}
