import { SurecEvrakiItem } from '../types/devletIhale2886.types'

export const ASAMA_BASLIKLARI: readonly {
  id: SurecEvrakiItem['asama']
  title: string
  color: string
}[] = [
  {
    id: 'baslangic',
    title: '1. Aşama: Başlangıç ve Yetki Evrakları',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'kiymet_takdir',
    title: '2. Aşama: Kıymet Takdiri & Muhammen Bedel',
    color: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'sartname_ve_ilan',
    title: '3. Aşama: Şartname, İhale Kararı & İlan Süreci',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'ihale_gunu',
    title: '4. Aşama: İhale Günü, Açık Artırma & Encümen Kararı',
    color: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'onay_ve_sozlesme',
    title: '5. Aşama: İta Amiri Onayı, Tebligat & Sözleşme',
    color: 'text-emerald-600 dark:text-emerald-400'
  }
]

// Standart 2886 Şablon HTML İskeletleri
export const DEFAULT_TEMPLATES_BY_CODE: Record<string, string> = {
  '2886-EVR-01': `
<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
  <div style="text-align: center; margin-bottom: 25px;">
    <h3 style="margin: 0; font-size: 14pt; text-transform: uppercase;">T.C.</h3>
    <h3 style="margin: 0; font-size: 13pt; text-transform: uppercase;">{{kurum_adi}}</h3>
    <h4 style="margin: 5px 0 0 0; font-size: 11pt;">Emlak ve İstimlak Müdürlüğü</h4>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 10pt;">
    <div><strong>Sayı:</strong> {{sayi_no}}</div>
    <div><strong>Tarih:</strong> {{tarih}}</div>
  </div>

  <div style="text-align: center; margin: 30px 0; font-weight: bold; font-size: 12pt;">
    BAŞKANLIK MAKAMINA (ONAY BELGESİ)
  </div>

  <p>
    Mülkiyeti idaremize ait aşağıda tapu ve nitelik bilgileri yazılı taşınmazın, 
    <strong>2886 Sayılı Devlet İhale Kanunu'nun {{ihale_usulu}}</strong> hükümleri doğrultusunda 
    <strong>{{islem_turu_adi}}</strong> ihalesine çıkarılması planlanmaktadır.
  </p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10pt;" border="1">
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 6px; text-align: left;">Dosya No</th>
      <td style="padding: 6px;">{{dosya_no}}</td>
    </tr>
    <tr>
      <th style="padding: 6px; text-align: left;">Taşınmaz Konusu</th>
      <td style="padding: 6px;">{{tasinmaz_adi}}</td>
    </tr>
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 6px; text-align: left;">Ada / Parsel</th>
      <td style="padding: 6px;">{{ada_parsel}}</td>
    </tr>
    <tr>
      <th style="padding: 6px; text-align: left;">Yüzölçümü</th>
      <td style="padding: 6px;">{{yuzolcumu}} m²</td>
    </tr>
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 6px; text-align: left;">Tahmini Muhammen Bedel</th>
      <td style="padding: 6px;"><strong>₺{{muhammen_bedel}}</strong> ({{muhammen_bedel_yaziyla}})</td>
    </tr>
    <tr>
      <th style="padding: 6px; text-align: left;">Geçici Teminat (%3)</th>
      <td style="padding: 6px;"><strong>₺{{gecici_teminat}}</strong></td>
    </tr>
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 6px; text-align: left;">Planlanan İhale Tarihi & Saati</th>
      <td style="padding: 6px;">{{ihale_tarihi}} - Saat: {{ihale_saati}}</td>
    </tr>
  </table>

  <p>
    Söz konusu ihalenin açılması, şartname ve eklerinin hazırlanması ve Encümene sevk edilmesi hususunu tensiplerinize arz ederim.
  </p>

  <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center;">
    <div>
      <p><strong>{{hazirlayan_unvan}}</strong></p>
      <br/><br/>
      <p>{{hazirlayan_ad}}</p>
    </div>
    <div>
      <p><strong>OLUR</strong></p>
      <p><strong>{{belediye_baskani_unvan}}</strong></p>
      <br/><br/>
      <p>{{belediye_baskani}}</p>
    </div>
  </div>
</div>
`,
  '2886-EVR-05': `
<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h3 style="margin: 0; font-size: 13pt;">T.C. {{kurum_adi}}</h3>
    <h4 style="margin: 5px 0; font-size: 11pt;">KIYMET TAKDİR KOMİSYONU KARAR TUTANAĞI</h4>
  </div>

  <div style="font-size: 10pt; margin-bottom: 15px;">
    <div><strong>Dosya No:</strong> {{dosya_no}}</div>
    <div><strong>Karar Tarihi:</strong> {{tarih}}</div>
    <div><strong>Taşınmaz:</strong> {{tasinmaz_adi}} (Ada/Parsel: {{ada_parsel}}, Alan: {{yuzolcumu}} m²)</div>
  </div>

  <p>
    2886 Sayılı Devlet İhale Kanunu'nun 13. Maddesi uyarınca teşekkül eden Kıymet Takdir Komisyonumuz toplanarak, 
    mahallinde yapılan incelemeler, emsal alım-satım/kira rayiçleri ve piyasa şartları göz önüne alınarak muhammen bedel tespiti yapılmıştır.
  </p>

  <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin: 15px 0; border-radius: 6px;">
    <p style="margin: 0;"><strong>Takdir Edilen Muhammen Bedel:</strong> ₺{{muhammen_bedel}} ({{muhammen_bedel_yaziyla}})</p>
    <p style="margin: 5px 0 0 0;"><strong>%3 Geçici Teminat Tutarı:</strong> ₺{{gecici_teminat}}</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-top: 30px; text-align: center; font-size: 10pt;">
    <tr>
      <td><strong>Komisyon Başkanı</strong><br/><br/>{{komisyon_baskani}}<br/>Müdür</td>
      <td><strong>Üye (Teknik)</strong><br/><br/>Harita Müh.<br/>Üye</td>
      <td><strong>Üye (Mali)</strong><br/><br/>Mali Hiz. Yetkilisi<br/>Üye</td>
    </tr>
  </table>
</div>
`
}

export const DEFAULT_2886_EVRAKLAR: SurecEvrakiItem[] = [
  // 1. Başlangıç ve Yetki
  {
    id: '1',
    ad: 'Başkanlık Oluru / İhale Başlatma Onay Belgesi',
    kod: '2886-EVR-01',
    asama: 'baslangic',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-01',
    sayiNo: 'E-2026/104'
  },
  {
    id: '2',
    ad: 'Belediye Encümeni Satış / Kiralama Yetki Kararı',
    kod: '2886-EVR-02',
    asama: 'baslangic',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-05',
    sayiNo: 'Karar No: 2026/112'
  },
  // 2. Kıymet Takdiri
  {
    id: '3',
    ad: 'Kıymet Takdir Komisyonu Görevlendirme Yazısı',
    kod: '2886-EVR-03',
    asama: 'kiymet_takdir',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-08'
  },
  {
    id: '4',
    ad: 'Emsal Fiyat Araştırma Yazıları (Oda / Muhtarlık vb.)',
    kod: '2886-EVR-04',
    asama: 'kiymet_takdir',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-12'
  },
  {
    id: '5',
    ad: 'Kıymet Takdir Komisyonu Kararı & Muhammen Bedel Cetveli',
    kod: '2886-EVR-05',
    asama: 'kiymet_takdir',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-15',
    sayiNo: '2026/08-KT'
  },
  // 3. Şartname ve İlan
  {
    id: '6',
    ad: 'İdari Şartname ve Tip Sözleşme Taslağı (Genel & Özel Şartlar)',
    kod: '2886-EVR-06',
    asama: 'sartname_ve_ilan',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-18'
  },
  {
    id: '7',
    ad: 'Encümen İhale Kararı (İlan Onayı ve Tarih Tespiti)',
    kod: '2886-EVR-07',
    asama: 'sartname_ve_ilan',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-20',
    sayiNo: 'Karar No: 2026/135'
  },
  {
    id: '8',
    ad: 'Belediye / Kaymakamlık / Web İlan Metinleri',
    kod: '2886-EVR-08',
    asama: 'sartname_ve_ilan',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-22'
  },
  {
    id: '9',
    ad: 'Askıya Çıkarma ve Askıdan İndirme Tutanakları',
    kod: '2886-EVR-09',
    asama: 'sartname_ve_ilan',
    zorunluMu: true,
    durum: 'taslak'
  },
  // 4. İhale Günü
  {
    id: '10',
    ad: 'Şartname Satın Alma / Alınma Belgesi Kaydı',
    kod: '2886-EVR-10',
    asama: 'ihale_gunu',
    zorunluMu: true,
    durum: 'taslak'
  },
  {
    id: '11',
    ad: 'İhale Cetveli (Açık Artırma & Teklif Zarfı Açma Tutanağı)',
    kod: '2886-EVR-11',
    asama: 'ihale_gunu',
    zorunluMu: true,
    durum: 'taslak'
  },
  {
    id: '12',
    ad: 'İhale Komisyonu (Encümen) İhale Kararı',
    kod: '2886-EVR-12',
    asama: 'ihale_gunu',
    zorunluMu: true,
    durum: 'taslak'
  },
  // 5. Onay ve Sözleşme
  {
    id: '13',
    ad: 'İta Amiri (Belediye Başkanı) İhale Onay Belgesi',
    kod: '2886-EVR-13',
    asama: 'onay_ve_sozlesme',
    zorunluMu: true,
    durum: 'hazirlanmadi'
  },
  {
    id: '14',
    ad: 'Kesinleşen İhale Kararı Tebligat Yazısı',
    kod: '2886-EVR-14',
    asama: 'onay_ve_sozlesme',
    zorunluMu: true,
    durum: 'hazirlanmadi'
  },
  {
    id: '15',
    ad: 'Taşınmaz Satış / Kira Sözleşmesi & Ödeme Planı',
    kod: '2886-EVR-15',
    asama: 'onay_ve_sozlesme',
    zorunluMu: true,
    durum: 'hazirlanmadi'
  },
  {
    id: '16',
    ad: 'Taşınmaz / İşyeri Yer Teslim Tutanağı',
    kod: '2886-EVR-16',
    asama: 'onay_ve_sozlesme',
    zorunluMu: true,
    durum: 'hazirlanmadi'
  }
]
