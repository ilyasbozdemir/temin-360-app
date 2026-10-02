import { useState, useCallback, useEffect, useRef } from 'react'

export interface UseWorkspaceSaveReturn {
  saveFeedback: string | null
  handleSaveAndSync: () => Promise<void>
}

export function useWorkspaceSave(): UseWorkspaceSaveReturn {
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSaveAndSync = useCallback(async (): Promise<void> => {
    try {
      setSaveFeedback('💾 Dosya kaydediliyor...')
      const saveRes = await window.electron?.ipcRenderer.invoke('workspace:save')
      if (!saveRes?.success) throw new Error(saveRes?.error || 'Dosya kaydedilemedi.')

      const s = await window.electron?.ipcRenderer.invoke('db:get-settings')
      if (s?.gdriveAccessToken) {
        setSaveFeedback('☁️ Google Drive bulutuna yedekleniyor...')
        const gdriveRes = await window.electron?.ipcRenderer.invoke('workspace:backup-gdrive', {
          force: true
        })
        if (gdriveRes?.success) {
          setSaveFeedback(
            gdriveRes?.skipped
              ? '✓ Kaydedildi (Drive yedeği güncel)'
              : "✓ Kaydedildi ve Drive'a yedeklendi"
          )
        } else {
          setSaveFeedback(`⚠️ Kaydedildi, bulut uyarısı: ${gdriveRes?.error || 'Yetki hatası'}`)
        }
      } else {
        setSaveFeedback('✓ Çalışma dosyası başarıyla kaydedildi')
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      setSaveFeedback(`❌ Kaydetme hatası: ${errorMsg}`)
    } finally {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => setSaveFeedback(null), 3500)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  return {
    saveFeedback,
    handleSaveAndSync
  }
}
