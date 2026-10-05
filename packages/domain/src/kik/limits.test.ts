import { describe, it, expect } from 'vitest';
import { KIK_LIMIT_DONEMLERI, getKikLimitForDate, md22dLimiti, md21fLimiti } from './limits';

// Bu testler Resmî Gazete'deki Tebliğ rakamlarını kilitler.
// 2026/1 Tebliği: RG 22.01.2026 / 33145, Yİ-ÜFE %27,67 artış.
describe('KİK limit dönemleri - Tebliğ kilitleri', () => {
  it('2025 dönemi (01.02.2025 – 31.01.2026)', () => {
    const d = getKikLimitForDate('2025-06-15');
    expect(d.md22d.buyuksehir.toTLString()).toBe('800.366,00 TL');
    expect(d.md22d.diger.toTLString()).toBe('266.618,00 TL');
    expect(d.md21f.toTLString()).toBe('2.668.214,00 TL');
  });

  it('2026 dönemi (01.02.2026 – 31.01.2027)', () => {
    const d = getKikLimitForDate('2026-06-15');
    expect(d.md22d.buyuksehir.toTLString()).toBe('1.021.827,00 TL');
    expect(d.md22d.diger.toTLString()).toBe('340.391,00 TL');
    expect(d.md21f.toTLString()).toBe('3.406.508,00 TL');
  });

  it('Tebliğdeki artış oranı ile tutarlı (Yİ-ÜFE %27,67, ±1 TL yuvarlama)', () => {
    const eski = KIK_LIMIT_DONEMLERI[0]!;
    const yeni = KIK_LIMIT_DONEMLERI[1]!;
    for (const [e, y] of [
      [eski.md22d.buyuksehir, yeni.md22d.buyuksehir],
      [eski.md22d.diger, yeni.md22d.diger],
      [eski.md21f, yeni.md21f],
    ] as const) {
      const beklenen = e.mulRate(12767, 10000);
      const fark = beklenen.minus(y).kurus;
      expect(fark >= -100n && fark <= 100n).toBe(true);
    }
  });
});

describe('Dönem geçişleri (takvim yılı değil, 1 Şubat)', () => {
  it('15 Ocak 2026 hâlâ 2025/1 Tebliği limitlerine tabidir', () => {
    expect(md22dLimiti('2026-01-15', 'buyuksehir').toTLString()).toBe('800.366,00 TL');
  });
  it('31 Ocak 2026 son gün: eski dönem', () => {
    expect(md22dLimiti('2026-01-31', 'diger').toTLString()).toBe('266.618,00 TL');
  });
  it('1 Şubat 2026 ilk gün: yeni dönem', () => {
    expect(md22dLimiti('2026-02-01', 'diger').toTLString()).toBe('340.391,00 TL');
    expect(md21fLimiti('2026-02-01').toTLString()).toBe('3.406.508,00 TL');
  });
  it('1 Ocak 2026 hâlâ eski dönemdedir (yıl başı geçiş yok)', () => {
    expect(md22dLimiti('2026-01-01', 'buyuksehir').toTLString()).toBe('800.366,00 TL');
  });
  it('tanımlı dönem dışı tarih sessizce yuvarlanmaz, hata verir', () => {
    expect(() => getKikLimitForDate('2027-02-01')).toThrow(/limit dönemi yok/);
    expect(() => getKikLimitForDate('2025-01-31')).toThrow(/limit dönemi yok/);
  });
  it('geçersiz tarih biçimi reddedilir', () => {
    expect(() => getKikLimitForDate('2026-02-30')).toThrow();
    expect(() => getKikLimitForDate('15.01.2026')).toThrow();
  });
});

describe('Dönem listesi bütünlüğü', () => {
  it('dönemler çakışmaz ve boşluksuz ardışıktır', () => {
    for (let i = 1; i < KIK_LIMIT_DONEMLERI.length; i++) {
      const onceki = KIK_LIMIT_DONEMLERI[i - 1]!;
      const simdiki = KIK_LIMIT_DONEMLERI[i]!;
      const bitisPlus1 = new Date(Date.parse(onceki.bitis + 'T00:00:00Z') + 86400000)
        .toISOString()
        .slice(0, 10);
      expect(simdiki.baslangic).toBe(bitisPlus1);
    }
  });
  it('her dönem 1 Şubat\'ta başlar, 31 Ocak\'ta biter', () => {
    for (const d of KIK_LIMIT_DONEMLERI) {
      expect(d.baslangic.slice(5)).toBe('02-01');
      expect(d.bitis.slice(5)).toBe('01-31');
    }
  });
});
