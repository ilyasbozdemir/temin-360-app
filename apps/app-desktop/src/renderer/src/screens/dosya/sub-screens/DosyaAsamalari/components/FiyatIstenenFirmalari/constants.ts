export const MEKTUP_MENU_ITEMS = {
  ARASTIRMA_MEKTUBU: {
    title: "Fiyat Araştırması",
    description: "Yaklaşık maliyet ve piyasa fiyat araştırma tutanağı",
    templateKey: "arastirma-mektubu",
  },
  IDARE_FIYAT_ARASTIRMA: {
    title: "Fiyat Araştırma Mektubu (Bütünleşik)",
    description: "İdare üst yazısı, teklif mektubu ve teklif cetveli bir arada",
    templateKey: "fiyat-arastirma-mektubu",
  },
  BIRIM_FIYAT_ARASTIRMASI: {
    title: "Birim Fiyat Teklif Mektubu",
    description: "Firma unvanı, VKN ve taahhütname formatı",
    templateKey: "birim-fiyat-teklif-mektubu",
  },
  BOS_TEKLIF_CETVELI: {
    title: "Birim Fiyat Teklif Cetveli",
    description: "Firmanın dolduracağı boş birim fiyat tablosu",
    templateKey: "birim-fiyat-teklif-mektubu",
  },
} as const;

export interface DagitimKartItem {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  templateKey: string;
  iconName: "Send" | "Layers" | "Tag" | "FileSpreadsheet";
  themeColor: "indigo" | "purple" | "violet" | "emerald";
}

export const DAGITIM_BELGELERI_KARTLARI: DagitimKartItem[] = [
  {
    id: "arastirma-mektubu",
    title: "Fiyat Araştırması",
    description: "Yaklaşık maliyet ve genel piyasa fiyat araştırma mektubu (Sayın İlgili / Anonim).",
    buttonText: "Dağıtım Mektubunu Aç",
    templateKey: "arastirma-mektubu",
    iconName: "Send",
    themeColor: "indigo",
  },
  {
    id: "fiyat-arastirma-mektubu",
    title: "Fiyat Araştırma Mektubu (Bütünleşik)",
    description: "İdare üst yazısı, teklif mektubu ve teklif cetveli bir arada genel dağıtım formu.",
    buttonText: "Bütünleşik Mektubu Aç",
    templateKey: "fiyat-arastirma-mektubu",
    iconName: "Layers",
    themeColor: "purple",
  },
  {
    id: "birim-fiyat-teklif-mektubu",
    title: "Birim Fiyat Teklif Mektubu",
    description: "Firmaların doldurması için genel/boş teklif mektubu ve taahhütname formatı.",
    buttonText: "Teklif Mektubunu Aç",
    templateKey: "birim-fiyat-teklif-mektubu",
    iconName: "Tag",
    themeColor: "violet",
  },
  {
    id: "teklif-cetveli",
    title: "Birim Fiyat Teklif Cetveli",
    description: "İstekli firmalara fiyatlarını doldurmaları için verilecek boş teklif tablosu.",
    buttonText: "Teklif Cetvelini Aç",
    templateKey: "birim-fiyat-teklif-mektubu",
    iconName: "FileSpreadsheet",
    themeColor: "emerald",
  },
];
