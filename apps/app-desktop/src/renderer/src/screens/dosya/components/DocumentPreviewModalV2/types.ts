import React from 'react'
import { IhtiyacListesiType } from '@temin360/document-templates'

export interface DocumentPreviewModalV2Props {
  isOpen: boolean
  documentId: string | null
  dosyaId?: number | null
  invitedFirms?: any[]
  onClose: () => void
  isModal?: boolean
  backLabel?: string
}

export interface Personel {
  id: number
  ad_soyad: string
  unvan?: string
  telefon?: string
  eposta?: string
}

export interface Firma {
  id: number
  temin_firma_id?: number
  unvan: string
  yetkili_ad_soyad?: string
  telefon?: string
  eposta?: string
  total?: number
  isWinner?: boolean
  label?: string
}
