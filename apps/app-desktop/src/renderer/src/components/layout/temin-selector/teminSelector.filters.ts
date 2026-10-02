import { Dosya2886Item, DosyaListItem, SubFilterType } from './teminSelector.types'
import { isIhaleOrYapim } from './teminSelector.utils'

export function filterDosyalar(
  dosyalar: DosyaListItem[],
  subFilter: SubFilterType,
  searchQuery: string,
  isDt: boolean,
  is2886: boolean
): DosyaListItem[] {
  return dosyalar.filter((d) => {
    if (d.is_deleted === 1) return false
    const isIhale = isIhaleOrYapim(d)

    if (subFilter === 'mode_default') {
      if (isDt && isIhale) return false
      if (!isDt && !is2886 && !isIhale) return false
    } else if (subFilter === 'dt_all') {
      if (isIhale) return false
    } else if (subFilter === 'dt_mal') {
      if (isIhale || d.tur !== 'mal') return false
    } else if (subFilter === 'dt_hizmet') {
      if (isIhale || (d.tur !== 'hizmet' && d.tur !== 'yapim_isi')) return false
    } else if (subFilter === 'ihale_all') {
      if (!isIhale) return false
    } else if (subFilter === 'ihale_acik') {
      if (
        !isIhale ||
        (!d.ihale_tipi?.includes('Açık') && !d.ihale_sekli?.toLowerCase().includes('açık'))
      ) {
        return false
      }
    } else if (subFilter === 'ihale_pazarlik') {
      if (
        !isIhale ||
        (!d.ihale_tipi?.includes('Pazarlık') && !d.ihale_sekli?.toLowerCase().includes('pazarlık'))
      ) {
        return false
      }
    } else if (subFilter === 'ihale_yapim') {
      const isYapim =
        d.tur === 'yapim_isi' ||
        d.tur === 'hakedis' ||
        (d.ihale_sekli?.toLowerCase().includes('yapım') ?? false) ||
        (d.ihale_sekli?.toLowerCase().includes('hakedis') ?? false) ||
        d.ihale_tipi === 'Hakediş'
      if (!isYapim) return false
    } else if (subFilter === 'ihale_hizmet') {
      const isHizmet =
        d.tur === 'hizmet' || (d.ihale_sekli?.toLowerCase().includes('hizmet') ?? false)
      if (!isHizmet) return false
    }

    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      (d.konu?.toLowerCase().includes(q) ?? false) ||
      (d.temin_no?.toLowerCase().includes(q) ?? false) ||
      String(d.id).includes(q) ||
      (d.isin_aciklamasi?.toLowerCase().includes(q) ?? false)
    )
  })
}

export function filter2886Dosyalar(
  dosyalar2886: Dosya2886Item[],
  subFilter: SubFilterType,
  searchQuery: string
): Dosya2886Item[] {
  return dosyalar2886.filter((d) => {
    if (subFilter === '2886_satis' && d.islemTuru !== 'satis') return false
    if (subFilter === '2886_kiralama' && d.islemTuru !== 'kiralama') return false
    if (subFilter === '2886_hak' && d.islemTuru !== 'irtifak_hakki' && d.islemTuru !== 'trampa') {
      return false
    }

    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      (d.ihaleAdi?.toLowerCase().includes(q) ?? false) ||
      (d.ihaleKayitNo?.toLowerCase().includes(q) ?? false) ||
      (d.id?.toLowerCase().includes(q) ?? false) ||
      (d.tasinmaz?.cinsi?.toLowerCase().includes(q) ?? false) ||
      (d.tasinmaz?.mahalleKoy?.toLowerCase().includes(q) ?? false) ||
      (d.tasinmaz?.ada?.toLowerCase().includes(q) ?? false) ||
      (d.tasinmaz?.parsel?.toLowerCase().includes(q) ?? false)
    )
  })
}
