import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Coins,
  DownloadCloud,
  FileSpreadsheet,
  Layers,
  Moon,
  MoreHorizontal,
  Printer,
  Save,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import { TeminSelector } from "./TeminSelector";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useSettingsStore } from "../../store/settingsStore";
import { FormatUpgradeModal } from "../modals/FormatUpgradeModal";
import { WindowControls } from "./header/WindowControls";
import { NotificationPopover } from "./header/NotificationPopover";
import { SyncPopover } from "./header/SyncPopover";
import appIcon from "../../assets/icon.png";

export function Header(): React.JSX.Element {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredSubMenu, setHoveredSubMenu] = useState<string | null>(null);
  const { activeDosyaId, fileName, isDirty, activeFilePath } =
    useWorkspaceStore();
  const { institutionLogo, logoLeft } = useSettingsStore();
  const activeExt = (activeFilePath?.split(".").pop() || "").toLowerCase();
  const isOldFormat = Boolean(activeFilePath && activeExt !== "temin");

  const [showFormatUpgradeModal, setShowFormatUpgradeModal] = useState(false);
  const [upgradeFilePath, setUpgradeFilePath] = useState<string | null>(null);

  const handleUpgradeAndOpen = async (filePath: string): Promise<void> => {
    const result = await useWorkspaceStore.getState().convertAndOpenWorkspace(
      filePath,
    );
    if (result.success) {
      window.location.reload();
    } else {
      throw new Error(result.error || "Dönüştürme başarısız oldu.");
    }
  };

  const [isDirtySummaryOpen, setIsDirtySummaryOpen] = useState(false);
  const [dirtySummary, setDirtySummary] = useState<
    {
      totalChanges: number;
      lastModifiedAt: string | null;
      items: Array<{
        tableName: string;
        title: string;
        action: string;
        actionLabel: string;
        count: number;
        lastTime: string;
      }>;
    } | null
  >(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const dirtySummaryRef = React.useRef<HTMLDivElement>(null);

  const loadDirtySummary = async (): Promise<void> => {
    try {
      setIsLoadingSummary(true);
      const res = await window.electron?.ipcRenderer.invoke(
        "workspace:get-dirty-summary",
      );
      if (res?.success) {
        setDirtySummary({
          totalChanges: res.totalChanges ?? 0,
          lastModifiedAt: res.lastModifiedAt ?? null,
          items: res.items ?? [],
        });
      } else {
        setDirtySummary({
          totalChanges: 1,
          lastModifiedAt: null,
          items: [
            {
              tableName: "Veritabanı",
              title: "Çalışma Dosyası Değişiklikleri",
              action: "other",
              actionLabel: "Düzenlendi",
              count: 1,
              lastTime: "Az önce",
            },
          ],
        });
      }
    } catch (e) {
      console.warn("Değişiklik özeti alınamadı:", e);
      setDirtySummary({
        totalChanges: 1,
        lastModifiedAt: null,
        items: [
          {
            tableName: "Veritabanı",
            title: "Çalışma Dosyası Değişiklikleri",
            action: "other",
            actionLabel: "Düzenlendi",
            count: 1,
            lastTime: "Az önce",
          },
        ],
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const toggleDirtySummary = (): void => {
    if (!isDirtySummaryOpen) {
      loadDirtySummary();
    }
    setIsDirtySummaryOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dirtySummaryRef.current &&
        !dirtySummaryRef.current.contains(event.target as Node)
      ) {
        setIsDirtySummaryOpen(false);
      }
    };
    if (isDirtySummaryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDirtySummaryOpen]);

  // Ekran genişliği takibi (Dinamik taşma menüsü hesaplaması için)
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = (): void => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mod Seçici Durumu: 'dogrudan_temin' (KİK 22) veya 'ihale' (KİK 19 / 21)
  const [procurementMode, setProcurementMode] = useState<
    "dogrudan_temin" | "ihale"
  >(() => {
    return (
      (localStorage.getItem("temin_procurement_mode") as
        | "dogrudan_temin"
        | "ihale") ||
      "dogrudan_temin"
    );
  });

  const isDt = procurementMode === "dogrudan_temin";
  const [switchFeedback, setSwitchFeedback] = useState<string | null>(null);

  const handleModeChange = (mode: "dogrudan_temin" | "ihale"): void => {
    if (mode === procurementMode) return;
    setProcurementMode(mode);
    localStorage.setItem("temin_procurement_mode", mode);
    window.dispatchEvent(
      new CustomEvent("procurement-mode-change", {
        detail: { mode },
      }),
    );

    const message = mode === "dogrudan_temin"
      ? "Doğrudan Temin Modu (KİK Md. 22) Aktif"
      : "İhale Süreçleri Modu (KİK Md. 19 / 21) Aktif";
    setSwitchFeedback(message);
    setTimeout(() => {
      setSwitchFeedback(null);
    }, 2400);
  };

  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const handleSaveAndSync = async (): Promise<void> => {
    try {
      setIsDirtySummaryOpen(false);
      setSaveFeedback("💾 Dosya kaydediliyor...");
      const saveRes = await window.electron?.ipcRenderer.invoke(
        "workspace:save",
      );
      if (!saveRes?.success) {
        throw new Error(saveRes?.error || "Dosya kaydedilemedi.");
      }

      // Google Drive yapılandırılmış mı kontrol et
      const s = await window.electron?.ipcRenderer.invoke("db:get-settings");
      if (s?.gdriveAccessToken) {
        setSaveFeedback("☁️ Google Drive bulutuna yedekleniyor...");
        const gdriveRes = await window.electron?.ipcRenderer.invoke(
          "workspace:backup-gdrive",
          { force: true },
        );
        if (gdriveRes?.success) {
          if (gdriveRes?.skipped) {
            setSaveFeedback(
              "✓ Kaydedildi (Google Drive yedeği zaten güncel)",
            );
          } else {
            setSaveFeedback(
              "✓ Kaydedildi ve Google Drive'a başarıyla yedeklendi",
            );
          }
        } else {
          setSaveFeedback(
            `⚠️ Kaydedildi, ancak bulut: ${gdriveRes?.error || "Yetki hatası"}`,
          );
        }
      } else {
        setSaveFeedback("✓ Çalışma dosyası başarıyla kaydedildi");
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setSaveFeedback(`❌ Kaydetme hatası: ${errorMsg}`);
    } finally {
      setTimeout(() => {
        setSaveFeedback(null);
      }, 3500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveAndSync();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCloseWorkspace = async (): Promise<void> => {
    window.dispatchEvent(new CustomEvent("workspace-close-request"));
  };

  const [updateStatus, setUpdateStatus] = useState<
    {
      status: string;
      version?: string;
    } | null
  >(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const removeListener = window.electron?.ipcRenderer.on(
      "updater:status",
      (_event, data: { status: string; version?: string }) => {
        setUpdateStatus(data);
      },
    );

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  useEffect(() => {
    const menuBar = document.getElementById("native-menu-bar");
    function handleClickOutside(e: MouseEvent): void {
      if (menuBar && !menuBar.contains(e.target as Node)) {
        setActiveMenu(null);
        setHoveredSubMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuHover = (menuName: string): void => {
    if (activeMenu) {
      setActiveMenu(menuName);
    }
  };

  const handleClose = (): void =>
    window.electron?.ipcRenderer.send("window-close");

  const menus = [
    {
      name: "Dosya",
      items: [
        {
          label: "Gösterge Paneli",
          onClick: () => navigate({ to: "/" }),
        },
        {
          label: "Yeni Doğrudan Temin Dosyası",
          onClick: () => navigate({ to: "/dosyalar/yeni" }),
        },
        {
          label: "Çalışma Dosyası Detayları (.temin)",
          onClick: () => navigate({ to: "/dosya" }),
        },
        {
          label: "💾 Değişiklikleri Kaydet & Drive'a Gönder (Ctrl+S)",
          onClick: handleSaveAndSync,
        },
        {
          label: "💾 Farklı Kaydet (Yeni Format .temin)...",
          onClick: async () => {
            try {
              const res = await window.electron?.ipcRenderer.invoke(
                "workspace:save-as",
              );
              if (res?.success && res.newFilePath) {
                alert(
                  `Çalışma dosyanız yeni konuma (.temin) başarıyla kaydedildi:\n\n${res.newFilePath}`,
                );
                window.location.reload();
              } else if (res?.error && res.error !== "İşlem iptal edildi.") {
                alert(`Farklı kaydetme başarısız!\nHata: ${res.error}`);
              }
            } catch (e) {
              console.error(e);
            }
          },
        },
        ...(isOldFormat
          ? [
            {
              label: "⚡ Güncel Formata Dönüştür & Kaydet (.temin)",
              onClick: async () => {
                try {
                  const res = await useWorkspaceStore.getState()
                    .upgradeToTemin();
                  if (res?.success && res.newPath) {
                    alert(
                      `Dosyanız başarıyla yeni nesil TEMİN 360 formatına (.temin) dönüştürüldü ve kaydedildi:\n\n${res.newPath}`,
                    );
                    window.location.reload();
                  } else {
                    alert(
                      `Format dönüştürülemedi!\nHata: ${
                        res?.error || "Bilinmeyen hata"
                      }`,
                    );
                  }
                } catch (e: any) {
                  alert(`Hata: ${e.message}`);
                }
              },
            },
          ]
          : []),
        {
          label: "Kullanıcı Profili",
          onClick: () => navigate({ to: "/profil" }),
        },
        { divider: true },
        {
          label: "Farklı Çalışma Dosyası Aç (.temin, .dtal, .hkmp...)...",
          onClick: async () => {
            try {
              const res = await window.electron?.ipcRenderer.invoke(
                "dialog:showOpenDialog",
              );
              if (!res?.canceled && res?.filePath) {
                const filePath = res.filePath as string;
                const ext = (filePath.split(".").pop() || "").toLowerCase();
                if (ext !== "temin") {
                  setUpgradeFilePath(filePath);
                  setShowFormatUpgradeModal(true);
                } else {
                  const result = await useWorkspaceStore
                    .getState()
                    .openWorkspace(filePath, false);
                  if (result.success) {
                    window.location.reload();
                  } else {
                    alert(
                      `Çalışma dosyası açılamadı!\nHata: ${
                        result.error || "Bilinmeyen hata"
                      }`,
                    );
                  }
                }
              }
            } catch (e) {
              console.error(e);
            }
          },
        },
        {
          label: "Çalışma Dosyasını Kapat",
          onClick: handleCloseWorkspace,
        },
        { divider: true },
        { label: "Uygulamadan Çık (Alt+F4)", onClick: handleClose },
      ],
    },
    // Mod Bazlı Menüler: Doğrudan Temin vs İhale Süreçleri
    ...(procurementMode === "dogrudan_temin"
      ? [
        {
          name: "Doğrudan Temin",
          onClick: () => navigate({ to: "/dosyalar" }),
          items: [
            {
              label: "Tüm Doğrudan Temin Dosyaları",
              onClick: () => navigate({ to: "/dosyalar" }),
            },
            {
              label: "Yeni Dosya Oluştur",
              onClick: () => navigate({ to: "/dosyalar/yeni" }),
            },
            {
              label: "Hızlı Dosya Ekle / Güncelle",
              onClick: () => navigate({ to: "/hizli-dosya-ekle" }),
            },
            {
              label: "Süreç Akış Haritası (Beta)",
              onClick: () => navigate({ to: "/surec-akisi" }),
            },
          ],
        },
        ...(activeDosyaId
          ? [
            {
              name: "Süreç Yönetimi",
              items: [
                {
                  label: "Süreç Takip & Durum Paneli",
                  onClick: () => navigate({ to: "/takip" }),
                },
                {
                  label: "🧭 Süreç Akış Haritası (Beta - Tablar)",
                  onClick: () => navigate({ to: "/surec-akisi" }),
                },
                {
                  label: "Belge Çıktı Merkezi",
                  onClick: () => navigate({ to: "/cikti-merkezi" }),
                },
                {
                  label: "Hızlı Dosya Ekle / Güncelle",
                  onClick: () => navigate({ to: "/hizli-dosya-ekle" }),
                },
                {
                  label: "Şablon & Taslak Yöneticisi",
                  onClick: () => navigate({ to: "/taslakyonetim" }),
                },
                {
                  label: "📝 Dosya Notları & Yapılacaklar (To-Do)",
                  onClick: () => navigate({ to: "/notlar" }),
                },
              ],
            },
            {
              name: "Adım Adım Süreç",
              items: [
                {
                  label: "1. İhtiyaç Listesi & Maliyet & Onay",
                  onClick: () => navigate({ to: "/dosya/hazirlik-ve-ihtiyac" }),
                },
                {
                  label: "2. Piyasa Fiyat Araştırması",
                  onClick: () =>
                    navigate({ to: "/dosya/piyasa-fiyat-arastirmasi" }),
                },
                {
                  label: "3. Sipariş & Sözleşme",
                  onClick: () => navigate({ to: "/dosya/siparis-ve-sozlesme" }),
                },
                {
                  label: "4. Muayene & Kabul & Ödeme İşlemleri",
                  onClick: () => navigate({ to: "/dosya/kabul-ve-odeme" }),
                },
                {
                  label: "5. Klasör & Kapaklar",
                  onClick: () => navigate({ to: "/dosya/klasor-ve-kapaklar" }),
                },
              ],
            },
          ]
          : []),
      ]
      : [
        {
          name: "İhale Yönetimi",
          onClick: () => navigate({ to: "/harcama-merkezi" }),
          items: [
            {
              label: "Açık İhale Süreçleri (KİK Md. 19)",
              onClick: () => navigate({ to: "/harcama-merkezi" }),
            },
            {
              label: "Pazarlık Usulü İhale (KİK Md. 21)",
              onClick: () => navigate({ to: "/harcama-merkezi" }),
            },
            {
              label: "İhale Hakediş & Harcama Raporları",
              onClick: () => navigate({ to: "/hakedis" }),
            },
            { divider: true },
            {
              label: "Şablon & Kategori Yönetimi",
              onClick: () => navigate({ to: "/degiskenler" }),
            },
            {
              label: "Taslak & Belge Havuzu",
              onClick: () => navigate({ to: "/taslakyonetim" }),
            },
          ],
        },
        ...(activeDosyaId
          ? [
            {
              name: "İhale Süreç Adımları",
              items: [
                {
                  label: "1. İhale Onay Belgesi & Şartnameler",
                  onClick: () => navigate({ to: "/dosya/hazirlik-ve-ihtiyac" }),
                },
                {
                  label: "2. İhale İlanı & Davet Mektupları",
                  onClick: () =>
                    navigate({ to: "/dosya/piyasa-fiyat-arastirmasi" }),
                },
                {
                  label: "3. Teklif Değerlendirme & Komisyon Kararı",
                  onClick: () => navigate({ to: "/dosya/siparis-ve-sozlesme" }),
                },
                {
                  label: "4. Sözleşme & Teminat İşlemleri",
                  onClick: () => navigate({ to: "/dosya/kabul-ve-odeme" }),
                },
                {
                  label: "5. İhale Klasörü & Arşivleme",
                  onClick: () => navigate({ to: "/dosya/klasor-ve-kapaklar" }),
                },
              ],
            },
            {
              name: "İhale İşlemleri",
              items: [
                {
                  label: "İhale Dosya Durumu & Takip",
                  onClick: () => navigate({ to: "/takip" }),
                },
                {
                  label: "İhale Belge Çıktı Merkezi",
                  onClick: () => navigate({ to: "/cikti-merkezi" }),
                },
                {
                  label: "Hakediş & Ödeme Takibi",
                  onClick: () => navigate({ to: "/hakedis" }),
                },
              ],
            },
          ]
          : []),
        {
          name: "İhale Mevzuatı",
          items: [
            {
              label: "İhale Eşik Değerleri & Limitler",
              onClick: () => navigate({ to: "/mevzuat" }),
            },
            {
              label: "KİK Standart Şablon & Formlar",
              onClick: () => navigate({ to: "/taslakyonetim" }),
            },
            {
              label: "Mevzuat & Genelgeler",
              onClick: () => navigate({ to: "/mevzuat" }),
            },
          ],
        },
      ]),
    {
      name: isDt ? "Sistem Tanımları (DT)" : "Sistem Tanımları (İhale)",
      items: isDt
        ? [
          {
            label: "🛒 Kurum & Harcama Birimi Bilgileri",
            onClick: () => navigate({ to: "/kurum" }),
          },
          {
            label: "🛒 Doğrudan Temin Birimleri",
            onClick: () => navigate({ to: "/birimler" }),
          },
          {
            label: "🛒 Harcama Yetkilileri & Personel",
            onClick: () => navigate({ to: "/personel" }),
          },
          {
            label: "🛒 Piyasa Fiyat Araştırma Görevlileri",
            onClick: () => navigate({ to: "/komisyonlar" }),
          },
          {
            label: "🛒 Muayene & Kabul Komisyonları",
            onClick: () => navigate({ to: "/komisyonlar" }),
          },
          {
            label: "🛒 Görev & Yetki Tanımları",
            onClick: () => navigate({ to: "/komisyon-gorevleri" }),
          },
          { divider: true },
          {
            label: "🛒 Doğrudan Temin İstekli Firmaları",
            onClick: () => navigate({ to: "/firmalar" }),
          },
          {
            label: "🛒 Mal / Hizmet / Tüketim Listesi",
            onClick: () => navigate({ to: "/malzemeler" }),
          },
          {
            label: "🛒 Taşınır Kodları & Ölçü Birimleri",
            onClick: () => navigate({ to: "/tasinirkod" }),
          },
          {
            label: "🛒 Ambar & Depo Tanımları",
            onClick: () => navigate({ to: "/ambar" }),
          },
          {
            label: "📈 Yİ-ÜFE Endeksleri (TÜİK & hakedis.org)",
            onClick: () =>
              navigate({ to: "/mevzuat", search: { tab: "yi-ufe" } as any }),
          },
          { divider: true },
          {
            label: "🏛️ İhale Tanımlarına Geç (Pozlar & OKAS)",
            onClick: () => handleModeChange("ihale"),
          },
        ]
        : [
          {
            label: "🏛️ İdare & İhale Makamı Bilgileri",
            onClick: () => navigate({ to: "/kurum" }),
          },
          {
            label: "🏛️ İhale / İhale Kayıt Birimleri (EKAP)",
            onClick: () => navigate({ to: "/birimler" }),
          },
          {
            label: "🏛️ İhale Yetkilileri & Raportörler",
            onClick: () => navigate({ to: "/personel" }),
          },
          {
            label: "🏛️ İhale Komisyonları (KİK Md. 6 - Asıl/Yedek)",
            onClick: () => navigate({ to: "/komisyonlar" }),
          },
          {
            label: "🏛️ Muayene, Denetim ve Kabul Heyetleri",
            onClick: () => navigate({ to: "/komisyonlar" }),
          },
          {
            label: "🏛️ Komisyon Görev ve Yetki Matrisi",
            onClick: () => navigate({ to: "/komisyon-gorevleri" }),
          },
          { divider: true },
          {
            label: "🏛️ İhale İsteklileri & Müteahhit Firmalar",
            onClick: () => navigate({ to: "/firmalar" }),
          },
          {
            label: "🏛️ ÇŞB Birim Fiyat Pozları (Yapım & Onarım)",
            onClick: () => navigate({ to: "/pozlar" }),
          },
          {
            label: "🏛️ OKAS (Kamu Alımları Sözlüğü) Kodları",
            onClick: () => navigate({ to: "/okaskod" }),
          },
          {
            label: "🏛️ İhale Eşik Değerleri ve Limit Parametreleri",
            onClick: () =>
              navigate({ to: "/mevzuat", search: { tab: "limitler" } as any }),
          },
          {
            label: "📈 Yİ-ÜFE Fiyat Farkı & Değerleme Endeksleri",
            onClick: () =>
              navigate({ to: "/mevzuat", search: { tab: "yi-ufe" } as any }),
          },
          { divider: true },
          {
            label: "🛒 Doğrudan Temin Tanımlarına Geç (22/d)",
            onClick: () => handleModeChange("dogrudan_temin"),
          },
        ],
    },
    {
      name: "Yönetim & Yardım",
      items: [
        {
          label: "Genel Ayarlar",
          onClick: () => navigate({ to: "/ayarlar" }),
        },
        {
          label: "Mevzuat ve Parametreler",
          onClick: () =>
            navigate({ to: "/mevzuat", search: { tab: "kutuphane" } as any }),
        },
        {
          label: "📈 TÜİK Yİ-ÜFE Endeksleri & Değerleme",
          onClick: () =>
            navigate({ to: "/mevzuat", search: { tab: "yi-ufe" } as any }),
        },
        {
          label: "Şablon & Kategori Yönetimi",
          onClick: () => navigate({ to: "/degiskenler" }),
        },
        {
          label: "Şablon Listesi ve Süreçler",
          onClick: () => navigate({ to: "/taslakyonetim" }),
        },
        {
          label: "Toplu İçe Aktarma",
          onClick: () => navigate({ to: "/import" }),
        },
        {
          label: "Raporlar",
          onClick: () => navigate({ to: "/raporlar" }),
        },
        {
          label: "📋 Notlar & Yapılacaklar Listesi (To-Do)",
          onClick: () => navigate({ to: "/notlar" }),
        },
        { divider: true },
        {
          label: "Arayüzü Yenile (Ctrl+R)",
          onClick: () => window.location.reload(),
        },
        {
          label: "Geliştirici Araçları (DevTools)",
          onClick: () =>
            window.electron?.ipcRenderer.send("window-toggle-devtools"),
        },
        {
          label: "Test Verisi Tohumla (Dev Seed)",
          onClick: () =>
            navigate({ to: "/ayarlar", search: { tab: "developer" } as any }),
        },
        { divider: true },
        {
          label: "Kullanım Kılavuzu & Yardım",
          onClick: () => navigate({ to: "/yardim" }),
        },
        {
          label: "Sürüm Notları (Changelog)",
          onClick: () => navigate({ to: "/changelog" }),
        },
        {
          label: "Hakkında...",
          onClick: () =>
            alert(
              "TEMİN 360\nKamu Harcama, İhale, Doğrudan Temin ve Hakediş Yönetim Sistemi",
            ),
        },
      ],
    },
  ];

  // Ekran daraldıkça menülerin taşmasını önleyen dinamik hesaplama
  const maxVisibleMenus = (() => {
    if (windowWidth >= 1520) return 7;
    if (windowWidth >= 1340) return 5;
    if (windowWidth >= 1180) return 4;
    if (windowWidth >= 1020) return 3;
    return 2;
  })();

  const visibleMenus = menus.slice(0, maxVisibleMenus);
  const overflowMenus = menus.slice(maxVisibleMenus);

  return (
    <header
      className="flex flex-col bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shrink-0 z-50 shadow-xs transition-all duration-300 relative select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Üst Vurgu Çizgisi: Seçilen moda göre şık renk tonu */}
      <div
        className={`h-[2px] w-full transition-all duration-500 bg-gradient-to-r ${
          isDt
            ? "from-blue-500 via-sky-400 to-indigo-500"
            : "from-indigo-600 via-purple-500 to-pink-500"
        }`}
      />

      {/* Geçiş Bildirimi Toast (Mikro Bildirim) */}
      {switchFeedback && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 text-xs font-semibold shadow-xl border border-slate-700/50 dark:border-slate-300/50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{switchFeedback}</span>
        </div>
      )}

      {/* ÜST SATIR: Menü Çubuğu, Mod Switcher ve Sistem/Pencere Kontrolleri */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-slate-200/40 dark:border-slate-800/40 relative z-30">
        {/* SOL: VS Code-Style Responsive Menu Bar */}
        <div
          id="native-menu-bar"
          className="flex items-center gap-0.5 z-50 text-[11px] font-medium"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* App / Kurum Logo */}
          <div className="flex items-center justify-center w-6 h-6 mr-1.5 opacity-95">
            <img
              src={institutionLogo || logoLeft || appIcon}
              alt="Logo"
              className="w-full h-full object-contain drop-shadow-xs"
              onError={(e) => {
                // Fallback to appIcon if custom logo fails to render
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
                    m.onClick();
                    setActiveMenu(null);
                    setHoveredSubMenu(null);
                  } else {
                    setActiveMenu(activeMenu === m.name ? null : m.name);
                    setHoveredSubMenu(null);
                  }
                }}
                onMouseEnter={() => {
                  if (m.onClick) {
                    setActiveMenu(null);
                  } else {
                    handleMenuHover(m.name);
                  }
                }}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeMenu === m.name
                    ? isDt
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 font-semibold"
                      : "bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-semibold"
                    : "text-slate-600 dark:text-slate-350 hover:bg-slate-200/40 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {m.name}
              </button>

              {activeMenu === m.name && m.items && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl py-1 z-[100] animate-in fade-in slide-in-from-top-1">
                  {m.items.map((item, idx) =>
                    item.divider
                      ? (
                        <div
                          key={idx}
                          className="h-[1px] bg-slate-150 dark:bg-slate-800 my-1"
                        />
                      )
                      : (
                        <button
                          key={idx}
                          onClick={() => {
                            item.onClick?.();
                            setActiveMenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 ${
                            isDt
                              ? "hover:bg-blue-600 hover:text-white"
                              : "hover:bg-indigo-600 hover:text-white"
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
                  setActiveMenu(
                    activeMenu === "__overflow__" ? null : "__overflow__",
                  );
                  setHoveredSubMenu(null);
                }}
                onMouseEnter={() => {
                  if (activeMenu && activeMenu !== "__overflow__") {
                    setActiveMenu("__overflow__");
                  }
                }}
                title="Diğer Menüler"
                className={`p-1 px-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center ${
                  activeMenu === "__overflow__" || overflowMenus.some((m) =>
                      m.name === activeMenu
                    )
                    ? isDt
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 font-semibold"
                      : "bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-semibold"
                    : "text-slate-600 dark:text-slate-350 hover:bg-slate-200/40 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {activeMenu === "__overflow__" && (
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
                            om.onClick();
                            setActiveMenu(null);
                            setHoveredSubMenu(null);
                          } else {
                            setHoveredSubMenu(
                              hoveredSubMenu === om.name ? null : om.name,
                            );
                          }
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 ${
                          hoveredSubMenu === om.name
                            ? isDt
                              ? "bg-blue-600 text-white"
                              : "bg-indigo-600 text-white"
                            : isDt
                            ? "hover:bg-blue-50 dark:hover:bg-blue-950/60"
                            : "hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
                        } transition-colors cursor-pointer`}
                      >
                        <span>{om.name}</span>
                        {om.items && (
                          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                        )}
                      </button>

                      {/* Kaskad Alt Menü (Nested Flyout) */}
                      {hoveredSubMenu === om.name && om.items && (
                        <div className="absolute top-0 left-full ml-1 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl py-1 z-[120] animate-in fade-in slide-in-from-left-1">
                          {om.items.map((item, idx) =>
                            item.divider
                              ? (
                                <div
                                  key={idx}
                                  className="h-[1px] bg-slate-150 dark:bg-slate-800 my-1"
                                />
                              )
                              : (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    item.onClick?.();
                                    setActiveMenu(null);
                                    setHoveredSubMenu(null);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 ${
                                    isDt
                                      ? "hover:bg-blue-600 hover:text-white"
                                      : "hover:bg-indigo-600 hover:text-white"
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

        {/* ORTA: Excel / Ofis Tarzı Çalışma Dosyası Başlığı ve Kayıt Durumu */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-all pointer-events-auto z-40"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span
              className="max-w-[220px] truncate font-semibold"
              title={fileName || "Çalışma Dosyası"}
            >
              {fileName || "Çalışma Dosyası"}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 select-none">
            •
          </span>

          {saveFeedback
            ? (
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 animate-pulse flex items-center gap-1">
                {saveFeedback}
              </span>
            )
            : isDirty
            ? (
              <div className="relative z-50" ref={dirtySummaryRef}>
                <div className="inline-flex items-center shadow-xs rounded-full border border-amber-300/60 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                  <button
                    onClick={handleSaveAndSync}
                    className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-l-full text-[11px] font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer group"
                    title="Değişiklikleri ana dosyaya kaydet (Ctrl+S)"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-0.5" />
                    <span>Değiştirildi (Kaydet)</span>
                    <Save className="w-3 h-3 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={toggleDirtySummary}
                    className="px-1.5 py-0.5 border-l border-amber-300/50 dark:border-amber-700/40 rounded-r-full hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer text-amber-700 dark:text-amber-300 flex items-center"
                    title="Nelerin değiştiğini gör (Özet)"
                  >
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-150 ${
                        isDirtySummaryOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Tıklayınca Açılan Değişiklik Özeti Popover'ı */}
                {isDirtySummaryOpen && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-84 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100 text-left drop-shadow-2xl">
                    {/* Başlık */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                          Kaydedilmemiş Değişiklikler
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                        {dirtySummary?.totalChanges || 1} işlem
                      </span>
                    </div>

                    {/* Detay Listesi */}
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar text-[11px]">
                      {isLoadingSummary
                        ? (
                          <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            <span>Yükleniyor...</span>
                          </div>
                        )
                        : dirtySummary && dirtySummary.items.length > 0
                        ? (
                          dirtySummary.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <span
                                  className="font-medium text-slate-700 dark:text-slate-200 truncate"
                                  title={item.title}
                                >
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {item.actionLabel} • Son: {item.lastTime}
                                </span>
                              </div>
                              <span className="shrink-0 font-semibold px-1.5 py-0.2 rounded text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/30">
                                +{item.count}
                              </span>
                            </div>
                          ))
                        )
                        : (
                          <div className="py-4 text-center text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
                            <FileSpreadsheet className="w-5 h-5 text-amber-500 opacity-80" />
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {dirtySummary && dirtySummary.totalChanges > 0
                                ? `${dirtySummary.totalChanges} adet veri işlemi kaydedilmeyi bekliyor.`
                                : "Çalışma dosyasında kaydedilmeyi bekleyen değişiklikler mevcut."}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Dosyayı senkronize etmek için aşağıdaki butona
                              tıklayın.
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Son Değişiklik Saati */}
                    {dirtySummary?.lastModifiedAt && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <Clock className="w-3 h-3" />
                        <span>
                          Son Değişiklik: {dirtySummary.lastModifiedAt}
                        </span>
                      </div>
                    )}

                    {/* Aksiyon Butonları */}
                    <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setIsDirtySummaryOpen(false)}
                        className="px-2.5 py-1 text-[11px] rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Kapat
                      </button>
                      <button
                        onClick={async () => {
                          setIsDirtySummaryOpen(false);
                          await handleSaveAndSync();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>Şimdi Kaydet (Ctrl+S)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
            : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/40"
                title="Tüm değişiklikler çalışma dosyasına kaydedildi."
              >
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Kaydedildi</span>
              </span>
            )}
        </div>

        {/* SAĞ: Mod Geçiş Switch'i + Sistem Kontrolleri (Tema, Eşitleme, Bildirim, vb.) */}
        <div
          className="flex items-center space-x-2 pr-36"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Sayıyı Yazıya Çevirici Hızlı Araç */}
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("open:sayiyi-yaziya-cevir", {
                  detail: { value: "282.112,00" },
                }),
              )}
            className="p-1 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
            title="Sayıyı Yazıya Çevirici (TL)"
          >
            <Coins className="w-3.5 h-3.5" />
          </button>

          {/* Notlar & Yapılacaklar (To-Do) Hızlı Erişim Butonu */}
          <button
            onClick={() => navigate({ to: "/notlar" })}
            className="p-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
            title="Notlar & Yapılacaklar Listesi (To-Do)"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          {/* Tema Değiştir */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
            title="Tema Değiştir"
          >
            {theme === "dark"
              ? <Sun className="w-3.5 h-3.5" />
              : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Güncelleme Durumu */}
          {updateStatus &&
            (updateStatus.status === "available" ||
              updateStatus.status === "downloaded") &&
            (
              <button
                onClick={() => {
                  if (updateStatus.status === "downloaded") {
                    window.electron?.ipcRenderer.invoke(
                      "updater:quit-and-install",
                    );
                  } else {
                    alert(
                      "Güncelleme arka planda indiriliyor, lütfen bekleyin...",
                    );
                  }
                }}
                className="relative p-1 text-blue-500 hover:text-blue-600 transition-all rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                title={updateStatus.status === "downloaded"
                  ? `Yeni sürüm hazır: ${updateStatus.version} (Kurmak için tıkla)`
                  : `Yeni sürüm iniyor: ${updateStatus.version}...`}
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white dark:border-slate-900 shadow-sm animate-pulse">
                </span>
              </button>
            )}

          {/* Senkronizasyon & Bulut Popover */}
          <SyncPopover />

          {/* Bildirim Popover */}
          <NotificationPopover
            isOpen={showNotifications}
            onToggle={setShowNotifications}
          />
        </div>

        {/* Pencere Kontrolleri */}
        <WindowControls />
      </div>

      {/* ALT SATIR: Çalışma Dosyası Seçimi, Mod Rozeti & Süreç Butonları */}
      <div
        className="min-h-9 py-1.5 flex items-center justify-between bg-slate-100/50 dark:bg-slate-950/20 border-t border-slate-200/30 dark:border-slate-800/30 select-none px-4 relative z-10"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {/* Sol: İnce ve Şık Aktif Çalışma Modu Rozeti */}
        <div className="w-[280px] shrink-0 hidden lg:flex items-center">
          <button
            type="button"
            onClick={() => handleModeChange(isDt ? "ihale" : "dogrudan_temin")}
            title="Süreç modunu değiştirmek için tıklayın (Doğrudan Temin ↔ İhale Süreçleri)"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all duration-300 border cursor-pointer hover:opacity-85 ${
              isDt
                ? "bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40"
                : "bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDt ? "bg-blue-500" : "bg-indigo-500"
              } animate-pulse`}
            />
            <span>
              {isDt
                ? "Doğrudan Temin (Md. 22)"
                : "İhale İşlemleri (Md. 19 / 21)"}
            </span>
          </button>
        </div>

        {/* Orta: Temin Seçici */}
        <div className="flex-1 flex justify-center">
          <TeminSelector />
        </div>

        {/* Sağ: Süreç & Çıktı Butonları */}
        {activeDosyaId
          ? (
            <div className="flex items-center gap-2 shrink-0 min-w-[280px] justify-end">
              <Link
                to="/takip"
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all shadow-2xs hover:shadow-xs border ${
                  isDt
                    ? "text-blue-700 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 border-blue-200/50 dark:border-blue-900/30"
                    : "text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 border-indigo-200/50 dark:border-indigo-900/30"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                {isDt ? "Doğrudan Temin & Durum" : "İhale Takip & Durum"}
              </Link>
              <Link
                to="/surec-akisi"
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50/80 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 border border-purple-200/50 dark:border-purple-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
                title="Süreç Akış Haritası (Beta Tablar)"
              >
                <Layers className="w-3.5 h-3.5" />
                Süreç Akışı (Beta)
              </Link>
              <Link
                to="/cikti-merkezi"
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-100/50 dark:border-emerald-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Çıktı Merkezi
              </Link>
            </div>
          )
          : <div className="min-w-[280px] shrink-0 hidden lg:block"></div>}
      </div>

      {saveFeedback && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full shadow-lg text-xs font-medium bg-slate-900/95 dark:bg-slate-800 text-white backdrop-blur border border-slate-700 flex items-center gap-2 pointer-events-none transition-all duration-300">
          <span>{saveFeedback}</span>
        </div>
      )}

      <FormatUpgradeModal
        isOpen={showFormatUpgradeModal}
        filePath={upgradeFilePath}
        onClose={() => setShowFormatUpgradeModal(false)}
        onUpgradeAndOpen={handleUpgradeAndOpen}
      />
    </header>
  );
}
