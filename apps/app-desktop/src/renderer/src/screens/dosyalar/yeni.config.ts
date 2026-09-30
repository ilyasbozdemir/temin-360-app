import { AIFormContext } from '../../components/ui/AIFormFillModal'
import { TeminDosyasi } from './dosyalar.hooks'
import { DBBirim, DBPersonel, DBRol } from './types'

export function resolveDefaultPersonnel(
  personeller: DBPersonel[] = [],
  selectedBirim?: DBBirim | null,
  roller: DBRol[] = []
) {
  const findRoleId = (rolKodu: string) => {
    const found = roller.find((r) => r.rol_kodu === rolKodu)
    return found?.varsayilan_personel_id || null
  }

  // 1. Harcama Yetkilisi (Onaylayan)
  const onayId =
    findRoleId('harcama_yetkilisi') ||
    findRoleId('onaylayan') ||
    selectedBirim?.harcama_yetkilisi_id ||
    personeller.find((p) => p.harcama_yetkilisi_mi === 1)?.id ||
    personeller.find(
      (p) =>
        p.unvan &&
        (p.unvan.toLowerCase().includes('harcama') || p.unvan.toLowerCase().includes('onaylayan'))
    )?.id ||
    personeller[1]?.id ||
    personeller[0]?.id ||
    null

  // 2. Gerçekleştirme Görevlisi (Sunan)
  const sunanId =
    findRoleId('gerceklestirme_gorevlisi') ||
    findRoleId('sunan_personel') ||
    findRoleId('ihale_yetkilisi') ||
    selectedBirim?.gerceklestirme_gorevlisi_id ||
    personeller.find(
      (p) =>
        p.unvan &&
        (p.unvan.toLowerCase().includes('gerçekleştirme') ||
          p.unvan.toLowerCase().includes('sunan'))
    )?.id ||
    personeller.find((p) => p.id !== onayId)?.id ||
    personeller[0]?.id ||
    null

  // 3. Dosyayı Hazırlayan
  const hazirlayanId =
    findRoleId('hazirlayan') ||
    personeller.find(
      (p) =>
        p.unvan &&
        (p.unvan.toLowerCase().includes('hazırlayan') ||
          p.unvan.toLowerCase().includes('uzman') ||
          p.unvan.toLowerCase().includes('memur') ||
          p.unvan.toLowerCase().includes('mühendis') ||
          p.unvan.toLowerCase().includes('tekniker'))
    )?.id ||
    personeller[0]?.id ||
    null

  // 4. Talep Eden
  const talepEdenId =
    findRoleId('talep_eden') ||
    personeller.find(
      (p) =>
        p.unvan &&
        (p.unvan.toLowerCase().includes('şube müdürü') ||
          p.unvan.toLowerCase().includes('müdür') ||
          p.unvan.toLowerCase().includes('amiri'))
    )?.id ||
    personeller[0]?.id ||
    null

  // 5. İrtibat Yetkilisi
  const irtibatId =
    findRoleId('irtibat') ||
    findRoleId('ilgili_personel') ||
    personeller.find((p) => p.unvan && p.unvan.toLowerCase().includes('irtibat'))?.id ||
    hazirlayanId ||
    personeller[0]?.id ||
    null

  return {
    onay_personel_id: onayId,
    sunan_personel_id: sunanId,
    hazirlayan_personel_id: hazirlayanId,
    talep_eden_personel_id: talepEdenId,
    irtibat_yetkilisi_id: irtibatId
  }
}

export const DOLDURULACAK_ALANLAR: AIFormContext['doldurulacakAlanlar'] = [
  {
    alan: 'konu',
    etiket: 'İhale / Dosya Konusu',
    tip: 'text',
    zorunlu: true,
    ornekDeger: 'Fen İşleri Kırtasiye Malzemesi Alımı'
  },
  {
    alan: 'isin_aciklamasi',
    etiket: 'İşin Açıklaması / Kapsamı',
    tip: 'textarea'
  },
  {
    alan: 'temin_no',
    etiket: 'Doğrudan Temin Numarası',
    tip: 'text',
    ornekDeger: '2026/DT-001'
  },
  {
    alan: 'dosya_acilis_tarihi',
    etiket: 'Dosya Açılış Tarihi',
    tip: 'date'
  },
  { alan: 'butce_yili', etiket: 'Bütçe Yılı', tip: 'number' },
  { alan: 'butce_tipi', etiket: 'Bütçe Tipi', tip: 'text' },
  {
    alan: 'sunulacak_makam',
    etiket: 'Evrakın Sunulacağı Makam',
    tip: 'text',
    ornekDeger: 'BAŞKANLIK MAKAMINA'
  },
  { alan: 'ihtiyac_yeri', etiket: 'İhtiyaç Yeri', tip: 'text' },
  {
    alan: 'antet_ek_satir',
    etiket: 'Antet Ek Satır',
    tip: 'text'
  },
  { alan: 'e_butce', etiket: 'e-Bütçe Kodu', tip: 'text' },
  {
    alan: 'fonksiyonel_kod',
    etiket: 'Fonksiyonel Kod',
    tip: 'text'
  },
  {
    alan: 'muhasebe_birimi',
    etiket: 'Muhasebe Birimi Kodu',
    tip: 'text'
  },
  {
    alan: 'harcama_birimi',
    etiket: 'Harcama Birimi Kodu',
    tip: 'text'
  },
  {
    alan: 'finansman_kodu',
    etiket: 'Finansman Kodu',
    tip: 'text'
  },
  { alan: 'ekonomik_kod', etiket: 'Ekonomik Kod', tip: 'text' },
  { alan: 'ihale_tipi', etiket: 'İhale Tipi', tip: 'text' },
  {
    alan: 'tur',
    etiket: 'Tür (mal/hizmet/yapim/danismanlik)',
    tip: 'text'
  },
  {
    alan: 'ihale_sekli',
    etiket: 'İhale Şekli (22/d* vb.)',
    tip: 'text'
  },
  {
    alan: 'teklif_sozlesme_turu',
    etiket: 'Teklif/Sözleşme Türü',
    tip: 'text'
  },
  {
    alan: 'alt_yuklenici_olacak_mi',
    etiket: 'Alt Yüklenici (0/1)',
    tip: 'number'
  },
  {
    alan: 'kismi_teklif_verilecek_mi',
    etiket: 'Kısmi Teklif (0/1)',
    tip: 'number'
  },
  {
    alan: 'fiyat_farki_dayanagi',
    etiket: 'Fiyat Farkı Dayanağı',
    tip: 'text'
  },
  {
    alan: 'yatirim_proje_no',
    etiket: 'Yatırım Proje No',
    tip: 'text'
  },
  {
    alan: 'avans_verilecek_mi',
    etiket: 'Avans Verilecek (0/1)',
    tip: 'number'
  },
  {
    alan: 'yillara_yaygin',
    etiket: 'Yıllara Yaygın Hizmet (0/1)',
    tip: 'number'
  },
  {
    alan: 'sozlesme_yapilacak_mi',
    etiket: 'Sözleşme Yapılacak mı (0/1)',
    tip: 'number'
  },
  {
    alan: 'yaklasik_maliyet_hesaplamasi',
    etiket: 'Yaklaşık Maliyet Hesaplama Yöntemi',
    tip: 'text'
  },
  { alan: 'kdv', etiket: 'KDV Oranı (%)', tip: 'text' },
  {
    alan: 'hesaplama_esasi',
    etiket: 'Hesaplama Esası',
    tip: 'text'
  },
  {
    alan: 'komisyon_takdiri',
    etiket: 'Hesaplama Yöntemi / Dayanağı',
    tip: 'text'
  },
  {
    alan: 'tibbi_cihaz_alimi_mi',
    etiket: 'Tıbbi Cihaz Alımı (0/1)',
    tip: 'number'
  },
  {
    alan: 'son_teklif_verme_tarihi',
    etiket: 'Son Teklif Verme Tarihi',
    tip: 'date'
  },
  {
    alan: 'teslim_tarihi',
    etiket: 'Teslim Tarihi',
    tip: 'date'
  },
  {
    alan: 'yaklasik_maliyet',
    etiket: 'Yaklaşık Maliyet (₺)',
    tip: 'number'
  },
  { alan: 'butce_kodu', etiket: 'Bütçe Kodu', tip: 'text' },
  { alan: 'temin_tarihi', etiket: 'Temin Tarihi', tip: 'date' },
  { alan: 'notlar', etiket: 'Notlar', tip: 'textarea' }
]

export function buildAIFormContext(
  formData: Partial<TeminDosyasi>,
  birimler: DBBirim[],
  institutionName: string
): AIFormContext {
  const selectedBirim = birimler.find((b) => b.id === formData.birim_id)
  return {
    formTitle: 'Yeni Doğrudan Temin Dosyası',
    kurumBilgisi: {
      birimAdi: selectedBirim?.birim_adi,
      sunulacakMakam: formData.sunulacak_makam || selectedBirim?.sunum_makami,
      antetEkSatir: formData.antet_ek_satir || selectedBirim?.antet_ek_satir,
      ihtiyacYeri: formData.ihtiyac_yeri || selectedBirim?.ihtiyac_yeri_eki,
      kurumAdi: institutionName !== 'Kurum Adı Bulunamadı' ? institutionName : 'Kurum'
    },
    mevcutDegerler: {
      konu: formData.konu,
      temin_no: formData.temin_no,
      sunulacak_makam: formData.sunulacak_makam,
      birim: selectedBirim?.birim_adi,
      butce_yili: formData.butce_yili
    },
    doldurulacakAlanlar: DOLDURULACAK_ALANLAR
  }
}

export function getEmptyFormData(
  currentYear: number,
  nextTeminNo: string,
  birimler: DBBirim[],
  personeller: DBPersonel[],
  roller: DBRol[] = []
): Partial<TeminDosyasi> {
  const selectedBirim = birimler[0] || null
  const defaultPers = resolveDefaultPersonnel(personeller, selectedBirim, roller)

  return {
    temin_no: nextTeminNo,
    dosya_acilis_tarihi: `${currentYear}-06-03`,
    butce_yili: currentYear,
    butce_tipi: 'Genel Bütçe',
    konu: '',
    isin_aciklamasi: '',
    birim_id: selectedBirim?.id || null,
    antet_ek_satir: '',
    sunulacak_makam: '',
    ihtiyac_yeri: '',
    e_butce: '',
    fonksiyonel_kod: '',
    muhasebe_birimi: '',
    harcama_birimi: '',
    finansman_kodu: '',
    ekonomik_kod: '',
    butce_kodu: '',
    ihale_tipi: 'Doğrudan Temin',
    tur: 'mal',
    ihale_sekli: '22/d*',
    teklif_sozlesme_turu: 'Birim Fiyat',
    alt_yuklenici_olacak_mi: 0,
    kismi_teklif_verilecek_mi: 0,
    fiyat_farki_dayanagi: 'Fiyat Farkı Ödenmeyecek',
    yatirim_proje_no: '',
    avans_verilecek_mi: 0,
    yillara_yaygin: 0,
    sozlesme_yapilacak_mi: 0,
    yaklasik_maliyet_hesaplamasi: 'Piyasa Fiyat Araştırması',
    kdv: '20',
    hesaplama_esasi: '',
    komisyon_takdiri: 'Sadece araştırma fiyatları dikkate alınacak',
    tibbi_cihaz_alimi_mi: 0,
    ...defaultPers,
    son_teklif_verme_tarihi: '2026-06-10T14:00',
    teslim_tarihi: '2026-06-30',
    yaklasik_maliyet: 145005
  }
}

export function getMockFormData(
  currentYear: number,
  nextTeminNo: string,
  birimler: DBBirim[],
  personeller: DBPersonel[]
): Partial<TeminDosyasi> {
  return {
    ...getEmptyFormData(currentYear, nextTeminNo, birimler, personeller),
    konu: 'Park Bahçeler Müdürlüğü Elektrik Kablosu ve Aydınlatma Armatürü Alımı',
    isin_aciklamasi:
      'X Belediyesi Park Bahçeler Müdürlüğü tarafından yeşil alanlar ve çocuk oyun parklarının aydınlatılmasında kullanılmak üzere elektrik kablosu ve aydınlatma armatürü alımı işi.',
    antet_ek_satir: 'Fen İşleri Dairesi Başkanlığı',
    sunulacak_makam: 'BAŞKANLIK MAKAMINA',
    ihtiyac_yeri: 'X Belediyesi Merkez Şantiyesi'
  }
}
