import { SAYI_YAZI_MAP, sayiyiYaziyaCevir, paraYaziyaCevir } from '../../constants/sayiEslesmeleri'
import { formatDateString, getFileDate } from './contextBuilder/dateHelpers'
import { buildAntetSatirlari, buildInstitutionSuffixes } from './contextBuilder/headerHelpers'
import { calculateFirmaTeklifleri } from './contextBuilder/bidsHelpers'
import { calculateNeedItems } from './contextBuilder/itemsHelpers'
import { buildKapakDetaylari, parseAciklamaMaddeleri } from './contextBuilder/kapakHelpers'
import { buildFormattedEvrakSayisi } from './contextBuilder/evrakHelpers'
import { getKurumIhtiyacYeriDefault } from '../../utils/kurumHelper'

export { formatDateString, getFileDate }

export function buildDocumentContext(
  dosyaResData: any,
  kalemlerData: any[],
  firms: any[],
  bidsMap: Record<string, number>,
  commission: any[],
  muayeneKomisyonu: any[],
  kurum: any,
  settings: any,
  resolvedMappings: Record<string, any>
): any {
  const subInstType = settings?.subInstitutionType || ''
  const antetSatirlari = buildAntetSatirlari(kurum, dosyaResData, settings)
  const suffixes = buildInstitutionSuffixes(subInstType, settings)
  const fileDate = getFileDate(dosyaResData)

  const kalemSayisi = kalemlerData?.length || 0
  const kalemSayisiYazi = sayiyiYaziyaCevir(kalemSayisi)

  // Para birimi formatlayıcı
  const formatTR = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val)
  }

  // Firma teklifleri & sıralamaları
  const {
    firmaToplamlari,
    calculatedTeklifler,
    enAvantajliTeklifSahibi,
    enAvantajliTeklifBedeli,
    ikinciAvantajliTeklifSahibi,
    ikinciAvantajliTeklifBedeli
  } = calculateFirmaTeklifleri(firms, kalemlerData, bidsMap, formatTR)

  // Hesaplama esası (ortalama vs. en düşük)
  const isAverageBasis = dosyaResData?.hesaplama_esasi?.toLowerCase().includes('ortalama')
  const isLowestBasis = !isAverageBasis

  // İhtiyaç kalemleri & toplam bedel hesaplaması
  const { needItems, grandTotal, totalKdv } = calculateNeedItems(
    kalemlerData,
    firms,
    bidsMap,
    isLowestBasis,
    formatTR
  )

  const genelToplam = formatTR(grandTotal)

  const rawHarcamaBirimi =
    dosyaResData?.birim_tablo_adi ||
    dosyaResData?.birim_adi ||
    dosyaResData?.harcama_birimi ||
    settings?.harcamaBirimAdi ||
    ''
  const parentInstitutionName = settings?.parentInstitution || ''
  const institutionName = settings?.institutionName || ''
  const idareAdi = rawHarcamaBirimi ? `${institutionName} - ${rawHarcamaBirimi}` : institutionName

  const rawTur = dosyaResData?.tur || 'mal'
  let alimTuruText = 'Mal Alımı'
  if (rawTur === 'hizmet') alimTuruText = 'Hizmet Alımı'
  else if (rawTur === 'yapim_isi' || rawTur === 'yapim') alimTuruText = 'Yapım İşi'
  else if (rawTur === 'danismanlik') alimTuruText = 'Danışmanlık Hizmet Alımı'

  const isMal = rawTur === 'mal'
  const isHizmet = rawTur === 'hizmet' || rawTur === 'danismanlik'
  const isYapim = rawTur === 'yapim_isi' || rawTur === 'yapim'

  const rawButceKodu = dosyaResData?.butce_kodu || ''
  const butceTertibiArray = rawButceKodu
    .split(/[\n,;]+/)
    .map((item: string) => item.trim())
    .filter((item: string) => item.length > 0)
    .map((item: string) => {
      let cleanItem = item
      if (cleanItem.startsWith('630.')) {
        cleanItem = cleanItem.substring(4)
      } else if (cleanItem.startsWith('630')) {
        cleanItem = cleanItem.substring(3)
      }
      return cleanItem
    })

  const dbYaklasikMaliyet = dosyaResData?.yaklasik_maliyet || 0
  const effectiveYaklasikMaliyet = dbYaklasikMaliyet > 0 ? dbYaklasikMaliyet : grandTotal
  const yaklasikMaliyetText = formatTR(effectiveYaklasikMaliyet)
  const teminSekliText =
    dosyaResData?.ihale_sekli || "4734 sayılı Kanun'un 22/d maddesi gereğince Doğrudan Temin"

  const kapakDetaylari = buildKapakDetaylari(
    dosyaResData,
    alimTuruText,
    teminSekliText,
    effectiveYaklasikMaliyet,
    yaklasikMaliyetText,
    butceTertibiArray,
    grandTotal,
    totalKdv,
    formatTR
  )

  const formattedEvrakSayisi = buildFormattedEvrakSayisi(kurum, dosyaResData, rawTur)
  const aciklamaMaddeleri = parseAciklamaMaddeleri(dosyaResData?.isin_aciklama_maddeleri)

  const dosyaSayisi = dosyaResData?.temin_no || ''
  const dosyaYili =
    dosyaResData?.butce_yili ||
    (dosyaResData?.tarih ? dosyaResData.tarih.split('.')[2] : new Date().getFullYear())

  const context: any = {
    aciklamaMaddeleri,
    hasAciklamaMaddeleri: aciklamaMaddeleri.length > 0,
    dosyaYili: dosyaYili,
    kapakDetaylari,
    tarih: fileDate,
    dosyaTarihi: fileDate,
    dosyaAcilisTarihi: formatDateString(dosyaResData?.dosya_acilis_tarihi) || fileDate,
    acilisTarihi: formatDateString(dosyaResData?.dosya_acilis_tarihi) || fileDate,
    onayTarihi: formatDateString(dosyaResData?.onay_tarihi) || fileDate,
    onayaSunulanTarih: formatDateString(dosyaResData?.temin_tarihi) || formatDateString(dosyaResData?.dosya_acilis_tarihi) || fileDate,
    kararTarihi: formatDateString(dosyaResData?.karar_tarihi) || fileDate,
    belgeTarihi: fileDate,
    talepTarihi: fileDate,
    olurTarihi: formatDateString(dosyaResData?.onay_tarihi) || fileDate,
    davetTarihi: fileDate,
    komisyonTarihi: fileDate,
    duzenlemeTarihi: fileDate,
    teklifTarihi: fileDate,
    faturaTarihi: fileDate,
    teslimTarihi: formatDateString(dosyaResData?.teslim_tarihi) || fileDate,
    sonTeklifTarihi:
      formatDateString(dosyaResData?.son_teklif_verme_tarihi) ||
      formatDateString(dosyaResData?.son_teklif_tarihi) ||
      fileDate,
    alimTuru: alimTuruText,
    isMal,
    isHizmet,
    isYapim,
    yukleniciFirma: dosyaResData?.yuklenici_firma_adi || null,
    yukleniciAdresi: dosyaResData?.yuklenici_firma_adresi || '',
    yukleniciIlce: dosyaResData?.yuklenici_firma_ilcesi || '',
    yukleniciIl: dosyaResData?.yuklenici_firma_ili || '',
    yukleniciTelefon: dosyaResData?.yuklenici_firma_telefon || '',
    yukleniciFaks: dosyaResData?.yuklenici_firma_faks || '',
    yukleniciEposta: dosyaResData?.yuklenici_firma_email || '',
    yukleniciVergiDairesi: dosyaResData?.yuklenici_firma_vergi_dairesi || '',
    yukleniciVergiNo: dosyaResData?.yuklenici_firma_vergi_no || '',
    idareAdresi: kurum?.adres || settings?.kurumAdres || '',
    idareTelefon: kurum?.telefon || settings?.kurumTelefon || '',
    idareEposta: kurum?.eposta || settings?.kurumEposta || '',
    kurumAdres: kurum?.adres || settings?.kurumAdres || '',
    kurumTelefon: kurum?.telefon || settings?.kurumTelefon || '',
    kurumEposta: kurum?.eposta || settings?.kurumEposta || '',
    kurumKep: kurum?.kep_adresi || '',
    kurumWeb: kurum?.web_sitesi || '',
    kurumIci: true,
    evrakSayisi: formattedEvrakSayisi,
    evrakNo: formattedEvrakSayisi,
    sayi: dosyaResData?.temin_no || formattedEvrakSayisi || '',
    sayisi: dosyaResData?.temin_no || formattedEvrakSayisi || '',
    dosyaSayisi: dosyaResData?.temin_no || '',
    dosyaKonusu: undefined,
    isAdi: dosyaResData?.konu || '',
    isinAdi: dosyaResData?.konu || '',
    sayiYazıyla: SAYI_YAZI_MAP,
    kurumumuz: suffixes.kurumumuz,
    kurumunuz: suffixes.kurumunuz,
    kurumu: suffixes.kurumu,
    kurumlari: suffixes.kurumlari,
    kalemSayisi,
    kalemSayisiYazi,
    solLogo: settings?.logoLeft || null,
    sagLogo: settings?.logoRight || null,
    kurumUst: parentInstitutionName,
    kurumAdi: institutionName,
    mudurluk: rawHarcamaBirimi,
    ihtiyacYeri:
      dosyaResData?.ihtiyac_yeri ||
      dosyaResData?.ihtiyac_yeri_eki ||
      getKurumIhtiyacYeriDefault(kurum),
    idareAdi: idareAdi,
    sunulacakMakam:
      dosyaResData?.sunulacak_makam ||
      dosyaResData?.makam ||
      (antetSatirlari.length > 0 ? antetSatirlari.join(' ') : idareAdi),
    baskanAdi: dosyaResData?.onaylayan_ad_soyad || '',
    baskanUnvan: dosyaResData?.onaylayan_unvan || 'Harcama Yetkilisi',
    teminNo: dosyaResData?.temin_no || '',
    maddeNo: dosyaResData?.ihale_sekli || '22/d',
    yaklasikMaliyet: yaklasikMaliyetText,
    toplamMaliyet: yaklasikMaliyetText,
    toplamTutar: genelToplam,
    yaklasikMaliyetYazi: paraYaziyaCevir(effectiveYaklasikMaliyet),
    odenekTutari: settings?.kullanilabilirOdenek || '',
    projeNo: dosyaResData?.yatirim_proje_no || '',
    butceTertibi: butceTertibiArray,
    butceKodu: rawButceKodu || '',
    avansSartlari:
      dosyaResData?.avans_verilecek_mi === 1 ? 'Avans verilecektir.' : 'Avans verilmeyecek',
    fiyatFarkiSartlari: dosyaResData?.fiyat_farki_dayanagi || 'Fiyat Farkı Ödenmeyecek',
    yillaraYaygin: dosyaResData?.yillara_yaygin === 1 ? 'Yıllara Yaygın Hizmet Alımı' : 'Hayır',
    sozlesmeYapilacak: dosyaResData?.sozlesme_yapilacak_mi === 1 ? 'Evet' : 'Hayır',
    hesaplamaEsasi: dosyaResData?.hesaplama_esasi || 'Ortalama fiyat esasına göre',
    isOrtalama: isAverageBasis,
    isEnDusuk: isLowestBasis,
    vkomisyontakdiri:
      dosyaResData?.komisyon_takdiri || 'Sadece araştırma fiyatları dikkate alınacak',
    komisyonTakdiri:
      dosyaResData?.komisyon_takdiri || 'Sadece araştırma fiyatları dikkate alınacak',
    dokumanHazirlik: 'Hazırlanmayacaktır.',
    isinAciklamasi: dosyaResData?.isin_aciklamasi || dosyaResData?.konu || '',
    onaylayanPersonelAdi: dosyaResData?.onaylayan_ad_soyad || '',
    onaylayanPersonelUnvan: dosyaResData?.onaylayan_unvan || '',
    onaylayanlar: [
      {
        onaylayanPersonelAdi: dosyaResData?.onaylayan_ad_soyad || '',
        onaylayanPersonelUnvan: dosyaResData?.onaylayan_unvan || ''
      }
    ],
    komisyon: commission.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    })),
    komisyonUyeleri: commission.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    })),
    gorevlendirilenler: commission.map((c: any, index: number, arr: any[]) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi,
      hasMore: index < arr.length - 1
    })),
    fiyatKomisyonu: commission.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    })),
    muayeneKomisyonu: muayeneKomisyonu.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    })),
    hazirlayanPersonelAdi: dosyaResData?.hazirlayan_ad_soyad || '',
    hazirlayanTelefon: dosyaResData?.hazirlayan_telefon || '',
    hazirlayanEposta: dosyaResData?.hazirlayan_eposta || '',
    hazirlayanPersonelUnvan: dosyaResData?.hazirlayan_unvan || '',
    talepEdenPersonelAdi: dosyaResData?.talep_eden_ad_soyad || '',
    talepEdenPersonelUnvan: dosyaResData?.talep_eden_unvan || '',
    talepEdenTelefon: dosyaResData?.talep_eden_telefon || '',
    sunanPersonelAdi: dosyaResData?.sunan_ad_soyad || '',
    sunanPersonelUnvan: dosyaResData?.sunan_unvan || '',
    sunanTelefon: dosyaResData?.sunan_telefon || '',
    ilgiliPersonelAdi: dosyaResData?.irtibat_ad_soyad || '',
    ilgiliPersonelUnvan: dosyaResData?.irtibat_unvan || '',
    ilgiliTelefon: dosyaResData?.irtibat_telefon || '',
    irtibatTelefon: dosyaResData?.irtibat_telefon || '',
    firmalar: firms.map((f: any) => ({ unvan: f.unvan })),
    firmalarColspan: firms.length + 2,
    firmaToplamlari,
    firmaToplamlariDetay: firmaToplamlari,
    genelToplam,
    genelToplamYazi: paraYaziyaCevir(grandTotal),
    sozlesmeBedeli: genelToplam,
    sozlesmeBedeliYazi: paraYaziyaCevir(grandTotal),
    pulBedeli: formatTR(grandTotal * 0.00948),
    teklifler: calculatedTeklifler,
    enAvantajliTeklifSahibi,
    enAvantajliTeklifBedeli,
    ikinciAvantajliTeklifSahibi,
    ikinciAvantajliTeklifBedeli,
    ihaleKomisyonu: commission.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    })),
    teslimGun: dosyaResData?.teslim_gun
      ? String(dosyaResData.teslim_gun)
      : (dosyaResData?.teslim_suresi
        ? String(dosyaResData.teslim_suresi)
        : (dosyaResData?.teslim_tarihi
          ? (() => {
              const tDate = new Date(dosyaResData.teslim_tarihi)
              const bDate = dosyaResData.tarih ? new Date(dosyaResData.tarih) : new Date()
              const diff = Math.ceil((tDate.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24))
              return diff > 0 ? String(diff) : '7'
            })()
          : '7')),
    teslimGunu: dosyaResData?.teslim_gun
      ? String(dosyaResData.teslim_gun)
      : (dosyaResData?.teslim_suresi
        ? String(dosyaResData.teslim_suresi)
        : (dosyaResData?.teslim_tarihi
          ? (() => {
              const tDate = new Date(dosyaResData.teslim_tarihi)
              const bDate = dosyaResData?.dosya_acilis_tarihi
                ? new Date(dosyaResData.dosya_acilis_tarihi)
                : (dosyaResData?.tarih ? new Date(dosyaResData.tarih) : new Date())
              const diff = Math.ceil((tDate.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24))
              return diff > 0 ? String(diff) : '7'
            })()
          : '7')),
    gunSayisi: dosyaResData?.gun_sayisi
      ? String(dosyaResData.gun_sayisi)
      : (dosyaResData?.teslim_gun
        ? String(dosyaResData.teslim_gun)
        : (dosyaResData?.son_teklif_tarihi
          ? (() => {
              const sDate = new Date(dosyaResData.son_teklif_tarihi)
              const bDate = dosyaResData?.dosya_acilis_tarihi
                ? new Date(dosyaResData.dosya_acilis_tarihi)
                : (dosyaResData?.tarih ? new Date(dosyaResData.tarih) : new Date())
              const diff = Math.ceil((sDate.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24))
              return diff > 0 ? String(diff) : undefined
            })()
          : undefined)),
    gunSayisiYazi: dosyaResData?.gun_sayisi_yazi
      ? dosyaResData.gun_sayisi_yazi
      : (dosyaResData?.gun_sayisi || dosyaResData?.teslim_gun
        ? sayiyiYaziyaCevir(Number(dosyaResData?.gun_sayisi || dosyaResData?.teslim_gun))
        : undefined)
  }

  // Güvenli birleştirme (Safe Merge)
  for (const [key, val] of Object.entries(resolvedMappings || {})) {
    if (val !== undefined && val !== null) {
      const isPlaceholder = typeof val === 'string' && val.startsWith('[Belirtilmedi')
      const hasRealValue =
        context[key] !== undefined &&
        context[key] !== '' &&
        !String(context[key]).startsWith('[Belirtilmedi')
      if (isPlaceholder && hasRealValue) {
        continue
      }
      context[key] = val
    }
  }

  let finalEvrakSayisi = resolvedMappings.evrakSayisi
  if (
    !finalEvrakSayisi ||
    String(finalEvrakSayisi).startsWith('[Belirtilmedi') ||
    finalEvrakSayisi === dosyaSayisi
  ) {
    finalEvrakSayisi = formattedEvrakSayisi
  }
  context.evrakSayisi = finalEvrakSayisi

  if (
    resolvedMappings.antetSatirlari !== undefined &&
    (resolvedMappings.antetSatirlari === null ||
      String(resolvedMappings.antetSatirlari).startsWith('[Belirtilmedi'))
  ) {
    context.antetSatirlari = antetSatirlari
  } else if (resolvedMappings.antetSatirlari !== undefined) {
    context.antetSatirlari = resolvedMappings.antetSatirlari
  }

  if (
    resolvedMappings.ihtiyacKalemleri !== undefined &&
    Array.isArray(resolvedMappings.ihtiyacKalemleri) &&
    resolvedMappings.ihtiyacKalemleri.length > 0
  ) {
    context.ihtiyacKalemleri = resolvedMappings.ihtiyacKalemleri
  } else {
    context.ihtiyacKalemleri = needItems
  }

  return context
}
