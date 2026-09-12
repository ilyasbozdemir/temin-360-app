import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField, PersonelCard } from "../../document/ApprovalSignature";
import { HarcamaTalimatiType } from "./HarcamaTalimati.schema";

interface HarcamaTalimatiProps {
  data?: Partial<HarcamaTalimatiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function HarcamaTalimati({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  hideHeader,
  hideFooter,
}: HarcamaTalimatiProps) {
  const renderArrayOrString = (val: any, fallback = "-") => {
    if (!val) return fallback;
    if (Array.isArray(val)) {
      if (val.length === 0) return fallback;
      return val.map((item, idx) => <div key={idx}>{String(item)}</div>);
    }
    return String(val);
  };

  const formattedYaklasikMaliyet = data.yaklasikMaliyet
    ? `${data.yaklasikMaliyet} ₺`
    : "-";

  const shouldHideHeader =
    hideHeader !== undefined
      ? hideHeader
      : (data as any)?.hideHeader !== undefined
      ? (data as any).hideHeader
      : true;

  const shouldHideFooter =
    hideFooter !== undefined
      ? hideFooter
      : (data as any)?.hideFooter !== undefined
      ? (data as any).hideFooter
      : true;

  return (
    <DocumentLayout
      data={data as any}
      hideHeader={shouldHideHeader}
      hideFooter={shouldHideFooter}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={1}
    >
      <div style={{ width: "100%", fontSize: "10pt", color: "#000", fontFamily: "'Times New Roman', Times, serif" }}>
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            border: "1px solid #000",
            marginBottom: "6px",
          }}
        >
          <tbody>
            {/* Title */}
            <tr>
              <th
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "11.5pt",
                  textTransform: "uppercase",
                  padding: "6px",
                  backgroundColor: "#fff",
                }}
              >
                HARCAMA TALİMATI
              </th>
            </tr>

            {/* Sayı and Tarih */}
            <tr>
              <td style={{ border: "1px solid #000", width: "50%", fontWeight: "bold", padding: "4px 7px" }}>
                Sayı: <EditableField name="evrakSayisi" value={data.evrakSayisi} placeholder="E-00000000-934.01-0001" />
              </td>
              <td style={{ border: "1px solid #000", width: "50%", fontWeight: "bold", textAlign: "right", padding: "4px 7px" }}>
                Tarih: <DateEditableField name="tarih" value={data.tarih} placeholder="GG.AA.YYYY" />
              </td>
            </tr>

            {/* Harcama Talebinde Bulunan Birim */}
            <tr>
              <td colSpan={2} style={{ border: "1px solid #000", fontWeight: "bold", padding: "4px 7px 2px 7px" }}>
                Harcama Talebinde Bulunan Birim:
              </td>
            </tr>
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "10.5pt",
                  padding: "5px 7px",
                  textTransform: "uppercase",
                }}
              >
                {data.idareAdi || (data.antetSatirlari && data.antetSatirlari[1]) || "KURUM / BİRİM ADI"}
              </td>
            </tr>

            {/* YAPILACAK HARCAMANIN */}
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#fff",
                  fontSize: "10pt",
                  textTransform: "uppercase",
                  padding: "5px",
                }}
              >
                YAPILACAK HARCAMANIN
              </td>
            </tr>

            {/* Gerekçe ve hukuki dayanak */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Gerekçesi ve Hukuki Dayanağı
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "4px 7px" }}>
                <EditableField name="gerekce" value={data.gerekce} multiline placeholder="Gerekçe" />
              </td>
            </tr>

            {/* Konusu / Nev'i / Niteliği */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Konusu / Nev'i / Niteliği
              </td>
              <td style={{ border: "1px solid #000", width: "65%", fontWeight: "bold", padding: "4px 7px" }}>
                <EditableField name="isAdi" value={data.isAdi || data.konu} placeholder="İşin Adı" style={{ width: "100%" }} />
              </td>
            </tr>

            {/* Miktarı */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Miktarı
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "4px 7px" }}>
                <EditableField name="miktar" value={data.miktar} placeholder="Miktar" />
              </td>
            </tr>

            {/* Gerçekleştirme Süresi */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Gerçekleştirme Süresi
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "4px 7px" }}>
                <EditableField name="sure" value={data.sure} placeholder="Gerçekleştirme Süresi" />
              </td>
            </tr>

            {/* Gerçekleştirme Usulü */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Gerçekleştirme Usulü
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "4px 7px" }}>
                <EditableField name="teminSekli" value={data.teminSekli} placeholder="Gerçekleştirme Usulü" />
              </td>
            </tr>

            {/* Tutarı veya yaklaşık bedeli */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Tutarı veya Yaklaşık Bedeli
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "4px 7px" }}>
                {formattedYaklasikMaliyet}
              </td>
            </tr>

            {/* Kullanılabilir ödenek tutarı */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Kullanılabilir Ödenek Tutarı
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "4px 7px" }}>
                <EditableField name="odenekTutari" value={data.odenekTutari ? String(data.odenekTutari) : ""} placeholder="Kullanılabilir Ödenek Tutarı" />
              </td>
            </tr>

            {/* Ödeneğin bütçe tertibi */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Ödeneğin Bütçe Tertibi
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "4px 7px" }}>
                {renderArrayOrString(data.butceTertibi)}
              </td>
            </tr>

            {/* Gerçekleştirme görevlileri */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Gerçekleştirme Görevlileri
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "4px 7px" }}>
                {renderArrayOrString(
                  data.gerceklestirmeGorevlileri,
                  data.hazirlayanPersonelAdi
                    ? `${data.hazirlayanPersonelAdi} (${data.hazirlayanPersonelUnvan || ""})`
                    : "-"
                )}
              </td>
            </tr>

            {/* AÇIKLAMALAR */}
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#fff",
                  fontSize: "10pt",
                  textTransform: "uppercase",
                  padding: "4px",
                }}
              >
                AÇIKLAMALAR
              </td>
            </tr>
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  fontSize: "9.5pt",
                  textAlign: "justify",
                  padding: "5px 7px",
                  whiteSpace: "pre-wrap",
                }}
              >
                <EditableField name="aciklama" value={data.aciklama || data.isinAciklamasi || data.isAdi || data.isinAdi || data.gerekce} multiline placeholder="Açıklama giriniz..." />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ONAY BLOCK */}
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            border: "1px solid #000",
          }}
        >
          <tbody>
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#fff",
                  fontSize: "10pt",
                  textTransform: "uppercase",
                  padding: "3px",
                }}
              >
                ONAY
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  borderBottom: "none",
                  width: "50%",
                  verticalAlign: "top",
                  padding: "5px 7px",
                  textAlign: "justify",
                  fontSize: "9pt",
                }}
              >
                Yukarıda belirtilen harcamanın yaptırılması için harcama yetkilisi mutemedi{" "}
                <strong>{data.mutemetAdi || "......"}</strong>‘a, işin tutarı,{" "}
                <strong>{data.isTutari || data.yaklasikMaliyet || "......"} ₺</strong>, avans verilmesi hususu olurlarınıza arz olunur.
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  borderBottom: "none",
                  width: "50%",
                  verticalAlign: "middle",
                  textAlign: "center",
                  padding: "5px 7px",
                  fontWeight: "bold",
                  fontSize: "10.5pt",
                }}
              >
                OLUR
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  width: "50%",
                  padding: "6px 8px",
                  textAlign: "center",
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontSize: "9.5pt" }}>
                  Teklif Eden Yetkili<br />
                  <DateEditableField name="sunumTarihi" value={data.sunumTarihi || data.tarih} placeholder="GG.AA.YYYY" />
                </div>
                <PersonelCard
                  adSoyad={data.hazirlayanPersonelAdi}
                  unvan={data.hazirlayanPersonelUnvan}
                  nameField="hazirlayanPersonelAdi"
                  unvanField="hazirlayanPersonelUnvan"
                  placeholderName="Hazırlayan Adı Soyadı"
                  placeholderUnvan="Unvanı"
                  marginTop={4}
                  marginBottom={0}
                />
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  width: "50%",
                  padding: "6px 8px",
                  textAlign: "center",
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontSize: "9.5pt" }}>
                  Harcama Yetkilisi<br />
                  <DateEditableField name="olurTarihi" value={data.olurTarihi || data.onayTarihi || data.tarih} placeholder="GG.AA.YYYY" />
                </div>
                <PersonelCard
                  adSoyad={data.onaylayanPersonelAdi}
                  unvan={data.onaylayanPersonelUnvan}
                  nameField="onaylayanPersonelAdi"
                  unvanField="onaylayanPersonelUnvan"
                  placeholderName="Onaylayan Adı Soyadı"
                  placeholderUnvan="Unvanı"
                  marginTop={4}
                  marginBottom={0}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
