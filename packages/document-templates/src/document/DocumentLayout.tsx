import React, { ReactNode } from "react";
import { BaseTemplate } from "../base.schema";
import { GLOBAL_THEME } from "../theme.config";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentFooter } from "./DocumentFooter";

interface DocumentLayoutProps {
  children: ReactNode;
  data?: Partial<BaseTemplate>;
  title?: string;
  hideFooter?: boolean;
  hideHeader?: boolean;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  pageNumber?: number;
  totalPages?: number;
}

export const DocumentLayout = React.forwardRef<
  HTMLDivElement,
  DocumentLayoutProps
>(
  (
    {
      children,
      data,
      title,
      hideFooter = false,
      hideHeader = false,
      pageSize = "A4",
      orientation = "portrait",
      pageNumber,
      totalPages,
    },
    ref,
  ) => {
    const margins = GLOBAL_THEME.page.margins;

    let docWidth = "21cm";
    let docHeight = "29.7cm";

    if (pageSize === "A4") {
      docWidth = orientation === "landscape" ? "29.7cm" : "21cm";
      docHeight = orientation === "landscape" ? "21cm" : "29.7cm";
    } else if (pageSize === "A3") {
      docWidth = orientation === "landscape" ? "42cm" : "29.7cm";
      docHeight = orientation === "landscape" ? "29.7cm" : "42cm";
    }

    const dynamicPrintStyles = `
      @media print {
        @page {
          size: ${pageSize} ${orientation};
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background: white;
        }
        .screen-page-badge {
          display: none !important;
        }
      }
    `;

    const isLastPage = pageNumber !== undefined && totalPages !== undefined &&
      pageNumber === totalPages;

    return (
      <div
        ref={ref}
        className="document-container"
        style={{
          width: "100%",
          maxWidth: docWidth,
          minHeight: docHeight,
          height: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          margin: totalPages && totalPages > 1 && !isLastPage ? "0 auto 40px auto" : "0 auto",
          padding:
            `${margins.top}cm ${margins.right}cm ${margins.bottom}cm ${margins.left}cm`,
          fontFamily: GLOBAL_THEME.typography.fontFamily,
          fontSize: GLOBAL_THEME.typography.baseFontSize,
          lineHeight: GLOBAL_THEME.typography.lineHeight,
          color: GLOBAL_THEME.colors.text,
          backgroundColor: "#fff",
          position: "relative",
          pageBreakAfter: isLastPage ? "avoid" : "always",
          pageBreakInside: "avoid",
          boxSizing: "border-box",
          boxShadow: "0 4px 20px -2px rgba(0,0,0,0.12)",
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: dynamicPrintStyles }} />

        {/* ON SCREEN PAGE BADGE */}
        {pageNumber !== undefined && totalPages !== undefined && totalPages > 1 && (
          <div
            className="screen-page-badge"
            style={{
              position: "absolute",
              top: "-28px",
              left: "12px",
              padding: "3px 12px",
              fontSize: "11px",
              fontWeight: "600",
              color: "#475569",
              backgroundColor: "#f8fafc",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              userSelect: "none",
              zIndex: 10,
            }}
          >
            📄 Sayfa {pageNumber} / {totalPages}
          </div>
        )}

        {/* HEADER */}
        {!hideHeader && <DocumentHeader data={data} />}

        {/* BAŞLIK */}
        {title && (
          <div
            style={{
              textAlign: "center",
              fontSize: "14pt",
              fontWeight: "bold",
              marginTop: "30px",
              marginBottom: "20px",
              textDecoration: "underline",
            }}
          >
            {title}
          </div>
        )}

        {/* İÇERİK */}
        <div
          style={{
            marginTop: hideHeader ? "0px" : "10px",
            paddingBottom: hideFooter || data?.kurumIci ? "0.2cm" : "2.5cm",
            flex: "1 0 auto",
          }}
          className="document-content"
        >
          {children}
        </div>

        {/* FOOTER */}
        {!hideFooter && !data?.kurumIci && (
          <div style={{ marginTop: "auto", width: "100%" }}>
            <DocumentFooter data={data} />
          </div>
        )}

        {/* DİNAMİK SAYFA NUMARASI (Yalnızca 1 sayfadan fazla ise gösterilir) */}
        {pageNumber !== undefined && totalPages !== undefined && totalPages > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "1cm",
              left: "0",
              right: "0",
              textAlign: "center",
              fontSize: "9pt",
              fontWeight: "500",
              color: "#333",
            }}
          >
            {pageNumber} / {totalPages}
          </div>
        )}
      </div>
    );
  },
);

DocumentLayout.displayName = "DocumentLayout";
