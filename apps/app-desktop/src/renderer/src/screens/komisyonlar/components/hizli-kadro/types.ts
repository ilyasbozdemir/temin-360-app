import { DOC_GROUPS } from '@temin360/document-templates'

export interface PersonelItem {
  id: number
  ad_soyad: string
  unvan: string | null
  birim?: string | null
}

export interface GorevItem {
  id: number
  ad: string
  aciklama?: string | null
}

export interface MemberRow {
  id: string | number
  dbUyeId?: number | null
  gorevId: number | null
  gorevAd: string
  personelId: number | null
  asilMi: number // 1: Asil, 0: Yedek
  belgedeGoster: boolean // Resmi belgede gösterilsin mi?
  belgeSablonIds: string[] | null // null => Tüm belgeler (varsayılan), [] => Hiçbir belge (gizli), [...] => Belirtilen şablonlar
}

export interface HizliKadroGuncelleModalProps {
  isOpen: boolean
  onClose: () => void
  komisyonId: number | null
  komisyonAdi?: string
  activeDosyaId?: number | null
}

export const DEFAULT_YAKLASIK_ROLES = [
  { ad: 'Harcama Yetkilisi', asil: 1, belgedeGoster: true, belgeSablonIds: [...DOC_GROUPS.olur_onay] },
  { ad: 'Satın Alma Harcama Yetkilisi', asil: 1, belgedeGoster: true, belgeSablonIds: [...DOC_GROUPS.olur_onay] },
  { ad: 'Gerçekleştirme Görevlisi', asil: 1, belgedeGoster: true, belgeSablonIds: [...DOC_GROUPS.olur_onay] },
  { ad: 'Muhasebe Yetkilisi', asil: 1, belgedeGoster: false, belgeSablonIds: [] },
  {
    ad: 'Fiyat Araştırma Görevlisi',
    asil: 1,
    belgedeGoster: true,
    belgeSablonIds: [...DOC_GROUPS.piyasa_arastirma]
  },
  {
    ad: 'Fiyat Araştırma Görevlisi',
    asil: 1,
    belgedeGoster: true,
    belgeSablonIds: [...DOC_GROUPS.piyasa_arastirma]
  },
  {
    ad: 'Fiyat Araştırma Görevlisi',
    asil: 1,
    belgedeGoster: true,
    belgeSablonIds: [...DOC_GROUPS.piyasa_arastirma]
  }
]

export const DEFAULT_MUAYENE_ROLES = [
  { ad: 'Komisyon Başkanı', asil: 1, belgedeGoster: true, belgeSablonIds: [...DOC_GROUPS.muayene_kabul] },
  { ad: 'Üye', asil: 1, belgedeGoster: true, belgeSablonIds: [...DOC_GROUPS.muayene_kabul] },
  { ad: 'Üye', asil: 1, belgedeGoster: true, belgeSablonIds: [...DOC_GROUPS.muayene_kabul] },
  { ad: 'Üye', asil: 0, belgedeGoster: true, belgeSablonIds: [...DOC_GROUPS.muayene_kabul] },
  { ad: 'Üye', asil: 0, belgedeGoster: true, belgeSablonIds: [...DOC_GROUPS.muayene_kabul] }
]

export function getDefaultScopeForRole(gorevAd: string): {
  belgeSablonIds: string[] | null
  belgedeGoster: boolean
} {
  const lower = (gorevAd || '').toLowerCase().trim()
  if (lower.includes('muhasebe')) {
    return { belgeSablonIds: [], belgedeGoster: false }
  }
  if (
    lower.includes('harcama') ||
    lower.includes('gerçekleştirme') ||
    lower.includes('gerceklestirme') ||
    lower.includes('onay') ||
    lower.includes('olur')
  ) {
    return { belgeSablonIds: [...DOC_GROUPS.olur_onay], belgedeGoster: true }
  }
  if (
    lower.includes('fiyat') ||
    lower.includes('piyasa') ||
    lower.includes('yaklaşık') ||
    lower.includes('yaklasik')
  ) {
    return { belgeSablonIds: [...DOC_GROUPS.piyasa_arastirma], belgedeGoster: true }
  }
  if (lower.includes('muayene') || lower.includes('kabul')) {
    return { belgeSablonIds: [...DOC_GROUPS.muayene_kabul], belgedeGoster: true }
  }
  return { belgeSablonIds: null, belgedeGoster: true }
}

