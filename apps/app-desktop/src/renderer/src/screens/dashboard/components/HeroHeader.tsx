import React, { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Info,
  Landmark,
  Mail,
  Plus,
  ShieldAlert,
  X
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface HeroHeaderProps {
  isMailConfigured: boolean
  smartAlerts: any[]
  institutionName: string
  kurumTuruLabel: string
  greeting: string
  currentDate: string
  activeSummary: any
  isActivePopoverOpen: boolean
  setIsActivePopoverOpen: (open: boolean) => void
  formatCurrency: (value: number) => string
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  isMailConfigured,
  smartAlerts,
  institutionName,
  kurumTuruLabel,
  greeting,
  currentDate,
  activeSummary,
  isActivePopoverOpen,
  setIsActivePopoverOpen,
  formatCurrency
}) => {
  const [isMailDismissed, setIsMailDismissed] = useState(false)
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set())

  const handleDismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const visibleAlerts = useMemo(() => {
    return smartAlerts.filter((alert) => !dismissedAlertIds.has(alert.id))
  }, [smartAlerts, dismissedAlertIds])

  return (
    <div className="flex flex-col gap-3">
      {((!isMailConfigured && !isMailDismissed) || visibleAlerts.length > 0) && (
        <div className="flex flex-col gap-3 max-w-4xl max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {/* SMTP Warning */}
          {!isMailConfigured && !isMailDismissed && (
            <div className="relative p-4 rounded-2xl bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 shadow-xs">
              <div className="flex items-start gap-3 text-amber-750 dark:text-amber-400 pr-8 md:pr-0">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                    Mail (SMTP) Ayarları Yapılandırılmamış
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90 leading-relaxed text-amber-800 dark:text-amber-400/90">
                    Sistem üzerinden şifre sıfırlama veya onay mailleri alabilmeniz için posta
                    sunucunuzu ayarlamanız gerekmektedir. Şifrenizi unutursanız sisteme erişiminizi
                    kaybedebilirsiniz!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end pr-8 md:pr-0 shrink-0">
                <Link to="/ayarlar" search={{ tab: 'smtp' }}>
                  <Button className="shrink-0 text-xs py-1.5 px-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm cursor-pointer">
                    <Mail className="w-4 h-4 mr-1.5" />
                    Ayarları Yapılandır
                  </Button>
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setIsMailDismissed(true)}
                className="absolute top-3 right-3 text-amber-500/70 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Smart Alerts */}
          {visibleAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`relative p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 shadow-xs ${
                alert.type === 'error'
                  ? 'bg-red-50 dark:bg-red-955/20 border-red-200 dark:border-red-900/30 text-red-755 dark:text-red-400'
                  : alert.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900/30 text-amber-755 dark:text-amber-450'
                    : 'bg-blue-50 dark:bg-blue-955/20 border-blue-200 dark:border-blue-900/30 text-blue-755 dark:text-blue-400'
              }`}
            >
              <div className="flex items-start gap-3 pr-8 md:pr-0">
                {alert.type === 'error' ? (
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-500" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                ) : (
                  <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-500" />
                )}
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      alert.type === 'error'
                        ? 'text-red-950 dark:text-red-300'
                        : alert.type === 'warning'
                          ? 'text-amber-950 dark:text-amber-300'
                          : 'text-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {alert.title}
                  </h4>
                  <p
                    className={`text-xs mt-0.5 opacity-90 leading-relaxed ${
                      alert.type === 'error'
                        ? 'text-red-800 dark:text-red-400/90'
                        : alert.type === 'warning'
                          ? 'text-amber-800 dark:text-amber-400/90'
                          : 'text-blue-800 dark:text-blue-400/90'
                    }`}
                  >
                    {alert.message}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end pr-8 md:pr-0 shrink-0">
                <Link to={alert.actionLink} search={alert.actionSearch}>
                  <Button
                    variant="outline"
                    className={`text-xs py-1.5 px-3.5 font-bold uppercase tracking-wider rounded-xl border-current hover:bg-white/50 dark:hover:bg-black/20 cursor-pointer ${
                      alert.type === 'error'
                        ? 'text-red-700 dark:text-red-400 hover:text-red-850'
                        : alert.type === 'warning'
                          ? 'text-amber-700 dark:text-amber-450 hover:text-amber-850'
                          : 'text-blue-700 dark:text-blue-450 hover:text-blue-850'
                    }`}
                  >
                    {alert.actionText} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <button
                type="button"
                onClick={() => handleDismissAlert(alert.id)}
                className={`absolute top-3 right-3 opacity-70 hover:opacity-100 transition-opacity cursor-pointer ${
                  alert.type === 'error'
                    ? 'text-red-500/70 hover:text-red-800 dark:hover:text-red-300'
                    : alert.type === 'warning'
                      ? 'text-amber-500/70 hover:text-amber-800 dark:hover:text-amber-300'
                      : 'text-blue-500/70 hover:text-blue-800 dark:hover:text-blue-300'
                }`}
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-6 rounded-3xl bg-linear-to-r from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-500/10 dark:border-blue-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-widest bg-blue-100/40 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-500/15">
              {institutionName || 'Kurum Adı Bekleniyor...'}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-100/40 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-500/15">
              {kurumTuruLabel}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">
            {greeting}, Kontrol Paneline Hoş Geldiniz.
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            {currentDate}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative">
          {activeSummary && (
            <div className="relative">
              <Button
                onClick={() => setIsActivePopoverOpen(!isActivePopoverOpen)}
                variant="outline"
                className="text-xs font-bold py-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-450 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Aktif Dosya
                <ChevronDown
                  className={`w-3.5 h-3.5 transform transition-transform ${
                    isActivePopoverOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
              {isActivePopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Çalışılan Aktif Dosya
                      </h4>
                      <p className="text-[9px] text-slate-400">
                        Şu anda üzerinde işlem yapılan doğrudan temin dosyası
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">
                          No & Konu
                        </span>
                        <span className="font-mono text-blue-650 dark:text-blue-450 font-bold block">
                          {activeSummary.dosyaNo}
                        </span>
                        <span
                          className="font-semibold text-slate-700 dark:text-slate-350 truncate block mt-0.5"
                          title={activeSummary.konu}
                        >
                          {activeSummary.konu}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">
                          Maliyet & KDV
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">
                          {formatCurrency(activeSummary.yaklasikMaliyet)}
                        </span>
                        <span className="text-slate-450 block mt-0.5">
                          KDV: %{activeSummary.kdv}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">
                          Birim & Tür
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-305 block truncate">
                          {activeSummary.birimAdi}
                        </span>
                        <span className="text-slate-450 capitalize block mt-0.5">
                          {activeSummary.tur} Alımı
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">
                          Yüklenici Firma
                        </span>
                        <span
                          className="font-semibold text-emerald-650 dark:text-emerald-450 block truncate"
                          title={activeSummary.secilenFirma}
                        >
                          {activeSummary.secilenFirma}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30">
                        <span className="font-bold text-indigo-600">Firmalar:</span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">
                          {activeSummary.katilanFirmaSayisi} Firma
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30">
                        <span className="font-bold text-amber-600">Kalemler:</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {activeSummary.malzemeSayisi} Kalem
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Link to="/harcama-merkezi">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3.5 shadow-md shadow-indigo-500/10 flex items-center gap-1.5 cursor-pointer">
              <Landmark className="w-4 h-4 text-indigo-200" />
              Harcama & Hakediş Merkezi
            </Button>
          </Link>
          <Link to="/dosyalar/yeni">
            <Button className="bg-blue-600 hover:bg-blue-700 text-xs font-bold py-2 px-4 shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              Yeni Temin Süreci
            </Button>
          </Link>
          <Link to="/mevzuat">
            <Button
              variant="outline"
              className="text-xs font-semibold py-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Limitler
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
