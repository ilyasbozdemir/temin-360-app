import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { MuayeneKabulKomisyonuData } from "./MuayeneKabulKomisyonu.schema";

interface Props {
  data?: Partial<MuayeneKabulKomisyonuData> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const MuayeneKabulKomisyonu: React.FC<Props> = ({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  hideHeader = false,
  hideFooter = false,
}) => {
  // Görevlendirilen muayene kabul komisyonu üyeleri
  const gorevlendirilenler: Array<{ adSoyad: string; unvan: string }> = (() => {
    if (
      data.gorevlendirilenler && Array.isArray(data.gorevlendirilenler) &&
      data.gorevlendirilenler.length > 0
    ) {
      return data.gorevlendirilenler.map((g: any) => ({
        adSoyad: g.adSoyad || g.ad || g.adi || "",
        unvan: g.unvan || g.unvani || g.gorev || "",
      }));
    }
    if (
      data.muayeneKomisyonu && Array.isArray(data.muayeneKomisyonu) &&
      data.muayeneKomisyonu.length > 0
    ) {
      return data.muayeneKomisyonu.map((g: any) => ({
        adSoyad: g.adSoyad || g.ad_soyad || g.ad || "",
        unvan: g.unvan || g.gorev || "",
      }));
    }
    if (
      data.komisyonUyeleri && Array.isArray(data.komisyonUyeleri) &&
      data.komisyonUyeleri.length > 0
    ) {
      return data.komisyonUyeleri.map((g: any) => ({
        adSoyad: g.adSoyad || g.ad_soyad || g.ad || "",
        unvan: g.unvan || g.gorev || "",
      }));
    }
    if (
      data.gorevliler && Array.isArray(data.gorevliler) &&
      data.gorevliler.length > 0
    ) {
      return data.gorevliler.map((g: any) => ({
        adSoyad: g.adSoyad || g.ad || g.adi || "",
        unvan: g.unvan || g.unvani || g.gorev || "",
      }));
    }
    return [];
  })();

  // Dağıtım listesi
  const dagitimListesi: Array<{ adSoyad: string; unvan: string }> = (() => {
    if (
      data.dagitimListesi && Array.isArray(data.dagitimListesi) &&
      data.dagitimListesi.length > 0
    ) {
      return data.dagitimListesi.map((d: any) => {
        if (typeof d === "string") return { adSoyad: d, unvan: "" };
        return {
          adSoyad: d.adSoyad || d.ad || d.adi || "",
          unvan: d.unvan || d.unvani || d.gorev || "",
        };
      });
    }
    if (gorevlendirilenler.length > 0) {
      return gorevlendirilenler;
    }
    return [];
  })();

  const formatUnvan = (unvan?: string) => {
    if (!unvan || !unvan.trim()) return "";
    const trimmed = unvan.trim();
    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      return trimmed;
    }
    return `(${trimmed})`;
  };

  // Evrak sayısı oluşturma
  const evrakNo = data.evrakSayisi ||
    `${data.detsisNo || "........"}-${data.yili || "...."}/${
      data.sayisi || "...."
    }`;

  const konuMetni = data.dosyaKonusu ??
    "Muayene ve Kabul Komisyonu";

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
            name="onayBelgesiTarihi"
            value={String(data.onayBelgesiTarihi || data.dosyaTarihi || data.tarih || "........")}
          />
          {" tarih ve "}
          <EditableField
            name="onayBelgesiSayisi"
            value={String(data.onayBelgesiSayisi || data.onayBelgesiNo || evrakNo)}
          />
          {" sayılı Onay Belgesine istinaden 4734 Sayılı Kanunun "}
          <EditableField
            name="kanunMaddesi"
            value={String(data.kanunMaddesi || data.ihaleSekli || data.ihale_sekli || "22/d")}
          />
          {" maddesine göre alımı gerçekleştirilen "}
          <EditableField
            name="kurumumuz"
            value={data.kurumumuz || data.kurumAdi || "Kurumumuz"}
          />
          {" "}
          <EditableField
            name="isinAdi"
            value={data.isinAdi || "Alımı yapılacak"}
          />{" "}
          işine ait muayene ve kabulünü yapmak üzere{" "}
          {gorevlendirilenler.length > 0
            ? (
              gorevlendirilenler.map((g, idx) => (
                <React.Fragment key={idx}>
                  <strong>{g.adSoyad}</strong> {g.unvan ? formatUnvan(g.unvan) : ""}
                  {idx < gorevlendirilenler.length - 1 ? ", " : " "}
                </React.Fragment>
              ))
            )
            : <strong>İlgili personeller</strong>}{" "}
          Muayene ve Kabul Komisyonunda görevlendirilecek olup,
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
              : <li>- İlgili Personel</li>}
          </ul>
        </div>
      </div>
    </DocumentLayout>
  );
};
