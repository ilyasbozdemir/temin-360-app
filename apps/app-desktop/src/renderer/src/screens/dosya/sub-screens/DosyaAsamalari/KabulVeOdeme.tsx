import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  PackageSearch,
  TrendingDown,
  Trophy,
  PackageCheck,
  Boxes
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { SubScreen } from '../../SubScreens.screen'
import { isV2Template, normalizeForMatch, useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import { PrintDropdownButton } from '../../components/PrintDropdownButton'
import { useSettingsStore } from '../../../../store/settingsStore'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { APP_ROUTES } from '../../../../constants/routeConstants'
import { TifOlusturModal } from '../../../../components/ui/TifOlusturModal'
import { Button } from '../../../../components/ui/Button'

export function KabulVeOdeme(): React.JSX.Element {
  const {
    activeStarredDocs,
    sablons,
    ciktiLoading,
    masterHtml,
    dosyaContext,
    placeholders,
    contextsByPath,
    personelListesi,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    executePrint,
    executeExportPdf,
    executeExportDocx,
    executeExportUdf,
    quickPrint,
    quickExport,
    quickOpenExternal,
    toggleStar,
    refreshSnapshot,
    saveSnapshot,
    isSablonDisabled
  } = useDosyaAsamasiSablons()

  const { disableDocumentGuidance } = useSettingsStore()
  const { activeDosyaId } = useWorkspaceStore()

  const stageSablons = sablons.filter(
    (s) =>
      s.kategori === '4-kabul-ve-odeme-islemleri' ||
      s.kategori === '4. Muayene & Kabul & Ödeme İşlemleri'
  )

  // Kazanan firma guard state
  const [kazananFirmaId, setKazananFirmaId] = useState<number | null | undefined>(undefined)
  const [kazananFirmaUnvan, setKazananFirmaUnvan] = useState<string>('')

  // İstatistik verileri
  const [firmaStats, setFirmaStats] = useState<{
    teklifToplami: number | null
    yaklasikMaliyet: number | null
    teslimTarihi: string | null
    yasaklilikDurumu: string | null
    vergiNo: string | null
  }>({
    teklifToplami: null,
    yaklasikMaliyet: null,
    teslimTarihi: null,
    yasaklilikDurumu: null,
    vergiNo: null
  })

  // Mock form state for Fatura
  const [faturaNo, setFaturaNo] = useState<string>('')
  const [faturaTarihi, setFaturaTarihi] = useState<string>('')
  const [isTifModalOpen, setIsTifModalOpen] = useState(false)

  useEffect(() => {
    if (!activeDosyaId) return

    const checkKazananFirma = async (): Promise<void> => {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT d.firma_id, f.unvan, f.vergi_no,
                  d.yaklasik_maliyet, d.teslim_tarihi
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

          setFirmaStats({
            teklifToplami,
            yaklasikMaliyet: row.yaklasik_maliyet || null,
            teslimTarihi: row.teslim_tarihi || null,
            yasaklilikDurumu,
            vergiNo: effectiveVergiNo || row.vergi_no || null
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

  return (
    <SubScreen
      title="Muayene & Kabul & Ödeme İşlemleri"
      icon={CreditCard}
      description="Muayene kabul tutanağı, hakediş raporu, taşınır işlem fişi (TİF) ve ödeme emri belgesi gibi evrakları düzenleyebilir, kabul ve ödeme süreçlerinizi tamamlayabilirsiniz."
      previewDocumentId={previewModalOpen && previewData?.dosyaAdi ? previewData.dosyaAdi : null}
      onClosePreview={() => setPreviewModalOpen(false)}
    >
      {kazananFirmaId === undefined && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Kontrol ediliyor...</span>
        </div>
      )}

      {kazananFirmaId === null && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
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
                  Muayene & Kabul & Ödeme belgelerini oluşturabilmek için önce{' '}
                  <strong>Piyasa Fiyat Araştırması</strong> adımında kazanan firmayı belirlemeniz
                  gerekir. Tutanağı kaydederken <em>"En Düşük Teklifi Kazanan Yap"</em> seçeneğini
                  işaretleyin ya da açılan firma listesinden kazananı elle seçin.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-amber-200 dark:border-amber-800/60 pt-4">
              <Link
                to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
                className="flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border-0"
              >
                <PackageSearch className="w-4 h-4" />
                Piyasa Fiyat Araştırması'na Git
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
        </div>
      )}

      {kazananFirmaId && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
            <Button
              onClick={() => setIsTifModalOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs font-bold py-2.5 px-4 rounded-xl shrink-0"
            >
              <PackageCheck className="w-4 h-4" />
              TİF Oluştur &amp; Ambara Aktar
            </Button>
            {stageSablons.length > 0 && (
              <div className="shrink-0 self-start md:self-center">
                <PrintDropdownButton
                  kategori="4-kabul-ve-odeme-islemleri"
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
                  label={disableDocumentGuidance ? 'İşlemler' : 'Belgeleri İncele ve Çıktı Al'}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Firm & Process */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Kazanan Firma Kartı */}
              <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 border border-emerald-300/40 dark:border-emerald-700/40">
                    <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                      Yüklenici Firma
                    </span>
                    <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                      {kazananFirmaUnvan}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Sözleşme / Teklif Tutarı
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      {formatCurrency(firmaStats.teklifToplami)}
                    </span>
                  </div>
                  <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Teslim Tarihi
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      {formatDate(firmaStats.teslimTarihi)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Muayene & Kabul & Ödeme Aşamaları
                </h4>

                <div className="flex flex-col gap-4 relative">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/50 -z-10"></div>

                  {/* 1. Mal/Hizmet Teslimi */}
                  <div className="flex gap-3">
                    {firmaStats.teslimTarihi ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      </div>
                    )}
                    <div>
                      <h5
                        className={`text-xs font-bold ${firmaStats.teslimTarihi ? 'text-slate-800 dark:text-slate-200' : 'text-blue-700 dark:text-blue-400'}`}
                      >
                        1. Mal/Hizmet Teslimi
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {firmaStats.teslimTarihi
                          ? `Teslim Edildi (${new Date(firmaStats.teslimTarihi).toLocaleDateString('tr-TR')})`
                          : 'Tedarikçi teslimatı bekleniyor.'}
                      </p>
                    </div>
                  </div>

                  {/* 2. Muayene & Kabul İşlemi */}
                  <div className="flex gap-3">
                    {!firmaStats.teslimTarihi ? (
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    ) : faturaNo ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      </div>
                    )}
                    <div>
                      <h5
                        className={`text-xs font-bold ${!firmaStats.teslimTarihi ? 'text-slate-500 dark:text-slate-400' : faturaNo ? 'text-slate-800 dark:text-slate-200' : 'text-blue-700 dark:text-blue-400'}`}
                      >
                        2. Muayene & Kabul İşlemi
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {!firmaStats.teslimTarihi
                          ? 'Kabul işlemleri beklemede.'
                          : faturaNo
                            ? 'Kabul Edildi (Komisyon Onaylı)'
                            : 'Komisyon tarafından ürünler inceleniyor.'}
                      </p>
                    </div>
                  </div>

                  {/* 3. TİF & Fatura Kaydı */}
                  <div className="flex gap-3">
                    {!faturaNo ? (
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                    ) : faturaTarihi ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h5
                          className={`text-xs font-bold ${!faturaNo ? 'text-slate-500 dark:text-slate-400' : faturaTarihi ? 'text-slate-800 dark:text-slate-200' : 'text-blue-700 dark:text-blue-400'}`}
                        >
                          3. TİF &amp; Fatura Kaydı
                        </h5>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsTifModalOpen(true)}
                          className="h-6 text-[10px] px-2 gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30"
                        >
                          <PackageCheck className="w-3 h-3" /> TİF Aktar
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {!faturaNo
                          ? 'Kabul sonrası fatura ve taşınır işlemi.'
                          : `Fatura No: ${faturaNo}`}
                      </p>
                    </div>
                  </div>

                  {/* 4. Ödeme Emri Belgesi (ÖEB) */}
                  <div className="flex gap-3">
                    {!faturaTarihi ? (
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      </div>
                    )}
                    <div>
                      <h5
                        className={`text-xs font-bold ${!faturaTarihi ? 'text-slate-500 dark:text-slate-400' : 'text-blue-700 dark:text-blue-400'}`}
                      >
                        4. Ödeme Emri Belgesi (ÖEB)
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {!faturaTarihi
                          ? 'Harcama birimi tarafından ödeme emri düzenlenmesi.'
                          : 'ÖEB MYS sistemine gönderilmeye hazır.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Fatura & Hakediş Mock Form */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                    Önizleme
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-6">
                  <Calculator className="w-4 h-4 text-slate-500" />
                  Fatura & Hakediş (Geliştirme Aşamasında)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Fatura Numarası
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: ABC2026000000123"
                      value={faturaNo}
                      onChange={(e) => setFaturaNo(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Fatura Tarihi
                    </label>
                    <input
                      type="date"
                      value={faturaTarihi}
                      onChange={(e) => setFaturaTarihi(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 mb-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        Hakediş Tutarı (KDV Hariç)
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(firmaStats.teklifToplami)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        KDV (%20)
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency((firmaStats.teklifToplami || 0) * 0.2)}
                      </span>
                    </div>
                    <div className="h-px w-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 dark:text-slate-300 font-bold">
                        Brüt Tutar
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatCurrency((firmaStats.teklifToplami || 0) * 1.2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-red-600 dark:text-red-400 mt-2">
                      <span className="font-medium flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Kesintiler (Damga Vergisi vb.)
                      </span>
                      <span className="font-bold">
                        - {formatCurrency((firmaStats.teklifToplami || 0) * 0.00948)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-0.5">
                      Net Ödenecek Tutar
                    </span>
                    <span className="text-2xl font-black text-blue-900 dark:text-blue-300">
                      {formatCurrency(
                        (firmaStats.teklifToplami || 0) * 1.2 -
                          (firmaStats.teklifToplami || 0) * 0.00948
                      )}
                    </span>
                  </div>
                  <button
                    disabled={!faturaNo || !faturaTarihi}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg ${
                      !faturaNo || !faturaTarihi
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    }`}
                  >
                    ÖEB Oluştur
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* TİF & Ambar Aktarım Modalı */}
      <TifOlusturModal
        isOpen={isTifModalOpen}
        onClose={() => setIsTifModalOpen(false)}
        teminDosyaId={activeDosyaId || 0}
        dosyaNo={dosyaContext?.dosya_no}
        dosyaAdi={dosyaContext?.dosya_adi}
      />
    </SubScreen>
  )
}
