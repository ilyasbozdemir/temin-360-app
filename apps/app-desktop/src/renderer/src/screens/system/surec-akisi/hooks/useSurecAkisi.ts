import { useState, useMemo, useEffect } from 'react'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { useDosyalarHooks } from '../../../dosyalar/dosyalar.hooks'
import { useCiktiMerkeziData } from '../../../dosya/CiktiMerkezi.hooks'
import {
  Belge,
  TaranmisBelge,
  Kalem,
  FirmaItem,
  Komisyon,
  Stage,
  StageWithStatus,
  UseSurecAkisiReturn
} from '../types'
import { dosyaBoyutFormatla, belgeSonrakiDurum } from '../utils/helpers'

export function useSurecAkisi(): UseSurecAkisiReturn {
  const { activeDosyaId } = useWorkspaceStore()
  const { dosyalar } = useDosyalarHooks()

  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId)
  const { dosyaContext } = useCiktiMerkeziData(activeDosyaId)

  const [selectedTab, setSelectedTab] = useState<string>('ozet')

  const [dbKalemler, setDbKalemler] = useState<any[]>([])
  const [dbFirmalar, setDbFirmalar] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true

    if (!activeDosyaId) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setDbKalemler([])
          setDbFirmalar([])
        }
      })
      return
    }

    Promise.all([
      // 1) Kalemler
      window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
        [activeDosyaId]
      ),
      // 2) Main dossier (kazanan firma_id)
      window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT firma_id FROM DATA_TeminDosyasi WHERE id = ?',
        [activeDosyaId]
      ),
      // 3) Item bids sum per firm
      window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT 
          t.temin_firma_id, 
          SUM(t.birim_fiyat * k.miktar) as hesaplanan_toplam
         FROM DATA_TeminKalemTeklif t
         JOIN DATA_TeminKalem k ON t.temin_kalem_id = k.id
         WHERE t.temin_dosya_id = ?
         GROUP BY t.temin_firma_id`,
        [activeDosyaId]
      ),
      // 4) Firm list
      window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT 
          df.id as temin_firma_id,
          df.firma_id,
          COALESCE(NULLIF(df.unvan, ''), NULLIF(tf.unvan, ''), 'Firma ' || df.id) as unvan,
          COALESCE(NULLIF(df.telefon, ''), NULLIF(tf.telefon, ''), '—') as telefon,
          COALESCE(NULLIF(df.email, ''), NULLIF(tf.email, ''), '—') as email,
          df.davet_tarihi,
          df.teklif_tarihi,
          df.teklif_toplami,
          df.kazandi_mi,
          df.teklif_verdi_mi,
          df.teklif_durumu
        FROM DATA_TeminFirma df
        LEFT JOIN TANIM_Firma tf ON df.firma_id = tf.id
        WHERE df.temin_dosya_id = ? AND (df.aktif_mi IS NULL OR df.aktif_mi = 1)
        ORDER BY df.id ASC`,
        [activeDosyaId]
      )
    ])
      .then(([kalemRes, dosyaRes, bidsRes, firmRes]: [any, any, any, any]) => {
        if (!isMounted) return

        if (kalemRes.success && kalemRes.data) {
          setDbKalemler(kalemRes.data)
        } else {
          setDbKalemler([])
        }

        const kazananFirmaId =
          dosyaRes.success && dosyaRes.data?.length > 0 ? dosyaRes.data[0].firma_id : null

        const bidsMap = new Map<number, number>()
        if (bidsRes.success && bidsRes.data) {
          bidsRes.data.forEach((b: any) => {
            if (b.temin_firma_id) {
              bidsMap.set(b.temin_firma_id, Number(b.hesaplanan_toplam) || 0)
            }
          })
        }

        if (firmRes.success && firmRes.data) {
          const processed = firmRes.data.map((f: any) => ({
            ...f,
            isKazanan: kazananFirmaId ? f.firma_id === kazananFirmaId : false,
            kazananFirmaId,
            bidsSum: bidsMap.get(f.temin_firma_id) ?? bidsMap.get(f.id)
          }))
          setDbFirmalar(processed)
        } else {
          setDbFirmalar([])
        }
      })
      .catch((err: any) => {
        console.error('Failed to fetch surec akisi data:', err)
      })

    return () => {
      isMounted = false
    }
  }, [activeDosyaId])

  // Real data binding with empty fallback
  const kalemler: Kalem[] = useMemo(() => {
    const rawList =
      dbKalemler && dbKalemler.length > 0
        ? dbKalemler
        : dosyaContext?.kalemler && dosyaContext.kalemler.length > 0
          ? dosyaContext.kalemler
          : []

    return rawList.map((k: any, idx: number) => {
      const miktar = Number(k.miktar) || 1
      const birimFiyat = Number(k.birim_fiyat ?? k.yaklasik_maliyet_birim_fiyat ?? 0)
      const toplamBedel =
        Number(k.toplam_tutar ?? k.yaklasik_maliyet_toplam_tutar) || miktar * birimFiyat

      return {
        id: k.id || idx + 1,
        malzemeAdi: k.kalem_adi || k.malzeme_adi || 'Malzeme Kalemi',
        miktar,
        birim: k.birim || 'Adet',
        birimFiyat,
        toplamBedel,
        tasinirKodu: k.tasinir_kodu || '—',
        aciklama: k.aciklama || '',
        tipi: k.tipi || 'Mal'
      }
    })
  }, [dbKalemler, dosyaContext])

  const firmalar: FirmaItem[] = useMemo(() => {
    const raw =
      dbFirmalar && dbFirmalar.length > 0
        ? dbFirmalar
        : (dosyaContext as any)?.firmalar || (dosyaContext as any)?.istekliFirmalar

    if (raw && raw.length > 0) {
      return raw.map((f: any, idx: number) => {
        const bidsSum = f.bidsSum
        const teklifBedeli =
          bidsSum && bidsSum > 0
            ? bidsSum
            : f.teklif_toplami ?? f.teklif_bedeli ?? f.teklifBedeli

        const davetTarihi = f.davet_tarihi || f.davetTarihi || '—'
        const teklifTarihi =
          f.teklif_tarihi || f.teklifTarihi || (teklifBedeli ? 'Tamamlandı' : null)

        let durumu: 'seçildi' | 'teklif' | 'bekliyor' | 'reddedildi' = 'bekliyor'

        const isWinner =
          f.isKazanan ||
          f.secildi_mi === 1 ||
          f.secildi_mi === true ||
          f.teklif_durumu === 'Seçildi' ||
          f.teklif_durumu === 'En Uygun Teklif'

        if (isWinner) {
          durumu = 'seçildi'
        } else if (
          f.teklif_verdi_mi === 1 ||
          f.teklif_verdi_mi === true ||
          f.teklif_durumu === 'Teklif Verildi' ||
          (teklifBedeli !== null && teklifBedeli !== undefined && Number(teklifBedeli) > 0)
        ) {
          if (f.kazananFirmaId && f.firma_id !== f.kazananFirmaId) {
            durumu = 'reddedildi'
          } else {
            durumu = 'teklif'
          }
        } else {
          durumu = 'bekliyor'
        }

        return {
          id: f.id || idx + 1,
          unvan: f.unvan || f.firma_adi || f.ad || 'Tedarikçi Firma',
          telefon: f.telefon || '—',
          email: f.email || '—',
          davetTarihi,
          teklifTarihi,
          teklifBedeli: teklifBedeli ? Number(teklifBedeli) : null,
          durumu
        }
      })
    }
    return []
  }, [dbFirmalar, dosyaContext])

  const komisyonlar: Komisyon[] = useMemo(() => {
    if (dosyaContext?.komisyonlar && dosyaContext.komisyonlar.length > 0) {
      return dosyaContext.komisyonlar.map((k: any, idx: number) => ({
        id: k.id || idx + 1,
        tur: k.tur || k.komisyon_adi || 'Komisyon',
        dayanak: k.dayanak || '4734 Sayılı Kanun',
        olusturmaTarihi: k.tarih || '—',
        durum: k.durum || 'aktif',
        uyeler: (k.uyeler || []).map((u: any, uIdx: number) => ({
          id: u.id || uIdx + 1,
          adSoyad: u.ad_soyad || u.adSoyad || 'Komisyon Üyesi',
          unvan: u.unvan || 'Üye',
          gorev: u.gorev || 'Üye',
          imza: u.imzaladi_mi ? 'imzaladı' : 'bekliyor'
        }))
      }))
    }
    return []
  }, [dosyaContext])

  const [belgeler, setBelgeler] = useState<Belge[]>([
    { id: 1, ad: 'Malzeme Talep Formu', asama: 'İhtiyaç Tespiti', durum: 'oluşturulmadı' },
    {
      id: 2,
      ad: 'Komisyon Görevlendirme Yazısı',
      asama: 'İhtiyaç Tespiti',
      durum: 'oluşturulmadı'
    },
    {
      id: 3,
      ad: 'Piyasa Araştırması Tutanağı',
      asama: 'Piyasa Araştırması',
      durum: 'oluşturulmadı'
    },
    { id: 4, ad: 'Yaklaşık Maliyet Cetveli', asama: 'Onay Süreci', durum: 'oluşturulmadı' },
    { id: 5, ad: 'Doğrudan Temin Onay Belgesi', asama: 'Onay Süreci', durum: 'oluşturulmadı' },
    { id: 6, ad: 'Sipariş Mektubu', asama: 'Onay Süreci', durum: 'oluşturulmadı' },
    { id: 7, ad: 'Muayene Kabul Tutanağı', asama: 'Teslim ve Kabul', durum: 'oluşturulmadı' },
    { id: 8, ad: 'Taşınır İşlem Fişi', asama: 'Teslim ve Kabul', durum: 'oluşturulmadı' },
    { id: 9, ad: 'Ödeme Emri Belgesi', asama: 'Ödeme İşlemleri', durum: 'oluşturulmadı' }
  ])

  const [selectedBelge, setSelectedBelge] = useState<Belge | null>(null)
  const [menuAcikId, setMenuAcikId] = useState<number | null>(null)
  const [previewBelge, setPreviewBelge] = useState<Belge | null>(null)
  const [selectedAsamaFilter, setSelectedAsamaFilter] = useState<string>('Tümü')

  const [taranmisBelgeler, setTaranmisBelgeler] = useState<TaranmisBelge[]>([])
  const [surukleniyor, setSurukleniyor] = useState<boolean>(false)

  const dosyalariEkle = (fileList: FileList | null, targetBelgeId?: number): void => {
    if (!fileList) return
    const pdfler = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )
    if (pdfler.length === 0) return

    const newItems: TaranmisBelge[] = pdfler.map((f, i) => ({
      id: Date.now() + i,
      ad: f.name,
      boyut: dosyaBoyutFormatla(f.size),
      tarih: new Date().toLocaleDateString('tr-TR'),
      bagliBelgeId: targetBelgeId
    }))

    setTaranmisBelgeler((prev) => [...prev, ...newItems])

    if (targetBelgeId) {
      const firstPdf = newItems[0]
      setBelgeler((prev) =>
        prev.map((b) =>
          b.id === targetBelgeId
            ? {
                ...b,
                durum: 'imzalandı',
                pdfDosyaAdi: firstPdf.ad,
                pdfYuklenmeTarihi: firstPdf.tarih,
                pdfBoyut: firstPdf.boyut
              }
            : b
        )
      )
    }
  }

  const taranmisBelgeSil = (id: number): void => {
    setTaranmisBelgeler((prev) => prev.filter((b) => b.id !== id))
  }

  const activeDosyaAny = activeDosya as any

  const dosya = {
    dosyaNo: activeDosya?.temin_no || activeDosyaAny?.dosya_no || '—',
    teminTuru:
      activeDosyaAny?.alim_turu || activeDosya?.tur || activeDosya?.ihale_tipi || 'Doğrudan Temin',
    kanunMaddesi: activeDosyaAny?.kanun_maddesi || '4734 Sayılı Kanun md. 22/d',
    tarih:
      activeDosyaAny?.tarih || activeDosya?.dosya_acilis_tarihi || activeDosya?.temin_tarihi || '—',
    sonTeklifTarihi: activeDosyaAny?.son_teklif_tarihi || '—',
    durum: activeDosyaAny?.durum || 'Taslak'
  }

  const [expandedKomisyon, setExpandedKomisyon] = useState<number | null>(1)

  const [stages, setStages] = useState<Stage[]>([
    {
      id: 1,
      title: 'İhtiyaç Tespiti',
      tasks: [
        { name: 'Malzeme Talep Formu', done: kalemler.length > 0, tab: 'malzeme' },
        { name: 'Komisyonu Yönet', done: komisyonlar.length > 0, tab: 'komisyon' },
        { name: 'Görevlendirme Yazısı', done: false, tab: 'belgeler' }
      ]
    },
    {
      id: 2,
      title: 'Piyasa Araştırması',
      tasks: [
        { name: 'İstekli Firmaları Yönet', done: firmalar.length > 0, tab: 'firmalar' },
        { name: 'Fiyat Araştırma Mektubu Gönder', done: false, tab: 'belgeler' },
        {
          name: 'Fiyat Teklifi Al',
          done: firmalar.some((f) => f.durumu === 'teklif' || f.durumu === 'seçildi'),
          tab: 'firmalar'
        },
        { name: 'Karşılaştır', done: firmalar.some((f) => f.durumu === 'seçildi'), tab: 'firmalar' }
      ]
    },
    {
      id: 3,
      title: 'Onay Süreci',
      tasks: [
        { name: 'Yaklaşık Maliyet Cetveli', done: false, tab: 'belgeler' },
        { name: 'Doğrudan Temin Onay Belgesi', done: false, tab: 'belgeler' },
        { name: 'Sipariş Ver', done: false, tab: 'belgeler' }
      ]
    },
    {
      id: 4,
      title: 'Teslim ve Kabul',
      tasks: [
        { name: 'Malı Al (T.İF)', done: false, tab: 'belgeler' },
        { name: 'Muayene-Kabul', done: false, tab: 'komisyon' },
        { name: 'Ambar Kaydı', done: false, tab: 'belgeler' }
      ]
    },
    {
      id: 5,
      title: 'Ödeme İşlemleri',
      tasks: [
        { name: 'Ödeme Yazısı', done: false, tab: 'belgeler' },
        { name: 'Ödeme Emri', done: false, tab: 'belgeler' },
        { name: 'Muhasebe Kaydı', done: false, tab: 'belgeler' }
      ]
    }
  ])

  const toggleTask = (stageId: number, taskIndex: number): void => {
    setStages((prev) =>
      prev.map((s) =>
        s.id !== stageId
          ? s
          : {
              ...s,
              tasks: s.tasks.map((t, i) => (i === taskIndex ? { ...t, done: !t.done } : t))
            }
      )
    )
  }

  const belgeOlustur = (id: number): void => {
    setBelgeler((prev) =>
      prev.map((b) => (b.id === id ? { ...b, durum: belgeSonrakiDurum(b.durum) } : b))
    )
  }

  const stagesWithStatus: StageWithStatus[] = stages.map((s) => {
    const total = s.tasks.length
    const doneCount = s.tasks.filter((t) => t.done).length
    const progress = Math.round((doneCount / total) * 100)
    const status: 'completed' | 'in-progress' | 'pending' =
      progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending'
    return { ...s, progress, status }
  })

  const toplamBedel = kalemler.reduce((acc, k) => acc + k.toplamBedel, 0)
  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0)
  const completedTasks = stages.reduce((acc, s) => acc + s.tasks.filter((t) => t.done).length, 0)
  const overallProgress = Math.round((completedTasks / totalTasks) * 100)
  const belgeTamamlanan = belgeler.filter((b) => b.durum === 'imzalandı').length
  const pdfYuklenenSayisi = belgeler.filter((b) => b.pdfDosyaAdi || b.durum === 'imzalandı').length

  const filteredBelgeler =
    selectedAsamaFilter === 'Tümü'
      ? belgeler
      : belgeler.filter((b) => b.asama === selectedAsamaFilter)

  return {
    activeDosya,
    dosyaContext,
    dosya,
    selectedTab,
    setSelectedTab,
    kalemler,
    firmalar,
    komisyonlar,
    belgeler,
    setBelgeler,
    selectedBelge,
    setSelectedBelge,
    menuAcikId,
    setMenuAcikId,
    previewBelge,
    setPreviewBelge,
    selectedAsamaFilter,
    setSelectedAsamaFilter,
    taranmisBelgeler,
    surukleniyor,
    setSurukleniyor,
    expandedKomisyon,
    setExpandedKomisyon,
    stages,
    stagesWithStatus,
    toggleTask,
    belgeOlustur,
    dosyalariEkle,
    taranmisBelgeSil,
    toplamBedel,
    totalTasks,
    completedTasks,
    overallProgress,
    belgeTamamlanan,
    pdfYuklenenSayisi,
    filteredBelgeler
  }
}
