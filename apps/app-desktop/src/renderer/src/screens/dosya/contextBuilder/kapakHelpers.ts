export function buildKapakDetaylari(
  dosyaResData: any,
  alimTuruText: string,
  teminSekliText: string,
  dbYaklasikMaliyet: number,
  yaklasikMaliyetText: string,
  butceTertibiArray: string[],
  grandTotal: number,
  totalKdv: number,
  formatTR: (val: number) => string
) {
  const rawKapakDetaylari: any[] = []
  if (dosyaResData?.butce_yili) {
    rawKapakDetaylari.push({ label: 'BÜTÇE YILI', value: String(dosyaResData.butce_yili) })
  }
  rawKapakDetaylari.push({
    label: 'İŞİN TÜRÜ / ALIM USULÜ',
    value: [alimTuruText, teminSekliText]
  })
  if (dosyaResData?.temin_no) {
    rawKapakDetaylari.push({ label: 'DOĞRUDAN TEMİN NUMARASI', value: dosyaResData.temin_no })
  }
  if (dosyaResData?.tarih) {
    rawKapakDetaylari.push({ label: 'DOSYA TARİHİ', value: dosyaResData.tarih })
  }
  if (dosyaResData?.konu) {
    rawKapakDetaylari.push({ label: 'İŞİN ADI', value: dosyaResData.konu, isBold: true })
  }
  if (dosyaResData?.isin_aciklamasi) {
    rawKapakDetaylari.push({ label: 'İŞİN AÇIKLAMASI', value: dosyaResData.isin_aciklamasi })
  }
  if (dbYaklasikMaliyet > 0) {
    rawKapakDetaylari.push({ label: 'YAKLAŞIK MALİYET', value: `${yaklasikMaliyetText} TL` })
  }
  if (butceTertibiArray.length > 0) {
    rawKapakDetaylari.push({ label: 'BÜTÇE TERTİBİ', value: butceTertibiArray })
  }
  if (dosyaResData?.yuklenici_firma_adi) {
    rawKapakDetaylari.push({
      label: 'YÜKLENİCİ FİRMA',
      value: dosyaResData.yuklenici_firma_adi,
      isBold: true
    })
    if (grandTotal > 0) {
      rawKapakDetaylari.push({
        label: 'SÖZLEŞME BEDELİ',
        value: [
          `${formatTR(grandTotal)} TL (KDV Hariç)`,
          `${formatTR(totalKdv)} TL (KDV)`,
          `${formatTR(grandTotal + totalKdv)} TL (KDV Dahil)`
        ],
        isBold: true
      })
    }
  }

  return rawKapakDetaylari.map((item) => ({
    label: item.label,
    lines: Array.isArray(item.value) ? item.value : [item.value],
    isBold: item.isBold || false
  }))
}

export function parseAciklamaMaddeleri(rawMaddeler: any): any[] {
  if (!rawMaddeler) return []
  try {
    const parsed = JSON.parse(rawMaddeler)
    if (Array.isArray(parsed)) {
      return parsed.map((m: string, idx: number) => ({
        siraNo: idx + 1,
        maddeMetni: m
      }))
    }
  } catch (e) {
    console.error(e)
  }
  return []
}
