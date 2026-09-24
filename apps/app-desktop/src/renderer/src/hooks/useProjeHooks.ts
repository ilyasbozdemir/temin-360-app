import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Proje {
  id: number
  proje_kodu: string
  proje_adi: string
  aciklama?: string | null
  toplam_butce: number
  baslangic_tarihi?: string | null
  bitis_tarihi?: string | null
  lokasyon?: string | null
  durum: 'planlama' | 'devam' | 'tamamlandi'
  renk?: string | null
  aktif_mi: number
  created_at: string
  updated_at: string
  // Computed / Aggregate Fields
  dosya_sayisi?: number
  harcanan_tutar?: number
  kalan_butce?: number
  harcama_yuzdesi?: number
}

export type ProjeInput = Omit<
  Proje,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'dosya_sayisi'
  | 'harcanan_tutar'
  | 'kalan_butce'
  | 'harcama_yuzdesi'
>

const fetchProjeler = async (): Promise<Proje[]> => {
  if (!window.electron) return []
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    `SELECT p.*,
      COUNT(d.id) AS dosya_sayisi,
      COALESCE(SUM(CASE WHEN d.is_deleted = 0 THEN d.yaklasik_maliyet ELSE 0 END), 0) AS harcanan_tutar
    FROM TANIM_Proje p
    LEFT JOIN DATA_TeminDosyasi d ON d.project_id = p.id
    WHERE p.aktif_mi = 1
    GROUP BY p.id
    ORDER BY p.id DESC`
  )
  if (!res.success) throw new Error(res.error)

  return (res.data || []).map((p: any) => {
    const toplam = Number(p.toplam_butce) || 0
    const harcanan = Number(p.harcanan_tutar) || 0
    const kalan = Math.max(0, toplam - harcanan)
    const yuzde = toplam > 0 ? Math.min(100, Math.round((harcanan / toplam) * 100)) : 0
    return {
      ...p,
      toplam_butce: toplam,
      harcanan_tutar: harcanan,
      kalan_butce: kalan,
      harcama_yuzdesi: yuzde,
      dosya_sayisi: Number(p.dosya_sayisi) || 0
    }
  })
}

export function useProjeHooks() {
  const queryClient = useQueryClient()

  const { data: projeler = [], isLoading: isLoadingProjeler } = useQuery({
    queryKey: ['projeler'],
    queryFn: fetchProjeler
  })

  const addProjeMutation = useMutation({
    mutationFn: async (proje: Partial<ProjeInput>) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Proje (proje_kodu, proje_adi, aciklama, toplam_butce, baslangic_tarihi, bitis_tarihi, lokasyon, durum, renk, aktif_mi)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          proje.proje_kodu ||
            `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          proje.proje_adi || '',
          proje.aciklama || '',
          Number(proje.toplam_butce) || 0,
          proje.baslangic_tarihi || null,
          proje.bitis_tarihi || null,
          proje.lokasyon || '',
          proje.durum || 'devam',
          proje.renk || '#3b82f6'
        ]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projeler'] })
      queryClient.invalidateQueries({ queryKey: ['dosyalar'] })
    }
  })

  const updateProjeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProjeInput> }) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Proje SET 
          proje_kodu = COALESCE(?, proje_kodu),
          proje_adi = COALESCE(?, proje_adi),
          aciklama = COALESCE(?, aciklama),
          toplam_butce = COALESCE(?, toplam_butce),
          baslangic_tarihi = ?,
          bitis_tarihi = ?,
          lokasyon = ?,
          durum = COALESCE(?, durum),
          renk = COALESCE(?, renk),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          data.proje_kodu,
          data.proje_adi,
          data.aciklama,
          data.toplam_butce !== undefined ? Number(data.toplam_butce) : undefined,
          data.baslangic_tarihi || null,
          data.bitis_tarihi || null,
          data.lokasyon || '',
          data.durum,
          data.renk,
          id
        ]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projeler'] })
      queryClient.invalidateQueries({ queryKey: ['dosyalar'] })
    }
  })

  const deleteProjeMutation = useMutation({
    mutationFn: async (id: number) => {
      // Soft delete: aktif_mi = 0
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Proje SET aktif_mi = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projeler'] })
      queryClient.invalidateQueries({ queryKey: ['dosyalar'] })
    }
  })

  return {
    projeler,
    isLoadingProjeler,
    addProje: addProjeMutation.mutateAsync,
    updateProje: updateProjeMutation.mutateAsync,
    deleteProje: deleteProjeMutation.mutateAsync
  }
}

export interface ProjeDosyasi {
  id: number
  dosya_no: string
  is_adi: string
  yaklasik_maliyet: number
  sozlesme_bedeli?: number
  surec_durumu?: string
  alim_turu?: string
  created_at: string
}

export function useProjeDosyalari(projeId: number | null | undefined) {
  return useQuery({
    queryKey: ['proje-dosyalari', projeId],
    queryFn: async (): Promise<ProjeDosyasi[]> => {
      if (!projeId || !window.electron) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT id, dosya_no, is_adi, yaklasik_maliyet, sozlesme_bedeli, surec_durumu, alim_turu, created_at
         FROM DATA_TeminDosyasi
         WHERE project_id = ? AND is_deleted = 0
         ORDER BY id DESC`,
        [projeId]
      )
      if (!res.success) throw new Error(res.error)
      return res.data || []
    },
    enabled: Boolean(projeId)
  })
}
