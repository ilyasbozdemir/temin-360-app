import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentHeader } from "../../document/DocumentHeader";
import { EditableField } from "../../document/EditableField";
import { DateEditableField, BirimInlineSelect, PersonelInlineSelect } from "../../document/ApprovalSignature";
import { ButceSorgusuType } from "./ButceSorgusu.schema";

interface ButceSorgusuProps {
  data?: Partial<ButceSorgusuType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function ButceSorgusu({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: ButceSorgusuProps) {
  const butceTertibiVal =
    data.odenekTertibi !== undefined
      ? data.odenekTertibi
      : data.butceTertibi !== undefined
      ? data.butceTertibi
      : data.butceKodu !== undefined
      ? data.butceKodu
      : "";

  const butceTertibiList =
    Array.isArray(butceTertibiVal) && butceTertibiVal.length > 0
      ? butceTertibiVal
      : butceTertibiVal && String(butceTertibiVal).trim() !== "" && String(butceTertibiVal).trim() !== "-"
      ? [String(butceTertibiVal)]
      : [];

  const kurumAdi = data.kurumAdi ||
    data.idareAdi ||
    (data.antetSatirlari && data.antetSatirlari[0]) ||
    "İDARE";

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
          fontSize: "11pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.5,
        }}
      >
        {/* META ROW */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
            marginBottom: "25px",
          }}
        >
          <div>
            <table style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      paddingRight: "8px",
                      verticalAlign: "top",
                    }}
                  >
                    Sayı
                  </td>
                  <td style={{ verticalAlign: "top" }}>
                    :{" "}
                    <EditableField
                      name="evrakSayisi"
                      value={data.evrakSayisi || ""}
                      placeholder="E-00000000-934.01-0001"
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      paddingRight: "8px",
                      verticalAlign: "top",
                    }}
                  >
                    Konu
                  </td>
                  <td style={{ verticalAlign: "top" }}>
                    :{" "}
                    <EditableField
                      name="konu"
                      value={data.konu !== undefined ? String(data.konu) : "Bütçe Sorgusu"}
                      placeholder="Konu"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>Tarih:</strong>{" "}
            <DateEditableField
              name="tarih"
              value={data.tarih || data.dosyaTarihi}
              placeholder="GG.AA.YYYY"
            />
          </div>
        </div>

        {/* RECIPIENT */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            margin: "35px 0 20px 0",
            textTransform: "uppercase",
            fontSize: "11.5pt",
            lineHeight: 1.4,
          }}
        >
          <BirimInlineSelect
            nameField="muhatapBirim"
            value={
              data.muhatapBirim ||
              data.sunumMakami ||
              "STRATEJİ GELİŞTİRME DAİRE BAŞKANLIĞINA"
            }
            placeholder="Muhatap Birim"
          />
        </div>

        {/* LETTER BODY */}
        <div
          style={{
            textIndent: "35px",
            textAlign: "justify",
            marginBottom: "12px",
            lineHeight: 1.6,
          }}
        >
          &quot;
          <EditableField
            name="isAdi"
            value={data.isAdi || data.dosyaKonusu || "İhtiyaç Alımı"}
            placeholder="İşin Adı"
            style={{ fontWeight: "bold" }}
          />
          &quot; işine ait ihtiyacın, 4734 Sayılı Kanun’un 22/d maddesine göre
          karşılanabilmesi amacıyla bütçesindeki kullanılabilir ödenek miktarı
          ve bütçe tertibinin bildirilmesi hususunda;
        </div>

        <div
          style={{
            textIndent: "35px",
            textAlign: "justify",
            marginTop: "12px",
          }}
        >
          Gereğini rica ederim.
        </div>

        {/* SIGNATURE BLOCK */}
        <div
          style={{
            float: "right",
            textAlign: "center",
            marginTop: "35px",
            marginRight: "25px",
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontWeight: "bold" }}>
            <PersonelInlineSelect
              nameField="harcamaYetkilisiAdi"
              unvanField="harcamaYetkilisiUnvan"
              value={
                data.harcamaYetkilisiAdi ||
                data.onaylayanPersonelAdi ||
                data.baskanAdi ||
                data.hazirlayanPersonelAdi ||
                ""
              }
              placeholder="Ad Soyad"
            />
          </div>
          <div style={{ fontSize: "10pt", color: "#333" }}>
            <EditableField
              name="harcamaYetkilisiUnvan"
              value={
                data.harcamaYetkilisiUnvan ||
                data.onaylayanPersonelUnvan ||
                data.baskanUnvan ||
                data.hazirlayanPersonelUnvan ||
                "Harcama Yetkilisi"
              }
              placeholder="Harcama Yetkilisi"
            />
          </div>
        </div>

        <div style={{ clear: "both" }}></div>

        {/* BUDGET INFO SECTION */}
        <div
          style={{
            marginTop: "40px",
            borderTop: "1px dashed #ccc",
            paddingTop: "15px",
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              border: "none",
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "10.5pt",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    fontWeight: "bold",
                    width: "160px",
                    padding: "3px 5px",
                  }}
                >
                  Bütçe Yılı
                </td>
                <td style={{ padding: "3px 5px" }}>:</td>
                <td style={{ padding: "3px 5px" }}>
                  <EditableField
                    name="butceYili"
                    value={data.butceYili !== undefined
                      ? String(data.butceYili)
                      : String(new Date().getFullYear())}
                    placeholder="2026"
                  />
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontWeight: "bold",
                    verticalAlign: "top",
                    padding: "3px 5px",
                  }}
                >
                  Bütçe Tertibi
                </td>
                <td style={{ verticalAlign: "top", padding: "3px 5px" }}>:</td>
                <td style={{ verticalAlign: "top", padding: "3px 5px" }}>
                  {butceTertibiList.length > 0
                    ? (
                      butceTertibiList.map((item: string, idx: number) => (
                        <div key={idx}>
                          <EditableField
                            name={idx === 0 ? "odenekTertibi" : `butceTertibi_${idx}`}
                            value={item}
                            placeholder="Örn: 03.2.1.01"
                          />
                        </div>
                      ))
                    )
                    : (
                      <EditableField
                        name="odenekTertibi"
                        value={typeof butceTertibiVal === "string" && butceTertibiVal !== "-" ? butceTertibiVal : ""}
                        placeholder="Örn: 03.2.1.01"
                      />
                    )}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontWeight: "bold",
                    width: "160px",
                    padding: "3px 5px",
                  }}
                >
                  Kullanılabilir Ödenek
                </td>
                <td style={{ padding: "3px 5px" }}>:</td>
                <td style={{ padding: "3px 5px", fontWeight: "bold" }}>
                  <EditableField
                    name="kullanilabilirOdenek"
                    value={data.kullanilabilirOdenek !== undefined
                      ? String(data.kullanilabilirOdenek)
                      : data.odenekTutari !== undefined
                      ? String(data.odenekTutari)
                      : "Yeterli Ödenek Mevcuttur"}
                    placeholder="Yeterli Ödenek Mevcuttur veya Tutar (TL)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DocumentLayout>
  );
}
