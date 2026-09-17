/* eslint-disable */
export default {
  app: "1.0.0-alpha.9",
  schema_min: 1,
  schema_max: 14,
  release_date: "2026-06-04",
  changes: [
    {
      schema: 14, type: "create",
      description: "Aktif Dosya Islemleri icin operasyonel DATA_ tablolari eklendi",
      tables_added: ["DATA_TeminKalem", "DATA_TeminFirma", "DATA_TeminKalemTeklif", "DATA_TeminKomisyon", "DATA_TeminBelge"],
    },
  ],
};
