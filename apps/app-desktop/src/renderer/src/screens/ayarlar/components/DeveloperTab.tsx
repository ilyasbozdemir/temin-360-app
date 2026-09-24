import React, { useState } from 'react'
import {
  Building,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap
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
  const [runningTests, setRunningTests] = useState(false)
  const [liveLogs, setLiveLogs] = useState<string>('')
  const [testResult, setTestResult] = useState<{
    success: boolean
    output: string
    exitCode?: number | null
    stats?: {
      testFilesPassed: number
      testFilesTotal: number
      testsPassed: number
      testsTotal: number
      duration: string
      files: Array<{
        path: string
        testsCount: number
        duration: string
        status: 'passed' | 'failed'
      }>
    }
  } | null>(null)

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

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => {
                const current = localStorage.getItem('temin_splash_enabled') !== 'false'
                localStorage.setItem('temin_splash_enabled', current ? 'false' : 'true')
                alert(`Açılış Splash Ekranı: ${!current ? 'Açık (Her açılışta gösterilecek)' : 'Kapalı (Doğrudan arayüz açılacak)'}`)
              }}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Açılışta Splash ekranının gösterilip gösterilmeyeceğini ayarlar"
            >
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              <span>Açılışta Göster: {localStorage.getItem('temin_splash_enabled') === 'false' ? 'Kapalı' : 'Açık'}</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('show-splash-screen'))}
              type="button"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl shadow-2xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Açılış Splash / Tanıtım animasyonunu yeniden çalıştırır"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Splash Ekranını Önizle</span>
            </button>

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

      {/* 3. BİRİM & ENTEGRASYON TESTLERİ (VITEST RUNNER) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                Otomatik Birim & Entegrasyon Testleri (Vitest)
              </h2>
              <p className="text-xs text-slate-500">
                Masaüstü uygulaması ve modüllerin tüm birim testlerini tek tıkla koşturun ve sonuçları inceleyin.
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              setRunningTests(true)
              setTestResult(null)
              try {
                let res: any = null
                if ((window as any).electron?.runTests) {
                  res = await (window as any).electron.runTests()
                } else if ((window as any).electron?.ipcRenderer) {
                  res = await (window as any).electron.ipcRenderer.invoke('dev:run-tests')
                } else {
                  res = {
                    success: false,
                    output: 'Electron IPC köprüsü bulunamadı (Tarayıcı modunda çalışıyor olabilirsiniz).'
                  }
                }
                setTestResult(res)
              } catch (err: any) {
                setTestResult({
                  success: false,
                  output: err?.message || 'Test koşturulurken bir hata oluştu.'
                })
              } finally {
                setRunningTests(false)
              }
            }}
            disabled={runningTests}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
          >
            {runningTests ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testler Koşturuluyor...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Testleri Çalıştır
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className="mt-4 space-y-4">
            {/* KPI İstatistik Kartları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-3 rounded-xl border flex flex-col ${
                testResult.success
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200'
              }`}>
                <span className="text-[11px] opacity-75 font-medium">Test Durumu</span>
                <span className="text-sm font-bold mt-0.5 flex items-center gap-1.5">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Başarılı (Geçti)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Hata Var
                    </>
                  )}
                </span>
              </div>

              <div className="p-3 rounded-xl border bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-200 flex flex-col">
                <span className="text-[11px] opacity-75 font-medium">Toplam Test</span>
                <span className="text-sm font-bold mt-0.5">
                  {testResult.stats?.testsPassed ?? '-'}{' '}
                  <span className="text-xs font-normal opacity-80">
                    / {testResult.stats?.testsTotal ?? '-'} geçti
                  </span>
                </span>
              </div>

              <div className="p-3 rounded-xl border bg-violet-50/70 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50 text-violet-900 dark:text-violet-200 flex flex-col">
                <span className="text-[11px] opacity-75 font-medium">Test Dosyaları</span>
                <span className="text-sm font-bold mt-0.5">
                  {testResult.stats?.testFilesPassed ?? '-'}{' '}
                  <span className="text-xs font-normal opacity-80">
                    / {testResult.stats?.testFilesTotal ?? '-'} dosya
                  </span>
                </span>
              </div>

              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 flex flex-col">
                <span className="text-[11px] opacity-75 font-medium">Toplam Süre</span>
                <span className="text-sm font-bold mt-0.5 font-mono">
                  {testResult.stats?.duration || '1.8s'}
                </span>
              </div>
            </div>

            {/* Test Dosyaları Listesi (Suites List) */}
            {testResult.stats?.files && testResult.stats.files.length > 0 && (
              <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
                <div className="px-3.5 py-2 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Koşturulan Test Dosyaları</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {testResult.stats.files.length} dosya doğrulandı
                  </span>
                </div>
                <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {testResult.stats.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-white dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-mono text-slate-750 dark:text-slate-200 font-medium truncate">
                          {file.path}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          {file.testsCount} test
                        </span>
                        {file.duration && (
                          <span className="text-[11px] font-mono text-slate-400">
                            {file.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detaylı Terminal Konsolu */}
            {testResult.output && (
              <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Terminal Log Çıktısı (Vitest CLI)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(testResult.output)
                    }}
                    className="hover:text-slate-200 transition-colors cursor-pointer text-[10px] uppercase font-bold tracking-wider"
                  >
                    Kopyala
                  </button>
                </div>
                <div className="p-4 text-emerald-300 dark:text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72 select-text leading-relaxed whitespace-pre-wrap">
                  {testResult.output}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. SİSTEM & OLAY GÜNLÜKLERİ (EVENT LOGS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                Sistem & Olay Günlükleri (Log Dosyaları)
              </h2>
              <p className="text-xs text-slate-500">
                Geliştirici ve canlı ortamda oluşan tüm SQLite, Google Drive, ağ ve sistem olaylarını dosyadan inceleyin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if ((window as any).api?.openLogFolder) {
                  await (window as any).api.openLogFolder()
                } else if ((window as any).electron?.ipcRenderer) {
                  await (window as any).electron.ipcRenderer.invoke('logs:open-dir')
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              📁 Klasörü Aç
            </button>

            <button
              onClick={async () => {
                if ((window as any).api?.openLogFile) {
                  await (window as any).api.openLogFile()
                } else if ((window as any).electron?.ipcRenderer) {
                  await (window as any).electron.ipcRenderer.invoke('logs:open-file')
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all cursor-pointer shadow-sm"
            >
              📄 Log Dosyasını Aç
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={async () => {
              try {
                let logs = ''
                if ((window as any).api?.readRecentLogs) {
                  logs = await (window as any).api.readRecentLogs(150)
                } else if ((window as any).electron?.ipcRenderer) {
                  logs = await (window as any).electron.ipcRenderer.invoke('logs:read-recent', 150)
                }
                setLiveLogs(logs || 'Kayıtlı günlük bulunamadı.')
              } catch (err: any) {
                setLiveLogs(`Hata: ${err?.message || err}`)
              }
            }}
            className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Son Günlükleri Canlı Yenile
          </button>
          <span className="text-[11px] text-slate-400">
            Otomatik dosya yolu: userData/logs/app-YYYY-MM-DD.log
          </span>
        </div>

        {liveLogs && (
          <div className="mt-3 rounded-xl bg-slate-950 border border-slate-800 p-4 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72 select-text leading-relaxed whitespace-pre-wrap">
            {liveLogs}
          </div>
        )}
      </div>
    </div>
  )
}
