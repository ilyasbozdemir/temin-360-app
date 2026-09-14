export type NotTip = 'todo' | 'not' | 'hatirlatici'
export type NotOncelik = 'dusuk' | 'orta' | 'yuksek' | 'acil'
export type NotRenk = 'slate' | 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'indigo'

export interface NotVeGorev {
  id: number
  uuid: string
  temin_dosya_id: number | null
  dosya_no?: string | null
  dosya_konusu?: string | null
  baslik: string
  icerik: string | null
  tip: NotTip
  kategori: string
  oncelik: NotOncelik
  tamamlandi: number
  tamamlanma_tarihi: string | null
  vade_tarihi: string | null
  renk: NotRenk
  sabitlendi: number
  sira: number
  etiketler: string | null
  created_at: string
  updated_at: string
}

export type NotInput = Omit<NotVeGorev, 'id' | 'created_at' | 'updated_at'>

export interface NotFilterState {
  search: string
  tab: 'all' | 'todo' | 'not' | 'completed'
  oncelik: 'all' | NotOncelik
  kategori: string
  dosyaId: number | 'all' | 'general'
  viewMode: 'list' | 'sticky'
}

export interface NotStats {
  total: number
  pending: number
  completed: number
  urgent: number
  todayOrOverdue: number
}

export const NOT_KATEGORILERI = [
  'Genel',
  'İhale / Doğrudan Temin',
  'Yaklaşık Maliyet & Piyasa',
  'Sözleşme & Sipariş',
  'Muayene & Kabul',
  'Fatura & Ödeme',
  'Mevzuat & Hukuk',
  'Önemli Hatırlatma'
] as const
