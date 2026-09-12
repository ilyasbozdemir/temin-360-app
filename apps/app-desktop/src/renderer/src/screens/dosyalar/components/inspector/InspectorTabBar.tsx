import React, { useState } from "react";
import {
  Building2,
  Check,
  Code,
  Copy,
  FileSpreadsheet,
  FileText,
  Layers,
  Users,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { TabType } from "./types";

interface InspectorTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  kalemlerCount: number;
  firmalarCount: number;
  komisyonCount: number;
  fullPayload: any;
}

export const InspectorTabBar: React.FC<InspectorTabBarProps> = ({
  activeTab,
  onTabChange,
  kalemlerCount,
  firmalarCount,
  komisyonCount,
  fullPayload,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = async () => {
    try {
      const text = JSON.stringify(fullPayload, null, 2);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Kopyalama hatası:", err);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 gap-2 overflow-x-auto">
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <button
          onClick={() => onTabChange("genel")}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "genel"
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Genel Bakış
        </button>
        <button
          onClick={() => onTabChange("kunye")}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "kunye"
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Dosya Künyesi & Bütçe
        </button>
        <button
          onClick={() => onTabChange("kalemler")}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "kalemler"
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          İhtiyaç Listesi ({kalemlerCount})
        </button>
        <button
          onClick={() => onTabChange("firmalar")}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "firmalar"
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Firmalar & Teklifler ({firmalarCount})
        </button>
        <button
          onClick={() => onTabChange("komisyon")}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "komisyon"
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Komisyon ({komisyonCount})
        </button>
        <button
          onClick={() => onTabChange("rawjson")}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "rawjson"
              ? "bg-slate-800 text-white font-bold shadow-xs"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          JSON
        </button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyJson}
        className="text-xs h-7 gap-1 px-2.5 text-slate-500"
      >
        {copied
          ? <Check className="w-3.5 h-3.5 text-emerald-500" />
          : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Kopyalandı" : "Kopyala"}
      </Button>
    </div>
  );
};
