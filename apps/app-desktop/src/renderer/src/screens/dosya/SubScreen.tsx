import React, { useEffect } from 'react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useTabStore } from '../../store/tabStore'
import { Link } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { ProcessStepper } from './components/ProcessStepper'
import { useGlobalDocumentPreviewStore } from '../../store/globalDocumentPreviewStore'

const STEPPER_ROUTES = [
  'hazirlik-ve-ihtiyac',
  'piyasa-fiyat-arastirmasi',
  'siparis-ve-sozlesme',
  'kabul-ve-odeme'
]

interface SubScreenProps {
  title: string
  icon: React.ElementType
  description: string
  children?: React.ReactNode
  hideStepper?: boolean
  requireActiveDosya?: boolean
  previewDocumentId?: string | null
  selectedFirma?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invitedFirms?: any[]
  onClosePreview?: () => void

}

export function SubScreen({
  title,
  icon: Icon,
  description,
  children,
  hideStepper = false,
  requireActiveDosya = true,
  previewDocumentId,
  selectedFirma,
  invitedFirms,
  onClosePreview
}: SubScreenProps): React.JSX.Element {
  const { activeTabPath } = useTabStore()
  const { activeDosyaId, setActiveStarredDocs } = useWorkspaceStore()
  const { openDocument } = useGlobalDocumentPreviewStore()

  useEffect(() => {
    document.title = `${title} - Doğrudan Temin`
  }, [title])

  useEffect(() => {
    if (previewDocumentId) {
      openDocument({
        documentId: previewDocumentId.replace('.html', ''),
        dosyaId: activeDosyaId || undefined,
        invitedFirms,
        selectedFirma: selectedFirma || null,
        onClose: () => {
          if (onClosePreview) {
            onClosePreview()
          }
        }
      })
    }
  }, [previewDocumentId, activeDosyaId, invitedFirms, selectedFirma, openDocument, onClosePreview])

  useEffect(() => {
    if (!activeDosyaId) return
    window.electron.ipcRenderer
      .invoke('db:query', 'SELECT starred_docs FROM DATA_TeminDosyasi WHERE id = ?', [
        activeDosyaId
      ])
      .then((res) => {
        if (res.success && res.data.length > 0) {
          try {
            const docs = res.data[0].starred_docs ? JSON.parse(res.data[0].starred_docs) : []
            setActiveStarredDocs(docs)
          } catch (e) {
            console.error('Failed to parse active file starred docs:', e)
          }
        }
      })
      .catch((err) => {
        console.error('Failed to query active file starred docs:', err)
      })
  }, [activeDosyaId, title, setActiveStarredDocs])

  // Mevcut sayfanın stepper'a dahil olup olmadığını belirle
  const currentPath =
    activeTabPath || (typeof window !== 'undefined' ? window.location.pathname : '')
  const showStepper = !hideStepper && STEPPER_ROUTES.some((r) => currentPath.includes(r))

  return (
    <div className="p-6 md:p-8 w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            title="Geri Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <Icon className="w-7 h-7 text-blue-600" />
              {title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">{description}</p>
          </div>
        </div>
      </div>

      {/* PROCESS STEPPER */}
      {showStepper && activeDosyaId && <ProcessStepper currentRoute={currentPath} />}

      {/* ACTIVE DOSYA CONTEXT */}
      {requireActiveDosya && !activeDosyaId && (
        <div className="bg-amber-50/50 dark:bg-amber-955/10 border border-amber-200 dark:border-amber-900/20 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-400 font-semibold shadow-sm print:hidden">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            Aktif bir doğrudan temin dosyası seçmediniz. Bu ekranda işlem yapabilmek için lütfen
            önce{' '}
            <Link to="/dosyalar" className="underline font-bold text-blue-600 dark:text-blue-400">
              dosyalar listesinden
            </Link>{' '}
            bir dosya seçin.
          </div>
        </div>
      )}

      {/* CHILDREN VIEW */}
      {(activeDosyaId || !requireActiveDosya) && children}
    </div>
  )
}

