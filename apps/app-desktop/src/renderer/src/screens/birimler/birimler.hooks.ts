import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Birim {
  id: number
  birim_adi: string
  antet_ek_satir: string
  ihtiyac_yeri_eki: string
  sunum_makami: string
  e_butce: string
  say2000i: string
  dtvt_kodu?: string
  detsis_kodu?: string
  muhasebe_kodu?: string
  muhasebe_adi?: string
  harcama_kodu?: string
  harcama_adi?: string
  ayrintili_bilgi_personel: string
  ilgili_personel_id: number | null
  aktif_mi: number
  created_at: string
  personel_sayisi?: number
}

export type BirimInput = Omit<Birim, 'id' | 'aktif_mi' | 'created_at' | 'personel_sayisi'>

const fetchBirimler = async (): Promise<Birim[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT b.*, (SELECT COUNT(*) FROM TANIM_Personel p WHERE p.birim = b.birim_adi) as personel_sayisi FROM TANIM_Birim b ORDER BY birim_adi ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

const fetchPersonelList = async (): Promise<{ id: number; ad_soyad: string }[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT id, ad_soyad FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

const EMPTY_PERSONEL_LIST: { id: number; ad_soyad: string }[] = []

export function usePersonelList() {
  const { data: personeller = EMPTY_PERSONEL_LIST, isLoading } = useQuery({
    queryKey: ['personeller_list'],
    queryFn: fetchPersonelList
  })
  return { personeller, isLoading }
}

const fetchKurumsalKodlar = async (): Promise<{ kod: string; aciklama: string }[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    "SELECT kod, aciklama FROM TANIM_KodSozlugu WHERE tur = 'kurumsal' AND aktif_mi = 1 ORDER BY aciklama ASC"
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

const EMPTY_KURUMSAL_KODLAR: { kod: string; aciklama: string }[] = []

export function useKurumsalKodlar() {
  const { data: kurumsalKodlar = EMPTY_KURUMSAL_KODLAR, isLoading } = useQuery({
    queryKey: ['kurumsal_kodlar'],
    queryFn: fetchKurumsalKodlar
  })
  return { kurumsalKodlar, isLoading }
}

const EMPTY_BIRIMLER: Birim[] = []

export function useBirimlerHooks() {
  const queryClient = useQueryClient()

  const { data: birimler = EMPTY_BIRIMLER, isLoading: isLoadingBirimler } = useQuery({
    queryKey: ['birimler'],
    queryFn: fetchBirimler
  })

  const addBirimMutation = useMutation({
    mutationFn: async (birim: BirimInput) => {
      const nameVal = birim.birim_adi || ''
      const cols = [
        'ad',
        'birim_adi',
        'antet_ek_satir',
        'ihtiyac_yeri_eki',
        'sunum_makami',
        'e_butce',
        'say2000i',
        'dtvt_kodu',
        'detsis_kodu',
        'muhasebe_kodu',
        'muhasebe_adi',
        'harcama_kodu',
        'harcama_adi',
        'ayrintili_bilgi_personel',
        'ilgili_personel_id'
      ]
      const placeholders = cols.map(() => '?').join(', ')
      const values = cols.map((col) => {
        if (col === 'ad') return nameVal
        return (birim as any)[col] ?? null
      })
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Birim (${cols.join(', ')}, aktif_mi) VALUES (${placeholders}, 1)`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['birimler'] })
  })

  const updateBirimMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BirimInput> }) => {
      const updateData = { ...data }
      if (updateData.birim_adi !== undefined) {
        ;(updateData as any).ad = updateData.birim_adi
      }
      const entries = Object.entries(updateData).filter(([, v]) => v !== undefined)
      if (entries.length === 0) return
      const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
      const values = [...entries.map(([, v]) => v), id]
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Birim SET ${setClause} WHERE id = ?`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['birimler'] })
  })

  const deleteBirimMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        const getRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT id, birim_adi, ad FROM TANIM_Birim WHERE id = ?',
          [id]
        )
        if (getRes?.data && getRes.data.length > 0) {
          const birimRow = getRes.data[0]
          const birimAdi = birimRow.birim_adi || birimRow.ad
          if (birimAdi) {
            // Birime bağlı personellerin birim alanını güvenle temizle
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'UPDATE TANIM_Personel SET birim = NULL WHERE birim = ? OR birim = ?',
              [birimAdi, birimRow.ad || birimAdi]
            )
          }
          // Birime bağlı temin dosyalarının birim_id alanını güvenle boşa çıkar
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_TeminDosyasi SET birim_id = NULL WHERE birim_id = ?',
            [id]
          )
        }
      } catch (cleanupErr) {
        console.warn('Silme öncesi bağlı kayıtları temizleme uyarısı:', cleanupErr)
      }

      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_Birim WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error || 'Birim silinemedi')
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birimler'] })
      queryClient.invalidateQueries({ queryKey: ['personeller_list'] })
      queryClient.invalidateQueries({ queryKey: ['personeller'] })
    }
  })

  return {
    birimler,
    isLoadingBirimler,
    addBirim: addBirimMutation.mutateAsync,
    updateBirim: updateBirimMutation.mutateAsync,
    deleteBirim: deleteBirimMutation.mutateAsync
  }
}
