import { create } from 'zustand'

interface SettingsState {
  activeKurumId: number
  setActiveKurumId: (id: number) => void
  institutionName: string
  institutionLogo: string | null
  logoLeft: string | null
  logoRight: string | null
  showLogoLeft: boolean
  showLogoRight: boolean
  adminName: string
  adminTitle: string
  adminUsername: string
  eButceKodu: string
  say2000iKodu: string
  detsisKodu: string
  themeLightVars: string
  themeDarkVars: string
  limitType: string
  finansmanKodu: string
  institutionType: string
  subInstitutionType: string
  customSubInstitutionLabel: string
  customSubInstitutionKurumumuz: string
  customSubInstitutionKurumunuz: string
  customSubInstitutionKurumu: string
  customSubInstitutionKurumlari: string
  kurumsalKod: string
  fonksiyonelKod: string
  muhasebeBirimKodu: string
  muhasebeBirimAdi: string
  harcamaBirimKodu: string
  harcamaBirimAdi: string
  setSubInstitutionType: (type: string) => void
  ekapDonemKurali: string
  isDisclaimerAccepted: boolean
  disableDocumentGuidance: boolean
  setDisableDocumentGuidance: (val: boolean) => void
  unifiedStepperMode: boolean
  setUnifiedStepperMode: (val: boolean) => void
  setInstitutionName: (name: string) => void
  setInstitutionLogo: (logo: string | null) => void
  setAdminName: (name: string) => void
  setAdminTitle: (title: string) => void
  setAdminUsername: (username: string) => void
  setEButceKodu: (code: string) => void
  setSay2000iKodu: (code: string) => void
  setDetsisKodu: (code: string) => void
  setThemeLightVars: (vars: string) => void
  setThemeDarkVars: (vars: string) => void
  setLimitType: (limitType: string) => void
  setFinansmanKodu: (finansmanKodu: string) => void
  setInstitutionType: (type: string) => void
  setKurumsalKod: (val: string) => void
  setFonksiyonelKod: (val: string) => void
  setMuhasebeBirimKodu: (val: string) => void
  setMuhasebeBirimAdi: (val: string) => void
  setHarcamaBirimKodu: (val: string) => void
  setHarcamaBirimAdi: (val: string) => void
  disclaimerHistory: string
  setDisclaimerHistory: (history: string) => void
  setDisclaimerAccepted: (val: boolean) => void
  setShowLogoLeft: (val: boolean) => void
  setShowLogoRight: (val: boolean) => void
  isAiConfigured: boolean
  aiProvider: string
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  activeKurumId: 1,
  setActiveKurumId: (id) => set({ activeKurumId: id }),
  institutionName: 'Kurum Bilgisi Bekleniyor...',
  institutionLogo: null,
  logoLeft: null,
  logoRight: null,
  showLogoLeft: true,
  showLogoRight: true,
  adminName: 'Sistem Yöneticisi',
  adminTitle: 'Destek Sorumlusu',
  adminUsername: 'admin',
  eButceKodu: '',
  say2000iKodu: '',
  detsisKodu: '',
  themeLightVars: '',
  themeDarkVars: '',
  limitType: 'diger',
  finansmanKodu: '5',
  institutionType: '',
  subInstitutionType: 'belediye',
  customSubInstitutionLabel: '',
  customSubInstitutionKurumumuz: '',
  customSubInstitutionKurumunuz: '',
  customSubInstitutionKurumu: '',
  customSubInstitutionKurumlari: '',
  kurumsalKod: '',
  fonksiyonelKod: '',
  muhasebeBirimKodu: '',
  muhasebeBirimAdi: '',
  harcamaBirimKodu: '',
  harcamaBirimAdi: '',
  ekapDonemKurali: '',
  isDisclaimerAccepted: false,
  disableDocumentGuidance: true,
  unifiedStepperMode: true,
  disclaimerHistory: '[]',
  isAiConfigured: false,
  aiProvider: 'gemini',
  setDisableDocumentGuidance: (val) => set({ disableDocumentGuidance: val }),
  setUnifiedStepperMode: (val) => set({ unifiedStepperMode: val }),
  setShowLogoLeft: (val) => set({ showLogoLeft: val }),
  setShowLogoRight: (val) => set({ showLogoRight: val }),
  setInstitutionName: (name) => set({ institutionName: name }),
  setInstitutionLogo: (logo) => set({ institutionLogo: logo }),
  setAdminName: (name) => set({ adminName: name }),
  setAdminTitle: (title) => set({ adminTitle: title }),
  setAdminUsername: (username) => set({ adminUsername: username }),
  setEButceKodu: (code) => set({ eButceKodu: code }),
  setSay2000iKodu: (code) => set({ say2000iKodu: code }),
  setDetsisKodu: (code) => set({ detsisKodu: code }),
  setThemeLightVars: (vars) => set({ themeLightVars: vars }),
  setThemeDarkVars: (vars) => set({ themeDarkVars: vars }),
  setLimitType: (limitType) => set({ limitType }),
  setFinansmanKodu: (finansmanKodu) => set({ finansmanKodu }),
  setInstitutionType: (type) => set({ institutionType: type }),
  setSubInstitutionType: (type) => set({ subInstitutionType: type }),
  setKurumsalKod: (val) => set({ kurumsalKod: val }),
  setFonksiyonelKod: (val) => set({ fonksiyonelKod: val }),
  setMuhasebeBirimKodu: (val) => set({ muhasebeBirimKodu: val }),
  setMuhasebeBirimAdi: (val) => set({ muhasebeBirimAdi: val }),
  setHarcamaBirimKodu: (val) => set({ harcamaBirimKodu: val }),
  setHarcamaBirimAdi: (val) => set({ harcamaBirimAdi: val }),
  setEkapDonemKurali: (val) => set({ ekapDonemKurali: val }),
  setDisclaimerHistory: (history) => set({ disclaimerHistory: history }),
  setDisclaimerAccepted: (val) => set({ isDisclaimerAccepted: val }),
  loadSettings: async () => {
    try {
      const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
      const aiProvider = settings.ai_provider || 'gemini'
      const activeAiKey =
        aiProvider === 'gemini'
          ? settings.ai_gemini_api_key
          : aiProvider === 'openai'
            ? settings.ai_openai_api_key
            : settings.ai_anthropic_api_key
      const isAiConfigured = Boolean(
        activeAiKey?.trim() ||
        settings.ai_gemini_api_key?.trim() ||
        settings.ai_openai_api_key?.trim() ||
        settings.ai_anthropic_api_key?.trim()
      )

      set({
        activeKurumId: parseInt(settings.activeKurumId || '1', 10) || 1,
        institutionName: settings.institutionName || 'Kurum Adı Bulunamadı',
        institutionLogo: settings.institutionLogo || null,
        logoLeft: settings.logoLeft || null,
        logoRight: settings.logoRight || null,
        showLogoLeft: settings.showLogoLeft !== 'false',
        showLogoRight: settings.showLogoRight !== 'false',
        adminName: settings.adminName || 'Sistem Yöneticisi',
        adminTitle: settings.adminTitle || 'Destek Sorumlusu',
        adminUsername: settings.adminUsername || 'admin',
        eButceKodu: settings.eButceKodu || '',
        say2000iKodu: settings.say2000iKodu || '',
        detsisKodu: settings.detsisKodu || '',
        themeLightVars: settings.themeLightVars || '',
        themeDarkVars: settings.themeDarkVars || '',
        limitType: settings.limitType || 'diger',
        finansmanKodu: settings.finansmanKodu || '5',
        institutionType: settings.institutionType || '',
        subInstitutionType: settings.subInstitutionType || 'belediye',
        customSubInstitutionLabel: settings.customSubInstitutionLabel || '',
        customSubInstitutionKurumumuz: settings.customSubInstitutionKurumumuz || '',
        customSubInstitutionKurumunuz: settings.customSubInstitutionKurumunuz || '',
        customSubInstitutionKurumu: settings.customSubInstitutionKurumu || '',
        customSubInstitutionKurumlari: settings.customSubInstitutionKurumlari || '',
        kurumsalKod: settings.kurumsalKod || '',
        fonksiyonelKod: settings.fonksiyonelKod || '',
        muhasebeBirimKodu: settings.muhasebeBirimKodu || '',
        muhasebeBirimAdi: settings.muhasebeBirimAdi || '',
        harcamaBirimKodu: settings.harcamaBirimKodu || '',
        harcamaBirimAdi: settings.harcamaBirimAdi || '',
        ekapDonemKurali: settings.ekapDonemKurali || '',
        disableDocumentGuidance: settings.disableDocumentGuidance !== 'false',
        disclaimerHistory: settings.disclaimerHistory || '[]',
        isAiConfigured,
        aiProvider
        // isDisclaimerAccepted is intentionally not loaded from DB to show it on every app launch
      })
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error)
      set({
        institutionName: 'Kurum Adı Bulunamadı',
        institutionLogo: null,
        logoLeft: null,
        logoRight: null,
        showLogoLeft: true,
        showLogoRight: true,
        adminName: 'Sistem Yöneticisi',
        adminTitle: 'Destek Sorumlusu',
        adminUsername: 'admin',
        eButceKodu: '',
        say2000iKodu: '',
        detsisKodu: '',
        themeLightVars: '',
        themeDarkVars: '',
        limitType: 'diger',
        finansmanKodu: '5',
        institutionType: '',
        subInstitutionType: 'belediye',
        customSubInstitutionLabel: '',
        customSubInstitutionKurumumuz: '',
        customSubInstitutionKurumunuz: '',
        customSubInstitutionKurumu: '',
        customSubInstitutionKurumlari: '',
        kurumsalKod: '',
        fonksiyonelKod: '',
        muhasebeBirimKodu: '',
        muhasebeBirimAdi: '',
        harcamaBirimKodu: '',
        harcamaBirimAdi: '',
        ekapDonemKurali: '',
        disableDocumentGuidance: true,
        disclaimerHistory: '[]',
        isDisclaimerAccepted: false,
        isAiConfigured: false,
        aiProvider: 'gemini'
      })
    }
  }
}))
