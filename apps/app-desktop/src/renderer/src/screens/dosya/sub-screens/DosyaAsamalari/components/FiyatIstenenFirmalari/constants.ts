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
  legalTooltip?: React.ReactNode | string;
}

export const DAGITIM_BELGELERI_KARTLARI: DagitimKartItem[] = [
  {
    id: "arastirma-mektubu",
    title: "Fiyat Araştırması (Üst Yazı)",
    description: "İdarenin satıcılara gönderdiği davet ve talep yazısı.",
    buttonText: "Üst Yazıyı Aç",
    templateKey: "arastirma-mektubu",
    iconName: "Send",
    themeColor: "indigo",
    legalTooltip: "Hukuki Statü: Kapalı/Gizli İç Belge.\nYasal bağlılığı yoktur. Yalnızca pazar fiyatlarını belirlemek (ön değerlendirme) amacıyla kullanılır. Firmaları bağlamaz.",
  },
  {
    id: "fiyat-arastirma-mektubu",
    title: "Fiyat Araştırma Mektubu (Bütünleşik)",
    description: "İdare üst yazısı, teklif mektubu ve teklif cetveli bir arada genel dağıtım formu.",
    buttonText: "Bütünleşik Mektubu Aç",
    templateKey: "fiyat-arastirma-mektubu",
    iconName: "Layers",
    themeColor: "purple",
    legalTooltip: "Üst yazı ve cetvelin birleşik halidir. Hızlı alımlarda kullanılır.",
  },
  {
    id: "birim-fiyat-teklif-mektubu",
    title: "Birim Fiyat Teklif Mektubu (Kısa)",
    description: "Konsorsiyum olmayan, basit ihale ve alımlar için taahhütname formatı.",
    buttonText: "Teklif Mektubunu Aç",
    templateKey: "birim-fiyat-teklif-mektubu",
    iconName: "Tag",
    themeColor: "violet",
    legalTooltip: "Hukuki Statü: Kısmi Resmi Belge.\nKDV hariç yazılıdır. İmza ve kaşe zorunludur. Yasal bağlılığı vardır. (Konsorsiyum öngörülmez)",
  },
  {
    id: "teklif-cetveli",
    title: "Birim Fiyat Teklif Cetveli (Uzun)",
    description: "4734 Kamu İhale Kanunu'na tam uyumlu resmi teklif ve taahhüt formu.",
    buttonText: "Teklif Cetvelini Aç",
    templateKey: "birim-fiyat-teklif-mektubu",
    iconName: "FileSpreadsheet",
    themeColor: "emerald",
    legalTooltip: "Hukuki Statü: Tam Resmi Belge.\nYasal bağlılığı çok güçlüdür. Konsorsiyum koşulu öngörülmüştür. İhale komisyonuna sunulur.",
  },
];
