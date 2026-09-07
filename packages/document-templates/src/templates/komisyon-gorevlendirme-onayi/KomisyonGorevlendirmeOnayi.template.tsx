import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import {
  ApprovalSignature,
  DateEditableField,
  EditableOlurPlaceholder,
  PersonelCard,
} from "../../document/ApprovalSignature";
import { KomisyonGorevlendirmeOnayiType } from "./KomisyonGorevlendirmeOnayi.schema";

interface KomisyonGorevlendirmeOnayiProps {
  data?: Partial<KomisyonGorevlendirmeOnayiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function KomisyonGorevlendirmeOnayi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: KomisyonGorevlendirmeOnayiProps) {
  const fiyatUyeleri = data.fiyatKomisyonu || [];
  const muayeneUyeleri = data.muayeneKomisyonu || [];

  const mainHeaderTitle =
    data.idareAdi ||
    data.sunulacakMakamAdi ||
    (data.antetSatirlari && data.antetSatirlari[1]) ||
    data.kurumAdi ||
    "KURUM BAŞKANLIĞINA";

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
          fontSize: "10pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.35,
        }}
      >
        {/* Meta Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
            fontSize: "10pt",
          }}
        >
          <div>
            <table style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: "bold", paddingRight: "6px", whiteSpace: "nowrap" }}>
                    Sayı
                  </td>
                  <td>: <EditableField name="evrakSayisi" value={data.evrakSayisi} /></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold", paddingRight: "6px", whiteSpace: "nowrap" }}>
                    Konu
                  </td>
                  <td>: <EditableField name="konu" value={data.konu || "Görevlendirme"} /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>Tarih:</strong>{" "}
            <DateEditableField
              name="tarih"
              value={data.tarih || data.onayaSunulanTarih || data.dosyaTarihi}
            />
          </div>
        </div>

        {/* Boxed Institution Header */}
        <div style={{ textAlign: "center", margin: "8px 0" }}>
          <div
            style={{
              display: "inline-block",
              padding: "2px 10px",
              fontWeight: "bold",
              fontSize: "11pt",
              textTransform: "uppercase",
            }}
          >
            <EditableField name="sunulacakMakamAdi" value={mainHeaderTitle} placeholder="KURUM BAŞKANLIĞINA" />
          </div>
        </div>

        {/* Body Paragraph */}
        <div
          style={{
            textAlign: "justify",
            textIndent: "25px",
            marginBottom: "8px",
            lineHeight: 1.35,
          }}
        >
          {data.kurumumuz || "Kurumumuz"} bünyesindeki{" "}
          <strong><EditableField name="isAdi" value={data.isAdi || data.isinAdi} placeholder="İşin Adı" /></strong> işine ait fiyat araştırması ile
          muayene ve kabulü yapmak üzere aşağıdaki personeller görevlendirilecek olup,
        </div>
        <div
          style={{
            textAlign: "justify",
            textIndent: "25px",
            marginBottom: "8px",
            lineHeight: 1.35,
          }}
        >
          Gereğini olurlarınıza arz ederim.
        </div>

        {/* Preparer Signature */}
        <PersonelCard
          adSoyad={data.hazirlayanPersonelAdi}
          unvan={data.hazirlayanPersonelUnvan}
          align="right"
          nameField="hazirlayanPersonelAdi"
          unvanField="hazirlayanPersonelUnvan"
          marginTop={4}
          marginBottom={10}
        />

        {/* Table 1: PİYASA ARAŞTIRMA VE SATINALMA KOMİSYONU */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            backgroundColor: "#f2f2f2",
            border: "1px solid #000",
            padding: "3px 5px",
            fontSize: "9.5pt",
            textTransform: "uppercase",
            marginTop: "6px",
          }}
        >
          PİYASA ARAŞTIRMA VE SATINALMA KOMİSYONU
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
            fontSize: "9pt",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "3px 6px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "35%",
                  textAlign: "left",
                }}
              >
                Komisyondaki Sıfatı/Ünvanı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "3px 6px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "40%",
                  textAlign: "left",
                }}
              >
                Adı, Soyadı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "3px 6px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "25%",
                  textAlign: "left",
                }}
              >
                Pozisyonu
              </th>
            </tr>
          </thead>
          <tbody>
            {fiyatUyeleri.length > 0 ? (
              fiyatUyeleri.map((u, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>
                    {u.gorevi || "Üye"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>
                    {u.adSoyad}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>
                    {u.unvan}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    border: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  Komisyon üyesi bulunmamaktadır.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table 2: MUAYENE KABUL VE TESLİM ALMA KOMİSYONU */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            backgroundColor: "#f2f2f2",
            border: "1px solid #000",
            padding: "3px 5px",
            fontSize: "9.5pt",
            textTransform: "uppercase",
          }}
        >
          MUAYENE KABUL VE TESLİM ALMA KOMİSYONU
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
            fontSize: "9pt",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "3px 6px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "35%",
                  textAlign: "left",
                }}
              >
                Komisyondaki Sıfatı/Ünvanı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "3px 6px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "40%",
                  textAlign: "left",
                }}
              >
                Adı, Soyadı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "3px 6px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "25%",
                  textAlign: "left",
                }}
              >
                Pozisyonu
              </th>
            </tr>
          </thead>
          <tbody>
            {muayeneUyeleri.length > 0 ? (
              muayeneUyeleri.map((u, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>
                    {u.gorevi || "Üye"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>
                    {u.adSoyad}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>
                    {u.unvan}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    border: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  Komisyon üyesi bulunmamaktadır.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Approval / OLUR Section */}
        {data.olurYazisi !== false ? (
          <ApprovalSignature
            title="OLUR"
            date={data.onayTarihi || data.tarih || data.dosyaTarihi}
            adSoyad={data.baskanAdi || data.onaylayanPersonelAdi}
            unvan={data.baskanUnvan || data.onaylayanPersonelUnvan}
            nameField="baskanAdi"
            unvanField="baskanUnvan"
            showSpace={true}
            marginTop={12}
          />
        ) : (
          <EditableOlurPlaceholder />
        )}
      </div>
    </DocumentLayout>
  );
}
