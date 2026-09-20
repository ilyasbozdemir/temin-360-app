import React from 'react'
import { ChevronUp, ChevronDown, HelpCircle, Info, X, Plus } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { DetsisBadge } from '../../../components/ui/DetsisBadge'
import { BirimInput } from '../birimler.hooks'

interface BirimModalProps {
  isOpen: boolean
  onClose: () => void
  editingBirimId: number | null
  form: BirimInput
  handleChange: (key: keyof BirimInput, value: any) => void
  handleSubmit: (e: React.FormEvent) => void
  showExtraFields: boolean
  setShowExtraFields: (val: boolean) => void
  isMuhasebe: boolean
  settings: any
  ihtiyacYeriList: string[]
  setIhtiyacYeriList: React.Dispatch<React.SetStateAction<string[]>>
  personeller: any[]
  isLoadingPersonel: boolean
}

const Field = ({
  label,
  field,
  form,
  handleChange,
  required,
  placeholder
}: {
  label: string
  field: keyof BirimInput
  form: BirimInput
  handleChange: (field: keyof BirimInput, value: string) => void
  required?: boolean
  placeholder?: string
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5">
      {label} {required && <span className="text-red-505">*</span>}
    </label>
    <Input
      value={(form[field] as string) || ''}
      onChange={(e) => handleChange(field, e.target.value)}
      placeholder={placeholder || label}
      required={required}
      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
    />
  </div>
)

export const BirimModal: React.FC<BirimModalProps> = ({
  isOpen,
  onClose,
  editingBirimId,
  form,
  handleChange,
  handleSubmit,
  showExtraFields,
  setShowExtraFields,
  isMuhasebe,
  settings,
  ihtiyacYeriList,
  setIhtiyacYeriList,
  personeller,
  isLoadingPersonel
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBirimId ? 'Birimi Düzenle' : 'Yeni Birim Tanımla'}
      description={
        editingBirimId
          ? 'İdari birim bilgilerini güncelleyin.'
          : 'Kurumunuza ait idari birim veya müdürlük ekleyin.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Birim / Müdürlük Adı"
          field="birim_adi"
          form={form}
          handleChange={handleChange}
          required
          placeholder="Örn: Fen İşleri Müdürlüğü"
        />

        {isMuhasebe && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="col-span-full">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Mali / Muhasebe birimi tespit edildi. Lütfen finansal kodları giriniz:
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                e-Bütçe Kodu
                <span title="Kurumunuzun e-Bütçe sistemindeki ön ek kodudur (Örn: 38.xx.xx)">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-505 cursor-help" />
                </span>
              </label>
              <div className="flex">
                {settings?.eButceKodu && (
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                    {settings.eButceKodu}.
                  </span>
                )}
                <input
                  type="text"
                  value={(form.e_butce as string) || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    handleChange('e_butce', val)
                  }}
                  placeholder="Birim Kodu (Örn: 03)"
                  className={`flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-805 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    settings?.eButceKodu ? 'rounded-r-xl' : 'rounded-xl'
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                Say2000i Kodu
                <span title="Maliye Bakanlığı Say2000i sistemindeki ödeme kurumu kodunuz">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" />
                </span>
              </label>
              <div className="flex">
                {settings?.say2000iKodu && (
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                    {settings.say2000iKodu}
                  </span>
                )}
                <input
                  type="text"
                  value={(form.say2000i as string) || ''}
                  onChange={(e) => handleChange('say2000i', e.target.value)}
                  placeholder="Birim Kodu (Örn: 01)"
                  className={`flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-805 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    settings?.say2000iKodu ? 'rounded-r-xl' : 'rounded-xl'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowExtraFields(!showExtraFields)}
          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-2 cursor-pointer w-full justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg transition-colors"
        >
          {showExtraFields ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          {showExtraFields ? 'Ek Bilgileri Gizle' : 'Antet, Kod & Sunum Bilgileri Göster'}
        </button>

        {showExtraFields && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Muhasebe Birimi Bilgileri */}
            <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Muhasebe Birimi Bilgileri{' '}
                <span className="text-[10px] font-normal text-slate-400">
                  (EKAP veri aktarımında bu bilgiler eşleştirilir)
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Muhasebe Birim Kodu
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={form.muhasebe_kodu || ''}
                      onChange={(e) => handleChange('muhasebe_kodu', e.target.value)}
                      placeholder="Örn: 38220"
                      className="bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Muhasebe Birim Adı
                  </label>
                  <Input
                    value={form.muhasebe_adi || ''}
                    onChange={(e) => handleChange('muhasebe_adi', e.target.value)}
                    placeholder="Muhasebe Birimi Adı"
                    className="bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Harcama Birimi Bilgileri */}
            <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Harcama Birimi Bilgileri{' '}
                <span className="text-[10px] font-normal text-slate-400">
                  (EKAP veri aktarımında bu bilgiler eşleştirilir)
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Harcama Birim Kodu
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={form.harcama_kodu || ''}
                      onChange={(e) => handleChange('harcama_kodu', e.target.value)}
                      placeholder="Örn: 38.22.00.01"
                      className="bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Harcama Birim Adı
                  </label>
                  <Input
                    value={form.harcama_adi || ''}
                    onChange={(e) => handleChange('harcama_adi', e.target.value)}
                    placeholder="Harcama Birimi Adı"
                    className="bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>
            {!isMuhasebe && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    e-Bütçe Kodu
                    <span title="Kurumunuzun e-Bütçe sistemindeki ön ek kodudur (Örn: 38.xx.xx)">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" />
                    </span>
                  </label>
                  <div className="flex">
                    {settings?.eButceKodu && (
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                        {settings.eButceKodu}.
                      </span>
                    )}
                    <input
                      type="text"
                      value={(form.e_butce as string) || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        handleChange('e_butce', val)
                      }}
                      placeholder="Birim Kodu (Örn: 03)"
                      className={`flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        settings?.eButceKodu ? 'rounded-r-xl' : 'rounded-xl'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    Say2000i Kodu
                    <span title="Maliye Bakanlığı Say2000i sistemindeki ödeme kurumu kodunuz">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" />
                    </span>
                  </label>
                  <div className="flex">
                    {settings?.say2000iKodu && (
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                        {settings.say2000iKodu}
                      </span>
                    )}
                    <input
                      type="text"
                      value={(form.say2000i as string) || ''}
                      onChange={(e) => handleChange('say2000i', e.target.value)}
                      placeholder="Birim Kodu (Örn: 01)"
                      className={`flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-805 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        settings?.say2000iKodu ? 'rounded-r-xl' : 'rounded-xl'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            <Field
              label="Antet Ek Satır"
              field="antet_ek_satir"
              form={form}
              handleChange={handleChange}
              placeholder="Antet yazısında ek satır"
            />

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5">
                İhtiyaç Yerleri
              </label>
              {ihtiyacYeriList.map((yer, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={yer}
                    onChange={(e) => {
                      const newList = [...ihtiyacYeriList]
                      newList[index] = e.target.value
                      setIhtiyacYeriList(newList)
                    }}
                    placeholder={`${index + 1}. İhtiyaç Yeri (Örn: Fen İşleri Ambarı)`}
                    className="bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const newList = ihtiyacYeriList.filter((_, i) => i !== index)
                      if (newList.length === 0) newList.push('')
                      setIhtiyacYeriList(newList)
                    }}
                    className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIhtiyacYeriList([...ihtiyacYeriList, ''])}
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 p-1 h-auto"
              >
                <Plus className="w-3 h-3 mr-1" /> Yeni Satır Ekle
              </Button>
            </div>

            <Field
              label="Sunum Makamı"
              field="sunum_makami"
              form={form}
              handleChange={handleChange}
              placeholder="Sunulacak makam"
            />

            <div className="col-span-full space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-655 dark:text-slate-400">
                  DETSİS Kodu <span className="text-[10px] font-normal text-slate-400">(Eski adıyla DTVT)</span>
                </label>
                <DetsisBadge detsisNo={form.dtvt_kodu || form.detsis_kodu} />
              </div>
              <Input
                value={form.dtvt_kodu || ''}
                onChange={(e) => {
                  handleChange('dtvt_kodu', e.target.value)
                  handleChange('detsis_kodu', e.target.value)
                }}
                placeholder="Biriminizin DETSİS kodunu girin..."
                className="w-full bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
              />
              <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-955/30 p-2 rounded-lg border border-amber-100 dark:border-amber-900/50 flex flex-col gap-1.5 leading-relaxed">
                <div className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    DTVT sistemi, DETSİS olarak güncellenmiştir. Birim kodunuzu bilmiyorsanız{' '}
                    <a
                      href={
                        form.dtvt_kodu
                          ? `https://detsis.gov.tr/birim/${form.dtvt_kodu}/${form.dtvt_kodu}/${
                              new Date().toISOString().split('T')[0]
                            }`
                          : 'https://detsis.gov.tr/'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline hover:text-amber-700 dark:hover:text-amber-400"
                    >
                      DETSİS'te Arama Yapın
                    </a>
                    .
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-655 dark:text-slate-400 mb-1.5">
                İlgili Personel (Ayrıntılı Bilgi)
              </label>
              <select
                value={form.ilgili_personel_id || ''}
                onChange={(e) =>
                  handleChange('ilgili_personel_id', e.target.value ? Number(e.target.value) : null)
                }
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm py-2 h-10 rounded-xl px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                disabled={isLoadingPersonel}
                title="İlgili Personel"
              >
                <option value="">-- Personel Seçiniz --</option>
                {personeller.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ad_soyad}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md">
            {editingBirimId ? 'Güncelle' : 'Birimi Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
