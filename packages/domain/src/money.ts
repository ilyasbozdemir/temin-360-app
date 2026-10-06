/**
 * Kuruş altı hesaplamalarda kullanılacak yuvarlama yöntemi.
 * 'yariYukari': 0.5 ve üzeri değerler sıfırdan uzağa yuvarlanır.
 * 'asagi': Taban yuvarlama (floor) yapılır.
 */
export type YuvarlamaKipi = 'yariYukari' | 'asagi';

const TL_REGEX = /^-?\d+(\.\d{1,2})?$/;

/**
 * Kuruş tabanlı hassas para ve tutar nesnesi.
 * Tüm finansal hesaplamalar BigInt kuruş cinsinden yürütülür;
 * kayan noktalı sayı (float) hassasiyet kayıpları engellenir.
 */
export class Money {
  /** Sıfır kuruş tutarında sabit Money nesnesi. */
  static readonly ZERO = new Money(0n);

  /**
   * Doğrudan BigInt kuruş değeri ile yeni bir Money nesnesi oluşturur.
   * @param kurus - Kuruş cinsinden BigInt değeri.
   */
  private constructor(readonly kurus: bigint) {}

  /**
   * Kuruş değerinden Money nesnesi türetir.
   * @param kurus - Kuruş tutarı (bigint veya güvenli tamsayı number).
   * @returns Kuruş değerini temsil eden Money nesnesi.
   * @throws {RangeError} Number parametre güvenli tamsayı (`Number.isSafeInteger`) değilse fırlatılır.
   */
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
   * TL değerinden Money nesnesi oluşturur.
   * Hassasiyet kaybını önlemek için string formatı ("1021827.50", nokta ondalık) önerilir.
   * @param tl - TL tutarı (string veya en fazla 2 ondalık basamaklı number).
   * @returns Karşılık gelen Money nesnesi.
   * @throws {RangeError} Geçersiz TL formatı veya 2 basamaktan fazla ondalık içeriyorsa fırlatılır.
   * @example
   * ```ts
   * const m1 = Money.fromTL("1050.75");
   * const m2 = Money.fromTL(100);
   * ```
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

  /**
   * İki Money tutarını toplar.
   * @param o - Eklenecek Money tutarı.
   * @returns Toplam tutar.
   */
  plus(o: Money): Money {
    return new Money(this.kurus + o.kurus);
  }

  /**
   * İki Money tutarını çıkarır.
   * @param o - Çıkarılacak Money tutarı.
   * @returns Fark tutarı.
   */
  minus(o: Money): Money {
    return new Money(this.kurus - o.kurus);
  }

  /**
   * Tutarı verilen pay/payda oranıyla çarpar ve yuvarlar.
   * @param pay - Oran payı (örn. %5 için 5).
   * @param payda - Oran paydası (örn. %5 için 100, binde 9.48 için 100000).
   * @param kip - Yuvarlama yöntemi (varsayılan: 'yariYukari').
   * @returns Hesaplanmış tutar.
   * @throws {RangeError} Payda sıfır veya negatif ise fırlatılır.
   */
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

  /**
   * İki Money tutarını karşılaştırır.
   * @param o - Karşılaştırılacak tutar.
   * @returns Küçükse -1, eşitse 0, büyükse 1.
   */
  compareTo(o: Money): -1 | 0 | 1 {
    return this.kurus < o.kurus ? -1 : this.kurus > o.kurus ? 1 : 0;
  }

  /**
   * İki Money tutarının kuruş bazında eşitliğini denetler.
   * @param o - Karşılaştırılacak tutar.
   * @returns Eşitse true.
   */
  equals(o: Money): boolean {
    return this.kurus === o.kurus;
  }

  /**
   * Tutarın negatif olup olmadığını denetler.
   * @returns Negatifse true.
   */
  isNegative(): boolean {
    return this.kurus < 0n;
  }

  /**
   * Tutarın sıfır olup olmadığını denetler.
   * @returns Sıfırsa true.
   */
  isZero(): boolean {
    return this.kurus === 0n;
  }

  /**
   * Negatif tutarları sıfır değerine çeker (floor at zero).
   * @returns Tutar negatifse Money.ZERO, değilse nesnenin kendisi.
   */
  floorAtZero(): Money {
    return this.kurus < 0n ? Money.ZERO : this;
  }

  /**
   * Bu tutarın verilen payda tutarına oranını baz puan cinsinden hesaplar (1 bp = %0,01).
   * @param payda - Oranlanacak payda Money tutarı.
   * @returns Baz puan cinsinden oran.
   * @throws {RangeError} Payda sıfır veya negatif ise fırlatılır.
   */
  oranBasisPuan(payda: Money): bigint {
    if (payda.kurus <= 0n) throw new RangeError('Payda pozitif olmalı');
    const n = this.kurus * 10000n;
    let q = n / payda.kurus;
    const r = n % payda.kurus;
    if ((r < 0n ? -r : r) * 2n >= payda.kurus) q += n < 0n ? -1n : 1n;
    return q;
  }

  /**
   * SQLite INTEGER alanlarında saklamak üzere kuruş tutarını güvenli tamsayı number olarak döner.
   * @returns Kuruş değeri number cinsinden.
   * @throws {RangeError} Güvenli tamsayı sınırı (`Number.MAX_SAFE_INTEGER`) aşılırsa fırlatılır.
   */
  toKurusNumber(): number {
    const n = Number(this.kurus);
    if (!Number.isSafeInteger(n)) throw new RangeError('Tutar number olarak güvenle saklanamaz');
    return n;
  }

  /**
   * Tutarı Türkiye biçimlendirmesine uygun TL metni olarak döndürür (Örn: "1.021.827,00 TL").
   * @returns Biçimlendirilmiş TL metni.
   */
  toTLString(): string {
    const negatif = this.kurus < 0n;
    const mutlak = negatif ? -this.kurus : this.kurus;
    const tam = (mutlak / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const kurusKismi = (mutlak % 100n).toString().padStart(2, '0');
    return `${negatif ? '-' : ''}${tam},${kurusKismi} TL`;
  }
}

