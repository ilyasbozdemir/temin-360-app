/**
 * TÜRKÇE SAYI -> YAZI DÖNÜŞTÜRÜCÜ (TL & KURUŞ)
 * 
 * İhale, doğrudan temin, harcama pusulası, hakediş ve yaklaşık maliyet evraklarında
 * rakamla belirtilen parasal tutarları mevzuata uygun biçimde
 * büyük harfli Türkçe yazıya çevirir.
 */

const ONES = ['', 'BİR', 'İKİ', 'ÜÇ', 'DÖRT', 'BEŞ', 'ALTI', 'YEDİ', 'SEKİZ', 'DOKUZ'];
const TENS = ['', 'ON', 'YİRMİ', 'OTUZ', 'KIRK', 'ELLİ', 'ALTMIŞ', 'YETMİŞ', 'SEKSEN', 'DOKSAN'];
const SCALES = ['', 'BİN', 'MİLYON', 'MİLYAR', 'TRİLYON', 'KATRİLYON'];

/**
 * 0-999 arası 3 haneli bir sayı grubunu Türkçe kelimeye çevirir.
 */
export function convertGroup(n: number): string {
  let result = '';
  const yuzler = Math.floor(n / 100);
  const kalan = n % 100;
  const onlar = Math.floor(kalan / 10);
  const birler = kalan % 10;

  if (yuzler > 0) {
    if (yuzler > 1) result += ONES[yuzler];
    result += 'YÜZ';
  }
  if (onlar > 0) result += TENS[onlar];
  if (birler > 0) result += ONES[birler];

  return result;
}

/**
 * Negatif olmayan bir tam sayıyı tam olarak Türkçe yazıya çevirir.
 */
export function numberToWords(n: number): string {
  if (isNaN(n) || n === 0) return 'SIFIR';

  const groups: number[] = [];
  let num = Math.floor(Math.abs(n));
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;

    let groupWords = convertGroup(g);

    // "BİR BİN" değil, sadece "BİN"
    if (i === 1 && g === 1) {
      groupWords = '';
    }

    result += groupWords + (SCALES[i] || '') + ' ';
  }

  return result.trim();
}

export interface SayiyiYaziyaCevirOptions {
  paraBirimi?: string;
  altBirim?: string;
  sadeceKurusVarsaGoster?: boolean;
  harfTipi?: 'buyuk' | 'kucuk' | 'baslik';
}

/**
 * Sayısal veya metinsel bir tutarı Türkçe para birimi formatında yazıya çevirir.
 * 
 * @param raw - "282.112,00", "282112.50" veya 282112.50 gibi değerler
 * @param options - Ek yapılandırma seçenekleri
 */
export function amountToWordsTL(
  raw: string | number | null | undefined,
  options: SayiyiYaziyaCevirOptions = {}
): string {
  if (raw === undefined || raw === null || raw === '') return '';

  const {
    paraBirimi = 'TL',
    altBirim = 'KURUŞ',
    sadeceKurusVarsaGoster = true,
    harfTipi = 'buyuk',
  } = options;

  let value: number;
  if (typeof raw === 'number') {
    value = raw;
  } else {
    // Türkçe format temizliği: binlik nokta silinir, ondalık virgül -> nokta
    const cleaned = String(raw).trim().replace(/\./g, '').replace(',', '.');
    value = parseFloat(cleaned);
  }

  if (isNaN(value) || value < 0) return '';

  const tam = Math.floor(value);
  const kurus = Math.round((value - tam) * 100);

  const cleanParaBirimi = paraBirimi ? ` ${paraBirimi.trim()}` : '';
  const cleanAltBirim = altBirim ? ` ${altBirim.trim()}` : '';

  let words = numberToWords(tam) + cleanParaBirimi;
  if (kurus > 0 || !sadeceKurusVarsaGoster) {
    if (kurus > 0) {
      words += ' ' + numberToWords(kurus) + cleanAltBirim;
    }
  }

  words = words.trim();

  if (harfTipi === 'kucuk') {
    return words.toLocaleLowerCase('tr-TR');
  } else if (harfTipi === 'baslik') {
    return words
      .split(' ')
      .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR'))
      .join(' ');
  }

  return words.toLocaleUpperCase('tr-TR');
}

export const sayiyiYaziyaCevir = amountToWordsTL;
