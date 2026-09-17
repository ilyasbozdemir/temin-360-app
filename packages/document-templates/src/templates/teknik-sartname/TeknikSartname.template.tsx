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
import { TeknikSartnameType } from "./TeknikSartname.schema";

interface TeknikSartnameProps {
  data?: Partial<TeknikSartnameType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

export function TeknikSartname({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: TeknikSartnameProps) {
  const { onFieldChange } = useTemplateEdit();

  // Alım türünü normalize et
  const rawAlimTuru = String(data.alimTuru || "mal").toLowerCase();
  const isHizmet = rawAlimTuru.includes("hizmet") || rawAlimTuru.includes("danismanlik");
  const isYapim = rawAlimTuru.includes("yapim") || rawAlimTuru.includes("insaat");
  const isMal = !isHizmet && !isYapim;

  const alimTuruBaslik = isHizmet
    ? "HİZMET ALIMI TEKNİK ŞARTNAMESİ"
    : isYapim
    ? "YAPIM İŞİ TEKNİK ŞARTNAMESİ"
    : "MAL ALIMI TEKNİK ŞARTNAMESİ";

  const columns: any[] = [
    { key: "siraNo", label: "S.No", width: "8%", align: "center" },
    { key: "malzemeAdi", label: isHizmet ? "Hizmet Kalemi" : isYapim ? "İş / İmalat Kalemi" : "Mal / Malzeme Adı", width: "45%", align: "left" },
    { key: "miktar", label: "Miktar", width: "15%", align: "center" },
    { key: "birimi", label: "Birimi", width: "12%", align: "center" },
    {
      key: "ozellik",
      label: "Teknik Tanım / Standart",
      width: "20%",
      align: "left",
      render: (val: any, _row: any, idx: number) => {
        return (
          <EditableField
            name={`kalem_ozellik_${idx}`}
            value={val || "Standartlara Uygun"}
            placeholder="Teknik Tanım"
          />
        );
      },
    },
  ];

  const fLimit = firstPageLimit ?? (data as any).firstPageLimit ?? 8;
  const mLimit = middlePageLimit ?? (data as any).middlePageLimit ?? 14;
  const lLimit = lastPageLimit ?? (data as any).lastPageLimit ?? 6;

  const limits = {
    firstPage: orientation === "landscape" ? LANDSCAPE_LIMITS.firstPage : fLimit,
    middle: orientation === "landscape" ? LANDSCAPE_LIMITS.middle : mLimit,
    lastPage: orientation === "landscape" ? LANDSCAPE_LIMITS.lastPage : lLimit,
  };

  const rawItems = data.ihtiyacKalemleri || [];
  const normalizedItems = rawItems.map((item: any, idx: number) => ({
    siraNo: item.siraNo || item.sira || idx + 1,
    malzemeAdi: item.malzemeAdi || item.adi || item.kalem_adi || "",
    birimi: item.birimi || item.birim || "",
    miktar: item.miktar || item.talepMiktari || "",
    ozellik: item.ozelligi || item.ozellik || "TSE / CE Standartlarına Uygun",
  }));

  const pages = paginateData(normalizedItems, limits);
  const defaultToday = toTrDate(new Date().toISOString().split("T")[0]);

  const kurumAdi =
    data.kurumAdi ||
    (data.antetSatirlari && data.antetSatirlari.length > 0
      ? data.antetSatirlari[0]
      : "İLGİLİ KAMU İDARESİ");

  const isinAdi = data.isinAdi || data.dosyaKonusu || "İlgili Doğrudan Temin Alımı";

  // VARSAYILAN ŞARTNAME METİNLERİ (ALIM TÜRÜNE GÖRE DİNAMİK)
  const defaultMadde1 = isHizmet
    ? `Bu teknik şartname, ${kurumAdi} bünyesinde gerçekleştirilecek olan "${isinAdi}" işinin kapsamı, ifa koşulları ve kabul esaslarını belirler.`
    : isYapim
    ? `Bu teknik şartname, ${kurumAdi} tarafından yürütülecek "${isinAdi}" yapım, onarım ve tadilat işlerinin teknik uygulama ve imalat şartlarını belirler.`
    : `Bu teknik şartname, ${kurumAdi} ihtiyacı olan "${isinAdi}" alımı kapsamında temin edilecek malzemelerin teknik özellikleri, miktar, teslim ve muayene kabul şartlarını kapsar.`;

  const defaultMadde2 = isHizmet
    ? `1. Yüklenici, hizmetin eksiksiz ve mevzuata uygun yürütülmesi için gerekli yetkinlikte personel ve donanımı sağlamakla yükümlüdür.\n2. Hizmet esnasında kullanılacak araç, gereç ve sarf malzemeleri yürürlükteki iş sağlığı ve güvenliği standartlarına uygun olacaktır.\n3. Görevlendirilecek personel gerekli mesleki yeterlilik belgelerine sahip olacaktır.`
    : isYapim
    ? `1. Tüm imalatlar fen ve sanat kaidelerine, ilgili Türk Standartları Enstitüsü (TSE) normlarına ve yürürlükteki Yapım İşleri Genel Şartnamesine uygun yapılacaktır.\n2. Kullanılacak tüm malzemeler 1. sınıf kaliteye sahip olacak, imalat öncesinde İdarenin onayına sunulacaktır.\n3. Şantiye alanında iş sağlığı ve güvenliği tedbirlerinin eksiksiz alınmasından Yüklenici sorumludur.`
    : `1. Temin edilecek malzemeler orijinal ambalajında, yeni, kullanılmamış ve hasarsız olacaktır.\n2. Malzemeler yürürlükteki Türk Standartları (TSE) veya uluslararası geçerli (CE, ISO) kalite standartlarına uygun olmalıdır.\n3. Malzeme üzerinde marka, model, üretim tarihi ve son kullanma tarihi net olarak okunabilir şekilde yer alacaktır.`;

  const defaultMadde3 = isHizmet
    ? `1. Hizmet, İdarece onaylanan iş programına ve çalışma takvimine göre aksatılmadan yürütülecektir.\n2. Hizmet süresi sözleşme/sipariş tarihinden itibaren başlar ve idarenin belirlediği süre boyunca devam eder.\n3. Yüklenici hizmet aksamalarında derhal telafi edici tedbirleri almak zorundadır.`
    : isYapim
    ? `1. Yapım/onarım işleri yer tesliminden itibaren belirlenen süre içerisinde tamamlanarak İdareye teslim edilecektir.\n2. İş süresince çevreye, kuruma ve üçüncü şahıslara verilecek her türlü zarardan Yüklenici doğrudan sorumludur.\n3. İmalat artıkları ve molozlar Yüklenici tarafından derhal temizlenerek uzaklaştırılacaktır.`
    : `1. Malzemeler sipariş/sözleşme tarihinden itibaren İdarenin belirlediği teslim yerine (ambara) mesai saatleri içinde teslim edilecektir.\n2. Nakliye, taşıma, tahmil ve tahliye masrafları tamamen Yükleniciye aittir.\n3. Teslimat sırasında hasarlı veya standart dışı çıkan ürünler derhal yenisiyle değiştirilecektir.`;

  const defaultMadde4 = isHizmet
    ? `1. Hizmetin ifası, İdarece oluşturulan Muayene ve Kabul Komisyonu veya görevli kontrol teşkilatı tarafından denetlenir.\n2. İdareye sunulan hizmet çıktılarının uygunluğu tutanak altına alınır.\n3. Uygun görülmeyen kısımlar Yüklenici tarafından bedelsiz olarak düzeltilir.`
    : isYapim
    ? `1. Yapım işinin tamamlanmasını müteakip Muayene ve Kabul Komisyonunca Geçici Kabul / Kesin Kabul incelemesi yapılır.\n2. İmalat hataları ve noksanlıklar Yükleniciye bildirilerek verilen sürede giderilmesi sağlanır.\n3. Yapılan işler için Yapım İşleri Genel Şartnamesinde öngörülen asgari garanti süresi geçerlidir.`
    : `1. Teslim edilen malların muayenesi İdarenin Muayene ve Kabul Komisyonu tarafından fiziksel ve teknik olarak yapılacaktır.\n2. Mallar en az 2 (iki) yıl süreyle fabrika ve üretim hatalarına karşı garantili olacaktır.\n3. Arızalanan veya ayıplı çıkan mallar garanti kapsamında 15 gün içinde yenisiyle değiştirilecek veya onarılacaktır.`;

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
                {/* ANTET */}
                <div
                  style={{
                    textAlign: "center",
                    lineHeight: "1.4",
                    marginBottom: "16px",
                    pageBreakInside: "avoid",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "11pt" }}>T.C.</div>
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
                      marginTop: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      textDecoration: "underline",
                      color: "#1e293b",
                    }}
                  >
                    {alimTuruBaslik}
                  </div>
                </div>

                {/* TARİH VE BELGE METASI */}
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
                    <strong>İşin Adı :</strong>
                    <EditableField
                      name="isinAdi"
                      value={isinAdi}
                      placeholder="İşin Adı / Konusu"
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

                {/* MADDE 1: KONU VE AMAÇ */}
                <div style={{ marginBottom: "14px", fontSize: "10pt", lineHeight: "1.6", pageBreakInside: "avoid" }}>
                  <div style={{ fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>
                    MADDE 1 - İŞİN / ALIMIN KONUSU VE AMACI
                  </div>
                  <EditableField
                    name="madde1"
                    value={data.malTeknikOzellikler || data.hizmetKapsami || data.yapimIsTanimi || defaultMadde1}
                    placeholder="Konu ve amaç metni..."
                    multiline
                  />
                </div>

                {/* MADDE 2: TEKNİK ÖZELLİKLER VE LİSTE */}
                <div style={{ marginBottom: "8px", fontSize: "10pt", lineHeight: "1.6", pageBreakInside: "avoid" }}>
                  <div style={{ fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>
                    MADDE 2 - {isHizmet ? "HİZMETİN NİTELİĞİ VE İŞ KALEMLERİ" : isYapim ? "İMALAT VE İŞ KALEMLERİ" : "MALZEMELERİN TEKNİK ÖZELLİKLERİ VE MİKTARLARI"}
                  </div>
                </div>
              </>
            )}

            {/* KALEMLER TABLOSU */}
            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Şartnameye ait kalem bilgisi bulunamadı."
            />

            {isLastPage && (
              <div style={{ marginTop: "14px", fontSize: "10pt", lineHeight: "1.6", pageBreakInside: "avoid" }}>
                {/* TEKNİK KRİTERLER DETAYI */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>
                    MADDE 3 - {isHizmet ? "PERSONEL, EKİPMAN VE İFA ŞARTLARI" : isYapim ? "MALZEME, UYGULAMA VE İŞ GÜVENLİĞİ" : "GENEL TEKNİK KRİTERLER VE STANDARTLAR"}
                  </div>
                  <EditableField
                    name="madde2_detay"
                    value={data.malMiktarBirim || data.hizmetPersonelEkipman || data.yapimMalzemeImalat || defaultMadde2}
                    placeholder="Teknik kriterler..."
                    multiline
                  />
                </div>

                {/* MADDE 4: TESLİMAT / İFA SÜRECİ */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>
                    MADDE 4 - {isHizmet ? "HİZMET SÜRESİ VE ÇALIŞMA ESASLARI" : isYapim ? "İŞİN SÜRESİ VE YER TESLİMİ" : "AMBALAJ VE TESLİMAT ŞARTLARI"}
                  </div>
                  <EditableField
                    name="madde3"
                    value={data.malTeslimatSartlari || data.hizmetSureVeIfa || data.yapimUygulamaVeIsGuvenligi || defaultMadde3}
                    placeholder="Teslimat / ifa şartları..."
                    multiline
                  />
                </div>

                {/* MADDE 5: GARANTİ / MUAYENE KABUL */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>
                    MADDE 5 - {isHizmet ? "DENETİM, KONTROL VE MUAYENE KABUL" : isYapim ? "GEÇİCİ / KESİN KABUL VE GARANTİ" : "GARANTİ, BAKIM VE MUAYENE KABUL ŞARTLARI"}
                  </div>
                  <EditableField
                    name="madde4"
                    value={data.malGarantiVeMuayene || data.hizmetDenetimKabul || data.yapimKabulVeTeslim || defaultMadde4}
                    placeholder="Garanti ve kabul şartları..."
                    multiline
                  />
                </div>

                {/* İMZA BLOĞU (ŞARTNAMEYİ HAZIRLAYANLAR VE ONAYLAYAN) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginTop: "35px",
                    textAlign: "center",
                    pageBreakInside: "avoid",
                  }}
                >
                  <div style={{ minWidth: "220px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "10.5pt" }}>
                      Teknik Şartnameyi Hazırlayan
                    </div>
                    <div style={{ fontSize: "10pt", marginTop: "4px" }}>
                      <EditableField
                        name="hazirlayanPersonelAdi"
                        value={data.hazirlayanPersonelAdi || "Teknik Personel / Uzman"}
                        placeholder="Adı Soyadı"
                      />
                    </div>
                    <div style={{ fontSize: "9pt", color: "#475569" }}>
                      <EditableField
                        name="hazirlayanPersonelUnvan"
                        value={data.hazirlayanPersonelUnvan || "Mühendis / Tekniker"}
                        placeholder="Unvanı"
                      />
                    </div>
                    <div style={{ marginTop: "25px", fontStyle: "italic", fontSize: "9pt", color: "#94a3b8" }}>
                      (İmza)
                    </div>
                  </div>

                  <div style={{ minWidth: "220px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "10.5pt" }}>
                      UYGUNDUR / ONAY
                    </div>
                    <div style={{ fontSize: "10pt", marginTop: "4px" }}>
                      <EditableField
                        name="onaylayanPersonelAdi"
                        value={data.onaylayanPersonelAdi || "Birim / Şube Müdürü"}
                        placeholder="Adı Soyadı"
                      />
                    </div>
                    <div style={{ fontSize: "9pt", color: "#475569" }}>
                      <EditableField
                        name="onaylayanPersonelUnvan"
                        value={data.onaylayanPersonelUnvan || "Harcama Yetkilisi / Müdür"}
                        placeholder="Unvanı"
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
