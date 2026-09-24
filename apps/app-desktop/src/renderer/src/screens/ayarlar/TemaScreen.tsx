import React, { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { useSettingsStore } from '../../store/settingsStore'
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  Info,
  Palette,
  RefreshCw,
  Save,
  Sliders,
  Sparkles,
  Upload
} from 'lucide-react'

interface ThemeConfig {
  name?: string
  light: string
  dark: string
}

interface VariableMeta {
  key: string
  name: string
  category: 'primary' | 'text-bg' | 'sidebar'
  description: string
  defaultLight: string
  defaultDark: string
}

const themeVariablesMeta: VariableMeta[] = [
  {
    key: '--primary-100',
    name: 'Birincil Açık/Soft',
    category: 'primary',
    description:
      'Birincil soft renk. Seçili elemanların arka planı, rozet ve aktif kart arka planlarında kullanılır.',
    defaultLight: '#e4e4e7',
    defaultDark: '#27272a'
  },
  {
    key: '--primary-200',
    name: 'Birincil Orta/Odak',
    category: 'primary',
    description:
      'Birincil orta ton. Hover/odaklanma kenarlıkları ve aktif buton gölgelerinde tercih edilir.',
    defaultLight: '#d4d4d8',
    defaultDark: '#3f3f46'
  },
  {
    key: '--primary-300',
    name: 'Birincil Koyu/Kontrast',
    category: 'primary',
    description:
      'Birincil koyu/yüksek kontrast ton. Başlıklar, vurgulanması gereken koyu etiket metinleri için.',
    defaultLight: '#09090b',
    defaultDark: '#f4f4f5'
  },
  {
    key: '--accent-100',
    name: 'Vurgu Soft/İkincil',
    category: 'primary',
    description:
      'Vurgu/İkincil soft renk. Alternatif butonlar, etiketler veya ikincil aktif durumlar için.',
    defaultLight: '#27272a',
    defaultDark: '#fafafa'
  },
  {
    key: '--accent-200',
    name: 'Birincil Eylem Rengi',
    category: 'primary',
    description:
      'Birincil eylem rengi. Kaydet butonları, linkler ve ana eylemlerin arka plan rengi.',
    defaultLight: '#18181b',
    defaultDark: '#f4f4f5'
  },
  {
    key: '--text-100',
    name: 'Ana Metin Rengi',
    category: 'text-bg',
    description: 'Ana okuma metni (koyu/açık).',
    defaultLight: '#09090b',
    defaultDark: '#f4f4f5'
  },
  {
    key: '--text-200',
    name: 'Yardımcı Metin Rengi',
    category: 'text-bg',
    description: 'Açıklama ve alt başlık metinleri.',
    defaultLight: '#71717a',
    defaultDark: '#a1a1aa'
  },
  {
    key: '--bg-100',
    name: 'Ana Arka Plan',
    category: 'text-bg',
    description: 'Ana sayfa arka planı.',
    defaultLight: '#ffffff',
    defaultDark: '#09090b'
  },
  {
    key: '--bg-200',
    name: 'Kutu/Kart Arka Planı',
    category: 'text-bg',
    description: 'Kart ve kutuların arka plan rengi.',
    defaultLight: '#fafafa',
    defaultDark: '#18181b'
  },
  {
    key: '--bg-300',
    name: 'Kenarlık & Girdi Arka Planı',
    category: 'text-bg',
    description: 'Kenarlık çizgileri, buton/input sınırları ve girdi alanlarının arka planları.',
    defaultLight: '#f4f4f5',
    defaultDark: '#09090b'
  },
  {
    key: '--sidebar-bg',
    name: 'Menü Arka Planı',
    category: 'sidebar',
    description: 'Sol menü (Sidebar) arka plan rengi.',
    defaultLight: '#09090b',
    defaultDark: '#09090b'
  },
  {
    key: '--sidebar-text',
    name: 'Menü Metin Rengi',
    category: 'sidebar',
    description: 'Sol menü genel yazı rengi.',
    defaultLight: '#a1a1aa',
    defaultDark: '#a1a1aa'
  },
  {
    key: '--sidebar-border',
    name: 'Menü Sınır Rengi',
    category: 'sidebar',
    description: 'Sol menü sağ sınır çizgisi ve ayraç çizgilerinin rengi.',
    defaultLight: '#27272a',
    defaultDark: '#18181b'
  },
  {
    key: '--sidebar-hover-bg',
    name: 'Menü Hover Arka Planı',
    category: 'sidebar',
    description: 'Sol menü elemanlarının hover durumundaki arka plan rengi.',
    defaultLight: '#27272a',
    defaultDark: '#18181b'
  },
  {
    key: '--sidebar-hover-text',
    name: 'Menü Hover Metin Rengi',
    category: 'sidebar',
    description: 'Sol menü elemanlarının hover durumundaki yazı rengi.',
    defaultLight: '#ffffff',
    defaultDark: '#ffffff'
  },
  {
    key: '--sidebar-active-bg',
    name: 'Menü Aktif Arka Planı',
    category: 'sidebar',
    description: 'Sol menüde seçili olan elemanın aktif arka plan rengi.',
    defaultLight: 'rgba(255, 255, 255, 0.08)',
    defaultDark: 'rgba(255, 255, 255, 0.08)'
  },
  {
    key: '--sidebar-active-text',
    name: 'Menü Aktif Metin Rengi',
    category: 'sidebar',
    description: 'Sol menüde seçili olan elemanın aktif yazı rengi.',
    defaultLight: '#ffffff',
    defaultDark: '#ffffff'
  },
  {
    key: '--sidebar-active-border',
    name: 'Menü Aktif Kenarlık Rengi',
    category: 'sidebar',
    description: 'Sol menüde seçili olan elemanın aktif sol kenarlık çizgisi rengi.',
    defaultLight: 'rgba(255, 255, 255, 0.15)',
    defaultDark: 'rgba(255, 255, 255, 0.15)'
  }
]

// Helper to parse CSS variables from text to an object
const parseCssVariables = (cssText: string): Record<string, string> => {
  const result: Record<string, string> = {}
  if (!cssText) return result
  const lines = cssText.split('\n')
  lines.forEach((line) => {
    const parts = line.split(':')
    if (parts.length >= 2) {
      const key = parts[0].trim()
      const value = parts.slice(1).join(':').replace(';', '').trim()
      if (key.startsWith('--')) {
        result[key] = value
      }
    }
  })
  return result
}

// Helper to convert an object of CSS variables back to a CSS text block
const stringifyCssVariables = (vars: Record<string, string>): string => {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n')
}

const getInitialPlaygroundVars = (
  cssText: string,
  mode: 'light' | 'dark'
): Record<string, string> => {
  const parsed = parseCssVariables(cssText)
  const result: Record<string, string> = {}
  themeVariablesMeta.forEach((v) => {
    result[v.key] = parsed[v.key] || (mode === 'light' ? v.defaultLight : v.defaultDark)
  })
  return result
}

// Helper to parse rgba(r, g, b, a) to hex and opacity
const parseRgba = (rgbaStr: string): { hex: string; opacity: number; isRgba: boolean } => {
  if (!rgbaStr) return { hex: '#000000', opacity: 1, isRgba: false }
  const match = rgbaStr.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/)
  if (match) {
    const r = parseInt(match[1], 10)
    const g = parseInt(match[2], 10)
    const b = parseInt(match[3], 10)
    const a = parseFloat(match[4])
    const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
    return { hex, opacity: a, isRgba: true }
  }
  return { hex: rgbaStr, opacity: 1, isRgba: false }
}

// Helper to convert hex and opacity back to rgba
const toRgbaStr = (hex: string, opacity: number): string => {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export default function TemaScreen({
  isEmbedded = false
}: {
  isEmbedded?: boolean
}): React.JSX.Element {
  const { themeLightVars, themeDarkVars, setThemeLightVars, setThemeDarkVars, loadSettings } =
    useSettingsStore()

  const [localLight, setLocalLight] = useState('')
  const [localDark, setLocalDark] = useState('')
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importJsonText, setImportJsonText] = useState('')

  // New Designer Playground states
  const [activeTab, setActiveTab] = useState<'presets' | 'designer'>('presets')
  const [designerMode, setDesignerMode] = useState<'light' | 'dark'>('light')
  const [playgroundVars, setPlaygroundVars] = useState<Record<string, string>>({})
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'primary' | 'text-bg' | 'sidebar'
  >('all')
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiThemeDesc, setAiThemeDesc] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [lastRawSync, setLastRawSync] = useState({ light: '', dark: '' })

  useEffect(() => {
    loadSettings().then(() => {
      setLocalLight(themeLightVars || '')
      setLocalDark(themeDarkVars || '')
    })
  }, [themeLightVars, themeDarkVars, loadSettings])

  useEffect(() => {
    if (activeTab === 'designer') {
      const currentRaw = designerMode === 'light' ? localLight : localDark
      const lastRaw = designerMode === 'light' ? lastRawSync.light : lastRawSync.dark
      if (currentRaw !== lastRaw) {
        setPlaygroundVars(getInitialPlaygroundVars(currentRaw, designerMode))
        setLastRawSync((prev) => ({
          ...prev,
          [designerMode]: currentRaw
        }))
      }
    }
  }, [activeTab, designerMode, localLight, localDark, lastRawSync])

  const showStatus = (text: string, type: 'success' | 'error' = 'success'): void => {
    setNotification({ text, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handlePlaygroundVarChange = (key: string, value: string): void => {
    setPlaygroundVars((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const applyPlaygroundToEditor = (): void => {
    const cssText = stringifyCssVariables(playgroundVars)
    if (designerMode === 'light') {
      setLocalLight(cssText)
      setLastRawSync((prev) => ({ ...prev, light: cssText }))
    } else {
      setLocalDark(cssText)
      setLastRawSync((prev) => ({ ...prev, dark: cssText }))
    }
    showStatus('Tasarım değişkenleri editöre aktarıldı. Kaydetmeyi unutmayın!')
  }

  const savePlaygroundDirectly = async (): Promise<void> => {
    setSaving(true)
    try {
      const cssText = stringifyCssVariables(playgroundVars)
      let nextLight = localLight
      let nextDark = localDark

      if (designerMode === 'light') {
        nextLight = cssText
        setLocalLight(cssText)
        setLastRawSync((prev) => ({ ...prev, light: cssText }))
      } else {
        nextDark = cssText
        setLocalDark(cssText)
        setLastRawSync((prev) => ({ ...prev, dark: cssText }))
      }

      await window.electron.ipcRenderer.invoke('db:save-settings', {
        themeLightVars: nextLight,
        themeDarkVars: nextDark
      })

      setThemeLightVars(nextLight)
      setThemeDarkVars(nextDark)
      applyThemeVars(nextLight)
      applyThemeVars(nextDark)

      showStatus('Tema başarıyla kaydedildi ve uygulandı!')
    } catch (error) {
      console.error(error)
      showStatus('Ayarlar kaydedilirken bir hata oluştu.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const generateAiPrompt = (): void => {
    const styleDescription = aiThemeDesc.trim() || 'Modern Minimalist Mavi'
    const variablesExplanation = themeVariablesMeta
      .map(
        (v) =>
          `- ${v.key}: ${v.description} (Örnek: ${
            designerMode === 'light' ? v.defaultLight : v.defaultDark
          })`
      )
      .join('\n')

    const promptText = `Evraktron adlı Electron/React uygulamamız için ${
      designerMode === 'light' ? 'Açık (Light)' : 'Karanlık (Dark)'
    } tema rengi tasarlamanı istiyorum.
İstediğim tema stili / renk paleti açıklaması: "${styleDescription}".

Lütfen aşağıdaki CSS değişkenlerine uygun HEX (veya rgba) değerlerini belirle ve bana SADECE aşağıdaki JSON yapısında bir çıktı ver. Ekstra açıklama veya kod bloğu dışı metin ekleme, doğrudan kopyalayabileceğim bir JSON döndür.

Değişkenler ve anlamları:
${variablesExplanation}

İstenen JSON formatı:
{
  ${themeVariablesMeta.map((v) => `"${v.key}": "DEĞER"`).join(',\n  ')}
}

Not: --sidebar-active-bg için rgba(r, g, b, opaklık) formatında (örn: rgba(0, 229, 255, 0.15)) soft bir renk ver, diğer hepsi standart HEX olmalıdır (#123456 gibi).`

    setGeneratedPrompt(promptText)
    setCopiedPrompt(false)
  }

  const copyPromptToClipboard = (): void => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      await window.electron.ipcRenderer.invoke('db:save-settings', {
        themeLightVars: localLight,
        themeDarkVars: localDark
      })
      setThemeLightVars(localLight)
      setThemeDarkVars(localDark)
      // Apply CSS variables globally
      applyThemeVars(localLight)
      applyThemeVars(localDark)
      showStatus('Tema başarıyla kaydedildi ve uygulandı!')
    } catch (error) {
      console.error(error)
      showStatus('Ayarlar kaydedilirken bir hata oluştu.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const applyThemeVars = (cssText: string): void => {
    // This helper parses CSS vars and injects/overwrites them in DOM
    const root = document.documentElement
    const lines = cssText.split('\n')
    lines.forEach((line) => {
      const parts = line.split(':')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const value = parts.slice(1).join(':').replace(';', '').trim()
        if (key.startsWith('--')) {
          root.style.setProperty(key, value)
        }
      }
    })
  }

  const setPresetTheme = async (light: string, dark: string, name: string): Promise<void> => {
    setLocalLight(light)
    setLocalDark(dark)
    setSaving(true)
    try {
      await window.electron.ipcRenderer.invoke('db:save-settings', {
        themeLightVars: light,
        themeDarkVars: dark
      })
      setThemeLightVars(light)
      setThemeDarkVars(dark)
      applyThemeVars(light)
      applyThemeVars(dark)
      showStatus(`${name} teması başarıyla uygulandı!`)
    } catch (error) {
      console.error(error)
      showStatus('Tema kaydedilirken bir hata oluştu.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Presets with enhanced visual contrast and themed sidebar variables
  const presets = {
    varsayilan: {
      name: 'Varsayılan (Siyah/Beyaz)',
      color: 'bg-zinc-800',
      light: '',
      dark: ''
    },
    turkuaz: {
      name: 'Turkuaz',
      color: 'bg-cyan-500',
      light: `--primary-100: #4dd0e1;\n--primary-200: #00bcd4;\n--primary-300: #006064;\n--accent-100: #00acc1;\n--accent-200: #00838f;\n--text-100: #001f20;\n--text-200: #004d40;\n--bg-100: #ffffff;\n--bg-200: #e0f7fa;\n--bg-300: #b2ebf2;\n--sidebar-bg: #0e292c;\n--sidebar-text: #b2ebf2;\n--sidebar-border: #153e42;\n--sidebar-hover-bg: #153e42;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(0, 229, 255, 0.15);\n--sidebar-active-text: #00e5ff;\n--sidebar-active-border: rgba(0, 229, 255, 0.25);`,
      dark: `--primary-100: #143d41;\n--primary-200: #225f66;\n--primary-300: #e0f7fa;\n--accent-100: #00e5ff;\n--accent-200: #00acc1;\n--text-100: #f0fbfb;\n--text-200: #80deea;\n--bg-100: #020a0b;\n--bg-200: #0a1c1e;\n--bg-300: #020a0b;\n--sidebar-bg: #020a0b;\n--sidebar-text: #90a4ae;\n--sidebar-border: #143d41;\n--sidebar-hover-bg: #143d41;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(0, 229, 255, 0.12);\n--sidebar-active-text: #00e5ff;\n--sidebar-active-border: rgba(0, 229, 255, 0.2);`
    },
    kirmizi: {
      name: 'Zarif Kırmızı',
      color: 'bg-red-600',
      light: `--primary-100: #ef9a9a;\n--primary-200: #e57373;\n--primary-300: #b71c1c;\n--accent-100: #f44336;\n--accent-200: #d32f2f;\n--text-100: #1a0000;\n--text-200: #5d4037;\n--bg-100: #ffffff;\n--bg-200: #ffebee;\n--bg-300: #ffcdd2;\n--sidebar-bg: #2a0c0c;\n--sidebar-text: #ffdad6;\n--sidebar-border: #421515;\n--sidebar-hover-bg: #421515;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(255, 137, 122, 0.15);\n--sidebar-active-text: #ff897a;\n--sidebar-active-border: rgba(255, 137, 122, 0.25);`,
      dark: `--primary-100: #451e1e;\n--primary-200: #662c2c;\n--primary-300: #ffdad6;\n--accent-100: #ff897a;\n--accent-200: #ba1a1a;\n--text-100: #fff5f5;\n--text-200: #c9a0a0;\n--bg-100: #0a0404;\n--bg-200: #1c0d0d;\n--bg-300: #0a0404;\n--sidebar-bg: #0a0404;\n--sidebar-text: #b09a99;\n--sidebar-border: #451e1e;\n--sidebar-hover-bg: #451e1e;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(255, 137, 122, 0.12);\n--sidebar-active-text: #ff897a;\n--sidebar-active-border: rgba(255, 137, 122, 0.2);`
    },
    yesil: {
      name: 'Zümrüt Yeşil',
      color: 'bg-emerald-600',
      light: `--primary-100: #a5d6a7;\n--primary-200: #81c784;\n--primary-300: #1b5e20;\n--accent-100: #4caf50;\n--accent-200: #2e7d32;\n--text-100: #001b00;\n--text-200: #33691e;\n--bg-100: #ffffff;\n--bg-200: #e8f5e9;\n--bg-300: #c8e6c9;\n--sidebar-bg: #0a2111;\n--sidebar-text: #c7ebd1;\n--sidebar-border: #13381e;\n--sidebar-hover-bg: #13381e;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(129, 201, 149, 0.15);\n--sidebar-active-text: #81c995;\n--sidebar-active-border: rgba(129, 201, 149, 0.25);`,
      dark: `--primary-100: #1c4a25;\n--primary-200: #2d7a3d;\n--primary-300: #e8f5e9;\n--accent-100: #66bb6a;\n--accent-200: #81c995;\n--text-100: #f1fbf3;\n--text-200: #a5d6a7;\n--bg-100: #030c05;\n--bg-200: #0b2110;\n--bg-300: #030c05;\n--sidebar-bg: #030c05;\n--sidebar-text: #9db0a2;\n--sidebar-border: #1c4a25;\n--sidebar-hover-bg: #1c4a25;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(129, 201, 149, 0.12);\n--sidebar-active-text: #81c995;\n--sidebar-active-border: rgba(129, 201, 149, 0.2);`
    },
    turuncu: {
      name: 'Canlı Turuncu',
      color: 'bg-orange-500',
      light: `--primary-100: #ffcc80;\n--primary-200: #ffb74d;\n--primary-300: #e65100;\n--accent-100: #ff9800;\n--accent-200: #f57c00;\n--text-100: #270e00;\n--text-200: #5d4037;\n--bg-100: #ffffff;\n--bg-200: #fff3e0;\n--bg-300: #ffe0b2;\n--sidebar-bg: #281404;\n--sidebar-text: #ffe3d1;\n--sidebar-border: #3e1f06;\n--sidebar-hover-bg: #3e1f06;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(255, 152, 0, 0.15);\n--sidebar-active-text: #ff9800;\n--sidebar-active-border: rgba(255, 152, 0, 0.25);`,
      dark: `--primary-100: #462912;\n--primary-200: #6a3f1b;\n--primary-300: #ffe0b2;\n--accent-100: #f57c00;\n--accent-200: #ff9800;\n--text-100: #fff8f2;\n--text-200: #ffcc80;\n--bg-100: #0c0702;\n--bg-200: #211308;\n--bg-300: #0c0702;\n--sidebar-bg: #0c0702;\n--sidebar-text: #b3a092;\n--sidebar-border: #462912;\n--sidebar-hover-bg: #462912;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(255, 152, 0, 0.12);\n--sidebar-active-text: #ff9800;\n--sidebar-active-border: rgba(255, 152, 0, 0.2);`
    },
    mor: {
      name: 'Görkemli Mor',
      color: 'bg-purple-600',
      light: `--primary-100: #ce93d8;\n--primary-200: #ba68c8;\n--primary-300: #4a148c;\n--accent-100: #9c27b0;\n--accent-200: #7b1fa2;\n--text-100: #1f0033;\n--text-200: #311b92;\n--bg-100: #ffffff;\n--bg-200: #f3e5f5;\n--bg-300: #e1bee7;\n--sidebar-bg: #1f0c2d;\n--sidebar-text: #eed6f7;\n--sidebar-border: #321447;\n--sidebar-hover-bg: #321447;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(216, 180, 254, 0.15);\n--sidebar-active-text: #d8b4fe;\n--sidebar-active-border: rgba(216, 180, 254, 0.25);`,
      dark: `--primary-100: #381959;\n--primary-200: #562887;\n--primary-300: #f3e5f5;\n--accent-100: #ab47bc;\n--accent-200: #d8b4fe;\n--text-100: #fbf2ff;\n--text-200: #ce93d8;\n--bg-100: #07020d;\n--bg-200: #180b26;\n--bg-300: #07020d;\n--sidebar-bg: #07020d;\n--sidebar-text: #ab9db3;\n--sidebar-border: #381959;\n--sidebar-hover-bg: #381959;\n--sidebar-hover-text: #ffffff;\n--sidebar-active-bg: rgba(216, 180, 254, 0.12);\n--sidebar-active-text: #d8b4fe;\n--sidebar-active-border: rgba(216, 180, 254, 0.2);`
    }
  }

  const exportTheme = (): void => {
    const dataStr = JSON.stringify(
      {
        light: localLight,
        dark: localDark
      },
      null,
      2
    )
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = 'hakim-pro_temalar.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    showStatus('Tema JSON dosyası başarıyla indirildi.')
  }

  const handleImport = (): void => {
    try {
      const parsed = JSON.parse(importJsonText) as ThemeConfig
      if (typeof parsed.light === 'string' && typeof parsed.dark === 'string') {
        setLocalLight(parsed.light)
        setLocalDark(parsed.dark)
        setShowImportModal(false)
        setImportJsonText('')
        showStatus('Tema başarıyla içe aktarıldı. Uygulamak için kaydet butonuna basın.')
      } else {
        alert('Geçersiz tema JSON formatı. "light" ve "dark" alanları string olmalıdır.')
      }
    } catch {
      alert('Geçersiz JSON formatı. Lütfen kopyaladığınız içeriği kontrol edin.')
    }
  }

  const renderColorInput = (key: string, value: string): React.JSX.Element => {
    const isRgbaVar = key === '--sidebar-active-bg' || key === '--sidebar-active-border'

    if (isRgbaVar) {
      const { hex, opacity } = parseRgba(value)
      return (
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
              <input
                type="color"
                value={hex}
                onChange={(e) => {
                  const newRgba = toRgbaStr(e.target.value, opacity)
                  handlePlaygroundVarChange(key, newRgba)
                }}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => handlePlaygroundVarChange(key, e.target.value)}
              className="w-full px-2 py-0.5 font-mono text-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => {
                const newRgba = toRgbaStr(hex, parseFloat(e.target.value))
                handlePlaygroundVarChange(key, newRgba)
              }}
              className="w-full accent-cyan-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[9px] font-mono text-slate-500 w-6 text-right">
              {Math.round(opacity * 100)}%
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 w-full">
        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          <input
            type="color"
            value={value && value.startsWith('#') ? value : '#ffffff'}
            onChange={(e) => handlePlaygroundVarChange(key, e.target.value)}
            className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => handlePlaygroundVarChange(key, e.target.value)}
          className="w-full px-2 py-0.5 font-mono text-[10px] bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 dark:text-slate-200"
        />
      </div>
    )
  }

  return (
    <div
      className={
        isEmbedded
          ? 'space-y-6 flex flex-col justify-between w-full'
          : 'p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-300 overflow-y-auto max-h-full'
      }
    >
      {isEmbedded ? (
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
              Renk ve Tema Özelleştirme
            </h2>
            <p className="text-xs text-slate-500">
              Uygulamanın renk paletlerini, hazır temalarını ve CSS değişkenlerini ayarlayın.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5" /> İçe Aktar
            </Button>
            <Button
              onClick={exportTheme}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> Dışa Aktar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
              <Palette className="w-8 h-8 text-cyan-500" />
              Renk ve Tema Ayarları
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Uygulama arayüzünde kullanılan renk paletlerini özelleştirin. Hazır temalardan birini
              seçebilir, dışa/içe aktarabilir veya kendi CSS değişkenlerinizi yazabilirsiniz.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              <Upload className="w-4 h-4" /> Temayı İçe Aktar
            </Button>
            <Button
              onClick={exportTheme}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              <Download className="w-4 h-4" /> Temayı Dışa Aktar
            </Button>
          </div>
        </div>
      )}

      {/* Tema Uyarı Bildirimi */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong className="font-semibold block mb-0.5">⚠️ Yeniden Başlatma Gerekebilir</strong>
          Tema değişikliği sonrasında arayüzün bazı bölümlerinde (özellikle butonlar ve sol menüde)
          renk kaymaları görebilirsiniz. Yeni temanın her yere kusursuz yansıması için uygulamayı
          kapatıp <strong>tekrar açmanız (veya Ctrl+R ile sayfayı yenilemeniz)</strong> önerilir.
          Tekrar açtığınızda düzelecektir.
        </div>
      </div>

      {/* Tab Seçimi */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mt-2">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'presets'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          <Palette className="w-4 h-4" />
          Hazır Temalar & Düzenle
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('designer')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'designer'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Canlı Tema Tasarımcısı (Oyun Alanı)
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2 text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-450'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800/50 dark:text-rose-450'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {activeTab === 'presets' ? (
        <div className="space-y-6">
          {/* Hazır Tema Seçenekleri */}
          <div
            className={
              isEmbedded
                ? 'bg-slate-50/50 dark:bg-slate-955/30 border border-slate-150/70 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4'
            }
          >
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Hazır Temalar</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {Object.entries(presets).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPresetTheme(value.light, value.dark, value.name)}
                  className="py-3 px-4 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-all flex flex-col items-center gap-2.5 shadow-sm"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${value.color} border border-white dark:border-slate-950 shadow-md`}
                  />
                  <span>{value.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CSS Değişkenleri Açıklama Rehberi */}
          <div
            className={
              isEmbedded
                ? 'bg-slate-100/40 dark:bg-slate-955/50 border border-slate-150/50 dark:border-slate-850/40 rounded-2xl p-6 shadow-inner space-y-4'
                : 'bg-slate-55 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner space-y-4'
            }
          >
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-500" /> CSS Değişken Rehberi (Renk Anahtarları Ne
              İşe Yarar?)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs leading-normal">
              <div className="space-y-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --primary-100
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Birincil soft renk. Seçili elemanların arka planı, rozet ve aktif kart arka
                    planlarında kullanılır.
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --primary-200
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Birincil orta ton. Hover/odaklanma kenarlıkları ve aktif buton gölgelerinde
                    tercih edilir.
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --primary-300
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Birincil koyu/yüksek kontrast ton. Başlıklar, vurgulanması gereken koyu etiket
                    metinleri için.
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --accent-100
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Vurgu/İkincil soft renk. Alternatif butonlar, etiketler veya ikincil aktif
                    durumlar için.
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --sidebar-bg & --sidebar-text
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Sol menü (Sidebar) arka plan rengi ve genel yazı rengi.
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --sidebar-border
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Sol menü sağ sınır çizgisi ve ayraç çizgilerinin rengi.
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --accent-200
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Birincil eylem rengi. Kaydet butonları, linkler ve ana eylemlerin arka plan
                    rengi.
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --text-100 & --text-200
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Metin renkleri. 100 ana okuma metni (koyu/açık), 200 ise açıklama ve alt
                    başlıklar içindir.
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --bg-100 & --bg-200 & --bg-300
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Sırasıyla ana sayfa arka planı (100), kart/sidebar kutu arka planı (200) ve
                    kenarlık/input arka planları (300).
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --sidebar-hover-bg & --sidebar-hover-text
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Sol menüde elemanların hover durumundaki arka plan ve yazı rengi.
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    --sidebar-active-bg & --sidebar-active-text
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Sol menüde seçili olan elemanın arka plan ve yazı rengi.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="leading-relaxed text-slate-600 dark:text-slate-400">
                <span className="font-bold text-blue-600 dark:text-blue-400">Öneri:</span> Kendi
                özel renk paletinizi yapay zekayı (ChatGPT, Claude vb.) kullanarak saniyeler içinde
                tasarlamak için <strong>AI Prompt Yardımcısı</strong> modülümüzü kullanabilirsiniz.
                Ya da harici <strong>BairesDev AI Colors</strong> aracını kullanabilirsiniz.
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  onClick={() => {
                    setShowAiModal(true)
                    setAiThemeDesc('')
                    setGeneratedPrompt('')
                  }}
                  className="text-[10px] py-1 h-7 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                >
                  AI Promptu Oluştur
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const electron = window.electron as any
                    if (
                      electron &&
                      electron.shell &&
                      typeof electron.shell.openExternal === 'function'
                    ) {
                      electron.shell.openExternal('https://www.bairesdev.com/tools/ai-colors')
                    } else {
                      window.open('https://www.bairesdev.com/tools/ai-colors', '_blank')
                    }
                  }}
                  className="text-[10px] py-1 h-7 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold"
                >
                  {'BairesDev AI Colors'}
                </Button>
              </div>
            </div>
          </div>

          {/* Manuel CSS Değişken Tanımlama Kutuları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={
                isEmbedded
                  ? 'bg-slate-50/50 dark:bg-slate-955/30 border border-slate-150/70 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-3'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3'
              }
            >
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Aydınlık Tema Değişkenleri (Light Mode CSS)
              </label>
              <textarea
                value={localLight}
                onChange={(e) => setLocalLight(e.target.value)}
                placeholder={`--primary-100: #d4eaf7;\n--accent-200: #00668c;\n--bg-100: #fffefb;`}
                className="w-full h-48 p-3 font-mono text-xs bg-white dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-800 dark:text-slate-200 resize-none custom-scrollbar"
              />
            </div>

            <div
              className={
                isEmbedded
                  ? 'bg-slate-50/50 dark:bg-slate-955/30 border border-slate-150/70 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-3'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3'
              }
            >
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Karanlık Tema Değişkenleri (Dark Mode CSS)
              </label>
              <textarea
                value={localDark}
                onChange={(e) => setLocalDark(e.target.value)}
                placeholder={`--primary-100: #1b263b;\n--accent-200: #778da9;\n--bg-100: #0d1b2a;`}
                className="w-full h-48 p-3 font-mono text-xs bg-white dark:bg-slate-955/50 border border-slate-200/70 dark:border-slate-800/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-800 dark:text-slate-200 resize-none custom-scrollbar"
              />
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-6 text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
            >
              <Save className="w-4 h-4" /> Değişiklikleri Kaydet & Uygula
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Tasarımcı Araç Çubuğu */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Tasarım Modu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Düzenlemek istediğiniz tema modunu seçin
                </p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setDesignerMode('light')}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    designerMode === 'light'
                      ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-150 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  ☀️ Aydınlık Tema
                </button>
                <button
                  type="button"
                  onClick={() => setDesignerMode('dark')}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    designerMode === 'dark'
                      ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-150 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  🌙 Karanlık Tema
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                onClick={() => {
                  setShowAiModal(true)
                  setAiThemeDesc('')
                  setGeneratedPrompt('')
                }}
                className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 dark:bg-purple-950/20 dark:hover:bg-purple-900/30 dark:border-purple-900/40 dark:text-purple-450 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI Prompt Yardımcısı
              </Button>
              <Button
                type="button"
                onClick={applyPlaygroundToEditor}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold border border-slate-200/50 dark:border-slate-800/50 transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Editöre Aktar
              </Button>
              <Button
                type="button"
                onClick={savePlaygroundDirectly}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-xs font-semibold transition-all shadow-md shadow-blue-500/10"
              >
                <Save className="w-4 h-4" />
                Kaydet & Uygula
              </Button>
            </div>
          </div>

          {/* Kategori Filtreleri */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-2">
              Filtre:
            </span>
            {(['all', 'primary', 'text-bg', 'sidebar'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {cat === 'all' && '🎨 Tümü'}
                {cat === 'primary' && '🔵 Renkler'}
                {cat === 'text-bg' && '📝 Yazı / Arkaplan'}
                {cat === 'sidebar' && '📋 Menü'}
              </button>
            ))}
          </div>

          {/* Ana İçerik: Renk Kartları + Önizleme */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sol Panel: Renk Kartları */}
            <div className="lg:col-span-7 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {themeVariablesMeta
                  .filter((v) => selectedCategory === 'all' || v.category === selectedCategory)
                  .map((v) => {
                    const val = playgroundVars[v.key] || ''
                    return (
                      <div
                        key={v.key}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 group"
                      >
                        {/* Renk Önizleme ve Başlık */}
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-800 shadow-md shrink-0 mt-0.5"
                            style={{
                              backgroundColor: val.startsWith('rgba') ? val : val || '#cccccc'
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {v.name}
                            </div>
                            <div className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5 select-all">
                              {v.key}
                            </div>
                          </div>
                        </div>

                        {/* Açıklama */}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {v.description}
                        </p>

                        {/* Renk Seçici */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50">
                          {renderColorInput(v.key, val)}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Sağ Panel: Canlı Önizleme Sandbox */}
            <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan-500" />
                  Canlı Önizleme
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/50 font-medium">
                  İzole Arayüz
                </span>
              </div>

              {/* The Sandbox Container */}
              <div
                style={playgroundVars as React.CSSProperties}
                className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col h-[520px] text-[11px] leading-relaxed transition-all"
              >
                {/* Mock Application Layout */}
                <div
                  className="flex flex-1 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-100)',
                    color: 'var(--text-100)'
                  }}
                >
                  {/* Mock Sidebar */}
                  <div
                    className="w-[35%] border-r flex flex-col p-3 justify-between select-none"
                    style={{
                      backgroundColor: 'var(--sidebar-bg)',
                      color: 'var(--sidebar-text)',
                      borderColor: 'var(--sidebar-border)'
                    }}
                  >
                    <div className="space-y-5">
                      {/* Sidebar Logo */}
                      <div
                        className="font-bold flex items-center gap-2 px-2 py-1.5"
                        style={{ color: 'var(--sidebar-active-text)' }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: 'var(--sidebar-active-text)'
                          }}
                        />
                        <span className="text-xs">Evraktron</span>
                      </div>

                      {/* Navigation Items */}
                      <div className="space-y-1.5">
                        {/* Normal Item */}
                        <div className="px-2.5 py-2 rounded-lg cursor-default flex items-center gap-2.5 transition-all">
                          <div
                            className="w-2 h-2 rounded-full opacity-45"
                            style={{ backgroundColor: 'var(--sidebar-text)' }}
                          />
                          Gelen Evraklar
                        </div>

                        {/* Hover Item */}
                        <div
                          className="px-2.5 py-2 rounded-lg cursor-default flex items-center gap-2.5 transition-all"
                          style={{
                            backgroundColor: 'var(--sidebar-hover-bg)',
                            color: 'var(--sidebar-hover-text)'
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: 'var(--sidebar-hover-text)'
                            }}
                          />
                          Giden Evraklar
                        </div>

                        {/* Active Item */}
                        <div
                          className="px-2.5 py-2 rounded-lg cursor-default flex items-center gap-2.5 font-bold border-l-2 transition-all"
                          style={{
                            backgroundColor: 'var(--sidebar-active-bg)',
                            color: 'var(--sidebar-active-text)',
                            borderLeftColor: 'var(--sidebar-active-border)'
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: 'var(--sidebar-active-text)'
                            }}
                          />
                          Tema Ayarları
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] opacity-50 px-2 py-1">v1.0.0-alpha.3</div>
                  </div>

                  {/* Mock Main Area */}
                  <div className="w-[65%] flex flex-col p-4 overflow-y-auto gap-4 custom-scrollbar">
                    {/* Header */}
                    <div className="space-y-1">
                      <h4
                        className="font-bold text-sm tracking-tight"
                        style={{ color: 'var(--primary-300)' }}
                      >
                        Tasarım Stüdyosu
                      </h4>
                      <p style={{ color: 'var(--text-200)' }} className="text-[10px] leading-tight">
                        Değişkenler anında simüle edilir.
                      </p>
                    </div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Stat Card */}
                      <div
                        className="p-3 border rounded-xl space-y-1.5"
                        style={{
                          backgroundColor: 'var(--bg-200)',
                          borderColor: 'var(--bg-300)'
                        }}
                      >
                        <div
                          style={{ color: 'var(--text-200)' }}
                          className="text-[9px] uppercase font-bold tracking-wider"
                        >
                          Evrak Sayısı
                        </div>
                        <div className="text-base font-black" style={{ color: 'var(--text-100)' }}>
                          1,482
                        </div>
                        <div
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold w-fit"
                          style={{
                            backgroundColor: 'var(--primary-100)',
                            color: 'var(--primary-300)'
                          }}
                        >
                          +12% Bugün
                        </div>
                      </div>

                      {/* Action Card */}
                      <div
                        className="p-3 border rounded-xl space-y-3 flex flex-col justify-between"
                        style={{
                          backgroundColor: 'var(--bg-200)',
                          borderColor: 'var(--bg-300)'
                        }}
                      >
                        <div
                          style={{ color: 'var(--text-200)' }}
                          className="text-[9px] uppercase font-bold tracking-wider"
                        >
                          Eylemler
                        </div>
                        <button
                          type="button"
                          className="w-full py-1.5 text-center font-bold text-white rounded-lg cursor-default shadow-sm text-[10px]"
                          style={{ backgroundColor: 'var(--accent-200)' }}
                        >
                          Yeni Kayıt
                        </button>
                      </div>
                    </div>

                    {/* Table Card */}
                    <div
                      className="border rounded-xl p-3 space-y-2"
                      style={{
                        backgroundColor: 'var(--bg-200)',
                        borderColor: 'var(--bg-300)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="font-bold text-[10px]"
                          style={{ color: 'var(--text-100)' }}
                        >
                          Son Evraklar
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[8px] font-semibold"
                          style={{
                            backgroundColor: 'var(--accent-100)',
                            color: 'var(--primary-300)'
                          }}
                        >
                          Bakanlık
                        </span>
                      </div>

                      {/* Mock Table */}
                      <div
                        className="space-y-1.5 border-t pt-2"
                        style={{ borderColor: 'var(--bg-300)' }}
                      >
                        <div
                          className="flex justify-between font-bold text-[9px] opacity-75"
                          style={{ color: 'var(--text-200)' }}
                        >
                          <span>Evrak Adı</span>
                          <span>Durum</span>
                        </div>
                        {/* Selected Row */}
                        <div
                          className="flex justify-between p-1.5 rounded-lg"
                          style={{ backgroundColor: 'var(--primary-100)' }}
                        >
                          <span style={{ color: 'var(--primary-300)' }} className="font-bold">
                            #2026/05 Onay
                          </span>
                          <span style={{ color: 'var(--primary-300)' }} className="font-semibold">
                            İmzalı
                          </span>
                        </div>
                        <div className="flex justify-between p-1.5">
                          <span style={{ color: 'var(--text-100)' }}>#2026/04 Dilekçe</span>
                          <span style={{ color: 'var(--text-200)' }}>Arşivde</span>
                        </div>
                      </div>
                    </div>

                    {/* Input field mock */}
                    <div className="space-y-1.5">
                      <div
                        style={{ color: 'var(--text-200)' }}
                        className="text-[9px] font-semibold"
                      >
                        Hızlı Arama
                      </div>
                      <input
                        type="text"
                        placeholder="Evrak arayın..."
                        disabled
                        className="w-full px-3 py-1.5 border rounded-lg cursor-default text-[10px]"
                        style={{
                          backgroundColor: 'var(--bg-300)',
                          borderColor: 'var(--bg-300)',
                          color: 'var(--text-100)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Prompt Helper Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-lg text-slate-850 dark:text-slate-150">
                  AI Tema Prompt Oluşturucu
                </h3>
                <p className="text-[10px] text-slate-550 dark:text-slate-400">
                  ChatGPT veya Claude için profesyonel bir renk paleti oluşturma promptu hazırlar.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Nasıl bir tema istersiniz? (Örn: Pastel Orman Yeşili, Retro Turuncu, Modern Gece
                Mavisi...)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiThemeDesc}
                  onChange={(e) => setAiThemeDesc(e.target.value)}
                  placeholder="İstediğiniz tema stilini buraya yazın..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-800 dark:text-slate-200"
                />
                <Button
                  onClick={generateAiPrompt}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shrink-0"
                >
                  Prompt Hazırla
                </Button>
              </div>
            </div>

            {generatedPrompt && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500">
                    Hazırlanan Yapay Zeka Promptu:
                  </span>
                  <button
                    type="button"
                    onClick={copyPromptToClipboard}
                    className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        Kopyalandı!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Promptu Kopyala
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={generatedPrompt}
                  className="w-full h-44 p-3 font-mono text-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 resize-none select-all custom-scrollbar"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 leading-relaxed">
                  <div>
                    💡 Promptu kopyalayıp aşağıdaki yapay zeka araçlarından birine yapıştırın. Çıkan
                    JSON kodunu kopyalayıp <strong>Temayı İçe Aktar (JSON)</strong> butonuyla buraya
                    aktarabilirsiniz!
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href="https://chatgpt.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-900/40 py-2 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    ChatGPT'ye Git
                  </a>
                  <a
                    href="https://claude.ai/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:hover:bg-orange-900/30 dark:text-orange-450 border border-orange-200/50 dark:border-orange-900/40 py-2 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Claude'a Git
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
              <Button
                onClick={() => {
                  setShowAiModal(false)
                  setAiThemeDesc('')
                  setGeneratedPrompt('')
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Kapat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileJson className="w-6 h-6 text-cyan-500" />
              <h3 className="font-bold text-lg text-slate-850 dark:text-slate-150">
                Temayı İçe Aktar (JSON)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dışa aktardığınız veya paylaşılan tema JSON kodunu aşağıdaki alana kopyalayarak içe
              aktarın:
            </p>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder={`{\n  "light": "--primary-100: #e0f7fa;...",\n  "dark": "--primary-100: #004d40;..."\n}`}
              className="w-full h-44 p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-800 dark:text-slate-200 resize-none custom-scrollbar"
            />
            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <Button
                onClick={() => {
                  setShowImportModal(false)
                  setImportJsonText('')
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                İptal
              </Button>
              <Button
                onClick={handleImport}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                İçe Aktar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
