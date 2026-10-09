/* eslint-disable */
export default {
  app: "1.0.0-beta.54",
  schema_min: 1,
  schema_max: 30,
  release_date: "2026-07-18",
  changes: [
    {
      schema: 30, type: "alter",
      description: "DATA_TeminBelge tablosuna veri_json kolonu eklendi",
      columns_added: [{ table: "DATA_TeminBelge", column: "veri_json" }],
    },
  ],
};
