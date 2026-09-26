/* eslint-disable */
export default {
  app: "1.0.0-beta.165",
  schema_min: 1,
  schema_max: 34,
  release_date: "2026-09-26",
  changes: [
    {
      schema: 34,
      type: "alter",
      description: "Personel unvan/görev geçmişi tablosu (TANIM_PersonelUnvanGecmisi) ve TANIM_Personel.gorev kolonu eklendi",
      tables_added: ["TANIM_PersonelUnvanGecmisi"],
      columns_added: [
        { table: "TANIM_Personel", column: "gorev" }
      ]
    }
  ]
};
