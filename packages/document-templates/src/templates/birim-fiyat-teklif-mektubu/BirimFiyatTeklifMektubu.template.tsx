import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { BirimFiyatTeklifMektubuType } from "./BirimFiyatTeklifMektubu.schema";

interface BirimFiyatTeklifMektubuProps {
  data?: Partial<BirimFiyatTeklifMektubuType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function BirimFiyatTeklifMektubu({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: BirimFiyatTeklifMektubuProps) {
  const items = data.ihtiyacKalemleri || [];
  const firstPageLimit = data.firstPageLimit ? Number(data.firstPageLimit) : 10;
  const isMultiPage = items.length > firstPageLimit;
  const page1Items = isMultiPage ? items.slice(0, firstPageLimit) : items;
  const page2Items = isMultiPage ? items.slice(firstPageLimit) : [];
  const totalPages = isMultiPage ? 2 : 1;

  const renderTableHead = () => (
    <thead>
      <tr style={{ backgroundColor: "#f2f2f2" }}>
        <th style={{ border: "1px solid #000", padding: "5px 4px", width: "6%", textAlign: "center", fontWeight: "bold" }}>
          S.No
        </th>
        <th style={{ border: "1px solid #000", padding: "5px 6px", width: "36%", textAlign: "left", fontWeight: "bold" }}>
          Mal/Hizmet Kaleminin Adı ve Kısa Açıklaması
        </th>
        <th style={{ border: "1px solid #000", padding: "5px 6px", width: "18%", textAlign: "left", fontWeight: "bold" }}>
          Özelliği
        </th>
        <th style={{ border: "1px solid #000", padding: "5px 4px", width: "10%", textAlign: "center", fontWeight: "bold" }}>
          Birimi
        </th>
        <th style={{ border: "1px solid #000", padding: "5px 4px", width: "10%", textAlign: "center", fontWeight: "bold" }}>
          Miktarı
        </th>
        <th style={{ border: "1px solid #000", padding: "5px 4px", width: "10%", textAlign: "center", fontWeight: "bold" }}>
          Birim Fiyat (TL)
        </th>
        <th style={{ border: "1px solid #000", padding: "5px 4px", width: "10%", textAlign: "center", fontWeight: "bold" }}>
          Tutarı (TL)
        </th>
      </tr>
    </thead>
  );

  const renderTableRows = (rowItems: typeof items, startIndex = 0) => (
    <tbody>
      {rowItems.length > 0 ? (
        rowItems.map((item, idx) => {
          const rowNum = startIndex + idx + 1;
          return (
            <tr key={idx}>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>
                {item.siraNo || rowNum}
              </td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>{item.malzemeAdi}</td>
              <td style={{ border: "1px solid #000", padding: "4px 6px" }}>{item.ozelligi || "-"}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>
                {item.birimi || "-"}
              </td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right" }}>
                {item.miktar}
              </td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right" }}>
                {item.birimFiyat ? `${item.birimFiyat} ₺` : ""}
              </td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right" }}>
                {item.tutar ? `${item.tutar} ₺` : ""}
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td
            colSpan={7}
            style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontStyle: "italic" }}
          >
            Kalem bulunamadı
          </td>
        </tr>
      )}
    </tbody>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SAYFA 1: BİRİM FİYAT TEKLİF MEKTUBU VE CETVELİ (BÜTÜNLEŞİK)            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <DocumentLayout
        data={data as any}
        hideFooter={false}
        pageSize={pageSize}
        orientation={orientation}
        pageNumber={1}
        totalPages={totalPages}
      >
        <div
          style={{
            width: "100%",
            fontSize: "10pt",
            color: "#000",
            fontFamily: "'Times New Roman', Times, serif",
            lineHeight: 1.35,
          }}
        >
          <div style={{ textAlign: "right", fontWeight: "bold", marginBottom: "4px" }}>
            <DateEditableField name="dosyaTarihi" value={data.dosyaTarihi || data.tarih} placeholder="GG.AA.YYYY" />
          </div>

          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "12pt",
              margin: "4px 0",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            BİRİM FİYAT TEKLİF MEKTUBU VE CETVELİ
          </div>

          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "11pt", marginBottom: "8px" }}>
            <EditableField
              name="hitap"
              value={data.hitap || data.idareAdi || "KURUM / MAKAM ADI"}
              placeholder="KURUM / MAKAM ADI"
            />
          </div>

          {/* TEKLİF VE FİRMA BİLGİLERİ TABLOSU */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "9.5pt" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #000", padding: "4px 6px", fontWeight: "bold", width: "30%", backgroundColor: "#fafafa" }}>
                  İşin Adı / Konusu
                </td>
                <td style={{ border: "1px solid #000", padding: "4px 6px", width: "70%" }}>
                  <EditableField name="isinAdi" value={data.isinAdi || data.dosyaKonusu} placeholder="İşin Adı" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "4px 6px", fontWeight: "bold", backgroundColor: "#fafafa" }}>
                  Teklif Sahibinin Adı / Ünvanı
                </td>
                <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                  <EditableField name="teklifSahibi" value={data.teklifSahibi || data.firmaUnvani} placeholder="Teklif Sahibi" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "4px 6px", fontWeight: "bold", backgroundColor: "#fafafa" }}>
                  T.C. / Vergi Kimlik No
                </td>
                <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                  <EditableField name="vergiNo" value={data.vergiNo || data.firmaVergiNo || data.tcKimlikNo} placeholder="Vergi / TC Kimlik No" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "4px 6px", fontWeight: "bold", backgroundColor: "#fafafa" }}>
                  Tebligat Adresi / İletişim
                </td>
                <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                  <EditableField
                    name="tebligatAdresi"
                    value={
                      data.tebligatAdresi ||
                      [data.firmaAdresi, data.telefon || data.telefonFaks, data.eposta || data.email].filter(Boolean).join(" - ")
                    }
                    placeholder="Adres / Telefon / E-posta"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* TAAHHÜT METNİ */}
          <div
            style={{
              border: "1px solid #000",
              padding: "5px 8px",
              fontSize: "8.5pt",
              textAlign: "justify",
              lineHeight: 1.3,
              marginBottom: "8px",
              backgroundColor: "#fff",
            }}
          >
            {data.aciklama ? (
              <EditableField name="aciklama" value={data.aciklama} multiline placeholder="Taahhüt Açıklaması" />
            ) : (
              <div>
                1. Yukarıda adı ve konusu belirtilen işe / alıma ait tüm şartları okudum ve aynen kabul ettim.
                <br />
                2. Teklifimiz teklif tarihinden itibaren geçerli olup teklifimize Damga Vergisi, Harç, Nakliye ve Sigorta giderleri dahildir.
                <br />
                3. Alıma konu işin / malların tamamını aşağıdaki Birim Fiyat Teklif Cetvelinde belirttiğimiz birim fiyatlar üzerinden KDV HARİÇ bedel karşılığında vermeyi kabul ve taahhüt ederiz.
              </div>
            )}
          </div>

          {/* CETVEL TABLOSU */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px", fontSize: "9pt" }}>
            {renderTableHead()}
            {renderTableRows(page1Items, 0)}
            {!isMultiPage && (
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ border: "none", textAlign: "left", padding: "6px 0", fontStyle: "italic", fontSize: "9pt" }}>
                    Para birimi: TL
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center", fontWeight: "bold", backgroundColor: "#f2f2f2" }}>
                    Toplam Tutar (KDV Hariç)
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px", height: "26px", textAlign: "right", fontWeight: "bold" }}>
                    {data.toplamTutar ? `${data.toplamTutar} ₺` : ""}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* İMZA BLOĞU (Eğer sayfa 1'de bitiyorsa) */}
          {!isMultiPage && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginTop: "12px",
                paddingTop: "4px",
              }}
            >
              <div style={{ fontStyle: "italic", color: "#333", fontSize: "9pt" }}>
                Para Birimi: Türk Lirası (TL)
              </div>
              <div style={{ textAlign: "center", minWidth: "220px", fontSize: "9.5pt", lineHeight: 1.3, marginLeft: "auto" }}>
                <DateEditableField name="tarih" value={data.tarih || data.dosyaTarihi} placeholder="……/……/20…" />
                <div style={{ marginTop: "4px", fontWeight: "bold" }}>
                  {data.teklifSahibi || data.firmaUnvani || "Firma / Yetkili Adı"}
                </div>
                <div style={{ marginTop: "16px" }}>Kaşe - İmza</div>
              </div>
            </div>
          )}
        </div>
      </DocumentLayout>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SAYFA 2 (Sadece kalem sayısı 10'dan fazla ise devreye girer)             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isMultiPage && (
        <DocumentLayout
          data={data as any}
          hideFooter={false}
          pageSize={pageSize}
          orientation={orientation}
          pageNumber={2}
          totalPages={2}
          hideHeader={true}
        >
          <div
            style={{
              width: "100%",
              fontSize: "10pt",
              color: "#000",
              fontFamily: "'Times New Roman', Times, serif",
              lineHeight: 1.35,
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "11pt", marginBottom: "8px", textAlign: "center" }}>
              BİRİM FİYAT TEKLİF CETVELİ (DEVAMI)
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px", fontSize: "9pt" }}>
              {renderTableHead()}
              {renderTableRows(page2Items, firstPageLimit)}
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ border: "none", textAlign: "left", padding: "6px 0", fontStyle: "italic", fontSize: "9pt" }}>
                    Para birimi: TL
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center", fontWeight: "bold", backgroundColor: "#f2f2f2" }}>
                    Toplam Tutar (KDV Hariç)
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px", height: "26px", textAlign: "right", fontWeight: "bold" }}>
                    {data.toplamTutar ? `${data.toplamTutar} ₺` : ""}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginTop: "16px",
              }}
            >
              <div style={{ fontStyle: "italic", color: "#333", fontSize: "9pt" }}>
                Para Birimi: Türk Lirası (TL)
              </div>
              <div style={{ textAlign: "center", minWidth: "220px", fontSize: "9.5pt", lineHeight: 1.3, marginLeft: "auto" }}>
                <DateEditableField name="tarih" value={data.tarih || data.dosyaTarihi} placeholder="……/……/20…" />
                <div style={{ marginTop: "4px", fontWeight: "bold" }}>
                  {data.teklifSahibi || data.firmaUnvani || "Firma / Yetkili Adı"}
                </div>
                <div style={{ marginTop: "16px" }}>Kaşe - İmza</div>
              </div>
            </div>
          </div>
        </DocumentLayout>
      )}
    </>
  );
}
