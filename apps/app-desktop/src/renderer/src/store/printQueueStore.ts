import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { emitAppEvent } from '../utils/appEvents'

export type PrintStatus = 'draft' | 'modified' | 'ready_to_print' | 'printed'

export interface PrintSettings {
  pageSize?: 'A4' | 'A3' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  copies?: number
  printBackground?: boolean
  showPageNumbers?: boolean
  pageRange?: string
  scale?: number
}

export interface QueuedDocument {
  id: string // e.g. `${dosyaId}_${docKey}`
  dosyaId: number
  docKey: string
  title: string
  category?: string
  status: PrintStatus
  orientation?: 'portrait' | 'landscape'
  addedAt: string
  lastPrintedAt?: string
  lastModifiedAt?: string
  notes?: string
  isLocked?: boolean
  lockedAtVersion?: string
  lockedAt?: string
  printSettings?: PrintSettings
}

export const CURRENT_APP_VERSION = 'v1.0.0-beta.157'

export interface PrintQueueState {
  items: QueuedDocument[]
  addToQueue: (item: Omit<QueuedDocument, 'id' | 'addedAt'>) => void
  removeFromQueue: (dosyaId: number, docKey: string) => void
  toggleReadyToPrint: (
    dosyaId: number,
    docKey: string,
    title: string,
    extra?: Partial<QueuedDocument>
  ) => boolean
  updateStatus: (dosyaId: number, docKey: string, status: PrintStatus, notes?: string) => void
  invalidateReadyStatus: (dosyaId: number, docKey: string, reason?: string) => void
  markAsPrinted: (
    dosyaId: number,
    docKey: string,
    version?: string,
    settings?: PrintSettings
  ) => void
  lockDocument: (dosyaId: number, docKey: string, version?: string) => void
  unlockDocument: (dosyaId: number, docKey: string) => void
  clearQueueForDosya: (dosyaId: number) => void
  getQueueForDosya: (dosyaId: number | null | undefined) => QueuedDocument[]
  getReadyCountForDosya: (dosyaId: number | null | undefined) => number
  getPrintedCountForDosya: (dosyaId: number | null | undefined) => number
  isInQueue: (dosyaId: number | null | undefined, docKey: string) => boolean
  getDocumentStatus: (dosyaId: number | null | undefined, docKey: string) => PrintStatus
  isDocumentLocked: (dosyaId: number | null | undefined, docKey: string) => boolean
  getDocumentLockInfo: (
    dosyaId: number | null | undefined,
    docKey: string
  ) => { isLocked: boolean; lockedAtVersion?: string; lockedAt?: string } | null
}

export const usePrintQueueStore = create<PrintQueueState>()(
  persist(
    (set, get) => ({
      items: [],

      addToQueue: (item) => {
        const id = `${item.dosyaId}_${item.docKey}`
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== id)
          const newItem: QueuedDocument = {
            ...item,
            id,
            addedAt: new Date().toISOString()
          }
          return { items: [newItem, ...filtered] }
        })
        emitAppEvent('print_queue:updated' as any, { dosyaId: item.dosyaId, docKey: item.docKey })
      },

      removeFromQueue: (dosyaId, docKey) => {
        const id = `${dosyaId}_${docKey}`
        set((state) => ({
          items: state.items.filter((i) => i.id !== id)
        }))
        emitAppEvent('print_queue:updated' as any, { dosyaId, docKey })
      },

      toggleReadyToPrint: (dosyaId, docKey, title, extra = {}) => {
        const id = `${dosyaId}_${docKey}`
        const existing = get().items.find((i) => i.id === id)
        let isNowInQueue = false

        if (existing && existing.status === 'ready_to_print') {
          // Remove or set to draft
          set((state) => ({
            items: state.items.filter((i) => i.id !== id)
          }))
          isNowInQueue = false
        } else {
          // Add or update to ready_to_print
          set((state) => {
            const filtered = state.items.filter((i) => i.id !== id)
            const newItem: QueuedDocument = {
              dosyaId,
              docKey,
              title,
              status: 'ready_to_print',
              addedAt: new Date().toISOString(),
              ...extra,
              id
            }
            return { items: [newItem, ...filtered] }
          })
          isNowInQueue = true
        }

        emitAppEvent('print_queue:updated' as any, {
          dosyaId,
          docKey,
          status: isNowInQueue ? 'ready_to_print' : 'removed'
        })
        return isNowInQueue
      },

      updateStatus: (dosyaId, docKey, status, notes) => {
        const id = `${dosyaId}_${docKey}`
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status,
                  notes: notes !== undefined ? notes : i.notes,
                  lastModifiedAt: new Date().toISOString()
                }
              : i
          )
        }))
        emitAppEvent('print_queue:updated', { dosyaId, docKey, status })
      },

      invalidateReadyStatus: (dosyaId, docKey, reason) => {
        const id = `${dosyaId}_${docKey}`
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.status === 'ready_to_print'
              ? {
                  ...i,
                  status: 'modified',
                  notes: reason || 'Düzenleme yapıldı, yeniden kontrol ediniz.',
                  lastModifiedAt: new Date().toISOString()
                }
              : i
          )
        }))
        emitAppEvent('print_queue:updated', { dosyaId, docKey, status: 'modified' })
      },

      markAsPrinted: (dosyaId, docKey, version, settings) => {
        const id = `${dosyaId}_${docKey}`
        const now = new Date().toISOString()
        const lockedVer = version || CURRENT_APP_VERSION
        set((state) => {
          const existing = state.items.find((i) => i.id === id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id
                  ? {
                      ...i,
                      status: 'printed' as const,
                      lastPrintedAt: now,
                      isLocked: true,
                      lockedAtVersion: lockedVer,
                      lockedAt: now,
                      printSettings: settings || i.printSettings
                    }
                  : i
              )
            }
          }
          // If not existing in queue yet, add as printed & locked
          const newItem: QueuedDocument = {
            id,
            dosyaId,
            docKey,
            title: docKey,
            status: 'printed',
            addedAt: now,
            lastPrintedAt: now,
            isLocked: true,
            lockedAtVersion: lockedVer,
            lockedAt: now,
            printSettings: settings
          }
          return { items: [newItem, ...state.items] }
        })
        emitAppEvent('print_queue:updated', { dosyaId, docKey, status: 'printed', isLocked: true })
      },

      lockDocument: (dosyaId, docKey, version) => {
        const id = `${dosyaId}_${docKey}`
        const now = new Date().toISOString()
        const lockedVer = version || CURRENT_APP_VERSION
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  isLocked: true,
                  lockedAtVersion: lockedVer,
                  lockedAt: now
                }
              : i
          )
        }))
        emitAppEvent('print_queue:updated', { dosyaId, docKey, isLocked: true })
      },

      unlockDocument: (dosyaId, docKey) => {
        const id = `${dosyaId}_${docKey}`
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  isLocked: false,
                  status: i.status === 'printed' ? ('modified' as const) : i.status,
                  notes: 'Kullanıcı tarafından kilidi açıldı ve düzenlemeye izin verildi.'
                }
              : i
          )
        }))
        emitAppEvent('print_queue:updated', { dosyaId, docKey, isLocked: false })
      },

      clearQueueForDosya: (dosyaId) => {
        set((state) => ({
          items: state.items.filter((i) => i.dosyaId !== dosyaId)
        }))
        emitAppEvent('print_queue:updated', { dosyaId })
      },

      getQueueForDosya: (dosyaId) => {
        if (!dosyaId) return []
        return get().items.filter((i) => i.dosyaId === dosyaId)
      },

      getReadyCountForDosya: (dosyaId) => {
        if (!dosyaId) return 0
        return get().items.filter((i) => i.dosyaId === dosyaId && i.status === 'ready_to_print')
          .length
      },

      getPrintedCountForDosya: (dosyaId) => {
        if (!dosyaId) return 0
        return get().items.filter((i) => i.dosyaId === dosyaId && i.status === 'printed').length
      },

      isInQueue: (dosyaId, docKey) => {
        if (!dosyaId || !docKey) return false
        const id = `${dosyaId}_${docKey}`
        const found = get().items.find((i) => i.id === id)
        return !!found && found.status === 'ready_to_print'
      },

      getDocumentStatus: (dosyaId, docKey) => {
        if (!dosyaId || !docKey) return 'draft'
        const id = `${dosyaId}_${docKey}`
        const found = get().items.find((i) => i.id === id)
        return found ? found.status : 'draft'
      },

      isDocumentLocked: (dosyaId, docKey) => {
        if (!dosyaId || !docKey) return false
        const id = `${dosyaId}_${docKey}`
        const found = get().items.find((i) => i.id === id)
        return !!(found && found.isLocked)
      },

      getDocumentLockInfo: (dosyaId, docKey) => {
        if (!dosyaId || !docKey) return null
        const id = `${dosyaId}_${docKey}`
        const found = get().items.find((i) => i.id === id)
        if (!found) return null
        return {
          isLocked: !!found.isLocked,
          lockedAtVersion: found.lockedAtVersion,
          lockedAt: found.lockedAt || found.lastPrintedAt
        }
      }
    }),
    {
      name: 'hakim_pro_print_queue'
    }
  )
)
