export type TabType =
  | "genel"
  | "kunye"
  | "kalemler"
  | "firmalar"
  | "komisyon"
  | "rawjson";

export interface DosyaInspectorSubData {
  kalemler: any[];
  firmalar: any[];
  teklifler: any[];
  komisyon: any[];
  sablonVeri: any[];
}

export const turLabelMap: Record<string, string> = {
  mal: "Mal Alımı",
  hizmet: "Hizmet Alımı",
  yapim_isi: "Yapım İşi",
  danismanlik: "Danışmanlık",
  hakedis: "Hakediş Dosyası",
};

export const statusLabelMap: Record<string, string> = {
  devam_ediyor: "Devam Ediyor",
  tamamlandi: "Tamamlandı",
  iptal: "İptal Edildi",
};

export const formatMoney = (val: any): string => {
  const num = Number(val);
  if (isNaN(num) || num === 0) return "0,00";
  return num.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (val: string | null | undefined): string => {
  if (!val) return "-";
  try {
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return val;
  }
};
