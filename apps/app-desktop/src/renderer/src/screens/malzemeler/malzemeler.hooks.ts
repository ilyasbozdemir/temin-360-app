import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Kalem {
  id: number
  barkod_id: string
  tasinir_kodu: string | null
  okas_kodu: string | null
  kalem_adi: string
  tipi: string
  birim: string
  kategori: string | null
  ozelligi: string | null
  kdv_orani: number
  mensei: string | null
  is_personel: number
  personel_asgari_fark_oran: number
  poz_no?: string | null
  poz_yili?: number | null
  poz_tanimi?: string | null
  poz_grubu_ref_id?: string | null
  olcu_birimi?: string | null
  yapi_sinifi?: string | null
  hizmet_kodu?: string | null
  hizmet_sinifi?: string | null
  sure?: string | null
  personel_sayisi?: number | null
  meslek_kodu?: string | null
  fiyat_donemi?: string | null
  gorsel_url?: string | null
  gorseller?: string | null
  aktif_mi: number
  notlar: string | null
}

const fetchKalemler = async (): Promise<Kalem[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Kalem ORDER BY id DESC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useMalzemelerHooks() {
  const queryClient = useQueryClient()

  const { data: kalemList = [], isLoading } = useQuery({
    queryKey: ['kalemler'],
    queryFn: fetchKalemler
  })

  const addKalemMutation = useMutation({
    mutationFn: async (kalem: Partial<Kalem>) => {
      const sql = `INSERT INTO TANIM_Kalem (
        barkod_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, kategori, ozelligi,
        kdv_orani, mensei, is_personel, personel_asgari_fark_oran,
        poz_no, poz_yili, poz_tanimi, poz_grubu_ref_id, olcu_birimi, yapi_sinifi,
        hizmet_kodu, hizmet_sinifi, sure, personel_sayisi, meslek_kodu, fiyat_donemi,
        gorsel_url, gorseller, aktif_mi, notlar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      const params = [
        kalem.barkod_id,
        kalem.tasinir_kodu || null,
        kalem.okas_kodu || null,
        kalem.kalem_adi,
        kalem.tipi || 'Mal',
        kalem.birim || 'Adet',
        kalem.kategori || null,
        kalem.ozelligi || null,
        kalem.kdv_orani !== undefined ? kalem.kdv_orani : 20,
        kalem.mensei || null,
        kalem.is_personel ? 1 : 0,
        kalem.personel_asgari_fark_oran || 0,
        kalem.poz_no || null,
        kalem.poz_yili || null,
        kalem.poz_tanimi || null,
        kalem.poz_grubu_ref_id || null,
        kalem.olcu_birimi || null,
        kalem.yapi_sinifi || null,
        kalem.hizmet_kodu || null,
        kalem.hizmet_sinifi || null,
        kalem.sure || null,
        kalem.personel_sayisi || null,
        kalem.meslek_kodu || null,
        kalem.fiyat_donemi || null,
        kalem.gorsel_url || null,
        kalem.gorseller || null,
        kalem.aktif_mi !== undefined ? kalem.aktif_mi : 1,
        kalem.notlar || null
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalemler'] })
    }
  })

  const updateKalemMutation = useMutation({
    mutationFn: async (kalem: Partial<Kalem> & { id: number }) => {
      const sql = `UPDATE TANIM_Kalem SET 
        barkod_id = ?, tasinir_kodu = ?, okas_kodu = ?, kalem_adi = ?, tipi = ?, birim = ?, kategori = ?, ozelligi = ?,
        kdv_orani = ?, mensei = ?, is_personel = ?, personel_asgari_fark_oran = ?,
        poz_no = ?, poz_yili = ?, poz_tanimi = ?, poz_grubu_ref_id = ?, olcu_birimi = ?, yapi_sinifi = ?,
        hizmet_kodu = ?, hizmet_sinifi = ?, sure = ?, personel_sayisi = ?, meslek_kodu = ?, fiyat_donemi = ?,
        gorsel_url = ?, gorseller = ?, aktif_mi = ?, notlar = ?
      WHERE id = ?`
      const params = [
        kalem.barkod_id,
        kalem.tasinir_kodu || null,
        kalem.okas_kodu || null,
        kalem.kalem_adi,
        kalem.tipi || 'Mal',
        kalem.birim || 'Adet',
        kalem.kategori || null,
        kalem.ozelligi || null,
        kalem.kdv_orani !== undefined ? kalem.kdv_orani : 20,
        kalem.mensei || null,
        kalem.is_personel ? 1 : 0,
        kalem.personel_asgari_fark_oran || 0,
        kalem.poz_no || null,
        kalem.poz_yili || null,
        kalem.poz_tanimi || null,
        kalem.poz_grubu_ref_id || null,
        kalem.olcu_birimi || null,
        kalem.yapi_sinifi || null,
        kalem.hizmet_kodu || null,
        kalem.hizmet_sinifi || null,
        kalem.sure || null,
        kalem.personel_sayisi || null,
        kalem.meslek_kodu || null,
        kalem.fiyat_donemi || null,
        kalem.gorsel_url || null,
        kalem.gorseller || null,
        kalem.aktif_mi !== undefined ? kalem.aktif_mi : 1,
        kalem.notlar || null,
        kalem.id
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalemler'] })
    }
  })

  const deleteKalemMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['kalemler'] })
    }
  })

  return {
    kalemList,
    isLoading,
    addKalem: addKalemMutation.mutateAsync,
    updateKalem: updateKalemMutation.mutateAsync,
    deleteKalem: deleteKalemMutation.mutateAsync
  }
}
