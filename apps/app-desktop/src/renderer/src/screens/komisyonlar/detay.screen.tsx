import React, { useState } from "react";
import {
  CheckCircle,
  Grid,
  List,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PersonelAtaModal } from "./components/PersonelAtaModal";
import { useTabStore } from "../../store/tabStore";

interface KomisyonUyeInfo {
  role_id: number;
  komisyon_id: number;
  personel_id: number | null;
  gorev_id: number;
  asil_mi: number;
  ad_soyad?: string | null;
  unvan?: string | null;
  gorev_adi?: string | null;
}

export default function KomisyonDetayScreen(): React.JSX.Element {
  const queryClient = useQueryClient();

  // Tab sisteminde aktif path "/komisyonlar/detay?id=5" şeklinde geliyor
  // window.location.hash yerine tabStore'dan okuyoruz
  const { activeTabPath } = useTabStore();
  const tabParams = new URLSearchParams(activeTabPath.split("?")[1] || "");
  const komisyonIdStr = tabParams.get("id");
  const komisyonId = komisyonIdStr ? parseInt(komisyonIdStr, 10) : null;

  const [isAtaModalOpen, setIsAtaModalOpen] = useState(false);
  const [ataRoleId, setAtaRoleId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [isAddingUye, setIsAddingUye] = useState(false);
  const [newGorevId, setNewGorevId] = useState<number | null>(null);
  const [newAsilMi, setNewAsilMi] = useState(1);
  const [isSavingUye, setIsSavingUye] = useState(false);

  const { data: gorevler = [] } = useQuery({
    queryKey: ["komisyon_gorevleri"],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_KomisyonGorevi ORDER BY id ASC",
      );
      if (!res.success) throw new Error(res.error);
      return res.data as { id: number; ad: string; aciklama: string | null }[];
    },
  });

  const handleQuickAdd = async (gorevId: number): Promise<void> => {
    if (!komisyonId) return;
    setIsSavingUye(true);
    try {
      const res = await window.electron.ipcRenderer.invoke(
        "db:run",
        "INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, asil_mi) VALUES (?, ?, ?)",
        [komisyonId, gorevId, newAsilMi],
      );
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["komisyon_detay", komisyonId],
        });
        // Eklenen mesajı verilebilir veya sessizce eklenebilir, hızlı olması için sessiz ekliyoruz
      } else {
        alert("Kontenjan eklenirken hata oluştu: " + res.error);
      }
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSavingUye(false);
    }
  };

  const {
    data: komisyon,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["komisyon_detay", komisyonId],
    queryFn: async () => {
      if (!komisyonId) throw new Error("Komisyon ID bulunamadı");

      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_Komisyon WHERE id = ?",
        [komisyonId],
      );
      if (!res.success || res.data.length === 0) {
        throw new Error("Komisyon bulunamadı");
      }

      const komisyonData = res.data[0];

      const membersRes = await window.electron.ipcRenderer.invoke(
        "db:query",
        `SELECT u.id as role_id, u.komisyon_id, u.personel_id, u.gorev_id, u.asil_mi, p.ad_soyad, p.unvan, g.ad as gorev_adi
         FROM TANIM_KomisyonUye u
         LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
         LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
         WHERE u.komisyon_id = ?
         ORDER BY u.id ASC`,
        [komisyonId],
      );

      if (membersRes.success) {
        komisyonData.uyeler = membersRes.data;
      } else {
        komisyonData.uyeler = [];
      }

      return komisyonData;
    },
    enabled: !!komisyonId,
  });

  if (!komisyonId) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500">
        Geçersiz komisyon kimliği. Lütfen listeye geri dönün.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          Yükleniyor...
        </div>
      </div>
    );
  }

  if (error || !komisyon) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500 text-rose-500">
        Bir hata oluştu: {(error as Error)?.message || "Komisyon yüklenemedi"}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              {komisyon.ad}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
              Komisyon Üyeleri ve Detayları
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Görevli Personeller
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
                title="Grid Görünümü"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
                title="Tablo Görünümü"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              Toplam {komisyon.uyeler?.length || 0} Kontenjan
            </span>
            <Button
              className="gap-1.5 text-xs px-3 py-1.5 h-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              onClick={() => setIsAddingUye((v) => !v)}
            >
              <Plus className="w-3.5 h-3.5" />
              Kontenjan Ekle
            </Button>
          </div>
        </div>

        {/* Hızlı Ekleme Paneli */}
        {isAddingUye && (
          <div className="mb-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Hızlı Kontenjan Ekle
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Aşağıdaki görevlerden birine tıklayarak anında listeye boş
                  kontenjan ekleyebilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setNewAsilMi(1)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    newAsilMi === 1
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Asil Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setNewAsilMi(0)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    newAsilMi === 0
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Yedek Ekle
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {gorevler.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleQuickAdd(g.id)}
                  disabled={isSavingUye}
                  className="group flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm transition-all disabled:opacity-50 disabled:hover:border-slate-200"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  {g.ad}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {komisyon.uyeler && komisyon.uyeler.length > 0
            ? (
              viewMode === "grid"
                ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {komisyon.uyeler.map((
                      uye: KomisyonUyeInfo,
                      idx: number,
                    ) => (
                      <div
                        key={idx}
                        className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-slate-800 dark:text-slate-200">
                              {uye.personel_id
                                ? (
                                  uye.ad_soyad
                                )
                                : (
                                  <span className="text-slate-400 italic">
                                    Boş Kontenjan
                                  </span>
                                )}
                            </span>
                            {uye.asil_mi === 1
                              ? (
                                <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Asil
                                </span>
                              )
                              : (
                                <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Yedek
                                </span>
                              )}
                          </div>
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  "Bu kontenjanı tamamen silmek istediğinize emin misiniz?",
                                )
                              ) {
                                const res = await window.electron.ipcRenderer
                                  .invoke(
                                    "db:run",
                                    "DELETE FROM TANIM_KomisyonUye WHERE id = ?",
                                    [uye.role_id],
                                  );
                                if (res.success) {
                                  queryClient.invalidateQueries({
                                    queryKey: ["komisyon_detay", komisyonId],
                                  });
                                }
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Kontenjanı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {uye.personel_id && (
                            <>
                              <span className="bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                {uye.unvan}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">
                                •
                              </span>
                            </>
                          )}
                          <span className="text-blue-600 dark:text-blue-400">
                            {uye.gorev_adi}
                          </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
                          {!uye.personel_id
                            ? (
                              <Button
                                variant="outline"
                                className="w-full text-xs py-2 h-auto rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                onClick={() => {
                                  setAtaRoleId(uye.role_id);
                                  setIsAtaModalOpen(true);
                                }}
                              >
                                Personel Ata
                              </Button>
                            )
                            : (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1 text-xs py-2 h-auto rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 bg-white dark:bg-slate-900"
                                  onClick={() => {
                                    setAtaRoleId(uye.role_id);
                                    setIsAtaModalOpen(true);
                                  }}
                                >
                                  Değiştir
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 text-xs py-2 h-auto rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 bg-white dark:bg-slate-900"
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        "Personeli bu görevden almak istediğinize emin misiniz?",
                                      )
                                    ) {
                                      const res = await window.electron
                                        .ipcRenderer.invoke(
                                          "db:run",
                                          "UPDATE TANIM_KomisyonUye SET personel_id = NULL WHERE id = ?",
                                          [uye.role_id],
                                        );
                                      if (res.success) {
                                        queryClient.invalidateQueries({
                                          queryKey: [
                                            "komisyon_detay",
                                            komisyonId,
                                          ],
                                        });
                                      }
                                    }
                                  }}
                                >
                                  Kaldır
                                </Button>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3 pl-4">Personel</th>
                          <th className="p-3">Görev / Unvan</th>
                          <th className="p-3">Durum</th>
                          <th className="p-3 pr-4 text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {komisyon.uyeler.map((
                          uye: KomisyonUyeInfo,
                          idx: number,
                        ) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="p-3 pl-4">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {uye.personel_id
                                  ? (
                                    uye.ad_soyad
                                  )
                                  : (
                                    <span className="text-slate-400 italic text-xs">
                                      Boş Kontenjan
                                    </span>
                                  )}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-0.5 text-xs">
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  {uye.gorev_adi}
                                </span>
                                {uye.personel_id && (
                                  <span className="text-slate-500 dark:text-slate-400">
                                    {uye.unvan}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              {uye.asil_mi === 1
                                ? (
                                  <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                                    Asil
                                  </span>
                                )
                                : (
                                  <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                                    Yedek
                                  </span>
                                )}
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!uye.personel_id
                                  ? (
                                    <Button
                                      variant="outline"
                                      className="text-[10px] px-2 py-1.5 h-auto rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50"
                                      onClick={() => {
                                        setAtaRoleId(uye.role_id);
                                        setIsAtaModalOpen(true);
                                      }}
                                    >
                                      Personel Ata
                                    </Button>
                                  )
                                  : (
                                    <>
                                      <Button
                                        variant="outline"
                                        className="text-[10px] px-2 py-1.5 h-auto rounded-lg text-blue-600 border-blue-200 bg-white dark:bg-slate-900 hover:bg-blue-50"
                                        onClick={() => {
                                          setAtaRoleId(uye.role_id);
                                          setIsAtaModalOpen(true);
                                        }}
                                      >
                                        Değiştir
                                      </Button>
                                      <Button
                                        variant="outline"
                                        className="text-[10px] px-2 py-1.5 h-auto rounded-lg text-rose-600 border-rose-200 bg-white dark:bg-slate-900 hover:bg-rose-50"
                                        onClick={async () => {
                                          if (
                                            confirm(
                                              "Personeli bu görevden almak istediğinize emin misiniz?",
                                            )
                                          ) {
                                            const res = await window.electron
                                              .ipcRenderer.invoke(
                                                "db:run",
                                                "UPDATE TANIM_KomisyonUye SET personel_id = NULL WHERE id = ?",
                                                [uye.role_id],
                                              );
                                            if (res.success) {
                                              queryClient.invalidateQueries({
                                                queryKey: [
                                                  "komisyon_detay",
                                                  komisyonId,
                                                ],
                                              });
                                            }
                                          }
                                        }}
                                      >
                                        Kaldır
                                      </Button>
                                    </>
                                  )}
                                <button
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        "Bu kontenjanı tamamen silmek istediğinize emin misiniz?",
                                      )
                                    ) {
                                      const res = await window.electron
                                        .ipcRenderer.invoke(
                                          "db:run",
                                          "DELETE FROM TANIM_KomisyonUye WHERE id = ?",
                                          [uye.role_id],
                                        );
                                      if (res.success) {
                                        queryClient.invalidateQueries({
                                          queryKey: [
                                            "komisyon_detay",
                                            komisyonId,
                                          ],
                                        });
                                      }
                                    }
                                  }}
                                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-lg transition-colors ml-1 cursor-pointer"
                                  title="Kontenjanı Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
            )
            : !isAddingUye
            ? (
              <div className="py-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <UserPlus className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">
                  Bu komisyona henüz üye kontenjanı tanımlanmamış.
                </p>
                <Button
                  className="gap-2 text-xs px-4 py-2 h-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                  onClick={() => setIsAddingUye(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  İlk Kontenjanı Oluştur
                </Button>
              </div>
            )
            : null}
        </div>
      </div>

      <PersonelAtaModal
        isOpen={isAtaModalOpen}
        onClose={() => {
          setIsAtaModalOpen(false);
          setAtaRoleId(null);
          queryClient.invalidateQueries({
            queryKey: ["komisyon_detay", komisyonId],
          });
        }}
        roleId={ataRoleId}
        komisyonId={komisyonId}
      />
    </div>
  );
}
