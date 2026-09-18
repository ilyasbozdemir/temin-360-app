import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import {
  DateEditableField,
  PersonelCard,
} from "../../document/ApprovalSignature";
import { HarcamaPusulasiType } from "./HarcamaPusulasi.schema";
import { amountToWordsTL } from "../../document/sayiyiYaziyaCevir";

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
  // Türkçe locale ile para formatlaması (örn: 12.324,83)
  const formatCurrency = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "";
    const num = typeof val === "number"
      ? val
      : parseFloat(String(val).replace(/\./g, "").replace(",", "."));
    if (isNaN(num)) return String(val);
    return num.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formattedTutar = data.tutar ? `${formatCurrency(data.tutar)} ₺` : "-";
  const formattedBirimFiyat = data.birimFiyat
    ? `${formatCurrency(data.birimFiyat)} ₺`
    : "-";

  // Tutar yazıya otomatik çevir (manuel override varsa onu kullan)
  const tutarYaziGosterilecek = data.tutarYazi
    ? data.tutarYazi
    : data.tutar
    ? amountToWordsTL(data.tutar)
    : "";

  // Kalem sayısını ihtiyacKalemleri dizisinden hesapla
  const kalemSayisi = Array.isArray(data.ihtiyacKalemleri)
    ? data.ihtiyacKalemleri.length
    : null;

  const kalemSayisiYazi = kalemSayisi !== null
    ? `${kalemSayisi} Kalem`
    : null;

  // Miktar: manuel girilmişse onu kullan, yoksa kalem sayısından otomatik üret
  const miktarGosterilecek = data.miktar
    ? data.miktar
    : kalemSayisiYazi ?? "";

  // Açıklama: manuel girilmemişse dosyanın konusundan otomatik oluştur
  const aciklamaGosterilecek = data.aciklama
    ? data.aciklama
    : [data.alimTuru, data.isAdi]
      .filter(Boolean)
      .join(" kapsamında ")
      ? `${[data.alimTuru, data.isAdi].filter(Boolean).join(" kapsamında ")} Muayene ve Kabul Komisyonunca teslim alınan mal/hizmet alımına ilişkindir.`
      : "";

  // Malı Satan = Kazanan istekli firma
  // data.yukleniciFirma ve ilgili alanlar, hook tarafından winnerFirm'dan otomatik dolduruluyor
  const saticiAdiSoyadiGosterilecek =
    data.saticiAdiSoyadi ||
    (data as any).yukleniciFirmaYetkilisi ||
    (data as any).yetkiliAdSoyad ||
    (data as any).yukleniciFirma ||
    '';

  const saticiAdresGosterilecek =
    data.saticiAdres ||
    (data as any).yukleniciAdresi ||
    [(data as any).yukleniciIlce, (data as any).yukleniciIl]
      .filter(Boolean)
      .join(' / ') ||
    '';

  const saticiTcNoGosterilecek =
    data.saticiTcNo ||
    (data as any).vergiNo ||
    (data as any).firmaVergiNo ||
    '';


  const shouldHideHeader = hideHeader !== undefined
    ? hideHeader
    : (data as any)?.hideHeader !== undefined
    ? (data as any).hideHeader
    : true;

  const shouldHideFooter = hideFooter !== undefined
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
      <div
        style={{
          width: "100%",
          fontSize: "10pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
        }}
      >
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
              <td
                style={{
                  border: "1px solid #000",
                  width: "50%",
                  fontWeight: "bold",
                  padding: "4px 7px",
                }}
              >
                Sayı:{" "}
                <EditableField
                  name="evrakSayisi"
                  value={data.evrakSayisi}
                  placeholder="E-00000000-934.01-0001"
                />
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  width: "50%",
                  fontWeight: "bold",
                  textAlign: "right",
                  padding: "4px 7px",
                }}
              >
                Tarih:{" "}
                <DateEditableField
                  name="tarih"
                  value={data.tarih}
                  placeholder="GG.AA.YYYY"
                />
              </td>
            </tr>

            {/* Dairesi */}
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  width: "30%",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  padding: "4px 7px",
                }}
              >
                Dairesi
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  width: "70%",
                  fontWeight: "bold",
                  padding: "4px 7px",
                }}
              >
                {data.idareAdi ||
                  (data.antetSatirlari && data.antetSatirlari[1]) ||
                  "KURUM / BİRİM ADI"}
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
              <td
                style={{
                  border: "1px solid #000",
                  width: "30%",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  padding: "4px 7px",
                }}
              >
                Çeşidi
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  width: "70%",
                  padding: "4px 7px",
                }}
              >
                <EditableField
                  name="alimTuru"
                  value={data.alimTuru}
                  placeholder="Alım Türü"
                />{" "}
                (<EditableField
                  name="isAdi"
                  value={data.isAdi}
                  placeholder="İşin Adı"
                />)
              </td>
            </tr>

            {/* Miktarı */}
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  width: "30%",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  padding: "4px 7px",
                }}
              >
                Miktarı
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  width: "70%",
                  padding: "4px 7px",
                }}
              >
                <EditableField
                  name="miktar"
                  value={miktarGosterilecek}
                  placeholder="1 Kalem"
                />
              </td>
            </tr>

            {/* Dinamik Kalem Tablosu — ihtiyacKalemleri varsa göster */}
            {Array.isArray(data.ihtiyacKalemleri) && data.ihtiyacKalemleri.length > 0 && (
              <tr>
                <td colSpan={2} style={{ border: "1px solid #000", padding: "0" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "8.5pt",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th style={{ border: "1px solid #ccc", padding: "3px 5px", width: "5%", textAlign: "center" }}>S.No</th>
                        <th style={{ border: "1px solid #ccc", padding: "3px 5px", width: "40%", textAlign: "left" }}>Malzeme / Hizmet Adı</th>
                        <th style={{ border: "1px solid #ccc", padding: "3px 5px", width: "10%", textAlign: "center" }}>Miktar</th>
                        <th style={{ border: "1px solid #ccc", padding: "3px 5px", width: "8%", textAlign: "center" }}>Birim</th>
                        <th style={{ border: "1px solid #ccc", padding: "3px 5px", width: "17%", textAlign: "right" }}>Birim Fiyat (₺)</th>
                        <th style={{ border: "1px solid #ccc", padding: "3px 5px", width: "20%", textAlign: "right" }}>Tutar (₺)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.ihtiyacKalemleri as any[]).map((kalem: any, idx: number) => {
                        const miktarNum = Number(
                          kalem.teslimMiktari ??
                          kalem.teslim_miktari ??
                          kalem.kabulMiktari ??
                          kalem.kabul_miktari ??
                          kalem.miktar ??
                          1
                        );
                        const birimFiyatNum = Number(
                          kalem.teklifFiyati || kalem.birimFiyat || kalem.birim_fiyat ||
                          kalem.kabul_fiyati || kalem.fiyat || 0
                        );
                        const satirToplam = miktarNum * birimFiyatNum;
                        return (
                          <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                            <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "center" }}>{idx + 1}</td>
                            <td style={{ border: "1px solid #ccc", padding: "3px 5px" }}>
                              {kalem.malzemeAdi || kalem.kalem_adi || kalem.ad || "—"}
                              {kalem.ozelligi ? <span style={{ color: "#666", fontSize: "8pt" }}> ({kalem.ozelligi})</span> : null}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "center" }}>{miktarNum}</td>
                            <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "center" }}>{kalem.birimi || kalem.birim || "Adet"}</td>
                            <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "right" }}>
                              {birimFiyatNum > 0 ? formatCurrency(birimFiyatNum) : "—"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "right", fontWeight: satirToplam > 0 ? "bold" : "normal" }}>
                              {satirToplam > 0 ? formatCurrency(satirToplam) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div
                    style={{
                      padding: "3px 7px",
                      fontSize: "7.5pt",
                      color: "#555",
                      fontStyle: "italic",
                      backgroundColor: "#f9f9f9",
                      borderTop: "1px solid #ddd",
                      textAlign: "right",
                    }}
                  >
                    * Kalem miktarları ve tutarlar Muayene ve Kabul Komisyonu Tutanağı teslimat verileri esas alınarak otomatik aktarılmıştır.
                  </div>
                </td>
              </tr>
            )}

            {/* Birim Fiyat */}
            {/* Birim Fiyatı — kalem tablosu varsa gizle, yoksa göster */}
            {(!Array.isArray(data.ihtiyacKalemleri) || data.ihtiyacKalemleri.length === 0) && (
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    width: "30%",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    padding: "4px 7px",
                  }}
                >
                  Birim Fiyatı
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    width: "70%",
                    padding: "4px 7px",
                  }}
                >
                  <EditableField
                    name="birimFiyat"
                    value={data.birimFiyat ? formatCurrency(data.birimFiyat) : ""}
                    placeholder="Birim Fiyat"
                  />{" "}
                  ₺
                </td>
              </tr>
            )}

            {/* Tutarı — kalem varsa otomatik toplam hesapla */}
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  width: "30%",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  padding: "4px 7px",
                }}
              >
                {Array.isArray(data.ihtiyacKalemleri) && data.ihtiyacKalemleri.length > 0
                  ? "Genel Toplam"
                  : "Tutarı"}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  width: "70%",
                  fontWeight: "bold",
                  padding: "4px 7px",
                }}
              >
                <EditableField
                  name="tutar"
                  value={(() => {
                    if (data.tutar) return formatCurrency(data.tutar);
                    if (Array.isArray(data.ihtiyacKalemleri) && data.ihtiyacKalemleri.length > 0) {
                      const hesaplanan = (data.ihtiyacKalemleri as any[]).reduce((acc: number, k: any) => {
                        const m = Number(
                          k.teslimMiktari ??
                          k.teslim_miktari ??
                          k.kabulMiktari ??
                          k.kabul_miktari ??
                          k.miktar ??
                          1
                        );
                        const f = Number(k.teklifFiyati || k.birimFiyat || k.birim_fiyat || k.kabul_fiyati || k.fiyat || 0);
                        return acc + m * f;
                      }, 0);
                      return hesaplanan > 0 ? formatCurrency(hesaplanan) : "";
                    }
                    return "";
                  })()}
                  placeholder="Tutar"
                />{" "}
                ₺
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
                Yalnız{" "}
                <EditableField
                  name="tutarYazi"
                  value={tutarYaziGosterilecek}
                  placeholder="(yazı ile tutar)"
                />{" "}
                TL.sıdır.
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
                    value={aciklamaGosterilecek}
                    multiline
                    placeholder="Açıklama giriniz..."
                  />
                </div>
              </td>
            </tr>

            {/* Tarih and Signatures Inner Block */}
            <tr>
              <td
                colSpan={2}
                style={{ border: "1px solid #000", padding: "6px 8px" }}
              >
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
                      <td
                        style={{
                          border: "1px solid #000",
                          minHeight: "85px",
                          lineHeight: 1.4,
                          padding: "8px",
                          verticalAlign: "top",
                          fontSize: "9pt",
                        }}
                      >
                        <div>
                          <strong>T.C. / Vergi No :</strong>{" "}
                          <EditableField
                            name="saticiTcNo"
                            value={saticiTcNoGosterilecek}
                            placeholder="TC Kimlik / Vergi No"
                          />
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <strong>Adı Soyadı / Unvanı :</strong>{" "}
                          <EditableField
                            name="saticiAdiSoyadi"
                            value={saticiAdiSoyadiGosterilecek}
                            placeholder="Satıcı / Firma Adı"
                          />
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <strong>Adresi :</strong>{" "}
                          <EditableField
                            name="saticiAdres"
                            value={saticiAdresGosterilecek}
                            placeholder="Satıcı / Firma Adresi"
                          />
                        </div>
                        <div
                          style={{
                            marginTop: "10px",
                            fontStyle: "italic",
                            color: "#888",
                          }}
                        >
                          (İmza)
                        </div>
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          textAlign: "center",
                          verticalAlign: "top",
                          minHeight: "85px",
                          padding: "8px",
                        }}
                      >
                        <div
                          style={{
                            marginBottom: "4px",
                            fontWeight: "bold",
                            fontSize: "9.5pt",
                            color: "#555",
                          }}
                        >
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

                <div
                  style={{
                    fontSize: "8pt",
                    color: "#444",
                    textAlign: "justify",
                    marginTop: "8px",
                    lineHeight: 1.3,
                  }}
                >
                  <strong>Not:</strong>{" "}
                  Bu belge, fatura veya fatura yerine geçen belgeleri düzenleme
                  zorunluluğu bulunmayan kişilerden yapılan iş, mal veya hizmet
                  alımlarında düzenlenir. Taksi ile yapılan seyahatlerde (şehir
                  içi taksi ücretleri hariç) seyahat edilen taksinin plaka
                  numarası ile yolculuğun nereden nereye yapıldığı açıklama
                  bölümünde belirtilir.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
