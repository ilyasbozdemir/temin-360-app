import { Money } from '../money';

/**
 * 4734 sayılı Kamu İhale Kanunu uyarınca idare tipi.
 * 'buyuksehir': Büyükşehir belediye sınırları içindeki idareler.
 * 'diger': Büyükşehir belediye sınırları dışındaki idareler.
 */
export type IdareTipi = 'buyuksehir' | 'diger';

/**
 * Kamu İhale Kurumu (KİK) Tebliği ile belirlenen yıllık parasal limit dönemi.
 * Limitler takvim yılına değil, 1 Şubat – 31 Ocak dönemine göre geçerlidir (4734 Sayılı Kanun md. 67).
 */
export interface KikLimitDonemi {
  /** Dönem başlangıç tarihi (ISO biçimi YYYY-MM-DD, dahil). */
  readonly baslangic: string;
  /** Dönem bitiş tarihi (ISO biçimi YYYY-MM-DD, dahil). */
  readonly bitis: string;
  /** Limit rakamının yayımlandığı Resmî Gazete Tebliğ referansı (RG tarih/sayı). */
  readonly kaynak: string;
  /** 4734 Sayılı Kanun Md. 22/d doğrudan temin parasal limitleri. */
  readonly md22d: { readonly buyuksehir: Money; readonly diger: Money };
  /** 4734 Sayılı Kanun Md. 21/f pazarlık usulü parasal limiti. */
  readonly md21f: Money;
}

/**
 * Resmî Gazete Tebliğleri ile doğrulanmış KİK parasal limit dönemleri listesi.
 */
export const KIK_LIMIT_DONEMLERI: readonly KikLimitDonemi[] = [
  {
    baslangic: '2025-02-01',
    bitis: '2026-01-31',
    kaynak: '2025/1 sayılı Kamu İhale Tebliği, RG 24.01.2025 / 32792',
    md22d: { buyuksehir: Money.fromTL('800366'), diger: Money.fromTL('266618') },
    md21f: Money.fromTL('2668214'),
  },
  {
    baslangic: '2026-02-01',
    bitis: '2027-01-31',
    kaynak: '2026/1 sayılı Kamu İhale Tebliği, RG 22.01.2026 / 33145',
    md22d: { buyuksehir: Money.fromTL('1021827'), diger: Money.fromTL('340391') },
    md21f: Money.fromTL('3406508'),
  },
];

const ISO_TARIH = /^(\d{4})-(\d{2})-(\d{2})$/;

function gecerliIsoTarih(s: string): boolean {
  const m = ISO_TARIH.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

/**
 * Verilen işlem tarihine karşılık gelen geçerli KİK parasal limit dönemini döndürür.
 * @param isoTarih - İşlem tarihi (ISO formatında YYYY-MM-DD).
 * @param donemler - Limit dönemleri dizisi (varsayılan: KIK_LIMIT_DONEMLERI).
 * @returns Verilen tarihte geçerli KikLimitDonemi nesnesi.
 * @throws {RangeError} Tarih biçimi geçersizse veya tanımlı bir limit dönemine düşmüyorsa fırlatılır.
 */
export function getKikLimitForDate(
  isoTarih: string,
  donemler: readonly KikLimitDonemi[] = KIK_LIMIT_DONEMLERI,
): KikLimitDonemi {
  if (!gecerliIsoTarih(isoTarih)) {
    throw new RangeError(`Geçersiz ISO tarih (YYYY-MM-DD bekleniyor): "${isoTarih}"`);
  }
  const bulunan = donemler.find((d) => isoTarih >= d.baslangic && isoTarih <= d.bitis);
  if (!bulunan) {
    throw new RangeError(
      `${isoTarih} için tanımlı KİK limit dönemi yok. Yeni Tebliğ rakamlarını KIK_LIMIT_DONEMLERI listesine ekleyin.`,
    );
  }
  return bulunan;
}

/**
 * Belirtilen tarih ve idare tipine ait 4734 Sayılı Kanun Md. 22/d doğrudan temin parasal limitini döndürür.
 * @param isoTarih - İşlem tarihi (ISO formatında YYYY-MM-DD).
 * @param idare - İdare tipi ('buyuksehir' veya 'diger').
 * @returns İlgili dönem ve idare tipine ait doğrudan temin limiti.
 */
export function md22dLimiti(isoTarih: string, idare: IdareTipi): Money {
  return getKikLimitForDate(isoTarih).md22d[idare];
}

/**
 * Belirtilen tarihe ait 4734 Sayılı Kanun Md. 21/f pazarlık usulü alım parasal limitini döndürür.
 * @param isoTarih - İşlem tarihi (ISO formatında YYYY-MM-DD).
 * @returns İlgili döneme ait pazarlık usulü alım limiti.
 */
export function md21fLimiti(isoTarih: string): Money {
  return getKikLimitForDate(isoTarih).md21f;
}

