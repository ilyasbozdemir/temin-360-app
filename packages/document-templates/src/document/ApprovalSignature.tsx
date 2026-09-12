import React from "react";
import { EditableField, FIELD_SOURCE_INFO } from "./EditableField";
import { useTemplateEdit } from "./TemplateEditContext";

export function toIsoDate(trDateStr?: string | null): string {
  if (!trDateStr) return new Date().toISOString().split("T")[0];
  const clean = String(trDateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return clean.split(" ")[0];
  }
  if (/^\d{2}\.\d{2}\.\d{4}/.test(clean)) {
    const [d, m, y] = clean.split(".");
    return `${y}-${m}-${d}`;
  }
  try {
    const dt = new Date(clean);
    if (!isNaN(dt.getTime())) {
      return dt.toISOString().split("T")[0];
    }
  } catch {}
  return new Date().toISOString().split("T")[0];
}

export function toTrDate(isoOrStr?: string | null): string {
  if (!isoOrStr) return "";
  const clean = String(isoOrStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const [y, m, d] = clean.split(" ")[0].split("-");
    return `${d}.${m}.${y}`;
  }
  if (/^\d{2}\.\d{2}\.\d{4}/.test(clean)) {
    return clean;
  }
  return clean;
}

export interface DateEditableFieldProps {
  name: string;
  value?: string;
  placeholder?: string;
  defaultDate?: string;
}

export function DateEditableField({
  name,
  value,
  placeholder = "GG.AA.YYYY",
  defaultDate,
}: DateEditableFieldProps) {
  const { isEditing, onFieldChange } = useTemplateEdit();
  const displayVal = value || defaultDate || toTrDate(new Date().toISOString().split("T")[0]);
  const isoVal = toIsoDate(displayVal);

  if (!isEditing || !onFieldChange) {
    return <span>{displayVal}</span>;
  }

  const tooltipText = FIELD_SOURCE_INFO[name] || "ℹ️ Tarih seçmek veya değiştirmek için takvime tıklayın.";

  return (
    <input
      type="date"
      value={isoVal}
      onChange={(e) => {
        const val = e.target.value;
        if (val) {
          onFieldChange(name, toTrDate(val));
        }
      }}
      style={{
        fontSize: "9pt",
        padding: "2px 5px",
        borderRadius: "4px",
        border: "1px solid #94a3b8",
        backgroundColor: "#f8fafc",
        cursor: "pointer",
        color: "#0f172a",
        fontFamily: "inherit",
      }}
      title={tooltipText}
    />
  );
}

export const EditableOlurPlaceholder: React.FC = () => {
  const { isEditing, onFieldChange } = useTemplateEdit();
  if (!isEditing || !onFieldChange) return null;

  return (
    <div
      onClick={() => onFieldChange("olurYazisi", true)}
      style={{
        marginTop: "30px",
        padding: "8px 16px",
        border: "1.5px dashed #94a3b8",
        borderRadius: "8px",
        textAlign: "center",
        color: "#475569",
        fontSize: "10pt",
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: "#f8fafc",
        userSelect: "none",
      }}
      title="OLUR bloğunu belgeye eklemek için tıklayın"
    >
      <span style={{ marginRight: "6px" }}>☑</span>
      OLUR Bloğu Gizli (Göster ve Düzenle)
    </div>
  );
};

interface PersonelCardProps {
  adSoyad?: string | null;
  unvan?: string | null;
  telefon?: string | null;
  eposta?: string | null;
  align?: "left" | "center" | "right";
  marginTop?: number;
  marginBottom?: number;
  showContactInfo?: boolean;
  nameField?: string;
  unvanField?: string;
  placeholderName?: string;
  placeholderUnvan?: string;
  isFirmaSelect?: boolean;
}

export const PersonelCard: React.FC<PersonelCardProps> = ({
  adSoyad,
  unvan,
  telefon,
  eposta,
  align = "center",
  marginTop = 20,
  marginBottom = 20,
  showContactInfo = false,
  nameField = "hazirlayanPersonelAdi",
  unvanField = "hazirlayanPersonelUnvan",
  placeholderName,
  placeholderUnvan,
  isFirmaSelect = false,
}) => {
  const { isEditing, onFieldChange, personelListesi, firmaListesi } = useTemplateEdit();
  const personelList = personelListesi || [];
  const rawFirmaList = firmaListesi || [];

  const normalizedFirmaList = rawFirmaList.map((item: any) => {
    if (item && item.firm) {
      const u = item.firm.unvan || item.firm.firma_adi || item.unvan || "İstekli Firma";
      return {
        ...item.firm,
        id: item.firm.id || item.id,
        unvan: u,
        total: item.total,
        isWinner: item.isWinner,
        label: item.label || item.firm.label || (item.total > 0 ? `${u} (${item.total} TL)` : u),
      };
    }
    const u = item?.unvan || item?.firma_adi || item?.name || "";
    return {
      ...item,
      unvan: u,
      label: item?.label || u,
    };
  });

  const firmaList = [...normalizedFirmaList];
  if (
    adSoyad &&
    isFirmaSelect &&
    !firmaList.some(
      (f: any) =>
        (f.unvan || f.label) &&
        String(f.unvan || f.label).trim().toLowerCase() === String(adSoyad).trim().toLowerCase()
    )
  ) {
    firmaList.unshift({ id: `custom_${adSoyad}`, unvan: adSoyad, label: adSoyad });
  }

  const validFirmaList = firmaList.filter(
    (f: any) => f && (f.unvan || f.label) && String(f.unvan || f.label).trim() !== ""
  );

  const matched = isFirmaSelect
    ? validFirmaList.find(
        (f: any) =>
          f.unvan &&
          String(f.unvan).trim().toLowerCase() === String(adSoyad || "").trim().toLowerCase()
      )
    : personelList.find(
        (p: any) =>
          p.ad_soyad &&
          String(p.ad_soyad).trim().toLowerCase() === String(adSoyad || "").trim().toLowerCase()
      );

  const selectedValue = matched ? String(matched.id || matched.unvan) : "";

  const namePlaceholder = placeholderName ||
    (isFirmaSelect ? "Firma Adı / Kaşe" : (isEditing && personelList.length > 0 ? "Adı Soyadı" : "Adı Soyadı / Kaşe"));
  const unvanPlaceholder = placeholderUnvan || "Unvanı";

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        pageBreakInside: "avoid",
        justifyContent: align === "center"
          ? "center"
          : align === "right"
          ? "flex-end"
          : "flex-start",
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
      }}
    >
      <div
        style={{
          textAlign: "center",
          minWidth: "180px",
          maxWidth: "100%",
          lineHeight: 1.45,
        }}
      >
        {isEditing && (
          <div style={{ marginBottom: "3px" }}>
            <select
              value={selectedValue}
              onChange={(e) => {
                const val = e.target.value;
                if (isFirmaSelect) {
                  const f = validFirmaList.find((item: any) => String(item.id || item.unvan) === val);
                  if (f && onFieldChange) {
                    onFieldChange(nameField, f.unvan);
                    onFieldChange(
                      unvanField,
                      f.yetkili_ad_soyad ? `Yetkili: ${f.yetkili_ad_soyad}` : "Yüklenici Firma / Yetkilisi"
                    );
                  } else if (onFieldChange && val === "") {
                    onFieldChange(nameField, "");
                    onFieldChange(unvanField, "");
                  }
                } else {
                  const selectedId = Number(val);
                  const p = personelList.find((item: any) => item.id === selectedId);
                  if (p && onFieldChange) {
                    onFieldChange(nameField, p.ad_soyad);
                    onFieldChange(unvanField, p.unvan || "");
                  } else if (onFieldChange && val === "") {
                    onFieldChange(nameField, "");
                    onFieldChange(unvanField, "");
                  }
                }
              }}
              style={{
                fontSize: "7.5pt",
                padding: "2px 4px",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#f8fafc",
                maxWidth: "180px",
                cursor: "pointer",
                margin: "0 auto",
              }}
              title={isFirmaSelect ? "Kayıtlı/İstekli firmalardan seçim yapın" : "Kayıtlı personellerden seçim yapın"}
            >
              <option value="">{isFirmaSelect ? "🏢 Firma Seç... (Seçim Yok / Null)" : "👤 Personel Seç..."}</option>
              {isFirmaSelect
                ? validFirmaList.map((f: any, idx: number) => (
                    <option key={f.id || idx} value={String(f.id || f.unvan)}>
                      {f.label || f.unvan}
                    </option>
                  ))
                : personelList.map((p: any) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.ad_soyad} {p.unvan ? `(${p.unvan})` : ""}
                    </option>
                  ))}
            </select>
          </div>
        )}

        <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
          <EditableField
            name={nameField}
            value={adSoyad || ""}
            placeholder={namePlaceholder}
          />
        </div>
        <div style={{ fontSize: "11pt" }}>
          <EditableField
            name={unvanField}
            value={unvan || ""}
            placeholder={unvanPlaceholder}
          />
        </div>
        {showContactInfo && (
          <>
            {telefon && (
              <div style={{ fontSize: "10pt", color: "#666" }}>
                Tel: {telefon}
              </div>
            )}
            {eposta && (
              <div style={{ fontSize: "10pt", color: "#666" }}>
                E-posta: {eposta}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface ApprovalSignatureProps {
  title?: string;
  date?: string | null;
  adSoyad?: string | null;
  unvan?: string | null;
  showSpace?: boolean;
  marginTop?: number;
  align?: "left" | "center" | "right";
  nameField?: string;
  unvanField?: string;
  dateField?: string;
}

export const ApprovalSignature: React.FC<ApprovalSignatureProps> = ({
  title = "OLUR",
  date,
  adSoyad,
  unvan,
  showSpace = true,
  marginTop = 40,
  align = "center",
  nameField = "onaylayanPersonelAdi",
  unvanField = "onaylayanPersonelUnvan",
  dateField = "onayTarihi",
}) => {
  const { isEditing, onFieldChange, personelListesi } = useTemplateEdit();
  const personelList = personelListesi || [];
  const matched = personelList.find(
    (p: any) =>
      p.ad_soyad &&
      String(p.ad_soyad).trim().toLowerCase() === String(adSoyad || "").trim().toLowerCase()
  );
  const selectedValue = matched ? String(matched.id) : "";

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        pageBreakInside: "avoid",
        justifyContent: align === "center"
          ? "center"
          : align === "right"
          ? "flex-end"
          : "flex-start",
        marginTop: `${marginTop}px`,
      }}
    >
      <div
        style={{
          textAlign: "center",
          minWidth: "220px",
          lineHeight: 1.5,
          position: "relative",
        }}
      >
        <div
          style={{ fontWeight: "bold", fontSize: "12pt", marginBottom: "4px" }}
        >
          <EditableField name="olurBaslik" value={title} placeholder="OLUR" />
        </div>

        <div style={{ fontSize: "11pt", marginBottom: "8px" }}>
          <DateEditableField
            name={dateField}
            value={date || ""}
            placeholder="GG.AA.YYYY"
          />
        </div>

        {isEditing && personelList.length > 0 && (
          <div style={{ marginTop: "4px", marginBottom: "6px" }}>
            <select
              value={selectedValue}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                const p = personelList.find((item: any) => item.id === selectedId);
                if (p && onFieldChange) {
                  onFieldChange(nameField, p.ad_soyad);
                  onFieldChange(unvanField, p.unvan || "");
                }
              }}
              style={{
                fontSize: "7.5pt",
                padding: "2px 4px",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#f8fafc",
                maxWidth: "180px",
                cursor: "pointer",
                margin: "0 auto",
              }}
              title="Kayıtlı personellerden seçim yapın"
            >
              <option value="">👤 Personel Seç...</option>
              {personelList.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.ad_soyad} {p.unvan ? `(${p.unvan})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {showSpace && (
          <div
            style={{ minHeight: "24px", marginBottom: "4px" }}
          />
        )}

        <div
          style={{ fontSize: "11pt", fontWeight: "bold", marginTop: "4px" }}
        >
          <EditableField
            name={nameField}
            value={adSoyad || ""}
            placeholder={isEditing && personelList.length > 0 ? "Adı Soyadı" : "Onaylayan Adı Soyadı"}
          />
        </div>

        <div style={{ fontSize: "11pt" }}>
          <EditableField
            name={unvanField}
            value={unvan || ""}
            placeholder="Unvanı"
          />
        </div>
      </div>
    </div>
  );
};

interface CommissionMember {
  adSoyad: string;
  unvan: string;
  gorevi?: string;
}

interface CommissionListProps {
  members: CommissionMember[];
  title?: string;
  marginTop?: number;
}

export const CommissionList: React.FC<CommissionListProps> = ({
  members,
  title = "Komisyon Üyeleri",
  marginTop = 30,
}) => {
  if (!members || members.length === 0) return null;

  return (
    <div style={{ marginTop: `${marginTop}px`, pageBreakInside: "avoid" }}>
      <div
        style={{ fontWeight: "bold", fontSize: "12pt", marginBottom: "15px" }}
      >
        {title}
      </div>

      {members.map((member, idx) => (
        <div key={idx} style={{ marginBottom: "12px", lineHeight: 1.6 }}>
          <div style={{ fontSize: "11pt" }}>
            <strong>{member.adSoyad}</strong>
          </div>
          <div style={{ fontSize: "10pt" }}>{member.unvan}</div>
          {member.gorevi && (
            <div style={{ fontSize: "10pt", color: "#666" }}>
              ({member.gorevi})
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface MetadataBlockProps {
  evrakSayisi?: string;
  tarih?: string;
  onayaSunulanTarih?: string;
  dosyaKonusu?: string;
  showBorder?: boolean;
}

export const MetadataBlock: React.FC<MetadataBlockProps> = ({
  evrakSayisi,
  tarih,
  onayaSunulanTarih,
  dosyaKonusu,
  showBorder = false,
}) => {
  const displayTarih = onayaSunulanTarih || tarih;

  // Sanitize dosyaKonusu if it contains accidental JSON string keys or quotes
  let cleanKonu = dosyaKonusu;
  if (typeof cleanKonu === "string") {
    const jsonMatch = cleanKonu.match(/"?[a-zA-Z0-9_]+"?\s*:\s*"([^"]+)"/);
    if (jsonMatch) {
      cleanKonu = jsonMatch[1];
    }
    cleanKonu = cleanKonu.replace(/^["']|["',]+$/g, "").trim();
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "16px",
        paddingBottom: showBorder ? "8px" : 0,
        borderBottom: showBorder ? `1px solid #ccc` : "none",
        pageBreakInside: "avoid",
      }}
    >
      <div style={{ maxWidth: "65%", flex: "1 1 auto" }}>
        <table
          style={{
            border: "none",
            padding: 0,
            margin: 0,
            fontSize: "11pt",
            borderSpacing: 0,
            width: "100%",
          }}
        >
          <tbody>
            {evrakSayisi !== undefined && (
              <tr>
                <td style={{ verticalAlign: "top", padding: "1px 0", width: "45px" }}>
                  <strong>Sayı</strong>
                </td>
                <td style={{ verticalAlign: "top", padding: "1px 5px 1px 0", width: "10px" }}>
                  <strong>:</strong>
                </td>
                <td style={{ verticalAlign: "top", padding: "1px 0" }}>
                  <EditableField name="evrakSayisi" value={evrakSayisi} />
                </td>
              </tr>
            )}
            {dosyaKonusu !== undefined && (
              <tr>
                <td style={{ verticalAlign: "top", padding: "1px 0", width: "45px" }}>
                  <strong>Konu</strong>
                </td>
                <td style={{ verticalAlign: "top", padding: "1px 5px 1px 0", width: "10px" }}>
                  <strong>:</strong>
                </td>
                <td
                  style={{
                    verticalAlign: "top",
                    padding: "1px 0",
                    textAlign: "justify",
                  }}
                >
                  <EditableField name="dosyaKonusu" value={cleanKonu} style={{ width: "100%" }} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {displayTarih !== undefined && (
        <div style={{ fontSize: "11pt", textAlign: "right", whiteSpace: "nowrap", flexShrink: 0, paddingLeft: "16px", paddingTop: "1px" }}>
          <strong>Tarih:</strong>{" "}
          <DateEditableField name="onayaSunulanTarih" value={displayTarih} />
        </div>
      )}
    </div>
  );
};
