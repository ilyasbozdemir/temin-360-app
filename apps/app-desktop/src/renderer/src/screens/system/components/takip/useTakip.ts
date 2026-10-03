/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { useTabStore } from '../../../../store/tabStore'
import { useDosyalarHooks } from '../../../dosyalar/dosyalar.hooks'
import { logActivity } from '../../../../utils/logger'
import { emitAppEvent, useAppEventListener } from '../../../../utils/appEvents'
import { formatCurrency } from '@renderer/utils/formatters'
import {
  AsamaItem,
  TeminBelgeItem,
  TeminFirmaItem,
  TeminKalemItem,
  TeminKomisyonItem,
  UseTakipReturn
} from './takip.types'

export const STAGE_ROUTES: Record<number, string> = {
  1: '/dosya/hazirlik-ve-ihtiyac',
  2: '/dosya/piyasa-fiyat-arastirmasi',
  3: '/dosya/siparis-ve-sozlesme',
  4: '/dosya/kabul-ve-odeme'
}

export const STAGE_SHORT_LABELS: Record<number, string> = {
  1: 'Hazırlık',
  2: 'Araştırma',
  3: 'Sözleşme',
  4: 'Muayene & Kabul & Ödeme'
}

export function useTakip(): UseTakipReturn {
  const { activeDosyaId, setActiveDosyaId, activeFilePath } = useWorkspaceStore()
  const { dosyalar, deleteDosya } = useDosyalarHooks()
  const { addTab } = useTabStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Real-time Event Listener for complete synchronization across panels & stages
  useAppEventListener(
    [
      'items:changed',
      'bids:changed',
      'dossier:updated',
      'dossier:created',
      'dossier:deleted',
      'status:changed',
      'documents:changed',
      'workspace:refreshed'
    ],
    () => {
      queryClient.invalidateQueries({ queryKey: ['takip_kalemler'] })
      queryClient.invalidateQueries({ queryKey: ['takip_firmalar'] })
      queryClient.invalidateQueries({ queryKey: ['takip_komisyonlar'] })
      queryClient.invalidateQueries({ queryKey: ['takip_belgeler'] })
      queryClient.invalidateQueries({ queryKey: ['takip_asamalar'] })
      queryClient.invalidateQueries({ queryKey: ['takip_tum_belgeler'] })
      queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
    }
  )

  // Active dossier
  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId)
  const [notificationSent, setNotificationSent] = useState(false)

  // Local state for dossier updates
  const [status, setStatus] = useState('devam_ediyor')
  const [acilisTarihi, setAcilisTarihi] = useState('')
  const [sonTeklifTarihi, setSonTeklifTarihi] = useState('')
  const [teminTarihi, setTeminTarihi] = useState('')
  const [teslimTarihi, setTeslimTarihi] = useState('')
  const [notlar, setNotlar] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleEditDosya = () => {
    if (!activeDosya) return
    addTab(`/dosyalar/yeni?id=${activeDosya.id}`)
    navigate({ to: `/dosyalar/yeni?id=${activeDosya.id}` })
  }

  const handleSurecAkisi = () => {
    addTab('/surec-akisi')
    navigate({ to: '/surec-akisi' })
  }

  const handleOpenInNewWindow = () => {
    if (!activeDosya) return
    const wpParam = activeFilePath ? `&wp=${encodeURIComponent(activeFilePath)}` : ''
    window.electron?.ipcRenderer.send('window:open-secondary', {
      path: '/dosyalar',
      search: `?id=${activeDosya.id}&mode=window${wpParam}`,
      title: `DT: ${activeDosya.konu}`
    })
  }

  const handleDelete = async () => {
    if (!activeDosyaId || !activeDosya) return
    if (
      confirm(
        'Bu dosyayı iptal etmek istediğinize emin misiniz? Dosya listelerde "İptal Edildi" olarak işaretlenecektir.'
      )
    ) {
      await deleteDosya(activeDosyaId)
      await logActivity(
        'Dosya İptal Edildi',
        `${
          activeDosya.temin_no || 'NO BELİRSİZ'
        } numaralı dosya takip ekranından iptal edildi olarak işaretlendi.`,
        'warning'
      )
      setActiveDosyaId(null)
    }
  }

  useEffect(() => {
    if (activeDosya) {
      setStatus(activeDosya.status || 'devam_ediyor')
      setAcilisTarihi(
        activeDosya.dosya_acilis_tarihi ? activeDosya.dosya_acilis_tarihi.substring(0, 10) : ''
      )
      setSonTeklifTarihi(
        activeDosya.son_teklif_verme_tarihi
          ? activeDosya.son_teklif_verme_tarihi.substring(0, 10)
          : ''
      )
      setTeminTarihi(activeDosya.temin_tarihi ? activeDosya.temin_tarihi.substring(0, 10) : '')
      setTeslimTarihi(activeDosya.teslim_tarihi ? activeDosya.teslim_tarihi.substring(0, 10) : '')
      setNotlar(activeDosya.notlar || '')
    }
  }, [activeDosyaId, activeDosya])

  const handleUpdateDosya = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeDosyaId) return
    setSaveLoading(true)
    setSaveMessage('')

    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET status = ?, dosya_acilis_tarihi = ?, son_teklif_verme_tarihi = ?, temin_tarihi = ?, teslim_tarihi = ?, notlar = ? WHERE id = ?',
        [
          status,
          acilisTarihi || null,
          sonTeklifTarihi || null,
          teminTarihi || null,
          teslimTarihi || null,
          notlar || null,
          activeDosyaId
        ]
      )

      if (res.success) {
        setSaveMessage('Dosya bilgileri başarıyla güncellendi.')
        await queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
        emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
        emitAppEvent('status:changed', {
          dosyaId: activeDosyaId,
          payload: { status }
        })
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Güncelleme hatası: ' + res.error)
      }
    } catch (err: any) {
      setSaveMessage('Sistem hatası: ' + err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  // Fetch Documents generated for this dossier
  const { data: dbBelgeler = [], refetch: refetchBelgeler } = useQuery<TeminBelgeItem[]>({
    queryKey: ['takip_belgeler', activeDosyaId],
    queryFn: async () => {
      if (!activeDosyaId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ${activeDosyaId}`
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !!activeDosyaId
  })

  // 2. Fetch stages from DB
  const { data: dbAsamalar = [] } = useQuery<AsamaItem[]>({
    queryKey: ['takip_asamalar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC'
      )
      if (!res.success) return []
      return res.data
    }
  })

  // 3. Fetch ALL documents across all dossiers (for general metrics)
  const { data: allBelgeler = [] } = useQuery<TeminBelgeItem[]>({
    queryKey: ['takip_tum_belgeler'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, belge_adi, is_signed, temin_dosya_id FROM DATA_TeminBelge'
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !activeDosyaId
  })

  // Fetch Kalemler (Materials/Items) for this dossier
  const { data: kalemler = [] } = useQuery<TeminKalemItem[]>({
    queryKey: ['takip_kalemler', activeDosyaId],
    queryFn: async () => {
      if (!activeDosyaId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ${activeDosyaId} ORDER BY id ASC`
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !!activeDosyaId
  })

  // Fetch Firmalar (Bidders/Proposals) for this dossier
  const { data: firmalar = [] } = useQuery<TeminFirmaItem[]>({
    queryKey: ['takip_firmalar', activeDosyaId],
    queryFn: async () => {
      if (!activeDosyaId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT df.*, f.unvan 
         FROM DATA_TeminFirma df 
         LEFT JOIN TANIM_Firma f ON df.firma_id = f.id 
         WHERE df.temin_dosya_id = ${activeDosyaId}`
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !!activeDosyaId
  })

  // Fetch Komisyonlar for this dossier
  const { data: komisyonlar = [] } = useQuery<TeminKomisyonItem[]>({
    queryKey: ['takip_komisyonlar', activeDosyaId],
    queryFn: async () => {
      if (!activeDosyaId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT * FROM DATA_TeminKomisyon WHERE temin_dosya_id = ${activeDosyaId} ORDER BY id ASC`
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !!activeDosyaId
  })

  // Fallback stages if db is empty
  const rawStages: AsamaItem[] =
    dbAsamalar.length > 0
      ? dbAsamalar
      : [
          {
            asama_sira: 1,
            asama_adi: 'İhtiyaç Tespiti & Başlangıç',
            aciklama: 'İhtiyacın belirlendiği ve sürecin başlatıldığı ilk adım.'
          },
          {
            asama_sira: 2,
            asama_adi: 'Piyasa Fiyat Araştırması',
            aciklama: 'Tekliflerin toplandığı ve yaklaşık maliyetin belirlendiği aşama.'
          },
          {
            asama_sira: 3,
            asama_adi: 'Sipariş & Sözleşme',
            aciklama: 'Sözleşme/sipariş onayı ve kazanan firma atama aşaması.'
          },
          {
            asama_sira: 4,
            asama_adi: 'Muayene & Kabul & Ödeme İşlemleri',
            aciklama: 'Mal/hizmet teslimatı, muayene kabulü ve fatura ödeme adımı.'
          }
        ]

  // Deduplicate by asama_sira so we never get duplicate step numbers
  const stages = useMemo(() => {
    const map = new Map<number, AsamaItem>()
    for (const item of rawStages) {
      if (!map.has(item.asama_sira)) {
        map.set(item.asama_sira, item)
      } else {
        const existing = map.get(item.asama_sira)
        if ((item.asama_adi?.length || 0) > (existing?.asama_adi?.length || 0)) {
          map.set(item.asama_sira, item)
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.asama_sira - b.asama_sira)
  }, [rawStages])

  const currentAsamaSira = activeDosya?.durum_asama_id || 1


  // Handle toggle signed state (imzalandı ↔ imzalanmadı)
  const handleToggleSign = async (belgeId: number, currentState: number) => {
    try {
      const newState = currentState ? 0 : 1
      const res = await window.electron.ipcRenderer.invoke(
        'db:execute',
        `UPDATE DATA_TeminBelge SET is_signed = ${newState} WHERE id = ${belgeId}`
      )
      if (res.success) {
        refetchBelgeler()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Smart Desktop Notifications
  useEffect(() => {
    if (activeDosya && !notificationSent) {
      let missingCount = dbBelgeler.filter((b) => !b.is_signed).length

      // Calculate deadline warning
      let deadlineMsg = ''
      if (activeDosya.son_teklif_verme_tarihi) {
        const diffMs = new Date(activeDosya.son_teklif_verme_tarihi).getTime() - Date.now()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays <= 2 && diffDays >= 0) {
          deadlineMsg = `Son teklif verme tarihine ${diffDays} gün kaldı! `
        } else if (diffDays < 0) {
          deadlineMsg = `Son teklif verme süresi doldu! `
        }
      }

      if (deadlineMsg || missingCount > 0) {
        const notification = new window.Notification('TEMİN 360 - Akıllı Hatırlatıcı', {
          body: `${deadlineMsg}${
            missingCount > 0 ? `İmzası eksik ${missingCount} evrakınız bulunuyor.` : ''
          }`,
          icon: '/icon.png'
        })
        notification.onclick = () => {
          window.focus()
        }
        setNotificationSent(true)
      }
    }
  }, [activeDosya, dbBelgeler, notificationSent])

  return {
    activeDosyaId,
    setActiveDosyaId,
    activeDosya,
    dosyalar,
    dbBelgeler,
    allBelgeler,
    kalemler,
    firmalar,
    komisyonlar,
    stages,
    dbAsamalar,
    currentAsamaSira,
    STAGE_ROUTES,
    STAGE_SHORT_LABELS,
    status,
    setStatus,
    acilisTarihi,
    setAcilisTarihi,
    sonTeklifTarihi,
    setSonTeklifTarihi,
    teminTarihi,
    setTeminTarihi,
    teslimTarihi,
    setTeslimTarihi,
    notlar,
    setNotlar,
    saveLoading,
    saveMessage,
    handleEditDosya,
    handleSurecAkisi,
    handleOpenInNewWindow,
    handleDelete,
    handleUpdateDosya,
    handleToggleSign,
    formatCurrency
  }
}
