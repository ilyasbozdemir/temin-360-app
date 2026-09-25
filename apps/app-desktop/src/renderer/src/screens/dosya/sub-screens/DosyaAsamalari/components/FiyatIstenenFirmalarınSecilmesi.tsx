import React, { useMemo, useState } from "react";
import {
  Firma,
  FirmaColumn,
  FirmaEkleModali,
  FirmaFooterBar,
  FirmaHeader,
  FirmaTablo,
  FiyatIstenenFirmalarınSecilmesiProps,
  MAX_FIRMS,
  YeniFirmaModali,
} from "./FiyatIstenenFirmalari";

export type { Firma, FirmaColumn, FiyatIstenenFirmalarınSecilmesiProps };

export function FiyatIstenenFirmalarınSecilmesi({
  title = "Fiyat İstenen Firmaların Seçilmesi",
  firms,
  columns,
  onFirmaEkle,
  onCreateNewFirm,
  onFirmaCikar,
  onFiyatGir,
  onFiyatPiyasaFormu,
  onIdareFiyatArastirmaMektubu,
  onBirimFiyatArastirmasi,
  onBosTeklifCetveli,
  onEkapSorgula,
  onOpenFirmaSecmeModali,
  extraHeaderAction,
  winnerFirmaId,
  onSetWinnerFirma,
}: FiyatIstenenFirmalarınSecilmesiProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewFirmModalOpen, setIsNewFirmModalOpen] = useState(false);

  const addedFirms = useMemo(() => {
    const seen = new Set<number>();
    return firms.filter((f) => {
      if (!f.isAdded) return false;
      const key = f.temin_firma_id ?? f.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [firms]);

  const availableFirms = useMemo(() => {
    const seen = new Set<number>();
    return firms.filter((f) => {
      if (f.isAdded || seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [firms]);

  const canAdd = addedFirms.length < MAX_FIRMS;

  const handleConfirm = async (selected: Firma[]) => {
    for (const f of selected) {
      await onFirmaEkle(f);
    }
    setIsModalOpen(false);
  };

  const handleSaveNewFirm = async (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => {
    if (onCreateNewFirm) {
      await onCreateNewFirm(firmaData);
    }
  };

  const handleOpenModal = () => {
    if (onOpenFirmaSecmeModali) {
      onOpenFirmaSecmeModali();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {isModalOpen && (
        <FirmaEkleModali
          availableFirms={availableFirms}
          addedCount={addedFirms.length}
          onConfirm={handleConfirm}
          onOpenNewFirm={() => setIsNewFirmModalOpen(true)}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isNewFirmModalOpen && (
        <YeniFirmaModali
          onClose={() => setIsNewFirmModalOpen(false)}
          onSave={handleSaveNewFirm}
        />
      )}

      <div className="space-y-0 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xs overflow-hidden">
        <FirmaHeader
          title={title}
          addedCount={addedFirms.length}
          canAdd={canAdd}
          onOpenModal={handleOpenModal}
          onOpenNewFirmModal={() => setIsNewFirmModalOpen(true)}
          onFiyatGir={onFiyatGir}
          extraHeaderAction={extraHeaderAction}
        />

        <FirmaTablo
          columns={columns}
          addedFirms={addedFirms}
          winnerFirmaId={winnerFirmaId}
          onOpenModal={() => setIsModalOpen(true)}
          onOpenNewFirmModal={() => setIsNewFirmModalOpen(true)}
          onFirmaCikar={onFirmaCikar}
          onFiyatGir={onFiyatGir}
          onFiyatPiyasaFormu={onFiyatPiyasaFormu}
          onIdareFiyatArastirmaMektubu={onIdareFiyatArastirmaMektubu}
          onBirimFiyatArastirmasi={onBirimFiyatArastirmasi}
          onBosTeklifCetveli={onBosTeklifCetveli}
          onEkapSorgula={onEkapSorgula}
          onSetWinnerFirma={onSetWinnerFirma}
        />
      </div>
    </>
  );
}
