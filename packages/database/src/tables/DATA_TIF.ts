export const DATA_TIF = {
  name: 'DATA_TIF',
  description: 'Taşınır İşlem Fişleri (Giriş/Çıkış)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_dosya_id', type: 'INTEGER', notNull: true, description: 'Temin dosyası FK' },
    { name: 'dosya_id', type: 'INTEGER', description: 'Geriye dönük uyumluluk için temin_dosya_id alias' },
    { name: 'ambar_id', type: 'INTEGER', notNull: true, description: 'Ambar FK' },
    { name: 'fis_no', type: 'TEXT', description: 'Fiş numarası (otomatik üretilir)' },
    { name: 'fis_tarihi', type: 'TEXT', description: 'Fiş tarihi (YYYY-MM-DD)' },
    { name: 'fis_turu', type: 'TEXT', notNull: true, default: "'giris'", description: 'giris | cikis' },
    { name: 'aciklama', type: 'TEXT', description: 'Açıklama / not' },
    { name: 'olusturan_personel_id', type: 'INTEGER', description: 'Oluşturan personel FK' },
    { name: 'durum', type: 'TEXT', notNull: true, default: "'taslak'", description: 'taslak | onaylandi' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Oluşturma tarihi'
    }
  ],
  initialData: []
}
