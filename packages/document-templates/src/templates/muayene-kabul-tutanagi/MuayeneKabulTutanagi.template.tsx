import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { MuayeneKabulTutanagiData } from "./MuayeneKabulTutanagi.schema";

interface Props {
  data?: Partial<MuayeneKabulTutanagiData> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const MuayeneKabulTutanagi: React.FC<Props> = ({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  hideHeader = false,
  hideFooter = false,
}) => {
  // Evrak numarası & tarih
  const evrakNo =
    data.evrakSayisi || (data as any).tutanakNo || "................";
  const tarih = data.kabulTarihi || data.dosyaTarihi || data.tarih || "";

  // Kalemler
  const items = data.ihtiyacKalemleri || [];

  // Firma, fatura & irsaliye
  const firma = data.yukleniciFirma || "................";
  const faturaNo = data.faturaNo || "";
  const faturaTarihi = data.faturaTarihi || "";
  const irsaliyeNo = data.irsaliyeNo || "";
  const irsaliyeTarihi = data.irsaliyeTarihi || "";
  const kabulTarihi = data.kabulTarihi || tarih || "..../..../20....";
  const tutar =
    data.genelToplam ||
    data.kdvDahilToplam ||
    data.tutar ||
    "................";
  const tutanakNotu = data.tutanakNotu || (data as any).notlar || "";

  // Komisyon heyeti
  const komisyon: Array<{ gorevi?: string; adSoyad?: string; unvan?: string }> =
    (() => {
      if (
        data.muayeneKomisyonu &&
        Array.isArray(data.muayeneKomisyonu) &&
        data.muayeneKomisyonu.length > 0
      ) {
        return data.muayeneKomisyonu.map((u: any) => ({
          gorevi: u.gorevi || u.gorev || "Üye",
          adSoyad: u.adSoyad || u.ad_soyad || "",
          unvan: u.unvan || "",
        }));
      }
      if (
        data.onaylayanlar &&
        Array.isArray(data.onaylayanlar) &&
        data.onaylayanlar.length > 0
      ) {
        return data.onaylayanlar.map((u: any) => ({
          gorevi: "Görevli",
          adSoyad: u.onaylayanPersonelAdi || "",
          unvan: u.onaylayanPersonelUnvan || "",
        }));
      }
      return [];
    })();

  // OLUR
  const showOlur = data.olurGoster === true;
  const baskanAdi = data.baskanAdi || "................";
  const baskanUnvan = data.baskanUnvan || "Harcama Yetkilisi";

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
        {/* BAŞLIK */}
        <div
          style={{
            textAlign: "center",
            fontSize: "13pt",
            fontWeight: "bold",
            paddingBottom: "16px",
            paddingTop: "6px",
          }}
        >
          MUAYENE VE KABUL TUTANAĞI
        </div>

        {/* INFO BLOCK (Tarih / Sayı / İrsaliye) */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "12px",
            fontSize: "11pt",
            lineHeight: 1.6,
          }}
        >
          <tbody>
            <tr>
              <td style={{ width: "50%", verticalAlign: "top" }}>
                Sayı &nbsp;&nbsp;&nbsp;:{" "}
                <EditableField name="evrakSayisi" value={evrakNo} />
              </td>
              <td
                style={{
                  width: "50%",
                  textAlign: "right",
                  verticalAlign: "top",
                }}
              >
                <div>
                  Tarih: <DateEditableField name="kabulTarihi" value={tarih} />
                </div>
                {irsaliyeNo && (
                  <div style={{ fontSize: "10pt", color: "#334155", marginTop: "2px" }}>
                    <b>İrsaliye:</b>{" "}
                    <EditableField name="irsaliyeNo" value={irsaliyeNo} />
                    {irsaliyeTarihi && (
                      <span>
                        {" "}(<DateEditableField name="irsaliyeTarihi" value={irsaliyeTarihi} />)
                      </span>
                    )}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ITEMS TABLE */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            marginBottom: "14px",
            fontSize: "9.5pt",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#e2e8f0" }}>
              <th
                style={{
                  border: "1px solid #94a3b8",
                  padding: "5px 4px",
                  width: "4%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Sıra
              </th>
              <th
                style={{
                  border: "1px solid #94a3b8",
                  padding: "5px 6px",
                  width: "22%",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Malzeme Adı
              </th>
              <th
                style={{
                  border: "1px solid #94a3b8",
                  padding: "5px 6px",
                  width: "16%",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Özelliği
              </th>
              <th
                style={{
                  border: "1px solid #94a3b8",
                  padding: "5px 4px",
                  width: "7%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Birimi
              </th>
              <th
                style={{
                  border: "1px solid #94a3b8",
                  padding: "5px 4px",
                  width: "7%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Miktarı
              </th>
              <th
                style={{
                  border: "1px solid #94a3b8",
                  padding: "5px 4px",
                  width: "12%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Bugüne Kadar Kabul
              </th>
              <th
                style={{
                  border: "1px solid #94a3b8",
                  padding: "5px 4px",
                  width: "12%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Bugün Kabul
              </th>
              <th
                style={{
                  border: "1px solid #94a3b8",
                  padding: "5px 4px",
                  width: "8%",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Kalan Miktar
              </th>
              <th
                style={{
                  border: "1px solid #94a3b8",
                  padding: "5px 6px",
                  width: "12%",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Teslim Yeri
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    border: "1px solid #94a3b8",
                    padding: "10px",
                    textAlign: "center",
                    color: "#64748b",
                    fontStyle: "italic",
                  }}
                >
                  Kayıtlı malzeme kalemi bulunamadı.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      border: "1px solid #94a3b8",
                      padding: "4px",
                      textAlign: "center",
                    }}
                  >
                    {item.siraNo || idx + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #94a3b8",
                      padding: "4px 6px",
                      textAlign: "left",
                    }}
                  >
                    {item.malzemeAdi || "—"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #94a3b8",
                      padding: "4px 6px",
                      textAlign: "left",
                    }}
                  >
                    {item.ozelligi || "—"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #94a3b8",
                      padding: "4px",
                      textAlign: "center",
                    }}
                  >
                    {item.birimi || "Adet"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #94a3b8",
                      padding: "4px",
                      textAlign: "right",
                    }}
                  >
                    {item.miktar ?? 0}
                  </td>
                  <td
                    style={{
                      border: "1px solid #94a3b8",
                      padding: "4px",
                      textAlign: "right",
                    }}
                  >
                    {item.buguneKadarKabulEdilen ?? 0}
                  </td>
                  <td
                    style={{
                      border: "1px solid #94a3b8",
                      padding: "4px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {item.bugunKabulEdilenMiktar ?? item.miktar ?? 0}
                  </td>
                  <td
                    style={{
                      border: "1px solid #94a3b8",
                      padding: "4px",
                      textAlign: "right",
                    }}
                  >
                    {item.kalanMiktar ?? 0}
                  </td>
                  <td
                    style={{
                      border: "1px solid #94a3b8",
                      padding: "4px 6px",
                      textAlign: "left",
                    }}
                  >
                    {item.teslimYeri || "Kurum Ambarı"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* NOTLAR ALANI */}
        {tutanakNotu && (
          <div
            style={{
              padding: "8px 12px",
              marginBottom: "12px",
              backgroundColor: "#f8fafc",
              border: "1px dashed #94a3b8",
              borderRadius: "4px",
              fontSize: "10pt",
              color: "#334155",
            }}
          >
            <strong>Muayene ve Tespit Notları:</strong>{" "}
            <EditableField name="tutanakNotu" value={tutanakNotu} />
          </div>
        )}

        {/* TUTANAK PARAGRAFI */}
        <div
          style={{
            textAlign: "justify",
            lineHeight: 1.6,
            fontSize: "11pt",
            marginTop: "12px",
            marginBottom: "24px",
          }}
        >
          <EditableField name="yukleniciFirma" value={firma} /> tarafından{" "}
          {faturaNo ? (
            <>
              <EditableField
                name="faturaTarihi"
                value={faturaTarihi || "..../..../20...."}
              />{" "}
              tarih ve <EditableField name="faturaNo" value={faturaNo} /> no’lu
              faturayla
              {irsaliyeNo ? (
                <>
                  {" "}ve{" "}
                  <EditableField
                    name="irsaliyeTarihi"
                    value={irsaliyeTarihi || "..../..../20...."}
                  />{" "}
                  tarih ve{" "}
                  <EditableField name="irsaliyeNo" value={irsaliyeNo} /> no’lu
                  sevk irsaliyesiyle
                </>
              ) : null}
            </>
          ) : irsaliyeNo ? (
            <>
              <EditableField
                name="irsaliyeTarihi"
                value={irsaliyeTarihi || "..../..../20...."}
              />{" "}
              tarih ve <EditableField name="irsaliyeNo" value={irsaliyeNo} />{" "}
              no’lu sevk irsaliyesiyle
            </>
          ) : (
            <>..../..../20.... tarihli faturayla</>
          )}{" "}
          KDV hariç <EditableField name="genelToplam" value={tutar} /> TL ye
          doğrudan temin yoluyla alınan,{" "}
          <EditableField name="kabulTarihi" value={kabulTarihi} /> tarihinde
          teslim edilen ve yukarıda cins, birim ve miktarı belirtilen
          mal/hizmet kalemleri, doğrudan temin kapsamında istenilen şartlara
          göre tarafımızca muayene edilmiştir. Söz konusu mal kalemlerinden
          niteliklere uygun olanların (kabul edilenlerin) teslim alınmasında ve
          kullanılmasında herhangi bir sakınca yoktur.
        </div>

        {/* SIGNATURES BLOCK */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "11pt",
            marginBottom: "16px",
          }}
        >
          Muayene Komisyon Görevlileri
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
            fontSize: "11pt",
            marginBottom: "20px",
          }}
        >
          <tbody>
            <tr>
              {komisyon.length === 0 ? (
                <td style={{ padding: "10px", color: "#64748b" }}>
                  Muayene komisyonu üyesi atanmamış.
                </td>
              ) : (
                komisyon.map((uye, idx) => (
                  <td
                    key={idx}
                    style={{
                      width: `${Math.floor(100 / komisyon.length)}%`,
                      padding: "10px 6px",
                      verticalAlign: "top",
                      lineHeight: 1.4,
                    }}
                  >
                    <span>{uye.gorevi}</span>
                    <br />
                    <span style={{ fontWeight: "bold" }}>{uye.adSoyad}</span>
                    <br />
                    <span>{uye.unvan}</span>
                  </td>
                ))
              )}
            </tr>
          </tbody>
        </table>

        {/* OLUR SECTION */}
        {showOlur && (
          <div
            style={{
              marginTop: "24px",
              textAlign: "center",
              lineHeight: 1.4,
              fontSize: "11pt",
            }}
          >
            <b>OLUR</b>
            <br />
            <span
              style={{
                fontWeight: "bold",
                display: "block",
                marginTop: "10px",
              }}
            >
              <EditableField name="baskanAdi" value={baskanAdi} />
            </span>
            <span>
              <EditableField name="baskanUnvan" value={baskanUnvan} />
            </span>
          </div>
        )}
      </div>
    </DocumentLayout>
  );
};
