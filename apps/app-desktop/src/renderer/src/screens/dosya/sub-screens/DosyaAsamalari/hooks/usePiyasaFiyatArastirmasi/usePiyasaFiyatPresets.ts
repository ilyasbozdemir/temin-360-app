import { useState, useEffect, useMemo } from 'react'
import { normalizeForMatch } from '../../useDosyaAsamasiSablons'

export function usePiyasaFiyatPresets(sablons: any[], activeStarredDocs: string[]) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      return localStorage.getItem('dta_selected_preset_id') || ''
    } catch {
      return ''
    }
  })
  const [isChangingPreset, setIsChangingPreset] = useState(false)
  const [presets, setPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('dta_document_presets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    const handlePresetsChange = () => {
      try {
        const saved = localStorage.getItem('dta_document_presets')
        setPresets(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error(e)
      }
    }
    window.addEventListener('dta_presets_changed', handlePresetsChange)
    return () => window.removeEventListener('dta_presets_changed', handlePresetsChange)
  }, [])

  const stageSablons = useMemo(() => {
    return sablons.filter(
      (s) =>
        s.kategori === '2-piyasa-fiyat-arastirmasi' || s.kategori === '2. Piyasa Fiyat Araştırması'
    )
  }, [sablons])

  function getCleanName(ad: string): string {
    let clean = ad
    const matchStatus = clean.match(/^\[(.*?)\]\s*(.*)$/)
    if (matchStatus) clean = matchStatus[2].trim()
    return clean
  }

  const starredDocsForFilter = useMemo(() => {
    const activePresetId = selectedPresetId || (presets.length > 0 ? presets[0].id : '')
    if (activePresetId) {
      const preset = presets.find((p) => p.id === activePresetId)
      return preset ? preset.docs : []
    }
    return activeStarredDocs || []
  }, [selectedPresetId, presets, activeStarredDocs])

  const hasStarred = useMemo(() => {
    return stageSablons.some((sablon) => {
      const cleanName = getCleanName(sablon.ad)
      return starredDocsForFilter.some((d) => normalizeForMatch(d) === normalizeForMatch(cleanName))
    })
  }, [stageSablons, starredDocsForFilter])

  const [manualFilter, setManualFilter] = useState<'all' | 'starred' | null>(null)

  const filter = manualFilter !== null ? manualFilter : hasStarred ? 'starred' : 'all'

  const displaySablons = useMemo(() => {
    if (filter === 'starred') {
      return stageSablons.filter((sablon) => {
        const cleanName = getCleanName(sablon.ad)
        return starredDocsForFilter.some(
          (d) => normalizeForMatch(d) === normalizeForMatch(cleanName)
        )
      })
    }
    return stageSablons
  }, [filter, starredDocsForFilter, stageSablons])

  return {
    selectedPresetId,
    setSelectedPresetId,
    isChangingPreset,
    setIsChangingPreset,
    presets,
    stageSablons,
    getCleanName,
    filter,
    setManualFilter,
    displaySablons
  }
}
