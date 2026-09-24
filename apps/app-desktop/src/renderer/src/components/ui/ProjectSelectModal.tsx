import React, { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Proje, useProjeHooks } from '../../hooks/useProjeHooks'
import { Check, FolderPlus, Search, Trash2 } from 'lucide-react'

export interface ProjectSelectModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProjectId?: number | null
  initialMode?: 'select' | 'create'
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

export function ProjectSelectModal({
  isOpen,
  onClose,
  selectedProjectId,
  initialMode = 'select',
  onSelect
}: ProjectSelectModalProps): React.JSX.Element {
  const { projeler, isLoadingProjeler, addProje } = useProjeHooks()
  const [search, setSearch] = useState('')
  const [internalCreating, setInternalCreating] = useState<boolean | null>(null)

  const isCreating = internalCreating ?? initialMode === 'create'
  const setIsCreating = (val: boolean): void => setInternalCreating(val)

  // New Project Form State
  const [newCode, setNewCode] = useState(generateDefaultProjectCode)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newBudget, setNewBudget] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0])

  const filtered = projeler.filter(
    (p) =>
      (p.proje_adi || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.proje_kodu || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.aciklama || '').toLowerCase().includes(search.toLowerCase())
  )

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
      onClose()
    } else {
      setInternalCreating(false)
    }

    setNewName('')
    setNewDesc('')
    setNewBudget('')
    setNewCode(`PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? 'Yeni Proje Tanımla' : 'Proje Seç & İlişkilendir'}
    >
      <div className="space-y-4 p-1">
        {isCreating ? (
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Proje Kodu *
                </label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="PRJ-2026-001"
                  required
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Toplam Bütçe (₺)
                </label>
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="1000000"
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Proje Adı *
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn: Ana Bina Güçlendirme ve Tadilat Projesi"
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Açıklama / Kapsam
              </label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Proje kapsamındaki alımların amacı..."
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Proje Rengi
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newColor === c
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="text-xs"
              >
                Vazgeç
              </Button>
              <Button type="submit" className="text-xs bg-blue-600 text-white hover:bg-blue-700">
                Projeyi Kaydet
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Proje adı veya kodu ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <Button
                type="button"
                onClick={() => setIsCreating(true)}
                className="text-xs shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 flex items-center gap-1"
              >
                <FolderPlus size={14} /> Yeni Proje
              </Button>
            </div>

            {selectedProjectId && (
              <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs">
                <span className="text-amber-800 dark:text-amber-300">
                  Bu dosya bir projeye bağlı.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(null)
                    onClose()
                  }}
                  className="text-red-600 dark:text-red-400 hover:underline font-bold flex items-center gap-1 text-[11px]"
                >
                  <Trash2 size={12} /> Proje Bağlantısını Kaldır
                </button>
              </div>
            )}

            <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
              {isLoadingProjeler ? (
                <div className="py-8 text-center text-xs text-slate-400">Yükleniyor...</div>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Kayıtlı proje bulunamadı. &quot;Yeni Proje&quot; butonundan ekleyebilirsiniz.
                </div>
              ) : (
                filtered.map((p) => {
                  const isSelected = selectedProjectId === p.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelect(p)
                        onClose()
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full mt-1 shrink-0"
                          style={{ backgroundColor: p.renk || '#3b82f6' }}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                              {p.proje_kodu}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {p.proje_adi}
                            </span>
                          </div>
                          {p.aciklama && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{p.aciklama}</p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                            <span>Bütçe: {Number(p.toplam_butce).toLocaleString('tr-TR')} ₺</span>
                            <span>•</span>
                            <span>İş Sayısı: {p.dosya_sayisi || 0}</span>
                            <span>•</span>
                            <span>
                              Harcanan: {Number(p.harcanan_tutar).toLocaleString('tr-TR')} ₺ (%
                              {p.harcama_yuzdesi || 0})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check size={14} />
                          </span>
                        ) : (
                          <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5">
                            Seç
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
