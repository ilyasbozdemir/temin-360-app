import React from 'react'
import {
  ArrowLeft,
  Grid,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Sliders,
  Eye,
  Code,
  FileCheck,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Columns
} from 'lucide-react'
import { DocumentSettings, FormBuilderMode, FormFieldV2 } from '../../types/formBuilder.types'

interface FormBuilderHeaderProps {
  onBack: () => void
  onReset: () => void
  docSettings: DocumentSettings
  onUpdateDocSettings: (updater: (prev: DocumentSettings) => DocumentSettings) => void
  mode: FormBuilderMode
  onSetMode: (mode: FormBuilderMode) => void
  onSave: () => void
  isLeftSidebarOpen: boolean
  onToggleLeftSidebar: () => void
  isRightSidebarOpen: boolean
  onToggleRightSidebar: () => void
  activeField?: FormFieldV2
  onUpdateActiveField?: (updates: Partial<FormFieldV2>) => void
}

export const FormBuilderHeader: React.FC<FormBuilderHeaderProps> = ({
  onBack,
  onReset,
  docSettings,
  onUpdateDocSettings,
  mode,
  onSetMode,
  onSave,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
  activeField,
  onUpdateActiveField
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs shadow-xs transition-colors select-none">
      {/* Sol: Yan Panel Aç/Kapa & Geri & Başlık */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Şablon Listesine Dön"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleLeftSidebar}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isLeftSidebarOpen
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={isLeftSidebarOpen ? 'Bileşen Galerisini Gizle' : 'Bileşen Galerisini Göster'}
        >
          {isLeftSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
            Resmi Belge Tasarımcısı
          </span>
        </div>

        {/* Hızlı Araçlar */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Şablonu Varsayılana Sıfırla"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onUpdateDocSettings((s) => ({ ...s, showGrid: !s.showGrid }))}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              docSettings.showGrid
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Kılavuz Çizgileri Aç / Kapat"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* HIZLI HİZALAMA VE BİÇİM ARAÇ ÇUBUĞU (Seçili Öğe Varsa) */}
        {activeField && onUpdateActiveField && mode === 'design' && (
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in">
            {/* Metin Hizalama Butonları */}
            <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5">
              <button
                type="button"
                onClick={() => onUpdateActiveField({ textAlign: 'left' })}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  (activeField.textAlign || 'left') === 'left'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Sola Hizala"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateActiveField({ textAlign: 'center' })}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  activeField.textAlign === 'center'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Ortala"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateActiveField({ textAlign: 'right' })}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  activeField.textAlign === 'right'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Sağa Hizala"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateActiveField({ textAlign: 'justify' })}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  activeField.textAlign === 'justify'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="İki Yana Yasla"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Kalın / İtalik */}
            <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateActiveField({
                    fontWeight: activeField.fontWeight === 'bold' ? 'normal' : 'bold'
                  })
                }
                className={`p-1 rounded cursor-pointer transition-colors ${
                  activeField.fontWeight === 'bold'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Kalın Yazı"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateActiveField({
                    fontStyle: activeField.fontStyle === 'italic' ? 'normal' : 'italic'
                  })
                }
                className={`p-1 rounded cursor-pointer transition-colors ${
                  activeField.fontStyle === 'italic'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="İtalik Yazı"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Genişlik / Kolon Yerleşimi */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <Columns className="w-3.5 h-3.5 text-blue-500" />
              {(['100%', '50%', '33%'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onUpdateActiveField({ width: w })}
                  className={`px-1.5 py-0.5 rounded cursor-pointer font-mono text-[10px] ${
                    (activeField.width || '100%') === w
                      ? 'bg-blue-600 text-white font-bold'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                  title={`${w} Genişlik`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Orta: Sayfa Boyutu (A4/A3, Yönlendirme, Zoom) */}
      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-1.5">
          <button
            type="button"
            onClick={() => onUpdateDocSettings((s) => ({ ...s, pageSize: 'A4' }))}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              docSettings.pageSize === 'A4'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            A4
          </button>
          <button
            type="button"
            onClick={() => onUpdateDocSettings((s) => ({ ...s, pageSize: 'A3' }))}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              docSettings.pageSize === 'A3'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            A3
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-1.5">
          <button
            type="button"
            onClick={() => onUpdateDocSettings((s) => ({ ...s, orientation: 'portrait' }))}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              docSettings.orientation === 'portrait'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Dikey
          </button>
          <button
            type="button"
            onClick={() => onUpdateDocSettings((s) => ({ ...s, orientation: 'landscape' }))}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              docSettings.orientation === 'landscape'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Yatay
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() =>
              onUpdateDocSettings((s) => ({ ...s, zoom: Math.max(50, s.zoom - 10) }))
            }
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            title="Küçült"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold w-9 text-center text-slate-700 dark:text-slate-300">
            %{docSettings.zoom}
          </span>
          <button
            type="button"
            onClick={() =>
              onUpdateDocSettings((s) => ({ ...s, zoom: Math.min(150, s.zoom + 10) }))
            }
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            title="Büyüt"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sağ: Modlar & Sağ Sidebar Toggle & Kaydet */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onSetMode('design')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'design'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tasarım</span>
          </button>
          <button
            type="button"
            onClick={() => onSetMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'preview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Önizleme</span>
          </button>
          <button
            type="button"
            onClick={() => onSetMode('json')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'json'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Şema</span>
          </button>
        </div>

        {mode === 'design' && (
          <button
            type="button"
            onClick={onToggleRightSidebar}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isRightSidebarOpen
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isRightSidebarOpen ? 'Özellik Panelini Gizle' : 'Özellik Panelini Göster'}
          >
            {isRightSidebarOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Kaydet</span>
        </button>
      </div>
    </div>
  )
}
