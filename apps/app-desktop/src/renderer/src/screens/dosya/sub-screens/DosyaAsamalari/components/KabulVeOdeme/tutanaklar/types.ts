import { FirmaStats, KabulTutanakItem, KomisyonUye } from '../types'

export type TutanakTipi = 'mal' | 'hizmet' | 'yapim'

export interface MalKalemi {
  id: number
  malzemeAdi: string
  ozelligi: string
  birimi: string
  miktari: number
  toplamTeslimAlinan: number
  kabulMiktari: number
}

export interface KabulTutanagi {
  id: number | string
  tip: TutanakTipi
  tarih: string
  firma: string
  sayi: string
  teslimAlan: string
  teslimYeri: string
  faturaTarihi?: string
  faturaNo?: string
  irsaliyeTarihi?: string
  irsaliyeNo?: string
  notlar?: string
  hizmetAciklamasi?: string
  kalemler?: MalKalemi[]
  ambaraAktarildi?: boolean
}

export interface KabulTutanaklariListCardProps {
  /** Yüklenici Firma Unvanı */
  firma?: string
  kazananFirmaUnvan?: string
  /** Kabul edilen teklif tutarı */
  kabulEdilenTeklif?: number
  firmaStats?: FirmaStats
  faturaNo?: string
  faturaTarihi?: string
  irsaliyeNo?: string
  irsaliyeTarihi?: string
  komisyonBaskani?: string
  komisyonUyeleri?: KomisyonUye[]
  teslimYeri?: string
  dosyaNo?: string
  alimTuru?: string
  tutanaklar?: KabulTutanakItem[]
  baslangicTutanaklari?: KabulTutanagi[]
  varsayilanTeslimAlan?: string
  varsayilanTeslimYeri?: string
  onOpenAddTutanak?: () => void
  onEditTutanak?: (tutanak: KabulTutanakItem) => void
  onDeleteTutanak?: (id: string) => void
  onBulkDeleteTutanaklar?: (ids: string[]) => void
  onToggleApproveTutanak?: (id: string) => void
  onBulkApproveTutanaklar?: (ids: string[], approved?: boolean) => void
  onOpenPreview?: (sablonKey: string, tutanak?: KabulTutanakItem) => void
  onOpenTifModal?: () => void
  onOpenKomisyonModal?: () => void
  onSaveTutanak?: (tutanak: KabulTutanakItem) => void
  formatDate?: (dateStr: string | null) => string
  formatCurrency?: (val: number | null) => string
}

export const defaultFormatCurrency = (n: number | null | undefined): string => {
  if (n == null) return '0,00 ₺'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(n)
}

export const defaultFormatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR')
  } catch {
    return dateStr
  }
}

export const bosKalem = (id: number): MalKalemi => ({
  id,
  malzemeAdi: '',
  ozelligi: '',
  birimi: 'Adet',
  miktari: 0,
  toplamTeslimAlinan: 0,
  kabulMiktari: 0
})
