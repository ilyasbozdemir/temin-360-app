import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface OlcuBirimi {
  id: number
  ad: string
  kisa_ad?: string | null
  kategori?: string | null
  sembol?: string | null
  donusum_faktoru?: number | null
  temel_birim_mi?: number | null
  donusum_tipi?: 'linear' | 'formula' | string | null
  ondalik_basamak?: number | null
  iliskili_birimler?: string | null
  aciklama?: string | null
  aktif_mi: number
  created_at?: string
}

export interface BirimDonusum {
  id: number
  kaynak_birim_id: number
  hedef_birim_id: number
  kaynak_ad?: string
  kaynak_kisa_ad?: string
  hedef_ad?: string
  hedef_kisa_ad?: string
  donusum_faktoru?: number | null
  formul?: string | null
  ters_formul?: string | null
  aciklama?: string | null
  aktif_mi: number
  created_at?: string
}

export const BIRIM_KATEGORILERI = [
  'Ağırlık',
  'Uzunluk',
  'Alan',
  'Hacim',
  'Adet/Miktar',
  'Zaman',
  'Sıcaklık',
  'Elektrik/Enerji',
  'Hizmet/Diğer'
] as const

export function useOlcuBirimleri() {
  return useQuery({
    queryKey: ['olcu-birimleri'],
    queryFn: async (): Promise<OlcuBirimi[]> => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_OlcuBirimi ORDER BY kategori ASC, temel_birim_mi DESC, ad ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    }
  })
}

export function useSaveOlcuBirimi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (birim: Partial<OlcuBirimi>) => {
      let res
      if (birim.id) {
        // Update
        res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `UPDATE TANIM_OlcuBirimi SET
            ad = ?,
            kisa_ad = ?,
            kategori = ?,
            sembol = ?,
            donusum_faktoru = ?,
            temel_birim_mi = ?,
            donusum_tipi = ?,
            ondalik_basamak = ?,
            iliskili_birimler = ?,
            aciklama = ?,
            aktif_mi = ?
          WHERE id = ?`,
          [
            birim.ad,
            birim.kisa_ad || null,
            birim.kategori || 'Adet/Miktar',
            birim.sembol || null,
            birim.donusum_faktoru ?? 1.0,
            birim.temel_birim_mi ? 1 : 0,
            birim.donusum_tipi || 'linear',
            birim.ondalik_basamak ?? 2,
            birim.iliskili_birimler || null,
            birim.aciklama || null,
            birim.aktif_mi ?? 1,
            birim.id
          ]
        )
      } else {
        // Insert
        res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_OlcuBirimi (
            ad, kisa_ad, kategori, sembol, donusum_faktoru,
            temel_birim_mi, donusum_tipi, ondalik_basamak,
            iliskili_birimler, aciklama, aktif_mi
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            birim.ad,
            birim.kisa_ad || null,
            birim.kategori || 'Adet/Miktar',
            birim.sembol || null,
            birim.donusum_faktoru ?? 1.0,
            birim.temel_birim_mi ? 1 : 0,
            birim.donusum_tipi || 'linear',
            birim.ondalik_basamak ?? 2,
            birim.iliskili_birimler || null,
            birim.aciklama || null,
            birim.aktif_mi ?? 1
          ]
        )
      }
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olcu-birimleri'] })
      queryClient.invalidateQueries({ queryKey: ['birim-donusumleri'] })
    }
  })
}

export function useDeleteOlcuBirimi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const birimRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT ad FROM TANIM_OlcuBirimi WHERE id = ?',
        [id]
      )

      if (birimRes.success && birimRes.data && birimRes.data.length > 0) {
        const ad = birimRes.data[0].ad
        const checkRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as count FROM TANIM_Kalem WHERE birim = ?',
          [ad]
        )
        if (checkRes.success && checkRes.data && checkRes.data[0].count > 0) {
          throw new Error(
            'Bu ölçü birimi ' +
              checkRes.data[0].count +
              ' adet malzemede kullanıldığı için silinemez! Bunun yerine "Pasif" duruma getirebilirsiniz.'
          )
        }
      }

      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_OlcuBirimi WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olcu-birimleri'] })
      queryClient.invalidateQueries({ queryKey: ['birim-donusumleri'] })
    }
  })
}

export function useBirimDonusumleri() {
  return useQuery({
    queryKey: ['birim-donusumleri'],
    queryFn: async (): Promise<BirimDonusum[]> => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT d.*, 
                kb.ad as kaynak_ad, kb.kisa_ad as kaynak_kisa_ad,
                hb.ad as hedef_ad, hb.kisa_ad as hedef_kisa_ad
         FROM TANIM_BirimDonusum d
         JOIN TANIM_OlcuBirimi kb ON d.kaynak_birim_id = kb.id
         JOIN TANIM_OlcuBirimi hb ON d.hedef_birim_id = hb.id
         ORDER BY d.id DESC`
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    }
  })
}

export function useSaveBirimDonusum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (donusum: Partial<BirimDonusum>) => {
      let res
      if (donusum.id) {
        res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `UPDATE TANIM_BirimDonusum SET
            kaynak_birim_id = ?,
            hedef_birim_id = ?,
            donusum_faktoru = ?,
            formul = ?,
            ters_formul = ?,
            aciklama = ?,
            aktif_mi = ?
          WHERE id = ?`,
          [
            donusum.kaynak_birim_id,
            donusum.hedef_birim_id,
            donusum.donusum_faktoru ?? null,
            donusum.formul || null,
            donusum.ters_formul || null,
            donusum.aciklama || null,
            donusum.aktif_mi ?? 1,
            donusum.id
          ]
        )
      } else {
        res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_BirimDonusum (
            kaynak_birim_id, hedef_birim_id, donusum_faktoru,
            formul, ters_formul, aciklama, aktif_mi
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            donusum.kaynak_birim_id,
            donusum.hedef_birim_id,
            donusum.donusum_faktoru ?? null,
            donusum.formul || null,
            donusum.ters_formul || null,
            donusum.aciklama || null,
            donusum.aktif_mi ?? 1
          ]
        )
      }
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birim-donusumleri'] })
    }
  })
}

export function useDeleteBirimDonusum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_BirimDonusum WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birim-donusumleri'] })
    }
  })
}

/**
 * Safely evaluates a conversion formula like "(x * 9/5) + 32" or "x * 1000"
 */
export function evaluateFormula(formula: string, xVal: number): number {
  try {
    // Replace 'x' with the numeric value
    const sanitized = formula
      .toLowerCase()
      .replace(/x/g, `(${xVal})`)
      .replace(/[^0-9+\-*/().\s]/g, '')
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${sanitized});`)()
    return typeof result === 'number' && !isNaN(result) ? result : 0
  } catch {
    return 0
  }
}

/**
 * Perform unit conversion between two units using defined conversion rules or category base factors
 */
export function convertUnits(
  amount: number,
  fromUnit: OlcuBirimi | undefined,
  toUnit: OlcuBirimi | undefined,
  customRules: BirimDonusum[] = []
): { result: number; formulaText: string; success: boolean } {
  if (!fromUnit || !toUnit || isNaN(amount)) {
    return { result: 0, formulaText: '', success: false }
  }

  if (fromUnit.id === toUnit.id) {
    return { result: amount, formulaText: `${amount} ${fromUnit.kisa_ad || fromUnit.ad}`, success: true }
  }

  // 1. Check direct conversion rule
  const directRule = customRules.find(
    (r) => r.aktif_mi && r.kaynak_birim_id === fromUnit.id && r.hedef_birim_id === toUnit.id
  )
  if (directRule) {
    if (directRule.formul) {
      const res = evaluateFormula(directRule.formul, amount)
      return {
        result: res,
        formulaText: directRule.formul.replace(/x/g, amount.toString()),
        success: true
      }
    }
    if (directRule.donusum_faktoru) {
      const res = amount * directRule.donusum_faktoru
      return {
        result: res,
        formulaText: `${amount} × ${directRule.donusum_faktoru}`,
        success: true
      }
    }
  }

  // 2. Check reverse conversion rule
  const reverseRule = customRules.find(
    (r) => r.aktif_mi && r.kaynak_birim_id === toUnit.id && r.hedef_birim_id === fromUnit.id
  )
  if (reverseRule) {
    if (reverseRule.ters_formul) {
      const res = evaluateFormula(reverseRule.ters_formul, amount)
      return {
        result: res,
        formulaText: reverseRule.ters_formul.replace(/x/g, amount.toString()),
        success: true
      }
    }
    if (reverseRule.donusum_faktoru && reverseRule.donusum_faktoru !== 0) {
      const res = amount / reverseRule.donusum_faktoru
      return {
        result: res,
        formulaText: `${amount} ÷ ${reverseRule.donusum_faktoru}`,
        success: true
      }
    }
  }

  // 3. Check category base factor conversion
  if (
    fromUnit.kategori &&
    toUnit.kategori &&
    fromUnit.kategori === toUnit.kategori &&
    fromUnit.donusum_faktoru &&
    toUnit.donusum_faktoru
  ) {
    // Both units convert through base unit:
    // baseValue = amount * fromUnit.donusum_faktoru
    // targetValue = baseValue / toUnit.donusum_faktoru
    const baseVal = amount * fromUnit.donusum_faktoru
    const finalVal = baseVal / toUnit.donusum_faktoru
    const factorRatio = fromUnit.donusum_faktoru / toUnit.donusum_faktoru
    return {
      result: finalVal,
      formulaText: `${amount} × (${fromUnit.donusum_faktoru} / ${toUnit.donusum_faktoru}) = ${amount} × ${factorRatio}`,
      success: true
    }
  }

  return { result: 0, formulaText: 'Doğrudan dönüşüm kuralı bulunamadı.', success: false }
}
