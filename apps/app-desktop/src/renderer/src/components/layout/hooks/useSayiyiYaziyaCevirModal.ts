import { useEffect, useState } from 'react'

export interface SayiyiYaziyaCevirState {
  isSayiModalOpen: boolean
  sayiInitialVal: string
  setIsSayiModalOpen: (open: boolean) => void
}

export function useSayiyiYaziyaCevirModal(): SayiyiYaziyaCevirState {
  const [isSayiModalOpen, setIsSayiModalOpen] = useState(false)
  const [sayiInitialVal, setSayiInitialVal] = useState<string>('282.112,00')

  useEffect(() => {
    const handleOpenSayiModal = (e: any) => {
      if (e?.detail?.value !== undefined) {
        setSayiInitialVal(String(e.detail.value))
      }
      setIsSayiModalOpen(true)
    }
    window.addEventListener('open:sayiyi-yaziya-cevir', handleOpenSayiModal)
    return () => {
      window.removeEventListener('open:sayiyi-yaziya-cevir', handleOpenSayiModal)
    }
  }, [])

  return {
    isSayiModalOpen,
    sayiInitialVal,
    setIsSayiModalOpen
  }
}
