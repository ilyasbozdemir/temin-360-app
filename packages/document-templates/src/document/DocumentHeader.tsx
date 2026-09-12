import React from "react";
import { BaseTemplate } from "../base.schema";
import { GLOBAL_THEME } from "../theme.config";

interface DocumentHeaderProps {
  data?: Partial<BaseTemplate>;
  hideLogos?: boolean;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = (
  { data, hideLogos = false },
) => {
  return (
    <div
      style={{
        display: "table",
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
        minHeight: GLOBAL_THEME.spacing.headerHeight,
      }}
    >
      {/* SOL - LOGO */}
      <div
        style={{
          display: "table-cell",
          width: "90px",
          textAlign: "left",
          verticalAlign: "top",
          paddingTop: 0,
        }}
      >
        {!hideLogos && data?.solLogo && (
          <img
            src={data.solLogo}
            alt="Sol Logo"
            referrerPolicy="no-referrer"
            style={{
              maxWidth: "80px",
              maxHeight: "80px",
              objectFit: "contain",
            }}
          />
        )}
      </div>

      {/* MERKEZ - KURUM ADI VE ANTETI */}
      <div
        style={{
          display: "table-cell",
          textAlign: "center",
          verticalAlign: "top",
          paddingTop: 0,
          lineHeight: 1.3,
        }}
      >
        {data?.antetSatirlari && data.antetSatirlari.length > 0
          ? (
            data.antetSatirlari.map((satir, idx) => (
              <div
                key={idx}
                style={{
                  fontWeight: "bold",
                  fontSize: "12pt",
                  marginBottom: idx < data.antetSatirlari!.length - 1
                    ? "4px"
                    : "0",
                }}
              >
                {satir}
              </div>
            ))
          )
          : (
            <>
              <div style={{ fontWeight: "bold", fontSize: "12pt" }}>T.C.</div>
              <div style={{ fontWeight: "bold", fontSize: "12pt" }}>
                {data?.kurumUst || "BELEDİYE BAŞKANLIĞI"}
              </div>
              {data?.kurumAdi && (
                <div style={{ fontWeight: "bold", fontSize: "12pt" }}>
                  {data.kurumAdi}
                </div>
              )}
              <div style={{ fontWeight: "bold", fontSize: "12pt" }}>
                {data?.mudurluk || "Destek Hizmetleri Müdürlüğü"}
              </div>
            </>
          )}
      </div>

      {/* SAĞ - LOGO */}
      <div
        style={{
          display: "table-cell",
          width: "90px",
          textAlign: "right",
          verticalAlign: "top",
          paddingTop: 0,
        }}
      >
        {!hideLogos && data?.sagLogo && (
          <img
            src={data.sagLogo}
            alt="Sağ Logo"
            referrerPolicy="no-referrer"
            style={{
              maxWidth: "80px",
              maxHeight: "80px",
              objectFit: "contain",
            }}
          />
        )}
      </div>
    </div>
  );
};

export const DocumentHeaderCompact: React.FC<DocumentHeaderProps> = (
  { data },
) => {
  return (
    <div
      style={{ textAlign: "center", marginBottom: "15px", fontSize: "11pt" }}
    >
      {data?.kurumAdi && (
        <div style={{ fontWeight: "bold" }}>{data.kurumAdi}</div>
      )}
      {data?.mudurluk && (
        <div style={{ fontWeight: "bold" }}>{data.mudurluk}</div>
      )}
    </div>
  );
};
