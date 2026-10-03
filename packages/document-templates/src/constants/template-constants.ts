/**
 * Document Templates — Sabitler ve Kanonik Alias Haritası
 */

export const CANONICAL_TEMPLATE_ALIASES: Record<string, string> = {
  // Aşama 1 - Doğrudan Temin Onay Belgesi (22. Madde)
  '1-ihtiyac-tespiti-ve-baslangic-dogrudan-temin-onay-belgesi': 'dogrudan-temin-onay-belgesi',
  'dogrudan-temin-onay-belgesi': 'dogrudan-temin-onay-belgesi',
  'dogrudan-temin-onay': 'dogrudan-temin-onay-belgesi',
  'dt-onay': 'dogrudan-temin-onay-belgesi',
  'dt-onay-belgesi': 'dogrudan-temin-onay-belgesi',
  'onay-belgesi': 'dogrudan-temin-onay-belgesi',
  'onaybelgesi': 'dogrudan-temin-onay-belgesi',

  // İhale Onay Belgesi / Harcama Talimatı
  'harcama-talimati': 'harcama-talimati',
  'idare-onay-belgesi': 'harcama-talimati',
  'ihale-onay-belgesi': 'harcama-talimati',
  'ihale-onay': 'harcama-talimati',
  'harcama': 'harcama-talimati',
  'talimat': 'harcama-talimati',
  'harcama-onay-belgesi': 'harcama-talimati',

  // Bütçe Sorgusu
  'butce-sorgusu': 'butce-sorgusu',
  'butce-sorgu': 'butce-sorgusu',
  'butcesorgusu': 'butce-sorgusu',
  'odenek-uygunluk': 'butce-sorgusu',
  'butce-onay': 'butce-sorgusu',

  // Sonuç Onay Belgeleri
  '3-siparis-ve-sozlesme-dogrudan-temin-onay-belgesi': 'dogrudan-temin-sonuc-onay-belgesi',
  '3-siparis-ve-sozlesme-dogrudan-temin-sonuc-onay-belgesi': 'dogrudan-temin-sonuc-onay-belgesi',
  'siparis-ve-sozlesme-dogrudan-temin-onay-belgesi': 'dogrudan-temin-sonuc-onay-belgesi',
  'siparis-dogrudan-temin-onay-belgesi': 'dogrudan-temin-sonuc-onay-belgesi',
  'dogrudan-temin-sonuc-onay-belgesi': 'dogrudan-temin-sonuc-onay-belgesi',
  'sonuc-onay-belgesi': 'dogrudan-temin-sonuc-onay-belgesi',
  'sonuconaybelgesi': 'dogrudan-temin-sonuc-onay-belgesi',
  'sonuc-onay': 'dogrudan-temin-sonuc-onay-belgesi',
  'sonuconay': 'dogrudan-temin-sonuc-onay-belgesi',

  // İhtiyaç & Talep
  'ihtiyac': 'ihtiyac-listesi',
  'ihtiyac-listesi': 'ihtiyac-listesi',
  'ihtiyaclistesi': 'ihtiyac-listesi',
  'malzeme-hizmet-kalem-listesi': 'ihtiyac-listesi',
  'malzeme-listesi': 'ihtiyac-listesi',
  'liste': 'ihtiyac-listesi',
  'hazirlik-ve-ihtiyac': 'ihtiyac-listesi',
  'ihtiyac-talep-formu': 'ihtiyac-talep-formu',
  'ihtiyactalepformu': 'ihtiyac-talep-formu',
  'ihtiyac-talep': 'ihtiyac-talep-formu',
  'talep': 'ihtiyac-talep-formu',

  // Taşınır Kayıt Yetkilisi Görüşü
  'tasinir-kayit-yetkilisi-gorusu': 'tasinir-kayit-yetkilisi-gorusu',
  'tasinirkayityetkilisigorusu': 'tasinir-kayit-yetkilisi-gorusu',
  'tasinir-kayit-yetkilisi': 'tasinir-kayit-yetkilisi-gorusu',
  'tasinir-gorusu': 'tasinir-kayit-yetkilisi-gorusu',
  'tasinir-kayit': 'tasinir-kayit-yetkilisi-gorusu',
  'tasinir': 'tasinir-kayit-yetkilisi-gorusu',
  'ambar-gorusu': 'tasinir-kayit-yetkilisi-gorusu',

  // Teknik Şartname
  'teknik-sartname': 'teknik-sartname',
  'tekniksartname': 'teknik-sartname',
  'teknik-sartnamesi': 'teknik-sartname',
  'teknik-sartnameler': 'teknik-sartname',
  'sartname': 'teknik-sartname',
  'teknik': 'teknik-sartname',

  // Lüzum
  'luzum': 'luzum-muzekkeresi',
  'luzum-muzekkere': 'luzum-muzekkeresi',
  'luzum-muzekkeresi': 'luzum-muzekkeresi',
  'luzummuzekkeresi': 'luzum-muzekkeresi',
  'luzum-onay-eki': 'luzum-muzekkeresi-onay-eki',
  'luzum-muzekkeresi-onay-eki': 'luzum-muzekkeresi-onay-eki',
  'luzummuzekkeresionayeki': 'luzum-muzekkeresi-onay-eki',
  'luzum-teslim-tesellum': 'luzum-muzekkeresi-teslim-tesellum',
  'luzum-muzekkeresi-teslim-tesellum': 'luzum-muzekkeresi-teslim-tesellum',
  'luzummuzekkeresiteslimtesellum': 'luzum-muzekkeresi-teslim-tesellum',
  'teslim-tesellum': 'luzum-muzekkeresi-teslim-tesellum',
  'teslim-tesellum-belgesi': 'luzum-muzekkeresi-teslim-tesellum',

  // Komisyon & Görevlendirme
  'komisyon-gorevlendirme': 'komisyon-gorevlendirme-onayi',
  'komisyon-gorevlendirme-onayi': 'komisyon-gorevlendirme-onayi',
  'komisyongorevlendirmeonayi': 'komisyon-gorevlendirme-onayi',
  'komisyon-atama': 'komisyon-gorevlendirme-onayi',
  'komisyon-onayi': 'komisyon-gorevlendirme-onayi',
  'komisyon-karari': 'komisyon-gorevlendirme-onayi',
  'ihale-komisyon-karari': 'ihale-komisyon-karari',
  'ihalekomisyonkarari': 'ihale-komisyon-karari',
  'ihale-karari': 'ihale-komisyon-karari',
  'yaklasik-maliyet-tespit-komisyonu': 'komisyon-gorevlendirme-onayi',
  'yaklasik-maliyet-komisyonu': 'komisyon-gorevlendirme-onayi',
  'yaklasikmaliyetkomisyonu': 'komisyon-gorevlendirme-onayi',
  'fiyat-arastirma-komisyonu': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'fiyatarastirmakomisyonu': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'komisyon-gorevlendirme-onayi-eki': 'komisyon-gorevlendirme-onayi-eki',
  'komisyongorevlendirmeonayieki': 'komisyon-gorevlendirme-onayi-eki',
  'komisyon-onay-eki': 'komisyon-gorevlendirme-onayi-eki',
  'komisyon-eki': 'komisyon-gorevlendirme-onayi-eki',

  // Teklif & Mektuplar
  'fiyat-arastirma-mektubu': 'fiyat-arastirma-mektubu',
  'fiyatarastirmamektubu': 'fiyat-arastirma-mektubu',
  'fiyat-arastirma': 'fiyat-arastirma-mektubu',
  'fiyat-arastirmasi': 'fiyat-arastirma-mektubu',
  'teklif-mektubu-dagitim-karma': 'fiyat-arastirma-mektubu',
  'dagitim-cizelgesi-karma': 'fiyat-arastirma-mektubu',
  'birim-fiyat-teklif-mektubu': 'birim-fiyat-teklif-mektubu',
  'birimfiyatteklifmektubu': 'birim-fiyat-teklif-mektubu',
  'birim-fiyat-teklif-cetveli': 'birim-fiyat-teklif-mektubu',
  'teklif-mektubu': 'birim-fiyat-teklif-mektubu',
  'teklifmektubu': 'birim-fiyat-teklif-mektubu',
  'arastirma-mektubu': 'arastirma-mektubu',
  'arastirmamektubu': 'arastirma-mektubu',
  'teklif-mektubu-dagitim': 'arastirma-mektubu',
  'teklif-mektubu-dagitim-cizelgesi': 'arastirma-mektubu',
  'dagitim-cizelgesi': 'arastirma-mektubu',
  'yasaklilik-sorgulama-tutanagi': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'yasaklilik-sorgulama': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'yasaklilik': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'ekap-yasaklilik': 'piyasa-fiyat-arastirma-gorevlendirmesi',

  // Piyasa Fiyat Araştırma & Yaklaşık Maliyet
  'piyasa-fiyat-arastirma-tutanagi': 'piyasa-fiyat-arastirma-tutanagi',
  'piyasafiyatarastirmatutanagi': 'piyasa-fiyat-arastirma-tutanagi',
  'piyasa-fiyat-arastirmasi': 'piyasa-fiyat-arastirma-tutanagi',
  'piyasa-arastirma-tutanagi': 'piyasa-fiyat-arastirma-tutanagi',
  'fiyat-arastirma-tutanagi': 'piyasa-fiyat-arastirma-tutanagi',
  'tutanak': 'piyasa-fiyat-arastirma-tutanagi',
  'piyasa-fiyat-arastirma-gorevlendirmesi': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'piyasafiyatarastirmagorevlendirmesi': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'piyasa-fiyat-arastirma-gorevlendirme': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'arastirma-gorevlendirmesi': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'gorevlendirme': 'piyasa-fiyat-arastirma-gorevlendirmesi',
  'yaklasik-maliyet-cetveli': 'yaklasik-maliyet-cetveli',
  'yaklasikmaliyetcetveli': 'yaklasik-maliyet-cetveli',
  'yaklasik-maliyet-hesap-cetveli': 'yaklasik-maliyet-cetveli',
  'yaklasik-maliyet': 'yaklasik-maliyet-cetveli',
  'yaklasik': 'yaklasik-maliyet-cetveli',
  'son-alim-fiyat-cetveli': 'son-alim-fiyat-cetveli',
  'son-alim': 'son-alim-fiyat-cetveli',
  'son-alim-fiyatlari': 'son-alim-fiyat-cetveli',
  'sonalimfiyatcetveli': 'son-alim-fiyat-cetveli',
  'sonalim': 'son-alim-fiyat-cetveli',
  'fiyat-cetveli': 'son-alim-fiyat-cetveli',
  'maliyet-cetveli': 'yaklasik-maliyet-cetveli',

  // Kabul Edilen Teklif, Sipariş Formu, Sözleşme
  'kabul-edilen-teklif': 'kabul-edilen-teklif',
  'kabuledilenteklif': 'kabul-edilen-teklif',
  'kabul-edilen-teklif-alternatif': 'kabul-edilen-teklif',
  'kabul-yazisi': 'kabul-edilen-teklif',
  'kabulyazisi': 'kabul-edilen-teklif',
  'siparis-formu': 'kabul-edilen-teklif',
  'siparisformu': 'kabul-edilen-teklif',
  'siparis-mektubu': 'kabul-edilen-teklif',
  'siparismektubu': 'kabul-edilen-teklif',
  'siparis': 'kabul-edilen-teklif',
  'dogrudan-temin-sozlesmesi': 'dogrudan-temin-sozlesmesi',
  'dogrudan-temin-sozlesmesi-alternatif': 'dogrudan-temin-sozlesmesi',
  'dogrudan-temin-sozlesmesi-uzun': 'dogrudan-temin-sozlesmesi',
  'sozlesme': 'dogrudan-temin-sozlesmesi',
  'sozlesmeye-davet': 'sozlesmeye-davet',
  'sozlesmedavet': 'sozlesmeye-davet',
  'davet-mektubu': 'sozlesmeye-davet',

  // Muayene, Kabul, Ödeme
  'harcama-pusulasi': 'harcama-pusulasi',
  'harcamapusulasi': 'harcama-pusulasi',
  'pusula': 'harcama-pusulasi',
  'muayene-kabul-komisyonu': 'muayene-kabul-komisyonu',
  'muayenekabulkomisyonu': 'muayene-kabul-komisyonu',
  'muayene-kabul-belgesi': 'muayene-kabul-komisyonu',
  'muayene-kabul-tutanagi': 'muayene-kabul-tutanagi',
  'muayenekabultutanagi': 'muayene-kabul-tutanagi',
  'muayene-kabul': 'muayene-kabul-tutanagi',
  'muayenekabul': 'muayene-kabul-tutanagi',
  'kabul-tutanagi': 'muayene-kabul-tutanagi',
  'hizmet-isleri-kabul-tutanagi': 'hizmet-isleri-kabul-tutanagi',
  'hizmetislerikabultutanagi': 'hizmet-isleri-kabul-tutanagi',
  'hizmet-kabul-tutanagi': 'hizmet-isleri-kabul-tutanagi',
  'hizmet-isleri-kabul-teklif-belgesi': 'hizmet-isleri-kabul-teklif-belgesi',
  'hizmetislerikabulteklifbelgesi': 'hizmet-isleri-kabul-teklif-belgesi',
  'hizmet-kabul-teklif': 'hizmet-isleri-kabul-teklif-belgesi',
  'odeme-emri-belgesi': 'odeme-emri-belgesi',
  'odemeemribelgesi': 'odeme-emri-belgesi',
  'odeme-emri': 'odeme-emri-belgesi',
  'odeme-yazisi': 'odeme-yazisi',
  'odemeyazisi': 'odeme-yazisi',
  'tasinir-islem-fisi': 'tasinir-islem-fisi',
  'tasinirislemfisi': 'tasinir-islem-fisi',
  'tif': 'tasinir-islem-fisi',
  'hakedis-raporu': 'hakedis-raporu',
  'hakedisraporu': 'hakedis-raporu',
  'hakedis': 'hakedis-raporu'
}

export function normalizeTemplateKey(str: string | null | undefined): string {
  if (!str) return ''
  let cleaned = str.trim()
  cleaned = cleaned.replace(/^(?:\d+-[a-zA-Z0-9_-]+[/\\])+/g, '')
  cleaned = cleaned
    .replace(/[/\\]index(\.html|\.mustache)?$/i, '')
    .replace(/\.html$/i, '')
    .replace(/\.mustache$/i, '')
    .replace(/^\d+[-_]/, '')
    .toLocaleLowerCase('tr-TR')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned
}

export function toCanonicalDocId(docId: string | null | undefined): string {
  if (!docId) return ''
  const clean = normalizeTemplateKey(docId)
  return CANONICAL_TEMPLATE_ALIASES[clean] || clean
}
