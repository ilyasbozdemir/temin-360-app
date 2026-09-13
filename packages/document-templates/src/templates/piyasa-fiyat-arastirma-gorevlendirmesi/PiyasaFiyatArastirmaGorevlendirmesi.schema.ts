import { z } from "zod";

export const PiyasaFiyatArastirmaGorevlendirmesiSchema = z.object({
  solLogo: z.string().optional(),
  sagLogo: z.string().optional(),
  antetSatir1: z.string().optional(),
  antetSatir2: z.string().optional(),
  antetSatir3: z.string().optional(),
  antetSatirlari: z.array(z.string()).optional(),
  kurumAdi: z.string().optional(),
  kurumumuz: z.string().optional(),
  isinAdi: z.string().optional(),
  dosyaTarihi: z.string().optional(),
  tarih: z.string().optional(),
  detsisNo: z.string().optional(),
  yili: z.union([z.string(), z.number()]).optional(),
  sayisi: z.union([z.string(), z.number()]).optional(),
  evrakSayisi: z.string().optional(),
  dosyaKonusu: z.string().optional(),
  hazirlayanPersonelAdi: z.string().optional(),
  hazirlayanPersonelUnvan: z.string().optional(),
  hazirlayanTelefon: z.string().optional(),
  onaylayanPersonelAdi: z.string().optional(),
  onaylayanPersonelUnvan: z.string().optional(),
  fiyatKomisyonu: z.array(z.any()).optional(),
  gorevliler: z
    .array(
      z.object({
        adSoyad: z.string().optional(),
        adi: z.string().optional(),
        unvan: z.string().optional(),
        unvani: z.string().optional(),
      })
    )
    .optional(),
  gorevlendirilenler: z
    .array(
      z.object({
        adSoyad: z.string().optional(),
        unvan: z.string().optional(),
      })
    )
    .optional(),
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
  kurumIci: z.boolean().optional(),
  kurumAdres: z.string().optional(),
  kurumTelefon: z.string().optional(),
  kurumFaks: z.string().optional(),
  kurumWeb: z.string().optional(),
  kurumEposta: z.string().optional(),
  kurumKep: z.string().optional(),
});

export type PiyasaFiyatArastirmaGorevlendirmesiData = z.infer<
  typeof PiyasaFiyatArastirmaGorevlendirmesiSchema
>;
