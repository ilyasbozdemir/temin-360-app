import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { PiyasaFiyatArastirmaGorevlendirmesiData } from "./PiyasaFiyatArastirmaGorevlendirmesi.schema";

interface Props {
  data?: Partial<PiyasaFiyatArastirmaGorevlendirmesiData> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const PiyasaFiyatArastirmaGorevlendirmesi: React.FC<Props> = ({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  hideHeader = false,
  hideFooter = false,
}) => {
  // Hariç tutulacak rolleri ve yetkilileri filtreleme fonksiyonu
  const isExcludedOfficer = (item: any) => {
    const adSoyad = (item.adSoyad || item.ad_soyad || item.ad || item.adi || "")
      .trim();
    const unvan = (item.unvan || item.unvani || "").trim();
    const gorev = (item.gorev || item.gorevi || "").trim();
    const combined = `${adSoyad} ${unvan} ${gorev}`.toLowerCase();

    if (!adSoyad) return true;

    // Harcama yetkilisi / Gerçekleştirme görevlisi / Muhasebe yetkilisi / Satın alma yetkilisi
    if (
      combined.includes("harcama yetkili") ||
      combined.includes("gerçekleştirme") ||
      combined.includes("gerceklestirme") ||
      combined.includes("muhasebe yetkili") ||
      combined.includes("muhasebe görevli") ||
      combined.includes("satın alma yetkili") ||
      combined.includes("satınalma yetkili") ||
      combined.includes("satın alma harcama") ||
      combined.includes("satin alma harcama")
    ) {
      return true;
    }

    // Onay makamı / OLUR veren yetkili ile eşleşiyorsa çıkar
    if (
      data.onaylayanPersonelAdi &&
      adSoyad.toLowerCase() === data.onaylayanPersonelAdi.trim().toLowerCase()
    ) {
      return true;
    }

    // Hazırlayan personel ile eşleşiyorsa ve özel olarak fiyat araştırması denmemişse çıkar
    if (
      data.hazirlayanPersonelAdi &&
      adSoyad.toLowerCase() ===
        data.hazirlayanPersonelAdi.trim().toLowerCase() &&
      !gorev.toLowerCase().includes("fiyat") &&
      !gorev.toLowerCase().includes("araştırma") &&
      !gorev.toLowerCase().includes("arastirma")
    ) {
      return true;
    }

    // Placeholder isimleri
    if (
      combined.includes("talep eden personel") ||
      combined.includes("hazırlayan personel") ||
      combined.includes("onaylayan yetkili") ||
      combined.includes("onaylayan personel") ||
      combined.includes("dosyayı hazırlayan")
    ) {
      return true;
    }

    return false;
  };

  const formatUnvan = (unvan?: string) => {
    if (!unvan || !unvan.trim()) return "";
    const trimmed = unvan.trim();
    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      return trimmed;
    }
    return `(${trimmed})`;
  };

  // Ham görevli listesini topla
  const rawList: any[] = (() => {
    if (
      data.gorevlendirilenler && Array.isArray(data.gorevlendirilenler) &&
      data.gorevlendirilenler.length > 0
    ) {
      return data.gorevlendirilenler;
    }
    if (
      data.fiyatKomisyonu && Array.isArray(data.fiyatKomisyonu) &&
      data.fiyatKomisyonu.length > 0
    ) {
      return data.fiyatKomisyonu;
    }
    if (
      data.gorevliler && Array.isArray(data.gorevliler) &&
      data.gorevliler.length > 0
    ) {
      return data.gorevliler;
    }
    return [];
  })();

  // Sadece gerçek Piyasa Fiyat Araştırma Görevlilerini filtrele
  const gorevlendirilenler: Array<{ adSoyad: string; unvan: string }> = (() => {
    const filtered = rawList
      .filter((g) => !isExcludedOfficer(g))
      .map((g: any) => ({
        adSoyad: (g.adSoyad || g.ad_soyad || g.ad || g.adi || "").trim(),
        unvan: (g.unvan || g.unvani || g.gorev || "").trim(),
      }));

    if (filtered.length > 0) return filtered;

    // Eğer filtre sonucu boş kaldıysa ama ham liste varsa harcama yetkilisi olmayanları al
    return rawList
      .filter((g: any) => {
        const text = `${g.adSoyad || g.ad || ""} ${g.unvan || ""} ${
          g.gorev || ""
        }`.toLowerCase();
        return !text.includes("harcama yetkili") && !text.includes("onaylayan");
      })
      .map((g: any) => ({
        adSoyad: (g.adSoyad || g.ad_soyad || g.ad || g.adi || "").trim(),
        unvan: (g.unvan || g.unvani || g.gorev || "").trim(),
      }));
  })();

  // Dağıtım listesi
  const dagitimListesi: Array<{ adSoyad: string; unvan: string }> = (() => {
    if (
      data.dagitimListesi && Array.isArray(data.dagitimListesi) &&
      data.dagitimListesi.length > 0
    ) {
      const filtered = data.dagitimListesi
        .map((d: any) => {
          if (typeof d === "string") {
            return { adSoyad: d.trim(), unvan: "", gorev: "" };
          }
          return {
            adSoyad: (d.adSoyad || d.ad || d.adi || "").trim(),
            unvan: (d.unvan || d.unvani || d.gorev || "").trim(),
            gorev: (d.gorev || d.gorevi || "").trim(),
          };
        })
        .filter((d: any) => !isExcludedOfficer(d));

      if (filtered.length > 0) return filtered;
    }
    return gorevlendirilenler;
  })();

  // Evrak sayısı oluşturma
  const evrakNo = data.evrakSayisi ||
    `${data.detsisNo || "........"}-${data.yili || "...."}/${
      data.sayisi || "...."
    }`;

  const konuMetni = data.dosyaKonusu ??
    "Piyasa Fiyat Araştırması Görevlendirmesi";

  return (
    <DocumentLayout
      data={data as any}
      hideHeader={hideHeader}
      hideFooter={hideFooter}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={1}
    >
      <div
        style={{
          width: "100%",
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: "12pt",
          color: "#000",
          lineHeight: 1.5,
        }}
      >
        {/* Meta Satırı (Sayı, Konu, Tarih) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0px",
          }}
        >
          <div>
            <table style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      padding: "2px 10px 2px 0",
                      verticalAlign: "top",
                    }}
                  >
                    Sayı
                  </td>
                  <td
                    style={{ padding: "2px 10px 2px 0", verticalAlign: "top" }}
                  >
                    : <EditableField name="evrakSayisi" value={evrakNo} />
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      padding: "2px 10px 2px 0",
                      verticalAlign: "top",
                    }}
                  >
                    Konu
                  </td>
                  <td
                    style={{ padding: "2px 10px 2px 0", verticalAlign: "top" }}
                  >
                    : <EditableField name="dosyaKonusu" value={konuMetni} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
            <strong>Tarih:</strong>{" "}
            <DateEditableField
              name="dosyaTarihi"
              value={data.dosyaTarihi || data.tarih || ""}
            />
          </div>
        </div>

        {/* Görevlendirme Metni */}
        <div
          style={{
            textIndent: "40px",
            textAlign: "justify",
            marginTop: "30px",
            marginBottom: "0px",
            lineHeight: 1.6,
          }}
        >
          <EditableField
            name="kurumumuz"
            value={data.kurumumuz || data.kurumAdi || "Kurumumuz"}
          />
          ,{" "}
          <EditableField
            name="isinAdi"
            value={data.isinAdi || "Alımı yapılacak"}
          />{" "}
          işine ait fiyat araştırmasını yapmak üzere{" "}
          {gorevlendirilenler.length > 0
            ? (
              gorevlendirilenler.map((g, idx) => (
                <React.Fragment key={idx}>
                  <strong>{g.adSoyad}</strong>{" "}
                  {g.unvan ? formatUnvan(g.unvan) : ""}
                  {idx < gorevlendirilenler.length - 1 ? ", " : " "}
                </React.Fragment>
              ))
            )
            : <strong>İlgili personeller</strong>}{" "}
          Piyasa Fiyat Araştırması için görevlendirilecek olup,
        </div>

        <div
          style={{
            textIndent: "40px",
            textAlign: "justify",
            marginTop: "0px",
            marginBottom: "30px",
            lineHeight: 1.6,
          }}
        >
          Gereğini olurlarınıza arz ederim.
        </div>

        {/* Hazırlayan (Sağ) */}
        <div
          style={{
            textAlign: "right",
            marginBottom: "40px",
            lineHeight: 1.3,
            paddingRight: "20px",
          }}
        >
          <EditableField
            name="hazirlayanPersonelAdi"
            value={data.hazirlayanPersonelAdi || ""}
          />
          <br />
          <EditableField
            name="hazirlayanPersonelUnvan"
            value={data.hazirlayanPersonelUnvan || ""}
          />
        </div>

        {/* OLUR Onay Bloğu (Orta) */}
        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
            marginBottom: "30px",
            breakInside: "avoid",
            pageBreakInside: "avoid",
          }}
        >
          <strong>OLUR</strong>
          <br />
          <DateEditableField
            name="dosyaTarihi"
            value={data.dosyaTarihi || data.tarih || ""}
          />
          <br />
          <br />
          <EditableField
            name="onaylayanPersonelAdi"
            value={data.onaylayanPersonelAdi || ""}
          />
          <br />
          <EditableField
            name="onaylayanPersonelUnvan"
            value={data.onaylayanPersonelUnvan || ""}
          />
        </div>

        {/* DAĞITIM (Sol Alt) */}
        <div
          style={{
            marginTop: "40px",
            textAlign: "left",
            fontSize: "10pt",
            breakInside: "avoid",
            pageBreakInside: "avoid",
          }}
        >
          <div style={{ fontSize: "10pt", fontWeight: "bold" }}>DAĞITIM:</div>
          <ul
            style={{
              listStyleType: "none",
              paddingLeft: 0,
              marginTop: "5px",
              lineHeight: 1.5,
            }}
          >
            {dagitimListesi.length > 0
              ? (
                dagitimListesi.map((d, idx) => (
                  <li key={idx}>
                    - {d.adSoyad} {d.unvan ? formatUnvan(d.unvan) : ""}
                  </li>
                ))
              )
              : <li>- Piyasa Fiyat Araştırma Görevlileri</li>}
          </ul>
        </div>
      </div>
    </DocumentLayout>
  );
};
