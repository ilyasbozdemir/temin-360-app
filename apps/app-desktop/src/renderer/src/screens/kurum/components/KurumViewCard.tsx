import React, { useState } from 'react'
import {
  Building2,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Landmark,
  ShieldCheck,
  FileText,
  Key,
  Sliders,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react'
import { KurumVerisi } from '../kurum.hooks'
import { DetsisBadge } from '../../../components/ui/DetsisBadge'
import { KeyValuePair, KurumMetadataManager } from './KurumMetadataManager'
import { useSettingsStore } from '../../../store/settingsStore'

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
  const { institutionLogo, logoLeft, logoRight } = useSettingsStore()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string | undefined, fieldKey: string) => {
    if (!text || text === '—') return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 1800)
  }

  const displayLogo =
    institutionLogo ||
    logoLeft ||
    logoRight ||
    (data as any)?.kurum_logo ||
    (data as any)?.logo_url ||
    ''

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative z-0 pb-4">
      {/* Top Banner Card */}
      <div className="relative z-10 overflow-visible rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {displayLogo ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 dark:bg-slate-900/60 p-2 border border-white/20 backdrop-blur-md shrink-0 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <img
                  src={displayLogo}
                  alt="Kurum Logosu"
                  className="w-full h-full object-contain drop-shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-500/20 border border-blue-400/30 backdrop-blur-md shrink-0 flex items-center justify-center text-blue-300 shadow-md">
                <Building2 className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 relative z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/25 text-blue-200 border border-blue-400/40 text-xs font-bold backdrop-blur-md shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 fill-blue-500/30" />
                  <span>Aktif Resmi Kurum Profili</span>
                </span>
                {data.detsis_kodu && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>DETSİS Entegre ({data.detsis_kodu})</span>
                  </span>
                )}
                <DetsisBadge detsisNo={data.detsis_kodu} showSearchButton={false} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug break-words flex items-center gap-2">
                <span>{data.kurum_adi || 'Kurum Adı Tanımlanmamış'}</span>
                <span title="Resmi Doğrulanmış Profil">
                  <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0 inline-block fill-blue-500/30" />
                </span>
              </h2>

              {data.makam_adi && (
                <p className="text-xs text-blue-200/90 font-medium flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Makam / Muhatap:</span>
                  <strong className="text-white font-semibold">{data.makam_adi}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Quick Edit Action */}
          <button
            type="button"
            onClick={onEditClick}
            className="self-start md:self-center px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-md shadow-md cursor-pointer shrink-0 hover:scale-105 active:scale-95"
          >
            <Edit3 className="w-4 h-4 text-blue-300" />
            <span>Bilgileri Düzenle</span>
          </button>
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Antet ve Hiyerarşi */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs relative z-10 hover:z-20 transition-all duration-200">
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
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 font-serif text-center text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
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
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs relative z-10 hover:z-20 transition-all duration-200">
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
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs relative z-10 hover:z-20 transition-all duration-200">
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
              <div
                onClick={() => handleCopy(data.telefon, 'telefon')}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-blue-300 transition-colors group"
                title="Kopyalamak için tıklayın"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{data.telefon || '—'}</span>
                </div>
                {copiedField === 'telefon' ? (
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </div>

              <div
                onClick={() => handleCopy(data.eposta, 'eposta')}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-blue-300 transition-colors group"
                title="Kopyalamak için tıklayın"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{data.eposta || '—'}</span>
                </div>
                {copiedField === 'eposta' ? (
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mali Kodlar Özeti */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs relative z-10 hover:z-20 transition-all duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              Resmi Kodlar & Bütçe Tanımları
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div
              onClick={() => handleCopy(data.detsis_kodu || data.dtvt_kodu, 'detsis')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-blue-300 transition-colors group relative"
              title="Kopyalamak için tıklayın"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">DETSİS / DTVT Kodu</span>
                {copiedField === 'detsis' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.detsis_kodu || data.dtvt_kodu || '—'}
              </div>
            </div>

            <div
              onClick={() => handleCopy(data.ebutce_kodu, 'ebutce')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-blue-300 transition-colors group relative"
              title="Kopyalamak için tıklayın"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">e-Bütçe Kodu</span>
                {copiedField === 'ebutce' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.ebutce_kodu || '—'}
              </div>
            </div>

            <div
              onClick={() => handleCopy(data.say2000i_kodu, 'say2000i')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-blue-300 transition-colors group relative"
              title="Kopyalamak için tıklayın"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Say2000i Kodu</span>
                {copiedField === 'say2000i' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.say2000i_kodu || '—'}
              </div>
            </div>

            <div
              onClick={() => handleCopy(data.harcama_birim_kodu, 'harcama')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-blue-300 transition-colors group relative"
              title="Kopyalamak için tıklayın"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Harcama Birim Kodu</span>
                {copiedField === 'harcama' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.harcama_birim_kodu || '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Key-Value Metadata Summary */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs relative z-10">
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
