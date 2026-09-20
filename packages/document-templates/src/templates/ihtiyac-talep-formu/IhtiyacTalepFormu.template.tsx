import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentTable } from "../../document/DocumentTable";
import {
  DateEditableField,
  MetadataBlock,
  toIsoDate,
  toTrDate,
} from "../../document/ApprovalSignature";
import { EditableField } from "../../document/EditableField";
import {
  DEFAULT_LIMITS,
  LANDSCAPE_LIMITS,
  paginateData,
} from "../../document/DynamicPaginatedTable";
import { useTemplateEdit } from "../../document/TemplateEditContext";
import { IhtiyacTalepFormuType } from "./IhtiyacTalepFormu.schema";

interface IhtiyacTalepFormuProps {
  data?: Partial<IhtiyacTalepFormuType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

function getDynamicAltNotlar(data: any): string {
  if (data?.altNotlar) return data.altNotlar;

  const birimAdi =
    data?.mudurluk ||
    data?.birim_adi ||
    data?.harcamaBirimAdi ||
    "Destek Hizmetleri Başkanlığı";

  let birimYonelme = birimAdi;
  if (!birimAdi.endsWith("na") && !birimAdi.endsWith("ne")) {
    if (/[ıi]$/i.test(birimAdi) || /[uü]$/i.test(birimAdi) || /ğ[ıi]$/i.test(birimAdi)) {
      birimYonelme = `${birimAdi}na`;
    } else if (/[aeoö]$/i.test(birimAdi)) {
      birimYonelme = `${birimAdi}ne`;
    } else {
      birimYonelme = `${birimAdi}'ne`;
    }
  }

  return `1- Hizmet ve Yapım işi alımlarında Taşınır Kayıt Yetkilisi görüşü yazılmayacaktır.
2- İstenilen malzeme depoda var ise bu talep formu satın alma birimine gönderilmeyecektir.
3- Hizmet, Yapım İşleri ve Mal alımlarında (Demirbaş v.b. gibi) Teknik Şartname hazırlanması zorunludur. (Tüm Teknik Şartnameler hazırlayanlar tarafından eksiksiz bir şekilde doldurulup Üst yazıyla ${birimYonelme} gönderilecektir. Teknik şartname olmayan talepler değerlendirmeye alınmayacaktır. Bu hususların eksiksiz yerine getirilmesi ve Makam Onayı alınmasından sonra satın alma işlemleri başlatılacaktır.)`;
}

const DEFAULT_EKLER = "EKİ: Talebe ait teknik şartnameler";

export function IhtiyacTalepFormu({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: IhtiyacTalepFormuProps) {
  const { isEditing, onFieldChange } = useTemplateEdit();
  const personelList: any[] = (data as any).personelListesi || [];

  const columns: any[] = [
    { key: "siraNo", label: "S. NO", width: "8%", align: "center" },
    {
      key: "malzemeAdi",
      label: "MALZEME/HİZMET ADI",
      width: "35%",
      align: "left",
    },
    { key: "ozelligi", label: "ÖZELLİĞİ", width: "25%", align: "left" },
    { key: "miktar", label: "MİKTAR", width: "10%", align: "right" },
    { key: "birimi", label: "BİRİM", width: "10%", align: "center" },
    { key: "kodu", label: "TAŞINIR KODU", width: "12%", align: "center" },
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

  const defaultToday = toTrDate(new Date().toISOString().split("T")[0]);
  const talepEdenAd = data.talepEdenPersonelAdi || data.hazirlayanPersonelAdi ||
    "";
  const talepEdenUnvan = data.talepEdenPersonelUnvan ||
    data.hazirlayanPersonelUnvan || "";
  const onaylayanAd = data.onaylayanPersonelAdi || "";
  const onaylayanUnvan = data.onaylayanPersonelUnvan || "";
  const tarihVal = data.tarih || data.onayaSunulanTarih || data.dosyaTarihi ||
    defaultToday;
  const dosyaTarihiVal = data.dosyaTarihi || data.onayTarihi || tarihVal ||
    defaultToday;

  const talepEdenMatched = personelList.find(
    (p: any) =>
      p.ad_soyad &&
      String(p.ad_soyad).trim().toLowerCase() === String(talepEdenAd || "").trim().toLowerCase()
  );
  const talepEdenSelectedId = talepEdenMatched ? String(talepEdenMatched.id) : "";

  const onaylayanMatched = personelList.find(
    (p: any) =>
      p.ad_soyad &&
      String(p.ad_soyad).trim().toLowerCase() === String(onaylayanAd || "").trim().toLowerCase()
  );
  const onaylayanSelectedId = onaylayanMatched ? String(onaylayanMatched.id) : "";

  const cellStyle: React.CSSProperties = {
    border: "1px solid #000",
    padding: "6px",
    fontSize: "9.5pt",
  };

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
                  tarih={tarihVal}
                  dosyaKonusu={data.dosyaKonusu || data.isinAdi || "Mal Alımı"}
                  showBorder={false}
                />

                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "13pt",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                    pageBreakInside: "avoid",
                  }}
                >
                  İHTİYAÇ TALEP FORMU
                </div>

                <div
                  style={{
                    marginBottom: "12px",
                    fontWeight: "bold",
                    fontSize: "10pt",
                    border: "1px solid #000",
                    padding: "6px 10px",
                  }}
                >
                  TALEP EDEN BİRİM:{" "}
                  <EditableField
                    name="ihtiyacYeri"
                    value={
                      (data as any).mudurluk ||
                      (data as any).birimAdi ||
                      (data as any).harcamaBirimi ||
                      (data as any).talepEdenBirim ||
                      data.ihtiyacYeri ||
                      (data as any).idareAdi ||
                      (data as any).kurum_adi ||
                      ""
                    }
                    placeholder="Birim Adı"
                  />
                </div>
              </>
            )}

            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Kalem bulunamadı"
              striped={false}
              startIndex={pageIdx === 0 ? 0 : limits.firstPage + (pageIdx - 1) * limits.middle}
              currentSplitIndex={fLimit ? Number(fLimit) : null}
            />


            {isLastPage && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    fontSize: "9.5pt",
                    textAlign: "justify",
                    lineHeight: 1.4,
                    marginBottom: "16px",
                    textIndent: "40px",
                  }}
                >
                  Yukarıda istemi yapılan taleplerimizin önceki sarf edilen
                  miktarlarla uyumlu ve ihtiyaçların fazla talep edilmediği,
                  fazla talep edilmesinden kaynaklanan yasal sorumlulukların
                  tarafımıza ait olduğunu hazırlamış olduğumuz talebe ait ekteki
                  teknik şartnamelerin yürürlükteki kanunlara, yönetmeliklere
                  uygun olduğunu ve rekabete engel teşkil etmediğini taahhüt
                  ederiz.
                </div>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #000",
                    marginTop: "12px",
                    fontSize: "9.5pt",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          ...cellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        BİRİMİN TALEP GEREKÇESİ
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          ...cellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                          width: "33%",
                        }}
                      >
                        TALEBİ YAPAN
                      </td>
                      <td
                        colSpan={2}
                        style={{
                          ...cellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                          width: "67%",
                        }}
                      >
                        ONAYLAYAN
                      </td>
                    </tr>
                    <tr style={{ height: "90px", verticalAlign: "top" }}>
                      <td style={{ ...cellStyle, textAlign: "center" }}>
                        <div>
                          <DateEditableField
                            name="tarih"
                            value={data.tarih || data.onayaSunulanTarih}
                            defaultDate={tarihVal}
                          />
                        </div>
                        {isEditing && personelList.length > 0 && (
                          <div
                            style={{ marginTop: "4px", marginBottom: "4px" }}
                          >
                            <select
                              value={talepEdenSelectedId}
                              onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                const p = personelList.find((item: any) =>
                                  item.id === selectedId
                                );
                                if (p && onFieldChange) {
                                  onFieldChange(
                                    "talepEdenPersonelAdi",
                                    p.ad_soyad,
                                  );
                                  onFieldChange(
                                    "talepEdenPersonelUnvan",
                                    p.unvan || "",
                                  );
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
                              }}
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
                        <div style={{ fontWeight: "bold", marginTop: "4px" }}>
                          <EditableField
                            name="talepEdenPersonelAdi"
                            value={talepEdenAd}
                            placeholder="Talep Eden Ad Soyad"
                          />
                        </div>
                        <div>
                          <EditableField
                            name="talepEdenPersonelUnvan"
                            value={talepEdenUnvan}
                            placeholder="Unvan"
                          />
                        </div>
                      </td>
                      <td
                        colSpan={2}
                        style={{ ...cellStyle, textAlign: "center" }}
                      >
                        <div>
                          <DateEditableField
                            name="dosyaTarihi"
                            value={data.dosyaTarihi || data.onayTarihi}
                            defaultDate={dosyaTarihiVal}
                          />
                        </div>
                        {isEditing && personelList.length > 0 && (
                          <div
                            style={{ marginTop: "4px", marginBottom: "4px" }}
                          >
                            <select
                              value={onaylayanSelectedId}
                              onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                const p = personelList.find((item: any) =>
                                  item.id === selectedId
                                );
                                if (p && onFieldChange) {
                                  onFieldChange(
                                    "onaylayanPersonelAdi",
                                    p.ad_soyad,
                                  );
                                  onFieldChange(
                                    "onaylayanPersonelUnvan",
                                    p.unvan || "",
                                  );
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
                              }}
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
                        <div style={{ fontWeight: "bold", marginTop: "4px" }}>
                          <EditableField
                            name="onaylayanPersonelAdi"
                            value={onaylayanAd}
                            placeholder="Onaylayan Ad Soyad"
                          />
                        </div>
                        <div>
                          <EditableField
                            name="onaylayanPersonelUnvan"
                            value={onaylayanUnvan}
                            placeholder="Unvan"
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        style={{ ...cellStyle, fontWeight: "bold" }}
                      >
                        GEREKÇE: (Gerekçe yazılmayan talepler kabul
                        edilmeyecektir.)
                      </td>
                    </tr>
                    <tr style={{ height: "50px", verticalAlign: "top" }}>
                      <td colSpan={3} style={{ ...cellStyle, padding: "8px" }}>
                        <EditableField
                          name="gerekce"
                          value={data.gerekce}
                          placeholder="Gerekçe yazınız..."
                          multiline
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          ...cellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        TAŞINIR KAYIT YETKİLİSİNİN GÖRÜŞÜ
                      </td>
                      <td
                        style={{
                          ...cellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        TAŞINIR KODU
                      </td>
                      <td
                        style={{
                          ...cellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        <DateEditableField
                          name="tasinirTarihi"
                          value={data.tasinirTarihi}
                          placeholder="……/……/202.."
                          defaultDate={dosyaTarihiVal}
                        />
                      </td>
                    </tr>
                    <tr style={{ height: "90px", verticalAlign: "top" }}>
                      <td style={cellStyle}></td>
                      <td style={cellStyle}></td>
                      <td
                        style={{
                          ...cellStyle,
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        Taşınır Kayıt Yetkilisinin<br />İmza ve Kaşesi
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{
                    marginTop: "16px",
                    fontSize: "9pt",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <EditableField
                    name="altNotlar"
                    value={getDynamicAltNotlar(data)}
                    multiline
                    placeholder="Alt Notlar"
                  />
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "9.5pt",
                    fontWeight: "bold",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <EditableField
                    name="ekler"
                    value={data.ekler || DEFAULT_EKLER}
                    placeholder="EKİ: Talebe ait teknik şartnameler"
                    multiline
                  />
                </div>
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
