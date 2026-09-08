export const TANIM_OlcuBirimi = {
  name: 'TANIM_OlcuBirimi',
  description: 'Malzeme ve Hizmetler için geçerli ölçü birimleri havuzu ve dönüşüm tanımları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ad', type: 'TEXT', notNull: true, unique: true, description: 'Tam Birim Adı (örn: Kilogram)' },
    { name: 'kisa_ad', type: 'TEXT', description: 'Kısaltma (örn: kg)' },
    { name: 'kategori', type: 'TEXT', default: 'Adet/Miktar', description: 'Kategori (Ağırlık, Uzunluk, Alan, Hacim, Zaman, Adet/Miktar, Sıcaklık, vb.)' },
    { name: 'sembol', type: 'TEXT', description: 'Uluslararası Sembol' },
    { name: 'donusum_faktoru', type: 'REAL', default: 1.0, description: 'Temel birime göre çarpan faktörü' },
    { name: 'temel_birim_mi', type: 'INTEGER', notNull: true, default: 0, description: 'Kategori içindeki referans/temel birim mi? (1/0)' },
    { name: 'donusum_tipi', type: 'TEXT', default: 'linear', description: 'Dönüşüm Tipi: linear (doğrusal) veya formula (formüllü)' },
    { name: 'ondalik_basamak', type: 'INTEGER', default: 2, description: 'Gösterim için ondalık basamak sayısı' },
    { name: 'iliskili_birimler', type: 'TEXT', description: 'Tekil/Çoğul veya ilişkili birimler' },
    { name: 'aciklama', type: 'TEXT', description: 'Ek açıklamalar ve notlar' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mi?' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Oluşturulma Tarihi'
    }
  ],
  initialData: [
    // Ağırlık Birimleri
    { ad: 'Kilogram', kisa_ad: 'kg', kategori: 'Ağırlık', sembol: 'kg', donusum_faktoru: 1.0, temel_birim_mi: 1, donusum_tipi: 'linear', ondalik_basamak: 3, aciklama: 'Kategori temel birimi' },
    { ad: 'Gram', kisa_ad: 'g', kategori: 'Ağırlık', sembol: 'g', donusum_faktoru: 0.001, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 kg = 1000 g' },
    { ad: 'Miligram', kisa_ad: 'mg', kategori: 'Ağırlık', sembol: 'mg', donusum_faktoru: 0.000001, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 g = 1000 mg' },
    { ad: 'Ton', kisa_ad: 't', kategori: 'Ağırlık', sembol: 't', donusum_faktoru: 1000.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 3, aciklama: '1 ton = 1000 kg' },
    { ad: 'Ons', kisa_ad: 'oz', kategori: 'Ağırlık', sembol: 'oz', donusum_faktoru: 0.0283495, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 4, aciklama: '1 oz ≈ 28.35 g' },

    // Uzunluk Birimleri
    { ad: 'Metre', kisa_ad: 'm', kategori: 'Uzunluk', sembol: 'm', donusum_faktoru: 1.0, temel_birim_mi: 1, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: 'Kategori temel birimi' },
    { ad: 'Kilometre', kisa_ad: 'km', kategori: 'Uzunluk', sembol: 'km', donusum_faktoru: 1000.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 3, aciklama: '1 km = 1000 m' },
    { ad: 'Santimetre', kisa_ad: 'cm', kategori: 'Uzunluk', sembol: 'cm', donusum_faktoru: 0.01, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 m = 100 cm' },
    { ad: 'Milimetre', kisa_ad: 'mm', kategori: 'Uzunluk', sembol: 'mm', donusum_faktoru: 0.001, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 m = 1000 mm' },
    { ad: 'Metretül', kisa_ad: 'mt', kategori: 'Uzunluk', sembol: 'mt', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: 'İnşaat ve yapı işlerinde boyuna ölçüm birimi' },
    { ad: 'İnç', kisa_ad: 'in', kategori: 'Uzunluk', sembol: '"', donusum_faktoru: 0.0254, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 3, aciklama: '1 in = 2.54 cm' },

    // Alan Birimleri
    { ad: 'Metrekare', kisa_ad: 'm²', kategori: 'Alan', sembol: 'm²', donusum_faktoru: 1.0, temel_birim_mi: 1, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: 'Kategori temel birimi' },
    { ad: 'Santimetrekare', kisa_ad: 'cm²', kategori: 'Alan', sembol: 'cm²', donusum_faktoru: 0.0001, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 m² = 10.000 cm²' },
    { ad: 'Hektar', kisa_ad: 'ha', kategori: 'Alan', sembol: 'ha', donusum_faktoru: 10000.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 ha = 10.000 m²' },
    { ad: 'Dönüm', kisa_ad: 'dnm', kategori: 'Alan', sembol: 'dönüm', donusum_faktoru: 1000.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 dönüm = 1000 m²' },

    // Hacim & Sıvı Birimleri
    { ad: 'Litre', kisa_ad: 'L', kategori: 'Hacim', sembol: 'L', donusum_faktoru: 1.0, temel_birim_mi: 1, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: 'Kategori temel birimi' },
    { ad: 'Mililitre', kisa_ad: 'ml', kategori: 'Hacim', sembol: 'ml', donusum_faktoru: 0.001, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 L = 1000 ml' },
    { ad: 'Santilitre', kisa_ad: 'cl', kategori: 'Hacim', sembol: 'cl', donusum_faktoru: 0.01, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 L = 100 cl' },
    { ad: 'Metreküp', kisa_ad: 'm³', kategori: 'Hacim', sembol: 'm³', donusum_faktoru: 1000.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 3, aciklama: '1 m³ = 1000 Litre' },
    { ad: 'Desimetreküp', kisa_ad: 'dm³', kategori: 'Hacim', sembol: 'dm³', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 dm³ = 1 Litre' },
    { ad: 'Galon', kisa_ad: 'gal', kategori: 'Hacim', sembol: 'gal', donusum_faktoru: 3.78541, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 3, aciklama: 'US Galon ≈ 3.785 L' },

    // Adet / Ambalaj / Sayısal Birimler
    { ad: 'Adet', kisa_ad: 'ad', kategori: 'Adet/Miktar', sembol: 'ad', donusum_faktoru: 1.0, temel_birim_mi: 1, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Temel adet birimi' },
    { ad: 'Deste', kisa_ad: 'dst', kategori: 'Adet/Miktar', sembol: 'deste', donusum_faktoru: 10.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: '1 deste = 10 adet' },
    { ad: 'Düzine', kisa_ad: 'dz', kategori: 'Adet/Miktar', sembol: 'düzine', donusum_faktoru: 12.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: '1 düzine = 12 adet' },
    { ad: 'Paket', kisa_ad: 'pkt', kategori: 'Adet/Miktar', sembol: 'pkt', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Ambalaj birimi' },
    { ad: 'Koli', kisa_ad: 'kl', kategori: 'Adet/Miktar', sembol: 'koli', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Ambalaj koli birimi' },
    { ad: 'Kutu', kisa_ad: 'kt', kategori: 'Adet/Miktar', sembol: 'kutu', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Kutu birimi' },
    { ad: 'Takım', kisa_ad: 'tkm', kategori: 'Adet/Miktar', sembol: 'takım', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Set / Takım birimi' },
    { ad: 'Çift', kisa_ad: 'çft', kategori: 'Adet/Miktar', sembol: 'çift', donusum_faktoru: 2.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: '1 çift = 2 adet' },
    { ad: 'Set', kisa_ad: 'set', kategori: 'Adet/Miktar', sembol: 'set', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Set birimi' },
    { ad: 'Rulo', kisa_ad: 'rulo', kategori: 'Adet/Miktar', sembol: 'rulo', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Rulo birimi' },
    { ad: 'Top', kisa_ad: 'top', kategori: 'Adet/Miktar', sembol: 'top', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Kağıt / Kumaş topu' },
    { ad: 'Torba', kisa_ad: 'trb', kategori: 'Adet/Miktar', sembol: 'torba', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Torba ambalaj' },
    { ad: 'Çuval', kisa_ad: 'çvl', kategori: 'Adet/Miktar', sembol: 'çuval', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Çuval birimi' },
    { ad: 'Bidon', kisa_ad: 'bdn', kategori: 'Adet/Miktar', sembol: 'bidon', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Bidon birimi' },
    { ad: 'Varil', kisa_ad: 'vrl', kategori: 'Adet/Miktar', sembol: 'varil', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Varil birimi' },
    { ad: 'Damacana', kisa_ad: 'dmc', kategori: 'Adet/Miktar', sembol: 'damacana', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Damacana birimi' },
    { ad: 'Kasa', kisa_ad: 'ksa', kategori: 'Adet/Miktar', sembol: 'kasa', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Kasa birimi' },
    { ad: 'Kova', kisa_ad: 'kva', kategori: 'Adet/Miktar', sembol: 'kova', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Kova birimi' },
    { ad: 'Tüp', kisa_ad: 'tüp', kategori: 'Adet/Miktar', sembol: 'tüp', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Tüp birimi' },
    { ad: 'Şişe', kisa_ad: 'şş', kategori: 'Adet/Miktar', sembol: 'şişe', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Şişe birimi' },
    { ad: 'Kavanoz', kisa_ad: 'kvz', kategori: 'Adet/Miktar', sembol: 'kavanoz', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Kavanoz birimi' },
    { ad: 'Plaka', kisa_ad: 'plk', kategori: 'Adet/Miktar', sembol: 'plaka', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Plaka / Levha' },
    { ad: 'Tabaka', kisa_ad: 'tbk', kategori: 'Adet/Miktar', sembol: 'tabaka', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Tabaka birimi' },

    // Zaman / Süre Birimleri
    { ad: 'Saat', kisa_ad: 'sa', kategori: 'Zaman', sembol: 'sa', donusum_faktoru: 1.0, temel_birim_mi: 1, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: 'Kategori temel birimi' },
    { ad: 'Dakika', kisa_ad: 'dk', kategori: 'Zaman', sembol: 'dk', donusum_faktoru: 0.01666667, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 sa = 60 dk' },
    { ad: 'Gün', kisa_ad: 'gün', kategori: 'Zaman', sembol: 'gün', donusum_faktoru: 24.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 gün = 24 saat' },
    { ad: 'Hafta', kisa_ad: 'hf', kategori: 'Zaman', sembol: 'hafta', donusum_faktoru: 168.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 hafta = 7 gün = 168 saat' },
    { ad: 'Ay', kisa_ad: 'ay', kategori: 'Zaman', sembol: 'ay', donusum_faktoru: 720.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 ay ≈ 30 gün = 720 saat' },
    { ad: 'Yıl', kisa_ad: 'yıl', kategori: 'Zaman', sembol: 'yıl', donusum_faktoru: 8760.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: '1 yıl = 365 gün = 8760 saat' },
    { ad: 'Sefer', kisa_ad: 'sfr', kategori: 'Zaman', sembol: 'sefer', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Sefer / Tur başı' },
    { ad: 'Periyot', kisa_ad: 'per', kategori: 'Zaman', sembol: 'periyot', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Dönemsel periyot' },

    // Sıcaklık Birimleri
    { ad: 'Santigrat', kisa_ad: '°C', kategori: 'Sıcaklık', sembol: '°C', donusum_faktoru: 1.0, temel_birim_mi: 1, donusum_tipi: 'formula', ondalik_basamak: 2, aciklama: 'Kategori temel birimi' },
    { ad: 'Fahrenhayt', kisa_ad: '°F', kategori: 'Sıcaklık', sembol: '°F', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'formula', ondalik_basamak: 2, aciklama: '(°C × 9/5) + 32' },
    { ad: 'Kelvin', kisa_ad: 'K', kategori: 'Sıcaklık', sembol: 'K', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'formula', ondalik_basamak: 2, aciklama: '°C + 273.15' },

    // Elektrik & Enerji Birimleri
    { ad: 'Kilowatt', kisa_ad: 'kW', kategori: 'Elektrik/Enerji', sembol: 'kW', donusum_faktoru: 1.0, temel_birim_mi: 1, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: 'Güç birimi' },
    { ad: 'Kilovar', kisa_ad: 'kVAR', kategori: 'Elektrik/Enerji', sembol: 'kVAR', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 2, aciklama: 'Reaktif güç birimi' },

    // Hizmet / Diğer Birimler
    { ad: 'Kişi', kisa_ad: 'kişi', kategori: 'Hizmet/Diğer', sembol: 'kişi', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Personel / katılımcı birimi' },
    { ad: 'Öğün', kisa_ad: 'öğün', kategori: 'Hizmet/Diğer', sembol: 'öğün', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Yemek / öğün birimi' },
    { ad: 'Porsiyon', kisa_ad: 'prs', kategori: 'Hizmet/Diğer', sembol: 'porsiyon', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Porsiyon birimi' },
    { ad: 'Bakım', kisa_ad: 'bkm', kategori: 'Hizmet/Diğer', sembol: 'bakım', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Periyodik bakım birimi' },
    { ad: 'Test', kisa_ad: 'tst', kategori: 'Hizmet/Diğer', sembol: 'test', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Laboratuvar / analiz testi' },
    { ad: 'Ölçüm', kisa_ad: 'ölç', kategori: 'Hizmet/Diğer', sembol: 'ölçüm', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Ölçüm ve muayene' },
    { ad: 'Puan', kisa_ad: 'pn', kategori: 'Hizmet/Diğer', sembol: 'puan', donusum_faktoru: 1.0, temel_birim_mi: 0, donusum_tipi: 'linear', ondalik_basamak: 0, aciklama: 'Puan / derece birimi' }
  ]
}
