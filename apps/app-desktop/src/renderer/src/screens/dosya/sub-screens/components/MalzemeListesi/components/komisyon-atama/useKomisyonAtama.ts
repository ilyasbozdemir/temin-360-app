import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { documentPreloadService } from '@renderer/services/documentPreloadService'
import { DEFAULT_MALIYET_ROLES, DEFAULT_MUAYENE_ROLES, getRoleDefaults } from './constants'
import type { KomisyonRow, KomisyonType, KurumInfo, PersonelItem } from './types'

interface UseKomisyonAtamaParams {
  isOpen: boolean
  onClose: () => void
  initialType?: KomisyonType
  activeDosyaId?: number | null
  onOpenDocument?: (docName: string) => void
}

export function useKomisyonAtama({
  isOpen,
  onClose,
  initialType = 'yaklasik_maliyet',
  activeDosyaId,
  onOpenDocument
}: UseKomisyonAtamaParams) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<KomisyonType>(initialType)
  const [personeller, setPersoneller] = useState<PersonelItem[]>([])
  const [gorevler, setGorevler] = useState<string[]>([])
  const [kurumInfo, setKurumInfo] = useState<KurumInfo | null>(null)

  const [maliyetRows, setMaliyetRows] = useState<KomisyonRow[]>(
    DEFAULT_MALIYET_ROLES.map((item, idx) => ({
      sira: idx + 1,
      gorev: item.gorev,
      personelId: null,
      belgedeGoster: item.belgedeGoster
    }))
  )

  const [muayeneRows, setMuayeneRows] = useState<KomisyonRow[]>(
    DEFAULT_MUAYENE_ROLES.map((item, idx) => ({
      sira: idx + 1,
      gorev: item.gorev,
      personelId: null,
      belgedeGoster: item.belgedeGoster
    }))
  )

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [syncToGlobalCommission, setSyncToGlobalCommission] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (initialType) {
      setActiveTab(initialType)
    }
  }, [initialType])

  // Personel listesi, kurum bilgisi, görev tanımları ve mevcut komisyon üyelerini yükle
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const loadData = async () => {
      setLoading(true)
      try {
        // 1. Kurum bilgisi
        try {
          const kInfoRes = await (window as any).electron.ipcRenderer.invoke(
            'db:query',
            'SELECT kurum_adi, makam_adi, kurum_tipi, alt_kurum_tipi FROM TANIM_Kurum LIMIT 1'
          )
          if (kInfoRes.success && kInfoRes.data?.[0] && isMounted) {
            setKurumInfo({
              kurumAdi: kInfoRes.data[0].kurum_adi,
              makamAdi: kInfoRes.data[0].makam_adi,
              kurumTipi: kInfoRes.data[0].kurum_tipi || kInfoRes.data[0].alt_kurum_tipi
            })
          }
        } catch (e) {
          console.warn('Kurum bilgisi okunamadı:', e)
        }

        // 2. Personel listesi
        const pRes = await (window as any).electron.ipcRenderer.invoke(
          'db:query',
          'SELECT id, ad_soyad, unvan FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC'
        )
        const pList: PersonelItem[] = pRes.success && pRes.data ? pRes.data : []
        if (isMounted) setPersoneller(pList)

        // 3. Görev tanımları (TANIM_KomisyonGorevi)
        try {
          const gRes = await (window as any).electron.ipcRenderer.invoke(
            'db:query',
            'SELECT ad FROM TANIM_KomisyonGorevi WHERE COALESCE(aktif_mi, 1) = 1 ORDER BY id ASC'
          )
          if (gRes.success && gRes.data && isMounted) {
            const list = gRes.data.map((item: { ad: string }) => item.ad)
            setGorevler(list)
          }
        } catch (e) {
          console.warn('Görev tanımları yüklenemedi:', e)
        }

        // 3. Mevcut DATA_TeminKomisyon kayıtları
        if (activeDosyaId) {
          const kRes = await (window as any).electron.ipcRenderer.invoke(
            'db:query',
            'SELECT * FROM DATA_TeminKomisyon WHERE temin_dosya_id = ? ORDER BY id ASC',
            [activeDosyaId]
          )

          if (kRes.success && kRes.data && kRes.data.length > 0) {
            const allK = kRes.data

            // Maliyet komisyonu üyeleri
            const mList = allK.filter(
              (k: any) =>
                k.komisyon_id === 1 ||
                (k.komisyon_turu &&
                  (k.komisyon_turu.toLowerCase().includes('maliyet') ||
                    k.komisyon_turu.toLowerCase().includes('fiyat')))
            )

            // Muayene komisyonu üyeleri
            const muList = allK.filter((k: any) => {
              const isMuayene =
                k.komisyon_id === 2 ||
                (k.komisyon_turu &&
                  (k.komisyon_turu.toLowerCase().includes('muayene') ||
                    k.komisyon_turu.toLowerCase().includes('kabul')))
              if (!isMuayene) return false

              const g = (k.gorev || '').toLowerCase()
              if (
                g.includes('fiyat araştırma') ||
                g.includes('harcama yetkili') ||
                g.includes('muhasebe yetkili') ||
                g.includes('gerçekleştirme') ||
                g.includes('gerceklestirme')
              ) {
                return false
              }
              return true
            })

            if (isMounted) {
              if (mList.length > 0) {
                const newMaliyet = mList.map((matched: any, idx: number) => {
                  const hasBelgedeGoster =
                    matched?.belgede_goster !== undefined && matched?.belgede_goster !== null

                  let parsedHedefBelgeler: string[] = []
                  if (matched?.hedef_belgeler) {
                    try {
                      parsedHedefBelgeler =
                        typeof matched.hedef_belgeler === 'string'
                          ? JSON.parse(matched.hedef_belgeler)
                          : matched.hedef_belgeler
                    } catch {
                      parsedHedefBelgeler = []
                    }
                  }

                  return {
                    sira: idx + 1,
                    gorev: matched?.gorev || 'Fiyat Araştırma Görevlisi',
                    personelId: matched?.personel_id || null,
                    belgedeGoster: hasBelgedeGoster ? matched.belgede_goster === 1 : true,
                    vekaletUnvani: matched?.vekalet_unvani || '',
                    baslangicTarihi: matched?.baslangic_tarihi || '',
                    bitisTarihi: matched?.bitis_tarihi || '',
                    belgeKapsami: matched?.belge_kapsami || 'tumu',
                    hedefBelgeler: parsedHedefBelgeler
                  }
                })
                setMaliyetRows(newMaliyet)
              }

              if (muList.length > 0) {
                const newMuayene = muList.map((matched: any, idx: number) => {
                  const hasBelgedeGoster =
                    matched?.belgede_goster !== undefined && matched?.belgede_goster !== null

                  let parsedHedefBelgeler: string[] = []
                  if (matched?.hedef_belgeler) {
                    try {
                      parsedHedefBelgeler =
                        typeof matched.hedef_belgeler === 'string'
                          ? JSON.parse(matched.hedef_belgeler)
                          : matched.hedef_belgeler
                    } catch {
                      parsedHedefBelgeler = []
                    }
                  }

                  return {
                    sira: idx + 1,
                    gorev: matched?.gorev || (idx === 0 ? 'Komisyon Başkanı' : 'Üye'),
                    personelId: matched?.personel_id || null,
                    belgedeGoster: hasBelgedeGoster ? matched.belgede_goster === 1 : true,
                    vekaletUnvani: matched?.vekalet_unvani || '',
                    baslangicTarihi: matched?.baslangic_tarihi || '',
                    bitisTarihi: matched?.bitis_tarihi || '',
                    belgeKapsami: matched?.belge_kapsami || 'tumu',
                    hedefBelgeler: parsedHedefBelgeler
                  }
                })
                setMuayeneRows(newMuayene)
              }
            }
          }
        }
      } catch (err) {
        console.error('Komisyon verileri yüklenirken hata:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
          setDataLoaded(true)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [isOpen, activeDosyaId])

  // Komisyon Yönetimi (TANIM_KomisyonUye) üzerinden güncelle
  const handleSyncFromKomisyonYonetimi = async () => {
    const isMaliyet = activeTab === 'yaklasik_maliyet'
    try {
      const findRes = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        isMaliyet
          ? `SELECT id FROM TANIM_Komisyon 
             WHERE LOWER(TRIM(ad)) LIKE '%yaklaşık%' OR LOWER(TRIM(ad)) LIKE '%fiyat%' OR id = 1
             ORDER BY CASE WHEN id = 1 THEN 0 ELSE 1 END, id ASC LIMIT 1`
          : `SELECT id FROM TANIM_Komisyon 
             WHERE LOWER(TRIM(ad)) LIKE '%muayene%' OR LOWER(TRIM(ad)) LIKE '%kabul%' OR id = 2
             ORDER BY CASE WHEN id = 2 THEN 0 ELSE 1 END, id ASC LIMIT 1`
      )
      const komId =
        findRes.success && findRes.data?.[0]?.id ? findRes.data[0].id : isMaliyet ? 1 : 2

      const res = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        `SELECT u.*, p.ad_soyad, p.unvan, g.ad as gorev_adi
         FROM TANIM_KomisyonUye u
         JOIN TANIM_Personel p ON u.personel_id = p.id
         LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
         WHERE u.komisyon_id = ?
         ORDER BY u.id ASC`,
        [komId]
      )

      if (res.success && res.data && res.data.length > 0) {
        const members = res.data
        if (isMaliyet) {
          const next = members.map((m: any, idx: number) => ({
            sira: idx + 1,
            gorev: m.gorev_adi || 'Fiyat Araştırma Görevlisi',
            personelId: m.personel_id || null,
            belgedeGoster: m.belgede_goster !== 0,
            vekaletUnvani: '',
            baslangicTarihi: '',
            bitisTarihi: '',
            belgeKapsami: 'tumu'
          }))
          setMaliyetRows(next)
        } else {
          const next = members.map((m: any, idx: number) => ({
            sira: idx + 1,
            gorev: m.gorev_adi || (idx === 0 ? 'Komisyon Başkanı' : 'Üye'),
            personelId: m.personel_id || null,
            belgedeGoster: m.belgede_goster !== 0,
            vekaletUnvani: '',
            baslangicTarihi: '',
            bitisTarihi: '',
            belgeKapsami: 'tumu'
          }))
          setMuayeneRows(next)
        }
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      } else {
        alert(
          'Komisyon Yönetiminde bu komisyon için atanmış personel bulunamadı. Lütfen Komisyon Yönetimi ekranından üyeleri atayınız.'
        )
      }
    } catch (err: any) {
      alert('Komisyon Yönetiminden aktarım yapılırken hata: ' + err.message)
    }
  }

  // Seçilen komisyonu DATA_TeminKomisyon tablosuna kaydet
  const handleSave = async (tabToSave: KomisyonType = activeTab): Promise<boolean> => {
    if (!activeDosyaId) return false

    if (!dataLoaded) {
      console.warn('[KomisyonAtamaModal] Veri yüklenmeden kayıt engellendi.')
      return false
    }

    setSaving(true)
    try {
      const isMaliyet = tabToSave === 'yaklasik_maliyet'
      const komId = isMaliyet ? 1 : 2
      const komTitle = isMaliyet
        ? 'Yaklaşık Maliyet Tespit Komisyonu'
        : 'Muayene Kabul ve Tespit Komisyonu'
      const rows = isMaliyet ? maliyetRows : muayeneRows

      try {
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          'ALTER TABLE DATA_TeminKomisyon ADD COLUMN belgede_goster INTEGER DEFAULT 1'
        )
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          'ALTER TABLE DATA_TeminKomisyon ADD COLUMN vekalet_unvani TEXT'
        )
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          'ALTER TABLE DATA_TeminKomisyon ADD COLUMN baslangic_tarihi TEXT'
        )
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          'ALTER TABLE DATA_TeminKomisyon ADD COLUMN bitis_tarihi TEXT'
        )
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          "ALTER TABLE DATA_TeminKomisyon ADD COLUMN belge_kapsami TEXT DEFAULT 'tumu'"
        )
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          "ALTER TABLE DATA_TeminKomisyon ADD COLUMN hedef_belgeler TEXT DEFAULT '[\"*\"]'"
        )
      } catch {
        // Zaten mevcut
      }

      if (isMaliyet) {
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          `DELETE FROM DATA_TeminKomisyon 
           WHERE temin_dosya_id = ? 
           AND (komisyon_id = 1 OR komisyon_turu LIKE '%maliyet%' OR komisyon_turu LIKE '%fiyat%')`,
          [activeDosyaId]
        )
      } else {
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          `DELETE FROM DATA_TeminKomisyon 
           WHERE temin_dosya_id = ? 
           AND (komisyon_id = 2 OR komisyon_turu LIKE '%muayene%' OR komisyon_turu LIKE '%kabul%')`,
          [activeDosyaId]
        )
      }

      for (const row of rows) {
        if (!row.personelId) continue
        const p = personeller.find((item) => item.id === row.personelId)
        if (!p) continue

        const rol =
          row.gorev.toLowerCase().includes('başkan') || row.gorev.toLowerCase().includes('yetkili')
            ? 'Başkan'
            : 'Üye'

        const finalUnvan = row.vekaletUnvani?.trim() || p.unvan || null
        const hedefBelgelerJson = JSON.stringify(row.hedefBelgeler || ['*'])

        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminKomisyon 
           (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol, komisyon_turu, belgede_goster, vekalet_unvani, baslangic_tarihi, bitis_tarihi, belge_kapsami, hedef_belgeler)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            activeDosyaId,
            komId,
            p.id,
            p.ad_soyad,
            finalUnvan,
            row.gorev,
            rol,
            komTitle,
            row.belgedeGoster ? 1 : 0,
            row.vekaletUnvani?.trim() || null,
            row.baslangicTarihi || null,
            row.bitisTarihi || null,
            row.belgeKapsami || 'tumu',
            hedefBelgelerJson
          ]
        )

        if (isMaliyet) {
          if (row.gorev === 'Harcama Yetkilisi') {
            await (window as any).electron.ipcRenderer.invoke(
              'db:run',
              `UPDATE DATA_TeminDosyasi 
               SET onay_personel_id = ? 
               WHERE id = ?`,
              [p.id, activeDosyaId]
            )
          } else if (row.gorev === 'Gerçekleştirme Görevlisi') {
            await (window as any).electron.ipcRenderer.invoke(
              'db:run',
              `UPDATE DATA_TeminDosyasi 
               SET hazirlayan_personel_id = ? 
               WHERE id = ?`,
              [p.id, activeDosyaId]
            )
          }
        }
      }

      // Audit / History Snapshot
      try {
        const snapshotMembers = rows
          .filter((r) => r.personelId)
          .map((r) => {
            const p = personeller.find((item) => item.id === r.personelId)
            return {
              personelId: r.personelId,
              ad_soyad: p?.ad_soyad || '',
              unvan: r.vekaletUnvani?.trim() || p?.unvan || '',
              vekalet_unvani: r.vekaletUnvani || '',
              baslangic_tarihi: r.baslangicTarihi || '',
              bitis_tarihi: r.bitisTarihi || '',
              belge_kapsami: r.belgeKapsami || 'tumu',
              gorev: r.gorev,
              belgedeGoster: r.belgedeGoster
            }
          })

        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminKomisyonHistory (temin_dosya_id, komisyon_turu, islem_turu, snapshot_data) VALUES (?, ?, ?, ?)`,
          [activeDosyaId, komTitle, 'Kadro Ataması / Güncelleme', JSON.stringify(snapshotMembers)]
        )
      } catch (histErr) {
        console.warn('DATA_TeminKomisyonHistory kaydedilirken hata:', histErr)
      }

      if (syncToGlobalCommission) {
        try {
          const findRes = await (window as any).electron.ipcRenderer.invoke(
            'db:query',
            isMaliyet
              ? `SELECT id FROM TANIM_Komisyon 
                 WHERE LOWER(TRIM(ad)) LIKE '%yaklaşık%' OR LOWER(TRIM(ad)) LIKE '%fiyat%' OR id = 1
                 ORDER BY CASE WHEN id = 1 THEN 0 ELSE 1 END, id ASC LIMIT 1`
              : `SELECT id FROM TANIM_Komisyon 
                 WHERE LOWER(TRIM(ad)) LIKE '%muayene%' OR LOWER(TRIM(ad)) LIKE '%kabul%' OR id = 2
                 ORDER BY CASE WHEN id = 2 THEN 0 ELSE 1 END, id ASC LIMIT 1`
          )
          const targetKomId =
            findRes.success && findRes.data?.[0]?.id ? findRes.data[0].id : isMaliyet ? 1 : 2

          const gorevRes = await (window as any).electron.ipcRenderer.invoke(
            'db:query',
            'SELECT id, ad FROM TANIM_KomisyonGorevi'
          )
          const existingGorevler: { id: number; ad: string }[] =
            gorevRes.success && gorevRes.data ? gorevRes.data : []

          await (window as any).electron.ipcRenderer.invoke(
            'db:run',
            'DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
            [targetKomId]
          )

          for (const row of rows) {
            if (!row.personelId) continue

            let gorevId = existingGorevler.find(
              (g) => g.ad.trim().toLowerCase() === row.gorev.trim().toLowerCase()
            )?.id

            if (!gorevId) {
              const insertGorevRes = await (window as any).electron.ipcRenderer.invoke(
                'db:run',
                'INSERT INTO TANIM_KomisyonGorevi (ad) VALUES (?)',
                [row.gorev.trim()]
              )
              if (insertGorevRes.success && insertGorevRes.lastInsertRowid) {
                const newGorevId = Number(insertGorevRes.lastInsertRowid)
                gorevId = newGorevId
                existingGorevler.push({ id: newGorevId, ad: row.gorev.trim() })
              }
            }

            const isAsil = row.gorev.toLowerCase().includes('yedek') ? 0 : 1

            if (gorevId) {
              await (window as any).electron.ipcRenderer.invoke(
                'db:run',
                'INSERT INTO TANIM_KomisyonUye (komisyon_id, personel_id, gorev_id, asil_mi) VALUES (?, ?, ?, ?)',
                [targetKomId, row.personelId, gorevId, isAsil]
              )
            }
          }

          queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
          queryClient.invalidateQueries({ queryKey: ['komisyon_detay', targetKomId] })
          queryClient.invalidateQueries({ queryKey: ['tanim_komisyonlar'] })
          queryClient.invalidateQueries({ queryKey: ['tanim_komisyonlar_with_sablons'] })
        } catch (globalErr) {
          console.warn('Global komisyon senkronizasyonu sırasında hata:', globalErr)
        }
      }

      if (activeDosyaId) {
        documentPreloadService.invalidateCache(activeDosyaId)
      }
      queryClient.invalidateQueries({ queryKey: ['document_preview'] })
      queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      queryClient.invalidateQueries({ queryKey: ['komisyon_detay'] })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
      return true
    } catch (err: any) {
      alert('Komisyon üyeleri kaydedilirken hata: ' + err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDoc = async (targetDoc?: string) => {
    if (!onOpenDocument) return

    if (dataLoaded) {
      const ok = await handleSave(activeTab)
      if (ok) {
        onClose()
        const docToOpen = targetDoc
          ? targetDoc
          : activeTab === 'yaklasik_maliyet'
            ? 'piyasa-fiyat-arastirma-gorevlendirmesi'
            : 'muayene-kabul-komisyonu'
        onOpenDocument(docToOpen)
      }
    } else {
      onClose()
      const docToOpen = targetDoc
        ? targetDoc
        : activeTab === 'yaklasik_maliyet'
          ? 'piyasa-fiyat-arastirma-gorevlendirmesi'
          : 'muayene-kabul-komisyonu'
      onOpenDocument(docToOpen)
    }
  }

  const currentRows = activeTab === 'yaklasik_maliyet' ? maliyetRows : muayeneRows

  const handlePersonelChange = (sira: number, personelId: number | null) => {
    if (activeTab === 'yaklasik_maliyet') {
      setMaliyetRows((prev) => prev.map((r) => (r.sira === sira ? { ...r, personelId } : r)))
    } else {
      setMuayeneRows((prev) => prev.map((r) => (r.sira === sira ? { ...r, personelId } : r)))
    }
  }

  const handleGorevChange = (sira: number, newGorev: string) => {
    const defaults = getRoleDefaults(newGorev)
    if (activeTab === 'yaklasik_maliyet') {
      setMaliyetRows((prev) =>
        prev.map((r) =>
          r.sira === sira
            ? {
                ...r,
                gorev: newGorev,
                belgeKapsami: defaults.belgeKapsami,
                belgedeGoster: defaults.belgedeGoster
              }
            : r
        )
      )
    } else {
      setMuayeneRows((prev) =>
        prev.map((r) =>
          r.sira === sira
            ? {
                ...r,
                gorev: newGorev,
                belgeKapsami: defaults.belgeKapsami,
                belgedeGoster: defaults.belgedeGoster
              }
            : r
        )
      )
    }
  }

  const handleToggleBelgedeGoster = (sira: number) => {
    if (activeTab === 'yaklasik_maliyet') {
      setMaliyetRows((prev) =>
        prev.map((r) => (r.sira === sira ? { ...r, belgedeGoster: !r.belgedeGoster } : r))
      )
    } else {
      setMuayeneRows((prev) =>
        prev.map((r) => (r.sira === sira ? { ...r, belgedeGoster: !r.belgedeGoster } : r))
      )
    }
  }

  const handleRowFieldChange = (sira: number, field: keyof KomisyonRow, value: any) => {
    if (activeTab === 'yaklasik_maliyet') {
      setMaliyetRows((prev) => prev.map((r) => (r.sira === sira ? { ...r, [field]: value } : r)))
    } else {
      setMuayeneRows((prev) => prev.map((r) => (r.sira === sira ? { ...r, [field]: value } : r)))
    }
  }

  const handleAddRow = (gorevName = 'Üye') => {
    if (activeTab === 'yaklasik_maliyet') {
      setMaliyetRows((prev) => [
        ...prev,
        {
          sira: prev.length + 1,
          gorev: gorevName,
          personelId: null,
          belgedeGoster: true,
          vekaletUnvani: '',
          baslangicTarihi: '',
          bitisTarihi: '',
          belgeKapsami: 'tumu'
        }
      ])
    } else {
      setMuayeneRows((prev) => [
        ...prev,
        {
          sira: prev.length + 1,
          gorev: gorevName,
          personelId: null,
          belgedeGoster: true,
          vekaletUnvani: '',
          baslangicTarihi: '',
          bitisTarihi: '',
          belgeKapsami: 'tumu'
        }
      ])
    }
  }

  const handleRemoveRow = (sira: number) => {
    if (activeTab === 'yaklasik_maliyet') {
      setMaliyetRows((prev) =>
        prev.filter((r) => r.sira !== sira).map((r, idx) => ({ ...r, sira: idx + 1 }))
      )
    } else {
      setMuayeneRows((prev) =>
        prev.filter((r) => r.sira !== sira).map((r, idx) => ({ ...r, sira: idx + 1 }))
      )
    }
  }

  return {
    activeTab,
    setActiveTab,
    personeller,
    gorevler,
    kurumInfo,
    currentRows,
    loading,
    saving,
    saveSuccess,
    syncToGlobalCommission,
    setSyncToGlobalCommission,
    handlePersonelChange,
    handleGorevChange,
    handleToggleBelgedeGoster,
    handleRowFieldChange,
    handleAddRow,
    handleRemoveRow,
    handleSyncFromKomisyonYonetimi,
    handleSave,
    handleOpenDoc
  }
}
