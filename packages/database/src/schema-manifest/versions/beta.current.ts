/* eslint-disable */
/**
 * AKTİF GELİŞTİRME ŞEMA MANİFESTİ (1.0.0-beta.current)
 * Sürüm yayını / commit anına kadar yeni tablo ve sütun değişiklikleri burada toplanır.
 */
export default {
  app: "1.0.0-beta.current",
  schema_min: 1,
  schema_max: 40,
  release_date: "2026-10-07",
  changes: [
    {
      schema: 40,
      type: "update",
      description: "TANIM_Poz (Yapım ve hizmet birim fiyat / poz kataloğu) tablosunun veritabanı şemasına eklenmesi",
      tables_added: ["TANIM_Poz"],
      raw_sql: [
        "CREATE TABLE IF NOT EXISTS TANIM_Poz (id INTEGER PRIMARY KEY AUTOINCREMENT, poz_no TEXT NOT NULL, tanim TEXT NOT NULL, birim TEXT DEFAULT 'Adet', birim_fiyat REAL DEFAULT 0, kurum_adi TEXT, yil INTEGER, tipi TEXT DEFAULT 'Yapım', kitabiyat TEXT, aktif_mi INTEGER NOT NULL DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
      ]
    }
  ]
};
