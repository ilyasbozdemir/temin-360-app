import { getInstitutionSuffixes } from '../../../utils/kurumHelper'

export function buildAntetSatirlari(kurum: any, dosyaResData: any, settings: any): string[] {
  let antetSatirlari: string[] = []
  if (kurum?.kurum_anteti) {
    try {
      const parsed = JSON.parse(kurum.kurum_anteti)
      if (Array.isArray(parsed) && parsed.filter(Boolean).length > 0) {
        antetSatirlari = parsed.filter((s: string) => s && s.trim() !== '')
      }
    } catch {
      antetSatirlari = kurum.kurum_anteti ? [kurum.kurum_anteti] : []
    }
  }

  if (antetSatirlari.length === 0) {
    antetSatirlari = ['T.C.']
    if (kurum?.ust_kurum_adi && kurum.ust_kurum_adi.trim()) {
      antetSatirlari.push(kurum.ust_kurum_adi.trim().toUpperCase())
    }
    if (kurum?.kurum_adi && kurum.kurum_adi.trim()) {
      antetSatirlari.push(kurum.kurum_adi.trim().toUpperCase())
    } else if (settings?.institutionName && settings.institutionName.trim()) {
      antetSatirlari.push(settings.institutionName.trim().toUpperCase())
    }
  }

  const birimAntet = (
    dosyaResData?.antet_ek_satir ||
    dosyaResData?.birim_antet_ek_satir ||
    dosyaResData?.islem_yapan_birim ||
    dosyaResData?.islemYapanBirim ||
    dosyaResData?.harcama_birimi ||
    dosyaResData?.harcama_birim_adi ||
    dosyaResData?.talep_eden_birim ||
    dosyaResData?.birim ||
    dosyaResData?.birim_adi ||
    settings?.harcamaBirimAdi ||
    ''
  ).trim()

  if (
    birimAntet &&
    !antetSatirlari.some((s: string) => s.trim().toUpperCase() === birimAntet.toUpperCase())
  ) {
    antetSatirlari.push(birimAntet)
  }

  return antetSatirlari
}

export function buildInstitutionSuffixes(subInstType: string, settings: any) {
  return getInstitutionSuffixes(subInstType, {
    label: settings?.customSubInstitutionLabel,
    kurumumuz: settings?.customSubInstitutionKurumumuz,
    kurumunuz: settings?.customSubInstitutionKurumumuz,
    kurumu: settings?.customSubInstitutionKurumu,
    kurumlari: settings?.customSubInstitutionKurumlari
  })
}
