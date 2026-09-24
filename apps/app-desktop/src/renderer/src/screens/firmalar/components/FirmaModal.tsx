import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { FirmaInput } from '../firmalar.hooks'
import { cn } from '../../../utils/cn'

const Field = ({
  label,
  field,
  form,
  handleChange,
  required,
  placeholder,
  readOnly
}: {
  label: string
  field: keyof FirmaInput
  form: FirmaInput
  handleChange: (field: keyof FirmaInput, value: string) => void
  required?: boolean
  placeholder?: string
  readOnly?: boolean
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 text-left">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      value={form[field] as string}
      onChange={(e) => !readOnly && handleChange(field, e.target.value)}
      placeholder={placeholder || label}
      required={required}
      disabled={readOnly}
      className={cn(
        'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9',
        readOnly && 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900'
      )}
    />
  </div>
)

interface FirmaModalProps {
  isOpen: boolean
  onClose: () => void
  editingId: number | null
  form: FirmaInput
  handleChange: (key: keyof FirmaInput, value: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  showExtraFields: boolean
  setShowExtraFields: (val: boolean) => void
}

export const FirmaModal: React.FC<FirmaModalProps> = ({
  isOpen,
  onClose,
  editingId,
  form,
  handleChange,
  handleSubmit,
  showExtraFields,
  setShowExtraFields
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? 'Firma Bilgilerini Düzenle' : 'Yeni Tedarikçi Firma Ekle'}
      description={
        editingId
          ? 'Firma bilgilerini güncelleyerek kaydedin.'
          : 'Tedarikçi firma bilgilerini sisteme kaydedin. Firma kodu otomatik atanacaktır.'
      }
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {editingId ? (
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Firma Kodu"
                field="firma_kodu"
                form={form}
                handleChange={handleChange}
                placeholder="Firma kodu"
              />
              <Field
                label="Firma Ünvanı"
                field="unvan"
                form={form}
                handleChange={handleChange}
                required
                placeholder="Firma ticari ünvanı"
              />
            </div>
          ) : (
            <Field
              label="Firma Ünvanı"
              field="unvan"
              form={form}
              handleChange={handleChange}
              required
              placeholder="Firma ticari ünvanı"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="İlgili Kişi" field="ilgili_adi" form={form} handleChange={handleChange} />
          <Field label="Uyruğu" field="uyrugu" form={form} handleChange={handleChange} />
        </div>
        <Field
          label="İştigal Konusu"
          field="istigal_konusu"
          form={form}
          handleChange={handleChange}
          placeholder="Yapı malzemesi, kırtasiye vb."
        />

        <button
          type="button"
          onClick={() => setShowExtraFields(!showExtraFields)}
          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-2 cursor-pointer w-full justify-center bg-blue-50 dark:bg-blue-900/20 py-2.5 rounded-xl transition-colors"
        >
          {showExtraFields ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          {showExtraFields
            ? 'Adres, Banka & Vergi Bilgilerini Gizle'
            : 'Adres, Banka & Vergi Bilgilerini Göster'}
        </button>

        {showExtraFields && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <Field label="Adres" field="adres" form={form} handleChange={handleChange} />
            <div className="grid grid-cols-3 gap-4">
              <Field label="İlçe" field="ilce" form={form} handleChange={handleChange} />
              <Field
                label="Posta Kodu"
                field="posta_kodu"
                form={form}
                handleChange={handleChange}
              />
              <Field label="İl" field="il" form={form} handleChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Telefon" field="telefon" form={form} handleChange={handleChange} />
              <Field label="Faks" field="faks" form={form} handleChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="E-mail" field="email" form={form} handleChange={handleChange} />
              <Field
                label="Web Adresi"
                field="web_adresi"
                form={form}
                handleChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Banka Adı" field="banka_adi" form={form} handleChange={handleChange} />
              <Field
                label="Şube Kodu / Adı"
                field="sube_kodu_adi"
                form={form}
                handleChange={handleChange}
              />
            </div>
            <Field label="Hesap No" field="hesap_no" form={form} handleChange={handleChange} />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="TC Kimlik No"
                field="tc_kimlik_no"
                form={form}
                handleChange={handleChange}
              />
              <Field
                label="Doğum Tarihi"
                field="dogum_tarihi"
                form={form}
                handleChange={handleChange}
                placeholder="GG.AA.YYYY"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Vergi Dairesi"
                field="vergi_dairesi"
                form={form}
                handleChange={handleChange}
              />
              <Field label="Vergi No" field="vergi_no" form={form} handleChange={handleChange} />
            </div>

            {/* CRM Alanları */}
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                ⭐ CRM & Performans Değerlendirmesi
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Deneyim Skoru (1-5 Yıldız)
                  </label>
                  <select
                    value={form.deneyim_skoru || 0}
                    onChange={(e) =>
                      handleChange('deneyim_skoru' as any, Number(e.target.value) as any)
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 rounded-xl px-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Seçilmedi (0)</option>
                    <option value={1}>⭐ (1 - Çok Zayıf)</option>
                    <option value={2}>⭐⭐ (2 - Zayıf)</option>
                    <option value={3}>⭐⭐⭐ (3 - Orta)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - İyi)</option>
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Mükemmel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Kalite Skoru (1-5 Yıldız)
                  </label>
                  <select
                    value={form.kalite_skoru || 0}
                    onChange={(e) =>
                      handleChange('kalite_skoru' as any, Number(e.target.value) as any)
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 rounded-xl px-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Seçilmedi (0)</option>
                    <option value={1}>⭐ (1 - Kalitesiz)</option>
                    <option value={2}>⭐⭐ (2 - Düşük Kalite)</option>
                    <option value={3}>⭐⭐⭐ (3 - Standart)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Yüksek Kalite)</option>
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Üst Düzey)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Ödeme Disiplini
                  </label>
                  <select
                    value={form.odeme_disiplini ?? 1}
                    onChange={(e) =>
                      handleChange('odeme_disiplini' as any, Number(e.target.value) as any)
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 rounded-xl px-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>✅ Zamanında Ödeme / Düzenli</option>
                    <option value={0}>⚠️ Aksatıyor / Sorunlu</option>
                  </select>
                </div>
              </div>

              {/* Kara Liste Toggle */}
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 dark:text-red-400">
                    🚫 Kara Liste (Güvenilmez Firma Durumu)
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.kara_liste)}
                      onChange={(e) =>
                        handleChange('kara_liste' as any, (e.target.checked ? 1 : 0) as any)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {Boolean(form.kara_liste) && (
                  <div>
                    <label className="block text-[11px] font-semibold text-red-600 dark:text-red-300 mb-1">
                      Kara Liste Nedeni / Açıklaması
                    </label>
                    <textarea
                      value={form.kara_liste_neden || ''}
                      onChange={(e) =>
                        handleChange('kara_liste_neden' as any, e.target.value as any)
                      }
                      placeholder="Örn: 2 defa taahhüt edilen teslimatı 30 gün geciktirdi veya eksik/hasarlı ürün teslim etti."
                      rows={2}
                      className="w-full bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md">
            {editingId ? 'Güncelle' : 'Firmayı Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
