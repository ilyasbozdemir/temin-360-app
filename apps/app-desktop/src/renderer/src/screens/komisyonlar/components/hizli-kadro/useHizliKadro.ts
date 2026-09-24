import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DEFAULT_MUAYENE_ROLES,
  DEFAULT_YAKLASIK_ROLES,
  GorevItem,
  MemberRow,
  PersonelItem
} from './types'

interface UseHizliKadroProps {
  isOpen: boolean
  onClose: () => void
  komisyonId: number | null
  komisyonAdi: string
  activeDosyaId?: number | null
}

export function useHizliKadro({
  isOpen,
  onClose,
  komisyonId,
  komisyonAdi,
  activeDosyaId
}: UseHizliKadroProps) {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<MemberRow[]>([])
  const [syncToActiveFile, setSyncToActiveFile] = useState(true)
  const [searchPersonelTerm, setSearchPersonelTerm] = useState('')
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<string | number | null>(null)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const { data: personeller = [] } = useQuery<PersonelItem[]>({
    queryKey: ['tum_personel_hizli_kadro'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, ad_soyad, unvan, birim FROM TANIM_Personel WHERE COALESCE(aktif_mi, 1) = 1 ORDER BY ad_soyad ASC'
      )
      if (res && res.success && Array.isArray(res.data)) return res.data
      return []
    },
    enabled: isOpen
  })

  const { data: gorevler = [] } = useQuery<GorevItem[]>({
    queryKey: ['tum_gorevler_hizli_kadro'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, ad FROM TANIM_KomisyonGorevi WHERE COALESCE(aktif_mi, 1) = 1 ORDER BY id ASC'
      )
      if (res && res.success && Array.isArray(res.data)) return res.data
      return []
    },
    enabled: isOpen
  })

  useEffect(() => {
    if (!isOpen || !komisyonId) return
    let isMounted = true
    setStatusMessage(null)

    const fetchCurrentMembers = async () => {
      try {
        await window.electron.ipcRenderer
          .invoke(
            'db:run',
            'ALTER TABLE TANIM_KomisyonUye ADD COLUMN belgede_goster INTEGER DEFAULT 1'
          )
          .catch(() => {})
        await window.electron.ipcRenderer
          .invoke('db:run', 'ALTER TABLE DATA_TeminKomisyon ADD COLUMN komisyon_turu TEXT')
          .catch(() => {})
        await window.electron.ipcRenderer
          .invoke(
            'db:run',
            'ALTER TABLE DATA_TeminKomisyon ADD COLUMN belgede_goster INTEGER DEFAULT 1'
          )
          .catch(() => {})
      } catch {
        /* zaten mevcut */
      }

      try {
        // 1. Eğer aktif dosya seçiliyse, öncelikle bu dosyadaki mevcut DATA_TeminKomisyon kayıtlarını getir
        if (activeDosyaId) {
          const fileKomisyonRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT tk.*, tk.gorev as gorev_adi
             FROM DATA_TeminKomisyon tk
             WHERE tk.temin_dosya_id = ? AND (tk.komisyon_id = ? OR tk.komisyon_turu = ?)
             ORDER BY tk.id ASC`,
            [activeDosyaId, komisyonId, komisyonAdi]
          )
          if (fileKomisyonRes.success && fileKomisyonRes.data && fileKomisyonRes.data.length > 0) {
            const seen = new Set<string>()
            const uniqueData = fileKomisyonRes.data.filter((m: any) => {
              const key = m.personel_id
                ? `pid_${m.personel_id}`
                : m.ad_soyad
                  ? `name_${m.ad_soyad.trim().toLowerCase()}`
                  : null
              if (!key || seen.has(key)) return false
              seen.add(key)
              return true
            })
            const mapped: MemberRow[] = uniqueData.map((m: any) => ({
              id: m.id,
              dbUyeId: m.id,
              gorevId: null,
              gorevAd: m.gorev || 'Üye',
              personelId: m.personel_id || null,
              asilMi: (m.rol || '').toLowerCase().includes('yedek') ? 0 : 1,
              belgedeGoster:
                m.belgede_goster === 1 ||
                m.belgede_goster === true ||
                m.belgede_goster === undefined ||
                m.belgede_goster === null
            }))
            if (isMounted) {
              setRows(mapped)
              return
            }
          }
        }

        // 2. Dosyada özel kayıt yoksa kurumsal TANIM_KomisyonUye kayıtlarını getir
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT u.id as db_id, u.komisyon_id, u.personel_id, u.gorev_id, u.asil_mi,
                  COALESCE(u.belgede_goster, 1) as belgede_goster,
                  p.ad_soyad, p.unvan, g.ad as gorev_adi
           FROM TANIM_KomisyonUye u
           LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
           LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
           WHERE u.komisyon_id = ?
           ORDER BY u.id ASC`,
          [komisyonId]
        )

        if (isMounted) {
          if (res.success && res.data && res.data.length > 0) {
            const mapped: MemberRow[] = res.data.map((m: any) => ({
              id: m.db_id,
              dbUyeId: m.db_id,
              gorevId: m.gorev_id || null,
              gorevAd: m.gorev_adi || 'Üye',
              personelId: m.personel_id || null,
              asilMi: m.asil_mi ?? 1,
              belgedeGoster: m.belgede_goster === 1 || m.belgede_goster === true
            }))
            setRows(mapped)
          } else {
            const lower = komisyonAdi.toLowerCase()
            const isMaliyet =
              lower.includes('maliyet') || lower.includes('fiyat') || komisyonId === 1
            const defaultTemplate = isMaliyet ? DEFAULT_YAKLASIK_ROLES : DEFAULT_MUAYENE_ROLES
            const initialRows: MemberRow[] = defaultTemplate.map((t, idx) => ({
              id: `init_${Date.now()}_${idx}`,
              dbUyeId: null,
              gorevId: null,
              gorevAd: t.ad,
              personelId: null,
              asilMi: t.asil,
              belgedeGoster: t.belgedeGoster
            }))
            setRows(initialRows)
          }
        }
      } catch (err) {
        console.error('Komisyon üyeleri çekilirken hata:', err)
      }
    }

    fetchCurrentMembers()
    return () => {
      isMounted = false
    }
  }, [isOpen, komisyonId, komisyonAdi, activeDosyaId])

  const handleAddRow = (gorevAd = 'Üye', asil = 1) => {
    const matchedGorev = gorevler.find((g) => g.ad.toLowerCase() === gorevAd.toLowerCase())
    setRows((prev) => [
      ...prev,
      {
        id: `new_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        dbUyeId: null,
        gorevId: matchedGorev ? matchedGorev.id : null,
        gorevAd,
        personelId: null,
        asilMi: asil,
        belgedeGoster: true
      }
    ])
  }

  const handleRemoveRow = (id: string | number) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const handleSelectPersonel = (rowId: string | number, pId: number | null) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, personelId: pId } : r)))
    setActiveDropdownRowId(null)
    setSearchPersonelTerm('')
  }

  const handleSelectGorev = (rowId: string | number, gorevAd: string, gorevId: number | null) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, gorevAd, gorevId } : r)))
  }

  const handleToggleAsil = (rowId: string | number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, asilMi: r.asilMi === 1 ? 0 : 1 } : r))
    )
  }

  const handleToggleBelgedeGoster = (rowId: string | number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, belgedeGoster: !r.belgedeGoster } : r))
    )
  }

  const handleLoadStandardTemplate = () => {
    const lower = komisyonAdi.toLowerCase()
    const isMaliyet = lower.includes('maliyet') || lower.includes('fiyat') || komisyonId === 1
    const defaultTemplate = isMaliyet ? DEFAULT_YAKLASIK_ROLES : DEFAULT_MUAYENE_ROLES
    const newRows: MemberRow[] = defaultTemplate.map((t, idx) => {
      const matchedG = gorevler.find((g) => g.ad.toLowerCase() === t.ad.toLowerCase())
      return {
        id: `tpl_${Date.now()}_${idx}`,
        dbUyeId: null,
        gorevId: matchedG ? matchedG.id : null,
        gorevAd: t.ad,
        personelId: rows[idx]?.personelId || null,
        asilMi: t.asil,
        belgedeGoster: t.belgedeGoster
      }
    })
    setRows(newRows)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!komisyonId) throw new Error('Komisyon kimliği bulunamadı.')

      try {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'ALTER TABLE TANIM_KomisyonUye ADD COLUMN belgede_goster INTEGER DEFAULT 1'
        )
      } catch {
        /* zaten mevcut */
      }

      // Görev isimlerini tamamla
      for (const row of rows) {
        if (!row.gorevId && row.gorevAd) {
          const findG = gorevler.find((g) => g.ad.toLowerCase() === row.gorevAd.toLowerCase())
          if (findG) {
            row.gorevId = findG.id
          } else {
            const insRes = await window.electron.ipcRenderer.invoke(
              'db:run',
              'INSERT INTO TANIM_KomisyonGorevi (ad, aktif_mi) VALUES (?, 1)',
              [row.gorevAd]
            )
            if (insRes && insRes.lastInsertRowid) {
              row.gorevId = insRes.lastInsertRowid
            }
          }
        }
      }

      // TANIM_KomisyonUye - belgede_goster dahil kaydet
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
        [komisyonId]
      )

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi, sira, belgede_goster) VALUES (?, ?, ?, ?, ?, ?)',
          [
            komisyonId,
            r.gorevId || 1,
            r.personelId || null,
            r.asilMi,
            i + 1,
            r.belgedeGoster ? 1 : 0
          ]
        )
      }

      // Aktif dosyaya senkronize et (belgede_goster dahil)
      if (syncToActiveFile && activeDosyaId) {
        const lower = komisyonAdi.toLowerCase()
        const isMaliyet = lower.includes('maliyet') || lower.includes('fiyat') || komisyonId === 1

        try {
          await window.electron.ipcRenderer
            .invoke('db:run', 'ALTER TABLE DATA_TeminKomisyon ADD COLUMN komisyon_turu TEXT')
            .catch(() => {})
          await window.electron.ipcRenderer
            .invoke(
              'db:run',
              'ALTER TABLE DATA_TeminKomisyon ADD COLUMN belgede_goster INTEGER DEFAULT 1'
            )
            .catch(() => {})
        } catch {
          /* zaten mevcut */
        }

        await window.electron.ipcRenderer.invoke(
          'db:run',
          isMaliyet
            ? `DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id = ? AND (komisyon_id = ? OR komisyon_id = 1 OR LOWER(COALESCE(komisyon_turu, '')) LIKE '%maliyet%' OR LOWER(COALESCE(komisyon_turu, '')) LIKE '%fiyat%')`
            : `DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id = ? AND (komisyon_id = ? OR komisyon_id = 2 OR LOWER(COALESCE(komisyon_turu, '')) LIKE '%muayene%' OR LOWER(COALESCE(komisyon_turu, '')) LIKE '%kabul%')`,
          [activeDosyaId, komisyonId]
        )

        const insertedPids = new Set<number>()
        for (const r of rows) {
          if (r.personelId && !insertedPids.has(r.personelId)) {
            insertedPids.add(r.personelId)
            const p = personeller.find((item) => item.id === r.personelId)
            if (p) {
              const rol =
                r.asilMi === 0
                  ? 'Yedek Üye'
                  : r.gorevAd.toLowerCase().includes('başkan')
                    ? 'Başkan'
                    : 'Üye'
              await window.electron.ipcRenderer.invoke(
                'db:run',
                `INSERT INTO DATA_TeminKomisyon 
                 (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol, komisyon_turu, belgede_goster)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  activeDosyaId,
                  komisyonId,
                  p.id,
                  p.ad_soyad,
                  p.unvan || '',
                  r.gorevAd,
                  rol,
                  komisyonAdi,
                  r.belgedeGoster ? 1 : 0
                ]
              )
            }
          }
        }
      }

      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      queryClient.invalidateQueries({
        queryKey: ['komisyon_detay', komisyonId]
      })
      queryClient.invalidateQueries({ queryKey: ['dosya_komisyonlar'] })
      queryClient.invalidateQueries({ queryKey: ['document_preview'] })
      setStatusMessage({
        type: 'success',
        text: 'Komisyon kadrosu başarıyla güncellendi.'
      })
      setTimeout(() => onClose(), 700)
    },
    onError: (err: any) => {
      setStatusMessage({
        type: 'error',
        text: 'Kaydedilirken hata oluştu: ' + err.message
      })
    }
  })

  return {
    rows,
    personeller,
    gorevler,
    syncToActiveFile,
    setSyncToActiveFile,
    searchPersonelTerm,
    setSearchPersonelTerm,
    activeDropdownRowId,
    setActiveDropdownRowId,
    statusMessage,
    handleAddRow,
    handleRemoveRow,
    handleSelectPersonel,
    handleSelectGorev,
    handleToggleAsil,
    handleToggleBelgedeGoster,
    handleLoadStandardTemplate,
    saveMutation
  }
}
