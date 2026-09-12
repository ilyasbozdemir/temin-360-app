import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentTable } from "../../document/DocumentTable";
import {
  ApprovalSignature,
  EditableOlurPlaceholder,
  MetadataBlock,
  PersonelCard,
} from "../../document/ApprovalSignature";
import { EditableField } from "../../document/EditableField";
import {
  DEFAULT_LIMITS,
  LANDSCAPE_LIMITS,
  paginateData,
} from "../../document/DynamicPaginatedTable";
import { LuzumMuzekkeresiType } from "./LuzumMuzekkeresi.schema";

interface LuzumMuzekkeresiProps {
  data?: Partial<LuzumMuzekkeresiType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

export function LuzumMuzekkeresi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: LuzumMuzekkeresiProps) {
  const columns: any[] = [
    { key: "siraNo", label: "Sıra No", width: "8%", align: "center" },
    { key: "kodu", label: "Kodu", width: "12%", align: "left" },
    { key: "malzemeAdi", label: "Malzeme Adı", width: "25%", align: "left" },
    { key: "ozelligi", label: "Özelliği", width: "20%", align: "left" },
    { key: "birimi", label: "Birimi", width: "10%", align: "center" },
    { key: "kdvOrani", label: "KDV  Oranı %", width: "8%", align: "center" },
    { key: "miktar", label: "Miktar", width: "12%", align: "right" },
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
  const items = data.ihtiyacKalemleri || [];
  const pages = paginateData(items, limits);

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
                <MetadataBlock
                  evrakSayisi={data.evrakSayisi}
                  tarih={data.onayaSunulanTarih || data.tarih ||
                    data.dosyaTarihi}
                  dosyaKonusu={data.dosyaKonusu || "Lüzum Müzekkeresi"}
                  showBorder={false}
                />

                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "12pt",
                    textTransform: "uppercase",
                    marginBottom: "20px",
                    pageBreakInside: "avoid",
                  }}
                >
                  <EditableField
                    name="sunulacakMakamAdi"
                    value={data.sunulacakMakamAdi}
                    placeholder="SUNULACAK MAKAM ADI"
                  />
                </div>

                <div
                  style={{
                    textAlign: "justify",
                    textIndent: "40px",
                    marginBottom: "12px",
                    fontSize: "12pt",
                    lineHeight: 1.5,
                  }}
                >
                  <EditableField
                    name="ihtiyacYeri"
                    value={data.ihtiyacYeri || "Müdürlüğümüzün"}
                    placeholder="İhtiyaç Yeri"
                  />{" "}
                  ihtiyacı olan aşağıda yazılı mal/hizmet kalemlerinin temin
                  edilmesi gerekmektedir.
                </div>

                <div
                  style={{
                    textAlign: "justify",
                    textIndent: "40px",
                    marginBottom: "20px",
                    fontSize: "12pt",
                    lineHeight: 1.5,
                  }}
                >
                  Söz konusu ihtiyacın 4734 sayılı Kanunun{" "}
                  <EditableField
                    name="maddeNo"
                    value={data.maddeNo || "ilgili"}
                    placeholder="ilgili"
                  />{" "}
                  maddesine göre temini için gereğini olurlarınıza arz ederim.
                </div>

                <PersonelCard
                  adSoyad={data.talepEdenPersonelAdi}
                  unvan={data.talepEdenPersonelUnvan}
                  nameField="talepEdenPersonelAdi"
                  unvanField="talepEdenPersonelUnvan"
                  placeholderName="Talep Eden Adı Soyadı"
                  placeholderUnvan="Talep Eden Unvanı"
                  align="right"
                  marginTop={20}
                  marginBottom={30}
                />
              </>
            )}

            {isFirstPage && Number((data as any).ekstraBosluk || 0) > 0 && (
              <div
                style={{
                  height: `${Number((data as any).ekstraBosluk)}px`,
                  transition: "height 0.2s ease",
                }}
              />
            )}

            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Kalem bulunamadı"
              striped={false}
              startIndex={pageIdx === 0
                ? 0
                : limits.firstPage + (pageIdx - 1) * limits.middle}
              currentSplitIndex={fLimit ? Number(fLimit) : null}
            />

            {isLastPage && (
              <>
                {data.isinAciklamasi && (
                  <div
                    style={{
                      marginTop: "15px",
                      marginBottom: "15px",
                      textAlign: "justify",
                      fontSize: "11pt",
                      lineHeight: 1.5,
                      pageBreakInside: "avoid",
                    }}
                  >
                    <EditableField
                      name="isinAciklamasi"
                      value={data.isinAciklamasi}
                      placeholder="İşin Açıklaması..."
                      multiline
                    />
                  </div>
                )}

                {data.hasAciklamaMaddeleri &&
                  Array.isArray(data.aciklamaMaddeleri) && (
                  <div
                    style={{
                      marginTop: "15px",
                      marginBottom: "15px",
                      textAlign: "justify",
                      fontSize: "11pt",
                      lineHeight: 1.5,
                      pageBreakInside: "avoid",
                    }}
                  >
                    <ol style={{ margin: 0, paddingLeft: "20px" }}>
                      {data.aciklamaMaddeleri.map((madde: any, idx: number) => (
                        <li
                          key={idx}
                          style={{ marginBottom: "6px", paddingLeft: "5px" }}
                        >
                          {madde.maddeMetni ||
                            (typeof madde === "string" ? madde : "")}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <PersonelCard
                  adSoyad={data.hazirlayanPersonelAdi}
                  unvan={data.hazirlayanPersonelUnvan}
                  nameField="hazirlayanPersonelAdi"
                  unvanField="hazirlayanPersonelUnvan"
                  placeholderName="Hazırlayan Adı Soyadı"
                  placeholderUnvan="Hazırlayan Unvanı"
                  align="right"
                  marginTop={20}
                  marginBottom={20}
                />

                {data.olurYazisi !== false
                  ? (
                    <div style={{ marginTop: "auto" }}>
                      <ApprovalSignature
                        title={data.olurBaslik || "OLUR"}
                        date={data.onayTarihi || data.tarih || data.dosyaTarihi}
                        adSoyad={data.onaylayanPersonelAdi}
                        unvan={data.onaylayanPersonelUnvan}
                        showSpace={true}
                      />
                    </div>
                  )
                  : <EditableOlurPlaceholder />}
              </>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
