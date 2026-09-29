import React, { useEffect, useState } from 'react'
import { CreditCard, PackageCheck, Users } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import { PrintDropdownButton } from '../../components/PrintDropdownButton'
import { useSettingsStore } from '../../../../store/settingsStore'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { TifOlusturModal } from '../../../../components/ui/TifOlusturModal'
import { Button } from '../../../../components/ui/Button'
import { KomisyonAtamaModal } from '../components/MalzemeListesi/components/KomisyonAtamaModal'
import {
  FirmaStats,
  KomisyonUye,
  KabulGuardWarning,
  KabulYukleniciCard,
  KabulAsamalariTimeline,
  KabulFaturaHakedisCard,
  KabulTutanaklariListCard
} from './components/KabulVeOdeme'

// In-memory cache for instant step switching without loading spinners
interface KabulDataCacheEntry {
  kazananFirmaId: number | null
  kazananFirmaUnvan: string
  komisyonBaskani: string
  komisyonUyeleri: KomisyonUye[]
  teslimYeri: string
  firmaStats: FirmaStats
  faturaNo: string
  faturaTarihi: string
}
const kabulDataCache = new Map<number, KabulDataCacheEntry>()

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

  // Cached or optimistic initial state
  const cached = activeDosyaId ? kabulDataCache.get(activeDosyaId) : undefined
  const optimisticFirmaId =
    cached?.kazananFirmaId ??
    (dosyaContext?.kazanan_firma_id ||
      dosyaContext?.firma_id ||
      (dosyaContext?.enAvantajliTeklifSahibi ? 1 : undefined))

  const optimisticUnvan =
    cached?.kazananFirmaUnvan ||
    dosyaContext?.enAvantajliTeklifSahibi ||
    dosyaContext?.kazanan_firma ||
    dosyaContext?.firma_unvani ||
    ''

  const [kazananFirmaId, setKazananFirmaId] = useState<number | null | undefined>(optimisticFirmaId)
  const [kazananFirmaUnvan, setKazananFirmaUnvan] = useState<string>(optimisticUnvan)
  const [komisyonBaskani, setKomisyonBaskani] = useState<string>(cached?.komisyonBaskani || '')
  const [komisyonUyeleri, setKomisyonUyeleri] = useState<KomisyonUye[]>(cached?.komisyonUyeleri || [])
  const [teslimYeri, setTeslimYeri] = useState<string>(
    cached?.teslimYeri || dosyaContext?.ihtiyac_yeri || ''
  )

  // İstatistik verileri
  const [firmaStats, setFirmaStats] = useState<FirmaStats>(
    cached?.firmaStats || {
      teklifToplami: dosyaContext?.enAvantajliTeklifBedeli ? Number(dosyaContext.enAvantajliTeklifBedeli) : null,
      yaklasikMaliyet: dosyaContext?.yaklasikMaliyet ? Number(dosyaContext.yaklasikMaliyet) : null,
      teslimTarihi: null,
      yasaklilikDurumu: null,
      vergiNo: null,
      alimTuru: (dosyaContext?.alimTuru || 'mal') as 'mal' | 'hizmet' | 'yapim'
    }
  )

  // Fatura & Hakediş state
  const [faturaNo, setFaturaNo] = useState<string>(cached?.faturaNo || '')
  const [faturaTarihi, setFaturaTarihi] = useState<string>(cached?.faturaTarihi || '')
  const [isTifModalOpen, setIsTifModalOpen] = useState(false)
  const [isKomisyonModalOpen, setIsKomisyonModalOpen] = useState(false)

  const alimTuru = (firmaStats.alimTuru || 'mal').toLowerCase()
  const isMal = alimTuru === 'mal'
  const isHizmet = alimTuru === 'hizmet'

  const allStageSablons = sablons.filter(
    (s) =>
      s.kategori === '4-kabul-ve-odeme-islemleri' ||
      s.kategori === '4. Muayene & Kabul & Ödeme İşlemleri'
  )

  // Otomatik filtreleme (Dosyanın alım türüne göre)
  const stageSablons = allStageSablons.filter((s) => {
    const key = String(s.dosya_adi || s.id || '').toLowerCase()
    if (isHizmet) {
      return (
        !key.includes('muayene-kabul-tutanagi') &&
        !key.includes('muayene-kabul-komisyonu') &&
        !key.includes('tasinir-islem-fisi')
      )
    } else {
      return (
        !key.includes('hizmet-isleri') &&
        !key.includes('hakedis-raporu') &&
        !key.includes('puantaj')
      )
    }
  })

  const handleQuickPreview = (sablonKey: string): void => {
    const found =
      sablons.find(
        (s) =>
          String(s.dosya_adi || s.id || '').toLowerCase() === sablonKey.toLowerCase() ||
          String(s.dosya_adi || s.id || '').toLowerCase().includes(sablonKey.toLowerCase())
      ) || ({ dosya_adi: sablonKey, ad: sablonKey } as any)
    handleOpenPreviewForSablon(found, (found as any).ad || sablonKey)
  }

  // Paralel ve arka plan veri tazeleyici (Stale-While-Revalidate)
  useEffect(() => {
    if (!activeDosyaId) return

    let isMounted = true

    const checkKazananFirma = async (): Promise<void> => {
      try {
        const [dosyaRes, komRes] = await Promise.all([
          window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT d.firma_id, f.unvan, f.vergi_no,
                    d.yaklasik_maliyet, d.teslim_tarihi,
                    d.fiyat_farki_dayanagi, COALESCE(d.tur, 'mal') as alim_turu,
                    d.dosya_acilis_tarihi, d.temin_tarihi, d.tarih,
                    d.ihtiyac_yeri
             FROM DATA_TeminDosyasi d
             LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
             WHERE d.id = ?`,
            [activeDosyaId]
          ),
          window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT id, ad_soyad, unvan, gorev, komisyon_turu, asli_yedek FROM DATA_TeminKomisyon
             WHERE temin_dosya_id = ?
             ORDER BY (CASE WHEN LOWER(COALESCE(gorev, '')) LIKE '%başkan%' OR LOWER(COALESCE(gorev, '')) LIKE '%baskan%' THEN 0 ELSE 1 END) ASC, id ASC`,
            [activeDosyaId]
          )
        ])

        if (!isMounted) return

        if (dosyaRes.success && dosyaRes.data && dosyaRes.data.length > 0) {
          const row = dosyaRes.data[0]
          let effectiveFirmaId = row.firma_id || null
          let effectiveUnvan = row.unvan || ''
          let effectiveVergiNo = row.vergi_no || null

          if (effectiveFirmaId && !effectiveUnvan) {
            try {
              const tfCheck = await window.electron.ipcRenderer.invoke(
                'db:query',
                `SELECT COALESCE(NULLIF(tf.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
                        COALESCE(NULLIF(tf.vergi_no, ''), NULLIF(f.vergi_no, '')) as vergi_no
                 FROM DATA_TeminFirma tf
                 LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id
                 WHERE tf.temin_dosya_id = ? AND (tf.firma_id = ? OR tf.id = ?)
                 LIMIT 1`,
                [activeDosyaId, effectiveFirmaId, effectiveFirmaId]
              )
              if (tfCheck.success && tfCheck.data?.length > 0) {
                effectiveUnvan = tfCheck.data[0].unvan || ''
                effectiveVergiNo = tfCheck.data[0].vergi_no || effectiveVergiNo
              }
            } catch (err) {
              console.warn('Failed to check DATA_TeminFirma fallback unvan:', err)
            }
          }

          if (!effectiveFirmaId || !effectiveUnvan) {
            const autoLowestRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              `SELECT tf.firma_id, tf.id as temin_firma_id,
                      COALESCE(NULLIF(tf.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
                      COALESCE(NULLIF(tf.vergi_no, ''), NULLIF(f.vergi_no, '')) as vergi_no,
                      COALESCE(
                        NULLIF(tf.teklif_toplami, 0),
                        (SELECT SUM(kt.birim_fiyat * k.miktar)
                         FROM DATA_TeminKalemTeklif kt
                         JOIN DATA_TeminKalem k ON kt.temin_kalem_id = k.id
                         WHERE kt.temin_firma_id = tf.id AND kt.temin_dosya_id = ?)
                      ) as effective_teklif,
                      tf.yasaklilik_durumu
               FROM DATA_TeminFirma tf
               LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id
               WHERE tf.temin_dosya_id = ? AND (COALESCE(tf.aktif_mi, 1) = 1 OR tf.aktif_mi = '1' OR tf.aktif_mi = 'true')
               ORDER BY (CASE WHEN tf.kazanan_mi = 1 THEN 0 ELSE 1 END),
                        CASE WHEN effective_teklif > 0 THEN effective_teklif ELSE 999999999 END ASC
               LIMIT 1`,
              [activeDosyaId, activeDosyaId]
            )
            if (autoLowestRes.success && autoLowestRes.data?.length > 0) {
              const lowest = autoLowestRes.data[0]
              effectiveFirmaId = lowest.firma_id || lowest.temin_firma_id
              effectiveUnvan = lowest.unvan || 'İstekli Firma'
              effectiveVergiNo = lowest.vergi_no || null
              window.electron.ipcRenderer.invoke(
                'db:run',
                'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
                [effectiveFirmaId, activeDosyaId]
              )
              window.electron.ipcRenderer.invoke(
                'db:run',
                'UPDATE DATA_TeminFirma SET kazanan_mi = (CASE WHEN firma_id = ? OR id = ? THEN 1 ELSE 0 END) WHERE temin_dosya_id = ?',
                [effectiveFirmaId, effectiveFirmaId, activeDosyaId]
              )
            }
          }

          let teklifToplami: number | null = null
          let yasaklilikDurumu: string | null = null
          if (effectiveFirmaId) {
            const teklifRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              `SELECT tf.teklif_toplami, tf.yasaklilik_durumu,
                      (SELECT SUM(kt.birim_fiyat * k.miktar)
                       FROM DATA_TeminKalemTeklif kt
                       JOIN DATA_TeminKalem k ON kt.temin_kalem_id = k.id
                       WHERE kt.temin_firma_id = tf.id AND kt.temin_dosya_id = ?) as calculated_teklif
                FROM DATA_TeminFirma tf
                WHERE tf.temin_dosya_id = ? AND (tf.firma_id = ? OR tf.id = ?)`,
              [activeDosyaId, activeDosyaId, effectiveFirmaId, effectiveFirmaId]
            )
            if (teklifRes.success && teklifRes.data?.length > 0) {
              teklifToplami = teklifRes.data[0].teklif_toplami || teklifRes.data[0].calculated_teklif || null
              yasaklilikDurumu = teklifRes.data[0].yasaklilik_durumu
            }
          }

          let fetchedKomUyeleri: KomisyonUye[] = []
          let fetchedBaskan = ''
          if (komRes.success && Array.isArray(komRes.data)) {
            fetchedKomUyeleri = komRes.data
            const baskan = (komRes.data as KomisyonUye[]).find(
              (k) =>
                k.gorev?.toLowerCase().includes('başkan') ||
                k.gorev?.toLowerCase().includes('baskan')
            )
            fetchedBaskan = baskan ? baskan.ad_soyad : komRes.data[0]?.ad_soyad || ''
          }

          const nextStats: FirmaStats = {
            teklifToplami,
            yaklasikMaliyet: row.yaklasik_maliyet || null,
            teslimTarihi: row.teslim_tarihi || null,
            yasaklilikDurumu,
            vergiNo: effectiveVergiNo || row.vergi_no || null,
            fiyatFarkiDayanagi: row.fiyat_farki_dayanagi || null,
            alimTuru: row.alim_turu || null,
            dosyaTarihi: row.temin_tarihi || row.dosya_acilis_tarihi || row.tarih || null
          }

          setKazananFirmaId(effectiveFirmaId)
          setKazananFirmaUnvan(effectiveUnvan)
          setTeslimYeri(row.ihtiyac_yeri || '')
          setKomisyonUyeleri(fetchedKomUyeleri)
          setKomisyonBaskani(fetchedBaskan)
          setFirmaStats(nextStats)

          // Save to instant memory cache
          kabulDataCache.set(activeDosyaId, {
            kazananFirmaId: effectiveFirmaId,
            kazananFirmaUnvan: effectiveUnvan,
            komisyonBaskani: fetchedBaskan,
            komisyonUyeleri: fetchedKomUyeleri,
            teslimYeri: row.ihtiyac_yeri || '',
            firmaStats: nextStats,
            faturaNo,
            faturaTarihi
          })
        } else {
          setKazananFirmaId(null)
        }
      } catch {
        if (isMounted) setKazananFirmaId(null)
      }
    }

    checkKazananFirma()

    return () => {
      isMounted = false
    }
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
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={() => setIsKomisyonModalOpen(true)}
                variant="outline"
                className="gap-2 border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold py-2.5 px-3.5 rounded-xl shrink-0"
              >
                <Users className="w-4 h-4" />
                Muayene &amp; Kabul Komisyonu
              </Button>

              {isMal && (
                <Button
                  onClick={() => setIsTifModalOpen(true)}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs font-bold py-2.5 px-4 rounded-xl shrink-0"
                >
                  <PackageCheck className="w-4 h-4" />
                  TİF Oluştur &amp; Ambara Aktar
                </Button>
              )}

            </div>

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
                  variant={disableDocumentGuidance ? 'dark' : 'default'}
                  label={disableDocumentGuidance ? 'Belge İşlemleri' : 'Belgeleri İncele ve Çıktı Al'}
                />
              </div>
            )}
          </div>

          {/* Kabul Tutanakları List & Operations Card */}
          <KabulTutanaklariListCard
            kazananFirmaUnvan={kazananFirmaUnvan}
            firmaStats={firmaStats}
            faturaNo={faturaNo}
            faturaTarihi={faturaTarihi}
            komisyonBaskani={komisyonBaskani}
            komisyonUyeleri={komisyonUyeleri}
            teslimYeri={teslimYeri}
            dosyaNo={dosyaContext?.dosya_no}
            alimTuru={alimTuru}
            onOpenPreview={handleQuickPreview}
            onOpenTifModal={() => setIsTifModalOpen(true)}
            onOpenKomisyonModal={() => setIsKomisyonModalOpen(true)}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />

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
                alimTuru={alimTuru}
                onOpenTifModal={() => setIsTifModalOpen(true)}
                onOpenKomisyonModal={() => setIsKomisyonModalOpen(true)}
                onOpenPreview={handleQuickPreview}
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

      {/* Muayene ve Kabul Komisyonu Atama Modalı */}
      <KomisyonAtamaModal
        isOpen={isKomisyonModalOpen}
        onClose={async () => {
          setIsKomisyonModalOpen(false)
          if (!activeDosyaId) return
          try {
            const allKomRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              `SELECT id, ad_soyad, unvan, gorev, komisyon_turu, asli_yedek FROM DATA_TeminKomisyon
               WHERE temin_dosya_id = ?
               ORDER BY (CASE WHEN LOWER(COALESCE(gorev, '')) LIKE '%başkan%' OR LOWER(COALESCE(gorev, '')) LIKE '%baskan%' THEN 0 ELSE 1 END) ASC, id ASC`,
              [activeDosyaId]
            )
            if (allKomRes.success && Array.isArray(allKomRes.data)) {
              setKomisyonUyeleri(allKomRes.data)
              const baskan = allKomRes.data.find(
                (k: any) =>
                  k.gorev?.toLowerCase().includes('başkan') || k.gorev?.toLowerCase().includes('baskan')
              )
              setKomisyonBaskani(baskan ? baskan.ad_soyad : allKomRes.data[0]?.ad_soyad || '')
            }
          } catch (e) {
            console.error('Failed to reload komisyon:', e)
          }
        }}
        initialType="muayene_kabul"
        activeDosyaId={activeDosyaId}
        onOpenDocument={(doc) => handleQuickPreview(doc)}
      />
    </SubScreen>
  )
}

