import { z } from "zod";
import { BaseDocumentSchema } from "../../base.schema";

export const DogrudanTeminOnayBelgesiSchema = BaseDocumentSchema.extend({
  teminNo: z.string().optional().describe("Doğrudan Temin Numarası"),
  idareAdi: z.string().optional().describe("İdare Adı"),
  dosyaTarihi: z.string().optional().describe("Belge Tarihi"),
  evrakSayisi: z.string().optional().describe("Evrak Sayısı"),
  isAdi: z.string().optional().describe("İşin Adı"),
  teminSekli: z.string().optional().describe("Temin Şekli"),
  alimTuru: z.string().optional().describe("Alım Türü"),
  yaklasikMaliyet: z.union([z.number(), z.string()]).optional().describe("Yaklaşık Maliyet"),
  odenekTutari: z.union([z.number(), z.string()]).optional().describe("Kullanılabilir Ödenek Tutarı"),
  projeNo: z.string().optional().describe("Yatırım Proje Numarası"),
  butceTertibi: z.array(z.string()).optional().describe("Bütçe Tertibi"),
  avansSartlari: z.string().optional().describe("Avans Verilecekse Şartları"),
  fiyatFarkiSartlari: z.string().optional().describe("Fiyat Farkı Verilecekse Şartları"),
  dokumanHazirlik: z.string().optional().describe("Doküman Hazırlanıp Hazırlanmayacağı"),
  isinAciklamasi: z.string().optional().describe("Doğrudan Temin ile İlgili Diğer Açıklamalar"),
  hazirlayanPersonelAdi: z.string().optional().describe("Hazırlayan Personel Adı"),
  hazirlayanPersonelUnvan: z.string().optional().describe("Hazırlayan Personel Unvanı"),
  onaylayanPersonelAdi: z.string().optional().describe("Harcama Yetkilisi Adı"),
  onaylayanPersonelUnvan: z.string().optional().describe("Harcama Yetkilisi Unvanı"),
  ekler: z.array(z.string()).optional().describe("Ekler Listesi"),
});

export type DogrudanTeminOnayBelgesiType = z.infer<typeof DogrudanTeminOnayBelgesiSchema>;
