export const TANIM_Komisyon_Sablon = {
  name: 'TANIM_Komisyon_Sablon',
  description: 'Komisyonlara atanmış şablonlar (Belge çıktıları vb. için)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'komisyon_id', type: 'INTEGER', notNull: true, description: 'Komisyon ID' },
    { name: 'sablon_id', type: 'TEXT', notNull: true, description: 'Sablon Kodu / ID (Örn: piyasa-fiyat-arastirma-tutanagi)' },
    { name: 'belge_turu', type: 'TEXT', description: 'Belge Turu' },
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
    'FOREIGN KEY(komisyon_id) REFERENCES TANIM_Komisyon(id) ON DELETE CASCADE'
  ],
  initialData: []
}
