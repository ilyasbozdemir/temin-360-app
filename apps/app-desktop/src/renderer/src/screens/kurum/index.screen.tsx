import React, { useState } from "react";
import { KurumVerisi, useKurumHooks } from "./kurum.hooks";
import { Button } from "../../components/ui/Button";
import {
  Building2,
  ClipboardCheck,
  LayoutGrid,
  MapPin,
  Save,
  ShieldCheck,
  Users,
  Warehouse,
} from "lucide-react";
import { InnerMenu, InnerMenuItem } from "../../components/ui/InnerMenu";
import { IdariBilgilerTab } from "./components/IdariBilgilerTab";
import { MaliBirimTab } from "./components/MaliBirimTab";
import { IletisimTab } from "./components/IletisimTab";
import { LogolarTab } from "./components/LogolarTab";
import { useSettingsStore } from "../../store/settingsStore";

import { useNavigate, useRouterState } from "@tanstack/react-router";

import BirimlerScreen from "../birimler/index.screen";
import PersonelScreen from "../personel/index.screen";
import KomisyonlarScreen from "../komisyonlar/index.screen";
import KomisyonGorevleriScreen from "../komisyon-gorevleri/index.screen";
import AmbarScreen from "../ambar/index.screen";

type TabType =
  | "idari"
  | "mali"
  | "iletisim"
  | "logolar"
  | "birimler"
  | "personel"
  | "komisyonlar"
  | "komisyon-gorevleri"
  | "ambar";

export default function KurumScreen(): React.JSX.Element {
  const { kurumData, isLoadingKurum, fetchKurum, saveKurum } = useKurumHooks();
  const {
    institutionLogo: defaultInstitutionLogo,
    logoLeft: defaultLogoLeft,
    logoRight: defaultLogoRight,
    showLogoLeft: defaultShowLogoLeft,
    showLogoRight: defaultShowLogoRight,
    loadSettings: reloadSettingsStore,
  } = useSettingsStore();

  const [saving, setSaving] = useState(false);

  const [localData, setLocalData] = useState<Partial<KurumVerisi>>({});
  const [institutionLetterhead, setInstitutionLetterhead] = useState<string[]>(
    [],
  );
  const [parentInstitutionLines, setParentInstitutionLines] = useState<
    string[]
  >([]);
  const [sozlukData, setSozlukData] = useState<any[]>([]);

  const [institutionLogo, setInstitutionLogo] = useState<string | null>(
    defaultInstitutionLogo,
  );
  const [logoLeft, setLogoLeft] = useState<string | null>(defaultLogoLeft);
  const [logoRight, setLogoRight] = useState<string | null>(defaultLogoRight);
  const [showLogoLeft, setShowLogoLeft] = useState<boolean>(
    defaultShowLogoLeft,
  );
  const [showLogoRight, setShowLogoRight] = useState<boolean>(
    defaultShowLogoRight,
  );

  // Fetch initial data
  React.useEffect(() => {
    fetchKurum();
  }, [fetchKurum]);

  const initializedRef = React.useRef(false);
  // Initialize form when data loads
  React.useEffect(() => {
    if (kurumData && !initializedRef.current) {
      initializedRef.current = true;
      setLocalData(kurumData);

      let parsedLetterhead = [""];
      if (kurumData.kurum_anteti) {
        try {
          const parsed = JSON.parse(kurumData.kurum_anteti);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedLetterhead = parsed;
          } else {
            parsedLetterhead = [kurumData.kurum_anteti];
          }
        } catch {
          parsedLetterhead = [kurumData.kurum_anteti];
        }
      }
      setInstitutionLetterhead(parsedLetterhead);

      let parsedParent = [""];
      if (kurumData.ust_kurum_adi) {
        try {
          const parsedP = JSON.parse(kurumData.ust_kurum_adi);
          if (Array.isArray(parsedP) && parsedP.length > 0) {
            parsedParent = parsedP;
          } else {
            parsedParent = [kurumData.ust_kurum_adi];
          }
        } catch {
          parsedParent = [kurumData.ust_kurum_adi];
        }
      }
      setParentInstitutionLines(parsedParent);
    }
  }, [kurumData]);

  // Load sözlük data
  React.useEffect(() => {
    window.electron.ipcRenderer
      .invoke("db:query", "SELECT * FROM TANIM_KodSozlugu WHERE aktif_mi = 1")
      .then((res: any) => {
        if (res.success && res.data) {
          setSozlukData(res.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (key: keyof KurumVerisi, value: any) => {
    setLocalData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const dataToSave = { ...localData } as KurumVerisi;
      dataToSave.kurum_anteti = JSON.stringify(
        institutionLetterhead.filter((l) => l.trim() !== ""),
      );
      dataToSave.ust_kurum_adi = JSON.stringify(
        parentInstitutionLines.filter((l) => l.trim() !== ""),
      );

      await saveKurum(dataToSave);

      // Save logos to settings
      await window.electron.ipcRenderer.invoke("db:save-settings", {
        institutionLogo,
        logoLeft,
        logoRight,
        showLogoLeft: String(showLogoLeft),
        showLogoRight: String(showLogoRight),
      });

      await reloadSettingsStore(); // refresh app-wide settings store
      alert("Kurum bilgileri başarıyla kaydedildi.");
    } catch (err) {
      alert("Kaydetme hatası: " + err);
    } finally {
      setSaving(false);
    }
  };

  const navigate = useNavigate();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  
  // TanStack Hash Router search resolution
  const locationSearch = routerState.location.search as any;
  const hashSearch = window.location.hash.includes("?")
    ? window.location.hash.substring(window.location.hash.indexOf("?"))
    : "";
  const searchParams = new URLSearchParams(hashSearch || window.location.search);
  const queryTab =
    (typeof locationSearch === "object" ? locationSearch?.tab : null) ||
    searchParams.get("tab");

  let activeTab: TabType = "idari";
  if (pathname === "/birimler" || queryTab === "birimler") {
    activeTab = "birimler";
  } else if (pathname === "/personel" || queryTab === "personel") {
    activeTab = "personel";
  } else if (pathname === "/komisyonlar" || queryTab === "komisyonlar") {
    activeTab = "komisyonlar";
  } else if (
    pathname === "/komisyon-gorevleri" ||
    queryTab === "komisyon-gorevleri"
  ) {
    activeTab = "komisyon-gorevleri";
  } else if (pathname === "/ambar" || queryTab === "ambar") {
    activeTab = "ambar";
  } else if (queryTab === "mali") {
    activeTab = "mali";
  } else if (queryTab === "iletisim") {
    activeTab = "iletisim";
  } else if (queryTab === "logolar") {
    activeTab = "logolar";
  } else {
    activeTab = "idari";
  }

  const handleTabChange = (tabId: string): void => {
    navigate({
      to: "/kurum" as any,
      search: { tab: tabId } as any,
    });
  };

  const menuItems: InnerMenuItem[] = [
    {
      id: "hdr-kurum",
      isHeader: true,
      label: "Kurum Bilgileri",
      icon: null,
    },
    {
      id: "idari",
      label: "İdari Bilgiler",
      icon: <Building2 className="w-4 h-4 shrink-0 text-blue-600" />,
    },
    {
      id: "mali",
      label: "Mali ve Bütçe Kodları",
      icon: <Building2 className="w-4 h-4 shrink-0 text-amber-600" />,
    },
    {
      id: "iletisim",
      label: "İletişim & Konum",
      icon: <MapPin className="w-4 h-4 shrink-0 text-emerald-600" />,
    },
    {
      id: "logolar",
      label: "Kurum Logoları",
      icon: <Building2 className="w-4 h-4 shrink-0 text-violet-600" />,
    },
    {
      id: "div-sep",
      isDivider: true,
      label: "",
      icon: null,
    },
    {
      id: "hdr-tanimlar",
      isHeader: true,
      label: "Teşkilat & Yönetim",
      icon: null,
    },
    {
      id: "birimler",
      label: "Birim Yönetimi",
      icon: <LayoutGrid className="w-4 h-4 shrink-0 text-indigo-500" />,
    },
    {
      id: "personel",
      label: "Personel Yönetimi",
      icon: <Users className="w-4 h-4 shrink-0 text-emerald-500" />,
    },
    {
      id: "komisyonlar",
      label: "Komisyon Yönetimi",
      icon: <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-500" />,
    },
    {
      id: "komisyon-gorevleri",
      label: "Görev Tanımları",
      icon: <ClipboardCheck className="w-4 h-4 shrink-0 text-pink-500" />,
    },
    {
      id: "ambar",
      label: "Ambar Yönetimi",
      icon: <Warehouse className="w-4 h-4 shrink-0 text-orange-500" />,
    },
  ];

  if (isLoadingKurum) {
    return (
      <div className="flex items-center justify-center flex-1 text-slate-500 h-full w-full">
        Kurum bilgileri yükleniyor...
      </div>
    );
  }

  const isKurumTab = ["idari", "mali", "iletisim", "logolar"].includes(
    activeTab,
  );

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
          {isKurumTab
            ? (
              <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-200 dark:border-slate-800 pb-4 gap-4 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-10 pt-4 -mt-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
                      <Building2 className="w-8 h-8 text-blue-600" />
                      Kurum Bilgileri
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                      Resmi evrak çıktılarında ve arayüzde gösterilecek idari ve
                      iletişim bilgilerini yönetin.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-6 text-sm font-semibold transition-all shadow-md shadow-blue-500/20 shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </Button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px]">
                  {activeTab === "idari" && (
                    <IdariBilgilerTab
                      data={localData}
                      onChange={handleChange}
                      institutionLetterhead={institutionLetterhead}
                      setInstitutionLetterhead={setInstitutionLetterhead}
                      parentInstitutionLines={parentInstitutionLines}
                      setParentInstitutionLines={setParentInstitutionLines}
                    />
                  )}
                  {activeTab === "mali" && (
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
                  {activeTab === "iletisim" && (
                    <IletisimTab
                      data={localData}
                      onChange={handleChange}
                      institutionLetterhead={institutionLetterhead}
                      setInstitutionLetterhead={setInstitutionLetterhead}
                      parentInstitutionLines={parentInstitutionLines}
                      setParentInstitutionLines={setParentInstitutionLines}
                    />
                  )}
                  {activeTab === "logolar" && (
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
              </div>
            )
            : (
              <div className="-mt-8 w-full">
                {activeTab === "birimler" && <BirimlerScreen isSubComponent />}
                {activeTab === "personel" && <PersonelScreen isSubComponent />}
                {activeTab === "komisyonlar" && (
                  <KomisyonlarScreen isSubComponent />
                )}
                {activeTab === "komisyon-gorevleri" && (
                  <KomisyonGorevleriScreen isSubComponent />
                )}
                {activeTab === "ambar" && <AmbarScreen isSubComponent />}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
