/**
 * TÜRKÇE DİL BİLGİSİ VE METİN YARDIMCILARI
 */

/**
 * İsmin yönelme durumuna (-e / -a / -ye / -ya) göre kesme işaretli ek üretir.
 * Örnek: "İlyas Bozdemir" -> "’e", "Mustafa" -> "’ya", "Ahmet" -> "’e", "Ali" -> "’ye"
 */
export function getDativeSuffix(name?: string): string {
  if (!name || typeof name !== "string") return "’a";
  const trimmed = name.split("(")[0].trim();
  if (!trimmed || trimmed.includes(".")) return "’a";

  const vowels = "aıoueiöüAIOUEİÖÜ";
  const backVowels = "aıouAIOU";

  let lastVowel = "";
  for (let i = trimmed.length - 1; i >= 0; i--) {
    const char = trimmed[i];
    if (vowels.includes(char)) {
      lastVowel = char;
      break;
    }
  }

  if (!lastVowel) return "’a";

  const lastChar = trimmed[trimmed.length - 1];
  const endsWithVowel = vowels.includes(lastChar);
  const isBack = backVowels.includes(lastVowel);

  if (isBack) {
    return endsWithVowel ? "’ya" : "’a";
  } else {
    return endsWithVowel ? "’ye" : "’e";
  }
}

/**
 * Kurum / Birim adının tamlayan (ilgi/iyelik) ekini (-in / -ın / -un / -ün / -nin / -nın vb.) türetir.
 * Örnek: "Müdürlüğü" -> "Müdürlüğünün", "Başkanlığı" -> "Başkanlığının"
 */
export function toPossessiveSuffix(str: string): string {
  if (!str) return "Kurumumuzun";
  const trimmed = str.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.endsWith("n") ||
    lower.endsWith("in") ||
    lower.endsWith("ın") ||
    lower.endsWith("un") ||
    lower.endsWith("ün")
  ) {
    return trimmed;
  }
  if (lower.endsWith("miz") || lower.endsWith("müz")) return `${trimmed}in`;
  if (lower.endsWith("mız") || lower.endsWith("muz")) return `${trimmed}ın`;
  if (
    lower.endsWith("si") ||
    lower.endsWith("su") ||
    lower.endsWith("sü") ||
    lower.endsWith("sı")
  ) {
    return `${trimmed}nin`;
  }
  if (lower.endsWith("i") || lower.endsWith("ü")) return `${trimmed}nin`;
  if (lower.endsWith("ı") || lower.endsWith("u")) return `${trimmed}nun`;
  return `${trimmed}in`;
}

/**
 * Sayısal veya metinsel tutarı Türk Lirası para birimi formatına (1.250,50) dönüştürür.
 */
export function formatCurrency(
  val: any,
  fallback = "-",
  includeSymbol = false
): string {
  if (val === undefined || val === null || val === "") return fallback;
  const suffix = includeSymbol ? " ₺" : "";

  if (typeof val === "number") {
    if (isNaN(val)) return fallback;
    return (
      val.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + suffix
    );
  }

  const str = String(val).trim();
  if (str.endsWith("₺")) {
    return includeSymbol ? str : str.replace("₺", "").trim();
  }

  const clean = str.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const num = parseFloat(clean);
  if (!isNaN(num) && clean !== "") {
    return (
      num.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + suffix
    );
  }
  return str + suffix;
}

/**
 * GG.AA.YYYY formatındaki Türkçe tarihi ISO YYYY-MM-DD formatına dönüştürür.
 */
export function toIsoDate(trDateStr?: string | null): string {
  if (!trDateStr) return new Date().toISOString().split("T")[0];
  const clean = String(trDateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return clean.split(" ")[0];
  }
  if (/^\d{2}\.\d{2}\.\d{4}/.test(clean)) {
    const [d, m, y] = clean.split(".");
    return `${y}-${m}-${d}`;
  }
  try {
    const dt = new Date(clean);
    if (!isNaN(dt.getTime())) {
      return dt.toISOString().split("T")[0];
    }
  } catch {}
  return new Date().toISOString().split("T")[0];
}

/**
 * Tarihi Türkçe GG.AA.YYYY formatına dönüştürür (String, Date veya timestamp kabul eder).
 */
export function toTrDate(isoOrStr?: any): string {
  if (!isoOrStr) return "";
  if (isoOrStr instanceof Date) {
    if (isNaN(isoOrStr.getTime())) return "";
    const d = String(isoOrStr.getDate()).padStart(2, "0");
    const m = String(isoOrStr.getMonth() + 1).padStart(2, "0");
    const y = isoOrStr.getFullYear();
    return `${d}.${m}.${y}`;
  }
  const clean = String(isoOrStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const [y, m, d] = clean.split(" ")[0].split("-");
    return `${d}.${m}.${y}`;
  }
  if (/^\d{2}\.\d{2}\.\d{4}/.test(clean)) {
    return clean;
  }
  try {
    const dt = new Date(clean);
    if (!isNaN(dt.getTime())) {
      const d = String(dt.getDate()).padStart(2, "0");
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const y = dt.getFullYear();
      return `${d}.${m}.${y}`;
    }
  } catch {}
  return clean;
}

export const formatDateTR = toTrDate;
