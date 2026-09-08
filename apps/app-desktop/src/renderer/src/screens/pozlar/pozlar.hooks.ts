import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface PozFiyatGecmisi {
  donem: string
  fiyat: number
  tarih?: string
}

export interface PozItem {
  id?: number
  eski_id?: string
  barkod_id?: string
  kalem_adi: string
  tipi?: string
  birim: string
  olcu_birimi?: string
  poz_no: string
  eski_poz_no?: string | null
  fasikul?: string | null
  poz_tipi?: string | null
  poz_yili?: number | null
  poz_tanimi?: string | null
  poz_grubu_ref_id?: string | null
  yapi_sinifi?: string | null
  fiyat_donemi?: string | null
  okas_kodu?: string | null
  kategori?: string | null
  poz_kurumu?: string | null
  ozelligi?: string | null
  notlar?: string | null
  birim_fiyat?: number | null
  birim_fiyatlar?: string | null
  kdv_orani?: number
  aktif_mi?: number
}

const generateBarcode = () =>
  Math.floor(1000000000000 + Math.random() * 9000000000000).toString()

const fetchPozlar = async (): Promise<PozItem[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    "SELECT * FROM TANIM_Kalem WHERE tipi = 'Yapım' OR (poz_no IS NOT NULL AND poz_no != '') ORDER BY poz_no ASC"
  )
  if (!res.success) throw new Error(res.error)
  return res.data || []
}

export function usePozlarHooks() {
  const queryClient = useQueryClient()

  const { data: pozList = [], isLoading } = useQuery({
    queryKey: ['poz_listesi'],
    queryFn: fetchPozlar
  })

  const addPozMutation = useMutation({
    mutationFn: async (kayit: Omit<PozItem, 'id'>) => {
      const barkod = kayit.barkod_id || generateBarcode()
      const sql = `
        INSERT INTO TANIM_Kalem (
          barkod_id, kalem_adi, tipi, birim, olcu_birimi,
          poz_no, eski_poz_no, fasikul, poz_tipi, poz_yili, poz_tanimi, poz_grubu_ref_id,
          yapi_sinifi, fiyat_donemi, okas_kodu, kategori,
          ozelligi, notlar, birim_fiyat, birim_fiyatlar, kdv_orani, aktif_mi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      const params = [
        barkod,
        kayit.kalem_adi || kayit.poz_tanimi || kayit.poz_no,
        'Yapım',
        kayit.birim || 'm²',
        kayit.birim || 'm²',
        kayit.poz_no,
        kayit.eski_poz_no || null,
        kayit.fasikul || null,
        kayit.poz_tipi || 'Analiz',
        kayit.poz_yili || new Date().getFullYear(),
        kayit.poz_tanimi || kayit.kalem_adi || '',
        kayit.poz_grubu_ref_id || null,
        kayit.yapi_sinifi || null,
        kayit.fiyat_donemi || `${new Date().getFullYear()}/1`,
        kayit.okas_kodu || null,
        kayit.poz_kurumu || kayit.kategori || 'ÇŞB',
        kayit.ozelligi || kayit.poz_tanimi || null,
        kayit.notlar || null,
        Number(kayit.birim_fiyat) || 0,
        kayit.birim_fiyatlar || null,
        kayit.kdv_orani ?? 20,
        kayit.aktif_mi ?? 1
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poz_listesi'] })
      queryClient.invalidateQueries({ queryKey: ['kalemler'] })
      queryClient.invalidateQueries({ queryKey: ['malzemeler'] })
    }
  })

  const updatePozMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PozItem> }) => {
      const sql = `
        UPDATE TANIM_Kalem SET
          kalem_adi = ?,
          birim = ?,
          olcu_birimi = ?,
          poz_no = ?,
          eski_poz_no = ?,
          fasikul = ?,
          poz_tipi = ?,
          poz_yili = ?,
          poz_tanimi = ?,
          poz_grubu_ref_id = ?,
          yapi_sinifi = ?,
          fiyat_donemi = ?,
          okas_kodu = ?,
          kategori = ?,
          ozelligi = ?,
          notlar = ?,
          birim_fiyat = ?,
          birim_fiyatlar = ?,
          kdv_orani = ?,
          aktif_mi = ?
        WHERE id = ?
      `
      const params = [
        data.kalem_adi || data.poz_tanimi || data.poz_no,
        data.birim || 'm²',
        data.birim || 'm²',
        data.poz_no,
        data.eski_poz_no || null,
        data.fasikul || null,
        data.poz_tipi || 'Analiz',
        data.poz_yili || new Date().getFullYear(),
        data.poz_tanimi || data.kalem_adi || '',
        data.poz_grubu_ref_id || null,
        data.yapi_sinifi || null,
        data.fiyat_donemi || `${new Date().getFullYear()}/1`,
        data.okas_kodu || null,
        data.poz_kurumu || data.kategori || 'ÇŞB',
        data.ozelligi || data.poz_tanimi || null,
        data.notlar || null,
        Number(data.birim_fiyat) || 0,
        data.birim_fiyatlar || null,
        data.kdv_orani ?? 20,
        data.aktif_mi ?? 1,
        id
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poz_listesi'] })
      queryClient.invalidateQueries({ queryKey: ['kalemler'] })
      queryClient.invalidateQueries({ queryKey: ['malzemeler'] })
    }
  })

  const deletePozMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_Kalem WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poz_listesi'] })
      queryClient.invalidateQueries({ queryKey: ['malzemeler'] })
    }
  })

  return {
    pozList,
    isLoading,
    addPoz: addPozMutation.mutateAsync,
    updatePoz: updatePozMutation.mutateAsync,
    deletePoz: deletePozMutation.mutateAsync
  }
}
