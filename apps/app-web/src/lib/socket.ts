export interface SyncEventPayload {
  dosyaId?: string | number
  dosyaNo?: string
  action: 'create' | 'update' | 'delete' | 'backup' | 'sync'
  timestamp: string
  source: 'desktop' | 'web' | 'system'
  data?: Record<string, unknown>
}

// Global in-memory socket registry / event bus for real-time subscribers
type Listener = (payload: SyncEventPayload) => void
const listeners = new Set<Listener>()

export const RealtimeBus = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  emit(payload: SyncEventPayload) {
    for (const listener of listeners) {
      try {
        listener(payload)
      } catch (err) {
        console.error('[RealtimeBus Error]', err)
      }
    }
  },
  listenerCount() {
    return listeners.size
  }
}
