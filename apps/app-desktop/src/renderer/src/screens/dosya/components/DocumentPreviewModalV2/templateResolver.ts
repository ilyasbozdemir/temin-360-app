import {
  TEMPLATE_REGISTRY,
  TemplateComponentType,
  TemplateType,
} from "@temin360/document-templates";
import * as Templates from "@temin360/document-templates";
import { V2_TEMPLATES_MAP } from "./constants";

export interface TemplateOptionItem {
  id: string;
  name: string;
  title: string;
  category: string;
  categoryLabel: string;
  description?: string;
}

export const TEMPLATE_OPTIONS: TemplateOptionItem[] = [
  // 1. İhtiyaç Tespiti ve Başlangıç
  {
    id: "ihtiyac-listesi",
    name: "IhtiyacListesi",
    title: "İhtiyaç Listesi (Malzeme / Hizmet)",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    categoryLabel: "Hazırlık & İhtiyaç",
    description: "Alımı yapılacak kalemlerin teknik özellikleri ve adetleri",
  },
  {
    id: "ihtiyac-talep-formu",
    name: "IhtiyacTalepFormu",
    title: "İhtiyaç Talep Formu",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    categoryLabel: "Hazırlık & İhtiyaç",
    description: "Birimlerin ihtiyaç talebini resmi olarak ilettiği form",
  },
  {
    id: "luzum-muzekkeresi",
    name: "LuzumMuzekkeresi",
    title: "Lüzum Müzekkeresi",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    categoryLabel: "Hazırlık & İhtiyaç",
    description: "İhtiyacın gerekçesini ve alım kararını belirten müzekkere",
  },
  {
    id: "luzum-muzekkeresi-onay-eki",
    name: "LuzumMuzekkeresiOnayEki",
    title: "Lüzum Müzekkeresi Onay Eki",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    categoryLabel: "Hazırlık & İhtiyaç",
    description: "Müzekkereye eklenen harcama yetkilisi onay formu",
  },
  {
    id: "luzum-muzekkeresi-teslim-tesellum",
    name: "LuzumMuzekkeresiTeslimTesellum",
    title: "Lüzum Müzekkeresi Teslim Tesellüm",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    categoryLabel: "Hazırlık & İhtiyaç",
    description: "Alınan malzemelerin ilgili birime teslim tutanağı",
  },
  {
    id: "harcama-talimati",
    name: "HarcamaTalimati",
    title: "Harcama Talimatı / Onay Belgesi",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    categoryLabel: "Hazırlık & İhtiyaç",
    description: "4734 Sayılı Kanun Doğrudan Temin Onay Belgesi",
  },
  {
    id: "komisyon-gorevlendirme-onayi",
    name: "KomisyonGorevlendirmeOnayi",
    title: "Komisyon Görevlendirme Onayı",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    categoryLabel: "Hazırlık & İhtiyaç",
    description: "Piyasa fiyat araştırması yapacak personellerin atama yazısı",
  },
  {
    id: "komisyon-gorevlendirme-onayi-eki",
    name: "KomisyonGorevlendirmeOnayiEki",
    title: "Komisyon Görevlendirme Onayı Eki",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    categoryLabel: "Hazırlık & İhtiyaç",
    description: "Görevlendirilen personellerin liste eki",
  },

  // 2. Piyasa Fiyat Araştırması
  {
    id: "fiyat-arastirma-mektubu",
    name: "FiyatArastirmaMektubu",
    title: "Fiyat Araştırma Mektubu",
    category: "2-piyasa-fiyat-arastirmasi",
    categoryLabel: "Teklifler & Piyasa",
    description: "Firmalardan fiyat teklifi talep mektubu",
  },
  {
    id: "birim-fiyat-teklif-mektubu",
    name: "BirimFiyatTeklifMektubu",
    title: "Birim Fiyat Teklif Mektubu",
    category: "2-piyasa-fiyat-arastirmasi",
    categoryLabel: "Teklifler & Piyasa",
    description: "İsteklilerin kaşe/imza ile verdiği teklif cetveli",
  },
  {
    id: "arastirma-mektubu",
    name: "ArastirmaMektubu",
    title: "Piyasa Araştırma Mektubu (Resmi)",
    category: "2-piyasa-fiyat-arastirmasi",
    categoryLabel: "Teklifler & Piyasa",
    description: "Resmi kurumlardan veya esnaftan teklif isteme mektubu",
  },
  {
    id: "piyasa-fiyat-arastirma-tutanagi",
    name: "PiyasaFiyatArastirmaTutanagi",
    title: "Piyasa Fiyat Araştırma Tutanağı",
    category: "2-piyasa-fiyat-arastirmasi",
    categoryLabel: "Teklifler & Piyasa",
    description: "Tüm tekliflerin karşılaştırıldığı ve en avantajlı teklifin belirlendiği tutanak",
  },
  {
    id: "piyasa-fiyat-arastirma-gorevlendirmesi",
    name: "PiyasaFiyatArastirmaGorevlendirmesi",
    title: "Piyasa Fiyat Araştırma Görevlendirmesi",
    category: "2-piyasa-fiyat-arastirmasi",
    categoryLabel: "Teklifler & Piyasa",
    description: "Fiyat araştırması görevlendirme yazısı",
  },
  {
    id: "yaklasik-maliyet-cetveli",
    name: "YaklasikMaliyetCetveli",
    title: "Yaklaşık Maliyet Cetveli",
    category: "2-piyasa-fiyat-arastirmasi",
    categoryLabel: "Teklifler & Piyasa",
    description: "Alımın tahmini yaklaşık maliyet hesap tablosu",
  },

  // 3. Sipariş ve Sözleşme
  {
    id: "kabul-edilen-teklif",
    name: "KabulEdilenTeklif",
    title: "Kabul Edilen Teklif Mektubu / Sipariş Formu",
    category: "3-siparis-ve-sozlesme",
    categoryLabel: "Sipariş & Sözleşme",
    description: "Kazanan firmaya sipariş ve kabul tebliğ yazısı",
  },
  {
    id: "dogrudan-temin-sonuc-onay-belgesi",
    name: "DogrudanTeminSonucOnayBelgesi",
    title: "Piyasa Fiyat Araştırması Sonuç Onay Belgesi",
    category: "3-siparis-ve-sozlesme",
    categoryLabel: "Sipariş & Sözleşme",
    description: "Piyasa araştırması sonucunda alımın onaylandığı belge",
  },
  {
    id: "dogrudan-temin-sozlesmesi",
    name: "DogrudanTeminSozlesmesi",
    title: "Doğrudan Temin Alım Sözleşmesi",
    category: "3-siparis-ve-sozlesme",
    categoryLabel: "Sipariş & Sözleşme",
    description: "İdare ile yüklenici arasında imzalanan alım sözleşmesi",
  },
  {
    id: "sozlesmeye-davet",
    name: "SozlesmeyeDavet",
    title: "Sözleşmeye Davet Yazısı",
    category: "3-siparis-ve-sozlesme",
    categoryLabel: "Sipariş & Sözleşme",
    description: "Kazanan firmanın sözleşme imzalamaya davet edildiği resmi yazı",
  },

  // 4. Kabul ve Ödeme İşlemleri
  {
    id: "harcama-pusulasi",
    name: "HarcamaPusulasi",
    title: "Harcama Pusulası / Muayene Kabul",
    category: "4-kabul-ve-odeme-islemleri",
    categoryLabel: "Muayene & Kabul & Ödeme",
    description: "Ödeme ve muayene kabul belgesi",
  },
];

export const TEMPLATE_ALIASES: Record<string, string> = {
  // Onay Belgeleri (Aşama 1)
  "dogrudan-temin-onay-belgesi": "harcama-talimati",
  "dogrudan-temin-onay": "harcama-talimati",
  "idare-onay-belgesi": "harcama-talimati",
  "ihale-onay-belgesi": "harcama-talimati",
  "onay-belgesi": "harcama-talimati",
  "onaybelgesi": "harcama-talimati",
  "butce-sorgusu": "harcama-talimati",
  "butce-sorgu": "harcama-talimati",
  "dt-onay": "harcama-talimati",
  "ihale-onay": "harcama-talimati",
  "onay": "harcama-talimati",
  "harcama": "harcama-talimati",
  "talimat": "harcama-talimati",
  "harcama-onay-belgesi": "harcama-talimati",

  // Sonuç Onay Belgeleri (Aşama 3)
  "dogrudan-temin-sonuc-onay-belgesi": "dogrudan-temin-sonuc-onay-belgesi",
  "sonuc-onay-belgesi": "dogrudan-temin-sonuc-onay-belgesi",
  "sonuconaybelgesi": "dogrudan-temin-sonuc-onay-belgesi",
  "sonuc-onay": "dogrudan-temin-sonuc-onay-belgesi",
  "sonuconay": "dogrudan-temin-sonuc-onay-belgesi",

  // İhtiyaç & Talep
  "ihtiyac": "ihtiyac-listesi",
  "ihtiyac-listesi": "ihtiyac-listesi",
  "ihtiyaclistesi": "ihtiyac-listesi",
  "malzeme-hizmet-kalem-listesi": "ihtiyac-listesi",
  "malzeme-listesi": "ihtiyac-listesi",
  "liste": "ihtiyac-listesi",
  "hazirlik-ve-ihtiyac": "ihtiyac-listesi",
  "ihtiyac-talep-formu": "ihtiyac-talep-formu",
  "ihtiyactalepformu": "ihtiyac-talep-formu",
  "talep-formu": "ihtiyac-talep-formu",
  "ihtiyac-talep": "ihtiyac-talep-formu",
  "talep": "ihtiyac-talep-formu",

  // Lüzum
  "luzum": "luzum-muzekkeresi",
  "luzum-muzekkere": "luzum-muzekkeresi",
  "luzum-muzekkeresi": "luzum-muzekkeresi",
  "luzummuzekkeresi": "luzum-muzekkeresi",
  "luzum-onay-eki": "luzum-muzekkeresi-onay-eki",
  "luzum-muzekkeresi-onay-eki": "luzum-muzekkeresi-onay-eki",
  "luzummuzekkeresionayeki": "luzum-muzekkeresi-onay-eki",
  "luzum-teslim-tesellum": "luzum-muzekkeresi-teslim-tesellum",
  "luzum-muzekkeresi-teslim-tesellum": "luzum-muzekkeresi-teslim-tesellum",
  "luzummuzekkeresiteslimtesellum": "luzum-muzekkeresi-teslim-tesellum",
  "teslim-tesellum": "luzum-muzekkeresi-teslim-tesellum",
  "teslim-tesellum-belgesi": "luzum-muzekkeresi-teslim-tesellum",

  // Komisyon & Görevlendirme
  "komisyon-gorevlendirme": "komisyon-gorevlendirme-onayi",
  "komisyon-gorevlendirme-onayi": "komisyon-gorevlendirme-onayi",
  "komisyongorevlendirmeonayi": "komisyon-gorevlendirme-onayi",
  "komisyon-atama": "komisyon-gorevlendirme-onayi",
  "komisyon-onayi": "komisyon-gorevlendirme-onayi",
  "komisyon-karari": "komisyon-gorevlendirme-onayi",
  "ihale-komisyon-karari": "komisyon-gorevlendirme-onayi",
  "komisyon-gorevlendirme-onayi-eki": "komisyon-gorevlendirme-onayi-eki",
  "komisyongorevlendirmeonayieki": "komisyon-gorevlendirme-onayi-eki",
  "komisyon-onay-eki": "komisyon-gorevlendirme-onayi-eki",
  "komisyon-eki": "komisyon-gorevlendirme-onayi-eki",

  // Teklif & Mektuplar
  "fiyat-arastirma-mektubu": "fiyat-arastirma-mektubu",
  "fiyatarastirmamektubu": "fiyat-arastirma-mektubu",
  "fiyat-arastirma": "fiyat-arastirma-mektubu",
  "fiyat-arastirmasi": "fiyat-arastirma-mektubu",
  "teklif-mektubu-dagitim-karma": "fiyat-arastirma-mektubu",
  "dagitim-cizelgesi-karma": "fiyat-arastirma-mektubu",
  "birim-fiyat-teklif-mektubu": "birim-fiyat-teklif-mektubu",
  "birimfiyatteklifmektubu": "birim-fiyat-teklif-mektubu",
  "birim-fiyat-teklif-cetveli": "birim-fiyat-teklif-mektubu",
  "teklif-mektubu": "birim-fiyat-teklif-mektubu",
  "teklifmektubu": "birim-fiyat-teklif-mektubu",
  "arastirma-mektubu": "arastirma-mektubu",
  "arastirmamektubu": "arastirma-mektubu",
  "teklif-mektubu-dagitim": "arastirma-mektubu",
  "teklif-mektubu-dagitim-cizelgesi": "arastirma-mektubu",
  "dagitim-cizelgesi": "arastirma-mektubu",
  "yasaklilik-sorgulama-tutanagi": "piyasa-fiyat-arastirma-gorevlendirmesi",
  "yasaklilik-sorgulama": "piyasa-fiyat-arastirma-gorevlendirmesi",
  "yasaklilik": "piyasa-fiyat-arastirma-gorevlendirmesi",
  "ekap-yasaklilik": "piyasa-fiyat-arastirma-gorevlendirmesi",

  // Piyasa Fiyat Araştırma & Yaklaşık Maliyet
  "piyasa-fiyat-arastirma-tutanagi": "piyasa-fiyat-arastirma-tutanagi",
  "piyasafiyatarastirmatutanagi": "piyasa-fiyat-arastirma-tutanagi",
  "piyasa-fiyat-arastirmasi": "piyasa-fiyat-arastirma-tutanagi",
  "piyasa-arastirma-tutanagi": "piyasa-fiyat-arastirma-tutanagi",
  "fiyat-arastirma-tutanagi": "piyasa-fiyat-arastirma-tutanagi",
  "tutanak": "piyasa-fiyat-arastirma-tutanagi",
  "piyasa-fiyat-arastirma-gorevlendirmesi": "piyasa-fiyat-arastirma-gorevlendirmesi",
  "piyasafiyatarastirmagorevlendirmesi": "piyasa-fiyat-arastirma-gorevlendirmesi",
  "piyasa-fiyat-arastirma-gorevlendirme": "piyasa-fiyat-arastirma-gorevlendirmesi",
  "arastirma-gorevlendirmesi": "piyasa-fiyat-arastirma-gorevlendirmesi",
  "gorevlendirme": "piyasa-fiyat-arastirma-gorevlendirmesi",
  "yaklasik-maliyet-cetveli": "yaklasik-maliyet-cetveli",
  "yaklasikmaliyetcetveli": "yaklasik-maliyet-cetveli",
  "yaklasik-maliyet-hesap-cetveli": "yaklasik-maliyet-cetveli",
  "yaklasik-maliyet": "yaklasik-maliyet-cetveli",
  "yaklasik": "yaklasik-maliyet-cetveli",
  "son-alim-fiyat-cetveli": "yaklasik-maliyet-cetveli",
  "son-alim": "yaklasik-maliyet-cetveli",
  "fiyat-cetveli": "yaklasik-maliyet-cetveli",
  "maliyet-cetveli": "yaklasik-maliyet-cetveli",

  // Kabul Edilen Teklif, Sipariş Formu, Sözleşme (Aşama 3)
  "kabul-edilen-teklif": "kabul-edilen-teklif",
  "kabuledilenteklif": "kabul-edilen-teklif",
  "kabul-edilen-teklif-alternatif": "kabul-edilen-teklif",
  "kabul-yazisi": "kabul-edilen-teklif",
  "kabulyazisi": "kabul-edilen-teklif",
  "siparis-formu": "kabul-edilen-teklif",
  "siparisformu": "kabul-edilen-teklif",
  "siparis-mektubu": "kabul-edilen-teklif",
  "siparismektubu": "kabul-edilen-teklif",
  "siparis": "kabul-edilen-teklif",

  "dogrudan-temin-sozlesmesi": "dogrudan-temin-sozlesmesi",
  "dogrudan-temin-sozlesmesi-alternatif": "dogrudan-temin-sozlesmesi",
  "dogrudan-temin-sozlesmesi-uzun": "dogrudan-temin-sozlesmesi",
  "sozlesme": "dogrudan-temin-sozlesmesi",

  "sozlesmeye-davet": "sozlesmeye-davet",
  "sozlesmedavet": "sozlesmeye-davet",
  "davet-mektubu": "sozlesmeye-davet",

  // Muayene, Kabul, Ödeme (Aşama 4)
  "harcama-pusulasi": "harcama-pusulasi",
  "harcamapusulasi": "harcama-pusulasi",
  "pusula": "harcama-pusulasi",
  "muayene-kabul-tutanagi": "harcama-pusulasi",
  "muayene-kabul-komisyonu": "harcama-pusulasi",
  "muayene-kabul": "harcama-pusulasi",
  "kabul-tutanagi": "harcama-pusulasi",
  "hizmet-isleri-kabul-tutanagi": "harcama-pusulasi",
  "hizmet-isleri-kabul-teklif-belgesi": "harcama-pusulasi",
  "odeme-emri-belgesi": "harcama-pusulasi",
  "odeme-yazisi": "harcama-pusulasi",
  "tasinir-islem-fisi": "harcama-pusulasi",
  "hakedis-raporu": "harcama-pusulasi",

  // Klasör & Kapak
  "klasor-sirtligi-3cm": "ihtiyac-listesi",
  "klasor-sirtligi-5cm": "ihtiyac-listesi",
  "klasor-sirtligi-7-5cm": "ihtiyac-listesi",
  "klasor-sirtligi": "ihtiyac-listesi",
  "ihale-kapagi": "ihtiyac-listesi",
  "kapak-ici-indeks-sablonu": "ihtiyac-listesi",
};

export function normalizeTemplateKey(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/\.html$/i, "")
    .replace(/\.mustache$/i, "")
    .replace(/^\d+[-_]/, "") // 01_, 01-
    .toLocaleLowerCase("tr-TR")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveTemplateConfig(
  documentId: string | null | undefined,
): { config: TemplateType; component: TemplateComponentType; resolvedId: string } {
  const defaultTemplate = TEMPLATE_REGISTRY[0]; // IhtiyacListesi
  const defaultComponent = Templates.IhtiyacListesi as TemplateComponentType;

  if (!documentId) {
    return {
      config: defaultTemplate,
      component: defaultComponent,
      resolvedId: defaultTemplate.id,
    };
  }

  // 1. Direct exact match in TEMPLATE_REGISTRY by id or name
  const exactMatch = TEMPLATE_REGISTRY.find(
    (t) => t.id === documentId || t.name === documentId,
  );
  if (exactMatch && V2_TEMPLATES_MAP[exactMatch.name]) {
    return {
      config: exactMatch,
      component: V2_TEMPLATES_MAP[exactMatch.name],
      resolvedId: exactMatch.id,
    };
  }

  // 2. Normalized key
  const cleanKey = normalizeTemplateKey(documentId);

  // Direct normalized match in registry
  const normalizedMatch = TEMPLATE_REGISTRY.find(
    (t) =>
      normalizeTemplateKey(t.id) === cleanKey ||
      normalizeTemplateKey(t.name) === cleanKey,
  );
  if (normalizedMatch && V2_TEMPLATES_MAP[normalizedMatch.name]) {
    return {
      config: normalizedMatch,
      component: V2_TEMPLATES_MAP[normalizedMatch.name],
      resolvedId: normalizedMatch.id,
    };
  }

  // 3. Alias match
  const aliasedId = TEMPLATE_ALIASES[cleanKey];
  if (aliasedId) {
    const aliasMatch = TEMPLATE_REGISTRY.find((t) => t.id === aliasedId);
    if (aliasMatch && V2_TEMPLATES_MAP[aliasMatch.name]) {
      return {
        config: aliasMatch,
        component: V2_TEMPLATES_MAP[aliasMatch.name],
        resolvedId: aliasMatch.id,
      };
    }
  }

  // 4. Substring / Keyword heuristic matching
  let resolvedId = "ihtiyac-listesi";
  if (cleanKey.includes("talep")) {
    resolvedId = "ihtiyac-talep-formu";
  } else if (
    cleanKey.includes("ihtiyac") ||
    cleanKey.includes("malzeme") ||
    cleanKey.includes("kalem")
  ) {
    resolvedId = "ihtiyac-listesi";
  } else if (cleanKey.includes("luzum")) {
    if (cleanKey.includes("onay") || cleanKey.includes("ek")) {
      resolvedId = "luzum-muzekkeresi-onay-eki";
    } else if (
      cleanKey.includes("teslim") ||
      cleanKey.includes("tesellum")
    ) {
      resolvedId = "luzum-muzekkeresi-teslim-tesellum";
    } else {
      resolvedId = "luzum-muzekkeresi";
    }
  } else if (
    cleanKey.includes("komisyon") ||
    cleanKey.includes("atama") ||
    cleanKey.includes("gorev")
  ) {
    if (cleanKey.includes("piyasa")) {
      resolvedId = "piyasa-fiyat-arastirma-gorevlendirmesi";
    } else if (cleanKey.includes("ek") || cleanKey.includes("onay-eki")) {
      resolvedId = "komisyon-gorevlendirme-onayi-eki";
    } else {
      resolvedId = "komisyon-gorevlendirme-onayi";
    }
  } else if (
    cleanKey.includes("yasak")
  ) {
    resolvedId = "piyasa-fiyat-arastirma-gorevlendirmesi";
  } else if (
    cleanKey.includes("yaklasik") ||
    cleanKey.includes("maliyet") ||
    cleanKey.includes("son-alim")
  ) {
    resolvedId = "yaklasik-maliyet-cetveli";
  } else if (
    cleanKey.includes("tutanak") ||
    (cleanKey.includes("piyasa") && !cleanKey.includes("mektup"))
  ) {
    resolvedId = "piyasa-fiyat-arastirma-tutanagi";
  } else if (
    cleanKey.includes("arastirma") ||
    cleanKey.includes("dagitim")
  ) {
    if (cleanKey.includes("karma")) {
      resolvedId = "fiyat-arastirma-mektubu";
    } else {
      resolvedId = "arastirma-mektubu";
    }
  } else if (
    cleanKey.includes("teklif") ||
    cleanKey.includes("birim-fiyat") ||
    cleanKey.includes("cetvel")
  ) {
    resolvedId = "birim-fiyat-teklif-mektubu";
  } else if (
    cleanKey.includes("sonuc")
  ) {
    resolvedId = "dogrudan-temin-sonuc-onay-belgesi";
  } else if (
    cleanKey.includes("siparis") ||
    cleanKey.includes("kabul-edilen") ||
    cleanKey.includes("kabul-yazi")
  ) {
    resolvedId = "kabul-edilen-teklif";
  } else if (
    cleanKey.includes("davet")
  ) {
    resolvedId = "sozlesmeye-davet";
  } else if (
    cleanKey.includes("sozlesme")
  ) {
    resolvedId = "dogrudan-temin-sozlesmesi";
  } else if (
    cleanKey.includes("arastirma") ||
    cleanKey.includes("mektup") ||
    cleanKey.includes("fiyat")
  ) {
    resolvedId = "fiyat-arastirma-mektubu";
  } else if (
    cleanKey.includes("pusula") ||
    cleanKey.includes("muayene") ||
    cleanKey.includes("odeme")
  ) {
    resolvedId = "harcama-pusulasi";
  } else if (
    cleanKey.includes("onay") ||
    cleanKey.includes("talimat") ||
    cleanKey.includes("harcama")
  ) {
    resolvedId = "harcama-talimati";
  }

  const found = TEMPLATE_REGISTRY.find((t) => t.id === resolvedId);
  if (found && V2_TEMPLATES_MAP[found.name]) {
    return {
      config: found,
      component: V2_TEMPLATES_MAP[found.name],
      resolvedId: found.id,
    };
  }

  // 5. Ultimate fallback: always return IhtiyacListesi
  return {
    config: defaultTemplate,
    component: defaultComponent,
    resolvedId: defaultTemplate.id,
  };
}
