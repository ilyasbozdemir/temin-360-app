import { create } from 'zustand'

export interface DocumentPreviewTab {
  tabId: string
  documentId: string
  dosyaId?: number | null
  dosyaNo?: string | null
  documentTitle?: string | null
  invitedFirms?: unknown[]
  selectedFirma?: Record<string, unknown> | null
  initialData?: Record<string, unknown> | null
}

export interface GlobalDocumentPreviewState {
  isOpen: boolean
  isBalloon: boolean
  activeTabId: string | null
  tabs: DocumentPreviewTab[]
  documentId: string | null
  dosyaId?: number | null
  invitedFirms?: unknown[]
  selectedFirma?: Record<string, unknown> | null
  initialData?: Record<string, unknown> | null
  onCloseCallback?: (() => void) | null

  getActiveTab: () => DocumentPreviewTab | null
  openDocument: (params: {
    documentId: string
    dosyaId?: number | null
    dosyaNo?: string | null
    documentTitle?: string
    invitedFirms?: unknown[]
    selectedFirma?: Record<string, unknown> | null
    initialData?: Record<string, unknown> | null
    startAsBalloon?: boolean
    onClose?: () => void
  }) => void

  switchTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  closeAllTabs: () => void
  closeDocument: () => void
  setIsBalloon: (isBalloon: boolean) => void
  toggleBalloon: () => void
}

function generateTabId(params: {
  documentId: string
  dosyaId?: number | null
  selectedFirma?: Record<string, unknown> | null
}): string {
  const f = params.selectedFirma
  const fKey =
    (f?.id as string | number) ||
    (f?.firma_id as string | number) ||
    (f?.temin_firma_id as string | number) ||
    (f?.unvan as string) ||
    'all'
  return `${params.dosyaId ?? '0'}::${params.documentId}::${fKey}`
}

export const useGlobalDocumentPreviewStore = create<GlobalDocumentPreviewState>((set, get) => ({
  isOpen: false,
  isBalloon: false,
  activeTabId: null,
  tabs: [],
  documentId: null,
  dosyaId: null,
  invitedFirms: [],
  selectedFirma: null,
  initialData: null,
  onCloseCallback: null,

  getActiveTab: () => {
    const { tabs, activeTabId } = get()
    return tabs.find((t) => t.tabId === activeTabId) || tabs[0] || null
  },

  openDocument: (params) => {
    const tabId = generateTabId(params)
    const { tabs } = get()
    const existingIndex = tabs.findIndex((t) => t.tabId === tabId)

    if (existingIndex >= 0) {
      // Sekme zaten açık, sadece o sekmeye odaklan
      set({
        isOpen: true,
        isBalloon: params.startAsBalloon ?? false,
        activeTabId: tabId,
        onCloseCallback: params.onClose || get().onCloseCallback
      })
      return
    }

    const newTab: DocumentPreviewTab = {
      tabId,
      documentId: params.documentId,
      dosyaId: params.dosyaId || null,
      dosyaNo: params.dosyaNo || (params.dosyaId ? `#${params.dosyaId}` : null),
      documentTitle: params.documentTitle || null,
      invitedFirms: params.invitedFirms || [],
      selectedFirma: params.selectedFirma || null,
      initialData: params.initialData || null
    }

    set({
      isOpen: true,
      isBalloon: params.startAsBalloon ?? false,
      tabs: [...tabs, newTab],
      activeTabId: tabId,
      onCloseCallback: params.onClose || get().onCloseCallback
    })
  },

  switchTab: (tabId: string) => {
    set({ activeTabId: tabId })
  },

  closeTab: (tabId: string) => {
    const { tabs, activeTabId, onCloseCallback } = get()
    const targetIdx = tabs.findIndex((t) => t.tabId === tabId)
    if (targetIdx < 0) return

    const newTabs = tabs.filter((t) => t.tabId !== tabId)

    if (newTabs.length === 0) {
      if (onCloseCallback) {
        try {
          onCloseCallback()
        } catch (e) {
          console.error('Error executing onCloseCallback', e)
        }
      }
      set({
        isOpen: false,
        isBalloon: false,
        tabs: [],
        activeTabId: null,
        onCloseCallback: null
      })
      return
    }

    // Aktif sekme kapatıldıysa bir öncekine veya bir sonrakine geç
    let nextActiveId = activeTabId
    if (activeTabId === tabId) {
      const nextIdx = Math.max(0, targetIdx - 1)
      nextActiveId = newTabs[nextIdx]?.tabId || newTabs[0].tabId
    }

    set({
      tabs: newTabs,
      activeTabId: nextActiveId
    })
  },

  closeAllTabs: () => {
    const { onCloseCallback } = get()
    if (onCloseCallback) {
      try {
        onCloseCallback()
      } catch (e) {
        console.error('Error executing onCloseCallback', e)
      }
    }
    set({
      isOpen: false,
      isBalloon: false,
      tabs: [],
      activeTabId: null,
      onCloseCallback: null
    })
  },

  closeDocument: () => {
    get().closeAllTabs()
  },

  setIsBalloon: (isBalloon) => set({ isBalloon }),
  toggleBalloon: () => set((state) => ({ isBalloon: !state.isBalloon }))
}))
