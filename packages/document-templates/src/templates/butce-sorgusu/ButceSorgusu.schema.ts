import { z } from "zod";
import { BaseDocumentSchema } from "../../base.schema";

export const ButceSorgusuSchema = BaseDocumentSchema.extend({
  muhatapBirim: z.string().optional().describe("Muhatap Birim / Daire"),
  isAdi: z.string().optional().describe("İşin Adı"),
  butceYili: z.union([z.number(), z.string()]).optional().describe("Bütçe Yılı"),
  butceTertibi: z.array(z.string()).optional().describe("Bütçe Tertibi"),
  kullanilabilirOdenek: z.union([z.number(), z.string()]).optional().describe("Kullanılabilir Ödenek"),
  harcamaYetkilisiAdi: z.string().optional().describe("Harcama Yetkilisi Adı"),
  harcamaYetkilisiUnvan: z.string().optional().describe("Harcama Yetkilisi Unvanı"),
  onaylayanPersonelAdi: z.string().optional().describe("Onaylayan Personel Adı"),
  onaylayanPersonelUnvan: z.string().optional().describe("Onaylayan Personel Unvanı"),
  baskanAdi: z.string().optional().describe("Başkan / Yetkili Adı"),
  baskanUnvan: z.string().optional().describe("Başkan / Yetkili Unvanı"),
  hazirlayanPersonelAdi: z.string().optional().describe("Hazırlayan Personel Adı"),
  hazirlayanPersonelUnvan: z.string().optional().describe("Hazırlayan Personel Unvanı"),
});

export type ButceSorgusuType = z.infer<typeof ButceSorgusuSchema>;
