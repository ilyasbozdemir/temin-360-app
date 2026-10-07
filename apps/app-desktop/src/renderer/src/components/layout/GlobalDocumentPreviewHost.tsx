import React from 'react'
import { useGlobalDocumentPreviewStore } from '../../store/globalDocumentPreviewStore'
import { DocumentPreviewModalV2 } from '../../screens/dosya/components/DocumentPreviewModalV2'

export function GlobalDocumentPreviewHost(): React.JSX.Element | null {
  const { isOpen, tabs, activeTabId, switchTab, closeTab, openDocument, closeDocument } =
    useGlobalDocumentPreviewStore()

  if (!isOpen || tabs.length === 0) return null

  const activeTab = tabs.find((t) => t.tabId === activeTabId) || tabs[0]
  if (!activeTab) return null

  return (
    <DocumentPreviewModalV2
      key={activeTab.tabId}
      isOpen={isOpen}
      documentId={activeTab.documentId}
      dosyaId={activeTab.dosyaId}
      invitedFirms={activeTab.invitedFirms}
      selectedFirma={activeTab.selectedFirma}
      initialData={activeTab.initialData || undefined}
      onClose={closeDocument}
      isModal={false}
      tabs={tabs}
      activeTabId={activeTab.tabId}
      onSwitchTab={switchTab}
      onCloseTab={closeTab}
      onAddTab={openDocument}
    />
  )
}
