/* eslint-disable */
import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Building,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Coins,
  Edit,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Info,
  Layers,
  MoreVertical,
  Printer,
  Save,
  Trash2
} from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useTabStore } from '../../store/tabStore'
import { useDosyalarHooks } from '../dosyalar/dosyalar.hooks'
import { Button } from '../../components/ui/Button'
import { useEffect, useState, useMemo } from 'react'
import { logActivity } from '../../utils/logger'
import { emitAppEvent, useAppEventListener } from '../../utils/appEvents'

export function TakipScreen(): React.JSX.Element {
  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore()
  const { dosyalar, deleteDosya, hardDeleteDosya } = useDosyalarHooks()
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

  // 1. Fetch active dossier details
  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId)
  const [notificationSent, setNotificationSent] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Local state for dossier updates
  const [status, setStatus] = useState('devam_ediyor')
  const [acilisTarihi, setAcilisTarihi] = useState('')
  const [sonTeklifTarihi, setSonTeklifTarihi] = useState('')
  const [teminTarihi, setTeminTarihi] = useState('')
  const [teslimTarihi, setTeslimTarihi] = useState('')
  const [notlar, setNotlar] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Close menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dosya-menu-container')) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleOpenInNewWindow = () => {
    if (!activeDosya) return
    window.electron?.ipcRenderer.send('window:open-secondary', {
      path: '/dosyalar',
      search: `?id=${activeDosya.id}&mode=window`,
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
        emitAppEvent('status:changed', { dosyaId: activeDosyaId, payload: { status } })
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
  const { data: dbBelgeler = [], refetch: refetchBelgeler } = useQuery<any[]>({
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
  const { data: dbAsamalar = [] } = useQuery<any[]>({
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
  const { data: allBelgeler = [] } = useQuery<any[]>({
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
  const { data: kalemler = [] } = useQuery<any[]>({
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
  const { data: firmalar = [] } = useQuery<any[]>({
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
  const { data: komisyonlar = [] } = useQuery<any[]>({
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
  const rawStages =
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

  // Deduplicate by asama_sira so we never get duplicate step numbers (e.g. duplicate step 4)
  const stages = useMemo(() => {
    const map = new Map<number, any>()
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

  const STAGE_ROUTES: Record<number, string> = {
    1: '/dosya/hazirlik-ve-ihtiyac',
    2: '/dosya/piyasa-fiyat-arastirmasi',
    3: '/dosya/siparis-ve-sozlesme',
    4: '/dosya/kabul-ve-odeme'
  }

  const STAGE_SHORT_LABELS: Record<number, string> = {
    1: 'Hazırlık',
    2: 'Araştırma',
    3: 'Sözleşme',
    4: 'Muayene & Kabul & Ödeme'
  }

  const currentAsamaSira = activeDosya?.durum_asama_id || 1

  // Format Currency Helper
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value)
  }

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

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-855 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Süreç Takip & Durum Paneli
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Doğrudan temin dosyalarınızın yasal işlem adımlarını ve belge tamamlama durumlarını
            buradan izleyebilirsiniz.
          </p>
        </div>
        {activeDosya && (
          <button
            onClick={() => {
              addTab(`/dosyalar/yeni?id=${activeDosya.id}`)
              navigate({ to: `/dosyalar/yeni?id=${activeDosya.id}` })
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
          >
            <Edit size={15} />
            Dosyayı Düzenle
          </button>
        )}
      </div>

      {activeDosya ? (
        <div className="space-y-6">
          {/* TOP SECTION: 12-COL GRID FOR SUMMARY (8 COLS) & ACTIONS/DATES (4 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: ACTIVE FILE SUMMARY & ACTIONS PANEL */}
            <div className="lg:col-span-8 space-y-6">
              {/* ACTIVE FILE SUMMARY & ACTIONS PANEL */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              {/* Dossier Basic Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5 flex-1 min-w-[260px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-widest bg-blue-100/40 dark:bg-blue-955/40 px-2.5 py-1 rounded-full border border-blue-500/15">
                      {activeDosya.temin_no || 'Dosya No Belirtilmedi'}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        activeDosya.status === 'tamamlandi'
                          ? 'bg-emerald-100/40 text-emerald-600 border-emerald-500/15'
                          : activeDosya.status === 'iptal'
                            ? 'bg-rose-100/40 text-rose-600 border-rose-500/15'
                            : 'bg-amber-100/40 text-amber-600 border-amber-500/15'
                      }`}
                    >
                      {activeDosya.status === 'tamamlandi'
                        ? 'Tamamlandı'
                        : activeDosya.status === 'iptal'
                          ? 'İptal Edildi'
                          : 'Devam Ediyor'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                    {activeDosya.konu}
                  </h2>
                  <p className="text-xs text-slate-550 dark:text-slate-400 capitalize">
                    Tür:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-350">
                      {activeDosya.tur} Alımı
                    </span>{' '}
                    | Birim:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-350">
                      {activeDosya.birim_adi || 'Birim Belirtilmedi'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 select-none">
                  <div className="text-right mr-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Yaklaşık Maliyet
                    </span>
                    <span className="text-xl font-mono font-extrabold text-slate-850 dark:text-slate-100">
                      {formatCurrency(activeDosya.yaklasik_maliyet || 0)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addTab(`/dosyalar/yeni?id=${activeDosya.id}`)
                      navigate({ to: `/dosyalar/yeni?id=${activeDosya.id}` })
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    title="Dosya Formunu Düzenle"
                  >
                    <Edit size={14} />
                    Düzenle
                  </button>

                  <div className="relative dosya-menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsMenuOpen(!isMenuOpen)
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800 h-10 w-10 flex items-center justify-center"
                      title="Dosya İşlemleri"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 flex flex-col text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false)
                            addTab(`/dosyalar/yeni?id=${activeDosya.id}`)
                            navigate({
                              to: `/dosyalar/yeni?id=${activeDosya.id}`
                            })
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent font-semibold"
                        >
                          <Edit size={14} className="text-slate-400" />
                          Dosyayı Düzenle
                        </button>

                        <button
                          onClick={() => {
                            setIsMenuOpen(false)
                            handleOpenInNewWindow()
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent font-semibold"
                        >
                          <ExternalLink size={14} className="text-slate-400" />
                          Yeni Pencerede Aç
                        </button>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                        <button
                          onClick={() => {
                            setIsMenuOpen(false)
                            handleDelete()
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent font-semibold"
                        >
                          <Trash2 size={14} className="text-red-400 dark:text-red-500" />
                          Dosyayı İptal Et (Sil)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Ana Süreç Aşaması Kartları */}
              <div>
                <div className="flex items-center justify-between mb-3 select-none">
                  <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    Doğrudan Temin Süreç Aşamaları
                  </h4>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    4 Temel Aşama
                  </span>
                </div>

                {/* 4 Aşama Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                  {/* 1. Aşama: İhtiyaç ve Hazırlık */}
                  <Link
                    to="/dosya/hazirlik-ve-ihtiyac"
                    className="group relative p-4 bg-white dark:bg-slate-900/90 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-200/80 hover:border-blue-400/60 dark:border-slate-800 dark:hover:border-blue-500/40 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[120px] cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                          1. Aşama
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        İhtiyaç & Hazırlık
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-1">
                        Malzeme Kalemleri, Lüzum Müzekkeresi & Başlangıç Onayı
                      </span>
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                            kalemler.length > 0
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50'
                              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          📦 {kalemler.length > 0 ? `${kalemler.length} Kalem Eklendi` : 'Kalem Eklenmedi'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      <span>Aşamaya Git</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* 2. Aşama: Piyasa Fiyat Araştırması */}
                  <Link
                    to="/dosya/piyasa-fiyat-arastirmasi"
                    className="group relative p-4 bg-white dark:bg-slate-900/90 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-200/80 hover:border-emerald-400/60 dark:border-slate-800 dark:hover:border-emerald-500/40 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[120px] cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                          2. Aşama
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Piyasa Fiyat Araştırması
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-1">
                        Firma Teklifleri, Teklif Cetveli & Fiyat Tutanağı
                      </span>
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                            firmalar.length > 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50'
                              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          💼 {firmalar.length > 0 ? `${firmalar.length} Firma Teklifi` : 'Teklif Bekleniyor'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Aşamaya Git</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* 3. Aşama: Sipariş ve Sözleşme */}
                  <Link
                    to="/dosya/siparis-ve-sozlesme"
                    className="group relative p-4 bg-white dark:bg-slate-900/90 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 border border-slate-200/80 hover:border-amber-400/60 dark:border-slate-800 dark:hover:border-amber-500/40 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[120px] cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                          3. Aşama
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileCheck className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Sipariş & Sözleşme
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-1">
                        Temin Onay Belgesi, Sipariş Mektubu & Sözleşme
                      </span>
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                            activeDosya.firma_id
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50'
                              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          📝 {activeDosya.firma_id ? 'Yüklenici Belirlendi' : 'Karar / Sözleşme'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      <span>Aşamaya Git</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* 4. Aşama: Muayene Kabul ve Ödeme */}
                  <Link
                    to="/dosya/kabul-ve-odeme"
                    className="group relative p-4 bg-white dark:bg-slate-900/90 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border border-slate-200/80 hover:border-purple-400/60 dark:border-slate-800 dark:hover:border-purple-500/40 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[120px] cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                          4. Aşama
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-650 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Coins className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Muayene, Kabul & Ödeme
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-1">
                        Muayene Kabul Tutanağı, TİF & Ödeme Emri Belgesi
                      </span>
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                            activeDosya.status === 'tamamlandi'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/50'
                              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          🏁 {activeDosya.status === 'tamamlandi' ? 'Süreç Tamamlandı' : 'Kabul & Ödeme'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      <span>Aşamaya Git</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>

                {/* Hızlı İşlemler & Ek Modüller */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto pb-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 select-none">
                    Hızlı Araçlar:
                  </span>
                  <Link
                    to="/dosya/cikti-merkezi"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-500" />
                    Dosya Çıktı Merkezi
                  </Link>
                  <Link
                    to="/dosya/klasor-ve-kapaklar"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    Klasör & Kapaklar
                  </Link>
                  <Link
                    to="/dosya/firmalar-maliyet/yaklasik"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                    Yaklaşık Maliyet Cetveli
                  </Link>
                  <Link
                    to="/dosya/fatura-ve-irsaliye"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-emerald-500" />
                    Fatura & İrsaliye
                  </Link>
                  <Link
                    to="/dosya/imzali-belgeler"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-purple-500" />
                    İmzalı Belgeler
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DOSYA GÜNCELLEME & TARİHLER ve İMZA TAKİBİ */}
          <div className="lg:col-span-4 space-y-6">
            {/* DOSYA GÜNCELLEME & TARİHLER PANELİ */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Dosya Durumu & İşlem Tarihleri
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Süreç milat tarihlerini ve dosya durumunu buradan kaydedip güncelleyebilirsiniz.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateDosya} className="space-y-3.5">
                {/* Durum */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Dosya Durumu
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  >
                    <option value="devam_ediyor">Devam Ediyor</option>
                    <option value="tamamlandi">Tamamlandı</option>
                    <option value="iptal">İptal Edildi</option>
                  </select>
                </div>

                {/* Grid for Dates */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Dosya Açılış Tarihi */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Açılış Tarihi
                    </label>
                    <input
                      type="date"
                      value={acilisTarihi}
                      onChange={(e) => setAcilisTarihi(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>

                  {/* Son Teklif Verme Tarihi */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Son Teklif Tarihi
                    </label>
                    <input
                      type="date"
                      value={sonTeklifTarihi}
                      onChange={(e) => setSonTeklifTarihi(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>

                  {/* Karar / Temin Tarihi */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Sözleşme/Karar Tarihi
                    </label>
                    <input
                      type="date"
                      value={teminTarihi}
                      onChange={(e) => setTeminTarihi(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>

                  {/* Tahmini Teslim Tarihi */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Teslim Tarihi
                    </label>
                    <input
                      type="date"
                      value={teslimTarihi}
                      onChange={(e) => setTeslimTarihi(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Notlar */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Süreç Notları
                  </label>
                  <textarea
                    rows={2}
                    value={notlar}
                    onChange={(e) => setNotlar(e.target.value)}
                    placeholder="Dosyaya özel notlar girin..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                  />
                </div>

                {/* Save button and state message */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {saveMessage}
                  </span>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ml-auto"
                  >
                    {saveLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Kaydet
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              {/* UPLOAD SIGNED DOCUMENTS SECTION */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <FileCheck className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Üretilen Belgeler ve İmza Takibi
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Sistemden üretilmiş dosyaların ıslak imzalı kopyalarını buradan takip
                    edebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {dbBelgeler.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center italic bg-slate-50 dark:bg-slate-900 rounded-lg">
                    Henüz bu dosya için belge üretilmemiş.
                  </div>
                ) : (
                  dbBelgeler.map((belge) => (
                    <div
                      key={belge.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors duration-200 ${
                        belge.is_signed
                          ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                          : 'bg-slate-50/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            belge.is_signed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                          }`}
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {belge.belge_adi}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={belge.is_signed ? 'true' : 'false'}
                        onClick={() => handleToggleSign(belge.id, belge.is_signed)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${
                          belge.is_signed
                            ? 'bg-emerald-500 focus:ring-emerald-400'
                            : 'bg-slate-300 dark:bg-slate-600 focus:ring-slate-400'
                        }`}
                        title={belge.is_signed ? 'İmzayı kaldır' : 'İmzalandı olarak işaretle'}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            belge.is_signed ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 min-w-[70px] justify-end ${
                          belge.is_signed
                            ? 'text-emerald-600 dark:text-emerald-500'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {belge.is_signed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> İmzalandı
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> Bekliyor
                          </>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LOWER SECTIONS: FULL WIDTH */}
        <div className="space-y-6">
          {/* PROCESS PROGRESS BAR */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  İşlem Aşaması İlerleme Durumu
                </h3>
                <Link
                  to="/yardim"
                  search={{ doc: 'dogrudan_temin_islem_sureci' }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-305 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-955/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/40 transition-all cursor-pointer shadow-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
                  İşlem Süreci Akış Şeması
                </Link>
              </div>

              {/* Progress Line stepper */}
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-4 mt-4">
                {/* Horizontal connection line */}
                <div className="absolute top-5 left-5 right-5 h-1 bg-slate-100 dark:bg-slate-800 hidden md:block z-0" />

                {stages.map((asama, idx) => {
                  const isCompleted = asama.asama_sira < currentAsamaSira
                  const isActive = asama.asama_sira === currentAsamaSira
                  const route = STAGE_ROUTES[asama.asama_sira] || '/dosya/hazirlik-ve-ihtiyac'
                  const shortLabel = STAGE_SHORT_LABELS[asama.asama_sira] || asama.asama_adi

                  return (
                    <Link
                      to={route}
                      key={asama.id ? `stepper-stage-${asama.id}-${idx}` : `stepper-sira-${asama.asama_sira}-${idx}`}
                      className="flex md:flex-col items-start md:items-center text-left md:text-center flex-1 relative z-10 gap-3 md:gap-2 group cursor-pointer hover:-translate-y-0.5 transition-transform"
                      title={`${asama.asama_sira}. Aşama: ${shortLabel} Ekranına Git`}
                    >
                      {/* Step node */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:bg-emerald-600'
                            : isActive
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-110 group-hover:bg-blue-700'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <span className="text-xs font-black">{asama.asama_sira}</span>
                        )}
                      </div>

                      {/* Step Labels */}
                      <div className="flex flex-col md:items-center mt-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500">
                          {asama.asama_sira}. Aşama
                        </span>
                        <span
                          className={`text-xs font-extrabold transition-colors duration-200 mt-0.5 ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : isCompleted
                                ? 'text-emerald-600 dark:text-emerald-500'
                                : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          }`}
                        >
                          {shortLabel}
                        </span>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 max-w-[160px] line-clamp-2 md:block hidden">
                          {asama.aciklama}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* PROCESS GUIDE WIZARD CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Doğrudan Temin İş Akışı & Şablon Yönergesi
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-955/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-full font-bold uppercase tracking-wider">
                  Dinamik Altyapı
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                <p>
                  Sistemimizdeki tüm şablonlar, dosyaya girdiğiniz veriler ile
                  <strong className="text-slate-800 dark:text-slate-200">
                    {' '}
                    tamamen dinamik ve otomatik{' '}
                  </strong>
                  olarak doldurulur. Süreç boyunca yaptığınız her giriş anında evraklara yansır.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex gap-3">
                    <span className="text-base select-none">💡</span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Esnek & Dinamik Şablonlar
                      </h4>
                      <p className="text-[10.5px] text-slate-500 leading-normal">
                        Şablonların yerleşimleri ve içerikleri mevzuata uygun şekilde dinamik olarak
                        bağlanmıştır.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex gap-3">
                    <span className="text-base select-none">🚀</span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Süreç Nasıl Başlar? (1. Aşama)
                      </h4>
                      <p className="text-[10.5px] text-slate-500 leading-normal">
                        İhtiyaç listesini girerek süreci başlatırsınız. Bu adıma göre Lüzum
                        Müzekkeresi ve Harcama Talimatı gibi başlangıç belgeleri üretilir.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex gap-3">
                    <span className="text-base select-none">📊</span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Piyasa Fiyat Araştırması (2. Aşama)
                      </h4>
                      <p className="text-[10.5px] text-slate-500 leading-normal">
                        Firma tekliflerini girdiğinizde, komisyonlar ve yaklaşık maliyet
                        hesaplamaları otomatik olarak dolup cetvel haline getirilir.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex gap-3">
                    <span className="text-base select-none">🏁</span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Sözleşme & Süreç Sonu (3/4. Aşama)
                      </h4>
                      <p className="text-[10.5px] text-slate-500 leading-normal">
                        Kazanan firmayı atar, sözleşme basar ve son aşamada Muayene Kabul Tutanağı
                        ile süreci kapatıp imzaya çıkarırsınız.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MALZEMELER VE FİRMALAR GRİDİ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Malzemeler */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <h3 className="text-xs font-bold text-slate-855 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span>📦</span> Malzeme / Hizmet Kalemleri
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold">
                      {kalemler.length} Kalem
                    </span>
                  </h3>
                  <Link
                    to="/dosya/hazirlik-ve-ihtiyac"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    <span>Yönet & Ekle</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner max-h-[240px] overflow-y-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-655 dark:text-slate-400">
                      <tr>
                        <th className="p-3">Malzeme Adı</th>
                        <th className="p-3 text-center">Miktar</th>
                        <th className="p-3 text-center">Birim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-450">
                      {kalemler.map((item: any) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/55 dark:hover:bg-slate-900/10"
                        >
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                            {item.kalem_adi}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {item.miktar}
                          </td>
                          <td className="p-3 text-center text-slate-500 dark:text-slate-400">
                            {item.olcu_birimi || item.birim || 'Adet'}
                          </td>
                        </tr>
                      ))}
                      {kalemler.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-slate-400 italic">
                            Dosyada henüz kayıtlı malzeme bulunmuyor.{' '}
                            <Link
                              to="/dosya/hazirlik-ve-ihtiyac"
                              className="text-blue-600 underline font-semibold ml-1"
                            >
                              Kalem eklemek için tıklayın.
                            </Link>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tedarikçiler */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <h3 className="text-xs font-bold text-slate-855 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span>💼</span> Teklif Veren İstekliler / Firmalar
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold">
                      {firmalar.length} Firma
                    </span>
                  </h3>
                  <Link
                    to="/dosya/piyasa-fiyat-arastirmasi"
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    <span>Teklifleri Yönet</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner max-h-[240px] overflow-y-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-655 dark:text-slate-400">
                      <tr>
                        <th className="p-3">Firma Ünvanı</th>
                        <th className="p-3 text-center">Teklif Durumu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-450">
                      {firmalar.map((f: any) => (
                        <tr key={f.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-900/10">
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                            {f.unvan}
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800 font-extrabold tracking-tight">
                              Teklif Eklendi
                            </span>
                          </td>
                        </tr>
                      ))}
                      {firmalar.length === 0 && (
                        <tr>
                          <td colSpan={2} className="p-6 text-center text-slate-400 italic">
                            Dosyada henüz kayıtlı firma teklifi bulunmuyor.{' '}
                            <Link
                              to="/dosya/piyasa-fiyat-arastirmasi"
                              className="text-emerald-600 underline font-semibold ml-1"
                            >
                              Firma davet etmek için tıklayın.
                            </Link>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* DOSYA DETAYLI BİLGİLERİ (SALT OKUNUR / VIEW MODE) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Dosya Şartname ve İdari Bilgileri (Görüntüleme Modu)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                    Salt Okunur
                  </span>
                </div>
                <button
                  onClick={() => {
                    addTab(`/dosyalar/yeni?id=${activeDosya.id}`)
                    navigate({ to: `/dosyalar/yeni?id=${activeDosya.id}` })
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                >
                  <Edit size={13} />
                  Formu Düzenle
                </button>
              </div>

              {/* 1. İhale & Genel Parametreler */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  1. Temel & İhale Parametreleri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">İhale / Alım Türü</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">{activeDosya.tur || 'Mal'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">İhale Şekli (Madde)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.ihale_sekli || '22/d*'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Teklif / Sözleşme Türü</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.teklif_sozlesme_turu || 'Birim Fiyat'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Bütçe Yılı</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{activeDosya.butce_yili || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">KDV Oranı</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">%{activeDosya.kdv || '20'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Sözleşme Durumu</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.sozlesme_yapilacak_mi ? 'Sözleşme Yapılacak' : 'Sözleşme Yapılmayacak'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Fiyat Farkı</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{activeDosya.fiyat_farki_dayanagi || 'Ödenmeyecek'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Kısmi Teklif</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.kismi_teklif_verilecek_mi ? 'Verilebilir' : 'Verilemez'}</span>
                  </div>
                </div>
              </div>

              {/* 2. İdari Birim & Personeller */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2. İdari Birim ve Görevli Personeller
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Talep Eden Birim</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.birim_adi || 'Birim Yok'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">İhtiyaç Yeri</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.ihtiyac_yeri || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">İrtibat Yetkilisi</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.irtibat_ad || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Harcama Yetkilisi (Onaylayan)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.onaylayan_ad || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Gerçekleştirme Görevlisi (Sunan)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.sunan_ad || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Piyasa Araştırma Görevlisi (Hazırlayan)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeDosya.hazirlayan_ad || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Bütçe & Muhasebe Tertipleri */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3. Bütçe & Muhasebe Tertibi
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Harcama Birimi</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{activeDosya.harcama_birimi || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Muhasebe Birimi</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{activeDosya.muhasebe_birimi || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Bütçe Kodu</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{activeDosya.butce_kodu || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Fonksiyonel Kod</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{activeDosya.fonksiyonel_kod || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Finansman Kodu</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{activeDosya.finansman_kodu || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block">Ekonomik Kod</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{activeDosya.ekonomik_kod || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 4. Komisyon Üyeleri (Varsa) */}
              {komisyonlar.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    4. Görevli Komisyon Üyeleri ({komisyonlar.length} Üye)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {komisyonlar.map((c: any) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{c.ad_soyad}</span>
                          <span className="text-[10px] text-slate-400">{c.unvan || 'Üye'}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {c.gorevi || 'Üye'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DETAIL CARDS FOR STAGES */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Aşama Detayları ve Açıklamalar
              </h3>

              {stages.map((asama, idx) => {
                const isActive = asama.asama_sira === currentAsamaSira
                const isCompleted = asama.asama_sira < currentAsamaSira

                return (
                  <div
                    key={asama.id ? `detail-stage-${asama.id}-${idx}` : `detail-sira-${asama.asama_sira}-${idx}`}
                    className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      isActive
                        ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50 shadow-xs'
                        : isCompleted
                          ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 opacity-80'
                          : 'bg-slate-50/40 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900/50 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {asama.asama_sira}. Aşama: {asama.asama_adi}
                        </h4>
                        {isActive && (
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-500/10 uppercase tracking-wider">
                            Aktif İşlem Aşaması
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                            Tamamlandı
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                        {asama.aciklama || 'Bu aşama için bir açıklama girilmemiş.'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* NO ACTIVE DOSSIER SELECTED STATE - GENEL METRİK PANELİ */
        <div className="flex flex-col gap-6 max-w-[1600px] mx-auto my-6 w-full">
          <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-955/50 text-blue-600 dark:text-blue-450 flex items-center justify-center">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-105">
                Takip Edilecek Aktif Dosya Seçilmedi
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                Süreçlerin aşama aşama takibini ve evrak kontrolünü görmek için listeden bir dosya
                seçerek aktif hale getirin veya aşağıdaki genel durumu inceleyin.
              </p>
            </div>
            <Link to="/dosyalar">
              <Button className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-2 px-5 flex items-center gap-2 mt-2">
                <Building className="w-4 h-4" />
                Tüm Dosyaları Gör
              </Button>
            </Link>
          </div>

          {/* GENEL METRİK KARTLARI */}
          {dosyalar.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Toplam Dosya */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                    {dosyalar.length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Toplam Dosya</p>
                </div>

                {/* İmza Bekleyen Belge */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                    {allBelgeler.filter((b) => !b.is_signed).length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">İmza Bekleyen Belge</p>
                </div>

                {/* İmzalanan Belge */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                    {allBelgeler.filter((b) => b.is_signed).length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">İmzalanan Belge</p>
                </div>

                {/* Toplam Yaklaşık Maliyet */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
                      <Building className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    {formatCurrency(
                      dosyalar.reduce((sum, d) => sum + (d.yaklasik_maliyet || 0), 0)
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Toplam Yaklaşık Maliyet</p>
                </div>
              </div>

              {/* AŞAMA DAĞILIMI */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Aşama Dağılımı
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Tüm dosyaların süreç aşamalarına göre dağılımı
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {stages.map((asama) => {
                    const count = dosyalar.filter(
                      (d) => (d.durum_asama_id || 1) === asama.asama_sira
                    ).length
                    const pct = dosyalar.length > 0 ? (count / dosyalar.length) * 100 : 0
                    return (
                      <div
                        key={asama.asama_sira}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {asama.asama_sira}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                              {asama.asama_adi}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 ml-2 shrink-0">
                              {count} dosya
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* SON İŞLEM GÖREN DOSYALAR */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Son İşlem Gören Dosyalar
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Hızlıca çalışmaya devam etmek için bir dosyaya tıklayın
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {dosyalar.slice(0, 5).map((dosya) => {
                    const stageInfo = dbAsamalar.find(
                      (a) => a.asama_sira === (dosya.durum_asama_id || 1)
                    )
                    const stageName = stageInfo?.asama_adi || 'Süreç Başlangıcı'

                    return (
                      <div
                        key={dosya.id}
                        onClick={() => setActiveDosyaId(dosya.id)}
                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 hover:bg-blue-50 dark:bg-slate-900/30 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                            <FileCheck className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {dosya.konu || 'İsimsiz Temin'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                              <span className="font-mono bg-slate-200/50 dark:bg-slate-700/50 px-1 rounded">
                                {dosya.temin_no}
                              </span>
                              <span>•</span>
                              <span>{dosya.tur} Alımı</span>
                              <span>•</span>
                              <span>{formatCurrency(dosya.yaklasik_maliyet || 0)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200/50 dark:bg-slate-850 text-slate-600 dark:text-slate-300">
                            {stageName}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
