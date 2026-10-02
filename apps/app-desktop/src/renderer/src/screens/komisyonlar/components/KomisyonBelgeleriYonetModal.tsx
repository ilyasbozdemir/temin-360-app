import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Filter,
  RefreshCw,
  RotateCcw,
  Search,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { TemplateRegistryService } from '@temin360/document-templates'

interface KomisyonBelgeleriYonetModalProps {
  isOpen: boolean
  onClose: () => void
  komisyonId: number | null
  komisyonAdi?: string
}

const CATEGORY_MAP: Record<string, string> = {
  all: 'Tüm Kategoriler',
  '1-ihtiyac-tespiti-ve-baslangic': '1. İhtiyaç Tespiti & Başlangıç',
  '2-piyasa-fiyat-arastirmasi': '2. Piyasa Fiyat Araştırması',
  '3-siparis-ve-sozlesme': '3. Sipariş & Sözleşme',
  '4-kabul-ve-odeme-islemleri': '4. Kabul & Ödeme İşlemleri'
}

export function KomisyonBelgeleriYonetModal({
  isOpen,
  onClose,
  komisyonId,
  komisyonAdi = 'Komisyon'
}: KomisyonBelgeleriYonetModalProps): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'info' | 'error'
    text: string
  } | null>(null)

  // Sistemdeki tüm standart şablonlar (Template Registry)
  const allTemplates = useMemo(() => TemplateRegistryService.getAllTemplates(), [])

  // Bu komisyon türü için varsayılan önerilen şablonlar
  const defaultTemplates = useMemo(() => {
    return TemplateRegistryService.getTemplatesForCommissionType(komisyonAdi)
  }, [komisyonAdi])

  const defaultIds = useMemo(() => {
    return new Set(defaultTemplates.map((t) => t.id))
  }, [defaultTemplates])

  // Veritabanındaki kayıtlı özel şablon atamalarını çek
  const { data: dbSablonIds = null, isLoading } = useQuery<string[]>({
    queryKey: ['komisyon_sablon_ids', komisyonId],
    queryFn: async () => {
      if (!komisyonId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT sablon_id FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
        [komisyonId]
      )
      if (res && res.success && Array.isArray(res.data)) {
        return res.data.map((r: any) => String(r.sablon_id))
      }
      return []
    },
    enabled: isOpen && !!komisyonId
  })

  // Modal açıldığında state'i senkronize et
  useEffect(() => {
    if (!isOpen) return
    setStatusMessage(null)
    setSearchTerm('')
    setSelectedCategory('all')

    if (dbSablonIds && dbSablonIds.length > 0) {
      setIsCustomMode(true)
      setSelectedIds(new Set(dbSablonIds))
    } else {
      setIsCustomMode(false)
      setSelectedIds(new Set(defaultIds))
    }
  }, [isOpen, dbSablonIds, defaultIds])

  // Şablon filtreleme
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory
      const query = searchTerm.toLowerCase().trim()
      const matchSearch =
        !query ||
        t.title.toLowerCase().includes(query) ||
        (t.description || '').toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      return matchCat && matchSearch
    })
  }, [allTemplates, selectedCategory, searchTerm])

  const handleToggleTemplate = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    setIsCustomMode(true)
  }

  const handleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      filteredTemplates.forEach((t) => next.add(t.id))
      return next
    })
    setIsCustomMode(true)
  }

  const handleDeselectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      filteredTemplates.forEach((t) => next.delete(t.id))
      return next
    })
    setIsCustomMode(true)
  }

  const handleResetToDefaults = () => {
    setSelectedIds(new Set(defaultIds))
    setIsCustomMode(false)
    setStatusMessage({
      type: 'info',
      text: 'Varsayılan sistem şablonları yüklendi. Değişiklikleri uygulamak için "Kaydet" butonuna basabilirsiniz.'
    })
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!komisyonId) throw new Error('Komisyon kimliği bulunamadı.')

      if (!isCustomMode) {
        // Varsayılan mod seçildi: Veritabanındaki özel tanımları silerek sisteme geri dön
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
          [komisyonId]
        )
      } else {
        // Özel mod: Mevcutları sil ve seçilenleri yaz
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
          [komisyonId]
        )
        for (const sablonId of Array.from(selectedIds)) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id) VALUES (?, ?)',
            [komisyonId, sablonId]
          )
        }
      }
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      queryClient.invalidateQueries({ queryKey: ['komisyon_detay', komisyonId] })
      queryClient.invalidateQueries({ queryKey: ['komisyon_sablon_ids', komisyonId] })
      queryClient.invalidateQueries({ queryKey: ['dosya_komisyonlar'] })
      queryClient.invalidateQueries({ queryKey: ['document_preview'] })

      setStatusMessage({
        type: 'success',
        text: 'Komisyon belge şablonları başarıyla kaydedildi.'
      })
      setTimeout(() => onClose(), 600)
    },
    onError: (err: any) => {
      setStatusMessage({
        type: 'error',
        text: 'Kaydedilirken hata oluştu: ' + (err.message || 'Bilinmeyen hata')
      })
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Üretilebilir Belgeleri Yönet: ${komisyonAdi}`}
      description="Bu komisyon tarafından üretilebilecek resmi evrak ve şablonları seçin. İsterseniz varsayılan sisteme geri dönebilirsiniz."
      className="max-w-4xl"
    >
      <div className="flex flex-col max-h-[78vh] -mx-6 -my-4 px-6 py-4">
        {/* Durum Mesajı */}
        {statusMessage && (
          <div
            className={`mb-3.5 p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : statusMessage.type === 'info'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : statusMessage.type === 'info' ? (
              <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Üst Bilgi Barı & Mod Göstergesi */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-500" />
              Aktif Belge Sayısı:
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full">
              {selectedIds.size} / {allTemplates.length}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isCustomMode
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
              }`}
            >
              {isCustomMode ? '⚙️ Özelleştirilmiş Mod' : '✨ Varsayılan Sistem Modu'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer"
            title="Sistemin varsayılan komisyon belgelerine sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Varsayılana Dön
          </button>
        </div>

        {/* Filtre ve Arama Barı */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {/* Arama Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Belge adı veya açıklama ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Kategori Filtresi */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Toplu Seçim Butonları */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Tümünü Seç
            </button>
            <button
              type="button"
              onClick={handleDeselectAllFiltered}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Temizle
            </button>
          </div>
        </div>

        {/* Şablon Listesi */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-2xl p-2 divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-950/60 max-h-[50vh]">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              Şablonlar yükleniyor...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              Arama kriterlerinize uygun belge şablonu bulunamadı.
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const isSelected = selectedIds.has(template.id)
              const isRecommended = defaultIds.has(template.id)

              return (
                <div
                  key={template.id}
                  onClick={() => handleToggleTemplate(template.id)}
                  className={`p-3 rounded-xl flex items-start gap-3 transition-all cursor-pointer select-none my-1 ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/80 shadow-2xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-blue-950 dark:text-blue-100'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {template.title}
                      </span>

                      {/* Kategori Rozeti */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {CATEGORY_MAP[template.category] || template.category}
                      </span>

                      {/* Önerilen Rozeti */}
                      {isRecommended && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          ✓ Önerilen Default
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Alt Aksiyonlar */}
        <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saveMutation.isPending}
          >
            İptal
          </Button>

          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-xs"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Kaydediliyor...
              </span>
            ) : (
              'Değişiklikleri Kaydet'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
