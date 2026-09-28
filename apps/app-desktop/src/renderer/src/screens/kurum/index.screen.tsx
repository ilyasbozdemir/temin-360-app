import React, { useState, useEffect } from 'react'
import { KurumVerisi, useKurumHooks } from './kurum.hooks'
import { Button } from '../../components/ui/Button'
import {
  Building2,
  ClipboardCheck,
  Edit3,
  Eye,
  FolderKanban,
  LayoutGrid,
  MapPin,
  Save,
  ShieldCheck,
  Users,
  Warehouse
} from 'lucide-react'
import { InnerMenu, InnerMenuItem } from '../../components/ui/InnerMenu'
import { IdariBilgilerTab } from './components/IdariBilgilerTab'
import { MaliBirimTab } from './components/MaliBirimTab'
import { IletisimTab } from './components/IletisimTab'
import { LogolarTab } from './components/LogolarTab'
import { KurumViewCard } from './components/KurumViewCard'
import { KeyValuePair, KurumMetadataManager } from './components/KurumMetadataManager'
import { useSettingsStore } from '../../store/settingsStore'

import { useRouterState } from '@tanstack/react-router'

import BirimlerScreen from '../birimler/index.screen'
import PersonelScreen from '../personel/index.screen'
import KomisyonlarScreen from '../komisyonlar/index.screen'
import KomisyonGorevleriScreen from '../komisyon-gorevleri/index.screen'
import AmbarScreen from '../ambar/index.screen'
import ProjelerScreen from '../projeler/index.screen'

type TabType =
  | 'onizleme'
  | 'idari'
  | 'mali'
  | 'iletisim'
  | 'logolar'
  | 'birimler'
  | 'personel'
  | 'komisyonlar'
  | 'komisyon-gorevleri'
  | 'ambar'
  | 'projeler'

export default function KurumScreen(): React.JSX.Element {
  const { kurumData, isLoadingKurum, fetchKurum, saveKurum } = useKurumHooks()
  const {
    institutionLogo: defaultInstitutionLogo,
    logoLeft: defaultLogoLeft,
    logoRight: defaultLogoRight,
    showLogoLeft: defaultShowLogoLeft,
    showLogoRight: defaultShowLogoRight,
    loadSettings: reloadSettingsStore
  } = useSettingsStore()

  const [saving, setSaving] = useState(false)

  const [localData, setLocalData] = useState<Partial<KurumVerisi>>({})
  const [institutionLetterhead, setInstitutionLetterhead] = useState<string[]>([])
  const [parentInstitutionLines, setParentInstitutionLines] = useState<string[]>([])
  const [customMetadata, setCustomMetadata] = useState<KeyValuePair[]>([])
  const [sozlukData, setSozlukData] = useState<any[]>([])

  const [institutionLogo, setInstitutionLogo] = useState<string | null>(defaultInstitutionLogo)
  const [logoLeft, setLogoLeft] = useState<string | null>(defaultLogoLeft)
  const [logoRight, setLogoRight] = useState<string | null>(defaultLogoRight)
  const [showLogoLeft, setShowLogoLeft] = useState<boolean>(defaultShowLogoLeft)
  const [showLogoRight, setShowLogoRight] = useState<boolean>(defaultShowLogoRight)

  // Fetch initial data
  useEffect(() => {
    fetchKurum()
  }, [fetchKurum])

  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const hashPart = window.location.hash.includes('?')
      ? window.location.hash.substring(window.location.hash.indexOf('?'))
      : ''
    const searchParams = new URLSearchParams(hashPart || window.location.search)
    const tabParam = searchParams.get('tab') as TabType
    if (
      tabParam &&
      [
        'onizleme',
        'idari',
        'mali',
        'iletisim',
        'logolar',
        'birimler',
        'personel',
        'komisyonlar',
        'komisyon-gorevleri',
        'ambar',
        'projeler'
      ].includes(tabParam)
    ) {
      return tabParam
    }
    if (pathname === '/birimler') return 'birimler'
    if (pathname === '/personel') return 'personel'
    if (pathname === '/komisyonlar') return 'komisyonlar'
    if (pathname === '/komisyon-gorevleri') return 'komisyon-gorevleri'
    if (pathname === '/ambar') return 'ambar'
    if (pathname === '/projeler') return 'projeler'
    return 'onizleme'
  })

  // Sync state when top-level pathname changes (e.g. sidebar navigation)
  useEffect(() => {
    if (pathname === '/birimler') setActiveTab('birimler')
    else if (pathname === '/personel') setActiveTab('personel')
    else if (pathname === '/komisyonlar') setActiveTab('komisyonlar')
    else if (pathname === '/komisyon-gorevleri') setActiveTab('komisyon-gorevleri')
    else if (pathname === '/ambar') setActiveTab('ambar')
    else if (pathname === '/projeler') setActiveTab('projeler')
  }, [pathname])

  // Sync logo state when settingsStore changes
  useEffect(() => {
    if (defaultInstitutionLogo) setInstitutionLogo(defaultInstitutionLogo)
  }, [defaultInstitutionLogo])
  useEffect(() => {
    if (defaultLogoLeft) setLogoLeft(defaultLogoLeft)
  }, [defaultLogoLeft])
  useEffect(() => {
    if (defaultLogoRight) setLogoRight(defaultLogoRight)
  }, [defaultLogoRight])
  useEffect(() => {
    setShowLogoLeft(defaultShowLogoLeft)
  }, [defaultShowLogoLeft])
  useEffect(() => {
    setShowLogoRight(defaultShowLogoRight)
  }, [defaultShowLogoRight])

  // Sync form when kurumData changes
  useEffect(() => {
    if (kurumData) {
      setLocalData(kurumData)
      if (kurumData.logo_kurum) setInstitutionLogo((prev) => prev || kurumData.logo_kurum || null)
      if (kurumData.logo_sol) setLogoLeft((prev) => prev || kurumData.logo_sol || null)
      if (kurumData.logo_sag) setLogoRight((prev) => prev || kurumData.logo_sag || null)

      let parsedLetterhead = ['']
      if (kurumData.kurum_anteti) {
        try {
          const parsed = JSON.parse(kurumData.kurum_anteti)
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedLetterhead = parsed
          } else {
            parsedLetterhead = [kurumData.kurum_anteti]
          }
        } catch {
          parsedLetterhead = [kurumData.kurum_anteti]
        }
      }
      setInstitutionLetterhead(parsedLetterhead)

      let parsedParent = ['']
      if (kurumData.ust_kurum_adi) {
        try {
          const parsedP = JSON.parse(kurumData.ust_kurum_adi)
          if (Array.isArray(parsedP) && parsedP.length > 0) {
            parsedParent = parsedP
          } else {
            parsedParent = [kurumData.ust_kurum_adi]
          }
        } catch {
          parsedParent = [kurumData.ust_kurum_adi]
        }
      }
      setParentInstitutionLines(parsedParent)

      try {
        const storedMeta = localStorage.getItem('kurum_custom_metadata')
        if (storedMeta) {
          const parsed = JSON.parse(storedMeta)
          if (Array.isArray(parsed)) setCustomMetadata(parsed)
        }
      } catch {
        // ignore
      }
    }
  }, [kurumData])

  // Load sözlük data
  useEffect(() => {
    window.electron.ipcRenderer
      .invoke('db:query', 'SELECT * FROM TANIM_KodSozlugu WHERE aktif_mi = 1')
      .then((res: any) => {
        if (res.success && res.data) {
          setSozlukData(res.data)
        }
      })
      .catch(console.error)
  }, [])

  const handleChange = (key: keyof KurumVerisi, value: any): void => {
    setLocalData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      const dataToSave = { ...localData } as KurumVerisi
      dataToSave.kurum_anteti = JSON.stringify(institutionLetterhead.filter((l) => l.trim() !== ''))
      dataToSave.ust_kurum_adi = JSON.stringify(
        parentInstitutionLines.filter((l) => l.trim() !== '')
      )
      if (institutionLogo) dataToSave.logo_kurum = institutionLogo
      if (logoLeft) dataToSave.logo_sol = logoLeft
      if (logoRight) dataToSave.logo_sag = logoRight

      await saveKurum(dataToSave)

      // Save custom metadata & logos to settings
      localStorage.setItem('kurum_custom_metadata', JSON.stringify(customMetadata))
      await window.electron.ipcRenderer.invoke('db:save-settings', {
        institutionLogo,
        logoLeft,
        logoRight,
        showLogoLeft: String(showLogoLeft),
        showLogoRight: String(showLogoRight),
        kurum_custom_metadata: JSON.stringify(customMetadata)
      })

      await reloadSettingsStore() // refresh app-wide settings store
      alert('Kurum bilgileri ve parametreler başarıyla güncellendi.')
    } catch (err) {
      alert('Kaydetme hatası: ' + err)
    } finally {
      setSaving(false)
    }
  }

  const handleTabChange = (tabId: string): void => {
    setActiveTab(tabId as TabType)
    try {
      const url = new URL(window.location.href)
      if (url.hash.includes('?')) {
        url.hash = url.hash.split('?')[0] + `?tab=${tabId}`
      } else {
        url.hash = url.hash + `?tab=${tabId}`
      }
      window.history.replaceState(null, '', url.toString())
    } catch {
      // ignore
    }
  }

  const menuItems: InnerMenuItem[] = [
    {
      id: 'hdr-kurum',
      isHeader: true,
      label: 'Kurum Bilgileri',
      icon: null
    },
    {
      id: 'onizleme',
      label: 'Genel Profil & Önizleme',
      icon: <Eye className="w-4 h-4 shrink-0 text-blue-600" />
    },
    {
      id: 'idari',
      label: 'İdari Bilgiler',
      icon: <Building2 className="w-4 h-4 shrink-0 text-indigo-600" />
    },
    {
      id: 'mali',
      label: 'Mali ve Bütçe Kodları',
      icon: <Building2 className="w-4 h-4 shrink-0 text-amber-600" />
    },
    {
      id: 'iletisim',
      label: 'İletişim & Konum',
      icon: <MapPin className="w-4 h-4 shrink-0 text-emerald-600" />
    },
    {
      id: 'logolar',
      label: 'Kurum Logoları ve Antet',
      icon: <Building2 className="w-4 h-4 shrink-0 text-violet-600" />
    },
    {
      id: 'div-sep',
      isDivider: true,
      label: '',
      icon: null
    },
    {
      id: 'hdr-tanimlar',
      isHeader: true,
      label: 'Teşkilat & Yönetim',
      icon: null
    },
    {
      id: 'birimler',
      label: 'Birim Yönetimi',
      icon: <LayoutGrid className="w-4 h-4 shrink-0 text-indigo-500" />
    },
    {
      id: 'personel',
      label: 'Personel Yönetimi',
      icon: <Users className="w-4 h-4 shrink-0 text-emerald-500" />
    },
    {
      id: 'komisyonlar',
      label: 'Komisyon Yönetimi',
      icon: <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-500" />
    },
    {
      id: 'komisyon-gorevleri',
      label: 'Görev Tanımları',
      icon: <ClipboardCheck className="w-4 h-4 shrink-0 text-pink-500" />
    },
    {
      id: 'ambar',
      label: 'Ambar Yönetimi',
      icon: <Warehouse className="w-4 h-4 shrink-0 text-orange-500" />
    },
    {
      id: 'projeler',
      label: 'Proje Yönetimi',
      icon: <FolderKanban className="w-4 h-4 shrink-0 text-blue-500" />
    }
  ]

  if (isLoadingKurum) {
    return (
      <div className="flex items-center justify-center flex-1 text-slate-500 h-full w-full">
        Kurum bilgileri yükleniyor...
      </div>
    )
  }

  const isKurumTab = ['onizleme', 'idari', 'mali', 'iletisim', 'logolar'].includes(activeTab)

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* SOL MENÜ */}
        <InnerMenu
          className="lg:col-span-3"
          items={menuItems}
          activeId={activeTab}
          onChange={handleTabChange}
        />

        {/* SAĞ PANEL */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {isKurumTab ? (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
              {/* Header Banner & Save Action */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-10 pt-4 -mt-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
                    <Building2 className="w-7 h-7 text-blue-600" />
                    {activeTab === 'onizleme' && 'Kurum Profili ve Genel Önizleme'}
                    {activeTab === 'idari' && 'İdari Kurum Bilgileri'}
                    {activeTab === 'mali' && 'Mali ve Bütçe Kodları'}
                    {activeTab === 'iletisim' && 'İletişim & Konum Bilgileri'}
                    {activeTab === 'logolar' && 'Kurum Logoları ve Antet'}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
                    {activeTab === 'onizleme'
                      ? 'Resmi kurum başlığı, DETSİS durumu ve genel parametrelerin özet profili.'
                      : 'Resmi evrak çıktılarında ve sistem genelinde dinamik olarak kullanılan kurum parametreleri.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {activeTab !== 'onizleme' ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleTabChange('onizleme')}
                        className="gap-1.5 text-xs font-bold rounded-xl py-2 px-3.5 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Genel Profil</span>
                      </Button>

                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-5 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleTabChange('idari')}
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-5 text-xs font-bold transition-all shadow-md shadow-blue-500/20 shrink-0 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Bilgileri Düzenle</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Main Content: Full Card View vs Edit Form */}
              {activeTab === 'onizleme' ? (
                <KurumViewCard
                  data={localData}
                  institutionLetterhead={institutionLetterhead}
                  parentInstitutionLines={parentInstitutionLines}
                  customMetadata={customMetadata}
                  onEditClick={() => handleTabChange('idari')}
                  institutionLogo={institutionLogo}
                  logoLeft={logoLeft}
                  logoRight={logoRight}
                  showLogoLeft={showLogoLeft}
                  showLogoRight={showLogoRight}
                />
              ) : (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-100">
                    {activeTab === 'idari' && (
                      <IdariBilgilerTab
                        data={localData}
                        onChange={handleChange}
                        institutionLetterhead={institutionLetterhead}
                        setInstitutionLetterhead={setInstitutionLetterhead}
                        parentInstitutionLines={parentInstitutionLines}
                        setParentInstitutionLines={setParentInstitutionLines}
                      />
                    )}
                    {activeTab === 'mali' && (
                      <MaliBirimTab
                        data={localData}
                        onChange={handleChange}
                        institutionLetterhead={institutionLetterhead}
                        setInstitutionLetterhead={setInstitutionLetterhead}
                        parentInstitutionLines={parentInstitutionLines}
                        setParentInstitutionLines={setParentInstitutionLines}
                        sozlukData={sozlukData}
                      />
                    )}
                    {activeTab === 'iletisim' && (
                      <IletisimTab
                        data={localData}
                        onChange={handleChange}
                        institutionLetterhead={institutionLetterhead}
                        setInstitutionLetterhead={setInstitutionLetterhead}
                        parentInstitutionLines={parentInstitutionLines}
                        setParentInstitutionLines={setParentInstitutionLines}
                      />
                    )}
                    {activeTab === 'logolar' && (
                      <LogolarTab
                        institutionLogo={institutionLogo}
                        setInstitutionLogo={setInstitutionLogo}
                        logoLeft={logoLeft}
                        setLogoLeft={setLogoLeft}
                        logoRight={logoRight}
                        setLogoRight={setLogoRight}
                        showLogoLeft={showLogoLeft}
                        setShowLogoLeft={setShowLogoLeft}
                        showLogoRight={showLogoRight}
                        setShowLogoRight={setShowLogoRight}
                        detsisKodu={localData.detsis_kodu || localData.dtvt_kodu}
                      />
                    )}
                  </div>

                  {/* Dynamic Key-Value Metadata Manager */}
                  <KurumMetadataManager
                    metadata={customMetadata}
                    onChange={setCustomMetadata}
                    isReadOnly={false}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="-mt-8 w-full">
              {activeTab === 'birimler' && <BirimlerScreen isSubComponent />}
              {activeTab === 'personel' && <PersonelScreen isSubComponent />}
              {activeTab === 'komisyonlar' && <KomisyonlarScreen isSubComponent />}
              {activeTab === 'komisyon-gorevleri' && <KomisyonGorevleriScreen isSubComponent />}
              {activeTab === 'ambar' && <AmbarScreen isSubComponent />}
              {activeTab === 'projeler' && <ProjelerScreen isSubComponent />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
