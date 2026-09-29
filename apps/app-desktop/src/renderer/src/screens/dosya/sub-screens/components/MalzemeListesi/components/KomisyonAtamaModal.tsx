import React from 'react'
import { Modal } from '../../../../../../components/ui/Modal'
import {
  KomisyonAtamaFooter,
  KomisyonAtamaTable,
  KomisyonAtamaTabs,
  KomisyonSyncToggle,
  KurumInfoBar,
  useKomisyonAtama
} from './komisyon-atama'
import type { KomisyonAtamaModalProps, KomisyonType } from './komisyon-atama/types'

export type { KomisyonAtamaModalProps, KomisyonType }

export const KomisyonAtamaModal: React.FC<KomisyonAtamaModalProps> = ({
  isOpen,
  onClose,
  initialType = 'yaklasik_maliyet',
  activeDosyaId,
  onOpenDocument
}) => {
  const {
    activeTab,
    setActiveTab,
    personeller,
    kurumInfo,
    currentRows,
    loading,
    saving,
    saveSuccess,
    syncToGlobalCommission,
    setSyncToGlobalCommission,
    handlePersonelChange,
    handleGorevChange,
    handleToggleBelgedeGoster,
    handleAddRow,
    handleRemoveRow,
    handleSyncFromKomisyonYonetimi,
    handleSave,
    handleOpenDoc
  } = useKomisyonAtama({
    isOpen,
    onClose,
    initialType,
    activeDosyaId,
    onOpenDocument
  })

  const modalFooter = (
    <KomisyonAtamaFooter
      activeTab={activeTab}
      loading={loading}
      saving={saving}
      saveSuccess={saveSuccess}
      onOpenDoc={handleOpenDoc}
      onSyncFromKomisyonYonetimi={handleSyncFromKomisyonYonetimi}
      onSave={() => handleSave(activeTab)}
    />
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Komisyon ve Görevli Atama"
      description="Bu dosyaya ve belgelere ait komisyon üyelerini, görevlerini ve onay makamlarını belirleyin."
      className="max-w-5xl max-h-[90vh]"
      footer={modalFooter}
    >
      <div className="space-y-3.5">
        <KurumInfoBar kurumInfo={kurumInfo} />

        <KomisyonAtamaTabs activeTab={activeTab} onSelectTab={setActiveTab} />

        <KomisyonSyncToggle
          checked={syncToGlobalCommission}
          onChange={setSyncToGlobalCommission}
        />

        <KomisyonAtamaTable
          rows={currentRows}
          personeller={personeller}
          onPersonelChange={handlePersonelChange}
          onGorevChange={handleGorevChange}
          onToggleBelgedeGoster={handleToggleBelgedeGoster}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
        />
      </div>
    </Modal>
  )
}
