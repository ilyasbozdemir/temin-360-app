import React, { useEffect, useState } from "react";
import { Modal } from "./Modal";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileJson,
  FileSpreadsheet,
  FolderDown,
  HardDrive,
  Key,
  LogIn,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GDriveFile {
  id: string;
  name: string;
  size?: string;
  modifiedTime?: string;
}

export function GoogleDriveModal(
  { isOpen, onClose }: GoogleDriveModalProps,
): React.JSX.Element {
  const [authTab, setAuthTab] = useState<"api" | "manual">("api");
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isSavedToken, setIsSavedToken] = useState(false);
  const [files, setFiles] = useState<GDriveFile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<
    { text: string; type: "success" | "error" | "info" } | null
  >(null);

  const isConnected = Boolean(token || refreshToken || isSavedToken);

  const fetchDriveFiles = async (currentToken?: string) => {
    const rawToken = currentToken !== undefined ? currentToken : token;
    const useToken = rawToken
      ? rawToken.trim().replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "")
        .replace(/[\r\n\s]+/g, "")
      : "";

    setIsLoadingList(true);
    setStatusMsg(null);
    try {
      const res = await window.electron.ipcRenderer.invoke(
        "workspace:list-gdrive-files",
        useToken ? { token: useToken } : {},
      );
      if (res.success) {
        const validList = (res.files || []).filter(
          (f: GDriveFile) =>
            f.name.endsWith(".dtal") || f.name.endsWith(".hkmp"),
        );
        setFiles(validList);
        setIsSavedToken(true);
        if (validList.length === 0) {
          setStatusMsg({
            text:
              "TEMIN_360_YEDEKLER klasöründe henüz `.dtal` uzantılı yedek dosyası bulunamadı.",
            type: "info",
          });
        }
      } else {
        setStatusMsg({
          text: res.error || "Google Drive dosyaları çekilemedi.",
          type: "error",
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.message || "Listeleme sırasında bir hata oluştu.",
        type: "error",
      });
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Load saved settings from SQLite
    window.electron?.ipcRenderer
      .invoke("db:get-settings")
      .then((settings) => {
        let hasAccess = false;
        if (settings?.gdriveAccessToken) {
          const clean = settings.gdriveAccessToken.trim().replace(
            /^["']|["']$/g,
            "",
          ).replace(/^Bearer\s+/i, "").replace(/[\r\n\s]+/g, "");
          setToken(clean);
          setIsSavedToken(true);
          hasAccess = true;
          fetchDriveFiles(clean);
        }
        if (settings?.gdriveRefreshToken) {
          const cleanRefresh = settings.gdriveRefreshToken.trim().replace(
            /^["']|["']$/g,
            "",
          ).replace(/[\r\n\s]+/g, "");
          setRefreshToken(cleanRefresh);
          setIsSavedToken(true);
          if (!hasAccess) {
            fetchDriveFiles();
          }
        }
        if (settings?.gdriveClientId) {
          setClientId(settings.gdriveClientId.trim());
        }
        if (settings?.gdriveClientSecret) {
          setClientSecret(settings.gdriveClientSecret.trim());
        }

        // Auto choose active tab based on saved data
        if (settings?.gdriveClientId && settings?.gdriveClientSecret) {
          setAuthTab("api");
        } else if (settings?.gdriveAccessToken) {
          setAuthTab("manual");
        }
      })
      .catch(console.error);
  }, [isOpen]);

  const handleStartGoogleOAuth = async () => {
    const cleanClientId = clientId.trim().replace(/^["']|["']$/g, "").replace(
      /[\r\n\s]+/g,
      "",
    );
    const cleanClientSecret = clientSecret.trim().replace(/^["']|["']$/g, "")
      .replace(/[\r\n\s]+/g, "");

    if (!cleanClientId || !cleanClientSecret) {
      setStatusMsg({
        text:
          "Lütfen önce Client ID ve Client Secret alanlarını doldurun veya 'client_secret.json Yükle' butonunu kullanın.",
        type: "error",
      });
      return;
    }

    setIsAuthenticating(true);
    setStatusMsg({
      text:
        "Tarayıcınız açılıyor... Lütfen açılan sayfada Google hesabınızı seçip Temin 360'a izin verin.",
      type: "info",
    });

    try {
      const res = await window.electron.ipcRenderer.invoke(
        "workspace:start-gdrive-oauth",
        {
          clientId: cleanClientId,
          clientSecret: cleanClientSecret,
        },
      );

      if (res.success) {
        if (res.accessToken) {
          setToken(res.accessToken);
        }
        if (res.refreshToken) {
          setRefreshToken(res.refreshToken);
        }
        setIsSavedToken(true);
        setStatusMsg({
          text:
            "🎉 Google Hesabınız başarıyla bağlandı! Kalıcı yetki alındı, yedekleme sistemi anında aktif edildi.",
          type: "success",
        });
        fetchDriveFiles(res.accessToken);
      } else {
        setStatusMsg({
          text: res.error || "Google ile oturum açma işlemi tamamlanamadı.",
          type: "error",
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: `Oturum açma hatası: ${err.message}`,
        type: "error",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleOpenGoogleAuth = () => {
    const authUrl = "https://developers.google.com/oauthplayground";
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send("open-external-url", authUrl);
    } else {
      window.open(authUrl, "_blank");
    }
    setStatusMsg({
      text:
        "OAuth Playground tarayıcıda açıldı. Sağ üstteki ⚙️ Dişli simgesinden kendi Client ID ve Secret'ınızı girip Drive API v3 seçerek kalıcı yetki alabilirsiniz.",
      type: "info",
    });
  };

  const handleImportClientJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const clientData = parsed.installed || parsed.web || parsed;
        let importedCount = 0;
        if (clientData.client_id) {
          setClientId(clientData.client_id.trim());
          importedCount++;
        }
        if (clientData.client_secret) {
          setClientSecret(clientData.client_secret.trim());
          importedCount++;
        }
        if (importedCount > 0) {
          setStatusMsg({
            text:
              "✅ JSON dosyasından Client ID ve Client Secret başarıyla okundu! Aşağıdaki 'Kaydet ve Kalıcı Modu Aktif Et' butonuna basarak kaydedebilirsiniz.",
            type: "success",
          });
          setAuthTab("api");
        } else {
          setStatusMsg({
            text:
              "JSON dosyasında geçerli client_id veya client_secret bulunamadı.",
            type: "error",
          });
        }
      } catch {
        setStatusMsg({
          text: "Geçersiz veya bozuk JSON dosyası.",
          type: "error",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 1. YÖNTEM KAYDETME: Google Cloud API (Client ID & Secret + Refresh Token)
  const handleSaveApiSettings = async () => {
    const cleanClientId = clientId.trim().replace(/^["']|["']$/g, "").replace(
      /[\r\n\s]+/g,
      "",
    );
    const cleanClientSecret = clientSecret.trim().replace(/^["']|["']$/g, "")
      .replace(/[\r\n\s]+/g, "");
    const cleanRefresh = refreshToken.trim().replace(/^["']|["']$/g, "")
      .replace(/[\r\n\s]+/g, "");
    const cleanToken = token.trim().replace(/^["']|["']$/g, "").replace(
      /^Bearer\s+/i,
      "",
    ).replace(/[\r\n\s]+/g, "");

    if (!cleanClientId || !cleanClientSecret) {
      setStatusMsg({
        text:
          "Lütfen Client ID ve Client Secret alanlarını doldurun veya 'client_secret.json Yükle' butonunu kullanın.",
        type: "error",
      });
      return;
    }

    const toSave: Record<string, string> = {
      gdriveClientId: cleanClientId,
      gdriveClientSecret: cleanClientSecret,
      ...(cleanRefresh ? { gdriveRefreshToken: cleanRefresh } : {}),
      ...(cleanToken ? { gdriveAccessToken: cleanToken } : {}),
    };

    try {
      await window.electron.ipcRenderer.invoke("db:save-settings", toSave);
      if (cleanRefresh || cleanToken) {
        setIsSavedToken(true);
        setStatusMsg({
          text:
            "✅ Google Cloud API bilgileri ve Yetki Anahtarı kaydedildi! Kalıcı mod aktif.",
          type: "success",
        });
        fetchDriveFiles(cleanToken || undefined);
      } else {
        setStatusMsg({
          text:
            "✅ Client ID ve Secret kaydedildi. Şimdi aşağıdaki 'Google ile Oturum Aç & Drive'a Bağlan' butonuna basarak tek tıkla yetki alabilirsiniz.",
          type: "info",
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: `Kaydetme hatası: ${err.message}`,
        type: "error",
      });
    }
  };

  // 2. YÖNTEM KAYDETME: Hızlı Manuel Access Token
  const handleSaveManualToken = async () => {
    const cleanToken = token.trim().replace(/^["']|["']$/g, "").replace(
      /^Bearer\s+/i,
      "",
    ).replace(/[\r\n\s]+/g, "");
    if (!cleanToken) {
      setStatusMsg({
        text: "Lütfen geçerli bir Access Token (ya29...) girin.",
        type: "error",
      });
      return;
    }

    try {
      await window.electron.ipcRenderer.invoke("db:save-settings", {
        gdriveAccessToken: cleanToken,
      });
      setToken(cleanToken);
      setIsSavedToken(true);
      setStatusMsg({
        text:
          "✅ Manuel Access Token kaydedildi. Google Drive dosyalarınız çekiliyor...",
        type: "success",
      });
      fetchDriveFiles(cleanToken);
    } catch (err: any) {
      setStatusMsg({
        text: `Token kaydetme hatası: ${err.message}`,
        type: "error",
      });
    }
  };

  const handleUploadCurrentFile = async () => {
    const cleanToken = token.trim().replace(/^["']|["']$/g, "").replace(
      /^Bearer\s+/i,
      "",
    ).replace(/[\r\n\s]+/g, "");
    if (!cleanToken && !refreshToken && !isSavedToken) {
      setStatusMsg({
        text:
          "Lütfen önce yukarıdaki 'Google ile Oturum Aç' butonuyla bağlanın veya token tanımlayın.",
        type: "error",
      });
      return;
    }

    setIsUploading(true);
    setStatusMsg({
      text: "Aktif dosya tarih damgasıyla Google Drive bulutuna yükleniyor...",
      type: "info",
    });
    try {
      const res = await window.electron.ipcRenderer.invoke(
        "workspace:backup-gdrive",
        cleanToken ? { token: cleanToken } : {},
      );

      if (res.success) {
        setStatusMsg({
          text: res.message ||
            "Dosya Google Drive hesabınıza başarıyla yüklendi.",
          type: "success",
        });
        fetchDriveFiles(cleanToken || undefined);
      } else {
        setStatusMsg({
          text: res.error || "Yükleme başarısız.",
          type: "error",
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.message || "Yükleme hatası oluştu.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadFile = async (
    file: GDriveFile,
    overwriteActive: boolean = true,
  ) => {
    if (overwriteActive) {
      const confirmed = window.confirm(
        `"${file.name}" bulut yedeği doğrudan mevcut aktif çalışma dosyanıza yazılacak ve geri yüklenecektir.\n\n(Güvenlik için mevcut dosyanızın otomatik .bak yedeği alınır).\n\nDevam etmek istiyor musunuz?`,
      );
      if (!confirmed) return;
    }

    const cleanToken = token.trim().replace(/^["']|["']$/g, "").replace(
      /^Bearer\s+/i,
      "",
    ).replace(/[\r\n\s]+/g, "");
    setDownloadingId(file.id);
    setStatusMsg({
      text: overwriteActive
        ? `${file.name} indiriliyor ve aktif çalışma dosyanıza geri yükleniyor...`
        : `${file.name} Masaüstüne indiriliyor ve açılıyor...`,
      type: "info",
    });
    try {
      const res = await window.electron.ipcRenderer.invoke(
        "workspace:download-gdrive-file",
        {
          fileId: file.id,
          fileName: file.name,
          ...(cleanToken ? { token: cleanToken } : {}),
          overwriteActive,
        },
      );

      if (res.success) {
        setStatusMsg({
          text: res.message || "Dosya başarıyla yüklendi ve açıldı.",
          type: "success",
        });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        setStatusMsg({
          text: res.error || "İndirme hatası oluştu.",
          type: "error",
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.message || "İndirme işlemi sırasında hata oluştu.",
        type: "error",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteFile = async (file: GDriveFile) => {
    if (
      !window.confirm(
        `"${file.name}" yedeğini Google Drive'dan kalıcı olarak silmek istediğinize emin misiniz?`,
      )
    ) {
      return;
    }

    const cleanToken = token.trim().replace(/^["']|["']$/g, "").replace(
      /^Bearer\s+/i,
      "",
    ).replace(/[\r\n\s]+/g, "");
    setDeletingId(file.id);
    try {
      const res = await window.electron.ipcRenderer.invoke(
        "workspace:delete-gdrive-file",
        {
          fileId: file.id,
          ...(cleanToken ? { token: cleanToken } : {}),
        },
      );

      if (res.success) {
        setStatusMsg({
          text: `${file.name} Google Drive'dan başarıyla silindi.`,
          type: "success",
        });
        fetchDriveFiles(cleanToken || undefined);
      } else {
        setStatusMsg({
          text: res.error || "Silme işlemi başarısız oldu.",
          type: "error",
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.message || "Silme işlemi sırasında hata oluştu.",
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes?: string | number) => {
    if (!bytes) return "—";
    const num = Number(bytes);
    if (isNaN(num)) return "—";
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "—";
    try {
      return new Date(isoStr).toLocaleString("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Drive Bulut Entegrasyonu"
      description="Google hesabınızla giriş yaparak çalışma dosyalarınızı buluta yedekleyin veya mevcut yedeklerinizi indirin."
      className="max-w-7xl"
    >
      <div className="space-y-5">
        {/* Google Authentication Method Selection & Setup */}
        <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-emerald-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <LogIn size={16} className="text-blue-500" />
                Google Drive Bağlantı Yöntemi
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Aşağıdaki iki yöntemden birini seçip kaydedin; girdiğiniz yöntem
                otomatik aktif olur.
              </p>
            </div>

            {/* Current Active Mode Badge */}
            <div>
              {clientId && clientSecret
                ? (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1.5 shadow-xs">
                    <CheckCircle size={12} className="text-emerald-500" />
                    Aktif: Kalıcı Özel API (Otomatik Yenileme)
                  </span>
                )
                : isSavedToken
                ? (
                  <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 font-bold flex items-center gap-1.5 shadow-xs">
                    <Clock size={12} className="text-amber-500" />
                    Aktif: Geçici Manuel Token (~1 Saatlik)
                  </span>
                )
                : (
                  <span className="text-[10px] bg-slate-500/15 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-500/30 font-medium">
                    Bağlantı Yapılandırılmadı
                  </span>
                )}
            </div>
          </div>

          {/* 2-Mode Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAuthTab("api")}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                authTab === "api"
                  ? "bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 opacity-75 hover:opacity-100"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  authTab === "api"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                <Sliders size={15} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    1. Yöntem: Google Cloud API
                  </span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded">
                    Tavsiye Edilen
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Client ID & Secret ile kalıcı, süresiz otomatik yenileme (24
                  saat sınırı yok).
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAuthTab("manual")}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                authTab === "manual"
                  ? "bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 opacity-75 hover:opacity-100"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  authTab === "manual"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                <Key size={15} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    2. Yöntem: Hızlı Manuel Token
                  </span>
                  <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded">
                    Geçici Test
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Sadece tek bir Access Token (ya29...) ile anında test (~1 saat
                  geçerli).
                </p>
              </div>
            </button>
          </div>

          {/* TAB 1: Google Cloud API (Client ID & Secret + Refresh Token) */}
          {authTab === "api" && (
            <div className="space-y-3 p-3.5 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-blue-200/70 dark:border-blue-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Özel API İstemcisi Bilgileri
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    İster masaüstündeki JSON dosyasını yükleyin, ister kutulara
                    yapıştırın:
                  </p>
                </div>
                <label className="cursor-pointer text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 shadow-2xs transition-colors shrink-0">
                  <FileJson size={14} />
                  <span>client_secret.json Yükle</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportClientJson}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Client ID
                  </label>
                  <Input
                    type="text"
                    placeholder="...apps.googleusercontent.com"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[11px] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Client Secret
                  </label>
                  <div className="relative">
                    <Input
                      type={showClientSecret ? "text" : "password"}
                      placeholder="GOCSPX-..."
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[11px] font-mono pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientSecret(!showClientSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showClientSecret ? "Gizle" : "Göster"}
                    >
                      {showClientSecret
                        ? <EyeOff size={13} />
                        : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* TEK TIKLA GOOGLE İLE OTURUM AÇ & BAĞLAN (BİRİNCİL VE ÖNERİLEN) */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-2">
                <Button
                  type="button"
                  onClick={handleStartGoogleOAuth}
                  disabled={isAuthenticating || !clientId || !clientSecret}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {isAuthenticating
                    ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>
                          Google Girişi Bekleniyor (Tarayıcınızı Kontrol
                          Edin)...
                        </span>
                      </>
                    )
                    : (
                      <>
                        <LogIn size={15} />
                        <span>
                          Google Hesabı ile Oturum Aç & Yetkilendir (Tek Tıkla
                          Kalıcı)
                        </span>
                      </>
                    )}
                </Button>
                <p className="text-[10px] text-center text-slate-600 dark:text-slate-400 leading-snug">
                  ✨ <strong>24 saat sınırı yok:</strong>{" "}
                  Butona tıkladığınızda tarayıcınız açılır; Google hesabınıza
                  onay verdiğinizde kalıcı yetki otomatik alınır ve yedekleme
                  butonları anında aktif olur.
                </p>
              </div>

              {/* GELİŞMİŞ / MANUEL REFRESH TOKEN OPSİYONU */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <RefreshCw size={11} className="text-emerald-500" />
                      Alternatif: Manuel Refresh Token (Opsiyonel)
                    </label>
                    {refreshToken && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle size={10} /> Tanımlı
                      </span>
                    )}
                  </div>
                  <Input
                    type="password"
                    placeholder="1//04wKn... (OAuth Playground'dan kendi client'ınızla üretilen refresh token)"
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[11px] font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={handleOpenGoogleAuth}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={11} />{" "}
                    OAuth Playground ile Manuel Kod Üretme Rehberi
                  </button>
                  <Button
                    type="button"
                    onClick={handleSaveApiSettings}
                    className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-[11px] transition-all"
                  >
                    <CheckCircle size={13} />
                    <span>API Bilgilerini Kaydet</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Hızlı Manuel Token */}
          {authTab === "manual" && (
            <div className="space-y-3 p-3.5 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-amber-200/70 dark:border-amber-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Geçici Erişim Jetonu (Access Token)
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    OAuth Playground üzerinden doğrudan üretilen ~1 saat geçerli
                    test token&apos;ı:
                  </p>
                </div>
                <Button
                  onClick={handleOpenGoogleAuth}
                  className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink size={13} className="text-blue-500" />
                  <span>Google Yetkilendirme Sayfası Aç</span>
                </Button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Access Token
                </label>
                <div className="relative">
                  <Input
                    type={showToken ? "text" : "password"}
                    placeholder="ya29.a0Ax... (Google OAuth Access Token)"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-mono pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showToken ? "Gizle" : "Göster"}
                  >
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* 2. YÖNTEM ÖZEL KAYDET BUTONU */}
              <Button
                onClick={handleSaveManualToken}
                className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all"
              >
                <Key size={15} />
                <span>Manuel Access Token&apos;ı Kaydet ve Bağlan</span>
              </Button>
            </div>
          )}
        </div>

        {/* Notification Alert */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
              statusMsg.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : statusMsg.type === "error"
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            }`}
          >
            {statusMsg.type === "error"
              ? <AlertCircle size={16} />
              : <CheckCircle size={16} />}
            <span className="flex-1">{statusMsg.text}</span>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/40 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
              <Upload size={16} /> Google Drive&apos;a Yükle
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Mevcut çalışma dosyanızı tarih damgasıyla (.dtal) doğrudan Google
              Drive hesabınıza yedek olarak aktarır.
            </p>
            <Button
              onClick={handleUploadCurrentFile}
              disabled={isUploading || !isConnected}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isUploading
                ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />{" "}
                    Yükleniyor...
                  </>
                )
                : (
                  <>
                    <Upload size={14} /> Aktif Dosyayı Buluta Yükle
                  </>
                )}
            </Button>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-800/40 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <Download size={16} /> Buluttan İndir & Çek
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Google Drive hesabınızdaki `.dtal` yedeklerinizi dökerek
              seçtiğiniz dosyayı indirir ve açar.
            </p>
            <Button
              onClick={() => fetchDriveFiles()}
              disabled={isLoadingList || !isConnected}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isLoadingList
                ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />{" "}
                    Yükleniyor...
                  </>
                )
                : (
                  <>
                    <RefreshCw size={14} /> Bulut Listesini Yenile
                  </>
                )}
            </Button>
          </div>
        </div>

        {/* Files List Table */}
        <div className="space-y-2">
          {/* Security & Privacy Guarantee */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <span>
              <strong>Güvenlik ve İzolasyon Garantisi:</strong>{" "}
              Drive&apos;ınızdaki diğer şahsi dosyalarınıza kesinlikle
              erişilmez. Yalnızca <strong>TEMIN_360_YEDEKLER</strong>{" "}
              klasöründeki son 7 adet <strong>.dtal</strong>{" "}
              çalışma dosyası listelenir ve korunur.
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <HardDrive size={15} />{" "}
              Klasör: TEMIN_360_YEDEKLER ({files.length})
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Google Drive / TEMIN_360_YEDEKLER
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 max-h-64 overflow-y-auto">
            {isLoadingList
              ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                  {" "}
                  Dosyalar listeleniyor...
                </div>
              )
              : files.length === 0
              ? (
                <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  {!isConnected
                    ? "Devam etmek için lütfen yukarıdan Google Hesabınızla bağlanın veya Access Token kaydedin."
                    : 'TEMIN_360_YEDEKLER klasöründe henüz .dtal yedek dosyası yok. Yukarıdaki "Aktif Dosyayı Buluta Yükle" butonuyla ilk yedeğinizi yükleyebilirsiniz.'}
                </div>
              )
              : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                          <FileSpreadsheet size={18} />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-bold text-slate-900 dark:text-slate-100 break-all select-all leading-snug"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                            {index === 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                En Güncel Sürüm
                              </span>
                            )}
                            <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                              Sürüm #{files.length - index}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                              <Clock size={11} className="text-slate-400" />
                              {formatDate(file.modifiedTime)}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span>Boyut: {formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <Button
                          onClick={() => handleDownloadFile(file, true)}
                          disabled={downloadingId === file.id || deletingId === file.id}
                          title="Bu bulut yedeğini doğrudan mevcut aktif çalışma dosyanızın üzerine yazar ve anında geri yükler."
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          {downloadingId === file.id ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              <span>Geri Yükleniyor...</span>
                            </>
                          ) : (
                            <>
                              <Download size={13} />
                              <span>Aktif Dosyaya Aç</span>
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleDownloadFile(file, false)}
                          disabled={downloadingId === file.id || deletingId === file.id}
                          title="Masaüstüne yeni bir dosya olarak indir ve aç"
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FolderDown size={13} />
                          <span>Masaüstüne İndir</span>
                        </Button>

                        <Button
                          onClick={() => handleDeleteFile(file)}
                          disabled={downloadingId === file.id || deletingId === file.id}
                          title="Bu yedeği Google Drive'dan sil"
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-500 dark:text-slate-400 text-xs font-bold p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
                        >
                          {deletingId === file.id ? (
                            <RefreshCw size={12} className="animate-spin text-rose-500" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
