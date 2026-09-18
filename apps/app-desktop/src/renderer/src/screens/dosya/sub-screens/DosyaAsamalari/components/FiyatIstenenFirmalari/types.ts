import React from "react";

export const MIN_FIRMS = 2;
export const MAX_FIRMS = 3;

export interface Firma {
  id: number;
  firma_no?: string;
  unvan: string;
  telefon?: string;
  faks?: string;
  email?: string;
  semt?: string;
  sehir?: string;
  vergi_no?: string;
  isAdded?: boolean;
  temin_firma_id?: number;
  unvanKullan?: boolean;
  [key: string]: unknown;
}

export interface FirmaColumn {
  key: string;
  label: string;
  className?: string;
  render?: (firma: Firma) => React.ReactNode;
}

export interface FiyatIstenenFirmalarınSecilmesiProps {
  title?: string;
  firms: Firma[];
  columns: FirmaColumn[];
  onFirmaEkle: (firma: Firma) => void;
  onCreateNewFirm?: (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => Promise<void>;
  onFirmaCikar?: (firma: Firma) => void;
  onFiyatGir?: () => void;
  onFiyatPiyasaFormu?: (firma?: Firma) => void;
  onBirimFiyatArastirmasi?: (firma?: Firma) => void;
  onEkapSorgula?: (firma?: Firma) => void;
  onDagitimMektubu?: () => void;
  onKarmaDagitimMektubu?: () => void;
  onBosTeklifCetveli?: (firma?: Firma) => void;
  onYasaklilikTutanagi?: () => void;
  onUnvanKullanToggle?: (firma: Firma, value: boolean) => void;
  onOpenFirmaSecmeModali?: () => void;
  extraHeaderAction?: React.ReactNode;
  winnerFirmaId?: number | null;
  onSetWinnerFirma?: (firma: Firma) => void;
}
