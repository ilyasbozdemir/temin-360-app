export const TANIM_Personel = {
  name: 'TANIM_Personel',
  description: 'Temin süreçlerinde görev alan kurum personel havuzu',
  columns: [
    {
      name: 'id',
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true,
      description: 'Sıra / ID'
    },
    { name: 'eski_id', type: 'TEXT', description: 'Eski ID' },
    { name: 'ad_soyad', type: 'TEXT', notNull: true, description: 'Personel Adı Soyadı' },
    { name: 'unvan', type: 'TEXT', description: 'Personelin Kadro Unvanı' },
    { name: 'gorev', type: 'TEXT', description: 'Personelin Kurum/İhale Görevi' },
    { name: 'birim', type: 'TEXT', description: 'Birim' },
    { name: 'sicil_no', type: 'TEXT', description: 'Kurum Sicil Numarası' },
    { name: 'telefon', type: 'TEXT', description: 'Telefon Numarası' },
    { name: 'eposta', type: 'TEXT', description: 'E-Posta Adresi' },
    // İmza yetkileri dinamik Roller tablosuna taşındı
    {
      name: 'aktif_mi',
      type: 'INTEGER',
      notNull: true,
      default: 1,
      description: 'Aktif Personel mi?'
    },
    { name: 'notlar', type: 'TEXT', description: 'Notlar' },
    { name: 'avatar', type: 'TEXT', description: 'Profil Resmi (Base64)' },
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
  initialData: []
}
