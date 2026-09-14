export const SABLON_ALIAS_MAP: Record<string, string[]> = {
  'son-alim-fiyat-cetveli': [
    'son-alim-fiyat-cetveli',
    'son-alim',
    'son-alim-fiyatlari',
    'sonalimfiyatcetveli'
  ],
  'teklif-isteme-mektubu': [
    'fiyat-arastirma-mektubu',
    'arastirma-mektubu',
    'birim-fiyat-teklif-mektubu',
    'teklif-isteme-mektubu'
  ],
  'teklif-mektubu-dagitim': [
    'dagitim-cizelgesi',
    'teklif-mektubu-dagitim-cizelgesi',
    'teklif-mektubu-dagitim'
  ],
  'teklif-mektubu-dagitim-karma': [
    'dagitim-cizelgesi-karma',
    'teklif-mektubu-dagitim-karma',
    'teklif-mektubu-karma'
  ],
  'firmalar-teklif-cetveli': [
    'birim-fiyat-teklif-cetveli',
    'firmalar-teklif-cetveli',
    'piyasa-fiyat-arastirmasi-sonuc-cetveli'
  ],
  'yasaklilik-sorgulama-tutanagi': [
    'yasaklilik-sorgulama-tutanagi',
    'yasaklilik-sorgulama',
    'ekap-yasaklilik'
  ],
  'piyasa-fiyat-arastirma-gorevlendirmesi': [
    'piyasa-fiyat-arastirma-gorevlendirmesi'
  ],
  'piyasa-fiyat-arastirma-tutanagi': [
    'piyasa-fiyat-arastirma-tutanagi',
    'fiyat-arastirmasi-tutanagi'
  ],
  'yaklasik-maliyet-cetveli': [
    'yaklasik-maliyet-cetveli',
    'yaklasik-maliyet-hesap-cetveli'
  ],
  'dogrudan-temin-onay-belgesi': [
    'dogrudan-temin-onay-belgesi',
    'idare-onay-belgesi',
    'onay-belgesi'
  ],
  'komisyon-gorevlendirme-onayi': [
    'komisyon-gorevlendirme-onayi',
    'gorevlendirme-onayi',
    'yaklasik-maliyet-tespit-komisyonu',
    'piyasa-fiyat-arastirma-gorevlendirmesi'
  ],
  'yaklasik-maliyet-tespit-komisyonu': [
    'yaklasik-maliyet-tespit-komisyonu',
    'komisyon-gorevlendirme-onayi',
    'gorevlendirme-onayi',
    'piyasa-fiyat-arastirma-gorevlendirmesi'
  ],
  'komisyon-gorevlendirme-onayi-eki': [
    'komisyon-gorevlendirme-onayi-eki',
    'gorevlendirme-onay-eki',
    'komisyon-atama-onay-eki'
  ],
  'muayene-kabul-komisyonu': [
    'muayene-kabul-komisyonu',
    'muayene-kabul-ve-tespit-komisyonu',
    'komisyon-gorevlendirme-onayi'
  ]
}

export const normalizeForMatch = (str: string): string =>
  str
    .toLocaleLowerCase('tr-TR')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '')

export function findSablonByAlias(sablons: any[] | undefined | null, targetKey: string): any {
  if (!sablons || sablons.length === 0 || !targetKey) return null

  const cleanTarget = targetKey.replace(/\.html$/, '').toLowerCase().trim()
  const candidateKeys = SABLON_ALIAS_MAP[cleanTarget] || [cleanTarget]

  // 1. Exact match on dosya_adi (with or without .html)
  for (const key of candidateKeys) {
    const found = sablons.find((s: any) => {
      const fileBase = (s.dosya_adi || '').replace(/\.html$/, '').toLowerCase().trim()
      return fileBase === key
    })
    if (found) return found
  }

  // 2. Exact match on route_path or id
  for (const key of candidateKeys) {
    const found = sablons.find((s: any) => {
      const route = (s.route_path || s.id || '').toLowerCase().trim()
      return route === key
    })
    if (found) return found
  }

  // 3. Fallback: Normalized title/name exact match
  for (const key of candidateKeys) {
    const normKey = normalizeForMatch(key)
    const found = sablons.find((s: any) => {
      const normSablonName = normalizeForMatch(s.ad || s.dosya_adi || '')
      return normSablonName === normKey
    })
    if (found) return found
  }

  // 4. Substring fallback
  for (const key of candidateKeys) {
    const normKey = normalizeForMatch(key)
    const found = sablons.find((s: any) => {
      const normSablonName = normalizeForMatch(s.ad || s.dosya_adi || '')
      return normSablonName.includes(normKey) || normKey.includes(normSablonName)
    })
    if (found) return found
  }

  return null
}
