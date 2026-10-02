import React, { useState } from "react";
import {
  defaultFormatCurrency,
  defaultFormatDate,
  KabulBatchActionsBar,
  KabulCardFooter,
  KabulCardHeader,
  KabulFilterBar,
  KabulGridView,
  KabulHizliEkleModal,
  KabulListView,
  KabulTableView,
  KabulTutanagi,
  KabulTutanaklariListCardProps,
  KomisyonHeyetiBar,
  MalKalemi,
  TutanakTipi,
} from "./tutanaklar";

export type {
  KabulTutanagi,
  KabulTutanaklariListCardProps,
  MalKalemi,
  TutanakTipi,
};

export function KabulTutanaklariListCard({
  firma,
  kazananFirmaUnvan,
  kabulEdilenTeklif,
  firmaStats,
  faturaNo = "",
  faturaTarihi = "",
  irsaliyeNo = "",
  irsaliyeTarihi = "",
  komisyonBaskani = "",
  komisyonUyeleri = [],
  teslimYeri = "",
  dosyaNo,
  alimTuru = "mal",
  tutanaklar = [],
  baslangicTutanaklari = [],
  varsayilanTeslimAlan = "",
  varsayilanTeslimYeri = "",
  onOpenAddTutanak,
  onEditTutanak,
  onDeleteTutanak,
  onBulkDeleteTutanaklar,
  onToggleApproveTutanak,
  onBulkApproveTutanaklar,
  onOpenPreview,
  onOpenTifModal,
  onOpenKomisyonModal,
  formatDate = defaultFormatDate,
  formatCurrency = defaultFormatCurrency,
}: KabulTutanaklariListCardProps): React.JSX.Element {
  const [viewMode, setViewMode] = useState<"table" | "list" | "grid">("table");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formTipi, setFormTipi] = useState<TutanakTipi | null>(null);

  const approvedCount = tutanaklar.filter((t) => (t.onaylandi ?? true)).length;
  const pendingCount = tutanaklar.filter((t) => t.onaylandi === false).length;

  const filteredTutanaklar = tutanaklar.filter((tut) => {
    const isApproved = tut.onaylandi ?? true;
    if (filterStatus === "approved") return isApproved;
    if (filterStatus === "pending") return !isApproved;
    return true;
  });

  const handleToggleSelectAll = (): void => {
    if (
      selectedIds.size === filteredTutanaklar.length &&
      filteredTutanaklar.length > 0
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTutanaklar.map((t) => t.id)));
    }
  };

  const handleToggleSelectOne = (id: string): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = (): void => {
    if (selectedIds.size === 0) return;
    if (
      window.confirm(
        `Seçilen ${selectedIds.size} adet tutanağı silmek istediğinizden emin misiniz?`,
      )
    ) {
      if (onBulkDeleteTutanaklar) {
        onBulkDeleteTutanaklar(Array.from(selectedIds));
      } else if (onDeleteTutanak) {
        selectedIds.forEach((id) => onDeleteTutanak(id));
      }
      setSelectedIds(new Set());
    }
  };

  const handleBulkApprove = (): void => {
    if (selectedIds.size === 0) return;
    if (onBulkApproveTutanaklar) {
      onBulkApproveTutanaklar(Array.from(selectedIds), true);
      setSelectedIds(new Set());
    }
  };

  const effectiveFirma =
    kazananFirmaUnvan || firma || "İstekli Yüklenici Firma";
  const effectiveTeklifTutar =
    kabulEdilenTeklif ?? firmaStats?.teklifToplami ?? 0;
  const effectiveTeslimAlan =
    komisyonBaskani || varsayilanTeslimAlan || "Muayene & Kabul Komisyonu";
  const effectiveTeslimYeri =
    teslimYeri || varsayilanTeslimYeri || "Kurum Ambarı / İhtiyaç Yeri";

  const rawAlimTuru = String(
    alimTuru || firmaStats?.alimTuru || "mal",
  ).toLowerCase();
  const isYapim =
    rawAlimTuru.includes("yapim") ||
    rawAlimTuru.includes("inşaat") ||
    rawAlimTuru.includes("insaat");
  const isHizmet =
    !isYapim &&
    (rawAlimTuru.includes("hizmet") || rawAlimTuru.includes("danismanlik"));
  const isMal = !isYapim && !isHizmet;

  const alimTuruEtiketi = isYapim
    ? "Yapım İşi"
    : isHizmet
    ? "Hizmet Alımı"
    : "Mal Alımı";
  const alimTuruKisa = isYapim ? "Yapım" : isHizmet ? "Hizmet" : "Mal";

  const primarySablonKey = isYapim
    ? "gecici-kabul-tutanagi"
    : isHizmet
    ? "hizmet-isleri-kabul-tutanagi"
    : "muayene-kabul-tutanagi";

  const hasKomisyon = komisyonUyeleri.length > 0;
  const kayitSayisi =
    tutanaklar.length > 0
      ? tutanaklar.length
      : baslangicTutanaklari.length > 0
      ? baslangicTutanaklari.length
      : 1;

  const handleOpenFallbackForm = () => {
    setFormTipi(isYapim ? "yapim" : isHizmet ? "hizmet" : "mal");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col transition-all">
      {/* Header & View Switcher */}
      <KabulCardHeader
        kayitSayisi={kayitSayisi}
        isYapim={isYapim}
        isHizmet={isHizmet}
        isMal={isMal}
        alimTuruEtiketi={alimTuruEtiketi}
        alimTuruKisa={alimTuruKisa}
        effectiveFirma={effectiveFirma}
        effectiveTeklifTutar={effectiveTeklifTutar}
        viewMode={viewMode}
        setViewMode={setViewMode}
        primarySablonKey={primarySablonKey}
        formatCurrency={formatCurrency}
        onOpenAddTutanak={onOpenAddTutanak}
        onOpenFallbackForm={handleOpenFallbackForm}
        onOpenPreview={onOpenPreview}
        onOpenTifModal={onOpenTifModal}
      />

      {/* Komisyon Heyeti Bar */}
      <KomisyonHeyetiBar
        komisyonUyeleri={komisyonUyeleri}
        hasKomisyon={hasKomisyon}
        onOpenKomisyonModal={onOpenKomisyonModal}
      />

      {/* Bilgilendirme ve Filtreleme Barı */}
      <KabulFilterBar
        totalCount={tutanaklar.length}
        approvedCount={approvedCount}
        pendingCount={pendingCount}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Toplu İşlem Barı */}
      <KabulBatchActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkApprove={onBulkApproveTutanaklar ? handleBulkApprove : undefined}
        onBulkDelete={handleBulkDelete}
      />

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <KabulTableView
          tutanaklar={tutanaklar}
          filteredTutanaklar={filteredTutanaklar}
          selectedIds={selectedIds}
          effectiveFirma={effectiveFirma}
          effectiveTeklifTutar={effectiveTeklifTutar}
          effectiveTeslimAlan={effectiveTeslimAlan}
          effectiveTeslimYeri={effectiveTeslimYeri}
          faturaNo={faturaNo}
          faturaTarihi={faturaTarihi}
          irsaliyeNo={irsaliyeNo}
          irsaliyeTarihi={irsaliyeTarihi}
          primarySablonKey={primarySablonKey}
          isMal={isMal}
          hasKomisyon={hasKomisyon}
          komisyonUyeleri={komisyonUyeleri}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectOne={handleToggleSelectOne}
          onResetFilter={() => setFilterStatus("all")}
          onOpenPreview={onOpenPreview}
          onToggleApproveTutanak={onToggleApproveTutanak}
          onEditTutanak={onEditTutanak}
          onDeleteTutanak={onDeleteTutanak}
          onOpenTifModal={onOpenTifModal}
          onOpenAddTutanak={onOpenAddTutanak}
        />
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <KabulListView
          tutanaklar={tutanaklar}
          filteredTutanaklar={filteredTutanaklar}
          effectiveFirma={effectiveFirma}
          effectiveTeklifTutar={effectiveTeklifTutar}
          effectiveTeslimAlan={effectiveTeslimAlan}
          effectiveTeslimYeri={effectiveTeslimYeri}
          faturaNo={faturaNo}
          faturaTarihi={faturaTarihi}
          irsaliyeNo={irsaliyeNo}
          irsaliyeTarihi={irsaliyeTarihi}
          dosyaNo={dosyaNo}
          primarySablonKey={primarySablonKey}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          onOpenPreview={onOpenPreview}
          onEditTutanak={onEditTutanak}
          onDeleteTutanak={onDeleteTutanak}
        />
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <KabulGridView
          tutanaklar={tutanaklar}
          filteredTutanaklar={filteredTutanaklar}
          effectiveFirma={effectiveFirma}
          effectiveTeklifTutar={effectiveTeklifTutar}
          effectiveTeslimAlan={effectiveTeslimAlan}
          effectiveTeslimYeri={effectiveTeslimYeri}
          faturaNo={faturaNo}
          faturaTarihi={faturaTarihi}
          irsaliyeNo={irsaliyeNo}
          irsaliyeTarihi={irsaliyeTarihi}
          dosyaNo={dosyaNo}
          primarySablonKey={primarySablonKey}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          onOpenPreview={onOpenPreview}
          onEditTutanak={onEditTutanak}
          onDeleteTutanak={onDeleteTutanak}
        />
      )}

      {/* Footer */}
      <KabulCardFooter
        effectiveTeklifTutar={effectiveTeklifTutar}
        firmaStats={firmaStats}
        formatCurrency={formatCurrency}
      />

      {/* Ekleme ekranı modal (Fallback) */}
      <KabulHizliEkleModal
        formTipi={formTipi}
        onClose={() => setFormTipi(null)}
        onSave={() => onOpenAddTutanak?.()}
        effectiveFirma={effectiveFirma}
        effectiveTeslimAlan={effectiveTeslimAlan}
        effectiveTeslimYeri={effectiveTeslimYeri}
        faturaNo={faturaNo}
        faturaTarihi={faturaTarihi}
        irsaliyeNo={irsaliyeNo}
        irsaliyeTarihi={irsaliyeTarihi}
        dosyaNo={dosyaNo}
        tutanaklarLength={tutanaklar.length}
      />
    </div>
  );
}
