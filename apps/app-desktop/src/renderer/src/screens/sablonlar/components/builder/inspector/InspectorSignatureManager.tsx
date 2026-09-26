import React from 'react'
import { Plus, X } from 'lucide-react'
import { FormFieldV2, SignatureMemberItem } from '../../../types/formBuilder.types'

interface InspectorSignatureManagerProps {
  activeField: FormFieldV2
  onAddSignatureMember: () => void
  onUpdateSignatureMember: (memberId: string, updates: Partial<SignatureMemberItem>) => void
  onDeleteSignatureMember: (memberId: string) => void
}

export const InspectorSignatureManager: React.FC<InspectorSignatureManagerProps> = ({
  activeField,
  onAddSignatureMember,
  onUpdateSignatureMember,
  onDeleteSignatureMember
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
          İmza Yetkilileri ({activeField.signatureMembers?.length || 0})
        </span>
        <button
          type="button"
          onClick={onAddSignatureMember}
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-3 h-3" />
          <span>+ Üye Ekle</span>
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {activeField.signatureMembers?.map((m) => (
          <div
            key={m.id}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase font-mono">
                {m.gorev || 'Görevli'}
              </span>
              <button
                type="button"
                onClick={() => onDeleteSignatureMember(m.id)}
                className="text-slate-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                title="Üyeyi Sil"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Ad Soyad"
              value={m.adSoyad}
              onChange={(e) => onUpdateSignatureMember(m.id, { adSoyad: e.target.value })}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold text-slate-900 dark:text-white"
            />

            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="Unvan (Örn: Mühendis)"
                value={m.unvan}
                onChange={(e) => onUpdateSignatureMember(m.id, { unvan: e.target.value })}
                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-700 dark:text-slate-300"
              />
              <input
                type="text"
                placeholder="Görev (Örn: Üye)"
                value={m.gorev}
                onChange={(e) => onUpdateSignatureMember(m.id, { gorev: e.target.value })}
                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
