export * from './types'
import { ProcessMapping } from './types'
import { IhtiyacListesiMapping } from './ihtiyac-listesi.mapping'
import { IhtiyacTalepFormuMapping } from './ihtiyac-talep-formu.mapping'
import { LuzumMuzekkeresiMapping } from './luzum-muzekkeresi.mapping'
import { LuzumOnayEkiMapping } from './luzum-muzekkeresi-onay-eki.mapping'
import { LuzumTeslimTesellumMapping } from './luzum-muzekkeresi-teslim-tesellum.mapping'
import { SonAlimFiyatCetveliMapping } from './son-alim-fiyat-cetveli.mapping'

import { KomisyonGorevlendirmeOnayiMapping } from './komisyon-gorevlendirme-onayi.mapping'
import { KomisyonGorevlendirmeOnayiEkiMapping } from './komisyon-gorevlendirme-onayi-eki.mapping'
import { MuayeneKabulKomisyonuMapping } from './muayene-kabul-komisyonu.mapping'
import { PiyasaFiyatArastirmaGorevlendirmesiMapping } from './piyasa-fiyat-arastirma-gorevlendirmesi.mapping'
import { HarcamaTalimatiMapping } from './harcama-talimati.mapping'
import { YaklasikMaliyetCetveliMapping } from './yaklasik-maliyet-cetveli.mapping'

// Diğer tüm belgeler için oluşturulan spesifik şablon eşleşmelerini çek
import * as allOther from './all-templates.mapping'

export const processMappingRegistry: Record<string, ProcessMapping> = {
  // İhtiyaç Listesi & Maliyet & Onay
  '/dosya/hazirlik-ve-ihtiyac': IhtiyacListesiMapping,
  '/dosya/malzemeler/liste': IhtiyacListesiMapping,
  '/dosya/luzum/talep-formu': IhtiyacTalepFormuMapping,
  '/dosya/luzum/belge': LuzumMuzekkeresiMapping,
  '/dosya/luzum/onay-eki': LuzumOnayEkiMapping,
  '/dosya/luzum/teslim-tesellum': LuzumTeslimTesellumMapping,
  '/dosya/malzemeler/son-alim': SonAlimFiyatCetveliMapping,

  // Komisyon & Harcama
  '/dosya/komisyon/fiyat-arastirma': KomisyonGorevlendirmeOnayiMapping,
  '/dosya/komisyon/onay-eki': KomisyonGorevlendirmeOnayiEkiMapping,
  '/dosya/komisyon/muayene-kabul': MuayeneKabulKomisyonuMapping,
  '/dosya/harcama/talimat': HarcamaTalimatiMapping,
  '/dosya/firmalar-maliyet/yaklasik': YaklasikMaliyetCetveliMapping,

  // Diğer süreç ve onay sayfaları
  '/dosya/firmalar-maliyet/tutanak': allOther.PiyasaFiyatArastirmaTutanagiMapping,
  '/dosya/onay/dt-onay': allOther.DogrudanTeminOnayBelgesiMapping,
  '/dosya/onay/ihale-onay': allOther.IdareOnayBelgesiMapping,
  '/dosya/onay/butce-sorgu': allOther.ButceSorgusuMapping,
  '/dosya/harcama/pusula': allOther.HarcamaPusulasiMapping,

  // Wizard subscreen fallbacks
  '/dosya/piyasa-fiyat-arastirmasi': allOther.PiyasaFiyatArastirmaTutanagiMapping,
  '/dosya/siparis-ve-sozlesme': allOther.DogrudanTeminSozlesmesiMapping,
  '/dosya/kabul-ve-odeme': allOther.MuayeneKabulTutanagiMapping,
  '/dosya/fatura-ve-irsaliye': allOther.HakedisRaporuMapping,
  '/dosya/klasor-ve-kapaklar': allOther.IhaleKapagiMapping,
  '/dosya/imzali-belgeler': allOther.DogrudanTeminSonucOnayBelgesiMapping,

  // Diğer tüm belgeler için spesifik kayıtlar (Cikti Merkezi ve Süreç aşamaları altı)
  'arastirma-mektubu': allOther.ArastirmaMektubuMapping,
  'birim-fiyat-teklif-cetveli': allOther.BirimFiyatTeklifCetveliMapping,
  'birim-fiyat-teklif-mektubu': allOther.BirimFiyatTeklifMektubuMapping,
  'dagitim-cizelgesi': allOther.DagitimCizelgesiMapping,
  'dagitim-cizelgesi-karma': allOther.DagitimCizelgesiKarmaMapping,
  'fiyat-arastirma-mektubu': allOther.FiyatArastirmaMektubuMapping,
  'fiyat-arastirmasi': allOther.FiyatArastirmasiMapping,
  'piyasa-fiyat-arastirma-tutanagi': allOther.PiyasaFiyatArastirmaTutanagiMapping,
  'teklif-mektubu-dagitim-cizelgesi': allOther.TeklifMektubuDagitimCizelgesiMapping,
  'yaklasik-maliyet-teklif-mektubu': allOther.FiyatArastirmaMektubuMapping,
  'butce-sorgusu': allOther.ButceSorgusuMapping,
  'dogrudan-temin-onay-belgesi': allOther.DogrudanTeminOnayBelgesiMapping,
  'dogrudan-temin-sonuc-onay-belgesi': allOther.DogrudanTeminSonucOnayBelgesiMapping,
  'dogrudan-temin-sozlesmesi': allOther.DogrudanTeminSozlesmesiMapping,
  'dogrudan-temin-sozlesmesi-alternatif': allOther.DogrudanTeminSozlesmesiAlternatifMapping,
  'dogrudan-temin-sozlesmesi-uzun': allOther.DogrudanTeminSozlesmesiUzunMapping,
  'idare-onay-belgesi': allOther.IdareOnayBelgesiMapping,
  'ihale-komisyon-karari': allOther.IhaleKomisyonKarariMapping,
  'kabul-edilen-teklif': allOther.KabulEdilenTeklifMapping,
  'kabul-edilen-teklif-alternatif': allOther.KabulEdilenTeklifMapping,
  'sozlesmeye-davet': allOther.SozlesmeyeDavetMapping,
  'teklif-mektubu': allOther.TeklifMektubuMapping,
  'hakedis-raporu': allOther.HakedisRaporuMapping,
  'harcama-pusulasi': allOther.HarcamaPusulasiMapping,
  'hizmet-isleri-kabul-teklif-belgesi': allOther.HizmetIsleriKabulTeklifBelgesiMapping,
  'hizmet-isleri-kabul-tutanagi': allOther.HizmetIsleriKabulTutanagiMapping,
  'gunluk-calisma-puantaj-cizelgesi': allOther.HizmetIsleriKabulTutanagiMapping,
  'muayene-kabul-tutanagi': allOther.MuayeneKabulTutanagiMapping,
  'odeme-emri-belgesi': allOther.OdemeEmriBelgesiMapping,
  'odeme-yazisi': allOther.OdemeYazisiMapping,
  'tasinir-islem-fisi': allOther.TasinirIslemFisiMapping,
  'ihale-kapagi': allOther.IhaleKapagiMapping,
  'kapak-ici-indeks-sablonu': allOther.KapakIciIndeksSablonuMapping,
  'klasor-sirtligi-3cm': allOther.KlasorSirtligi3cmMapping,
  'klasor-sirtligi-5cm': allOther.KlasorSirtligi5cmMapping,
  'klasor-sirtligi-7-5cm': allOther.KlasorSirtligi75cmMapping
}

export function getDefaultMappingForProcess(processPath: string): ProcessMapping {
  const parts = processPath.replace(/\.html$/, '').split('/')
  let cleanPath = parts.pop() || ''
  if (cleanPath === 'index' && parts.length > 0) {
    cleanPath = parts.pop() || ''
  }

  if (
    cleanPath === 'ihtiyac-listesi' ||
    cleanPath === 'malzeme-hizmet-kalem-listesi' ||
    cleanPath === 'liste' ||
    cleanPath === 'hazirlik-ve-ihtiyac'
  ) {
    return IhtiyacListesiMapping
  }
  if (
    cleanPath === 'luzum-muzekkeresi' ||
    cleanPath === 'luzum-muzekkeresi-belgesi' ||
    cleanPath === 'belge'
  ) {
    return LuzumMuzekkeresiMapping
  }
  if (
    cleanPath === 'luzum-muzekkeresi-onay-eki' ||
    cleanPath === 'luzum-onay-eki' ||
    cleanPath === 'onay-eki'
  ) {
    return LuzumOnayEkiMapping
  }
  if (
    cleanPath === 'luzum-muzekkeresi-teslim-tesellum' ||
    cleanPath === 'teslim-tesellum-belgesi' ||
    cleanPath === 'teslim-tesellum'
  ) {
    return LuzumTeslimTesellumMapping
  }
  if (cleanPath === 'ihtiyac-talep-formu' || cleanPath === 'talep-formu') {
    return IhtiyacTalepFormuMapping
  }
  if (cleanPath === 'son-alim-fiyat-cetveli' || cleanPath === 'son-alim') {
    return SonAlimFiyatCetveliMapping
  }

  // Komisyon ve harcama belgeleri
  if (
    cleanPath === 'komisyon-gorevlendirme-onayi' ||
    cleanPath === 'fiyat-arastirma' ||
    cleanPath === 'yaklasik-maliyet-tespit-komisyonu' ||
    cleanPath === 'yaklasik-maliyet-komisyonu'
  ) {
    return KomisyonGorevlendirmeOnayiMapping
  }
  if (cleanPath === 'komisyon-gorevlendirme-onayi-eki') {
    return KomisyonGorevlendirmeOnayiEkiMapping
  }
  if (cleanPath === 'muayene-kabul-komisyonu' || cleanPath === 'muayene-kabul') {
    return MuayeneKabulKomisyonuMapping
  }
  if (cleanPath === 'piyasa-fiyat-arastirma-gorevlendirmesi') {
    return PiyasaFiyatArastirmaGorevlendirmesiMapping
  }
  if (cleanPath === 'harcama-talimati' || cleanPath === 'talimat') {
    return HarcamaTalimatiMapping
  }
  if (
    cleanPath === 'yaklasik-maliyet-cetveli' ||
    cleanPath === 'yaklasik-maliyet-hesap-cetveli' ||
    cleanPath === 'yaklasik'
  ) {
    return YaklasikMaliyetCetveliMapping
  }

  // Dinamik olarak diğer tüm belgeler
  switch (cleanPath) {
    case 'arastirma-mektubu':
      return allOther.ArastirmaMektubuMapping
    case 'birim-fiyat-teklif-cetveli':
      return allOther.BirimFiyatTeklifCetveliMapping
    case 'birim-fiyat-teklif-mektubu':
      return allOther.BirimFiyatTeklifMektubuMapping
    case 'dagitim-cizelgesi':
      return allOther.DagitimCizelgesiMapping
    case 'dagitim-cizelgesi-karma':
      return allOther.DagitimCizelgesiKarmaMapping
    case 'fiyat-arastirma-mektubu':
      return allOther.FiyatArastirmaMektubuMapping
    case 'fiyat-arastirmasi':
      return allOther.FiyatArastirmasiMapping
    case 'piyasa-fiyat-arastirma-tutanagi':
    case 'tutanak':
      return allOther.PiyasaFiyatArastirmaTutanagiMapping
    case 'teklif-mektubu-dagitim-cizelgesi':
      return allOther.TeklifMektubuDagitimCizelgesiMapping
    case 'yaklasik-maliyet-teklif-mektubu':
      return allOther.FiyatArastirmaMektubuMapping
    case 'butce-sorgusu':
    case 'butce-sorgu':
      return allOther.ButceSorgusuMapping
    case 'dogrudan-temin-onay-belgesi':
    case 'dt-onay':
      return allOther.DogrudanTeminOnayBelgesiMapping
    case 'dogrudan-temin-sonuc-onay-belgesi':
      return allOther.DogrudanTeminSonucOnayBelgesiMapping
    case 'dogrudan-temin-sozlesmesi':
      return allOther.DogrudanTeminSozlesmesiMapping
    case 'dogrudan-temin-sozlesmesi-alternatif':
      return allOther.DogrudanTeminSozlesmesiAlternatifMapping
    case 'dogrudan-temin-sozlesmesi-uzun':
      return allOther.DogrudanTeminSozlesmesiUzunMapping
    case 'idare-onay-belgesi':
    case 'ihale-onay':
      return allOther.IdareOnayBelgesiMapping
    case 'ihale-komisyon-karari':
      return allOther.IhaleKomisyonKarariMapping
    case 'kabul-edilen-teklif':
      return allOther.KabulEdilenTeklifMapping
    case 'kabul-edilen-teklif-alternatif':
      return allOther.KabulEdilenTeklifMapping
    case 'sozlesmeye-davet':
      return allOther.SozlesmeyeDavetMapping
    case 'teklif-mektubu':
      return allOther.TeklifMektubuMapping
    case 'hakedis-raporu':
      return allOther.HakedisRaporuMapping
    case 'harcama-pusulasi':
    case 'pusula':
      return allOther.HarcamaPusulasiMapping
    case 'hizmet-isleri-kabul-teklif-belgesi':
      return allOther.HizmetIsleriKabulTeklifBelgesiMapping
    case 'hizmet-isleri-kabul-tutanagi':
      return allOther.HizmetIsleriKabulTutanagiMapping
    case 'muayene-kabul-tutanagi':
      return allOther.MuayeneKabulTutanagiMapping
    case 'odeme-emri-belgesi':
      return allOther.OdemeEmriBelgesiMapping
    case 'odeme-yazisi':
      return allOther.OdemeYazisiMapping
    case 'tasinir-islem-fisi':
      return allOther.TasinirIslemFisiMapping
    case 'ihale-kapagi':
      return allOther.IhaleKapagiMapping
    case 'kapak-ici-indeks-sablonu':
      return allOther.KapakIciIndeksSablonuMapping
    case 'klasor-sirtligi-3cm':
      return allOther.KlasorSirtligi3cmMapping
    case 'klasor-sirtligi-5cm':
      return allOther.KlasorSirtligi5cmMapping
    case 'klasor-sirtligi-7-5cm':
      return allOther.KlasorSirtligi75cmMapping
    default:
      return processMappingRegistry[processPath] || {}
  }
}
