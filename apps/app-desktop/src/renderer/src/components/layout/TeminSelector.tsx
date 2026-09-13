import React, { useEffect, useRef, useState } from 'react'
import {
  Building,
  ChevronDown,
  Edit,
  Eye,
  FileText,
  FolderClosed,
  Gavel,
  Hammer,
  Layers,
  LogOut,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  X,
  Zap
} from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useTabStore } from '../../store/tabStore'
import { useDosyalarHooks } from '../../screens/dosyalar/dosyalar.hooks'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '../../utils/cn'
import { YeniDosyaSecimModal } from '../modals/YeniDosyaSecimModal'
import { formatDosyaNo } from '../../utils/formatDosyaNo'
import { DosyaDataInspectorModal } from '../../screens/dosyalar/components/DosyaDataInspectorModal'

export function TeminSelector(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [showYeniDosyaModal, setShowYeniDosyaModal] = useState(false)
  const [showInspector, setShowInspector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Global Tedarik / Satınalma Modu ('dogrudan_temin' vs 'ihale')
  const [procurementMode, setProcurementMode] = useState<'dogrudan_temin' | 'ihale'>(() => {
    return (
      (localStorage.getItem('temin_procurement_mode') as 'dogrudan_temin' | 'ihale') ||
      'dogrudan_temin'
    )
  })

  const isDt = procurementMode === 'dogrudan_temin'

  // Alt Kategori Filtresi
  const [subFilter, setSubFilter] = useState<string>('mode_default')

  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore()
  const { dosyalar, isLoadingDosyalar } = useDosyalarHooks()
  const { addTab } = useTabStore()
  const navigate = useNavigate()

  // Global mod değişimini dinle (Header veya diğer bileşenlerden tetiklenen)
  useEffect(() => {
    const handleModeEvent = (e: Event): void => {
      const customEvent = e as CustomEvent<{ mode: 'dogrudan_temin' | 'ihale' }>
      if (customEvent.detail?.mode) {
        setProcurementMode(customEvent.detail.mode)
        setSubFilter('mode_default')
      }
    }
    window.addEventListener('procurement-mode-change', handleModeEvent)
    return () => window.removeEventListener('procurement-mode-change', handleModeEvent)
  }, [])

  const setGlobalMode = (mode: 'dogrudan_temin' | 'ihale'): void => {
    setProcurementMode(mode)
    setSubFilter('mode_default')
    localStorage.setItem('temin_procurement_mode', mode)
    window.dispatchEvent(
      new CustomEvent('procurement-mode-change', {
        detail: { mode }
      })
    )
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedDosya = dosyalar.find((d) => d.id === activeDosyaId)

  // İhale veya Yapım/Hakediş kontrolü
  const isIhaleOrYapim = (d: any): boolean =>
    d.tur === 'hakedis' ||
    d.tur === 'ihale' ||
    d.ihale_sekli?.toLowerCase().includes('hakedis') ||
    d.ihale_sekli?.toLowerCase().includes('açık') ||
    d.ihale_sekli?.toLowerCase().includes('pazarlık') ||
    d.ihale_tipi === 'Hakediş' ||
    d.ihale_tipi === 'Açık İhale' ||
    d.ihale_tipi === 'Pazarlık' ||
    d.temin_no?.toUpperCase().startsWith('İH-') ||
    d.temin_no?.toUpperCase().startsWith('IH-')


  // Dinamik filtreleme
  const filteredDosyalar = dosyalar.filter((d) => {
    if (d.is_deleted === 1) return false

    const isIhale = isIhaleOrYapim(d)

    if (subFilter === 'mode_default') {
      if (isDt && isIhale) return false
      if (!isDt && !isIhale) return false
    } else if (subFilter === 'dt_all') {
      if (isIhale) return false
    } else if (subFilter === 'dt_mal') {
      if (isIhale || d.tur !== 'mal') return false
    } else if (subFilter === 'dt_hizmet') {
      if (isIhale || (d.tur !== 'hizmet' && d.tur !== 'yapim_isi')) return false
    } else if (subFilter === 'ihale_all') {
      if (!isIhale) return false
    } else if (subFilter === 'ihale_acik') {
      if (!isIhale || (!d.ihale_tipi?.includes('Açık') && !d.ihale_sekli?.toLowerCase().includes('açık'))) return false
    } else if (subFilter === 'ihale_pazarlik') {
      if (!isIhale || (!d.ihale_tipi?.includes('Pazarlık') && !d.ihale_sekli?.toLowerCase().includes('pazarlık'))) return false
    } else if (subFilter === 'ihale_yapim') {
      const isYapim = d.tur === 'yapim_isi' || d.tur === 'hakedis' || d.ihale_sekli?.toLowerCase().includes('yapım') || d.ihale_sekli?.toLowerCase().includes('hakedis') || d.ihale_tipi === 'Hakediş'
      if (!isYapim) return false
    } else if (subFilter === 'ihale_hizmet') {
      const isHizmet = d.tur === 'hizmet' || d.ihale_sekli?.toLowerCase().includes('hizmet')
      if (!isHizmet) return false
    }
    // subFilter === 'all' ise tüm silinmemiş dosyaları göster

    const q = searchQuery.toLowerCase().trim()
    if (!q) return true

    return (
      d.konu?.toLowerCase().includes(q) ||
      d.temin_no?.toLowerCase().includes(q) ||
      String(d.id).includes(q) ||
      d.isin_aciklamasi?.toLowerCase().includes(q)
    )
  })

  const handleSelect = (id: number): void => {
    setActiveDosyaId(id)
    setIsOpen(false)
    navigate({ to: '/takip' })
  }

  const handleCloseDosya = (): void => {
    setActiveDosyaId(null)
    setIsOpen(false)
    navigate({ to: '/' })
  }

  const handleCreateYeniDosya = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setIsOpen(false)
    setShowYeniDosyaModal(true)
  }

  const turLabel: Record<string, string> = {
    mal: 'Mal Alımı',
    hizmet: 'Hizmet',
    yapim_isi: 'Yapım İşi',
    danismanlik: 'Danışmanlık',
    hakedis: 'Hakediş',
    ihale: 'İhale'
  }

  const turColor: Record<string, string> = {
    mal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    hizmet:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    yapim_isi:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danismanlik:
      'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    hakedis:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    ihale:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  }

  const getMevzuatBadgeInfo = (dosya: any) => {
    const itemIsIhale = isIhaleOrYapim(dosya)
    const sekli = (dosya?.ihale_sekli || '').toLowerCase()
    const tipi = (dosya?.ihale_tipi || '').toLowerCase()

    if (itemIsIhale) {
      if (sekli.includes('açık') || tipi.includes('açık') || sekli.includes('19')) {
        return {
          label: '4734 / Md. 19 (Açık)',
          className: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
        }
      }
      if (sekli.includes('pazarlık') || tipi.includes('pazarlık') || sekli.includes('21')) {
        return {
          label: '4734 / Md. 21 (Pazarlık)',
          className: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60'
        }
      }
      if (sekli.includes('hakedis') || tipi.includes('hakediş')) {
        return {
          label: 'Sözleşme & Hakediş',
          className: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
        }
      }
      return {
        label: 'İhale & Sözleşme',
        className: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
      }
    }

    // 4734 / Md. 22 Doğrudan Temin Fıkra & Bent Detayları (Ezber olmaksızın mevzuat tespiti)
    if (sekli.includes('22/a') || sekli.includes('22-a')) {
      return {
        label: '4734 / 22-a (Tek Kaynak)',
        className: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
      }
    }
    if (sekli.includes('22/b') || sekli.includes('22-b')) {
      return {
        label: '4734 / 22-b (Özel Hak/Patent)',
        className: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
      }
    }
    if (sekli.includes('22/c') || sekli.includes('22-c')) {
      return {
        label: '4734 / 22-c (Mevcut Uyumluluk)',
        className: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
      }
    }
    if (sekli.includes('22/e') || sekli.includes('22-e')) {
      return {
        label: '4734 / 22-e (Taşınmaz/Kira)',
        className: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
      }
    }
    if (sekli.includes('22/f') || sekli.includes('22-f')) {
      return {
        label: '4734 / 22-f (İlaç/Tıbbi Cihaz)',
        className: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
      }
    }

    // Doğrudan Temin Tür Standartları (2. Görseldeki Tam Detaylar)
    if (dosya?.tur === 'mal') {
      return {
        label: '4734 / 22-d & 22-a',
        className: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
      }
    }
    if (dosya?.tur === 'hizmet') {
      return {
        label: '4734 / 22-d',
        className: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60'
      }
    }
    if (dosya?.tur === 'yapim_isi') {
      return {
        label: '4734 / 22-d',
        className: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
      }
    }
    if (dosya?.tur === 'danismanlik') {
      return {
        label: 'Teknik & Müşavirlik',
        className: 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200/80 dark:border-pink-800/60'
      }
    }

    return {
      label: '4734 / 22-d',
      className: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60'
    }
  }

  const formatMoney = (val: number): string =>
    val
      ? val.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      : '0,00'

  const getDosyaNoLabel = (d: any): string => formatDosyaNo(d)

  // Seçili dosyanın İhale mi DT mi olduğunu tespit et
  const selectedIsIhale = selectedDosya ? isIhaleOrYapim(selectedDosya) : false

  return (
    <>
      <div className="relative" ref={containerRef}>
        {selectedDosya ? (
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`group flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-white dark:bg-slate-850 border transition-all duration-200 shadow-2xs hover:shadow-xs min-w-70 max-w-[850px] w-auto cursor-pointer select-none ${
              selectedIsIhale
                ? 'border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20'
                : 'border-blue-200 dark:border-blue-800/80 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/20'
            }`}
            title="Dosya Değiştir"
          >
            <div
              className={`p-1.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                selectedIsIhale
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}
            >
              {selectedIsIhale ? (
                <Gavel className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    selectedIsIhale
                      ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
                      : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40'
                  }`}
                >
                  {getDosyaNoLabel(selectedDosya)}
                </span>
                {selectedDosya.tur && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border ${
                      turColor[selectedDosya.tur] ??
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {turLabel[selectedDosya.tur] ?? selectedDosya.tur}
                  </span>
                )}
                {(() => {
                  const mevzuat = getMevzuatBadgeInfo(selectedDosya)
                  return (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${mevzuat.className}`}
                    >
                      {mevzuat.label}
                    </span>
                  )
                })()}
              </div>
              <div
                className={`text-xs font-bold truncate leading-tight transition-colors ${
                  selectedIsIhale
                    ? 'text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
                    : 'text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300'
                }`}
              >
                {selectedDosya.konu}
              </div>
            </div>

            {selectedDosya.yaklasik_maliyet ? (
              <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 font-mono whitespace-nowrap">
                  ₺{formatMoney(selectedDosya.yaklasik_maliyet)}
                </span>
              </div>
            ) : null}

            {/* Dosya Detay / Veri Denetçisi (Inspector) Modalını Aç */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowInspector(true)
              }}
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all shrink-0 active:scale-90 cursor-pointer"
              title="Dosya Verilerini İncele (Sekmeli Görünüm & Denetçi)"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Dosyayı Düzenle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                addTab(`/dosyalar/yeni?id=${selectedDosya.id}`)
                navigate({ to: `/dosyalar/yeni?id=${selectedDosya.id}` })
              }}
              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all shrink-0 active:scale-90 cursor-pointer"
              title="Dosya Formunu Düzenle"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCloseDosya()
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0 active:scale-90 cursor-pointer"
              title="Dosyayı Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />

            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-5 py-1.5 rounded-2xl transition-all text-xs font-semibold border border-dashed min-w-70 justify-center cursor-pointer shadow-2xs ${
              isDt
                ? 'bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-50 hover:border-blue-400'
                : 'bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 hover:bg-indigo-50 hover:border-indigo-400'
            }`}
            title="Dosya Seçmek İçin Tıkla"
          >
            {isDt ? <FileText className="w-4 h-4 text-blue-500" /> : <Gavel className="w-4 h-4 text-indigo-500" />}
            <span>
              {isDt
                ? 'Çalışmak İstediğiniz Doğrudan Temin Dosyasını Seçin (KİK Md. 22)...'
                : 'Çalışmak İstediğiniz İhale veya Yapım İşi Dosyasını Seçin (KİK Md. 19 / 21)...'}
            </span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-1.5',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        )}

        {/* AÇILIR DOSYA SEÇİM POPUP MODALI */}
        {isOpen && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[860px] max-w-[92vw] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 select-text"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {/* 1. ÜST SEGMENT MOD SEÇİCİ & YENİ DOSYA EKLE BUTONU */}
            <div className="flex items-center justify-between gap-3 p-1.5 bg-slate-100/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800 mb-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setGlobalMode('dogrudan_temin')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isDt
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Doğrudan Temin (KİK 22)</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isDt ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {dosyalar.filter((d) => d.is_deleted !== 1 && !isIhaleOrYapim(d)).length}
                  </span>
                </button>

                <button
                  onClick={() => setGlobalMode('ihale')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isDt
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900'
                  }`}
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>İhale Süreçleri (KİK 19/21)</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    !isDt ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {dosyalar.filter((d) => d.is_deleted !== 1 && isIhaleOrYapim(d)).length}
                  </span>
                </button>
              </div>

              <button
                onClick={handleCreateYeniDosya}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isDt
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/40'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40'
                }`}
                title="Yeni Dosya Tanımla"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isDt ? 'Yeni Doğrudan Temin' : 'Yeni İhale Dosyası'}</span>
              </button>
            </div>

            {/* 2. ALT FİLTRELEME ETİKETLERİ */}
            <div className="flex items-center gap-1 px-1 mb-2 text-[11px] font-semibold overflow-x-auto custom-scrollbar pb-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Filtre:
              </span>

              {isDt ? (
                <>
                  <button
                    onClick={() => setSubFilter('mode_default')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'mode_default'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Tüm Doğrudan Teminler ({dosyalar.filter((d) => d.is_deleted !== 1 && !isIhaleOrYapim(d)).length})
                  </button>
                  <button
                    onClick={() => setSubFilter('dt_mal')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'dt_mal'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Mal Alımları (22/d)
                  </button>
                  <button
                    onClick={() => setSubFilter('dt_hizmet')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'dt_hizmet'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Hizmet & Onarım İşleri
                  </button>
                  <button
                    onClick={() => setSubFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'all'
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Tüm Arşiv (Hepsi)
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSubFilter('mode_default')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'mode_default'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Tüm İhale Dosyaları ({dosyalar.filter((d) => d.is_deleted !== 1 && isIhaleOrYapim(d)).length})
                  </button>
                  <button
                    onClick={() => setSubFilter('ihale_acik')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'ihale_acik'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Açık İhale (Md. 19)
                  </button>
                  <button
                    onClick={() => setSubFilter('ihale_pazarlik')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'ihale_pazarlik'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Pazarlık Usulü (Md. 21)
                  </button>
                  <button
                    onClick={() => setSubFilter('ihale_yapim')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'ihale_yapim'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Hammer className="w-3 h-3 inline mr-1" />
                    Yapım & Hakediş
                  </button>
                  <button
                    onClick={() => setSubFilter('ihale_hizmet')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'ihale_hizmet'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Building className="w-3 h-3 inline mr-1" />
                    Hizmet İhaleleri
                  </button>
                  <button
                    onClick={() => setSubFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      subFilter === 'all'
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Tüm Arşiv (Hepsi)
                  </button>
                </>
              )}
            </div>

            {/* 3. ARAMA ÇUBUĞU */}
            <div className="relative flex items-center px-1 mb-2">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  isDt
                    ? 'Doğrudan temin no, alım konusu veya birim ara...'
                    : 'İhale kayıt no, iş konusu, yapım/hakediş veya birim ara...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                className={`w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs focus:outline-none focus:ring-2 transition-all select-text ${
                  isDt
                    ? 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                autoFocus
              />
            </div>

            {/* 4. DOSYA LİSTESİ */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-1 p-1">
              {isLoadingDosyalar ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">
                  Veritabanı taranıyor...
                </div>
              ) : filteredDosyalar.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
                  <FolderClosed className="w-8 h-8 opacity-40" />
                  <span>
                    {isDt
                      ? 'Bu kriterlere uygun Doğrudan Temin dosyası bulunamadı.'
                      : 'Bu kriterlere uygun İhale veya Yapım İşi dosyası bulunamadı.'}
                  </span>
                  <button
                    onClick={handleCreateYeniDosya}
                    className={`mt-2 px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                      isDt ? 'bg-blue-600 hover:bg-blue-500' : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {isDt ? 'Yeni Doğrudan Temin Oluştur' : 'Yeni İhale Dosyası Oluştur'}
                  </button>
                </div>
              ) : (
                filteredDosyalar.map((dosya) => {
                  const itemIsIhale = isIhaleOrYapim(dosya)
                  const isActive = activeDosyaId === dosya.id
                  return (
                    <div
                      key={dosya.id}
                      onClick={() => handleSelect(dosya.id)}
                      className={`group w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                        isActive
                          ? itemIsIhale
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800/80 shadow-2xs'
                            : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800/80 shadow-2xs'
                          : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isActive
                            ? itemIsIhale
                              ? 'bg-indigo-600 text-white'
                              : 'bg-blue-600 text-white'
                            : itemIsIhale
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {itemIsIhale ? (
                          <Gavel className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              itemIsIhale
                                ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
                                : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40'
                            }`}
                          >
                            {getDosyaNoLabel(dosya)}
                          </span>

                          {dosya.tur && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border ${
                                turColor[dosya.tur] ??
                                'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {turLabel[dosya.tur] ?? dosya.tur}
                            </span>
                          )}

                          {(() => {
                            const mevzuat = getMevzuatBadgeInfo(dosya)
                            return (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${mevzuat.className}`}
                              >
                                {mevzuat.label}
                              </span>
                            )
                          })()}
                        </div>

                        <div
                          className={`text-xs font-bold truncate ${
                            isActive
                              ? itemIsIhale
                                ? 'text-indigo-900 dark:text-indigo-200 font-extrabold'
                                : 'text-blue-900 dark:text-blue-200 font-extrabold'
                              : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}
                        >
                          {dosya.konu}
                        </div>
                      </div>

                      {dosya.yaklasik_maliyet ? (
                        <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
                          <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 font-mono whitespace-nowrap">
                            ₺{formatMoney(dosya.yaklasik_maliyet)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>

            {/* 5. ALT BİLGİ & KAPATMA */}
            {activeDosyaId && (
              <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 flex justify-between items-center text-xs px-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Aktif dosya işlemlerini tamamladıktan sonra kapatabilirsiniz.
                </span>
                <button
                  onClick={handleCloseDosya}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-650 dark:text-red-405 hover:text-white hover:bg-red-600 bg-red-500/10 border border-red-500/20 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <LogOut className="w-3 h-3" />
                  Dosyayı Kapat
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <YeniDosyaSecimModal
        isOpen={showYeniDosyaModal}
        onClose={() => setShowYeniDosyaModal(false)}
      />

      {selectedDosya && (
        <DosyaDataInspectorModal
          isOpen={showInspector}
          onClose={() => setShowInspector(false)}
          dosya={selectedDosya}
        />
      )}
    </>
  )
}
