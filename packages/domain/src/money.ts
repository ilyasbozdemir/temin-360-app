/**
 * Kuruş tabanlı para tipi. Tüm tutarlar BigInt kuruş olarak tutulur;
 * float (number) ile para hesabı yapılmaz.
 *
 * Yuvarlama: kuruş altı kalan değerlerde varsayılan "yariYukari"
 * (sıfırdan uzağa). Belgeye özgü farklı bir yuvarlama kuralı gerekiyorsa
 * çağıran taraf bunu açıkça belirtmelidir.
 */
export type YuvarlamaKipi = 'yariYukari' | 'asagi';

const TL_REGEX = /^-?\d+(\.\d{1,2})?$/;

export class Money {
  static readonly ZERO = new Money(0n);

  private constructor(readonly kurus: bigint) {}

  static fromKurus(kurus: bigint | number): Money {
    if (typeof kurus === 'number') {
      if (!Number.isSafeInteger(kurus)) {
        throw new RangeError(`Geçersiz kuruş değeri: ${kurus}`);
      }
      return new Money(BigInt(kurus));
    }
    return new Money(kurus);
  }

  /**
   * TL'den oluşturur. Kesin sonuç için string önerilir ("1021827.50", nokta ondalık).
   * number kabul edilir ancak en çok 2 ondalık basamağı olmalıdır;
   * 0.1 + 0.2 gibi float artıkları hata fırlatır.
   */
  static fromTL(tl: string | number): Money {
    let s: string;
    if (typeof tl === 'number') {
      if (!Number.isFinite(tl) || Math.abs(tl) > 1e13) {
        throw new RangeError(`Geçersiz TL değeri: ${tl}`);
      }
      s = tl.toFixed(2);
      if (Number(s) !== tl) {
        throw new RangeError(`TL değeri en çok 2 ondalık içerebilir: ${tl}`);
      }
    } else {
      s = tl.trim();
    }
    if (!TL_REGEX.test(s)) {
      throw new RangeError(`Geçersiz TL biçimi: "${tl}"`);
    }
    const negatif = s.startsWith('-');
    const [tam, ondalik = ''] = (negatif ? s.slice(1) : s).split('.');
    const kurus = BigInt(tam!) * 100n + BigInt(ondalik.padEnd(2, '0'));
    return new Money(negatif ? -kurus : kurus);
  }

  plus(o: Money): Money {
    return new Money(this.kurus + o.kurus);
  }

  minus(o: Money): Money {
    return new Money(this.kurus - o.kurus);
  }

  /** Tutarı pay/payda oranıyla çarpar. Örn. %5 → mulRate(5, 100); binde 9,48 → mulRate(948, 100000). */
  mulRate(pay: bigint | number, payda: bigint | number, kip: YuvarlamaKipi = 'yariYukari'): Money {
    const p = BigInt(pay);
    const d = BigInt(payda);
    if (d <= 0n) throw new RangeError('Payda pozitif olmalı');
    const n = this.kurus * p;
    let q = n / d; // sıfıra doğru keser
    const r = n % d;
    if (kip === 'yariYukari') {
      const mutlakR = r < 0n ? -r : r;
      if (mutlakR * 2n >= d) q += n < 0n ? -1n : 1n;
    } else if (kip === 'asagi') {
      if (r < 0n) q -= 1n; // gerçek floor
    }
    return new Money(q);
  }

  compareTo(o: Money): -1 | 0 | 1 {
    return this.kurus < o.kurus ? -1 : this.kurus > o.kurus ? 1 : 0;
  }
  equals(o: Money): boolean {
    return this.kurus === o.kurus;
  }
  isNegative(): boolean {
    return this.kurus < 0n;
  }
  isZero(): boolean {
    return this.kurus === 0n;
  }
  /** Negatifse sıfır döner. */
  floorAtZero(): Money {
    return this.kurus < 0n ? Money.ZERO : this;
  }

  /** this / payda oranı, baz puan (1 bp = %0,01) olarak, yarım yukarı yuvarlanır. */
  oranBasisPuan(payda: Money): bigint {
    if (payda.kurus <= 0n) throw new RangeError('Payda pozitif olmalı');
    const n = this.kurus * 10000n;
    let q = n / payda.kurus;
    const r = n % payda.kurus;
    if ((r < 0n ? -r : r) * 2n >= payda.kurus) q += n < 0n ? -1n : 1n;
    return q;
  }

  /** SQLite INTEGER alanı için. Güvenli tamsayı sınırını aşarsa hata verir. */
  toKurusNumber(): number {
    const n = Number(this.kurus);
    if (!Number.isSafeInteger(n)) throw new RangeError('Tutar number olarak güvenle saklanamaz');
    return n;
  }

  /** "1.021.827,00 TL" */
  toTLString(): string {
    const negatif = this.kurus < 0n;
    const mutlak = negatif ? -this.kurus : this.kurus;
    const tam = (mutlak / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const kurusKismi = (mutlak % 100n).toString().padStart(2, '0');
    return `${negatif ? '-' : ''}${tam},${kurusKismi} TL`;
  }
}
