import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { TableRowSplitDivider } from "../../document/TableRowSplitDivider";
import { BirimFiyatTeklifMektubuType } from "./BirimFiyatTeklifMektubu.schema";

interface BirimFiyatTeklifMektubuProps {
  data?: Partial<BirimFiyatTeklifMektubuType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function BirimFiyatTeklifMektubu({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: BirimFiyatTeklifMektubuProps) {
  const items = data.ihtiyacKalemleri || [];

  let displayTeklifGecerlilikTarihi =
    data.teklifGecerlilikTarihi ||
    data.sonTeklifTarihi ||
    data.son_teklif_verme_tarihi ||
    data.teklifSonTarihi ||
    data.bitisTarihi ||
    data.sonTarih;

  if (displayTeklifGecerlilikTarihi) {
    const clean = String(displayTeklifGecerlilikTarihi).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
      const parts = clean.split(/[T ]/);
      const dParts = parts[0].split("-");
      const datePart = `${dParts[2]}.${dParts[1]}.${dParts[0]}`;
      const timePart = parts[1] && parts[1] !== "00:00:00" ? ` ${parts[1].substring(0, 5)}` : "";
      displayTeklifGecerlilikTarihi = `${datePart}${timePart}`;
    }
  } else {
    displayTeklifGecerlilikTarihi = "……/……/20…";
  }

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
        {/* BAŞLIK VE HİTAP KUTUSU */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "12pt",
            margin: "4px 0 6px 0",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          BİRİM FİYAT TEKLİF MEKTUBU
        </div>

        <div
          style={{
            width: "60%",
            margin: "0 auto 8px auto",
            border: "1px solid #000",
            textAlign: "center",
            padding: "4px 8px",
            fontSize: "10pt",
            fontWeight: "bold",
          }}
        >
          <EditableField
            name="hitap"
            value={data.hitap}
            placeholder="İLGİLİ FİRMALARA"
          />
        </div>

        {/* TEKLİF VE FİRMA BİLGİLERİ TABLOSU (9 SATIR KİK STANDARDI) */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
            fontSize: "9.5pt",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  fontWeight: "bold",
                  width: "35%",
                }}
              >
                İhalenin Adı
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  width: "65%",
                }}
              >
                <EditableField
                  name="isinAdi"
                  value={data.isinAdi || data.dosyaKonusu}
                  placeholder="İhalenin Adı / Konusu"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  fontWeight: "bold",
                }}
              >
                Teklif sahibinin adı ve soyadı / ünvanı
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                <EditableField
                  name="teklifSahibi"
                  value={data.teklifSahibi || data.firmaUnvani}
                  placeholder="Teklif Sahibi Ünvanı"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  fontWeight: "bold",
                }}
              >
                Uyruğu
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                <EditableField
                  name="uyruk"
                  value={data.uyruk || "T.C."}
                  placeholder="T.C."
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  fontWeight: "bold",
                }}
              >
                TC kimlik numarası (gerçek kişi ise)
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                <EditableField
                  name="tcKimlikNo"
                  value={data.tcKimlikNo}
                  placeholder="T.C. Kimlik No"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  fontWeight: "bold",
                }}
              >
                Tüzel kişi ise, tüm ortakların Adı Soyadı ve T.C. Kimlik
                numaraları
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                <EditableField
                  name="ortaklar"
                  value={data.ortaklar}
                  placeholder="Ortaklar Bilgisi"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  fontWeight: "bold",
                }}
              >
                Vergi Kimlik Numarası
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                <EditableField
                  name="vergiNo"
                  value={data.vergiNo || data.firmaVergiNo}
                  placeholder="Vergi Numarası"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  fontWeight: "bold",
                }}
              >
                Tebligat adresi
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                <EditableField
                  name="tebligatAdresi"
                  value={data.tebligatAdresi || data.firmaAdresi}
                  placeholder="Tebligat Adresi"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  fontWeight: "bold",
                }}
              >
                Telefon ve Faks numarası
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                <EditableField
                  name="telefonFaks"
                  value={data.telefonFaks ||
                    [data.telefon, data.faks].filter(Boolean).join(" / ")}
                  placeholder="Telefon / Faks"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  fontWeight: "bold",
                }}
              >
                Elektronik posta adresi
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                <EditableField
                  name="eposta"
                  value={data.eposta || data.email}
                  placeholder="E-Posta Adresi"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* TAAHHÜT METNİ (8 MADDELİK STANDART KİK METNİ) */}
        <div
          style={{
            border: "1px solid #000",
            padding: "6px 10px",
            fontSize: "8.5pt",
            textAlign: "justify",
            lineHeight: 1.35,
            marginBottom: "8px",
            backgroundColor: "#fff",
          }}
        >
          {data.aciklama
            ? <div style={{ whiteSpace: "pre-wrap" }}>{data.aciklama}</div>
            : (
              <ol
                style={{
                  margin: 0,
                  paddingLeft: "22px",
                  listStyleType: "decimal",
                }}
              >
                <li style={{ marginBottom: "2px" }}>
                  Teklifimize Damga Vergisi, Resim Harç, Pul ve Ulaştırma
                  Giderleri dahildir.
                </li>
                <li style={{ marginBottom: "2px" }}>
                  Teklifimiz {displayTeklifGecerlilikTarihi} tarihine kadar geçerlidir.
                </li>
                <li style={{ marginBottom: "2px" }}>
                  İhale konusu iş için sermayesinin %50 sinden fazlasına sahip
                  olduğumuz başka bir tüzel kişinin bu işe ayrı bir teklif
                  vermediğini beyan ediyoruz.
                </li>
                <li style={{ marginBottom: "2px" }}>
                  Aldığınız herhangi bir teklifi veya en düşük teklifi seçmek
                  zorunda olmadığınızı kabul ediyoruz.
                </li>
                <li style={{ marginBottom: "2px" }}>
                  İhale konusu işle ilgili olmak üzere idarenizce
                  yapılacak/yaptırılacak diğer işlerde idarenizin çıkarlarına
                  aykırı düşecek hiçbir eylem ve oluşum içerisinde
                  olmayacağımızı taahhüt ediyoruz.
                </li>
                <li style={{ marginBottom: "2px" }}>
                  Bu alıma ilişkin malzeme kalemlerine kısmi
                  teklif{"    ............"}
                </li>
                <li style={{ marginBottom: "2px" }}>
                  4734 Sayılı Kamu İhale Kanununun 4.maddesindeki "Yerli
                  İstekli" tanımı gereğince yerli istekli durumundayız.
                </li>
                <li>
                  İhale konusu işin tamamını Teklif Mektubumuzun ekindeki Birim
                  Fiyat Teklif Cetvelinde belirtilen her bir iş kalemi için
                  teklif ettiğimiz birim fiyatları üzerinden{" "}
                  <strong>KDV HARİÇ</strong> toplam (rakamla){" "}
                  <span
                    style={{
                      display: "inline-block",
                      borderBottom: "1px dotted #000",
                      minWidth: "120px",
                    }}
                  >
                    <EditableField
                      name="teklifRakamla"
                      value={data.teklifRakamla}
                      placeholder=" "
                    />
                  </span>{" "}
                  TL (yazı ile){" "}
                  <span
                    style={{
                      display: "inline-block",
                      borderBottom: "1px dotted #000",
                      minWidth: "200px",
                    }}
                  >
                    <EditableField
                      name="teklifYaziyla"
                      value={data.teklifYaziyla}
                      placeholder=" "
                    />
                  </span>{" "}
                  TL bedel karşılığında kabul ve taahhüt ederiz.
                </li>
              </ol>
            )}
        </div>

        {/* KAŞE VE İMZA KUTUSU */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "220px",
              border: "1px solid #000",
              textAlign: "center",
              fontSize: "9.5pt",
              backgroundColor: "#fff",
            }}
          >
            <div style={{ padding: "4px", minHeight: "18px" }}>
              <DateEditableField
                name="tarih"
                value={data.tarih || data.dosyaTarihi}
                placeholder="GG.AA.YYYY"
              />
            </div>
            <div
              style={{
                borderTop: "1px solid #000",
                borderBottom: "1px solid #000",
                padding: "4px",
                fontWeight: "bold",
              }}
            >
              Kaşe - İmza
            </div>
            <div style={{ padding: "4px", minHeight: "18px" }}>
              <EditableField
                name="teklifSahibi"
                value={data.teklifSahibi || data.firmaUnvani}
                placeholder="Firma / Yetkili Adı"
              />
            </div>
          </div>
        </div>

        {/* CETVEL TABLOSU */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "8px",
            marginBottom: "6px",
            fontSize: "9pt",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 5px",
                  width: "6%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Sıra No
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 5px",
                  width: "38%",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Mal/Hizmet Kaleminin Adı ve Kısa Açıklaması
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 5px",
                  width: "18%",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Özelliği
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 5px",
                  width: "9%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Birimi
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 5px",
                  width: "9%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Miktarı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 5px",
                  width: "10%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Birim Fiyat
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px 5px",
                  width: "10%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Tutarı
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0
              ? (
                items.map((item, idx) => {
                  const rowNum = idx + 1;
                  return (
                    <React.Fragment key={idx}>
                      <tr>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px 5px",
                            textAlign: "center",
                          }}
                        >
                          {item.siraNo || rowNum}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px 5px",
                            textAlign: "left",
                          }}
                        >
                          {item.malzemeAdi}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px 5px",
                            textAlign: "left",
                          }}
                        >
                          {item.ozelligi || "-"}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px 5px",
                            textAlign: "center",
                          }}
                        >
                          {item.birimi || "-"}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px 5px",
                            textAlign: "right",
                          }}
                        >
                          {item.miktar}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px 5px",
                            textAlign: "right",
                          }}
                        >
                          {item.birimFiyat ? `${item.birimFiyat} ₺` : ""}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px 5px",
                            textAlign: "right",
                          }}
                        >
                          {item.tutar ? `${item.tutar} ₺` : ""}
                        </td>
                      </tr>
                      <TableRowSplitDivider
                        rowIndex={rowNum}
                        colSpan={7}
                        currentSplitIndex={data.firstPageLimit
                          ? Number(data.firstPageLimit)
                          : null}
                      />
                    </React.Fragment>
                  );
                })
              )
              : (
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

            <tr>
              <td colSpan={5} style={{ border: "none" }} />
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 5px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Toplam
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 5px",
                  height: "24px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                <EditableField
                  name="toplamTutar"
                  value={data.toplamTutar ? `${data.toplamTutar} ₺` : ""}
                  placeholder=" "
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
