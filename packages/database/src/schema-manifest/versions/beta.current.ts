/* eslint-disable */
/**
 * AKTİF GELİŞTİRME ŞEMA MANİFESTİ (1.0.0-beta.current)
 * DATA_TeminDosyasi tablosuna komisyon_seed_edildi kolonu ve DATA_TeminKomisyon tablosuna kaynak kolonu eklendi.
 */
export default {
  app: "1.0.0-beta.current",
  schema_min: 1,
  schema_max: 43,
  release_date: "2026-10-10",
  changes: [
    {
      schema: 43,
      type: "update",
      description: "DATA_TeminDosyasi tablosuna komisyon_seed_edildi kolonu ve DATA_TeminKomisyon tablosuna kaynak kolonu eklendi.",
      columns_added: [
        { table: "DATA_TeminDosyasi", column: "komisyon_seed_edildi" },
        { table: "DATA_TeminKomisyon", column: "kaynak" }
      ]
    }
  ]
};
