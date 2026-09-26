import React from 'react'
import { Sliders, Database, Palette, Settings } from 'lucide-react'
import { FormFieldV2 } from '../../../types/formBuilder.types'
import { TYPE_LABELS } from '../../../constants/formBuilder.constants'

interface InspectorHeaderProps {
  activeField: FormFieldV2
  activeInspectorTab: 'properties' | 'data' | 'format'
  onSetActiveInspectorTab: (tab: 'properties' | 'data' | 'format') => void
}

export const InspectorHeader: React.FC<InspectorHeaderProps> = ({
  activeField,
  activeInspectorTab,
  onSetActiveInspectorTab
}) => {
  return (
    <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Bileşen Ayarları
        </span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono font-bold border border-blue-200 dark:border-blue-800/40">
          {activeField.id}
        </span>
      </div>

      {/* Bileşen Tipi ve Başlık Bilgisi */}
      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold truncate">
          <span className="text-xs truncate max-w-32.5">{activeField.label}</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          {TYPE_LABELS[activeField.type]}
        </span>
      </div>

      {/* 3'lü Sekmeler: [Canlı Veri] / [Biçim & Hizalama] / [Özellikler] */}
      <div className="grid grid-cols-3 p-1 mt-2 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onSetActiveInspectorTab('data')}
          className={`flex items-center justify-center gap-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            activeInspectorTab === 'data'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-3 h-3" />
          <span>Veri</span>
        </button>
        <button
          type="button"
          onClick={() => onSetActiveInspectorTab('format')}
          className={`flex items-center justify-center gap-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            activeInspectorTab === 'format'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-3 h-3" />
          <span>Biçim</span>
        </button>
        <button
          type="button"
          onClick={() => onSetActiveInspectorTab('properties')}
          className={`flex items-center justify-center gap-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            activeInspectorTab === 'properties'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-3 h-3" />
          <span>Özellik</span>
        </button>
      </div>
    </div>
  )
}
