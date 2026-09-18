import { z } from "zod";

export const FiyatArastirmaMektubuSchema = z.object({
  idareAdi: z.string().optional(),
  sunulacakMakam: z.string().optional(),
  idareHitapMetni: z.string().optional(),
  isinAdi: z.string().optional(),
  gunSayisi: z.string().optional(),
  gunSayisiYazi: z.string().optional(),
  teklifSahibi: z.string().optional(),
  tebligatAdresi: z.string().optional(),
  vergiNo: z.string().optional(),
  telefonFaks: z.string().optional(),
  eposta: z.string().optional(),
  aciklama: z.string().optional(),
  kdvOrani: z.number().optional().default(20),
  komisyonUyeleri: z.array(z.object({
    adSoyad: z.string(),
    unvan: z.string(),
  })).optional(),
  ihtiyacKalemleri: z.array(z.object({
    siraNo: z.number(),
    malzemeAdi: z.string(),
    ozelligi: z.string().optional(),
    birimi: z.string().optional(),
    miktar: z.number(),
    birimFiyat: z.number().optional(),
    tutar: z.number().optional(),
  })).optional(),
});

export type FiyatArastirmaMektubuType = z.infer<typeof FiyatArastirmaMektubuSchema>;
