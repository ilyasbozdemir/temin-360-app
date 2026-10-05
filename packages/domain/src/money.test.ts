import { describe, it, expect } from 'vitest';
import { Money } from './money';

describe('Money class - kuruş tabanlı para aritmetiği', () => {
  it('TL string veya number girisi ile kurus olusturur', () => {
    expect(Money.fromTL('100.50').kurus).toBe(10050n);
    expect(Money.fromTL(100.5).kurus).toBe(10050n);
    expect(Money.fromTL('1021827').kurus).toBe(102182700n);
  });

  it('Float artikli / birden cok ondalikli number girdileri reddeder', () => {
    expect(() => Money.fromTL(0.1 + 0.2)).toThrow(/en çok 2 ondalık/);
    expect(() => Money.fromTL('100.555')).toThrow(/Geçersiz TL biçimi/);
  });

  it('Toplama ve cikarma islemleri', () => {
    const m1 = Money.fromTL('100.50');
    const m2 = Money.fromTL('49.50');
    expect(m1.plus(m2).toTLString()).toBe('150,00 TL');
    expect(m1.minus(m2).toTLString()).toBe('51,00 TL');
  });

  it('Oran ile carpim ve yuvarlama kipleri', () => {
    const m = Money.fromKurus(100n); // 1.00 TL
    // %5 -> 5 kurus
    expect(m.mulRate(5, 100).kurus).toBe(5n);

    // yariYukari vs asagi
    const m2 = Money.fromKurus(15n); // 0.15 TL
    // 15 * 1 / 10 = 1.5 -> yariYukari -> 2, asagi -> 1
    expect(m2.mulRate(1, 10, 'yariYukari').kurus).toBe(2n);
    expect(m2.mulRate(1, 10, 'asagi').kurus).toBe(1n);
  });

  it('oranBasisPuan hesabi', () => {
    const harcama = Money.fromTL('1200');
    const odenek = Money.fromTL('10000');
    expect(harcama.oranBasisPuan(odenek)).toBe(1200n); // %12.00
  });

  it('toTLString formatlama', () => {
    expect(Money.fromTL('3406508.50').toTLString()).toBe('3.406.508,50 TL');
  });
});
