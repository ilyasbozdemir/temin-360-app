import { Money } from '../money';

/**
 * 4734 sayılı Kanun parasal limitleri. Limitler TAKVİM YILINA DEĞİL,
 * 1 Şubat – 31 Ocak dönemlerine göre geçerlidir (Kanun md. 67 uyarınca
 * her yıl Kamu İhale Tebliği ile güncellenir).
 *
 * KURAL: Bu dosyaya yalnızca Resmî Gazete'deki Tebliğden doğrulanmış
 * rakam girilir. Tahmini/öngörülen dönem eklenmez. Yeni Tebliğ yayımlanınca
 * yeni bir dönem satırı eklenir ve limits.test.ts içindeki kilitler güncellenir.
 */

export type IdareTipi = 'buyuksehir' | 'diger';

export interface KikLimitDonemi {
  /** ISO tarih (YYYY-MM-DD), dahil. */
  readonly baslangic: string;
  /** ISO tarih (YYYY-MM-DD), dahil. */
  readonly bitis: string;
  readonly kaynak: string;
  /** Md. 22/d: büyükşehir belediye sınırları içindeki idareler / diğer idareler. */
  readonly md22d: { readonly buyuksehir: Money; readonly diger: Money };
  /** Md. 21/f pazarlık usulü limiti (mamul mal, malzeme ve hizmet alımları). */
  readonly md21f: Money;
}

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
 * İşlem tarihine göre geçerli limit dönemini döner.
 * Tarih hiçbir dönemde yoksa SESSİZCE yakın bir dönemi kullanmaz, hata fırlatır.
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

export function md22dLimiti(isoTarih: string, idare: IdareTipi): Money {
  return getKikLimitForDate(isoTarih).md22d[idare];
}

export function md21fLimiti(isoTarih: string): Money {
  return getKikLimitForDate(isoTarih).md21f;
}
