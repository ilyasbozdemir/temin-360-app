import React from 'react'
import { Button } from '../../../../components/ui/Button'

interface HizliKadroFooterProps {
  syncToActiveFile: boolean
  onToggleSyncToActiveFile: (checked: boolean) => void
  activeDosyaId?: number | null
  onClose: () => void
  onSave: () => void
  isPending: boolean
}

export const HizliKadroFooter: React.FC<HizliKadroFooterProps> = ({
  syncToActiveFile,
  onToggleSyncToActiveFile,
  activeDosyaId,
  onClose,
  onSave,
  isPending
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
      <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={syncToActiveFile}
          onChange={(e) => onToggleSyncToActiveFile(e.target.checked)}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded-sm cursor-pointer"
        />
        <span>
          Açık dosyaya ({activeDosyaId ? `Dosya #${activeDosyaId}` : 'Aktif Dosya'}) anında senkronize et
        </span>
      </label>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
        >
          İptal
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="rounded-xl px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 cursor-pointer"
        >
          {isPending ? 'Kaydediliyor...' : '⚡ Kadroyu Güncelle ve Kaydet'}
        </Button>
      </div>
    </div>
  )
}
