import React from 'react'
import DocumentPreviewModalV2 from '../DocumentPreviewModalV2'

/**
 * @deprecated Mülga: Eski HTML/String tabanlı v1 şablon motoru mülga edilmiş ve tamamen kaldırılmıştır.
 * Bu bileşen geriye dönük uyumluluk sağlamak adına DocumentPreviewModalV2 native TSX motoruna yönlendirir.
 */
export function DocumentPreviewModal(props: any): React.JSX.Element | null {
  const documentId = props.documentId || (props.dosyaAdi ? props.dosyaAdi.replace('.html', '') : '')

  return (
    <DocumentPreviewModalV2
      isOpen={props.isOpen}
      documentId={documentId}
      dosyaId={props.dosyaId}
      invitedFirms={props.invitedFirms}
      onClose={props.onClose}
      isModal={props.isModal !== false}
    />
  )
}

export default DocumentPreviewModal
