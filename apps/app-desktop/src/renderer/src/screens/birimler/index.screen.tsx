import React, { useEffect, useState } from "react";
import {
  BirimInput,
  useBirimlerHooks,
  usePersonelList,
} from "./birimler.hooks";
import { useAyarlarHooks } from "../ayarlar/ayarlar.hooks";
import { useKurumHooks } from "../kurum/kurum.hooks";
import { Button } from "../../components/ui/Button";
import { Building2, LayoutGrid, Plus, Sparkles } from "lucide-react";
import { DataViewMode, ViewToggle } from "../../components/ui/ViewToggle";

// Subcomponents
import { BirimDetail } from "./components/BirimDetail";
import { BirimGrid } from "./components/BirimGrid";
import { BirimList } from "./components/BirimList";
import { BirimModal } from "./components/BirimModal";
import { ExcelActions } from "../../components/ui/ExcelActions";
import {
  DetsisSubUnitItem,
  DetsisSubUnitsModal,
} from "../../components/ui/DetsisSubUnitsModal";
import { DetsisSearchModal } from "../../components/ui/DetsisSearchModal";
import { DetsisVerificationState } from "../../components/ui/DetsisBadge";

const emptyBirim: BirimInput = {
  birim_adi: "",
  antet_ek_satir: "",
  ihtiyac_yeri_eki: "",
  sunum_makami: "",
  e_butce: "",
  say2000i: "",
  dtvt_kodu: "",
  detsis_kodu: "",
  muhasebe_kodu: "",
  muhasebe_adi: "",
  harcama_kodu: "",
  harcama_adi: "",
  ayrintili_bilgi_personel: "",
  ilgili_personel_id: null,
};

export default function BirimlerScreen({
  isSubComponent = false,
}: {
  isSubComponent?: boolean;
}): React.ReactNode {
  const { birimler, isLoadingBirimler, addBirim, updateBirim, deleteBirim } =
    useBirimlerHooks();
  const { personeller, isLoading: isLoadingPersonel } = usePersonelList();
  const { kurumData, fetchKurum } = useKurumHooks();
  const { settings } = useAyarlarHooks() as {
    settings: Record<string, string>;
  };

  useEffect(() => {
    fetchKurum();
  }, [fetchKurum]);

  const [form, setForm] = useState<BirimInput>({ ...emptyBirim });
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBirimId, setEditingBirimId] = useState<number | null>(null);
  const [dataViewMode, setDataViewMode] = useState<DataViewMode>("grid");
  const [viewingBirim, setViewingBirim] = useState<any | null>(null);
  const [ihtiyacYeriList, setIhtiyacYeriList] = useState<string[]>([""]);

  // DETSİS State
  const [isSubUnitsModalOpen, setIsSubUnitsModalOpen] = useState(false);
  const [isDetsisSearchModalOpen, setIsDetsisSearchModalOpen] = useState(false);
  const [targetInstitution, setTargetInstitution] = useState<
    {
      detsisNo: string;
      name: string;
    } | null
  >(null);

  const configuredDetsisNo = kurumData?.detsis_kodu || kurumData?.dtvt_kodu ||
    settings?.detsis_kodu || settings?.detsisKodu || settings?.dtvt_kodu || "";
  const configuredInstName = kurumData?.kurum_adi || settings?.kurum_adi ||
    settings?.kurumAdi || "Kurumunuz";

  const handleOpenDetsisImporter = (): void => {
    if (configuredDetsisNo) {
      setTargetInstitution({
        detsisNo: configuredDetsisNo,
        name: configuredInstName,
      });
      setIsSubUnitsModalOpen(true);
    } else {
      setIsDetsisSearchModalOpen(true);
    }
  };

  const handleSelectInstitutionFromSearch = (
    selected: DetsisVerificationState,
  ): void => {
    setIsDetsisSearchModalOpen(false);
    if (selected && selected.detsisNo) {
      setTargetInstitution({
        detsisNo: selected.detsisNo,
        name: selected.birimAdi || "Seçilen Kurum",
      });
      setIsSubUnitsModalOpen(true);
    }
  };

  const handleImportDetsisUnits = async (
    units: DetsisSubUnitItem[],
  ): Promise<void> => {
    let addedCount = 0;
    let updatedCount = 0;
    for (const u of units) {
      const existing = birimler.find(
        (b) =>
          (b.detsis_kodu && String(b.detsis_kodu) === String(u.detsisNo)) ||
          b.birim_adi.toLowerCase().trim() === u.birimAdi.toLowerCase().trim(),
      );
      if (!existing) {
        try {
          await addBirim({
            ...emptyBirim,
            birim_adi: u.birimAdi,
            detsis_kodu: u.detsisNo,
            dtvt_kodu: u.detsisNo,
            antet_ek_satir: u.kurumHiyerarsisi || "",
          });
          addedCount++;
        } catch (e) {
          console.error(`Birim eklenirken hata: ${u.birimAdi}`, e);
        }
      } else {
        try {
          await updateBirim({
            id: existing.id,
            data: {
              detsis_kodu: u.detsisNo,
              dtvt_kodu: u.detsisNo,
              antet_ek_satir: u.kurumHiyerarsisi || existing.antet_ek_satir || "",
            },
          });
          updatedCount++;
        } catch (e) {
          console.error(`Birim güncellenirken hata: ${u.birimAdi}`, e);
        }
      }
    }
    alert(
      addedCount > 0 || updatedCount > 0
        ? `${addedCount} yeni birim eklendi, ${updatedCount} mevcut birim DETSİS bilgileriyle senkronize edildi!`
        : "Herhangi bir birim aktarılmadı.",
    );
  };

  const isMuhasebe = form.birim_adi.toLowerCase().includes("muhasebe") ||
    form.birim_adi.toLowerCase().includes("mali") ||
    form.birim_adi.toLowerCase().includes("harcama");

  const handleChange = (
    key: keyof BirimInput,
    value: string | number | null,
  ): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!form.birim_adi.trim()) return;

    const finalIhtiyacYeri = JSON.stringify(
      ihtiyacYeriList.filter((v) => v.trim() !== ""),
    );
    const submitData = { ...form, ihtiyac_yeri_eki: finalIhtiyacYeri };

    try {
      if (editingBirimId) {
        await updateBirim({ id: editingBirimId, data: submitData });
      } else {
        await addBirim(submitData);
      }
      closeModal();
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        alert("Bu birim zaten ekli!");
      } else {
        console.error(err);
        alert("Birim kaydedilirken hata oluştu!");
      }
    }
  };

  const openModal = (): void => {
    setForm({ ...emptyBirim });
    setIhtiyacYeriList([""]);
    setEditingBirimId(null);
    setShowExtraFields(false);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingBirimId(null);
    setIhtiyacYeriList([""]);
  };

  const handleEditClick = (e: React.MouseEvent, birim: any): void => {
    e.stopPropagation();
    setForm({
      birim_adi: birim.birim_adi || "",
      antet_ek_satir: birim.antet_ek_satir || "",
      ihtiyac_yeri_eki: birim.ihtiyac_yeri_eki || "",
      sunum_makami: birim.sunum_makami || "",
      e_butce: birim.e_butce || "",
      say2000i: birim.say2000i || "",
      dtvt_kodu: birim.dtvt_kodu || "",
      detsis_kodu: birim.detsis_kodu || "",
      muhasebe_kodu: birim.muhasebe_kodu || "",
      muhasebe_adi: birim.muhasebe_adi || "",
      harcama_kodu: birim.harcama_kodu || "",
      harcama_adi: birim.harcama_adi || "",
      ayrintili_bilgi_personel: birim.ayrintili_bilgi_personel || "",
      ilgili_personel_id: birim.ilgili_personel_id || null,
    });
    let parsedIhtiyacList = [""];
    if (birim.ihtiyac_yeri_eki) {
      try {
        if (birim.ihtiyac_yeri_eki.startsWith("[")) {
          parsedIhtiyacList = JSON.parse(birim.ihtiyac_yeri_eki);
        } else {
          parsedIhtiyacList = birim.ihtiyac_yeri_eki.split("\n");
        }
      } catch {
        parsedIhtiyacList = [birim.ihtiyac_yeri_eki];
      }
    }
    setIhtiyacYeriList(parsedIhtiyacList);
    setEditingBirimId(birim.id);
    setShowExtraFields(true);
    setIsModalOpen(true);
  };

  const handleViewClick = (birim: any): void => {
    setViewingBirim(birim);
  };

  const handleDeleteBirim = async (
    e: React.MouseEvent,
    id: number,
  ): Promise<void> => {
    e.stopPropagation();
    const targetBirim = birimler.find((b) => b.id === id);
    const birimAdi = targetBirim?.birim_adi || (targetBirim as any)?.ad ||
      "Bu birimi";

    if (confirm(`"${birimAdi}" birimini silmek istediğinize emin misiniz?`)) {
      try {
        await deleteBirim(id);
      } catch (err: any) {
        console.error("Birim silme hatası:", err);
        alert("Birim silinemedi: " + (err?.message || "Bilinmeyen hata"));
      }
    }
  };

  if (viewingBirim) {
    return (
      <BirimDetail
        viewingBirim={viewingBirim}
        setViewingBirim={setViewingBirim}
        personeller={personeller}
      />
    );
  }

  return (
    <div
      className={isSubComponent
        ? "flex flex-col h-full space-y-6 w-full animate-in fade-in duration-200"
        : "p-8 max-w-[1600px] mx-auto flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full"}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            Birim &amp; Müdürlük Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Kurumunuza ait idari birimleri ve müdürlükleri buradan
            tanımlayabilir veya DETSİS&apos;ten tek tıkla aktarabilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExcelActions
            tableName="TANIM_Birim"
            title="Birimler"
            uniqueCol="id"
          />
          <ViewToggle viewMode={dataViewMode} onChange={setDataViewMode} />

          <Button
            type="button"
            variant="outline"
            onClick={handleOpenDetsisImporter}
            className="border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-2 px-3.5 py-2 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>DETSİS&apos;ten Birimleri Çek</span>
          </Button>

          <Button
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2 px-4 py-2 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Yeni Birim Ekle
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
        <div className="flex-1 overflow-auto">
          {isLoadingBirimler
            ? (
              <div className="text-sm text-slate-450 dark:text-slate-500 py-4 italic text-center w-full">
                Birimler yükleniyor...
              </div>
            )
            : birimler.length === 0
            ? (
              <div className="text-center py-12 px-4 max-w-xl mx-auto space-y-5">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-3xl mx-auto flex items-center justify-center shadow-inner border border-blue-100 dark:border-blue-900/40">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Kayıtlı Birim Bulunmuyor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    {configuredDetsisNo
                      ? (
                        <>
                          Tanımlı kurumunuz{" "}
                          <strong className="text-slate-700 dark:text-slate-200">
                            {configuredInstName}
                          </strong>{" "}
                          (DETSİS No: {configuredDetsisNo}) tespit edildi. Alt
                          birimlerinizi DETSİS üzerinden tek tıkla yükleyebilir
                          veya kendiniz manuel yeni birim ekleyebilirsiniz.
                        </>
                      )
                      : (
                        <>
                          Kurumunuza ait idari birimleri ve müdürlükleri hemen
                          manuel ekleyebilir veya DETSİS üzerinden otomatik
                          çekebilirsiniz.
                        </>
                      )}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={openModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs flex items-center gap-2 px-5 py-2.5 w-full sm:w-auto justify-center rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                    Manuel Yeni Birim Ekle
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenDetsisImporter}
                    className="border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-xs flex items-center gap-2 px-5 py-2.5 w-full sm:w-auto justify-center rounded-xl shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {configuredDetsisNo
                      ? "DETSİS'ten Alt Birimleri Getir"
                      : "DETSİS'te Kurum / Birim Ara"}
                  </Button>
                </div>
              </div>
            )
            : dataViewMode === "grid"
            ? (
              <BirimGrid
                birimler={birimler}
                personeller={personeller}
                handleViewClick={handleViewClick}
                handleEditClick={handleEditClick}
                handleDeleteBirim={handleDeleteBirim}
              />
            )
            : (
              <BirimList
                birimler={birimler}
                personeller={personeller}
                dataViewMode={dataViewMode}
                handleViewClick={handleViewClick}
                handleEditClick={handleEditClick}
                handleDeleteBirim={handleDeleteBirim}
              />
            )}
        </div>
      </div>

      <BirimModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingBirimId={editingBirimId}
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        showExtraFields={showExtraFields}
        setShowExtraFields={setShowExtraFields}
        isMuhasebe={isMuhasebe}
        settings={settings}
        ihtiyacYeriList={ihtiyacYeriList}
        setIhtiyacYeriList={setIhtiyacYeriList}
        personeller={personeller}
        isLoadingPersonel={isLoadingPersonel}
      />

      {/* DETSİS Kurum Arama Modalı */}
      <DetsisSearchModal
        isOpen={isDetsisSearchModalOpen}
        onClose={() => setIsDetsisSearchModalOpen(false)}
        onSelect={handleSelectInstitutionFromSearch}
        title="DETSİS'te Kurum / Bakanlık Seçin"
      />

      {/* DETSİS Alt Birimlerini Toplu İçe Aktarma Modalı */}
      <DetsisSubUnitsModal
        isOpen={isSubUnitsModalOpen}
        onClose={() => setIsSubUnitsModalOpen(false)}
        institutionDetsisNo={targetInstitution?.detsisNo || configuredDetsisNo}
        institutionName={targetInstitution?.name || configuredInstName}
        existingBirimDetsisNos={birimler.map((b) => b.detsis_kodu).filter(
          Boolean,
        ) as string[]}
        existingBirimNames={birimler.map((b) => b.birim_adi)}
        onImportUnits={handleImportDetsisUnits}
      />
    </div>
  );
}
