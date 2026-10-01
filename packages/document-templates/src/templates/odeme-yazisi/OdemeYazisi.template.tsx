import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { OdemeYazisiData } from "./OdemeYazisi.schema";

interface Props {
  data?: Partial<OdemeYazisiData> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const OdemeYazisi: React.FC<Props> = ({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  hideHeader = false,
  hideFooter = false,
}) => {
  // Evrak numarası
  const evrakNo =
    data.evrakSayisi ||
    `${data.detsisNo || "................"}`;

  // Tarih
  const tarih = data.dosyaTarihi || data.tarih || "";

  // Muhatap makam
  const makam =
    data.makamAdi ||
    `${data.kurumAdi || "................ BELEDİYE BAŞKANLIĞINA"}`;

  // Neyimizin (İdaremizce / Kurumumuzca vb.)
  const neyimizin = data.neyimizin || "İdaremizce";

  // İş adı
  const isinAdi = data.isinAdi || data.dosyaKonusu || "";

  // KDV dahil tutar
  const kdvDahilToplam = data.kdvDahilToplam || data.genelToplam || "";

  // Harcama kalemi / bütçe kodu
  const harcamaKalemi =
    data.harcamaKalemi || data.butceKodu || "................";

  // Yüklenici firma
  const firma = data.yukleniciFirma || "................";

  // Hazırlayan
  const hazirlayanAdi = data.hazirlayanPersonelAdi || "................";
  const hazirlayanUnvan = data.hazirlayanPersonelUnvan || "................";

  // OLUR
  const showOlur = data.olurGoster === true;
  const onayTarihi = data.onayTarihi || tarih;
  const baskanAdi = data.baskanAdi || "................";
  const baskanUnvan = data.baskanUnvan || "Belediye Başkanı";

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
        {/* EVRAK BİLGİLERİ */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
          <tbody>
            <tr>
              <td style={{ width: "60%", padding: "2px 0", verticalAlign: "top" }}>
                Sayı&nbsp;&nbsp;&nbsp;:{" "}
                <EditableField name="evrakSayisi" value={evrakNo} />
              </td>
              <td style={{ width: "40%", textAlign: "right", padding: "2px 0", verticalAlign: "top" }}>
                Tarih:{" "}
                <DateEditableField name="dosyaTarihi" value={tarih} />
              </td>
            </tr>
            <tr>
              <td style={{ padding: "2px 0", verticalAlign: "top" }}>
                Konu&nbsp;&nbsp;: Ödeme
              </td>
              <td />
            </tr>
          </tbody>
        </table>

        {/* HEDEF MAKAM */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            margin: "40px 0 30px",
            fontSize: "11.5pt",
            textTransform: "uppercase" as const,
          }}
        >
          <EditableField name="makamAdi" value={makam} />
        </div>

        {/* YAZI İÇERİĞİ — paragraf 1 */}
        <div
          style={{
            textAlign: "justify",
            textIndent: "1.5cm",
            marginBottom: "20px",
            lineHeight: 1.6,
          }}
        >
          <EditableField name="neyimizin" value={neyimizin} /> alımı yapılan{" "}
          <strong>
            <EditableField name="isinAdi" value={isinAdi} />
          </strong>{" "}
          işine ait tahakkuk eden fatura ilişikte gönderilmiştir.
        </div>

        {/* YAZI İÇERİĞİ — paragraf 2 */}
        <div
          style={{
            textAlign: "justify",
            textIndent: "1.5cm",
            marginBottom: "40px",
            lineHeight: 1.6,
          }}
        >
          Söz konusu alımın bedeli olan KDV dahil{" "}
          <strong>
            <EditableField name="kdvDahilToplam" value={kdvDahilToplam} /> TL
          </strong>
          {`'nin `}
          <strong>
            <EditableField name="harcamaKalemi" value={harcamaKalemi} />
          </strong>{" "}
          harcama kaleminden, alacaklısı{" "}
          <strong>
            <EditableField name="yukleniciFirma" value={firma} />
          </strong>
          {"'in hesabına havale edilmesini rica ederim."}
        </div>

        {/* İMZA — sağ */}
        <div
          style={{
            width: "100%",
            marginTop: "40px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              float: "right",
              width: "250px",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            <br />
            <EditableField name="hazirlayanPersonelAdi" value={hazirlayanAdi} />
            <br />
            <EditableField name="hazirlayanPersonelUnvan" value={hazirlayanUnvan} />
          </div>
          <div style={{ clear: "both" }} />
        </div>

        {/* OLUR ONAYI */}
        {showOlur && (
          <div
            style={{
              marginTop: "50px",
              textAlign: "center",
              lineHeight: 1.4,
              clear: "both",
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            <strong>OLUR</strong>
            <br />
            <DateEditableField name="onayTarihi" value={onayTarihi} />
            <br />
            <br />
            <br />
            <EditableField name="baskanAdi" value={baskanAdi} />
            <br />
            <EditableField name="baskanUnvan" value={baskanUnvan} />
          </div>
        )}
      </div>
    </DocumentLayout>
  );
};
