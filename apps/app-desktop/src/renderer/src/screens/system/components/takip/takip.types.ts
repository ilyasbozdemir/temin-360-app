import React from 'react'

export interface AsamaItem {
  id?: number
  asama_sira: number
  asama_adi: string
  aciklama?: string
  aktif_mi?: number
}

export interface TeminBelgeItem {
  id: number
  belge_adi: string
  is_signed: number
  temin_dosya_id?: number
}

export interface TeminKalemItem {
  id: number
  kalem_adi: string
  miktar: number
  olcu_birimi?: string
  birim?: string
}

export interface TeminFirmaItem {
  id: number
  unvan: string
  firma_id?: number
  teklif_tutari?: number
}

export interface TeminKomisyonItem {
  id: number
  ad_soyad: string
  unvan?: string
  gorevi?: string
}

export interface UseTakipReturn {
  activeDosyaId: number | null
  setActiveDosyaId: (id: number | null) => void
  activeDosya: any
  dosyalar: any[]
  dbBelgeler: TeminBelgeItem[]
  allBelgeler: TeminBelgeItem[]
  kalemler: TeminKalemItem[]
  firmalar: TeminFirmaItem[]
  komisyonlar: TeminKomisyonItem[]
  stages: AsamaItem[]
  dbAsamalar: AsamaItem[]
  currentAsamaSira: number
  STAGE_ROUTES: Record<number, string>
  STAGE_SHORT_LABELS: Record<number, string>
  // Form State
  status: string
  setStatus: (v: string) => void
  acilisTarihi: string
  setAcilisTarihi: (v: string) => void
  sonTeklifTarihi: string
  setSonTeklifTarihi: (v: string) => void
  teminTarihi: string
  setTeminTarihi: (v: string) => void
  teslimTarihi: string
  setTeslimTarihi: (v: string) => void
  notlar: string
  setNotlar: (v: string) => void
  saveLoading: boolean
  saveMessage: string
  // Handlers
  handleEditDosya: () => void
  handleSurecAkisi: () => void
  handleOpenInNewWindow: () => void
  handleDelete: () => Promise<void>
  handleUpdateDosya: (e: React.FormEvent) => Promise<void>
  handleToggleSign: (belgeId: number, currentState: number) => Promise<void>
  formatCurrency: (value: number) => string
}
