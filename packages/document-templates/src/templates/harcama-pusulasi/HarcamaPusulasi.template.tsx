import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField, PersonelCard } from "../../document/ApprovalSignature";
import { HarcamaPusulasiType } from "./HarcamaPusulasi.schema";

interface HarcamaPusulasiProps {
  data?: Partial<HarcamaPusulasiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function HarcamaPusulasi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  hideHeader,
  hideFooter,
}: HarcamaPusulasiProps) {
  const formattedTutar = data.tutar ? `${data.tutar} ₺` : "-";
  const formattedBirimFiyat = data.birimFiyat ? `${data.birimFiyat} ₺` : "-";

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
            marginBottom: "8px",
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
                  fontSize: "12pt",
                  textTransform: "uppercase",
                  padding: "7px",
                  backgroundColor: "#fff",
                }}
              >
                HARCAMA PUSULASI
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

            {/* Dairesi */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Dairesi
              </td>
              <td style={{ border: "1px solid #000", width: "70%", fontWeight: "bold", padding: "4px 7px" }}>
                {data.idareAdi || (data.antetSatirlari && data.antetSatirlari[1]) || "KURUM / BİRİM ADI"}
              </td>
            </tr>

            {/* Section Header */}
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
                SATIN ALINAN MAL VEYA HİZMETİN
              </td>
            </tr>

            {/* Çeşidi */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Çeşidi
              </td>
              <td style={{ border: "1px solid #000", width: "70%", padding: "4px 7px" }}>
                <EditableField name="alimTuru" value={data.alimTuru} placeholder="Alım Türü" />
                {" "}
                (<EditableField name="isAdi" value={data.isAdi} placeholder="İşin Adı" />)
              </td>
            </tr>

            {/* Miktarı */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Miktarı
              </td>
              <td style={{ border: "1px solid #000", width: "70%", padding: "4px 7px" }}>
                <EditableField name="miktar" value={data.miktar} placeholder="Miktar" />
              </td>
            </tr>

            {/* Birim Fiyat */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Birim Fiyatı
              </td>
              <td style={{ border: "1px solid #000", width: "70%", padding: "4px 7px" }}>
                <EditableField name="birimFiyat" value={data.birimFiyat ? String(data.birimFiyat) : ""} placeholder="Birim Fiyat" /> ₺
              </td>
            </tr>

            {/* Tutarı */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "4px 7px" }}>
                Tutarı
              </td>
              <td style={{ border: "1px solid #000", width: "70%", fontWeight: "bold", padding: "4px 7px" }}>
                <EditableField name="tutar" value={data.tutar ? String(data.tutar) : ""} placeholder="Tutar" /> ₺
              </td>
            </tr>

            {/* Yalnız (Yazı ile) */}
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  fontSize: "10pt",
                  padding: "6px 8px",
                }}
              >
                Yalnız <EditableField name="tutarYazi" value={data.tutarYazi} placeholder="(yazı ile tutar)" /> TL.sıdır.
              </td>
            </tr>

            {/* Açıklama */}
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  textAlign: "justify",
                }}
              >
                <strong>Açıklama:</strong>
                <div style={{ marginTop: "4px", textIndent: "20px" }}>
                  <EditableField
                    name="aciklama"
                    value={data.aciklama}
                    multiline
                    placeholder="Açıklama giriniz..."
                  />
                </div>
              </td>
            </tr>

            {/* Tarih and Signatures Inner Block */}
            <tr>
              <td colSpan={2} style={{ border: "1px solid #000", padding: "6px 8px" }}>
                <table
                  style={{
                    width: "100%",
                    tableLayout: "fixed",
                    borderCollapse: "collapse",
                    marginTop: "8px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          textAlign: "center",
                          fontWeight: "bold",
                          backgroundColor: "#fff",
                          padding: "4px",
                          width: "50%",
                          fontSize: "9.5pt",
                        }}
                      >
                        Malı Satan veya Hizmeti Yapanın
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          textAlign: "center",
                          fontWeight: "bold",
                          backgroundColor: "#fff",
                          padding: "4px",
                          width: "50%",
                          fontSize: "9.5pt",
                        }}
                      >
                        Satın Almayı veya Hizmeti Yaptıranın
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", minHeight: "85px", lineHeight: 1.4, padding: "8px", verticalAlign: "top", fontSize: "9pt" }}>
                        <div>
                          <strong>T.C. Kimlik No :</strong>{" "}
                          <EditableField name="saticiTcNo" value={data.saticiTcNo} placeholder="TC Kimlik No" />
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <strong>Adı Soyadı :</strong>{" "}
                          <EditableField name="saticiAdiSoyadi" value={data.saticiAdiSoyadi} placeholder="Satıcı Adı Soyadı" />
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <strong>Adresi :</strong>{" "}
                          <EditableField name="saticiAdres" value={data.saticiAdres} placeholder="Satıcı Adresi" />
                        </div>
                        <div style={{ marginTop: "10px", fontStyle: "italic", color: "#888" }}>(İmza)</div>
                      </td>
                      <td style={{ border: "1px solid #000", textAlign: "center", verticalAlign: "top", minHeight: "85px", padding: "8px" }}>
                        <div style={{ marginBottom: "4px", fontWeight: "bold", fontSize: "9.5pt", color: "#555" }}>
                          Harcama Yetkilisi
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

                <div style={{ fontSize: "8pt", color: "#444", textAlign: "justify", marginTop: "8px", lineHeight: 1.3 }}>
                  <strong>Not:</strong> Bu belge, fatura veya fatura yerine geçen belgeleri düzenleme
                  zorunluluğu bulunmayan kişilerden yapılan iş, mal veya hizmet alımlarında düzenlenir.
                  Taksi ile yapılan seyahatlerde (şehir içi taksi ücretleri hariç) seyahat edilen
                  taksinin plaka numarası ile yolculuğun nereden nereye yapıldığı açıklama bölümünde
                  belirtilir.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
