import React, { useState } from 'react'
import { Proje, useProjeHooks } from '../../hooks/useProjeHooks'
import { Check, FolderKanban, Plus, Trash2, X } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'

export interface ProjectInlineSectionProps {
  selectedProjectId?: number | null
  onSelect: (proje: Proje | null) => void
}

const COLOR_PRESETS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // rose
  '#06b6d4', // cyan
  '#6366f1' // indigo
]

const generateDefaultProjectCode = (): string => {
  return `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
}

export function ProjectInlineSection({
  selectedProjectId,
  onSelect
}: ProjectInlineSectionProps): React.JSX.Element {
  const { projeler, isLoadingProjeler, addProje } = useProjeHooks()
  const [isCreatingInline, setIsCreatingInline] = useState(false)

  // New Project Form State
  const [newCode, setNewCode] = useState(generateDefaultProjectCode)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newBudget, setNewBudget] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0])

  const selectedProject = projeler.find((p) => p.id === selectedProjectId)

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newName.trim()) return

    const res = (await addProje({
      proje_kodu: newCode.trim(),
      proje_adi: newName.trim(),
      aciklama: newDesc.trim(),
      toplam_butce: Number(newBudget) || 0,
      renk: newColor,
      durum: 'devam'
    })) as Record<string, unknown>

    const resData = res?.data as Record<string, unknown> | undefined
    const newId = resData?.lastInsertRowid || res?.lastInsertRowid || resData?.id

    if (newId) {
      onSelect({
        id: Number(newId),
        proje_kodu: newCode.trim(),
        proje_adi: newName.trim(),
        aciklama: newDesc.trim(),
        toplam_butce: Number(newBudget) || 0,
        renk: newColor,
        durum: 'devam',
        aktif_mi: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }

    setNewName('')
    setNewDesc('')
    setNewBudget('')
    setNewCode(generateDefaultProjectCode())
    setIsCreatingInline(false)
  }

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <FolderKanban size={16} className="text-blue-600 dark:text-blue-400" />
          Yatırım &amp; Alım Projesi Bağlantısı
        </label>
        <button
          type="button"
          onClick={() => setIsCreatingInline(!isCreatingInline)}
          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/50 transition-all"
        >
          {isCreatingInline ? (
            <>
              <X size={12} /> İptal
            </>
          ) : (
            <>
              <Plus size={12} /> Hızlı Proje Oluştur
            </>
          )}
        </button>
      </div>

      {isCreatingInline ? (
        <form
          onSubmit={handleCreate}
          className="space-y-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200"
        >
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Yeni Proje Tanımla</span>
            <span className="text-[10px] text-slate-400 font-normal">
              Formu doldurup kaydettiğinizde otomatik bu dosyaya bağlanır
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Proje Kodu *
              </label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="PRJ-2026-001"
                required
                className="font-mono text-xs h-8"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Proje Adı *
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn: Laboratuvar Cihaz Alım Projesi"
                required
                className="text-xs h-8"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Toplam Bütçe (₺)
              </label>
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="500000"
                className="text-xs h-8"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Renk:</span>
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    newColor === c
                      ? 'ring-2 ring-offset-1 ring-blue-500 scale-110'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingInline(false)}
                className="text-xs h-7 px-2.5"
              >
                Vazgeç
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs h-7 px-3 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Kaydet ve Bağla
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          {/* EKRANDAN SEÇİM DROPDOWN & DURUM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                İlişkili Proje Seçin
              </label>
              <select
                value={selectedProjectId || ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (!val) {
                    onSelect(null)
                  } else {
                    const found = projeler.find((p) => p.id === Number(val))
                    onSelect(found || null)
                  }
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              >
                <option value="">-- Bağımsız Dosya (Proje Yok) --</option>
                {isLoadingProjeler ? (
                  <option disabled>Projeler yükleniyor...</option>
                ) : (
                  projeler.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.proje_kodu}] {p.proje_adi} (
                      {Number(p.toplam_butce).toLocaleString('tr-TR')} ₺)
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedProject ? (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: selectedProject.renk || '#3b82f6' }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/50">
                        {selectedProject.proje_kodu}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {selectedProject.proje_adi}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Bütçe: {Number(selectedProject.toplam_butce).toLocaleString('tr-TR')} ₺ •
                      Dosya: {selectedProject.dosya_sayisi || 0}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(null)}
                  title="Proje Bağlantısını Kaldır"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-950/40 border border-dashed border-slate-300 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center">
                <span>
                  Herhangi bir projeye bağlı değil. Seçeceğiniz proje alım bütçesini takibe alır.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
