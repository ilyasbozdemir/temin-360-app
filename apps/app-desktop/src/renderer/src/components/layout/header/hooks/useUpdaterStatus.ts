import { useState, useEffect } from 'react'

export interface UseUpdaterStatusReturn {
  updateStatus: { status: string; version?: string } | null
  showUpdateModal: boolean
  setShowUpdateModal: React.Dispatch<React.SetStateAction<boolean>>
}

export function useUpdaterStatus(): UseUpdaterStatusReturn {
  const [updateStatus, setUpdateStatus] = useState<{ status: string; version?: string } | null>(
    null
  )
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  useEffect(() => {
    const removeListener = window.electron?.ipcRenderer.on(
      'updater:status',
      (_event, data: { status: string; version?: string }) => {
        setUpdateStatus(data)
        if (data.status === 'downloaded') setShowUpdateModal(true)
      }
    )
    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  return {
    updateStatus,
    showUpdateModal,
    setShowUpdateModal
  }
}
