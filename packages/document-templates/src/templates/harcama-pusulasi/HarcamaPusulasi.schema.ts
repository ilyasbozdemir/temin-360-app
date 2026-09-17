import { z } from "zod";
import { BaseTemplateSchema } from "../../base.schema";

export const HarcamaPusulasiSchema = BaseTemplateSchema.extend({
  evrakSayisi: z.string().optional(),
  tarih: z.string().optional(),
  idareAdi: z.string().optional(),
  alimTuru: z.string().optional(),
  isAdi: z.string().optional(),
  miktar: z.string().optional(),
  birimFiyat: z.union([z.string(), z.number()]).optional(),
  tutar: z.union([z.string(), z.number()]).optional(),
  tutarYazi: z.string().optional(),
  aciklama: z.string().optional(),
  saticiTcNo: z.string().optional(),
  saticiAdiSoyadi: z.string().optional(),
  saticiAdres: z.string().optional(),
  onaylayanPersonelAdi: z.string().optional(),
  onaylayanPersonelUnvan: z.string().optional(),
  ihtiyacKalemleri: z.array(z.any()).optional(),
});

export type HarcamaPusulasiType = z.infer<typeof HarcamaPusulasiSchema>;
