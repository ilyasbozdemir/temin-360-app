export interface MalzemeTabloPopoverProps {
  step?: number;
  selectedCount?: number;
  totalCount?: number;
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  onExportMasterExcel?: () => void;
  onExcelImport?: () => void;
  onKomisyonSettings?: () => void;
  onIstekliFirmaSettings?: () => void;
  onDownloadTemplate?: () => void;
  onExportToLibrary?: () => void;
  onKatalogSync?: () => void;
  // Talep & Başlangıç Belgeleri
  onIhtiyacListesi?: () => void;
  onIhtiyacTalepFormu?: () => void;
  onLuzumMuzekkeresi?: () => void;
  onLuzumMuzekkeresiOnayEki?: () => void;
  onLuzumMuzekkeresiTeslimTesellum?: () => void;
  onHarcamaTalimati?: () => void;
  onHarcamaPusulasi?: () => void;
  // Komisyon İşlemleri
  onGorevlendirmeOnayi?: () => void;
  onGorevlendirmeOnayEki?: () => void;
  onYaklasikMaliyetKomisyonu?: () => void;
  onMuayeneKabulKomisyonu?: () => void;
  onMuayeneKabulBelgesi?: () => void;
  onFiyatArastirmaKomisyonu?: () => void;
  // Fiyat Araştırma İşlemleri
  onPiyasaArastirmaGorevlendirmesi?: () => void;
  onPiyasaArastirmaTutanagi?: () => void;
  onYaklasikMaliyetHesapCetveli?: () => void;
  onSonAlimCetveli?: () => void;
  onPiyasaSonucCetveli?: () => void;
  // İstekli Firmalar & Teklif Belgeleri
  onTeklifIstemeMektubu?: () => void;
  onTeklifMektubuDagitim?: () => void;
  onTeklifMektubuKarma?: () => void;
  onFirmalarTeklifCetveli?: () => void;
  onYasaklilikSorgulama?: () => void;
  // Onay İşlemleri
  onOnayBelgesi?: () => void;
  disableDocumentGuidance?: boolean;
  buttonLabel?: string;
}

export type KomisyonType = "yaklasik_maliyet" | "muayene_kabul";

export interface KomisyonAtamaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: KomisyonType;
  activeDosyaId?: number | null;
  onOpenDocument?: (dosyaAdi: string) => void;
}

export interface KatalogSenkronizasyonModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffItems: any[];
  isLoading?: boolean;
  onApplyUpdates: (selectedDiffs: any[]) => Promise<void>;
}

export interface HizliKalemRow {
  id: string;
  kalem_adi: string;
  miktar: number;
  birim: string;
  tasinir_kodu?: string;
  okas_kodu?: string;
  kdv_orani?: number;
  aciklama?: string;
  tipi?: string;
}

export interface HizliTopluKalemGridProps {
  activeDosya?: any;
  activeDosyaId?: number | null;
  units?: any[];
  onSaveBatch: (
    commonData: {
      tipi: string;
      okas_kodu?: string;
      tasinir_kodu_prefix?: string;
      kdv_orani: number;
      birim: string;
    },
    rows: HizliKalemRow[],
  ) => Promise<boolean>;
  onCancel?: () => void;
  isModal?: boolean;
}

export interface MalzemeEkleModalProps {
  state: any;
  activeDosya?: any;
}
