import React, { useMemo } from "react";
import { ChevronDown, ClipboardList } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../../../../../components/ui/DropdownMenu";

import {
  buildDocumentCategories,
  buildTableActionItems,
  PopoverCategoryConfig,
  PopoverItemConfig,
} from "../constants/documentCategories";

export type { PopoverCategoryConfig, PopoverItemConfig };

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

export function MalzemeTabloPopover(
  props: MalzemeTabloPopoverProps,
): React.JSX.Element | null {
  const buttonLabelText = useMemo(() => {
    if (props.buttonLabel) return props.buttonLabel;
    switch (props.step) {
      case 2:
        return "Şablon & Belge İşlemleri";
      case 3:
        return "Sözleşme & Belge İşlemleri";
      case 4:
        return "Kabul & Ödeme Belgeleri";
      case 1:
      default:
        return "Tablo İşlemleri";
    }
  }, [props.buttonLabel, props.step]);

  const tableActionItems = useMemo(
    () => buildTableActionItems(props),
    [props],
  );

  const documentCategories = useMemo(
    () => buildDocumentCategories(props),
    [props],
  );

  const hasTableActions = tableActionItems.length > 0;
  const hasDocumentCategories = documentCategories.length > 0;

  if (!hasTableActions && !hasDocumentCategories) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer h-8"
        >
          <ClipboardList className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          {buttonLabelText}
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end">
        {hasTableActions && (
          <>
            <DropdownMenuLabel className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
              {props.step === 2 ? "Hızlı İşlemler" : "Tablo İşlemleri"}
            </DropdownMenuLabel>
            {tableActionItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={item.onClick}
                  onSelect={() => {
                    if (item.onClick) item.onClick();
                  }}
                  className={item.itemClassName}
                >
                  <ItemIcon
                    className={`w-3.5 h-3.5 mr-2 ${item.iconColorClass || ""}`}
                  />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {hasDocumentCategories && (
          <>
            {hasTableActions && <DropdownMenuSeparator />}

            <DropdownMenuLabel className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
              Yazdırma & Şablon Belgeleri
            </DropdownMenuLabel>

            {documentCategories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <DropdownMenuSub key={cat.id}>
                  <DropdownMenuSubTrigger>
                    <CatIcon
                      className={`w-3.5 h-3.5 mr-2 ${cat.iconColorClass || ""}`}
                    />
                    {cat.title}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    className="w-64"
                    sideOffset={6}
                    alignOffset={-4}
                  >
                    {cat.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={item.onClick}
                          onSelect={() => {
                            if (item.onClick) item.onClick();
                          }}
                        >
                          <ItemIcon
                            className={`w-3.5 h-3.5 mr-2 ${
                              item.iconColorClass || ""
                            }`}
                          />
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
