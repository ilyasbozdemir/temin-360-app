import { useState, useEffect, useMemo } from 'react'
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react'
import { FirmaStats } from './types'
import { hesaplaKesinti } from '../../../../../../utils/hesaplamalar'
import { yiUfeService, AY_ISIMLERI } from '../../../../../../services/yiUfeService'
import { calculatePriceDifference } from '../../../../../../utils/priceDifference'
import type { JSX } from 'react'

interface KabulFaturaHakedisCardProps {
  firmaStats: FirmaStats
  faturaNo: string
  faturaTarihi: string
  onFaturaNoChange: (val: string) => void
  onFaturaTarihiChange: (val: string) => void
  formatCurrency: (val: number | null) => string
}

export function KabulFaturaHakedisCard({
  firmaStats,
  faturaNo,
  faturaTarihi,
  onFaturaNoChange,
  onFaturaTarihiChange,
  formatCurrency
}: KabulFaturaHakedisCardProps): JSX.Element {
  const teklifToplami = firmaStats.teklifToplami || 0

  // Yİ-ÜFE Veri Hazırlığı
  useEffect(() => {
    yiUfeService.loadFromDatabase()
  }, [])

  // Tarih Çözümleme Yardımcıları
  const parseDateToYearMonth = (dateStr?: string | null) => {
    if (!dateStr) {
      const now = new Date()
      return { yil: now.getFullYear(), ay: now.getMonth() + 1 }
    }
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) {
      const parts = dateStr.split(/[-./]/)
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return { yil: parseInt(parts[0], 10), ay: parseInt(parts[1], 10) }
        }
        return { yil: parseInt(parts[2], 10), ay: parseInt(parts[1], 10) }
      }
      const now = new Date()
      return { yil: now.getFullYear(), ay: now.getMonth() + 1 }
    }
    return { yil: d.getFullYear(), ay: d.getMonth() + 1 }
  }

  // Varsayılan Temel (İhale/Açılış) ve Güncel (Fatura/Teslim) Tarihler
  const initialTemel = useMemo(() => {
    return parseDateToYearMonth(firmaStats.dosyaTarihi)
  }, [firmaStats.dosyaTarihi])

  const initialGuncel = useMemo(() => {
    return parseDateToYearMonth(faturaTarihi || firmaStats.teslimTarihi)
  }, [faturaTarihi, firmaStats.teslimTarihi])

  // Fiyat Farkı Durumu & Ayarları
  const defaultHasFiyatFarki = Boolean(
    firmaStats.fiyatFarkiDayanagi &&
      firmaStats.fiyatFarkiDayanagi !== 'Fiyat Farkı Ödenmeyecek' &&
      (firmaStats.fiyatFarkiDayanagi.includes('5215') ||
        firmaStats.fiyatFarkiDayanagi.includes('5216'))
  )

  const [isFiyatFarkiEnabled, setIsFiyatFarkiEnabled] = useState<boolean>(defaultHasFiyatFarki)
  const [kararKey, setKararKey] = useState<string>(
    firmaStats.fiyatFarkiDayanagi?.includes('5215') ? '2013/5215' : '2013/5216'
  )
  const [temelYil, setTemelYil] = useState<number>(initialTemel.yil)
  const [temelAy, setTemelAy] = useState<number>(initialTemel.ay)
  const [guncelYil, setGuncelYil] = useState<number>(initialGuncel.yil)
  const [guncelAy, setGuncelAy] = useState<number>(initialGuncel.ay)
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false)

  // Fatura tarihi değiştikçe güncel ayı ve yılı otomatik senkronize et
  useEffect(() => {
    if (faturaTarihi) {
      const parsed = parseDateToYearMonth(faturaTarihi)
      setGuncelYil(parsed.yil)
      setGuncelAy(parsed.ay)
    }
  }, [faturaTarihi])

  // Dosya tarihi değiştikçe temel ayı ve yılı güncelle
  useEffect(() => {
    if (firmaStats.dosyaTarihi) {
      const parsed = parseDateToYearMonth(firmaStats.dosyaTarihi)
      setTemelYil(parsed.yil)
      setTemelAy(parsed.ay)
    }
  }, [firmaStats.dosyaTarihi])

  // Endeks Değerleri
  const temelEndeks = useMemo(() => {
    return yiUfeService.getIndex(temelYil, temelAy) || 0
  }, [temelYil, temelAy])

  const guncelEndeks = useMemo(() => {
    return yiUfeService.getIndex(guncelYil, guncelAy) || 0
  }, [guncelYil, guncelAy])

  // Fiyat Farkı Hesabı
  const fiyatFarkiHesap = useMemo(() => {
    if (!isFiyatFarkiEnabled || temelEndeks <= 0 || guncelEndeks <= 0) {
      return {
        pn: 1,
        difference: 0,
        percentChange: 0,
        formattedDifference: '0,00'
      }
    }

    const res = calculatePriceDifference(kararKey, {
      workAmount: teklifToplami,
      baseIndexes: { b1: temelEndeks },
      currentIndexes: { b1: guncelEndeks }
    })

    const percentChange = Number((((guncelEndeks - temelEndeks) / temelEndeks) * 100).toFixed(2))

    return {
      pn: res.pn,
      difference: res.difference,
      percentChange,
      formattedDifference: res.formattedDifference
    }
  }, [isFiyatFarkiEnabled, kararKey, teklifToplami, temelEndeks, guncelEndeks])

  // Finansal Değerler
  const fiyatFarkiTutari = isFiyatFarkiEnabled ? fiyatFarkiHesap.difference : 0
  const kdvMatrahi = teklifToplami + fiyatFarkiTutari
  const kdvTutari = hesaplaKesinti(kdvMatrahi, '20', 'yuzde')
  const brutTutar = kdvMatrahi + kdvTutari
  const damgaVergisi = hesaplaKesinti(kdvMatrahi, '9.48', 'binde')
  const netOdenecek = brutTutar - damgaVergisi

  // Yıl Listesi (2003 - 2026)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    for (let y = currentYear; y >= 2003; y--) {
      years.push(y)
    }
    return years
  }, [])

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col gap-6">
      {/* Kart Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Fatura &amp; Hakediş Hesabı
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              TÜİK Yİ-ÜFE endeksleri ve resmî kararnamelere göre dinamik hakediş yönetimi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFiyatFarkiEnabled(!isFiyatFarkiEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isFiyatFarkiEnabled
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isFiyatFarkiEnabled ? 'Fiyat Farkı: Aktif' : 'Fiyat Farkı Ekle'}
          </button>
        </div>
      </div>

      {/* Fatura Bilgileri Giriş Alanları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            Fatura Numarası
          </label>
          <input
            type="text"
            placeholder="Örn: ABC2026000000123"
            value={faturaNo}
            onChange={(e) => onFaturaNoChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            Fatura Tarihi (Güncel Dönem)
          </label>
          <input
            type="date"
            value={faturaTarihi}
            onChange={(e) => onFaturaTarihiChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Yİ-ÜFE Fiyat Farkı Paneli (Aktifse Göster) */}
      {isFiyatFarkiEnabled && (
        <div className="bg-linear-to-br from-amber-500/5 via-orange-500/5 to-transparent border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4.5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 dark:border-amber-900/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                TÜİK Yİ-ÜFE Fiyat Farkı Hesabı
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Kararname Dayanağı"
                value={kararKey}
                onChange={(e) => setKararKey(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-900 dark:text-amber-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="2013/5216">2013/5216 Sayılı Karar (Mal Alımı)</option>
                <option value="2013/5215">2013/5215 Sayılı Karar (Hizmet Alımı)</option>
              </select>
            </div>
          </div>

          {/* Endeks Seçimleri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Temel Endeks (Yo) */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  Temel Endeks (Y₀ / I₀)
                </span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-md">
                  İhale / Teklif Ayı
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label="Temel Endeks Yılı"
                  value={temelYil}
                  onChange={(e) => setTemelYil(parseInt(e.target.value, 10))}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Temel Endeks Ayı"
                  value={temelAy}
                  onChange={(e) => setTemelAy(parseInt(e.target.value, 10))}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5"
                >
                  {AY_ISIMLERI.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-500">TÜİK Endeks Değeri:</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                  {temelEndeks > 0 ? temelEndeks.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : 'Veri Yok'}
                </span>
              </div>
            </div>

            {/* Güncel Endeks (Yn) */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Güncel Endeks (Yn / In)
                </span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                  Fatura / Teslim Ayı
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label="Güncel Endeks Yılı"
                  value={guncelYil}
                  onChange={(e) => setGuncelYil(parseInt(e.target.value, 10))}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Güncel Endeks Ayı"
                  value={guncelAy}
                  onChange={(e) => setGuncelAy(parseInt(e.target.value, 10))}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5"
                >
                  {AY_ISIMLERI.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-500">TÜİK Endeks Değeri:</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                  {guncelEndeks > 0 ? guncelEndeks.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : 'Veri Yok'}
                </span>
              </div>
            </div>
          </div>

          {/* Katsayı ve Fark Özeti */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Fiyat Farkı Katsayısı (Pn)</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200 font-mono">
                {fiyatFarkiHesap.pn.toFixed(4)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Endeks Artış Oranı</span>
              <span className={`text-sm font-bold flex items-center gap-1 ${
                fiyatFarkiHesap.percentChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {fiyatFarkiHesap.percentChange >= 0 ? '+' : ''}%{fiyatFarkiHesap.percentChange}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Hesaplanan Fiyat Farkı</span>
              <span className="text-sm font-black text-amber-900 dark:text-amber-200 font-mono">
                + {formatCurrency(fiyatFarkiHesap.difference)}
              </span>
            </div>
          </div>

          {/* Formül & Detay Aç/Kapat */}
          <button
            type="button"
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 hover:underline self-start"
          >
            {showFormulaDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showFormulaDetails ? 'Formül ve Dayanak Detaylarını Gizle' : 'Kararname Formülü ve Dayanak Detaylarını Göster'}
          </button>

          {showFormulaDetails && (
            <div className="bg-amber-100/50 dark:bg-amber-950/40 rounded-xl p-3 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex flex-col gap-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1 font-bold">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Hesaplama Formülü: F = An × (Pn - 1)
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                Pn = Yn / Y₀ formülüne göre temel endeks ({temelEndeks.toLocaleString('tr-TR')}) ve güncel hakediş ayı endeksi ({guncelEndeks.toLocaleString('tr-TR')}) oranlanarak katsayı ({fiyatFarkiHesap.pn.toFixed(4)}) elde edilmiş ve dönem hakediş tutarı olan {formatCurrency(teklifToplami)} üzerinden fiyat farkı tahakkuk ettirilmiştir.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Finansal Dağılım Özeti */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Sözleşme / Teklif Tutarı (KDV Hariç An)
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {formatCurrency(firmaStats.teklifToplami)}
            </span>
          </div>

          {isFiyatFarkiEnabled && (
            <div className="flex justify-between items-center text-sm text-amber-700 dark:text-amber-400">
              <span className="font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                TÜİK Yİ-ÜFE Fiyat Farkı Tutarı (F)
              </span>
              <span className="font-bold font-mono">
                + {formatCurrency(fiyatFarkiTutari)}
              </span>
            </div>
          )}

          {isFiyatFarkiEnabled && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                Fiyat Farkı Dahil Hakediş Tutarı (KDV Matrahı)
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {formatCurrency(kdvMatrahi)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              KDV (%20)
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {formatCurrency(kdvTutari)}
            </span>
          </div>

          <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-0.5" />

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Brüt Toplam Tutar
            </span>
            <span className="font-black text-slate-900 dark:text-white font-mono text-base">
              {formatCurrency(brutTutar)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm text-red-600 dark:text-red-400">
            <span className="font-medium flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Damga Vergisi Kesintisi (‰9,48)
            </span>
            <span className="font-bold font-mono">
              - {formatCurrency(damgaVergisi)}
            </span>
          </div>
        </div>
      </div>

      {/* Net Ödenecek Tutar ve Aksiyon Alanı */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-linear-to-r from-blue-600/10 via-indigo-600/10 to-blue-600/5 border border-blue-200 dark:border-blue-800/60 rounded-2xl">
        <div className="flex flex-col text-center sm:text-left">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-0.5">
            Net Ödenecek Hakediş Tutarı
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-950 dark:text-blue-200 font-mono tracking-tight">
            {formatCurrency(netOdenecek)}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={!faturaNo || !faturaTarihi}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
              !faturaNo || !faturaTarihi
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-80'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-98 cursor-pointer'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            ÖEB &amp; Hakedişe Aktar
          </button>
        </div>
      </div>
    </div>
  )
}
