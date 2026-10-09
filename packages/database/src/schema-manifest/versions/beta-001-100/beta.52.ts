/* eslint-disable */
export default {
  app: "1.0.0-beta.52",
  schema_min: 1,
  schema_max: 29,
  release_date: "2026-07-15",
  changes: [
    {
      schema: 29, type: "alter",
      description: "DATA_TeminDosyasi tablosuna yaklasik_maliyet_kdv_dahil_mi kolonu eklendi, Birim Ihtiyac Yerleri (ihtiyac_yeri_eki) alanlarinin JSON dizi yapisi olarak saklanmasi saglandi.",
      columns_added: [
        { table: "DATA_TeminDosyasi", column: "yaklasik_maliyet_kdv_dahil_mi" },
        { table: "TANIM_Birim", column: "ihtiyac_yeri_eki" },
      ],
    },
  ],
};
