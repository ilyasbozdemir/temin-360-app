export function buildFormattedEvrakSayisi(kurum: any, dosyaResData: any, rawTur: string): string {
  const detsisNo = kurum?.detsis_kodu || ''
  const dosyaSayisi = dosyaResData?.temin_no || ''

  let sdpAltKodu = '99'
  if (rawTur === 'mal') {
    sdpAltKodu = '01'
  } else if (rawTur === 'hizmet' || rawTur === 'danismanlik') {
    sdpAltKodu = '02'
  } else if (rawTur === 'yapim_isi' || rawTur === 'yapim') {
    sdpAltKodu = '03'
  }
  const sdpKodu = `934.${sdpAltKodu}`

  const effectiveDetsis = detsisNo || '0000000000'
  const rawNumberStr = dosyaSayisi.includes('/')
    ? dosyaSayisi.split('/').pop()
    : dosyaSayisi.includes('-')
      ? dosyaSayisi.split('-').pop()
      : dosyaSayisi
  const cleanSayi = String(rawNumberStr || '').replace(/\D/g, '') || '1'
  const paddedSayi = cleanSayi.padStart(4, '0')

  return `E-${effectiveDetsis}-${sdpKodu}-${paddedSayi}`
}
