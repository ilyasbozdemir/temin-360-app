export const TANIM_SurecTaslak = {
  name: 'TANIM_SurecTaslak',
  description: 'Özel İşlem Taslakları (Hızlı Erişim ve Atlanan Evraklar Konfigürasyonu)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'taslak_adi', type: 'TEXT', notNull: true, description: 'Taslak Adi' },
    { name: 'tur', type: 'TEXT', description: 'Tur' }, // Hangi alım türüne ait taslak olduğu
    { name: 'ordered_docs', type: 'TEXT', description: 'Ordered Docs' }, // JSON array of strings (belge sıralaması)
    { name: 'starred_docs', type: 'TEXT', description: 'Starred Docs' }, // JSON array of strings
    { name: 'skipped_docs', type: 'TEXT', description: 'Skipped Docs' }, // JSON array of strings
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
  initialData: [
    {
      taslak_adi: 'Mal Alımı Süreç Belgeleri',
      tur: 'Mal Alımı',
      ordered_docs: JSON.stringify([
        'İhtiyaç Listesi',
        'Lüzum Müzekkeresi Belgesi',
        'Lüzum Onay Eki',
        'İstekli Tedarikçi Firmalar',
        'Yaklaşık Maliyet Hesap Cetveli',
        'Fiyat Araştırma Komisyonu Atama',
        'Piyasa Fiyat Araştırma Tutanağı',
        'Doğrudan Temin Onay Belgesi',
        'Muayene Kabul Komisyonu Atama',
        'Teslim Tesellüm Belgesi',
        'Bütçe Sorgusu',
        'Harcama Talimatı',
        'Harcama Pusulası'
      ]),
      starred_docs: JSON.stringify([]),
      skipped_docs: JSON.stringify([])
    }
  ]
}
