import React, { useState, useEffect } from 'react'
import {
  FileText,
  RotateCcw,
  Save,
  Palette,
  Type,
  Layout,
  Table as TableIcon,
  Maximize2,
  Download,
  Upload,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react'
import {
  DEFAULT_DOCUMENT_THEME,
  DocumentThemeConfig,
  createDocumentTheme
} from '@temin360/document-templates'
import { useAyarlarHooks } from '../ayarlar.hooks'

const FONT_OPTIONS = [
  { label: 'Times New Roman (Resmi Standart)', value: "'Times New Roman', Times, serif" },
  { label: 'Arial (Sade / Modern)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Calibri (Kurumsal)', value: 'Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif' },
  { label: 'Inter (Dijital / Net)', value: 'Inter, system-ui, -apple-system, sans-serif' },
  { label: 'Georgia (Zarif Serif)', value: 'Georgia, serif' },
  { label: 'DejaVu Sans (Açık Kaynak)', value: "'DejaVu Sans', sans-serif" }
]

export function DocumentThemeTab(): React.JSX.Element {
  const { settings, isLoadingSettings, updateSetting } = useAyarlarHooks()

  const [theme, setTheme] = useState<DocumentThemeConfig>(() => {
    if (settings.documentTemplateTheme) {
      return createDocumentTheme(settings.documentTemplateTheme)
    }
    return { ...DEFAULT_DOCUMENT_THEME }
  })

  const [activeSection, setActiveSection] = useState<'typography' | 'page' | 'colors' | 'table' | 'spacing'>('typography')
  const [isSaving, setIsSaving] = useState(false)
  const [jsonModalOpen, setJsonModalOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success'): void => {
    setNotification({ text, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Sync with DB settings on load
  useEffect(() => {
    if (settings.documentTemplateTheme) {
      setTheme(createDocumentTheme(settings.documentTemplateTheme))
    }
  }, [settings.documentTemplateTheme])

  const handleSaveToDb = async (): Promise<void> => {
    setIsSaving(true)
    try {
      const payload = {
        ...theme,
        summary: {
          description: 'Özelleştirilmiş resmi evrak şablon teması',
          lastUpdated: new Date().toISOString()
        }
      }
      await updateSetting({
        key: 'documentTemplateTheme',
        value: JSON.stringify(payload, null, 2)
      })
      showNotification('Resmi evrak şablon teması veritabanına başarıyla kaydedildi.', 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      showNotification('Tema kaydedilirken hata oluştu: ' + msg, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefault = (): void => {
    if (window.confirm('Şablon temasını sistem varsayılan ayarlarına sıfırlamak istediğinize emin misiniz?')) {
      setTheme({ ...DEFAULT_DOCUMENT_THEME })
      showNotification('Şablon teması varsayılan değerlere döndürüldü. Değişiklikleri kalıcı yapmak için "DB\'ye Kaydet" butonuna basınız.', 'info')
    }
  }

  const handleExportJson = (): void => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(theme, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `temin360-belge-temasi-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showNotification('Tema JSON dosyası olarak indirildi.', 'success')
  }

  const handleImportJson = (): void => {
    try {
      const parsed = JSON.parse(jsonText)
      const merged = createDocumentTheme(parsed)
      setTheme(merged)
      setJsonModalOpen(false)
      setJsonText('')
      showNotification('Tema JSON verisinden başarıyla yüklendi. Kalıcı olması için kaydedin.', 'success')
    } catch {
      showNotification('Geçersiz JSON formatı!', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800'
              : notification.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800'
              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-300/80 dark:border-blue-800'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-md border border-slate-700/60">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Resmi Belge & Evrak Şablon Teması
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                DB Entegre
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              İhtiyaç listesi, yaklaşık maliyet, onay belgesi ve tüm resmi çıktıların tipografi, kenar boşluğu, tablo ve renk standartlarını yapılandırın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setJsonText(JSON.stringify(theme, null, 2))
              setJsonModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition-all cursor-pointer"
            title="JSON İçe/Dışa Aktar"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>JSON İçe/Dışa Aktar</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-xl border border-slate-600 transition-all cursor-pointer"
            title="Varsayılan Değerlere Dön"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılana Sıfırla</span>
          </button>

          <button
            type="button"
            disabled={isSaving || isLoadingSettings}
            onClick={handleSaveToDb}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Kaydediliyor...' : 'DB\'ye Kaydet'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls (Left 7 Cols) & Live Preview (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-1.5 gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('typography')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'typography'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Tipografi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('page')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'page'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Sayfa & Kenarlık</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('table')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'table'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tablo Düzeni</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('colors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'colors'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Renk Paleti</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('spacing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'spacing'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Boşluklar</span>
            </button>
          </div>

          {/* Form Body */}
          <div className="p-5 space-y-5">
            {/* Section: Typography */}
            {activeSection === 'typography' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Yazı Tipi Ailesi (Font Family)
                  </label>
                  <select
                    value={theme.typography.fontFamily}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        typography: { ...theme.typography, fontFamily: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Ana Metin Boyutu (Base Font Size)
                    </label>
                    <input
                      type="text"
                      value={theme.typography.baseFontSize}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          typography: { ...theme.typography, baseFontSize: e.target.value }
                        })
                      }
                      placeholder="12pt"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Satır Yüksekliği (Line Height)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="2.5"
                      value={theme.typography.lineHeight}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          typography: { ...theme.typography, lineHeight: parseFloat(e.target.value) || 1.5 }
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                  💡 <strong>Resmi Yazışma Kuralı:</strong> Kamu İhale Mevzuatı ve Resmi Yazışma Yönetmeliği gereği resmi yazılarda <strong>Times New Roman (12pt)</strong> veya <strong>Arial (11pt)</strong> tercih edilir.
                </div>
              </div>
            )}

            {/* Section: Page & Margins */}
            {activeSection === 'page' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Sayfa Formatı
                    </label>
                    <select
                      value={theme.page.format}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          page: { ...theme.page, format: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="A4">A4 (21 x 29.7 cm)</option>
                      <option value="A3">A3 (29.7 x 42 cm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Yazdırılabilir Sayfa Yüksekliği (px)
                    </label>
                    <input
                      type="number"
                      value={theme.page.printableHeight}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          page: { ...theme.page, printableHeight: parseInt(e.target.value, 10) || 890 }
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kenar Boşlukları (Margins - cm)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Üst (Top)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={theme.page.margins.top}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            page: {
                              ...theme.page,
                              margins: { ...theme.page.margins, top: parseFloat(e.target.value) || 1.5 }
                            }
                          })
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Sağ (Right)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={theme.page.margins.right}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            page: {
                              ...theme.page,
                              margins: { ...theme.page.margins, right: parseFloat(e.target.value) || 1.5 }
                            }
                          })
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Alt (Bottom)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={theme.page.margins.bottom}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            page: {
                              ...theme.page,
                              margins: { ...theme.page.margins, bottom: parseFloat(e.target.value) || 1.5 }
                            }
                          })
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Sol (Left)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={theme.page.margins.left}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            page: {
                              ...theme.page,
                              margins: { ...theme.page.margins, left: parseFloat(e.target.value) || 1.5 }
                            }
                          })
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section: Table Appearance */}
            {activeSection === 'table' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tablo Yazı Boyutu (Font Size)
                    </label>
                    <input
                      type="text"
                      value={theme.table.fontSize}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          table: { ...theme.table, fontSize: e.target.value }
                        })
                      }
                      placeholder="10pt"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Hücre İç Boşluğu (Cell Padding)
                    </label>
                    <input
                      type="text"
                      value={theme.table.cellPadding}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          table: { ...theme.table, cellPadding: e.target.value }
                        })
                      }
                      placeholder="6px"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Başlık Arka Plan Rengi
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.table.headerBgColor}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            table: { ...theme.table, headerBgColor: e.target.value }
                          })
                        }
                        className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={theme.table.headerBgColor}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            table: { ...theme.table, headerBgColor: e.target.value }
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tablo Kenarlık Rengi
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.table.borderColor}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            table: { ...theme.table, borderColor: e.target.value }
                          })
                        }
                        className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={theme.table.borderColor}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            table: { ...theme.table, borderColor: e.target.value }
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section: Colors */}
            {activeSection === 'colors' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ana Metin Rengi (Text)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.text}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          colors: { ...theme.colors, text: e.target.value }
                        })
                      }
                      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.colors.text}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          colors: { ...theme.colors, text: e.target.value }
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kenarlık Rengi (Border)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.border}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          colors: { ...theme.colors, border: e.target.value }
                        })
                      }
                      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.colors.border}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          colors: { ...theme.colors, border: e.target.value }
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Antet Arka Planı (Header Bg)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.headerBg}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          colors: { ...theme.colors, headerBg: e.target.value }
                        })
                      }
                      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.colors.headerBg}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          colors: { ...theme.colors, headerBg: e.target.value }
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Vurgu Çizgisi Rengi (Accent Line)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.accentLine}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          colors: { ...theme.colors, accentLine: e.target.value }
                        })
                      }
                      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.colors.accentLine}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          colors: { ...theme.colors, accentLine: e.target.value }
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section: Spacing */}
            {activeSection === 'spacing' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Antet Yüksekliği (Header Height)
                  </label>
                  <input
                    type="text"
                    value={theme.spacing.headerHeight}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        spacing: { ...theme.spacing, headerHeight: e.target.value }
                      })
                    }
                    placeholder="80px"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    İmza / Onay Bloğu Boşluğu
                  </label>
                  <input
                    type="text"
                    value={theme.spacing.approvalSpacing}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        spacing: { ...theme.spacing, approvalSpacing: e.target.value }
                      })
                    }
                    placeholder="40px"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Mini Document Preview Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden sticky top-6">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Canlı Şablon Görünüm Önizlemesi</span>
            </span>
            <span className="text-[10px] font-mono font-extrabold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {theme.page.format}
            </span>
          </div>

          <div className="p-5 bg-slate-100 dark:bg-slate-950 flex justify-center items-center">
            {/* Simulated Miniature A4 Page */}
            <div
              className="w-full bg-white shadow-lg rounded-sm transition-all overflow-hidden"
              style={{
                fontFamily: theme.typography.fontFamily,
                color: theme.colors.text,
                padding: `${theme.page.margins.top * 6}px ${theme.page.margins.right * 6}px ${theme.page.margins.bottom * 6}px ${theme.page.margins.left * 6}px`,
                border: `1px solid ${theme.colors.border}`,
                minHeight: '420px',
                fontSize: theme.typography.baseFontSize,
                lineHeight: theme.typography.lineHeight
              }}
            >
              {/* Header Box */}
              <div
                className="text-center pb-2 border-b mb-3"
                style={{
                  borderBottomColor: theme.colors.accentLine,
                  borderBottomWidth: '2px',
                  backgroundColor: theme.colors.headerBg
                }}
              >
                <div className="font-extrabold text-[10px] uppercase tracking-wider">
                  T.C. ANKARA VALİLİĞİ
                </div>
                <div className="font-bold text-[9px] text-slate-600">
                  İl Sağlık Müdürlüğü • Destek Hizmetleri Başkanlığı
                </div>
              </div>

              {/* Title */}
              <div
                className="text-center font-extrabold text-[11px] uppercase my-2 tracking-wide"
                style={{ color: theme.colors.text }}
              >
                İHTİYAÇ TALEP LİSTESİ & ONAY BELGESİ
              </div>

              {/* Sample Table */}
              <table
                className="w-full my-2"
                style={{
                  borderCollapse: theme.table.borderCollapse as any,
                  fontSize: theme.table.fontSize,
                  borderColor: theme.table.borderColor
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: theme.table.headerBgColor,
                      border: `${theme.table.borderWidth} solid ${theme.table.borderColor}`
                    }}
                  >
                    <th className="p-1 text-center font-bold border" style={{ borderColor: theme.table.borderColor }}>S.No</th>
                    <th className="p-1 text-left font-bold border" style={{ borderColor: theme.table.borderColor }}>Mal / Malzeme Adı</th>
                    <th className="p-1 text-center font-bold border" style={{ borderColor: theme.table.borderColor }}>Miktar</th>
                    <th className="p-1 text-center font-bold border" style={{ borderColor: theme.table.borderColor }}>Birim</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ border: `${theme.table.borderWidth} solid ${theme.table.borderColor}` }}>
                    <td className="p-1 text-center border" style={{ borderColor: theme.table.borderColor }}>1</td>
                    <td className="p-1 border" style={{ borderColor: theme.table.borderColor }}>A4 Fotokopi Kağıdı (80 gr)</td>
                    <td className="p-1 text-center border" style={{ borderColor: theme.table.borderColor }}>50</td>
                    <td className="p-1 text-center border" style={{ borderColor: theme.table.borderColor }}>Paket</td>
                  </tr>
                  <tr style={{ border: `${theme.table.borderWidth} solid ${theme.table.borderColor}` }}>
                    <td className="p-1 text-center border" style={{ borderColor: theme.table.borderColor }}>2</td>
                    <td className="p-1 border" style={{ borderColor: theme.table.borderColor }}>Mavi Tükenmez Kalem (0.7 mm)</td>
                    <td className="p-1 text-center border" style={{ borderColor: theme.table.borderColor }}>100</td>
                    <td className="p-1 text-center border" style={{ borderColor: theme.table.borderColor }}>Adet</td>
                  </tr>
                </tbody>
              </table>

              {/* Sample Paragraph */}
              <p className="text-[9px] text-justify my-2 leading-relaxed" style={{ color: theme.colors.textLight }}>
                Yukarıda cins ve miktarları belirtilen malzemelerin 4734 sayılı Kamu İhale Kanununun 22/d maddesi kapsamında temini hususunu olurlarınıza arz ederim.
              </p>

              {/* Signature Block */}
              <div className="flex justify-between items-center mt-6 pt-2 text-center text-[9px]">
                <div>
                  <div className="font-bold">Talep Eden</div>
                  <div className="text-slate-500">Ahmet YILMAZ</div>
                  <div className="text-[8px] text-slate-400">Şube Müdürü</div>
                </div>

                <div>
                  <div className="font-bold">UYGUNDUR</div>
                  <div className="text-slate-500">Mehmet DEMİR</div>
                  <div className="text-[8px] text-slate-400">Harcama Yetkilisi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Import/Export Modal */}
      {jsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Tema JSON Yapılandırması</span>
              </h3>
              <button
                type="button"
                onClick={() => setJsonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <textarea
                rows={12}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON İndir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJsonModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>JSON'dan Yükle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
