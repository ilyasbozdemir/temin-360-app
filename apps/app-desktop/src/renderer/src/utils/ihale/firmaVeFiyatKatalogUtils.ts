/**
 * TEMİN 360 - FİRMA DEFTERİ, BELGE SÜRESİ TAKİBİ VE FİYAT GEÇMİŞİ KATALOĞU
 *
 * 1. Firma Defteri & Performans Değerlendirme (Geçmiş işler, güvenilirlik puanı)
 * 2. Belge Geçerlilik ve Süre Takipçisi (Vergi, SGK, İmza Sirküleri, Ticaret Sicil)
 * 3. Fiyat Geçmişi ve Tarihsel Alım Trendi (Enflasyon / Yİ-ÜFE uyarlamalı)
 * 4. Birim Fiyat Kataloğu & Sık Alınan Kalemler
 * 5. Piyasa Fiyat Karşılaştırma Matrisi ve Teklif Değerlendirme Cetveli
 */

import { roundKurus, formatTL } from './paraVeYuvarlamaUtils'
import { TeklifKalemi, analizEtPiyasaTeklifleri } from './yaklasikMaliyetVeFiyatUtils'

export type BelgeTuru =
  | 'VERGI_BORCU_YOKTUR'
  | 'SGK_BORCU_YOKTUR'
  | 'IMZA_SIRKULERI'
  | 'TICARET_SICIL_GAZETESI'
  | 'ODA_KAYIT_BELGESI'
  | 'IS_BITIRME_BELGESI'
  | 'YETKI_BELGESI'
  | 'DIGER'

export type BelgeDurumu = 'GECERLI' | 'YAKLASIYOR' | 'SURESI_DOLMUS' | 'YOK'

export interface FirmaBelgesi {
  id: string
  tur: BelgeTuru
  ad: string
  belgeTarihi: string // YYYY-MM-DD
  gecerlilikBitisTarihi?: string // YYYY-MM-DD
  dosyaYolu?: string
  aciklama?: string
}

export interface FirmaGecmisIs {
  id: string
  dosyaNo: string
  isAdi: string
  sozlesmeBedeli: number
  sozlesmeTarihi: string
  kabulTarihi?: string
  gecikmeVarMi: boolean
  cezaUygulandiMi: boolean
  performansPuani?: number // 1 - 100 arası
  notlar?: string
}

export interface FirmaProfili {
  id: string
  unvan: string
  vknTckn: string
  vergiDairesi?: string
  telefon?: string
  eposta?: string
  adres?: string
  sehir?: string
  belgeler: FirmaBelgesi[]
  gecmisIsler: FirmaGecmisIs[]
  genelPerformansPuani?: number // 100 üzerinden
  yasakliMi?: boolean
  yasakBitisTarihi?: string
}

/**
 * Bir belgenin bugünkü tarihe göre geçerlilik durumunu ve kalan gün sayısını denetler.
 */
export function denetleBelgeGecerliligi(
  belge: FirmaBelgesi,
  uyariGunEsigi: number = 7
): {
  durum: BelgeDurumu
  kalanGun: number
  mesaj: string
} {
  if (!belge.gecerlilikBitisTarihi) {
    return { durum: 'GECERLI', kalanGun: 9999, mesaj: 'Süresiz / Geçerlilik tarihi tanımlanmamış' }
  }

  const bugun = new Date()
  bugun.setHours(0, 0, 0, 0)
  const bitis = new Date(belge.gecerlilikBitisTarihi)
  bitis.setHours(0, 0, 0, 0)

  const diffMs = bitis.getTime() - bugun.getTime()
  const kalanGun = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (kalanGun < 0) {
    return {
      durum: 'SURESI_DOLMUS',
      kalanGun,
      mesaj: `Belgenin süresi ${Math.abs(kalanGun)} gün önce dolmuştur!`
    }
  } else if (kalanGun <= uyariGunEsigi) {
    return {
      durum: 'YAKLASIYOR',
      kalanGun,
      mesaj: `Belgenin süresinin dolmasına ${kalanGun} gün kalmıştır.`
    }
  }

  return {
    durum: 'GECERLI',
    kalanGun,
    mesaj: `Belge geçerlidir (${kalanGun} gün kaldı).`
  }
}

/**
 * Firmanın tüm belgelerini tarayarak ihale teklifine engel bir durum olup olmadığını özetler.
 */
export function ozetleFirmaBelgeDurumu(firma: FirmaProfili): {
  ihaleyeGirebilirMi: boolean
  suresiDolanBelgeler: FirmaBelgesi[]
  yaklasanBelgeler: FirmaBelgesi[]
  uyarilar: string[]
} {
  const suresiDolan: FirmaBelgesi[] = []
  const yaklasan: FirmaBelgesi[] = []
  const uyarilar: string[] = []

  if (firma.yasakliMi) {
    uyarilar.push(
      `FİRMA KAMU İHALELERİNDEN YASAKLIDIR! (Bitiş: ${firma.yasakBitisTarihi || 'Belirtilmemiş'})`
    )
  }

  for (const b of firma.belgeler) {
    const kontrol = denetleBelgeGecerliligi(b)
    if (kontrol.durum === 'SURESI_DOLMUS') {
      suresiDolan.push(b)
      uyarilar.push(`${b.ad} belgesinin geçerlilik süresi dolmuştur.`)
    } else if (kontrol.durum === 'YAKLASIYOR') {
      yaklasan.push(b)
      uyarilar.push(`${b.ad} belgesinin süresi yakında (${kontrol.kalanGun} gün) dolacaktır.`)
    }
  }

  const ihaleyeGirebilir = !firma.yasakliMi && suresiDolan.length === 0

  return {
    ihaleyeGirebilirMi: ihaleyeGirebilir,
    suresiDolanBelgeler: suresiDolan,
    yaklasanBelgeler: yaklasan,
    uyarilar
  }
}

/**
 * 2. FİYAT GEÇMİŞİ VE BİRİM FİYAT KATALOĞU
 */
export interface GecmisAlimKaydi {
  id: string
  malzemeHizmetAdi: string
  olcuBirimi: string
  alimTarihi: string // YYYY-MM-DD
  birimFiyat: number
  miktar: number
  paraBirimi?: string
  firmaAdi: string
  dosyaNo: string
}

export interface FiyatGecmisiOzeti {
  kayitSayisi: number
  enSonAlimFiyati: number
  enSonAlimTarihi: string
  enDusukAlimFiyati: number
  enYuksekAlimFiyati: number
  ortalamaAlimFiyati: number
  tahminiGuncelFiyat: number // Yıllık tahmini enflasyon/endeks artışı eklenmiş
  kayitlar: GecmisAlimKaydi[]
  aciklama: string
}

/**
 * Belirli bir malzeme/hizmet için geçmiş alım kayıtlarını analiz eder.
 */
export function analizEtFiyatGecmisi(
  kayitlar: GecmisAlimKaydi[],
  yillikTahminiEnflasyonOrani: number = 0.4
): FiyatGecmisiOzeti | null {
  if (!kayitlar || kayitlar.length === 0) return null

  const sirali = [...kayitlar].sort(
    (a, b) => new Date(b.alimTarihi).getTime() - new Date(a.alimTarihi).getTime()
  )
  const sonAlim = sirali[0]

  const fiyatlar = kayitlar.map((k) => k.birimFiyat)
  const minFiyat = Math.min(...fiyatlar)
  const maxFiyat = Math.max(...fiyatlar)
  const avgFiyat = roundKurus(fiyatlar.reduce((acc, c) => acc + c, 0) / fiyatlar.length)

  // Son alım tarihinden bugüne geçen süreye göre tahmini güncel fiyat hesaplama
  const bugun = new Date()
  const sonTarih = new Date(sonAlim.alimTarihi)
  const yilFarki = Math.max(
    0,
    (bugun.getTime() - sonTarih.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )
  const tahminiGuncel = roundKurus(
    sonAlim.birimFiyat * Math.pow(1 + yillikTahminiEnflasyonOrani, yilFarki)
  )

  return {
    kayitSayisi: kayitlar.length,
    enSonAlimFiyati: sonAlim.birimFiyat,
    enSonAlimTarihi: sonAlim.alimTarihi,
    enDusukAlimFiyati: minFiyat,
    enYuksekAlimFiyati: maxFiyat,
    ortalamaAlimFiyati: avgFiyat,
    tahminiGuncelFiyat: tahminiGuncel,
    kayitlar: sirali,
    aciklama: `Bu kalem en son ${sonAlim.alimTarihi} tarihinde ${formatTL(sonAlim.birimFiyat)} bedelle alınmıştır. Enflasyon uyarlamalı tahmini güncel yaklaşık maliyet: ${formatTL(tahminiGuncel)}.`
  }
}

/**
 * 3. ÇOKLU KALEM PİYASA FİYAT ARAŞTIRMASI KARŞILAŞTIRMA MATRİSİ
 */
export interface KalemTeklifi {
  kalemId: string
  kalemAdi: string
  miktar: number
  olcuBirimi: string
  firmaTeklifleri: Record<string, number> // firmaId -> birimFiyat
}

export interface KarsilastirmaMatrisiSonucu {
  firmalar: { id: string; ad: string }[]
  kalemler: {
    kalemId: string
    kalemAdi: string
    miktar: number
    olcuBirimi: string
    enDusukFiyat: number
    enDusukFirmaId: string
    ortalamaFiyat: number
    firmaFiyatlari: Record<string, { birimFiyat: number; toplamTutar: number; enDusukMu: boolean }>
  }[]
  firmaToplamlari: Record<string, { toplamTutar: number; siralama: number; enAvantajliMi: boolean }>
  genelEnDusukFirma: { id: string; ad: string; toplamTutar: number } | null
}

export function uretKarsilastirmaMatrisi(
  kalemler: KalemTeklifi[],
  firmalar: { id: string; ad: string }[]
): KarsilastirmaMatrisiSonucu {
  const firmaToplamlari: Record<string, number> = {}
  firmalar.forEach((f) => {
    firmaToplamlari[f.id] = 0
  })

  const islenmisKalemler = kalemler.map((kalem) => {
    let enDusukBirim = Infinity
    let enDusukFirma = ''
    let toplamBirim = 0
    let teklifSayisi = 0

    const firmaFiyatMap: Record<
      string,
      { birimFiyat: number; toplamTutar: number; enDusukMu: boolean }
    > = {}

    firmalar.forEach((f) => {
      const birim = kalem.firmaTeklifleri[f.id] || 0
      const toplam = roundKurus(birim * kalem.miktar)
      firmaToplamlari[f.id] = roundKurus((firmaToplamlari[f.id] || 0) + toplam)

      if (birim > 0 && birim < enDusukBirim) {
        enDusukBirim = birim
        enDusukFirma = f.id
      }
      if (birim > 0) {
        toplamBirim += birim
        teklifSayisi++
      }

      firmaFiyatMap[f.id] = {
        birimFiyat: birim,
        toplamTutar: toplam,
        enDusukMu: false
      }
    })

    if (enDusukFirma && firmaFiyatMap[enDusukFirma]) {
      firmaFiyatMap[enDusukFirma].enDusukMu = true
    }

    return {
      kalemId: kalem.kalemId,
      kalemAdi: kalem.kalemAdi,
      miktar: kalem.miktar,
      olcuBirimi: kalem.olcuBirimi,
      enDusukFiyat: enDusukBirim === Infinity ? 0 : enDusukBirim,
      enDusukFirmaId: enDusukFirma,
      ortalamaFiyat: teklifSayisi > 0 ? roundKurus(toplamBirim / teklifSayisi) : 0,
      firmaFiyatlari: firmaFiyatMap
    }
  })

  // Firma sıralamasını belirle
  const siraliFirmalar = firmalar
    .map((f) => ({ id: f.id, ad: f.ad, toplamTutar: firmaToplamlari[f.id] || 0 }))
    .filter((f) => f.toplamTutar > 0)
    .sort((a, b) => a.toplamTutar - b.toplamTutar)

  const sonucToplamlar: Record<
    string,
    { toplamTutar: number; siralama: number; enAvantajliMi: boolean }
  > = {}
  siraliFirmalar.forEach((f, idx) => {
    sonucToplamlar[f.id] = {
      toplamTutar: f.toplamTutar,
      siralama: idx + 1,
      enAvantajliMi: idx === 0
    }
  })

  return {
    firmalar,
    kalemler: islenmisKalemler,
    firmaToplamlari: sonucToplamlar,
    genelEnDusukFirma: siraliFirmalar.length > 0 ? siraliFirmalar[0] : null
  }
}
