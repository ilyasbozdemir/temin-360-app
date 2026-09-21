import { useEffect, useRef, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { useAppEventListener } from "../../../utils/appEvents";

export type CloseActionType = "none" | "backup" | "email" | "server" | "gdrive";

export interface WorkspaceCloseHandlerState {
  isCloseModalOpen: boolean;
  setIsCloseModalOpen: (open: boolean) => void;
  isQuittingApp: boolean;
  isGDriveModalOpen: boolean;
  setIsGDriveModalOpen: (open: boolean) => void;
  handleConfirmClose: (
    types: CloseActionType[] | CloseActionType,
    forceQuit?: boolean,
  ) => Promise<void>;
}

export function useWorkspaceCloseHandler(
  closeWorkspace: () => Promise<void>,
  queryClient: QueryClient,
): WorkspaceCloseHandlerState {
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isQuittingApp, setIsQuittingApp] = useState(false);
  const [isGDriveModalOpen, setIsGDriveModalOpen] = useState(false);

  const parseSavedClosePreferences = (
    pref: any,
  ): CloseActionType[] => {
    if (!pref || pref === "ask") return [];
    if (Array.isArray(pref)) return pref;
    try {
      const parsed = JSON.parse(pref);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "string") return [parsed as any];
    } catch {
      // Not valid JSON, fallback
    }
    if (typeof pref === "string") {
      if (pref.includes(",")) {
        return pref.split(",").map((x: string) => x.trim()) as any;
      }
      return [pref as any];
    }
    return [];
  };

  const handleConfirmClose = async (
    types: CloseActionType[] | CloseActionType,
    forceQuit?: boolean,
  ): Promise<void> => {
    const actionList = Array.isArray(types) ? types : [types];

    for (const type of actionList) {
      if (type === "backup") {
        const res = await window.electron.ipcRenderer.invoke(
          "workspace:backup",
        );
        if (!res.success && res.error !== "Yedekleme iptal edildi") {
          throw new Error(`Yerel yedekleme hatası: ${res.error}`);
        }
      } else if (type === "email") {
        const res = await window.electron.ipcRenderer.invoke(
          "workspace:backup-email",
        );
        if (!res.success) {
          throw new Error(`E-posta yedekleme hatası: ${res.error}`);
        }
      } else if (type === "server") {
        const res = await window.electron.ipcRenderer.invoke(
          "workspace:backup-server",
        );
        if (!res?.success) {
          throw new Error(
            res?.error || "Sunucuya yedekleme işlemi başarısız oldu.",
          );
        }
      } else if (type === "gdrive") {
        const res = await window.electron.ipcRenderer.invoke(
          "workspace:backup-gdrive",
          { force: true },
        );
        if (!res?.success) {
          throw new Error(
            res?.error || "Google Drive bulut yedekleme işlemi başarısız oldu.",
          );
        }
      }
    }

    await closeWorkspace();
    queryClient.clear();

    const shouldQuit = forceQuit !== undefined ? forceQuit : isQuittingApp;
    if (shouldQuit) {
      await window.electron.ipcRenderer.invoke("app:force-quit");
    }
  };

  // Otomatik Arka Plan Google Drive Senkronizasyonu
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);
  useAppEventListener(["dossier:created", "dossier:updated"], () => {
    if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    autoSyncTimerRef.current = setTimeout(async () => {
      try {
        const s = await window.electron?.ipcRenderer?.invoke("db:get-settings");
        if (s?.gdriveAccessToken) {
          console.log(
            "[Auto-Sync] Veri değişikliği algılandı, Google Drive bulutuna arka planda eşitleniyor...",
          );
          await window.electron?.ipcRenderer?.invoke("workspace:backup-gdrive");
        }
      } catch (e) {
        console.warn("[Auto-Sync] Arka plan senkronizasyonu ertelendi:", e);
      }
    }, 5000);
  });

  useEffect(() => {
    const handleQuitRequest = async () => {
      setIsQuittingApp(true);
      window.electron?.ipcRenderer.send("app:cancel-quit-timeout");
      try {
        const s = await window.electron?.ipcRenderer?.invoke("db:get-settings");
        if (
          s?.closeActionRemember === "true" &&
          s?.closeActionPreference &&
          s.closeActionPreference !== "ask"
        ) {
          const actions = parseSavedClosePreferences(s.closeActionPreference);
          if (actions.length > 0 && !actions.includes("none")) {
            await handleConfirmClose(actions, true);
            return;
          } else if (actions.includes("none")) {
            await handleConfirmClose([], true);
            return;
          }
        }
      } catch (err) {
        console.error("Error handling remembered close preference:", err);
      }
      setIsCloseModalOpen(true);
    };

    const handleCloseRequest = async () => {
      setIsQuittingApp(false);
      window.electron?.ipcRenderer.send("app:cancel-quit-timeout");
      try {
        const s = await window.electron?.ipcRenderer?.invoke("db:get-settings");
        if (
          s?.closeActionRemember === "true" &&
          s?.closeActionPreference &&
          s.closeActionPreference !== "ask"
        ) {
          const actions = parseSavedClosePreferences(s.closeActionPreference);
          if (actions.length > 0 && !actions.includes("none")) {
            await handleConfirmClose(actions, false);
            return;
          } else if (actions.includes("none")) {
            await handleConfirmClose([], false);
            return;
          }
        }
      } catch (err) {
        console.error("Error handling remembered close preference:", err);
      }
      setIsCloseModalOpen(true);
    };

    const handleOpenGDrive = () => {
      setIsGDriveModalOpen(true);
    };

    const removeQuitListener = window.electron?.ipcRenderer.on(
      "app:quit-request",
      handleQuitRequest,
    );
    window.addEventListener("workspace-close-request", handleCloseRequest);
    window.addEventListener("open-gdrive-modal", handleOpenGDrive);

    return () => {
      if (removeQuitListener) removeQuitListener();
      window.removeEventListener(
        "workspace-close-request",
        handleCloseRequest,
      );
      window.removeEventListener("open-gdrive-modal", handleOpenGDrive);
      if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    };
  }, [closeWorkspace, isQuittingApp, queryClient]);

  return {
    isCloseModalOpen,
    setIsCloseModalOpen,
    isQuittingApp,
    isGDriveModalOpen,
    setIsGDriveModalOpen,
    handleConfirmClose,
  };
}
