import {
  Columns,
  Grid,
  Building,
  Minus,
  FileSpreadsheet,
  Type,
  AlignLeft,
  DollarSign,
  Calendar,
  ListFilter,
  CheckSquare,
  CircleDot,
  Users,
  AlignJustify,
  LucideIcon
} from 'lucide-react'
import { FormFieldType } from '../types/formBuilder.types'

export interface GalleryToolItem {
  type: FormFieldType
  label: string
  desc: string
  icon: LucideIcon
  color: string
}

export const LAYOUT_TOOLS: readonly GalleryToolItem[] = [
  {
    type: 'grid',
    label: 'Kolon / Grid Düzeni',
    desc: 'Yan yana 2-3-4 kolonlu alan düzeni',
    icon: Columns,
    color: 'text-sky-500 dark:text-sky-400'
  },
  {
    type: 'table',
    label: 'İhale Mal/Hizmet Tablosu',
    desc: 'Dinamik hesaplama ve kalem matrisi',
    icon: Grid,
    color: 'text-amber-500 dark:text-amber-400'
  },
  {
    type: 'header',
    label: 'Kurum Antet & Logolar',
    desc: 'Çift logo ve resmi idare anteti',
    icon: Building,
    color: 'text-indigo-500 dark:text-indigo-400'
  },
  {
    type: 'divider',
    label: 'Sayfa Bölücü Çizgi',
    desc: 'Görsel ayırıcı çizgi ve boşluk',
    icon: Minus,
    color: 'text-slate-500 dark:text-slate-400'
  },
  {
    type: 'page_break',
    label: 'Sayfa Sonu (Kesme)',
    desc: 'Baskıda sonraki sayfaya geçiş noktası',
    icon: FileSpreadsheet,
    color: 'text-rose-500 dark:text-rose-400'
  }
]

export const INPUT_TOOLS: readonly GalleryToolItem[] = [
  {
    type: 'text',
    label: 'Tek Satır Metin Alanı',
    desc: 'Kısa başlık, ad veya kod girişi',
    icon: Type,
    color: 'text-blue-500 dark:text-blue-400'
  },
  {
    type: 'textarea',
    label: 'Geniş Açıklama & Not',
    desc: 'Çok satırlı detaylı metin alanı',
    icon: AlignLeft,
    color: 'text-purple-500 dark:text-purple-400'
  },
  {
    type: 'money',
    label: 'Para Tutarı (₺) Alanı',
    desc: 'Para birimi ve otomatik format',
    icon: DollarSign,
    color: 'text-teal-500 dark:text-teal-400'
  },
  {
    type: 'date',
    label: 'Resmi Tarih Seçici',
    desc: 'Gün/Ay/Yıl takvim seçici',
    icon: Calendar,
    color: 'text-orange-500 dark:text-orange-400'
  },
  {
    type: 'select',
    label: 'Açılır Seçim Listesi (Select)',
    desc: 'Önceden tanımlı açılır liste',
    icon: ListFilter,
    color: 'text-violet-500 dark:text-violet-400'
  },
  {
    type: 'checkbox',
    label: 'Onay Kutusu (Checkbox)',
    desc: 'Evet/Hayır veya çoklu seçim',
    icon: CheckSquare,
    color: 'text-emerald-500 dark:text-emerald-400'
  },
  {
    type: 'radio',
    label: 'Tekli Seçim (Radyo Buton)',
    desc: 'Birbirini dışlayan tekli opsiyonlar',
    icon: CircleDot,
    color: 'text-pink-500 dark:text-pink-400'
  }
]

export const OFFICIAL_TOOLS: readonly GalleryToolItem[] = [
  {
    type: 'signature',
    label: 'İmza & Onay Heyeti',
    desc: 'Komisyon üyeleri veya Olur makamı',
    icon: Users,
    color: 'text-emerald-500 dark:text-emerald-400'
  },
  {
    type: 'paragraph',
    label: 'Gerekçe & Mevzuat Metni',
    desc: 'Resmi kanun maddesi ve gerekçe',
    icon: AlignJustify,
    color: 'text-blue-500 dark:text-blue-400'
  }
]
