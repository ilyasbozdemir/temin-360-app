import React from 'react'
import { ChevronDown, FileText, Gavel, Landmark } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { Dosya2886Item, DosyaListItem } from '../teminSelector.types'
import { TeminSelectorActive2886 } from './TeminSelectorActive2886'
import { TeminSelectorActive4734 } from './TeminSelectorActive4734'

interface TeminSelectorTriggerProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  is2886: boolean
  isDt: boolean
  active2886Dosya: Dosya2886Item | null
  selectedDosya: DosyaListItem | undefined
  selectedIsIhale: boolean
  navigate: (opts: { to: string }) => void
  addTab: (path: string) => void
  setShowInspector: (show: boolean) => void
  handleCloseDosya: () => void
  handleClose2886Dosya: () => void
}

export const TeminSelectorTrigger = React.memo(function TeminSelectorTrigger(
  props: TeminSelectorTriggerProps
): React.JSX.Element {
  const {
    isOpen,
    setIsOpen,
    is2886,
    isDt,
    active2886Dosya,
    selectedDosya,
    selectedIsIhale,
    navigate,
    addTab,
    setShowInspector,
    handleCloseDosya,
    handleClose2886Dosya
  } = props

  if (is2886) {
    if (active2886Dosya) {
      return (
        <TeminSelectorActive2886
          active2886Dosya={active2886Dosya}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigate={navigate}
          handleClose2886Dosya={handleClose2886Dosya}
        />
      )
    }

    return (
      <button
        onClick={(): void => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-5 py-1.5 rounded-2xl transition-all text-xs font-semibold border border-dashed max-w-150 w-auto min-w-0 justify-center cursor-pointer shadow-2xs bg-purple-50/40 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-50 hover:border-purple-400"
        title="2886 İhalesi Seçmek İçin Tıkla"
      >
        <Landmark className="w-4 h-4 text-purple-500 shrink-0" />
        <span className="truncate">
          Çalışmak İstediğiniz 2886 Satış / Kiralama İhalesini Seçin...
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-1.5 shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>
    )
  }

  if (selectedDosya) {
    return (
      <TeminSelectorActive4734
        selectedDosya={selectedDosya}
        selectedIsIhale={selectedIsIhale}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navigate={navigate}
        addTab={addTab}
        setShowInspector={setShowInspector}
        handleCloseDosya={handleCloseDosya}
      />
    )
  }

  return (
    <button
      onClick={(): void => setIsOpen(!isOpen)}
      className={`flex items-center gap-2 px-3 sm:px-5 py-1.5 rounded-2xl transition-all text-xs font-semibold border border-dashed max-w-150 w-auto min-w-0 justify-center cursor-pointer shadow-2xs ${
        isDt
          ? 'bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-50 hover:border-blue-400'
          : 'bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 hover:bg-indigo-50 hover:border-indigo-400'
      }`}
      title="Dosya Seçmek İçin Tıkla"
    >
      {isDt ? (
        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
      ) : (
        <Gavel className="w-4 h-4 text-indigo-500 shrink-0" />
      )}
      <span className="truncate">
        {isDt
          ? 'Çalışmak İstediğiniz Doğrudan Temin Dosyasını Seçin (KİK Md. 22)...'
          : 'Çalışmak İstediğiniz İhale veya Yapım İşi Dosyasını Seçin (KİK Md. 19 / 21)...'}
      </span>
      <ChevronDown
        className={cn(
          'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-1.5 shrink-0',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  )
})
