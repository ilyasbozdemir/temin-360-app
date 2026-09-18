import { Personel } from "../../types";

export interface UseDocumentPreviewDataParams {
  isOpen: boolean;
  documentId: string | null;
  dosyaId?: number | null;
  invitedFirms?: any[];
}

export interface LoadPreviewDataParams {
  activeDosyaId: number;
  resolvedId: string;
  selectedDocId: string;
  propInvitedFirms?: any[];
  showLogoLeft: boolean;
  showLogoRight: boolean;
  logoLeft: string | null;
  logoRight: string | null;
  institutionLogo: string | null;
  subInstitutionType?: string;
  customSubInstitutionLabel?: string;
  customSubInstitutionKurumumuz?: string;
  customSubInstitutionKurumu?: string;
  customSubInstitutionKurumlari?: string;
}

export interface LoadPreviewDataResult {
  finalData: Record<string, any>;
  personelListesi: Personel[];
  firmaListesi: any[];
  dosyaRecord: any;
  activeLogoLeft: boolean;
  activeLogoRight: boolean;
  activeOrientation: "portrait" | "landscape";
  initialSnapshotJson: string;
}
