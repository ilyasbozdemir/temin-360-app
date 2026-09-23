import React from "react";
import {
  CloudUpload,
  Server,
  Mail,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { ShutdownStep } from "./hooks/useWorkspaceCloseHandler";

interface ShutdownOverlayProps {
  isOpen: boolean;
  fileName?: string;
  statusText: string;
  steps: ShutdownStep[];
}

export function ShutdownOverlay({
  isOpen,
  fileName,
  statusText,
  steps,
}: ShutdownOverlayProps): React.JSX.Element | null {
  if (!isOpen) return null;

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const totalSteps = steps.length || 1;
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / totalSteps) * 100),
  );

  const getStepIcon = (iconType: string, status: string) => {
    const iconClass = "w-4 h-4 shrink-0";
    if (status === "running") {
      return (
        <Loader2
          className={cn(iconClass, "animate-spin text-emerald-600 dark:text-emerald-400")}
        />
      );
    }
    if (status === "completed") {
      return (
        <CheckCircle2
          className={cn(iconClass, "text-emerald-600 dark:text-emerald-400")}
        />
      );
    }
    if (status === "error") {
      return (
        <AlertTriangle
          className={cn(iconClass, "text-red-600 dark:text-red-400")}
        />
      );
    }

    switch (iconType) {
      case "gdrive":
        return <CloudUpload className={cn(iconClass, "text-slate-400 dark:text-slate-500")} />;
      case "server":
        return <Server className={cn(iconClass, "text-slate-400 dark:text-slate-500")} />;
      case "email":
        return <Mail className={cn(iconClass, "text-slate-400 dark:text-slate-500")} />;
      case "backup":
        return <Save className={cn(iconClass, "text-slate-400 dark:text-slate-500")} />;
      default:
        return <ShieldCheck className={cn(iconClass, "text-slate-400 dark:text-slate-500")} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300 select-none p-4">
      {/* Background Decorative Glow */}
      <div className="absolute w-125 h-125 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-100 h-100 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-6 overflow-hidden flex flex-col gap-6 text-slate-900 dark:text-slate-100 ring-1 ring-slate-900/5 dark:ring-white/10 transition-colors">
        {/* Top Header */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
            <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-emerald-500 dark:text-emerald-300 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Çalışma Dosyası Kapatılıyor
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-500/30 rounded-full tracking-wider">
                Güvenli Çıkış
              </span>
            </div>
            {fileName && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                {fileName}
              </p>
            )}
          </div>
        </div>

        {/* Current Status Message */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping shrink-0" />
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300/90 truncate">
            {statusText || "Arka plan işlemleri gerçekleştiriliyor..."}
          </p>
        </div>

        {/* Steps List */}
        <div className="flex flex-col gap-2.5">
          {steps.map((step) => {
            const isRunning = step.status === "running";
            const isDone = step.status === "completed";
            const isError = step.status === "error";

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs transition-all duration-300",
                  isRunning
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-400/30 dark:ring-emerald-500/20 font-semibold"
                    : isDone
                    ? "bg-slate-50/80 dark:bg-slate-950/40 border-slate-200/90 dark:border-slate-800/60 text-slate-800 dark:text-slate-300"
                    : isError
                    ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-300 font-semibold"
                    : "bg-slate-50/40 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800/30 text-slate-400 dark:text-slate-500 opacity-70",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getStepIcon(step.icon, step.status)}
                  <span className="font-medium truncate">{step.label}</span>
                </div>

                <div className="shrink-0 font-mono text-[11px] font-bold">
                  {isRunning && (
                    <span className="text-emerald-600 dark:text-emerald-400 animate-pulse">
                      İşleniyor...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      Tamamlandı
                    </span>
                  )}
                  {isError && (
                    <span className="text-red-600 dark:text-red-400">Hata Oluştu</span>
                  )}
                  {step.status === "pending" && (
                    <span className="text-slate-400 dark:text-slate-500 font-normal">Bekliyor</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar & Footer Info */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <span>İşlem İlerlemesi</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              %{progressPercent}
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center pt-1 font-medium">
            Lütfen işlemler tamamlanana kadar bekleyiniz. Verileriniz güvenle kaydedilmektedir.
          </p>
        </div>
      </div>
    </div>
  );
}
