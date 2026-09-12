export const DATA_TeminKomisyon = {
  name: 'DATA_TeminKomisyon',
  description: 'Dosyada görevlendirilen komisyon üyeleri',
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
    {
      name: 'dosya_id',
      type: 'INTEGER',
      description: 'Geriye dönük uyumluluk için temin_dosya_id alias'
    },
    { name: 'komisyon_id', type: 'INTEGER', notNull: true, description: 'Komisyon ID' }, // Hangi tip komisyon (Fiyat Araştırma, Muayene Kabul vb)
    { name: 'personel_id', type: 'INTEGER', notNull: true, description: 'Personel ID' },
    { name: 'ad_soyad', type: 'TEXT', notNull: true, description: 'Üyenin Adı Soyadı' },
    { name: 'unvan', type: 'TEXT', description: 'Üyenin Unvanı' },
    { name: 'gorev', type: 'TEXT', description: 'Görevi (Başkan / Üye)' }, // Başkan, Üye vb.
    { name: 'rol', type: 'TEXT', description: 'Asil / Yedek Durumu' }, // Asil, Yedek vb.
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
  constraints: [
    'FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE CASCADE',
    'FOREIGN KEY(personel_id) REFERENCES TANIM_Personel(id) ON DELETE CASCADE'
  ],
  initialData: []
}
