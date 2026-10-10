/* eslint-disable */
/**
 * AKTİF GELİŞTİRME ŞEMA MANİFESTİ (1.0.0-beta.current)
 * TANIM_Komisyon tablosuna tur kolonu eklendi, TANIM_KomisyonGorevi tablosuna rol_kodu kolonu eklendi.
 */
export default {
  app: "1.0.0-beta.236",
  schema_min: 1,
  schema_max: 42,
  release_date: "2026-10-10",
  changes: [
    {
      schema: 42,
      type: "update",
      description: "TANIM_Komisyon tablosuna tur kolonu ve TANIM_KomisyonGorevi tablosuna rol_kodu kolonu eklendi.",
      columns_added: [
        { table: "TANIM_Komisyon", column: "tur" },
        { table: "TANIM_KomisyonGorevi", column: "rol_kodu" }
      ],
      raw_sql: [
        "ALTER TABLE TANIM_Komisyon ADD COLUMN tur TEXT DEFAULT 'yaklasik_maliyet';",
        "UPDATE TANIM_Komisyon SET tur = 'yaklasik_maliyet' WHERE (tur IS NULL OR tur = '') AND (ad LIKE '%Piyasa%' OR ad LIKE '%Maliyet%');",
        "UPDATE TANIM_Komisyon SET tur = 'muayene_kabul' WHERE (tur IS NULL OR tur = '') AND (ad LIKE '%Muayene%' OR ad LIKE '%Kabul%');",
        "ALTER TABLE TANIM_KomisyonGorevi ADD COLUMN rol_kodu TEXT DEFAULT 'komisyon_uyesi';",
        "UPDATE TANIM_KomisyonGorevi SET rol_kodu = 'komisyon_baskani' WHERE (rol_kodu IS NULL OR rol_kodu = '' OR rol_kodu = 'komisyon_uyesi') AND (ad LIKE '%Başkan%' OR ad LIKE '%Baskan%');",
        "UPDATE TANIM_KomisyonGorevi SET rol_kodu = 'harcama_yetkilisi' WHERE (rol_kodu IS NULL OR rol_kodu = '' OR rol_kodu = 'komisyon_uyesi') AND ad LIKE '%Harcama%';",
        "UPDATE TANIM_KomisyonGorevi SET rol_kodu = 'gerceklestirme_gorevlisi' WHERE (rol_kodu IS NULL OR rol_kodu = '' OR rol_kodu = 'komisyon_uyesi') AND (ad LIKE '%Gerçekleştirme%' OR ad LIKE '%Gerceklestirme%');",
        "UPDATE TANIM_KomisyonGorevi SET rol_kodu = 'muhasebe' WHERE (rol_kodu IS NULL OR rol_kodu = '' OR rol_kodu = 'komisyon_uyesi') AND ad LIKE '%Muhasebe%';"
      ]
    }
  ]
};
