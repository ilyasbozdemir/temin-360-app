import React, { useState } from 'react'
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

import { useNavigate, useRouterState } from '@tanstack/react-router'

import BirimlerScreen from '../birimler/index.screen'
import PersonelScreen from '../personel/index.screen'
import KomisyonlarScreen from '../komisyonlar/index.screen'
import KomisyonGorevleriScreen from '../komisyon-gorevleri/index.screen'
import AmbarScreen from '../ambar/index.screen'
import ProjelerScreen from '../projeler/index.screen'

type TabType =
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
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

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
  React.useEffect(() => {
    fetchKurum()
  }, [fetchKurum])

  const initializedRef = React.useRef(false)
  // Initialize form when data loads
  React.useEffect(() => {
    if (kurumData && !initializedRef.current) {
      initializedRef.current = true
      setLocalData(kurumData)

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

      // Load custom metadata from settings or localStorage
      try {
        const storedMeta = localStorage.getItem('kurum_custom_metadata')
        if (storedMeta) {
          const parsed = JSON.parse(storedMeta)
          if (Array.isArray(parsed)) setCustomMetadata(parsed)
        }
      } catch {
        // ignore fallback
      }
    }
  }, [kurumData])

  // Load sözlük data
  React.useEffect(() => {
    window.electron.ipcRenderer
      .invoke('db:query', 'SELECT * FROM TANIM_KodSozlugu WHERE aktif_mi = 1')
      .then((res: any) => {
        if (res.success && res.data) {
          setSozlukData(res.data)
        }
      })
      .catch(console.error)
  }, [])

  const handleChange = (key: keyof KurumVerisi, value: any) => {
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
      alert('Kurum bilgileri ve özel parametreler başarıyla kaydedildi.')
      setIsEditMode(false) // Switch to View mode after successful save
    } catch (err) {
      alert('Kaydetme hatası: ' + err)
    } finally {
      setSaving(false)
    }
  }

  const navigate = useNavigate()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  // TanStack Hash Router search resolution
  const locationSearch = routerState.location.search as any
  const hashSearch = window.location.hash.includes('?')
    ? window.location.hash.substring(window.location.hash.indexOf('?'))
    : ''
  const searchParams = new URLSearchParams(hashSearch || window.location.search)
  const queryTab =
    (typeof locationSearch === 'object' ? locationSearch?.tab : null) || searchParams.get('tab')

  let activeTab: TabType = 'idari'
  if (pathname === '/birimler' || queryTab === 'birimler') {
    activeTab = 'birimler'
  } else if (pathname === '/personel' || queryTab === 'personel') {
    activeTab = 'personel'
  } else if (pathname === '/komisyonlar' || queryTab === 'komisyonlar') {
    activeTab = 'komisyonlar'
  } else if (pathname === '/komisyon-gorevleri' || queryTab === 'komisyon-gorevleri') {
    activeTab = 'komisyon-gorevleri'
  } else if (pathname === '/ambar' || queryTab === 'ambar') {
    activeTab = 'ambar'
  } else if (pathname === '/projeler' || queryTab === 'projeler') {
    activeTab = 'projeler'
  } else if (queryTab === 'mali') {
    activeTab = 'mali'
  } else if (queryTab === 'iletisim') {
    activeTab = 'iletisim'
  } else if (queryTab === 'logolar') {
    activeTab = 'logolar'
  } else {
    activeTab = 'idari'
  }

  const handleTabChange = (tabId: string): void => {
    navigate({
      to: '/kurum' as any,
      search: { tab: tabId } as any
    })
  }

  const menuItems: InnerMenuItem[] = [
    {
      id: 'hdr-kurum',
      isHeader: true,
      label: 'Kurum Bilgileri',
      icon: null
    },
    {
      id: 'idari',
      label: 'İdari Bilgiler',
      icon: <Building2 className="w-4 h-4 shrink-0 text-blue-600" />
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
      label: 'Kurum Logoları',
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

  const isKurumTab = ['idari', 'mali', 'iletisim', 'logolar'].includes(activeTab)

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
              {/* Mode Switcher & Actions Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-10 pt-4 -mt-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
                    <Building2 className="w-7 h-7 text-blue-600" />
                    Kurum Bilgileri
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
                    Resmi evrak çıktılarında ve arayüzde gösterilecek idari ve iletişim bilgilerini
                    yönetin.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* View / Edit Mode Switcher */}
                  <div className="p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 flex items-center gap-1 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !isEditMode
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Görüntüleme Modu</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isEditMode
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Düzenleme Modu</span>
                    </button>
                  </div>

                  {isEditMode && (
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-5 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Main Content: View Mode vs Edit Mode */}
              {!isEditMode ? (
                <KurumViewCard
                  data={localData}
                  institutionLetterhead={institutionLetterhead}
                  parentInstitutionLines={parentInstitutionLines}
                  customMetadata={customMetadata}
                  onEditClick={() => setIsEditMode(true)}
                />
              ) : (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[400px]">
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

                  {/* Dynamic Key-Value Metadata Manager in Edit Mode */}
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
