export const DATA_NotVeGorev = {
  name: 'DATA_NotVeGorev',
  description: 'Dosyalar ve uygulama geneli için notlar, hatırlatıcılar ve yapılacaklar (To-Do) listesi',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'uuid', type: 'TEXT', unique: true, notNull: true, description: 'Benzersiz kayıt UUID' },
    { name: 'temin_dosya_id', type: 'INTEGER', description: 'İlişkili Temin Dosyası ID (Genel notlar için NULL)' },
    { name: 'baslik', type: 'TEXT', notNull: true, description: 'Not / Görev Başlığı' },
    { name: 'icerik', type: 'TEXT', description: 'Not / Görev Detay Açıklaması' },
    { name: 'tip', type: 'TEXT', default: "'todo'", description: "Kayıt Tipi: 'todo' | 'not' | 'hatirlatici'" },
    { name: 'kategori', type: 'TEXT', default: "'Genel'", description: 'Kategori (Genel, İhale, Sözleşme, Fatura, Muayene vb.)' },
    { name: 'oncelik', type: 'TEXT', default: "'orta'", description: "Öncelik: 'dusuk' | 'orta' | 'yuksek' | 'acil'" },
    { name: 'tamamlandi', type: 'INTEGER', default: 0, description: 'Tamamlandı mı: 0 (Bekliyor) veya 1 (Tamamlandı)' },
    { name: 'tamamlanma_tarihi', type: 'DATETIME', description: 'Tamamlanma Zamanı' },
    { name: 'vade_tarihi', type: 'TEXT', description: 'Son Teslim / Vade Tarihi (YYYY-MM-DD)' },
    { name: 'renk', type: 'TEXT', default: "'slate'", description: 'Kart Renk Teması (slate, blue, amber, emerald, purple, rose)' },
    { name: 'sabitlendi', type: 'INTEGER', default: 0, description: 'Başa Sabitlendi mi (1: Evet, 0: Hayır)' },
    { name: 'sira', type: 'INTEGER', default: 0, description: 'Sıralama Sırası' },
    { name: 'etiketler', type: 'TEXT', description: 'Etiketler (JSON formatında dizi)' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', description: 'Oluşturulma Zamanı' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', description: 'Güncellenme Zamanı' }
  ],
  constraints: [
    'FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE SET NULL'
  ],
  initialData: []
}
