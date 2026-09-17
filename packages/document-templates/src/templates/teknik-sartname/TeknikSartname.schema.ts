import { z } from 'zod';

export const TeknikSartnameSchema = z.object({
  antetSatirlari: z.any().optional(),
  evrakSayisi: z.any().optional(),
  tarih: z.any().optional(),
  dosyaKonusu: z.any().optional(),
  isinAdi: z.any().optional(),
  alimTuru: z.any().optional(),
  ihtiyacKalemleri: z.any().optional(),
  kurumAdi: z.any().optional(),
  birimAdi: z.any().optional(),
  // MAL ALIMI ÖZEL ALANLARI
  malTeknikOzellikler: z.any().optional(),
  malMiktarBirim: z.any().optional(),
  malTeslimatSartlari: z.any().optional(),
  malGarantiVeMuayene: z.any().optional(),
  // HİZMET ALIMI ÖZEL ALANLARI
  hizmetKapsami: z.any().optional(),
  hizmetPersonelEkipman: z.any().optional(),
  hizmetSureVeIfa: z.any().optional(),
  hizmetDenetimKabul: z.any().optional(),
  // YAPIM İŞİ ÖZEL ALANLARI
  yapimIsTanimi: z.any().optional(),
  yapimMalzemeImalat: z.any().optional(),
  yapimUygulamaVeIsGuvenligi: z.any().optional(),
  yapimKabulVeTeslim: z.any().optional(),
  // GENEL VE DİĞER HUSUSLAR
  digerHususlar: z.any().optional(),
  // PERSONEL VE İMZA
  hazirlayanPersonelAdi: z.any().optional(),
  hazirlayanPersonelUnvan: z.any().optional(),
  onaylayanPersonelAdi: z.any().optional(),
  onaylayanPersonelUnvan: z.any().optional(),
  solLogo: z.any().optional(),
  sagLogo: z.any().optional(),
}).catchall(z.any());

export type TeknikSartnameType = z.infer<typeof TeknikSartnameSchema>;
