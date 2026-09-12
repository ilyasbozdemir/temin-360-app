import { NextResponse } from "next/server";
import { recordRequest } from "@/lib/metrics";

export async function GET() {
  const startTime = Date.now();
  const documents = [
    {
      id: 1,
      name: "HARCAMA TALİMATI",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
    {
      id: 2,
      name: "Lüzum Müzekkeresi",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
    {
      id: 3,
      name: "İHTİYAÇ LİSTESİ",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
    {
      id: 4,
      name: "KOMİSYON GÖREVLENDİRME ONAYI",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
    {
      id: 5,
      name: "SON ALIM FİYAT CETVELİ",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
  ];

  const duration = Date.now() - startTime;
  recordRequest("GET", "/api/documents", 200, Math.max(duration, 8));

  return NextResponse.json({
    success: true,
    count: documents.length,
    data: documents,
    serverTime: new Date().toISOString(),
  });
}

