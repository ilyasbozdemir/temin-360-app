export const DATA_TeminBelge = {
  name: 'DATA_TeminBelge',
  description: 'Dosya kapsamında üretilen belgelerin log/geçmiş kaydı',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_dosya_id', type: 'INTEGER', notNull: true, description: 'Temin Dosya ID' },
    { name: 'dosya_id', type: 'INTEGER', description: 'Geriye dönük uyumluluk için temin_dosya_id alias' },
    { name: 'belge_adi', type: 'TEXT', notNull: true, description: 'Belge Adi' },
    { name: 'sablon_id', type: 'INTEGER', description: 'Sablon ID' },
    { name: 'dosya_yolu', type: 'TEXT', description: 'Dosya Yolu' },
    { name: 'is_signed', type: 'INTEGER', default: 0, description: 'Is Signed' },
    { name: 'imzali_dosya_yolu', type: 'TEXT', description: 'Imzali Dosya Yolu' },
    { name: 'olusturan_personel_id', type: 'INTEGER', description: 'Olusturan Personel ID' },
    { name: 'belge_tarihi', type: 'TEXT', description: 'Belge/Tutanak Tarihi' },
    { name: 'veri_json', type: 'TEXT', description: 'Belgeye ait dondurulmus JSON taslagi' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    }
  ],
  constraints: ['FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE CASCADE'],
  initialData: []
}
