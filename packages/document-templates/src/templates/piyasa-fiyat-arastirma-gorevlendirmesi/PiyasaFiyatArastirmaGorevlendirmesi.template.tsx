import React from "react";
import { KomisyonGorevlendirmeOnayi } from "../komisyon-gorevlendirme-onayi/KomisyonGorevlendirmeOnayi.template";
import { PiyasaFiyatArastirmaGorevlendirmesiData } from "./PiyasaFiyatArastirmaGorevlendirmesi.schema";

interface Props {
  data?: Partial<PiyasaFiyatArastirmaGorevlendirmesiData> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const PiyasaFiyatArastirmaGorevlendirmesi: React.FC<Props> = (props) => {
  return <KomisyonGorevlendirmeOnayi {...props} />;
};
