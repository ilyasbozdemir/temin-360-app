import React, { useState } from "react";
import { AmbarInput, useAmbarHooks } from "./ambar.hooks";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { ExcelActions } from "../../components/ui/ExcelActions";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Database,
  MapPin,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";

const emptyAmbar: AmbarInput = {
  ambar_adi: "",
  aciklama: "",
  adres: "",
  semt: "",
  posta_kodu: "",
  sehir: "",
  telefon: "",
  faks: "",
  web_adresi: "",
  email: "",
  tasinir_kodu: "",
  tasinir_adi: "",
};

const Field = ({
  label,
  field,
  form,
  handleChange,
  required,
  placeholder,
}: {
  label: string;
  field: keyof AmbarInput;
  form: AmbarInput;
  handleChange: (field: keyof AmbarInput, value: string) => void;
  required?: boolean;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      value={form[field] as string}
      onChange={(e) => handleChange(field, e.target.value)}
      placeholder={placeholder || label}
      required={required}
      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
    />
  </div>
);

export default function AmbarScreen({
  isSubComponent = false,
}: {
  isSubComponent?: boolean
} = {}): React.JSX.Element {
  void isSubComponent
  const { ambarlar, isLoadingAmbarlar, addAmbar, updateAmbar, deleteAmbar } =
    useAmbarHooks();
  const [form, setForm] = useState<AmbarInput>({ ...emptyAmbar });
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleChange = (key: keyof AmbarInput, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!form.ambar_adi.trim()) return;
    try {
      if (editId) {
        await updateAmbar({ id: editId, data: form });
      } else {
        await addAmbar(form);
      }
      setForm({ ...emptyAmbar });
      setShowExtraFields(false);
      setEditId(null);
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        alert("Bu ambar adı zaten kayıtlı!");
      } else {
        alert(`Ambar ${editId ? "güncellenirken" : "eklenirken"} hata oluştu!`);
      }
    }
  };

  const openEdit = (ambar: any) => {
    setEditId(ambar.id);
    setForm({
      ambar_adi: ambar.ambar_adi,
      aciklama: ambar.aciklama,
      adres: ambar.adres,
      semt: ambar.semt,
      posta_kodu: ambar.posta_kodu,
      sehir: ambar.sehir,
      telefon: ambar.telefon,
      faks: ambar.faks,
      web_adresi: ambar.web_adresi,
      email: ambar.email,
      tasinir_kodu: ambar.tasinir_kodu,
      tasinir_adi: ambar.tasinir_adi,
    });
    setShowExtraFields(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (confirm("Bu ambar kaydını silmek istediğinize emin misiniz?")) {
      try {
        await deleteAmbar(id);
      } catch {
        alert("Silme sırasında hata oluştu!");
      }
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      {/* BAŞLIK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-855 dark:text-slate-100">
            <Database className="w-8 h-8 text-blue-600" />
            Ambar Tanımları &amp; Depo Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Kurumunuza ait ana ambar, depo, stok grupları ve depo sorumlularını
            tanımlayın.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelActions
            tableName="TANIM_Ambar"
            title="Ambarlar"
            uniqueCol="id"
          />
          <Button
            onClick={() => {
              setEditId(null);
              setForm({ ...emptyAmbar });
              setShowExtraFields(false);
              setIsModalOpen(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-4 py-2 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Yeni Ambar Deposu
          </Button>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Tanımlı Ambar Deposu
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {ambarlar.length} Adet
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Farklı Şehir
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {new Set(ambarlar.filter((a) => a.sehir).map((a) => a.sehir))
                .size || 0} Bölge
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Taşınır Kodlu
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {ambarlar.filter((a) => a.tasinir_kodu).length} Adet
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4">
          Kayıtlı Ambar Depoları
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoadingAmbarlar
            ? (
              <div className="col-span-full p-8 text-center text-slate-450 dark:text-slate-500 animate-pulse italic">
                Ambar depoları yükleniyor...
              </div>
            )
            : ambarlar.length === 0
            ? (
              <div className="col-span-full p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <Archive className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Kayıtlı Ambar Bulunmuyor
                </h3>
              </div>
            )
            : (
              ambarlar.map((ambar) => (
                <div
                  key={ambar.id}
                  className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative"
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-md shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-0.5">
                    <Button
                      title="Düzenle"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(ambar)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/15"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      title="Sil"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ambar.id)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-2 pr-8">
                    {ambar.tasinir_kodu && (
                      <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-1.5 py-0.5 rounded">
                        {ambar.tasinir_kodu}
                      </span>
                    )}
                    {ambar.sehir && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {ambar.sehir}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 leading-normal pr-8">
                    {ambar.ambar_adi}
                  </h4>
                  {ambar.aciklama && (
                    <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 flex-1">
                      {ambar.aciklama}
                    </p>
                  )}

                  <div className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-3 flex flex-col gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {ambar.adres && (
                      <span className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{ambar.adres}</span>
                      </span>
                    )}
                    {ambar.telefon && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs">📞</span> {ambar.telefon}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? "Ambar Karti Güncelle" : "Yeni Ambar Deposu Tanımla"}
        description={editId
          ? "Ambar veya depo bilgilerini düzenleyin."
          : "Kurumunuza ait ana ambar veya depo ekleyin."}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Field
            label="Ambar Adı"
            field="ambar_adi"
            form={form}
            handleChange={handleChange}
            required
            placeholder="Örn: Fen İşleri Yedek Parça Ambarı"
          />
          <Field
            label="Açıklama"
            field="aciklama"
            form={form}
            handleChange={handleChange}
            placeholder="Ambar hakkında kısa bilgi"
          />

          <button
            type="button"
            onClick={() => setShowExtraFields(!showExtraFields)}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-2 cursor-pointer w-full justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg transition-colors"
          >
            {showExtraFields
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <ChevronDown className="w-3.5 h-3.5" />}
            {showExtraFields
              ? "Ek Bilgileri Gizle"
              : "Adres, İletişim & Taşınır Bilgileri Göster"}
          </button>

          {showExtraFields && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <Field
                label="Adres"
                field="adres"
                form={form}
                handleChange={handleChange}
              />
              <div className="grid grid-cols-3 gap-3">
                <Field
                  label="Semt"
                  field="semt"
                  form={form}
                  handleChange={handleChange}
                />
                <Field
                  label="Posta Kodu"
                  field="posta_kodu"
                  form={form}
                  handleChange={handleChange}
                />
                <Field
                  label="Şehir"
                  field="sehir"
                  form={form}
                  handleChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Telefon"
                  field="telefon"
                  form={form}
                  handleChange={handleChange}
                />
                <Field
                  label="Faks"
                  field="faks"
                  form={form}
                  handleChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Web Adresi"
                  field="web_adresi"
                  form={form}
                  handleChange={handleChange}
                />
                <Field
                  label="Email"
                  field="email"
                  form={form}
                  handleChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Taşınır Kodu"
                  field="tasinir_kodu"
                  form={form}
                  handleChange={handleChange}
                />
                <Field
                  label="Taşınır Adı"
                  field="tasinir_adi"
                  form={form}
                  handleChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              {editId ? "Değişiklikleri Kaydet" : "Ambar Kaydını Ekle"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
