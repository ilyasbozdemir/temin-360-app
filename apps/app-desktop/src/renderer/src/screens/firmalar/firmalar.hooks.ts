import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface IletisimNotu {
  tarih: string
  not: string
  kisi: string
}

export interface Firma {
  id: number
  firma_kodu: string
  unvan: string
  ilgili_adi: string
  uyrugu: string
  istigal_konusu: string
  adres: string
  ilce: string
  posta_kodu: string
  il: string
  telefon: string
  faks: string
  email: string
  web_adresi: string
  banka_adi: string
  sube_kodu_adi: string
  hesap_no: string
  tc_kimlik_no: string
  dogum_tarihi: string
  vergi_dairesi: string
  vergi_no: string
  aktif_mi: number
  // CRM Alanları
  deneyim_skoru: number
  kalite_skoru: number
  odeme_disiplini: number
  kara_liste: number
  kara_liste_neden: string
  son_iletisim_tarihi: string
  sorumlu_personel_id: number | null
  iletisim_notlari: string // JSON string of IletisimNotu[]
  created_at: string
  updated_at: string
}

export type FirmaInput = Omit<Firma, 'id' | 'aktif_mi' | 'created_at' | 'updated_at'>

const fetchFirmalar = async (): Promise<Firma[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Firma ORDER BY unvan ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useFirmalarHooks() {
  const queryClient = useQueryClient()

  const { data: firmalar = [], isLoading: isLoadingFirmalar } = useQuery({
    queryKey: ['firmalar'],
    queryFn: fetchFirmalar
  })

  const addFirmaMutation = useMutation({
    mutationFn: async (firma: FirmaInput) => {
      // Çift kayıt (duplicate) kontrolü
      const { vergi_no, tc_kimlik_no, unvan } = firma
      const conditions: string[] = []
      const params: any[] = []

      if (vergi_no?.trim()) {
        conditions.push('vergi_no = ?')
        params.push(vergi_no.trim())
      }
      if (tc_kimlik_no?.trim()) {
        conditions.push('tc_kimlik_no = ?')
        params.push(tc_kimlik_no.trim())
      }
      // Eğer ne vergi no ne TC no girilmemişse, isme (unvan) göre duplicate arayalım
      if (!vergi_no?.trim() && !tc_kimlik_no?.trim() && unvan?.trim()) {
        conditions.push('LOWER(unvan) = LOWER(?)')
        params.push(unvan.trim())
      }

      if (conditions.length > 0) {
        const checkQuery = `SELECT unvan FROM TANIM_Firma WHERE ${conditions.join(' OR ')} LIMIT 1`
        const existing = await window.electron.ipcRenderer.invoke('db:query', checkQuery, params)
        if (existing.success && existing.data?.length > 0) {
          throw new Error(
            `Bu bilgilere (Vergi No / TC No / Unvan) sahip firma zaten kayıtlı:\n\n${existing.data[0].unvan}`
          )
        }
      }

      let finalFirmaKodu = (firma.firma_kodu || '').trim()
      if (!finalFirmaKodu) {
        const countRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as cnt FROM TANIM_Firma'
        )
        const nextNum =
          countRes.success && countRes.data && countRes.data.length > 0
            ? (countRes.data[0].cnt || 0) + 1
            : 1
        finalFirmaKodu = nextNum.toString().padStart(4, '0')
      }

      const cols = [
        'firma_kodu',
        'unvan',
        'ilgili_adi',
        'uyrugu',
        'istigal_konusu',
        'adres',
        'ilce',
        'posta_kodu',
        'il',
        'telefon',
        'faks',
        'email',
        'web_adresi',
        'banka_adi',
        'sube_kodu_adi',
        'hesap_no',
        'tc_kimlik_no',
        'dogum_tarihi',
        'vergi_dairesi',
        'vergi_no',
        // CRM
        'deneyim_skoru',
        'kalite_skoru',
        'odeme_disiplini',
        'kara_liste',
        'kara_liste_neden',
        'son_iletisim_tarihi',
        'sorumlu_personel_id',
        'iletisim_notlari'
      ]
      const placeholders = cols.map(() => '?').join(', ')
      const values = cols.map((col) => {
        if (col === 'firma_kodu') return finalFirmaKodu
        return (firma as any)[col] || ''
      })
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Firma (${cols.join(', ')}) VALUES (${placeholders})`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['firmalar'] })
  })

  const updateFirmaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FirmaInput> }) => {
      // Çift kayıt (duplicate) kontrolü (Kendi ID'si hariç)
      const { vergi_no, tc_kimlik_no, unvan } = data
      const conditions: string[] = []
      const params: any[] = []

      if (vergi_no?.trim()) {
        conditions.push('vergi_no = ?')
        params.push(vergi_no.trim())
      }
      if (tc_kimlik_no?.trim()) {
        conditions.push('tc_kimlik_no = ?')
        params.push(tc_kimlik_no.trim())
      }
      if (!vergi_no?.trim() && !tc_kimlik_no?.trim() && unvan?.trim()) {
        conditions.push('LOWER(unvan) = LOWER(?)')
        params.push(unvan.trim())
      }

      if (conditions.length > 0) {
        const checkQuery = `SELECT unvan FROM TANIM_Firma WHERE id != ? AND (${conditions.join(
          ' OR '
        )}) LIMIT 1`
        const existing = await window.electron.ipcRenderer.invoke('db:query', checkQuery, [
          id,
          ...params
        ])
        if (existing.success && existing.data?.length > 0) {
          throw new Error(
            `Bu bilgilere (Vergi No / TC No / Unvan) sahip başka bir firma zaten kayıtlı:\n\n${existing.data[0].unvan}`
          )
        }
      }

      const entries = Object.entries(data).filter(([, v]) => v !== undefined)
      if (entries.length === 0) return
      const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
      const values = [...entries.map(([, v]) => v), id]
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Firma SET ${setClause} WHERE id = ?`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['firmalar'] })
  })

  const deleteFirmaMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_Firma WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['firmalar'] })
  })

  return {
    firmalar,
    isLoadingFirmalar,
    addFirma: addFirmaMutation.mutateAsync,
    updateFirma: updateFirmaMutation.mutateAsync,
    deleteFirma: deleteFirmaMutation.mutateAsync
  }
}

export interface FirmaIletisimNotuItem {
  id: number
  firma_id: number
  not_metni: string
  gorusen_kisi: string
  iletisim_tarihi: string
  created_at: string
}

export function useFirmaNotlariHooks(firmaId?: number | null) {
  const queryClient = useQueryClient()

  const { data: notlar = [], isLoading: isLoadingNotlar } = useQuery({
    queryKey: ['firma_notlari', firmaId],
    queryFn: async (): Promise<FirmaIletisimNotuItem[]> => {
      if (!firmaId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_FirmaIletisimNotu WHERE firma_id = ? ORDER BY id DESC',
        [firmaId]
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: Boolean(firmaId)
  })

  const addNotMutation = useMutation({
    mutationFn: async (notData: {
      firma_id: number
      not_metni: string
      gorusen_kisi?: string
      iletisim_tarihi?: string
    }) => {
      const { firma_id, not_metni, gorusen_kisi, iletisim_tarihi } = notData
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_FirmaIletisimNotu (firma_id, not_metni, gorusen_kisi, iletisim_tarihi) VALUES (?, ?, ?, ?)`,
        [
          firma_id,
          not_metni,
          gorusen_kisi || '',
          iletisim_tarihi || new Date().toISOString().split('T')[0]
        ]
      )
      if (!res.success) throw new Error(res.error)

      // Ayrıca firmanın son_iletisim_tarihi alanını güncelle
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Firma SET son_iletisim_tarihi = ? WHERE id = ?`,
        [iletisim_tarihi || new Date().toISOString().split('T')[0], firma_id]
      )

      return res
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['firma_notlari', variables.firma_id] })
      queryClient.invalidateQueries({ queryKey: ['firmalar'] })
    }
  })

  const deleteNotMutation = useMutation({
    mutationFn: async ({ id, firma_id }: { id: number; firma_id: number }) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_FirmaIletisimNotu WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['firma_notlari', variables.firma_id] })
    }
  })

  return {
    notlar,
    isLoadingNotlar,
    addNot: addNotMutation.mutateAsync,
    deleteNot: deleteNotMutation.mutateAsync
  }
}
