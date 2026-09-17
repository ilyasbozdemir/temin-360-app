import React, { useMemo, useState } from "react";
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

export function MalzemeTabloPopover(
  props: MalzemeTabloPopoverProps,
): React.JSX.Element | null {
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

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
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) {
          setActiveSubId(null);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
        >
          <ClipboardList className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span>{buttonLabelText}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-72 max-h-[80vh] overflow-y-auto p-1.5 shadow-xl rounded-2xl border-slate-200 dark:border-slate-700"
        align="end"
      >
        {hasTableActions && (
          <>
            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5 py-1">
              {props.step === 2 ? "Hızlı İşlemler" : "Tablo İşlemleri"}
            </DropdownMenuLabel>
            {tableActionItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={item.onClick}
                  onMouseEnter={() => setActiveSubId(null)}
                  onSelect={() => {
                    setActiveSubId(null);
                    if (item.onClick) item.onClick();
                  }}
                  className={`rounded-lg text-xs font-medium cursor-pointer ${item.itemClassName || ""}`}
                >
                  <ItemIcon
                    className={`w-3.5 h-3.5 mr-2 shrink-0 ${item.iconColorClass || ""}`}
                  />
                  <span className="truncate">{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {hasDocumentCategories && (
          <>
            {hasTableActions && <DropdownMenuSeparator className="my-1.5" />}

            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5 py-1">
              Yazdırma & Şablon Belgeleri
            </DropdownMenuLabel>

            {documentCategories.map((cat) => {
              const CatIcon = cat.icon;
              const isOpen = activeSubId === cat.id;

              return (
                <DropdownMenuSub
                  key={cat.id}
                  open={isOpen}
                  onOpenChange={(openState) => {
                    if (openState) {
                      setActiveSubId(cat.id);
                    } else if (activeSubId === cat.id) {
                      setActiveSubId(null);
                    }
                  }}
                >
                  <DropdownMenuSubTrigger
                    onMouseEnter={() => setActiveSubId(cat.id)}
                    className="rounded-lg text-xs font-medium px-2.5 py-2 cursor-pointer flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <CatIcon
                        className={`w-3.5 h-3.5 shrink-0 ${cat.iconColorClass || ""}`}
                      />
                      <span className="truncate">{cat.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal shrink-0 mr-1">
                      {cat.items.length}
                    </span>
                  </DropdownMenuSubTrigger>

                  <DropdownMenuSubContent
                    className="w-72 p-1.5 shadow-2xl rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    sideOffset={8}
                    alignOffset={-4}
                  >
                    <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5 py-1">
                      {cat.title}
                    </DropdownMenuLabel>

                    {cat.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={item.onClick}
                          onSelect={() => {
                            setActiveSubId(null);
                            if (item.onClick) item.onClick();
                          }}
                          className="rounded-lg text-xs font-medium cursor-pointer py-1.5 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ItemIcon
                            className={`w-3.5 h-3.5 mr-2 shrink-0 ${
                              item.iconColorClass || ""
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
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
