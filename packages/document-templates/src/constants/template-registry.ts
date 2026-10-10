import { TemplateCapabilities, TemplateGroup, TemplateType } from "../types";

const DEFAULT_CAPABILITIES: TemplateCapabilities = {
  supportsOlur: false,
  supportsCommission: false,
  supportedCommissionTypes: ["none"],
  supportsPersonnelList: true,
  supportsKalemListesi: true,
  supportsFirmaListesi: false,
};

export type TemplateInput = {
  id: string;
  name: string;
  title: string;
  category: string;
  description?: string;
  group?: TemplateGroup;
  groups?: TemplateGroup[];
  capabilities?: Partial<TemplateCapabilities>;
};

export function defineTemplate(input: TemplateInput): TemplateType {
  const groups = input.groups ?? (input.group ? [input.group] : []);
  return {
    id: input.id,
    name: input.name,
    title: input.title,
    category: input.category,
    description: input.description,
    group: input.group ?? (groups.length > 0 ? groups[0] : undefined),
    groups,
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      ...input.capabilities,
    },
  };
}

export const TEMPLATE_REGISTRY: TemplateType[] = [
  defineTemplate({
    id: "ihtiyac-listesi",
    name: "IhtiyacListesi",
    title: "İhtiyaç Listesi",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    description: "Alımı yapılacak mal/hizmet kalemlerinin detaylı ihtiyaç tablosu",
  }),
  defineTemplate({
    id: "ihtiyac-talep-formu",
    name: "IhtiyacTalepFormu",
    title: "İhtiyaç Talep Formu",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    description: "Birimlerin mal/hizmet taleplerini yetkili makama ilettiği resmi form",
  }),
  defineTemplate({
    id: "tasinir-kayit-yetkilisi-gorusu",
    name: "TasinirKayitYetkilisiGorusu",
    title: "Taşınır Kayıt Yetkilisi Görüşü",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    description: "Stokta malzeme bulunup bulunmadığına ilişkin ambar yetkilisi görüşü",
  }),
  defineTemplate({
    id: "teknik-sartname",
    name: "TeknikSartname",
    title: "Teknik Şartname",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    description: "İşin ve malzemelerin teknik kriterlerini belirleyen doküman",
  }),
  defineTemplate({
    id: "luzum-muzekkeresi",
    name: "LuzumMuzekkeresi",
    title: "Lüzum Müzekkeresi",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    description: "Harcama biriminin alım gerekliliğini onaylatan başlangıç müzekkeresi",
    capabilities: { supportsOlur: true },
  }),
  defineTemplate({
    id: "luzum-muzekkeresi-onay-eki",
    name: "LuzumMuzekkeresiOnayEki",
    title: "Lüzum Müzekkeresi Onay Eki",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    description: "Lüzum müzekkeresine eklenen kalem ve açıklama listesi",
  }),
  defineTemplate({
    id: "luzum-muzekkeresi-teslim-tesellum",
    name: "LuzumMuzekkeresiTeslimTesellum",
    title: "Lüzum Müzekkeresi Teslim Tesellüm",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    group: "muayene_kabul",
    description: "Lüzum müzekkeresi teslim alma ve evrak devir tutanağı",
  }),
  defineTemplate({
    id: "harcama-talimati",
    name: "HarcamaTalimati",
    title: "Harcama Talimatı",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    group: "olur_onay",
    description: "Harcama Yetkilisi tarafından imzalanan alım ve ihale başlatma oluru",
    capabilities: { supportsOlur: true },
  }),
  defineTemplate({
    id: "komisyon-gorevlendirme-onayi",
    name: "KomisyonGorevlendirmeOnayi",
    title: "Komisyon Görevlendirme Onayı",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    groups: ["piyasa_arastirma", "muayene_kabul", "olur_onay"],
    description: "Piyasa Araştırma veya Muayene Kabul Komisyon üyelerinin görevlendirme oluru",
    capabilities: {
      supportsOlur: true,
      supportsCommission: true,
      supportedCommissionTypes: ["piyasa_fiyat", "muayene_kabul", "yaklasik_maliyet", "ihale_komisyonu", "all"],
      supportsKalemListesi: false,
      roleVisibility: {
        harcama_yetkilisi: "show",
        onaylayan: "show",
      },
    },
  }),
  defineTemplate({
    id: "komisyon-gorevlendirme-onayi-eki",
    name: "KomisyonGorevlendirmeOnayiEki",
    title: "Komisyon Görevlendirme Onayı Eki",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    groups: ["piyasa_arastirma", "muayene_kabul", "olur_onay"],
    description: "Görevlendirilen komisyon üyelerinin detaylı görev dağılım listesi",
    capabilities: {
      supportsCommission: true,
      supportedCommissionTypes: ["piyasa_fiyat", "muayene_kabul", "yaklasik_maliyet", "ihale_komisyonu", "all"],
      supportsKalemListesi: false,
      roleVisibility: {
        harcama_yetkilisi: "hide",
        onaylayan: "hide",
      },
    },
  }),
  defineTemplate({
    id: "piyasa-fiyat-arastirma-gorevlendirmesi",
    name: "PiyasaFiyatArastirmaGorevlendirmesi",
    title: "Piyasa Fiyat Araştırma Görevlendirmesi",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    group: "piyasa_arastirma",
    description: "Piyasa fiyat araştırmasını yapmak üzere görevlendirilen personelin olur belgesi",
    capabilities: {
      supportsOlur: true,
      supportsCommission: true,
      supportedCommissionTypes: ["piyasa_fiyat", "yaklasik_maliyet"],
      supportsKalemListesi: false,
      roleVisibility: {
        harcama_yetkilisi: "show",
        onaylayan: "show",
      },
    },
  }),
  defineTemplate({
    id: "son-alim-fiyat-cetveli",
    name: "SonAlimFiyatCetveli",
    title: "Son Alım Fiyat Cetveli",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    group: "piyasa_arastirma",
    description: "Geçmiş alımlara ait birim fiyat ve fatura karşılaştırma cetveli",
    capabilities: { supportsOlur: true },
  }),
  defineTemplate({
    id: "fiyat-arastirma-mektubu",
    name: "FiyatArastirmaMektubu",
    title: "Fiyat Araştırma Mektubu",
    category: "2-piyasa-fiyat-arastirmasi",
    group: "piyasa_arastirma",
    description: "Firmalara teklif sunmaları için gönderilen resmi davet yazısı",
    capabilities: { supportsFirmaListesi: true },
  }),
  defineTemplate({
    id: "birim-fiyat-teklif-mektubu",
    name: "BirimFiyatTeklifMektubu",
    title: "Birim Fiyat Teklif Mektubu",
    category: "2-piyasa-fiyat-arastirmasi",
    group: "piyasa_arastirma",
    description: "Firmaların birim fiyatlarını doldurarak imzaladığı teklif mektubu",
    capabilities: {
      supportsPersonnelList: false,
      supportsFirmaListesi: true,
      roleVisibility: {
        harcama_yetkilisi: "hide",
        onaylayan: "hide",
        hazirlayan: "hide",
      },
    },
  }),
  defineTemplate({
    id: "birim-fiyat-teklif-cetveli",
    name: "BirimFiyatTeklifCetveli",
    title: "Birim Fiyat Teklif Cetveli",
    category: "2-piyasa-fiyat-arastirmasi",
    group: "piyasa_arastirma",
    description: "İsteklilerin kalem bazlı birim fiyatlarını sunduğu detaylı cetvel",
    capabilities: {
      supportsPersonnelList: false,
      supportsFirmaListesi: true,
      roleVisibility: {
        harcama_yetkilisi: "hide",
        onaylayan: "hide",
        hazirlayan: "hide",
      },
    },
  }),
  defineTemplate({
    id: "arastirma-mektubu",
    name: "ArastirmaMektubu",
    title: "Araştırma Mektubu",
    category: "2-piyasa-fiyat-arastirmasi",
    group: "piyasa_arastirma",
    description: "Piyasa araştırması kapsamında gönderilen bilgi ve teklif toplama yazısı",
    capabilities: { supportsFirmaListesi: true },
  }),
  defineTemplate({
    id: "yaklasik-maliyet-cetveli",
    name: "YaklasikMaliyetCetveli",
    title: "Yaklaşık Maliyet Cetveli",
    category: "2-piyasa-fiyat-arastirmasi",
    group: "piyasa_arastirma",
    description: "Toplanan tekliflerden alımın yaklaşık maliyetinin hesaplandığı cetvel",
    capabilities: {
      supportsCommission: true,
      supportedCommissionTypes: ["piyasa_fiyat", "yaklasik_maliyet"],
      supportsFirmaListesi: true,
    },
  }),
  defineTemplate({
    id: "piyasa-fiyat-arastirma-tutanagi",
    name: "PiyasaFiyatArastirmaTutanagi",
    title: "Piyasa Fiyat Araştırma Tutanağı",
    category: "2-piyasa-fiyat-arastirmasi",
    group: "piyasa_arastirma",
    description: "Piyasa fiyat araştırması görevlilerinin teklifleri değerlendirdiği ana tutanak",
    capabilities: {
      supportsOlur: true,
      supportsCommission: true,
      supportedCommissionTypes: ["piyasa_fiyat", "yaklasik_maliyet"],
      supportsFirmaListesi: true,
    },
  }),
  defineTemplate({
    id: "kabul-edilen-teklif",
    name: "KabulEdilenTeklif",
    title: "Kabul Edilen Teklif Bildirimi",
    category: "3-siparis-ve-sozlesme",
    group: "olur_onay",
    description: "En avantajlı teklifi veren firmaya yapılan alım kabul bildirimi",
    capabilities: { supportsFirmaListesi: true },
  }),
  defineTemplate({
    id: "dogrudan-temin-onay-belgesi",
    name: "DogrudanTeminOnayBelgesi",
    title: "Doğrudan Temin Onay Belgesi",
    category: "3-siparis-ve-sozlesme",
    group: "olur_onay",
    description: "Karara bağlanan alımın yetkili makam onay belgesi",
    capabilities: {
      supportsOlur: true,
      supportsFirmaListesi: true,
    },
  }),
  defineTemplate({
    id: "butce-sorgusu",
    name: "ButceSorgusu",
    title: "Bütçe Sorgusu ve Ödenek Belgesi",
    category: "3-siparis-ve-sozlesme",
    group: "olur_onay",
    description: "Alım tutarının ilgili bütçe tertibinden karşılanabilirliğini gösteren form",
  }),
  defineTemplate({
    id: "dogrudan-temin-sozlesmesi",
    name: "DogrudanTeminSozlesmesi",
    title: "Doğrudan Temin Sözleşmesi",
    category: "3-siparis-ve-sozlesme",
    group: "olur_onay",
    description: "Yüklenici firma ile İdare arasında imzalanan matbu alım sözleşmesi",
    capabilities: { supportsFirmaListesi: true },
  }),
  defineTemplate({
    id: "sozlesmeye-davet",
    name: "SozlesmeyeDavet",
    title: "Sözleşmeye Davet Yazısı",
    category: "3-siparis-ve-sozlesme",
    group: "olur_onay",
    description: "Kazanan yükleniciye sözleşme imzalaması için iletilen davet yazısı",
    capabilities: {
      supportsKalemListesi: false,
      supportsFirmaListesi: true,
    },
  }),
  defineTemplate({
    id: "muayene-kabul-tutanagi",
    name: "MuayeneKabulTutanagi",
    title: "Muayene ve Kabul Tutanağı",
    category: "4-kabul-ve-odeme-islemleri",
    group: "muayene_kabul",
    description: "Teslim alınan mal veya hizmetin muayene ve kabul tutanağı cetveli",
    capabilities: {
      supportsOlur: true,
      supportsCommission: true,
      supportedCommissionTypes: ["muayene_kabul"],
      supportsFirmaListesi: true,
    },
  }),
  defineTemplate({
    id: "muayene-kabul-komisyonu",
    name: "MuayeneKabulKomisyonu",
    title: "Muayene ve Kabul Komisyon Kararı",
    category: "4-kabul-ve-odeme-islemleri",
    group: "muayene_kabul",
    description: "Teslim alınan mal veya hizmetin muayene kabul komisyonunca onaylanma kararı",
    capabilities: {
      supportsOlur: true,
      supportsCommission: true,
      supportedCommissionTypes: ["muayene_kabul"],
    },
  }),
  defineTemplate({
    id: "harcama-pusulasi",
    name: "HarcamaPusulasi",
    title: "Harcama Pusulası",
    category: "4-kabul-ve-odeme-islemleri",
    group: "muayene_kabul",
    description: "Fatura kesme yükümlülüğü olmayan gerçek kişilerden yapılan alımların tutanağı",
    capabilities: {
      roleVisibility: {
        harcama_yetkilisi: "show",
        onaylayan: "show",
      },
    },
  }),
  defineTemplate({
    id: "odeme-yazisi",
    name: "OdemeYazisi",
    title: "Ödeme Yazısı",
    category: "4-kabul-ve-odeme-islemleri",
    group: "olur_onay",
    description: "Mali hizmetler / muhasebe müdürlüğüne yazılan ödeme üst yazısı",
    capabilities: {
      supportsOlur: true,
      supportsKalemListesi: false,
      supportsFirmaListesi: true,
    },
  }),
  defineTemplate({
    id: "dogrudan-temin-sonuc-onay-belgesi",
    name: "DogrudanTeminSonucOnayBelgesi",
    title: "Doğrudan Temin Sonuç Onay Belgesi",
    category: "3-siparis-ve-sozlesme",
    group: "olur_onay",
    description: "Alım sonucunun yetkili makam onay belgesi",
    capabilities: {
      supportsOlur: true,
      supportsFirmaListesi: true,
    },
  }),
  defineTemplate({
    id: "gorevlendirme-yazisi",
    name: "GorevlendirmeYazisi",
    title: "Görevlendirme Yazısı",
    category: "2-piyasa-fiyat-arastirmasi",
    group: "piyasa_arastirma",
    description: "Piyasa fiyat araştırması görevlendirme yazısı",
    capabilities: {
      supportsOlur: true,
      supportsCommission: true,
      supportedCommissionTypes: ["piyasa_fiyat"],
      supportsKalemListesi: false,
      roleVisibility: {
        harcama_yetkilisi: "show",
        onaylayan: "show",
      },
    },
  }),
  defineTemplate({
    id: "idare-onay-belgesi",
    name: "IdareOnayBelgesi",
    title: "İdare Onay Belgesi",
    category: "3-siparis-ve-sozlesme",
    group: "olur_onay",
    description: "İdare onay ve karar belgesi",
    capabilities: {
      supportsOlur: true,
      supportsFirmaListesi: true,
    },
  }),
];