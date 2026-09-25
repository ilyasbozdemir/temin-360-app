import React, { useEffect, useState } from 'react'
import { CreditCard, PackageCheck } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import { PrintDropdownButton } from '../../components/PrintDropdownButton'
import { useSettingsStore } from '../../../../store/settingsStore'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { TifOlusturModal } from '../../../../components/ui/TifOlusturModal'
import { Button } from '../../../../components/ui/Button'
import {
  FirmaStats,
  KabulGuardWarning,
  KabulYukleniciCard,
  KabulAsamalariTimeline,
  KabulFaturaHakedisCard
} from './components/KabulVeOdeme'

export function KabulVeOdeme(): React.JSX.Element {
  const {
    activeStarredDocs,
    sablons,
    ciktiLoading,
    dosyaContext,
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
    (s) =>
      s.kategori === '4-kabul-ve-odeme-islemleri' ||
      s.kategori === '4. Muayene & Kabul & Ödeme İşlemleri'
  )

  // Kazanan firma guard state
  const [kazananFirmaId, setKazananFirmaId] = useState<number | null | undefined>(undefined)
  const [kazananFirmaUnvan, setKazananFirmaUnvan] = useState<string>('')

  // İstatistik verileri
  const [firmaStats, setFirmaStats] = useState<FirmaStats>({
    teklifToplami: null,
    yaklasikMaliyet: null,
    teslimTarihi: null,
    yasaklilikDurumu: null,
    vergiNo: null
  })

  // Fatura & Hakediş state
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

      {kazananFirmaId === null && <KabulGuardWarning />}

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
              <KabulYukleniciCard
                kazananFirmaUnvan={kazananFirmaUnvan}
                firmaStats={firmaStats}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />

              <KabulAsamalariTimeline
                firmaStats={firmaStats}
                faturaNo={faturaNo}
                faturaTarihi={faturaTarihi}
                onOpenTifModal={() => setIsTifModalOpen(true)}
              />
            </div>

            {/* Right Column: Fatura & Hakediş Form */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <KabulFaturaHakedisCard
                firmaStats={firmaStats}
                faturaNo={faturaNo}
                faturaTarihi={faturaTarihi}
                onFaturaNoChange={setFaturaNo}
                onFaturaTarihiChange={setFaturaTarihi}
                formatCurrency={formatCurrency}
              />
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
