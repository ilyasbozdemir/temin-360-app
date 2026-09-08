import React, { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Database,
  ExternalLink,
  FileText,
  FolderTree,
  HardHat,
  Home,
  LayoutGrid,
  LucideIcon,
  Moon,
  PackageSearch,
  Scale,
  Settings,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useTabStore } from "../../store/tabStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { cn } from "../../utils/cn";

// Map of route paths to Lucide Icon components
const tabIcons: Record<string, LucideIcon> = {
  "/": Home,
  "/dosyalar": FileText,
  "/takip": ClipboardList,
  "/birimler": LayoutGrid,
  "/ambar": Database,
  "/malzemeler": PackageSearch,
  "/tasinirkod": FolderTree,
  "/okaskod": Tag,
  "/pozlar": HardHat,
  "/firmalar": Building2,
  "/personel": Users,
  "/kurum": Building2,
  "/raporlar": BarChart3,
  "/mevzuat": Scale,
  "/ayarlar": Settings,
  "/tema": Moon,
  "/profil": Users,
  "/dosya": FileText,
};

export function TabsBar(): React.JSX.Element {
  const { tabs, activeTabPath, closeTab, setActiveTab } = useTabStore();
  const { activeFilePath } = useWorkspaceStore();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to active tab on change
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeElement = scrollContainerRef.current.querySelector(
      '[data-active="true"]',
    );
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [activeTabPath]);

  const handleTabClick = (path: string): void => {
    setActiveTab(path);
    navigate({ to: path });
  };

  const handleCloseClick = (e: React.SyntheticEvent, path: string): void => {
    e.stopPropagation();
    const nextPath = closeTab(path);
    if (nextPath) {
      navigate({ to: nextPath });
    }
  };

  const handleOpenInWindow = (
    e: React.SyntheticEvent,
    path: string,
    label: string,
  ): void => {
    e.stopPropagation();
    // Close the tab from the main window
    const nextPath = closeTab(path);
    if (nextPath) {
      navigate({ to: nextPath });
    }
    // Open in a separate Electron window, passing workspace path so child window can access DB
    window.electron?.ipcRenderer.send("tab:open-in-window", {
      path,
      title: label,
      workspacePath: activeFilePath || undefined,
    });
  };

  // Mouse wheel horizontal scrolling support
  const handleWheel = (e: React.WheelEvent): void => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      onWheel={handleWheel}
      className="flex items-end gap-[2px] bg-slate-100/80 dark:bg-slate-950/40 border-b border-slate-200/50 dark:border-slate-800/50 px-4 h-11 overflow-x-auto overflow-y-hidden select-none custom-scrollbar scroll-smooth shrink-0"
    >
      {tabs.map((tab) => {
        const Icon = tabIcons[tab.path] || FileText;
        const isActive = activeTabPath === tab.path;

        return (
          <button
            key={tab.path}
            onClick={() => handleTabClick(tab.path)}
            data-active={isActive}
            title={tab.label}
            className={cn(
              "group flex items-center gap-1.5 h-9 pl-3 text-xs font-semibold rounded-t-xl transition-all duration-200 border-x border-t border-transparent relative flex-1 min-w-[80px] max-w-[180px] cursor-pointer",
              tab.path === "/" ? "pr-3" : "pr-12",
              isActive
                ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-900/20",
            )}
          >
            {/* Top Indicator bar for active tab */}
            {isActive && (
              <span className="absolute top-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />
            )}

            <Icon
              className={cn(
                "w-3.5 h-3.5 shrink-0",
                isActive
                  ? "text-blue-500"
                  : "text-slate-400 group-hover:text-slate-500",
              )}
            />

            <span className="truncate">{tab.label}</span>

            {/* Open in Window button */}
            {tab.path !== "/" && (
              <span
                role="button"
                tabIndex={0}
                title="Pencerede Aç"
                onClick={(e) => handleOpenInWindow(e, tab.path, tab.label)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleOpenInWindow(e, tab.path, tab.label);
                  }
                }}
                className={cn(
                  "absolute right-7 p-0.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center cursor-pointer",
                  isActive
                    ? "opacity-60 hover:opacity-100"
                    : "opacity-0 group-hover:opacity-40 hover:opacity-100",
                )}
              >
                <ExternalLink className="w-3 h-3" />
              </span>
            )}

            {/* Close button */}
            {tab.path !== "/" && (
              <span
                role="button"
                tabIndex={0}
                title="Sekmeyi Kapat"
                onClick={(e) => handleCloseClick(e, tab.path)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCloseClick(e, tab.path);
                  }
                }}
                className={cn(
                  "absolute right-2 p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-red-500 dark:hover:text-red-400 transition-all flex items-center justify-center cursor-pointer",
                  isActive
                    ? "opacity-80 hover:opacity-100"
                    : "opacity-0 group-hover:opacity-60 hover:opacity-100",
                )}
              >
                <X className="w-3 h-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
