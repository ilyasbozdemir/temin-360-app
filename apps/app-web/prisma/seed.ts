import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Veritabanı tohumlama (seed) başlatılıyor...");

  // 1. Varsayılan API Anahtarı
  const defaultKey = "dta_live_8e4a90f1b2c3d4e59071f";
  await prisma.apiKey.upsert({
    where: { key: defaultKey },
    update: {},
    create: {
      key: defaultKey,
      name: "Masaüstü & Web İstemci (Varsayılan)",
      scope: "admin",
      aktif: true,
    },
  });
  console.log("✓ Varsayılan API Anahtarı doğrulandı.");

  // 2. Varsayılan Kurum
  let kurum = await prisma.kurum.findFirst();
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
    console.log("✓ Varsayılan Kurum oluşturuldu:", kurum.kurumAdi);
  }

  // 3. Varsayılan Birim
  let birim = await prisma.birim.findFirst({ where: { kurumId: kurum.id } });
  if (!birim) {
    birim = await prisma.birim.create({
      data: {
        kurumId: kurum.id,
        birimAdi: "Satınalma ve İhale Şube Müdürlüğü",
        kod: "SATIN-01",
      },
    });
    console.log("✓ Varsayılan Birim oluşturuldu:", birim.birimAdi);
  }

  // 4. Varsayılan Personel
  const personellerCount = await prisma.personel.count();
  if (personellerCount === 0) {
    await prisma.personel.createMany({
      data: [
        {
          kurumId: kurum.id,
          adSoyad: "Ahmet Yılmaz",
          unvan: "Harcama Yetkilisi",
          gorev: "Şube Müdürü",
          eposta: "ahmet.yilmaz@saglik.gov.tr",
        },
        {
          kurumId: kurum.id,
          adSoyad: "Mehmet Demir",
          unvan: "Gerçekleştirme Görevlisi",
          gorev: "Mühendis",
          eposta: "mehmet.demir@saglik.gov.tr",
        },
        {
          kurumId: kurum.id,
          adSoyad: "Ayşe Kaya",
          unvan: "Satınalma Memuru",
          gorev: "V.H.K.İ.",
          eposta: "ayse.kaya@saglik.gov.tr",
        },
      ],
    });
    console.log("✓ Örnek personeller oluşturuldu.");
  }

  // 5. Varsayılan Firma
  const firmalarCount = await prisma.firma.count();
  if (firmalarCount === 0) {
    await prisma.firma.createMany({
      data: [
        {
          unvan: "Anadolu Medikal ve Laboratuvar Tic. Ltd. Şti.",
          vergiNo: "0680123456",
          vergiDairesi: "Çankaya",
          telefon: "0312 444 01 02",
          eposta: "info@anadolumedikal.com.tr",
          yetkili: "Ali Çelik",
          il: "Ankara",
          ilce: "Çankaya",
        },
        {
          unvan: "Başkent Bilgisayar ve Büro Sistemleri A.Ş.",
          vergiNo: "0690987654",
          vergiDairesi: "Ulus",
          telefon: "0312 310 20 30",
          eposta: "satis@baskentbilgisayar.com.tr",
          yetkili: "Zeynep Öztürk",
          il: "Ankara",
          ilce: "Altındağ",
        },
      ],
    });
    console.log("✓ Örnek firmalar oluşturuldu.");
  }

  // 6. Örnek Başlangıç Dosyası
  const dosyalarCount = await prisma.teminDosyasi.count();
  if (dosyalarCount === 0) {
    const dosya = await prisma.teminDosyasi.create({
      data: {
        kurumId: kurum.id,
        birimId: birim.id,
        dosyaNo: "2026/DT-001",
        isAdi: "Medikal Sarf Malzeme ve Cerrahi Eldiven Alımı",
        alimTuru: "mal",
        usul: "22_d",
        durum: "aktif",
        yil: 2026,
        yaklasikMaliyet: 84500.0,
        sozlesmeBedeli: 79200.0,
        harcamaYetkilisi: "Ahmet Yılmaz",
        gerceklestirmeGorevli: "Mehmet Demir",
        piyasaArastirmaGorevli: "Ayşe Kaya",
        kalemler: {
          create: [
            {
              siraNo: 1,
              malzemeAdi: "Pudra İçermeyen Nitril Muayene Eldiveni (M Beden)",
              miktar: 250,
              birim: "Kutu",
              yaklasikBirimFiyat: 180.0,
              yaklasikToplam: 45000.0,
              tasinirKodu: "150.01.02.04",
            },
            {
              siraNo: 2,
              malzemeAdi: "Cerrahi Maske (3 Katlı, Telli, Tip IIR)",
              miktar: 500,
              birim: "Kutu",
              yaklasikBirimFiyat: 79.0,
              yaklasikToplam: 39500.0,
              tasinirKodu: "150.01.02.05",
            },
          ],
        },
      },
    });
    console.log("✓ Örnek doğrudan temin dosyası oluşturuldu:", dosya.dosyaNo);
  }

  console.log("✅ Tohumlama (seed) başarıyla tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Tohumlama hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
