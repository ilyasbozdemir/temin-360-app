import { NavigateFn } from '@tanstack/react-router'
import { HeaderMenu } from './header.types'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { getDogrudanTeminMenus } from './headerNavDogrudanTemin'
import { getDevletIhale2886Menus } from './headerNavDevletIhale'
import { getIhaleMenus } from './headerNavIhale'
import { getSistemTanimlariMenu } from './headerNavSistemTanimlari'

export interface HeaderNavigationOptions {
  navigate: NavigateFn
  procurementMode: 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'
  activeDosyaId: number | null
  isOldFormat: boolean
  handleSaveAndSync: () => Promise<void>
  handleCloseWorkspace: () => Promise<void>
  handleClose: () => void
  setUpgradeFilePath: (path: string) => void
  setShowFormatUpgradeModal: (show: boolean) => void
  setShowAboutModal: (show: boolean) => void
}

export function getHeaderMenus(opts: HeaderNavigationOptions): HeaderMenu[] {
  const {
    navigate,
    procurementMode,
    activeDosyaId,
    isOldFormat,
    handleSaveAndSync,
    handleCloseWorkspace,
    handleClose,
    setUpgradeFilePath,
    setShowFormatUpgradeModal,
    setShowAboutModal
  } = opts

  return [
    {
      name: 'Dosya',
      items: [
        { label: 'Gösterge Paneli', onClick: (): Promise<void> => navigate({ to: '/' }) },
        {
          label: 'Yeni Doğrudan Temin Dosyası',
          onClick: (): Promise<void> => navigate({ to: '/dosyalar/yeni' })
        },
        {
          label: 'Çalışma Dosyası Detayları (.temin)',
          onClick: (): Promise<void> => navigate({ to: '/dosya' })
        },
        { label: "💾 Değişiklikleri Kaydet & Drive'a Gönder (Ctrl+S)", onClick: handleSaveAndSync },
        {
          label: '💾 Farklı Kaydet (Yeni Format .temin)...',
          onClick: async (): Promise<void> => {
            try {
              const res = await window.electron?.ipcRenderer.invoke('workspace:save-as')
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
                onClick: async (): Promise<void> => {
                  try {
                    const res = await useWorkspaceStore.getState().upgradeToTemin()
                    if (res?.success && res.newPath) {
                      alert(
                        `Dosyanız başarıyla yeni nesil TEMİN 360 formatına (.temin) dönüştürüldü ve kaydedildi:\n\n${res.newPath}`
                      )
                      window.location.reload()
                    } else {
                      alert(`Format dönüştürülemedi!\nHata: ${res?.error || 'Bilinmeyen hata'}`)
                    }
                  } catch (e: unknown) {
                    const errorMsg = e instanceof Error ? e.message : String(e)
                    alert(`Hata: ${errorMsg}`)
                  }
                }
              }
            ]
          : []),
        { label: 'Kullanıcı Profili', onClick: (): Promise<void> => navigate({ to: '/profil' }) },
        { divider: true },
        {
          label: 'Farklı Çalışma Dosyası Aç (.temin, .dtal, .hkmp...)...',
          onClick: async (): Promise<void> => {
            try {
              const res = await window.electron?.ipcRenderer.invoke('dialog:showOpenDialog')
              if (!res?.canceled && res?.filePath) {
                const filePath = res.filePath as string
                const ext = (filePath.split('.').pop() || '').toLowerCase()
                if (ext !== 'temin') {
                  setUpgradeFilePath(filePath)
                  setShowFormatUpgradeModal(true)
                } else {
                  let result = await useWorkspaceStore.getState().openWorkspace(filePath, false)
                  if (result.requiresMigration) {
                    result = await useWorkspaceStore.getState().openWorkspace(filePath, true)
                  }
                  if (result.success) {
                    window.location.reload()
                  } else {
                    alert(`Çalışma dosyası açılamadı!\nHata: ${result.error || 'Bilinmeyen hata'}`)
                  }
                }
              }
            } catch (e) {
              console.error(e)
            }
          }
        },
        { label: 'Çalışma Dosyasını Kapat', onClick: handleCloseWorkspace },
        { divider: true },
        { label: 'Uygulamadan Çık (Alt+F4)', onClick: handleClose }
      ]
    },
    ...(procurementMode === 'dogrudan_temin'
      ? getDogrudanTeminMenus(navigate, activeDosyaId)
      : procurementMode === 'devlet_ihale_2886'
        ? getDevletIhale2886Menus(navigate)
        : getIhaleMenus(navigate, activeDosyaId)),
    getSistemTanimlariMenu(navigate, procurementMode),
    getYonetimVeYardimMenu(navigate, setShowAboutModal)
  ]
}

function getYonetimVeYardimMenu(
  navigate: NavigateFn,
  setShowAboutModal: (show: boolean) => void
): HeaderMenu {
  return {
    name: 'Yönetim & Yardım',
    items: [
      { label: 'Genel Ayarlar', onClick: (): Promise<void> => navigate({ to: '/ayarlar' }) },
      {
        label: 'Mevzuat ve Parametreler',
        onClick: (): Promise<void> =>
          navigate({ to: '/mevzuat', search: { tab: 'kutuphane' } as Record<string, string> })
      },
      {
        label: '📈 TÜİK Yİ-ÜFE Endeksleri & Değerleme',
        onClick: (): Promise<void> =>
          navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as Record<string, string> })
      },
      { label: 'Şablon Yönetimi', onClick: (): Promise<void> => navigate({ to: '/sablonlar' }) },
      {
        label: '🎨 Form Builder v2 (Sürükle & Bırak)',
        onClick: (): Promise<void> => navigate({ to: '/form-builder' })
      },
      {
        label: 'Şablon & Kategori Yönetimi',
        onClick: (): Promise<void> => navigate({ to: '/degiskenler' })
      },
      {
        label: 'Şablon Listesi ve Süreçler',
        onClick: (): Promise<void> => navigate({ to: '/taslakyonetim' })
      },
      { label: 'Toplu İçe Aktarma', onClick: (): Promise<void> => navigate({ to: '/import' }) },
      { label: 'Raporlar', onClick: (): Promise<void> => navigate({ to: '/raporlar' }) },
      {
        label: '📋 Notlar & Yapılacaklar Listesi (To-Do)',
        onClick: (): Promise<void> => navigate({ to: '/notlar' })
      },
      { divider: true },
      { label: 'Arayüzü Yenile (Ctrl+R)', onClick: (): void => window.location.reload() },
      {
        label: 'Geliştirici Araçları (DevTools)',
        onClick: (): void => window.electron?.ipcRenderer.send('window-toggle-devtools')
      },
      {
        label: 'Test Verisi Tohumla (Dev Seed)',
        onClick: (): Promise<void> =>
          navigate({ to: '/ayarlar', search: { tab: 'developer' } as Record<string, string> })
      },
      { divider: true },
      {
        label: 'Kullanım Kılavuzu & Yardım',
        onClick: (): Promise<void> => navigate({ to: '/yardim' })
      },
      {
        label: 'Sürüm Notları (Changelog)',
        onClick: (): Promise<void> => navigate({ to: '/changelog' })
      },
      { label: 'Hakkında...', onClick: (): void => setShowAboutModal(true) }
    ]
  }
}
