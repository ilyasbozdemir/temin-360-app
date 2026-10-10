import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DOC_GROUPS } from '@temin360/document-templates'
import {
  DEFAULT_MUAYENE_ROLES,
  DEFAULT_YAKLASIK_ROLES,
  GorevItem,
  MemberRow,
  PersonelItem,
  getDefaultScopeForRole
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
        'SELECT id, ad, aciklama FROM TANIM_KomisyonGorevi WHERE COALESCE(aktif_mi, 1) = 1 ORDER BY id ASC'
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
          .invoke(
            'db:run',
            "ALTER TABLE TANIM_KomisyonUye ADD COLUMN belge_kapsami TEXT DEFAULT 'tumu'"
          )
          .catch(() => {})
        await window.electron.ipcRenderer
          .invoke(
            'db:run',
            'ALTER TABLE TANIM_KomisyonUye ADD COLUMN hedef_belgeler TEXT DEFAULT \'["*"]\''
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
        await window.electron.ipcRenderer
          .invoke(
            'db:run',
            "ALTER TABLE DATA_TeminKomisyon ADD COLUMN belge_kapsami TEXT DEFAULT 'tumu'"
          )
          .catch(() => {})
        await window.electron.ipcRenderer
          .invoke(
            'db:run',
            'ALTER TABLE DATA_TeminKomisyon ADD COLUMN hedef_belgeler TEXT DEFAULT \'["*"]\''
          )
          .catch(() => {})
      } catch {
        /* zaten mevcut */
      }

      try {
        // 1. Her durumda kurumsal TANIM_KomisyonUye kayıtlarını al (Master şablon)
        const masterRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT u.id as db_id, u.komisyon_id, u.personel_id, u.gorev_id, u.asil_mi,
                  COALESCE(u.belgede_goster, 1) as belgede_goster,
                  COALESCE(u.belge_kapsami, 'tumu') as belge_kapsami,
                  u.hedef_belgeler,
                  p.ad_soyad, p.unvan, g.ad as gorev_adi
           FROM TANIM_KomisyonUye u
           LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
           LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
           WHERE u.komisyon_id = ?
           ORDER BY u.id ASC`,
          [komisyonId]
        )
        const masterData = masterRes.success && masterRes.data ? masterRes.data : []

        // 2. Eğer aktif dosya seçiliyse, bu dosyadaki DATA_TeminKomisyon kayıtlarını al
        let fileData: any[] = []
        if (activeDosyaId) {
          const lower = komisyonAdi.toLowerCase()
          const isMaliyet = lower.includes('maliyet') || lower.includes('fiyat') || komisyonId === 1
          const fileKomisyonRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            isMaliyet
              ? `SELECT tk.*, tk.gorev as gorev_adi
                 FROM DATA_TeminKomisyon tk
                 WHERE tk.temin_dosya_id = ? AND (tk.komisyon_id = 1 OR LOWER(COALESCE(tk.komisyon_turu, '')) LIKE '%maliyet%' OR LOWER(COALESCE(tk.komisyon_turu, '')) LIKE '%fiyat%')
                 ORDER BY tk.id ASC`
              : `SELECT tk.*, tk.gorev as gorev_adi
                 FROM DATA_TeminKomisyon tk
                 WHERE tk.temin_dosya_id = ? AND (tk.komisyon_id = 2 OR LOWER(COALESCE(tk.komisyon_turu, '')) LIKE '%muayene%' OR LOWER(COALESCE(tk.komisyon_turu, '')) LIKE '%kabul%')
                 ORDER BY tk.id ASC`,
            [activeDosyaId]
          )
          if (fileKomisyonRes.success && fileKomisyonRes.data) {
            fileData = fileKomisyonRes.data
          }
        }

        const parseDocs = (raw: any): string[] => {
          if (!raw) return []
          if (Array.isArray(raw)) return raw
          try {
            const p = JSON.parse(raw)
            return Array.isArray(p) ? p : []
          } catch {
            return []
          }
        }

        const extractBelgeSablonIds = (m: any): string[] | null => {
          const isShow =
            m.belgede_goster !== 0 &&
            m.belgede_goster !== false &&
            m.belgede_goster !== '0' &&
            m.belgede_goster !== 'false'

          const scope = m.belge_kapsami ? String(m.belge_kapsami).trim().toLowerCase() : ''
          const parsedDocs = parseDocs(m.hedef_belgeler)

          if (scope === 'gizli' || !isShow) {
            return []
          }
          if (scope === 'tumu' || parsedDocs.includes('*') || parsedDocs.includes('all')) {
            return null
          }
          if (parsedDocs.length > 0) {
            return parsedDocs
          }
          if (scope && DOC_GROUPS[scope as keyof typeof DOC_GROUPS]) {
            return [...DOC_GROUPS[scope as keyof typeof DOC_GROUPS]]
          }
          return null
        }

        // 3. Birleştirme (Dosyaya özel veriler varsa onları, eksik kalan kadroları master'dan tamamla)
        let finalMembers: MemberRow[] = []

        if (fileData.length > 0) {
          const fileMapped: MemberRow[] = fileData.map((m: any) => {
            const sablonIds = extractBelgeSablonIds(m)
            return {
              id: m.id,
              dbUyeId: m.id,
              gorevId: null,
              gorevAd: m.gorev || 'Üye',
              personelId: m.personel_id || null,
              asilMi: (m.rol || '').toLowerCase().includes('yedek') ? 0 : 1,
              belgedeGoster: sablonIds === null || sablonIds.length > 0,
              belgeSablonIds: sablonIds
            }
          })

          // Master'da tanımlı olup dosyaya yansımamış Onay Veren / Belgede Gösterilmeyen rolleri de ekle
          const existingPids = new Set(fileMapped.map((r) => r.personelId).filter(Boolean))
          const existingGorevs = new Set(fileMapped.map((r) => r.gorevAd.toLowerCase()))

          for (const m of masterData) {
            const mGorev = (m.gorev_adi || 'Üye').toLowerCase()
            const mPid = m.personel_id || null
            if (
              (mPid && existingPids.has(mPid)) ||
              (mGorev.includes('yetkili') && existingGorevs.has(mGorev))
            ) {
              continue
            }
            const sablonIds = extractBelgeSablonIds(m)
            fileMapped.push({
              id: `master_extra_${m.db_id}`,
              dbUyeId: m.db_id,
              gorevId: m.gorev_id || null,
              gorevAd: m.gorev_adi || 'Üye',
              personelId: mPid,
              asilMi: m.asil_mi ?? 1,
              belgedeGoster: sablonIds === null || sablonIds.length > 0,
              belgeSablonIds: sablonIds
            })
          }
          finalMembers = fileMapped
        } else if (masterData.length > 0) {
          finalMembers = masterData.map((m: any) => {
            const sablonIds = extractBelgeSablonIds(m)
            return {
              id: m.db_id,
              dbUyeId: m.db_id,
              gorevId: m.gorev_id || null,
              gorevAd: m.gorev_adi || 'Üye',
              personelId: m.personel_id || null,
              asilMi: m.asil_mi ?? 1,
              belgedeGoster: sablonIds === null || sablonIds.length > 0,
              belgeSablonIds: sablonIds
            }
          })
        } else {
          const lower = komisyonAdi.toLowerCase()
          const isMaliyet = lower.includes('maliyet') || lower.includes('fiyat') || komisyonId === 1
          const defaultTemplate = isMaliyet ? DEFAULT_YAKLASIK_ROLES : DEFAULT_MUAYENE_ROLES
          finalMembers = defaultTemplate.map((t, idx) => ({
            id: `init_${Date.now()}_${idx}`,
            dbUyeId: null,
            gorevId: null,
            gorevAd: t.ad,
            personelId: null,
            asilMi: t.asil,
            belgedeGoster: t.belgedeGoster,
            belgeSablonIds: t.belgeSablonIds
          }))
        }

        if (isMounted) {
          setRows(finalMembers)
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
    const { belgeSablonIds, belgedeGoster } = getDefaultScopeForRole(gorevAd)
    setRows((prev) => [
      ...prev,
      {
        id: `new_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        dbUyeId: null,
        gorevId: matchedGorev ? matchedGorev.id : null,
        gorevAd,
        personelId: null,
        asilMi: asil,
        belgedeGoster,
        belgeSablonIds
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
    const { belgeSablonIds, belgedeGoster } = getDefaultScopeForRole(gorevAd)
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              gorevAd,
              gorevId,
              belgeSablonIds,
              belgedeGoster
            }
          : r
      )
    )
  }

  const handleToggleAsil = (rowId: string | number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, asilMi: r.asilMi === 1 ? 0 : 1 } : r))
    )
  }

  const handleChangeBelgeSablonIds = (rowId: string | number, sablonIds: string[] | null) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              belgeSablonIds: sablonIds,
              belgedeGoster: sablonIds === null || sablonIds.length > 0
            }
          : r
      )
    )
  }

  const handleToggleBelgedeGoster = (rowId: string | number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r
        const isCurrentlyHidden = Array.isArray(r.belgeSablonIds) && r.belgeSablonIds.length === 0
        return {
          ...r,
          belgedeGoster: isCurrentlyHidden,
          belgeSablonIds: isCurrentlyHidden ? null : []
        }
      })
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
        belgedeGoster: t.belgedeGoster,
        belgeSablonIds: t.belgeSablonIds
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
        await window.electron.ipcRenderer.invoke(
          'db:run',
          "ALTER TABLE TANIM_KomisyonUye ADD COLUMN belge_kapsami TEXT DEFAULT 'tumu'"
        )
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'ALTER TABLE TANIM_KomisyonUye ADD COLUMN hedef_belgeler TEXT DEFAULT \'["*"]\''
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

      // Atomic Transaction hazırlanıyor
      const txStatements: { sql: string; params: any[] }[] = []

      // 1. TANIM_KomisyonUye temizleme ve toplu ekleme
      txStatements.push({
        sql: 'DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
        params: [komisyonId]
      })

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        const isShow = r.belgeSablonIds === null || r.belgeSablonIds.length > 0
        const scope = r.belgeSablonIds === null ? 'tumu' : r.belgeSablonIds.length === 0 ? 'gizli' : 'ozel'
        const hedefJson = JSON.stringify(r.belgeSablonIds === null ? ['*'] : r.belgeSablonIds)
        txStatements.push({
          sql: 'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi, sira, belgede_goster, belge_kapsami, hedef_belgeler) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          params: [
            komisyonId,
            r.gorevId || 1,
            r.personelId || null,
            r.asilMi,
            i + 1,
            isShow ? 1 : 0,
            scope,
            hedefJson
          ]
        })
      }

      // 2. Aktif dosyaya senkronize et
      if (syncToActiveFile && activeDosyaId) {
        const lower = komisyonAdi.toLowerCase()
        const isMaliyet = lower.includes('maliyet') || lower.includes('fiyat') || komisyonId === 1

        txStatements.push({
          sql: isMaliyet
            ? `DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id = ? AND (komisyon_id = ? OR komisyon_id = 1 OR LOWER(COALESCE(komisyon_turu, '')) LIKE '%maliyet%' OR LOWER(COALESCE(komisyon_turu, '')) LIKE '%fiyat%')`
            : `DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id = ? AND (komisyon_id = ? OR komisyon_id = 2 OR LOWER(COALESCE(komisyon_turu, '')) LIKE '%muayene%' OR LOWER(COALESCE(komisyon_turu, '')) LIKE '%kabul%')`,
          params: [activeDosyaId, komisyonId]
        })

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
              const isShow = r.belgeSablonIds === null || r.belgeSablonIds.length > 0
              const scope = r.belgeSablonIds === null ? 'tumu' : r.belgeSablonIds.length === 0 ? 'gizli' : 'ozel'
              const hedefJson = JSON.stringify(r.belgeSablonIds === null ? ['*'] : r.belgeSablonIds)
              txStatements.push({
                sql: `INSERT INTO DATA_TeminKomisyon 
                      (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol, komisyon_turu, belgede_goster, belge_kapsami, hedef_belgeler)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                params: [
                  activeDosyaId,
                  komisyonId,
                  p.id,
                  p.ad_soyad,
                  p.unvan || '',
                  r.gorevAd,
                  rol,
                  komisyonAdi,
                  isShow ? 1 : 0,
                  scope,
                  hedefJson
                ]
              })
            }
          }
        }
      }

      // Tekil atomic transaction çalıştır
      const txRes = await window.electron.ipcRenderer.invoke('db:transaction', txStatements)
      if (txRes && txRes.success === false) {
        throw new Error(txRes.error || 'Veritabanı transaction kaydedilemedi.')
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
    handleChangeBelgeSablonIds,
    handleToggleBelgedeGoster,
    handleLoadStandardTemplate,
    saveMutation
  }
}
