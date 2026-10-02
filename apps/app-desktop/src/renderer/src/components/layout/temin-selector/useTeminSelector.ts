import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { useTabStore } from '../../../store/tabStore'
import { useDosyalarHooks } from '../../../screens/dosyalar/dosyalar.hooks'
import { isIhaleOrYapim } from './teminSelector.utils'
import { filter2886Dosyalar, filterDosyalar } from './teminSelector.filters'
import {
  getInitial2886ActiveDosya,
  getInitial2886Dosyalar,
  getInitialProcurementMode,
  persist2886ActiveDosya
} from './teminSelector.storage'
import { Dosya2886Item, DosyaListItem, ProcurementMode, SubFilterType } from './teminSelector.types'

export interface UseTeminSelectorReturn {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  showYeniDosyaModal: boolean
  setShowYeniDosyaModal: React.Dispatch<React.SetStateAction<boolean>>
  showInspector: boolean
  setShowInspector: React.Dispatch<React.SetStateAction<boolean>>
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  procurementMode: ProcurementMode
  setGlobalMode: (mode: ProcurementMode) => void
  isDt: boolean
  is2886: boolean
  subFilter: SubFilterType
  setSubFilter: React.Dispatch<React.SetStateAction<SubFilterType>>
  activeDosyaId: number | null
  selectedDosya: DosyaListItem | undefined
  selectedIsIhale: boolean
  dosyalar: DosyaListItem[]
  isLoadingDosyalar: boolean
  dosyalar2886: Dosya2886Item[]
  active2886Dosya: Dosya2886Item | null
  dtCount: number
  ihaleCount: number
  ihale2886Count: number
  filteredDosyalar: DosyaListItem[]
  filtered2886Dosyalar: Dosya2886Item[]
  containerRef: React.RefObject<HTMLDivElement | null>
  navigate: ReturnType<typeof useNavigate>
  addTab: (path: string) => void
  handleSelect: (id: number) => void
  handleSelect2886: (item: Dosya2886Item) => void
  handleCloseDosya: () => void
  handleClose2886Dosya: () => void
  handleCreateYeniDosya: (e: React.MouseEvent) => void
}

export function useTeminSelector(): UseTeminSelectorReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [showYeniDosyaModal, setShowYeniDosyaModal] = useState(false)
  const [showInspector, setShowInspector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [subFilter, setSubFilter] = useState<SubFilterType>('mode_default')
  const containerRef = useRef<HTMLDivElement>(null)

  const [procurementMode, setProcurementMode] = useState<ProcurementMode>(getInitialProcurementMode)
  const isDt = procurementMode === 'dogrudan_temin'
  const is2886 = procurementMode === 'devlet_ihale_2886'

  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore()
  const { dosyalar, isLoadingDosyalar } = useDosyalarHooks()
  const { addTab } = useTabStore()
  const navigate = useNavigate()

  const [dosyalar2886, setDosyalar2886] = useState<Dosya2886Item[]>(getInitial2886Dosyalar)
  const [active2886Dosya, setActive2886Dosya] = useState<Dosya2886Item | null>(
    getInitial2886ActiveDosya
  )

  const refresh2886Data = (): void => {
    setDosyalar2886(getInitial2886Dosyalar())
    setActive2886Dosya(getInitial2886ActiveDosya())
  }

  useEffect(() => {
    const handleModeEvent = (e: Event): void => {
      const customEvent = e as CustomEvent<{ mode: ProcurementMode }>
      if (customEvent.detail?.mode) {
        setProcurementMode(customEvent.detail.mode)
        setSubFilter('mode_default')
      }
    }
    window.addEventListener('procurement-mode-change', handleModeEvent)
    window.addEventListener('devlet-ihale-2886-reloaded', refresh2886Data)
    return () => {
      window.removeEventListener('procurement-mode-change', handleModeEvent)
      window.removeEventListener('devlet-ihale-2886-reloaded', refresh2886Data)
    }
  }, [])

  const setGlobalMode = (mode: ProcurementMode): void => {
    setProcurementMode(mode)
    setSubFilter('mode_default')
    localStorage.setItem('temin_procurement_mode', mode)
    window.dispatchEvent(new CustomEvent('procurement-mode-change', { detail: { mode } }))
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedDosya = useMemo(
    () => dosyalar.find((d) => d.id === activeDosyaId),
    [dosyalar, activeDosyaId]
  )

  const dtCount = useMemo(
    () => dosyalar.filter((d) => d.is_deleted !== 1 && !isIhaleOrYapim(d)).length,
    [dosyalar]
  )

  const ihaleCount = useMemo(
    () => dosyalar.filter((d) => d.is_deleted !== 1 && isIhaleOrYapim(d)).length,
    [dosyalar]
  )

  const ihale2886Count = dosyalar2886.length

  const filteredDosyalar = useMemo(() => {
    return filterDosyalar(dosyalar, subFilter, searchQuery, isDt, is2886)
  }, [dosyalar, isDt, is2886, subFilter, searchQuery])

  const filtered2886Dosyalar = useMemo(() => {
    return filter2886Dosyalar(dosyalar2886, subFilter, searchQuery)
  }, [dosyalar2886, subFilter, searchQuery])

  const handleSelect = (id: number): void => {
    setActiveDosyaId(id)
    setIsOpen(false)
    navigate({ to: '/takip' })
  }

  const handleSelect2886 = (item: Dosya2886Item): void => {
    setActive2886Dosya(item)
    persist2886ActiveDosya(item)
    setIsOpen(false)
    navigate({ to: '/devlet-ihale-2886' })
  }

  const handleCloseDosya = (): void => {
    setActiveDosyaId(null)
    setIsOpen(false)
    navigate({ to: '/' })
  }

  const handleClose2886Dosya = (): void => {
    setActive2886Dosya(null)
    persist2886ActiveDosya(null)
    setIsOpen(false)
  }

  const handleCreateYeniDosya = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setIsOpen(false)
    if (is2886) {
      navigate({ to: '/devlet-ihale-2886' })
    } else {
      setShowYeniDosyaModal(true)
    }
  }

  const selectedIsIhale = selectedDosya ? isIhaleOrYapim(selectedDosya) : false

  return {
    isOpen,
    setIsOpen,
    showYeniDosyaModal,
    setShowYeniDosyaModal,
    showInspector,
    setShowInspector,
    searchQuery,
    setSearchQuery,
    procurementMode,
    setGlobalMode,
    isDt,
    is2886,
    subFilter,
    setSubFilter,
    activeDosyaId,
    selectedDosya,
    selectedIsIhale,
    dosyalar,
    isLoadingDosyalar,
    dosyalar2886,
    active2886Dosya,
    dtCount,
    ihaleCount,
    ihale2886Count,
    filteredDosyalar,
    filtered2886Dosyalar,
    containerRef,
    navigate,
    addTab,
    handleSelect,
    handleSelect2886,
    handleCloseDosya,
    handleClose2886Dosya,
    handleCreateYeniDosya
  }
}
