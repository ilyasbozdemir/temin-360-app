import React from "react";
import { EditableField } from "../../document/EditableField";
import { TableRowSplitDivider } from "../../document/TableRowSplitDivider";
import { YaklasikMaliyetCetveliData } from "./YaklasikMaliyetCetveli.schema";
import { useYaklasikMaliyetCetveli } from "./YaklasikMaliyetCetveli.hook";

interface Props {
  data?: Partial<YaklasikMaliyetCetveliData> & Record<string, any>;
}

export const YaklasikMaliyetCetveli: React.FC<Props> = ({ data }) => {
  const {
    solLogo,
    sagLogo,
    kurumAdi,
    mudurluk,
    isAdi,
    tarih,
    antetLines,
    displayFirmalar,
    processedKalemler,
    displayFirmaToplamlari,
    formattedGenelToplam,
    displayKomisyon,
    hesaplamaEsasiText,
    olurBaslik,
    olurTarihi,
    baskanAdi,
    baskanUnvan,
    showOlurBlock,
    firmalarColspan,
    getFirmTitle,
  } = useYaklasikMaliyetCetveli(data);

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "10pt",
        lineHeight: 1.4,
        color: "#000",
        padding: "1.5cm 1.2cm",
        width: "100%",
        maxWidth: "29.7cm",
        minHeight: "21cm",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* ANTET */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: "20px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{ width: "90px", textAlign: "left", verticalAlign: "top" }}
            >
              {solLogo && (
                <img
                  src={solLogo}
                  alt="Sol Logo"
                  style={{
                    maxWidth: "80px",
                    maxHeight: "80px",
                    objectFit: "contain",
                  }}
                />
              )}
            </td>

            <td
              style={{
                textAlign: "center",
                verticalAlign: "top",
                padding: "5px",
                lineHeight: 1.3,
              }}
            >
              {antetLines.length > 0 ? (
                antetLines.map((line: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      fontWeight: "bold",
                      fontSize: idx === 0 ? "12pt" : "11pt",
                      marginBottom: idx < antetLines.length - 1 ? "2px" : "0",
                    }}
                  >
                    {line}
                  </div>
                ))
              ) : (
                <>
                  {kurumAdi && (
                    <div style={{ fontWeight: "bold", fontSize: "12pt" }}>
                      {kurumAdi}
                    </div>
                  )}
                  {mudurluk && (
                    <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
                      {mudurluk}
                    </div>
                  )}
                </>
              )}
            </td>

            <td
              style={{
                width: "90px",
                textAlign: "right",
                verticalAlign: "top",
              }}
            >
              {sagLogo && (
                <img
                  src={sagLogo}
                  alt="Sağ Logo"
                  style={{
                    maxWidth: "80px",
                    maxHeight: "80px",
                    objectFit: "contain",
                  }}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* BAŞLIK */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          textDecoration: "underline",
          margin: "15px 0",
          fontSize: "12pt",
          textTransform: "uppercase",
        }}
      >
        YAKLAŞIK MALİYET HESAP CETVELİ
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "10px",
          fontSize: "10pt",
        }}
      >
        <tbody>
          <tr>
            <td style={{ textAlign: "left", width: "70%" }}>
              <strong>İşin Adı:</strong>{" "}
              <EditableField name="isAdi" value={isAdi} placeholder="İşin Adı" />
            </td>
            <td style={{ textAlign: "right", width: "30%" }}>
              <strong>Düzenleme Tarihi :</strong>{" "}
              <EditableField name="tarih" value={tarih} placeholder="Tarih" />
            </td>
          </tr>
        </tbody>
      </table>

      {(() => {
        const firmCount = Math.max(1, displayFirmalar.length);
        const baseTotalPct = firmCount === 1 ? 65 : firmCount === 2 ? 56 : firmCount === 3 ? 50 : 44;
        const firmTotalPct = 100 - baseTotalPct;
        const perFirmPct = firmTotalPct / firmCount;

        const siraPct = 3.5;
        const birimPct = 4.5;
        const miktarPct = 4.5;
        const enDusukPct = 8.5;
        const toplamMaliyetPct = 9.5;
        const remainingBase = baseTotalPct - (siraPct + birimPct + miktarPct + enDusukPct + toplamMaliyetPct);
        const malzemePct = remainingBase * 0.55;
        const ozellikPct = remainingBase * 0.45;

        return (
          <table
            style={{
              width: "100%",
              maxWidth: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
              marginTop: "10px",
              marginBottom: "15px",
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
              {displayFirmalar.length > 0 ? (
                displayFirmalar.map((_: any, idx: number) => (
                  <col key={idx} style={{ width: `${perFirmPct}%` }} />
                ))
              ) : (
                <col style={{ width: `${perFirmPct}%` }} />
              )}
              <col style={{ width: `${enDusukPct}%` }} />
              <col style={{ width: `${toplamMaliyetPct}%` }} />
            </colgroup>
            <thead>
              <tr>
                <th
                  colSpan={5}
                  style={{
                    border: "1px solid #000",
                    padding: "5px 3px",
                    textAlign: "center",
                    fontWeight: "normal",
                  }}
                >
                  Talep Edilen Mal/Hizmet
                </th>
                <th
                  colSpan={firmalarColspan}
                  style={{
                    border: "1px solid #000",
                    padding: "5px 3px",
                    textAlign: "center",
                    fontWeight: "normal",
                  }}
                >
                  Alınan Fiyatlar
                </th>
                <th
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "5px 3px",
                    textAlign: "center",
                    fontWeight: "normal",
                  }}
                >
                  Hesaplanan Maliyet
                </th>
              </tr>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                    fontWeight: "normal",
                  }}
                >
                  Sıra No
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                    fontWeight: "normal",
                  }}
                >
                  Mal / Hizmet Adı
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                    fontWeight: "normal",
                  }}
                >
                  Özelliği
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                    fontWeight: "normal",
                  }}
                >
                  Birim
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                    fontWeight: "normal",
                  }}
                >
                  Miktarı
                </th>
                {displayFirmalar.length > 0 ? (
                  displayFirmalar.map((f: any, idx: number) => (
                    <th
                      key={idx}
                      style={{
                        border: "1px solid #000",
                        padding: "3px 2px",
                        textAlign: "center",
                        fontWeight: "normal",
                        fontSize: firmCount >= 4 ? "7pt" : firmCount === 3 ? "7.5pt" : "8.5pt",
                        lineHeight: 1.15,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <EditableField
                        name={`firmalar.${idx}.unvan`}
                        value={getFirmTitle(f, idx)}
                        placeholder={`Firma ${idx + 1}`}
                      />
                    </th>
                  ))
                ) : (
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "center",
                      fontWeight: "normal",
                    }}
                  >
                    Teklif Fiyatı
                  </th>
                )}
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  En Düşük<br />Birim Fiyat
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  Toplam Maliyet
                </th>
              </tr>
            </thead>
            <tbody>
          {processedKalemler.map((kalem, idx) => {
            const rowNum = kalem.siraNo ?? idx + 1;
            return (
              <React.Fragment key={idx}>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "center",
                    }}
                  >
                    {rowNum}
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
                    <EditableField
                      name={`ihtiyacKalemleri.${idx}.malzemeAdi`}
                      value={kalem.malzemeAdi}
                    />
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
                    <EditableField
                      name={`ihtiyacKalemleri.${idx}.ozelligi`}
                      value={kalem.ozelligi}
                    />
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "center",
                    }}
                  >
                    <EditableField
                      name={`ihtiyacKalemleri.${idx}.birimi`}
                      value={kalem.birimi}
                    />
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "center",
                    }}
                  >
                    <EditableField
                      name={`ihtiyacKalemleri.${idx}.miktar`}
                      value={String(kalem.miktar)}
                    />
                  </td>
                  {displayFirmalar.length > 0 ? (
                    kalem.firmOffers.map((offerPrice: string, fIdx: number) => (
                      <td
                        key={fIdx}
                        style={{
                          border: "1px solid #000",
                          padding: "4px 2px",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          fontSize: firmCount >= 4 ? "7pt" : firmCount === 3 ? "7.5pt" : "8.5pt",
                        }}
                      >
                        <EditableField
                          name={`ihtiyacKalemleri.${idx}.firmaTeklifleri.${fIdx}.fiyat`}
                          value={offerPrice}
                          placeholder="0,00"
                        />
                      </td>
                    ))
                  ) : (
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
                  )}
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      fontWeight: "bold",
                    }}
                  >
                    <EditableField
                      name={`ihtiyacKalemleri.${idx}.enDusukFiyat`}
                      value={kalem.enDusukFiyat}
                      placeholder="0,00"
                    />
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 2px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      fontWeight: "bold",
                    }}
                  >
                    <EditableField
                      name={`ihtiyacKalemleri.${idx}.toplamBedel`}
                      value={kalem.toplamBedel}
                      placeholder="0,00"
                    />
                  </td>
                </tr>
                <TableRowSplitDivider
                  rowIndex={rowNum}
                  colSpan={7 + displayFirmalar.length}
                  currentSplitIndex={data?.firstPageLimit
                    ? Number(data.firstPageLimit)
                    : null}
                />
              </React.Fragment>
            );
          })}

          {processedKalemler.length > 0 && (
            <tr style={{ fontWeight: "bold" }}>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "right",
                }}
              >
                Toplam Tutar :
              </td>
              {displayFirmalar.length > 0 ? (
                displayFirmalar.map((_: any, idx: number) => {
                  const ft = displayFirmaToplamlari[idx];
                  return (
                    <td
                      key={idx}
                      style={{
                        border: "1px solid #000",
                        padding: "4px 2px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        fontSize: firmCount >= 4 ? "7pt" : firmCount === 3 ? "7.5pt" : "8.5pt",
                      }}
                    >
                      <EditableField
                        name={`firmaToplamlari.${idx}.toplam`}
                        value={ft?.toplam ?? "-"}
                        placeholder="0,00"
                      />
                    </td>
                  );
                })
              ) : (
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                  }}
                >
                </td>
              )}
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                }}
              >
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 2px",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
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
        );
      })()}

      <div style={{ fontSize: "9pt", marginBottom: "20px" }}>
        Para Birimi <b>TL.</b>
      </div>

      {/* KOMİSYON BÖLÜMÜ */}
      <div style={{ marginTop: "20px", pageBreakInside: "avoid" }}>
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            textDecoration: "underline",
            marginBottom: "10px",
            fontSize: "11pt",
          }}
        >
          Piyasa Fiyat Araştırma Görevlisi/Görevlileri
        </div>
        <div
          style={{
            textAlign: "justify",
            marginBottom: "20px",
            fontSize: "10pt",
            textIndent: "40px",
          }}
        >
          Yapılan fiyat araştırmasına göre, firmaların vermiş olduğu{" "}
          <EditableField
            name="hesaplamaEsasiText"
            value={hesaplamaEsasiText}
          />{" "}
          alınarak maliyet KDV hariç (
          <EditableField
            name="genelToplam"
            value={formattedGenelToplam}
            placeholder="0,00"
          />
          ) TL olarak tespit edilmiştir.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          {displayKomisyon.map((uye: any, idx: number) => (
            <div
              key={idx}
              style={{
                width: `${Math.max(18, Math.min(30, 90 / (displayKomisyon.length || 1)))}%`,
                minWidth: "120px",
                padding: "5px",
                fontSize: "9.5pt",
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                <EditableField
                  name={`komisyon.${idx}.adSoyad`}
                  value={uye.adSoyad || uye.ad_soyad || uye.ad || ""}
                  placeholder="Adı Soyadı"
                />
              </div>
              <div>
                <EditableField
                  name={`komisyon.${idx}.unvan`}
                  value={uye.unvan || uye.personel_unvan || ""}
                  placeholder="Unvanı"
                />
              </div>
              {(uye.gorevi || uye.gorev) && (
                <div style={{ fontSize: "8.5pt", color: "#555" }}>
                  {uye.gorevi || uye.gorev}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* OLUR / ONAY BLOĞU */}
      {showOlurBlock && (
        <div style={{ marginTop: "35px", pageBreakInside: "avoid" }}>
          <div
            style={{ textAlign: "center", width: "260px", margin: "0 auto" }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "11pt",
                marginBottom: "5px",
              }}
            >
              <EditableField
                name="olurBaslik"
                value={olurBaslik}
              />
            </div>
            <div style={{ fontSize: "9.5pt", marginBottom: "15px" }}>
              <EditableField
                name="olurTarihi"
                value={olurTarihi}
              />
            </div>
            <div style={{ fontWeight: "bold", fontSize: "10pt" }}>
              <EditableField
                name="baskanAdi"
                value={baskanAdi}
              />
            </div>
            <div style={{ fontSize: "9.5pt", color: "#333" }}>
              <EditableField
                name="baskanUnvan"
                value={baskanUnvan}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
