export const TANIM_KomisyonGorevi = {
  name: 'TANIM_KomisyonGorevi',
  description: 'Komisyon görev/unvan tanımları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ad', type: 'TEXT', notNull: true, description: 'Adı' },
    {
      name: 'rol_kodu',
      type: 'TEXT',
      description: 'Standart Rol Kodu (harcama_yetkilisi, komisyon_baskani, komisyon_uyesi vb.)'
    },
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
    {
      ad: 'Komisyon Başkanı',
      rol_kodu: 'komisyon_baskani',
      aciklama: 'Komisyona başkanlık eden asil üye.',
      aktif_mi: 1
    },
    { ad: 'Üye', rol_kodu: 'komisyon_uyesi', aciklama: 'Komisyonda görevli asil üye.', aktif_mi: 1 },
    {
      ad: 'Harcama Yetkilisi',
      rol_kodu: 'harcama_yetkilisi',
      aciklama: 'Harcama yetkilisi görevini yürüten personel.',
      aktif_mi: 1
    },
    {
      ad: 'Satın Alma Harcama Yetkilisi',
      rol_kodu: 'harcama_yetkilisi',
      aciklama: 'Satın alma süreçlerinden sorumlu harcama yetkilisi.',
      aktif_mi: 1
    },
    {
      ad: 'Gerçekleştirme Görevlisi',
      rol_kodu: 'gerceklestirme_gorevlisi',
      aciklama: 'İşin gerçekleştirilmesinden sorumlu görevli.',
      aktif_mi: 1
    },
    {
      ad: 'Muhasebe Yetkilisi',
      rol_kodu: 'muhasebe',
      aciklama: 'Ödeme ve muhasebe işlemlerinden sorumlu yetkili.',
      aktif_mi: 1
    },
    {
      ad: 'Fiyat Araştırma Görevlisi',
      rol_kodu: 'hazirlayan',
      aciklama: 'Piyasa fiyat araştırmasını yürüten görevli.',
      aktif_mi: 1
    }
  ]
}
