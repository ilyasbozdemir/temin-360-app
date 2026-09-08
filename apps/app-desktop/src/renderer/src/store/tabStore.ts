import { create } from 'zustand'
import { useSettingsStore } from './settingsStore'
import { APP_ROUTES } from '@renderer/constants/routeConstants'

export interface TabItem {
  path: string
  label: string
}

interface TabState {
  tabs: TabItem[]
  activeTabPath: string
  addTab: (path: string) => void
  closeTab: (path: string) => string | null // Returns the next path to navigate to, if any
  setActiveTab: (path: string) => void
  updateTabLabel: (path: string, label: string) => void
  clearTabs: () => void
  clearDosyaTabs: () => void
}

export function normalizePath(rawPath: string): string {
  if (!rawPath) return '/'
  let p = rawPath
  if (p.includes('#')) {
    const parts = p.split('#')
    p = parts[1] || '/'
  }
  if (!p.startsWith('/')) p = '/' + p
  return p
}

export function getTabLabel(fullPath: string): string {
  const path = normalizePath(fullPath).split('?')[0]
  if (path === APP_ROUTES.DASHBOARD) return 'Gösterge Paneli'
  if (path === APP_ROUTES.YENI_DOSYA) return 'Yeni Doğrudan Temin Dosyası'
  if (path.startsWith(APP_ROUTES.DOSYALAR)) return 'Doğrudan Temin'
  if (path.startsWith(APP_ROUTES.FIRMALAR)) return 'Firmalar'
  if (path.startsWith(APP_ROUTES.PERSONEL)) return 'Personel Yönetimi'
  if (path.startsWith(APP_ROUTES.MEVZUAT)) return 'Mevzuat & Limitler'
  if (path.startsWith(APP_ROUTES.AYARLAR)) return 'Ayarlar'
  if (path.startsWith(APP_ROUTES.BIRIMLER)) return 'Birim Yönetimi'
  if (path.startsWith(APP_ROUTES.AMBAR)) return 'Ambar Tanımları'
  if (path.startsWith(APP_ROUTES.YENI_MALZEME)) return 'Yeni Kayıt (Mal/Hizmet/Yapım İşi)'
  if (path.startsWith(APP_ROUTES.MALZEMELER)) return 'Kayıtlı Mal / Hizmet / Yapım İşleri Listesi'
  if (path.startsWith(APP_ROUTES.KURUM)) {
    const query = fullPath.split('?')[1] || ''
    const searchParams = new URLSearchParams(query)
    const tab = searchParams.get('tab')
    if (tab === 'mali') return 'Mali ve Bütçe Kodları'
    if (tab === 'iletisim') return 'İletişim & Konum'
    if (tab === 'logolar') return 'Kurum Logoları'
    return 'İdari Bilgiler'
  }
  if (path.startsWith(APP_ROUTES.OLCU_BIRIMLERI)) return 'Ölçü Birimleri'
  if (path.startsWith(APP_ROUTES.PROFIL)) return 'Kullanıcı Profili'
  if (path.startsWith(APP_ROUTES.HAZIRLIK_VE_IHTIYAC)) return '1. İhtiyaç Listesi & Maliyet & Onay'
  if (path.startsWith(APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI))
    return '2. Teklifler & Piyasa Fiyat Araştırması'
  if (path.startsWith(APP_ROUTES.SIPARIS_VE_SOZLESME)) return '3. Sipariş & Sözleşme'
  if (path.startsWith(APP_ROUTES.KABUL_VE_ODEME)) return '4. Muayene & Kabul & Ödeme İşlemleri'
  if (path.startsWith(APP_ROUTES.KLASOR_VE_KAPAKLAR)) return '5. Klasör & Kapaklar'
  if (path.startsWith('/dosya/malzemeler/liste')) return 'İhtiyaç Listesi'
  if (path.startsWith('/dosya/malzemeler/son-alim')) return 'Son Alım Fiyat Cetveli'
  if (path.startsWith('/dosya/luzum/talep-formu')) return 'İhtiyaç Talep Formu'
  if (path.startsWith('/dosya/luzum/belge')) return 'Lüzum Müzekkeresi'
  if (path.startsWith('/dosya/luzum/onay-eki')) return 'Onay Eki'
  if (path.startsWith('/dosya/onay/butce-sorgu')) return 'Bütçe Sorgusu'
  if (path.startsWith('/dosya/komisyon/fiyat-arastirma')) return 'Fiyat Araştırma Komisyonu'
  if (path.startsWith('/dosya/komisyon/fiyat-muayene')) return 'Fiyat Araştırma & Muayene'
  if (path.startsWith('/dosya/firmalar-maliyet/istekliler')) return 'İstekli Firmalar'
  if (path.startsWith(APP_ROUTES.YAKLASIK_MALIYET)) return 'Yaklaşık Maliyet'
  if (path.startsWith('/dosya/firmalar-maliyet/tutanak')) return 'Piyasa Araştırma Tutanağı'
  if (path.startsWith('/dosya/komisyon/onay-eki')) return 'Komisyon Atama Onay Eki'
  if (path.startsWith('/dosya/onay/dt-onay')) return 'Doğrudan Temin Onay Belgesi'
  if (path.startsWith('/dosya/onay/ihale-onay')) return 'İhale Onay Belgesi'
  if (path.startsWith('/dosya/komisyon/muayene-kabul')) return 'Muayene Kabul ve Tespit'
  if (path.startsWith('/dosya/luzum/teslim-tesellum')) return 'Teslim Tesellüm'
  if (path.startsWith('/dosya/harcama/talimat')) return 'Harcama Talimatı'
  if (path.startsWith('/dosya/harcama/pusula')) return 'Harcama Pusulası'
  if (path.startsWith(APP_ROUTES.DOSYA_CIKTI_MERKEZI)) return 'Çıktı & Üretim Merkezi'
  if (path.startsWith(APP_ROUTES.DOSYA_VERITABANI)) return 'Dosya Veritabanı Gezgini'
  if (path.startsWith(APP_ROUTES.FATURA_VE_IRSALIYE)) return 'Fatura & İrsaliye'
  if (path.startsWith(APP_ROUTES.IMZALI_BELGELER)) return 'İmzalı Belgeler'
  if (path.startsWith(APP_ROUTES.HAKEDIS)) return 'Hakediş & Süreç Yönetimi'
  if (path.startsWith(APP_ROUTES.HARCAMA_MERKEZI)) return 'Harcama Merkezi & İhale'
  if (path.startsWith(APP_ROUTES.DOSYA_DETAY)) return 'Dosya Detayları'
  if (path.startsWith(APP_ROUTES.TAKIP)) return 'Takip & Durum'
  if (path.startsWith(APP_ROUTES.RAPORLAR)) return 'Raporlar'
  if (path.startsWith(APP_ROUTES.TEMA)) return 'Tema Ayarları'
  if (path.startsWith(APP_ROUTES.TASINIR_KOD)) return 'Taşınır Kodları'
  if (path.startsWith(APP_ROUTES.OKAS_KOD)) return 'OKAS Kodları'
  if (path.startsWith(APP_ROUTES.POZLAR)) return 'Birim Fiyat Pozları'
  if (path.startsWith(APP_ROUTES.SABLONLAR)) return 'Şablon Yönetimi'
  if (path.startsWith(APP_ROUTES.DEGISKENLER)) return 'Şablon Değişkenleri'
  if (path.startsWith(APP_ROUTES.KOMISYON_DETAY)) return 'Komisyon Detayı'
  if (path.startsWith(APP_ROUTES.KOMISYONLAR)) return 'Komisyon Yönetimi'
  if (path.startsWith(APP_ROUTES.KOMISYON_GOREVLERI)) return 'Görev Tanımları'
  if (path.startsWith(APP_ROUTES.TASLAK_YONETIM)) return 'Süreç Taslakları'
  if (path.startsWith(APP_ROUTES.CHANGELOG)) return 'Sürüm Notları'
  if (path.startsWith(APP_ROUTES.YARDIM)) return 'Yardım & Kılavuzlar'
  if (path.startsWith(APP_ROUTES.IMPORT)) return 'Toplu Veri İçe Aktarma'
  if (path.startsWith(APP_ROUTES.HIZLI_DOSYA_EKLE)) return 'Hızlı Dosya Ekle'
  if (path.startsWith(APP_ROUTES.CIKTI_MERKEZI_DASHBOARD)) return 'Çıktı & Üretim Merkezi'
  if (path.startsWith(APP_ROUTES.DT_SUREC_AKISI)) return 'Doğrudan Temin'
  return 'Yeni Sekme'
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [{ path: APP_ROUTES.DASHBOARD, label: 'Gösterge Paneli' }],
  activeTabPath: APP_ROUTES.DASHBOARD,

  addTab: (rawPath) => {
    const path = normalizePath(rawPath)
    if (!path || path.startsWith('/launcher') || path.startsWith('/lockscreen')) return

    const { tabs } = get()

    // Check if the new path belongs to the Kurum family
    const cleanPath = path.split('?')[0]
    const isKurumFamily = [
      APP_ROUTES.BIRIMLER,
      APP_ROUTES.PERSONEL,
      APP_ROUTES.KOMISYONLAR,
      APP_ROUTES.KOMISYON_GOREVLERI,
      APP_ROUTES.KURUM
    ].includes(cleanPath as any)

    if (isKurumFamily) {
      // Find if there is already a tab in the Kurum family
      const existingKurumIndex = tabs.findIndex((t) => {
        const tClean = t.path.split('?')[0]
        return [
          APP_ROUTES.BIRIMLER,
          APP_ROUTES.PERSONEL,
          APP_ROUTES.KOMISYONLAR,
          APP_ROUTES.KOMISYON_GOREVLERI,
          APP_ROUTES.KURUM
        ].includes(tClean as any)
      })

      if (existingKurumIndex > -1) {
        // Aynı path'e zaten aktifse sadece activeTabPath güncelle
        if (tabs[existingKurumIndex].path === path) {
          set({ activeTabPath: path })
          return
        }
        // If it exists, replace its path and label
        const updatedTabs = [...tabs]
        const label = getTabLabel(path)
        updatedTabs[existingKurumIndex] = { path, label }
        set({ tabs: updatedTabs, activeTabPath: path })
        return
      }
    }

    const { unifiedStepperMode } = useSettingsStore.getState()
    const isDosyaAsamasiPath = [
      APP_ROUTES.HAZIRLIK_VE_IHTIYAC,
      APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI,
      APP_ROUTES.SIPARIS_VE_SOZLESME,
      APP_ROUTES.KABUL_VE_ODEME,
      APP_ROUTES.KLASOR_VE_KAPAKLAR
    ].some((p) => cleanPath.startsWith(p))

    if (unifiedStepperMode && isDosyaAsamasiPath) {
      const existingDosyaIndex = tabs.findIndex((t) => {
        const tClean = t.path.split('?')[0]
        return [
          APP_ROUTES.HAZIRLIK_VE_IHTIYAC,
          APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI,
          APP_ROUTES.SIPARIS_VE_SOZLESME,
          APP_ROUTES.KABUL_VE_ODEME,
          APP_ROUTES.KLASOR_VE_KAPAKLAR
        ].some((p) => tClean.startsWith(p))
      })

      if (existingDosyaIndex > -1) {
        // Aynı path'e zaten aktifse sadece activeTabPath güncelle
        if (tabs[existingDosyaIndex].path === path) {
          set({ activeTabPath: path })
          return
        }
        const updatedTabs = [...tabs]
        const label = getTabLabel(path)
        updatedTabs[existingDosyaIndex] = { path, label }
        set({ tabs: updatedTabs, activeTabPath: path })
        return
      }
    }

    const exists = tabs.some((t) => t.path === path)

    if (!exists) {
      const label = getTabLabel(path)
      // Savunma: duplicate path olmamasını garantile (key çakışması engeli)
      const uniqueTabs = tabs.filter((t) => t.path !== path)
      const newTabs = [...uniqueTabs, { path, label }]
      set({ tabs: newTabs, activeTabPath: path })
    } else {
      set({ activeTabPath: path })
    }
  },

  closeTab: (path) => {
    if (path === APP_ROUTES.DASHBOARD) return null

    const { tabs, activeTabPath } = get()
    const newTabs = tabs.filter((t) => t.path !== path)

    let nextPath: string | null = null

    if (activeTabPath === path) {
      if (newTabs.length > 0) {
        const index = tabs.findIndex((t) => t.path === path)
        const nextIndex = Math.max(0, index - 1)
        nextPath = newTabs[nextIndex].path
      } else {
        nextPath = APP_ROUTES.DASHBOARD
        newTabs.push({ path: APP_ROUTES.DASHBOARD, label: 'Gösterge Paneli' })
      }
    }

    set({ tabs: newTabs, activeTabPath: nextPath || activeTabPath })
    return nextPath
  },

  setActiveTab: (path) => {
    set({ activeTabPath: path })
  },

  updateTabLabel: (path, label) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.path === path ? { ...t, label } : t))
    }))
  },

  clearTabs: () => {
    set({
      tabs: [{ path: APP_ROUTES.DASHBOARD, label: 'Gösterge Paneli' }],
      activeTabPath: APP_ROUTES.DASHBOARD
    })
  },

  clearDosyaTabs: () => {
    const { tabs, activeTabPath } = get()
    const newTabs = tabs.filter(
      (t) => !t.path.startsWith(`${APP_ROUTES.DOSYA_DETAY}/`) && t.path !== APP_ROUTES.DOSYA_DETAY
    )
    if (newTabs.length === 0) {
      newTabs.push({ path: APP_ROUTES.DASHBOARD, label: 'Gösterge Paneli' })
    }
    const isActiveTabCleared = !newTabs.some((t) => t.path === activeTabPath)
    set({
      tabs: newTabs,
      activeTabPath: isActiveTabCleared ? newTabs[0].path : activeTabPath
    })
  }
}))
