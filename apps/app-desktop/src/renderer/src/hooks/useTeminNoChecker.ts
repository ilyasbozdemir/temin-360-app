import { useState, useEffect, useCallback, useMemo } from 'react'

export interface DuplicateFileInfo {
  id: number
  temin_no: string
  konu: string
  butce_yili?: number
  dosya_acilis_tarihi?: string
  ihale_tipi?: string
  tur?: string
}

export interface UseTeminNoCheckerResult {
  isChecking: boolean
  isDuplicate: boolean
  duplicateInfo: DuplicateFileInfo | null
  isAvailable: boolean
  nextAvailableNo: string
  checkNow: (targetNo?: string, targetYear?: number) => Promise<boolean>
}

/**
 * Standardize temin_no for clean, precise comparison
 */
function normalizeTeminNo(raw: string, year: number): string {
  const clean = (raw || '').trim()
  if (!clean) return ''

  // Fix double year e.g. "2026/2026/1" -> "2026/1"
  const doubleMatch = clean.match(/^(\d{4})[/-]\1[/-](\d+)$/)
  if (doubleMatch) {
    return `${doubleMatch[1]}/${parseInt(doubleMatch[2], 10)}`
  }

  // Pure number e.g. "5" -> "2026/5"
  if (/^\d+$/.test(clean)) {
    return `${year}/${parseInt(clean, 10)}`
  }

  // Format "2026/05" -> "2026/5"
  const ym = clean.match(/^(\d{4})[/-](\d+)$/)
  if (ym) {
    return `${ym[1]}/${parseInt(ym[2], 10)}`
  }

  // Format "DT-2026/01" -> "DT-2026/01" (keep prefix exact)
  return clean.toLowerCase()
}

export function useTeminNoChecker(
  rawTeminNo: string,
  year: number,
  currentDosyaId?: number | string | null,
  ihaleTipi?: string,
  debounceMs = 300
): UseTeminNoCheckerResult {
  const [isChecking, setIsChecking] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateFileInfo | null>(null)
  const [nextAvailableNo, setNextAvailableNo] = useState<string>('')

  const numericCurrentId = currentDosyaId ? Number(currentDosyaId) : null

  const checkNumber = useCallback(
    async (noToCheck: string, targetYear: number): Promise<boolean> => {
      const clean = (noToCheck || '').trim()
      if (!clean) {
        setIsDuplicate(false)
        setDuplicateInfo(null)
        setIsChecking(false)
        return true
      }

      setIsChecking(true)
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT id, temin_no, konu, butce_yili, dosya_acilis_tarihi, ihale_tipi, tur 
           FROM DATA_TeminDosyasi 
           WHERE (is_deleted = 0 OR is_deleted IS NULL)`
        )

        if (!res.success || !res.data) {
          setIsChecking(false)
          return true
        }

        const files: any[] = res.data
        const normalizedTarget = normalizeTeminNo(clean, targetYear)
        const exactTarget = clean.toLowerCase()

        let foundCollision: DuplicateFileInfo | null = null

        for (const file of files) {
          // If this is the current file itself, skip it
          if (numericCurrentId && Number(file.id) === numericCurrentId) {
            continue
          }

          const fileYear =
            Number(file.butce_yili) ||
            (file.dosya_acilis_tarihi
              ? new Date(file.dosya_acilis_tarihi).getFullYear()
              : targetYear)

          // Only compare files belonging to the same budget year
          if (fileYear !== targetYear && fileYear !== 0) {
            continue
          }

          const fileNo = (file.temin_no || '').trim()
          if (!fileNo) continue

          const normalizedFileNo = normalizeTeminNo(fileNo, fileYear)
          const exactFileNo = fileNo.toLowerCase()

          // Precise match (either exact text or normalized year/seq)
          const isMatch =
            exactFileNo === exactTarget ||
            (normalizedTarget !== '' && normalizedFileNo === normalizedTarget)

          if (isMatch) {
            foundCollision = {
              id: file.id,
              temin_no: file.temin_no,
              konu: file.konu || 'İsimsiz Dosya',
              butce_yili: fileYear,
              dosya_acilis_tarihi: file.dosya_acilis_tarihi,
              ihale_tipi: file.ihale_tipi,
              tur: file.tur
            }
            break
          }
        }

        // Calculate next sequential available number in this year
        const numbersInYear: number[] = []
        for (const file of files) {
          const fileYear =
            Number(file.butce_yili) ||
            (file.dosya_acilis_tarihi
              ? new Date(file.dosya_acilis_tarihi).getFullYear()
              : targetYear)
          if (fileYear === targetYear) {
            const fNo = (file.temin_no || '').trim()
            const match = fNo.match(/(\d+)$/)
            if (match) {
              numbersInYear.push(parseInt(match[1], 10))
            }
          }
        }

        const maxNo = numbersInYear.length > 0 ? Math.max(...numbersInYear) : 0
        const computedNext = `${targetYear}/${maxNo + 1}`
        setNextAvailableNo(computedNext)

        if (foundCollision) {
          setIsDuplicate(true)
          setDuplicateInfo(foundCollision)
          setIsChecking(false)
          return false
        } else {
          setIsDuplicate(false)
          setDuplicateInfo(null)
          setIsChecking(false)
          return true
        }
      } catch (err) {
        console.error('Temin no kontrolü hatası:', err)
        setIsChecking(false)
        return true
      }
    },
    [numericCurrentId]
  )

  useEffect(() => {
    const clean = (rawTeminNo || '').trim()
    if (!clean) {
      setIsDuplicate(false)
      setDuplicateInfo(null)
      setIsChecking(false)
      return
    }

    setIsChecking(true)
    const handler = setTimeout(() => {
      checkNumber(clean, year)
    }, debounceMs)

    return () => clearTimeout(handler)
  }, [rawTeminNo, year, checkNumber, debounceMs])

  const isAvailable = useMemo(() => {
    const clean = (rawTeminNo || '').trim()
    return clean.length > 0 && !isChecking && !isDuplicate
  }, [rawTeminNo, isChecking, isDuplicate])

  const checkNow = useCallback(
    async (targetNo?: string, targetYear?: number) => {
      return await checkNumber(targetNo || rawTeminNo, targetYear || year)
    },
    [checkNumber, rawTeminNo, year]
  )

  return {
    isChecking,
    isDuplicate,
    duplicateInfo,
    isAvailable,
    nextAvailableNo,
    checkNow
  }
}
