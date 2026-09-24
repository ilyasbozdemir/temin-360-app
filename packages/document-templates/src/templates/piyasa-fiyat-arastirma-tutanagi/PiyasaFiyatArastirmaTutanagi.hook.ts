import { useMemo } from "react";
import { PiyasaFiyatArastirmaTutanagiData } from "./PiyasaFiyatArastirmaTutanagi.schema";

export interface ProcessedPiyasaKalem {
  siraNo: number;
  malzemeAdi: string;
  ozelligi: string;
  birimi: string;
  miktar: number | string;
  enUygunFirmaAdi: string;
  enDusukFiyat: string;
  toplamBedel: string;
  [key: string]: any;
}

export interface UsePiyasaFiyatArastirmaTutanagiResult {
  idareAdi: string;
  kurumAdi: string;
  dosyaTarihi: string;
  evrakSayisi: string;
  tarih: string;
  isAdi: string;
  isBasligi: string;
  aciklama?: string;
  displayFirmalar: any[];
  processedKalemler: ProcessedPiyasaKalem[];
  displayFirmaToplamlari: { toplam: string }[];
  formattedGenelToplam: string;
  displayKomisyon: any[];
  baskanAdi: string;
  baskanUnvan: string;
  hesaplamaEsasiText: string;
  olurYazisi: boolean;
  formatMoney: (val: any) => string;
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

export function usePiyasaFiyatArastirmaTutanagi(
  data?: Partial<PiyasaFiyatArastirmaTutanagiData> & Record<string, any>
): UsePiyasaFiyatArastirmaTutanagiResult {
  return useMemo(() => {
    const raw = data || {};

    const idareAdi =
      raw.idareAdi || raw.kurumAdi || raw.ustKurumAdi || raw.kurum_adi || "";
    const kurumAdi = raw.kurumAdi || raw.idareAdi || "";
    const dosyaTarihi =
      raw.dosyaTarihi ||
      raw.onayTarihi ||
      raw.acilisTarihi ||
      raw.tarih ||
      "";
    const evrakSayisi = raw.evrakSayisi || raw.sayi || raw.evrakNo || "";
    const tarih =
      raw.tarih ||
      raw.duzenlemeTarihi ||
      raw.dosyaTarihi ||
      raw.acilisTarihi ||
      "";
    const isAdi =
      raw.isAdi ||
      raw.isinAdi ||
      raw.dosyaKonusu ||
      raw.konu ||
      raw.isin_tanimi ||
      "";
    const aciklama = raw.aciklama || "";
    const baskanAdi =
      raw.baskanAdi ||
      raw.onaylayanPersonelAdi ||
      raw.harcamaYetkilisiAdi ||
      raw.onaylayan_ad_soyad ||
      "";
    const baskanUnvan =
      raw.baskanUnvan ||
      raw.onaylayanPersonelUnvan ||
      raw.harcamaYetkilisiUnvan ||
      raw.onaylayan_unvan ||
      "Harcama Yetkilisi";

    const turLower = String(
      raw.alimTuru || raw.tur || raw.ihale_tipi || ""
    ).toLowerCase();
    const isBasligi =
      raw.isHizmet || turLower.includes("hizmet")
        ? "Alınan Hizmetin Adı, Niteliği:"
        : raw.isYapim ||
          turLower.includes("yapı") ||
          turLower.includes("yapim")
        ? "Yapılan İşin Adı, Niteliği:"
        : raw.isMal || turLower.includes("mal")
        ? "Alınan Malın Adı, Niteliği:"
        : "Yapılan İş / Mal / Hizmetin Adı, Niteliği:";

    // Komisyon çözümleme
    const displayKomisyon = (raw.komisyon &&
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
      : (raw.gorevliler &&
          Array.isArray(raw.gorevliler) &&
          raw.gorevliler.length > 0)
      ? raw.gorevliler
      : (raw.personelListesi &&
          Array.isArray(raw.personelListesi) &&
          raw.personelListesi.length > 0)
      ? raw.personelListesi.slice(0, 2)
      : [];

    const rawKalemler = (raw.ihtiyacKalemleri &&
      Array.isArray(raw.ihtiyacKalemleri) &&
      raw.ihtiyacKalemleri.length > 0)
      ? raw.ihtiyacKalemleri
      : (raw.kalemler &&
          Array.isArray(raw.kalemler) &&
          raw.kalemler.length > 0)
      ? raw.kalemler
      : (raw.items && Array.isArray(raw.items) && raw.items.length > 0)
      ? raw.items
      : [];

    // Firma çözümleme
    let displayFirmalar = (raw.firmalar &&
      Array.isArray(raw.firmalar) &&
      raw.firmalar.length > 0)
      ? raw.firmalar
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
      : (raw.firmaListesi &&
          Array.isArray(raw.firmaListesi) &&
          raw.firmaListesi.length > 0)
      ? raw.firmaListesi
      : [];

    if (displayFirmalar.length === 0 && rawKalemler.length > 0) {
      const firstOffers =
        rawKalemler[0]?.firmaTeklifleriDetay ||
        rawKalemler[0]?.firmaTeklifleri ||
        rawKalemler[0]?.teklifler ||
        [];
      if (Array.isArray(firstOffers) && firstOffers.length > 0) {
        displayFirmalar = firstOffers.map((tf: any, i: number) => ({
          id: tf.firmaId || tf.id,
          unvan:
            tf.firmaUnvan ||
            tf.unvan ||
            tf.firmaAdi ||
            `Firma ${i + 1}`,
        }));
      }
    }

    // Kalemlerin ve dinamik tekliflerin işlenmesi
    const processedKalemler: ProcessedPiyasaKalem[] = rawKalemler.map(
      (kalem: any, idx: number) => {
        const rowNum = kalem.siraNo ?? idx + 1;
        const malzemeAdi =
          kalem.malzemeAdi ||
          kalem.kalem_adi ||
          kalem.kalemAdi ||
          kalem.ad ||
          "";
        const ozelligi =
          kalem.ozelligi ||
          kalem.aciklama ||
          kalem.kalem_aciklama ||
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

        let enUygunFirmaAdi = kalem.enUygunFirmaAdi || "";
        let enDusukFiyatVal = kalem.enDusukFiyat;
        let kalemToplamBedelVal = kalem.toplamBedel;

        const offersList =
          kalem.firmaTeklifleriDetay ||
          kalem.firmaTeklifleri ||
          kalem.teklifler ||
          [];

        if (Array.isArray(offersList) && offersList.length > 0) {
          let minTutar = Infinity;
          let minIdx = -1;

          offersList.forEach((tf: any, fIdx: number) => {
            const rawVal = tf.birimFiyat ?? tf.fiyat ?? tf.birim_fiyat;
            const numPrice =
              typeof rawVal === "number"
                ? rawVal
                : parseFloat(
                    String(rawVal || "")
                      .replace(/[^0-9.,-]/g, "")
                      .replace(/\./g, "")
                      .replace(",", ".")
                  );

            if (!isNaN(numPrice) && numPrice > 0 && numPrice < minTutar) {
              minTutar = numPrice;
              minIdx = fIdx;
            }
          });

          if (minIdx !== -1) {
            if (!enUygunFirmaAdi && displayFirmalar[minIdx]) {
              enUygunFirmaAdi =
                displayFirmalar[minIdx].unvan ||
                displayFirmalar[minIdx].firma_adi ||
                `Firma ${minIdx + 1}`;
            }
            if (
              !enDusukFiyatVal ||
              enDusukFiyatVal === "-" ||
              enDusukFiyatVal === "0,00"
            ) {
              enDusukFiyatVal = minTutar;
            }
            if (
              !kalemToplamBedelVal ||
              kalemToplamBedelVal === "-" ||
              kalemToplamBedelVal === "0,00"
            ) {
              kalemToplamBedelVal = minTutar * miktarNum;
            }
          }
        }

        return {
          ...kalem,
          siraNo: rowNum,
          malzemeAdi,
          ozelligi,
          birimi,
          miktar,
          enUygunFirmaAdi: enUygunFirmaAdi || "-",
          enDusukFiyat:
            enDusukFiyatVal !== undefined &&
            enDusukFiyatVal !== null &&
            enDusukFiyatVal !== "-"
              ? formatMoney(enDusukFiyatVal)
              : "-",
          toplamBedel:
            kalemToplamBedelVal !== undefined &&
            kalemToplamBedelVal !== null &&
            kalemToplamBedelVal !== "-"
              ? formatMoney(kalemToplamBedelVal)
              : "-",
        };
      }
    );

    // Firma toplamları
    const displayFirmaToplamlari = displayFirmalar.map(
      (_f: any, fIdx: number) => {
        const existing =
          (raw.firmaToplamlariDetay && raw.firmaToplamlariDetay[fIdx]) ||
          (raw.firmaToplamlari && raw.firmaToplamlari[fIdx]);
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
          const tf =
            (k.firmaTeklifleriDetay && k.firmaTeklifleriDetay[fIdx]) ||
            (k.firmaTeklifleri && k.firmaTeklifleri[fIdx]);
          const offerPrice = tf?.birimFiyat ?? tf?.fiyat;
          if (
            offerPrice !== undefined &&
            offerPrice !== null &&
            offerPrice !== "-" &&
            offerPrice !== ""
          ) {
            const num =
              typeof offerPrice === "number"
                ? offerPrice
                : parseFloat(
                    String(offerPrice)
                      .replace(/[^0-9.,-]/g, "")
                      .replace(/\./g, "")
                      .replace(",", ".")
                  );
            const miktarNum =
              typeof k.miktar === "number"
                ? k.miktar
                : parseFloat(
                    String(k.miktar || 1)
                      .replace(/\./g, "")
                      .replace(",", ".")
                  ) || 1;
            if (!isNaN(num) && num > 0) {
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

    // Genel toplam
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

    const hesaplamaEsasiText =
      raw.hesaplamaEsasiText ||
      (String(
        raw.hesaplamaEsasi ||
          raw.hesaplama_esasi ||
          raw.yaklasikMaliyetEsasi ||
          raw.yaklasik_maliyet_hesaplamasi ||
          ""
      ).toLowerCase().includes("ortalama")
        ? "birim fiyatların ortalaması"
        : "en düşük fiyatlar");

    return {
      idareAdi,
      kurumAdi,
      dosyaTarihi,
      evrakSayisi,
      tarih,
      isAdi,
      isBasligi,
      aciklama,
      displayFirmalar,
      processedKalemler,
      displayFirmaToplamlari,
      formattedGenelToplam,
      displayKomisyon,
      baskanAdi,
      baskanUnvan,
      hesaplamaEsasiText,
      olurYazisi: raw.olurYazisi !== false,
      formatMoney,
    };
  }, [data]);
}
