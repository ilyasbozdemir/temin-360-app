import React, { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Cpu,
  FileArchive,
  FileText,
  Gavel,
  Landmark,
  Layers,
  Plus,
  TrendingUp,
  Users
} from 'lucide-react'

import { DteTransfer } from './components/DteTransfer'
import { PackageStructure } from './components/PackageStructure'
import { SelectedFileInspector } from './components/SelectedFileInspector'
import { UpdaterWidget } from './components/UpdaterWidget'
import { ChangelogWidget } from './components/ChangelogWidget'
import { DosyaNotlariWidget } from '../notlar/components/DosyaNotlariWidget'

interface TableStat {
  tableName: string
  label: string
  count: number
  description: string
}

type PackageFile = 'meta.json' | 'database.sqlite' | 'attachments/'

export default function DosyaScreen(): React.JSX.Element {
  const { activeMeta, activeFilePath, fileName, activeDosyaId } = useWorkspaceStore()
  const [selectedFile, setSelectedFile] = useState<PackageFile>('meta.json')
  const [copied, setCopied] = useState(false)

  const queryClient = useQueryClient()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [changelog, setChangelog] = useState<
    { version: string; notes: string; schema_max: number }[]
  >([])
  const [backlog, setBacklog] = useState<{ title: string; items: string[] }[]>([])
  const [activeHistoryTab, setActiveHistoryTab] = useState<'releases' | 'backlog'>('releases')

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  // Aktif Dosya Detay States
  const [dosyaData, setDosyaData] = useState<any>(null)
  const [kalemler, setKalemler] = useState<any[]>([])
  const [firmalar, setFirmalar] = useState<any[]>([])
  const [birimAdi, setBirimAdi] = useState<string>('')
  const [loadingDosya, setLoadingDosya] = useState<boolean>(!!activeDosyaId)

  useEffect(() => {
    if (!window.electron) return
    window.electron.ipcRenderer
      .invoke('get-changelog')
      .then((res) => {
        if (res && res.success) {
          setChangelog(res.changelog || [])
          setBacklog(res.backlog || [])
        } else if (Array.isArray(res)) {
          setChangelog(res)
        }
      })
      .catch(console.error)
  }, [])

  // Aktif Dosya Özet Detaylarını Yükle
  useEffect(() => {
    if (!window.electron || !activeDosyaId) {
      return
    }

    const fetchDosyaDetails = async () => {
      setLoadingDosya(true)
      try {
        const dosyaRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminDosyasi WHERE id = ?',
          [activeDosyaId]
        )
        if (dosyaRes.success && dosyaRes.data.length > 0) {
          const dosya = dosyaRes.data[0]
          setDosyaData(dosya)

          // Birim adını getir
          if (dosya.birim_id) {
            const birimRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              'SELECT birim_adi FROM TANIM_Birim WHERE id = ?',
              [dosya.birim_id]
            )
            if (birimRes.success && birimRes.data.length > 0) {
              setBirimAdi(birimRes.data[0].birim_adi)
            }
          } else {
            setBirimAdi('')
          }

          // Kalemleri getir
          const kalemRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
            [activeDosyaId]
          )
          if (kalemRes.success) {
            setKalemler(kalemRes.data || [])
          }

          // Firmaları getir
          const firmaRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT df.*, f.unvan 
             FROM DATA_TeminFirma df 
             JOIN TANIM_Firma f ON df.firma_id = f.id 
             WHERE df.temin_dosya_id = ?`,
            [activeDosyaId]
          )
          if (firmaRes.success) {
            setFirmalar(firmaRes.data || [])
          }
        } else {
          setDosyaData(null)
        }
      } catch (err) {
        console.error('Failed to load active file details:', err)
      } finally {
        setLoadingDosya(false)
      }
    }

    fetchDosyaDetails()
  }, [activeDosyaId, refreshTrigger])

  // DTE Data Transfer States
  const [dteContentType, setDteContentType] = useState<'firms' | 'items' | 'all'>('firms')
  const [dteStatus, setDteStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [dteLoading, setDteLoading] = useState(false)

  const handleExportDte = async (): Promise<void> => {
    setDteLoading(true)
    setDteStatus(null)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:export-dte', dteContentType)
      if (res.success) {
        setDteStatus({
          type: 'success',
          message: `Veriler başarıyla dışa aktarıldı. (${res.recordCount} kayıt)`
        })
      } else {
        if (res.error !== 'İptal edildi') {
          setDteStatus({
            type: 'error',
            message: `Dışa aktarma hatası: ${res.error}`
          })
        }
      }
    } catch (err: any) {
      setDteStatus({
        type: 'error',
        message: err.message || 'Dışa aktarım sırasında beklenmedik hata.'
      })
    } finally {
      setDteLoading(false)
    }
  }

  const handleImportDte = async (): Promise<void> => {
    setDteLoading(true)
    setDteStatus(null)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:import-dte')
      if (res.success) {
        let msg = ''
        if (res.importedFirmsCount > 0) {
          msg += `${res.importedFirmsCount} adet firma `
        }
        if (res.importedItemsCount > 0) {
          msg += `${msg ? 've ' : ''}${res.importedItemsCount} adet malzeme/hizmet kalemi `
        }

        if (res.totalImportedCount > 0 && !msg) {
          msg = `Toplam ${res.totalImportedCount} adet kayıt `
        }

        if (!msg && res.totalImportedCount === 0) {
          msg = 'Aktarılacak yeni kayıt bulunamadı veya atlandı.'
        } else {
          msg += 'başarıyla içe aktarıldı.'
        }

        if (res.warnings && res.warnings.length > 0) {
          msg += ` (Uyarı: ${res.warnings.join(', ')})`
        }

        setDteStatus({
          type: 'success',
          message: msg
        })

        // Invalidate react-query cache
        queryClient.invalidateQueries()
        // Refresh local stats
        setRefreshTrigger((prev) => prev + 1)
      } else {
        if (res.error !== 'İptal edildi') {
          setDteStatus({
            type: 'error',
            message: `İçe aktarma hatası: ${res.error}`
          })
        }
      }
    } catch (err: any) {
      setDteStatus({
        type: 'error',
        message: err.message || 'İçe aktarım sırasında beklenmedik hata.'
      })
    } finally {
      setDteLoading(false)
    }
  }

  // Database stats state
  const [dbStats, setDbStats] = useState<TableStat[]>([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Auto-Updater States
  const [updaterStatus, setUpdaterStatus] = useState<string>('idle') // idle, checking, available, not-available, downloaded, error
  const [updateVersion, setUpdateVersion] = useState<string>('')
  const [updaterError, setUpdaterError] = useState<string>('')

  useEffect(() => {
    if (!window.electron) return

    const removeListener = window.electron.ipcRenderer.on(
      'updater:status',
      (_, data: { status: string; version?: string; error?: string }) => {
        setUpdaterStatus(data.status)
        if (data.version) setUpdateVersion(data.version)
        if (data.error) setUpdaterError(data.error)
      }
    )

    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  const handleCheckUpdates = async (): Promise<void> => {
    setUpdaterStatus('checking')
    setUpdaterError('')
    try {
      const res = await window.electron.ipcRenderer.invoke('updater:check')
      if (!res.success) {
        setUpdaterStatus('error')
        setUpdaterError(res.error || 'Güncelleme kontrolü başarısız.')
      }
    } catch (err: any) {
      setUpdaterStatus('error')
      setUpdaterError(err.message || 'Hata oluştu.')
    }
  }

  const handleQuitAndInstall = async (): Promise<void> => {
    try {
      await window.electron.ipcRenderer.invoke('updater:quit-and-install')
    } catch (err: any) {
      alert('Güncelleme yüklenirken hata oluştu: ' + err.message)
    }
  }

  // Fetch SQLite stats when workspace changes or database.sqlite is selected
  useEffect(() => {
    if (!window.electron || !activeFilePath) return

    const fetchStats = async (): Promise<void> => {
      setLoadingStats(true)
      setStatsError(null)
      try {
        const tables = [
          {
            name: 'DATA_TeminDosyasi',
            label: 'Doğrudan Temin Dosyaları',
            desc: 'Süreçteki doğrudan temin dosyaları ve ihale teklifleri'
          },
          {
            name: 'TANIM_Birim',
            label: 'Kurum Birimleri',
            desc: 'Bütçe harcaması yapan belediye müdürlükleri/birimleri'
          },
          {
            name: 'TANIM_Personel',
            label: 'Personel Havuzu',
            desc: 'Evraklarda imza yetkilisi olan kurum çalışanları'
          },
          {
            name: 'TANIM_Mevzuat',
            label: 'Mevzuat ve Limitler',
            desc: 'Yıllara göre doğrudan temin bütçe ve KDV limitleri'
          },
          {
            name: 'TANIM_Firma',
            label: 'Kayıtlı Firmalar',
            desc: 'Sistemde kayıtlı tedarikçiler ve firmalar havuzu'
          },
          {
            name: 'TANIM_Kalem',
            label: 'Malzeme/Hizmet Kütüphanesi',
            desc: 'Yaklaşık maliyet kalem kütüphanesi'
          },
          {
            name: 'settings',
            label: 'Sistem Ayarları',
            desc: 'Uygulamanın yerel yapılandırma anahtar-değer çiftleri'
          }
        ]

        const statsPromises = tables.map(async (table) => {
          const res = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT COUNT(*) as row_count FROM ${table.name}`
          )
          if (res.success && res.data && res.data.length > 0) {
            return {
              tableName: table.name,
              label: table.label,
              count: res.data[0].row_count,
              description: table.desc
            }
          }
          return {
            tableName: table.name,
            label: table.label,
            count: 0,
            description: table.desc
          }
        })

        const results = await Promise.all(statsPromises)
        setDbStats(results)
      } catch (err: any) {
        console.error('Veritabanı istatistikleri alınamadı:', err)
        setStatsError(err.message || 'İstatistikler okunamadı.')
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [activeFilePath, refreshTrigger])

  const handleCopyPath = (): void => {
    if (!activeFilePath) return
    navigator.clipboard.writeText(activeFilePath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Helpers
  const getAsamaLabel = (asamaId: number) => {
    switch (asamaId) {
      case 1:
        return '1. İhtiyaç Listesi & Maliyet & Onay'
      case 2:
        return '2. Piyasa Fiyat Araştırması'
      case 3:
        return '3. Sipariş & Sözleşme'
      case 4:
        return '4. Muayene & Kabul & Ödeme İşlemleri'
      case 5:
        return '5. Dosya Kapatıldı'
      default:
        return '1. İhtiyaç Listesi & Maliyet & Onay'
    }
  }

  const formatMoney = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '0,00'
    return val.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Prettified JSON representation of activeMeta
  const rawJson = activeMeta
    ? JSON.stringify(
        {
          dtal_version: activeMeta.dtal_version,
          app_version: activeMeta.app_version,
          created_at: activeMeta.created_at,
          institution: activeMeta.institution,
          schema_version: activeMeta.schema_version
        },
        null,
        2
      )
    : ''

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Üst Başlık Bölümü */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 hover:shadow-sm active:scale-95 transition-all"
            title="Gösterge Paneline Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <FileArchive className="w-7 h-7 text-amber-500" />
              {dosyaData ? dosyaData.konu : 'Aktif Çalışma Dosyası (.dtal)'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
              {dosyaData
                ? `Dosya No: ${dosyaData.temin_no || '-'} | Bütçe Yılı: ${
                    dosyaData.butce_yili || '-'
                  }`
                : 'Uygulamanın veri alışverişi yaptığı arşiv paketinin detayları.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Uyarılar (Varsa) */}
        {activeMeta?.warnings && activeMeta.warnings.length > 0 && (
          <div className="lg:col-span-12 bg-rose-50 dark:bg-rose-955/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm mb-2 animate-in slide-in-from-top-2">
            {activeMeta.warnings.map((warn, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-rose-700 dark:text-rose-455 text-xs font-bold"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{warn}</p>
              </div>
            ))}
          </div>
        )}

        {/* DOSYA ÖZETİ PANELİ (KURUMSAL YAPI TAB GİBİ ÖZET VERİLER) */}
        <div className="lg:col-span-12">
          {loadingDosya ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-xs italic">
              Dosya özeti yükleniyor...
            </div>
          ) : dosyaData ? (
            <div className="space-y-6">
              {/* İstatistik Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-955/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Yaklaşık Maliyet
                    </span>
                    <span className="text-lg font-black text-slate-855 dark:text-slate-100 font-mono">
                      ₺{formatMoney(dosyaData.yaklasik_maliyet)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-955/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Kalem Sayısı
                    </span>
                    <span className="text-lg font-black text-slate-855 dark:text-slate-100 font-mono">
                      {kalemler.length} adet
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-purple-50 dark:bg-purple-955/30 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Teklif Sunan İsteklix
                    </span>
                    <span className="text-lg font-black text-slate-855 dark:text-slate-100 font-mono">
                      {firmalar.length} firma
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-400 rounded-xl">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Dosya Aşaması
                    </span>
                    <span className="text-xs font-extrabold text-slate-855 dark:text-slate-150 truncate block">
                      {getAsamaLabel(dosyaData.durum_asama_id)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detay Panelleri Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sol Taraf: İdari Bilgiler ve Adımlar */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Bilgi Kartı */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-455 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      🏢 İdari Bilgiler & Bütçe
                    </h3>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-slate-550">
                          Talep Eden Birim:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {birimAdi || 'Belirtilmemiş'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-slate-550">Bütçe Yılı:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {dosyaData.butce_yili || 'Belirtilmemiş'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-slate-550">Alım Türü:</span>
                        <span className="font-bold uppercase text-slate-855 dark:text-slate-200">
                          {dosyaData.tur === 'mal'
                            ? 'Mal Alımı'
                            : dosyaData.tur === 'hizmet'
                              ? 'Hizmet Alımı'
                              : 'Yapım İşi'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-slate-550">İhale Usulü:</span>
                        <span
                          className={`font-mono px-2.5 py-0.5 rounded-lg border text-xs font-bold tracking-tight flex items-center gap-1.5 ${
                            (dosyaData.ihale_tipi || '').toLowerCase().includes('açık') ||
                            (dosyaData.ihale_tipi || '').toLowerCase().includes('ihale') ||
                            (dosyaData.ihale_tipi || '').toLowerCase().includes('pazarlık')
                              ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                              : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          {dosyaData.ihale_tipi || 'Doğrudan Temin'}{' '}
                          {dosyaData.ihale_sekli ? `(${dosyaData.ihale_sekli})` : '(22/d)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dosya Notları & Yapılacaklar (To-Do) Widget'ı */}
                  {activeDosyaId && (
                    <DosyaNotlariWidget
                      dosyaId={activeDosyaId}
                      dosyaNo={dosyaData.temin_no}
                    />
                  )}

                  {/* Aşamalar Kısayolu */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-455 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      🚀 Süreç Adımları Kısayolları
                    </h3>
                    <div className="flex flex-col gap-2">
                      <Link
                        to="/dosya/hazirlik-ve-ihtiyac"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 hover:border-blue-300 dark:hover:border-blue-900 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-all font-bold text-xs text-slate-700 dark:text-slate-300 group cursor-pointer"
                      >
                        <span>1. İhtiyaç Listesi & Maliyet & Onay Aşaması</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </Link>
                      <Link
                        to="/dosya/piyasa-fiyat-arastirmasi"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 hover:border-blue-300 dark:hover:border-blue-900 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-all font-bold text-xs text-slate-700 dark:text-slate-300 group cursor-pointer"
                      >
                        <span>2. Piyasa Fiyat Araştırması Aşaması</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </Link>
                      <Link
                        to="/dosya/siparis-ve-sozlesme"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 hover:border-blue-300 dark:hover:border-blue-900 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-all font-bold text-xs text-slate-700 dark:text-slate-300 group cursor-pointer"
                      >
                        <span>3. Sipariş & Sözleşme Aşaması</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </Link>
                      <Link
                        to="/dosya/kabul-ve-odeme"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 hover:border-blue-300 dark:hover:border-blue-900 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-all font-bold text-xs text-slate-700 dark:text-slate-300 group cursor-pointer"
                      >
                        <span>4. Muayene & Kabul & Ödeme Aşaması</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf: Malzeme ve Tedarikçiler Tabloları */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Malzemeler */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-455 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      📦 Malzeme / Hizmet Kalemleri Listesi
                    </h3>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner max-h-[220px] overflow-y-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-655 dark:text-slate-400">
                          <tr>
                            <th className="p-3">Malzeme Adı</th>
                            <th className="p-3 text-center">Miktar</th>
                            <th className="p-3 text-center">Birim</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-450">
                          {kalemler.map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
                            >
                              <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                                {item.kalem_adi}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                {item.miktar}
                              </td>
                              <td className="p-3 text-center text-slate-500 dark:text-slate-400">
                                {item.olcu_birimi || 'Adet'}
                              </td>
                            </tr>
                          ))}
                          {kalemler.length === 0 && (
                            <tr>
                              <td colSpan={3} className="p-6 text-center text-slate-400 italic">
                                Dosyada henüz kayıtlı malzeme/hizmet bulunmuyor.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tedarikçiler */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-455 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      💼 Teklif Veren Tedarikçiler / Firmalar
                    </h3>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner max-h-[220px] overflow-y-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-655 dark:text-slate-400">
                          <tr>
                            <th className="p-3">Firma Ünvanı</th>
                            <th className="p-3 text-center">Teklif Durumu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-450">
                          {firmalar.map((f) => (
                            <tr
                              key={f.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
                            >
                              <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                                {f.unvan}
                              </td>
                              <td className="p-3 text-center">
                                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800 font-extrabold tracking-tight">
                                  Teklif Eklendi
                                </span>
                              </td>
                            </tr>
                          ))}
                          {firmalar.length === 0 && (
                            <tr>
                              <td colSpan={2} className="p-6 text-center text-slate-400 italic">
                                Dosyada henüz kayıtlı firma teklifi bulunmuyor.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center space-y-6">
              <div className="max-w-md mx-auto space-y-2">
                <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl mb-1">
                  <FileArchive className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Aktif Çalışma Dosyası Seçilmedi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lütfen işlem yapmak istediğiniz süreç türünü seçin veya mevcut dosyalardan birini açın.
                </p>
              </div>

              {/* Doğrudan Temin vs Açık İhale Hızlı Seçim Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                {/* 1. Doğrudan Temin Kartı */}
                <div className="p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-200 dark:border-blue-900/60 rounded-2xl flex flex-col justify-between gap-4 hover:border-blue-400 dark:hover:border-blue-700 transition-all shadow-sm group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        4734 Madde 22
                      </span>
                      <FileText className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Doğrudan Temin (22/d, 22/a)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Piyasa fiyat araştırması, yaklaşık maliyet, onay belgesi ve doğrudan alım süreçleri.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-blue-100 dark:border-blue-900/40">
                    <Link
                      to="/dosyalar"
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Dosya Listesi
                    </Link>
                    <Link
                      to="/dosyalar/yeni"
                      className="py-2 px-3 rounded-xl border border-blue-300 dark:border-blue-700 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Yeni
                    </Link>
                  </div>
                </div>

                {/* 2. Açık İhale & Hakediş Kartı */}
                <div className="p-5 bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/10 border border-purple-200 dark:border-purple-900/60 rounded-2xl flex flex-col justify-between gap-4 hover:border-purple-400 dark:hover:border-purple-700 transition-all shadow-sm group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                        4734 Madde 19 / 21 & Hakediş
                      </span>
                      <Gavel className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Açık İhale & Hakediş Yönetimi
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Yapım ve hizmet işleri hakedişleri, pursantaj, fiyat farkı ve ihale sözleşme takibi.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
                    <Link
                      to="/hakedis"
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Hakediş Merkezi
                    </Link>
                    <Link
                      to="/harcama-merkezi"
                      className="py-2 px-3 rounded-xl border border-purple-300 dark:border-purple-700 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <Landmark className="w-3.5 h-3.5" /> Modüller
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AYIRICI VE TEKNİK DETAY AÇ/KAPA */}
        <div className="lg:col-span-12 mt-4 border-t border-slate-200 dark:border-slate-800 pt-6">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400 transition-colors">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">
                  Sistem ve Teknik Detaylar (Yedekleme & SQLite)
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Arşiv yapısı, veritabanı yedeği (DTE) ve sistem güncellemeleri
                </p>
              </div>
            </div>
            {showTechnicalDetails ? (
              <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            )}
          </button>
        </div>

        {showTechnicalDetails && (
          <>
            {/* SOL KOLON: PAKET YAPISI VE İÇERİK GÖRSELLEŞTİRME */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Paket Yapısı Kartı */}
              <PackageStructure
                fileName={fileName || ''}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />

              {/* Veri Alışverişi (.dte) Kartı */}
              <DteTransfer
                dteContentType={dteContentType}
                setDteContentType={setDteContentType}
                handleExportDte={handleExportDte}
                handleImportDte={handleImportDte}
                dteLoading={dteLoading}
                dteStatus={dteStatus}
              />

              {/* Hızlı Bilgi Bilgisi */}
              <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Dosya Değişiklik Davranışı
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium font-sans">
                  Uygulama çalışırken SQLite veritabanında yaptığınız tüm işlemler anlık kaydedilir.
                  Uygulamadan çıkış yaparken veya dosya kapatılırken tüm veriler ve ekler otomatik
                  olarak tekrar sıkıştırılıp tek bir <strong>.dtal</strong> arşiv dosyası olarak
                  paketlenir.
                </p>
              </div>
            </div>

            {/* SAĞ KOLON: SEÇİLEN DOSYANIN INTERAKTIF DETAYI */}
            <SelectedFileInspector
              selectedFile={selectedFile}
              rawJson={rawJson}
              activeMeta={activeMeta}
              loadingStats={loadingStats}
              statsError={statsError}
              dbStats={dbStats}
              activeFilePath={activeFilePath}
              copied={copied}
              handleCopyPath={handleCopyPath}
            />
          </>
        )}
      </div>

      {/* Yol Haritası & Sürüm Notları (Changelog & Backlog) */}
      <ChangelogWidget
        activeHistoryTab={activeHistoryTab}
        setActiveHistoryTab={setActiveHistoryTab}
        changelog={changelog}
        backlog={backlog}
        activeMeta={activeMeta}
      />

      {/* Güncelleme Bölümü */}
      <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
      <UpdaterWidget
        activeMeta={activeMeta}
        updaterStatus={updaterStatus}
        updaterError={updaterError}
        handleCheckUpdates={handleCheckUpdates}
        handleQuitAndInstall={handleQuitAndInstall}
      />
    </div>
  )
}
