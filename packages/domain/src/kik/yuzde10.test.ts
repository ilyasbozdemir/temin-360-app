import { describe, it, expect } from 'vitest';
import { denetleYuzde10Siniri } from './yuzde10';
import { Money } from '../money';

describe('Md. 62/ı %10 Harcama Sınırı Denetimi', () => {
  it('Ödenek %10 altındaki harcamalarda sınır aşılmaz', () => {
    const r = denetleYuzde10Siniri({
      kategori: 'mal',
      odenek: Money.fromTL('10000000'), // 10.000.000 TL
      mevcutHarcama: Money.fromTL('500000'), // 500.000 TL (%5)
      yeniAlim: Money.fromTL('400000'), // 400.000 TL (%4)
    });

    expect(r.sinirAsilmadi).toBe(true);
    expect(r.kurulUygunGorusuGerekir).toBe(false);
    expect(r.azamiTutar.toTLString()).toBe('1.000.000,00 TL');
    expect(r.yeniToplam.toTLString()).toBe('900.000,00 TL');
    expect(r.kalanKapasite.toTLString()).toBe('100.000,00 TL');
    expect(r.oranBasisPuan).toBe(900n); // %9,00
  });

  it('Ödenek %10 tam sınırında uygun görüş gerekmez', () => {
    const r = denetleYuzde10Siniri({
      kategori: 'hizmet',
      odenek: Money.fromTL('5000000'),
      mevcutHarcama: Money.fromTL('400000'),
      yeniAlim: Money.fromTL('100000'),
    });

    expect(r.sinirAsilmadi).toBe(true);
    expect(r.kurulUygunGorusuGerekir).toBe(false);
    expect(r.azamiTutar.toTLString()).toBe('500.000,00 TL');
    expect(r.oranBasisPuan).toBe(1000n); // %10,00
  });

  it('Ödenek %10 aşıldığında kurul uygun görüşü gerekir', () => {
    const r = denetleYuzde10Siniri({
      kategori: 'yapim',
      odenek: Money.fromTL('10000000'),
      mevcutHarcama: Money.fromTL('950000'),
      yeniAlim: Money.fromTL('100000'), // Toplam 1.050.000 TL (%10,50)
    });

    expect(r.sinirAsilmadi).toBe(false);
    expect(r.kurulUygunGorusuGerekir).toBe(true);
    expect(r.kalanKapasite.toTLString()).toBe('0,00 TL');
    expect(r.oranBasisPuan).toBe(1050n); // %10,50
  });

  it('Negatif ödenek/harcama hata fırlatır', () => {
    expect(() =>
      denetleYuzde10Siniri({
        kategori: 'mal',
        odenek: Money.fromTL('-100'),
        mevcutHarcama: Money.ZERO,
        yeniAlim: Money.ZERO,
      }),
    ).toThrow(/odenek negatif olamaz/);
  });
});
