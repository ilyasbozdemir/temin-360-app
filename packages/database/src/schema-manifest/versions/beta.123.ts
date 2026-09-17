/* eslint-disable */
export default {
  app: "1.0.0-beta.123",
  schema_min: 1,
  schema_max: 32,
  release_date: "2026-09-15",
  changes: [
    {
      schema: 32, type: "alter",
      description: "TANIM_Proje ve DATA_AmbarHareket tablolari eklendi, DATA_TeminDosyasi tablosuna proje ve etiket (tags) alanlari eklendi",
      tables_added: ["TANIM_Proje", "DATA_AmbarHareket"],
      columns_added: [
        { table: "DATA_TeminDosyasi", column: "project_id" },
        { table: "DATA_TeminDosyasi", column: "proje_adi" },
        { table: "DATA_TeminDosyasi", column: "tags" },
      ],
    },
  ],
};
