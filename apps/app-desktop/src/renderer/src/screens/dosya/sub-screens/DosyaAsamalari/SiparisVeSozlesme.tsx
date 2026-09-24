import React, { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  FileCheck,
  HelpCircle,
  Info,
  PackageSearch,
  Percent,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Trophy
} from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { SubScreen } from '../../SubScreens.screen'
import { normalizeForMatch, useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import { PrintDropdownButton } from '../../components/PrintDropdownButton'
import { useSettingsStore } from '../../../../store/settingsStore'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { useGlobalDocumentPreviewStore } from '../../../../store/globalDocumentPreviewStore'
import { APP_ROUTES } from '../../../../constants/routeConstants'
import { WinnerDocumentsMenu } from './components/WinnerDocumentsMenu'
import { documentPreloadService } from '../../../../services/documentPreloadService'

export function SiparisVeSozlesme(): React.JSX.Element {
  const {
    activeStarredDocs,
    sablons,
    ciktiLoading,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    quickPrint,
    quickExport,
    quickOpenExternal,
    isSablonDisabled
  } = useDosyaAsamasiSablons()

  const { disableDocumentGuidance } = useSettingsStore()
  const { activeDosyaId } = useWorkspaceStore()

  const stageSablons = sablons.filter(
    (s) => s.kategori === '3-siparis-ve-sozlesme' || s.kategori === '3. Sipariş & Sözleşme'
  )

  // Kazanan firma guard state
  const [kazananFirmaId, setKazananFirmaId] = useState<number | null | undefined>(undefined) // undefined = yükleniyor
  const [kazananFirmaUnvan, setKazananFirmaUnvan] = useState<string>('')

  // İstatistik verileri
  const [firmaStats, setFirmaStats] = useState<{
    teklifToplami: number | null
    yaklasikMaliyet: number | null
    teslimTarihi: string | null
    yasaklilikDurumu: string | null
    vergiNo: string | null
    teklifSozlesmeTuru: string | null
    sozlesmeYapilacakMi: number
    istekliFirmaSayisi: number
  }>({
    teklifToplami: null,
    yaklasikMaliyet: null,
    teslimTarihi: null,
    yasaklilikDurumu: null,
    vergiNo: null,
    teklifSozlesmeTuru: null,
    sozlesmeYapilacakMi: 0,
    istekliFirmaSayisi: 0
  })

  const [islemlerData, setIslemlerData] = useState({
    sozlesmeYapilacakMi: false,
    siparisFormuGerekli: true,
    teslimGunu: 10,
    teslimTarihi: '',
    teklifSozlesmeTuru: 'Mal Alımı'
  })

  const [savedFeedback, setSavedFeedback] = useState(false)
  const [showDeliveryTooltip, setShowDeliveryTooltip] = useState(false)

  useEffect(() => {
    if (!activeDosyaId) return

    const checkKazananFirma = async (): Promise<void> => {
      try {
        // Ana dosya + firma bilgisi
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT d.firma_id, f.unvan, f.vergi_no,
                  d.yaklasik_maliyet, d.teslim_tarihi, d.teslim_gun,
                  d.teklif_sozlesme_turu, d.sozlesme_yapilacak_mi
           FROM DATA_TeminDosyasi d
           LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
           WHERE d.id = ?`,
          [activeDosyaId]
        )

        if (res.success && res.data && res.data.length > 0) {
          const row = res.data[0]
          let effectiveFirmaId = row.firma_id || null
          let effectiveUnvan = row.unvan || ''
          let effectiveVergiNo = row.vergi_no || null

          // Fiyatlar girilmişse ve henüz manuel kazanan seçilmemişse, en düşük teklif veren firmayı otomatik kazanan yap
          if (!effectiveFirmaId) {
            const autoLowestRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              `SELECT tf.firma_id, f.unvan, f.vergi_no, tf.teklif_toplami, tf.yasaklilik_durumu
               FROM DATA_TeminFirma tf
               JOIN TANIM_Firma f ON tf.firma_id = f.id
               WHERE tf.temin_dosya_id = ? AND tf.teklif_toplami > 0
               ORDER BY tf.teklif_toplami ASC LIMIT 1`,
              [activeDosyaId]
            )
            if (autoLowestRes.success && autoLowestRes.data?.length > 0) {
              const lowest = autoLowestRes.data[0]
              effectiveFirmaId = lowest.firma_id
              effectiveUnvan = lowest.unvan
              effectiveVergiNo = lowest.vergi_no
              await window.electron.ipcRenderer.invoke(
                'db:run',
                'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
                [lowest.firma_id, activeDosyaId]
              )
            }
          }

          setKazananFirmaId(effectiveFirmaId)
          setKazananFirmaUnvan(effectiveUnvan)

          // Kazanan firmanın teklif toplamı ve yasaklılık durumu
          let teklifToplami: number | null = null
          let yasaklilikDurumu: string | null = null
          if (effectiveFirmaId) {
            const teklifRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              `SELECT tf.teklif_toplami, tf.yasaklilik_durumu
               FROM DATA_TeminFirma tf
               WHERE tf.temin_dosya_id = ? AND tf.firma_id = ?`,
              [activeDosyaId, effectiveFirmaId]
            )
            if (teklifRes.success && teklifRes.data?.length > 0) {
              teklifToplami = teklifRes.data[0].teklif_toplami
              yasaklilikDurumu = teklifRes.data[0].yasaklilik_durumu
            }
          }

          // İstekli firma sayısı
          const firmCountRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT COUNT(*) as cnt FROM DATA_TeminFirma WHERE temin_dosya_id = ?`,
            [activeDosyaId]
          )
          const istekliFirmaSayisi =
            firmCountRes.success && firmCountRes.data?.length > 0 ? firmCountRes.data[0].cnt : 0

          // Gün sayısı hesaplama (eğer teslim günü veya tarihi varsa)
          let calculatedDays =
            row.teslim_gun !== undefined && row.teslim_gun !== null && Number(row.teslim_gun) > 0
              ? Number(row.teslim_gun)
              : 10
          if ((row.teslim_gun === undefined || row.teslim_gun === null) && row.teslim_tarihi) {
            const tDate = new Date(row.teslim_tarihi)
            const today = new Date()
            const diffTime = tDate.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            if (diffDays > 0 && diffDays < 365) {
              calculatedDays = diffDays
            }
          }

          setFirmaStats({
            teklifToplami,
            yaklasikMaliyet: row.yaklasik_maliyet || null,
            teslimTarihi: row.teslim_tarihi || null,
            yasaklilikDurumu,
            vergiNo: effectiveVergiNo || row.vergi_no || null,
            teklifSozlesmeTuru: row.teklif_sozlesme_turu || 'Mal Alımı',
            sozlesmeYapilacakMi: row.sozlesme_yapilacak_mi || 0,
            istekliFirmaSayisi
          })

          setIslemlerData({
            sozlesmeYapilacakMi: row.sozlesme_yapilacak_mi === 1,
            siparisFormuGerekli: true,
            teslimGunu: calculatedDays,
            teslimTarihi: row.teslim_tarihi || '',
            teklifSozlesmeTuru: row.teklif_sozlesme_turu || 'Mal Alımı'
          })
        } else {
          setKazananFirmaId(null)
        }
      } catch {
        setKazananFirmaId(null)
      }
    }

    checkKazananFirma()
  }, [activeDosyaId])

  // Hesaplamalar
  const tasarrufOrani =
    firmaStats.yaklasikMaliyet && firmaStats.teklifToplami
      ? ((firmaStats.yaklasikMaliyet - firmaStats.teklifToplami) / firmaStats.yaklasikMaliyet) * 100
      : null

  const formatCurrency = (val: number | null): string => {
    if (val === null || val === undefined) return '—'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(val)
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(d)
    } catch {
      return dateStr
    }
  }

  // Teslim gününü ve tarihini otomatik güncelleme
  const handleUpdateTeslimGunu = async (gun: number): Promise<void> => {
    if (!activeDosyaId) return
    const d = new Date()
    d.setDate(d.getDate() + gun)
    const dateStr = d.toISOString().split('T')[0]

    setIslemlerData((prev) => ({
      ...prev,
      teslimGunu: gun,
      teslimTarihi: dateStr
    }))
    setFirmaStats((prev) => ({ ...prev, teslimTarihi: dateStr }))

    try {
      await window.electron.ipcRenderer.invoke(
        'db:query',
        `UPDATE DATA_TeminDosyasi SET teslim_tarihi = ?, teslim_gun = ? WHERE id = ?`,
        [dateStr, gun, activeDosyaId]
      )
      documentPreloadService.invalidateCache(activeDosyaId)
      window.dispatchEvent(
        new CustomEvent('dossier:updated', { detail: { dosyaId: activeDosyaId } })
      )
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 2000)
    } catch (err) {
      console.error('Teslim süresi güncellenirken hata:', err)
    }
  }

  // Özel teslim tarihi seçildiğinde
  const handleUpdateTeslimTarihi = async (dateStr: string): Promise<void> => {
    if (!activeDosyaId) return
    let gun = islemlerData.teslimGunu
    if (dateStr) {
      const tDate = new Date(dateStr)
      const today = new Date()
      const diffTime = tDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 0) gun = diffDays
    }

    setIslemlerData((prev) => ({
      ...prev,
      teslimGunu: gun,
      teslimTarihi: dateStr
    }))
    setFirmaStats((prev) => ({ ...prev, teslimTarihi: dateStr }))

    try {
      await window.electron.ipcRenderer.invoke(
        'db:query',
        `UPDATE DATA_TeminDosyasi SET teslim_tarihi = ?, teslim_gun = ? WHERE id = ?`,
        [dateStr, gun, activeDosyaId]
      )
      documentPreloadService.invalidateCache(activeDosyaId)
      window.dispatchEvent(
        new CustomEvent('dossier:updated', { detail: { dosyaId: activeDosyaId } })
      )
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 2000)
    } catch (err) {
      console.error('Teslim tarihi kaydedilirken hata:', err)
    }
  }

  // Sözleşme yapılma tercihini değiştirme
  const handleToggleSozlesme = async (): Promise<void> => {
    if (!activeDosyaId) return
    const newStatus = firmaStats.sozlesmeYapilacakMi ? 0 : 1
    setFirmaStats((prev) => ({ ...prev, sozlesmeYapilacakMi: newStatus }))
    setIslemlerData((prev) => ({
      ...prev,
      sozlesmeYapilacakMi: newStatus === 1
    }))

    try {
      await window.electron.ipcRenderer.invoke(
        'db:query',
        `UPDATE DATA_TeminDosyasi SET sozlesme_yapilacak_mi = ? WHERE id = ?`,
        [newStatus, activeDosyaId]
      )
      documentPreloadService.invalidateCache(activeDosyaId)
      window.dispatchEvent(
        new CustomEvent('dossier:updated', { detail: { dosyaId: activeDosyaId } })
      )
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 2000)
    } catch (err) {
      console.error('Sözleşme durumu güncellenirken hata:', err)
    }
  }

  return (
    <SubScreen
      title="Sipariş & Sözleşme"
      icon={FileCheck}
      description="Doğrudan temin onay belgesi, ihale komisyon kararı ve sözleşmeye davet gibi dökümanları hazırlayabilir, doğrudan temin sözleşme süreçlerinizi bu panelden yönetebilirsiniz."
      previewDocumentId={previewModalOpen && previewData?.dosyaAdi ? previewData.dosyaAdi : null}
      onClosePreview={() => setPreviewModalOpen(false)}
    >
      {/* Yükleniyor durumu */}
      {kazananFirmaId === undefined && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Kontrol ediliyor...</span>
        </div>
      )}

      {/* Kazanan firma YOK → Guard uyarısı */}
      {kazananFirmaId === null && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Uyarı Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-300/50 dark:border-amber-700/40">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-300">
                  Kazanan Firma Belirlenmedi
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed max-w-xl">
                  Sipariş &amp; Sözleşme belgelerini oluşturabilmek için önce{' '}
                  <strong>Piyasa Fiyat Araştırması</strong> adımında kazanan firmayı belirlemeniz
                  gerekir. Tutanağı kaydederken <em>&ldquo;En Düşük Teklifi Kazanan Yap&rdquo;</em>{' '}
                  seçeneğini işaretleyin ya da açılan firma listesinden kazananı elle seçin.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-amber-200 dark:border-amber-800/60 pt-4">
              <Link
                to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
                className="flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border-0"
              >
                <PackageSearch className="w-4 h-4" />
                Piyasa Fiyat Araştırması&apos;na Git
              </Link>
              <Link
                to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
                className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </Link>
            </div>
          </div>

          {/* Adım akışı bilgi kartı */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Süreç Adımları
            </h4>
            <ol className="flex flex-col gap-2">
              {[
                { step: '1', label: 'Hazırlık & İhtiyaç', done: true },
                {
                  step: '2',
                  label: 'Piyasa Fiyat Araştırması — Kazanan firma belirle',
                  done: false,
                  current: true
                },
                { step: '3', label: 'Sipariş & Sözleşme', done: false },
                {
                  step: '4',
                  label: 'Muayene & Kabul & Ödeme İşlemleri',
                  done: false
                },
                { step: '5', label: 'Klasör & Kapaklar', done: false }
              ].map((item) => (
                <li
                  key={item.step}
                  className={`flex items-center gap-3 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                    item.current
                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                      : item.done
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      item.current
                        ? 'bg-amber-500 text-white'
                        : item.done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.step}
                  </span>
                  {item.label}
                  {item.current && (
                    <span className="ml-auto text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Bekliyor
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Kazanan firma VAR → Normal içerik */}
      {kazananFirmaId && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* ═══ Kazanan Firma Bilgi Kartı (Genişletilmiş) ═══ */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 shadow-sm">
            {/* Üst: Firma adı + badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 border border-emerald-300/40 dark:border-emerald-700/40">
                  <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                    Kazanan / Yüklenici Firma
                  </span>
                  <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                    {kazananFirmaUnvan || 'Seçili Firma'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Yasaklılık durumu badge */}
                {firmaStats.yasaklilikDurumu && (
                  <span
                    className={cn(
                      'px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1',
                      firmaStats.yasaklilikDurumu === 'Temiz' &&
                        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
                      firmaStats.yasaklilikDurumu === 'Yasaklı' &&
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',
                      firmaStats.yasaklilikDurumu === 'Sorgulanmadı' &&
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    )}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {firmaStats.yasaklilikDurumu}
                  </span>
                )}
                {firmaStats.vergiNo && (
                  <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
                    VKN: {firmaStats.vergiNo}
                  </span>
                )}
              </div>
            </div>

            {/* Alt: İstatistik kartları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Teklif Tutarı */}
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Teklif Tutarı
                  </span>
                </div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatCurrency(firmaStats.teklifToplami)}
                </span>
              </div>

              {/* Yaklaşık Maliyet */}
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Yaklaşık Maliyet
                  </span>
                </div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatCurrency(firmaStats.yaklasikMaliyet)}
                </span>
              </div>

              {/* Tasarruf Oranı */}
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-violet-100 dark:border-violet-900/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Percent className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tasarruf
                  </span>
                </div>
                <span
                  className={cn(
                    'text-sm font-extrabold',
                    tasarrufOrani !== null && tasarrufOrani >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400',
                    tasarrufOrani === null && 'text-slate-400'
                  )}
                >
                  {tasarrufOrani !== null ? `%${tasarrufOrani.toFixed(1)}` : '—'}
                </span>
              </div>

              {/* Teslim Süresi & Tarihi */}
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-amber-100 dark:border-amber-900/30 relative group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Teslim Süresi
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDeliveryTooltip(!showDeliveryTooltip)}
                      onMouseEnter={() => setShowDeliveryTooltip(true)}
                      onMouseLeave={() => setShowDeliveryTooltip(false)}
                      className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-0.5 rounded cursor-pointer"
                      title="Teslim Süresi Bilgisi"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    {showDeliveryTooltip && (
                      <div className="absolute right-0 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-30 border border-slate-700 leading-snug animate-in fade-in zoom-in-95 duration-150">
                        <div className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-amber-400" /> Belge Hükmü:
                        </div>
                        Kabul Edilen Teklif ve Sipariş mektubu belgelerinde{' '}
                        <strong className="text-amber-200">
                          &ldquo;Siparişin tebliğinden itibaren {islemlerData.teslimGunu} gün içinde
                          teslim edilecektir&rdquo;
                        </strong>{' '}
                        hükmü geçerlidir.
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                    {islemlerData.teslimGunu ? `${islemlerData.teslimGunu} Gün` : 'Belirlenmedi'}
                  </span>
                  {firmaStats.teslimTarihi && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({formatDate(firmaStats.teslimTarihi)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Alt bilgi çubuğu */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/30">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {firmaStats.istekliFirmaSayisi} istekli firma
              </span>
              {firmaStats.teklifSozlesmeTuru && (
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  📋 {firmaStats.teklifSozlesmeTuru}
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                📝 Sözleşme: {firmaStats.sozlesmeYapilacakMi ? 'Yapılacak' : 'Yapılmayacak'}
              </span>
            </div>
          </div>

          {/* ═══ İşlemler & Parametreler Kartı ═══ */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-4">
            {/* Başlık & Kaydedildi Bildirimi */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    İşlem Parametreleri & Teslimat Süresi
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Kabul edilen teklif mektubu, sipariş yazısı ve sözleşme şartlarını buradan
                    belirleyin.
                  </p>
                </div>
              </div>

              {savedFeedback && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in duration-200">
                  <Check className="w-3.5 h-3.5" />
                  Kaydedildi & Belgelere Yansıtıldı
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 1. Teslim Süresi Seçimi */}
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-gradient-to-br from-slate-50/90 to-amber-50/30 dark:from-slate-850 dark:to-amber-950/10 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Teslim Süresi (Takvim Günü)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Şablon ve sipariş mektubu teslimat hükmü
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 text-white rounded-xl shadow-xs text-xs font-extrabold tracking-wide">
                    <span>{islemlerData.teslimGunu} Gün</span>
                  </div>
                </div>

                {/* Hızlı Gün Butonları (Gruplu & Zengin Görünüm) */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Mevzuata Uygun Hazır Süreler</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {islemlerData.teslimTarihi ? formatDate(islemlerData.teslimTarihi) : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {[
                      { gun: 3, label: '3 Gün', sub: 'Acil Alım' },
                      {
                        gun: 7,
                        label: '7 Gün',
                        sub: 'Standart DT',
                        highlight: true
                      },
                      {
                        gun: 10,
                        label: '10 Gün',
                        sub: 'Yasal Davet',
                        highlight: true
                      },
                      { gun: 15, label: '15 Gün', sub: 'Mal/Hizmet' },
                      { gun: 20, label: '20 Gün', sub: 'Teslimat' },
                      { gun: 30, label: '30 Gün', sub: '1 Ay' },
                      { gun: 45, label: '45 Gün', sub: '1.5 Ay' },
                      { gun: 60, label: '60 Gün', sub: '2 Ay (Yapım)' },
                      { gun: 90, label: '90 Gün', sub: '3 Ay' }
                    ].map(({ gun, label, sub, highlight }) => {
                      const isSelected = islemlerData.teslimGunu === gun
                      return (
                        <button
                          key={gun}
                          type="button"
                          onClick={() => handleUpdateTeslimGunu(gun)}
                          className={cn(
                            'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95',
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 font-bold scale-[1.02]'
                              : highlight
                                ? 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                          )}
                        >
                          <span className="text-xs font-extrabold leading-tight">{label}</span>
                          <span
                            className={cn(
                              'text-[9px] leading-tight mt-0.5',
                              isSelected ? 'text-amber-100' : 'text-slate-400 dark:text-slate-500'
                            )}
                          >
                            {sub}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Özel Gün Stepper & Tarih Seçici */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Özel Gün Sayısı:
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateTeslimGunu(Math.max(1, (islemlerData.teslimGunu || 1) - 1))
                        }
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-l-lg text-slate-700 dark:text-slate-200 font-bold text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={islemlerData.teslimGunu}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          if (!isNaN(val) && val > 0) {
                            handleUpdateTeslimGunu(val)
                          }
                        }}
                        className="w-full px-2 py-1.5 text-center text-xs bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateTeslimGunu((islemlerData.teslimGunu || 0) + 1)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-700 dark:text-slate-200 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Teslimat / Bitiş Tarihi:
                    </label>
                    <input
                      type="date"
                      value={islemlerData.teslimTarihi || ''}
                      onChange={(e) => handleUpdateTeslimTarihi(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Dosya Sözleşme & Süreç Bilgisi (Dosyadan Gelen Bilgi) */}
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-gradient-to-br from-slate-50/90 to-blue-50/30 dark:from-slate-850 dark:to-blue-950/10 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Sözleşme & Süreç Türü
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Dosya başlangıç parametreleri
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Dosyadan Alındı
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div
                    onClick={handleToggleSozlesme}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1 shadow-2xs cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
                    title="Sözleşme durumunu değiştirmek için tıklayın"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Sözleşme Durumu
                      </span>
                      <span className="text-[9px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        Değiştir ↺
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-extrabold flex items-center gap-1.5',
                        firmaStats.sozlesmeYapilacakMi
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {firmaStats.sozlesmeYapilacakMi
                        ? '✓ Sözleşme Yapılacak'
                        : '✕ Sözleşme Yapılmayacak'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Alım & Süreç Türü
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      {firmaStats.teklifSozlesmeTuru || 'Mal Alımı'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-auto">
                  {firmaStats.sozlesmeYapilacakMi
                    ? '✓ Sözleşme yapılması seçilmiştir. Aşağıdaki menüden veya butonlardan Sözleşmeye Davet ve Sözleşme şablonlarını hazırlayabilirsiniz.'
                    : 'ℹ Doğrudan temin alımlarında sözleşme yapılması zorunlu değildir. Kabul edilen teklif mektubu ve sipariş formu yeterlidir.'}
                </div>
              </div>
            </div>

            {/* Belge Teslim Hükmü Canlı Önizleme Kutusu */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/25 border border-amber-200/90 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 text-xs shadow-xs">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-extrabold">📌 Şablon Hükmü Canlı Önizleme:</strong> Kabul
                edilen teklif mektubunda otomatik basılacak metin:{' '}
                <span className="italic font-medium text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/60 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/40 ml-1 inline-block">
                  &ldquo;Malı/Hizmeti/İşi{' '}
                  <strong className="text-amber-700 dark:text-amber-400 font-extrabold">
                    {islemlerData.teslimGunu} gün
                  </strong>{' '}
                  içinde mesai saatleri dahilinde teslim etmenizi rica ederiz.&rdquo;
                </span>
              </div>
            </div>
          </div>

          {/* ═══ Ana İçerik Kartı ═══ */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Aşama Belgeleri ve İşlem Adımları
                </h4>
                <p className="text-[11px] text-slate-400">
                  Bu aşamada oluşturulabilecek kararlar, tebligatlar ve sözleşme belgeleri
                </p>
              </div>

              <div className="flex items-center gap-2 relative">
                <WinnerDocumentsMenu
                  sozlesmeYapilacakMi={Boolean(firmaStats.sozlesmeYapilacakMi)}
                  onPrintResultApproval={() => {
                    const s = stageSablons.find(
                      (sb) =>
                        normalizeForMatch(sb.dosya_adi + sb.ad).includes('sonuconay') ||
                        normalizeForMatch(sb.dosya_adi + sb.ad).includes('onaybelgesi')
                    )
                    if (s) {
                      handleOpenPreviewForSablon(s, s.ad)
                    } else {
                      useGlobalDocumentPreviewStore.getState().openDocument({
                        documentId: 'dogrudan-temin-sonuc-onay-belgesi',
                        dosyaId: activeDosyaId || undefined,
                        documentTitle: 'Doğrudan Temin Sonuç Onay Belgesi'
                      })
                    }
                  }}
                  onPrintAcceptanceLetter={() => {
                    const s = stageSablons.find(
                      (sb) =>
                        normalizeForMatch(sb.dosya_adi + sb.ad).includes('kabulyazisi') ||
                        normalizeForMatch(sb.dosya_adi + sb.ad).includes('kabuledilenteklif') ||
                        normalizeForMatch(sb.dosya_adi + sb.ad).includes('kabul')
                    )
                    if (s) {
                      handleOpenPreviewForSablon(s, s.ad)
                    } else {
                      useGlobalDocumentPreviewStore.getState().openDocument({
                        documentId: 'kabul-edilen-teklif',
                        dosyaId: activeDosyaId || undefined,
                        documentTitle: 'Kabul Edilen Teklif Mektubu'
                      })
                    }
                  }}
                  onPrintOrderForm={() => {
                    const s = stageSablons.find(
                      (sb) =>
                        normalizeForMatch(sb.dosya_adi + sb.ad).includes('siparisformu') ||
                        normalizeForMatch(sb.dosya_adi + sb.ad).includes('siparis')
                    )
                    if (s) {
                      handleOpenPreviewForSablon(s, s.ad)
                    } else {
                      useGlobalDocumentPreviewStore.getState().openDocument({
                        documentId: 'kabul-edilen-teklif',
                        dosyaId: activeDosyaId || undefined,
                        documentTitle: 'Sipariş Formu'
                      })
                    }
                  }}
                  onPrintContractInvitation={() => {
                    const s = stageSablons.find(
                      (sb) =>
                        normalizeForMatch(sb.dosya_adi + sb.ad).includes('davet') ||
                        normalizeForMatch(sb.dosya_adi + sb.ad).includes('sozlesmedavet')
                    )
                    if (s) {
                      handleOpenPreviewForSablon(s, s.ad)
                    } else {
                      useGlobalDocumentPreviewStore.getState().openDocument({
                        documentId: 'sozlesmeye-davet',
                        dosyaId: activeDosyaId || undefined,
                        documentTitle: 'Sözleşmeye Davet Mektubu'
                      })
                    }
                  }}
                  onPrintContract={() => {
                    const s = stageSablons.find(
                      (sb) =>
                        normalizeForMatch(sb.dosya_adi + sb.ad) === 'dogrudanteminsozlesmesi' ||
                        normalizeForMatch(sb.dosya_adi + sb.ad) === 'sozlesme' ||
                        (normalizeForMatch(sb.dosya_adi + sb.ad).includes('sozlesme') &&
                          !normalizeForMatch(sb.dosya_adi + sb.ad).includes('alternatif') &&
                          !normalizeForMatch(sb.dosya_adi + sb.ad).includes('uzun') &&
                          !normalizeForMatch(sb.dosya_adi + sb.ad).includes('davet'))
                    )
                    if (s) {
                      handleOpenPreviewForSablon(s, s.ad)
                    } else {
                      useGlobalDocumentPreviewStore.getState().openDocument({
                        documentId: 'dogrudan-temin-sozlesmesi',
                        dosyaId: activeDosyaId || undefined,
                        documentTitle: 'Doğrudan Temin Sözleşmesi'
                      })
                    }
                  }}
                  onPrintContractAlternative={() => {
                    const s = stageSablons.find((sb) =>
                      normalizeForMatch(sb.dosya_adi + sb.ad).includes('alternatif')
                    )
                    if (s) {
                      handleOpenPreviewForSablon(s, s.ad)
                    } else {
                      useGlobalDocumentPreviewStore.getState().openDocument({
                        documentId: 'dogrudan-temin-sozlesmesi-alternatif',
                        dosyaId: activeDosyaId || undefined,
                        documentTitle: 'Doğrudan Temin Sözleşmesi (Alternatif)'
                      })
                    }
                  }}
                  onPrintContractLong={() => {
                    const s = stageSablons.find((sb) =>
                      normalizeForMatch(sb.dosya_adi + sb.ad).includes('uzun')
                    )
                    if (s) {
                      handleOpenPreviewForSablon(s, s.ad)
                    } else {
                      useGlobalDocumentPreviewStore.getState().openDocument({
                        documentId: 'dogrudan-temin-sozlesmesi-uzun',
                        dosyaId: activeDosyaId || undefined,
                        documentTitle: 'Doğrudan Temin Sözleşmesi (Uzun Form)'
                      })
                    }
                  }}
                  onEkapBlacklistQuery={() => {
                    window.electron?.ipcRenderer.send('window:open-external', {
                      url: 'https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama',
                      title: 'EKAP Kamu İhale Yasaklı Sorgulama'
                    })
                  }}
                  onEdevletBlacklistQuery={() => {
                    window.electron?.ipcRenderer.send('window:open-external', {
                      url: 'https://www.turkiye.gov.tr/kik-yasakli-sorgula',
                      title: 'e-Devlet KİK Yasaklılık Sorgulama'
                    })
                  }}
                />

                {stageSablons.length > 0 && (
                  <div>
                    <PrintDropdownButton
                      kategori="3-siparis-ve-sozlesme"
                      sablons={sablons}
                      overrideSablons={stageSablons}
                      activeStarredDocs={activeStarredDocs}
                      ciktiLoading={ciktiLoading}
                      handleOpenPreviewForSablon={handleOpenPreviewForSablon}
                      quickPrint={quickPrint}
                      quickExport={quickExport}
                      quickOpenExternal={quickOpenExternal}
                      isSablonDisabled={isSablonDisabled}
                      buttonHeightClass="h-10"
                      label={disableDocumentGuidance ? 'İşlemler' : 'Belgeleri Yazdır'}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ═══ Süreç Adımları Timeline ═══ */}
            <div className="flex flex-col gap-0">
              {[
                {
                  icon: FileCheck,
                  label: 'Sonuç Onay Belgesi',
                  desc: 'Piyasa fiyat araştırması sonuç onay belgesini hazırlayın',
                  color: 'emerald' as const,
                  actions: [
                    {
                      text: 'Belgeyi Aç / Düzenle',
                      onClick: () => {
                        const s = stageSablons.find(
                          (sb) =>
                            normalizeForMatch(sb.dosya_adi + sb.ad).includes('sonuconay') ||
                            normalizeForMatch(sb.dosya_adi + sb.ad).includes('onaybelgesi')
                        )
                        if (s) handleOpenPreviewForSablon(s, s.ad)
                        else {
                          useGlobalDocumentPreviewStore.getState().openDocument({
                            documentId: 'dogrudan-temin-sonuc-onay-belgesi',
                            dosyaId: activeDosyaId || undefined,
                            documentTitle: 'Doğrudan Temin Sonuç Onay Belgesi'
                          })
                        }
                      }
                    }
                  ]
                },
                {
                  icon: ShieldCheck,
                  label: 'Yasaklılık Sorgulaması',
                  desc: 'Kazanan firmanın EKAP ve e-Devlet yasaklılık kontrolünü yapın',
                  color: 'orange' as const,
                  actions: [
                    {
                      text: "EKAP'ta Sorgula",
                      onClick: () => {
                        window.electron?.ipcRenderer.send('window:open-external', {
                          url: 'https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama',
                          title: 'EKAP Kamu İhale Yasaklı Sorgulama'
                        })
                      }
                    },
                    {
                      text: 'e-Devlet KİK Sorgula',
                      onClick: () => {
                        window.electron?.ipcRenderer.send('window:open-external', {
                          url: 'https://www.turkiye.gov.tr/kik-yasakli-sorgula',
                          title: 'e-Devlet KİK Yasaklılık Sorgulama'
                        })
                      }
                    }
                  ]
                },
                {
                  icon: Building2,
                  label: 'Kabul Yazısı / Sipariş Formu',
                  desc: 'Kazanan firmaya sonucun tebliğ edilmesi ve sipariş yazısının iletilmesi',
                  color: 'blue' as const,
                  actions: [
                    {
                      text: 'Kabul Edilen Teklif Mektubu',
                      onClick: () => {
                        const s = stageSablons.find(
                          (sb) =>
                            normalizeForMatch(sb.dosya_adi + sb.ad).includes('kabuledilenteklif') ||
                            normalizeForMatch(sb.dosya_adi + sb.ad).includes('kabulyazisi')
                        )
                        if (s) handleOpenPreviewForSablon(s, s.ad)
                        else {
                          useGlobalDocumentPreviewStore.getState().openDocument({
                            documentId: 'kabul-edilen-teklif',
                            dosyaId: activeDosyaId || undefined,
                            documentTitle: 'Kabul Edilen Teklif Mektubu'
                          })
                        }
                      }
                    }
                  ]
                },
                {
                  icon: Clock,
                  label: 'Sözleşmeye Davet Mektubu',
                  desc: firmaStats.sozlesmeYapilacakMi
                    ? 'Firmayı sözleşme imzalamaya davet edin (Yasal 10 gün süre tanınır)'
                    : 'Sözleşme yapılmayacaksa bu adım zorunlu değildir, doğrudan sipariş ile teslimat başlatılabilir',
                  color: 'violet' as const,
                  highlight: Boolean(firmaStats.sozlesmeYapilacakMi),
                  actions: [
                    {
                      text: 'Sözleşmeye Davet Mektubu Aç',
                      onClick: () => {
                        const s = stageSablons.find((sb) =>
                          normalizeForMatch(sb.dosya_adi + sb.ad).includes('davet')
                        )
                        if (s) handleOpenPreviewForSablon(s, s.ad)
                        else {
                          useGlobalDocumentPreviewStore.getState().openDocument({
                            documentId: 'sozlesmeye-davet',
                            dosyaId: activeDosyaId || undefined,
                            documentTitle: 'Sözleşmeye Davet Mektubu'
                          })
                        }
                      }
                    }
                  ]
                },
                {
                  icon: CheckCircle2,
                  label: 'Doğrudan Temin Sözleşmesi',
                  desc: firmaStats.sozlesmeYapilacakMi
                    ? 'Doğrudan temin sözleşmesini (Standart, Alternatif veya Uzun Form) hazırlayın ve imzalayın'
                    : 'Sözleşme yapılmayacak olarak ayarlanmıştır (İstenirse hazırlanabilir)',
                  color: 'cyan' as const,
                  highlight: Boolean(firmaStats.sozlesmeYapilacakMi),
                  actions: [
                    {
                      text: 'Standart Sözleşme',
                      onClick: () => {
                        const s = stageSablons.find(
                          (sb) =>
                            normalizeForMatch(sb.dosya_adi + sb.ad) === 'dogrudanteminsozlesmesi' ||
                            normalizeForMatch(sb.dosya_adi + sb.ad) === 'sozlesme'
                        )
                        if (s) handleOpenPreviewForSablon(s, s.ad)
                        else {
                          useGlobalDocumentPreviewStore.getState().openDocument({
                            documentId: 'dogrudan-temin-sozlesmesi',
                            dosyaId: activeDosyaId || undefined,
                            documentTitle: 'Doğrudan Temin Sözleşmesi'
                          })
                        }
                      }
                    },
                    {
                      text: 'Alternatif Sözleşme',
                      onClick: () => {
                        const s = stageSablons.find((sb) =>
                          normalizeForMatch(sb.dosya_adi + sb.ad).includes('alternatif')
                        )
                        if (s) handleOpenPreviewForSablon(s, s.ad)
                        else {
                          useGlobalDocumentPreviewStore.getState().openDocument({
                            documentId: 'dogrudan-temin-sozlesmesi-alternatif',
                            dosyaId: activeDosyaId || undefined,
                            documentTitle: 'Doğrudan Temin Sözleşmesi (Alternatif)'
                          })
                        }
                      }
                    },
                    {
                      text: 'Uzun Form',
                      onClick: () => {
                        const s = stageSablons.find((sb) =>
                          normalizeForMatch(sb.dosya_adi + sb.ad).includes('uzun')
                        )
                        if (s) handleOpenPreviewForSablon(s, s.ad)
                        else {
                          useGlobalDocumentPreviewStore.getState().openDocument({
                            documentId: 'dogrudan-temin-sozlesmesi-uzun',
                            dosyaId: activeDosyaId || undefined,
                            documentTitle: 'Doğrudan Temin Sözleşmesi (Uzun Form)'
                          })
                        }
                      }
                    }
                  ]
                }
              ].map((step, index, arr) => {
                const colorClasses = {
                  emerald: {
                    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
                    border: 'border-emerald-300 dark:border-emerald-700',
                    text: 'text-emerald-600 dark:text-emerald-400',
                    line: 'bg-emerald-200 dark:bg-emerald-800'
                  },
                  orange: {
                    bg: 'bg-orange-100 dark:bg-orange-900/30',
                    border: 'border-orange-300 dark:border-orange-700',
                    text: 'text-orange-600 dark:text-orange-400',
                    line: 'bg-orange-200 dark:bg-orange-800'
                  },
                  blue: {
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    border: 'border-blue-300 dark:border-blue-700',
                    text: 'text-blue-600 dark:text-blue-400',
                    line: 'bg-blue-200 dark:bg-blue-800'
                  },
                  violet: {
                    bg: 'bg-violet-100 dark:bg-violet-900/30',
                    border: 'border-violet-300 dark:border-violet-700',
                    text: 'text-violet-600 dark:text-violet-400',
                    line: 'bg-violet-200 dark:bg-violet-800'
                  },
                  cyan: {
                    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
                    border: 'border-cyan-300 dark:border-cyan-700',
                    text: 'text-cyan-600 dark:text-cyan-400',
                    line: 'bg-cyan-200 dark:bg-cyan-800'
                  }
                }
                const c = colorClasses[step.color]
                const StepIcon = step.icon
                const isLast = index === arr.length - 1

                return (
                  <div key={step.label} className="flex gap-3">
                    {/* Timeline çizgisi */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border',
                          c.bg,
                          c.border
                        )}
                      >
                        <StepIcon className={cn('w-4 h-4', c.text)} />
                      </div>
                      {!isLast && (
                        <div className={cn('w-0.5 flex-1 min-h-6 my-1 rounded-full', c.line)} />
                      )}
                    </div>
                    {/* İçerik */}
                    <div className={cn('pb-5 flex-1', isLast && 'pb-0')}>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {step.label}
                          {step.highlight && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Dosyada Belirlendi
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>

                      {/* Hızlı Aksiyon Butonları */}
                      {step.actions && step.actions.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {step.actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={act.onClick}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                            >
                              {act.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </SubScreen>
  )
}
