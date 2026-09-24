export interface FormFieldV2 {
  id: string
  label: string
  variableName: string
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'money'
    | 'date'
    | 'select'
    | 'checkbox'
    | 'table'
    | 'signature'
  required: boolean
  placeholder?: string
  options?: string[]
  helpText?: string
  defaultValue?: string
  category?: 'header' | 'document' | 'financial' | 'commission' | 'terms' | 'custom'
}

export type FormBuilderMode = 'design' | 'preview' | 'json'

export interface PresetController {
  id: string
  name: string
  category: 'header' | 'document' | 'financial' | 'commission' | 'terms'
  description: string
  defaultField: Omit<FormFieldV2, 'id'>
}
