export const DATA_TeminFirma = {
  name: 'DATA_TeminFirma',
  description: 'Dosyaya davet edilen veya teklif veren istekli firmalar',
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
    { name: 'firma_id', type: 'INTEGER', notNull: true, description: 'Firma ID' },
    { name: 'unvan', type: 'TEXT', notNull: true, description: 'Firma Unvanı' },
    { name: 'vergi_no', type: 'TEXT', description: 'Vergi Kimlik Numarası / TCKN' },
    { name: 'ilgili_kisi', type: 'TEXT', description: 'İlgili Kişi' },
    { name: 'telefon', type: 'TEXT', description: 'Firma Telefonu' },
    { name: 'email', type: 'TEXT', description: 'Firma E-Posta Adresi' },
    { name: 'davet_edildi_mi', type: 'INTEGER', default: 1, description: 'Davet Edildi mi?' },
    { name: 'teklif_verdi_mi', type: 'INTEGER', default: 0, description: 'Teklif Verdi mi?' },
    { name: 'teklif_toplami', type: 'REAL', description: 'Firmanın Toplam Teklif Tutarı' },
    { name: 'kazandi_mi', type: 'INTEGER', default: 0, description: 'İhale Bu Firmada mı Kaldı?' },
    {
      name: 'teklif_durumu',
      type: 'TEXT',
      default: "'Davet Edildi'",
      description: 'Teklif Durumu'
    },
    { name: 'davet_tarihi', type: 'DATE', description: 'Davet Tarihi' },
    { name: 'teklif_tarihi', type: 'DATE', description: 'Teklif Tarihi' },
    { name: 'teslim_suresi', type: 'TEXT', description: 'Teslim Süresi' },
    { name: 'para_birimi', type: 'TEXT', default: "'TRY'", description: 'Para Birimi' },
    { name: 'aktif_mi', type: 'INTEGER', default: 1, description: 'Kayıt Aktif mi?' },
    {
      name: 'yasaklilik_durumu',
      type: 'TEXT',
      default: "'Sorgulanmadı'",
      description: 'Yasaklılık Durumu'
    },
    { name: 'yasaklilik_belgesi', type: 'TEXT', description: 'Yasaklılık Belgesi' },
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
    'FOREIGN KEY(firma_id) REFERENCES TANIM_Firma(id) ON DELETE CASCADE'
  ],
  initialData: []
}
