import React, { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  FolderOpen,
  Package,
  Search
} from 'lucide-react'
import { cn } from '../../../utils/cn'

const STEPS = [
  {
    id: 1,
    label: 'İhtiyaç Listesi & Maliyet & Onay',
    route: '/dosya/hazirlik-ve-ihtiyac',
    icon: Package
  },
  {
    id: 2,
    label: 'Teklifler & Piyasa Fiyat Araştırması',
    route: '/dosya/piyasa-fiyat-arastirmasi',
    icon: Search
  },
  {
    id: 3,
    label: 'Sipariş & Sözleşme',
    route: '/dosya/siparis-ve-sozlesme',
    icon: FileSignature
  },
  {
    id: 4,
    label: 'Muayene & Kabul & Ödeme',
    route: '/dosya/kabul-ve-odeme',
    icon: CheckCircle2
  },
  {
    id: 5,
    label: 'Klasör & Kapaklar',
    route: '/dosya/klasor-ve-kapaklar',
    icon: FolderOpen
  }
]

export function VerticalStepper(): React.JSX.Element {
  const location = useLocation()
  const currentPath = location.pathname

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dta_vertical_stepper_collapsed') === 'true'
    } catch {
      return false
    }
  })

  const toggleCollapse = (): void => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    try {
      localStorage.setItem('dta_vertical_stepper_collapsed', String(nextState))
    } catch (e) {
      console.error(e)
    }
  }

  const activeIndex = STEPS.findIndex((s) => currentPath.includes(s.route.replace('/dosya/', '')))

  return (
    <div
      className={cn(
        'sticky top-6 self-start shrink-0 border-r border-slate-200 dark:border-slate-800 py-4 flex flex-col transition-all duration-300 relative select-none z-30',
        isCollapsed ? 'w-16 pr-2' : 'w-64 pr-6',
        'before:absolute before:inset-y-0 before:w-px before:bg-slate-200 dark:before:bg-slate-800 before:-z-10',
        isCollapsed ? 'before:left-[1.75rem]' : 'before:left-[1.375rem]'
      )}
    >
      {/* Collapse / Expand Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        {!isCollapsed && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">
            Süreç Adımları
          </span>
        )}
        <button
          type="button"
          onClick={toggleCollapse}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs',
            isCollapsed && 'mx-auto'
          )}
          title={isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-6">
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex
          const isCompleted = index < activeIndex

          return (
            <Link
              key={step.id}
              to={step.route as any}
              title={isCollapsed ? `${step.id}. ${step.label}` : undefined}
              className={cn(
                'group flex items-start relative outline-none transition-all',
                isCollapsed ? 'justify-center' : 'gap-4',
                isActive
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all shadow-sm z-10',
                  isActive
                    ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/25 scale-105'
                    : isCompleted
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 group-hover:border-slate-300 dark:group-hover:border-slate-700'
                )}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="font-bold text-base">{step.id}</span>
                )}
              </div>
              {!isCollapsed && (
                <div className="pt-2.5">
                  <h3
                    className={cn(
                      'text-sm font-bold leading-none transition-colors',
                      isActive ? 'text-blue-600 dark:text-blue-400' : ''
                    )}
                  >
                    {step.label}
                  </h3>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
