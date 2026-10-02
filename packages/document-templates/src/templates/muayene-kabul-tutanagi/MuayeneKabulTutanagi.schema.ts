import { z } from "zod";

export const MuayeneKabulTutanagiItemSchema = z.object({
  siraNo: z.union([z.number(), z.string()]).optional(),
  kodu: z.string().optional(),
  malzemeAdi: z.string().optional(),
  ozelligi: z.string().optional(),
  birimi: z.string().optional(),
  miktar: z.union([z.number(), z.string()]).optional(),
  buguneKadarKabulEdilen: z.union([z.number(), z.string()]).optional(),
  bugunKabulEdilenMiktar: z.union([z.number(), z.string()]).optional(),
  kalanMiktar: z.union([z.number(), z.string()]).optional(),
  teslimYeri: z.string().optional(),
  birimFiyat: z.union([z.number(), z.string()]).optional(),
  birimFiyati: z.string().optional(),
  kalemTutari: z.string().optional(),
});

export const MuayeneKabulTutanagiSchema = z.object({
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
  kabulTarihi: z.string().optional(),
  isinAdi: z.string().optional(),
  dosyaKonusu: z.string().optional(),

  // Kalemler
  ihtiyacKalemleri: z.array(MuayeneKabulTutanagiItemSchema).optional(),

  // Tutanak notu
  tutanakNotu: z.string().optional(),

  // Fatura & Firma
  yukleniciFirma: z.string().optional(),
  faturaNo: z.string().optional(),
  faturaTarihi: z.string().optional(),
  irsaliyeNo: z.string().optional(),
  irsaliyeTarihi: z.string().optional(),
  genelToplam: z.string().optional(),
  kdvDahilToplam: z.string().optional(),
  tutar: z.string().optional(),

  // Komisyon
  muayeneKomisyonu: z
    .array(
      z.object({
        gorevi: z.string().optional(),
        adSoyad: z.string().optional(),
        unvan: z.string().optional(),
      })
    )
    .optional(),

  onaylayanlar: z
    .array(
      z.object({
        onaylayanPersonelAdi: z.string().optional(),
        onaylayanPersonelUnvan: z.string().optional(),
      })
    )
    .optional(),

  // OLUR
  olurGoster: z.boolean().optional(),
  baskanAdi: z.string().optional(),
  baskanUnvan: z.string().optional(),
});

export type MuayeneKabulTutanagiData = z.infer<
  typeof MuayeneKabulTutanagiSchema
>;
