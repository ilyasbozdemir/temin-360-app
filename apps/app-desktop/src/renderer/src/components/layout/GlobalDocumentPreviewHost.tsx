import React from "react";
import { useGlobalDocumentPreviewStore } from "../../store/globalDocumentPreviewStore";
import { DocumentPreviewModalV2 } from "../../screens/dosya/components/DocumentPreviewModalV2";

export const GlobalDocumentPreviewHost: React.FC = () => {
  const {
    isOpen,
    documentId,
    dosyaId,
    invitedFirms,
    selectedFirma,
    closeDocument,
  } = useGlobalDocumentPreviewStore();

  if (!isOpen || !documentId) return null;

  const firmKey = selectedFirma?.id || selectedFirma?.firma_id ||
    selectedFirma?.temin_firma_id || selectedFirma?.unvan || "none";

  console.log(
    "firmKey",
    firmKey,
    "documentId",
    documentId,
    "dosyaId",
    dosyaId,
    "invitedFirms",
    invitedFirms,
    "selectedFirma",
    selectedFirma,
    "isOpen",
    isOpen,
  );

  return (
    <React.Fragment>
      <DocumentPreviewModalV2
        key={`${documentId}-${dosyaId || "default"}-${firmKey}`}
        isOpen={isOpen}
        documentId={documentId}
        dosyaId={dosyaId}
        invitedFirms={invitedFirms}
        onClose={closeDocument}
        isModal={true}
      />
    </React.Fragment>
  );
};
