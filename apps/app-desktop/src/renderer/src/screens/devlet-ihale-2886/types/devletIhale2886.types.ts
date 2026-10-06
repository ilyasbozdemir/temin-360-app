export type IslemTuru2886 = 'satis' | 'kiralama' | 'irtifak' | 'irtifak_intifa' | 'trampa'

export type Usul2886 =
  | 'acik_teklif_45' // Md. 45 Açık Teklif Usulü (Açık Artırma)
  | 'kapali_teklif_36' // Md. 36 Kapalı Teklif Usulü
  | 'belli_istekliler_44' // Md. 44 Belli İstekliler Arasında Kapalı Teklif
  | 'pazarlik_51' // Md. 51 Pazarlık Usulü
  | 'yarisma_52' // Md. 52 Yarışma Usulü

export interface TasinmazBilgisi {
  il: string
  ilce: string
  mahalleKoy: string
  ada: string
  parsel: string
  yuzolcumuM2: number
  cinsi: string // Dükkan, Tarla, Arsa, Konut, vb.
  hisseOrani: string // 1/1, 1/2 vb.
  mevcutDurumu: string // Boş, İşgalli (Ecrimisilli), Kirada
  adres: string
}

export interface KiymetTakdirKomisyonUyesi {
  id: string
  adSoyad: string
  unvan: string
  gorev: 'Baskan' | 'Uye' | 'Uzman'
}

export interface EmsalArastirma {
  id: string
  kaynak: string // Ticaret/Esnaf Odası, Emlakçılar Odası, Muhtarlık, vb.
  tarih: string
  metrekareFiyati: number
  aciklama: string
}

export interface MuhammenBedelHesabi {
  birimFiyatM2: number
  toplamAlanM2: number
  hesaplananBedel: number
  takdirEdilenMuhammenBedel: number // Komisyon kararıyla belirlenen
  geciciTeminatOrani: number // %3 standart
  geciciTeminatTutari: number
  kdvOrani: number
  kararTarihi: string
  kararNo: string
}

export interface TeklifVerenIstekli {
  id: string
  unvanVeyaAd: string
  tcVkn: string
  geciciTeminatYatirdiMi: boolean
  teminatTutari: number
  teklifler: number[] // Açık artırma turlarındaki teklifler
  sonTeklifTutari: number
  kazandiMi: boolean
}

export interface KiraTahsilatPlani {
  yil: number
  aylikKiraBedeli: number
  yillikToplamKira: number
  artisOraniTuru: 'tufe_12_aylik' | 'yi_ufe_12_aylik' | 'sabit_oran'
  artisYuzdesi?: number
  guvenceBedeliDepozito: number // 3 aylık kira vb.
  odemeGunu: number // Her ayın 5'i vb.
}

export interface SurecEvrakiItem {
  id: string
  ad: string
  kod: string
  asama: 'baslangic' | 'kiymet_takdir' | 'sartname_ve_ilan' | 'ihale_gunu' | 'onay_ve_sozlesme'
  zorunluMu: boolean
  durum: 'hazirlanmadi' | 'taslak' | 'onaylandi' | 'teblig_edildi'
  tarih?: string
  sayiNo?: string
}
