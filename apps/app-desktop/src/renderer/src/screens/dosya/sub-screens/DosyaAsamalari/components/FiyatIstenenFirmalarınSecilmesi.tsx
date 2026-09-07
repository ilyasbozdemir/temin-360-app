import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Building2,
  Calculator,
  CheckSquare,
  ChevronDown,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Tag,
  Trash2,
  Trophy,
  UserPlus,
  X,
} from "lucide-react";

const MIN_FIRMS = 2;
const MAX_FIRMS = 3;

export interface Firma {
  id: number;
  firma_no?: string;
  unvan: string;
  telefon?: string;
  faks?: string;
  email?: string;
  semt?: string;
  sehir?: string;
  vergi_no?: string;
  isAdded?: boolean;
  temin_firma_id?: number;
  unvanKullan?: boolean;
  [key: string]: unknown;
}

export interface FirmaColumn {
  key: string;
  label: string;
  className?: string;
  render?: (firma: Firma) => React.ReactNode;
}

export interface FiyatIstenenFirmalarınSecilmesiProps {
  title?: string;
  firms: Firma[];
  columns: FirmaColumn[];
  onFirmaEkle: (firma: Firma) => void;
  onCreateNewFirm?: (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => Promise<void>;
  onFirmaCikar?: (firma: Firma) => void;
  onFiyatGir?: () => void;
  onFiyatPiyasaFormu?: (firma: Firma) => void;
  onBirimFiyatArastirmasi?: (firma: Firma) => void;
  onEkapSorgula?: (firma?: Firma) => void;
  onDagitimMektubu?: () => void;
  onKarmaDagitimMektubu?: () => void;
  onBosTeklifCetveli?: () => void;
  onYasaklilikTutanagi?: () => void;
  onUnvanKullanToggle?: (firma: Firma, value: boolean) => void;
  onOpenFirmaSecmeModali?: () => void;
  extraHeaderAction?: React.ReactNode;
  winnerFirmaId?: number | null;
  onSetWinnerFirma?: (firma: Firma) => void;
}

/* ─── Hızlı Yeni Firma Tanımlama Modali ──────────────────────────── */
interface YeniFirmaModaliProps {
  onClose: () => void;
  onSave: (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => Promise<void>;
}

function YeniFirmaModali({ onClose, onSave }: YeniFirmaModaliProps) {
  const [unvan, setUnvan] = useState("");
  const [vergiNo, setVergiNo] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [sehir, setSehir] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unvan.trim()) {
      setError("Firma unvanı zorunludur.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        unvan: unvan.trim(),
        vergi_no: vergiNo.trim(),
        telefon: telefon.trim(),
        email: email.trim(),
        sehir: sehir.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Firma kaydedilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Yeni İstekli Firma Kaydı
              </h3>
              <p className="text-[11px] text-slate-400">
                Firmayı kaydedip doğrudan bu temin dosyasına ekler.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Firma Unvanı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={unvan}
              onChange={(e) => setUnvan(e.target.value)}
              placeholder="Örn: ABC Medikal San. ve Tic. Ltd. Şti."
              className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vergi No / VKN
              </label>
              <input
                type="text"
                value={vergiNo}
                onChange={(e) => setVergiNo(e.target.value)}
                placeholder="10 veya 11 Haneli VKN"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                İl / Semt
              </label>
              <input
                type="text"
                value={sehir}
                onChange={(e) => setSehir(e.target.value)}
                placeholder="Örn: Ankara / Çankaya"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telefon
              </label>
              <input
                type="text"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder="0312 ..."
                className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                E-Posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@firma.com"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !unvan.trim()}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? "Kaydediliyor..." : "Kaydet ve Dosyaya Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Havuzdan Firma Seçim Modali ────────────────────────────────── */
interface FirmaEkleModaliProps {
  availableFirms: Firma[];
  addedCount: number;
  onConfirm: (firms: Firma[]) => void | Promise<void>;
  onOpenNewFirm: () => void;
  onClose: () => void;
}

function FirmaEkleModali({
  availableFirms,
  addedCount,
  onConfirm,
  onOpenNewFirm,
  onClose,
}: FirmaEkleModaliProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const remaining = MAX_FIRMS - addedCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableFirms;
    return availableFirms.filter(
      (f) =>
        String(f.unvan ?? "")
          .toLowerCase()
          .includes(q) ||
        String(f.vergi_no ?? "")
          .toLowerCase()
          .includes(q) ||
        String(f.sehir ?? "")
          .toLowerCase()
          .includes(q) ||
        String(f.telefon ?? "")
          .toLowerCase()
          .includes(q),
    );
  }, [availableFirms, query]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size < remaining) next.add(id);
      }
      return next;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const firmsToAdd = availableFirms.filter((f) => selected.has(f.id));
      await onConfirm(firmsToAdd);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>İstekli Firma Seçimi</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                Havuzdan Ekle
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Havuzdaki kayıtlı firmalardan seçin veya listede yoksa yeni firma kaydedin (En fazla{" "}
              <span className="font-bold text-amber-500">{MAX_FIRMS}</span>{" "}
              firma).
              {remaining < MAX_FIRMS && (
                <span className="ml-1 text-slate-500">
                  (Mevcut: {addedCount}, Kalan kontenjan: {remaining})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewFirm();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Yeni Firma Kaydı</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {remaining === 0 && (
          <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Maksimum {MAX_FIRMS}{" "}
            firma eklenebilir. Yeni eklemek için önce mevcut bir firmayı çıkarın.
          </div>
        )}

        <div className="p-4 pb-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Firma ara (Unvan, VKN, Şehir, Telefon)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
              <p className="text-xs text-slate-400">
                Eşleşen havuz firması bulunamadı.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewFirm();
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Bu isimle yeni firma oluştur & ekle
              </button>
            </div>
          ) : (
            filtered.map((firma) => {
              const isSelected = selected.has(firma.id);
              const isDisabled = !isSelected && selected.size >= remaining;
              return (
                <button
                  key={firma.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggle(firma.id)}
                  className={[
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                      : isDisabled
                      ? "bg-slate-50 dark:bg-slate-800/40 border-slate-150 dark:border-slate-800 opacity-50 cursor-not-allowed"
                      : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
                  ].join(" ")}
                >
                  <span
                    className={isSelected ? "text-blue-500" : "text-slate-400"}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {firma.unvan}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {[firma.vergi_no, firma.sehir, firma.telefon]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {selected.size > 0 ? (
              <span>
                <span className="font-bold text-blue-600">
                  {selected.size}
                </span>{" "}
                firma seçildi
              </span>
            ) : (
              "Eklenecek firmaları işaretleyin"
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0 || isSubmitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer border-0 shadow-xs"
            >
              {isSubmitting ? "Ekleniyor..." : `Seçilenleri Ekle (${selected.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Satır Teklif/Mektup Format Menüsü ────────────────────────── */
interface FirmaMektupMenuProps {
  firma: Firma;
  onFiyatPiyasaFormu?: (firma: Firma) => void;
  onBirimFiyatArastirmasi?: (firma: Firma) => void;
  onBosTeklifCetveli?: (firma: Firma) => void;
}

function FirmaMektupMenu({
  firma,
  onFiyatPiyasaFormu,
  onBirimFiyatArastirmasi,
  onBosTeklifCetveli,
}: FirmaMektupMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const menuWidth = 270;
      let left = rect.right - menuWidth;
      if (left < 10) left = 10;
      let top = rect.bottom + 4;
      if (top + 220 > window.innerHeight) {
        top = Math.max(10, rect.top - 220 - 4);
      }
      setCoords({ top, left });
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [open, updateCoords]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleAction = (fn?: (firma: Firma) => void) => {
    if (fn) fn(firma);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center shadow-2xs rounded-lg overflow-hidden border border-blue-200/70 dark:border-blue-800/50"
    >
      <button
        type="button"
        onClick={() => handleAction(onFiyatPiyasaFormu)}
        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/60 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border-0"
        title={`${firma.unvan} için Fiyat Araştırma İsteme Mektubunu (Hitaplı & Adresli) Aç`}
      >
        <Mail className="w-3 h-3 text-blue-500" />
        <span>Mektup</span>
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-1 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/70 border-l border-blue-200/70 dark:border-blue-800/50 transition-colors cursor-pointer border-t-0 border-b-0 border-r-0"
        title="Mektup ve Teklif Format Seçenekleri"
      >
        <ChevronDown className="w-3 h-3" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-[9999] w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-800"
          >
            <div className="px-3 py-1.5 bg-slate-50/70 dark:bg-slate-850">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mektup & Teklif Formatları
              </p>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                {firma.unvan}
              </p>
            </div>

            <div className="py-1">
              {onFiyatPiyasaFormu && (
                <button
                  type="button"
                  onClick={() => handleAction(onFiyatPiyasaFormu)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Fiyat Araştırma Mektubu
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Hitaplı, adresli ve il/ilçe başlıklı isteme mektubu
                    </div>
                  </div>
                </button>
              )}

              {onBirimFiyatArastirmasi && (
                <button
                  type="button"
                  onClick={() => handleAction(onBirimFiyatArastirmasi)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors cursor-pointer"
                >
                  <Tag className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Birim Fiyat Teklif Mektubu
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Firma unvanı, VKN ve taahhütname formatı
                    </div>
                  </div>
                </button>
              )}

              {onBosTeklifCetveli && (
                <button
                  type="button"
                  onClick={() => handleAction(onBosTeklifCetveli)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Birim Fiyat Teklif Cetveli
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Firmanın dolduracağı boş birim fiyat tablosu
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/* ─── Satır Kebap Menüsü ─────────────────────────────────────────── */
interface RowMenuProps {
  firma: Firma;
  onFirmaCikar?: (firma: Firma) => void;
  onFiyatGir?: () => void;
  onFiyatPiyasaFormu?: (firma: Firma) => void;
  onBirimFiyatArastirmasi?: (firma: Firma) => void;
  onBosTeklifCetveli?: (firma: Firma) => void;
  onEkapSorgula?: (firma: Firma) => void;
  onSetWinnerFirma?: (firma: Firma) => void;
  isWinner?: boolean;
}

function RowMenu({
  firma,
  onFirmaCikar,
  onFiyatGir,
  onFiyatPiyasaFormu,
  onBirimFiyatArastirmasi,
  onBosTeklifCetveli,
  onEkapSorgula,
  onSetWinnerFirma,
  isWinner,
}: RowMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 240;
      let left = rect.right - menuWidth;
      if (left < 10) left = 10;
      let top = rect.bottom + 4;
      if (top + 280 > window.innerHeight) {
        top = Math.max(10, rect.top - 280 - 4);
      }
      setCoords({ top, left });
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [open, updateCoords]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleItem = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border-0"
        title="Diğer İşlemler"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-[9999] w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
          >
            {onSetWinnerFirma && (
              <button
                type="button"
                onClick={() => handleItem(() => onSetWinnerFirma(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                {isWinner ? "Kazanan Seçimini Kaldır" : "Kazanan Firma Olarak Seç"}
              </button>
            )}

            {onFiyatGir && (
              <button
                type="button"
                onClick={() => handleItem(onFiyatGir)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-emerald-500 shrink-0" />
                Teklif / Fiyat Girişi Yap
              </button>
            )}

            {onFiyatPiyasaFormu && (
              <button
                type="button"
                onClick={() => handleItem(() => onFiyatPiyasaFormu(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                Fiyat Araştırma İsteme Mektubu
              </button>
            )}

            {onBirimFiyatArastirmasi && (
              <button
                type="button"
                onClick={() => handleItem(() => onBirimFiyatArastirmasi(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                Birim Fiyat Teklif Mektubu
              </button>
            )}

            {onBosTeklifCetveli && (
              <button
                type="button"
                onClick={() => handleItem(() => onBosTeklifCetveli(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                Birim Fiyat Teklif Cetveli
              </button>
            )}

            {onEkapSorgula && (
              <button
                type="button"
                onClick={() => handleItem(() => onEkapSorgula(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                EKAP Yasaklılık Sorgula
              </button>
            )}

            {onFirmaCikar && (
              <>
                <hr className="my-1 border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={() => handleItem(() => onFirmaCikar(firma))}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  Listeden Çıkar
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

/* ─── Ana Bileşen ────────────────────────────────────────────────── */
export function FiyatIstenenFirmalarınSecilmesi({
  title = "Fiyat İstenen Firmaların Seçilmesi",
  firms,
  columns,
  onFirmaEkle,
  onCreateNewFirm,
  onFirmaCikar,
  onFiyatGir,
  onFiyatPiyasaFormu,
  onBirimFiyatArastirmasi,
  onEkapSorgula,
  onDagitimMektubu,
  onKarmaDagitimMektubu,
  onBosTeklifCetveli,
  onYasaklilikTutanagi,
  onOpenFirmaSecmeModali,
  extraHeaderAction,
  winnerFirmaId,
  onSetWinnerFirma,
}: FiyatIstenenFirmalarınSecilmesiProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewFirmModalOpen, setIsNewFirmModalOpen] = useState(false);

  const addedFirms = useMemo(() => {
    const seen = new Set<number>();
    return firms.filter((f) => {
      if (!f.isAdded) return false;
      const key = f.temin_firma_id ?? f.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [firms]);

  const availableFirms = useMemo(() => {
    const seen = new Set<number>();
    return firms.filter((f) => {
      if (f.isAdded || seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [firms]);

  const canAdd = addedFirms.length < MAX_FIRMS;

  const handleConfirm = async (selected: Firma[]) => {
    for (const f of selected) {
      await onFirmaEkle(f);
    }
    setIsModalOpen(false);
  };

  const handleSaveNewFirm = async (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => {
    if (onCreateNewFirm) {
      await onCreateNewFirm(firmaData);
    }
  };

  return (
    <>
      {isModalOpen && (
        <FirmaEkleModali
          availableFirms={availableFirms}
          addedCount={addedFirms.length}
          onConfirm={handleConfirm}
          onOpenNewFirm={() => setIsNewFirmModalOpen(true)}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isNewFirmModalOpen && (
        <YeniFirmaModali
          onClose={() => setIsNewFirmModalOpen(false)}
          onSave={handleSaveNewFirm}
        />
      )}

      <div className="space-y-0 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xs overflow-hidden">
        {/* Üst Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {title}
                </h3>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 px-2 py-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-full">
                  {addedFirms.length} / {MAX_FIRMS} Firma
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Fiyat teklifi istenecek firmalar — en az{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {MIN_FIRMS}
                </span>{" "}
                en fazla{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {MAX_FIRMS}
                </span>{" "}
                istekli seçilmelidir.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 1. Dağıtımlı Teklif İsteme Mektubu Hızlı Butonu */}
            {onDagitimMektubu && (
              <button
                type="button"
                onClick={onDagitimMektubu}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                title="Tüm firmalara dağıtımlı teklif isteme mektubunu açar ve hazırlar"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Teklif Dağıtım Mektubu</span>
              </button>
            )}

            {/* 2. Havuzdan Firma Ekle */}
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => {
                if (onOpenFirmaSecmeModali) {
                  onOpenFirmaSecmeModali();
                } else {
                  setIsModalOpen(true);
                }
              }}
              title={
                !canAdd
                  ? `Maksimum ${MAX_FIRMS} firma eklenebilir`
                  : "Havuzdan firma seç ve ekle"
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold transition-colors cursor-pointer border-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Havuzdan Ekle</span>
            </button>

            {/* 3. Yeni Firma Kaydet & Ekle */}
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => setIsNewFirmModalOpen(true)}
              title={
                !canAdd
                  ? `Maksimum ${MAX_FIRMS} firma eklenebilir`
                  : "Yeni firma tanımlayıp doğrudan dosyaya ekle"
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>+ Yeni Firma</span>
            </button>

            {extraHeaderAction}
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap ${
                      column.className ?? ""
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[200px]">
                  Hızlı Eylemler & Dağıtım
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {addedFirms.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-10 text-center text-xs text-slate-400"
                  >
                    Henüz istekli firma eklenmedi.{" "}
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-blue-500 hover:underline font-bold cursor-pointer bg-transparent border-0 p-0 ml-1"
                    >
                      Havuzdan Firma Seçin
                    </button>
                    {" "}veya{" "}
                    <button
                      type="button"
                      onClick={() => setIsNewFirmModalOpen(true)}
                      className="text-indigo-500 hover:underline font-bold cursor-pointer bg-transparent border-0 p-0"
                    >
                      Yeni Firma Ekleyin
                    </button>
                  </td>
                </tr>
              ) : (
                addedFirms.map((firma, idx) => {
                  const isWinner = winnerFirmaId
                    ? winnerFirmaId === firma.id ||
                      winnerFirmaId === (firma as any).firma_id
                    : false;

                  return (
                    <tr
                      key={
                        firma.temin_firma_id
                          ? `temin-${firma.temin_firma_id}`
                          : `firm-${firma.id}-${idx}`
                      }
                      className={`group transition-colors ${
                        isWinner
                          ? "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 font-medium"
                          : "hover:bg-slate-50/70 dark:hover:bg-slate-900/50"
                      }`}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-3 text-xs text-slate-700 dark:text-slate-300 ${
                            column.className ?? ""
                          }`}
                        >
                          {column.render ? (
                            column.render(firma)
                          ) : column.key === "unvan" && isWinner ? (
                            <div className="flex items-center gap-2">
                              <span>{String(firma[column.key] ?? "-")}</span>
                              <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/25 shrink-0">
                                <Trophy className="w-2.5 h-2.5 text-amber-600" />
                                Kazanan
                              </span>
                            </div>
                          ) : (
                            String(firma[column.key] ?? "-")
                          )}
                        </td>
                      ))}

                      {/* Hızlı Eylem Butonları & Kebap Menüsü */}
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* 1. Teklif / Mektup Format Menüsü */}
                          <FirmaMektupMenu
                            firma={firma}
                            onFiyatPiyasaFormu={onFiyatPiyasaFormu}
                            onBirimFiyatArastirmasi={onBirimFiyatArastirmasi}
                            onBosTeklifCetveli={onBosTeklifCetveli}
                          />

                          {/* 2. EKAP Yasaklılık Butonu */}
                          {onEkapSorgula && (
                            <button
                              type="button"
                              onClick={() => onEkapSorgula(firma)}
                              className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-900/60 text-[11px] font-bold transition-colors cursor-pointer border border-orange-200/60 dark:border-orange-800/40 flex items-center gap-1"
                              title={`${firma.unvan} için EKAP Yasaklılık Durumunu Sorgula`}
                            >
                              <ShieldAlert className="w-3 h-3 text-orange-500" />
                              <span>EKAP Sorgu</span>
                            </button>
                          )}

                          {/* 3. Fiyat Gir Butonu */}
                          {onFiyatGir && (
                            <button
                              type="button"
                              onClick={onFiyatGir}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1"
                              title="Teklif Fiyatlarını Gir"
                            >
                              <Calculator className="w-3 h-3 text-emerald-500" />
                              <span>Fiyat Gir</span>
                            </button>
                          )}

                          {/* 4. Kebap Menüsü */}
                          <RowMenu
                            firma={firma}
                            onFirmaCikar={onFirmaCikar}
                            onFiyatGir={onFiyatGir}
                            onFiyatPiyasaFormu={onFiyatPiyasaFormu}
                            onBirimFiyatArastirmasi={onBirimFiyatArastirmasi}
                            onBosTeklifCetveli={onBosTeklifCetveli}
                            onEkapSorgula={onEkapSorgula}
                            onSetWinnerFirma={onSetWinnerFirma}
                            isWinner={isWinner}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
