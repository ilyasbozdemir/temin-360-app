import React, { useState } from 'react'
import {
  Calculator,
  Plus,
  Trash2,
  Users,
  Building,
  TrendingUp,
  FileCheck2,
  AlertCircle
} from 'lucide-react'
import {
  TasinmazBilgisi,
  KiymetTakdirKomisyonUyesi,
  EmsalArastirma,
  MuhammenBedelHesabi
} from '../types/devletIhale2886.types'

export function MuhammenBedelVeTakdirTab(): React.JSX.Element {
  const [tasinmaz, setTasinmaz] = useState<TasinmazBilgisi>({
    il: 'Karaman',
    ilce: 'Ermenek',
    mahalleKoy: 'Meydan Mahallesi',
    ada: '305',
    parsel: '426',
    yuzolcumuM2: 85.5,
    cinsi: 'Dükkan / İşyeri (Bağımsız Bölüm No: 10)',
    hisseOrani: 'Tam (1/1)',
    mevcutDurumu: 'Boş',
    adres: 'Sanayi Alanı 4. Blok No: 12 Ermenek'
  })

  const [emsaller, setEmsaller] = useState<EmsalArastirma[]>([
    {
      id: '1',
      kaynak: 'Ermenek Esnaf ve Sanatkarlar Odası Başkanlığı Fiyat Araştırması',
      tarih: '2026-03-10',
      metrekareFiyati: 14500,
      aciklama: 'Bölgedeki emsal ticari işyeri m2 birim rayici 14.000 - 15.000 TL aralığında bildirilmiştir.'
    },
    {
      id: '2',
      kaynak: 'Meydan Mahallesi Muhtarlığı ve Bölge Emlak Değerlendirmesi',
      tarih: '2026-03-12',
      metrekareFiyati: 15000,
      aciklama: 'Benzer nitelikteki sanayi alanı dükkan satışları baz alınmıştır.'
    }
  ])

  const [komisyonUyeleri] = useState<KiymetTakdirKomisyonUyesi[]>([
    { id: '1', adSoyad: 'Ahmet YILMAZ', unvan: 'Fen İşleri Müdürü', gorev: 'Baskan' },
    { id: '2', adSoyad: 'Mehmet DEMİR', unvan: 'İnşaat Mühendisi', gorev: 'Uye' },
    { id: '3', adSoyad: 'Ali KAYA', unvan: 'Emlak ve İstimlak Şefi', gorev: 'Uzman' }
  ])

  const [hesap, setHesap] = useState<MuhammenBedelHesabi>({
    birimFiyatM2: 15000,
    toplamAlanM2: 85.5,
    hesaplananBedel: 1282500,
    takdirEdilenMuhammenBedel: 1300000,
    geciciTeminatOrani: 3, // %3
    geciciTeminatTutari: 39000,
    kdvOrani: 20,
    kararTarihi: '2026-03-15',
    kararNo: '2026/08-KT'
  })

  const handleBirimFiyatChange = (val: number) => {
    const calculated = val * (tasinmaz.yuzolcumuM2 || 0)
    const teminat = (hesap.takdirEdilenMuhammenBedel * hesap.geciciTeminatOrani) / 100
    setHesap((prev) => ({
      ...prev,
      birimFiyatM2: val,
      hesaplananBedel: calculated,
      geciciTeminatTutari: teminat
    }))
  }

  const handleTakdirBedelChange = (val: number) => {
    const teminat = (val * hesap.geciciTeminatOrani) / 100
    setHesap((prev) => ({
      ...prev,
      takdirEdilenMuhammenBedel: val,
      geciciTeminatTutari: teminat
    }))
  }

  const formatMoney = (n: number) =>
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
            <label className="text-[11px] font-semibold text-slate-500">İl / İlçe</label>
            <input
              type="text"
              value={`${tasinmaz.il} / ${tasinmaz.ilce}`}
              onChange={(e) => {
                const parts = e.target.value.split('/')
                setTasinmaz({ ...tasinmaz, il: parts[0]?.trim() || '', ilce: parts[1]?.trim() || '' })
              }}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Mahalle / Köy</label>
            <input
              type="text"
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
              value={tasinmaz.yuzolcumuM2}
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
              value={tasinmaz.cinsi}
              onChange={(e) => setTasinmaz({ ...tasinmaz, cinsi: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500">Adres / Konum</label>
            <input
              type="text"
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
              className="px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Üye Ekle
            </button>
          </div>

          <div className="space-y-2">
            {komisyonUyeleri.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{u.adSoyad}</div>
                  <div className="text-[11px] text-slate-500">{u.unvan}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.gorev === 'Baskan'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {u.gorev === 'Baskan' ? 'Komisyon Başkanı' : 'Komisyon Üyesi'}
                </span>
              </div>
            ))}
          </div>
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
              className="px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Emsal Ekle
            </button>
          </div>

          <div className="space-y-2">
            {emsaller.map((e) => (
              <div
                key={e.id}
                className="p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                  <span>{e.kaynak}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    ₺{formatMoney(e.metrekareFiyati)} / m²
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2">{e.aciklama}</div>
              </div>
            ))}
          </div>
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
            Karar No: {hesap.kararNo} ({hesap.kararTarihi})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">Birim m² Rayici</span>
            <div className="mt-1 flex items-center">
              <span className="text-slate-400 mr-1">₺</span>
              <input
                type="number"
                value={hesap.birimFiyatM2}
                onChange={(e) => handleBirimFiyatChange(Number(e.target.value) || 0)}
                className="w-full font-mono font-bold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-slate-400">Komisyon ortalama birim fiyatı</span>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">Hesaplanan Değer (m² x Rayiç)</span>
            <div className="mt-1 font-mono font-bold text-slate-700 dark:text-slate-200 text-sm">
              ₺{formatMoney(hesap.hesaplananBedel)}
            </div>
            <span className="text-[10px] text-slate-400">{tasinmaz.yuzolcumuM2} m² alan karşılığı</span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-500/80 shadow-xs">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              Takdir Edilen Muhammen Bedel
            </span>
            <div className="mt-1 flex items-center">
              <span className="text-blue-600 font-bold mr-1">₺</span>
              <input
                type="number"
                value={hesap.takdirEdilenMuhammenBedel}
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
            <span className="text-[10px] text-emerald-600">İhaleye katılım için yatırılması zorunlu</span>
          </div>
        </div>
      </div>
    </div>
  )
}
