import React from 'react'
import { Link } from '@tanstack/react-router'
import { Building, Hash, Info, ExternalLink, User } from 'lucide-react'

interface InstitutionCardProps {
  institutionName: string
  kurumTuruLabel: string
  limitType: string
  eButceKodu: string
  say2000iKodu: string
  detsisKodu: string
  kurumsalKod: string
  fonksiyonelKod: string
  harcamaBirimAdi: string
  harcamaBirimKodu: string
  muhasebeBirimAdi: string
  muhasebeBirimKodu: string
  stats: any
  adminName: string
  adminTitle: string
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  institutionName,
  kurumTuruLabel,
  limitType,
  eButceKodu,
  say2000iKodu,
  detsisKodu,
  kurumsalKod,
  fonksiyonelKod,
  harcamaBirimAdi,
  harcamaBirimKodu,
  muhasebeBirimAdi,
  muhasebeBirimKodu,
  stats,
  adminName,
  adminTitle
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-blue-100/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all duration-700 pointer-events-none" />
      <div className="absolute -left-6 bottom-0 w-24 h-24 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-100/50 dark:border-slate-800 relative z-10">
        <div className="p-1.5 bg-blue-100/80 dark:bg-blue-900/40 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/50">
          <Building className="w-4 h-4 text-blue-700 dark:text-blue-450" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
          Kurum Kimlik Kartı
        </h3>
      </div>

      <div className="space-y-3 text-xs relative z-10">
        <div className="bg-white/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-blue-50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
          <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase tracking-wider mb-0.5">
            Kurum Adı
          </span>
          <span className="font-extrabold text-slate-800 dark:text-slate-100 text-[13px] leading-tight block">
            {institutionName || 'Belirtilmemiş'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/60 dark:bg-slate-800/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
            <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase mb-0.5">
              Kurum Türü
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{kurumTuruLabel}</span>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
            <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase mb-0.5">
              Limit Grubu
            </span>
            <span
              className="font-bold text-slate-700 dark:text-slate-300 truncate block"
              title={limitType === 'buyuksehir' ? 'Büyükşehir Limitleri' : 'Diğer İdare Limitleri'}
            >
              {limitType === 'buyuksehir' ? 'Büyükşehir' : 'Diğer İdare'}
            </span>
          </div>
        </div>

        {eButceKodu && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100/80 dark:border-blue-800/50 mt-1 shadow-sm">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded-md">
              <Hash className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-blue-500 dark:text-blue-400 block uppercase leading-none mb-0.5 flex items-center gap-1">
                e-Bütçe Kodu
                <span title="Kurumun e-Bütçe sistemindeki ön ek kodu">
                  <Info className="w-2.5 h-2.5 cursor-help" />
                </span>
              </span>
              <span className="font-mono font-bold text-slate-850 dark:text-slate-100">
                {eButceKodu}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {say2000iKodu && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-100/80 dark:border-indigo-800/50 mt-1 shadow-sm">
              <div className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-md">
                <Hash className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 block uppercase leading-none mb-0.5 flex items-center gap-1">
                  Say2000i Kodu
                  <span title="Kurumun Say2000i sistemindeki kodu">
                    <Info className="w-2.5 h-2.5 cursor-help" />
                  </span>
                </span>
                <span className="font-mono font-bold text-slate-850 dark:text-slate-100">
                  {say2000iKodu}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {detsisKodu && (
            <div className="bg-slate-50/80 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 relative group/link">
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase mb-0.5 flex items-center justify-between">
                DETSİS Kodu
                <a
                  href={
                    detsisKodu
                      ? `https://detsis.gov.tr/ara/${detsisKodu}`
                      : 'https://detsis.gov.tr/'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:text-blue-600 opacity-0 group-hover/link:opacity-100 transition-opacity"
                  title="DETSİS'te Sorgula"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {detsisKodu}
              </span>
            </div>
          )}
          {kurumsalKod && (
            <div className="bg-slate-50/80 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 relative group/link">
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase mb-0.5 flex items-center justify-between">
                Kurumsal Kod
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {kurumsalKod}
              </span>
            </div>
          )}
          {fonksiyonelKod && (
            <div className="bg-slate-50/80 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase mb-0.5">
                Fonksiyonel Kod
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {fonksiyonelKod}
              </span>
            </div>
          )}
        </div>

        {(harcamaBirimAdi || muhasebeBirimAdi) && (
          <div className="space-y-1.5 p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800/50">
            {harcamaBirimAdi && (
              <div className="flex items-start gap-2">
                <div className="w-1 h-3.5 bg-indigo-400 rounded-full mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase leading-none mb-0.5">
                    Harcama Birimi
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block leading-tight">
                    {harcamaBirimKodu ? (
                      <span className="font-mono text-indigo-500 dark:text-indigo-400 mr-1">
                        [{harcamaBirimKodu}]
                      </span>
                    ) : (
                      ''
                    )}
                    {harcamaBirimAdi}
                  </span>
                </div>
              </div>
            )}
            {muhasebeBirimAdi && (
              <div className="flex items-start gap-2 pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-880">
                <div className="w-1 h-3.5 bg-emerald-400 rounded-full mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase leading-none mb-0.5 flex items-center gap-1">
                    Muhasebe Birimi
                    <span title="Say2000i ön ek kodunuz">
                      <Info className="w-2.5 h-2.5 cursor-help text-slate-400" />
                    </span>
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block leading-tight">
                    {muhasebeBirimKodu ? (
                      <span className="font-mono text-emerald-500 dark:text-emerald-450 mr-1">
                        [{muhasebeBirimKodu}]
                      </span>
                    ) : (
                      ''
                    )}
                    {muhasebeBirimAdi}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-100/50 dark:border-slate-800">
          <Link
            to="/birimler"
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 hover:bg-blue-50 hover:border-blue-100 dark:hover:bg-slate-800/80 border border-transparent transition-all group/stat"
          >
            <div>
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase mb-0.5">
                Birimler
              </span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {stats.kayitliBirimSayisi}{' '}
                <span className="text-[10px] font-medium text-slate-500">Adet</span>
              </span>
            </div>
            <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover/stat:bg-blue-100 dark:group-hover/stat:bg-blue-900/50 transition-colors">
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover/stat:text-blue-500" />
            </div>
          </Link>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-transparent">
            <div>
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase mb-0.5">
                Ambarlar
              </span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {stats.kayitliAmbarSayisi}{' '}
                <span className="text-[10px] font-medium text-slate-500">Depo</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 mt-2 relative overflow-hidden group/admin">
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-white/10 skew-x-12 translate-x-8 group-hover/admin:translate-x-[-100%] transition-transform duration-1000" />
          <span className="text-[9px] font-bold text-blue-200 block uppercase tracking-wider mb-0.5 flex items-center gap-1">
            <User className="w-2.5 h-2.5" />
            Harcama Yetkilisi
          </span>
          <span className="font-extrabold text-sm block leading-tight">{adminName}</span>
          <span className="text-[10px] text-blue-100 font-medium block mt-0.5 opacity-90">
            {adminTitle}
          </span>
        </div>
      </div>
    </div>
  )
}
