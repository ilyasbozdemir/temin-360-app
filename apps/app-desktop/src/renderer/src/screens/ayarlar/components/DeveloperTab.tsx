import React, { useState } from 'react'
import {
  Building,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { devSeedService, SeedResult } from '../../../services/devSeedService'
import { useQueryClient } from '@tanstack/react-query'

interface DeveloperTabProps {
  isPackaged?: boolean
  devUpdateTestMode: boolean
  setDevUpdateTestMode: (val: boolean) => void
  devUpdateVersion: string
  setDevUpdateVersion: (val: string) => void
  githubReleases: string[]
}

export const DeveloperTab: React.FC<DeveloperTabProps> = ({
  devUpdateTestMode,
  setDevUpdateTestMode,
  devUpdateVersion,
  setDevUpdateVersion,
  githubReleases
}) => {
  const queryClient = useQueryClient()
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null)

  const handleSeedAll = async (cleanFirst = true): Promise<void> => {
    setSeeding(true)
    setSeedResult(null)
    try {
      const result = await devSeedService.seedAll(cleanFirst)
      setSeedResult(result)
      queryClient.clear()
    } catch (err: any) {
      setSeedResult({
        success: false,
        message: err.message || 'Hata oluştu'
      })
    } finally {
      setSeeding(false)
    }
  }

  const handleSeedOnlyDef = async (): Promise<void> => {
    setSeeding(true)
    setSeedResult(null)
    try {
      await devSeedService.seedKurum()
      await devSeedService.seedSettings()
      await devSeedService.seedKikLimitleri()
      const pIds = await devSeedService.seedPersonel()
      const birimIds = await devSeedService.seedBirimler(pIds)
      const fIds = await devSeedService.seedFirmalar()
      const kIds = await devSeedService.seedKalemler()
      await devSeedService.seedKomisyonlarVeAmbarlar()

      setSeedResult({
        success: true,
        message:
          'Kurum, Ayarlar, Birimler, Personeller, Firmalar, Kalemler ve Komisyonlar başarıyla oluşturuldu!',
        details: {
          kurumUpdated: true,
          birimlerCount: birimIds.length,
          personelCount: pIds.length,
          firmalarCount: fIds.length,
          kalemlerCount: kIds.length
        }
      })
      queryClient.clear()
    } catch (err: any) {
      setSeedResult({
        success: false,
        message: err.message || 'Hata oluştu'
      })
    } finally {
      setSeeding(false)
    }
  }

  const handleEnrichFiles = async (): Promise<void> => {
    setSeeding(true)
    setSeedResult(null)
    try {
      await devSeedService.seedKurum()
      await devSeedService.seedSettings()
      const pIds = await devSeedService.seedPersonel()
      const birimIds = await devSeedService.seedBirimler(pIds)
      const fIds = await devSeedService.seedFirmalar()
      await devSeedService.seedKalemler()

      const count = await devSeedService.enrichExistingDosyalar(fIds, pIds, birimIds)
      setSeedResult({
        success: true,
        message: `${count} adet Doğrudan Temin dosyası malzeme kalemleri, istekli firma teklifleri ve komisyonlarıyla eksiksiz dolduruldu!`,
        details: {
          dosyalarEnrichedCount: count
        }
      })
      queryClient.clear()
    } catch (err: any) {
      setSeedResult({
        success: false,
        message: err.message || 'Hata oluştu'
      })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. TEST VERİLERİ VE SEEDER BÖLÜMÜ */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-100/80 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-indigo-100/60 dark:border-indigo-900/40 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Test Verisi Tohumlama (Database Seeder)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">
                  Dev Tool
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Önceki test verilerini temizleyip sıfırdan tüm Kurum, Birim, Personel, Firma, Kalem
                ve 5 adet komple Dosya sürecini yükler.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSeedAll(true)}
              disabled={seeding}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 rounded-xl shadow-md transition-all cursor-pointer"
              title="Önceki tüm test kayıtlarını siler ve sıfırdan 5 tam süreç dosyası ile tohumlar"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sıfırlanıyor & Yazılıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Sıfırla & Baştan Tohumla (Clean Seed)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sonuç Bildirimi */}
        {seedResult && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 ${
              seedResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-200'
            }`}
          >
            {seedResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <RefreshCw className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{seedResult.message}</p>
              {seedResult.details && (
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] opacity-90">
                  {seedResult.details.kurumUpdated && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-medium">
                      ✓ Kurum Bilgileri
                    </span>
                  )}
                  {seedResult.details.birimlerCount ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-medium">
                      ✓ {seedResult.details.birimlerCount} Birim
                    </span>
                  ) : null}
                  {seedResult.details.personelCount ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-medium">
                      ✓ {seedResult.details.personelCount} Personel
                    </span>
                  ) : null}
                  {seedResult.details.firmalarCount ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-medium">
                      ✓ {seedResult.details.firmalarCount} Firma
                    </span>
                  ) : null}
                  {seedResult.details.kalemlerCount ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-medium">
                      ✓ {seedResult.details.kalemlerCount} Malzeme/Hizmet
                    </span>
                  ) : null}
                  {seedResult.details.dosyalarEnrichedCount ? (
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 font-bold">
                      ✓ {seedResult.details.dosyalarEnrichedCount} Dosya Zenginleştirildi
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parçalı Tohumlama Butonları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <button
            onClick={handleSeedOnlyDef}
            disabled={seeding}
            className="flex items-center gap-3 p-3 text-left rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                1. Temel Tanımları Doldur
              </div>
              <div className="text-[11px] text-slate-500">
                Kurum, 5 Şube Müdürlüğü, 7 Personel, 5 İstekli Firma ve 10 Malzeme Kalemi
              </div>
            </div>
          </button>

          <button
            onClick={handleEnrichFiles}
            disabled={seeding}
            className="flex items-center gap-3 p-3 text-left rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                2. Açık Dosyaları Zenginleştir
              </div>
              <div className="text-[11px] text-slate-500">
                Mevcut tüm temin dosyalarına malzeme kalemleri, firma teklifleri ve komisyonları ata
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. GÜNCELLEME VE DEV MODU AYARLARI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100">
              Geliştirici Sürüm ve Güncelleme Testi
            </h2>
            <p className="text-xs text-slate-500">
              Geliştirme modunda otomatik güncellemeleri simüle etmek için kullanılır.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="devUpdateTestMode"
              checked={devUpdateTestMode}
              onChange={(e) => {
                const mode = e.target.checked
                setDevUpdateTestMode(mode)
                if (window.api?.setDevVersion) {
                  window.api.setDevVersion(mode, devUpdateVersion)
                  window.dispatchEvent(new Event('app-version-changed'))
                  window.electron?.ipcRenderer.invoke('updater:check')
                }
              }}
              className="rounded border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-primary focus:ring-primary accent-primary"
            />
            <label
              htmlFor="devUpdateTestMode"
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              Geliştirici Modunda (Dev Mode) Güncelleme Testini Etkinleştir
            </label>
          </div>

          {devUpdateTestMode && (
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Şu Anki Versiyonu Şöyle Göster (GitHub Releases)
              </label>
              <select
                value={devUpdateVersion}
                onChange={(e) => {
                  const ver = e.target.value
                  setDevUpdateVersion(ver)
                  if (window.api?.setDevVersion) {
                    window.api.setDevVersion(devUpdateTestMode, ver)
                    window.dispatchEvent(new Event('app-version-changed'))
                    window.electron?.ipcRenderer.invoke('updater:check')
                  }
                }}
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Versiyon Seçiniz --</option>
                {githubReleases.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
