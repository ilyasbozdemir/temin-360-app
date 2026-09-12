export const DATA_TeminKalemTeklif = {
  name: 'DATA_TeminKalemTeklif',
  description: 'İstekli firmaların her bir kaleme verdiği teklif fiyatları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_dosya_id', type: 'INTEGER', notNull: true, description: 'Temin Dosya ID' },
    { name: 'dosya_id', type: 'INTEGER', description: 'Geriye dönük uyumluluk için temin_dosya_id alias' },
    { name: 'temin_kalem_id', type: 'INTEGER', notNull: true, description: 'Temin Kalem ID' },
    { name: 'temin_firma_id', type: 'INTEGER', notNull: true, description: 'Temin Firma ID' },
    { name: 'birim_fiyat', type: 'REAL', notNull: true, default: 0, description: 'Birim Fiyat' },
    { name: 'kdv_tutari', type: 'REAL', default: 0, description: 'Kdv Tutari' },
    { name: 'teklif_verildi_mi', type: 'INTEGER', default: 1, description: 'Teklif Verildi mı?' },
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
    'FOREIGN KEY(temin_kalem_id) REFERENCES DATA_TeminKalem(id) ON DELETE CASCADE',
    'FOREIGN KEY(temin_firma_id) REFERENCES DATA_TeminFirma(id) ON DELETE CASCADE'
  ],
  initialData: []
}
