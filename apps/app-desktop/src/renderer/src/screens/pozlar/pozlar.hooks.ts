import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface PozItem {
  id?: number
  eski_id?: string
  barkod_id?: string
  kalem_adi: string
  tipi?: string
  birim: string
  olcu_birimi?: string
  poz_no: string
  poz_yili?: number
  poz_tanimi?: string
  poz_grubu_ref_id?: string
  yapi_sinifi?: string
  fiyat_donemi?: string
  okas_kodu?: string
  kategori?: string
  poz_kurumu?: string
  ozelligi?: string
  notlar?: string
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
          poz_no, poz_yili, poz_tanimi, poz_grubu_ref_id,
          yapi_sinifi, fiyat_donemi, okas_kodu, kategori,
          ozelligi, notlar, kdv_orani, aktif_mi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      const params = [
        barkod,
        kayit.kalem_adi || kayit.poz_tanimi || kayit.poz_no,
        'Yapım',
        kayit.birim || 'm²',
        kayit.birim || 'm²',
        kayit.poz_no,
        kayit.poz_yili || new Date().getFullYear(),
        kayit.poz_tanimi || kayit.kalem_adi || '',
        kayit.poz_grubu_ref_id || null,
        kayit.yapi_sinifi || null,
        kayit.fiyat_donemi || `${new Date().getFullYear()}/1`,
        kayit.okas_kodu || null,
        kayit.poz_kurumu || kayit.kategori || 'ÇŞB',
        kayit.ozelligi || kayit.poz_tanimi || null,
        kayit.notlar || null,
        kayit.kdv_orani ?? 20,
        kayit.aktif_mi ?? 1
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poz_listesi'] })
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
          poz_yili = ?,
          poz_tanimi = ?,
          poz_grubu_ref_id = ?,
          yapi_sinifi = ?,
          fiyat_donemi = ?,
          okas_kodu = ?,
          kategori = ?,
          ozelligi = ?,
          notlar = ?
        WHERE id = ?
      `
      const params = [
        data.kalem_adi || data.poz_tanimi || data.poz_no,
        data.birim || 'm²',
        data.birim || 'm²',
        data.poz_no,
        data.poz_yili || new Date().getFullYear(),
        data.poz_tanimi || data.kalem_adi || '',
        data.poz_grubu_ref_id || null,
        data.yapi_sinifi || null,
        data.fiyat_donemi || `${new Date().getFullYear()}/1`,
        data.okas_kodu || null,
        data.poz_kurumu || data.kategori || 'ÇŞB',
        data.ozelligi || data.poz_tanimi || null,
        data.notlar || null,
        id
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poz_listesi'] })
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
