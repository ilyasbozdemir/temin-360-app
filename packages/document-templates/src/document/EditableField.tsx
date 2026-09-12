import React, { useState } from "react";
import { useTemplateEdit } from "./TemplateEditContext";

export const FIELD_SOURCE_INFO: Record<string, string> = {
  evrakSayisi:
    "ℹ️ Kurum DETSİS Kodu + SDP Kodu + Dosya Numarasından otomatik üretilir. İsterseniz buradan elle değiştirebilirsiniz.",
  tarih:
    "ℹ️ Varsayılanı dosya tarihidir. Tıklayarak veya takvimden değiştirebilirsiniz.",
  onayaSunulanTarih:
    "ℹ️ Varsayılanı dosya tarihidir. Tıklayarak veya takvimden değiştirebilirsiniz.",
  onayTarihi:
    "ℹ️ Varsayılanı onay tarihidir. Tıklayarak veya takvimden değiştirebilirsiniz.",
  dosyaTarihi: "ℹ️ Dosya Açılış / Oluşturulma Tarihi alanından çekilir.",
  hazirlayanPersonelAdi:
    "ℹ️ Dosya Detayı -> Hazırlayan Personel ayarından çekilir. 'Personel Seç' menüsünden de değiştirebilirsiniz.",
  hazirlayanPersonelUnvan: "ℹ️ Seçilen Hazırlayan Personelin unvanıdır.",
  talepEdenPersonelAdi:
    "ℹ️ Dosya Detayı -> Talep Eden / Hazırlayan Personel ayarından çekilir. 'Personel Seç' menüsünden de değiştirebilirsiniz.",
  talepEdenPersonelUnvan: "ℹ️ Seçilen Talep Eden Personelin unvanıdır.",
  onaylayanPersonelAdi:
    "ℹ️ Dosya Detayı -> Onaylayan Personel (Harcama Yetkilisi) ayarından çekilir. 'Personel Seç' menüsünden de değiştirebilirsiniz.",
  onaylayanPersonelUnvan: "ℹ️ Seçilen Onaylayan Personelin unvanıdır.",
  ihtiyacYeri:
    "ℹ️ Dosya Detayı -> İhtiyaç Yeri veya Kurum Ayarları -> Harcama Birimi alanından çekilir.",
  gerekce: "ℹ️ Dosya Detayı -> İşin Açıklaması / Gerekçesi alanından çekilir.",
  aciklama: "ℹ️ Dosya Detayı -> İşin Açıklaması alanından çekilir.",
  isinAciklamasi: "ℹ️ Dosya Detayı -> İşin Açıklaması alanından çekilir.",
  isAdi: "ℹ️ Dosya Detayı -> Konu / İşin Adı alanından çekilir.",
  dosyaKonusu: "ℹ️ Dosya Detayı -> Konu alanından çekilir.",
  sunulacakMakamAdi:
    "ℹ️ Kurum Ayarları -> Sunulacak Makam Adı alanından çekilir.",
  maddeNo: "ℹ️ İhale / Doğrudan Temin Usulü (Örn: 22/d) alanından çekilir.",
  altNotlar:
    "ℹ️ Belge alt notları ve uyarılarıdır. Tıklayarak düzenleyebilirsiniz.",
  ekler: "ℹ️ Belgeye eklenen teknik şartname ve ek bilgisidir.",
  tasinirTarihi: "ℹ️ Taşınır Kayıt Yetkilisi görüş tarihidir.",
};

export interface EditableFieldProps {
  name?: string;
  value?: string;
  onChange?: (newValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  className?: string;
  isEditing?: boolean;
  title?: string;
}

export function EditableField({
  name,
  value = "",
  onChange,
  placeholder = "......",
  multiline = false,
  style = {},
  className = "",
  isEditing,
  title,
}: EditableFieldProps) {
  const context = useTemplateEdit();
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const activeEditing = isEditing !== undefined ? isEditing : context.isEditing;
  const activeOnChange = onChange ||
    (name && context.onFieldChange
      ? (val: string) => context.onFieldChange!(name, val)
      : undefined);

  if (!activeEditing || !activeOnChange) {
    return <span style={style} className={className}>{value || ""}</span>;
  }

  const tooltipText = title || (name ? FIELD_SOURCE_INFO[name] : undefined) ||
    `ℹ️ Tıklayarak '${placeholder || name || "alanı"}' düzenleyebilirsiniz.`;

  const baseStyle: React.CSSProperties = {
    backgroundColor: isFocused
      ? "#ffffff"
      : isHovered
      ? "#f8fafc"
      : "transparent",
    border: "none",
    borderBottom: isFocused
      ? "2px solid #2563eb"
      : isHovered
      ? "1.5px dashed #475569"
      : "1px dashed #94a3b8",
    borderRadius: "0",
    padding: "0 2px",
    margin: "0",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    color: "#000000",
    verticalAlign: "baseline",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
    boxSizing: "border-box",
    maxWidth: "100%",
    ...style,
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => activeOnChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        placeholder={placeholder}
        title={tooltipText}
        rows={Math.max(2, (value || "").split("\n").length)}
        style={{
          ...baseStyle,
          width: "100%",
          maxWidth: "100%",
          resize: "vertical",
          display: "block",
          lineHeight: "1.4",
          border: isFocused ? "1px solid #2563eb" : "1px dashed #cbd5e1",
          borderRadius: "3px",
          padding: "4px 6px",
        }}
        className={className}
      />
    );
  }

  const charLength = Math.max(
    (value || "").length,
    (placeholder || "").length,
    4,
  );
  const calculatedWidth = `${
    Math.min(Math.max(charLength * 9 + 10, 50), 600)
  }px`;

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => activeOnChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      placeholder={placeholder}
      title={tooltipText}
      style={{
        ...baseStyle,
        display: "inline-block",
        maxWidth: "100%",
        width: style.width || calculatedWidth,
      }}
      className={className}
    />
  );
}
