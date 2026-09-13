import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Coins,
  FileCheck,
  FileText,
  Scale,
  ShieldCheck
} from 'lucide-react'

import { useSettingsStore } from '../../store/settingsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'
import {
  useAnnouncements,
  useDashboardStats,
  useSmartAlerts
} from './dashboard.hooks'
import { useDosyalarHooks } from '../dosyalar/dosyalar.hooks'
import { useAyarlarHooks } from '../ayarlar/ayarlar.hooks'
import { logActivity } from '../../utils/logger'
import { AITextGeneratorModal } from '../../components/ui/AITextGeneratorModal'

// Modular Subcomponents
import { ActiveDosyaCard } from './components/ActiveDosyaCard'
import { DashboardHeroV2 } from './components/DashboardHeroV2'
import { TeminPillarsMatrix, PillarItem } from './components/TeminPillarsMatrix'
import { ProcurementMethodsSummary } from './components/ProcurementMethodsSummary'
import { DashboardKpiCardsV2 } from './components/DashboardKpiCardsV2'
import { CostDistributionSection } from './components/CostDistributionSection'
import { LivePipelineSection } from './components/LivePipelineSection'
import { InstitutionCardV2 } from './components/InstitutionCardV2'
import { AiAdvisorCard } from './components/AiAdvisorCard'
import { AnnouncementsCardV2 } from './components/AnnouncementsCardV2'
import { AiMissingModal } from './components/AiMissingModal'

export default function DashboardScreenV2(): React.JSX.Element {
  const navigate = useNavigate()
  const {
    institutionName,
    limitType,
    institutionType,
    kurumsalKod,
    fonksiyonelKod,
    muhasebeBirimAdi,
    harcamaBirimAdi,
    adminName,
    adminTitle,
    adminUsername
  } = useSettingsStore()

  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore()

  // Mod Seçici Durumu: 'dogrudan_temin' (KİK 22), 'ihale' (KİK 19/21) veya 'all'
  const [procurementMode, setProcurementMode] = useState<'dogrudan_temin' | 'ihale' | 'all'>(
    () => {
      return (
        (localStorage.getItem('temin_procurement_mode') as 'dogrudan_temin' | 'ihale') ||
        'dogrudan_temin'
      )
    }
  )

  const isIhale = procurementMode === 'ihale'

  // Header veya diğer bileşenlerden gelen mod değişimlerini dinle
  useEffect(() => {
    const handleModeChange = (e: any): void => {
      if (e.detail?.mode) {
        setProcurementMode(e.detail.mode)
      }
    }
    window.addEventListener('procurement-mode-change', handleModeChange)
    return () => {
      window.removeEventListener('procurement-mode-change', handleModeChange)
    }
  }, [])

  const switchProcurementMode = (mode: 'dogrudan_temin' | 'ihale' | 'all'): void => {
    setProcurementMode(mode)
    if (mode !== 'all') {
      localStorage.setItem('temin_procurement_mode', mode)
      window.dispatchEvent(
        new CustomEvent('procurement-mode-change', {
          detail: { mode }
        })
      )
    }
  }

  const { stats, isLoading } = useDashboardStats(procurementMode)
  const { announcements, isLoading: isAnnouncementsLoading } = useAnnouncements()
  const { dosyalar } = useDosyalarHooks()
  const { settings } = useAyarlarHooks()
  const isMailConfigured = !!settings.smtp_host
  const isAiConfigured = Boolean(
    settings.ai_gemini_api_key?.trim() ||
      settings.ai_openai_api_key?.trim() ||
      settings.ai_anthropic_api_key?.trim()
  )

  const [showAIModal, setShowAIModal] = useState(false)
  const [showAiMissingModal, setShowAiMissingModal] = useState(false)
  const [selectedFileForAI, setSelectedFileForAI] = useState<any>(null)
  const [activePillar, setActivePillar] = useState<'T' | 'E' | 'M' | 'I' | 'N'>('T')
  const [searchTerm, setSearchTerm] = useState('')

  // Zaman tabanlı karşılama
  const greeting = (() => {
    const hours = new Date().getHours()
    if (hours >= 6 && hours < 12) return 'Günaydın'
    if (hours >= 12 && hours < 18) return 'İyi Günler'
    if (hours >= 18 && hours < 23) return 'İyi Akşamlar'
    return 'İyi Geceler'
  })()

  const currentDate = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date())

  // Kurum Türü Başlığı
  const getInstitutionTypeLabel = (type: string): string => {
    switch (type) {
      case 'belediye':
        return 'Belediye / Mahalli İdare'
      case 'genel_butce':
        return 'Bakanlık / Genel Bütçe'
      case 'ozel_butce':
        return 'Üniversite / Özel Bütçe'
      case 'duzenleyici':
        return 'Düzenleyici / Denetleyici Kurum'
      case 'diger':
        return 'Diğer Kurum'
      default:
        return 'Kurum Tipi Belirtilmedi'
    }
  }
  const kurumTuruLabel = getInstitutionTypeLabel(institutionType || '')

  // Para Biçimlendirme
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  // 4734 Sayılı Kanun Madde 22/d KİK Eşik Değeri
  const kikLimit = limitType === 'buyuksehir' ? 1021827 : 340391

  // Bütçe / Harcama Tür Dağılımı
  const totalCat =
    (stats.malYaklasikMaliyet || 0) +
      (stats.hizmetYaklasikMaliyet || 0) +
      (stats.yapimYaklasikMaliyet || 0) +
      (stats.danismanlikYaklasikMaliyet || 0) || 1
  const malPct = Math.round(((stats.malYaklasikMaliyet || 0) / totalCat) * 100)
  const hizmetPct = Math.round(((stats.hizmetYaklasikMaliyet || 0) / totalCat) * 100)
  const yapimPct = Math.round(((stats.yapimYaklasikMaliyet || 0) / totalCat) * 100)
  const danismanlikPct = Math.max(0, 100 - malPct - hizmetPct - yapimPct)

  // Asamalar Sorgusu
  const fetchAsamalar = async (): Promise<any[]> => {
    const res = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC'
    )
    if (!res.success) throw new Error(res.error)
    return res.data
  }

  const { data: asamalar = [] } = useQuery<any[]>({
    queryKey: ['asamalar_dashboard_v2'],
    queryFn: fetchAsamalar
  })

  // Harcama Yetkilisi
  const fetchHarcamaYetkilisi = async (): Promise<{
    ad_soyad: string
    unvan: string | null
  } | null> => {
    const res = await window.electron.ipcRenderer.invoke(
      'db:query',
      `SELECT p.ad_soyad, p.unvan 
       FROM TANIM_Roller r 
       LEFT JOIN TANIM_Personel p ON r.varsayilan_personel_id = p.id 
       WHERE r.rol_kodu = 'harcama_yetkilisi'`
    )
    if (!res.success) throw new Error(res.error)
    return res.data[0] || null
  }

  const { data: harcamaYetkilisi = null } = useQuery({
    queryKey: ['harcama_yetkilisi_dashboard_v2'],
    queryFn: fetchHarcamaYetkilisi
  })

  const smartAlerts = useSmartAlerts(settings, activeDosyaId, null)

  useEffect(() => {
    if (isLoading || isAnnouncementsLoading) return

    const notifiedStr = localStorage.getItem('dta_notified_syslog_keys') || '[]'
    let notifiedKeys: string[] = []
    try {
      notifiedKeys = JSON.parse(notifiedStr)
    } catch {
      notifiedKeys = []
    }

    const newNotifiedKeys = [...notifiedKeys]
    let hasNewLog = false

    if (!isMailConfigured) {
      const key = 'smtp_not_configured'
      if (!notifiedKeys.includes(key)) {
        logActivity(
          'Mail (SMTP) Yapılandırılmamış',
          'Posta sunucu ayarlarınız eksik. Bildirimler ve onay mailleri devre dışı kalabilir.',
          'warning'
        )
        newNotifiedKeys.push(key)
        hasNewLog = true
      }
    }

    smartAlerts.forEach((alert) => {
      if (alert.type === 'error' || alert.type === 'warning') {
        const key = `alert_${alert.id}`
        if (!notifiedKeys.includes(key)) {
          logActivity(alert.title, alert.message, alert.type)
          newNotifiedKeys.push(key)
          hasNewLog = true
        }
      }
    })

    if (hasNewLog) {
      localStorage.setItem('dta_notified_syslog_keys', JSON.stringify(newNotifiedKeys))
    }
  }, [smartAlerts, isMailConfigured, isLoading, isAnnouncementsLoading])

  // Aşama Renk ve İsim Tanımlayıcı
  const getAsamaDetails = (asamaSira: number): { name: string; color: string } => {
    const asama = asamalar.find((a: any) => a.asama_sira === asamaSira)
    if (asama) {
      return {
        name: asama.asama_adi,
        color:
          'border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60'
      }
    }

    switch (asamaSira) {
      case 1:
        return {
          name: '1. İhtiyaç & Lüzum',
          color:
            'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60'
        }
      case 2:
        return {
          name: '2. Piyasa Fiyat Araştırması',
          color:
            'border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60'
        }
      case 3:
        return {
          name: '3. Teklif Değerlendirme',
          color:
            'border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60'
        }
      case 4:
        return {
          name: '4. Karar & Onay Belgesi',
          color:
            'border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60'
        }
      case 5:
        return {
          name: '5. Muayene Kabul & Ödeme',
          color:
            'border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
        }
      default:
        return {
          name: 'Süreç İlerliyor',
          color:
            'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-900'
        }
    }
  }

  // Filtrelenmiş Dosyalar
  const filteredDosyalar = dosyalar.filter((d) => {
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      d.temin_no?.toLowerCase().includes(q) ||
      d.konu?.toLowerCase().includes(q) ||
      d.harcama_birimi?.toLowerCase().includes(q)
    )
  })

  // Aktif Dosya Bilgisi
  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId)

  // TEMİN 360 Modülleri Bilgisi
  const teminPillars: PillarItem[] = [
    {
      key: 'T' as const,
      letter: 'T',
      title: 'Teklif & Piyasa Fiyat Araştırması',
      subtitle: 'Piyasa Araştırma Tutanağı & Teklif Havuzu',
      icon: Coins,
      badge: `${formatCurrency(stats.toplamYaklasikMaliyet)} Toplam Alım`,
      description:
        'Tedarikçi teklif mektuplarını toplar, yaklaşık maliyet cetvellerini otomatik hesaplar ve piyasa fiyat araştırma tutanaklarını kanuna tam uyumlu üretir.',
      statsText: `${stats.kayitliFirmaSayisi} İstekli Firma & Tedarikçi Havuzu`
    },
    {
      key: 'E' as const,
      letter: 'E',
      title: 'Evrak, Şartname & E-İmza',
      subtitle: 'Resmi Yazışma Standartları & EBYS Uyumluluğu',
      icon: FileCheck,
      badge: 'Baskıya & EBYS Hazır',
      description:
        'React TSX şablon motoruyla Onay Belgesi, İhtiyaç Belgesi, Piyasa Araştırma Tutanağı ve Ödeme Emri evraklarını tek tıkla mühürlü/imzalı PDF olarak üretir.',
      statsText: '25+ Resmi Kamu Evrak ve Tutanak Şablonu'
    },
    {
      key: 'M' as const,
      letter: 'M',
      title: 'Maliyet, Bütçe & Harcama Yönetimi',
      subtitle: '4734 / 22-d ve 5018 Sayılı Mali Yönetim',
      icon: Scale,
      badge: '%100 Mevzuat Uyum Skoru',
      description:
        'KİK doğrudan temin eşik limitlerini, harcama birimi bütçe tertiplerini ve analitik bütçe kodlarını gerçek zamanlı kontrol altında tutar.',
      statsText: `Yıllık KİK Eşik Sınırı: ${formatCurrency(kikLimit)} (${
        limitType === 'buyuksehir' ? 'Büyükşehir' : 'Normal'
      })`
    },
    {
      key: 'I' as const,
      letter: 'İ',
      title: 'İhale, Doğrudan Temin & Sözleşme',
      subtitle: 'Uçtan Uca 4 Aşamalı Dijital Dosya Yaşam Döngüsü',
      icon: FileText,
      badge: `${stats.ihaleDosyaSayisi} Kayıtlı Dosya`,
      description:
        'İhtiyaç lüzumundan piyasa araştırmasına, teklif mektubu dağıtımından onay belgesine kadar tüm doğrudan temin adımlarını kanuna uygun yürütür.',
      statsText: `${stats.aktifDosyaSayisi || stats.ihaleDosyaSayisi} Aktif Süreç Devam Ediyor`
    },
    {
      key: 'N' as const,
      letter: 'N',
      title: 'Netice, Hakediş & Muayene Kabul',
      subtitle: 'Muayene Komisyonu, Hakediş & Ödeme Emri',
      icon: ShieldCheck,
      badge: 'Sayıştay Güvenceli',
      description:
        'Mal/hizmet ve yapım işleri için ara ve kesin hakediş raporları hazırlar, KDV tevkifatı ve damga vergisi kesintilerini hesaplar, muhasebe ödeme emrine bağlar.',
      statsText: `${stats.kayitliPersonelSayisi} Yetkili & Komisyon Üyesi Kayıtlı`
    }
  ]

  const currentPillar = teminPillars.find((p) => p.key === activePillar) || teminPillars[0]

  function getDtFileText(type?: string | null): string {
    if (!type) return 'Mal Alımı'
    const t = type.toLowerCase().trim()
    if (t === 'mal') return 'Mal Alımı'
    if (t === 'hizmet') return 'Hizmet Alımı'
    if (t === 'yapim_isi' || t === 'yapim' || t.includes('yapım')) {
      return 'Yapım İşi / Onarım'
    }
    if (t === 'danismanlik' || t.includes('danışman')) return 'Danışmanlık'
    if (t === 'hakedis' || t.includes('hakediş')) return 'Hakediş'
    if (t === 'ihale') return 'İhale'
    return type
  }

  function getDtFileColor(type?: string | null): string {
    const t = (type || '').toLowerCase().trim()
    if (t === 'mal') {
      return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/60'
    }
    if (t === 'hizmet') {
      return 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border-violet-200/80 dark:border-violet-800/60'
    }
    if (t === 'yapim_isi' || t === 'yapim' || t.includes('yapım')) {
      return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/60'
    }
    if (t === 'danismanlik' || t.includes('danışman')) {
      return 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/60'
    }
    if (t === 'hakedis' || t.includes('hakediş')) {
      return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60'
    }
    return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1650px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-3 duration-500 text-slate-800 dark:text-slate-100">
      {/* 1. AKTİF ÇALIŞILAN DOĞRUDAN TEMİN / İHALE DOSYASI ÖZEL ODAK KARTI */}
      {activeDosya && (
        <ActiveDosyaCard
          activeDosya={activeDosya}
          harcamaBirimAdi={harcamaBirimAdi}
          getAsamaDetails={getAsamaDetails}
          getDtFileColor={getDtFileColor}
          getDtFileText={getDtFileText}
          formatCurrency={formatCurrency}
          onOpenAi={(dosya) => {
            setSelectedFileForAI(dosya)
            if (isAiConfigured) {
              setShowAIModal(true)
            } else {
              setShowAiMissingModal(true)
            }
          }}
          onClose={() => setActiveDosyaId(null)}
        />
      )}

      {/* 2. TEMİN 360 HERO HEADER */}
      <DashboardHeroV2
        isIhale={isIhale}
        currentDate={currentDate}
        greeting={greeting}
        adminName={adminName}
        adminUsername={adminUsername}
        adminTitle={adminTitle}
        institutionName={institutionName}
        isAiConfigured={isAiConfigured}
        stats={stats}
        onOpenAi={() => {
          setSelectedFileForAI({
            temin_no: isIhale ? 'İHALE-ASISTAN' : 'TEMIN-ASISTAN',
            konu: isIhale
              ? 'Kamu İhale Mevzuatı (KİK 19/21), Şartname ve Hakediş Karar Desteği'
              : 'Doğrudan Temin (KİK 22/d), Piyasa Araştırması ve Harcama Karar Desteği',
            yaklasik_maliyet: stats.toplamYaklasikMaliyet
          })
          setShowAIModal(true)
        }}
        onShowAiMissing={() => setShowAiMissingModal(true)}
        smartAlerts={smartAlerts}
      />

      {/* 3. TEMİN 360 5 TEMEL SÜTUN (PILLARS) İNTERAKTİF NAVİGASYON MATRİSİ */}
      <TeminPillarsMatrix
        procurementMode={procurementMode}
        activePillar={activePillar}
        setActivePillar={setActivePillar}
        teminPillars={teminPillars}
        currentPillar={currentPillar}
      />

      {/* 4. USUL / TÜR BAZLI ÖZET BANT */}
      <ProcurementMethodsSummary
        procurementMode={procurementMode}
        switchProcurementMode={switchProcurementMode}
        stats={stats}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
      />

      {/* 5. ANA KPI & METRİK KARTLARI */}
      <DashboardKpiCardsV2
        stats={stats}
        isLoading={isLoading}
        kikLimit={kikLimit}
        formatCurrency={formatCurrency}
      />

      {/* 6. İKİ SÜTUNLU ANALİTİK & OPERASYON PANELİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SOL TARAF: SATIN ALMA TÜR DAĞILIMI & AKTİF DOSYALAR (8 Kolon) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <CostDistributionSection
            stats={stats}
            totalCat={totalCat}
            malPct={malPct}
            hizmetPct={hizmetPct}
            yapimPct={yapimPct}
            danismanlikPct={danismanlikPct}
            formatCurrency={formatCurrency}
          />

          <LivePipelineSection
            filteredDosyalar={filteredDosyalar}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            harcamaBirimAdi={harcamaBirimAdi}
            getAsamaDetails={getAsamaDetails}
            getDtFileColor={getDtFileColor}
            getDtFileText={getDtFileText}
            formatCurrency={formatCurrency}
            isAiConfigured={isAiConfigured}
            onOpenDosya={(id) => {
              setActiveDosyaId(id as any)
              navigate({ to: '/takip' })
            }}
            onAiConsult={(dosya) => {
              if (!isAiConfigured) {
                setShowAiMissingModal(true)
                return
              }
              setSelectedFileForAI(dosya)
              setShowAIModal(true)
            }}
          />
        </div>

        {/* SAĞ TARAF: KURUM KİMLİK KARTI & DUYURULAR & SİSTEM KONTROLÜ (4 Kolon) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <InstitutionCardV2
            institutionName={institutionName}
            kurumTuruLabel={kurumTuruLabel}
            limitType={limitType}
            harcamaBirimAdi={harcamaBirimAdi}
            kurumsalKod={kurumsalKod}
            fonksiyonelKod={fonksiyonelKod}
            muhasebeBirimAdi={muhasebeBirimAdi}
            harcamaYetkilisi={harcamaYetkilisi}
          />

          <AiAdvisorCard
            isAiConfigured={isAiConfigured}
            kikLimit={kikLimit}
            toplamYaklasikMaliyet={stats.toplamYaklasikMaliyet}
            onOpenConsultation={(config) => {
              setSelectedFileForAI(config)
              setShowAIModal(true)
            }}
            onShowAiMissing={() => setShowAiMissingModal(true)}
          />

          <AnnouncementsCardV2 announcements={announcements} />
        </div>
      </div>

      {/* 7. TEMİN 360 AI ASİSTAN MODALI */}
      {showAIModal && selectedFileForAI && (
        <AITextGeneratorModal
          isOpen={true}
          isAdvisorMode={true}
          fieldName="TEMİN 360 AI Karar Desteği"
          title={`TEMİN 360 AI Asistanı - ${selectedFileForAI.temin_no || 'Mevzuat Rehberi'}`}
          initialPrompt={`Aşağıdaki konu ve bütçe detaylarına sahip kamu satın alma süreci için çalışıyorum:\n- Dosya/Konu: ${
            selectedFileForAI.konu
          }\n- Yaklaşık Maliyet: ${formatCurrency(
            selectedFileForAI.yaklasik_maliyet || 0
          )}\n\nLütfen 4734 Sayılı Kamu İhale Kanunu ve ilgili mevzuata göre dikkat edilmesi gereken hususlar, piyasa araştırması esasları ve sonraki adımlar hakkında uzman tavsiyesi sun.`}
          placeholderMappings={{
            '[DOSYA_NO]': selectedFileForAI.temin_no || 'Belirtilmemiş',
            '[DOSYA_KONU]': selectedFileForAI.konu || 'Belirtilmemiş',
            '[DOSYA_MALIYET]': formatCurrency(selectedFileForAI.yaklasik_maliyet || 0)
          }}
          onClose={() => setShowAIModal(false)}
          onApply={(text) => {
            console.log('TEMİN 360 AI Yanıtı:', text)
            setShowAIModal(false)
          }}
          systemInstruction="Sen yetkin bir TEMİN 360 Kamu Satın Alma, Doğrudan Temin, Harcama ve Hakediş (4734 ve 5018 Sayılı Kanunlar) mevzuat uzmanı ve karar destek asistanısın. Kullanıcıya net, Sayıştay denetim standartlarına uygun, pratik ve yasal tavsiyeler ver. ÖNEMLİ GİZLİLİK KURALI: Eğer kullanıcıdan gelen metin içinde belirli bir Kurum Adı, Belediye, Kişi Adı-Soyadı, TC No veya açık adres geçiyorsa; cevabında bu özel isimleri asla açıkça kullanma, '[İlgili Kurum]' veya '[İlgili Kişi]' şeklinde sansürle (maskele)."
        />
      )}

      {/* 8. AI YAPILANDIRILMAMIŞ / API KEY EKSİK BİLGİLENDİRME MODALI */}
      <AiMissingModal
        isOpen={showAiMissingModal}
        onClose={() => setShowAiMissingModal(false)}
        onGoToSettings={() => {
          setShowAiMissingModal(false)
          navigate({ to: '/ayarlar', search: { tab: 'ai' } as any })
        }}
      />
    </div>
  )
}
