import { z } from 'zod';

export const TasinirKayitYetkilisiGorusuSchema = z.object({
  antetSatirlari: z.any().optional(),
  evrakSayisi: z.any().optional(),
  tarih: z.any().optional(),
  talepTarihi: z.any().optional(),
  talepEdenBirimAdi: z.any().optional(),
  birim_adi: z.any().optional(),
  mudurluk: z.any().optional(),
  harcamaBirimAdi: z.any().optional(),
  konu: z.any().optional(),
  ilgi: z.any().optional(),
  ihtiyacKalemleri: z.any().optional(),
  gorus: z.any().optional(),
  tasinirKayitYetkilisiAdi: z.any().optional(),
  tasinirKayitYetkilisiUnvan: z.any().optional(),
  hazirlayanPersonelAdi: z.any().optional(),
  hazirlayanPersonelUnvan: z.any().optional(),
  kurumAdi: z.any().optional(),
  solLogo: z.any().optional(),
  sagLogo: z.any().optional(),
}).catchall(z.any());

export type TasinirKayitYetkilisiGorusuType = z.infer<typeof TasinirKayitYetkilisiGorusuSchema>;
