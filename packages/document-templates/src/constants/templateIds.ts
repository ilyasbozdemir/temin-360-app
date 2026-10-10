export const TEMPLATE_ID = {
  IHTIYAC_LISTESI: 'ihtiyac-listesi',
  IHTIYAC_TALEP_FORMU: 'ihtiyac-talep-formu',
  TASINIR_KAYIT_YETKILISI_GORUSU: 'tasinir-kayit-yetkilisi-gorusu',
  HARCAMA_TALIMATI: 'harcama-talimati',
  ONAY_BELGESI: 'onay-belgesi',
  PIYASA_FIYAT_ARASTIRMASI_ONAY_BELGESI: 'piyasa-fiyat-arastirmasi-onay-belgesi',
  KOMISYON_GOREVLENDIRME_ONAYI: 'komisyon-gorevlendirme-onayi',
  KOMISYON_GOREVLENDIRME_ONAYI_EKI: 'komisyon-gorevlendirme-onayi-eki',
  PIYASA_FIYAT_ARASTIRMASI_TUTANAGI: 'piyasa-fiyat-arastirmasi-tutanagi',
  TEKLIF_MEKTUBU_VE_ICMALI: 'teklif-mektubu-ve-icmali',
  YAKLASIK_MALIYET_HESAP_CETVELI: 'yaklasik-maliyet-hesap-cetveli',
  FIRMA_TEKLIF_MEKTUBU_FORMLARI: 'firma-teklif-mektubu-formlari',
  SATIN_ALMA_SIPARIS_MEKTUBU: 'satin-alma-siparis-mektubu',
  HIZMET_ISLERI_SABIT_SOZLESME: 'hizmet-isleri-sabit-sozlesme',
  MUAYENE_KABUL_KOMISYON_GOREVLENDIRME: 'muayene-kabul-komisyon-gorevlendirme',
  MUAYENE_KABUL_TUTANAGI: 'muayene-kabul-tutanagi',
  TESLIM_TESELLUM_TUTANAGI: 'teslim-tesellum-tutanagi',
  FaturaveHarcamaPusulasi: 'FaturaveHarcamaPusulasi',
  ODEME_EMRI_BELGESI: 'odeme-emri-belgesi',
  HARCAMA_PUSULASI: 'harcama-pusulasi',
  DAMGA_VERGISI_KESINTI_TUTANAGI: 'damga-vergisi-kesinti-tutanagi',
  CEZA_VE_KESINTI_TUTANAGI: 'ceza-ve-kesinti-tutanagi'
} as const

export type TemplateId = (typeof TEMPLATE_ID)[keyof typeof TEMPLATE_ID] | (string & {})
