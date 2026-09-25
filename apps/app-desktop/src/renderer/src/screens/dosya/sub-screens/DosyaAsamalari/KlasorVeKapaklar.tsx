import React, { useState } from 'react'
import { FolderTree } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import {
  KlasorStatusHeader,
  KlasorChecklistCard,
  KlasorArsivKonumCard,
  KlasorKapakCiktiCard,
  ChecklistItem
} from './components/KlasorVeKapaklar'

export function KlasorVeKapaklar(): React.JSX.Element {
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

  const stageSablons = sablons.filter(
    (s) => s.kategori === '5-klasor-ve-kapaklar' || s.kategori === '5. Klasör & Kapaklar'
  )

  // --- MOCK STATES FOR DASHBOARD ---
  const [isDosyaClosed, setIsDosyaClosed] = useState(false)
  const [arsivLokasyon, setArsivLokasyon] = useState('')
  const [klasorNo, setKlasorNo] = useState('')
  const [rafNo, setRafNo] = useState('')

  // Simulated global settings for Archive Locations
  const globalArsivLokasyonlari = [
    'Muhasebe Arşivi 1. Dolap',
    'Muhasebe Arşivi 2. Dolap',
    'Satınalma Arşivi',
    'Bodrum Kat Genel Arşiv',
    'Müdüriyet Odası'
  ]

  const globalBelgeler = [
    { id: 'g1', label: 'İhtiyaç Belgesi / Talep Yazısı' },
    { id: 'g2', label: 'Harcama Talimatı / Onay Belgesi' },
    { id: 'g3', label: 'Yaklaşık Maliyet Cetveli' },
    { id: 'g4', label: 'Piyasa Fiyat Araştırması Görevlendirme Oluru' },
    { id: 'g5', label: 'Piyasa Fiyat Araştırma Tutanağı' },
    { id: 'g6', label: 'Firma Teklif Mektupları (Kaşeli/İmzalı)' },
    { id: 'g7', label: 'Sözleşme / Sipariş Formu' },
    { id: 'g8', label: 'Muayene ve Kabul Komisyonu Oluru' },
    { id: 'g9', label: 'Muayene Kabul Tutanağı' },
    { id: 'g10', label: 'Taşınır İşlem Fişi (TİF)' },
    { id: 'g11', label: 'Fatura Aslı' },
    { id: 'g12', label: 'Vergi Borcu Yoktur Yazısı' },
    { id: 'g13', label: 'SGK Borcu Yoktur Yazısı' },
    { id: 'g14', label: 'Ödeme Emri Belgesi (ÖEB) ve Ekleri' }
  ]

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Onay Belgesi', checked: true },
    { id: '2', label: 'Yaklaşık Maliyet Cetveli', checked: true },
    { id: '3', label: 'Piyasa Fiyat Araştırma Tutanağı', checked: true },
    {
      id: '4',
      label: 'Firma Teklif Mektupları (Kaşeli/İmzalı)',
      checked: false
    },
    { id: '5', label: 'Sözleşme / Sipariş Formu', checked: false }
  ])

  const handleToggleChecklist = (id: string): void => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    )
  }

  const handleRemoveItem = (id: string): void => {
    setChecklist(checklist.filter((c) => c.id !== id))
  }

  const handleAddFromGlobal = (globalItem: { id: string; label: string }): void => {
    if (!checklist.some((c) => c.label === globalItem.label)) {
      setChecklist((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          label: globalItem.label,
          checked: false
        }
      ])
    }
  }

  const handleAddCustomItem = (text: string): void => {
    if (!text.trim()) return
    setChecklist((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: text.trim(),
        checked: false
      }
    ])
  }

  const handleMoveUp = (index: number): void => {
    if (index === 0) return
    const newList = [...checklist]
    const temp = newList[index - 1]
    newList[index - 1] = newList[index]
    newList[index] = temp
    setChecklist(newList)
  }

  const handleMoveDown = (index: number): void => {
    if (index === checklist.length - 1) return
    const newList = [...checklist]
    const temp = newList[index + 1]
    newList[index + 1] = newList[index]
    newList[index] = temp
    setChecklist(newList)
  }

  return (
    <SubScreen
      title="Klasör & Kapaklar"
      icon={FolderTree}
      description="İhale kapağı, kapak içi indeks şablonu ve fiziksel arşiv dosyalarınızı hazırlayabilirsiniz. Süreci tamamlayıp dosyayı kapatabilirsiniz."
      previewDocumentId={previewModalOpen && previewData?.dosyaAdi ? previewData.dosyaAdi : null}
      onClosePreview={() => setPreviewModalOpen(false)}
    >
      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
        {/* TOP STATUS BAR */}
        <KlasorStatusHeader
          isDosyaClosed={isDosyaClosed}
          onToggleDosyaClosed={() => setIsDosyaClosed(!isDosyaClosed)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Checklist */}
          <div className="flex flex-col gap-6">
            <KlasorChecklistCard
              checklist={checklist}
              isDosyaClosed={isDosyaClosed}
              onToggleChecklist={handleToggleChecklist}
              onRemoveItem={handleRemoveItem}
              onAddFromGlobal={handleAddFromGlobal}
              onAddCustomItem={handleAddCustomItem}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              globalBelgeler={globalBelgeler}
            />
          </div>

          {/* RIGHT COLUMN: Physical Location & Covers */}
          <div className="flex flex-col gap-6">
            <KlasorArsivKonumCard
              isDosyaClosed={isDosyaClosed}
              arsivLokasyon={arsivLokasyon}
              klasorNo={klasorNo}
              rafNo={rafNo}
              globalArsivLokasyonlari={globalArsivLokasyonlari}
              onArsivLokasyonChange={setArsivLokasyon}
              onKlasorNoChange={setKlasorNo}
              onRafNoChange={setRafNo}
            />

            <KlasorKapakCiktiCard
              stageSablons={stageSablons}
              sablons={sablons}
              activeStarredDocs={activeStarredDocs}
              ciktiLoading={ciktiLoading}
              handleOpenPreviewForSablon={handleOpenPreviewForSablon}
              quickPrint={quickPrint}
              quickExport={quickExport}
              quickOpenExternal={quickOpenExternal}
              isSablonDisabled={isSablonDisabled}
            />
          </div>
        </div>
      </div>
    </SubScreen>
  )
}
