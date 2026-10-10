import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { SozlesmeyeDavetType } from "./SozlesmeyeDavet.schema";

interface SozlesmeyeDavetProps {
  data?: Partial<SozlesmeyeDavetType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function SozlesmeyeDavet({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: SozlesmeyeDavetProps) {
  const yuklenici = data.yukleniciFirma || data.firmaUnvan || "YÜKLENİCİ FİRMA";
  const items = data.ihtiyacKalemleri || [];
  const genelToplamNum = typeof data.genelToplam === "number" ? data.genelToplam : parseFloat(String(data.genelToplam || "0").replace(/[^0-9,.-]/g, "").replace(",", ".")) || 0;
  const pulBedeli = data.pulBedeli || (genelToplamNum > 0 ? (genelToplamNum * 0.00948).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-");

  return (
    <DocumentLayout
      data={data as any}
      hideFooter={false}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={1}
    >
      <div
        style={{
          width: "100%",
          fontSize: "11pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.5,
        }}
      >
        {/* INFO: SAYI & TARIH */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", fontSize: "10.5pt" }}>
          <tbody>
            <tr>
              <td style={{ padding: "3px 0" }}>
                <strong>Sayı:</strong> <EditableField name="evrakSayisi" value={data.evrakSayisi} placeholder="Evrak Sayısı" />
              </td>
              <td style={{ textAlign: "right", padding: "3px 0" }}>
                <strong>Tarih:</strong> <EditableField name="dosyaTarihi" value={data.dosyaTarihi || data.tarih} placeholder="GG.AA.YYYY" />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: "3px 0" }}>
                <strong>Konu:</strong> Sözleşmeye Davet
              </td>
            </tr>
          </tbody>
        </table>

        {/* RECIPIENT */}
        <div style={{ textAlign: "center", margin: "16px 0 20px 0", fontSize: "11.5pt", lineHeight: 1.5 }}>
          Sayın, <span style={{ fontWeight: "bold" }}><EditableField name="yukleniciFirma" value={yuklenici} placeholder="Yüklenici Firma" /></span><br />
          {data.yukleniciAdresi && <span>{data.yukleniciAdresi}<br /></span>}
          {data.yukleniciIlce && <span>{data.yukleniciIlce}</span>}
          {data.yukleniciIl && <span>/{data.yukleniciIl}</span>}
        </div>

        {/* INTEREST */}
        <div style={{ marginBottom: "14px", fontSize: "10.5pt" }}>
          <strong>İlgi:</strong> Bila tarihli teklifiniz.
        </div>

        {/* BODY */}
        <div style={{ textAlign: "justify", marginBottom: "20px", lineHeight: 1.5, fontSize: "10.5pt" }}>
          <div style={{ textIndent: "1.2cm", marginBottom: "8px" }}>
            İdaremiz bünyesinde gerçekleştirilen &ldquo;<strong><EditableField name="dosyaKonusu" value={data.dosyaKonusu ?? data.isinAdi} placeholder="İşin Konusu" /></strong>&rdquo; işi uhdenizde kalmıştır.
          </div>
          <div style={{ textIndent: "1.2cm", marginBottom: "8px" }}>
            Yasal yükümlülükleri yerine getirmek suretiyle işe ilişkin sözleşmeyi tebliğden itibaren <strong>10 (on) takvim günü</strong> içerisinde imzalamanız gerekmektedir.
          </div>
          <div style={{ textIndent: "1.2cm" }}>
            Bilgilerinizi ve gereğini rica ederim.
          </div>
        </div>

        {/* SIGNATURE */}
        <div style={{ width: "100%", marginBottom: "24px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "240px", textAlign: "center", lineHeight: 1.4 }}>
            <div style={{ fontWeight: "bold", fontSize: "10.5pt" }}>
              <EditableField name="baskanAdi" value={data.baskanAdi ?? data.onaylayanPersonelAdi} placeholder="Ad Soyad" />
            </div>
            <div style={{ fontSize: "9.5pt", color: "#333" }}>
              <EditableField name="baskanUnvan" value={data.baskanUnvan ?? (data.onaylayanPersonelUnvan || "Harcama Yetkilisi")} placeholder="Ünvan" />
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            fontSize: "9pt",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f7f7f7" }}>
              <th style={{ border: "1px solid #000", padding: "5px 6px", width: "8%", textAlign: "center" }}>Sıra No</th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "left" }}>Malın / İşin Adı</th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", width: "14%", textAlign: "right" }}>Miktar</th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", width: "12%", textAlign: "center" }}>Birim</th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", width: "18%", textAlign: "right" }}>Birim Fiyat (TL)</th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", width: "18%", textAlign: "right" }}>Tutar (TL)</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px" }}>{item.malzemeAdi || item.aciklama || "-"}</td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>{item.miktar || 1}</td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "center" }}>{item.birimi || "Adet"}</td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>{item.enDusukFiyat || item.birimFiyat || "-"}</td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right", fontWeight: "bold" }}>{item.toplamBedel || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ border: "1px solid #000", padding: "6px", textAlign: "center", color: "#666" }}>
                  Kalem listesi bulunamadı.
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={5} style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "right", fontWeight: "bold" }}>
                Genel Toplam (KDV Hariç)
              </td>
              <td style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "right", fontWeight: "bold" }}>
                <EditableField name="genelToplam" value={data.genelToplam ? `${data.genelToplam} ₺` : "-"} placeholder="0,00 ₺" />
              </td>
            </tr>
          </tbody>
        </table>

        {/* CONTRACT SUMMARY */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
          <tbody>
            <tr>
              <td style={{ width: "260px", padding: "3px 0" }}><strong>Sözleşme Bedeli:</strong></td>
              <td style={{ padding: "3px 0", fontWeight: "bold" }}>{data.genelToplam || data.sozlesmeBedeli || "-"} TL</td>
            </tr>
            <tr>
              <td style={{ padding: "3px 0" }}><strong>Sözleşme Pul Bedeli (%0,948):</strong></td>
              <td style={{ padding: "3px 0", fontWeight: "bold" }}>{pulBedeli} TL</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
