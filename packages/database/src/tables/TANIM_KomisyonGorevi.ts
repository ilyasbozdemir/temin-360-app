export const TANIM_KomisyonGorevi = {
  name: 'TANIM_KomisyonGorevi',
  description: 'Komisyon görev/unvan tanımları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ad', type: 'TEXT', notNull: true, description: 'Adı' },
    { name: 'aciklama', type: 'TEXT', description: 'Aciklama' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mı?' },
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
    { ad: 'Komisyon Başkanı', aciklama: 'Komisyona başkanlık eden asil üye.', aktif_mi: 1 },
    { ad: 'Üye', aciklama: 'Komisyonda görevli asil üye.', aktif_mi: 1 },
    {
      ad: 'Harcama Yetkilisi',
      aciklama: 'Harcama yetkilisi görevini yürüten personel.',
      aktif_mi: 1
    },
    {
      ad: 'Satın Alma Harcama Yetkilisi',
      aciklama: 'Satın alma süreçlerinden sorumlu harcama yetkilisi.',
      aktif_mi: 1
    },
    {
      ad: 'Gerçekleştirme Görevlisi',
      aciklama: 'İşin gerçekleştirilmesinden sorumlu görevli.',
      aktif_mi: 1
    },
    {
      ad: 'Muhasebe Yetkilisi',
      aciklama: 'Ödeme ve muhasebe işlemlerinden sorumlu yetkili.',
      aktif_mi: 1
    },
    {
      ad: 'Fiyat Araştırma Görevlisi',
      aciklama: 'Piyasa fiyat araştırmasını yürüten görevli.',
      aktif_mi: 1
    }
  ]
}
