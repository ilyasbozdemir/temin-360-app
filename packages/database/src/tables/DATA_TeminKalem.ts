export const DATA_TeminKalem = {
  name: 'DATA_TeminKalem',
  description: 'Dosyaya bağlı malzeme, hizmet veya yapım işi kalemleri',
  columns: [
    {
      name: 'id',
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true,
      description: 'Sıra / ID'
    },
    {
      name: 'temin_dosya_id',
      type: 'INTEGER',
      notNull: true,
      description: 'Bağlı Olduğu Dosya ID'
    },
    { name: 'barkod_id', type: 'TEXT', description: 'Barkod ID' },
    { name: 'tasinir_kodu', type: 'TEXT', description: 'Taşınır Kodu' },
    { name: 'okas_kodu', type: 'TEXT', description: 'OKAS Kodu' },
    { name: 'kalem_adi', type: 'TEXT', notNull: true, description: 'Malzeme / Hizmet / İş Adı' },
    {
      name: 'tipi',
      type: 'TEXT',
      notNull: true,
      default: "'Mal'",
      description: 'Alım Tipi (Mal/Hizmet/Yapım/Danışmanlık)'
    }, // Mal | Hizmet | Yapım | Danışmanlık
    {
      name: 'birim',
      type: 'TEXT',
      default: "'Adet'",
      description: 'Ölçü Birimi (Adet, Kg, Lt vb.)'
    },
    { name: 'miktar', type: 'REAL', notNull: true, default: 1, description: 'Miktar' },
    { name: 'kdv_orani', type: 'REAL', default: 20, description: 'KDV Oranı (%)' },
    { name: 'aciklama', type: 'TEXT', description: 'Kalem Açıklaması' },
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
  constraints: ['FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE CASCADE'],
  initialData: []
}
