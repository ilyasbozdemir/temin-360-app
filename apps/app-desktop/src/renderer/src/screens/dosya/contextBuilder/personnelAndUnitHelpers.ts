import { getKurumIhtiyacYeriDefault } from '../../../utils/kurumHelper'

export function buildPersonnelAndUnitContext(
  dosyaResData: any,
  commission: any[],
  muayeneKomisyonu: any[],
  kurum: any,
  settings: any,
  antetSatirlari: string[],
  idareAdi: string
) {
  const rawHarcamaBirimi =
    dosyaResData?.birim ||
    dosyaResData?.birim_tablo_adi ||
    dosyaResData?.birim_adi ||
    dosyaResData?.harcama_birimi ||
    settings?.harcamaBirimAdi ||
    ''

  const effectiveBirim = (
    dosyaResData?.birim ||
    dosyaResData?.birim_tablo_adi ||
    dosyaResData?.birim_adi ||
    rawHarcamaBirimi
  ).trim()

  const antetEkSatir = dosyaResData?.antet_ek_satir || dosyaResData?.birim_antet_ek_satir || effectiveBirim || ''

  const sunulacakMakam =
    dosyaResData?.sunulacak_makam ||
    dosyaResData?.makam ||
    (antetSatirlari.length > 0 ? antetSatirlari.join(' ') : idareAdi)

  const ihtiyacYeri =
    dosyaResData?.ihtiyac_yeri ||
    dosyaResData?.ihtiyac_yeri_eki ||
    effectiveBirim ||
    getKurumIhtiyacYeriDefault(kurum)

  const onaylayanAd = dosyaResData?.onaylayan_ad_soyad || dosyaResData?.onay_personel_adi || ''
  const onaylayanUnvan = dosyaResData?.onaylayan_unvan || 'Harcama Yetkilisi'

  return {
    birim: effectiveBirim || rawHarcamaBirimi,
    birimAdi: effectiveBirim || rawHarcamaBirimi,
    birim_adi: effectiveBirim || rawHarcamaBirimi,
    talepEdenBirim: ihtiyacYeri || effectiveBirim || rawHarcamaBirimi,
    harcamaBirimi: dosyaResData?.harcama_birimi || effectiveBirim || rawHarcamaBirimi,
    harcama_birimi: dosyaResData?.harcama_birimi || effectiveBirim || rawHarcamaBirimi,
    ihalesiYapilacakBirim: effectiveBirim || rawHarcamaBirimi,
    mudurluk: effectiveBirim || rawHarcamaBirimi,
    ihtiyacYeri,
    ihtiyac_yeri: ihtiyacYeri,
    antetEkSatir,
    antet_ek_satir: antetEkSatir,
    idareAdi,
    sunulacakMakam,
    sunulacak_makam: sunulacakMakam,
    makamAdi: sunulacakMakam,
    baskanAdi: onaylayanAd,
    baskanUnvan: onaylayanUnvan,
    harcamaYetkilisiAdi: onaylayanAd,
    harcamaYetkilisiUnvan: onaylayanUnvan,
    onaylayanPersonelAdi: onaylayanAd,
    onaylayanPersonelUnvan: onaylayanUnvan,
    onaylayanlar: [
      {
        onaylayanPersonelAdi: onaylayanAd,
        onaylayanPersonelUnvan: onaylayanUnvan
      }
    ],
    hazirlayanPersonelAdi: dosyaResData?.hazirlayan_ad_soyad || dosyaResData?.hazirlayan_personel_adi || '',
    hazirlayanTelefon: dosyaResData?.hazirlayan_telefon || '',
    hazirlayanEposta: dosyaResData?.hazirlayan_eposta || '',
    hazirlayanPersonelUnvan: dosyaResData?.hazirlayan_unvan || dosyaResData?.hazirlayan_personel_unvan || '',
    talepEdenPersonelAdi: dosyaResData?.talep_eden_ad_soyad || dosyaResData?.talep_eden_personel_adi || '',
    talepEdenPersonelUnvan: dosyaResData?.talep_eden_unvan || dosyaResData?.talep_eden_personel_unvan || '',
    talepEdenTelefon: dosyaResData?.talep_eden_telefon || '',
    birimAmiriAdi: dosyaResData?.talep_eden_ad_soyad || dosyaResData?.birim_amiri_ad_soyad || '',
    birimAmiriUnvan: dosyaResData?.talep_eden_unvan || dosyaResData?.birim_amiri_unvan || 'Birim Sorumlusu',
    kontrolEdenPersonelAdi: dosyaResData?.kontrol_eden_ad_soyad || dosyaResData?.kontrol_personel_adi || '',
    kontrolEdenPersonelUnvan: dosyaResData?.kontrol_eden_unvan || dosyaResData?.kontrol_personel_unvan || '',
    sunanPersonelAdi: dosyaResData?.sunan_ad_soyad || dosyaResData?.sunan_personel_adi || '',
    sunanPersonelUnvan: dosyaResData?.sunan_unvan || dosyaResData?.sunan_personel_unvan || '',
    sunanTelefon: dosyaResData?.sunan_telefon || '',
    ilgiliPersonelAdi: dosyaResData?.irtibat_ad_soyad || dosyaResData?.irtibat_personel_adi || '',
    ilgiliPersonelUnvan: dosyaResData?.irtibat_unvan || dosyaResData?.irtibat_personel_unvan || '',
    ilgiliTelefon: dosyaResData?.irtibat_telefon || '',
    irtibatTelefon: dosyaResData?.irtibat_telefon || '',
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
    ihaleKomisyonu: commission.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    }))
  }
}
