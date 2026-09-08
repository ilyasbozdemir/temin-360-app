export const TANIM_Kalem = {
  name: 'TANIM_Kalem',
  description: 'Ortak malzeme, hizmet ve yapım işleri havuzu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'eski_id', type: 'TEXT', description: 'Eski ID' },
    { name: 'barkod_id', type: 'TEXT', unique: true, notNull: true, description: 'Barkod ID' },
    { name: 'tasinir_kodu', type: 'TEXT', description: 'Tasinir Kodu' },
    { name: 'okas_kodu', type: 'TEXT', description: 'Okas Kodu' },
    { name: 'kalem_adi', type: 'TEXT', notNull: true, description: 'Kalem Adi' },
    { name: 'tipi', type: 'TEXT', notNull: true, default: "'Mal'", description: 'Tipi' }, // Mal, Hizmet, Personel, Hizmet, Diğer, Yapım
    { name: 'birim', type: 'TEXT', default: "'Adet'", description: 'Birim' },
    { name: 'kategori', type: 'TEXT', description: 'Kategori' },
    { name: 'ozelligi', type: 'TEXT', description: 'Ozelligi' },
    { name: 'kdv_orani', type: 'REAL', default: 20, description: 'Kdv Orani' },
    { name: 'mensei', type: 'TEXT', description: 'Mensei' }, // Yerli, Yabancı
    { name: 'is_personel', type: 'INTEGER', default: 0, description: 'Is Personel' },
    {
      name: 'personel_asgari_fark_oran',
      type: 'REAL',
      default: 0,
      description: 'Personel Asgari Fark Oran'
    },
    { name: 'poz_no', type: 'TEXT', description: 'Poz No (Yapım İşi)' },
    { name: 'poz_yili', type: 'INTEGER', description: 'Poz Yılı (Yapım İşi)' },
    { name: 'poz_tanimi', type: 'TEXT', description: 'Poz Tanımı / Açıklaması' },
    { name: 'poz_grubu_ref_id', type: 'TEXT', description: 'Poz Grubu Kalıcı Referans ID' },
    { name: 'olcu_birimi', type: 'TEXT', description: 'Ölçü Birimi' },
    { name: 'yapi_sinifi', type: 'TEXT', description: 'Yapı Sınıfı / İş Grubu' },
    { name: 'hizmet_kodu', type: 'TEXT', description: 'Hizmet Kodu' },
    { name: 'hizmet_sinifi', type: 'TEXT', description: 'Hizmet Sınıfı' },
    { name: 'sure', type: 'TEXT', description: 'Hizmet Süresi' },
    { name: 'personel_sayisi', type: 'INTEGER', description: 'Personel Sayısı' },
    { name: 'meslek_kodu', type: 'TEXT', description: 'Meslek Kodu' },
    { name: 'fiyat_donemi', type: 'TEXT', description: 'Fiyat / Araştırma Dönemi (Örn: 2026-08)' },
    { name: 'gorsel_url', type: 'TEXT', description: 'Ürün / Kalem Görseli (Base64 / URL)' },
    { name: 'gorseller', type: 'TEXT', description: 'Ek Görseller (JSON Array)' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mı?' },
    { name: 'notlar', type: 'TEXT', description: 'Notlar' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Updated At'
    }
  ],
  initialData: []
}
