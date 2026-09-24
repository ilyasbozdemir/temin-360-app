import React, { useEffect, useState } from 'react'
import { Calculator, CheckCircle2, Plus, Save, X } from 'lucide-react'
import { useAyarlarHooks } from '../../ayarlar/ayarlar.hooks'
import { useSettingsStore } from '../../../store/settingsStore'

type VergiOrani = {
  id: string
  ad: string
  oran: string
  tur: 'yuzde' | 'binde'
  hesapKodu: string
}

type TevkifatOrani = {
  id: string
  ad: string
  pay: number
  payda: number
}

export function OranlarTab(): React.JSX.Element {
  const { settings, saveSettings } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()

  const [rates, _setRates] = useState<VergiOrani[]>([
    {
      id: '1',
      ad: 'Hakediş Damga Vergisi',
      oran: '9,48',
      tur: 'binde',
      hesapKodu: '360.01.01'
    },
    {
      id: '2',
      ad: 'İhale Karar Damga Vergisi',
      oran: '5,69',
      tur: 'binde',
      hesapKodu: '360.01.02'
    },
    {
      id: '3',
      ad: 'Katma Değer Vergisi (%20)',
      oran: '20',
      tur: 'yuzde',
      hesapKodu: '360.02.01'
    },
    {
      id: '4',
      ad: 'Katma Değer Vergisi (%10)',
      oran: '10',
      tur: 'yuzde',
      hesapKodu: '360.02.02'
    },
    {
      id: '5',
      ad: 'Katma Değer Vergisi (%1)',
      oran: '1',
      tur: 'yuzde',
      hesapKodu: '360.02.03'
    }
  ])

  const [tevkifatRates, _setTevkifatRates] = useState<TevkifatOrani[]>([
    { id: '1', ad: 'Temizlik, Çevre ve Bahçe Bakım Hizmetleri', pay: 9, payda: 10 },
    { id: '2', ad: 'Özel Güvenlik ve İşgücü Temin Hizmetleri', pay: 9, payda: 10 },
    { id: '3', ad: 'Danışmanlık, Denetim ve Müşavirlik Hizmetleri', pay: 9, payda: 10 },
    { id: '4', ad: 'Makine, Teçhizat, Demirbaş Bakım Onarım', pay: 7, payda: 10 },
    {
      id: '5',
      ad: 'Yapım İşleri ile Mimarlık-Mühendislik ve Etüt-Proje Hizmetleri',
      pay: 4,
      payda: 10
    },
    { id: '6', ad: 'Yemek Servis ve Organizasyon Hizmetleri', pay: 5, payda: 10 },
    { id: '7', ad: 'Servis ve Servis Taşımacılığı Hizmetleri', pay: 5, payda: 10 },
    { id: '8', ad: 'Diğer Hizmet Alımları', pay: 5, payda: 10 }
  ])

  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const setRates = (val: React.SetStateAction<typeof rates>) => {
    _setRates(val)
    setIsConfirmed(false)
  }

  const setTevkifatRates = (val: React.SetStateAction<typeof tevkifatRates>) => {
    _setTevkifatRates(val)
    setIsConfirmed(false)
  }

  useEffect(() => {
    if (settings?.rates) {
      try {
        _setRates(JSON.parse(settings.rates))
      } catch (e) {
        console.error('Error parsing rates', e)
      }
    }
    if (settings?.tevkifatRates) {
      try {
        _setTevkifatRates(JSON.parse(settings.tevkifatRates))
      } catch (e) {
        console.error('Error parsing tevkifatRates', e)
      }
    }
  }, [settings])

  const handleSave = async (): Promise<void> => {
    setIsSaving(true)
    try {
      await saveSettings({
        rates: JSON.stringify(rates),
        tevkifatRates: JSON.stringify(tevkifatRates)
      })
      await reloadSettingsStore()
    } catch (error) {
      console.error('Error saving mevzuat settings:', error)
      alert('Kaydetme hatası!')
    } finally {
      setIsSaving(false)
      setIsConfirmed(false)
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 rounded-t-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
            />
            <span>Değerlerin doğruluğunu onaylıyorum</span>
          </label>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !isConfirmed}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-500/30 cursor-pointer"
        >
          {isSaving ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
          <Calculator className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Vergi ve Tevkifat Oranları</p>
            <p>
              Burada belirlediğiniz oranlar, hakediş ve ödeme emri belgeleri oluşturulurken otomatik
              hesaplamalarda varsayılan değer olarak kullanılır.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Vergi ve Kesinti Tanımları
            </h3>
            <button
              onClick={() =>
                setRates([
                  ...rates,
                  {
                    id: Date.now().toString(),
                    ad: 'Yeni Kesinti',
                    oran: '0',
                    tur: 'yuzde',
                    hesapKodu: ''
                  }
                ])
              }
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Yeni Ekle
            </button>
          </div>
          <div className="p-5 space-y-4">
            {rates.map((rate, index) => (
              <div
                key={rate.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl relative group"
              >
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Kesinti/Vergi Adı
                  </label>
                  <input
                    type="text"
                    value={rate.ad}
                    onChange={(e) => {
                      const newRates = [...rates]
                      newRates[index].ad = e.target.value
                      setRates(newRates)
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Türü
                  </label>
                  <select
                    value={rate.tur}
                    onChange={(e) => {
                      const newRates = [...rates]
                      newRates[index].tur = e.target.value as 'yuzde' | 'binde'
                      setRates(newRates)
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <option value="yuzde">Yüzde (%)</option>
                    <option value="binde">Binde (‰)</option>
                  </select>
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Oran Değeri
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={rate.oran}
                      onChange={(e) => {
                        const newRates = [...rates]
                        newRates[index].oran = e.target.value
                        setRates(newRates)
                      }}
                      className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-right font-bold text-emerald-600 dark:text-emerald-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      {rate.tur === 'yuzde' ? '%' : '‰'}
                    </span>
                  </div>
                </div>
                <div className="w-full sm:w-36">
                  <label
                    className="block text-[10px] font-semibold text-slate-500 mb-1"
                    title="Muhasebe Kodu (Ödeme emri belgesi için)"
                  >
                    Muhasebe Kodu
                  </label>
                  <input
                    type="text"
                    value={rate.hesapKodu || ''}
                    onChange={(e) => {
                      const newRates = [...rates]
                      newRates[index].hesapKodu = e.target.value
                      setRates(newRates)
                    }}
                    placeholder="Örn: 360.01.01"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium"
                  />
                </div>
                <div className="w-full sm:w-auto pt-4 sm:pt-0 sm:pl-2 flex items-end">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `'${
                            rate.ad || 'Bu kesinti'
                          }' adlı öğeyi silmek istediğinize emin misiniz?`
                        )
                      ) {
                        setRates(rates.filter((r) => r.id !== rate.id))
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer w-full sm:w-auto flex justify-center"
                    title="Sil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {rates.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm">
                Henüz vergi veya kesinti tanımlanmamış.
              </div>
            )}
          </div>
        </div>

        {/* Tevkifat Oranları */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mt-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              KDV Tevkifat Oranları
            </h3>
            <button
              onClick={() =>
                setTevkifatRates([
                  ...tevkifatRates,
                  {
                    id: Date.now().toString(),
                    ad: 'Yeni Tevkifat',
                    pay: 5,
                    payda: 10
                  }
                ])
              }
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Yeni Ekle
            </button>
          </div>
          <div className="p-5 space-y-4">
            {tevkifatRates.map((rate, index) => (
              <div
                key={rate.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl relative group"
              >
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Tevkifat Adı / Türü
                  </label>
                  <input
                    type="text"
                    value={rate.ad}
                    onChange={(e) => {
                      const newRates = [...tevkifatRates]
                      newRates[index].ad = e.target.value
                      setTevkifatRates(newRates)
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium"
                  />
                </div>
                <div className="w-full sm:w-24">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Pay</label>
                  <input
                    type="number"
                    value={rate.pay}
                    onChange={(e) => {
                      const newRates = [...tevkifatRates]
                      newRates[index].pay = parseInt(e.target.value) || 0
                      setTevkifatRates(newRates)
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div className="w-4 text-center text-slate-400 font-bold hidden sm:block pt-4">
                  /
                </div>
                <div className="w-full sm:w-24">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Payda
                  </label>
                  <input
                    type="number"
                    value={rate.payda}
                    onChange={(e) => {
                      const newRates = [...tevkifatRates]
                      newRates[index].payda = parseInt(e.target.value) || 10
                      setTevkifatRates(newRates)
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-bold text-slate-600 dark:text-slate-400"
                  />
                </div>
                <div className="w-full sm:w-auto pt-4 sm:pt-0 sm:pl-2 flex items-end">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `'${rate.ad}' adlı tevkifat oranını silmek istediğinize emin misiniz?`
                        )
                      ) {
                        setTevkifatRates(tevkifatRates.filter((r) => r.id !== rate.id))
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer w-full sm:w-auto flex justify-center"
                    title="Sil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {tevkifatRates.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm">
                Henüz tevkifat oranı tanımlanmamış.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
