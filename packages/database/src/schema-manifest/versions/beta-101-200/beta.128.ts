/* eslint-disable */
export default {
  app: "1.0.0-beta.128",
  schema_min: 1,
  schema_max: 33,
  release_date: "2026-09-17",
  changes: [
    {
      schema: 33, type: "alter",
      description: "TANIM_KomisyonUye tablosuna sira (siralama) kolonu eklendi",
      columns_added: [{ table: "TANIM_KomisyonUye", column: "sira" }],
    },
  ],
};
