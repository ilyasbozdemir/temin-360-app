import React from 'react'
import { useGlobalDocumentPreviewStore } from '../../store/globalDocumentPreviewStore'
import { DocumentPreviewModalV2 } from '../../screens/dosya/components/DocumentPreviewModalV2'

export function GlobalDocumentPreviewHost(): React.JSX.Element | null {
  const { isOpen, documentId, dosyaId, invitedFirms, selectedFirma, closeDocument } =
    useGlobalDocumentPreviewStore()

  if (!isOpen || !documentId) return null

  const firmKey =
    selectedFirma?.id ||
    selectedFirma?.firma_id ||
    selectedFirma?.temin_firma_id ||
    selectedFirma?.unvan ||
    'none'

  return (
    <DocumentPreviewModalV2
      key={`${documentId}-${dosyaId || 'default'}-${firmKey}`}
      isOpen={isOpen}
      documentId={documentId}
      dosyaId={dosyaId}
      invitedFirms={invitedFirms}
      onClose={closeDocument}
      isModal={true}
    />
  )
}
