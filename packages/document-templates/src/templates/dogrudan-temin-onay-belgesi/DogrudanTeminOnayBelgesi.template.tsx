import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { DogrudanTeminOnayBelgesiType } from "./DogrudanTeminOnayBelgesi.schema";
import { getDogrudanTeminOnayRows } from "./DogrudanTeminOnayBelgesi.config";

interface DogrudanTeminOnayBelgesiProps {
  data?: Partial<DogrudanTeminOnayBelgesiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function DogrudanTeminOnayBelgesi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: DogrudanTeminOnayBelgesiProps) {
  const idareAdi =
    data.idareAdi ||
    data.kurumAdi ||
    (data.antetSatirlari && data.antetSatirlari[1]) ||
    "İDARE ADI";

  const eklerList = Array.isArray(data.ekler) ? data.ekler : [];
  const rows = getDogrudanTeminOnayRows(data);

  return (
    <DocumentLayout
      data={data as any}
      hideFooter={false}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={1}
    >
      <div
        style={{
          width: "100%",
          fontSize: "10.5pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.4,
        }}
      >
        {/* TITLE */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "13pt",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          ONAY BELGESİ
        </div>

        {/* FIRST TABLE (İdare Bilgileri) */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  width: "38%",
                  fontWeight: "bold",
                }}
              >
                ALIMI YAPAN İDARENİN ADI
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  width: "62%",
                }}
              >
                <EditableField name="idareAdi" value={idareAdi} placeholder="İdare Adı" />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                }}
              >
                BELGE TARİH VE SAYISI
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                }}
              >
                <DateEditableField
                  name="dosyaTarihi"
                  value={data.dosyaTarihi || data.tarih}
                  placeholder="GG.AA.YYYY"
                />
                {" \u00A0\u00A0\u00A0\u00A0 - \u00A0\u00A0\u00A0\u00A0 "}
                <EditableField
                  name="evrakSayisi"
                  value={data.evrakSayisi}
                  placeholder="Evrak Sayısı"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* CENTERED IDARE BOX */}
        <div
          style={{
            border: "1px solid #000",
            textAlign: "center",
            fontWeight: "bold",
            padding: "5px",
            margin: "8px 0",
            textTransform: "uppercase",
            fontSize: "10pt",
          }}
        >
          <EditableField name="idareAdiBox" value={idareAdi} placeholder="İdare / Kurum Adı" />
        </div>

        {/* SECOND SECTION: BILGILER */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "12px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          DOĞRUDAN TEMİN İLE İLGİLİ BİLGİLER
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
          }}
        >
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    fontSize: "9.5pt",
                    width: "38%",
                    fontWeight: "bold",
                  }}
                >
                  {row.label}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    fontSize: "9.5pt",
                    fontWeight: row.isBold ? "bold" : "normal",
                  }}
                >
                  {row.renderValue ? (
                    row.renderValue()
                  ) : (
                    <EditableField
                      name={row.name}
                      value={row.value}
                      placeholder={row.placeholder}
                      selectOptions={row.selectOptions}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* THIRD SECTION: DIĞER AÇIKLAMALAR */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "12px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          DOĞRUDAN TEMİN İLE İLGİLİ DİĞER AÇIKLAMALAR
        </div>
        <div
          style={{
            border: "1px solid #000",
            minHeight: "60px",
            padding: "6px 8px",
            fontSize: "9.5pt",
            textAlign: "justify",
            marginBottom: "10px",
          }}
        >
          <EditableField
            name="isinAciklamasi"
            value={
              data.isinAciklamasi ||
              "Yukarıda belirtilen ihtiyacın 4734 sayılı Kamu İhale Kanununun 22/d maddesi uyarınca doğrudan temin usulüyle karşılanması ve piyasa fiyat araştırması yapılarak alımın gerçekleştirilmesi hususunda onaylarınızı arz ederim."
            }
            placeholder="Açıklama giriniz..."
            multiline
          />
        </div>

        {/* FOURTH SECTION: ONAY */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "14px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          ONAY
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000",
            pageBreakInside: "avoid",
          }}
        >
          <tbody>
            <tr>
              {/* LEFT COLUMN (Arz Eden) */}
              <td
                style={{
                  border: "1px solid #000",
                  padding: "10px",
                  width: "50%",
                  verticalAlign: "top",
                  textAlign: "center",
                  fontSize: "9.5pt",
                }}
              >
                <div
                  style={{
                    textAlign: "justify",
                    marginBottom: "20px",
                    textIndent: "15px",
                    lineHeight: 1.35,
                  }}
                >
                  Yukarıda belirtilen işin doğrudan temin yoluyla satın alınması hususunda onaylarınızı
                  arz ederim.
                </div>
                <div style={{ marginTop: "25px", textAlign: "center" }}>
                  <div>
                    <DateEditableField
                      name="tarih"
                      value={data.dosyaTarihi || data.tarih}
                      placeholder="GG.AA.YYYY"
                    />
                  </div>
                  <div style={{ marginTop: "20px", fontWeight: "bold" }}>
                    <EditableField
                      name="hazirlayanPersonelAdi"
                      value={data.hazirlayanPersonelAdi || data.piyasaGorevlisi1Adi}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div style={{ fontSize: "9pt", color: "#333" }}>
                    <EditableField
                      name="hazirlayanPersonelUnvan"
                      value={data.hazirlayanPersonelUnvan || data.piyasaGorevlisi1Unvani || "Gerçekleştirme Görevlisi"}
                      placeholder="Ünvan"
                    />
                  </div>
                </div>
              </td>

              {/* RIGHT COLUMN (Onaylayan) */}
              <td
                style={{
                  border: "1px solid #000",
                  padding: "10px",
                  width: "50%",
                  verticalAlign: "top",
                  textAlign: "center",
                  fontSize: "9.5pt",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "20px" }}>UYGUNDUR</div>
                <div style={{ marginTop: "25px", textAlign: "center" }}>
                  <div>
                    <DateEditableField
                      name="onayTarihi"
                      value={data.vonaytarihi || data.dosyaTarihi || data.tarih}
                      placeholder="GG.AA.YYYY"
                    />
                  </div>
                  <div style={{ marginTop: "20px", fontWeight: "bold" }}>
                    <EditableField
                      name="onaylayanPersonelAdi"
                      value={data.onaylayanPersonelAdi || data.baskanAdi}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div style={{ fontSize: "9pt", color: "#333" }}>
                    <EditableField
                      name="onaylayanPersonelUnvan"
                      value={data.onaylayanPersonelUnvan || data.baskanUnvan || "Harcama Yetkilisi"}
                      placeholder="Ünvan"
                    />
                  </div>
                  <div style={{ fontSize: "8.5pt", color: "#555", marginTop: "2px" }}>
                    Harcama Yetkilisi
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* EKLER */}
        {eklerList.length > 0 && (
          <div style={{ marginTop: "15px", fontSize: "9.5pt", textAlign: "left", pageBreakInside: "avoid" }}>
            <strong>EKLER:</strong>
            <ol style={{ margin: "4px 0 0 18px", padding: 0, listStyleType: "decimal", lineHeight: 1.4 }}>
              {eklerList.map((ek: string, idx: number) => (
                <li key={idx}>{ek}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </DocumentLayout>
  );
}
