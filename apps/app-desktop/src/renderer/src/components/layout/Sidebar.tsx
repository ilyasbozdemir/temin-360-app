import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  FolderTree,
  Hammer,
  HelpCircle,
  Home,
  Key,
  Landmark,
  LayoutGrid,
  LogOut,
  Megaphone,
  PackageSearch,
  Ruler,
  Scale,
  Settings,
  Star,
  Tag,
  User,
  Users,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useSettingsStore } from "../../store/settingsStore";
import { useWorkspaceStore } from "../../store/workspaceStore";

interface SubItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface MenuItem {
  name: string;
  path?: string;
  icon: React.ElementType;
  badge?: string;
  children?: SubItem[];
  onClick?: () => void;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Ana Menü",
    items: [
      { name: "Gösterge Paneli", path: "/", icon: Home },
      {
        name: "Harcama & Hakediş Merkezi",
        path: "/harcama-merkezi",
        icon: Landmark,
        badge: "YENİ",
      },
    ],
  },
  {
    title: "Süreç Yönetimi",
    items: [
      { name: "Doğrudan Temin Dosyaları", path: "/dosyalar", icon: FileText },
      {
        name: "Hakediş & Harcama İşlemleri",
        path: "/hakedis",
        icon: Hammer,
        badge: "YENİ",
      },
      {
        name: "Hızlı Dosya Ekle / Güncelle",
        path: "/hizli-dosya-ekle",
        icon: Database,
      },
    ],
  },
  {
    title: "Kayıtlar & Tanımlar",
    items: [
      {
        name: "Kurum Yönetimi",
        icon: Building2,
        children: [
          { name: "Kurum Bilgileri", path: "/kurum", icon: Building2 },
          { name: "Birim Yönetimi", path: "/birimler", icon: LayoutGrid },
          { name: "Personel Yönetimi", path: "/personel", icon: Users },
          { name: "Ambar Tanımları", path: "/ambar", icon: Database },
          { name: "Komisyon Yönetimi", path: "/komisyonlar", icon: Users },
          {
            name: "Görev Tanımları",
            path: "/komisyon-gorevleri",
            icon: Settings,
          },
        ],
      },
      { name: "İstekli Firma Yönetimi", path: "/firmalar", icon: Building2 },
      {
        name: "Malzeme & Kodlar",
        icon: PackageSearch,
        children: [
          {
            name: "Mal/Hizmet/Yapım İşleri Listesi",
            path: "/malzemeler",
            icon: PackageSearch,
          },
          { name: "Taşınır Kodları", path: "/tasinirkod", icon: FolderTree },
          { name: "OKAS Kodları", path: "/okaskod", icon: Tag },
          { name: "Birim Fiyat Pozları", path: "/pozlar", icon: BookOpen },
          { name: "Ölçü Birimleri", path: "/olcubirimleri", icon: Ruler },
        ],
      },
    ],
  },
  {
    title: "Sistem",
    items: [
      { name: "Raporlar", path: "/raporlar", icon: BarChart3 },
      {
        name: "Şablon Listesi ve Süreçler",
        path: "/taslakyonetim",
        icon: Star,
      },
      { name: "Sürüm Notları", path: "/changelog", icon: Megaphone },
      { name: "Yardım & Kılavuzlar", path: "/yardim", icon: HelpCircle },
      {
        name: "Ayarlar",
        icon: Settings,
        children: [
          { name: "Genel Ayarlar", path: "/ayarlar", icon: Settings },
          { name: "Kullanıcı Profili & Şifre", path: "/profil", icon: User },
          { name: "Mevzuat ve Parametreler", path: "/mevzuat", icon: Scale },
          { name: "Toplu İçe Aktarma", path: "/import", icon: Database },
          {
            name: "Şablon & Kategori Yönetimi",
            path: "/degiskenler",
            icon: Key,
          },
        ],
      },
    ],
  },
];

export function Sidebar(): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["/malzemeler", "Malzeme & Kodlar"]),
  );
  const {
    institutionName,
    institutionLogo,
    adminName,
    adminTitle,
    adminUsername,
    eButceKodu,
    loadSettings,
  } = useSettingsStore();
  const { fileName, activeDosyaId, setActiveDosyaId } = useWorkspaceStore();

  const handleCloseWorkspace = async (): Promise<void> => {
    window.dispatchEvent(new CustomEvent("workspace-close-request"));
  };

  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.split("?")[1] || "",
  );
  const isDosyaWindowMode = searchParams.get("mode") === "dosya_window" ||
    hashParams.get("mode") === "dosya_window";

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const getInitials = (name: string): string => {
    if (!name) return "SY";
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const finalMenuGroups = menuGroups;

  return (
    <div
      className={cn(
        "h-screen bg-sidebar-bg text-sidebar-text flex flex-col shadow-xl shrink-0 transition-all duration-300 relative z-50 border-r border-sidebar-border",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <button
        type="button"
        className={cn(
          "absolute -right-3.5 top-1/2 -translate-y-1/2 z-50",
          "flex items-center justify-center",
          "w-7 h-7 rounded-full cursor-pointer group",
          "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
          "border-2 border-slate-50 dark:border-slate-950",
          "shadow-md hover:shadow-lg hover:scale-110 active:scale-95",
          "transition-all duration-300 ease-out",
        )}
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        onClick={(e) => {
          e.stopPropagation();
          setIsCollapsed(!isCollapsed);
        }}
        title={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
      >
        {isCollapsed
          ? (
            <ChevronRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          )
          : (
            <ChevronLeft
              size={16}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
          )}
      </button>

      <div
        className={cn(
          "flex flex-col items-center border-b border-sidebar-border transition-all duration-300",
          isCollapsed ? "py-4 px-0" : "py-6 px-4",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-300 shrink-0",
            isCollapsed ? "w-10 h-10" : "w-16 h-16",
          )}
        >
          {institutionLogo
            ? (
              <img
                src={institutionLogo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            )
            : (
              <Building2
                className={cn(
                  "text-sidebar-active-text",
                  isCollapsed ? "w-6 h-6" : "w-10 h-10",
                )}
              />
            )}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col items-center mt-3 text-center w-full px-1">
            <span className="text-sidebar-text/70 text-[10px] font-semibold tracking-wider uppercase mt-1 w-full px-2 wrap-break-word leading-normal">
              {institutionName}
            </span>

            <span className="text-sidebar-hover-text font-bold text-base tracking-wide whitespace-nowrap leading-tight mt-1 flex items-center gap-1.5 justify-center">
              TEMİN 360
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {finalMenuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold text-sidebar-text/50 uppercase tracking-widest">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const itemKey = item.path || item.name;
                const isExpanded = expandedItems.has(itemKey);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <li key={item.name}>
                    <div
                      className="flex items-center gap-1"
                      onClick={() => {
                        if (hasChildren && !item.path) {
                          toggleExpanded(itemKey);
                        }
                      }}
                    >
                      {item.path
                        ? (
                          <Link
                            to={item.path}
                            onClick={() => {
                              if (item.onClick) {
                                item.onClick();
                              }
                            }}
                            className={cn(
                              "flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-transparent cursor-pointer",
                              "hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text",
                              "active:scale-[0.98]",
                            )}
                            activeProps={{
                              className:
                                "bg-sidebar-active-bg text-sidebar-active-text border-sidebar-active-border shadow-sm shadow-blue-500/5 font-bold",
                            }}
                          >
                            <item.icon size={18} className="shrink-0" />
                            {!isCollapsed && (
                              <span className="text-sm font-medium whitespace-nowrap flex-1 flex items-center justify-between">
                                <span>{item.name}</span>
                                {item.badge && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
                                    {item.badge}
                                  </span>
                                )}
                              </span>
                            )}
                          </Link>
                        )
                        : (
                          <div
                            className={cn(
                              "flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-transparent cursor-pointer text-sidebar-text/80",
                              "hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text",
                              "active:scale-[0.98]",
                            )}
                          >
                            <item.icon size={18} className="shrink-0" />
                            {!isCollapsed && (
                              <span className="text-sm font-medium whitespace-nowrap flex-1">
                                {item.name}
                              </span>
                            )}
                          </div>
                        )}

                      {hasChildren && !isCollapsed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(itemKey);
                          }}
                          className="p-1 rounded-md hover:bg-sidebar-hover-bg text-sidebar-text/50 hover:text-sidebar-hover-text transition-all cursor-pointer"
                          title={isExpanded ? "Kapat" : "Genişlet"}
                        >
                          <ChevronDown
                            size={13}
                            className={cn(
                              "transition-transform duration-200",
                              isExpanded ? "rotate-0" : "-rotate-90",
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {hasChildren && !isCollapsed && isExpanded && (
                      <ul className="mt-0.5 ml-4 pl-3 border-l border-sidebar-border/40 space-y-0.5">
                        {item.children!.map((child) => (
                          <li key={child.name}>
                            <Link
                              to={child.path}
                              className={cn(
                                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-transparent cursor-pointer",
                                "hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text",
                                "active:scale-[0.98] text-sidebar-text/80",
                              )}
                              activeProps={{
                                className:
                                  "bg-sidebar-active-bg text-sidebar-active-text border-sidebar-active-border shadow-sm font-bold",
                              }}
                            >
                              <child.icon
                                size={14}
                                className="shrink-0 opacity-70"
                              />
                              <span className="whitespace-nowrap">
                                {child.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    {hasChildren && isCollapsed && (
                      <ul className="mt-0.5 space-y-0.5">
                        {item.children!.map((child) => (
                          <li key={child.name}>
                            <Link
                              to={child.path}
                              title={child.name}
                              className={cn(
                                "flex items-center justify-center px-3 py-1.5 rounded-lg transition-all duration-200 border border-transparent cursor-pointer",
                                "hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text",
                              )}
                              activeProps={{
                                className:
                                  "bg-sidebar-active-bg text-sidebar-active-text border-sidebar-active-border shadow-sm",
                              }}
                            >
                              <child.icon
                                size={15}
                                className="shrink-0 opacity-70"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Link
          to="/profil"
          className={cn(
            "flex items-center rounded-md bg-sidebar-hover-bg/50 hover:bg-sidebar-hover-bg transition-all border border-transparent hover:border-sidebar-border cursor-pointer",
            isCollapsed ? "justify-center p-2" : "px-2 py-2",
          )}
          title="Kullanıcı Profili ve Güvenlik Ayarlarına Git"
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center border border-sidebar-border/30 shadow-xs">
              <span className="text-xs font-bold">
                {getInitials(adminName || adminUsername || "SY")}
              </span>
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden flex-1 text-left">
              <p
                className="text-sm font-bold text-sidebar-hover-text truncate leading-tight"
                title={adminName || adminUsername}
              >
                {adminName || adminUsername || "Sistem Yöneticisi"}
              </p>
              <p
                className="text-[10px] text-sidebar-text/75 truncate mt-0.5"
                title={adminTitle || "Kullanıcı Profili"}
              >
                {adminTitle || "Kullanıcı Profili"}
              </p>
            </div>
          )}
        </Link>

        <button
          onClick={handleCloseWorkspace}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-sidebar-text/80 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-sidebar-border hover:border-red-500/20",
            isCollapsed ? "py-2 px-0" : "py-2",
          )}
          title="Kurum Dosyasını Kapat (.dtal)"
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Kurum Dosyasını Kapat</span>}
        </button>

        {!isCollapsed && (
          <Link
            to="/dosya"
            className="text-[10px] text-center text-sidebar-text/50 font-medium px-2 py-1 truncate bg-sidebar-hover-bg/30 rounded border border-sidebar-border/40 hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text transition-all block cursor-pointer active:scale-95"
            title="Veri Dosyası Detaylarını Göster"
          >
            Dosya: {fileName}
          </Link>
        )}
      </div>
    </div>
  );
}
