import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { TableRowSplitDivider } from "../../document/TableRowSplitDivider";
import { numberToWords } from "../../document/sayiyiYaziyaCevir";
import { FiyatArastirmaMektubuType } from "./FiyatArastirmaMektubu.schema";

interface FiyatArastirmaMektubuProps {
  data?: Partial<FiyatArastirmaMektubuType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function FiyatArastirmaMektubu({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: FiyatArastirmaMektubuProps) {
  const items = data.ihtiyacKalemleri || [];
  const komisyon =
    (data.komisyonUyeleri && data.komisyonUyeleri.length > 0)
      ? data.komisyonUyeleri
      : (data.komisyon && data.komisyon.length > 0)
      ? data.komisyon
      : (data.fiyatKomisyonu && data.fiyatKomisyonu.length > 0)
      ? data.fiyatKomisyonu
      : (data.gorevlendirilenler && data.gorevlendirilenler.length > 0)
      ? data.gorevlendirilenler
      : (data.dagitimListesi && data.dagitimListesi.length > 0)
      ? data.dagitimListesi
      : [];

  // Gün sayısı ve yazıyla gün sayısı hesaplama
  let displayGunSayisi = data.gunSayisi || data.teslimGun || data.teslimGunu;

  if (!displayGunSayisi) {
    const startDateStr = data.dosyaTarihi || data.tarih || data.teminTarihi;
    const endDateStr = data.sonTeklifTarihi ||
      data.teklifSonTarihi ||
      data.bitisTarihi ||
      data.sonTarih ||
      data.teklifGecerlilikTarihi;

    const parseDate = (dStr?: string) => {
      if (!dStr) return null;
      const clean = String(dStr).trim();
      if (/^\d{2}\.\d{2}\.\d{4}/.test(clean)) {
        const p = clean.split(" ")[0].split(".");
        return new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
        const p = clean.split(" ")[0].split("-");
        return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
      }
      const dt = new Date(clean);
      return isNaN(dt.getTime()) ? null : dt;
    };

    const start = parseDate(startDateStr) || new Date();
    const end = parseDate(endDateStr);

    if (end && end > start) {
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays > 0) {
        displayGunSayisi = String(diffDays);
      }
    }
  }

  let displayGunSayisiYazi = data.gunSayisiYazi;
  if (!displayGunSayisiYazi && displayGunSayisi) {
    const num = parseInt(String(displayGunSayisi), 10);
    if (!isNaN(num) && num > 0) {
      displayGunSayisiYazi = numberToWords(num).toLocaleLowerCase("tr-TR");
    }
  }

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
      hideHeader={true}
      hideFooter={false}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={1}
    >
      <div
        style={{
          width: "100%",
          fontSize: "10.5pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.4,
        }}
      >
        {/* BÖLÜM 1: FİYAT ARAŞTIRMA MEKTUBU */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "12pt",
            marginBottom: "8px",
            textTransform: "uppercase",
          }}
        >
          <EditableField
            name="sunulacakMakam"
            value={data.sunulacakMakam || data.idareAdi}
            placeholder="T.C. İDARE ADI BAŞKANLIĞI"
          />
        </div>

        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "11.5pt",
            margin: "8px 0",
            textTransform: "uppercase",
          }}
        >
          FİYAT ARAŞTIRMA MEKTUBU
        </div>

        <div
          style={{
            textIndent: "30px",
            textAlign: "justify",
            marginBottom: "12px",
          }}
        >
          <EditableField
            name="idareHitapMetni"
            value={data.idareHitapMetni || data.idareAdi || "Kurumumuza ait"}
            placeholder="Kurumumuza ait / İdare Adı"
          />,{" "}
          <EditableField
            name="isinAdi"
            value={data.isinAdi}
            placeholder="İşin Adı"
          />{" "}
          için fiyat araştırması yapılmaktadır. Birim fiyatlarını KDV hariç
          olarak{" "}
          <EditableField
            name="gunSayisi"
            value={displayGunSayisi}
            placeholder="..."
          />{" "}
          (
          <EditableField
            name="gunSayisiYazi"
            value={displayGunSayisiYazi}
            placeholder="..."
          />) gün içinde bildirmenizi rica ederim.
        </div>

        {/* KOMİSYON ÜYELERİ TABLOSU */}
        {komisyon.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "16px 0",
              textAlign: "center",
              pageBreakInside: "avoid",
            }}
          >
            <tbody>
              {Array.from(
                { length: Math.ceil(komisyon.length / 4) },
                (_, rowIndex) => {
                  const rowMembers = komisyon.slice(
                    rowIndex * 4,
                    rowIndex * 4 + 4,
                  );
                  const cellWidth = `${100 / Math.min(rowMembers.length, 4)}%`;
                  return (
                    <tr key={rowIndex}>
                      {rowMembers.map((uye: any, idx: number) => {
                        const gorevBaslik =
                          uye.komisyonGorevi ||
                          uye.gorevi ||
                          uye.gorev ||
                          uye.rol ||
                          "Üye";
                        return (
                          <td
                            key={idx}
                            style={{
                              verticalAlign: "top",
                              fontSize: "9.5pt",
                              padding: "6px 8px 16px 8px",
                              lineHeight: 1.4,
                              width: cellWidth,
                            }}
                          >
                            {gorevBaslik && <strong>{gorevBaslik}</strong>}
                            {gorevBaslik && <br />}
                            {uye.adSoyad || uye.ad_soyad || ""}
                            <br />
                            {uye.unvan || ""}
                          </td>
                        );
                      })}
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        )}

        {/* BÖLÜM 2: FİYAT ARAŞTIRMA VE BİRİM FİYAT TEKLİF MEKTUBU */}

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
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "4px 8px",
                  fontWeight: "bold",
                  width: "45%",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    margin: "8px 0",
                    textTransform: "uppercase",
                  }}
                >
                  FİYAT ARAŞTIRMA VE BİRİM FİYAT TEKLİF MEKTUBU
                </div>
              </td>
            </tr>
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "4px 4px",
                  fontWeight: "bold",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "10.5pt",
                    marginBottom: "8px",
                  }}
                >
                  <EditableField
                    name="idareAdi"
                    value={data.idareAdi || data.kurumAdi}
                    placeholder="KURUM / İDARE ADI"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 8px",
                  fontWeight: "bold",
                  width: "45%",
                }}
              >
                Teklif Sahibinin Adı Soyadı / Ticaret Ünvanı
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 8px",
                  width: "55%",
                }}
              >
                <EditableField
                  name="teklifSahibi"
                  value={data.teklifSahibi}
                  placeholder="Firma Ünvanı"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 8px",
                  fontWeight: "bold",
                }}
              >
                Açık Tebligat Adresi
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 8px" }}>
                <EditableField
                  name="tebligatAdresi"
                  value={data.tebligatAdresi}
                  placeholder="Adres"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 8px",
                  fontWeight: "bold",
                }}
              >
                Bağlı Olduğu Vergi Dairesi ve Numarası
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 8px" }}>
                <EditableField
                  name="vergiNo"
                  value={data.vergiNo}
                  placeholder="Vergi Dairesi / No"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 8px",
                  fontWeight: "bold",
                }}
              >
                Telefon ve Faks Numarası
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 8px" }}>
                <EditableField
                  name="telefonFaks"
                  value={data.telefonFaks}
                  placeholder="Telefon / Faks"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 8px",
                  fontWeight: "bold",
                }}
              >
                Elektronik Posta Adresi (varsa)
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 8px" }}>
                <EditableField
                  name="eposta"
                  value={data.eposta}
                  placeholder="E-Posta"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* AÇIKLAMA / TAAHHÜT METNİ */}
        <div
          style={{
            border: "1px solid #000",
            padding: "8px 12px",
            fontSize: "9pt",
            lineHeight: 1.35,
            marginTop: "8px",
          }}
        >
          {data.aciklama
            ? (
              <div style={{ whiteSpace: "pre-wrap", textAlign: "justify" }}>
                {data.aciklama}
              </div>
            )
            : (
              <ol
                style={{
                  margin: 0,
                  paddingLeft: "22px",
                  listStyleType: "decimal",
                }}
              >
                <li style={{ marginBottom: "3px", textAlign: "justify" }}>
                  Teklifimize Damga Vergisi, Resim Harç, Pul ve Ulaştırma
                  Giderleri dahildir.
                </li>
                <li style={{ marginBottom: "3px", textAlign: "justify" }}>
                  Teklifimiz {displayTeklifGecerlilikTarihi} tarihine kadar geçerlidir.
                </li>
                <li style={{ marginBottom: "3px", textAlign: "justify" }}>
                  İhale konusu iş için sermayesinin %50'sinden fazlasına sahip
                  olduğumuz başka bir tüzel kişinin bu işe ayrı bir teklif
                  vermediğini beyan ediyoruz.
                </li>
                <li style={{ marginBottom: "3px", textAlign: "justify" }}>
                  Aldığınız herhangi bir teklifi veya en düşük teklifi seçmek
                  zorunda olmadığınızı kabul ediyoruz.
                </li>
                <li style={{ marginBottom: "3px", textAlign: "justify" }}>
                  İhale konusu işle ilgili olmak üzere idarenizce
                  yapılacak/yaptırılacak diğer işlerde idarenizin çıkarlarına
                  aykırı düşecek hiçbir eylem ve oluşum içerisinde
                  olmayacağımızı taahhüt ediyoruz.
                </li>
                <li style={{ marginBottom: "3px", textAlign: "justify" }}>
                  Bu alıma ilişkin malzeme kalemlerine kısmi teklif{" "}
                  <EditableField
                    name="kismiTeklif"
                    value={data.kismiTeklif}
                    placeholder="............"
                  />
                </li>
                <li style={{ marginBottom: "3px", textAlign: "justify" }}>
                  4734 Sayılı Kamu İhale Kanununun 4. maddesindeki "Yerli
                  İstekli" tanımı gereğince yerli istekli durumundayız.
                </li>
                <li style={{ textAlign: "justify" }}>
                  İhale konusu işin tamamını Teklif Mektubumuzun ekindeki Birim
                  Fiyat Teklif Cetvelinde belirtilen her bir iş kalemi için
                  teklif ettiğimiz birim fiyatları üzerinden{" "}
                  <strong>KDV HARİÇ</strong> toplam (rakamla){" "}
                  <span
                    style={{
                      display: "inline-block",
                      borderBottom: "1px dotted #000",
                      width: "130px",
                      minHeight: "14px",
                      verticalAlign: "bottom",
                      margin: "0 3px",
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
                      width: "200px",
                      minHeight: "14px",
                      verticalAlign: "bottom",
                      margin: "0 3px",
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

        {/* KAŞE VE İMZA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: "12px",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontStyle: "italic", color: "#333", fontSize: "10pt" }}>
            Para Birimi: Türk Lirası (TL)
          </div>
          <div
            style={{
              textAlign: "center",
              width: "220px",
              fontSize: "10.5pt",
              lineHeight: 1.4,
              marginLeft: "auto",
            }}
          >
            <DateEditableField
              name="tarih"
              value={data.tarih || data.dosyaTarihi}
              placeholder="……/……/20…"
            />
            <br />
            <br />
            Kaşe ve İmza
          </div>
        </div>

        {/* BİRİM FİYAT TEKLİF CETVELİ TABLOSU */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "8px",
            fontSize: "9.5pt",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
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
                  padding: "5px",
                  width: "32%",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Malzeme/Hizmet Adı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  width: "17%",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Özelliği
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
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
                  padding: "5px",
                  width: "9%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Miktar
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  width: "14%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Birim Fiyatı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  width: "14%",
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
                            padding: "5px",
                            textAlign: "center",
                          }}
                        >
                          {item.siraNo || rowNum}
                        </td>
                        <td
                          style={{ border: "1px solid #000", padding: "5px" }}
                        >
                          {item.malzemeAdi}
                        </td>
                        <td
                          style={{ border: "1px solid #000", padding: "5px" }}
                        >
                          {item.ozelligi || "-"}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "5px",
                            textAlign: "center",
                          }}
                        >
                          {item.birimi || "-"}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "5px",
                            textAlign: "right",
                          }}
                        >
                          {item.miktar}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "5px",
                            textAlign: "right",
                          }}
                        >
                          {item.birimFiyat ? `${item.birimFiyat} ₺` : ""}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "5px",
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
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                TOPLAM
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  height: "24px",
                }}
              />
            </tr>
            <tr>
              <td colSpan={5} style={{ border: "none" }} />
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                KDV %{data.kdvOrani ?? 20}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  height: "24px",
                }}
              />
            </tr>
            <tr>
              <td colSpan={5} style={{ border: "none" }} />
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                G.TOPLAM
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px",
                  height: "24px",
                }}
              />
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
