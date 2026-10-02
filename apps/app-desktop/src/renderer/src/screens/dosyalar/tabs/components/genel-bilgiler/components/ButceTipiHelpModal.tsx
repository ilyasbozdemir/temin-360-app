import React, { useState } from 'react'
import {
  BookOpen,
  Building2,
  CheckCircle2,
  Coins,
  FileText,
  HelpCircle,
  Info,
  Scale,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react'

interface ButceTipiHelpModalProps {
  isOpen: boolean
  onClose: () => void
  selectedType?: string
}

export function ButceTipiHelpModal({
  isOpen,
  onClose,
  selectedType = 'Genel Bütçe'
}: ButceTipiHelpModalProps): React.JSX.Element | null {
  const [activeTab, setActiveTab] = useState<'tanimlar' | 'etkileri'>('tanimlar')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900/50">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Bütçe Tipi Rehberi &amp; Kamu Mevzuatı Bilgisi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kamu alımlarında bütçe türlerinin anlamı ve süreçteki yasal etkileri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 select-none">
          <button
            onClick={() => setActiveTab('tanimlar')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === 'tanimlar'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-transparent'
            }`}
          >
            <BookOpen size={14} />
            Bütçe Tipleri &amp; Tanımlar
          </button>
          <button
            onClick={() => setActiveTab('etkileri')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === 'etkileri'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-transparent'
            }`}
          >
            <ShieldCheck size={14} />
            Sistemde &amp; Mevzuatta Neyi Belirler?
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed custom-scrollbar">
          {activeTab === 'tanimlar' && (
            <div className="space-y-3.5">
              {/* Genel Bütçe */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  selectedType === 'Genel Bütçe'
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">
                      Genel Bütçe
                    </h4>
                  </div>
                  {selectedType === 'Genel Bütçe' && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                      Şu An Seçili
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-350 text-[11.5px] leading-relaxed">
                  Devletin ana bütçesidir ve merkezi yönetim kapsamındaki genel bütçeli idareleri
                  kapsar. Gelirleri (vergi vb.) Hazine'de toplanır, giderleri Merkezi Yönetim Bütçe
                  Kanunu ile TBMM onayıyla yapılır. Cumhurbaşkanlığı, Bakanlıklar, TBMM, Valilikler
                  ve Yüksek Mahkemeler bu gruptadır.
                </p>
              </div>

              {/* Özel Bütçe */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  selectedType === 'Özel Bütçe'
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">
                      Özel Bütçe
                    </h4>
                  </div>
                  {selectedType === 'Özel Bütçe' && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                      Şu An Seçili
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-350 text-[11.5px] leading-relaxed">
                  Belirli kamu kurumlarının kendi özel bütçeleri ile yönetildiği yapıdır. Merkezi
                  yönetim içindedir ama kurumun kendi gelirleri (harç, katkı payı vb.) bulunur.
                  Eksik kalan kısım genel bütçeden Hazine yardımı olarak aktarılır. Üniversiteler,
                  YÖK, Karayolları Genel Müdürlüğü (KGM), Devlet Su İşleri (DSİ) örnek verilebilir.
                </p>
              </div>

              {/* Döner Sermaye */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  selectedType === 'Döner Sermaye'
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">
                      Döner Sermaye (DÖSE)
                    </h4>
                  </div>
                  {selectedType === 'Döner Sermaye' && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                      Şu An Seçili
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-350 text-[11.5px] leading-relaxed">
                  Kamu kurumunun asıl görevinin yanında mal veya hizmet üreterek elde ettiği gelirle
                  yönettiği ayrı mali yapıdır. Üretilen gelir tekrar aynı hizmete harcanır (sermaye
                  döner). Devlet ve üniversite hastaneleri, meslek liseleri ve uygulama/araştırma
                  merkezleri en yaygın örnekleridir. Harcama usulleri kendi DÖSE mevzuatına tabidir.
                </p>
              </div>

              {/* Diğer */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  selectedType === 'Diğer'
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">
                      Diğer Bütçe Türleri
                    </h4>
                  </div>
                  {selectedType === 'Diğer' && (
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-md">
                      Şu An Seçili
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-350 text-[11.5px] leading-relaxed">
                  Yukarıdaki üç ana bütçeye girmeyen mali yapılardır:
                </p>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 list-disc pl-4">
                  <li>
                    <strong>Mahalli İdareler:</strong> Belediyeler, İl Özel İdareleri ve Bağlı
                    İdareler (İSKİ, EGO vb.).
                  </li>
                  <li>
                    <strong>Sosyal Güvenlik Kurumları:</strong> SGK bütçesi.
                  </li>
                  <li>
                    <strong>Düzenleyici Kurumlar:</strong> RTÜK, BDDK, SPK, EPDK vb. üst kurullar.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'etkileri' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex items-start gap-3">
                <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                    1. Ödeme Kaynağı
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    "Bu para hangi bütçeden çıkacak?" sorusunun cevabıdır. Genel Bütçede Hazine'den,
                    Döner Sermayede hizmet üretim gelirinden, Özel Bütçede kurumun öz bütçesinden
                    ödenir.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl flex items-start gap-3">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                    2. Ödenek &amp; Bakiye Kontrolü
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Her bütçe tipinin kendi ödeneği vardır. Sistem, harcama yapılırken ilgili bütçe
                    kaleminde yeterli bakiye olup olmadığını ve limit durumunu buna göre denetler.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl flex items-start gap-3">
                <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                    3. Uygulanacak Yasal Mevzuat
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Genel ve Özel Bütçede 4734 (İhale) ve 5018 (Kamu Maliye) kanunları katı şekilde
                    uygulanır. Döner sermayede ise DÖSE Harcama Yönetmeliği uygulanır.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                    4. Raporlama &amp; Muhasebe Kayıtları
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Hangi bütçe seçildiyse harcama o bütçenin gerçekleşme raporuna yazılır. Bütçe
                    raporları ve mali tablolar buna göre ayrışır.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                    5. Yetki &amp; Onay Akışları
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Genel Bütçede Harcama Yetkilisi (İhale Yetkilisi), Döner Sermayede Başhekim/DÖSE
                    İşletme Müdürü ve DÖSE Saymanı imza yetkisine sahiptir.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Info size={12} className="text-blue-500" />
            TEMİN 360 Kamu Mevzuatı Bilgi Sistemi
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border-none"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
