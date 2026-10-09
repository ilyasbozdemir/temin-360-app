/* eslint-disable */
export default {
  app: "1.0.0-beta.34",
  schema_min: 1,
  schema_max: 28,
  release_date: "2026-07-08",
  changes: [
    {
      schema: 28, type: "alter",
      description: "TANIM_Sablon tablosuna grup_adi ve grup_siralama kolonlari eklendi - ayni gruptaki sablonlar tek kart altinda birlestirilir",
      columns_added: [
        { table: "TANIM_Sablon", column: "grup_adi" },
        { table: "TANIM_Sablon", column: "grup_siralama" },
      ],
    },
  ],
};
