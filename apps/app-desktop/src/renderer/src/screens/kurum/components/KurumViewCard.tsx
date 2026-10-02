import React, { useState } from 'react'
import {
  Building2,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Landmark,
  ShieldCheck,
  Key,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Image as ImageIcon
} from 'lucide-react'
import { KurumVerisi } from '../kurum.hooks'
import { KeyValuePair, KurumMetadataManager } from './KurumMetadataManager'
import { useSettingsStore } from '../../../store/settingsStore'

interface KurumViewCardProps {
  data: Partial<KurumVerisi>
  institutionLetterhead: string[]
  parentInstitutionLines: string[]
  customMetadata: KeyValuePair[]
  onEditClick: () => void
  institutionLogo?: string | null
  logoLeft?: string | null
  logoRight?: string | null
  showLogoLeft?: boolean
  showLogoRight?: boolean
}

export const KurumViewCard: React.FC<KurumViewCardProps> = ({
  data,
  institutionLetterhead,
  parentInstitutionLines,
  customMetadata,
  onEditClick,
  institutionLogo: propInstitutionLogo,
  logoLeft: propLogoLeft,
  logoRight: propLogoRight,
  showLogoLeft: propShowLogoLeft,
  showLogoRight: propShowLogoRight
}) => {
  const storeSettings = useSettingsStore()

  const effectiveInstitutionLogo =
    propInstitutionLogo !== undefined
      ? propInstitutionLogo
      : storeSettings.institutionLogo || data.logo_kurum || null

  const effectiveLogoLeft =
    propLogoLeft !== undefined ? propLogoLeft : storeSettings.logoLeft || data.logo_sol || null

  const effectiveLogoRight =
    propLogoRight !== undefined ? propLogoRight : storeSettings.logoRight || data.logo_sag || null

  const effectiveShowLogoLeft =
    propShowLogoLeft !== undefined ? propShowLogoLeft : storeSettings.showLogoLeft !== false

  const effectiveShowLogoRight =
    propShowLogoRight !== undefined ? propShowLogoRight : storeSettings.showLogoRight !== false

  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string | undefined, fieldKey: string): void => {
    if (!text || text === '—') return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 1800)
  }

  // Primary avatar logo for profile header
  const profileAvatar =
    effectiveInstitutionLogo ||
    effectiveLogoLeft ||
    effectiveLogoRight ||
    (data as Record<string, any>)?.kurum_logo ||
    (data as Record<string, any>)?.logo_url ||
    null

  const hasLetterhead =
    institutionLetterhead.length > 0 &&
    institutionLetterhead.some((l: string): boolean => Boolean(l && l.trim().length > 0))

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative z-0 pb-6">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 🌟 HERO COVER BANNER & INSTITUTION PROFILE HEADER               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800/80 shadow-xl">
        {/* Cover Photo / Graphic Mesh Gradient */}
        <div className="relative h-44 sm:h-52 w-full bg-linear-to-r from-slate-950 via-blue-950 to-indigo-950 overflow-hidden">
          {/* Decorative Mesh Lights & Geometric Patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.15),transparent_60%)]" />

          {/* Subtle Grid Watermark Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Top Bar Badges in Cover */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 text-blue-300 border border-blue-400/30 text-[11px] font-bold backdrop-blur-md shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Resmi Kurum Profili</span>
              </span>

              {data.detsis_kodu && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>DETSİS Doğrulandı</span>
                </span>
              )}
            </div>

            {/* Quick Edit Action Button in Cover */}
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 hover:border-white/40 text-xs font-bold transition-all backdrop-blur-md shadow-md cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-300" />
              <span>Bilgileri Düzenle</span>
            </button>
          </div>
        </div>

        {/* Profile Info Bar (Overlapping Logo + Title + Quick Badges) */}
        <div className="relative px-6 pb-6 pt-0 bg-slate-900/95 dark:bg-slate-900/95 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 -mt-14 sm:-mt-16 relative z-10">
            {/* Left: Floating Avatar Logo + Title info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 flex-1 min-w-0">
              {/* Institution Logo Card */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white dark:bg-slate-900 p-2.5 border-4 border-slate-900 dark:border-slate-900 shadow-2xl shrink-0 flex items-center justify-center relative group">
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt="Kurum Logosu"
                    className="w-full h-full object-contain drop-shadow-sm transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center"
                  title="Profil Aktif"
                >
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              </div>

              {/* Titles & Meta */}
              <div className="space-y-1.5 flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                    {data.kurum_adi || 'Kurum Adı Tanımlanmamış'}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300">
                  {data.makam_adi && (
                    <span className="inline-flex items-center gap-1 text-blue-300 font-medium">
                      <Landmark className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{data.makam_adi}</span>
                    </span>
                  )}

                  {(data.il || data.ilce) && (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {data.ilce ? `${data.ilce} / ` : ''}
                        {data.il || ''}
                      </span>
                    </span>
                  )}

                  {data.detsis_kodu && (
                    <span className="inline-flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                      <span className="text-slate-500">DETSİS:</span>
                      <strong className="text-amber-300 font-semibold">{data.detsis_kodu}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Logos Mini-Gallery */}
            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md self-start md:self-end">
              {/* Sol Logo Mini Preview */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-center p-1 overflow-hidden"
                  title="Resmi Belge Sol Logosu"
                >
                  {effectiveLogoLeft ? (
                    <img
                      src={effectiveLogoLeft}
                      alt="Sol Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${effectiveShowLogoLeft ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 bg-slate-900'}`}
                >
                  {effectiveShowLogoLeft ? 'Sol: Açık' : 'Sol: Kapalı'}
                </span>
              </div>

              <div className="w-px h-10 bg-slate-700/60" />

              {/* Sağ Logo Mini Preview */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-center p-1 overflow-hidden"
                  title="Resmi Belge Sağ Logosu (Bakanlık)"
                >
                  {effectiveLogoRight ? (
                    <img
                      src={effectiveLogoRight}
                      alt="Sağ Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${effectiveShowLogoRight ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 bg-slate-900'}`}
                >
                  {effectiveShowLogoRight ? 'Sağ: Açık' : 'Sağ: Kapalı'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 📄 CANLI RESMİ EVRAK BAŞLIĞI & ANTET ÖNİZLEMESİ                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Resmi Evrak Anteti & Canlı Başlık Görünümü
              </h3>
              <p className="text-[11px] text-slate-400">
                Resmi yazışma, onay belgesi ve doğrudan temin çıktılarında görünecek üst antet
                düzeni.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            A4 Üst Başlık Şablonu
          </span>
        </div>

        {/* Mock A4 Paper Header */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-6 flex items-center justify-between gap-6 min-h-28 shadow-inner">
          {/* Left Logo Slot */}
          <div className="w-20 sm:w-24 h-16 flex items-center justify-center shrink-0">
            {effectiveShowLogoLeft && effectiveLogoLeft ? (
              <img
                src={effectiveLogoLeft}
                alt="Sol Logo"
                className="max-h-16 max-w-full object-contain"
              />
            ) : (
              <div className="w-full h-full rounded-lg border border-dashed border-slate-300 dark:border-slate-750 flex flex-col items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                <span>{effectiveShowLogoLeft ? 'Sol Logo Yok' : 'Sol Kapalı'}</span>
              </div>
            )}
          </div>

          {/* Center: Multi-line Official Letterhead */}
          <div className="flex-1 text-center font-serif text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-slate-100 space-y-0.5">
            {hasLetterhead ? (
              institutionLetterhead.map((line, idx) => (
                <div
                  key={idx}
                  className={idx === 0 ? 'font-bold uppercase tracking-wide' : 'font-semibold'}
                >
                  {line}
                </div>
              ))
            ) : (
              <div className="text-slate-400 italic font-sans text-xs">
                Resmi antet metni tanımlanmamış (Düzenleme Modundan antet satırlarını ekleyin).
              </div>
            )}
          </div>

          {/* Right Logo Slot */}
          <div className="w-20 sm:w-24 h-16 flex items-center justify-center shrink-0">
            {effectiveShowLogoRight && effectiveLogoRight ? (
              <img
                src={effectiveLogoRight}
                alt="Sağ Logo"
                className="max-h-16 max-w-full object-contain"
              />
            ) : (
              <div className="w-full h-full rounded-lg border border-dashed border-slate-300 dark:border-slate-750 flex flex-col items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                <span>{effectiveShowLogoRight ? 'Sağ Logo Yok' : 'Sağ Kapalı'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3'lü Logo Kartları Özeti */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Sol Logo Kartı */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
              {effectiveLogoLeft ? (
                <img
                  src={effectiveLogoLeft}
                  alt="Sol Logo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-slate-850 dark:text-slate-200 truncate">
                Sol Logo (Kurum)
              </div>
              <div className="text-[10px] text-slate-400">Belge Sol Üst</div>
              <div className="mt-1">
                <span
                  className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${effectiveShowLogoLeft ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}
                >
                  {effectiveShowLogoLeft ? 'Belgelerde Aktif' : 'Belgelerde Pasif'}
                </span>
              </div>
            </div>
          </div>

          {/* Uygulama Logosu Kartı */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
              {effectiveInstitutionLogo ? (
                <img
                  src={effectiveInstitutionLogo}
                  alt="Uygulama Logosu"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Building2 className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-slate-850 dark:text-slate-200 truncate">
                Uygulama Logosu
              </div>
              <div className="text-[10px] text-slate-400">Giriş & Menü Arması</div>
              <div className="mt-1">
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300">
                  {effectiveInstitutionLogo ? 'Özel Logo Yüklü' : 'Varsayılan İkon'}
                </span>
              </div>
            </div>
          </div>

          {/* Sağ Logo Kartı */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
              {effectiveLogoRight ? (
                <img
                  src={effectiveLogoRight}
                  alt="Sağ Logo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-slate-850 dark:text-slate-200 truncate">
                Sağ Logo (Bakanlık)
              </div>
              <div className="text-[10px] text-slate-400">Belge Sağ Üst</div>
              <div className="mt-1">
                <span
                  className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${effectiveShowLogoRight ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}
                >
                  {effectiveShowLogoRight ? 'Belgelerde Aktif' : 'Belgelerde Pasif'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {parentInstitutionLines.length > 0 && parentInstitutionLines.some((l) => l.trim()) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Hiyerarşi:</span>
            {parentInstitutionLines.map((line, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
              >
                {line}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 📊 RESMİ BİLGİ KARTLARI (3'LÜ / 2'Lİ RESPONSIVE GRID)           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* KART 1: Kurum Tipi & Mevzuat Şablonu */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              Mevzuat & Bütçeleme
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              KİK 4734
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <span className="text-slate-500 font-medium">Bütçeleme Tipi:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                {data.kurum_tipi || 'Genel Bütçe'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <span className="text-slate-500 font-medium">Finansman Kodu:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50">
                {data.finansman_kodu || '5'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <span className="text-slate-500 font-medium">22/d Limit Sınırı:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-right">
                {data.limit_tipi === 'buyuksehir' ? 'Büyükşehir Sınırları' : 'Diğer İdareler'}
              </span>
            </div>
          </div>
        </div>

        {/* KART 2: İletişim, Konum & Hızlı Kopyalama */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              İletişim & Konum
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              Tebligat
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-snug">
                {data.adres ? `${data.adres}, ` : ''}
                {data.ilce ? `${data.ilce} / ` : ''}
                {data.il || <span className="text-slate-400 italic">Adres girilmedi</span>}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => handleCopy(data.telefon, 'telefon')}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-emerald-400 transition-colors group"
                title="Kopyalamak için tıklayın"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-mono text-[11px]">{data.telefon || '—'}</span>
                </div>
                {copiedField === 'telefon' ? (
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </div>

              <div
                onClick={() => handleCopy(data.eposta, 'eposta')}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-emerald-400 transition-colors group"
                title="Kopyalamak için tıklayın"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-[11px]">{data.eposta || '—'}</span>
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

        {/* KART 3: Resmi Kodlar & Entegrasyonlar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs md:col-span-2 lg:col-span-1 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-500" />
              Resmi Entegrasyon Kodları
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
              e-Maliye
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div
              onClick={() => handleCopy(data.detsis_kodu || data.dtvt_kodu, 'detsis')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-violet-400 transition-colors group"
              title="Kopyalamak için tıklayın"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">DETSİS Kodu</span>
                {copiedField === 'detsis' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                )}
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 text-xs truncate">
                {data.detsis_kodu || data.dtvt_kodu || '—'}
              </div>
            </div>

            <div
              onClick={() => handleCopy(data.ebutce_kodu, 'ebutce')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-violet-400 transition-colors group"
              title="Kopyalamak için tıklayın"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">e-Bütçe Kodu</span>
                {copiedField === 'ebutce' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                )}
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 text-xs truncate">
                {data.ebutce_kodu || '—'}
              </div>
            </div>

            <div
              onClick={() => handleCopy(data.say2000i_kodu, 'say2000i')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-violet-400 transition-colors group"
              title="Kopyalamak için tıklayın"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Say2000i</span>
                {copiedField === 'say2000i' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                )}
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 text-xs truncate">
                {data.say2000i_kodu || '—'}
              </div>
            </div>

            <div
              onClick={() => handleCopy(data.harcama_birim_kodu, 'harcama')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-violet-400 transition-colors group"
              title="Kopyalamak için tıklayın"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Harcama Kodu</span>
                {copiedField === 'harcama' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                )}
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 text-xs truncate">
                {data.harcama_birim_kodu || '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ⚙️ ÖZEL PARAMETRELER & DİNAMİK ALANLAR                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            Özel Parametreler & Key-Value Alanları ({customMetadata.length})
          </h3>
        </div>

        <KurumMetadataManager metadata={customMetadata} onChange={() => {}} isReadOnly={true} />
      </div>
    </div>
  )
}
