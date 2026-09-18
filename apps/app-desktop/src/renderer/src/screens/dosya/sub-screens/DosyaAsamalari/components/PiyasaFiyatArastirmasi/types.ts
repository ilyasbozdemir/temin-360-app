import { PoolFirm } from "../../hooks/usePiyasaFiyatArastirmasi";

export interface PiyasaFiyatArastirmasiDashboardProps {
  setIsFormOpen: (val: boolean) => void;
  handleNewDocument: (mode: "maliyet" | "tutanak") => void;
  dashboardViewMode: "documents" | "prices";
  setDashboardViewMode: (val: "documents" | "prices") => void;
  stageDocs: any[];
  docViewMode: "grid" | "list" | "table";
  changeDocViewMode: (mode: "grid" | "list" | "table") => void;
  stageSablons: any[];
  sablons: any[];
  activeStarredDocs: any[];
  ciktiLoading: boolean;
  handleOpenPreviewForSablon: any;
  quickPrint: any;
  quickExport: any;
  quickOpenExternal: any;
  isSablonDisabled: (sablon: any) => boolean;
  disableDocumentGuidance: boolean;
  invitedFirms: any[];
  allPoolFirms?: PoolFirm[];
  handleAddSingleFirm?: (firma: PoolFirm) => void;
  handleCreateNewFirm?: (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => Promise<void>;
  handleRemoveFirm?: (id: number) => void;
  items: any[];
  bids: any;
  setActiveFormTab: (tab: "firms" | "matrix") => void;
  activeActionDropdown: string | null;
  setActiveActionDropdown: (val: string | null) => void;
  handleUpdateDocumentDate: (
    docId: number,
    newDate: string,
    docName: string,
  ) => void;
  setIsFirmModalOpen?: (val: boolean) => void;
  handleDeleteDocument?: (id: number) => void;
  handleSaveToDosya?: (docType?: "maliyet" | "tutanak" | "save_only") => void;
  getEstimatedCostTotal?: () => number;
  manualWinnerFirmaId?: number | null;
  handleSetWinnerFirma?: (firmaMasterId: number | null) => Promise<void>;
  lowestTotalFirmaId?: number | null;
}
