import React, { useState } from "react";
import { AlertTriangle, UserPlus, X } from "lucide-react";

export interface YeniFirmaModaliProps {
  onClose: () => void;
  onSave: (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => Promise<void>;
}

export function YeniFirmaModali({ onClose, onSave }: YeniFirmaModaliProps): React.JSX.Element {
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
