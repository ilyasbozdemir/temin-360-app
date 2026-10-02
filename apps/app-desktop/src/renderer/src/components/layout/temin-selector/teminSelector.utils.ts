import { BadgeInfo, Dosya2886Item, DosyaListItem } from './teminSelector.types'

export const formatMoney = (val?: number): string =>
  val
    ? val.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : '0,00'

export const isIhaleOrYapim = (d: DosyaListItem): boolean =>
  d.tur === 'hakedis' ||
  d.tur === 'ihale' ||
  (d.ihale_sekli?.toLowerCase().includes('hakedis') ?? false) ||
  (d.ihale_sekli?.toLowerCase().includes('açık') ?? false) ||
  (d.ihale_sekli?.toLowerCase().includes('pazarlık') ?? false) ||
  d.ihale_tipi === 'Hakediş' ||
  d.ihale_tipi === 'Açık İhale' ||
  d.ihale_tipi === 'Pazarlık' ||
  (d.temin_no?.toUpperCase().startsWith('İH-') ?? false) ||
  (d.temin_no?.toUpperCase().startsWith('IH-') ?? false)

export const getMevzuatBadgeInfo = (dosya: DosyaListItem): BadgeInfo => {
  const itemIsIhale = isIhaleOrYapim(dosya)
  const sekli = (dosya?.ihale_sekli || '').toLowerCase()
  const tipi = (dosya?.ihale_tipi || '').toLowerCase()

  if (itemIsIhale) {
    if (sekli.includes('açık') || tipi.includes('açık') || sekli.includes('19')) {
      return {
        label: '4734 / Md. 19 (Açık)',
        className:
          'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
      }
    }
    if (sekli.includes('pazarlık') || tipi.includes('pazarlık') || sekli.includes('21')) {
      return {
        label: '4734 / Md. 21 (Pazarlık)',
        className:
          'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60'
      }
    }
    if (sekli.includes('hakedis') || tipi.includes('hakediş')) {
      return {
        label: 'Sözleşme & Hakediş',
        className:
          'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
      }
    }
    return {
      label: 'İhale & Sözleşme',
      className:
        'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
    }
  }

  if (sekli.includes('22/a') || sekli.includes('22-a')) {
    return {
      label: '4734 / 22-a (Tek Kaynak)',
      className:
        'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
    }
  }
  if (sekli.includes('22/b') || sekli.includes('22-b')) {
    return {
      label: '4734 / 22-b (Özel Hak/Patent)',
      className:
        'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
    }
  }
  if (sekli.includes('22/c') || sekli.includes('22-c')) {
    return {
      label: '4734 / 22-c (Mevcut Uyumluluk)',
      className:
        'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
    }
  }
  if (sekli.includes('22/e') || sekli.includes('22-e')) {
    return {
      label: '4734 / 22-e (Taşınmaz/Kira)',
      className:
        'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
    }
  }
  if (sekli.includes('22/f') || sekli.includes('22-f')) {
    return {
      label: '4734 / 22-f (İlaç/Tıbbi Cihaz)',
      className:
        'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
    }
  }

  if (dosya?.tur === 'mal') {
    return {
      label: '4734 / 22-d & 22-a',
      className:
        'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
    }
  }
  if (dosya?.tur === 'hizmet') {
    return {
      label: '4734 / 22-d',
      className:
        'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60'
    }
  }
  if (dosya?.tur === 'yapim_isi') {
    return {
      label: '4734 / 22-d',
      className:
        'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
    }
  }
  if (dosya?.tur === 'danismanlik') {
    return {
      label: 'Teknik & Müşavirlik',
      className:
        'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200/80 dark:border-pink-800/60'
    }
  }

  return {
    label: '4734 / 22-d',
    className:
      'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60'
  }
}

export const get2886MevzuatBadge = (d: Dosya2886Item): BadgeInfo => {
  if (d.usul === 'kapali_teklif_36') {
    return {
      label: '2886 / Md. 36 (Kapalı)',
      className:
        'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60'
    }
  }
  if (d.usul === 'pazarlik_51') {
    return {
      label: '2886 / Md. 51 (Pazarlık)',
      className:
        'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
    }
  }
  return {
    label: '2886 / Md. 45 (Açık Teklif)',
    className:
      'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60'
  }
}

export const get2886IslemTuruBadge = (turu: string): BadgeInfo => {
  if (turu === 'satis') {
    return {
      label: 'Taşınmaz / Menkul Satış',
      className:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200'
    }
  }
  if (turu === 'kiralama') {
    return {
      label: 'Kiralama İhalesi',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200'
    }
  }
  if (turu === 'irtifak_hakki') {
    return {
      label: 'Sınırlı Ayni Hak / İrtifak',
      className:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200'
    }
  }
  if (turu === 'trampa') {
    return {
      label: 'Trampa / Takas',
      className:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200'
    }
  }
  return {
    label: '2886 İhale',
    className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200'
  }
}
