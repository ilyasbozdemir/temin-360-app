import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { emitAppEvent, useAppEventListener } from '../../utils/appEvents'

export interface TeminDosyasi {
  id: number
  temin_no: string
  dosya_acilis_tarihi: string | null
  butce_yili: number | null
  butce_tipi: string | null
  konu: string
  isin_aciklamasi: string | null
  birim_id: number | null

  antet_ek_satir: string | null
  sunulacak_makam: string | null
  ihtiyac_yeri: string | null

  e_butce: string | null
  fonksiyonel_kod: string | null
  muhasebe_birimi: string | null
  harcama_birimi: string | null
  finansman_kodu: string | null
  ekonomik_kod: string | null

  ihale_tipi: string | null
  tur: string
  ihale_sekli: string | null

  teklif_sozlesme_turu: string | null
  alt_yuklenici_olacak_mi: number
  kismi_teklif_verilecek_mi: number
  fiyat_farki_dayanagi: string | null
  yatirim_proje_no: string | null
  project_id?: number | null
  proje_kodu?: string | null
  proje_adi?: string | null
  proje_renk?: string | null
  tags?: string | null
  avans_verilecek_mi: number
  yillara_yaygin: number
  sozlesme_yapilacak_mi: number
  isin_aciklama_maddeleri: string | null

  yaklasik_maliyet_hesaplamasi: string | null
  yaklasik_maliyet_kdv_dahil_mi: number | null
  kdv: string | null
  hesaplama_esasi: string | null
  komisyon_takdiri: string | null
  tibbi_cihaz_alimi_mi: number

  irtibat_yetkilisi_id: number | null
  son_teklif_verme_tarihi: string | null
  teslim_tarihi: string | null

  yaklasik_maliyet: number
  butce_kodu: string | null
  temin_tarihi: string | null
  firma_id: number | null
  onay_personel_id: number | null
  hazirlayan_personel_id: number | null
  talep_eden_personel_id: number | null
  sunan_personel_id: number | null
  durum_asama_id: number | null
  mevzuat_id: number | null
  notlar: string | null
  tekrar_no: number | null
  status: string
  is_deleted: number
  ekap_no: string | null
  is_ekap_sent: number
  surec_taslak_id?: number | null
  ordered_docs?: string | null
  starred_docs?: string | null
  skipped_docs?: string | null
  created_at: string
  updated_at: string
  birim_adi?: string | null
  irtibat_ad?: string | null
  onaylayan_ad?: string | null
  sunan_ad?: string | null
  hazirlayan_ad?: string | null
  talep_eden_ad?: string | null
}

const fetchDosyalar = async (): Promise<TeminDosyasi[]> => {
  if (!window.electron) return []
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    `SELECT d.*, b.birim_adi,
      prj.proje_kodu,
      COALESCE(prj.proje_adi, d.proje_adi) AS proje_adi,
      prj.renk AS proje_renk,
      p_irtibat.ad_soyad AS irtibat_ad,
      p_onay.ad_soyad AS onaylayan_ad,
      p_sunan.ad_soyad AS sunan_ad,
      p_hazir.ad_soyad AS hazirlayan_ad,
      p_talep.ad_soyad AS talep_eden_ad
    FROM DATA_TeminDosyasi d 
    LEFT JOIN TANIM_Birim b ON d.birim_id = b.id
    LEFT JOIN TANIM_Proje prj ON d.project_id = prj.id
    LEFT JOIN TANIM_Personel p_irtibat ON d.irtibat_yetkilisi_id = p_irtibat.id
    LEFT JOIN TANIM_Personel p_onay ON d.onay_personel_id = p_onay.id
    LEFT JOIN TANIM_Personel p_sunan ON d.sunan_personel_id = p_sunan.id
    LEFT JOIN TANIM_Personel p_hazir ON d.hazirlayan_personel_id = p_hazir.id
    LEFT JOIN TANIM_Personel p_talep ON d.talep_eden_personel_id = p_talep.id
    ORDER BY COALESCE(d.dosya_acilis_tarihi, d.created_at) DESC, d.id DESC`
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useDosyalarHooks() {
  const queryClient = useQueryClient()

  useAppEventListener(
    ['dossier:created', 'dossier:updated', 'dossier:deleted', 'status:changed', 'workspace:refreshed'],
    () => {
      queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
    }
  )

  const { data: dosyalar = [], isLoading: isLoadingDosyalar } = useQuery({
    queryKey: ['temin_dosyalari'],
    queryFn: fetchDosyalar
  })

  const addDosyaMutation = useMutation({
    mutationFn: async (dosya: Partial<TeminDosyasi>) => {
      if (!window.electron)
        throw new Error(
          'Bu özellik sadece masaüstü uygulamasında çalışır (Tarayıcı desteklenmiyor).'
        )
      
      let validColumns: string[] = []
      try {
        const pragmaRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'PRAGMA table_info(DATA_TeminDosyasi)'
        )
        if (pragmaRes?.success && Array.isArray(pragmaRes.data)) {
          validColumns = pragmaRes.data.map((col: any) => col.name)
        }
      } catch (e) {
        console.warn('Pragma table info failed', e)
      }

      const columns = Object.keys(dosya).filter(
        (k) =>
          k !== 'id' &&
          dosya[k as keyof TeminDosyasi] !== undefined &&
          (validColumns.length === 0 || validColumns.includes(k))
      )
      const placeholders = columns.map(() => '?').join(', ')
      const values = columns.map((k) => dosya[k as keyof TeminDosyasi])

      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_TeminDosyasi (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
      const insertedId = (data as { lastInsertRowid?: number })?.lastInsertRowid
      emitAppEvent('dossier:created', { dosyaId: insertedId })
    }
  })

  const updateDosyaMutation = useMutation({
    mutationFn: async (dosya: Partial<TeminDosyasi> & { id: number }) => {
      if (!window.electron) throw new Error('Bu özellik sadece masaüstü uygulamasında çalışır.')
      
      let validColumns: string[] = []
      try {
        const pragmaRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'PRAGMA table_info(DATA_TeminDosyasi)'
        )
        if (pragmaRes?.success && Array.isArray(pragmaRes.data)) {
          validColumns = pragmaRes.data.map((col: any) => col.name)
        }
      } catch (e) {
        console.warn('Pragma table info failed', e)
      }

      const columns = Object.keys(dosya).filter(
        (k) =>
          k !== 'id' &&
          dosya[k as keyof TeminDosyasi] !== undefined &&
          (validColumns.length === 0 || validColumns.includes(k))
      )
      const setClause = columns.map((k) => `${k} = ?`).join(', ')
      const values = columns.map((k) => dosya[k as keyof TeminDosyasi])

      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, dosya.id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
      emitAppEvent('dossier:updated', { dosyaId: variables.id, payload: variables })
    }
  })

  const deleteDosyaMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!window.electron) throw new Error('Bu özellik sadece masaüstü uygulamasında çalışır.')
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
      emitAppEvent('dossier:deleted', { dosyaId: id })
    }
  })

  const hardDeleteDosyaMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!window.electron) throw new Error('Bu özellik sadece masaüstü uygulamasında çalışır.')
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminDosyasi WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
      emitAppEvent('dossier:deleted', { dosyaId: id })
    }
  })

  const bulkDeleteDosyalarMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      if (!window.electron) throw new Error('Bu özellik sadece masaüstü uygulamasında çalışır.')
      if (ids.length === 0) return { success: true }
      const placeholders = ids.map(() => '?').join(', ')
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
        ids
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
      emitAppEvent('dossier:deleted', {})
    }
  })

  const bulkHardDeleteDosyalarMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      if (!window.electron) throw new Error('Bu özellik sadece masaüstü uygulamasında çalışır.')
      if (ids.length === 0) return { success: true }
      const placeholders = ids.map(() => '?').join(', ')
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `DELETE FROM DATA_TeminDosyasi WHERE id IN (${placeholders})`,
        ids
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
      emitAppEvent('dossier:deleted', {})
    }
  })

  return {
    dosyalar,
    isLoadingDosyalar,
    addDosya: addDosyaMutation.mutateAsync,
    updateDosya: updateDosyaMutation.mutateAsync,
    deleteDosya: deleteDosyaMutation.mutateAsync,
    hardDeleteDosya: hardDeleteDosyaMutation.mutateAsync,
    bulkDeleteDosyalar: bulkDeleteDosyalarMutation.mutateAsync,
    bulkHardDeleteDosyalar: bulkHardDeleteDosyalarMutation.mutateAsync
  }
}
