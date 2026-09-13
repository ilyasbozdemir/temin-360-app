export const TANIM_Komisyon = {
  name: 'TANIM_Komisyon',
  description: 'Kullanıcı tarafından oluşturulan bağımsız komisyonlar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ad', type: 'TEXT', notNull: true, description: 'Adı' }, // Örn: Fiyat Araştırma Komisyonu
    { name: 'aciklama', type: 'TEXT', description: 'Aciklama' },
    { name: 'aktif_mi', type: 'BOOLEAN', default: 1, description: 'Aktif mı?' },
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
  constraints: ['UNIQUE(ad)'],
  initialData: [
    { ad: 'Yaklaşık Maliyet Tespit Komisyonu' },
    { ad: 'Muayene Kabul ve Tespit Komisyonu' }
  ]
}
