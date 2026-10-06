export const DATA_DosyaRevizyon = {
  name: 'DATA_DosyaRevizyon',
  description: 'Doküman, cetvel ve şablonların modül bazlı (2886, 4734, Hakediş vb.) tarihsel versiyon ve revizyon geçmişi',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_dosya_id', type: 'INTEGER', notNull: true, description: 'Temin Dosyası ID' },
    { name: 'modul_adi', type: 'TEXT', default: '2886', description: 'Modül Adı (Örn: 2886, 4734, DOGRUDAN_TEMIN, HAKEDIS)' },
    { name: 'surec_kodu', type: 'TEXT', description: 'İhale / Süreç Kodu (Örn: MADDE_35_A, MADDE_35_C, YAKLASIK_MALIYET)' },
    { name: 'belge_kodu', type: 'TEXT', notNull: true, description: 'Belge Kodu / Şablon Adı' },
    { name: 'versiyon', type: 'TEXT', notNull: true, description: 'Versiyon Etiketi (Örn: v1.0, v1.1)' },
    { name: 'baslik', type: 'TEXT', description: 'Revizyon Başlığı / Açıklaması' },
    { name: 'icerik_html', type: 'TEXT', description: 'Metin Doküman HTML İçeriği' },
    { name: 'veri_json', type: 'TEXT', description: 'Formül/Grid ve Değişken JSON Verisi' },
    { name: 'olusturan', type: 'TEXT', description: 'Revizyonu Oluşturan Kullanıcı' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Oluşturulma Tarihi'
    }
  ],
  constraints: [
    'FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE CASCADE'
  ],
  initialData: []
}
