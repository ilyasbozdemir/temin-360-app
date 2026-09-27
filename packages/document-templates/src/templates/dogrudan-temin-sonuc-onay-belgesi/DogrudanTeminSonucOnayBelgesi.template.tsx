import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DogrudanTeminSonucOnayBelgesiType } from "./DogrudanTeminSonucOnayBelgesi.schema";

interface DogrudanTeminSonucOnayBelgesiProps {
  data?: Partial<DogrudanTeminSonucOnayBelgesiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function DogrudanTeminSonucOnayBelgesi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: DogrudanTeminSonucOnayBelgesiProps) {
  const teklifler = data.teklifler || [];
  const uygunGorulenler = data.uygunGorulenler || [];
  const ekler = data.ekler || [];
  const idareAdi = data.idareAdi ||
    data.kurumAdi ||
    (data.antetSatirlari && data.antetSatirlari[1]) ||
    "İDARE ADI";
  const vmakamina = data.vmakamina ||
    data.makam ||
    "HARCAMA YETKİLİSİ MAKAMINA";

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
          fontSize: "12pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.4,
        }}
      >
        {/* MAIN TITLE */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "13pt",
            marginBottom: "15px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          DOĞRUDAN TEMİN SONUÇ ONAY BELGESİ
        </div>

        {/* FIRST TABLE (İdare Bilgileri) */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                  width: "40%",
                  fontWeight: "bold",
                }}
              >
                ALIMI YAPAN İDARENİN ADI
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                  width: "60%",
                }}
              >
                <EditableField
                  name="idareAdi"
                  value={idareAdi}
                  placeholder="İdare Adı"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                  fontWeight: "bold",
                }}
              >
                BELGE TARİH VE SAYISI
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                }}
              >
                <EditableField
                  name="dosyaTarihi"
                  value={data.dosyaTarihi || data.tarih}
                  placeholder="GG.AA.YYYY"
                />
                {" \u00A0\u00A0\u00A0\u00A0 - \u00A0\u00A0\u00A0\u00A0 "}
                <EditableField
                  name="evrakSayisi"
                  value={data.evrakSayisi}
                  placeholder="Evrak Sayısı"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* CENTERED IDARE BOX */}
        <div
          style={{
            border: "1px solid #000",
            textAlign: "center",
            fontWeight: "bold",
            padding: "6px",
            margin: "10px 0",
            textTransform: "uppercase",
            fontSize: "10.5pt",
          }}
        >
          <EditableField
            name="vmakamina"
            value={vmakamina}
            placeholder="Makam Adı"
          />
        </div>

        {/* SECOND SECTION: BILGILER */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "11pt",
            margin: "18px 0 8px 0",
            textTransform: "uppercase",
          }}
        >
          DOĞRUDAN TEMİN İLE İLGİLİ BİLGİLER
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                  width: "40%",
                  fontWeight: "bold",
                }}
              >
                İşin Adı
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                  width: "60%",
                  fontWeight: "bold",
                }}
              >
                <EditableField
                  name="isAdi"
                  value={data.isAdi || data.dosyaKonusu}
                  placeholder="İşin Adı"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                  fontWeight: "bold",
                }}
              >
                Temin Şekli
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                }}
              >
                <EditableField
                  name="teminSekli"
                  value={data.teminSekli || "4734 Sayılı K.İ.K. Madde 22/d"}
                  placeholder="Temin Usulü"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                  fontWeight: "bold",
                }}
              >
                İşin Türü
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                }}
              >
                <EditableField
                  name="alimTuru"
                  value={data.alimTuru || data.teklifSozlesmeTuru ||
                    "Mal Alımı"}
                  placeholder="Alım Türü"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                  fontWeight: "bold",
                }}
              >
                Yaklaşık Maliyet
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  verticalAlign: "middle",
                }}
              >
                <EditableField
                  name="yaklasikMaliyet"
                  value={data.yaklasikMaliyet
                    ? `${data.yaklasikMaliyet} ₺`
                    : "-"}
                  placeholder="0,00 ₺"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* THIRD SECTION: DIĞER AÇIKLAMALAR */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "11pt",
            margin: "18px 0 8px 0",
            textTransform: "uppercase",
          }}
        >
          DOĞRUDAN TEMİN İLE İLGİLİ DİĞER AÇIKLAMALAR
        </div>
        <div
          style={{
            border: "1px solid #000",
            minHeight: "80px",
            padding: "8px",
            fontSize: "10pt",
            textAlign: "justify",
            whiteSpace: "pre-wrap",
            marginBottom: "15px",
          }}
        >
          <EditableField
            name="isinAciklamasi"
            value={data.isinAciklamasi ||
              "Yukarıda belirtilen ihtiyacın karşılanması amacıyla 4734 sayılı Kamu İhale Kanununun 22/d maddesi uyarınca piyasa fiyat araştırması yapılmış ve en uygun teklifi veren istekli üzerine alım yapılması kararlaştırılmıştır."}
            placeholder="Açıklama giriniz..."
            multiline
          />
        </div>

        {/* FOURTH SECTION: TEKLİF VEREN FİRMALAR */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "11pt",
            margin: "18px 0 8px 0",
            textTransform: "uppercase",
          }}
        >
          TEKLİF VEREN GERÇEK/TÜZEL KİŞİLER
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "5px",
            marginBottom: "15px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                  backgroundColor: "#f2f2f2",
                  textAlign: "center",
                }}
              >
                Gerçek/Tüzel Kişinin Adı/Unvanı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                  backgroundColor: "#f2f2f2",
                  textAlign: "center",
                }}
              >
                Teklif Ettiği Fiyat (₺)
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                  backgroundColor: "#f2f2f2",
                  textAlign: "center",
                }}
              >
                Fiyat Araştırmasında Dikkate Alındı mı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                  backgroundColor: "#f2f2f2",
                  textAlign: "center",
                }}
              >
                Açıklama
              </th>
            </tr>
          </thead>
          <tbody>
            {teklifler.length > 0
              ? (
                teklifler.map((t: any, idx: number) => (
                  <tr key={idx}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 8px",
                        fontSize: "9.5pt",
                        textAlign: "left",
                        verticalAlign: "middle",
                      }}
                    >
                      {t.unvan || "-"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 8px",
                        fontSize: "9.5pt",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {t.fiyat ? `${t.fiyat} ₺` : "-"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 8px",
                        fontSize: "9.5pt",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {t.uygunMu || "Evet"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 8px",
                        fontSize: "9.5pt",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {t.aciklama ||
                        (idx === 0 ? "En Avantajlı Teklif" : "Geçerli Teklif")}
                    </td>
                  </tr>
                ))
              )
              : (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      border: "1px solid #000",
                      padding: "6px 8px",
                      fontSize: "9.5pt",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    Teklif bilgisi bulunmamaktadır.
                  </td>
                </tr>
              )}
          </tbody>
        </table>

        {/* FIFTH SECTION: ALIM YAPILMASI UYGUN GÖRÜLEN FİRMALAR */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "11pt",
            margin: "18px 0 8px 0",
            textTransform: "uppercase",
          }}
        >
          ALIM YAPILMASI UYGUN GÖRÜLEN GERÇEK / TÜZEL KİŞİLER
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "5px",
            marginBottom: "15px",
          }}
        >
          <thead>
            <tr>
              <th
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                  backgroundColor: "#f2f2f2",
                  textAlign: "center",
                }}
              >
                Gerçek/Tüzel Kişinin Adı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                  backgroundColor: "#f2f2f2",
                  textAlign: "center",
                }}
              >
                Gerçek/Tüzel Kişinin Adresi
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                  backgroundColor: "#f2f2f2",
                  textAlign: "center",
                }}
              >
                Teklif Ettiği Fiyat (₺)
              </th>
            </tr>
          </thead>
          <tbody>
            {uygunGorulenler.length > 0
              ? (
                uygunGorulenler.map((u: any, idx: number) => (
                  <tr key={idx}>
                    <td
                      colSpan={2}
                      style={{
                        border: "1px solid #000",
                        padding: "6px 8px",
                        fontSize: "9.5pt",
                        textAlign: "left",
                        verticalAlign: "middle",
                      }}
                    >
                      <strong>{u.unvan || data.yukleniciFirma || "-"}</strong>
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 8px",
                        fontSize: "9.5pt",
                        textAlign: "left",
                        verticalAlign: "middle",
                      }}
                    >
                      {u.adres || data.yukleniciAdresi || "-"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "6px 8px",
                        fontSize: "9.5pt",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <strong>
                        {u.fiyat
                          ? `${u.fiyat} ₺`
                          : data.genelToplam
                          ? `${data.genelToplam} ₺`
                          : "-"}
                      </strong>
                    </td>
                  </tr>
                ))
              )
              : data.yukleniciFirma
              ? (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "6px 8px",
                      fontSize: "9.5pt",
                      textAlign: "left",
                      verticalAlign: "middle",
                    }}
                  >
                    <strong>{data.yukleniciFirma}</strong>
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px 8px",
                      fontSize: "9.5pt",
                      textAlign: "left",
                      verticalAlign: "middle",
                    }}
                  >
                    {data.yukleniciAdresi || "-"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px 8px",
                      fontSize: "9.5pt",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <strong>
                      {data.genelToplam ? `${data.genelToplam} ₺` : "-"}
                    </strong>
                  </td>
                </tr>
              )
              : (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      border: "1px solid #000",
                      padding: "6px 8px",
                      fontSize: "9.5pt",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    Alım yapılması uygun görülen kişi bulunmamaktadır.
                  </td>
                </tr>
              )}
          </tbody>
        </table>

        {/* SIXTH SECTION: ONAY */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "11pt",
            margin: "25px 0 8px 0",
            textTransform: "uppercase",
          }}
        >
          ONAY
        </div>

        <table
          className="approval-section paged-keep-together"
          style={{
            width: "100%",
            marginTop: "15px",
            border: "1px solid #000",
            borderCollapse: "collapse",
            pageBreakInside: "avoid",
          }}
        >
          <tbody>
            <tr>
              {/* LEFT COLUMN (Arz Eden) */}
              <td
                style={{
                  border: "1px solid #000",
                  padding: "10px",
                  width: "50%",
                  verticalAlign: "top",
                  textAlign: "center",
                  fontSize: "10.5pt",
                }}
              >
                <div
                  style={{
                    textAlign: "justify",
                    marginBottom: "20px",
                    fontSize: "10pt",
                    textIndent: "20px",
                    lineHeight: 1.4,
                  }}
                >
                  Belirtilen işin, yukarıda alım yapılması uygun görülen
                  gerçek/tüzel kişilerden doğrudan temin yoluyla satın alınması
                  hususunda onaylarınızı arz ederim.
                </div>
                <div style={{ marginTop: "40px", textAlign: "center" }}>
                  <div>
                    {data.vonayasunustarihi || data.dosyaTarihi || data.tarih ||
                      ""}
                  </div>
                  <div style={{ marginTop: "30px", fontWeight: "bold" }}>
                    <EditableField
                      name="hazirlayanPersonelAdi"
                      value={data.hazirlayanPersonelAdi ||
                        data.piyasaGorevlisi1Adi}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <EditableField
                      name="hazirlayanPersonelUnvan"
                      value={data.hazirlayanPersonelUnvan ||
                        data.piyasaGorevlisi1Unvani || "Görevli"}
                      placeholder="Ünvan"
                    />
                  </div>
                </div>
              </td>

              {/* RIGHT COLUMN (Onaylayan) */}
              <td
                style={{
                  border: "1px solid #000",
                  padding: "10px",
                  width: "50%",
                  verticalAlign: "top",
                  textAlign: "center",
                  fontSize: "10.5pt",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "20px" }}>
                  UYGUNDUR
                </div>
                <div style={{ marginTop: "40px", textAlign: "center" }}>
                  <div>
                    {data.vonaytarihi || data.dosyaTarihi || data.tarih || ""}
                  </div>
                  <div style={{ marginTop: "30px", fontWeight: "bold" }}>
                    <EditableField
                      name="onaylayanPersonelAdi"
                      value={data.onaylayanPersonelAdi || data.baskanAdi}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <EditableField
                      name="onaylayanPersonelUnvan"
                      value={data.onaylayanPersonelUnvan || data.baskanUnvan ||
                        "Harcama Yetkilisi"}
                      placeholder="Ünvan"
                    />
                  </div>
                  <div>Harcama Yetkilisi</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {ekler.length > 0 && (
          <div
            className="paged-keep-together"
            style={{
              marginTop: "25px",
              fontSize: "10pt",
              textAlign: "left",
              pageBreakInside: "avoid",
            }}
          >
            <strong>EKLER:</strong>
            <ol
              style={{
                margin: "5px 0 0 20px",
                padding: 0,
                listStyleType: "decimal",
                lineHeight: 1.5,
              }}
            >
              {ekler.map((ek: string, idx: number) => <li key={idx}>{ek}</li>)}
            </ol>
          </div>
        )}
      </div>
    </DocumentLayout>
  );
}
