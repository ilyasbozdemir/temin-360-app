/**
 * TEMİN 360 - 4734 & 2886 İHALE USULÜ BELİRLEYİCİ
 *
 * Girilen yaklaşık maliyet / tahmini tutar, alım türü (Mal, Hizmet, Yapım, Danışmanlık)
 * ve idare statüsüne (Büyükşehir Belediyesi / Diğer İdareler) göre:
 * - Uygulanabilecek yasal alım usullerini (22/d, 21/f, 19 Açık İhale, 2886 Pazarlık/Açık Teklif vb.)
 * - İhale komisyonu zorunluluğunu
 * - İlan zorunluluğu ve asgari ilan süresini
 * - Teminat zorunluluğunu (%3 geçici, %6 kesin)
 * - Onay makamı ve yasal mevzuat maddesini tespit eder.
 */

import { getEsikDegerler } from './parametreDeposu'
import { formatTL } from './paraVeYuvarlamaUtils'

export type AlimTuru = 'MAL' | 'HIZMET' | 'YAPIM' | 'DANISMANLIK' | 'KIRA_GELIR' | 'SATIS_GELIR'
export type IdareTipi =
  | 'BUYUKSEHIR_BELEDIYESI'
  | 'DIGER_BELEDIYE'
  | 'GENEL_BUTCE'
  | 'UNIVERSITE'
  | 'DIGER'

export interface UsulBelirlemeInput {
  tutar: number // KDV Hariç Yaklaşık Maliyet veya Tahmini Tutar
  alimTuru: AlimTuru
  idareTipi?: IdareTipi
  mevzuatKapsami?: '4734' | '2886' // 4734 Gider (Harcama) / 2886 Gelir (Kira/Satış/İşletme)
  yil?: number
}

export interface UsulOnerisi {
  oncelikliUsulKodu: string // '4734_22_D', '4734_21_F', '4734_19', '2886_45', '2886_35_A', '2886_51_G'
  usulAdi: string
  mevzuatDayanagi: string
  komisyonGerekliMi: boolean
  ilanGerekliMi: boolean
  ilanSuresiGun?: number
  geciciTeminatGerekliMi: boolean
  geciciTeminatOraniYuzde: number
  kesinTeminatGerekliMi: boolean
  kesinTeminatOraniYuzde: number
  sozlesmeZorunluMu: boolean
  kikPayiZorunluMu: boolean
  uyariVeTavsiyeler: string[]
  alternatifUsuller: {
    kod: string
    ad: string
    aciklama: string
  }[]
}

export function belirleIhaleUsulu(input: UsulBelirlemeInput): UsulOnerisi {
  const yil = input.yil || new Date().getFullYear()
  const esik = getEsikDegerler(yil)
  const idare = input.idareTipi || 'BUYUKSEHIR_BELEDIYESI'
  const isBuyuksehir = idare === 'BUYUKSEHIR_BELEDIYESI'
  const dogrudanTeminLimiti = isBuyuksehir ? esik.dogrudanTeminBuyuksehir : esik.dogrudanTeminDiger

  const tutar = Math.max(0, input.tutar)

  // 2886 SAYILI DEVLET İHALE KANUNU (Gelir Getirici İşler: Kira, Satış, Trampa, Mülkiyetin Gayri Ayni Hak)
  if (
    input.mevzuatKapsami === '2886' ||
    input.alimTuru === 'KIRA_GELIR' ||
    input.alimTuru === 'SATIS_GELIR'
  ) {
    return {
      oncelikliUsulKodu: '2886_45',
      usulAdi: '2886 Sayılı Kanun Madde 45 - Açık Teklif Usulü',
      mevzuatDayanagi: '2886 Sayılı Devlet İhale Kanunu Madde 45 (Açık Artırma / Teklif)',
      komisyonGerekliMi: true,
      ilanGerekliMi: true,
      ilanSuresiGun: 10,
      geciciTeminatGerekliMi: true,
      geciciTeminatOraniYuzde: 3,
      kesinTeminatGerekliMi: true,
      kesinTeminatOraniYuzde: 6,
      sozlesmeZorunluMu: true,
      kikPayiZorunluMu: false,
      uyariVeTavsiyeler: [
        'Kira ve taşınmaz satış ihalelerinde ihale yetkilisi (Encümen) onay kararı gereklidir.',
        'Tahmini bedel üzerinden en az %3 geçici teminat yatırılması zorunludur.',
        'Sözleşme damga vergisi (binde 1,89) tahsil edilir.'
      ],
      alternatifUsuller: [
        {
          kod: '2886_51_G',
          ad: '2886 Madde 51/g (Pazarlık Usulü)',
          aciklama:
            'Özelliği olan veya 2 defa açık teklifle ihale edilip talipli çıkmayan işlerde uygulanabilir.'
        },
        {
          kod: '2886_35_A',
          ad: '2886 Madde 35/a (Kapalı Teklif Usulü)',
          aciklama: 'Yüksek bedelli veya stratejik taşınmaz satışları için uygundur.'
        }
      ]
    }
  }

  // 4734 SAYILI KAMU İHALE KANUNU (Gider/Alım İşleri)

  // 1. Durum: 4734 Madde 22/d Doğrudan Temin Limiti Altı
  if (tutar <= dogrudanTeminLimiti && input.alimTuru !== 'YAPIM') {
    return {
      oncelikliUsulKodu: '4734_22_D',
      usulAdi: '4734 Sayılı Kanun Madde 22/d - Doğrudan Temin',
      mevzuatDayanagi: `4734 Sayılı Kanun Madde 22/d (${yil} yılı limiti: ${formatTL(dogrudanTeminLimiti)})`,
      komisyonGerekliMi: false, // Komisyon kurma zorunluluğu yok, tek piyasa araştırma görevlisi yeterli
      ilanGerekliMi: false, // İlan zorunluluğu yok
      geciciTeminatGerekliMi: false, // Teminat alma zorunluluğu yok
      geciciTeminatOraniYuzde: 0,
      kesinTeminatGerekliMi: false,
      kesinTeminatOraniYuzde: 0,
      sozlesmeZorunluMu: false, // Sözleşme yapılması idarenin takdirinde
      kikPayiZorunluMu: tutar >= esik.kikPayiEsikTutari,
      uyariVeTavsiyeler: [
        `Bu tutar (${formatTL(tutar)}), ${yil} yılı ${isBuyuksehir ? 'Büyükşehir' : 'Diğer İdareler'} doğrudan temin limitinin (${formatTL(dogrudanTeminLimiti)}) altındadır.`,
        'İhale komisyonu kurma, ilan yapma ve teminat alma zorunluluğu yoktur.',
        'Piyasa Fiyat Araştırma Tutanağı ve Harcama / İhale Yetkilisi Onayı ile doğrudan alım yapılabilir.',
        '4734 Madde 62/ı uyarınca bütçedeki yıllık ödeneğin %10 sınırına dikkat edilmelidir.'
      ],
      alternatifUsuller: [
        {
          kod: '4734_21_F',
          ad: '21/f Pazarlık Usulü',
          aciklama: 'Doğrudan temin yerine rekabeti artırmak amacıyla pazarlık usulü seçilebilir.'
        },
        {
          kod: '4734_19',
          ad: '19 Açık İhale Usulü',
          aciklama: 'İdare isterse her tutarda açık ihale yapabilir.'
        }
      ]
    }
  }

  // 2. Durum: 4734 Madde 21/f Pazarlık Usulü Limiti Altı
  if (tutar <= esik.pazarlik21f) {
    return {
      oncelikliUsulKodu: '4734_21_F',
      usulAdi: '4734 Sayılı Kanun Madde 21/f - Pazarlık Usulü',
      mevzuatDayanagi: `4734 Sayılı Kanun Madde 21/f (${yil} yılı limiti: ${formatTL(esik.pazarlik21f)})`,
      komisyonGerekliMi: true,
      ilanGerekliMi: false, // 21/f için ilan yapılması zorunlu değildir, en az 3 firma davet edilir
      geciciTeminatGerekliMi: false, // 21/f'de geçici teminat aranması idarenin takdirindedir
      geciciTeminatOraniYuzde: 0,
      kesinTeminatGerekliMi: true, // Kesin teminat zorunludur
      kesinTeminatOraniYuzde: 6,
      sozlesmeZorunluMu: true,
      kikPayiZorunluMu: tutar >= esik.kikPayiEsikTutari,
      uyariVeTavsiyeler: [
        `Bu tutar (${formatTL(tutar)}), 21/f pazarlık limiti (${formatTL(esik.pazarlik21f)}) kapsamındadır.`,
        'İlan yapılması zorunlu değildir; en az 3 istekli davet edilerek pazarlık yapılır.',
        'İhale komisyonu kurulması ve kesin teminat (%6) alınması zorunludur.'
      ],
      alternatifUsuller: [
        {
          kod: '4734_19',
          ad: '19 Açık İhale Usulü',
          aciklama: 'Tüm isteklilerin katılımına açık ihale düzenlenebilir.'
        }
      ]
    }
  }

  // 3. Durum: Eşik Üstü / Açık İhale Usulü (4734 Madde 19)
  const ilanSuresi = tutar < esik.ilanEsikDegeriMalHizmet ? 14 : 21

  return {
    oncelikliUsulKodu: '4734_19',
    usulAdi: '4734 Sayılı Kanun Madde 19 - Açık İhale Usulü',
    mevzuatDayanagi: '4734 Sayılı Kamu İhale Kanunu Madde 19 (Temel İhale Usulü)',
    komisyonGerekliMi: true,
    ilanGerekliMi: true,
    ilanSuresiGun: ilanSuresi,
    geciciTeminatGerekliMi: true,
    geciciTeminatOraniYuzde: 3,
    kesinTeminatGerekliMi: true,
    kesinTeminatOraniYuzde: 6,
    sozlesmeZorunluMu: true,
    kikPayiZorunluMu: true,
    uyariVeTavsiyeler: [
      `Tutar (${formatTL(tutar)}), pazarlık limitlerini aştığı için temel usul olan Açık İhale (Madde 19) uygulanmalıdır.`,
      `EKAP ve Kamu İhale Bülteni üzerinden en az ${ilanSuresi} gün önceden ilan zorunludur.`,
      'İsteklilerden en az %3 geçici teminat, kazanan yükleniciden %6 kesin teminat alınması zorunludur.',
      'Sözleşme bedeli üzerinden KİK payı (On binde 5) ve sözleşme damga vergisi (binde 9,48) tahsil edilir.'
    ],
    alternatifUsuller: [
      {
        kod: '4734_20',
        ad: '20 Belli İstekliler Arasında İhale',
        aciklama:
          'İşin uzmanlık veya ileri teknoloji gerektirmesi durumunda ön yeterlik aşamalı uygulanır.'
      },
      {
        kod: '4734_21_B',
        ad: '21/b Pazarlık Usulü (Doğal Afet / Aciliyet)',
        aciklama: 'Doğal afetler, salgın hastalıklar veya ani beklenmeyen durumlarda uygulanabilir.'
      }
    ]
  }
}
