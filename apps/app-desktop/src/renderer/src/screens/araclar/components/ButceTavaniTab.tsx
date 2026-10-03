import React, { useState, useEffect } from 'react'
import { Percent, ShieldAlert, Database, Sparkles, FolderOpen, RefreshCw, CheckCircle2 } from 'lucide-react'
import { denetleButceYuzdeOnSiniri, formatTL } from '../../../utils/ihale'
import { useWorkspaceStore } from '../../../store/workspaceStore'

export function ButceTavaniTab(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()

  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [butceYillik, setButceYillik] = useState<number>(50000000)
  const [butceOncekiHarcama, setButceOncekiHarcama] = useState<number>(4200000)
  const [butceBuAlim, setButceBuAlim] = useState<number>(650000)
  const [dosyaSayisi, setDosyaSayisi] = useState<number>(0)
  const [seciliDosyaAdi, setSeciliDosyaAdi] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loadFromWorkspaceDb = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.electron?.ipcRenderer) return
    setIsLoading(true)
    try {
      // 1. Tüm Doğrudan Temin Dosyalarını Çek
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT d.id, d.dosya_no, COALESCE(d.is_adi, d.dosya_adi, d.konu) as ad, d.tur, d.tarih,
                d.kullanilabilir_odenek,
                COALESCE((SELECT SUM(miktar * birim_fiyat) FROM DATA_TeminKalem WHERE temin_dosya_id = d.id), 0) as toplam_tutar
         FROM DATA_TeminDosyasi d
         ORDER BY d.id DESC`
      )

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const files: Array<{
          id: number
          dosya_no?: string
          ad?: string
          tur?: string
          kullanilabilir_odenek?: string
          toplam_tutar: number
        }> = res.data

        setDosyaSayisi(files.length)

        // Aktif dosya veya en son dosya
        const currentFile = files.find((f) => f.id === activeDosyaId) || files[0]
        if (currentFile) {
          setSeciliDosyaAdi(currentFile.ad || currentFile.dosya_no || `Dosya #${currentFile.id}`)
          if (currentFile.toplam_tutar > 0) {
            setButceBuAlim(currentFile.toplam_tutar)
          }
          if (currentFile.kullanilabilir_odenek) {
            const odenekNum = parseFloat(currentFile.kullanilabilir_odenek.replace(/[^0-9.-]+/g, ''))
            if (odenekNum > 0) setButceYillik(odenekNum)
          }
        }

        // Önceki 22/d harcamaları (aktif dosya dışındakiler)
        const otherFilesTotal = files
          .filter((f) => (currentFile ? f.id !== currentFile.id : true))
          .reduce((sum, f) => sum + (f.toplam_tutar || 0), 0)

        if (otherFilesTotal > 0) {
          setButceOncekiHarcama(otherFilesTotal)
        }
      }
    } catch (e) {
      console.warn('[ButceTavaniTab] Error loading workspace data:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFromWorkspaceDb()
  }, [activeDosyaId])

  const butceSonuc = denetleButceYuzdeOnSiniri({
    yillikToplamOdenek: butceYillik,
    oncekiHarcananToplam22d: butceOncekiHarcama,
    buAlimTutari: butceBuAlim
  })

  const kullanilanYuzde = butceYillik > 0 ? (butceSonuc.yeniToplamHarcama / butceYillik) * 100 : 0
  const tavanYuzde = 10 // KİK Md. 62/ı %10 Sınırı

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* Sol Panel: Giriş Parametreleri */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Percent size={18} className="text-purple-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              4734 Sayılı Kanun Madde 62/ı Denetimi
            </h3>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'auto'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📁 Dosyalardan Çek
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'manual'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ✍️ Manuel Giriş
            </button>
          </div>
        </div>

        {mode === 'auto' && (
          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
              <FolderOpen size={15} className="text-purple-600" />
              <span>
                {dosyaSayisi > 0
                  ? `Çalışma alanındaki ${dosyaSayisi} dosyadan toplamlar otomatik hesaplandı`
                  : 'Çalışma alanında kayıtlı temin dosyası bulunamadı'}
              </span>
            </div>
            <button
              type="button"
              onClick={loadFromWorkspaceDb}
              disabled={isLoading}
              className="p-1 text-purple-700 hover:text-purple-900 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors cursor-pointer"
              title="Yenile"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            İlgili Tertip Yıllık Toplam Ödeneği (₺)
          </label>
          <input
            type="number"
            value={butceYillik}
            onChange={(e) => setButceYillik(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Bu Yıl 22/d ile Yapılan Önceki Harcamalar (₺)
            </label>
            {mode === 'auto' && (
              <span className="text-[10px] text-purple-600 font-semibold">
                (Diğer dosyaların toplamı)
              </span>
            )}
          </div>
          <input
            type="number"
            value={butceOncekiHarcama}
            onChange={(e) => setButceOncekiHarcama(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Yeni Yapılacak Alım Tutarı (₺)
            </label>
            {mode === 'auto' && seciliDosyaAdi && (
              <span className="text-[10px] text-purple-600 font-semibold truncate max-w-[200px]" title={seciliDosyaAdi}>
                ({seciliDosyaAdi})
              </span>
            )}
          </div>
          <input
            type="number"
            value={butceBuAlim}
            onChange={(e) => setButceBuAlim(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold"
          />
        </div>
      </div>

      {/* Sağ Panel: %10 Denetim ve Uyarı Raporu */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-purple-600" />
            %10 Bütçe Tavan Denetimi Raporu
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block">Yasal %10 Tavan Limiti</span>
              <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                {formatTL(butceSonuc.yuzdeOnTavanTutari)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Yıllık Ödeneğin %10&apos;u</span>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800">
              <span className="text-xs text-purple-600 dark:text-purple-400 block">Toplam Kullanım</span>
              <span className="text-lg font-mono font-bold text-purple-900 dark:text-purple-100">
                {formatTL(butceSonuc.yeniToplamHarcama)}
              </span>
              <span className="text-[10px] text-purple-600/80 block mt-0.5">
                Kullanım: %{butceSonuc.kullanilanOranYuzde}
              </span>
            </div>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Tavan Doluluk Oranı</span>
              <span className={kullanilanYuzde > tavanYuzde ? 'text-rose-600 font-bold' : 'text-purple-600 font-bold'}>
                %{kullanilanYuzde.toFixed(2)} / %{tavanYuzde} (Yasal Tavan)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 ${
                  kullanilanYuzde > tavanYuzde
                    ? 'bg-rose-500'
                    : kullanilanYuzde > 8
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min((kullanilanYuzde / tavanYuzde) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Uyarı Kutusu */}
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
            butceSonuc.uyariSeviyesi === 'ASILDI'
              ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              : butceSonuc.uyariSeviyesi === 'YAKLASIYOR'
                ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
          }`}
        >
          {butceSonuc.uyariSeviyesi === 'GUVENLI' ? (
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
          ) : (
            <ShieldAlert size={20} className="shrink-0" />
          )}
          <span>{butceSonuc.mesaj}</span>
        </div>
      </div>
    </div>
  )
}
