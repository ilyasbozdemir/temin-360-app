export const DATA_DosyaSablonVeri = {
  name: 'DATA_DosyaSablonVeri',
  description: 'Her şablon ve dosya için alınan belge anlık görüntüsü (snapshot) verilerini tutar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_dosya_id', type: 'INTEGER', notNull: true, description: 'Temin Dosyası ID' },
    { name: 'dosya_id', type: 'INTEGER', description: 'Geriye dönük uyumluluk için temin_dosya_id alias' },
    { name: 'sablon_id', type: 'INTEGER', description: 'Şablon ID (TANIM_Sablon referansı)' },
    { name: 'sablon_kodu', type: 'TEXT', description: 'Şablon Kodu / Slug (Örn: dogrudan-temin-sozlesmesi)' },
    { name: 'veri_json', type: 'TEXT', notNull: true, description: 'Anlık Görüntü JSON verisi' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Oluşturulma Tarihi'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Güncellenme Tarihi'
    }
  ],
  constraints: [
    'FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE CASCADE',
    'UNIQUE(temin_dosya_id, sablon_id)',
    'UNIQUE(temin_dosya_id, sablon_kodu)'
  ],
  initialData: []
}
