import { z } from "zod";

export const OdemeYazisiSchema = z.object({
  solLogo: z.string().optional(),
  sagLogo: z.string().optional(),
  kurumAdi: z.string().optional(),
  antetSatir1: z.string().optional(),
  antetSatir2: z.string().optional(),
  antetSatir3: z.string().optional(),
  antetSatirlari: z.array(z.string()).optional(),

  // Evrak kimlik
  evrakSayisi: z.string().optional(),
  dosyaTarihi: z.string().optional(),
  tarih: z.string().optional(),
  detsisNo: z.string().optional(),
  yili: z.union([z.string(), z.number()]).optional(),
  sayisi: z.union([z.string(), z.number()]).optional(),

  // Muhatap / makam
  makamAdi: z.string().optional(),
  neyimizin: z.string().optional(), // "Muhasebe Müdürlüğünüzün" gibi

  // İş konusu
  isinAdi: z.string().optional(),
  dosyaKonusu: z.string().optional(),

  // Firma ve tutar
  yukleniciFirma: z.string().optional(),
  genelToplam: z.string().optional(),
  kdvDahilToplam: z.string().optional(),
  faturaNo: z.string().optional(),
  faturaTarihi: z.string().optional(),

  // Bütçe
  harcamaKalemi: z.string().optional(),
  butceKodu: z.string().optional(),

  // İmzalayanlar
  hazirlayanPersonelAdi: z.string().optional(),
  hazirlayanPersonelUnvan: z.string().optional(),
  baskanAdi: z.string().optional(),
  baskanUnvan: z.string().optional(),

  // OLUR onayı
  olurGoster: z.boolean().optional(),
  onayTarihi: z.string().optional(),

  // Dağıtım
  dagitimListesi: z
    .array(
      z.union([
        z.string(),
        z.object({
          adSoyad: z.string().optional(),
          unvan: z.string().optional(),
        }),
      ])
    )
    .optional(),
});

export type OdemeYazisiData = z.infer<typeof OdemeYazisiSchema>;
