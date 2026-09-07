import { TemplateResolver } from '@temin360/document-templates'
import { getDefaultMappingForProcess } from '../constants/mappings'
import { resolveTemplateConfig } from '../screens/dosya/components/DocumentPreviewModalV2/templateResolver'

export interface PreloadedDocumentData {
  payloadData: any
  resolvedData: any
  timestamp: number
}

class DocumentPreloadService {
  private cache: Map<string, PreloadedDocumentData> = new Map()
  private inFlight: Map<string, Promise<PreloadedDocumentData | null>> = new Map()
  private stageWarmTimeout: any = null
  private hoverDebounce: Map<string, any> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      const invalidate = (e?: any) => {
        const targetDosyaId = e?.detail?.dosyaId
        this.invalidateCache(targetDosyaId)
      }

      window.addEventListener('dossier:updated', invalidate)
      window.addEventListener('items:changed', invalidate)
      window.addEventListener('bids:changed', invalidate)
      window.addEventListener('documents:changed', invalidate)
      window.addEventListener('status:changed', invalidate)
      window.addEventListener('workspace:refreshed', invalidate)

      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.on('db:invalidated', () => {
          this.invalidateCache()
        })
      }
    }
  }

  private getKey(documentId: string, dosyaId: number = 0): string {
    const cleanDoc = documentId.replace(/\.html$/i, '').trim().toLowerCase()
    return `${dosyaId}_${cleanDoc}`
  }

  public getCachedDocument(
    documentId: string,
    dosyaId: number = 0
  ): PreloadedDocumentData | null {
    if (!documentId) return null
    const key = this.getKey(documentId, dosyaId)
    const cached = this.cache.get(key)
    if (!cached) return null

    // 5 minutes TTL
    if (Date.now() - cached.timestamp > 5 * 60 * 1000) {
      this.cache.delete(key)
      return null
    }

    return cached
  }

  public updateCachedResolvedData(documentId: string, dosyaId: number = 0, resolvedData: any): void {
    if (!documentId) return
    const key = this.getKey(documentId, dosyaId)
    const existing = this.cache.get(key)
    if (existing) {
      existing.resolvedData = { ...existing.resolvedData, ...resolvedData }
      existing.timestamp = Date.now()
    } else {
      this.cache.set(key, {
        payloadData: {},
        resolvedData,
        timestamp: Date.now()
      })
    }
  }

  public async preloadDocument(
    documentId: string,
    dosyaId: number = 0
  ): Promise<PreloadedDocumentData | null> {
    if (!documentId) return null
    const key = this.getKey(documentId, dosyaId)

    const existing = this.getCachedDocument(documentId, dosyaId)
    if (existing) {
      return existing
    }

    if (this.inFlight.has(key)) {
      return this.inFlight.get(key)!
    }

    const task = (async (): Promise<PreloadedDocumentData | null> => {
      try {
        const { resolvedId } = resolveTemplateConfig(documentId)

        const queryExecutor = async (sql: string, params: any[]): Promise<any[]> => {
          if (!window.electron?.ipcRenderer) return []
          try {
            const res = await window.electron.ipcRenderer.invoke('db:query', sql, params)
            return res && res.success ? res.data : []
          } catch {
            return []
          }
        }

        const mapping = getDefaultMappingForProcess(resolvedId)
        const resolver = new TemplateResolver(queryExecutor)

        const [payloadRes, resolved] = await Promise.all([
          window.electron?.ipcRenderer
            ? window.electron.ipcRenderer.invoke('belge:get-document-payload', {
                dosyaId,
                documentId: resolvedId
              })
            : Promise.resolve({ success: false, data: {} }),
          resolver.resolve(mapping, dosyaId || 0)
        ])

        const payloadData = payloadRes?.success ? payloadRes.data : {}
        const entry: PreloadedDocumentData = {
          payloadData,
          resolvedData: resolved || {},
          timestamp: Date.now()
        }

        this.cache.set(key, entry)
        return entry
      } catch (err) {
        console.warn(`[DocumentPreloadService] Preload failed for ${documentId}:`, err)
        return null
      } finally {
        this.inFlight.delete(key)
      }
    })()

    this.inFlight.set(key, task)
    return task
  }

  /**
   * Hover Trigger: Instant warm-up when mouse enters button, card or menu item
   */
  public warmOnHover(documentId: string, dosyaId: number = 0): void {
    if (!documentId) return
    const key = this.getKey(documentId, dosyaId)

    // Clear debounce if already scheduled
    if (this.hoverDebounce.has(key)) {
      clearTimeout(this.hoverDebounce.get(key))
    }

    // Small 20ms debounce to prevent thrashing during fast cursor movements
    const timer = setTimeout(() => {
      this.preloadDocument(documentId, dosyaId)
      this.hoverDebounce.delete(key)
    }, 20)

    this.hoverDebounce.set(key, timer)
  }

  /**
   * Step Navigation Background Warm-up:
   * Incrementally warms up stage templates with idle scheduling so the UI never drops frames.
   */
  public warmStageDocuments(
    _kategori: string,
    dosyaId: number = 0,
    stageDocIds: string[] = []
  ): void {
    if (!dosyaId || stageDocIds.length === 0) return

    if (this.stageWarmTimeout) {
      clearTimeout(this.stageWarmTimeout)
    }

    this.stageWarmTimeout = setTimeout(() => {
      let idx = 0
      const processNext = () => {
        if (idx >= stageDocIds.length) return
        const docId = stageDocIds[idx++]
        this.preloadDocument(docId, dosyaId).finally(() => {
          if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(() => processNext(), { timeout: 200 })
          } else {
            setTimeout(processNext, 60)
          }
        })
      }
      processNext()
    }, 150)
  }

  /**
   * Clear all or dossier-specific cache
   */
  public invalidateCache(dosyaId?: number): void {
    if (dosyaId) {
      for (const key of Array.from(this.cache.keys())) {
        if (key.startsWith(`${dosyaId}_`)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
}

export const documentPreloadService = new DocumentPreloadService()
