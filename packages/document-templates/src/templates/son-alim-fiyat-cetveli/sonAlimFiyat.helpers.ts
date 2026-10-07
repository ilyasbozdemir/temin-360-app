import {
  DEFAULT_LIMITS,
  LANDSCAPE_LIMITS,
  type PageLimitConfig,
} from '../../document/DynamicPaginatedTable';

export const AY_ADLARI = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export interface EndeksKaydi {
  yil: number;
  ay: number;
  endeks: number;
}

export const ANA_TABLO_KOLONLARI: any[] = [
  { key: 'siraNo', label: 'Sıra No', width: '5%', align: 'center' },
  { key: 'malzemeKodu', label: 'Malzeme Kodu', width: '12%', align: 'left' },
  { key: 'malzemeAdi', label: 'Malzeme Adı', width: '18%', align: 'left' },
  { key: 'ozelligi', label: 'Özelliği', width: '14%', align: 'left' },
  { key: 'birimi', label: 'Birimi', width: '7%', align: 'center' },
  { key: 'kdvOrani', label: 'KDV (%)', width: '6%', align: 'center' },
  { key: 'miktar', label: 'Miktar', width: '6%', align: 'right' },
  { key: 'birimFiyat', label: 'Birim Fiyat (TL)', width: '11%', align: 'right' },
  { key: 'toplamTutar', label: 'Toplam Tutar (TL)', width: '11%', align: 'right' },
  { key: 'kazananFirma', label: 'Kazanan Firma', width: '12%', align: 'left' },
  { key: 'alimTarihi', label: 'Alım Tarihi', width: '9%', align: 'center' },
];

/** fiyatKalemleri yoksa ihtiyacKalemleri'nden cetvel satırlarını üretir. */
export function normalizeKalemler(data: Record<string, any>): any[] {
  if (data.fiyatKalemleri?.length > 0) return data.fiyatKalemleri;
  if (!(data.ihtiyacKalemleri?.length > 0)) return [];
  return data.ihtiyacKalemleri.map((k: any, idx: number) => ({
    siraNo: k.siraNo || idx + 1,
    malzemeKodu: k.malzemeKodu || k.kodu || k.tasinir_kodu || '-',
    malzemeAdi: k.malzemeAdi || k.kalem_adi || '',
    ozelligi: k.ozelligi || k.aciklama || '',
    birimi: k.birimi || k.birim || '',
    kdvOrani: k.kdvOrani ? String(k.kdvOrani).replace('%', '') : '20',
    miktar: k.miktar || 1,
    birimFiyat: k.birimFiyat || k.enDusukFiyat || '0,00',
    toplamTutar: k.toplamTutar || k.toplamBedel || '0,00',
    kazananFirma: k.kazananFirma || k.enUygunFirmaAdi || '-',
    alimTarihi: k.alimTarihi || data.tarih || '-',
  }));
}

const pick = (explicit: any, fallback: number): number =>
  explicit !== undefined && explicit !== null ? Number(explicit) : fallback;

export function resolvePageLimits(
  orientation: 'portrait' | 'landscape',
  overrides: { first?: any; middle?: any; last?: any },
): PageLimitConfig {
  const land = orientation === 'landscape';
  return {
    firstPage: pick(overrides.first, land ? LANDSCAPE_LIMITS.firstPage || 10 : DEFAULT_LIMITS.firstPage || 8),
    middle: pick(overrides.middle, land ? LANDSCAPE_LIMITS.middle || 14 : DEFAULT_LIMITS.middle || 12),
    lastPage: pick(overrides.last, land ? LANDSCAPE_LIMITS.lastPage || 8 : DEFAULT_LIMITS.lastPage || 6),
  };
}

/** "1.234,56", "1234.56", "1.234,56 TL" veya number → number */
export function parseTrNumber(value: unknown): number {
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  if (value === null || value === undefined) return 0;
  let s = String(value).replace(/[^\d.,-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export const formatTL = (n: number): string =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "15.03.2025", "15/03/2025", "2025-03-15" veya Date → { yil, ay } */
export function parseYilAy(value: unknown): { yil: number; ay: number } | null {
  if (!value || value === '-') return null;
  if (value instanceof Date && !isNaN(value.getTime())) {
    return { yil: value.getFullYear(), ay: value.getMonth() + 1 };
  }
  const s = String(value).trim();
  let m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (m) return { yil: Number(m[3]), ay: Number(m[2]) };
  m = s.match(/^(\d{4})[./-](\d{1,2})/);
  if (m) return { yil: Number(m[1]), ay: Number(m[2]) };
  return null;
}

export const donemEtiketi = (yil: number, ay: number): string =>
  `${AY_ADLARI[ay - 1] ?? ay} ${yil}`;

export interface GuncelFiyatSatiri {
  siraNo: any;
  malzemeAdi: string;
  birimi: string;
  miktar: number;
  alimTarihi: string;
  sonAlimBirimFiyat: string;
  alimEndeksi: string;
  guncelEndeks: string;
  katsayi: string;
  guncelBirimFiyat: string;
  guncelToplam: string;
}

export interface GuncellemeSonucu {
  satirlar: GuncelFiyatSatiri[];
  hedef: EndeksKaydi | null;
  sonAlimToplam: number;
  guncelToplam: number;
  eksikEndeksVar: boolean;
}

/**
 * Son alım fiyatlarını TÜİK Yİ-ÜFE endeksiyle güncel aya taşır.
 * Güncel Fiyat = Son Alım Fiyatı × (Hedef Ay Endeksi / Alım Ayı Endeksi)
 */
export function guncelleYiUfe(
  kalemler: any[],
  endeksler: EndeksKaydi[],
  hedefOverride?: { yil?: number; ay?: number },
): GuncellemeSonucu {
  const bul = (yil: number, ay: number) =>
    endeksler.find((e) => Number(e.yil) === yil && Number(e.ay) === ay) ?? null;

  const enSon =
    [...endeksler].sort((a, b) => b.yil * 100 + b.ay - (a.yil * 100 + a.ay))[0] ?? null;
  const hedef =
    hedefOverride?.yil && hedefOverride?.ay
      ? bul(Number(hedefOverride.yil), Number(hedefOverride.ay)) ?? enSon
      : enSon;

  let sonAlimToplam = 0;
  let guncelToplam = 0;
  let eksikEndeksVar = false;

  const satirlar = kalemler.map((k, idx) => {
    const miktar = parseTrNumber(k.miktar) || 1;
    const birimFiyat = parseTrNumber(k.birimFiyat);
    const donem = parseYilAy(k.alimTarihi);
    const baz = donem ? bul(donem.yil, donem.ay) : null;
    const katsayi = baz && hedef && baz.endeks > 0 ? hedef.endeks / baz.endeks : null;
    if (katsayi === null) eksikEndeksVar = true;

    const guncelBirim = birimFiyat * (katsayi ?? 1);
    const satirSonAlim = birimFiyat * miktar;
    const satirGuncel = guncelBirim * miktar;
    sonAlimToplam += satirSonAlim;
    guncelToplam += satirGuncel;

    return {
      siraNo: k.siraNo || idx + 1,
      malzemeAdi: k.malzemeAdi || '',
      birimi: k.birimi || '',
      miktar,
      alimTarihi: k.alimTarihi || '-',
      sonAlimBirimFiyat: formatTL(birimFiyat),
      alimEndeksi: baz ? `${baz.endeks.toLocaleString('tr-TR')} (${donemEtiketi(baz.yil, baz.ay)})` : '—',
      guncelEndeks: hedef ? hedef.endeks.toLocaleString('tr-TR') : '—',
      katsayi: katsayi !== null ? katsayi.toFixed(4).replace('.', ',') : '—',
      guncelBirimFiyat: formatTL(guncelBirim),
      guncelToplam: formatTL(satirGuncel),
    };
  });

  return { satirlar, hedef, sonAlimToplam, guncelToplam, eksikEndeksVar };
}
