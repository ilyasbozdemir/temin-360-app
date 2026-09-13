import { NextRequest } from "next/server";
import { prisma } from "./prisma";

/**
 * Gelen HTTP isteğinden veya açık parametreden kurum ID'sini çözümler.
 * Sırasıyla:
 * 1. Açıkça belirtilen explicitId (query/body)
 * 2. `x-kurum-id` HTTP başlığı
 * 3. URL parametresi (`?kurumId=...`)
 * 4. Veritabanındaki ilk kayıtlı kurum (yoksa varsayılan olarak oluşturulan kurum)
 */
export async function resolveKurumId(
  req?: NextRequest | null,
  explicitId?: number | string | null,
): Promise<number> {
  // 1. Açık parametre
  if (explicitId !== undefined && explicitId !== null && explicitId !== "") {
    const parsed = parseInt(String(explicitId), 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 2. HTTP Başlığı veya URL Parametresi
  if (req) {
    const headerId = req.headers.get("x-kurum-id");
    if (headerId) {
      const parsed = parseInt(headerId, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    try {
      const url = new URL(req.url);
      const queryId = url.searchParams.get("kurumId");
      if (queryId && queryId !== "all") {
        const parsed = parseInt(queryId, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // URL ayrıştırma hatası yoksayılır
    }
  }

  // 3. Veritabanındaki ilk kurumu al veya varsayılan oluştur
  try {
    let kurum = await prisma.kurum.findFirst({
      orderBy: { id: "asc" },
    });

    if (!kurum) {
      kurum = await prisma.kurum.create({
        data: {
          kurumKodu: "TR-06-001",
          kurumAdi: "T.C. ANKARA İL SAĞLIK MÜDÜRLÜĞÜ",
          il: "Ankara",
          ilce: "Çankaya",
          vergiDairesi: "Kavaklıdere",
          vergiNo: "1234567890",
          telefon: "0312 000 00 00",
          eposta: "destek@temin360.gov.tr",
          adres: "Mithatpaşa Cad. No: 12 Kızılay / Ankara",
        },
      });
    }

    return kurum.id;
  } catch (err) {
    console.error("[resolveKurumId DB fallback error]", err);
    return 1; // Güvenli varsayılan
  }
}
