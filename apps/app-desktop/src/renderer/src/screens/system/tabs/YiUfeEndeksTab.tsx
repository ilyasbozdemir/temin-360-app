import React, { useEffect, useMemo, useState } from 'react'
import {
  Calculator,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react'
import {
  AY_ISIMLERI,
  MonthlyEndeksRecord,
  YearEndeksGroup,
  yiUfeService
} from '../../../services/yiUfeService'

export function YiUfeEndeksTab(): React.JSX.Element {
  const [dataVersion, setDataVersion] = useState(0)
  const [yearGroups, setYearGroups] = useState<YearEndeksGroup[]>([])
  const [searchYear, setSearchYear] = useState('')
  const [selectedDecade, setSelectedDecade] = useState<'ALL' | '2020s' | '2010s' | '2000s' | '1990s'>('ALL')

  // Modal Durumları
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalYil, setModalYil] = useState(2026)
  const [modalAy, setModalAy] = useState(9)
  const [modalEndeks, setModalEndeks] = useState('')
  const [modalAciklama, setModalAciklama] = useState('')
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)

  // Canlı Simülatör State
  const [simTutar, setSimTutar] = useState('100000')
  const [simBaseYil, setSimBaseYil] = useState(2024)
  const [simBaseAy, setSimBaseAy] = useState(1)
  const [simTargetYil, setSimTargetYil] = useState(2026)
  const [simTargetAy, setSimTargetAy] = useState(8)

  useEffect(() => {
    yiUfeService.loadFromDatabase().then(() => {
      setYearGroups(yiUfeService.getGroupedByYears())
    })

    const handleUpdate = () => {
      setYearGroups(yiUfeService.getGroupedByYears())
      setDataVersion((v) => v + 1)
    }

    window.addEventListener('yi-ufe-updated', handleUpdate)
    return () => window.removeEventListener('yi-ufe-updated', handleUpdate)
  }, [dataVersion])

  const latest = useMemo(() => {
    return yiUfeService.getLatest()
  }, [yearGroups])

  // Son 1 yıl önceki aynı ayın endeksi (Yıllık değişim hesabı için)
  const yillikDegisim = useMemo(() => {
    const prevYearVal = yiUfeService.getIndex(latest.yil - 1, latest.ay)
    if (!prevYearVal || prevYearVal <= 0) return null
    return ((latest.endeks - prevYearVal) / prevYearVal) * 100
  }, [latest])

  // Bir önceki ayın endeksi (Aylık değişim hesabı için)
  const aylikDegisim = useMemo(() => {
    const prevAy = latest.ay === 1 ? 12 : latest.ay - 1
    const prevYil = latest.ay === 1 ? latest.yil - 1 : latest.yil
    const prevVal = yiUfeService.getIndex(prevYil, prevAy)
    if (!prevVal || prevVal <= 0) return null
    return ((latest.endeks - prevVal) / prevVal) * 100
  }, [latest])

  // Simülatör Canlı Hesaplama
  const simResult = useMemo(() => {
    const tutar = parseFloat(simTutar.replace(/\./g, '').replace(/,/g, '.')) || 0
    return yiUfeService.calculateAdjustment({
      basePrice: tutar,
      baseYear: simBaseYil,
      baseMonth: simBaseAy,
      targetYear: simTargetYil,
      targetMonth: simTargetAy
    })
  }, [simTutar, simBaseYil, simBaseAy, simTargetYil, simTargetAy, yearGroups])

  // Filtrelenmiş Yıllar
  const filteredGroups = useMemo(() => {
    return yearGroups.filter((g) => {
      if (searchYear.trim() && !String(g.yil).includes(searchYear.trim())) {
        return false
      }
      if (selectedDecade === '2020s' && (g.yil < 2020 || g.yil > 2029)) return false
      if (selectedDecade === '2010s' && (g.yil < 2010 || g.yil > 2019)) return false
      if (selectedDecade === '2000s' && (g.yil < 2000 || g.yil > 2009)) return false
      if (selectedDecade === '1990s' && (g.yil < 1990 || g.yil > 1999)) return false
      return true
    })
  }, [yearGroups, searchYear, selectedDecade])

  const openAddForMonth = (yil: number, ay: number, currentVal?: number | null) => {
    setModalYil(yil)
    setModalAy(ay)
    setModalEndeks(currentVal ? currentVal.toString().replace('.', ',') : '')
    setModalAciklama('')
    setShowAddModal(true)
  }

  const handleSaveEndeks = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(modalEndeks.replace(/\./g, '').replace(/,/g, '.'))
    if (isNaN(num) || num <= 0) {
      alert('Lütfen geçerli bir endeks değeri giriniz.')
      return
    }

    await yiUfeService.saveOrUpdateEndeks(modalYil, modalAy, num, modalAciklama)
    setYearGroups(yiUfeService.getGroupedByYears())
    setShowAddModal(false)
    setSaveSuccessMsg(`${modalYil} ${AY_ISIMLERI[modalAy - 1]} Yİ-ÜFE endeksi başarıyla kaydedildi: ${modalEndeks}`)
    setTimeout(() => setSaveSuccessMsg(null), 3500)
  }

  const openHakedisOrg = () => {
    const url = 'https://www.hakedis.org/endeksler/yi-ufe-yurtici-uretici-fiyat-endeksi'
    if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('open-external-url', url)
    } else {
      window.open(url, '_blank')
    }
  }

  const formatNumber = (val: number | null | undefined, digits = 2) => {
    if (val === null || val === undefined || isNaN(val)) return '-'
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(val)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      {/* 1. HERO KARTI VE TEMEL İSTATİSTİKLER */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              TÜİK Resmi Fiyat Farkı & Değerleme Veritabanı
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <TrendingUp className="w-7 h-7 text-blue-400" />
              Yurt İçi Üretici Fiyat Endeksi (Yİ-ÜFE)
            </h2>
            <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
              Kamu ihale mevzuatı (KİK Md. 53/Kararname), doğrudan temin piyasa fiyat araştırması ve
              hakediş fiyat farkı hesaplamalarında esas alınan 1994 - 2026 aylık endeks matrisi.
            </p>
          </div>

          {/* Hızlı Butonlar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openAddForMonth(2026, latest.ay < 12 ? latest.ay + 1 : 12)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Yeni Ay / Endeks Ekle
            </button>
            <button
              onClick={openHakedisOrg}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
              title="hakedis.org/endeksler sayfasını harici tarayıcıda açar"
            >
              <ExternalLink className="w-4 h-4 text-amber-300" />
              hakedis.org Endeksler
            </button>
          </div>
        </div>

        {/* 4'LÜ KPI KARTLARI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-800/40">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-indigo-200 font-medium">Son Yayınlanan Endeks</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 font-mono">
              {formatNumber(latest.endeks)}
            </div>
            <div className="text-[10px] text-indigo-300/80 mt-0.5">
              {latest.ay_adi} {latest.yil}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-indigo-200 font-medium">Aylık Değişim (MoM)</div>
            <div
              className={`text-xl sm:text-2xl font-black mt-0.5 font-mono ${
                (aylikDegisim || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {aylikDegisim !== null ? `%${formatNumber(aylikDegisim)}` : '-'}
            </div>
            <div className="text-[10px] text-indigo-300/80 mt-0.5">Önceki aya göre</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-indigo-200 font-medium">Yıllık Değişim (YoY)</div>
            <div
              className={`text-xl sm:text-2xl font-black mt-0.5 font-mono ${
                (yillikDegisim || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {yillikDegisim !== null ? `%${formatNumber(yillikDegisim)}` : '-'}
            </div>
            <div className="text-[10px] text-indigo-300/80 mt-0.5">Geçen yıl aynı aya göre</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-indigo-200 font-medium">Kapsanan Veri Seti</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5 font-mono">
              33 Yıl
            </div>
            <div className="text-[10px] text-indigo-300/80 mt-0.5">1994 - 2026 (392 Ay)</div>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. CANLI Yİ-ÜFE FİYAT GÜNCELLEME & ESLEME HESAPLAYICI (SİMÜLATÖR) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Yİ-ÜFE Fiyat Güncelleme / Esleme Hesaplayıcı
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Geçmiş tarihli bir alım fiyatının bugünkü Yİ-ÜFE karşılığını ve fiyat farkı katsayısını hesaplar.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Formül: Pn = Yn / Y0 & Fiyat_Guncel = Fiyat_Eski × Pn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
          {/* Sol Girdiler */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Eski / Baz Fiyat (₺)
              </label>
              <input
                type="text"
                value={simTutar}
                onChange={(e) => setSimTutar(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Örn: 100000"
              />
            </div>

            {/* Baz Tarih (Yıl & Ay) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Baz Dönem (Alım/İhale Tarihi - Y0)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={simBaseYil}
                  onChange={(e) => setSimBaseYil(parseInt(e.target.value, 10))}
                  className="px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {yearGroups.map((g) => (
                    <option key={g.yil} value={g.yil}>
                      {g.yil}
                    </option>
                  ))}
                </select>
                <select
                  value={simBaseAy}
                  onChange={(e) => setSimBaseAy(parseInt(e.target.value, 10))}
                  className="px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {AY_ISIMLERI.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                Baz Endeks (Y0): {formatNumber(simResult.baseIndex)}
              </div>
            </div>

            {/* Hedef Tarih (Güncelleme Tarihi - Yn) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Hedef Dönem (Güncel Tarih - Yn)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={simTargetYil}
                  onChange={(e) => setSimTargetYil(parseInt(e.target.value, 10))}
                  className="px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {yearGroups.map((g) => (
                    <option key={g.yil} value={g.yil}>
                      {g.yil}
                    </option>
                  ))}
                </select>
                <select
                  value={simTargetAy}
                  onChange={(e) => setSimTargetAy(parseInt(e.target.value, 10))}
                  className="px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {AY_ISIMLERI.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                Hedef Endeks (Yn): {formatNumber(simResult.targetIndex)}
              </div>
            </div>
          </div>

          {/* Sağ Sonuç Kartı */}
          <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950/40 border border-blue-200/80 dark:border-indigo-900/50">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  Bugünkü Güncel Yİ-ÜFE Karşılığı
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  Pn: {formatNumber(simResult.factor, 4)}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 font-mono">
                ₺{formatNumber(simResult.adjustedPrice)}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-blue-200 dark:border-indigo-900/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Enflasyon Farkı:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  +₺{formatNumber(simResult.fark)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Artış Oranı:</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  +%{formatNumber(simResult.percentChange)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. YILLARA GÖRE AYLIK Yİ-ÜFE MATRİS TABLOSU (1994 - 2026) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Tablo Üst Araç Çubuğu */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              TÜİK Yurt İçi Üretici Fiyat Endeksi Aylık Tablosu
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredGroups.length} Yıl
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* On Yıl Filtresi */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              {(['ALL', '2020s', '2010s', '2000s', '1990s'] as const).map((dec) => (
                <button
                  key={dec}
                  onClick={() => setSelectedDecade(dec)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedDecade === dec
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {dec === 'ALL'
                    ? 'Tümü'
                    : dec === '2020s'
                    ? '2020+'
                    : dec === '2010s'
                    ? '2010-19'
                    : dec === '2000s'
                    ? '2000-09'
                    : '1990-99'}
                </button>
              ))}
            </div>

            {/* Yıl Arama */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Yıl ara..."
                value={searchYear}
                onChange={(e) => setSearchYear(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl w-28 focus:outline-none focus:ring-1.5 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 sticky left-0 bg-slate-50 dark:bg-slate-950 z-10 border-r border-slate-200 dark:border-slate-800">
                  YIL
                </th>
                {AY_ISIMLERI.map((ay) => (
                  <th key={ay} className="py-2.5 px-2 text-center font-bold tracking-tight">
                    {ay.toUpperCase()}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-l border-slate-200 dark:border-slate-800">
                  YIL ORT.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredGroups.map((row) => (
                <tr
                  key={row.yil}
                  className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Yıl Sütunu */}
                  <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span>{row.yil}</span>
                      {row.yil === 2026 && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-white">
                          Güncel
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 12 Ay Hücreleri */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((ayNo) => {
                    const val = row.aylar[ayNo]
                    const hasVal = val !== null && val !== undefined
                    return (
                      <td
                        key={ayNo}
                        onClick={() => openAddForMonth(row.yil, ayNo, val)}
                        className="py-2 px-1.5 text-center font-mono cursor-pointer hover:bg-indigo-100/60 dark:hover:bg-indigo-950/50 transition-colors group relative"
                        title={`${row.yil} ${AY_ISIMLERI[ayNo - 1]}: ${hasVal ? formatNumber(val) : 'Henüz açıklanmadı (Ekle)'}`}
                      >
                        {hasVal ? (
                          <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {formatNumber(val)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-[10px] text-slate-300 dark:text-slate-600 hover:text-blue-500 hover:font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5">
                            + Ekle
                          </span>
                        )}
                      </td>
                    )
                  })}

                  {/* Yıl Ortalaması */}
                  <td className="py-2.5 px-3 text-right font-black font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50/30 dark:bg-indigo-950/10 border-l border-slate-200 dark:border-slate-800">
                    {formatNumber(row.ortalama)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. YENİ AY / ENDEKS GİRİŞ & DÜZENLEME MODALI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Yİ-ÜFE Endeksi Ekle / Güncelle
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    TÜİK tarafından açıklanan yeni endeksi giriniz
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEndeks} className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Yıl
                  </label>
                  <input
                    type="number"
                    value={modalYil}
                    onChange={(e) => setModalYil(parseInt(e.target.value, 10))}
                    min={1990}
                    max={2035}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Ay
                  </label>
                  <select
                    value={modalAy}
                    onChange={(e) => setModalAy(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  >
                    {AY_ISIMLERI.map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {name} ({idx + 1}. Ay)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Yİ-ÜFE Endeks Değeri
                </label>
                <input
                  type="text"
                  placeholder="Örn: 5850,25"
                  value={modalEndeks}
                  onChange={(e) => setModalEndeks(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-black font-mono text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  hakedis.org veya TÜİK bülteninde açıklanan virgüllü endeks rakamını giriniz.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Açıklama / Kaynak Notu (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: TÜİK Ağustos 2026 Bülteni"
                  value={modalAciklama}
                  onChange={(e) => setModalAciklama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
