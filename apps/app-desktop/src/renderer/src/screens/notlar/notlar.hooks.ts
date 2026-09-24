import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NotVeGorev, NotInput } from './types'

export interface DosyaOption {
  id: number
  dosya_no: string
  isin_adi: string
  yil: number
}

const fetchNotlar = async (): Promise<NotVeGorev[]> => {
  const sql = `
    SELECT 
      n.*,
      d.temin_no as dosya_no,
      d.konu as dosya_konusu
    FROM DATA_NotVeGorev n
    LEFT JOIN DATA_TeminDosyasi d ON n.temin_dosya_id = d.id
    ORDER BY n.sabitlendi DESC, n.tamamlandi ASC, n.id DESC
  `
  const res = await window.electron.ipcRenderer.invoke('db:query', sql)
  if (!res.success) {
    // Tablo ilk kez sorgulanırken hata olursa boş dizi dön
    console.warn('DATA_NotVeGorev sorgulanamadı:', res.error)
    return []
  }
  return res.data || []
}

const fetchDosyalar = async (): Promise<DosyaOption[]> => {
  const sql = `
    SELECT id, temin_no as dosya_no, konu as isin_adi, coalesce(butce_yili, 2026) as yil
    FROM DATA_TeminDosyasi
    ORDER BY id DESC
  `
  const res = await window.electron.ipcRenderer.invoke('db:query', sql)
  if (!res.success) return []
  return res.data || []
}

export function useNotlarHooks() {
  const queryClient = useQueryClient()

  const {
    data: notlar = [],
    isLoading: isLoadingNotlar,
    refetch: refetchNotlar
  } = useQuery({
    queryKey: ['notlar'],
    queryFn: fetchNotlar,
    staleTime: 1000 * 10
  })

  const { data: dosyalar = [], isLoading: isLoadingDosyalar } = useQuery({
    queryKey: ['notlar_dosyalar'],
    queryFn: fetchDosyalar,
    staleTime: 1000 * 60 * 2
  })

  const createNotMutation = useMutation({
    mutationFn: async (input: Partial<NotInput>) => {
      const uuid =
        input.uuid ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `not_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
      const sql = `
        INSERT INTO DATA_NotVeGorev (
          uuid, temin_dosya_id, baslik, icerik, tip, kategori, oncelik,
          tamamlandi, vade_tarihi, renk, sabitlendi, sira, etiketler
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      const params = [
        uuid,
        input.temin_dosya_id || null,
        input.baslik || 'Yeni Görev',
        input.icerik || '',
        input.tip || 'todo',
        input.kategori || 'Genel',
        input.oncelik || 'orta',
        input.tamamlandi ? 1 : 0,
        input.vade_tarihi || null,
        input.renk || 'slate',
        input.sabitlendi ? 1 : 0,
        input.sira || 0,
        input.etiketler || null
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notlar'] })
    }
  })

  const toggleNotMutation = useMutation({
    mutationFn: async ({ id, tamamlandi }: { id: number; tamamlandi: boolean }) => {
      const sql = `
        UPDATE DATA_NotVeGorev
        SET 
          tamamlandi = ?,
          tamamlanma_tarihi = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      const completedVal = tamamlandi ? 1 : 0
      const completedTime = tamamlandi ? new Date().toISOString() : null
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, [
        completedVal,
        completedTime,
        id
      ])
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notlar'] })
    }
  })

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, sabitlendi }: { id: number; sabitlendi: boolean }) => {
      const sql = `
        UPDATE DATA_NotVeGorev
        SET sabitlendi = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, [sabitlendi ? 1 : 0, id])
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notlar'] })
    }
  })

  const updateNotMutation = useMutation({
    mutationFn: async (item: Partial<NotVeGorev> & { id: number }) => {
      const sql = `
        UPDATE DATA_NotVeGorev
        SET 
          temin_dosya_id = ?,
          baslik = ?,
          icerik = ?,
          tip = ?,
          kategori = ?,
          oncelik = ?,
          vade_tarihi = ?,
          renk = ?,
          sabitlendi = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      const params = [
        item.temin_dosya_id || null,
        item.baslik,
        item.icerik || '',
        item.tip || 'todo',
        item.kategori || 'Genel',
        item.oncelik || 'orta',
        item.vade_tarihi || null,
        item.renk || 'slate',
        item.sabitlendi ? 1 : 0,
        item.id
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notlar'] })
    }
  })

  const deleteNotMutation = useMutation({
    mutationFn: async (id: number) => {
      const sql = 'DELETE FROM DATA_NotVeGorev WHERE id = ?'
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, [id])
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notlar'] })
    }
  })

  return {
    notlar,
    isLoadingNotlar,
    dosyalar,
    isLoadingDosyalar,
    refetchNotlar,
    createNot: createNotMutation.mutateAsync,
    isCreating: createNotMutation.isPending,
    toggleNot: toggleNotMutation.mutateAsync,
    togglePin: togglePinMutation.mutateAsync,
    updateNot: updateNotMutation.mutateAsync,
    isUpdating: updateNotMutation.isPending,
    deleteNot: deleteNotMutation.mutateAsync,
    isDeleting: deleteNotMutation.isPending
  }
}
