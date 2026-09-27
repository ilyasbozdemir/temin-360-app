import React from "react";
import { EditableField } from "../../document/EditableField";

export interface OnayBelgesiRowItem {
  id: string;
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  isBold?: boolean;
  selectOptions?: string[];
  renderValue?: () => React.ReactNode;
}

export const TEMIN_SEKLI_OPTIONS = [
  "4734 Sayılı K.İ.K. Madde 22/d (Doğrudan Temin - Parasal Limit)",
  "4734 Sayılı K.İ.K. Madde 22/a (Tek Kaynak / İhtiyacın Sadece Gerçek/Tüzel Tek Kişiden Temini)",
  "4734 Sayılı K.İ.K. Madde 22/b (Özel Hak / Fikri-Sınai Mülkiyet)",
  "4734 Sayılı K.İ.K. Madde 22/c (Mevcut Mal/Ekipman/Hizmet Uyum Zorunluluğu)",
  "4734 Sayılı K.İ.K. Madde 22/e (Taşınmaz Mal Alımı / Kiralanması)",
  "4734 Sayılı K.İ.K. Madde 22/f (Sağlık Hizmetleri & İlaç/Tıbbi Cihaz Alımları)",
];

export const ALIM_TURU_OPTIONS = [
  "Mal Alımı",
  "Hizmet Alımı",
  "Yapım İşi",
  "Danışmanlık Hizmet Alımı",
];

export const AVANS_OPTIONS = [
  "Avans verilmeyecektir.",
  "Avans verilecektir.",
  "Şartname ve sözleşmede belirtilen esaslar dahilinde avans verilecektir.",
];

export const FIYAT_FARKI_OPTIONS = [
  "Fiyat farkı verilmeyecektir.",
  "Fiyat farkı verilecektir.",
  "Yürürlükteki Fiyat Farkı Kararnamesi esaslarına göre fiyat farkı hesaplanacaktır.",
];

export const DOKUMAN_OPTIONS = [
  "Doküman hazırlanmayacaktır.",
  "İdari ve teknik şartname hazırlanacaktır.",
  "Sadece teknik şartname hazırlanacaktır.",
];

/**
 * Doğrudan Temin Onay Belgesi için dinamik satır yapılandırma listesi
 */
export function getDogrudanTeminOnayRows(data: Record<string, any> = {}): OnayBelgesiRowItem[] {
  const butceTertibiList =
    Array.isArray(data.butceTertibi) && data.butceTertibi.length > 0
      ? data.butceTertibi
      : data.butceTertibi
        ? [String(data.butceTertibi)]
        : data.butceKodu
          ? [String(data.butceKodu)]
          : [];

  const defaultRows: OnayBelgesiRowItem[] = [
    {
      id: "teminNo",
      label: "Doğrudan Temin Numarası",
      name: "teminNo",
      value: data.teminNo || data.dosyaNo || data.evrakSayisi || "-",
      placeholder: "Temin Numarası",
    },
    {
      id: "isAdi",
      label: "İşin Adı",
      name: "isAdi",
      value: data.isAdi || data.dosyaKonusu || "",
      placeholder: "İşin Adı",
      isBold: true,
    },
    {
      id: "teminSekli",
      label: "Temin Şekli",
      name: "teminSekli",
      value:
        data.teminSekli ||
        "4734 Sayılı K.İ.K. Madde 22/d (Doğrudan Temin - Parasal Limit)",
      placeholder: "Temin Usulü",
      selectOptions: TEMIN_SEKLI_OPTIONS,
    },
    {
      id: "alimTuru",
      label: "Alım Türü",
      name: "alimTuru",
      value: data.alimTuru || data.teklifSozlesmeTuru || "Mal Alımı",
      placeholder: "Alım Türü",
      selectOptions: ALIM_TURU_OPTIONS,
    },
    {
      id: "yaklasikMaliyet",
      label: "Yaklaşık Maliyet",
      name: "yaklasikMaliyet",
      value: data.yaklasikMaliyet ? `${data.yaklasikMaliyet} ₺` : "-",
      placeholder: "0,00 ₺",
      isBold: true,
    },
    {
      id: "odenekTutari",
      label: "Kullanılabilir Ödenek Tutarı",
      name: "odenekTutari",
      value:
        data.odenekTutari || data.kullanilabilirOdenek || data.yaklasikMaliyet
          ? `${data.odenekTutari || data.kullanilabilirOdenek || data.yaklasikMaliyet} ₺`
          : "Yeterli Ödenek Mevcuttur",
      placeholder: "Ödenek Tutarı",
    },
    {
      id: "projeNo",
      label: "Yatırım Proje Numarası (varsa)",
      name: "projeNo",
      value: data.projeNo || "-",
      placeholder: "Proje No veya -",
    },
    {
      id: "butceTertibi",
      label: "Bütçe Tertibi",
      name: "butceTertibi",
      value: "",
      renderValue: () =>
        butceTertibiList.length > 0 ? (
          <div>
            {butceTertibiList.map((item: string, idx: number) => (
              <div key={idx}>
                <EditableField
                  name={`butceTertibi_${idx}`}
                  value={item}
                  placeholder="Bütçe Tertibi"
                />
              </div>
            ))}
          </div>
        ) : (
          <EditableField
            name="butceTertibi_0"
            value="Belirtilmedi"
            placeholder="Bütçe Tertibi"
          />
        ),
    },
    {
      id: "avansSartlari",
      label: "Avans Verilecekse şartları",
      name: "avansSartlari",
      value: data.avansSartlari || "Avans verilmeyecektir.",
      placeholder: "Avans Şartları",
      selectOptions: AVANS_OPTIONS,
    },
    {
      id: "fiyatFarkiSartlari",
      label: "Fiyat Farkı Verilecekse Şartları",
      name: "fiyatFarkiSartlari",
      value: data.fiyatFarkiSartlari || "Fiyat farkı verilmeyecektir.",
      placeholder: "Fiyat Farkı Şartları",
      selectOptions: FIYAT_FARKI_OPTIONS,
    },
    {
      id: "dokumanHazirlik",
      label: "Doküman Hazırlanıp Hazırlanmayacağı",
      name: "dokumanHazirlik",
      value: data.dokumanHazirlik || "Doküman hazırlanmayacaktır.",
      placeholder: "Doküman Durumu",
      selectOptions: DOKUMAN_OPTIONS,
    },
  ];

  if (Array.isArray(data.customRows) && data.customRows.length > 0) {
    return data.customRows;
  }

  return defaultRows;
}
