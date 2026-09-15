export const TANIM_Proje = {
  name: 'TANIM_Proje',
  description: 'Yatırım ve alım projeleri üst grubu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'proje_kodu', type: 'TEXT', notNull: true, unique: true, description: 'Proje Kodu (Örn: PRJ-2026-001)' },
    { name: 'proje_adi', type: 'TEXT', notNull: true, description: 'Proje Adı' },
    { name: 'aciklama', type: 'TEXT', description: 'Proje Açıklaması' },
    { name: 'toplam_butce', type: 'REAL', default: 0, description: 'Toplam Bütçe' },
    { name: 'baslangic_tarihi', type: 'DATE', description: 'Başlangıç Tarihi' },
    { name: 'bitis_tarihi', type: 'DATE', description: 'Bitiş Tarihi' },
    { name: 'lokasyon', type: 'TEXT', description: 'Yapı / Lokasyon Adı' },
    { name: 'durum', type: 'TEXT', notNull: true, default: "'devam'", description: 'planlama | devam | tamamlandi' },
    { name: 'renk', type: 'TEXT', default: "'#3b82f6'", description: 'Proje Rengi' },
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
  initialData: [
    {
      id: 1,
      proje_kodu: 'PRJ-2026-001',
      proje_adi: 'Genel İdari ve Bakım-Onarım İhtiyaçları',
      aciklama: 'Kurum genel idari ve teknik doğrudan temin alımları',
      toplam_butce: 1000000,
      durum: 'devam',
      renk: '#3b82f6',
      aktif_mi: 1
    }
  ]
}
