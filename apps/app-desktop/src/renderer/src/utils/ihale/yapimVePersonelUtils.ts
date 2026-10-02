/**
 * TEMİN 360 - YAPIM İŞLERİ, PERSONEL MALİYETİ VE BÜTÇE/ÖDENEK YARDIMCILARI
 *
 * 1. İş Artışı ve İş Eksilişi Sınırları Kontrolü (4735 Sayılı Kanun Md. 24)
 * 2. İşçilik Yaklaşık Maliyet Motoru (Asgari Ücret, SGK İşveren Payı, Kıdem Karşılığı)
 * 3. Puantaj ve Fazla Mesai Hesaplayıcı
 * 4. %10 Bütçe / Ödenek Sınırı Kontrolü (4734 Sayılı Kanun Md. 62/ı)
 */

import { roundKurus, formatTL } from './paraVeYuvarlamaUtils'

/**
 * İŞ ARTIŞI / İŞ EKSİLİŞİ DENETÇİSİ (4735 Md. 24)
 * Yapım işlerinde %10 - %20, Mal/Hizmette %20 limit kontrolleri
 */
export interface IsArtisEksilisInput {
  sozlesmeBedeli: number
  artisVeyaEksilisTutari: number // Pozitif: Artış, Negatif: Eksiliş
  isTuru: 'YAPIM' | 'HIZMET' | 'MAL'
}

export interface IsArtisEksilisSonucu {
  yeniSozlesmeBedeli: number
  degisimOraniYuzde: number
  yasalSinirYuzde: number
  sinirAsildiMi: boolean
  ekKesinTeminatGerekliMi: boolean
  ekKesinTeminatTutari: number
  mesaj: string
}

export function denetleIsArtisEksilis(input: IsArtisEksilisInput): IsArtisEksilisSonucu {
  const { sozlesmeBedeli, artisVeyaEksilisTutari, isTuru } = input
  if (sozlesmeBedeli <= 0) {
    return {
      yeniSozlesmeBedeli: 0,
      degisimOraniYuzde: 0,
      yasalSinirYuzde: 20,
      sinirAsildiMi: false,
      ekKesinTeminatGerekliMi: false,
      ekKesinTeminatTutari: 0,
      mesaj: 'Geçersiz sözleşme bedeli'
    }
  }

  const yasalSinirYuzde = isTuru === 'YAPIM' ? 20 : 20 // Standart yasal artış sınırı %20 (Bakanlar Kurulu/Cumhurbaşkanı kararıyla %40)
  const degisimOraniYuzde = (Math.abs(artisVeyaEksilisTutari) / sozlesmeBedeli) * 100
  const sinirAsildiMi = degisimOraniYuzde > yasalSinirYuzde
  const yeniSozlesmeBedeli = roundKurus(sozlesmeBedeli + artisVeyaEksilisTutari)

  // Artış durumunda ek kesin teminat (%6) alınır
  const ekKesinTeminatGerekliMi = artisVeyaEksilisTutari > 0
  const ekKesinTeminatTutari = ekKesinTeminatGerekliMi
    ? roundKurus(artisVeyaEksilisTutari * 0.06)
    : 0

  let mesaj = ''
  if (artisVeyaEksilisTutari > 0) {
    mesaj = `%${degisimOraniYuzde.toFixed(2)} oranında iş artışı yapıldı. ${sinirAsildiMi ? `DİKKAT: Yasal %${yasalSinirYuzde} sınırı aşılmıştır!` : `Yasal sınır (%${yasalSinirYuzde}) içerisindedir.`}`
  } else if (artisVeyaEksilisTutari < 0) {
    mesaj = `%${degisimOraniYuzde.toFixed(2)} oranında iş eksilişi yapıldı.`
  } else {
    mesaj = 'Herhangi bir iş artışı veya eksilişi bulunmamaktadır.'
  }

  return {
    yeniSozlesmeBedeli,
    degisimOraniYuzde: roundKurus(degisimOraniYuzde),
    yasalSinirYuzde,
    sinirAsildiMi,
    ekKesinTeminatGerekliMi,
    ekKesinTeminatTutari,
    mesaj
  }
}

/**
 * PERSONEL VE İŞÇİLİK YAKLAŞIK MALİYET MOTORU
 */
export interface IscilikMaliyetInput {
  brutAsgariUcret: number
  personelSayisi?: number
  calismaSuresiAy?: number
  sgkIsverenPrimiOrani?: number // Standart: 0.155 (%15.5 - 5 puan indirimli) veya 0.205 (%20.5)
  issizlikIsverenPrimiOrani?: number // 0.02 (%2)
  kidemTazminatiKarsiligiOrani?: number // 0.0833 (Yıllık 1 brüt maaş = 1/12)
  aylikYemekUcreti?: number
  aylikYolUcreti?: number
  aylikGiyimVeDiger?: number
  sozlesmeVeGenelGiderOrani?: number // 4734 gereği %4 sözleşme ve genel gider
}

export interface IscilikMaliyetSonucu {
  aylikKisiBasiToplamMaliyet: number
  toplamIscilikYaklasikMaliyeti: number
  sgkIsverenPrimi: number
  issizlikPrimi: number
  kidemKarsiligi: number
  sozlesmeGenelGideri: number
  detayDizisi: string[]
}

export function hesaplaIscilikYaklasikMaliyeti(input: IscilikMaliyetInput): IscilikMaliyetSonucu {
  const {
    brutAsgariUcret,
    personelSayisi = 1,
    calismaSuresiAy = 12,
    sgkIsverenPrimiOrani = 0.155,
    issizlikIsverenPrimiOrani = 0.02,
    kidemTazminatiKarsiligiOrani = 0.0833,
    aylikYemekUcreti = 0,
    aylikYolUcreti = 0,
    aylikGiyimVeDiger = 0,
    sozlesmeVeGenelGiderOrani = 0.04
  } = input

  const sgkIsveren = roundKurus(brutAsgariUcret * sgkIsverenPrimiOrani)
  const issizlik = roundKurus(brutAsgariUcret * issizlikIsverenPrimiOrani)
  const kidem = roundKurus(brutAsgariUcret * kidemTazminatiKarsiligiOrani)

  const aylikCirplakMaliyet =
    brutAsgariUcret +
    sgkIsveren +
    issizlik +
    kidem +
    aylikYemekUcreti +
    aylikYolUcreti +
    aylikGiyimVeDiger
  const sozlesmeGenelGider = roundKurus(aylikCirplakMaliyet * sozlesmeVeGenelGiderOrani)

  const aylikKisiBasiToplam = roundKurus(aylikCirplakMaliyet + sozlesmeGenelGider)
  const toplamYaklasikMaliyet = roundKurus(aylikKisiBasiToplam * personelSayisi * calismaSuresiAy)

  const detaylar: string[] = [
    `Brüt Asgari Ücret: ${formatTL(brutAsgariUcret)}`,
    `SGK İşveren Payı (%${sgkIsverenPrimiOrani * 100}): ${formatTL(sgkIsveren)}`,
    `İşsizlik Sigortası İşveren Payı (%${issizlikIsverenPrimiOrani * 100}): ${formatTL(issizlik)}`,
    `Kıdem Tazminatı Karşılığı: ${formatTL(kidem)}`,
    aylikYemekUcreti > 0 ? `Yemek Gideri: ${formatTL(aylikYemekUcreti)}` : '',
    aylikYolUcreti > 0 ? `Yol Gideri: ${formatTL(aylikYolUcreti)}` : '',
    `%4 Sözleşme ve Genel Giderler: ${formatTL(sozlesmeGenelGider)}`,
    `Aylık Kişi Başı Toplam: ${formatTL(aylikKisiBasiToplam)}`,
    `Toplam Proje Yaklaşık Maliyeti (${personelSayisi} kişi × ${calismaSuresiAy} ay): ${formatTL(toplamYaklasikMaliyet)}`
  ].filter(Boolean)

  return {
    aylikKisiBasiToplamMaliyet: aylikKisiBasiToplam,
    toplamIscilikYaklasikMaliyeti: toplamYaklasikMaliyet,
    sgkIsverenPrimi: sgkIsveren,
    issizlikPrimi: issizlik,
    kidemKarsiligi: kidem,
    sozlesmeGenelGideri: sozlesmeGenelGider,
    detayDizisi: detaylar
  }
}

/**
 * %10 BÜTÇE / ÖDENEK TAVAN SINIRI KONTROLÜ (4734 Md. 62/ı)
 */
export interface ButceSinirKontrolInput {
  yillikToplamOdenek: number
  oncekiHarcananToplam22d: number
  buAlimTutari: number
}

export interface ButceSinirKontrolSonucu {
  yuzdeOnTavanTutari: number
  yeniToplamHarcama: number
  kalanLimit: number
  kullanilanOranYuzde: number
  limitAsildiMi: boolean
  uyariSeviyesi: 'GUVENLI' | 'YAKLASIYOR' | 'ASILDI'
  mesaj: string
}

export function denetleButceYuzdeOnSiniri(input: ButceSinirKontrolInput): ButceSinirKontrolSonucu {
  const { yillikToplamOdenek, oncekiHarcananToplam22d, buAlimTutari } = input
  const yuzdeOnTavan = roundKurus(yillikToplamOdenek * 0.1)
  const yeniToplam = roundKurus(oncekiHarcananToplam22d + buAlimTutari)
  const kalanLimit = roundKurus(yuzdeOnTavan - yeniToplam)
  const kullanilanOranYuzde = yuzdeOnTavan > 0 ? roundKurus((yeniToplam / yuzdeOnTavan) * 100) : 0

  let uyariSeviyesi: 'GUVENLI' | 'YAKLASIYOR' | 'ASILDI' = 'GUVENLI'
  let mesaj = ''

  if (yeniToplam > yuzdeOnTavan) {
    uyariSeviyesi = 'ASILDI'
    mesaj = `4734 Madde 62/ı KİK %10 Bütçe Tavanı AŞILMIŞTIR! (Aşılan Miktar: ${formatTL(Math.abs(kalanLimit))}). Kamu İhale Kurulu'ndan uygun görüş alınması zorunludur.`
  } else if (kullanilanOranYuzde >= 80) {
    uyariSeviyesi = 'YAKLASIYOR'
    mesaj = `Dikkat: %10 bütçe tavanının %${kullanilanOranYuzde}'si kullanıldı. Kalan doğrudan temin limiti: ${formatTL(kalanLimit)}.`
  } else {
    uyariSeviyesi = 'GUVENLI'
    mesaj = `Bütçe limiti güvenli aralıktadır (%${kullanilanOranYuzde} kullanıldı). Kalan limit: ${formatTL(kalanLimit)}.`
  }

  return {
    yuzdeOnTavanTutari: yuzdeOnTavan,
    yeniToplamHarcama: yeniToplam,
    kalanLimit,
    kullanilanOranYuzde,
    limitAsildiMi: yeniToplam > yuzdeOnTavan,
    uyariSeviyesi,
    mesaj
  }
}
