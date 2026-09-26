import React from 'react'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Columns,
  Type,
  Bold,
  Italic
} from 'lucide-react'
import { FormFieldV2 } from '../../../types/formBuilder.types'

interface InspectorFormatTabProps {
  activeField: FormFieldV2
  onUpdateActiveField: (updates: Partial<FormFieldV2>) => void
}

export const InspectorFormatTab: React.FC<InspectorFormatTabProps> = ({
  activeField,
  onUpdateActiveField
}) => {
  return (
    <div className="flex-1 p-3 overflow-y-auto space-y-4">
      {/* Metin Hizalama */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Metin Hizalama (Text Alignment)
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => onUpdateActiveField({ textAlign: 'left' })}
            className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
              (activeField.textAlign || 'left') === 'left'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Sola Hizala"
          >
            <AlignLeft className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">Sol</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateActiveField({ textAlign: 'center' })}
            className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
              activeField.textAlign === 'center'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Ortala"
          >
            <AlignCenter className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">Orta</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateActiveField({ textAlign: 'right' })}
            className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
              activeField.textAlign === 'right'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Sağa Hizala"
          >
            <AlignRight className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">Sağ</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateActiveField({ textAlign: 'justify' })}
            className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
              activeField.textAlign === 'justify'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="İki Yana Yasla"
          >
            <AlignJustify className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">Yasla</span>
          </button>
        </div>
      </div>

      {/* Genişlik & Kolon Yerleşimi */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Columns className="w-3.5 h-3.5 text-blue-500" />
          Bileşen Genişliği (Satır Düzeni)
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          {[
            { key: '100%', label: '%100', desc: 'Tam Satır' },
            { key: '50%', label: '%50', desc: '2 Kolon' },
            { key: '33%', label: '%33', desc: '3 Kolon' },
            { key: '25%', label: '%25', desc: '4 Kolon' }
          ].map((w) => (
            <button
              key={w.key}
              type="button"
              onClick={() =>
                onUpdateActiveField({
                  width: w.key as '100%' | '50%' | '33%' | '25%'
                })
              }
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg cursor-pointer transition-all ${
                (activeField.width || '100%') === w.key
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="font-mono text-xs">{w.label}</span>
              <span className="text-[8px] opacity-75">{w.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Yazı Tipi & Vurgular */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Type className="w-3.5 h-3.5 text-blue-500" />
          Tipografi ve Stil Vurguları
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onUpdateActiveField({
                fontWeight: activeField.fontWeight === 'bold' ? 'normal' : 'bold'
              })
            }
            className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all ${
              activeField.fontWeight === 'bold'
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Bold className="w-4 h-4" />
            <span>Kalın (Bold)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateActiveField({
                fontStyle: activeField.fontStyle === 'italic' ? 'normal' : 'italic'
              })
            }
            className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all ${
              activeField.fontStyle === 'italic'
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 italic'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Italic className="w-4 h-4" />
            <span>İtalik (Eğik)</span>
          </button>
        </div>
      </div>

      {/* Paragraf Girintisi (Indent) */}
      {activeField.type === 'paragraph' && (
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeField.indent ?? false}
              onChange={(e) => onUpdateActiveField({ indent: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paragraf Girintisi (Resmi Yazışma İntenti)
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
