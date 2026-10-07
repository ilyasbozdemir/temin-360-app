export const TANIM_Poz = {
  name: 'TANIM_Poz',
  description: 'Birim fiyat ve poz kataloğu (Yapım ve hizmet işleri poz tanımları)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'poz_no', type: 'TEXT', notNull: true, description: 'Poz Numarası' },
    { name: 'tanim', type: 'TEXT', notNull: true, description: 'Poz Tanımı / Açıklaması' },
    { name: 'birim', type: 'TEXT', default: "'Adet'", description: 'Ölçü Birimi' },
    { name: 'birim_fiyat', type: 'REAL', default: 0, description: 'Birim Fiyat' },
    { name: 'kurum_adi', type: 'TEXT', description: 'Kurum Adı (ÇSB, DSİ, Karayolları vb.)' },
    { name: 'yil', type: 'INTEGER', description: 'Yıl' },
    { name: 'tipi', type: 'TEXT', default: "'Yapım'", description: 'Poz Tipi' },
    { name: 'kitabiyat', type: 'TEXT', description: 'Kitap / Analiz Detayı' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mi?' },
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
  initialData: []
}
