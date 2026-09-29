import React from 'react'
import { Check, FileText, RefreshCw, Save } from 'lucide-react'
import type { KomisyonType } from './types'

interface KomisyonAtamaFooterProps {
  activeTab: KomisyonType
  loading: boolean
  saving: boolean
  saveSuccess: boolean
  onOpenDoc: (targetDoc?: string) => void
  onSyncFromKomisyonYonetimi: () => void
  onSave: () => void
}

export const KomisyonAtamaFooter: React.FC<KomisyonAtamaFooterProps> = ({
  activeTab,
  loading,
  saving,
  saveSuccess,
  onOpenDoc,
  onSyncFromKomisyonYonetimi,
  onSave
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2 flex-wrap">
        {activeTab === 'yaklasik_maliyet' ? (
          <>
            <button
              type="button"
              onClick={() => onOpenDoc('piyasa-fiyat-arastirma-gorevlendirmesi')}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Komisyon Görevlendirme Onayı Belgesini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Komisyon Onayı
            </button>
            <button
              type="button"
              onClick={() => onOpenDoc('komisyon-gorevlendirme-onayi-eki')}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              title="Komisyon Görevlendirme Onayı Ekini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Onay Eki
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onOpenDoc('muayene-kabul-komisyonu')}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Muayene ve Kabul Komisyonu Belgesini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Muayene ve Kabul Komisyonu
            </button>
            <button
              type="button"
              onClick={() => onOpenDoc('komisyon-gorevlendirme-onayi')}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Komisyon Görevlendirme Onayı Belgesini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Komisyon Onayı
            </button>
            <button
              type="button"
              onClick={() => onOpenDoc('komisyon-gorevlendirme-onayi-eki')}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              title="Komisyon Görevlendirme Onayı Ekini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Onay Eki
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSyncFromKomisyonYonetimi}
          disabled={loading || saving}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          title="Komisyon Yönetimi ekranında tanımlı üyeleri yükle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Komisyon Yönetiminden Yükle
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving || loading}
          className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              Kaydedildi
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
