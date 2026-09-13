import { useCallback, useEffect, useRef, useState } from "react";
import { DosyaInspectorSubData } from "./types";

export function useDosyaInspectorData(dosyaOrId?: any, initialDosyaParam?: any) {
  const actualDosya =
    typeof dosyaOrId === "object" && dosyaOrId !== null
      ? dosyaOrId
      : initialDosyaParam;

  const actualId: number | undefined =
    typeof dosyaOrId === "number"
      ? dosyaOrId
      : actualDosya?.id
      ? Number(actualDosya.id)
      : undefined;

  const [fullDosya, setFullDosya] = useState<any>(actualDosya);
  const [subData, setSubData] = useState<DosyaInspectorSubData>({
    kalemler: [],
    firmalar: [],
    teklifler: [],
    komisyon: [],
    sablonVeri: [],
  });
  const [loading, setLoading] = useState(false);

  const actualDosyaRef = useRef(actualDosya);
  useEffect(() => {
    actualDosyaRef.current = actualDosya;
  }, [actualDosya]);

  const loadSubData = useCallback(async (id: number) => {
    if (!id || !window.electron?.ipcRenderer) return;
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) return;

    setLoading(true);
    try {
      const [dRes, kRes, fRes, tRes, komRes, sRes] = await Promise.all([
        window.electron.ipcRenderer.invoke(
          "db:query",
          `SELECT d.*, 
                  b.birim_adi, 
                  p_irt.ad_soyad as irtibat_ad,
                  p_onay.ad_soyad as onaylayan_ad,
                  p_sunan.ad_soyad as sunan_ad,
                  p_haz.ad_soyad as hazirlayan_ad,
                  p_talep.ad_soyad as talep_eden_ad
           FROM DATA_TeminDosyasi d
           LEFT JOIN TANIM_Birim b ON d.birim_id = b.id
           LEFT JOIN TANIM_Personel p_irt ON d.irtibat_yetkilisi_id = p_irt.id
           LEFT JOIN TANIM_Personel p_onay ON d.onaylayan_yetkili_id = p_onay.id
           LEFT JOIN TANIM_Personel p_sunan ON d.sunan_gorevli_id = p_sunan.id
           LEFT JOIN TANIM_Personel p_haz ON d.piyasa_arastirma_gorevlisi_id = p_haz.id
           LEFT JOIN TANIM_Personel p_talep ON d.talep_eden_personel_id = p_talep.id
           WHERE d.id = ?`,
          [numId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC",
          [numId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT tf.*, f.unvan, f.vergi_no, f.telefon, f.yetkili FROM DATA_TeminFirma tf LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id WHERE tf.temin_dosya_id = ?",
          [numId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?",
          [numId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT tk.*, p.ad_soyad, p.unvan as personel_unvan, tk.gorev as gorev_adi FROM DATA_TeminKomisyon tk LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id WHERE tk.temin_dosya_id = ? ORDER BY tk.id ASC",
          [numId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ?",
          [numId],
        ),
      ]);

      if (dRes?.success && dRes.data.length > 0) {
        setFullDosya(dRes.data[0]);
      } else if (actualDosyaRef.current) {
        setFullDosya(actualDosyaRef.current);
      }

      setSubData({
        kalemler: kRes?.success ? kRes.data : [],
        firmalar: fRes?.success ? fRes.data : [],
        teklifler: tRes?.success ? tRes.data : [],
        komisyon: komRes?.success ? komRes.data : [],
        sablonVeri: sRes?.success ? sRes.data : [],
      });
    } catch (err) {
      console.error("Dosya detayları yüklenirken hata:", err);
      if (actualDosyaRef.current) setFullDosya(actualDosyaRef.current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (actualId) {
      loadSubData(actualId);
    } else if (actualDosyaRef.current) {
      setFullDosya(actualDosyaRef.current);
    }
  }, [actualId, loadSubData]);

  const d = fullDosya || actualDosya || {};

  const toplamYaklasikMaliyet =
    subData.kalemler.reduce(
      (acc, cur) => acc + Number(cur.yaklasik_maliyet_toplam || 0),
      0,
    ) || Number(d.yaklasik_maliyet || 0);

  const fullPayload = {
    dosya: d,
    ...subData,
  };

  return {
    dosya: d,
    subData,
    loading,
    toplamYaklasikMaliyet,
    fullPayload,
    reload: () => {
      if (actualId) loadSubData(actualId);
    },
  };
}
