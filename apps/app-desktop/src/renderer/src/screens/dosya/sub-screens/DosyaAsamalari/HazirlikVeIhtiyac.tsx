import React from 'react'
import { FileText, Package } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { SubScreen } from '../../SubScreens.screen'
import { isV2Template, normalizeForMatch } from './useDosyaAsamasiSablons'
import { useDosyaAsamasiSablonsV2 } from './useDosyaAsamasiSablonsV2'
import { useMalzemeListesi } from '../components/MalzemeListesi/useMalzemeListesi'
import { MalzemeEkleModal } from '../components/MalzemeListesi/MalzemeEkleModal'
import { MalzemeTablosu } from '../components/MalzemeListesi/MalzemeTablosu'

export function HazirlikVeIhtiyac(): React.JSX.Element {
  const {
    activeDosyaId,
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
    isSablonDisabled,
    activeDosya
  } = useDosyaAsamasiSablonsV2()

  const state = useMalzemeListesi(activeDosyaId, activeDosya)

  const isYapim =
    activeDosya?.tur === 'yapim_isi' ||
    activeDosya?.tur === 'yapim' ||
    activeDosya?.ihale_tipi === 'Hakediş'
  const isHizmet = activeDosya?.tur === 'hizmet'

  const stageSablons = sablons
    .filter(
      (s) =>
        s.kategori === '1-ihtiyac-tespiti-ve-baslangic' ||
        s.kategori === '1. İhtiyaç Tespiti & Başlangıç' ||
        s.dosya_adi === 'dogrudan-temin-onay-belgesi.html' ||
        s.dosya_adi === 'komisyon-gorevlendirme-onayi.html' ||
        s.dosya_adi === 'piyasa-fiyat-arastirma-gorevlendirmesi.html'
    )
    .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'))

  const dagitimSablons = sablons
    .filter(
      (s) =>
        s.dosya_adi === 'birim-fiyat-teklif-mektubu.html' ||
        s.dosya_adi === 'fiyat-arastirma-mektubu.html' ||
        s.dosya_adi === 'teklif-mektubu-dagitim-cizelgesi.html' ||
        s.dosya_adi === 'dagitim-cizelgesi-karma.html'
    )
    .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'))

  const isStarred = previewData?.title
    ? activeStarredDocs.some(
        (d) => normalizeForMatch(d) === normalizeForMatch(previewData.title || '')
      )
    : false

  const isV2 = isV2Template(previewData?.dosyaAdi)

  return (
    <SubScreen
      title={
        isYapim
          ? 'İmalat / Poz Listesi & Maliyet & Onay'
          : isHizmet
            ? 'Hizmet Listesi & Maliyet & Onay'
            : 'İhtiyaç Listesi & Maliyet & Onay'
      }
      icon={Package}
      description={
        isYapim
          ? 'Dosyanıza ait inşaat, tesisat ve onarım imalat kalemlerini (Bakanlık/ÇŞB Poz No) ekleyebilir, yaklaşık maliyet ve onay süreçlerini yönetebilirsiniz.'
          : isHizmet
            ? 'Dosyanıza ait hizmet kalemlerini ve faaliyet kapsamını ekleyebilir, piyasa fiyat araştırması ve onay süreçlerini yönetebilirsiniz.'
            : 'Dosyanıza malzeme ve tüketim kalemi ekleyebilir ve yönetebilirsiniz. Son Alım Fiyat Cetveli şablonu sayesinde geçmiş alım analiz verileri otomatik listelenir.'
      }
      previewDocumentId={previewModalOpen && previewData?.dosyaAdi ? previewData.dosyaAdi : null}
      onClosePreview={() => setPreviewModalOpen(false)}
    >
      <MalzemeEkleModal state={state} activeDosya={activeDosya} />

      <MalzemeTablosu
        state={state}
        stageSablons={stageSablons}
        dagitimSablons={dagitimSablons}
        sablons={sablons}
        onSablonClick={handleOpenPreviewForSablon}
        ciktiLoading={ciktiLoading}
        activeStarredDocs={activeStarredDocs}
        onQuickPrint={quickPrint}
        onExport={quickExport}
        onOpenExternal={quickOpenExternal}
        isSablonDisabled={isSablonDisabled}
        activeDosya={activeDosya}
        activeDosyaId={activeDosyaId}
      />
    </SubScreen>
  )
}
