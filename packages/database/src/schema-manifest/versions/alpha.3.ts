/* eslint-disable */
export default {
  app: "1.0.0-alpha.3",
  schema_min: 1,
  schema_max: 6,
  release_date: "2026-05-25",
  changes: [
    { schema: 3, type: "addColumn", description: "Birim-Personel iliskisi kuruldu", columns_added: [{ table: "TANIM_Birim", column: "ilgili_personel_id" }] },
    { schema: 4, type: "addColumn", description: "Kurum turu alani eklendi", columns_added: [{ table: "settings", column: "kurumTuru" }] },
    { schema: 5, type: "addTable", description: "Sablon sistemi eklendi", tables_added: ["TANIM_Sablon", "TANIM_Placeholder"] },
    { schema: 6, type: "addTable", description: "Alim turu-sablon esleme tablolari", tables_added: ["TANIM_AlimTuru_Sablon", "SABLON_Placeholder"] },
  ],
};
