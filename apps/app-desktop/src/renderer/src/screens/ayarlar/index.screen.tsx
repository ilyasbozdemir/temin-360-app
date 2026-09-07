import React, { useEffect, useState } from 'react'
import { useAyarlarHooks } from './ayarlar.hooks'
import { menuItems } from './ayarlar.constants'
import { Button } from '../../components/ui/Button'
import { useSettingsStore } from '../../store/settingsStore'
import { Save, Settings } from 'lucide-react'
import { InnerMenu, InnerMenuItem } from '../../components/ui/InnerMenu'
import TemaScreen from './TemaScreen'
import { useLocation } from '@tanstack/react-router'

// Subcomponents
import { SmtpTab } from './components/SmtpTab'
import { DatabaseArchiveTab } from './components/DatabaseArchiveTab'
import { DeveloperTab } from './components/DeveloperTab'
import { AiTab } from './components/AiTab'
import { SyncTab } from './components/SyncTab'
import { GenelTab } from './components/GenelTab'
import { SupabaseTab } from './components/SupabaseTab'

type TabType = 'genel' | 'smtp' | 'tema' | 'developer' | 'ai' | 'archive' | 'sync' | 'supabase'

export default function AyarlarScreen(): React.ReactNode {
  const { settings, isLoadingSettings, saveSettings, importSmtp, exportSmtp } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()

  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as TabType
    if (
      tabParam === 'genel' ||
      tabParam === 'smtp' ||
      tabParam === 'tema' ||
      tabParam === 'developer' ||
      tabParam === 'ai' ||
      tabParam === 'archive' ||
      tabParam === 'sync' ||
      tabParam === 'supabase'
    ) {
      return tabParam
    }
    return 'genel'
  })

  const params = new URLSearchParams(location.search as any)
  const currentTabParam = params.get('tab') as TabType
  useEffect(() => {
    if (
      currentTabParam === 'genel' ||
      currentTabParam === 'smtp' ||
      currentTabParam === 'tema' ||
      currentTabParam === 'developer' ||
      currentTabParam === 'ai' ||
      currentTabParam === 'archive' ||
      currentTabParam === 'sync' ||
      currentTabParam === 'supabase'
    ) {
      setActiveTab(currentTabParam)
    }
  }, [currentTabParam])


  const [saving, setSaving] = useState(false)

  // Tab: SMTP Ayarları
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [showSmtpPass, setShowSmtpPass] = useState(false)
  const [smtpSecure, setSmtpSecure] = useState(false)

  // Tab: Genel
  const [disableDocumentGuidance, setDisableDocumentGuidance] = useState(true)
  const [unifiedStepperMode, setUnifiedStepperMode] = useState(true)

  // Tab: Geliştirici Ayarları
  const [devUpdateTestMode, setDevUpdateTestMode] = useState(false)
  const [devUpdateVersion, setDevUpdateVersion] = useState('')
  const [githubReleases, setGithubReleases] = useState<string[]>([])

  // Tab: Yapay Zeka
  const [aiProvider, setAiProvider] = useState('gemini')
  const [aiGeminiApiKey, setAiGeminiApiKey] = useState('')
  const [aiOpenaiApiKey, setAiOpenaiApiKey] = useState('')
  const [aiAnthropicApiKey, setAiAnthropicApiKey] = useState('')
  const [aiTestStatus, setAiTestStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [aiTestMsg, setAiTestMsg] = useState('')

  const [isPackaged, setIsPackaged] = useState(false)

  // Tab: Arşiv
  const [archiveYear, setArchiveYear] = useState<number>(new Date().getFullYear() - 1)
  const [isArchiving, setIsArchiving] = useState(false)

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke('app:isPackaged')
      .then((packaged: boolean) => {
        setIsPackaged(packaged)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (settings) {
      setTimeout(() => {
        setSmtpHost(settings.smtp_host || '')
        setSmtpPort(settings.smtp_port || '')
        setSmtpUser(settings.smtp_user || '')
        setSmtpPass(settings.smtp_pass || '')
        setSmtpSecure(settings.smtp_secure === 'true')

        const mode = settings.devUpdateTestMode === 'true'
        const ver = settings.devUpdateVersion || ''
        setDevUpdateTestMode(mode)
        setDevUpdateVersion(ver)
        if (window.api?.setDevVersion) {
          window.api.setDevVersion(mode, ver)
          window.dispatchEvent(new Event('app-version-changed'))
          window.electron?.ipcRenderer.invoke('updater:check')
        }

        setAiProvider(settings.ai_provider || 'gemini')
        setAiGeminiApiKey(settings.ai_gemini_api_key || '')
        setAiOpenaiApiKey(settings.ai_openai_api_key || '')
        setAiAnthropicApiKey(settings.ai_anthropic_api_key || '')

        setDisableDocumentGuidance(settings.disableDocumentGuidance !== 'false')
        setUnifiedStepperMode(settings.unifiedStepperMode !== 'false')
      }, 0)
    }
  }, [settings])

  useEffect(() => {
    if (activeTab === 'developer') {
      fetch('https://api.github.com/repos/ilyasbozdemir/temin-360-app/releases')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const versions = data.map((r: any) => r.tag_name.replace(/^v/, ''))
            setGithubReleases(versions)
          }
        })
        .catch(console.error)
    }
  }, [activeTab])

  // Sağlayıcıya göre aktif API anahtarını döndür
  const getActiveApiKey = (): string => {
    if (aiProvider === 'gemini') return aiGeminiApiKey
    if (aiProvider === 'openai') return aiOpenaiApiKey
    if (aiProvider === 'anthropic') return aiAnthropicApiKey
    return ''
  }

  const handleTestConnection = async (): Promise<void> => {
    const key = getActiveApiKey()
    if (!key) {
      setAiTestStatus('error')
      setAiTestMsg('Lütfen önce API anahtarını girin.')
      return
    }
    setAiTestStatus('loading')
    setAiTestMsg('')
    try {
      const res = await (window as any).api.aiTest(aiProvider, key)
      if (res.success) {
        setAiTestStatus('ok')
        setAiTestMsg('Bağlantı başarılı! ✓')
      } else {
        setAiTestStatus('error')
        setAiTestMsg(res.error || 'Bağlantı başarısız.')
      }
    } catch {
      setAiTestStatus('error')
      setAiTestMsg('Beklenmeyen bir hata oluştu.')
    }
  }

  const handleImportSmtp = async (): Promise<void> => {
    try {
      await importSmtp()
      alert('SMTP Ayarları başarıyla içe aktarıldı.')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (errorMsg !== 'İptal edildi') {
        alert('İçe aktarma hatası: ' + errorMsg)
      }
    }
  }

  const handleExportSmtp = async (): Promise<void> => {
    try {
      await exportSmtp()
      alert('SMTP Ayarları başarıyla dışa aktarıldı.')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (errorMsg !== 'İptal edildi') {
        alert('Dışa aktarma hatası: ' + errorMsg)
      }
    }
  }

  const handleSaveTab = async (tab: TabType): Promise<void> => {
    if (
      tab !== 'genel' &&
      tab !== 'smtp' &&
      tab !== 'developer' &&
      tab !== 'ai' &&
      tab !== 'sync'
    ) {
      return
    }
    setSaving(true)
    try {
      const dataToSave: Record<string, string> = {}

      if (tab === 'genel') {
        dataToSave.disableDocumentGuidance = disableDocumentGuidance ? 'true' : 'false'
        dataToSave.unifiedStepperMode = unifiedStepperMode ? 'true' : 'false'
      } else if (tab === 'smtp') {
        dataToSave.smtp_host = smtpHost
        dataToSave.smtp_port = smtpPort
        dataToSave.smtp_user = smtpUser
        dataToSave.smtp_pass = smtpPass
        dataToSave.smtp_secure = smtpSecure ? 'true' : 'false'
      } else if (tab === 'developer') {
        dataToSave.devUpdateTestMode = devUpdateTestMode ? 'true' : 'false'
        dataToSave.devUpdateVersion = devUpdateVersion
        if (window.api?.setDevVersion) {
          window.api.setDevVersion(devUpdateTestMode, devUpdateVersion)
          window.dispatchEvent(new Event('app-version-changed'))
          window.electron?.ipcRenderer.invoke('updater:check')
        }
      } else if (tab === 'ai') {
        dataToSave.ai_provider = aiProvider
        dataToSave.ai_gemini_api_key = aiGeminiApiKey
        dataToSave.ai_openai_api_key = aiOpenaiApiKey
        dataToSave.ai_anthropic_api_key = aiAnthropicApiKey
      }

      await saveSettings(dataToSave)
      await reloadSettingsStore()
      alert('Ayarlar başarıyla kaydedildi.')
    } catch {
      alert('Kaydetme hatası!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Settings className="w-8 h-8 text-blue-605" />
            Sistem Ayarları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            SMTP sunucu ve tema ayarlarını yönetin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL MENÜ (DİKEY SEKME LİSTESİ) */}
        <InnerMenu
          className="lg:col-span-3"
          items={menuItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabType)}
        />

        {/* SAĞ PANEL (İÇERİK ALANI) */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col justify-between">
          {isLoadingSettings ? (
            <div className="flex items-center justify-center flex-1 text-slate-500">
              Yükleniyor...
            </div>
          ) : activeTab === 'tema' ? (
            <TemaScreen isEmbedded={true} />
          ) : (
            <>
              <div className="space-y-6">
                {activeTab === 'genel' && (
                  <GenelTab
                    disableDocumentGuidance={disableDocumentGuidance}
                    setDisableDocumentGuidance={setDisableDocumentGuidance}
                    unifiedStepperMode={unifiedStepperMode}
                    setUnifiedStepperMode={setUnifiedStepperMode}
                  />
                )}

                {activeTab === 'smtp' && (
                  <SmtpTab
                    smtpHost={smtpHost}
                    setSmtpHost={setSmtpHost}
                    smtpPort={smtpPort}
                    setSmtpPort={setSmtpPort}
                    smtpUser={smtpUser}
                    setSmtpUser={setSmtpUser}
                    smtpPass={smtpPass}
                    setSmtpPass={setSmtpPass}
                    showSmtpPass={showSmtpPass}
                    setShowSmtpPass={setShowSmtpPass}
                    smtpSecure={smtpSecure}
                    setSmtpSecure={setSmtpSecure}
                    handleImportSmtp={handleImportSmtp}
                    handleExportSmtp={handleExportSmtp}
                  />
                )}

                {activeTab === 'archive' && (
                  <DatabaseArchiveTab
                    archiveYear={archiveYear}
                    setArchiveYear={setArchiveYear}
                    isArchiving={isArchiving}
                    setIsArchiving={setIsArchiving}
                  />
                )}

                {activeTab === 'developer' && (
                  <DeveloperTab
                    isPackaged={isPackaged}
                    devUpdateTestMode={devUpdateTestMode}
                    setDevUpdateTestMode={setDevUpdateTestMode}
                    devUpdateVersion={devUpdateVersion}
                    setDevUpdateVersion={setDevUpdateVersion}
                    githubReleases={githubReleases}
                  />
                )}

                {activeTab === 'ai' && (
                  <AiTab
                    aiProvider={aiProvider}
                    setAiProvider={setAiProvider}
                    aiGeminiApiKey={aiGeminiApiKey}
                    setAiGeminiApiKey={setAiGeminiApiKey}
                    aiOpenaiApiKey={aiOpenaiApiKey}
                    setAiOpenaiApiKey={setAiOpenaiApiKey}
                    aiAnthropicApiKey={aiAnthropicApiKey}
                    setAiAnthropicApiKey={setAiAnthropicApiKey}
                    aiTestStatus={aiTestStatus}
                    setAiTestStatus={setAiTestStatus}
                    aiTestMsg={aiTestMsg}
                    setAiTestMsg={setAiTestMsg}
                    handleTestConnection={handleTestConnection}
                  />
                )}

                {activeTab === 'sync' && <SyncTab />}

                {activeTab === 'supabase' && <SupabaseTab />}
              </div>

              {/* SEKMEYİ KAYDET BUTONU */}
              {activeTab !== 'archive' && activeTab !== 'sync' && activeTab !== 'supabase' && (
                <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                  <Button
                    onClick={() => handleSaveTab(activeTab)}
                    disabled={saving}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2 px-5 text-sm font-semibold transition-all shadow-md shadow-primary/20"
                  >
                    <Save className="w-4 h-4" /> Sekme Ayarlarını Kaydet
                  </Button>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  )
}
