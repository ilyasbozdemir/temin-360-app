import { Money } from '../money';

/**
 * 4734 Sayılı Kanun Md. 62/ı kapsamındaki alım kategorisi.
 * 'mal': Mal alımları.
 * 'hizmet': Hizmet alımları.
 * 'yapim': Yapım işleri.
 */
export type AlimKategorisi = 'mal' | 'hizmet' | 'yapim';

/**
 * 4734 Sayılı Kanun Md. 62/ı ve ilgili Tebliğ uyarınca %10 sınırı kontrolü girdi parametreleri.
 */
export interface Yuzde10Girdi {
  /** Alım kategorisi ('mal', 'hizmet' veya 'yapim'). */
  kategori: AlimKategorisi;
  /** İdare bütçesine ilgili alım kategorisi için konulan yıllık ödenek tutarı. */
  odenek: Money;
  /** Yıl içinde ilgili kategoride kurumca gerçekleştirilmiş 21/f ve 22/d toplam harcaması. */
  mevcutHarcama: Money;
  /** Yapılmak istenen yeni alımın tutarı. */
  yeniAlim: Money;
}

/**
 * %10 sınırı denetimi sonuç değerleri.
 */
export interface Yuzde10Sonuc {
  /** Alım kategorisi. */
  kategori: AlimKategorisi;
  /** Yıllık ödeneğin %10'u olarak hesaplanan azami izin verilen harcama limiti. */
  azamiTutar: Money;
  /** Mevcut harcama ile yeni alım tutarının toplamı. */
  yeniToplam: Money;
  /** Azami tutardan geriye kalan kullanılabilir ödenek limiti. */
  kalanKapasite: Money;
  /** Yeni toplamın azami sınırı aşmadığını belirten bayrak. */
  sinirAsilmadi: boolean;
  /** Sınır aşılıyorsa 4734 Sayılı Kanun Md. 62/ı uyarınca Kamu İhale Kurulu uygun görüşünün gerektiğini belirten bayrak. */
  kurulUygunGorusuGerekir: boolean;
  /** Yeni harcama toplamının yıllık ödeneğe oranı (baz puan cinsinden, örn: 1234 = %12,34). Ödenek sıfırsa null. */
  oranBasisPuan: bigint | null;
}

/**
 * 4734 Sayılı Kanun Md. 62/ı uyarınca bütçe ödeneğinin %10 sınır denetimini gerçekleştirir.
 * %10 hesabı mal, hizmet ve yapım işleri için ayrı ayrı yapılır.
 * @param g - Denetim yapılacak kategori, ödenek ve harcama bilgilerini içeren nesne.
 * @returns Denetim sonucu, azami tutar, kalan kapasite ve Kurul görüşü gerekip gerekmediğini içeren sonuç nesnesi.
 * @throws {RangeError} Girdi parametrelerindeki ödenek, mevcutHarcama veya yeniAlim negatifse fırlatılır.
 */
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

