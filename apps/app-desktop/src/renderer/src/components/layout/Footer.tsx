import React, { useEffect, useState } from 'react'
import { Info, Wifi } from 'lucide-react'
import packageJson from '../../../../../package.json'
import { NetworkSyncModal } from '../network/NetworkSyncModal'
import { AboutModal } from '../ui/AboutModal'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useTabStore } from '../../store/tabStore'
import { GoogleDriveFooterWidget } from './GoogleDriveFooterWidget'

export function Footer(): React.JSX.Element {
  const { activeMeta, activeDosyaId, fileName } = useWorkspaceStore()
  const { institutionName, eButceKodu } = useSettingsStore()
  const { addTab } = useTabStore()
  const [showAbout, setShowAbout] = useState(false)
  const [showNetwork, setShowNetwork] = useState(false)
  const [appVersion, setAppVersion] = useState(packageJson.version)
  const [localIp, setLocalIp] = useState<string | null>(null)

  const fetchVersion = (): void => {
    if ((window as any).api?.getAppVersion) {
      ;(window as any).api
        .getAppVersion()
        .then((v: string) => {
          if (v) setAppVersion(v)
        })
        .catch(console.error)
    }
  }

  useEffect(() => {
    fetchVersion()
    if ((window as any).api?.getLocalIp) {
      ;(window as any).api
        .getLocalIp()
        .then((ip: string) => {
          if (ip) setLocalIp(ip)
        })
        .catch(console.error)
    }
  }, [])

  return (
    <footer className="h-8 shrink-0 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none z-40">
      <div className="flex items-center space-x-2">
        {fileName && (
          <button
            type="button"
            onClick={() => addTab('/dosya/veritabani')}
            title="Veritabanı & Dosya Bilgileri"
            className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px] hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer hover:underline"
          >
            📄 {fileName}
          </button>
        )}
        {activeDosyaId && (
          <>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-750"></span>
            {institutionName && (
              <span className="truncate max-w-[150px]" title={institutionName}>
                🏢 {institutionName}
              </span>
            )}
            {eButceKodu && (
              <>
                <span className="w-px h-3 bg-slate-300 dark:bg-slate-750"></span>
                <span className="flex items-center gap-1">
                  <span className="font-bold text-[9px] uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                    Bütçe:
                  </span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-305">
                    {eButceKodu}
                  </span>
                </span>
              </>
            )}
          </>
        )}
        {!activeDosyaId && activeMeta?.updated_at && (
          <>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-705"></span>
            <span className="text-slate-650 dark:text-slate-400">
              Son Güncelleme:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {new Date(activeMeta.updated_at).toLocaleString('tr-TR')}
              </span>
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-center">
        <GoogleDriveFooterWidget />
      </div>

      <div className="flex items-center space-x-2">
        <span>v{appVersion}</span>

        <button
          onClick={() => setShowNetwork(true)}
          className="flex items-center space-x-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 font-medium"
          title="Ağ Senkronizasyonu"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Ağ Paylaşımı {localIp && `(${localIp})`}</span>
        </button>

        <button
          onClick={() => setShowAbout(true)}
          className="flex items-center space-x-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Hakkında & Lisans"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Hakkında</span>
        </button>
      </div>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      {showNetwork && <NetworkSyncModal onClose={() => setShowNetwork(false)} />}
    </footer>
  )
}
