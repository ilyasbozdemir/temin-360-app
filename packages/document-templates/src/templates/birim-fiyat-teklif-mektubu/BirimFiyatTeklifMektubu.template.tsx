import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { TableRowSplitDivider } from "../../document/TableRowSplitDivider";
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
  const firstPageLimit = data.firstPageLimit ? Number(data.firstPageLimit) : 14;
  const isMultiPageCetvel = items.length > firstPageLimit;
  const cetvelPage1Items = isMultiPageCetvel ? items.slice(0, firstPageLimit) : items;
  const cetvelPage2Items = isMultiPageCetvel ? items.slice(firstPageLimit) : [];

  const totalPages = isMultiPageCetvel ? 3 : 2;

  const renderCetvelTableHead = () => (
    <thead>
      <tr style={{ backgroundColor: "#f2f2f2" }}>
        <th style={{ border: "1px solid #000", padding: "6px", width: "7%", textAlign: "center", fontWeight: "bold" }}>
          Sıra No
        </th>
        <th style={{ border: "1px solid #000", padding: "6px", width: "38%", textAlign: "left", fontWeight: "bold" }}>
          Mal/Hizmet Kaleminin Adı ve Kısa Açıklaması
        </th>
        <th style={{ border: "1px solid #000", padding: "6px", width: "20%", textAlign: "left", fontWeight: "bold" }}>
          Özelliği
        </th>
        <th style={{ border: "1px solid #000", padding: "6px", width: "10%", textAlign: "center", fontWeight: "bold" }}>
          Birimi
        </th>
        <th style={{ border: "1px solid #000", padding: "6px", width: "10%", textAlign: "center", fontWeight: "bold" }}>
          Miktarı
        </th>
        <th style={{ border: "1px solid #000", padding: "6px", width: "15%", textAlign: "center", fontWeight: "bold" }}>
          Birim Fiyatı (TL)
        </th>
        <th style={{ border: "1px solid #000", padding: "6px", width: "15%", textAlign: "center", fontWeight: "bold" }}>
          Tutarı (TL)
        </th>
      </tr>
    </thead>
  );

  const renderCetvelTableRows = (rowItems: typeof items, startIndex = 0) => (
    <tbody>
      {rowItems.length > 0 ? (
        rowItems.map((item, idx) => {
          const rowNum = startIndex + idx + 1;
          return (
            <tr key={idx}>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                {item.siraNo || rowNum}
              </td>
              <td style={{ border: "1px solid #000", padding: "6px" }}>{item.malzemeAdi}</td>
              <td style={{ border: "1px solid #000", padding: "6px" }}>{item.ozelligi || "-"}</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                {item.birimi || "-"}
              </td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>
                {item.miktar}
              </td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>
                {item.birimFiyat ? `${item.birimFiyat} ₺` : ""}
              </td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>
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
      {/* SAYFA 1: BİRİM FİYAT TEKLİF MEKTUBU                                    */}
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
            fontSize: "11pt",
            color: "#000",
            fontFamily: "'Times New Roman', Times, serif",
            lineHeight: 1.4,
          }}
        >
          <div style={{ textAlign: "right", fontWeight: "bold", marginBottom: "8px" }}>
            <DateEditableField name="dosyaTarihi" value={data.dosyaTarihi || data.tarih} placeholder="GG.AA.YYYY" />
          </div>

          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "12.5pt",
              margin: "6px 0",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            BİRİM FİYAT TEKLİF MEKTUBU
          </div>

          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "11.5pt", marginBottom: "12px" }}>
            <EditableField
              name="hitap"
              value={data.hitap || data.idareAdi || "KURUM / MAKAM ADI"}
              placeholder="KURUM / MAKAM ADI"
            />
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", fontSize: "10pt" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold", width: "35%" }}>
                  İhalenin Adı / İşin Adı
                </td>
                <td style={{ border: "1px solid #000", padding: "5px 8px", width: "65%" }}>
                  <EditableField name="isinAdi" value={data.isinAdi || data.dosyaKonusu} placeholder="İşin Adı" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>
                  Teklif sahibinin adı ve soyadı / ünvanı
                </td>
                <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                  <EditableField name="teklifSahibi" value={data.teklifSahibi || data.firmaUnvani} placeholder="Teklif Sahibi" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>Uyruğu</td>
                <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                  <EditableField name="uyrugu" value={data.uyrugu || "T.C."} placeholder="Uyruğu" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>
                  TC kimlik numarası (gerçek kişi ise)
                </td>
                <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                  <EditableField name="tcKimlikNo" value={data.tcKimlikNo} placeholder="TC Kimlik No" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>
                  Tüzel kişi ise, tüm ortakların Adı Soyadı ve T.C. Kimlik numaraları
                </td>
                <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                  <EditableField name="ortaklarinTcNo" value={data.ortaklarinTcNo} placeholder="Ortakların TC Kimlik No" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>
                  Vergi Kimlik Numarası
                </td>
                <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                  <EditableField name="vergiNo" value={data.vergiNo || data.firmaVergiNo} placeholder="Vergi Kimlik No" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>Tebligat adresi</td>
                <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                  <EditableField name="tebligatAdresi" value={data.tebligatAdresi || data.firmaAdresi} placeholder="Tebligat Adresi" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>
                  Telefon ve Faks numarası
                </td>
                <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                  <EditableField name="telefonFaks" value={data.telefonFaks || data.telefon} placeholder="Telefon / Faks" />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>
                  Elektronik posta adresi
                </td>
                <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                  <EditableField name="eposta" value={data.eposta || data.email} placeholder="E-Posta" />
                </td>
              </tr>
            </tbody>
          </table>

          {/* AÇIKLAMA / TAAHHÜT METNİ */}
          <div
            style={{
              border: "1px solid #000",
              padding: "7px 10px",
              fontSize: "9.5pt",
              textAlign: "justify",
              lineHeight: 1.35,
              marginTop: "8px",
            }}
          >
            {data.aciklama ? (
              <EditableField name="aciklama" value={data.aciklama} multiline placeholder="Taahhüt Açıklaması" />
            ) : (
              <div>
                1. Teklifimiz teklif verme tarihine kadar geçerlidir.
                <br />
                2. Teklifimize Damga Vergisi, Resim Harç, Pul ve Ulaştırma Giderleri dahildir.
                <br />
                3. İhale konusu iş için sermayesinin %50'sinden fazlasına sahip olduğumuz başka bir tüzel kişinin bu işe ayrı bir teklif vermediğini beyan ediyoruz.
                <br />
                4. Aldığınız herhangi bir teklifi veya en düşük teklifi seçmek zorunda olmadığınızı kabul ediyoruz.
                <br />
                5. İhale konusu işle ilgili olmak üzere idarenizce yapılacak/yaptırılacak diğer işlerde idarenizin çıkarlarına aykırı düşecek hiçbir eylem ve oluşum içerisinde olmayacağımızı taahhüt ediyoruz.
                <br />
                6. Bu alıma ilişkin malzeme kalemlerine kısmi teklif verilmemiştir.
                <br />
                7. 4734 Sayılı Kamu İhale Kanununun 4.maddesindeki "Yerli İstekli" tanımı gereğince yerli istekli durumundayız.
                <br />
                8. İhale konusu işin tamamını Teklif Mektubumuzun ekindeki Birim Fiyat Teklif Cetvelinde belirtilen her bir iş kalemi için teklif ettiğimiz birim fiyatları üzerinden KDV HARİÇ bedel karşılığında kabul ve taahhüt ederiz.
              </div>
            )}
          </div>

          {/* FİRMA YETKİLİSİ İMZA ALANI */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: "20px",
              paddingTop: "5px",
            }}
          >
            <div style={{ fontStyle: "italic", color: "#333", fontSize: "10.5pt" }}>
              Para Birimi: Türk Lirası (TL)
            </div>
            <div style={{ textAlign: "center", minWidth: "220px", fontSize: "10.5pt", lineHeight: 1.4, marginLeft: "auto" }}>
              <DateEditableField name="tarih" value={data.tarih || data.dosyaTarihi} placeholder="……/……/20…" />
              <div style={{ marginTop: "4px", fontWeight: "bold" }}>
                {data.teklifSahibi || data.firmaUnvani || "Firma / Yetkili Adı"}
              </div>
              <div style={{ marginTop: "20px" }}>Kaşe - İmza</div>
            </div>
          </div>
        </div>
      </DocumentLayout>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SAYFA 2: BİRİM FİYAT TEKLİF CETVELİ                                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <DocumentLayout
        data={data as any}
        hideFooter={false}
        pageSize={pageSize}
        orientation={orientation}
        pageNumber={2}
        totalPages={totalPages}
        hideHeader={false}
      >
        <div
          style={{
            width: "100%",
            fontSize: "11pt",
            color: "#000",
            fontFamily: "'Times New Roman', Times, serif",
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "12.5pt",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            BİRİM FİYAT TEKLİF CETVELİ
          </div>

          {/* ÜST METADATA BİLGİLERİ */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px", fontSize: "10pt" }}>
            <tbody>
              <tr>
                <td style={{ width: "200px", fontWeight: "bold", padding: "3px 0" }}>İdarenin Adı</td>
                <td style={{ padding: "3px 0" }}>: {data.idareAdi || "İdare Adı"}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "3px 0" }}>Doğrudan Temin Numarası</td>
                <td style={{ padding: "3px 0" }}>: {data.dogrudanTeminNo || data.dosyaNo || "-"}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "3px 0" }}>İşin Adı</td>
                <td style={{ padding: "3px 0" }}>: {data.isinAdi || data.dosyaKonusu || "-"}</td>
              </tr>
            </tbody>
          </table>

          {/* CETVEL TABLOSU */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "10pt" }}>
            {renderCetvelTableHead()}
            {renderCetvelTableRows(cetvelPage1Items, 0)}
            {!isMultiPageCetvel && (
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ border: "none", textAlign: "left", padding: "8px 0", fontStyle: "italic" }}>
                    Para birimi: TL
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold" }}>
                    Toplam Tutar (K.D.V. Hariç)
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px", height: "32px", textAlign: "right" }}>
                    {data.toplamTutar ? `${data.toplamTutar} ₺` : ""}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* TAAHHÜT / AÇIKLAMA NOTU & İMZA BLOĞU (Eğer sayfa 2'de bitiyorsa) */}
          {!isMultiPageCetvel && (
            <>
              <div
                style={{
                  marginTop: "16px",
                  fontSize: "9.5pt",
                  textAlign: "justify",
                  textIndent: "30px",
                  lineHeight: 1.4,
                }}
              >
                Yukarıda belirtilen ve idarenizce satın alınacak olan malların / hizmetlerin cinsi, özellikleri, miktarı ve diğer şartlarını okudum. KDV hariç yukarıda yazılı toplam bedelle vermeyi kabul ve taahhüt ediyorum.
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginTop: "24px",
                }}
              >
                <div style={{ fontStyle: "italic", color: "#333", fontSize: "10.5pt" }}>
                  Para Birimi: Türk Lirası (TL)
                </div>
                <div style={{ textAlign: "center", minWidth: "220px", fontSize: "10.5pt", lineHeight: 1.4, marginLeft: "auto" }}>
                  <DateEditableField name="tarih" value={data.tarih || data.dosyaTarihi} placeholder="……/……/20…" />
                  <div style={{ marginTop: "4px", fontWeight: "bold" }}>
                    {data.teklifSahibi || data.firmaUnvani || "Firma veya Kişinin Adı Soyadı / Kaşe"}
                  </div>
                  <div style={{ marginTop: "20px" }}>İmza / Kaşe</div>
                </div>
              </div>
            </>
          )}
        </div>
      </DocumentLayout>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SAYFA 3 (Eğer kalem sayısı fazla ise): CETVEL DEVAMI                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isMultiPageCetvel && (
        <DocumentLayout
          data={data as any}
          hideFooter={false}
          pageSize={pageSize}
          orientation={orientation}
          pageNumber={3}
          totalPages={3}
          hideHeader={true}
        >
          <div
            style={{
              width: "100%",
              fontSize: "11pt",
              color: "#000",
              fontFamily: "'Times New Roman', Times, serif",
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "11.5pt", marginBottom: "10px" }}>
              Birim Fiyat Teklif Cetveli (Devamı)
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "10pt" }}>
              {renderCetvelTableHead()}
              {renderCetvelTableRows(cetvelPage2Items, firstPageLimit)}
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ border: "none", textAlign: "left", padding: "8px 0", fontStyle: "italic" }}>
                    Para birimi: TL
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold" }}>
                    Toplam Tutar (K.D.V. Hariç)
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px", height: "32px", textAlign: "right" }}>
                    {data.toplamTutar ? `${data.toplamTutar} ₺` : ""}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div
              style={{
                marginTop: "16px",
                fontSize: "9.5pt",
                textAlign: "justify",
                textIndent: "30px",
                lineHeight: 1.4,
              }}
            >
              Yukarıda belirtilen ve idarenizce satın alınacak olan malların / hizmetlerin cinsi, özellikleri, miktarı ve diğer şartlarını okudum. KDV hariç yukarıda yazılı toplam bedelle vermeyi kabul ve taahhüt ediyorum.
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginTop: "24px",
              }}
            >
              <div style={{ fontStyle: "italic", color: "#333", fontSize: "10.5pt" }}>
                Para Birimi: Türk Lirası (TL)
              </div>
              <div style={{ textAlign: "center", minWidth: "220px", fontSize: "10.5pt", lineHeight: 1.4, marginLeft: "auto" }}>
                <DateEditableField name="tarih" value={data.tarih || data.dosyaTarihi} placeholder="……/……/20…" />
                <div style={{ marginTop: "4px", fontWeight: "bold" }}>
                  {data.teklifSahibi || data.firmaUnvani || "Firma veya Kişinin Adı Soyadı / Kaşe"}
                </div>
                <div style={{ marginTop: "20px" }}>İmza / Kaşe</div>
              </div>
            </div>
          </div>
        </DocumentLayout>
      )}
    </>
  );
}
