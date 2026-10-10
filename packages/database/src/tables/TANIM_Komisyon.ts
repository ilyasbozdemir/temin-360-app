export const TANIM_Komisyon = {
  name: 'TANIM_Komisyon',
  description: 'Kullanıcı tarafından oluşturulan bağımsız komisyonlar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ad', type: 'TEXT', notNull: true, description: 'Adı' }, // Örn: Fiyat Araştırma Komisyonu
    { name: 'tur', type: 'TEXT', description: 'Komisyon Türü Kodu (Örn: yaklasik_maliyet, muayene_kabul, ihale_komisyonu)' },
    { name: 'aciklama', type: 'TEXT', description: 'Aciklama' },
    { name: 'aktif_mi', type: 'INTEGER', default: 1, description: 'Aktif mı?' },
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
    { ad: 'Yaklaşık Maliyet Tespit Komisyonu', tur: 'yaklasik_maliyet' },
    { ad: 'Muayene Kabul ve Tespit Komisyonu', tur: 'muayene_kabul' }
  ]
}
