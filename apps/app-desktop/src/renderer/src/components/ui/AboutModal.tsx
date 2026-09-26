import React from 'react'
import {
  ShieldCheck,
  Server,
  Lock,
  Scale,
  ExternalLink,
  Star,
  Bug,
  Globe,
  Code2,
  X,
  Sparkles
} from 'lucide-react'
import packageJson from '../../../../../package.json'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutModal({ isOpen, onClose }: AboutModalProps): React.ReactNode {
  if (!isOpen) return null

  const openExternal = (url: string): void => {
    window.electron.ipcRenderer.send('open-external', url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 bg-linear-to-r from-blue-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-radial from-white/15 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black tracking-tight">TEMİN 360</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-md border border-white/25">
                  v{packageJson.version}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                  Açık Kaynak
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Kamu Temin, İhale, Harcama ve Hakediş Yönetim Sistemi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors relative z-10 cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
          {/* 1. Güvenlik ve Yerel Barındırma (Self-Hosted) */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-900/40 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                <Server className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <span>%100 Yerel Mimari &amp; Veri Güvenliği (On-Premise)</span>
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </h4>
                <p className="text-slate-650 dark:text-slate-350 text-[11px] leading-relaxed">
                  Sisteme girdiğiniz kurum bilgileri, birimler, bütçe kodları, harcama yetkilileri,
                  personel kayıtları ve doğrudan temin / ihale dosyaları{' '}
                  <strong>kesinlikle harici yabancı bir bulut sunucusuna gitmez.</strong>
                </p>
                <p className="text-slate-650 dark:text-slate-350 text-[11px] leading-relaxed">
                  Tüm verileriniz yalnızca yerel bilgisayarınızdaki SQLite dosyasında veya
                  kurumunuzun kendi iç ağında kuracağınız{' '}
                  <strong>kendi yerel sunucu / hosting ortamınızda</strong> güvenle barınır.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Açık Kaynak ve Lisans Şartları */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-blue-50/80 to-indigo-50/40 dark:from-blue-950/20 dark:to-slate-900 border border-blue-200/70 dark:border-blue-900/40 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                <Scale className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <span>Açık Kaynak Lisansı &amp; Özelleştirme Serbestisi</span>
                  <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </h4>
                <p className="text-slate-650 dark:text-slate-350 text-[11px] leading-relaxed">
                  TEMİN 360 açık kaynaklı bir yazılımdır. Kaynak kodları indirebilir, kurumunuzun iç
                  ihtiyaçlarına, mevzuat maddelerine ve iş akışlarına göre serbestçe geliştirebilir
                  ve özelleştirebilirsiniz.
                </p>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 font-medium text-[11px]">
                  ⚠️ <strong>Lisans Kuralı:</strong> Bu yazılım ve kaynak kodları{' '}
                  <strong>
                    ticari bir ürüne dönüştürülemez, üçüncü şahıslara ticari olarak satılamaz veya
                    kapalı devre ücretli paket haline getirilemez.
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Geliştirici & Destek Butonları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => openExternal('https://github.com/ilyasbozdemir/temin-360-app')}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
            >
              <Star className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-left">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">GitHub Projesi</div>
                <div className="text-[10px] text-slate-500">Yıldızla &amp; İncele</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </button>

            <button
              type="button"
              onClick={() => openExternal('https://ilyasbozdemir.dev')}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
            >
              <Globe className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-left">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">İlyas BOZDEMİR</div>
                <div className="text-[10px] text-slate-500">Geliştirici Web Sitesi</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </button>

            <button
              type="button"
              onClick={() => openExternal('https://github.com/ilyasbozdemir/temin-360-app/issues')}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer group"
            >
              <Bug className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-left">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Hata Bildir</div>
                <div className="text-[10px] text-slate-500">Destek &amp; Geri Bildirim</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Kamu standartlarına ve 4734 Sayılı KİK mevzuatına uygundur.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
