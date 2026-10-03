/* eslint-disable */
export default {
  app: "1.0.0-beta.224",
  schema_min: 1,
  schema_max: 38,
  release_date: "2026-10-03",
  changes: [
    {
      schema: 38,
      type: "update",
      description: "Şablon görünürlük tek kaynak (visibility.config) mimarisi, veritabanı sağlık aracı ve veri onarım adımları",
      raw_sql: [
        "UPDATE DATA_TeminKomisyon SET belgede_goster = 1 WHERE (belge_kapsami IS NULL OR belge_kapsami != 'gizli') AND (belgede_goster = 0 OR belgede_goster IS NULL);",
        "UPDATE TANIM_KomisyonUye SET belgede_goster = 1 WHERE (belge_kapsami IS NULL OR belge_kapsami != 'gizli') AND (belgede_goster = 0 OR belgede_goster IS NULL);",
        "UPDATE DATA_TeminKomisyon SET hedef_belgeler = '[\"*\"]' WHERE hedef_belgeler IS NULL OR hedef_belgeler = '' OR json_valid(hedef_belgeler) = 0;",
        "UPDATE TANIM_KomisyonUye SET hedef_belgeler = '[\"*\"]' WHERE hedef_belgeler IS NULL OR hedef_belgeler = '' OR json_valid(hedef_belgeler) = 0;"
      ]
    }
  ]
};
