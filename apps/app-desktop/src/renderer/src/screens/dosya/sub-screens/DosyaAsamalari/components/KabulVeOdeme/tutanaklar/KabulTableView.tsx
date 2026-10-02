import React from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Filter,
  MapPin,
  MessageSquareText,
  Plus,
  Receipt,
  Truck,
  UserCheck,
} from "lucide-react";
import { Button } from "../../../../../../../components/ui/Button";
import { KabulTutanakItem, KomisyonUye } from "../types";
import { KabulDurumBadge } from "./KabulDurumBadge";
import { TutanakRowActionsMenu } from "./TutanakRowActionsMenu";

interface KabulTableViewProps {
  tutanaklar: KabulTutanakItem[];
  filteredTutanaklar: KabulTutanakItem[];
  selectedIds: Set<string>;
  effectiveFirma: string;
  effectiveTeklifTutar: number;
  effectiveTeslimAlan: string;
  effectiveTeslimYeri: string;
  faturaNo?: string;
  faturaTarihi?: string;
  irsaliyeNo?: string;
  irsaliyeTarihi?: string;
  primarySablonKey: string;
  isMal: boolean;
  hasKomisyon: boolean;
  komisyonUyeleri: KomisyonUye[];
  formatDate: (dateStr: string | null) => string;
  formatCurrency: (val: number | null) => string;
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onResetFilter: () => void;
  onOpenPreview?: (sablonKey: string, tutanak?: KabulTutanakItem) => void;
  onToggleApproveTutanak?: (id: string) => void;
  onEditTutanak?: (tutanak: KabulTutanakItem) => void;
  onDeleteTutanak?: (id: string) => void;
  onOpenTifModal?: () => void;
  onOpenAddTutanak?: () => void;
}

export function KabulTableView({
  tutanaklar,
  filteredTutanaklar,
  selectedIds,
  effectiveFirma,
  effectiveTeklifTutar,
  effectiveTeslimAlan,
  effectiveTeslimYeri,
  faturaNo = "",
  faturaTarihi = "",
  irsaliyeNo = "",
  irsaliyeTarihi = "",
  primarySablonKey,
  isMal,
  hasKomisyon,
  komisyonUyeleri,
  formatDate,
  formatCurrency,
  onToggleSelectAll,
  onToggleSelectOne,
  onResetFilter,
  onOpenPreview,
  onToggleApproveTutanak,
  onEditTutanak,
  onDeleteTutanak,
  onOpenTifModal,
  onOpenAddTutanak,
}: KabulTableViewProps): React.JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-3 w-10 text-center">
              <input
                type="checkbox"
                checked={
                  selectedIds.size === filteredTutanaklar.length &&
                  filteredTutanaklar.length > 0
                }
                onChange={onToggleSelectAll}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                title="Tümünü Seç / Kaldır"
              />
            </th>
            <th className="py-3 px-4">Tutanak No &amp; Tarih</th>
            <th className="py-3 px-4">Yüklenici Firma</th>
            <th className="py-3 px-4">Fatura &amp; İrsaliye</th>
            <th className="py-3 px-4">Teslim Yeri &amp; Heyet</th>
            <th className="py-3 px-4">Muayene Kararı &amp; Not</th>
            <th className="py-3 px-4 text-right">Tutar (₺)</th>
            <th className="py-3 px-4 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredTutanaklar.length > 0 ? (
            filteredTutanaklar.map((tut) => {
              const rowFaturaNo = tut.faturaNo || faturaNo;
              const rowFaturaTarihi = tut.faturaTarihi || faturaTarihi;
              const rowIrsaliyeNo = tut.irsaliyeNo || irsaliyeNo;
              const rowIrsaliyeTarihi = tut.irsaliyeTarihi || irsaliyeTarihi;

              return (
                <tr
                  key={tut.id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    selectedIds.has(tut.id)
                      ? "bg-blue-50/40 dark:bg-blue-950/20"
                      : ""
                  }`}
                >
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(tut.id)}
                      onChange={() => onToggleSelectOne(tut.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                    />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    <div className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {tut.tutanakNo}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(tut.tutanakTarihi)}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span
                        className="truncate max-w-48"
                        title={effectiveFirma}
                      >
                        {effectiveFirma}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex flex-col gap-1">
                      {/* Fatura Bilgisi */}
                      {rowFaturaNo ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Receipt className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                            {rowFaturaNo}
                          </span>
                          {rowFaturaTarihi && (
                            <span className="text-[10px] text-slate-400">
                              ({formatDate(rowFaturaTarihi)})
                            </span>
                          )}
                        </div>
                      ) : null}

                      {/* İrsaliye Bilgisi */}
                      {rowIrsaliyeNo ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">
                            İrs: {rowIrsaliyeNo}
                          </span>
                          {rowIrsaliyeTarihi && (
                            <span className="text-[10px] text-slate-400">
                              ({formatDate(rowIrsaliyeTarihi)})
                            </span>
                          )}
                        </div>
                      ) : null}

                      {!rowFaturaNo && !rowIrsaliyeNo && (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate max-w-40 font-medium">
                        {tut.teslimYeri || effectiveTeslimYeri}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block ml-5 truncate max-w-40">
                      {tut.teslimAlan || effectiveTeslimAlan}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <KabulDurumBadge
                      durum={tut.durum}
                      onaylandi={tut.onaylandi}
                    />
                    {tut.notlar && (
                      <div
                        className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300 mt-1 max-w-44 bg-slate-50 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60"
                        title={tut.notlar}
                      >
                        <MessageSquareText className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{tut.notlar}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {tut.tutar
                      ? formatCurrency(tut.tutar)
                      : formatCurrency(effectiveTeklifTutar)}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 relative">
                      {onToggleApproveTutanak && tut.onaylandi === false && (
                        <Button
                          onClick={() => onToggleApproveTutanak(tut.id)}
                          size="sm"
                          className="h-8 px-2.5 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                          title="Tutanağı Onayla ve İşleme Al (Stok/Teslimat Düşümü Yap)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Onayla &amp; İşle</span>
                        </Button>
                      )}

                      <Button
                        onClick={() => onOpenPreview?.(primarySablonKey, tut)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 cursor-pointer"
                        title="Tutanağı Görüntüle ve Yazdır"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tutanağı Aç</span>
                      </Button>

                      <TutanakRowActionsMenu
                        tut={tut}
                        primarySablonKey={primarySablonKey}
                        isMal={isMal}
                        onOpenPreview={onOpenPreview}
                        onToggleApproveTutanak={onToggleApproveTutanak}
                        onEditTutanak={onEditTutanak}
                        onDeleteTutanak={onDeleteTutanak}
                        onOpenTifModal={onOpenTifModal}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          ) : tutanaklar.length > 0 ? (
            <tr>
              <td colSpan={8} className="py-10 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Filter className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium">
                    Seçilen filtreye uygun tutanak bulunamadı.
                  </p>
                  <button
                    type="button"
                    onClick={onResetFilter}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Tüm tutanakları göster ({tutanaklar.length})
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-3.5 px-3 text-center text-slate-400">1</td>
              <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {formatDate(
                      faturaTarihi || new Date().toISOString().slice(0, 10),
                    )}
                  </span>
                </div>
              </td>

              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate max-w-48" title={effectiveFirma}>
                    {effectiveFirma}
                  </span>
                </div>
              </td>

              <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {faturaNo ? (
                  <div className="flex items-center gap-1 text-[11px]">
                    <Receipt className="w-3 h-3 text-emerald-600" />
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                      {faturaNo}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-[11px]">—</span>
                )}
              </td>

              <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span
                    className="truncate max-w-40 font-semibold"
                    title={effectiveTeslimAlan}
                  >
                    {effectiveTeslimAlan}
                  </span>
                </div>
                {hasKomisyon && (
                  <span className="text-[10px] text-indigo-500 block ml-5">
                    {komisyonUyeleri.length} Kişilik Heyet
                  </span>
                )}
              </td>

              <td className="py-3.5 px-4 whitespace-nowrap">
                <KabulDurumBadge durum="kabul" />
              </td>

              <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                {formatCurrency(effectiveTeklifTutar)}
              </td>

              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    onClick={() => onOpenPreview?.(primarySablonKey)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tutanağı Aç</span>
                  </Button>
                  <Button
                    onClick={onOpenAddTutanak}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Özelleştir
                  </Button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
