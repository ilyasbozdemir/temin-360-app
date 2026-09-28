import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { DogrudanTeminOnayBelgesiType } from "./DogrudanTeminOnayBelgesi.schema";

interface DogrudanTeminOnayBelgesiProps {
  data?: Partial<DogrudanTeminOnayBelgesiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export interface OnayBelgesiRowItem {
  id: string;
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  isBold?: boolean;
  selectOptions?: string[];
  renderValue?: () => React.ReactNode;
}

const TEMIN_SEKLI_OPTIONS = [
  "4734 Sayılı K.İ.K. Madde 22/d (Doğrudan Temin - Parasal Limit)",
  "4734 Sayılı K.İ.K. Madde 22/a (Tek Kaynak / İhtiyacın Sadece Gerçek/Tüzel Tek Kişiden Temini)",
  "4734 Sayılı K.İ.K. Madde 22/b (Özel Hak / Fikri-Sınai Mülkiyet)",
  "4734 Sayılı K.İ.K. Madde 22/c (Mevcut Mal/Ekipman/Hizmet Uyum Zorunluluğu)",
  "4734 Sayılı K.İ.K. Madde 22/e (Taşınmaz Mal Alımı / Kiralanması)",
  "4734 Sayılı K.İ.K. Madde 22/f (Sağlık Hizmetleri & İlaç/Tıbbi Cihaz Alımları)",
];

const ALIM_TURU_OPTIONS = [
  "Mal Alımı",
  "Hizmet Alımı",
  "Yapım İşi",
  "Danışmanlık Hizmet Alımı",
];

const AVANS_OPTIONS = [
  "Avans verilmeyecektir.",
  "Avans verilecektir.",
  "Şartname ve sözleşmede belirtilen esaslar dahilinde avans verilecektir.",
];

const FIYAT_FARKI_OPTIONS = [
  "Fiyat farkı verilmeyecektir.",
  "Fiyat farkı verilecektir.",
  "Yürürlükteki Fiyat Farkı Kararnamesi esaslarına göre fiyat farkı hesaplanacaktır.",
];

const DOKUMAN_OPTIONS = [
  "Doküman hazırlanmayacaktır.",
  "İdari ve teknik şartname hazırlanacaktır.",
  "Sadece teknik şartname hazırlanacaktır.",
];

export function formatCurrency(val: any, fallback = "-"): string {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "number") {
    if (isNaN(val)) return fallback;
    return (
      val.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " ₺"
    );
  }
  const str = String(val).trim();
  if (str.endsWith("₺")) {
    return str;
  }
  const clean = str.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const num = parseFloat(clean);
  if (!isNaN(num) && clean !== "") {
    return (
      num.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " ₺"
    );
  }
  return str;
}

export function DogrudanTeminOnayBelgesi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: DogrudanTeminOnayBelgesiProps) {
  const idareAdi = data.idareAdi ||
    data.kurumAdi ||
    (data.antetSatirlari && data.antetSatirlari[1]) ||
    "İDARE ADI";

  const vmakamina =
    data.vmakamina ||
    data.makam ||
    data.makamAdi ||
    data.mudurluk ||
    (data.kurumAdi
      ? `${data.kurumAdi.toUpperCase()} HARCAMA YETKİLİSİ MAKAMINA`
      : "HARCAMA YETKİLİSİ MAKAMINA");

  const butceTertibiList =
    Array.isArray(data.butceTertibi) && data.butceTertibi.length > 0
      ? data.butceTertibi
      : data.butceTertibi
      ? [String(data.butceTertibi)]
      : data.butceKodu
      ? [String(data.butceKodu)]
      : [];

  const eklerList = Array.isArray(data.ekler) ? data.ekler : [];

  // Dinamik satır dizisi
  const rows: OnayBelgesiRowItem[] =
    Array.isArray(data.customRows) && data.customRows.length > 0
      ? data.customRows
      : [
        {
          id: "teminNo",
          label: "Doğrudan Temin Numarası",
          name: "teminNo",
          value: data.teminNo || data.dosyaNo || data.evrakSayisi || "-",
          placeholder: "Temin Numarası",
        },
        {
          id: "isAdi",
          label: "İşin Adı",
          name: "isAdi",
          value: data.isAdi || data.dosyaKonusu || "",
          placeholder: "İşin Adı",
          isBold: true,
        },
        {
          id: "teminSekli",
          label: "Temin Şekli",
          name: "teminSekli",
          value: data.teminSekli ||
            "4734 Sayılı K.İ.K. Madde 22/d (Doğrudan Temin - Parasal Limit)",
          placeholder: "Temin Usulü",
          selectOptions: TEMIN_SEKLI_OPTIONS,
        },
        {
          id: "alimTuru",
          label: "Alım Türü",
          name: "alimTuru",
          value: data.alimTuru || data.teklifSozlesmeTuru || "Mal Alımı",
          placeholder: "Alım Türü",
          selectOptions: ALIM_TURU_OPTIONS,
        },
        {
          id: "yaklasikMaliyet",
          label: "Yaklaşık Maliyet",
          name: "yaklasikMaliyet",
          value: formatCurrency(data.yaklasikMaliyet),
          placeholder: "0,00 ₺",
          isBold: true,
        },
        {
          id: "odenekTutari",
          label: "Kullanılabilir Ödenek Tutarı",
          name: "odenekTutari",
          value:
            data.odenekTutari || data.kullanilabilirOdenek
              ? formatCurrency(data.odenekTutari || data.kullanilabilirOdenek)
              : data.yaklasikMaliyet
              ? formatCurrency(data.yaklasikMaliyet)
              : "Yeterli Ödenek Mevcuttur",
          placeholder: "Ödenek Tutarı",
        },
        {
          id: "projeNo",
          label: "Yatırım Proje Numarası (varsa)",
          name: "projeNo",
          value: data.projeNo || "-",
          placeholder: "Proje No veya -",
        },
        {
          id: "butceTertibi",
          label: "Bütçe Tertibi",
          name: "butceTertibi",
          value: "",
          renderValue: () =>
            butceTertibiList.length > 0
              ? (
                <div>
                  {butceTertibiList.map((item: string, idx: number) => (
                    <div key={idx}>
                      <EditableField
                        name={`butceTertibi_${idx}`}
                        value={item}
                        placeholder="Bütçe Tertibi"
                      />
                    </div>
                  ))}
                </div>
              )
              : (
                <EditableField
                  name="butceTertibi_0"
                  value="Belirtilmedi"
                  placeholder="Bütçe Tertibi"
                />
              ),
        },
        {
          id: "avansSartlari",
          label: "Avans Verilecekse şartları",
          name: "avansSartlari",
          value: data.avansSartlari || "Avans verilmeyecektir.",
          placeholder: "Avans Şartları",
          selectOptions: AVANS_OPTIONS,
        },
        {
          id: "fiyatFarkiSartlari",
          label: "Fiyat Farkı Verilecekse Şartları",
          name: "fiyatFarkiSartlari",
          value: data.fiyatFarkiSartlari || "Fiyat farkı verilmeyecektir.",
          placeholder: "Fiyat Farkı Şartları",
          selectOptions: FIYAT_FARKI_OPTIONS,
        },
        {
          id: "dokumanHazirlik",
          label: "Doküman Hazırlanıp Hazırlanmayacağı",
          name: "dokumanHazirlik",
          value: data.dokumanHazirlik || "Doküman hazırlanmayacaktır.",
          placeholder: "Doküman Durumu",
          selectOptions: DOKUMAN_OPTIONS,
        },
      ];

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
          fontSize: "10.5pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.4,
        }}
      >
        {/* TITLE */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "13pt",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          ONAY BELGESİ
        </div>

        {/* FIRST TABLE (İdare Bilgileri) */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  width: "38%",
                  fontWeight: "bold",
                }}
              >
                ALIMI YAPAN İDARENİN ADI
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  width: "62%",
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
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                }}
              >
                BELGE TARİH VE SAYISI
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                }}
              >
                <DateEditableField
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

        {/* CENTERED MAKAM / MUHATAP BOX */}
        <div
          style={{
            border: "1px solid #000",
            textAlign: "center",
            fontWeight: "bold",
            padding: "6px",
            margin: "8px 0",
            textTransform: "uppercase",
            fontSize: "10pt",
          }}
        >
          <EditableField
            name="vmakamina"
            value={vmakamina}
            placeholder="Makam Adı (Örn: HARCAMA YETKİLİSİ MAKAMINA)"
          />
        </div>

        {/* SECOND SECTION: BILGILER */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "12px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          DOĞRUDAN TEMİN İLE İLGİLİ BİLGİLER
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
          }}
        >
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    fontSize: "9.5pt",
                    width: "38%",
                    fontWeight: "bold",
                  }}
                >
                  {row.label}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    fontSize: "9.5pt",
                    fontWeight: row.isBold ? "bold" : "normal",
                  }}
                >
                  {row.renderValue
                    ? (
                      row.renderValue()
                    )
                    : (
                      <EditableField
                        name={row.name}
                        value={row.value}
                        placeholder={row.placeholder}
                        selectOptions={row.selectOptions}
                      />
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* THIRD SECTION: DIĞER AÇIKLAMALAR */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "12px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          DOĞRUDAN TEMİN İLE İLGİLİ DİĞER AÇIKLAMALAR
        </div>
        <div
          style={{
            border: "1px solid #000",
            minHeight: "60px",
            padding: "6px 8px",
            fontSize: "9.5pt",
            textAlign: "justify",
            marginBottom: "10px",
          }}
        >
          <EditableField
            name="isinAciklamasi"
            value={data.isinAciklamasi ||
              "Yukarıda belirtilen ihtiyacın 4734 sayılı Kamu İhale Kanununun 22/d maddesi uyarınca doğrudan temin usulüyle karşılanması ve piyasa fiyat araştırması yapılarak alımın gerçekleştirilmesi hususunda onaylarınızı arz ederim."}
            placeholder="Açıklama giriniz..."
            multiline
          />
        </div>

        {/* FOURTH SECTION: ONAY */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "14px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          ONAY
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000",
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
                  fontSize: "9.5pt",
                }}
              >
                <div
                  style={{
                    textAlign: "justify",
                    marginBottom: "20px",
                    textIndent: "15px",
                    lineHeight: 1.35,
                  }}
                >
                  Yukarıda belirtilen işin doğrudan temin yoluyla satın alınması
                  hususunda onaylarınızı arz ederim.
                </div>
                <div style={{ marginTop: "25px", textAlign: "center" }}>
                  <div>
                    <DateEditableField
                      name="tarih"
                      value={data.dosyaTarihi || data.tarih}
                      placeholder="GG.AA.YYYY"
                    />
                  </div>
                  <div style={{ marginTop: "20px", fontWeight: "bold" }}>
                    <EditableField
                      name="hazirlayanPersonelAdi"
                      value={data.hazirlayanPersonelAdi ||
                        data.gerceklestirmeGorevlisiAdi}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <EditableField
                      name="hazirlayanPersonelUnvan"
                      value={data.hazirlayanPersonelUnvan ||
                        data.gerceklestirmeGorevlisiUnvan}
                      placeholder="Ünvan"
                    />
                  </div>
                  <div>Gerçekleştirme Görevlisi</div>
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
                  fontSize: "9.5pt",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "20px" }}>
                  UYGUNDUR
                </div>
                <div style={{ marginTop: "40px", textAlign: "center" }}>
                  <div>
                    <DateEditableField
                      name="onayTarihi"
                      value={data.dosyaTarihi || data.tarih}
                      placeholder="GG.AA.YYYY"
                    />
                  </div>
                  <div style={{ marginTop: "20px", fontWeight: "bold" }}>
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

        {/* EKLER */}
        {eklerList.length > 0 && (
          <div
            className="paged-keep-together"
            style={{
              marginTop: "12px",
              fontSize: "9.5pt",
              textAlign: "left",
              pageBreakInside: "avoid",
            }}
          >
            <strong>EKLER:</strong>
            <ol
              style={{ margin: "4px 0 0 16px", padding: 0, lineHeight: 1.35 }}
            >
              {eklerList.map((ek: string, idx: number) => (
                <li key={idx}>{ek}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </DocumentLayout>
  );
}
