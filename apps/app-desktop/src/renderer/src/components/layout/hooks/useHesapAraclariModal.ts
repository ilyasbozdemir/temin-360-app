import { useEffect, useState } from 'react'

export interface HesapAraclariModalState {
  isHesapModalOpen: boolean
  setIsHesapModalOpen: (open: boolean) => void
}

export function useHesapAraclariModal(): HesapAraclariModalState {
  const [isHesapModalOpen, setIsHesapModalOpen] = useState(false)

  useEffect(() => {
    const handleOpenHesapModal = () => {
      setIsHesapModalOpen(true)
    }
    window.addEventListener('open:hesap-araclari', handleOpenHesapModal)
    return () => {
      window.removeEventListener('open:hesap-araclari', handleOpenHesapModal)
    }
  }, [])

  return {
    isHesapModalOpen,
    setIsHesapModalOpen
  }
}
