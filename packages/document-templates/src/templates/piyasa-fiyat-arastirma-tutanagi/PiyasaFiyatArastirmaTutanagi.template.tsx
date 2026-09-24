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

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
            fontSize: "8.5pt",
          }}
        >
          <thead>
            <tr>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "4%",
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
                  padding: "4px",
                  width: "20%",
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
                  padding: "4px",
                  width: "22%",
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
                  padding: "4px",
                  width: "6%",
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
                  padding: "4px",
                  width: "6%",
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
                    padding: "4px",
                    textAlign: "center",
                    backgroundColor: "#f2f2f2",
                    fontWeight: "bold",
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
                      padding: "4px",
                      textAlign: "center",
                      backgroundColor: "#f2f2f2",
                      fontWeight: "bold",
                    }}
                  >
                    B.Fiyat
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "center",
                      backgroundColor: "#f2f2f2",
                      fontWeight: "bold",
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
                      padding: "4px",
                      textAlign: "center",
                    }}
                  >
                    {kalem.siraNo ?? idx + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "left",
                    }}
                  >
                    {kalem.malzemeAdi}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "left",
                    }}
                  >
                    {kalem.ozelligi}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "center",
                    }}
                  >
                    {kalem.birimi}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
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
                            padding: "4px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
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
                            padding: "4px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
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
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                          whiteSpace: "nowrap",
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
            borderCollapse: "collapse",
            marginBottom: "8px",
            fontSize: "8.5pt",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "4%",
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
                  padding: "4px",
                  width: "20%",
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
                  padding: "4px",
                  width: "22%",
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
                  padding: "4px",
                  width: "6%",
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
                  padding: "4px",
                  width: "6%",
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
                  padding: "4px",
                  width: "25%",
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
                  padding: "4px",
                  width: "8%",
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
                  padding: "4px",
                  width: "9%",
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
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  {kalem.siraNo ?? idx + 1}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "left",
                  }}
                >
                  {kalem.malzemeAdi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "left",
                  }}
                >
                  {kalem.ozelligi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  {kalem.birimi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  {kalem.miktar}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "left",
                  }}
                >
                  {kalem.enUygunFirmaAdi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kalem.enDusukFiyat}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
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
                <td style={{ border: "1px solid #000", padding: "4px" }}></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
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
