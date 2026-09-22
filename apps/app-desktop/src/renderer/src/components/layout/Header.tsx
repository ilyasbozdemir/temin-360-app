import React, { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSettingsStore } from '../../store/settingsStore'
import { FormatUpgradeModal } from '../modals/FormatUpgradeModal'
import { UpdateModal } from '../ui/UpdateModal'
import { WindowControls } from './header/WindowControls'
import { NativeMenuBar } from './header/NativeMenuBar'
import { DirtySummaryPopover } from './header/DirtySummaryPopover'
import { HeaderActions } from './header/HeaderActions'
import { HeaderBottomRow } from './header/HeaderBottomRow'
import { HeaderMenu, DirtySummaryData } from './header/header.types'

export function Header(): React.JSX.Element {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [hoveredSubMenu, setHoveredSubMenu] = useState<string | null>(null)
  const { activeDosyaId, fileName, isDirty, activeFilePath } =
    useWorkspaceStore()
  const { institutionLogo, logoLeft } = useSettingsStore()
  const activeExt = (activeFilePath?.split('.').pop() || '').toLowerCase()
  const isOldFormat = Boolean(activeFilePath && activeExt !== 'temin')

  const [showFormatUpgradeModal, setShowFormatUpgradeModal] = useState(false)
  const [upgradeFilePath, setUpgradeFilePath] = useState<string | null>(null)

  const handleUpgradeAndOpen = async (filePath: string): Promise<void> => {
    const result = await useWorkspaceStore
      .getState()
      .convertAndOpenWorkspace(filePath)
    if (result.success) {
      window.location.reload()
    } else {
      throw new Error(result.error || 'Dönüştürme başarısız oldu.')
    }
  }

  const [isDirtySummaryOpen, setIsDirtySummaryOpen] = useState(false)
  const [dirtySummary, setDirtySummary] = useState<DirtySummaryData | null>(
    null
  )
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const dirtySummaryRef = React.useRef<HTMLDivElement>(null)

  const loadDirtySummary = async (): Promise<void> => {
    try {
      setIsLoadingSummary(true)
      const res = await window.electron?.ipcRenderer.invoke(
        'workspace:get-dirty-summary'
      )
      if (res?.success) {
        setDirtySummary({
          totalChanges: res.totalChanges ?? 0,
          lastModifiedAt: res.lastModifiedAt ?? null,
          items: res.items ?? []
        })
      } else {
        setDirtySummary({
          totalChanges: 1,
          lastModifiedAt: null,
          items: [
            {
              tableName: 'Veritabanı',
              title: 'Çalışma Dosyası Değişiklikleri',
              action: 'other',
              actionLabel: 'Düzenlendi',
              count: 1,
              lastTime: 'Az önce'
            }
          ]
        })
      }
    } catch (e) {
      console.warn('Değişiklik özeti alınamadı:', e)
      setDirtySummary({
        totalChanges: 1,
        lastModifiedAt: null,
        items: [
          {
            tableName: 'Veritabanı',
            title: 'Çalışma Dosyası Değişiklikleri',
            action: 'other',
            actionLabel: 'Düzenlendi',
            count: 1,
            lastTime: 'Az önce'
          }
        ]
      })
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const toggleDirtySummary = (): void => {
    if (!isDirtySummaryOpen) {
      loadDirtySummary()
    }
    setIsDirtySummaryOpen((prev) => !prev)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dirtySummaryRef.current &&
        !dirtySummaryRef.current.contains(event.target as Node)
      ) {
        setIsDirtySummaryOpen(false)
      }
    }
    if (isDirtySummaryOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDirtySummaryOpen])

  // Ekran genişliği takibi
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

  useEffect(() => {
    const handleResize = (): void => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mod Seçici Durumu
  const [procurementMode, setProcurementMode] = useState<
    'dogrudan_temin' | 'ihale'
  >(() => {
    return (
      (localStorage.getItem('temin_procurement_mode') as
        | 'dogrudan_temin'
        | 'ihale') || 'dogrudan_temin'
    )
  })

  const isDt = procurementMode === 'dogrudan_temin'
  const [switchFeedback, setSwitchFeedback] = useState<string | null>(null)

  const handleModeChange = (mode: 'dogrudan_temin' | 'ihale'): void => {
    if (mode === procurementMode) return
    setProcurementMode(mode)
    localStorage.setItem('temin_procurement_mode', mode)
    window.dispatchEvent(
      new CustomEvent('procurement-mode-change', {
        detail: { mode }
      })
    )

    const message =
      mode === 'dogrudan_temin'
        ? 'Doğrudan Temin Modu (KİK Md. 22) Aktif'
        : 'İhale Süreçleri Modu (KİK Md. 19 / 21) Aktif'
    setSwitchFeedback(message)
    setTimeout(() => {
      setSwitchFeedback(null)
    }, 2400)
  }

  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)

  const handleSaveAndSync = async (): Promise<void> => {
    try {
      setIsDirtySummaryOpen(false)
      setSaveFeedback('💾 Dosya kaydediliyor...')
      const saveRes = await window.electron?.ipcRenderer.invoke('workspace:save')
      if (!saveRes?.success) {
        throw new Error(saveRes?.error || 'Dosya kaydedilemedi.')
      }

      const s = await window.electron?.ipcRenderer.invoke('db:get-settings')
      if (s?.gdriveAccessToken) {
        setSaveFeedback('☁️ Google Drive bulutuna yedekleniyor...')
        const gdriveRes = await window.electron?.ipcRenderer.invoke(
          'workspace:backup-gdrive',
          { force: true }
        )
        if (gdriveRes?.success) {
          if (gdriveRes?.skipped) {
            setSaveFeedback('✓ Kaydedildi (Google Drive yedeği zaten güncel)')
          } else {
            setSaveFeedback('✓ Kaydedildi ve Google Drive\'a başarıyla yedeklendi')
          }
        } else {
          setSaveFeedback(
            `⚠️ Kaydedildi, ancak bulut: ${gdriveRes?.error || 'Yetki hatası'}`
          )
        }
      } else {
        setSaveFeedback('✓ Çalışma dosyası başarıyla kaydedildi')
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      setSaveFeedback(`❌ Kaydetme hatası: ${errorMsg}`)
    } finally {
      setTimeout(() => {
        setSaveFeedback(null);
      }, 3500)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleSaveAndSync()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleCloseWorkspace = async (): Promise<void> => {
    window.dispatchEvent(new CustomEvent('workspace-close-request'))
  }

  const [updateStatus, setUpdateStatus] = useState<{
    status: string
    version?: string
  } | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const removeListener = window.electron?.ipcRenderer.on(
      'updater:status',
      (_event, data: { status: string; version?: string }) => {
        setUpdateStatus(data)
        if (data.status === 'downloaded') {
          setShowUpdateModal(true)
        }
      }
    )

    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  useEffect(() => {
    const menuBar = document.getElementById('native-menu-bar')
    function handleClickOutside(e: MouseEvent): void {
      if (menuBar && !menuBar.contains(e.target as Node)) {
        setActiveMenu(null)
        setHoveredSubMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClose = (): void =>
    window.electron?.ipcRenderer.send('window-close')

  const menus: HeaderMenu[] = [
    {
      name: 'Dosya',
      items: [
        {
          label: 'Gösterge Paneli',
          onClick: () => navigate({ to: '/' })
        },
        {
          label: 'Yeni Doğrudan Temin Dosyası',
          onClick: () => navigate({ to: '/dosyalar/yeni' })
        },
        {
          label: 'Çalışma Dosyası Detayları (.temin)',
          onClick: () => navigate({ to: '/dosya' })
        },
        {
          label: '💾 Değişiklikleri Kaydet & Drive\'a Gönder (Ctrl+S)',
          onClick: handleSaveAndSync
        },
        {
          label: '💾 Farklı Kaydet (Yeni Format .temin)...',
          onClick: async () => {
            try {
              const res = await window.electron?.ipcRenderer.invoke(
                'workspace:save-as'
              )
              if (res?.success && res.newFilePath) {
                alert(
                  `Çalışma dosyanız yeni konuma (.temin) başarıyla kaydedildi:\n\n${res.newFilePath}`
                )
                window.location.reload()
              } else if (res?.error && res.error !== 'İşlem iptal edildi.') {
                alert(`Farklı kaydetme başarısız!\nHata: ${res.error}`)
              }
            } catch (e) {
              console.error(e)
            }
          }
        },
        ...(isOldFormat
          ? [
              {
                label: '⚡ Güncel Formata Dönüştür & Kaydet (.temin)',
                onClick: async () => {
                  try {
                    const res = await useWorkspaceStore
                      .getState()
                      .upgradeToTemin()
                    if (res?.success && res.newPath) {
                      alert(
                        `Dosyanız başarıyla yeni nesil TEMİN 360 formatına (.temin) dönüştürüldü ve kaydedildi:\n\n${res.newPath}`
                      )
                      window.location.reload()
                    } else {
                      alert(
                        `Format dönüştürülemedi!\nHata: ${
                          res?.error || 'Bilinmeyen hata'
                        }`
                      )
                    }
                  } catch (e: any) {
                    alert(`Hata: ${e.message}`)
                  }
                }
              }
            ]
          : []),
        {
          label: 'Kullanıcı Profili',
          onClick: () => navigate({ to: '/profil' })
        },
        { divider: true },
        {
          label: 'Farklı Çalışma Dosyası Aç (.temin, .dtal, .hkmp...)...',
          onClick: async () => {
            try {
              const res = await window.electron?.ipcRenderer.invoke(
                'dialog:showOpenDialog'
              )
              if (!res?.canceled && res?.filePath) {
                const filePath = res.filePath as string
                const ext = (filePath.split('.').pop() || '').toLowerCase()
                if (ext !== 'temin') {
                  setUpgradeFilePath(filePath)
                  setShowFormatUpgradeModal(true)
                } else {
                  const result = await useWorkspaceStore
                    .getState()
                    .openWorkspace(filePath, false)
                  if (result.success) {
                    window.location.reload()
                  } else {
                    alert(
                      `Çalışma dosyası açılamadı!\nHata: ${
                        result.error || 'Bilinmeyen hata'
                      }`
                    )
                  }
                }
              }
            } catch (e) {
              console.error(e)
            }
          }
        },
        {
          label: 'Çalışma Dosyasını Kapat',
          onClick: handleCloseWorkspace
        },
        { divider: true },
        { label: 'Uygulamadan Çık (Alt+F4)', onClick: handleClose }
      ]
    },
    ...(procurementMode === 'dogrudan_temin'
      ? [
          {
            name: 'Doğrudan Temin',
            onClick: () => navigate({ to: '/dosyalar' }),
            items: [
              {
                label: 'Tüm Doğrudan Temin Dosyaları',
                onClick: () => navigate({ to: '/dosyalar' })
              },
              {
                label: '📁 Proje Yönetimi & Yatırımlar',
                onClick: () => navigate({ to: '/projeler' })
              },
              {
                label: 'Yeni Dosya Oluştur',
                onClick: () => navigate({ to: '/dosyalar/yeni' })
              },
              {
                label: 'Hızlı Dosya Ekle / Güncelle',
                onClick: () => navigate({ to: '/hizli-dosya-ekle' })
              },
              {
                label: 'Süreç Akış Haritası (Beta)',
                onClick: () => navigate({ to: '/surec-akisi' })
              }
            ]
          },
          ...(activeDosyaId
            ? [
                {
                  name: 'Süreç Yönetimi',
                  items: [
                    {
                      label: 'Süreç Takip & Durum Paneli',
                      onClick: () => navigate({ to: '/takip' })
                    },
                    {
                      label: '🧭 Süreç Akış Haritası (Beta - Tablar)',
                      onClick: () => navigate({ to: '/surec-akisi' })
                    },
                    {
                      label: 'Belge Çıktı Merkezi',
                      onClick: () => navigate({ to: '/cikti-merkezi' })
                    },
                    {
                      label: 'Hızlı Dosya Ekle / Güncelle',
                      onClick: () => navigate({ to: '/hizli-dosya-ekle' })
                    },
                    {
                      label: 'Şablon & Taslak Yöneticisi',
                      onClick: () => navigate({ to: '/taslakyonetim' })
                    },
                    {
                      label: '📝 Dosya Notları & Yapılacaklar (To-Do)',
                      onClick: () => navigate({ to: '/notlar' })
                    }
                  ]
                },
                {
                  name: 'Adım Adım Süreç',
                  items: [
                    {
                      label: '1. İhtiyaç Listesi & Maliyet & Onay',
                      onClick: () => navigate({ to: '/dosya/hazirlik-ve-ihtiyac' })
                    },
                    {
                      label: '2. Piyasa Fiyat Araştırması',
                      onClick: () =>
                        navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' })
                    },
                    {
                      label: '3. Sipariş & Sözleşme',
                      onClick: () => navigate({ to: '/dosya/siparis-ve-sozlesme' })
                    },
                    {
                      label: '4. Muayene & Kabul & Ödeme İşlemleri',
                      onClick: () => navigate({ to: '/dosya/kabul-ve-odeme' })
                    },
                    {
                      label: '5. Klasör & Kapaklar',
                      onClick: () => navigate({ to: '/dosya/klasor-ve-kapaklar' })
                    }
                  ]
                }
              ]
            : [])
        ]
      : [
          {
            name: 'İhale Yönetimi',
            onClick: () => navigate({ to: '/harcama-merkezi' }),
            items: [
              {
                label: 'Açık İhale Süreçleri (KİK Md. 19)',
                onClick: () => navigate({ to: '/harcama-merkezi' })
              },
              {
                label: 'Pazarlık Usulü İhale (KİK Md. 21)',
                onClick: () => navigate({ to: '/harcama-merkezi' })
              },
              {
                label: 'İhale Hakediş & Harcama Raporları',
                onClick: () => navigate({ to: '/hakedis' })
              },
              { divider: true },
              {
                label: 'Şablon & Kategori Yönetimi',
                onClick: () => navigate({ to: '/degiskenler' })
              },
              {
                label: 'Taslak & Belge Havuzu',
                onClick: () => navigate({ to: '/taslakyonetim' })
              }
            ]
          },
          ...(activeDosyaId
            ? [
                {
                  name: 'İhale Süreç Adımları',
                  items: [
                    {
                      label: '1. İhale Onay Belgesi & Şartnameler',
                      onClick: () => navigate({ to: '/dosya/hazirlik-ve-ihtiyac' })
                    },
                    {
                      label: '2. İhale İlanı & Davet Mektupları',
                      onClick: () =>
                        navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' })
                    },
                    {
                      label: '3. Teklif Değerlendirme & Komisyon Kararı',
                      onClick: () => navigate({ to: '/dosya/siparis-ve-sozlesme' })
                    },
                    {
                      label: '4. Sözleşme & Teminat İşlemleri',
                      onClick: () => navigate({ to: '/dosya/kabul-ve-odeme' })
                    },
                    {
                      label: '5. İhale Klasörü & Arşivleme',
                      onClick: () => navigate({ to: '/dosya/klasor-ve-kapaklar' })
                    }
                  ]
                },
                {
                  name: 'İhale İşlemleri',
                  items: [
                    {
                      label: 'İhale Dosya Durumu & Takip',
                      onClick: () => navigate({ to: '/takip' })
                    },
                    {
                      label: 'İhale Belge Çıktı Merkezi',
                      onClick: () => navigate({ to: '/cikti-merkezi' })
                    },
                    {
                      label: 'Hakediş & Ödeme Takibi',
                      onClick: () => navigate({ to: '/hakedis' })
                    }
                  ]
                }
              ]
            : []),
          {
            name: 'İhale Mevzuatı',
            items: [
              {
                label: 'İhale Eşik Değerleri & Limitler',
                onClick: () => navigate({ to: '/mevzuat' })
              },
              {
                label: 'KİK Standart Şablon & Formlar',
                onClick: () => navigate({ to: '/taslakyonetim' })
              },
              {
                label: 'Mevzuat & Genelgeler',
                onClick: () => navigate({ to: '/mevzuat' })
              }
            ]
          }
        ]),
    {
      name: isDt ? 'Sistem Tanımları (DT)' : 'Sistem Tanımları (İhale)',
      items: isDt
        ? [
            {
              label: '🛒 Kurum & Harcama Birimi Bilgileri',
              onClick: () => navigate({ to: '/kurum' })
            },
            {
              label: '🛒 Doğrudan Temin Birimleri',
              onClick: () => navigate({ to: '/birimler' })
            },
            {
              label: '🛒 Harcama Yetkilileri & Personel',
              onClick: () => navigate({ to: '/personel' })
            },
            {
              label: '🛒 Piyasa Fiyat Araştırma Görevlileri',
              onClick: () => navigate({ to: '/komisyonlar' })
            },
            {
              label: '🛒 Muayene & Kabul Komisyonları',
              onClick: () => navigate({ to: '/komisyonlar' })
            },
            {
              label: '🛒 Görev & Yetki Tanımları',
              onClick: () => navigate({ to: '/komisyon-gorevleri' })
            },
            { divider: true },
            {
              label: '🛒 Doğrudan Temin İstekli Firmaları',
              onClick: () => navigate({ to: '/firmalar' })
            },
            {
              label: '📁 Yatırım ve Alım Projeleri',
              onClick: () => navigate({ to: '/projeler' })
            },
            {
              label: '🛒 Mal / Hizmet / Tüketim Listesi',
              onClick: () => navigate({ to: '/malzemeler' })
            },
            {
              label: '🛒 Taşınır Kodları & Ölçü Birimleri',
              onClick: () => navigate({ to: '/tasinirkod' })
            },
            {
              label: '🛒 Ambar & Depo Tanımları',
              onClick: () => navigate({ to: '/ambar' })
            },
            {
              label: '📈 Yİ-ÜFE Endeksleri (TÜİK & hakedis.org)',
              onClick: () =>
                navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as any })
            },
            { divider: true },
            {
              label: '🏛️ İhale Tanımlarına Geç (Pozlar & OKAS)',
              onClick: () => handleModeChange('ihale')
            }
          ]
        : [
            {
              label: '🏛️ İdare & İhale Makamı Bilgileri',
              onClick: () => navigate({ to: '/kurum' })
            },
            {
              label: '🏛️ İhale / İhale Kayıt Birimleri (EKAP)',
              onClick: () => navigate({ to: '/birimler' })
            },
            {
              label: '🏛️ İhale Yetkilileri & Raportörler',
              onClick: () => navigate({ to: '/personel' })
            },
            {
              label: '🏛️ İhale Komisyonları (KİK Md. 6 - Asıl/Yedek)',
              onClick: () => navigate({ to: '/komisyonlar' })
            },
            {
              label: '🏛️ Muayene, Denetim ve Kabul Heyetleri',
              onClick: () => navigate({ to: '/komisyonlar' })
            },
            {
              label: '🏛️ Komisyon Görev ve Yetki Matrisi',
              onClick: () => navigate({ to: '/komisyon-gorevleri' })
            },
            { divider: true },
            {
              label: '🏛️ İhale İsteklileri & Müteahhit Firmalar',
              onClick: () => navigate({ to: '/firmalar' })
            },
            {
              label: '🏛️ ÇŞB Birim Fiyat Pozları (Yapım & Onarım)',
              onClick: () => navigate({ to: '/pozlar' })
            },
            {
              label: '🏛️ OKAS (Kamu Alımları Sözlüğü) Kodları',
              onClick: () => navigate({ to: '/okaskod' })
            },
            {
              label: '🏛️ İhale Eşik Değerleri ve Limit Parametreleri',
              onClick: () =>
                navigate({ to: '/mevzuat', search: { tab: 'limitler' } as any })
            },
            {
              label: '📈 Yİ-ÜFE Fiyat Farkı & Değerleme Endeksleri',
              onClick: () =>
                navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as any })
            },
            { divider: true },
            {
              label: '🛒 Doğrudan Temin Tanımlarına Geç (22/d)',
              onClick: () => handleModeChange('dogrudan_temin')
            }
          ]
    },
    {
      name: 'Yönetim & Yardım',
      items: [
        {
          label: 'Genel Ayarlar',
          onClick: () => navigate({ to: '/ayarlar' })
        },
        {
          label: 'Mevzuat ve Parametreler',
          onClick: () =>
            navigate({ to: '/mevzuat', search: { tab: 'kutuphane' } as any })
        },
        {
          label: '📈 TÜİK Yİ-ÜFE Endeksleri & Değerleme',
          onClick: () =>
            navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as any })
        },
        {
          label: 'Şablon Yönetimi',
          onClick: () => navigate({ to: '/sablonlar' })
        },
        {
          label: '🎨 Form Builder v2 (Sürükle & Bırak)',
          onClick: () => navigate({ to: '/form-builder' })
        },
        {
          label: 'Şablon & Kategori Yönetimi',
          onClick: () => navigate({ to: '/degiskenler' })
        },
        {
          label: 'Şablon Listesi ve Süreçler',
          onClick: () => navigate({ to: '/taslakyonetim' })
        },
        {
          label: 'Toplu İçe Aktarma',
          onClick: () => navigate({ to: '/import' })
        },
        {
          label: 'Raporlar',
          onClick: () => navigate({ to: '/raporlar' })
        },
        {
          label: '📋 Notlar & Yapılacaklar Listesi (To-Do)',
          onClick: () => navigate({ to: '/notlar' })
        },
        { divider: true },
        {
          label: 'Arayüzü Yenile (Ctrl+R)',
          onClick: () => window.location.reload()
        },
        {
          label: 'Geliştirici Araçları (DevTools)',
          onClick: () =>
            window.electron?.ipcRenderer.send('window-toggle-devtools')
        },
        {
          label: 'Test Verisi Tohumla (Dev Seed)',
          onClick: () =>
            navigate({ to: '/ayarlar', search: { tab: 'developer' } as any })
        },
        { divider: true },
        {
          label: 'Kullanım Kılavuzu & Yardım',
          onClick: () => navigate({ to: '/yardim' })
        },
        {
          label: 'Sürüm Notları (Changelog)',
          onClick: () => navigate({ to: '/changelog' })
        },
        {
          label: 'Hakkında...',
          onClick: () =>
            alert(
              'TEMİN 360\nKamu Harcama, İhale, Doğrudan Temin ve Hakediş Yönetim Sistemi'
            )
        }
      ]
    }
  ]

  const maxVisibleMenus = (() => {
    if (windowWidth >= 1520) return 7
    if (windowWidth >= 1340) return 5
    if (windowWidth >= 1180) return 4
    if (windowWidth >= 1020) return 3
    return 2
  })()

  const visibleMenus = menus.slice(0, maxVisibleMenus)
  const overflowMenus = menus.slice(maxVisibleMenus)

  return (
    <header
      className="flex flex-col bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shrink-0 z-50 shadow-xs transition-all duration-300 relative select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Üst Vurgu Çizgisi: Seçilen moda göre şık renk tonu */}
      <div
        className={`h-0.5 w-full transition-all duration-500 bg-linear-to-r ${
          isDt
            ? 'from-blue-500 via-sky-400 to-indigo-500'
            : 'from-indigo-600 via-purple-500 to-pink-500'
        }`}
      />

      {/* Geçiş Bildirimi Toast (Mikro Bildirim) */}
      {switchFeedback && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-200 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 text-xs font-semibold shadow-xl border border-slate-700/50 dark:border-slate-300/50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{switchFeedback}</span>
        </div>
      )}

      {/* ÜST SATIR: Menü Çubuğu, Mod Switcher ve Sistem/Pencere Kontrolleri */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-slate-200/40 dark:border-slate-800/40 relative z-40">
        {/* SOL: VS Code-Style Responsive Menu Bar */}
        <NativeMenuBar
          visibleMenus={visibleMenus}
          overflowMenus={overflowMenus}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          hoveredSubMenu={hoveredSubMenu}
          setHoveredSubMenu={setHoveredSubMenu}
          isDt={isDt}
          logo={institutionLogo || logoLeft}
        />

        {/* ORTA: Excel / Ofis Tarzı Çalışma Dosyası Başlığı ve Kayıt Durumu */}
        <DirtySummaryPopover
          fileName={fileName}
          isDirty={isDirty}
          saveFeedback={saveFeedback}
          isDirtySummaryOpen={isDirtySummaryOpen}
          toggleDirtySummary={toggleDirtySummary}
          dirtySummaryRef={dirtySummaryRef}
          dirtySummary={dirtySummary}
          isLoadingSummary={isLoadingSummary}
          handleSaveAndSync={handleSaveAndSync}
          setIsDirtySummaryOpen={setIsDirtySummaryOpen}
        />

        {/* SAĞ: Mod Geçiş Switch'i + Sistem Kontrolleri */}
        <HeaderActions
          theme={theme}
          setTheme={setTheme}
          navigate={navigate}
          updateStatus={updateStatus}
          setShowUpdateModal={setShowUpdateModal}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        {/* Pencere Kontrolleri */}
        <WindowControls />
      </div>

      {/* ALT SATIR: Çalışma Dosyası Seçimi, Mod Rozeti & Süreç Butonları */}
      <HeaderBottomRow
        isDt={isDt}
        handleModeChange={handleModeChange}
        activeDosyaId={activeDosyaId}
      />

      {saveFeedback && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full shadow-lg text-xs font-medium bg-slate-900/95 dark:bg-slate-800 text-white backdrop-blur border border-slate-700 flex items-center gap-2 pointer-events-none transition-all duration-300">
          <span>{saveFeedback}</span>
        </div>
      )}

      <FormatUpgradeModal
        isOpen={showFormatUpgradeModal}
        filePath={upgradeFilePath}
        onClose={() => setShowFormatUpgradeModal(false)}
        onUpgradeAndOpen={handleUpgradeAndOpen}
      />

      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        version={updateStatus?.version}
        status={updateStatus?.status}
      />
    </header>
  )
}
