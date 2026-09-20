import React from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { getSubInstitutionOptions } from '../../../utils/kurumHelper'
import { KurumTabProps } from '../types'

export const IdariBilgilerTab: React.FC<KurumTabProps> = ({
  data,
  onChange,
  institutionLetterhead,
  setInstitutionLetterhead,
  parentInstitutionLines,
  setParentInstitutionLines
}) => {
  const handleInstitutionTypeChange = (type: string): void => {
    onChange('kurum_tipi', type)
    if (type === 'belediye') {
      onChange('finansman_kodu', '5')
    } else if (type === 'genel_butce') {
      onChange('finansman_kodu', '1')
    } else if (type === 'ozel_butce') {
      onChange('finansman_kodu', '2')
    } else if (type === 'duzenleyici') {
      onChange('finansman_kodu', '3')
    } else if (type === 'sosyal_guvenlik') {
      onChange('finansman_kodu', '4')
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
          İdari Kurum Bilgileri
        </h2>
        <p className="text-xs text-slate-500">
          Çıktılarda ve sistem genelinde kullanılan idari başlıklar.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Kurum Adı
          </label>
          <Input
            value={data.kurum_adi || ''}
            onChange={(e) => onChange('kurum_adi', e.target.value)}
            placeholder="Kurum Adı"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            Kurum Anteti
            <span className="text-[9px] font-normal text-slate-400">
              (Örn: T.C. / X Kurumu / Y Müdürlüğü)
            </span>
          </label>
          <div className="space-y-2">
            {institutionLetterhead.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={line}
                  onChange={(e) => {
                    const newArr = [...institutionLetterhead]
                    newArr[idx] = e.target.value
                    setInstitutionLetterhead(newArr)
                  }}
                  placeholder={`Antet ${idx + 1}. Satır`}
                  className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs flex-1"
                />
                {institutionLetterhead.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newArr = institutionLetterhead.filter((_, i) => i !== idx)
                      setInstitutionLetterhead(newArr)
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors shrink-0"
                    title="Satırı Sil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setInstitutionLetterhead([...institutionLetterhead, ''])}
              className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/40 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Satır Ekle
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Sunulacak Makam Adı (Muhatap)
          </label>
          <Input
            value={data.makam_adi || ''}
            onChange={(e) => onChange('makam_adi', e.target.value)}
            placeholder="Makam Adı"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            Bağlı Olduğu Kurum
            <span className="text-[9px] font-normal text-slate-400">
              (Örn: T.C. / Bakanlık / Genel Müdürlük)
            </span>
          </label>
          <div className="space-y-2">
            {parentInstitutionLines.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={line}
                  onChange={(e) => {
                    const newArr = [...parentInstitutionLines]
                    newArr[idx] = e.target.value
                    setParentInstitutionLines(newArr)
                  }}
                  placeholder={`Kurum ${idx + 1}. Satır`}
                  className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs flex-1"
                />
                {parentInstitutionLines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newArr = parentInstitutionLines.filter((_, i) => i !== idx)
                      setParentInstitutionLines(newArr)
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors shrink-0"
                    title="Satırı Sil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setParentInstitutionLines([...parentInstitutionLines, ''])}
              className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/40 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Satır Ekle
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Kurum Tipi (Bütçeleme ve Limit Şablonu) *
          </label>
          <select
            value={data.kurum_tipi || ''}
            onChange={(e) => handleInstitutionTypeChange(e.target.value)}
            className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2.5 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>
              Lütfen Kurum Tipini Seçin...
            </option>
            <option value="belediye">Belediye / Mahalli İdare (Finansman Kaynağı: 5)</option>
            <option value="genel_butce">Bakanlık / İl-İlçe Müdürlüğü / Genel Bütçe</option>
            <option value="ozel_butce">Üniversite / Özel Bütçeli İdare</option>
            <option value="duzenleyici">Düzenleyici ve Denetleyici Kurum</option>
            <option value="sosyal_guvenlik">SGK / Sosyal Güvenlik Kurumu</option>
            <option value="diger">Diğer İdareler / Kamu İktisadi Teşebbüsü</option>
          </select>

          {(() => {
            const options = getSubInstitutionOptions(
              data.kurum_tipi || '',
              data.finansman_kodu || '5'
            )
            if (options.length <= 1) return null

            return (
              <div className="mt-3 bg-slate-100/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Alt Kurum Türü / Tabiri *
                </label>
                <select
                  value={data.alt_kurum_tipi || 'belediye'}
                  onChange={(e) => onChange('alt_kurum_tipi', e.target.value)}
                  className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2.5 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {(data.alt_kurum_tipi || 'belediye') === 'diger' && (
                  <div className="mt-4 p-4 bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 rounded-xl space-y-4 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Özel Alt Kurum Adı
                        </label>
                        <Input
                          value={data.alt_kurum_ozel_tanim || ''}
                          onChange={(e) => onChange('alt_kurum_ozel_tanim', e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Bizim (1. Çoğul)
                        </label>
                        <Input
                          value={data.alt_kurum_bizim || ''}
                          onChange={(e) => onChange('alt_kurum_bizim', e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Sizin (2. Çoğul)
                        </label>
                        <Input
                          value={data.alt_kurum_sizin || ''}
                          onChange={(e) => onChange('alt_kurum_sizin', e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Onun (3. Tekil)
                        </label>
                        <Input
                          value={data.alt_kurum_onun || ''}
                          onChange={(e) => onChange('alt_kurum_onun', e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Onların (3. Çoğul)
                        </label>
                        <Input
                          value={data.alt_kurum_onlarin || ''}
                          onChange={(e) => onChange('alt_kurum_onlarin', e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Kamu İhale Mevzuatı Limit Tipi (K.İ.K 22/d Doğrudan Temin Sınırı)
          </label>
          <select
            value={data.limit_tipi || 'diger'}
            onChange={(e) => onChange('limit_tipi', e.target.value)}
            className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2.5 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="buyuksehir">
              Büyükşehir Belediyesi Sınırları Dahilinde Bulunan İdareler
            </option>
            <option value="diger">
              Büyükşehir Belediyesi Sınırları Dışında Kalan (Diğer) İdareler
            </option>
          </select>
        </div>
      </div>
    </div>
  )
}
