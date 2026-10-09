export function buildFormattedEvrakSayisi(
  kurum: any,
  dosyaResData: any,
  rawTur: string,
  explicitIsEImza?: boolean
): string {
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

  // "E-" öneki evrak sayısının asli parçası değil, belgenin elektronik ortamda (EBYS'de / e-imzayla) düzenlendiğini gösteren ön ektir.
  // E-imzalı yazı: E-56383307-934.01-0001
  // Islak imzalı yazı: 56383307-934.01-0001 (başında E- olmaz)
  const isEImza =
    explicitIsEImza !== undefined
      ? explicitIsEImza
      : dosyaResData?.imza_turu === 'islak' ||
          dosyaResData?.imza_turu === 'fiziksel' ||
          dosyaResData?.is_eimza === false ||
          dosyaResData?.e_imza === false
        ? false
        : true

  const prefix = isEImza ? 'E-' : ''
  return `${prefix}${effectiveDetsis}-${sdpKodu}-${paddedSayi}`
}

export function formatEvrakSayisi(options: {
  detsisKodu?: string
  sdpKodu?: string
  siraNo?: string | number
  isEImza?: boolean
}): string {
  const effectiveDetsis = options.detsisKodu || '0000000000'
  const effectiveSdp = options.sdpKodu || '934.01'
  const cleanSayi = String(options.siraNo || '1').replace(/\D/g, '') || '1'
  const paddedSayi = cleanSayi.padStart(4, '0')
  const prefix = options.isEImza !== false ? 'E-' : ''
  return `${prefix}${effectiveDetsis}-${effectiveSdp}-${paddedSayi}`
}
