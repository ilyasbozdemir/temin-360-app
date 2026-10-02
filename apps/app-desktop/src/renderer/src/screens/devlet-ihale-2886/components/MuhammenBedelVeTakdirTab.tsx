import React, { useState } from 'react'
import { Calculator, Plus, Users, Building, TrendingUp, UserPlus, FileSearch } from 'lucide-react'
import {
  TasinmazBilgisi,
  KiymetTakdirKomisyonUyesi,
  EmsalArastirma,
  MuhammenBedelHesabi
} from '../types/devletIhale2886.types'

export function MuhammenBedelVeTakdirTab(): React.JSX.Element {
  const [tasinmaz, setTasinmaz] = useState<TasinmazBilgisi>({
    il: '',
    ilce: '',
    mahalleKoy: '',
    ada: '',
    parsel: '',
    yuzolcumuM2: 0,
    cinsi: '',
    hisseOrani: '',
    mevcutDurumu: '',
    adres: ''
  })

  const [emsaller, setEmsaller] = useState<EmsalArastirma[]>([])

  const [komisyonUyeleri, setKomisyonUyeleri] = useState<KiymetTakdirKomisyonUyesi[]>([])

  const [hesap, setHesap] = useState<MuhammenBedelHesabi>({
    birimFiyatM2: 0,
    toplamAlanM2: 0,
    hesaplananBedel: 0,
    takdirEdilenMuhammenBedel: 0,
    geciciTeminatOrani: 3, // %3 yasal standart
    geciciTeminatTutari: 0,
    kdvOrani: 20,
    kararTarihi: '',
    kararNo: ''
  })

  const handleBirimFiyatChange = (val: number): void => {
    const calculated = val * (tasinmaz.yuzolcumuM2 || 0)
    const teminat = (hesap.takdirEdilenMuhammenBedel * hesap.geciciTeminatOrani) / 100
    setHesap((prev) => ({
      ...prev,
      birimFiyatM2: val,
      hesaplananBedel: calculated,
      geciciTeminatTutari: teminat
    }))
  }

  const handleTakdirBedelChange = (val: number): void => {
    const teminat = (val * hesap.geciciTeminatOrani) / 100
    setHesap((prev) => ({
      ...prev,
      takdirEdilenMuhammenBedel: val,
      geciciTeminatTutari: teminat
    }))
  }

  const handleAddKomisyonUyesi = (): void => {
    const yeniUye: KiymetTakdirKomisyonUyesi = {
      id: String(Date.now()),
      adSoyad: '',
      unvan: '',
      gorev: komisyonUyeleri.length === 0 ? 'Baskan' : 'Uye'
    }
    setKomisyonUyeleri((prev) => [...prev, yeniUye])
  }

  const handleAddEmsal = (): void => {
    const yeniEmsal: EmsalArastirma = {
      id: String(Date.now()),
      kaynak: '',
      tarih: new Date().toISOString().split('T')[0],
      metrekareFiyati: 0,
      aciklama: ''
    }
    setEmsaller((prev) => [...prev, yeniEmsal])
  }

  const formatMoney = (n: number): string =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-4">
      {/* 1. Taşınmaz Künye Bilgileri */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-500" />
          1. Taşınmaz / Mal Bilgileri ve Tapu Kaydı
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-500">İl</label>
            <input
              type="text"
              placeholder="İl giriniz..."
              value={tasinmaz.il}
              onChange={(e) => setTasinmaz({ ...tasinmaz, il: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">İlçe</label>
            <input
              type="text"
              placeholder="İlçe giriniz..."
              value={tasinmaz.ilce}
              onChange={(e) => setTasinmaz({ ...tasinmaz, ilce: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Mahalle / Köy</label>
            <input
              type="text"
              placeholder="Mahalle veya köy..."
              value={tasinmaz.mahalleKoy}
              onChange={(e) => setTasinmaz({ ...tasinmaz, mahalleKoy: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Ada / Parsel</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Ada"
                value={tasinmaz.ada}
                onChange={(e) => setTasinmaz({ ...tasinmaz, ada: e.target.value })}
                className="w-1/2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Parsel"
                value={tasinmaz.parsel}
                onChange={(e) => setTasinmaz({ ...tasinmaz, parsel: e.target.value })}
                className="w-1/2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Yüzölçümü (m²)</label>
            <input
              type="number"
              placeholder="0"
              value={tasinmaz.yuzolcumuM2 || ''}
              onChange={(e) => {
                const m2 = Number(e.target.value) || 0
                setTasinmaz({ ...tasinmaz, yuzolcumuM2: m2 })
                setHesap((prev) => ({
                  ...prev,
                  toplamAlanM2: m2,
                  hesaplananBedel: m2 * prev.birimFiyatM2
                }))
              }}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500">Cinsi & Nitelik</label>
            <input
              type="text"
              placeholder="Taşınmaz cinsi (Örn: Arsa, Dükkan, Tarla)..."
              value={tasinmaz.cinsi}
              onChange={(e) => setTasinmaz({ ...tasinmaz, cinsi: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Hisse Oranı</label>
            <input
              type="text"
              placeholder="Tam (1/1)..."
              value={tasinmaz.hisseOrani}
              onChange={(e) => setTasinmaz({ ...tasinmaz, hisseOrani: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>

          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold text-slate-500">Adres / Konum</label>
            <input
              type="text"
              placeholder="Açık adres / mevkii bilgisi..."
              value={tasinmaz.adres}
              onChange={(e) => setTasinmaz({ ...tasinmaz, adres: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. Kıymet Takdir Komisyonu ve Emsal Araştırmaları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Komisyon Üyeleri */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Kıymet Takdir Komisyonu (2886 Md. 9)
            </h3>
            <button
              type="button"
              onClick={handleAddKomisyonUyesi}
              className="px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Üye Ekle
            </button>
          </div>

          {komisyonUyeleri.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
              <UserPlus className="w-7 h-7 mb-2 opacity-50" />
              <p className="text-xs font-medium">Henüz komisyon üyesi atanmadı.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                2886 sayılı kanuna uygun komisyon üyelerini eklemek için yukarıdaki butonu
                kullanabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {komisyonUyeleri.map((u, idx) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2 mr-2">
                    <input
                      type="text"
                      placeholder="Ad Soyad"
                      value={u.adSoyad}
                      onChange={(e) => {
                        const updated = [...komisyonUyeleri]
                        updated[idx].adSoyad = e.target.value
                        setKomisyonUyeleri(updated)
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Ünvan (Örn: Şube Müdürü)"
                      value={u.unvan}
                      onChange={(e) => {
                        const updated = [...komisyonUyeleri]
                        updated[idx].unvan = e.target.value
                        setKomisyonUyeleri(updated)
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs"
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 ${
                      u.gorev === 'Baskan'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    {u.gorev === 'Baskan' ? 'Başkan' : 'Üye'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emsal ve Piyasa Araştırmaları */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Emsal Rayiç ve Piyasa Araştırmaları
            </h3>
            <button
              type="button"
              onClick={handleAddEmsal}
              className="px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Emsal Ekle
            </button>
          </div>

          {emsaller.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
              <FileSearch className="w-7 h-7 mb-2 opacity-50" />
              <p className="text-xs font-medium">Henüz emsal rayiç araştırması eklenmedi.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bölgedeki emsal satış ve bilirkişi araştırmalarını girmek için yukarıdaki butonu
                kullanabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {emsaller.map((e, idx) => (
                <div
                  key={e.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <input
                      type="text"
                      placeholder="Kaynak / Kurum adı..."
                      value={e.kaynak}
                      onChange={(evt) => {
                        const updated = [...emsaller]
                        updated[idx].kaynak = evt.target.value
                        setEmsaller(updated)
                      }}
                      className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold"
                    />
                    <div className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                      <span>₺</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={e.metrekareFiyati || ''}
                        onChange={(evt) => {
                          const updated = [...emsaller]
                          updated[idx].metrekareFiyati = Number(evt.target.value) || 0
                          setEmsaller(updated)
                        }}
                        className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold text-right"
                      />
                      <span className="text-[11px]">/ m²</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Açıklama / tespit detayı..."
                    value={e.aciklama}
                    onChange={(evt) => {
                      const updated = [...emsaller]
                      updated[idx].aciklama = evt.target.value
                      setEmsaller(updated)
                    }}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[11px] text-slate-600 dark:text-slate-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Muhammen Bedel ve Geçici Teminat Hesap Özeti */}
      <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 border border-blue-200/80 dark:border-blue-800/60 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            Muhammen Bedel & İhale Katılım Teminatı Hesabı
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            {hesap.kararNo ? `Karar No: ${hesap.kararNo}` : 'Karar henüz oluşturulmadı'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">Birim m² Rayici</span>
            <div className="mt-1 flex items-center">
              <span className="text-slate-400 mr-1">₺</span>
              <input
                type="number"
                placeholder="0"
                value={hesap.birimFiyatM2 || ''}
                onChange={(e) => handleBirimFiyatChange(Number(e.target.value) || 0)}
                className="w-full font-mono font-bold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-slate-400">Komisyon ortalama birim fiyatı</span>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">
              Hesaplanan Değer (m² x Rayiç)
            </span>
            <div className="mt-1 font-mono font-bold text-slate-700 dark:text-slate-200 text-sm">
              ₺{formatMoney(hesap.hesaplananBedel)}
            </div>
            <span className="text-[10px] text-slate-400">
              {tasinmaz.yuzolcumuM2} m² alan karşılığı
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-500/80 shadow-xs">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              Takdir Edilen Muhammen Bedel
            </span>
            <div className="mt-1 flex items-center">
              <span className="text-blue-600 font-bold mr-1">₺</span>
              <input
                type="number"
                placeholder="0"
                value={hesap.takdirEdilenMuhammenBedel || ''}
                onChange={(e) => handleTakdirBedelChange(Number(e.target.value) || 0)}
                className="w-full font-mono font-extrabold text-blue-700 dark:text-blue-300 text-sm bg-transparent focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-blue-500">İhale açılış / asgari taban fiyatı</span>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              Geçici Teminat Tutarı (%{hesap.geciciTeminatOrani})
            </span>
            <div className="mt-1 font-mono font-extrabold text-emerald-800 dark:text-emerald-200 text-sm">
              ₺{formatMoney(hesap.geciciTeminatTutari)}
            </div>
            <span className="text-[10px] text-emerald-600">
              İhaleye katılım için yatırılması zorunlu
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
