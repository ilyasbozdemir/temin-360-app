import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import {
  ApprovalSignature,
  DateEditableField,
  EditableOlurPlaceholder,
} from "../../document/ApprovalSignature";
import { TableRowSplitDivider } from "../../document/TableRowSplitDivider";
import { PiyasaFiyatArastirmaTutanagiData } from "./PiyasaFiyatArastirmaTutanagi.schema";
import { usePiyasaFiyatArastirmaTutanagi } from "./PiyasaFiyatArastirmaTutanagi.hook";

interface Props {
  data?: Partial<PiyasaFiyatArastirmaTutanagiData> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export const PiyasaFiyatArastirmaTutanagi: React.FC<Props> = ({
  data = {},
  pageSize = "A4",
  orientation = "landscape",
}) => {
  const {
    idareAdi,
    kurumAdi,
    dosyaTarihi,
    evrakSayisi,
    tarih,
    isAdi,
    isBasligi,
    aciklama,
    displayFirmalar,
    processedKalemler,
    displayFirmaToplamlari,
    formattedGenelToplam,
    displayKomisyon,
    baskanAdi,
    baskanUnvan,
    hesaplamaEsasiText,
    olurYazisi,
    formatMoney,
  } = usePiyasaFiyatArastirmaTutanagi(data);

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
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: "9.5pt",
          color: "#000",
          lineHeight: 1.35,
          width: "100%",
        }}
      >
        {/* BAŞLIK VE META BİLGİLER */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            textDecoration: "underline",
            marginBottom: "12px",
            fontSize: "11.5pt",
            textTransform: "uppercase",
          }}
        >
          PİYASA FİYAT ARAŞTIRMA TUTANAĞI
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
            fontSize: "9.5pt",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  textAlign: "left",
                  width: "70%",
                  verticalAlign: "top",
                }}
              >
                <strong>İdarenin Adı:</strong>{" "}
                <EditableField
                  name="idareAdi"
                  value={idareAdi || kurumAdi || ""}
                  placeholder="İdare Adı"
                />
                <br />
                <strong>{isBasligi}</strong>{" "}
                <EditableField
                  name="isAdi"
                  value={isAdi}
                  placeholder="İşin Adı"
                />
                <br />
                <strong>
                  Onay Belgesi Tarihi:
                </strong>{" "}
                <DateEditableField name="dosyaTarihi" value={dosyaTarihi} />
                <br />
                <strong>
                  Sayı:
                </strong>{" "}
                <EditableField name="evrakSayisi" value={evrakSayisi} />
              </td>
              <td
                style={{
                  textAlign: "right",
                  width: "30%",
                  verticalAlign: "top",
                }}
              >
                <strong>Düzenleme Tarihi:</strong>{" "}
                <DateEditableField name="tarih" value={tarih} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* TABLO 1: FİYAT TEKLİFLERİ */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            margin: "10px 0 5px 0",
            fontSize: "9.5pt",
            textTransform: "uppercase",
            backgroundColor: "#f2f2f2",
            border: "1px solid #000",
            padding: "3px 0",
          }}
        >
          GERÇEK / TÜZEL KİŞİLERİN FİYAT TEKLİFLERİ
        </div>

        {(() => {
          const firmCount = Math.max(1, displayFirmalar.length);
          // Base non-firm columns total percentage:
          const baseTotalPct = firmCount === 1 ? 50 : firmCount === 2 ? 42 : firmCount === 3 ? 36 : 32;
          const firmTotalPct = 100 - baseTotalPct;
          const perFirmPct = firmTotalPct / firmCount;
          const perPricePct = perFirmPct / 2;

          const siraPct = 3.5;
          const birimPct = 4.5;
          const miktarPct = 4.5;
          const remainingBase = baseTotalPct - (siraPct + birimPct + miktarPct);
          const malzemePct = remainingBase * 0.54;
          const ozellikPct = remainingBase * 0.46;

          return (
            <table
              style={{
                width: "100%",
                maxWidth: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                marginBottom: "8px",
                fontSize: firmCount >= 4 ? "7.5pt" : firmCount === 3 ? "8pt" : "8.5pt",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                boxSizing: "border-box",
              }}
            >
              <colgroup>
                <col style={{ width: `${siraPct}%` }} />
                <col style={{ width: `${malzemePct}%` }} />
                <col style={{ width: `${ozellikPct}%` }} />
                <col style={{ width: `${birimPct}%` }} />
                <col style={{ width: `${miktarPct}%` }} />
                {displayFirmalar.map((_: any, idx: number) => (
                  <React.Fragment key={idx}>
                    <col style={{ width: `${perPricePct}%` }} />
                    <col style={{ width: `${perPricePct}%` }} />
                  </React.Fragment>
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "center",
                      backgroundColor: "#f2f2f2",
                      fontWeight: "bold",
                    }}
                  >
                    Sıra No
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "center",
                      backgroundColor: "#f2f2f2",
                      fontWeight: "bold",
                    }}
                  >
                    Mal / Hizmet / Yapım İşi
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "center",
                      backgroundColor: "#f2f2f2",
                      fontWeight: "bold",
                    }}
                  >
                    Özelliği
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "center",
                      backgroundColor: "#f2f2f2",
                      fontWeight: "bold",
                    }}
                  >
                    Birim
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "center",
                      backgroundColor: "#f2f2f2",
                      fontWeight: "bold",
                    }}
                  >
                    Miktar
                  </th>
                  {displayFirmalar.map((f: any, idx: number) => (
                    <th
                      key={idx}
                      colSpan={2}
                      style={{
                        border: "1px solid #000",
                        padding: "3px 2px",
                        textAlign: "center",
                        backgroundColor: "#f2f2f2",
                        fontWeight: "bold",
                        fontSize: firmCount >= 4 ? "7pt" : firmCount === 3 ? "7.5pt" : "8.5pt",
                        lineHeight: 1.15,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <EditableField
                        name={`firmalar.${idx}.unvan`}
                        value={f.unvan || `Firma ${idx + 1}`}
                        placeholder={`Firma ${idx + 1}`}
                      />
                    </th>
                  ))}
                </tr>
                <tr>
                  {displayFirmalar.map((_: any, idx: number) => (
                    <React.Fragment key={idx}>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "3px 2px",
                          textAlign: "center",
                          backgroundColor: "#f2f2f2",
                          fontWeight: "bold",
                          fontSize: firmCount >= 4 ? "7pt" : "8pt",
                        }}
                      >
                        B.Fiyat
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "3px 2px",
                          textAlign: "center",
                          backgroundColor: "#f2f2f2",
                          fontWeight: "bold",
                          fontSize: firmCount >= 4 ? "7pt" : "8pt",
                        }}
                      >
                        Tutar
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processedKalemler.map((kalem, idx) => (
                  <React.Fragment key={idx}>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px 2px",
                          textAlign: "center",
                        }}
                      >
                        {kalem.siraNo ?? idx + 1}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px 3px",
                          textAlign: "left",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {kalem.malzemeAdi}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px 3px",
                          textAlign: "left",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {kalem.ozelligi}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px 2px",
                          textAlign: "center",
                        }}
                      >
                        {kalem.birimi}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px 2px",
                          textAlign: "center",
                        }}
                      >
                        {kalem.miktar}
                      </td>
                      {displayFirmalar.map((_: any, fIdx: number) => {
                        const tf =
                          (kalem.firmaTeklifleriDetay &&
                            kalem.firmaTeklifleriDetay[fIdx]) ||
                          (kalem.firmaTeklifleri &&
                            kalem.firmaTeklifleri[fIdx]) ||
                          {};
                        const birimFiyatStr =
                          tf.birimFiyat !== undefined &&
                          tf.birimFiyat !== null &&
                          tf.birimFiyat !== "-" &&
                          tf.birimFiyat !== ""
                            ? formatMoney(tf.birimFiyat)
                            : "-";
                        const tutarStr =
                          tf.tutar !== undefined &&
                          tf.tutar !== null &&
                          tf.tutar !== "-" &&
                          tf.tutar !== ""
                            ? formatMoney(tf.tutar)
                            : birimFiyatStr !== "-"
                            ? formatMoney(
                                (parseFloat(
                                  String(birimFiyatStr)
                                    .replace(/\./g, "")
                                    .replace(",", ".")
                                ) || 0) *
                                  (typeof kalem.miktar === "number"
                                    ? kalem.miktar
                                    : parseFloat(
                                        String(kalem.miktar || 1)
                                          .replace(/\./g, "")
                                          .replace(",", ".")
                                      ) || 1)
                              )
                            : "-";

                        return (
                          <React.Fragment key={fIdx}>
                            <td
                              style={{
                                border: "1px solid #000",
                                padding: "4px 2px",
                                textAlign: "right",
                                whiteSpace: "nowrap",
                                fontSize: firmCount >= 4 ? "7pt" : firmCount === 3 ? "7.5pt" : "8.5pt",
                              }}
                            >
                              <EditableField
                                name={`ihtiyacKalemleri.${idx}.firmaTeklifleriDetay.${fIdx}.birimFiyat`}
                                value={birimFiyatStr}
                                placeholder="0,00"
                              />
                            </td>
                            <td
                              style={{
                                border: "1px solid #000",
                                padding: "4px 2px",
                                textAlign: "right",
                                whiteSpace: "nowrap",
                                fontSize: firmCount >= 4 ? "7pt" : firmCount === 3 ? "7.5pt" : "8.5pt",
                              }}
                            >
                              <EditableField
                                name={`ihtiyacKalemleri.${idx}.firmaTeklifleriDetay.${fIdx}.tutar`}
                                value={tutarStr}
                                placeholder="0,00"
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                    <TableRowSplitDivider
                      rowIndex={idx + 1}
                      colSpan={5 + displayFirmalar.length * 2}
                      currentSplitIndex={
                        data?.firstPageLimit
                          ? Number(data.firstPageLimit)
                          : null
                      }
                    />
                  </React.Fragment>
                ))}

                {processedKalemler.length > 0 && (
                  <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                    <td
                      colSpan={5}
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      Toplam Tutar :
                    </td>
                    {displayFirmalar.map((_: any, fIdx: number) => {
                      const ft = displayFirmaToplamlari[fIdx] || {};
                      return (
                        <React.Fragment key={fIdx}>
                          <td style={{ border: "1px solid #000", padding: "4px 2px" }}></td>
                          <td
                            style={{
                              border: "1px solid #000",
                              padding: "4px 2px",
                              textAlign: "right",
                              whiteSpace: "nowrap",
                              fontSize: firmCount >= 4 ? "7pt" : firmCount === 3 ? "7.5pt" : "8.5pt",
                            }}
                          >
                            <EditableField
                              name={`firmaToplamlariDetay.${fIdx}.toplam`}
                              value={ft.toplam || "-"}
                              placeholder="0,00"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          );
        })()}

        {/* TABLO 2: UYGUN GÖRÜLEN KİŞİLER */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            margin: "10px 0 5px 0",
            fontSize: "9.5pt",
            textTransform: "uppercase",
            backgroundColor: "#f2f2f2",
            border: "1px solid #000",
            padding: "3px 0",
          }}
        >
          ALIM YAPILMASI UYGUN GÖRÜLEN GERÇEK / TÜZEL KİŞİLER
        </div>

        <table
          style={{
            width: "100%",
            maxWidth: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            marginBottom: "8px",
            fontSize: "8.5pt",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            boxSizing: "border-box",
          }}
        >
          <colgroup>
            <col style={{ width: "3.5%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "4.5%" }} />
            <col style={{ width: "4.5%" }} />
            <col style={{ width: "33.5%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Sıra No
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Mal / Hizmet / Yapım İşi
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Özelliği
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Birim
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Miktar
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 3px",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Gerçek/Tüzel Kişinin Adı-Adresi
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Teklif Fiyatı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Tutarı
              </th>
            </tr>
          </thead>
          <tbody>
            {processedKalemler.map((kalem, idx) => (
              <tr key={idx}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                  }}
                >
                  {kalem.siraNo ?? idx + 1}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 3px",
                    textAlign: "left",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {kalem.malzemeAdi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 3px",
                    textAlign: "left",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {kalem.ozelligi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                  }}
                >
                  {kalem.birimi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                  }}
                >
                  {kalem.miktar}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 3px",
                    textAlign: "left",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {kalem.enUygunFirmaAdi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kalem.enDusukFiyat}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kalem.toplamBedel}
                </td>
              </tr>
            ))}

            {processedKalemler.length > 0 && (
              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "right",
                  }}
                >
                  Toplam Tutar :
                </td>
                <td style={{ border: "1px solid #000", padding: "4px 2px" }}></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  <EditableField
                    name="genelToplam"
                    value={formattedGenelToplam}
                    placeholder="0,00"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ fontSize: "8.5pt", marginBottom: "8px" }}>
          Para Birimi TL.
        </div>

        <div
          style={{
            fontSize: "9pt",
            textAlign: "justify",
            textIndent: "40px",
            marginTop: "10px",
          }}
        >
          Yapılan fiyat araştırmasına göre, firmaların vermiş olduğu{" "}
          <EditableField
            name="hesaplamaEsasiText"
            value={hesaplamaEsasiText}
          />{" "}
          alınarak maliyet KDV hariç{" "}
          <EditableField
            name="genelToplam"
            value={formattedGenelToplam}
            placeholder="0,00"
          />{" "}
          TL olarak tespit edilmiştir.
        </div>

        {aciklama && (
          <div
            style={{
              border: "1px solid #000",
              padding: "8px",
              minHeight: "80px",
              marginTop: "10px",
              fontSize: "9pt",
              boxSizing: "border-box",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>Açıklama:</strong>{" "}
            <EditableField name="aciklama" value={aciklama} multiline />
          </div>
        )}

        {/* GÖREVLİLER */}
        <div
          style={{
            marginTop: "15px",
            textAlign: "center",
            pageBreakInside: "avoid",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "9.5pt",
              marginBottom: "15px",
            }}
          >
            Piyasa Fiyat Araştırması Görevlisi / Görevlileri
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              textAlign: "center",
            }}
          >
            {displayKomisyon.map((uye: any, idx: number) => (
              <div
                key={idx}
                style={{
                  width: "22%",
                  minWidth: "120px",
                  padding: "5px",
                  fontSize: "9pt",
                  lineHeight: 1.35,
                }}
              >
                <span
                  style={{ fontWeight: "bold", textTransform: "uppercase" }}
                >
                  <EditableField
                    name={`komisyon.${idx}.adSoyad`}
                    value={uye.adSoyad || ""}
                    placeholder="Adı Soyadı"
                  />
                </span>
                <br />
                <span>
                  <EditableField
                    name={`komisyon.${idx}.unvan`}
                    value={uye.unvan || ""}
                    placeholder="Unvanı"
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* HARCAMA YETKİLİSİ ONAYI (OLUR) */}
        {olurYazisi
          ? (
            <ApprovalSignature
              title="OLUR"
              date={dosyaTarihi || tarih}
              dateField="dosyaTarihi"
              adSoyad={baskanAdi}
              unvan={baskanUnvan}
              nameField="baskanAdi"
              unvanField="baskanUnvan"
              showSpace={true}
              marginTop={25}
            />
          )
          : <EditableOlurPlaceholder />}
      </div>
    </DocumentLayout>
  );
};
