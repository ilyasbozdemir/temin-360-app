import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DEFAULT_MUAYENE_SABLONLAR,
  DEFAULT_YAKLASIK_SABLONLAR
} from '../../../../../../shared/constants/templateConstants'
import { KOMISYON_SABLONLARI, KomisyonTipi, UyeRow } from './types'

interface UseKomisyonOlusturProps {
  isOpen: boolean
  onClose: () => void
  komisyonId?: number | null
}

export function useKomisyonOlustur({ isOpen, onClose, komisyonId }: UseKomisyonOlusturProps) {
  const queryClient = useQueryClient()
  const [ad, setAd] = useState('')
  const [seciliTip, setSeciliTip] = useState<KomisyonTipi>('')
  const [uyeler, setUyeler] = useState<UyeRow[]>([])
  const [seciliSablonlar, setSeciliSablonlar] = useState<number[]>([])
  const [sablonArama, setSablonArama] = useState('')

  // DB'deki görevler (unvan eşleştirmesi için)
  const { data: gorevler = [] } = useQuery({
    queryKey: ['komisyon_gorevleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_KomisyonGorevi WHERE aktif_mi = 1 ORDER BY id ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data as { id: number; ad: string }[]
    },
    enabled: isOpen
  })

  // Personel listesi (arama için)
  const { data: tumPersonel = [] } = useQuery({
    queryKey: ['personel_listesi_modal'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, ad_soyad, unvan FROM TANIM_Personel WHERE COALESCE(aktif_mi, 1) = 1 ORDER BY ad_soyad ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data as {
        id: number
        ad_soyad: string
        unvan: string
      }[]
    },
    enabled: isOpen
  })

  // Şablon seçenekleri
  const { data: tumSablonlar = [] } = useQuery({
    queryKey: ['komisyon_sablon_secenekleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Sablon WHERE aktif_mi = 1 ORDER BY ad ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: isOpen
  })

  // Edit modunda mevcut komisyonu çek
  useQuery({
    queryKey: ['komisyon_detay', komisyonId],
    queryFn: async () => {
      if (!komisyonId) return null

      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon WHERE id = ?',
        [komisyonId]
      )
      if (!res.success || !res.data[0]) {
        throw new Error(res.error || 'Komisyon bulunamadı')
      }
      setAd(res.data[0].ad)

      const membersRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT ku.*, kg.ad as gorev_ad,
          COALESCE(p.ad_soyad, p.ad || ' ' || p.soyad, '') as personel_adi,
          ku.personel_id
         FROM TANIM_KomisyonUye ku
         LEFT JOIN TANIM_KomisyonGorevi kg ON kg.id = ku.gorev_id
         LEFT JOIN TANIM_Personel p ON p.id = ku.personel_id
         WHERE ku.komisyon_id = ?`,
        [komisyonId]
      )
      if (membersRes.success && membersRes.data) {
        setUyeler(
          membersRes.data.map((m: any) => ({
            id: Date.now() + Math.random(),
            unvan: m.gorev_ad || '',
            gorevId: m.gorev_id,
            personelId: m.personel_id || null,
            personelAdi: m.personel_adi || '',
            personelArama: '',
            asilMi: m.asil_mi
          }))
        )
      }

      const sablonRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
        [komisyonId]
      )
      if (sablonRes.success && sablonRes.data) {
        setSeciliSablonlar(sablonRes.data.map((s: any) => s.sablon_id))
      }

      return res.data[0]
    },
    enabled: !!komisyonId && isOpen
  })

  // Komisyon tipi seçilince hazır kadroyu yükle
  const handleTipSec = (tip: KomisyonTipi) => {
    setSeciliTip(tip)
    if (!tip) {
      setUyeler([])
      return
    }
    const sablon = KOMISYON_SABLONLARI[tip]
    setAd(sablon.label)
    setUyeler(
      sablon.roller.map((unvan, i) => {
        const eslesen = gorevler.find((g) => g.ad.toLowerCase() === unvan.toLowerCase())
        return {
          id: Date.now() + i,
          unvan,
          gorevId: eslesen?.id ?? '',
          personelId: null,
          personelAdi: '',
          personelArama: '',
          asilMi: 1
        }
      })
    )

    // İlgili belge şablonlarını otomatik seç
    if (tip === 'yaklasik_maliyet') {
      const matchingIds = (tumSablonlar as any[])
        .filter((s) => (DEFAULT_YAKLASIK_SABLONLAR as readonly string[]).includes(s.dosya_adi))
        .map((s) => s.id)
      if (matchingIds.length > 0) setSeciliSablonlar(matchingIds)
    } else if (tip === 'muayene_kabul') {
      const matchingIds = (tumSablonlar as any[])
        .filter((s) => (DEFAULT_MUAYENE_SABLONLAR as readonly string[]).includes(s.dosya_adi))
        .map((s) => s.id)
      if (matchingIds.length > 0) setSeciliSablonlar(matchingIds)
    }
  }

  // El ile satır ekle
  const handleAddUye = () => {
    setUyeler([
      ...uyeler,
      {
        id: Date.now(),
        unvan: '',
        gorevId: '',
        personelId: null,
        personelAdi: '',
        personelArama: '',
        asilMi: 1
      }
    ])
  }

  const handleRemoveUye = (id: number) => {
    setUyeler(uyeler.filter((u) => u.id !== id))
  }

  const handleUyeChange = (id: number, field: string, value: any) => {
    setUyeler(uyeler.map((u) => (u.id === id ? { ...u, [field]: value } : u)))
  }

  const handlePersonelSec = (
    uyeId: number,
    personel: { id: number; ad_soyad: string; unvan: string }
  ) => {
    setUyeler(
      uyeler.map((u) =>
        u.id === uyeId
          ? {
              ...u,
              personelId: personel.id,
              personelAdi: personel.ad_soyad,
              personelArama: ''
            }
          : u
      )
    )
  }

  const handleUnvanChange = (id: number, unvan: string) => {
    const eslesen = gorevler.find((g) => g.ad.toLowerCase() === unvan.toLowerCase())
    setUyeler(uyeler.map((u) => (u.id === id ? { ...u, unvan, gorevId: eslesen?.id ?? '' } : u)))
  }

  const handleSablonToggle = (sablonId: number) => {
    setSeciliSablonlar((prev) =>
      prev.includes(sablonId) ? prev.filter((id) => id !== sablonId) : [...prev, sablonId]
    )
  }

  const handleClose = () => {
    onClose()
    setAd('')
    setSeciliTip('')
    setUyeler([])
    setSeciliSablonlar([])
    setSablonArama('')
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmedAd = ad.trim()
      if (!trimmedAd) throw new Error('Lütfen komisyon adı giriniz.')

      // gorevId eksik satırlar için DB'de yoksa gorev kaydı oluştur
      const eksikGorevler = uyeler.filter((u) => !u.gorevId && u.unvan && u.unvan.trim())
      if (eksikGorevler.length > 0) {
        for (const u of eksikGorevler) {
          const uUnvan = u.unvan.trim()
          const exRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            'SELECT id FROM TANIM_KomisyonGorevi WHERE LOWER(TRIM(ad)) = LOWER(TRIM(?))',
            [uUnvan]
          )
          if (exRes.success && exRes.data && exRes.data.length > 0) {
            u.gorevId = exRes.data[0].id
          } else {
            const gRes = await window.electron.ipcRenderer.invoke(
              'db:run',
              'INSERT INTO TANIM_KomisyonGorevi (ad, aktif_mi) VALUES (?, 1)',
              [uUnvan]
            )
            if (gRes.success) {
              u.gorevId = gRes.lastInsertRowid
            } else {
              const retryRes = await window.electron.ipcRenderer.invoke(
                'db:query',
                'SELECT id FROM TANIM_KomisyonGorevi WHERE LOWER(TRIM(ad)) = LOWER(TRIM(?))',
                [uUnvan]
              )
              if (retryRes.success && retryRes.data && retryRes.data[0]) {
                u.gorevId = retryRes.data[0].id
              } else {
                throw new Error('Görev eklenemedi: ' + gRes.error)
              }
            }
          }
        }
      }

      // 1. İsim çakışması kontrolü ve base komisyon birleştirme
      let targetKomisyonId: number | null = komisyonId ? Number(komisyonId) : null

      const checkRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, aktif_mi FROM TANIM_Komisyon WHERE LOWER(TRIM(ad)) = LOWER(TRIM(?))',
        [trimmedAd]
      )

      if (checkRes.success && checkRes.data && checkRes.data.length > 0) {
        for (const existing of checkRes.data) {
          const exId = Number(existing.id)
          if (targetKomisyonId && exId === targetKomisyonId) {
            continue
          }

          const isTargetBase =
            trimmedAd.toLowerCase().includes('yaklaşık maliyet') ||
            trimmedAd.toLowerCase().includes('muayene kabul') ||
            trimmedAd.toLowerCase().includes('fiyat araştırma')

          if (existing.aktif_mi === 1) {
            if (isTargetBase) {
              if (!targetKomisyonId) {
                targetKomisyonId = exId
              } else {
                await window.electron.ipcRenderer.invoke('db:transaction', [
                  {
                    sql: 'DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
                    params: [exId]
                  },
                  {
                    sql: 'DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
                    params: [exId]
                  },
                  {
                    sql: 'DELETE FROM TANIM_Komisyon WHERE id = ?',
                    params: [exId]
                  }
                ])
              }
            } else {
              throw new Error(
                `"${trimmedAd}" isminde aktif bir komisyon zaten mevcut. Lütfen farklı bir isim belirleyin.`
              )
            }
          } else {
            await window.electron.ipcRenderer.invoke('db:transaction', [
              {
                sql: 'DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
                params: [exId]
              },
              {
                sql: 'DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
                params: [exId]
              },
              {
                sql: 'DELETE FROM TANIM_Komisyon WHERE id = ?',
                params: [exId]
              }
            ])
          }
        }
      }

      if (targetKomisyonId) {
        const updateRes = await window.electron.ipcRenderer.invoke('db:transaction', [
          {
            sql: 'UPDATE TANIM_Komisyon SET ad = ?, aktif_mi = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            params: [trimmedAd, targetKomisyonId]
          },
          {
            sql: 'DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
            params: [targetKomisyonId]
          },
          {
            sql: 'DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
            params: [targetKomisyonId]
          }
        ])
        if (!updateRes.success) {
          throw new Error('Komisyon güncellenirken hata oluştu: ' + updateRes.error)
        }

        const validUyeler = uyeler.filter((u) => u.unvan && u.unvan.trim())
        const uyeQueries = validUyeler.map((u) => ({
          sql: 'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi) VALUES (?, ?, ?, ?)',
          params: [targetKomisyonId, u.gorevId || null, u.personelId || null, u.asilMi]
        }))
        if (uyeQueries.length > 0) {
          const uyeRes = await window.electron.ipcRenderer.invoke('db:transaction', uyeQueries)
          if (!uyeRes.success) throw new Error(uyeRes.error)
        }

        const sablonQueries = seciliSablonlar.map((sId) => ({
          sql: 'INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id) VALUES (?, ?)',
          params: [targetKomisyonId, sId]
        }))
        if (sablonQueries.length > 0) {
          const sR = await window.electron.ipcRenderer.invoke('db:transaction', sablonQueries)
          if (!sR.success) throw new Error(sR.error)
        }

        return targetKomisyonId
      } else {
        const insertRes = await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT INTO TANIM_Komisyon (ad, aktif_mi) VALUES (?, 1)',
          [trimmedAd]
        )
        if (!insertRes.success) {
          throw new Error('Komisyon eklenirken hata oluştu: ' + insertRes.error)
        }
        const newId = insertRes.lastInsertRowid

        const validUyeler = uyeler.filter((u) => u.unvan && u.unvan.trim())
        const uyeQueries = validUyeler.map((u) => ({
          sql: 'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi) VALUES (?, ?, ?, ?)',
          params: [newId, u.gorevId || null, u.personelId || null, u.asilMi]
        }))
        if (uyeQueries.length > 0) {
          const uyeRes = await window.electron.ipcRenderer.invoke('db:transaction', uyeQueries)
          if (!uyeRes.success) throw new Error(uyeRes.error)
        }

        const sablonQueries = seciliSablonlar.map((sId) => ({
          sql: 'INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id) VALUES (?, ?)',
          params: [newId, sId]
        }))
        if (sablonQueries.length > 0) {
          const sR = await window.electron.ipcRenderer.invoke('db:transaction', sablonQueries)
          if (!sR.success) throw new Error(sR.error)
        }

        return newId
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      handleClose()
    }
  })

  return {
    ad,
    setAd,
    seciliTip,
    uyeler,
    seciliSablonlar,
    sablonArama,
    setSablonArama,
    gorevler,
    tumPersonel,
    tumSablonlar,
    handleTipSec,
    handleAddUye,
    handleRemoveUye,
    handleUyeChange,
    handlePersonelSec,
    handleUnvanChange,
    handleSablonToggle,
    handleClose,
    saveMutation
  }
}
