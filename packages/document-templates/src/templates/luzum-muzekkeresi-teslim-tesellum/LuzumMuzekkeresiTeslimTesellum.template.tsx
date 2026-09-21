import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentTable } from "../../document/DocumentTable";
import {
  DateEditableField,
  PersonelCard,
  toTrDate,
} from "../../document/ApprovalSignature";
import { EditableField } from "../../document/EditableField";
import { paginateData } from "../../document/DynamicPaginatedTable";
import { LuzumMuzekkeresiTeslimTesellumType } from "./LuzumMuzekkeresiTeslimTesellum.schema";

interface LuzumMuzekkeresiTeslimTesellumProps {
  data?: Partial<LuzumMuzekkeresiTeslimTesellumType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

const formatCurrency = (val: any): string => {
  if (val === undefined || val === null || val === "") return "-";
  if (typeof val === "string" && (val.includes("TL") || val.includes(","))) {
    return val;
  }
  const num = typeof val === "number"
    ? val
    : parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  if (isNaN(num)) {
    return String(val);
  }
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + " TL";
};

export function LuzumMuzekkeresiTeslimTesellum({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: LuzumMuzekkeresiTeslimTesellumProps) {
  const columns: any[] = [
    { key: "siraNo", label: "S.No", width: "6%", align: "center" },
    { key: "kodu", label: "Kodu", width: "12%", align: "left" },
    { key: "malzemeAdi", label: "Malzeme Adı", width: "30%", align: "left" },
    { key: "ozelligi", label: "Özelliği", width: "20%", align: "left" },
    { key: "birimi", label: "Birimi", width: "10%", align: "center" },
    {
      key: "kdvOrani",
      label: "KDV Oranı (%)",
      width: "12%",
      align: "center",
      render: (
        val: any,
      ) => (val !== undefined && val !== null ? `%${val}` : "-"),
    },
    { key: "miktar", label: "Miktar", width: "10%", align: "center" },
  ];

  const limits = {
    firstPage: firstPageLimit ?? 10,
    middle: middlePageLimit ?? 15,
    lastPage: lastPageLimit ?? 8,
  };

  const items = (data.ihtiyacKalemleri || []).map((item: any, idx: number) => ({
    ...item,
    siraNo: item.siraNo || idx + 1,
  }));

  const pages = paginateData(items, limits);
  const defaultToday = toTrDate(new Date().toISOString().split("T")[0]);
  const dosyaTarihiVal = (data as any).tarih || data.dosyaTarihi ||
    (data as any).onayaSunulanTarih || defaultToday;

  const firmaListesi: any[] = (data as any).firmaListesi || [];
  const winnerFirm = firmaListesi.find((f: any) => f.isWinner) ||
    firmaListesi[0];
  const firmaUnvan = data.yukleniciFirma || (data as any).kazananFirma ||
    (data as any).firmaAdi || winnerFirm?.unvan || "";

  const rawTeslimEdenler = data.teslimEdenler && data.teslimEdenler.length > 0
    ? data.teslimEdenler
    : [
      {
        adSoyad: (data as any).teslimEden_0_adSoyad ||
          (data as any).teslimEdenPersonelAdi || firmaUnvan || "",
        unvan: (data as any).teslimEden_0_unvan ||
          (data as any).teslimEdenPersonelUnvan ||
          (firmaUnvan ? "Yüklenici Firma / Yetkilisi" : ""),
      },
    ];

  const teslimEdenlerList = rawTeslimEdenler.map((item: any, idx: number) => {
    const overrideAd = (data as any)[`teslimEden_${idx}_adSoyad`];
    const overrideUnvan = (data as any)[`teslimEden_${idx}_unvan`];
    const ad = overrideAd || item.adSoyad || firmaUnvan || "";
    const unv = overrideUnvan || item.unvan ||
      (ad ? "Yüklenici Firma / Yetkilisi" : "");
    return {
      ...item,
      adSoyad: ad,
      unvan: unv,
    };
  });

  const teslimAlanlarList = data.teslimAlanlar && data.teslimAlanlar.length > 0
    ? data.teslimAlanlar
    : [
      {
        adSoyad: (data as any).teslimAlanPersonelAdi ||
          (data as any).talepEdenPersonelAdi ||
          (data as any).hazirlayanPersonelAdi || "",
        unvan: (data as any).teslimAlanPersonelUnvan ||
          (data as any).talepEdenPersonelUnvan ||
          (data as any).hazirlayanPersonelUnvan || "",
      },
    ];

  return (
    <>
      {pages.map((pageItems, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const isLastPage = pageIdx === pages.length - 1;

        return (
          <DocumentLayout
            key={pageIdx}
            data={data}
            hideFooter={false}
            pageSize={pageSize}
            orientation={orientation}
            pageNumber={pageIdx + 1}
            totalPages={pages.length}
            hideHeader={!isFirstPage}
          >
            {isFirstPage && (
              <>
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "10pt",
                    marginBottom: "10px",
                    fontWeight: "bold",
                  }}
                >
                  Tarih:{" "}
                  <DateEditableField
                    name="tarih"
                    value={dosyaTarihiVal}
                    defaultDate={defaultToday}
                  />
                </div>

                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "13pt",
                    textDecoration: "underline",
                    marginBottom: "20px",
                    letterSpacing: "0.5px",
                  }}
                >
                  <EditableField
                    name="dosyaKonusu"
                    value={data.dosyaKonusu || data.isinAdi || "TESLİM TESELLÜM BELGESİ"}
                    placeholder="TESLİM TESELLÜM BELGESİ"
                  />
                </div>

                <table
                  style={{
                    width: "100%",
                    marginBottom: "15px",
                    fontSize: "10pt",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          width: "120px",
                          padding: "4px 0",
                          verticalAlign: "top",
                        }}
                      >
                        İşin Adı:
                      </td>
                      <td
                        colSpan={3}
                        style={{ padding: "4px 0", verticalAlign: "top" }}
                      >
                        <EditableField
                          name="isinAdi"
                          value={data.isinAdi}
                          placeholder="İşin Adı"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          width: "120px",
                          padding: "4px 0",
                          verticalAlign: "top",
                        }}
                      >
                        Sayı:
                      </td>
                      <td
                        colSpan={3}
                        style={{ padding: "4px 0", verticalAlign: "top" }}
                      >
                        <EditableField
                          name="evrakSayisi"
                          value={(data as any).evrakSayisi ||
                            data.dosyaNumarasi}
                          placeholder="E-0000000000-934.01-0001"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{
                    textAlign: "justify",
                    textIndent: "40px",
                    marginBottom: "20px",
                    fontSize: "11pt",
                    lineHeight: 1.5,
                  }}
                >
                  <EditableField
                    name="kurumumuz"
                    value={data.kurumumuz || (data as any).altKurumBizim || "Belediyemiz"}
                    placeholder="Belediyemiz"
                  />{" "}
                  bünyesinde gerçekleştirilen{" "}
                  <strong>
                    <EditableField
                      name="isinAdi"
                      value={data.isinAdi || "Doğrudan Temin"}
                      placeholder="Doğrudan Temin"
                    />
                  </strong>{" "}
                  dosyası kapsamında alınan, aşağıda listede cinsi ve miktarı
                  belirtilen malzemeler, teslim eden firma yetkilisi/personeli
                  tarafından getirilerek ilgili komisyon/yetkililerce tam,
                  sağlam ve çalışır vaziyette teslim alınmıştır. İşbu belge 2
                  (iki) nüsha olarak düzenlenmiştir.
                </div>
              </>
            )}

            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Kalem bulunamadı"
              striped={false}
              startIndex={pageIdx === 0 ? 0 : limits.firstPage + (pageIdx - 1) * limits.middle}
              currentSplitIndex={limits.firstPage ? Number(limits.firstPage) : null}
            />


            {isLastPage && (
              <div
                style={{
                  marginTop: "40px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "40px",
                  pageBreakInside: "avoid",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "11pt",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "4px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    TESLİM EDENLER
                  </div>
                  {teslimEdenlerList.map((person: any, idx: number) => (
                    <PersonelCard
                      key={idx}
                      isFirmaSelect={true}
                      adSoyad={person.adSoyad}
                      unvan={person.unvan}
                      nameField={`teslimEden_${idx}_adSoyad`}
                      unvanField={`teslimEden_${idx}_unvan`}
                      placeholderName="Firma Adı / Kaşe"
                      placeholderUnvan="Unvanı"
                      align="center"
                      marginBottom={16}
                    />
                  ))}
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "11pt",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "4px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    TESLİM ALANLAR
                  </div>
                  {teslimAlanlarList.map((person: any, idx: number) => (
                    <PersonelCard
                      key={idx}
                      adSoyad={person.adSoyad}
                      unvan={person.unvan}
                      nameField={`teslimAlan_${idx}_adSoyad`}
                      unvanField={`teslimAlan_${idx}_unvan`}
                      placeholderName="Teslim Alan Personel"
                      placeholderUnvan="Unvanı"
                      align="center"
                      marginBottom={16}
                    />
                  ))}
                </div>
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
