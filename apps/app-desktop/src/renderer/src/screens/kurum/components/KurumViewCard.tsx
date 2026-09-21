import React from 'react'
import {
  Building2,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Globe,
  Landmark,
  ShieldCheck,
  FileText,
  Key,
  Sliders,
  CheckCircle2,
  ExternalLink
} from 'lucide-react'
import { KurumVerisi } from '../kurum.hooks'
import { DetsisBadge } from '../../../components/ui/DetsisBadge'
import { KeyValuePair, KurumMetadataManager } from './KurumMetadataManager'

interface KurumViewCardProps {
  data: Partial<KurumVerisi>
  institutionLetterhead: string[]
  parentInstitutionLines: string[]
  customMetadata: KeyValuePair[]
  onEditClick: () => void
}

export const KurumViewCard: React.FC<KurumViewCardProps> = ({
  data,
  institutionLetterhead,
  parentInstitutionLines,
  customMetadata,
  onEditClick
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Aktif Resmi Kurum Profili
              </span>
              <DetsisBadge detsisNo={data.detsis_kodu} showSearchButton={false} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug break-words">
              {data.kurum_adi || 'Kurum Adı Tanımlanmamış'}
            </h2>

            {data.makam_adi && (
              <p className="text-xs text-blue-200/80 font-medium flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Makam / Muhatap:</span>
                <strong className="text-white">{data.makam_adi}</strong>
              </p>
            )}
          </div>

          {/* Quick Edit Action */}
          <button
            type="button"
            onClick={onEditClick}
            className="self-start md:self-center px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-md shadow-md cursor-pointer shrink-0"
          >
            <Edit3 className="w-4 h-4 text-blue-300" />
            <span>Bilgileri Düzenle</span>
          </button>
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Antet ve Hiyerarşi */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Resmi Evrak Anteti & Bağlı Olduğu Kurum
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Çıktılarda Görünecek Başlık (Antet)
              </label>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 font-serif text-center text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-0.5">
                {institutionLetterhead.length > 0 && institutionLetterhead.some((l) => l.trim()) ? (
                  institutionLetterhead.map((line, idx) => (
                    <div key={idx} className={idx === 0 ? 'font-bold' : ''}>
                      {line}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400 italic font-sans text-xs">Antet tanımlanmamış</span>
                )}
              </div>
            </div>

            {parentInstitutionLines.length > 0 && parentInstitutionLines.some((l) => l.trim()) && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Üst İdare Hiyerarşisi
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {parentInstitutionLines.map((line, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kurum Tipi & Mevzuat Şablonu */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              Kurum Tipi & Limit Şablonu
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <span className="text-slate-500 font-medium">Bütçeleme Tipi:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                {data.kurum_tipi || 'Belirtilmedi'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <span className="text-slate-500 font-medium">Finansman Kodu:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                {data.finansman_kodu || '5'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <span className="text-slate-500 font-medium">Doğrudan Temin Limit Sınırı (22/d):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {data.limit_tipi === 'buyuksehir'
                  ? 'Büyükşehir Belediyesi Sınırları'
                  : 'Diğer İdareler (Diğer)'}
              </span>
            </div>
          </div>
        </div>

        {/* İletişim ve Konum Özeti */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              İletişim & Adres Bilgileri
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {data.adres ? `${data.adres} ` : ''}
                {data.ilce ? `${data.ilce} / ` : ''}
                {data.il || <span className="text-slate-400 italic">Adres bilgisi girilmedi</span>}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{data.telefon || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{data.eposta || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mali Kodlar Özeti */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              Resmi Kodlar & Bütçe Tanımları
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <div className="text-[10px] text-slate-400 font-bold uppercase">DETSİS / DTVT Kodu</div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {data.detsis_kodu || data.dtvt_kodu || '—'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <div className="text-[10px] text-slate-400 font-bold uppercase">e-Bütçe Kodu</div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {data.ebutce_kodu || '—'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Say2000i Kodu</div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {data.say2000i_kodu || '—'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Harcama Birim Kodu</div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {data.harcama_birim_kodu || '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Key-Value Metadata Summary */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            Özel Parametreler & Key-Value Alanlar ({customMetadata.length})
          </h3>
        </div>

        <KurumMetadataManager metadata={customMetadata} onChange={() => {}} isReadOnly={true} />
      </div>
    </div>
  )
}
