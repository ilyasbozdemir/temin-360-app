import defaultYiUfeData from '../screens/system/data/yi_ufe_endeksleri.json'

export interface MonthlyEndeksRecord {
  id?: number
  yil: number
  ay: number
  ay_adi: string
  endeks: number
  aylik_degisim?: number | null
  yillik_degisim?: number | null
  kaynak?: string
  aciklama?: string | null
}

export interface YearEndeksGroup {
  yil: number
  aylar: Record<number, number | null>
  ortalama: number | null
  minEndeks: number | null
  maxEndeks: number | null
}

export interface YiUfeCalculationResult {
  basePrice: number
  baseYear: number
  baseMonth: number
  baseMonthName: string
  baseIndex: number
  targetYear: number
  targetMonth: number
  targetMonthName: string
  targetIndex: number
  factor: number // Pn
  percentChange: number
  adjustedPrice: number
  fark: number
}

export const AY_ISIMLERI = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık'
]

class YiUfeService {
  private inMemoryMonthly: MonthlyEndeksRecord[] = []
  private isLoadedFromDb = false

  constructor() {
    this.initDefaultData()
  }

  private initDefaultData(): void {
    if (defaultYiUfeData && defaultYiUfeData.monthly) {
      this.inMemoryMonthly = (defaultYiUfeData.monthly as any[]).map((m) => ({
        yil: m.yil,
        ay: m.ay,
        ay_adi: m.ay_adi || AY_ISIMLERI[m.ay - 1],
        endeks: m.endeks,
        kaynak: 'TÜİK / hakedis.org'
      }))
    }
  }

  public async loadFromDatabase(): Promise<MonthlyEndeksRecord[]> {
    try {
      if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_YiUfeEndeks ORDER BY yil DESC, ay DESC'
        )
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.inMemoryMonthly = res.data
          this.isLoadedFromDb = true
          return this.inMemoryMonthly
        }
      }
    } catch (e) {
      console.warn('[YiUfeService] Could not load from DB, using fallback data:', e)
    }
    return this.inMemoryMonthly
  }

  public getMonthlyList(): MonthlyEndeksRecord[] {
    return this.inMemoryMonthly
  }

  public getLatest(): MonthlyEndeksRecord {
    if (this.inMemoryMonthly.length === 0) {
      return { yil: 2026, ay: 8, ay_adi: 'Ağustos', endeks: 5781.74 }
    }
    // List is ordered DESC, or find highest (yil * 100 + ay)
    return [...this.inMemoryMonthly].sort(
      (a, b) => b.yil * 100 + b.ay - (a.yil * 100 + a.ay)
    )[0]
  }

  public getIndex(yil: number, ay?: number): number | null {
    if (ay) {
      const match = this.inMemoryMonthly.find((m) => m.yil === yil && m.ay === ay)
      return match ? match.endeks : null
    }

    // Yıl ortalaması
    const yearMonths = this.inMemoryMonthly.filter((m) => m.yil === yil)
    if (yearMonths.length === 0) return null
    const sum = yearMonths.reduce((acc, m) => acc + m.endeks, 0)
    return sum / yearMonths.length
  }

  public getGroupedByYears(): YearEndeksGroup[] {
    const yearsMap = new Map<number, Record<number, number | null>>()

    // Populate all known years
    for (const m of this.inMemoryMonthly) {
      if (!yearsMap.has(m.yil)) {
        yearsMap.set(m.yil, {
          1: null,
          2: null,
          3: null,
          4: null,
          5: null,
          6: null,
          7: null,
          8: null,
          9: null,
          10: null,
          11: null,
          12: null
        })
      }
      yearsMap.get(m.yil)![m.ay] = m.endeks
    }

    const groups: YearEndeksGroup[] = []
    for (const [yil, aylar] of yearsMap.entries()) {
      const validVals = Object.values(aylar).filter((v): v is number => v !== null)
      const ortalama =
        validVals.length > 0 ? validVals.reduce((a, b) => a + b, 0) / validVals.length : null
      const minEndeks = validVals.length > 0 ? Math.min(...validVals) : null
      const maxEndeks = validVals.length > 0 ? Math.max(...validVals) : null

      groups.push({
        yil,
        aylar,
        ortalama,
        minEndeks,
        maxEndeks
      })
    }

    return groups.sort((a, b) => b.yil - a.yil)
  }

  public calculateAdjustment(params: {
    basePrice: number
    baseYear: number
    baseMonth?: number
    targetYear?: number
    targetMonth?: number
  }): YiUfeCalculationResult {
    const latest = this.getLatest()
    const targetYear = params.targetYear ?? latest.yil
    const targetMonth = params.targetMonth ?? latest.ay

    let baseMonth = params.baseMonth
    let baseIndex = 0

    if (!baseMonth) {
      // Ay belirtilmemişse o yılın varsa Temmuz veya ortalaması, ya da mevcut ilk ayı
      const yearMonths = this.inMemoryMonthly.filter((m) => m.yil === params.baseYear)
      if (yearMonths.length > 0) {
        const temmuz = yearMonths.find((m) => m.ay === 7)
        if (temmuz) {
          baseMonth = 7
          baseIndex = temmuz.endeks
        } else {
          baseMonth = yearMonths[0].ay
          baseIndex = yearMonths[0].endeks
        }
      } else {
        baseMonth = 1
        baseIndex = 1
      }
    } else {
      const match = this.inMemoryMonthly.find(
        (m) => m.yil === params.baseYear && m.ay === baseMonth
      )
      baseIndex = match ? match.endeks : 1
    }

    const targetMatch = this.inMemoryMonthly.find(
      (m) => m.yil === targetYear && m.ay === targetMonth
    )
    const targetIndex = targetMatch ? targetMatch.endeks : latest.endeks

    const factor = baseIndex > 0 ? targetIndex / baseIndex : 1
    const adjustedPrice = params.basePrice * factor
    const percentChange = ((targetIndex - baseIndex) / (baseIndex || 1)) * 100
    const fark = adjustedPrice - params.basePrice

    return {
      basePrice: params.basePrice,
      baseYear: params.baseYear,
      baseMonth: baseMonth || 1,
      baseMonthName: AY_ISIMLERI[(baseMonth || 1) - 1],
      baseIndex,
      targetYear,
      targetMonth,
      targetMonthName: AY_ISIMLERI[targetMonth - 1],
      targetIndex,
      factor,
      percentChange,
      adjustedPrice,
      fark
    }
  }

  public async saveOrUpdateEndeks(
    yil: number,
    ay: number,
    endeks: number,
    aciklama?: string
  ): Promise<boolean> {
    const ayAdi = AY_ISIMLERI[ay - 1] || `${ay}. Ay`

    // In-memory güncelle
    const existingIdx = this.inMemoryMonthly.findIndex((m) => m.yil === yil && m.ay === ay)
    if (existingIdx >= 0) {
      this.inMemoryMonthly[existingIdx].endeks = endeks
      if (aciklama) this.inMemoryMonthly[existingIdx].aciklama = aciklama
    } else {
      this.inMemoryMonthly.push({
        yil,
        ay,
        ay_adi: ayAdi,
        endeks,
        kaynak: 'Kullanıcı Girişi / TÜİK',
        aciklama
      })
      this.inMemoryMonthly.sort((a, b) => b.yil * 100 + b.ay - (a.yil * 100 + a.ay))
    }

    // Database'e kaydet
    try {
      if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
        await window.electron.ipcRenderer.invoke(
          'db:execute',
          `INSERT INTO TANIM_YiUfeEndeks (yil, ay, ay_adi, endeks, kaynak, aciklama, guncellenme_tarihi)
           VALUES (?, ?, ?, ?, 'Kullanıcı Girişi / TÜİK', ?, CURRENT_TIMESTAMP)
           ON CONFLICT(yil, ay) DO UPDATE SET
             endeks = excluded.endeks,
             aciklama = excluded.aciklama,
             guncellenme_tarihi = CURRENT_TIMESTAMP`,
          [yil, ay, ayAdi, endeks, aciklama || null]
        )
      }
    } catch (e) {
      console.error('[YiUfeService] Error saving to database:', e)
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('yi-ufe-updated', {
          detail: { yil, ay, endeks }
        })
      )
    }

    return true
  }
}

export const yiUfeService = new YiUfeService()
