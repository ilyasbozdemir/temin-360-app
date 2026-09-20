import { KurumVerisi } from './kurum.hooks'

export interface KurumTabProps {
  data: Partial<KurumVerisi>
  onChange: (key: keyof KurumVerisi, value: any) => void
  institutionLetterhead: string[]
  setInstitutionLetterhead: (val: string[]) => void
  parentInstitutionLines: string[]
  setParentInstitutionLines: (val: string[]) => void
}
