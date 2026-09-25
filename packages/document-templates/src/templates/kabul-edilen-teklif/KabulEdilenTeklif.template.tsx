import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import {
  DateEditableField,
  MetadataBlock,
  PersonelCard,
} from "../../document/ApprovalSignature";
import {
  DEFAULT_LIMITS,
  LANDSCAPE_LIMITS,
  paginateData,
} from "../../document/DynamicPaginatedTable";
import { DocumentTable } from "../../document/DocumentTable";
import { KabulEdilenTeklifType } from "./KabulEdilenTeklif.schema";

interface KabulEdilenTeklifProps {
  data?: Partial<KabulEdilenTeklifType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

export function KabulEdilenTeklif({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: KabulEdilenTeklifProps) {
  const columns: any[] = [
    { key: "siraNo", label: "Sıra No", width: "7%", align: "center" },
    { key: "kodu", label: "Malzeme Kodu", width: "13%", align: "center" },
    { key: "malzemeAdi", label: "Malzeme/İş Adı", width: "26%", align: "left" },
    { key: "ozelligi", label: "Özelliği", width: "18%", align: "left" },
    { key: "birimi", label: "Birimi", width: "8%", align: "center" },
    {
      key: "enDusukFiyat",
      label: "Birim Fiyat (TL)",
      width: "12%",
      align: "right",
    },
    { key: "miktar", label: "Miktar", width: "6%", align: "right" },
    { key: "toplamBedel", label: "Tutar (TL)", width: "10%", align: "right" },
  ];

  const fLimit = firstPageLimit ?? (data as any).firstPageLimit;
  const mLimit = middlePageLimit ?? (data as any).middlePageLimit;
  const lLimit = lastPageLimit ?? (data as any).lastPageLimit;

  const limits = {
    firstPage: fLimit !== undefined && fLimit !== null
      ? Number(fLimit)
      : (orientation === "landscape"
        ? LANDSCAPE_LIMITS.firstPage
        : DEFAULT_LIMITS.firstPage),
    middle: mLimit !== undefined && mLimit !== null
      ? Number(mLimit)
      : (orientation === "landscape"
        ? LANDSCAPE_LIMITS.middle
        : DEFAULT_LIMITS.middle),
    lastPage: lLimit !== undefined && lLimit !== null
      ? Number(lLimit)
      : (orientation === "landscape"
        ? LANDSCAPE_LIMITS.lastPage
        : DEFAULT_LIMITS.lastPage),
  };

  const items = (data.ihtiyacKalemleri || []).map((k: any, idx: number) => ({
    ...k,
    siraNo: k.siraNo || idx + 1,
    kodu: k.kodu || k.tasinir_kodu || "-",
    malzemeAdi: k.malzemeAdi || k.kalem_adi || "",
    ozelligi: k.ozelligi || k.aciklama || "",
    birimi: k.birimi || k.birim || "",
    miktar: k.miktar || "1",
    enDusukFiyat: k.enDusukFiyat || k.birimFiyat || "-",
    toplamBedel: k.toplamBedel || k.toplamTutar || "-",
  }));

  const pages = paginateData(items, limits);
  const teslimGunu = data.teslimGun || data.teslimGunu || "7";
  const yuklenici = data.yukleniciFirma || data.firmaUnvan || "YÜKLENİCİ FİRMA";
  const teminSekli = data.teminSekli ||
    "4734 sayılı Kanun'un 22/d maddesi gereğince Doğrudan Temin";
  const kurumAdi = data.kurumAdi || "İdaremiz";

  return (
    <>
      {pages.map((pageItems, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const isLastPage = pageIdx === pages.length - 1;

        return (
          <DocumentLayout
            key={pageIdx}
            data={data as any}
            hideFooter={false}
            pageSize={pageSize}
            orientation={orientation}
            pageNumber={pageIdx + 1}
            totalPages={pages.length}
            hideHeader={!isFirstPage}
          >
            {isFirstPage && (
              <>
                {/* INFO: SAYI & TARIH & KONU */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "20px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "4px 0", fontSize: "11pt" }}>
                        <strong>Sayı:</strong>{" "}
                        <EditableField
                          name="evrakSayisi"
                          value={data.evrakSayisi}
                          placeholder="Evrak Sayısı"
                        />
                      </td>
                      <td
                        style={{
                          padding: "4px 0",
                          fontSize: "11pt",
                          textAlign: "right",
                        }}
                      >
                        <strong>Tarih:</strong>{" "}
                        <DateEditableField
                          name="dosyaTarihi"
                          value={data.dosyaTarihi || data.tarih}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          padding: "4px 0",
                          fontSize: "11pt",
                          fontWeight: "bold",
                        }}
                      >
                        Konu:{" "}
                        <EditableField
                          name="dosyaKonusu"
                          value={"Kabul Edilen Teklif"}
                          placeholder="İşin Konusu"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* RECIPIENT */}
                <div
                  style={{
                    textAlign: "center",
                    margin: "15px 0 25px 0",
                    fontSize: "12pt",
                    lineHeight: 1.5,
                  }}
                >
                  Sayın,{" "}
                  <span style={{ fontWeight: "bold" }}>
                    <EditableField
                      name="yukleniciFirma"
                      value={yuklenici}
                      placeholder="Yüklenici Firma Adı"
                    />
                  </span>
                  {data.yukleniciAdresi && (
                    <div
                      style={{
                        fontSize: "11pt",
                        color: "#333",
                        marginTop: "4px",
                      }}
                    >
                      {data.yukleniciAdresi}{" "}
                      {data.yukleniciIlce ? `${data.yukleniciIlce} / ` : ""}
                      {data.yukleniciIl || ""}
                    </div>
                  )}
                </div>

                {/* BODY */}
                <div
                  style={{
                    textAlign: "justify",
                    textIndent: "1.5cm",
                    marginBottom: "20px",
                    lineHeight: 1.6,
                    fontSize: "11pt",
                  }}
                >
                  Aşağıdaki listede belirtilen ihtiyacın{" "}
                  <EditableField
                    name="teminSekli"
                    value={teminSekli}
                    placeholder="Doğrudan Temin"
                  />{" "}
                  usulü ile firmanızdan satın alınmasına karar verilmiştir.
                  Malı/Hizmeti/İşi{" "}
                  <strong>
                    <EditableField
                      name="teslimGun"
                      value={teslimGunu}
                      placeholder="7"
                    />
                  </strong>{" "}
                  gün içinde mesai saatleri dahilinde{" "}
                  <EditableField
                    name="kurumAdi"
                    value={kurumAdi}
                    placeholder="Kurum Adı"
                  />{" "}
                  adresine teslim etmenizi rica ederiz.
                </div>

                {/* PREPARED BY SIGNATURE */}
                <div
                  style={{
                    width: "100%",
                    marginBottom: "25px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: "250px",
                      textAlign: "center",
                      lineHeight: 1.4,
                    }}
                  >
                    <br />
                    <span style={{ fontWeight: "bold" }}>
                      <EditableField
                        name="hazirlayanPersonelAdi"
                        value={data.hazirlayanPersonelAdi}
                        placeholder="Hazırlayan Adı Soyadı"
                      />
                    </span>
                    <br />
                    <span style={{ fontSize: "10pt" }}>
                      <EditableField
                        name="hazirlayanPersonelUnvan"
                        value={data.hazirlayanPersonelUnvan}
                        placeholder="Hazırlayan Ünvanı"
                      />
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Kalemler Tablosu */}
            <DocumentTable
              columns={columns}
              data={pageItems}
              startIndex={pages.slice(0, pageIdx).reduce(
                (acc, p) => acc + p.length,
                0,
              )}
            />

            {/* Genel Toplam Gösterimi */}
            {isLastPage && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "6px",
                  padding: "6px 8px",
                  fontWeight: "bold",
                  fontSize: "10pt",
                  border: "1px solid #000",
                  borderTop: "none",
                  backgroundColor: "#fafafa",
                }}
              >
                <span style={{ marginRight: "12px" }}>
                  Toplam Tutar (KDV Hariç):
                </span>
                <span>{data.genelToplam || "0,00"} TL</span>
              </div>
            )}

            {/* OLUR İmzası */}
            {isLastPage && data.olurYazisi !== false && (
              <div
                style={{
                  textAlign: "center",
                  margin: "35px auto 0 auto",
                  width: "300px",
                  lineHeight: 1.4,
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "12pt",
                    marginBottom: "5px",
                  }}
                >
                  OLUR
                </div>
                <div style={{ marginBottom: "15px", fontSize: "10pt" }}>
                  {data.dosyaTarihi || data.tarih}
                </div>
                <br />
                <div style={{ fontWeight: "bold" }}>
                  <EditableField
                    name="baskanAdi"
                    value={data.baskanAdi || data.onaylayanPersonelAdi}
                    placeholder="Yetkili Adı Soyadı"
                  />
                </div>
                <div style={{ fontSize: "10pt" }}>
                  <EditableField
                    name="baskanUnvan"
                    value={data.baskanUnvan || data.onaylayanPersonelUnvan}
                    placeholder="Yetkili Ünvanı"
                  />
                </div>
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
