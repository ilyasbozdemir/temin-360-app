import React from 'react'
import { Sliders } from 'lucide-react'
import {
  FormFieldV2,
  TableRowItem,
  SignatureMemberItem
} from '../../types/formBuilder.types'
import {
  InspectorHeader,
  InspectorDataTab,
  InspectorFormatTab,
  InspectorPropertiesTab
} from './inspector'

interface FormBuilderInspectorProps {
  activeField: FormFieldV2 | undefined
  activeInspectorTab: 'properties' | 'data' | 'format'
  onSetActiveInspectorTab: (tab: 'properties' | 'data' | 'format') => void
  availableTabs: string[]
  formData: Record<string, string>
  onUpdateFormData: (key: string, val: string) => void
  onUpdateActiveField: (updates: Partial<FormFieldV2>) => void
  onAddTableRow: () => void
  onUpdateTableRow: (rowId: string, updates: Partial<TableRowItem>) => void
  onDeleteTableRow: (rowId: string) => void
  onAddSignatureMember: () => void
  onUpdateSignatureMember: (memberId: string, updates: Partial<SignatureMemberItem>) => void
  onDeleteSignatureMember: (memberId: string) => void
}

export const FormBuilderInspector: React.FC<FormBuilderInspectorProps> = ({
  activeField,
  activeInspectorTab,
  onSetActiveInspectorTab,
  availableTabs,
  formData,
  onUpdateFormData,
  onUpdateActiveField,
  onAddTableRow,
  onUpdateTableRow,
  onDeleteTableRow,
  onAddSignatureMember,
  onUpdateSignatureMember,
  onDeleteSignatureMember
}) => {
  return (
    <div className="w-80 bg-slate-50/90 dark:bg-slate-950/95 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-xs transition-colors shrink-0">
      {activeField ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Üst Başlık & Sekmeler */}
          <InspectorHeader
            activeField={activeField}
            activeInspectorTab={activeInspectorTab}
            onSetActiveInspectorTab={onSetActiveInspectorTab}
          />

          {/* 1. Canlı Veri Sekmesi */}
          {activeInspectorTab === 'data' && (
            <InspectorDataTab
              activeField={activeField}
              formData={formData}
              onUpdateFormData={onUpdateFormData}
              onUpdateActiveField={onUpdateActiveField}
              onAddTableRow={onAddTableRow}
              onUpdateTableRow={onUpdateTableRow}
              onDeleteTableRow={onDeleteTableRow}
              onAddSignatureMember={onAddSignatureMember}
              onUpdateSignatureMember={onUpdateSignatureMember}
              onDeleteSignatureMember={onDeleteSignatureMember}
            />
          )}

          {/* 2. Biçim & Hizalama Sekmesi */}
          {activeInspectorTab === 'format' && (
            <InspectorFormatTab
              activeField={activeField}
              onUpdateActiveField={onUpdateActiveField}
            />
          )}

          {/* 3. Özellikler & Davranış Sekmesi */}
          {activeInspectorTab === 'properties' && (
            <InspectorPropertiesTab
              activeField={activeField}
              availableTabs={availableTabs}
              onUpdateActiveField={onUpdateActiveField}
            />
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium space-y-2">
          <Sliders className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto opacity-50" />
          <p>Özelliklerini düzenlemek için lütfen sayfadaki bir bileşene tıklayın.</p>
        </div>
      )}
    </div>
  )
}
