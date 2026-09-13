import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSettingsStore } from '../../store/settingsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { logActivity } from '../../utils/logger'
import {
  useActiveDosyaSummary,
  useAnnouncements,
  useDashboardStats,
  useSmartAlerts
} from './dashboard.hooks'
import { useDosyalarHooks } from '../dosyalar/dosyalar.hooks'
import { AITextGeneratorModal } from '../../components/ui/AITextGeneratorModal'
import { useAyarlarHooks } from '../ayarlar/ayarlar.hooks'

import { Link } from '@tanstack/react-router'
import { FileText, Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'

// Subcomponents
import { HeroHeader } from './components/HeroHeader'
import { KpiCards } from './components/KpiCards'
import { StatsCards } from './components/StatsCards'
import { InstitutionCard } from './components/InstitutionCard'
import { AnnouncementsPanel } from './components/AnnouncementsPanel'
import { ChartsSection } from './components/ChartsSection'
import { ActiveFilesPipeline } from './components/ActiveFilesPipeline'

export default function DashboardScreen(): React.JSX.Element {
  const {
    institutionName,
    limitType,
    institutionType,
    kurumsalKod,
    fonksiyonelKod,
    muhasebeBirimKodu,
    muhasebeBirimAdi,
    harcamaBirimKodu,
    harcamaBirimAdi,
    adminName,
    adminTitle,
    eButceKodu,
    say2000iKodu,
    detsisKodu
  } = useSettingsStore()

  const { activeDosyaId } = useWorkspaceStore()
  const { stats, isLoading } = useDashboardStats()
  const { announcements, isLoading: isAnnouncementsLoading } = useAnnouncements()
  const { dosyalar } = useDosyalarHooks()
  const { settings } = useAyarlarHooks()
  const isMailConfigured = !!settings.smtp_host

  const [showAIModal, setShowAIModal] = useState(false)
  const [selectedFileForAI, setSelectedFileForAI] = useState<any>(null)
  const [isActivePopoverOpen, setIsActivePopoverOpen] = useState(false)

  // Dynamic Greeting based on time
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

  // Kurum Türü Mapping
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

  const { summary: activeSummary, isLoading: isActiveSummaryLoading } = useActiveDosyaSummary(
    activeDosyaId,
    institutionName,
    kurumTuruLabel
  )

  // Use real database files for listing (last 5 files)
  const activeFiles = dosyalar.slice(0, 5)

  // Active dossier consumption ratio against single KİK limit
  const activeDossierLimit = limitType === 'buyuksehir' ? 1021827 : 340391
  const activeDossierSpent = activeSummary?.yaklasikMaliyet || 0
  const activeSpentPercent = Math.min(100, (activeDossierSpent / activeDossierLimit) * 100)

  // Category breakdown for charts (from database stats)
  const categoryData = {
    Mal: stats.malYaklasikMaliyet || 0,
    Hizmet: stats.hizmetYaklasikMaliyet || 0,
    Yapım: stats.yapimYaklasikMaliyet || 0
  }

  const totalCat = categoryData.Mal + categoryData.Hizmet + categoryData.Yapım || 1
  const malPct = Math.round((categoryData.Mal / totalCat) * 100)
  const hizmetPct = Math.round((categoryData.Hizmet / totalCat) * 100)
  const yapimPct = Math.max(0, 100 - malPct - hizmetPct)

  // Monthly trends from database
  const monthlyData =
    stats.aylikHarcamalar && stats.aylikHarcamalar.length > 0
      ? stats.aylikHarcamalar
      : [
          { ay: 'Ocak', tutar: 0 },
          { ay: 'Şubat', tutar: 0 },
          { ay: 'Mart', tutar: 0 },
          { ay: 'Nisan', tutar: 0 },
          { ay: 'Mayıs', tutar: 0 }
        ]

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value)
  }

  const fetchAsamalar = async (): Promise<any[]> => {
    const res = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC'
    )
    if (!res.success) throw new Error(res.error)
    return res.data
  }

  const { data: asamalar = [] } = useQuery<any[]>({
    queryKey: ['asamalar_dashboard'],
    queryFn: fetchAsamalar
  })

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
    queryKey: ['harcama_yetkilisi_dashboard'],
    queryFn: fetchHarcamaYetkilisi
  })

  const getAsamaDetails = (asamaSira: number): { name: string; color: string } => {
    const asama = asamalar.find((a: any) => a.asama_sira === asamaSira)
    if (asama) {
      const colorMap: Record<string, string> = {
        amber:
          'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 border-amber-500/10',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450 border-blue-500/10',
        purple:
          'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-450 border-indigo-500/10',
        emerald:
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-500/10'
      }
      return {
        name: asama.asama_adi,
        color: colorMap[asama.rozet_rengi] || colorMap['blue']
      }
    }

    // Fallback if db not loaded
    switch (asamaSira) {
      case 1:
        return {
          name: 'Hazırlık Aşaması',
          color:
            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-500/10'
        }
      case 2:
        return {
          name: 'Piyasa Araştırması',
          color:
            'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 border-amber-500/10'
        }
      case 3:
        return {
          name: 'Teklif Toplama',
          color:
            'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450 border-blue-500/10'
        }
      case 4:
        return {
          name: 'Karar & Onay',
          color:
            'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-450 border-indigo-500/10'
        }
      case 5:
        return {
          name: 'Fatura / Ödeme',
          color:
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-500/10'
        }
      default:
        return {
          name: 'Belirsiz Aşama',
          color: 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400'
        }
    }
  }

  const smartAlerts = useSmartAlerts(settings, activeDosyaId, activeSummary)

  // Trigger system notification logs for warnings and errors
  useEffect(() => {
    if (isLoading || isAnnouncementsLoading) return

    // Cache to prevent duplicate notifications in the current session
    const notifiedStr = localStorage.getItem('dta_notified_syslog_keys') || '[]'
    let notifiedKeys: string[] = []
    try {
      notifiedKeys = JSON.parse(notifiedStr)
    } catch {
      notifiedKeys = []
    }

    const newNotifiedKeys = [...notifiedKeys]
    let hasNewLog = false

    // 1. SMTP mail check
    if (!isMailConfigured) {
      const key = 'smtp_not_configured'
      if (!notifiedKeys.includes(key)) {
        logActivity(
          'Mail (SMTP) Yapılandırılmamış',
          'Posta sunucu ayarlarınız eksik. Şifre sıfırlama veya onay mailleri çalışmayabilir.',
          'warning'
        )
        newNotifiedKeys.push(key)
        hasNewLog = true
      }
    }

    // 2. Smart Alerts check
    smartAlerts.forEach((alert) => {
      // Only notify warning or error type alerts
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. HERO HEADER & SMART ALERTS */}
      <HeroHeader
        isMailConfigured={isMailConfigured}
        smartAlerts={smartAlerts}
        institutionName={institutionName}
        kurumTuruLabel={kurumTuruLabel}
        greeting={greeting}
        currentDate={currentDate}
        activeSummary={activeSummary}
        isActivePopoverOpen={isActivePopoverOpen}
        setIsActivePopoverOpen={setIsActivePopoverOpen}
        formatCurrency={formatCurrency}
      />

      {/* 2. KPI CARDS */}
      <KpiCards
        activeDosyaId={activeDosyaId}
        isLoading={isLoading}
        stats={stats}
        formatCurrency={formatCurrency}
        isActiveSummaryLoading={isActiveSummaryLoading}
        activeSummary={activeSummary}
        activeSpentPercent={activeSpentPercent}
        activeDossierLimit={activeDossierLimit}
      />

      {/* NEW STATS & RIGHT PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: STATS CARDS & CHARTS */}
        {!activeDosyaId && (
          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* LÜZUM BAŞLAT / YENİ DOĞRUDAN TEMİN BANNER */}
            <div className="p-6 rounded-3xl bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/[0.03] rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-white/[0.02] rounded-full pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md">
                    Satın Alma Başlangıcı
                  </span>
                  <h3 className="text-lg font-extrabold mt-1.5 leading-tight">
                    Doğrudan Temin Süreci Başlat
                  </h3>
                  <p className="text-xs text-blue-100/90 mt-1 max-w-xl leading-relaxed">
                    İhtiyaç kalemlerinizi girerek doğrudan temin dosyasını saniyeler içinde
                    başlatın. Akıllı asistan lüzum belgelerinizi otomatik dolduracaktır.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 z-10">
                <Link to="/dosyalar/yeni">
                  <Button className="bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Yeni Süreç Başlat
                  </Button>
                </Link>
              </div>
            </div>

            <StatsCards isLoading={isLoading} stats={stats} formatCurrency={formatCurrency} />
            <ChartsSection
              stats={stats}
              monthlyData={monthlyData}
              categoryData={categoryData}
              totalCat={totalCat}
              malPct={malPct}
              hizmetPct={hizmetPct}
              yapimPct={yapimPct}
              formatCurrency={formatCurrency}
            />
          </div>
        )}

        {/* RIGHT SIDE PANEL: IDENTITY CARD & ANNOUNCEMENTS */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <InstitutionCard
            institutionName={institutionName}
            kurumTuruLabel={kurumTuruLabel}
            limitType={limitType}
            eButceKodu={eButceKodu}
            say2000iKodu={say2000iKodu}
            detsisKodu={detsisKodu}
            kurumsalKod={kurumsalKod}
            fonksiyonelKod={fonksiyonelKod}
            harcamaBirimAdi={harcamaBirimAdi}
            harcamaBirimKodu={harcamaBirimKodu}
            muhasebeBirimAdi={muhasebeBirimAdi}
            muhasebeBirimKodu={muhasebeBirimKodu}
            stats={stats}
            adminName={harcamaYetkilisi?.ad_soyad || adminName}
            adminTitle={harcamaYetkilisi?.unvan || adminTitle}
          />
          <AnnouncementsPanel
            isAnnouncementsLoading={isAnnouncementsLoading}
            announcements={announcements}
          />
        </div>
      </div>

      {/* 4. ACTIVE FILES PIPELINE */}
      <ActiveFilesPipeline
        activeFiles={activeFiles}
        getAsamaDetails={getAsamaDetails}
        formatCurrency={formatCurrency}
        setSelectedFileForAI={setSelectedFileForAI}
        setShowAIModal={setShowAIModal}
      />

      {/* AI Assistant Modal */}
      {showAIModal && selectedFileForAI && (
        <AITextGeneratorModal
          isOpen={true}
          isAdvisorMode={true}
          fieldName="Süreç Tavsiyesi"
          title={`Akıllı Asistan - Dosya: ${selectedFileForAI.temin_no || 'Belirtilmemiş'}`}
          initialPrompt={`Aşağıdaki detaylara sahip dosya üzerinde çalışıyorum:\n- Konu: ${
            selectedFileForAI.konu
          }\n- Yaklaşık Maliyet: ${formatCurrency(
            selectedFileForAI.yaklasik_maliyet || 0
          )}\n\nLütfen bu dosya için bana sonraki adımlar, dikkat edilecekler ve süreç tavsiyesi ver.`}
          placeholderMappings={{
            '[DOSYA_NO]': selectedFileForAI.temin_no || 'Belirtilmemiş',
            '[DOSYA_KONU]': selectedFileForAI.konu || 'Belirtilmemiş',
            '[DOSYA_MALIYET]': formatCurrency(selectedFileForAI.yaklasik_maliyet || 0)
          }}
          onClose={() => setShowAIModal(false)}
          onApply={(text) => {
            console.log('AI Response:', text)
            setShowAIModal(false)
          }}
          systemInstruction="Sen yetkin bir Doğrudan Temin ve Kamu İhale (4734 Sayılı Kanun) uzmanısın. ÖNEMLİ GİZLİLİK KURALI: Eğer kullanıcıdan gelen metin içinde belirli bir Kurum Adı, Belediye, Kişi Adı-Soyadı, TC No veya açık adres geçiyorsa; cevabında bu özel isimleri asla açıkça kullanma, '[İlgili Kurum]' veya '[İlgili Kişi]' şeklinde sansürle (maskele). Fakat ihale malzemelerini tarif eden teknik özellikleri (boyut, renk, adet, cins vb.) aynen kullan."
        />
      )}
    </div>
  )
}
