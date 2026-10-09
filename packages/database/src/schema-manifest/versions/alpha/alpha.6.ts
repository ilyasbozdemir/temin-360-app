/* eslint-disable */
export default {
  app: "1.0.0-alpha.6",
  schema_min: 1,
  schema_max: 10,
  release_date: "2026-05-31",
  changes: [
    { schema: 9, type: "create", description: "TANIM_OkasKod tablosu eklendi (OKAS - Ortak Kamu Alimlari Sozlugu)", tables_added: ["TANIM_OkasKod"] },
    { schema: 10, type: "alter", description: "TANIM_Kalem tablosuna okas_kodu kolonu eklendi", columns_added: [{ table: "TANIM_Kalem", column: "okas_kodu" }] },
  ],
};
