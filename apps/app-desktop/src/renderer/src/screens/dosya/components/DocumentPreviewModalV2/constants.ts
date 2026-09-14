import { TemplateComponentType } from "@temin360/document-templates";
import * as Templates from "@temin360/document-templates";

export const V2_TEMPLATES_MAP: Record<string, TemplateComponentType> = {
  IhtiyacListesi: Templates.IhtiyacListesi as TemplateComponentType,
  IhtiyacTalepFormu: Templates.IhtiyacTalepFormu as TemplateComponentType,
  LuzumMuzekkeresi: Templates.LuzumMuzekkeresi as TemplateComponentType,
  LuzumMuzekkeresiOnayEki: Templates
    .LuzumMuzekkeresiOnayEki as TemplateComponentType,
  LuzumMuzekkeresiTeslimTesellum: Templates
    .LuzumMuzekkeresiTeslimTesellum as TemplateComponentType,
  HarcamaTalimati: Templates.HarcamaTalimati as TemplateComponentType,
  KomisyonGorevlendirmeOnayi: Templates
    .KomisyonGorevlendirmeOnayi as TemplateComponentType,
  KomisyonGorevlendirmeOnayiEki: Templates
    .KomisyonGorevlendirmeOnayiEki as TemplateComponentType,
  HarcamaPusulasi: Templates.HarcamaPusulasi as TemplateComponentType,
  FiyatArastirmaMektubu: Templates.FiyatArastirmaMektubu as TemplateComponentType,
  BirimFiyatTeklifMektubu: Templates.BirimFiyatTeklifMektubu as TemplateComponentType,
  ArastirmaMektubu: Templates.ArastirmaMektubu as TemplateComponentType,
  PiyasaFiyatArastirmaTutanagi: Templates.PiyasaFiyatArastirmaTutanagi as TemplateComponentType,
  PiyasaFiyatArastirmaGorevlendirmesi: Templates.PiyasaFiyatArastirmaGorevlendirmesi as TemplateComponentType,
  YaklasikMaliyetCetveli: Templates.YaklasikMaliyetCetveli as TemplateComponentType,
  KabulEdilenTeklif: Templates.KabulEdilenTeklif as TemplateComponentType,
  DogrudanTeminSonucOnayBelgesi: Templates.DogrudanTeminSonucOnayBelgesi as TemplateComponentType,
  DogrudanTeminSozlesmesi: Templates.DogrudanTeminSozlesmesi as TemplateComponentType,
  SozlesmeyeDavet: Templates.SozlesmeyeDavet as TemplateComponentType,
  MuayeneKabulKomisyonu: Templates.MuayeneKabulKomisyonu as TemplateComponentType,
  SonAlimFiyatCetveli: Templates.SonAlimFiyatCetveli as TemplateComponentType,
};
