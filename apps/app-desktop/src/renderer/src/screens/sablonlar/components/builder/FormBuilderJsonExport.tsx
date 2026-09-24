import React from 'react'
import { Copy, Check } from 'lucide-react'
import { FormFieldV2, DocumentSettings } from '../../types/formBuilder.types'

interface FormBuilderJsonExportProps {
  docSettings: DocumentSettings
  availableTabs: string[]
  fields: FormFieldV2[]
  formData: Record<string, string>
  copied: boolean
  onCopyJson: () => void
}

export const FormBuilderJsonExport: React.FC<FormBuilderJsonExportProps> = ({
  docSettings,
  availableTabs,
  fields,
  formData,
  copied,
  onCopyJson
}) => {
  const schemaPayload = {
    documentSettings: docSettings,
    tabs: availableTabs,
    components: fields,
    liveDataSample: formData
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 font-mono relative transition-colors">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider font-mono">
          Belge Şablon Yapısı (Sayfa Düzeni + Sekmeler + Bileşenler)
        </span>
        <button
          type="button"
          onClick={onCopyJson}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-sans font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Kopyalandı!' : 'Şemayı Kopyala'}</span>
        </button>
      </div>
      <pre className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-purple-700 dark:text-purple-300 overflow-x-auto shadow-xs">
        {JSON.stringify(schemaPayload, null, 2)}
      </pre>
    </div>
  )
}
