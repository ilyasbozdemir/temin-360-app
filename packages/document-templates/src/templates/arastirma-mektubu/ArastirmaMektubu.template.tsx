import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import {
  DateEditableField,
  MetadataBlock,
} from "../../document/ApprovalSignature";
import { TableRowSplitDivider } from "../../document/TableRowSplitDivider";
import { ArastirmaMektubuType } from "./ArastirmaMektubu.schema";


interface ArastirmaMektubuProps {
  data?: Partial<ArastirmaMektubuType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function ArastirmaMektubu({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: ArastirmaMektubuProps) {
  const items = data.ihtiyacKalemleri || [];
  const komisyon = data.gorevlendirilenler || [];
  const firstPageLimit = data.firstPageLimit
    ? Number(data.firstPageLimit)
    : null;

  const isMultiPage = firstPageLimit !== null && items.length > firstPageLimit;
  const page1Items = isMultiPage ? items.slice(0, firstPageLimit) : items;
  const page2Items = isMultiPage ? items.slice(firstPageLimit) : [];

  const renderTableHead = () => (
    <thead>
      <tr style={{ backgroundColor: "#f2f2f2" }}>
        <th
          style={{
            border: "1px solid #000",
            padding: "6px",
            width: "5%",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Sıra
        </th>
        <th
          style={{
            border: "1px solid #000",
            padding: "6px",
            width: "35%",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          Malzeme/Hizmet Adı
        </th>
        <th
          style={{
            border: "1px solid #000",
            padding: "6px",
            width: "25%",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          Özelliği
        </th>
        <th
          style={{
            border: "1px solid #000",
            padding: "6px",
            width: "10%",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Birimi
        </th>
        <th
          style={{
            border: "1px solid #000",
            padding: "6px",
            width: "10%",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Miktarı
        </th>
        <th
          style={{
            border: "1px solid #000",
            padding: "6px",
            width: "15%",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Birim Fiyatı
        </th>
        <th
          style={{
            border: "1px solid #000",
            padding: "6px",
            width: "15%",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Tutarı
        </th>
      </tr>
    </thead>
  );

  const renderTableRows = (rowItems: typeof items, startIndex = 0) => (
    <tbody>
      {rowItems.length > 0 ? (
        rowItems.map((item, idx) => {
          const rowNum = startIndex + idx + 1;
          return (
            <React.Fragment key={idx}>
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px",
                    textAlign: "center",
                  }}
                >
                  {item.siraNo || rowNum}
                </td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>
                  {item.malzemeAdi}
                </td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>
                  {item.ozelligi || "-"}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px",
                    textAlign: "center",
                  }}
                >
                  {item.birimi || "-"}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px",
                    textAlign: "right",
                  }}
                >
                  {item.miktar}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px",
                    textAlign: "right",
                  }}
                >
                  {item.birimFiyat ? `${item.birimFiyat} ₺` : ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px",
                    textAlign: "right",
                  }}
                >
                  {item.tutar ? `${item.tutar} ₺` : ""}
                </td>
              </tr>
              {/* On-Hover & Active Split Row Divider */}
              <TableRowSplitDivider
                rowIndex={rowNum}
                colSpan={7}
                currentSplitIndex={firstPageLimit}
              />
            </React.Fragment>
          );
        })
      ) : (

          <tr>
            <td
              colSpan={7}
              style={{
                border: "1px solid #000",
                padding: "8px",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Kalem bulunamadı
            </td>
          </tr>
        )}
    </tbody>
  );

  const renderPage1 = (isSinglePage: boolean) => (
    <DocumentLayout
      data={data as any}
      hideFooter={false}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={isSinglePage ? 1 : 2}
    >
      <div
        style={{
          width: "100%",
          fontSize: "12pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.5,
        }}
      >
        <MetadataBlock
          evrakSayisi={data.evrakSayisi || data.detsisNo}
          tarih={data.dosyaTarihi || data.tarih}
          dosyaKonusu={data.dosyaKonusu}
          showBorder={false}
        />

        <div
          style={{
            marginTop: "18px",
            marginBottom: "14px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "12pt" }}>
            <EditableField
              name="sayinIlgili"
              value={data.sayinIlgili || (data.firmaUnvani ? `Sayın ${data.firmaUnvani}` : "Sayın İlgili,")}
              placeholder="Sayın [Firma Unvanı] / Sayın İlgili,"
            />
          </div>
          <div style={{ fontSize: "10.5pt", color: "#222", marginTop: "2px", textAlign: "center" }}>
            <div>
              <EditableField
                name="firmaAdresi"
                value={data.firmaAdresi || data.adres || ""}
                placeholder="Firma Adresi"
              />
            </div>
            <div style={{ fontWeight: "bold" }}>
              <EditableField
                name="firmaSehir"
                value={data.firmaSehir || data.sehir || ""}
                placeholder="İlçe / İL"
              />
            </div>
          </div>
        </div>

        <div
          style={{
            textIndent: "40px",
            textAlign: "justify",
            marginBottom: "20px",
            lineHeight: 1.5,
          }}
        >
          {data.aciklamaMetni
            ? (
              <EditableField
                name="aciklamaMetni"
                value={data.aciklamaMetni}
                multiline
                placeholder="Açıklama Metni"
              />
            )
            : (
              "Aşağıda cins ve miktarları belirtilen mal/hizmet kalemlerinin yaklaşık maliyet tespiti için piyasa araştırması yapılmaktadır, birim fiyatlarını KDV hariç bildirmenizi rica ederim/ederiz."
            )}
        </div>

        {/* KOMİSYON ÜYELERİ TABLOSU */}
        {komisyon.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "20px 0",
              textAlign: "center",
            }}
          >
            <tbody>
              <tr>
                {komisyon.map((uye, idx) => (
                  <td
                    key={idx}
                    style={{
                      verticalAlign: "top",
                      fontSize: "10pt",
                      padding: "5px",
                      lineHeight: 1.3,
                      width: `${100 / komisyon.length}%`,
                    }}
                  >
                    <strong>{uye.komisyonGorevi}</strong>
                    <br />
                    {uye.adSoyad}
                    <br />
                    {uye.unvan}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}

        {/* MALZEME/HİZMET LİSTESİ TABLOSU */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            fontSize: "10pt",
          }}
        >
          {renderTableHead()}
          {renderTableRows(page1Items, 0)}
        </table>

        {/* EĞER TEK SAYFAYSA İMZA ALANINI BURADA GÖSTER */}
        {isSinglePage && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: "30px",
              fontSize: "11pt",
              lineHeight: 1.8,
            }}
          >
            <div style={{ fontStyle: "italic", color: "#333" }}>
              Para Birimi: Türk Lirası (TL)
            </div>
            <div style={{ textAlign: "right", marginLeft: "auto" }}>
              Tarih:{" "}
              <DateEditableField
                name="tarih"
                value={data.tarih || data.dosyaTarihi}
                placeholder=".…../.…../20…"
              />
              <br />
              Kaşe:
              <br />
              <br />
              İmza:
            </div>
          </div>
        )}
      </div>
    </DocumentLayout>
  );

  const renderPage2 = () => (
    <DocumentLayout
      data={data as any}
      hideFooter={false}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={2}
      totalPages={2}
      hideHeader={true}
    >
      <div
        style={{
          width: "100%",
          fontSize: "12pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.5,
        }}
      >
        <div
          style={{ fontWeight: "bold", fontSize: "11pt", marginBottom: "10px" }}
        >
          Piyasa Fiyat Araştırma Mektubu (Devamı)
        </div>

        {/* TABLO DEVAMI */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            fontSize: "10pt",
          }}
        >
          {renderTableHead()}
          {renderTableRows(page2Items, firstPageLimit || 0)}
        </table>

        {/* 2. SAYFA FİRMA YETKİLİSİ İMZA ALANI */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: "35px",
            fontSize: "11pt",
            lineHeight: 1.8,
          }}
        >
          <div style={{ fontStyle: "italic", color: "#333" }}>
            Para Birimi: Türk Lirası (TL)
          </div>
          <div style={{ textAlign: "right", marginLeft: "auto" }}>
            Tarih:{" "}
            <DateEditableField
              name="tarih"
              value={data.tarih || data.dosyaTarihi}
              placeholder=".…../.…../20…"
            />
            <br />
            Kaşe:
            <br />
            <br />
            İmza:
          </div>
        </div>
      </div>
    </DocumentLayout>
  );

  if (!isMultiPage) {
    return renderPage1(true);
  }

  return (
    <>
      {renderPage1(false)}
      {renderPage2()}
    </>
  );
}
