import React from 'react'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { HeaderMenu } from './header.types'
import appIcon from '../../../assets/icon.png'

interface NativeMenuBarProps {
  visibleMenus: HeaderMenu[]
  overflowMenus: HeaderMenu[]
  activeMenu: string | null
  setActiveMenu: (menu: string | null) => void
  hoveredSubMenu: string | null
  setHoveredSubMenu: (subMenu: string | null) => void
  isDt: boolean
  logo?: string | null
}

export function NativeMenuBar({
  visibleMenus,
  overflowMenus,
  activeMenu,
  setActiveMenu,
  hoveredSubMenu,
  setHoveredSubMenu,
  isDt,
  logo
}: NativeMenuBarProps): React.JSX.Element {
  const handleMenuHover = (menuName: string): void => {
    if (activeMenu) {
      setActiveMenu(menuName)
    }
  }

  return (
    <div
      id="native-menu-bar"
      className="flex items-center gap-0.5 z-50 text-[11px] font-medium"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* App / Kurum Logo */}
      <div className="flex items-center justify-center w-6 h-6 mr-1.5 opacity-95">
        <img
          src={logo || appIcon}
          alt="Logo"
          className="w-full h-full object-contain drop-shadow-xs"
          onError={(e) => {
            if (e.currentTarget.src !== appIcon) {
              e.currentTarget.src = appIcon
            }
          }}
        />
      </div>

      {/* Görünür Ana Menüler */}
      {visibleMenus.map((m) => (
        <div key={m.name} className="relative">
          <button
            onClick={() => {
              if (m.onClick) {
                m.onClick()
                setActiveMenu(null)
                setHoveredSubMenu(null)
              } else {
                setActiveMenu(activeMenu === m.name ? null : m.name)
                setHoveredSubMenu(null)
              }
            }}
            onMouseEnter={() => {
              if (m.onClick) {
                setActiveMenu(null)
              } else {
                handleMenuHover(m.name)
              }
            }}
            className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeMenu === m.name
                ? isDt
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 font-semibold'
                  : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-semibold'
                : 'text-slate-600 dark:text-slate-350 hover:bg-slate-200/40 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {m.name}
          </button>

          {activeMenu === m.name && m.items && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl py-1 z-[100] animate-in fade-in slide-in-from-top-1">
              {m.items.map((item, idx) =>
                item.divider ? (
                  <div key={idx} className="h-px bg-slate-150 dark:bg-slate-800 my-1" />
                ) : (
                  <button
                    key={idx}
                    onClick={() => {
                      item.onClick?.()
                      setActiveMenu(null)
                    }}
                    className={`w-full text-left px-3 py-1.5 ${
                      isDt
                        ? 'hover:bg-blue-600 hover:text-white'
                        : 'hover:bg-indigo-600 hover:text-white'
                    } text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between cursor-pointer text-xs`}
                  >
                    <span>{item.label}</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}

      {/* TAŞAN MENÜLER (...) BUTONU VE KASKAD (CASCADE) AÇILIR LİSTE */}
      {overflowMenus.length > 0 && (
        <div className="relative">
          <button
            onClick={() => {
              setActiveMenu(activeMenu === '__overflow__' ? null : '__overflow__')
              setHoveredSubMenu(null)
            }}
            onMouseEnter={() => {
              if (activeMenu && activeMenu !== '__overflow__') {
                setActiveMenu('__overflow__')
              }
            }}
            title="Diğer Menüler"
            className={`p-1 px-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center ${
              activeMenu === '__overflow__' || overflowMenus.some((m) => m.name === activeMenu)
                ? isDt
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 font-semibold'
                  : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-semibold'
                : 'text-slate-600 dark:text-slate-350 hover:bg-slate-200/40 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {activeMenu === '__overflow__' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl py-1 z-[110] animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                Diğer Menüler
              </div>
              {overflowMenus.map((om) => (
                <div
                  key={om.name}
                  className="relative"
                  onMouseEnter={() => setHoveredSubMenu(om.name)}
                >
                  <button
                    onClick={() => {
                      if (om.onClick) {
                        om.onClick()
                        setActiveMenu(null)
                        setHoveredSubMenu(null)
                      } else {
                        setHoveredSubMenu(hoveredSubMenu === om.name ? null : om.name)
                      }
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 ${
                      hoveredSubMenu === om.name
                        ? isDt
                          ? 'bg-blue-600 text-white'
                          : 'bg-indigo-600 text-white'
                        : isDt
                          ? 'hover:bg-blue-50 dark:hover:bg-blue-950/60'
                          : 'hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                    } transition-colors cursor-pointer`}
                  >
                    <span>{om.name}</span>
                    {om.items && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </button>

                  {/* Kaskad Alt Menü (Nested Flyout) */}
                  {hoveredSubMenu === om.name && om.items && (
                    <div className="absolute top-0 left-full ml-1 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl py-1 z-[120] animate-in fade-in slide-in-from-left-1">
                      {om.items.map((item, idx) =>
                        item.divider ? (
                          <div key={idx} className="h-px bg-slate-150 dark:bg-slate-800 my-1" />
                        ) : (
                          <button
                            key={idx}
                            onClick={() => {
                              item.onClick?.()
                              setActiveMenu(null)
                              setHoveredSubMenu(null)
                            }}
                            className={`w-full text-left px-3 py-1.5 ${
                              isDt
                                ? 'hover:bg-blue-600 hover:text-white'
                                : 'hover:bg-indigo-600 hover:text-white'
                            } text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between cursor-pointer text-xs`}
                          >
                            <span>{item.label}</span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
