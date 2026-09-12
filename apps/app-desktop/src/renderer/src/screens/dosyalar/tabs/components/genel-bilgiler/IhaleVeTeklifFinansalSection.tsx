import React, { useState } from "react";
import { Building2, HelpCircle, Info, Loader2, Sparkles } from "lucide-react";
import { YeniDosyaTabProps } from "../../../types";
import { useWorkspaceStore } from "../../../../../store/workspaceStore";
import { useSettingsStore } from "../../../../../store/settingsStore";
import { useDosyalarHooks } from "../../../../dosyalar/dosyalar.hooks";

export function IhaleVeTeklifFinansalSection(
  props: YeniDosyaTabProps,
): React.JSX.Element {
  const { formData, setFormData, limitType, getIhaleSekliExplanation } = props;

  const isAiConfigured = useSettingsStore((state) => state.isAiConfigured);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const { activeDosyaId } = useWorkspaceStore();
  const { dosyalar } = useDosyalarHooks();
  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId);
  const defaultEsas = activeDosya?.hesaplama_esasi ||
    "Ortalama fiyat esasına göre";

  const [isAiChecking, setIsAiChecking] = useState(false);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleAiCheckType = async () => {
    if (!formData.konu) {
      alert(
        "Lütfen önce Genel Bilgiler sekmesinden 'İşin Konusu / İhale Adı' alanını doldurun.",
      );
      return;
    }

    setIsAiChecking(true);
    try {
      const prompt =
        `Kullanıcı "${formData.konu}" konusuyla bir Doğrudan Temin dosyası açmak istiyor. Sence bu alım türü hangisi olmalıdır? Seçenekler: "mal", "hizmet", "yapim_isi", "danismanlik". Lütfen sadece bu dört değerden birini döndür. Açıklama veya cümle yazma. C25 beton atımı, tamirat tadilat gibi işler "yapim_isi" olur.`;

      const res = await (window as any).electron.ipcRenderer.invoke(
        "ai:generate",
        {
          prompt,
          systemInstruction:
            "Sen kamu ihale mevzuatı uzmanısın. Kullanıcının iş tanımını analiz edip SADECE 'mal', 'hizmet', 'yapim_isi' veya 'danismanlik' kelimesini döndürmelisin.",
        },
      );

      if (res.success && res.data) {
        const suggestion = res.data.trim().toLowerCase();
        let matchedType = "";

        if (suggestion.includes("yapim") || suggestion.includes("yapım")) {
          matchedType = "yapim_isi";
        } else if (suggestion.includes("hizmet")) matchedType = "hizmet";
        else if (suggestion.includes("danis") || suggestion.includes("danış")) {
          matchedType = "danismanlik";
        } else if (suggestion.includes("mal")) matchedType = "mal";

        const typeNames: Record<string, string> = {
          mal: "Mal Alımı",
          hizmet: "Hizmet Alımı",
          yapim_isi: "Yapım İşi",
          danismanlik: "Danışmanlık Alımı",
        };

        if (matchedType && matchedType !== formData.tur) {
          const currentType = formData.tur || "mal";
          if (matchedType !== "mal") {
            alert(
              `Yapay Zeka bu işin "${
                typeNames[matchedType]
              }" niteliğinde olduğunu değerlendirdi.\n\nAncak şu anki sürümde şablon ve evrak süreçleri yalnızca "Mal Alımı" için tam olarak optimize edilmiştir. Hizmet ve Yapım işleri çok yakında aktif olacaktır.`,
            );
          } else {
            const userConfirm = window.confirm(
              `Yapay Zeka bu işin "${
                typeNames[matchedType]
              }" olması gerektiğini düşünüyor. Şu an "${
                typeNames[currentType]
              }" seçili.\n\nTürü "${
                typeNames[matchedType]
              }" olarak güncellemek ister misiniz?`,
            );
            if (userConfirm) {
              setFormData({ ...formData, tur: matchedType });
            }
          }
        } else if (matchedType === formData.tur) {
          alert(
            `Yapay Zeka da sizinle aynı fikirde. Doğru tür seçilmiş: ${
              typeNames[matchedType]
            }`,
          );
        } else {
          alert(
            `Yapay Zeka öneride bulunamadı veya anlaşılamayan bir sonuç döndü: ${res.data}`,
          );
        }
      } else {
        alert(
          "Yapay Zeka isteği başarısız oldu: " +
            (res.error ||
              "Bilinmeyen hata (Ayarlardan API anahtarını kontrol edin)"),
        );
      }
    } catch (err: any) {
      alert("Hata oluştu: " + err.message);
    } finally {
      setIsAiChecking(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
        <Building2 className="text-indigo-500 w-5 h-5" />
        <h2 className="text-base font-bold text-slate-800 dark:text-white">
          İhale Koşulları, Teklif ve Finansal Detaylar
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            İhale Tipi
          </label>
          <input
            type="text"
            disabled
            value={formData.ihale_tipi || "Doğrudan Temin"}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450">
              Alım / İhale Türü
            </label>
            {isAiConfigured && (
              <button
                type="button"
                onClick={handleAiCheckType}
                disabled={isAiChecking}
                title="Yapay Zeka ile tür önerisi al"
                className="text-[10px] flex items-center gap-1 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-400 px-2 py-0.5 rounded-md transition-colors font-medium border border-purple-200 dark:border-purple-800"
              >
                {isAiChecking ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {isAiChecking ? "Kontrol ediliyor..." : "AI Önerisi"}
              </button>
            )}
          </div>
          <select
            value={formData.tur || "mal"}
            onChange={(e) => setFormData({ ...formData, tur: e.target.value })}
            title="Alım / İhale Türü"
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            <option value="mal">Mal Alımı</option>
            <option
              value="hizmet"
              disabled
              className="text-slate-400 bg-slate-50 dark:bg-slate-900"
            >
              Hizmet Alımı (Yakında)
            </option>
            <option
              value="yapim_isi"
              disabled
              className="text-slate-400 bg-slate-50 dark:bg-slate-900"
            >
              Yapım İşi (Yakında)
            </option>
            <option
              value="danismanlik"
              disabled
              className="text-slate-400 bg-slate-50 dark:bg-slate-900"
            >
              Danışmanlık Alımı (Yakında)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5 flex items-center gap-1">
            Doğrudan Temin Maddesi (İhale Şekli)
            <span
              title={getIhaleSekliExplanation?.(
                formData.ihale_sekli ?? undefined,
              ) || ""}
            >
              <HelpCircle size={13} className="text-slate-450 cursor-help" />
            </span>
          </label>
          <select
            title="Doğrudan Temin Maddesi Seçin"
            value={formData.ihale_sekli ||
              (limitType === "buyuksehir" ? "22/d*" : "22/d**")}
            onChange={(e) =>
              setFormData({
                ...formData,
                ihale_sekli: e.target.value,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            {limitType === "buyuksehir"
              ? <option value="22/d*">22/d* (Büyükşehir)</option>
              : <option value="22/d**">22/d** (Diğer İdareler)</option>}
            <option value="22/a">22/a (Tek Yetkili)</option>
            <option value="22/b">22/b (Özel Hak)</option>
            <option value="22/c">22/c (Uyum Alımı)</option>
          </select>
          {formData.ihale_sekli?.startsWith("22/d") && (
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
              <Info className="w-3 h-3 inline-block mr-1 mb-0.5" />
              22/d limiti, kurum ayarlarındaki "Kamu İhale Mevzuatı Limit Tipi"
              (
              {limitType === "buyuksehir" ? "Büyükşehir" : "Diğer İdareler"})
              ayarına göre otomatik seçilmiştir.
            </p>
          )}
          {!formData.ihale_sekli?.startsWith("22/d") && (
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
              {getIhaleSekliExplanation?.(formData.ihale_sekli ?? undefined)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Yaklaşık Maliyet Hesabı
          </label>
          <select
            value={formData.yaklasik_maliyet_hesaplamasi || "burada"}
            onChange={(e) =>
              setFormData({
                ...formData,
                yaklasik_maliyet_hesaplamasi: e.target.value,
                yaklasik_maliyet: e.target.value !== "onceden"
                  ? 0
                  : formData.yaklasik_maliyet,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value="burada">Burada Hesaplanacak (Teklifler ile)</option>
            <option value="onceden">
              Önceden Hesaplandı (Tutar Girilecek)
            </option>
            <option value="hesaplanmayacak">Hesaplanmayacak</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Yaklaşık Maliyet KDV Durumu
          </label>
          <select
            value={formData.yaklasik_maliyet_kdv_dahil_mi ?? 0}
            onChange={(e) => {
              const newKdvDahil = parseInt(e.target.value, 10);
              const oldKdvDahil = formData.yaklasik_maliyet_kdv_dahil_mi ?? 0;
              const kdvRate = Number(formData.kdv) || 20;
              let currentVal = formData.yaklasik_maliyet || 0;

              if (newKdvDahil !== oldKdvDahil) {
                if (newKdvDahil === 1) {
                  currentVal = currentVal * (1 + kdvRate / 100);
                } else {
                  currentVal = currentVal / (1 + kdvRate / 100);
                }
              }

              setFormData({
                ...formData,
                yaklasik_maliyet_kdv_dahil_mi: newKdvDahil,
                yaklasik_maliyet: Number(currentVal.toFixed(2)),
              });
            }}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value={0}>KDV Hariç</option>
            <option value={1}>KDV Dahil</option>
          </select>
        </div>

        {formData.yaklasik_maliyet_hesaplamasi === "onceden" && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 mb-1.5">
              Hesaplanan Yaklaşık Maliyet Tutar *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.yaklasik_maliyet || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  yaklasik_maliyet: parseFloat(e.target.value) || 0,
                })}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-bold"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            KDV Oranı (%)
          </label>
          <select
            value={formData.kdv || "20"}
            onChange={(e) => setFormData({ ...formData, kdv: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            <option value="0">KDV Hariç (%0)</option>
            <option value="1">KDV (%1)</option>
            <option value="10">KDV (%10)</option>
            <option value="20">KDV (%20)</option>
            <option value="Tevkifat">Tevkifatlı KDV</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            Teklif / Sözleşme Türü
          </label>
          <select
            value={formData.teklif_sozlesme_turu || "Birim Fiyat"}
            onChange={(e) =>
              setFormData({
                ...formData,
                teklif_sozlesme_turu: e.target.value,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            <option value="Birim Fiyat">Birim Fiyatlı Teklif</option>
            <option value="Götürü Bedel">Götürü Bedel Teklif</option>
            <option value="Sözleşmesiz">Sözleşme Yapılmayacak</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Fiyat Farkı Dayanağı
          </label>
          <select
            title="Fiyat Farkı Dayanağı"
            value={formData.fiyat_farki_dayanagi || "Fiyat Farkı Ödenmeyecek"}
            onChange={(e) =>
              setFormData({
                ...formData,
                fiyat_farki_dayanagi: e.target.value,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            <option value="Fiyat Farkı Ödenmeyecek">
              Fiyat Farkı Ödenmeyecek
            </option>
            <option value="31.08.2013 Tarih ve 2013/5216 Sayılı Mal Alımı Bakanlar Kurulu Kararına Göre">
              31.08.2013 Tarih ve 2013/5216 Sayılı Mal Alımı Bakanlar Kurulu
              Kararına Göre
            </option>
            <option value="31.08.2013 Tarih ve 2013/5215 Sayılı Hizmet Alımı Bakanlar Kurulu Kararına Göre">
              31.08.2013 Tarih ve 2013/5215 Sayılı Hizmet Alımı Bakanlar Kurulu
              Kararına Göre
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Yatırım Proje Numarası
          </label>
          <input
            type="text"
            value={formData.yatirim_proje_no || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                yatirim_proje_no: e.target.value,
              })}
            placeholder="Örn: 2026-03-Y-12"
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-mono"
          />
        </div>

        {formData.yaklasik_maliyet_hesaplamasi === "burada" && (
          <>
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                Hesaplama Yöntemi / Dayanağı
              </label>
              <select
                title="Hesaplama Yöntemi / Dayanağı"
                value={formData.komisyon_takdiri ||
                  "Sadece araştırma fiyatları dikkate alınacak"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    komisyon_takdiri: e.target.value,
                  })}
                className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              >
                <option value="Sadece araştırma fiyatları dikkate alınacak">
                  Sadece araştırma fiyatları dikkate alınacak
                </option>
                <option value="Komisyon takdiri kullanılacak">
                  Komisyon takdiri kullanılacak
                </option>
                <option value="Son alım fiyatlarını da kullan">
                  Son alım fiyatlarını da kullan
                </option>
              </select>
            </div>

            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                Hesaplama Esası
              </label>
              <select
                value={formData.hesaplama_esasi || defaultEsas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hesaplama_esasi: e.target.value,
                  })}
                className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              >
                <option value="En Düşük fiyat esasına göre">
                  En Düşük fiyat esasına göre
                </option>
                <option value="Ortalama fiyat esasına göre">
                  Ortalama fiyat esasına göre
                </option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-55 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="alt_yuklenici"
            checked={formData.alt_yuklenici_olacak_mi === 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                alt_yuklenici_olacak_mi: e.target.checked ? 1 : 0,
              })}
            className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="alt_yuklenici"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Alt Yüklenici Olabilir
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="kismi_teklif"
            checked={formData.kismi_teklif_verilecek_mi === 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                kismi_teklif_verilecek_mi: e.target.checked ? 1 : 0,
              })}
            className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="kismi_teklif"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Kısmi Teklife Açık
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="avans"
            checked={formData.avans_verilecek_mi === 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                avans_verilecek_mi: e.target.checked ? 1 : 0,
              })}
            className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="avans"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Avans Ödemesi Var
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="tibbi_cihaz"
            checked={formData.tibbi_cihaz_alimi_mi === 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                tibbi_cihaz_alimi_mi: e.target.checked ? 1 : 0,
              })}
            className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="tibbi_cihaz"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Tıbbi Cihaz Alımı
          </label>
        </div>

        {formData.tur === "hizmet" && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="yillara_yaygin"
                checked={formData.yillara_yaygin === 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yillara_yaygin: e.target.checked ? 1 : 0,
                  })}
                className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="yillara_yaygin"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Yıllara Yaygın Hizmet Alımı
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sozlesme_yapilacak_mi"
                checked={formData.sozlesme_yapilacak_mi === 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sozlesme_yapilacak_mi: e.target.checked ? 1 : 0,
                  })}
                className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="sozlesme_yapilacak_mi"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Sözleşme Yapılacak mı?
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
