import { useState, useCallback } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

export interface KurumVerisi {
  id?: number
  kurum_adi?: string
  kurum_anteti?: string
  makam_adi?: string
  ust_kurum_adi?: string
  logo_sol?: string
  logo_sag?: string
  logo_kurum?: string
  limit_tipi?: string
  finansman_kodu?: string
  kurum_tipi?: string
  alt_kurum_tipi?: string
  alt_kurum_ozel_tanim?: string
  alt_kurum_bizim?: string
  alt_kurum_sizin?: string
  alt_kurum_onun?: string
  alt_kurum_onlarin?: string
  ebutce_kodu?: string
  say2000i_kodu?: string
  fonksiyonel_kod?: string
  muhasebe_birim_kodu?: string
  muhasebe_birim_adi?: string
  harcama_birim_kodu?: string
  harcama_birim_adi?: string
  dtvt_kodu?: string
  detsis_kodu?: string
  konu_ortalama_siniri?: string
  adres?: string
  ilce?: string
  posta_kodu?: string
  il?: string
  telefon?: string
  faks?: string
  eposta?: string
  kep_adresi?: string
  web_sitesi?: string
  created_by?: number | null
  created_at?: string
  updated_by?: number | null
  updated_at?: string
  is_active?: number
  is_deleted?: number
}

export function useKurumHooks() {
  const { activeKurumId, setActiveKurumId, loadSettings } = useSettingsStore()
  const [kurumData, setKurumData] = useState<KurumVerisi | null>(null)
  const [allKurumlar, setAllKurumlar] = useState<KurumVerisi[]>([])
  const [isLoadingKurum, setIsLoadingKurum] = useState(true)

  const fetchKurum = useCallback(
    async (targetId?: number) => {
      setIsLoadingKurum(true)
      try {
        const currentId = targetId || activeKurumId || 1
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Kurum WHERE id = ?',
          [currentId]
        )
        if (res.success && res.data && res.data.length > 0) {
          setKurumData(res.data[0])
        } else {
          // Fallback to first available or default
          const allRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            'SELECT * FROM TANIM_Kurum ORDER BY id ASC LIMIT 1'
          )
          if (allRes.success && allRes.data && allRes.data.length > 0) {
            setKurumData(allRes.data[0])
          } else {
            setKurumData({
              id: 1,
              kurum_adi: '',
              kurum_anteti: '[""]',
              limit_tipi: 'diger',
              finansman_kodu: '5',
              alt_kurum_tipi: 'belediye'
            })
          }
        }

        // Also fetch all kurumlar list
        const listRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Kurum WHERE is_deleted = 0 OR is_deleted IS NULL ORDER BY id ASC'
        )
        if (listRes.success && listRes.data) {
          setAllKurumlar(listRes.data)
        }
      } catch (err) {
        console.error('fetchKurum Error:', err)
        setKurumData(null)
      } finally {
        setIsLoadingKurum(false)
      }
    },
    [activeKurumId]
  )

  const saveKurum = useCallback(
    async (data: KurumVerisi, targetId?: number) => {
      try {
        const idToUpdate = targetId || data.id || activeKurumId || 1
        const keys = Object.keys(data).filter((k) => k !== 'id')
        const setClause = keys.map((k) => `${k} = ?`).join(', ')
        const values = keys.map((k) => data[k as keyof KurumVerisi])

        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `UPDATE TANIM_Kurum SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [...values, idToUpdate]
        )

        if (!res.success) {
          throw new Error(res.error || 'Güncelleme hatası')
        }

        // If active kurum was updated, sync with settings table
        if (idToUpdate === activeKurumId) {
          await window.electron.ipcRenderer.invoke('db:save-settings', {
            institutionName: data.kurum_adi || '',
            detsisKodu: data.detsis_kodu || '',
            eButceKodu: data.ebutce_kodu || '',
            say2000iKodu: data.say2000i_kodu || '',
            limitType: data.limit_tipi || 'diger',
            finansmanKodu: data.finansman_kodu || '5',
            institutionType: data.kurum_tipi || '',
            subInstitutionType: data.alt_kurum_tipi || 'belediye',
            fonksiyonelKod: data.fonksiyonel_kod || '',
            muhasebeBirimKodu: data.muhasebe_birim_kodu || '',
            muhasebeBirimAdi: data.muhasebe_birim_adi || '',
            harcamaBirimKodu: data.harcama_birim_kodu || '',
            harcamaBirimAdi: data.harcama_birim_adi || '',
            institutionLogo: data.logo_kurum || '',
            logoLeft: data.logo_sol || '',
            logoRight: data.logo_sag || ''
          })
          await loadSettings()
        }

        await fetchKurum(idToUpdate)
        return true
      } catch (err) {
        console.error('saveKurum Error:', err)
        throw err
      }
    },
    [activeKurumId, fetchKurum, loadSettings]
  )

  const switchActiveKurum = useCallback(
    async (id: number) => {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Kurum WHERE id = ?',
          [id]
        )
        if (!res.success || !res.data || res.data.length === 0) {
          throw new Error('Seçilen kurum profili bulunamadı.')
        }

        const targetKurum: KurumVerisi = res.data[0]

        // Update settings in database
        await window.electron.ipcRenderer.invoke('db:save-settings', {
          activeKurumId: String(id),
          institutionName: targetKurum.kurum_adi || '',
          detsisKodu: targetKurum.detsis_kodu || '',
          eButceKodu: targetKurum.ebutce_kodu || '',
          say2000iKodu: targetKurum.say2000i_kodu || '',
          limitType: targetKurum.limit_tipi || 'diger',
          finansmanKodu: targetKurum.finansman_kodu || '5',
          institutionType: targetKurum.kurum_tipi || '',
          subInstitutionType: targetKurum.alt_kurum_tipi || 'belediye',
          fonksiyonelKod: targetKurum.fonksiyonel_kod || '',
          muhasebeBirimKodu: targetKurum.muhasebe_birim_kodu || '',
          muhasebeBirimAdi: targetKurum.muhasebe_birim_adi || '',
          harcamaBirimKodu: targetKurum.harcama_birim_kodu || '',
          harcamaBirimAdi: targetKurum.harcama_birim_adi || '',
          institutionLogo: targetKurum.logo_kurum || '',
          logoLeft: targetKurum.logo_sol || '',
          logoRight: targetKurum.logo_sag || ''
        })

        setActiveKurumId(id)
        await loadSettings()
        await fetchKurum(id)
        return true
      } catch (err) {
        console.error('switchActiveKurum Error:', err)
        throw err
      }
    },
    [fetchKurum, loadSettings, setActiveKurumId]
  )

  const createKurumProfile = useCallback(
    async (data: Partial<KurumVerisi>, switchImmediately: boolean = true) => {
      try {
        const payload: KurumVerisi = {
          kurum_adi: data.kurum_adi || 'Yeni Kurum Profili',
          makam_adi: data.makam_adi || '',
          ust_kurum_adi: data.ust_kurum_adi || '',
          kurum_anteti: data.kurum_anteti || '[""]',
          limit_tipi: data.limit_tipi || 'diger',
          finansman_kodu: data.finansman_kodu || '5',
          kurum_tipi: data.kurum_tipi || '',
          alt_kurum_tipi: data.alt_kurum_tipi || 'belediye',
          detsis_kodu: data.detsis_kodu || '',
          ebutce_kodu: data.ebutce_kodu || '',
          say2000i_kodu: data.say2000i_kodu || '',
          telefon: data.telefon || '',
          eposta: data.eposta || '',
          adres: data.adres || '',
          logo_kurum: data.logo_kurum || '',
          logo_sol: data.logo_sol || '',
          logo_sag: data.logo_sag || '',
          is_active: 1,
          is_deleted: 0
        }

        const keys = Object.keys(payload)
        const placeholders = keys.map(() => '?').join(', ')
        const values = Object.values(payload)

        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Kurum (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        )

        if (!res.success) {
          throw new Error(res.error || 'Yeni kurum profili eklenemedi')
        }

        const newId = Number(res.lastInsertRowid)

        if (switchImmediately && newId) {
          await switchActiveKurum(newId)
        } else {
          await fetchKurum()
        }

        return newId
      } catch (err) {
        console.error('createKurumProfile Error:', err)
        throw err
      }
    },
    [fetchKurum, switchActiveKurum]
  )

  const deleteKurumProfile = useCallback(
    async (id: number) => {
      try {
        if (id === activeKurumId) {
          throw new Error(
            'Aktif olan kurum profili silinemez. Lütfen önce başka bir profile geçiş yapın.'
          )
        }

        const countRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as total FROM TANIM_Kurum WHERE is_deleted = 0 OR is_deleted IS NULL'
        )
        if (countRes.success && countRes.data && countRes.data[0]?.total <= 1) {
          throw new Error('Sistemde en az bir kurum profili kalmalıdır.')
        }

        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE TANIM_Kurum SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [id]
        )

        if (!res.success) {
          throw new Error(res.error || 'Profil silinemedi.')
        }

        await fetchKurum()
        return true
      } catch (err) {
        console.error('deleteKurumProfile Error:', err)
        throw err
      }
    },
    [activeKurumId, fetchKurum]
  )

  return {
    kurumData,
    allKurumlar,
    isLoadingKurum,
    fetchKurum,
    saveKurum,
    createKurumProfile,
    switchActiveKurum,
    deleteKurumProfile
  }
}
