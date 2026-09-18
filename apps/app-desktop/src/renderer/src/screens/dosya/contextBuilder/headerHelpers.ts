import { getInstitutionSuffixes } from '../../../utils/kurumHelper'

export function buildAntetSatirlari(kurum: any, dosyaResData: any, settings: any): string[] {
  let antetSatirlari: string[] = []
  if (kurum?.kurum_anteti) {
    try {
      const parsed = JSON.parse(kurum.kurum_anteti)
      if (Array.isArray(parsed)) {
        antetSatirlari = parsed.filter((s: string) => s && s.trim() !== '')
      }
    } catch {
      antetSatirlari = kurum.kurum_anteti ? [kurum.kurum_anteti] : []
    }
  }

  const birimAntet = (
    dosyaResData?.antet_ek_satir ||
    dosyaResData?.birim_antet_ek_satir ||
    dosyaResData?.birim_adi ||
    dosyaResData?.harcama_birimi ||
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
