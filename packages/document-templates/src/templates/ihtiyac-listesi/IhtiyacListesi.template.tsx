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
import { IhtiyacListesiType } from "./IhtiyacListesi.schema";

interface IhtiyacListesiProps {
  data?: Partial<IhtiyacListesiType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

export function IhtiyacListesi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: IhtiyacListesiProps) {
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
                  dosyaKonusu={data.dosyaKonusu}
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
                  edilmesi gerekmektedir;
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
                  Söz konusu ihtiyacın 4734 sayılı Kamu İhale Kanununun{" "}
                  <EditableField
                    name="maddeNo"
                    value={data.maddeNo || "ilgili"}
                    placeholder="ilgili"
                  />{" "}
                  maddesine göre temini için gereğini olurlarınıza arz ederim.
                </div>

                <PersonelCard
                  adSoyad={data.hazirlayanPersonelAdi}
                  unvan={data.hazirlayanPersonelUnvan}
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
              data.olurYazisi !== false
                ? (
                  <div style={{ marginTop: "auto" }}>
                    <ApprovalSignature
                      title={(data as any).olurBaslik || "OLUR"}
                      date={data.onayTarihi || data.dosyaTarihi || data.tarih ||
                        data.onayaSunulanTarih}
                      adSoyad={data.onaylayanPersonelAdi}
                      unvan={data.onaylayanPersonelUnvan}
                      showSpace={true}
                      marginTop={40}
                    />
                  </div>
                )
                : <EditableOlurPlaceholder />
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
