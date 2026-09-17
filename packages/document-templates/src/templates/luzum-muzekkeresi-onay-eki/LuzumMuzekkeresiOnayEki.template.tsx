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
import { LuzumMuzekkeresiOnayEkiType } from "./LuzumMuzekkeresiOnayEki.schema";

interface LuzumMuzekkeresiOnayEkiProps {
  data?: Partial<LuzumMuzekkeresiOnayEkiType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

function getKurumName(
  kurumAdi?: string | null,
  altKurumTipi?: string | null,
): string {
  if (!altKurumTipi || altKurumTipi === "diger") {
    return kurumAdi || "";
  }

  const map: Record<string, string> = {
    belediye: "Belediyemiz",
    mudurluk: "Müdürlüğümüz",
    bakanlik: "Bakanlığımız",
    valilik: "Valiliğimiz",
    kaymakamlik: "Kaymakamlığımız",
    universite: "Üniversitemiz",
    il_ozel: "İl Özel İdaremiz",
    koy: "Muhtarlığımız",
    sgk: "Müdürlüğümüz",
    kurul: "Kurulumuz",
  };

  return map[altKurumTipi] || kurumAdi || "";
}

export function LuzumMuzekkeresiOnayEki({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: LuzumMuzekkeresiOnayEkiProps) {
  const columns: any[] = [
    { key: "kodu", label: "Kodu", width: "15%", align: "left" },
    { key: "malzemeAdi", label: "Malzeme Adı", width: "35%", align: "left" },
    { key: "ozelligi", label: "Özelliği", width: "25%", align: "left" },
    { key: "birimi", label: "Birimi", width: "10%", align: "center" },
    { key: "kdvOrani", label: "KDV Oranı (%)", width: "10%", align: "center" },
    { key: "miktar", label: "Miktar", width: "10%", align: "right" },
  ];

  const limits = {
    firstPage: firstPageLimit ?? 15,
    middle: middlePageLimit ?? 18,
    lastPage: lastPageLimit ?? 12,
  };

  const items = (data.ihtiyacKalemleri || []).map((item: any, idx: number) => ({
    ...item,
    siraNo: item.siraNo || idx + 1,
  }));

  const pages = paginateData(items, limits);
  const defaultToday = toTrDate(new Date().toISOString().split("T")[0]);
  const dosyaTarihiVal = data.dosyaTarihi || data.tarih || defaultToday;

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
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "14pt",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "14px",
                    pageBreakInside: "avoid",
                  }}
                >
                  LÜZUM MÜZEKKERESİ
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                    marginBottom: "12px",
                    fontSize: "10pt",
                    fontWeight: "bold",
                  }}
                >
                  <div>
                    EK:{" "}
                    <EditableField
                      name="ekNo"
                      value={data.ekNo || "1"}
                      placeholder="1"
                    />
                  </div>
                </div>

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
                    name="kurumMetni"
                    value={data.kurumMetni ||
                      getKurumName(data.kurumAdi, data.altKurumTipi) ||
                      "Müdürlüğümüz"}
                    placeholder="Müdürlüğümüz"
                  />{" "}
                  için aşağıda müfredatı ve evsafı yazılı malzemelere ihtiyaç
                  görüldüğünden satın alınması arz olunur.
                </div>
              </>
            )}

            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Kalem bulunamadı"
              striped={false}
              startIndex={pageIdx === 0
                ? 0
                : limits.firstPage + (pageIdx - 1) * limits.middle}
              currentSplitIndex={limits.firstPage
                ? Number(limits.firstPage)
                : null}
            />

            {isLastPage && (
              <div
                style={{
                  marginLeft: "auto",
                  width: "220px",
                  textAlign: "center",
                  marginTop: "30px",
                  marginBottom: "20px",
                  fontSize: "11pt",
                  pageBreakInside: "avoid",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <DateEditableField
                    name="dosyaTarihi"
                    value={data.dosyaTarihi || data.tarih}
                    defaultDate={dosyaTarihiVal}
                  />
                </div>

                <PersonelCard
                  adSoyad={data.talepEdenPersonelAdi ||
                    data.hazirlayanPersonelAdi}
                  unvan={data.talepEdenPersonelUnvan ||
                    data.hazirlayanPersonelUnvan}
                  nameField="talepEdenPersonelAdi"
                  unvanField="talepEdenPersonelUnvan"
                  align="center"
                  marginTop={0}
                  marginBottom={0}
                />
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
