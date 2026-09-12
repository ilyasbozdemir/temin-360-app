import { z } from 'zod';

export const LuzumMuzekkeresiSchema = z.object({
  antetSatirlari: z.any().optional(),
  evrakSayisi: z.any().optional(),
  dosyaKonusu: z.any().optional(),
  maddeNo: z.any().optional(),
  tarih: z.any().optional(),
  onayaSunulanTarih: z.any().optional(),
  onayTarihi: z.any().optional(),
  dosyaTarihi: z.any().optional(),
  onaylayanPersonelAdi: z.any().optional(),
  onaylayanPersonelUnvan: z.any().optional(),
  hazirlayanPersonelAdi: z.any().optional(),
  hazirlayanPersonelUnvan: z.any().optional(),
  hazirlayanTelefon: z.any().optional(),
  hazirlayanEposta: z.any().optional(),
  talepEdenPersonelAdi: z.any().optional(),
  talepEdenPersonelUnvan: z.any().optional(),
  sunulacakMakamAdi: z.any().optional(),
  ihtiyacYeri: z.any().optional(),
  ihtiyacKalemleri: z.any().optional(),
  olurBaslik: z.any().optional(),
  solLogo: z.any().optional(),
  sagLogo: z.any().optional(),
  kurumIci: z.any().optional(),
  isinAciklamasi: z.any().optional(),
  aciklamaMaddeleri: z.any().optional(),
  hasAciklamaMaddeleri: z.any().optional(),
  olurYazisi: z.any().optional(),
}).catchall(z.any());

export type LuzumMuzekkeresiType = z.infer<typeof LuzumMuzekkeresiSchema>;
