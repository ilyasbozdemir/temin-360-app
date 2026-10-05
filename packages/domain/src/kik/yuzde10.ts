import { Money } from '../money';

/**
 * 4734 md. 62/ı ve "62 nci Maddesinin (ı) Bendi Kapsamında Yapılacak
 * Başvurulara İlişkin Tebliğ" (RG 31.12.2020 / 31351) uyarınca:
 *
 *  - 21/f ve 22/d kapsamındaki harcamaların yıllık toplamı, idarenin bütçesine
 *    BU AMAÇLA konulan ödeneğin %10'unu, Kamu İhale Kurulu uygun görüşü
 *    olmadıkça aşamaz.
 *  - %10 oranı mal alımı, hizmet alımı ve yapım işleri için AYRI AYRI hesaplanır.
 *  - Hesap, harcama birimi bazında değil kurum/idare (bütçe sahibi) bazındadır.
 *
 * Bu nedenle fonksiyon tek kalem "toplam bütçe" değil, kategoriye ait ödeneği alır.
 * Sınırın aşılması harcamayı mutlak yasaklamaz; Kurul uygun görüşü gerektirir.
 */

export type AlimKategorisi = 'mal' | 'hizmet' | 'yapim';

export interface Yuzde10Girdi {
  kategori: AlimKategorisi;
  /** Bu kategori için idare bütçesine konulan yıllık ödenek. */
  odenek: Money;
  /** Yıl içinde bu kategoride kurumca yapılmış 21/f + 22/d harcamaları toplamı. */
  mevcutHarcama: Money;
  /** Yapılmak istenen yeni alımın tutarı. */
  yeniAlim: Money;
}

export interface Yuzde10Sonuc {
  kategori: AlimKategorisi;
  azamiTutar: Money;
  yeniToplam: Money;
  kalanKapasite: Money;
  sinirAsilmadi: boolean;
  /** Sınır aşılıyorsa harcamadan önce Kamu İhale Kurulu uygun görüşü gerekir. */
  kurulUygunGorusuGerekir: boolean;
  /** yeniToplam / odenek, baz puan (1234 = %12,34). Ödenek sıfırsa null. */
  oranBasisPuan: bigint | null;
}

export function denetleYuzde10Siniri(g: Yuzde10Girdi): Yuzde10Sonuc {
  for (const [ad, m] of [
    ['odenek', g.odenek],
    ['mevcutHarcama', g.mevcutHarcama],
    ['yeniAlim', g.yeniAlim],
  ] as const) {
    if (m.isNegative()) throw new RangeError(`${ad} negatif olamaz`);
  }

  // Muhafazakâr: kuruş altı kalanı aşağı yuvarla, sınırı lehe şişirme.
  const azamiTutar = g.odenek.mulRate(1, 10, 'asagi');
  const yeniToplam = g.mevcutHarcama.plus(g.yeniAlim);
  const sinirAsilmadi = yeniToplam.compareTo(azamiTutar) <= 0;

  return {
    kategori: g.kategori,
    azamiTutar,
    yeniToplam,
    kalanKapasite: azamiTutar.minus(yeniToplam).floorAtZero(),
    sinirAsilmadi,
    kurulUygunGorusuGerekir: !sinirAsilmadi,
    oranBasisPuan: g.odenek.isZero() ? null : yeniToplam.oranBasisPuan(g.odenek),
  };
}
