import { useMemo } from "react";
import { YaklasikMaliyetCetveliData } from "./YaklasikMaliyetCetveli.schema";

export interface ProcessedKalem {
  siraNo: number;
  malzemeAdi: string;
  ozelligi: string;
  birimi: string;
  miktar: number | string;
  firmOffers: string[];
  enDusukFiyat: string;
  toplamBedel: string;
  [key: string]: any;
}

export interface DisplayFirm {
  id?: any;
  temin_firma_id?: any;
  unvan: string;
  [key: string]: any;
}

export interface DisplayCommissionMember {
  adSoyad: string;
  unvan: string;
  gorevi?: string;
  pozisyonu?: string;
}

export interface UseYaklasikMaliyetCetveliResult {
  solLogo: string | null;
  sagLogo: string | null;
  kurumAdi: string;
  mudurluk: string;
  isAdi: string;
  tarih: string;
  antetLines: string[];
  displayFirmalar: DisplayFirm[];
  processedKalemler: ProcessedKalem[];
  displayFirmaToplamlari: { toplam: string }[];
  formattedGenelToplam: string;
  displayKomisyon: DisplayCommissionMember[];
  hesaplamaEsasiText: string;
  olurBaslik: string;
  olurTarihi: string;
  baskanAdi: string;
  baskanUnvan: string;
  showOlurBlock: boolean;
  firmalarColspan: number;
  getFirmTitle: (f: any, idx: number) => string;
}

const formatMoney = (val: any): string => {
  if (val === undefined || val === null || val === "") return "0,00";
  if (typeof val === "number") {
    return isNaN(val)
      ? "0,00"
      : val.toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }
  const str = String(val).trim();
  if (!str || str === "-") return str;

  // If already formatted like 1.234,56
  if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(str)) {
    return str;
  }
  // If formatted like 1234,56 without thousand separator dots
  if (/^\d+,\d{2}$/.test(str)) {
    const [intPart, decPart] = str.split(",");
    return Number(intPart).toLocaleString("tr-TR") + "," + decPart;
  }

  // Raw numeric strings like "1234.56" or "1234"
  const cleanStr = str.replace(/[^0-9.,-]/g, "");
  if (!cleanStr) return str;

  let num: number;
  if (cleanStr.includes(",") && !cleanStr.includes(".")) {
    num = parseFloat(cleanStr.replace(",", "."));
  } else if (cleanStr.includes(".") && cleanStr.includes(",")) {
    num = parseFloat(cleanStr.replace(/\./g, "").replace(",", "."));
  } else {
    num = parseFloat(cleanStr);
  }

  if (!isNaN(num)) {
    return num.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return str;
};

const getFirmTitle = (f: any, idx: number): string => {
  if (!f) return `Firma ${idx + 1}`;
  if (typeof f === "string") return f;
  return (
    f.unvan ||
    f.firmaUnvan ||
    f.firma_unvan ||
    f.firmaAdi ||
    f.firma_adi ||
    f.name ||
    f.ad ||
    `Firma ${idx + 1}`
  );
};

export function useYaklasikMaliyetCetveli(
  data?: Partial<YaklasikMaliyetCetveliData> & Record<string, any>
): UseYaklasikMaliyetCetveliResult {
  return useMemo(() => {
    const raw = data || {};

    // 1. Logos
    const solLogo =
      raw.solLogo ||
      raw.institutionLogo ||
      raw.logoLeft ||
      raw.logo_sol ||
      raw.logo_url ||
      null;
    const sagLogo =
      raw.sagLogo || raw.logoRight || raw.logo_sag || null;

    // 2. Metadata / Headers
    const kurumAdi =
      raw.kurumAdi ||
      raw.ustKurumAdi ||
      raw.kurum_adi ||
      raw.idareAdi ||
      "";
    const mudurluk =
      raw.mudurluk ||
      raw.harcamaBirimi ||
      raw.harcama_birimi ||
      raw.birimAdi ||
      raw.birim_adi ||
      raw.harcamaBirimiAdi ||
      "";
    const isAdi =
      raw.isAdi ||
      raw.isinAdi ||
      raw.konu ||
      raw.isin_tanimi ||
      raw.isinTanimi ||
      raw.dosyaKonusu ||
      "";
    const tarih =
      raw.tarih ||
      raw.dosyaTarihi ||
      raw.acilisTarihi ||
      raw.dosyaAcilisTarihi ||
      raw.onayTarihi ||
      raw.onayaSunulanTarih ||
      "";

    // 3. Antet satırları
    const antetLines: string[] = (raw.antetSatirlari &&
      Array.isArray(raw.antetSatirlari) &&
      raw.antetSatirlari.length > 0)
      ? raw.antetSatirlari.filter((l: any) =>
          typeof l === "string" ? l.trim() !== "" : Boolean(l)
        )
      : (raw.institutionLetterhead &&
          Array.isArray(raw.institutionLetterhead) &&
          raw.institutionLetterhead.length > 0)
      ? raw.institutionLetterhead.filter((l: any) =>
          typeof l === "string" ? l.trim() !== "" : Boolean(l)
        )
      : [];

    // 4. Raw Kalemler
    const rawKalemler = (raw.ihtiyacKalemleri &&
      Array.isArray(raw.ihtiyacKalemleri) &&
      raw.ihtiyacKalemleri.length > 0)
      ? raw.ihtiyacKalemleri
      : (raw.kalemler &&
          Array.isArray(raw.kalemler) &&
          raw.kalemler.length > 0)
      ? raw.kalemler
      : (raw.items &&
          Array.isArray(raw.items) &&
          raw.items.length > 0)
      ? raw.items
      : (raw.malzemeler &&
          Array.isArray(raw.malzemeler) &&
          raw.malzemeler.length > 0)
      ? raw.malzemeler
      : (raw.fiyatKalemleri &&
          Array.isArray(raw.fiyatKalemleri) &&
          raw.fiyatKalemleri.length > 0)
      ? raw.fiyatKalemleri
      : [];

    // 5. Display Firmalar
    let displayFirmalar: DisplayFirm[] = (raw.firmalar &&
      Array.isArray(raw.firmalar) &&
      raw.firmalar.length > 0)
      ? raw.firmalar
      : (raw.firmaListesi &&
          Array.isArray(raw.firmaListesi) &&
          raw.firmaListesi.length > 0)
      ? raw.firmaListesi
      : (raw.invitedFirms &&
          Array.isArray(raw.invitedFirms) &&
          raw.invitedFirms.length > 0)
      ? raw.invitedFirms
      : (raw.fileFirms &&
          Array.isArray(raw.fileFirms) &&
          raw.fileFirms.length > 0)
      ? raw.fileFirms
      : (raw.istekliler &&
          Array.isArray(raw.istekliler) &&
          raw.istekliler.length > 0)
      ? raw.istekliler
      : (raw.calculatedTeklifler &&
          Array.isArray(raw.calculatedTeklifler) &&
          raw.calculatedTeklifler.length > 0)
      ? raw.calculatedTeklifler.map((t: any) => ({
          unvan: t.istekliUnvani || t.unvan,
        }))
      : [];

    // Fallback firm list from first item proposals if empty
    if (displayFirmalar.length === 0 && rawKalemler.length > 0) {
      const firstKalem = rawKalemler[0];
      const firstOffers =
        firstKalem.firmaTeklifleriDetay ||
        firstKalem.firmaTeklifleri ||
        firstKalem.teklifler ||
        firstKalem.bids ||
        [];
      if (Array.isArray(firstOffers) && firstOffers.length > 0) {
        displayFirmalar = firstOffers.map((tf: any, i: number) => ({
          id: tf.firmaId || tf.id,
          unvan:
            tf.firmaUnvan ||
            tf.unvan ||
            tf.firma_unvan ||
            tf.firmaAdi ||
            `Firma ${i + 1}`,
        }));
      }
    }

    // 6. Commission List
    const displayKomisyon: DisplayCommissionMember[] = (raw.komisyon &&
      Array.isArray(raw.komisyon) &&
      raw.komisyon.length > 0)
      ? raw.komisyon
      : (raw.fiyatKomisyonu &&
          Array.isArray(raw.fiyatKomisyonu) &&
          raw.fiyatKomisyonu.length > 0)
      ? raw.fiyatKomisyonu
      : (raw.gorevlendirilenler &&
          Array.isArray(raw.gorevlendirilenler) &&
          raw.gorevlendirilenler.length > 0)
      ? raw.gorevlendirilenler
      : (raw.komisyonUyeleri &&
          Array.isArray(raw.komisyonUyeleri) &&
          raw.komisyonUyeleri.length > 0)
      ? raw.komisyonUyeleri
      : (raw.piyasaFiyatArastirmaKomisyonu &&
          Array.isArray(raw.piyasaFiyatArastirmaKomisyonu) &&
          raw.piyasaFiyatArastirmaKomisyonu.length > 0)
      ? raw.piyasaFiyatArastirmaKomisyonu
      : (raw.personelListesi &&
          Array.isArray(raw.personelListesi) &&
          raw.personelListesi.length > 0)
      ? raw.personelListesi.slice(0, 2)
      : [];

    // 7. Process items and offers
    const processedKalemler: ProcessedKalem[] = rawKalemler.map(
      (kalem: any, idx: number) => {
        const rowNum = kalem.siraNo ?? idx + 1;
        const malzemeAdi =
          kalem.malzemeAdi ||
          kalem.kalem_adi ||
          kalem.kalemAdi ||
          kalem.malzeme_adi ||
          kalem.ad ||
          kalem.urun_adi ||
          "";
        const ozelligi =
          kalem.ozelligi ||
          kalem.aciklama ||
          kalem.kalem_aciklama ||
          kalem.ozellik ||
          "";
        const birimi =
          kalem.birimi || kalem.birim || kalem.birim_adi || "";
        const miktar = kalem.miktar ?? kalem.adet ?? "";
        const miktarNum =
          typeof miktar === "number"
            ? miktar
            : parseFloat(
                String(miktar || 1)
                  .replace(/\./g, "")
                  .replace(",", ".")
              ) || 1;

        let minPrice = Infinity;
        const firmOffers = displayFirmalar.map((firm: any, fIdx: number) => {
          const firmId = firm?.id ?? firm?.temin_firma_id ?? firm?.firma_id;
          const firmTitle = getFirmTitle(firm, fIdx);

          let priceVal: any = undefined;

          const offersList =
            kalem.firmaTeklifleriDetay ||
            kalem.firmaTeklifleri ||
            kalem.teklifler ||
            kalem.bids ||
            [];

          if (Array.isArray(offersList) && offersList.length > 0) {
            // Match by firmId
            if (firmId !== undefined && firmId !== null) {
              const match = offersList.find(
                (t: any) =>
                  t.firmaId === firmId ||
                  t.temin_firma_id === firmId ||
                  t.firma_id === firmId ||
                  t.id === firmId
              );
              if (match) {
                priceVal =
                  match.birimFiyat !== undefined &&
                  match.birimFiyat !== "-" &&
                  match.birimFiyat !== ""
                    ? match.birimFiyat
                    : match.fiyat !== undefined &&
                      match.fiyat !== "-" &&
                      match.fiyat !== ""
                    ? match.fiyat
                    : match.birim_fiyat;
              }
            }

            // Match by title
            if (priceVal === undefined && firmTitle) {
              const match = offersList.find((t: any) => {
                const tTitle =
                  t.firmaUnvan ||
                  t.unvan ||
                  t.firma_unvan ||
                  t.firmaAdi ||
                  t.firma_adi;
                return (
                  tTitle &&
                  String(tTitle).trim().toLowerCase() ===
                    String(firmTitle).trim().toLowerCase()
                );
              });
              if (match) {
                priceVal =
                  match.birimFiyat !== undefined &&
                  match.birimFiyat !== "-" &&
                  match.birimFiyat !== ""
                    ? match.birimFiyat
                    : match.fiyat !== undefined &&
                      match.fiyat !== "-" &&
                      match.fiyat !== ""
                    ? match.fiyat
                    : match.birim_fiyat;
              }
            }

            // Match by position index
            if (priceVal === undefined && offersList[fIdx]) {
              const tf = offersList[fIdx];
              priceVal =
                tf.birimFiyat !== undefined &&
                tf.birimFiyat !== "-" &&
                tf.birimFiyat !== ""
                  ? tf.birimFiyat
                  : tf.fiyat !== undefined &&
                    tf.fiyat !== "-" &&
                    tf.fiyat !== ""
                  ? tf.fiyat
                  : tf.birim_fiyat;
            }
          }

          if (
            priceVal !== undefined &&
            priceVal !== null &&
            priceVal !== "-" &&
            priceVal !== ""
          ) {
            const numPrice =
              typeof priceVal === "number"
                ? priceVal
                : parseFloat(
                    String(priceVal)
                      .replace(/[^0-9.,-]/g, "")
                      .replace(/\./g, "")
                      .replace(",", ".")
                  );
            if (!isNaN(numPrice) && numPrice > 0) {
              if (numPrice < minPrice) minPrice = numPrice;
              return formatMoney(numPrice);
            }
          }
          return "-";
        });

        let enDusukFiyatStr = kalem.enDusukFiyat;
        let toplamBedelStr = kalem.toplamBedel;

        if (
          !enDusukFiyatStr ||
          enDusukFiyatStr === "-" ||
          enDusukFiyatStr === "0" ||
          enDusukFiyatStr === "0,00"
        ) {
          if (minPrice !== Infinity && minPrice > 0) {
            enDusukFiyatStr = formatMoney(minPrice);
            toplamBedelStr = formatMoney(minPrice * miktarNum);
          } else {
            enDusukFiyatStr = "-";
            toplamBedelStr = "-";
          }
        } else {
          enDusukFiyatStr = formatMoney(enDusukFiyatStr);
          if (!toplamBedelStr || toplamBedelStr === "-") {
            const pNum = parseFloat(
              String(enDusukFiyatStr).replace(/\./g, "").replace(",", ".")
            );
            toplamBedelStr = !isNaN(pNum)
              ? formatMoney(pNum * miktarNum)
              : "-";
          } else {
            toplamBedelStr = formatMoney(toplamBedelStr);
          }
        }

        return {
          ...kalem,
          siraNo: rowNum,
          malzemeAdi,
          ozelligi,
          birimi,
          miktar,
          firmOffers,
          enDusukFiyat: enDusukFiyatStr,
          toplamBedel: toplamBedelStr,
        };
      }
    );

    // 8. Firm Totals
    const displayFirmaToplamlari = displayFirmalar.map(
      (_f: any, fIdx: number) => {
        const existing =
          (raw.firmaToplamlari && raw.firmaToplamlari[fIdx]) ||
          (raw.firmaToplamlariDetay && raw.firmaToplamlariDetay[fIdx]);
        if (
          existing?.toplam &&
          existing.toplam !== "-" &&
          existing.toplam !== "0,00" &&
          existing.toplam !== 0
        ) {
          return { toplam: formatMoney(existing.toplam) };
        }
        let sum = 0;
        let hasVal = false;
        processedKalemler.forEach((k) => {
          const offer = k.firmOffers[fIdx];
          if (offer && offer !== "-") {
            const num = parseFloat(
              String(offer).replace(/\./g, "").replace(",", ".")
            );
            const miktarNum =
              typeof k.miktar === "number"
                ? k.miktar
                : parseFloat(
                    String(k.miktar || 1)
                      .replace(/\./g, "")
                      .replace(",", ".")
                  ) || 1;
            if (!isNaN(num)) {
              sum += num * miktarNum;
              hasVal = true;
            }
          }
        });
        return {
          toplam: hasVal
            ? formatMoney(sum)
            : existing?.toplam
            ? formatMoney(existing.toplam)
            : "0,00",
        };
      }
    );

    // 9. General Total
    let formattedGenelToplam = raw.genelToplam
      ? formatMoney(raw.genelToplam)
      : raw.yaklasikMaliyet
      ? formatMoney(raw.yaklasikMaliyet)
      : "";

    if (!formattedGenelToplam || formattedGenelToplam === "0,00") {
      let sum = 0;
      processedKalemler.forEach((k) => {
        if (k.toplamBedel && k.toplamBedel !== "-") {
          const num = parseFloat(
            String(k.toplamBedel).replace(/\./g, "").replace(",", ".")
          );
          if (!isNaN(num)) sum += num;
        }
      });
      if (sum > 0) {
        formattedGenelToplam = formatMoney(sum);
      } else {
        formattedGenelToplam = "0,00";
      }
    }

    // 10. Summary Text & Olur / Approval
    const hesaplamaEsasiText =
      raw.hesaplamaEsasiText ||
      (String(
        raw.hesaplamaEsasi ||
          raw.hesaplama_esasi ||
          raw.yaklasikMaliyetEsasi ||
          raw.yaklasik_maliyet_hesaplamasi ||
          ""
      )
        .toLowerCase()
        .includes("ortalama")
        ? "birim fiyatların ortalaması"
        : "en düşük fiyatlar");

    const olurBaslik = raw.olurBaslik || "O L U R";
    const olurTarihi =
      raw.olurTarihi ||
      raw.onayTarihi ||
      raw.tarih ||
      raw.dosyaTarihi ||
      "";
    const baskanAdi =
      raw.baskanAdi ||
      raw.onaylayanPersonelAdi ||
      raw.onaylayan_ad_soyad ||
      raw.harcamaYetkilisiAdi ||
      raw.onaylayan ||
      "";
    const baskanUnvan =
      raw.baskanUnvan ||
      raw.onaylayanPersonelUnvan ||
      raw.onaylayan_unvan ||
      raw.harcamaYetkilisiUnvan ||
      "Harcama Yetkilisi";

    const showOlurBlock = raw.showOlurBlock ?? raw.olurGoster ?? true;
    const firmalarColspan = Math.max(displayFirmalar.length, 1);

    return {
      solLogo,
      sagLogo,
      kurumAdi,
      mudurluk,
      isAdi,
      tarih,
      antetLines,
      displayFirmalar,
      processedKalemler,
      displayFirmaToplamlari,
      formattedGenelToplam,
      displayKomisyon,
      hesaplamaEsasiText,
      olurBaslik,
      olurTarihi,
      baskanAdi,
      baskanUnvan,
      showOlurBlock,
      firmalarColspan,
      getFirmTitle,
    };
  }, [data]);
}
