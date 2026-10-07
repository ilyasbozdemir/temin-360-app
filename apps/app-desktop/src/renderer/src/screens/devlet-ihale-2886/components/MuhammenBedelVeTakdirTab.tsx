import React, { useState } from 'react'
import {
  Calculator,
  Plus,
  Users,
  Building,
  TrendingUp,
  UserPlus,
  FileSearch,
  Trash2,
  Sparkles,
  CheckCircle,
  FileCheck,
  Percent,
  Calendar,
  Copy,
  Check
} from 'lucide-react'
import {
  TasinmazBilgisi,
  KiymetTakdirKomisyonUyesi,
  EmsalArastirma,
  MuhammenBedelHesabi,
  IslemTuru2886
} from '../types/devletIhale2886.types'

interface MuhammenBedelVeTakdirTabProps {
  islemTuru?: IslemTuru2886
}

export function MuhammenBedelVeTakdirTab({
  islemTuru = 'satis'
}: MuhammenBedelVeTakdirTabProps): React.JSX.Element {
  const [tasinmaz, setTasinmaz] = useState<TasinmazBilgisi>({
    il: 'Ankara',
    ilce: 'Çankaya',
    mahalleKoy: 'Kızılay',
    ada: '1024',
    parsel: '12',
    yuzolcumuM2: 450,
    cinsi: islemTuru === 'kiralama' ? 'Dükkan / İşyeri' : 'Arsa (Ticari İmarlı)',
    hisseOrani: '1/1 (Tam)',
    mevcutDurumu: 'Boş',
    adres: 'Gazi Mustafa Kemal Bulvarı No: 45'
  })

  // İşlem türüne özel ek parametreler
  const [kiralamaSuresiYil, setKiralamaSuresiYil] = useState<number>(3)
  const [irtifakSuresiYil, setIrtifakSuresiYil] = useState<number>(30)
  const [hasilatPayiOrani, setHasilatPayiOrani] = useState<number>(1.5)
  const [trampaVerilenBedel, setTrampaVerilenBedel] = useState<number>(12500000)
  const [trampaAlinanBedel, setTrampaAlinanBedel] = useState<number>(14000000)

  const [emsaller, setEmsaller] = useState<EmsalArastirma[]>([
    {
      id: 'emsal-1',
      kaynak: 'Emlakçılar Odası Rayiç Bilgisi',
      tarih: new Date().toISOString().split('T')[0],
      metrekareFiyati: islemTuru === 'kiralama' ? 450 : 35000,
      aciklama: 'Bölgedeki benzer ticari nitelikli taşınmazların ortalama rayici'
    },
    {
      id: 'emsal-2',
      kaynak: 'SPK Lisanslı Değerleme Raporu',
      tarih: new Date().toISOString().split('T')[0],
      metrekareFiyati: islemTuru === 'kiralama' ? 480 : 38000,
      aciklama: 'Emsal karşılaştırma ve indirgenmiş nakit akışı yöntemli değerleme'
    }
  ])

  const [komisyonUyeleri, setKomisyonUyeleri] = useState<KiymetTakdirKomisyonUyesi[]>([
    {
      id: 'kom-1',
      adSoyad: 'Ahmet Yılmaz',
      unvan: 'Emlak ve İstimlak Şube Müdürü',
      gorev: 'Baskan'
    },
    {
      id: 'kom-2',
      adSoyad: 'Mehmet Özkan',
      unvan: 'İnşaat Mühendisi / Harita Mühendisi',
      gorev: 'Uye'
    },
    {
      id: 'kom-3',
      adSoyad: 'Ayşe Kaya',
      unvan: 'Mali Hizmetler Uzmanı',
      gorev: 'Uye'
    }
  ])

  const [hesap, setHesap] = useState<MuhammenBedelHesabi>({
    birimFiyatM2: islemTuru === 'kiralama' ? 465 : 36500,
    toplamAlanM2: 450,
    hesaplananBedel: (islemTuru === 'kiralama' ? 465 : 36500) * 450,
    takdirEdilenMuhammenBedel: (islemTuru === 'kiralama' ? 465 : 36500) * 450,
    geciciTeminatOrani: 3, // %3 yasal standart (2886 Md. 25)
    geciciTeminatTutari: ((islemTuru === 'kiralama' ? 465 : 36500) * 450 * 3) / 100,
    kdvOrani: 20,
    kararTarihi: new Date().toISOString().split('T')[0],
    kararNo: '2026/KTK-08'
  })

  const [showTutanakModal, setShowTutanakModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleBirimFiyatChange = (val: number): void => {
    const calculated = val * (tasinmaz.yuzolcumuM2 || 0)
    const teminat = (calculated * hesap.geciciTeminatOrani) / 100
    setHesap((prev) => ({
      ...prev,
      birimFiyatM2: val,
      hesaplananBedel: calculated,
      takdirEdilenMuhammenBedel: calculated,
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

  const handleTeminatOraniChange = (oran: number): void => {
    const teminat = (hesap.takdirEdilenMuhammenBedel * oran) / 100
    setHesap((prev) => ({
      ...prev,
      geciciTeminatOrani: oran,
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

  const handleRemoveKomisyonUyesi = (id: string): void => {
    setKomisyonUyeleri((prev) => prev.filter((u) => u.id !== id))
  }

  const handleAddStandartKomisyon = (): void => {
    setKomisyonUyeleri([
      {
        id: 'kom-std-1',
        adSoyad: 'Komisyon Başkanı',
        unvan: 'Harcama Yetkilisi / Şube Müdürü',
        gorev: 'Baskan'
      },
      {
        id: 'kom-std-2',
        adSoyad: 'Teknik Üye',
        unvan: 'Mimar / İnşaat Mühendisi',
        gorev: 'Uye'
      },
      {
        id: 'kom-std-3',
        adSoyad: 'Mali Üye',
        unvan: 'Mali Hizmetler Birim Temsilcisi',
        gorev: 'Uye'
      }
    ])
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

  const handleRemoveEmsal = (id: string): void => {
    setEmsaller((prev) => prev.filter((e) => e.id !== id))
  }

  // Emsallerin ortalamasını hesaplayıp birim fiyata uygula
  const emsalOrtalama =
    emsaller.length > 0
      ? Math.round(
          emsaller.reduce((acc, curr) => acc + (curr.metrekareFiyati || 0), 0) / emsaller.length
        )
      : 0

  const handleApplyEmsalOrtalama = (): void => {
    if (emsalOrtalama > 0) {
      handleBirimFiyatChange(emsalOrtalama)
    }
  }

  const formatMoney = (n: number): string =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const cinsiPresets = [
    'Arsa (Ticari İmarlı)',
    'Arsa (Konut İmarlı)',
    'Tarla / Arazi',
    'Dükkan / İşyeri',
    'Büro / Ofis',
    'Depo / Antrepo',
    'Lojman / Konut',
    'Kafeterya / Büfe',
    'Otopark Alanı'
  ]

  const handleCopyTutanak = (): void => {
    const tutanakText = `T.C.
KIYMET TAKDİR KOMİSYONU KARARI
(2886 Sayılı Devlet İhale Kanunu Madde 9 Uyarınca)

Karar No     : ${hesap.kararNo || '2026/KTK-01'}
Karar Tarihi : ${hesap.kararTarihi || new Date().toLocaleDateString('tr-TR')}
İşlem Türü   : ${islemTuru.toUpperCase()}

1. TAŞINMAZ BİLGİLERİ:
- İli/İlçesi       : ${tasinmaz.il} / ${tasinmaz.ilce}
- Mahalle/Köy      : ${tasinmaz.mahalleKoy}
- Ada / Parsel     : ${tasinmaz.ada} / ${tasinmaz.parsel}
- Yüzölçümü        : ${tasinmaz.yuzolcumuM2} m²
- Cinsi / Niteliği : ${tasinmaz.cinsi}
- Hisse Durumu     : ${tasinmaz.hisseOrani}
- Adres            : ${tasinmaz.adres}

2. EMSAL ARAŞTIRMALARI VE DEĞERLEME:
Komisyonumuzca yapılan mahallinde inceleme, çevre rayiçleri ve resmi oda araştırmaları neticesinde ortalama birim m² bedeli ₺${formatMoney(hesap.birimFiyatM2)} olarak tespit edilmiştir.

3. TAKDİR EDİLEN MUHAMMEN BEDEL VE GEÇİCİ TEMİNAT:
- Takdir Edilen Muhammen Bedel : ₺${formatMoney(hesap.takdirEdilenMuhammenBedel)} (${tasinmaz.yuzolcumuM2} m² karşılığı)
- Geçici Teminat Oranı (%${hesap.geciciTeminatOrani}) : ₺${formatMoney(hesap.geciciTeminatTutari)}

4. KOMİSYON HEYETİ:
${komisyonUyeleri.map((u) => `- [${u.gorev === 'Baskan' ? 'BAŞKAN' : 'ÜYE'}] ${u.adSoyad} (${u.unvan})`).join('\n')}

Yukarıda vasıfları belirtilen taşınmazın 2886 sayılı Devlet İhale Kanunu kapsamında ihaleye çıkarılması için muhammen bedeli oybirliğiyle takdir ve imza altına alınmıştır.`

    navigator.clipboard.writeText(tutanakText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* 1. Taşınmaz Künye Bilgileri */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-500" />
            1. Taşınmaz / Mal Bilgileri ve Tapu Kaydı
          </h3>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {islemTuru === 'satis' && '🏷️ Mülkiyet Satışı'}
            {islemTuru === 'kiralama' && '🏢 Kiralama İşlemi'}
            {islemTuru === 'irtifak' && '📜 İrtifak / Üst Hakkı'}
            {islemTuru === 'irtifak_intifa' && '📜 İrtifak / İntifa'}
            {islemTuru === 'trampa' && '🔄 Trampa (Takas)'}
          </span>
        </div>

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
                const calc = m2 * hesap.birimFiyatM2
                setHesap((prev) => ({
                  ...prev,
                  toplamAlanM2: m2,
                  hesaplananBedel: calc,
                  takdirEdilenMuhammenBedel: calc,
                  geciciTeminatTutari: (calc * prev.geciciTeminatOrani) / 100
                }))
              }}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-blue-600 dark:text-blue-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Cinsi & Nitelik</span>
              <span className="text-[10px] text-slate-400">Hızlı seçim aşağıda</span>
            </label>
            <input
              type="text"
              placeholder="Taşınmaz cinsi (Örn: Arsa, Dükkan, Tarla)..."
              value={tasinmaz.cinsi}
              onChange={(e) => setTasinmaz({ ...tasinmaz, cinsi: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {cinsiPresets.slice(0, 5).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTasinmaz({ ...tasinmaz, cinsi: preset })}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Hisse / Mevcut Durum</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Hisse (1/1)"
                value={tasinmaz.hisseOrani}
                onChange={(e) => setTasinmaz({ ...tasinmaz, hisseOrani: e.target.value })}
                className="w-1/2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
              />
              <select
                value={tasinmaz.mevcutDurumu}
                onChange={(e) => setTasinmaz({ ...tasinmaz, mevcutDurumu: e.target.value })}
                className="w-1/2 px-2 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
              >
                <option value="Boş">Boş</option>
                <option value="Kirada">Kirada</option>
                <option value="İşgalli / Ecrimisilli">İşgalli</option>
                <option value="Tahsisli">Tahsisli</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold text-slate-500">Adres / Konum Detayı</label>
            <input
              type="text"
              placeholder="Açık adres / mevkii bilgisi..."
              value={tasinmaz.adres}
              onChange={(e) => setTasinmaz({ ...tasinmaz, adres: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* İşlem Türüne Özel Ek Parametreler */}
        {islemTuru === 'kiralama' && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Kiralama Süresi:
                </span>
                <select
                  value={kiralamaSuresiYil}
                  onChange={(e) => setKiralamaSuresiYil(Number(e.target.value))}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg font-bold text-amber-700 dark:text-amber-300"
                >
                  <option value={1}>1 Yıl (Standart)</option>
                  <option value={3}>3 Yıl (Azami Genel İdare Yetkisi)</option>
                  <option value={5}>5 Yıl (Meclis/Bakanlık İzni Gerekir)</option>
                  <option value={10}>10 Yıl (Özel Tesis / Yatırım Şartlı)</option>
                </select>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                ⚠️ 2886 Md. 64: 3 yıldan fazla süreli kiralamalarda yetkili organ onayı zorunludur.
              </p>
            </div>
          </div>
        )}

        {islemTuru === 'irtifak' && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  İrtifak / Üst Hakkı Süresi (Yıl)
                </label>
                <input
                  type="number"
                  value={irtifakSuresiYil}
                  onChange={(e) => setIrtifakSuresiYil(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Yıllık Hasılat Payı Oranı (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={hasilatPayiOrani}
                  onChange={(e) => setHasilatPayiOrani(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bold font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {islemTuru === 'trampa' && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-purple-900 dark:text-purple-300">
                  İdare Taşınmazı Rayici (₺)
                </label>
                <input
                  type="number"
                  value={trampaVerilenBedel}
                  onChange={(e) => setTrampaVerilenBedel(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-lg font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-purple-900 dark:text-purple-300">
                  Alınacak Taşınmaz Rayici (₺)
                </label>
                <input
                  type="number"
                  value={trampaAlinanBedel}
                  onChange={(e) => setTrampaAlinanBedel(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-lg font-bold font-mono"
                />
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-purple-300 dark:border-purple-700 flex flex-col justify-center">
                <span className="text-[10px] text-slate-500 font-medium">Denkleştirme Farkı:</span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 font-mono">
                  {trampaAlinanBedel >= trampaVerilenBedel
                    ? `+₺${formatMoney(trampaAlinanBedel - trampaVerilenBedel)} (İdare Lehine)`
                    : `-₺${formatMoney(trampaVerilenBedel - trampaAlinanBedel)} (İdare Öder)`}
                </span>
              </div>
            </div>
          </div>
        )}
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
            <div className="flex items-center gap-1.5">
              {komisyonUyeleri.length === 0 && (
                <button
                  type="button"
                  onClick={handleAddStandartKomisyon}
                  className="px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Şablon Yükle
                </button>
              )}
              <button
                type="button"
                onClick={handleAddKomisyonUyesi}
                className="px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Üye Ekle
              </button>
            </div>
          </div>

          {komisyonUyeleri.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
              <UserPlus className="w-7 h-7 mb-2 opacity-50" />
              <p className="text-xs font-medium">Henüz komisyon üyesi atanmadı.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                2886 sayılı kanuna uygun komisyon üyelerini eklemek için butonu kullanabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {komisyonUyeleri.map((u, idx) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs gap-2"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Ad Soyad"
                      value={u.adSoyad}
                      onChange={(e) => {
                        const updated = [...komisyonUyeleri]
                        updated[idx].adSoyad = e.target.value
                        setKomisyonUyeleri(updated)
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold"
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
                  <select
                    value={u.gorev}
                    onChange={(e) => {
                      const updated = [...komisyonUyeleri]
                      updated[idx].gorev = e.target.value as 'Baskan' | 'Uye' | 'Uzman'
                      setKomisyonUyeleri(updated)
                    }}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 border border-slate-200 dark:border-slate-700 ${
                      u.gorev === 'Baskan'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    <option value="Baskan">Başkan</option>
                    <option value="Uye">Üye</option>
                    <option value="Uzman">Bilirkişi / Uzman</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveKomisyonUyesi(u.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                    title="Üyeyi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
            <div className="flex items-center gap-1.5">
              {emsalOrtalama > 0 && (
                <button
                  type="button"
                  onClick={handleApplyEmsalOrtalama}
                  className="px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Ortalamayı Birim m² Fiyatına Aktar"
                >
                  <Sparkles className="w-3 h-3" /> Ortalamayı Aktar (₺{formatMoney(emsalOrtalama)})
                </button>
              )}
              <button
                type="button"
                onClick={handleAddEmsal}
                className="px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Emsal Ekle
              </button>
            </div>
          </div>

          {emsaller.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
              <FileSearch className="w-7 h-7 mb-2 opacity-50" />
              <p className="text-xs font-medium">Henüz emsal rayiç araştırması eklenmedi.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bölgedeki emsal satış, kira ve bilirkişi araştırmalarını girmek için butonu
                kullanabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-55 overflow-y-auto custom-scrollbar pr-1">
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
                    <button
                      type="button"
                      onClick={() => handleRemoveEmsal(e.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                      title="Emsali Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
      <div className="bg-linear-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 border border-blue-200/80 dark:border-blue-800/60 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-xs font-bold text-blue-950 dark:text-blue-100 uppercase tracking-wider">
                Muhammen Bedel & İhale Katılım Teminatı Hesabı
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                2886 sayılı Kanun Md. 9 (Kıymet Takdiri) ve Md. 25 (Geçici Teminat)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-500">Karar No:</span>
              <input
                type="text"
                placeholder="2026/KTK-01"
                value={hesap.kararNo}
                onChange={(e) => setHesap({ ...hesap, kararNo: e.target.value })}
                className="w-28 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-bold"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowTutanakModal(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Karar Tutanağı</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Birim m2 */}
          <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                Birim m² Rayici{' '}
                {islemTuru === 'kiralama' ? '(Aylık/Yıllık)' : islemTuru === 'irtifak' ? '(Yıllık)' : ''}
              </span>
              <Percent className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1.5 flex items-center">
              <span className="text-slate-400 font-bold mr-1">₺</span>
              <input
                type="number"
                placeholder="0"
                value={hesap.birimFiyatM2 || ''}
                onChange={(e) => handleBirimFiyatChange(Number(e.target.value) || 0)}
                className="w-full font-mono font-bold text-slate-800 dark:text-slate-100 text-base bg-transparent focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {emsalOrtalama > 0 ? `Emsal Ort: ₺${formatMoney(emsalOrtalama)}` : 'Komisyon birim rayici'}
            </span>
          </div>

          {/* Hesaplanan Değer */}
          <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500">
              Hesaplanan Değer (m² x Rayiç)
            </span>
            <div className="mt-1.5 font-mono font-bold text-slate-700 dark:text-slate-200 text-base">
              ₺{formatMoney(hesap.hesaplananBedel)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {tasinmaz.yuzolcumuM2} m² toplam alan karşılığı
            </span>
          </div>

          {/* Takdir Edilen Muhammen Bedel */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-500 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Takdir Edilen Muhammen Bedel
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-blue-600 font-bold mr-1">₺</span>
              <input
                type="number"
                placeholder="0"
                value={hesap.takdirEdilenMuhammenBedel || ''}
                onChange={(e) => handleTakdirBedelChange(Number(e.target.value) || 0)}
                className="w-full font-mono font-extrabold text-blue-700 dark:text-blue-300 text-lg bg-transparent focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-blue-500 block mt-0.5">
              İhale asgari açılış taban fiyatı
            </span>
          </div>

          {/* Geçici Teminat */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                Geçici Teminat (%{hesap.geciciTeminatOrani})
              </span>
              <div className="flex gap-1">
                {[3, 5, 10].map((oran) => (
                  <button
                    key={oran}
                    type="button"
                    onClick={() => handleTeminatOraniChange(oran)}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                      hesap.geciciTeminatOrani === oran
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    }`}
                  >
                    %{oran}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-1 font-mono font-extrabold text-emerald-800 dark:text-emerald-200 text-lg">
              ₺{formatMoney(hesap.geciciTeminatTutari)}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              2886 Md. 25 uyarınca katılım şartı
            </span>
          </div>
        </div>
      </div>

      {/* Karar Tutanağı Modalı */}
      {showTutanakModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Kıymet Takdir Komisyon Karar Tutanağı Önizleme
              </h4>
              <button
                type="button"
                onClick={() => setShowTutanakModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-xs p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 select-all">
              {`T.C.
KIYMET TAKDİR KOMİSYONU KARARI
(2886 Sayılı Devlet İhale Kanunu Madde 9 Uyarınca)

Karar No     : ${hesap.kararNo || '2026/KTK-01'}
Karar Tarihi : ${hesap.kararTarihi || new Date().toLocaleDateString('tr-TR')}
İşlem Türü   : ${islemTuru.toUpperCase()}

1. TAŞINMAZ BİLGİLERİ:
- İli/İlçesi       : ${tasinmaz.il} / ${tasinmaz.ilce}
- Mahalle/Köy      : ${tasinmaz.mahalleKoy}
- Ada / Parsel     : ${tasinmaz.ada} / ${tasinmaz.parsel}
- Yüzölçümü        : ${tasinmaz.yuzolcumuM2} m²
- Cinsi / Niteliği : ${tasinmaz.cinsi}
- Hisse Durumu     : ${tasinmaz.hisseOrani}
- Adres            : ${tasinmaz.adres}

2. EMSAL ARAŞTIRMALARI VE DEĞERLEME:
Komisyonumuzca yapılan mahallinde inceleme, çevre rayiçleri ve resmi oda araştırmaları neticesinde ortalama birim m² bedeli ₺${formatMoney(hesap.birimFiyatM2)} olarak tespit edilmiştir.

3. TAKDİR EDİLEN MUHAMMEN BEDEL VE GEÇİCİ TEMİNAT:
- Takdir Edilen Muhammen Bedel : ₺${formatMoney(hesap.takdirEdilenMuhammenBedel)} (${tasinmaz.yuzolcumuM2} m² karşılığı)
- Geçici Teminat Oranı (%${hesap.geciciTeminatOrani}) : ₺${formatMoney(hesap.geciciTeminatTutari)}

4. KOMİSYON HEYETİ:
${komisyonUyeleri.map((u) => `- [${u.gorev === 'Baskan' ? 'BAŞKAN' : 'ÜYE'}] ${u.adSoyad} (${u.unvan})`).join('\n')}

Yukarıda vasıfları belirtilen taşınmazın 2886 sayılı Devlet İhale Kanunu kapsamında ihaleye çıkarılması için muhammen bedeli oybirliğiyle takdir ve imza altına alınmıştır.`}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCopyTutanak}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTutanakModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

