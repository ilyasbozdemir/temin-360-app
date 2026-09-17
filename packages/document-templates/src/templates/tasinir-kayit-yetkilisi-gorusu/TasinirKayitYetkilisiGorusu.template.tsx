import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentTable } from "../../document/DocumentTable";
import {
  DateEditableField,
  toTrDate,
} from "../../document/ApprovalSignature";
import { EditableField } from "../../document/EditableField";
import {
  DEFAULT_LIMITS,
  LANDSCAPE_LIMITS,
  paginateData,
} from "../../document/DynamicPaginatedTable";
import { useTemplateEdit } from "../../document/TemplateEditContext";
import { TasinirKayitYetkilisiGorusuType } from "./TasinirKayitYetkilisiGorusu.schema";

interface TasinirKayitYetkilisiGorusuProps {
  data?: Partial<TasinirKayitYetkilisiGorusuType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

const DEFAULT_GORUS =
  "Yukarıda cins ve miktarları belirtilen taşınır malzemelerin ambar stoklarımızda mevcut bulunmadığı / ihtiyacı karşılamaya yetersiz olduğu tespit edilmiş olup, talep edilen malzemelerin 4734 sayılı Kamu İhale Kanununun ilgili maddeleri uyarınca doğrudan temin usulüyle piyasadan satın alınmasında sakınca bulunmamaktadır.";

export function TasinirKayitYetkilisiGorusu({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: TasinirKayitYetkilisiGorusuProps) {
  const { onFieldChange } = useTemplateEdit();

  const columns: any[] = [
    { key: "siraNo", label: "Sıra", width: "8%", align: "center" },
    { key: "malzemeAdi", label: "Taşınırın Adı", width: "42%", align: "left" },
    { key: "birimi", label: "Ölçü Birimi", width: "16%", align: "center" },
    { key: "miktar", label: "Talep Miktarı", width: "17%", align: "center" },
    {
      key: "ambarMiktari",
      label: "Ambar Mevcut Miktarı",
      width: "17%",
      align: "center",
      render: (val: any, _row: any, idx: number) => {
        return (
          <EditableField
            name={`kalem_ambar_${idx}`}
            value={val !== undefined && val !== null ? String(val) : "0 (Yok)"}
            placeholder="0 (Yok)"
          />
        );
      },
    },
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

  const rawItems = data.ihtiyacKalemleri || [];
  const normalizedItems = rawItems.map((item: any, idx: number) => ({
    siraNo: item.siraNo || item.sira || idx + 1,
    malzemeAdi: item.malzemeAdi || item.adi || item.kalem_adi || "",
    birimi: item.birimi || item.birim || "",
    miktar: item.miktar || item.talepMiktari || "",
    ambarMiktari: item.ambarMiktari || item.stokMiktari || "0 (Yok)",
  }));

  const pages = paginateData(normalizedItems, limits);
  const defaultToday = toTrDate(new Date().toISOString().split("T")[0]);

  const birimAdi =
    data.talepEdenBirimAdi ||
    data.birim_adi ||
    data.mudurluk ||
    data.harcamaBirimAdi ||
    "İlgili Talep Birimi";

  const kurumAdi =
    data.kurumAdi ||
    (data.antetSatirlari && data.antetSatirlari.length > 0
      ? data.antetSatirlari[0]
      : "İLGİLİ KAMU İDARESİ");

  const yetkiliAdi =
    data.tasinirKayitYetkilisiAdi ||
    data.hazirlayanPersonelAdi ||
    "Taşınır Kayıt Yetkilisi";

  const yetkiliUnvan =
    data.tasinirKayitYetkilisiUnvan ||
    data.hazirlayanPersonelUnvan ||
    "Taşınır Kayıt ve Kontrol Yetkilisi";

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
            hideHeader={true}
          >
            {isFirstPage && (
              <>
                {/* MERKEZİ ANTET / BAŞLIK */}
                <div
                  style={{
                    textAlign: "center",
                    lineHeight: "1.4",
                    marginBottom: "16px",
                    pageBreakInside: "avoid",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
                    T.C.
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "12pt" }}>
                    <EditableField
                      name="kurumAdi"
                      value={kurumAdi}
                      placeholder="KURUM ADI"
                    />
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "13pt",
                      marginTop: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      textDecoration: "underline",
                    }}
                  >
                    TAŞINIR KAYIT YETKİLİSİ GÖRÜŞÜ
                  </div>
                </div>

                {/* SAYI & TARİH BİLGİ BLOĞU */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                    fontSize: "10.5pt",
                    pageBreakInside: "avoid",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <strong>Sayı :</strong>
                    <EditableField
                      name="evrakSayisi"
                      value={data.evrakSayisi || ""}
                      placeholder="Evrak Sayısı Giriniz"
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <strong>Tarih :</strong>
                    <DateEditableField
                      name="tarih"
                      value={data.tarih ? toTrDate(data.tarih) : defaultToday}
                      placeholder="Tarih seçiniz"
                    />
                  </div>
                </div>

                {/* KONU VE İLGİ */}
                <div style={{ marginBottom: "12px", fontSize: "10.5pt", lineHeight: "1.6", pageBreakInside: "avoid" }}>
                  <p style={{ margin: "4px 0" }}>
                    <strong>KONU :</strong>{" "}
                    <EditableField
                      name="konu"
                      value={data.konu || "Taşınır Malzeme İhtiyacı Hakkında Görüş"}
                      placeholder="Konu giriniz"
                    />
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>İlgi :</strong>{" "}
                    <EditableField
                      name="ilgi"
                      value={
                        data.ilgi ||
                        `${data.talepTarihi ? toTrDate(data.talepTarihi) : defaultToday} tarihli İhtiyaç Talep Formu.`
                      }
                      placeholder="İlgi yazısı giriniz"
                    />
                  </p>
                </div>

                {/* GİRİŞ PARAGRAFI */}
                <p
                  style={{
                    textAlign: "justify",
                    fontSize: "10.5pt",
                    lineHeight: "1.6",
                    margin: "12px 0",
                    textIndent: "1.5cm",
                    pageBreakInside: "avoid",
                  }}
                >
                  Kurumumuz / Belediyemiz <strong>{birimAdi}</strong> tarafından talep edilen aşağıda belirtilen taşınır malzemelerin mevcut ambar kayıtları ve stok durumu incelenmiştir.
                </p>
              </>
            )}

            {/* TABLO */}
            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Talep edilen taşınır malzeme bulunmamaktadır."
            />

            {isLastPage && (
              <div style={{ marginTop: "12px", pageBreakInside: "avoid" }}>
                {/* DEĞERLENDİRME PARAGRAFI */}
                <p
                  style={{
                    textAlign: "justify",
                    fontSize: "10.5pt",
                    lineHeight: "1.6",
                    margin: "10px 0",
                    textIndent: "1.5cm",
                  }}
                >
                  Yapılan inceleme sonucunda, söz konusu taşınırların ambar mevcudunda bulunup bulunmadığı ve mevcut miktarın ihtiyacı karşılayıp karşılamadığı değerlendirilmiştir.
                </p>

                {/* GÖRÜŞ ALANI */}
                <div style={{ margin: "10px 0", fontSize: "10.5pt" }}>
                  <strong>Görüş:</strong>
                  <div
                    style={{
                      marginTop: "4px",
                      padding: "8px 12px",
                      backgroundColor: "rgba(0,0,0,0.02)",
                      borderLeft: "3px solid #6366f1",
                      textAlign: "justify",
                      lineHeight: "1.6",
                    }}
                  >
                    <EditableField
                      name="gorus"
                      value={data.gorus || DEFAULT_GORUS}
                      placeholder="Görüşünüzü giriniz..."
                      multiline
                    />
                  </div>
                </div>

                <p
                  style={{
                    textAlign: "left",
                    fontSize: "10.5pt",
                    margin: "14px 0 20px 0",
                    textIndent: "1.5cm",
                  }}
                >
                  Bilgilerinize arz ederim.
                </p>

                {/* İMZA BLOĞU (SAĞA HİZALI) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "30px",
                    textAlign: "center",
                    pageBreakInside: "avoid",
                  }}
                >
                  <div style={{ minWidth: "220px", display: "inline-block" }}>
                    <div style={{ fontWeight: "bold", fontSize: "11pt", textTransform: "uppercase" }}>
                      TAŞINIR KAYIT YETKİLİSİ
                    </div>
                    <div style={{ fontSize: "10.5pt", marginTop: "4px" }}>
                      <EditableField
                        name="tasinirKayitYetkilisiAdi"
                        value={yetkiliAdi}
                        placeholder="Yetkili Adı Soyadı"
                      />
                    </div>
                    <div style={{ fontSize: "9.5pt", color: "#475569", marginTop: "2px" }}>
                      <EditableField
                        name="tasinirKayitYetkilisiUnvan"
                        value={yetkiliUnvan}
                        placeholder="Yetkili Unvanı"
                      />
                    </div>
                    <div style={{ marginTop: "25px", fontStyle: "italic", fontSize: "9pt", color: "#94a3b8" }}>
                      (İmza)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
