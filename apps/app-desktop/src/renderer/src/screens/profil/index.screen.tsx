import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useSettingsStore } from '../../store/settingsStore'
import { useKurumHooks, KurumVerisi } from '../kurum/kurum.hooks'
import {
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  Building2,
  Plus,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  History,
  Lock,
  BadgeCheck,
  Check
} from 'lucide-react'

export default function ProfilScreen(): React.JSX.Element {
  const { loadSettings: reloadSettingsStore, activeKurumId } = useSettingsStore()
  const {
    allKurumlar,
    isLoadingKurum,
    fetchKurum,
    createKurumProfile,
    switchActiveKurum,
    deleteKurumProfile,
    saveKurum
  } = useKurumHooks()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile States
  const [adminName, setAdminName] = useState('')
  const [adminTitle, setAdminTitle] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [ekapUsername, setEkapUsername] = useState('')
  const [ekapPassword, setEkapPassword] = useState('')
  const [institutionLogo, setInstitutionLogo] = useState<string | null>(null)

  // Visibility States
  const [showPassword, setShowPassword] = useState(false)
  const [showEkapPassword, setShowEkapPassword] = useState(false)

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingKurum, setEditingKurum] = useState<KurumVerisi | null>(null)
  const [modalFormData, setModalFormData] = useState<Partial<KurumVerisi>>({
    kurum_adi: '',
    makam_adi: '',
    ust_kurum_adi: '',
    detsis_kodu: '',
    ebutce_kodu: '',
    say2000i_kodu: '',
    limit_tipi: 'diger',
    alt_kurum_tipi: 'belediye',
    eposta: '',
    telefon: '',
    adres: ''
  })
  const [modalSwitchImmediately, setModalSwitchImmediately] = useState(true)
  const [modalSaving, setModalSaving] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
        setAdminName(settings.adminName || 'Sistem Yöneticisi')
        setAdminTitle(settings.adminTitle || 'Destek Sorumlusu')
        setAdminUsername(settings.adminUsername || 'admin')
        setAdminPassword(settings.adminPassword || '')
        setEkapUsername(settings.ekapUsername || '')
        setEkapPassword(settings.ekapPassword || '')
        setInstitutionLogo(settings.institutionLogo || null)
        await fetchKurum()
      } catch (error) {
        console.error('Profil bilgileri yüklenemedi:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [fetchKurum])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type })
    setTimeout(() => setFeedbackMsg(null), 4000)
  }

  const handleSaveCredentials = async (): Promise<void> => {
    setSaving(true)
    try {
      const dataToSave = {
        adminName,
        adminTitle,
        adminUsername,
        adminPassword,
        ekapUsername,
        ekapPassword
      }
      await window.electron.ipcRenderer.invoke('db:save-settings', dataToSave)
      await reloadSettingsStore()
      showToast('Kullanıcı güvenlik ve giriş ayarları başarıyla kaydedildi.', 'success')
    } catch {
      showToast('Ayarlar kaydedilirken hata oluştu!', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingKurum(null)
    setModalFormData({
      kurum_adi: '',
      makam_adi: '',
      ust_kurum_adi: '',
      detsis_kodu: '',
      ebutce_kodu: '',
      say2000i_kodu: '',
      limit_tipi: 'diger',
      alt_kurum_tipi: 'belediye',
      eposta: '',
      telefon: '',
      adres: ''
    })
    setModalSwitchImmediately(true)
    setShowAddModal(true)
  }

  const handleOpenEditModal = (kurum: KurumVerisi) => {
    setEditingKurum(kurum)
    setModalFormData({
      ...kurum
    })
    setShowAddModal(true)
  }

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalFormData.kurum_adi?.trim()) {
      alert('Lütfen Kurum Adı alanını doldurun.')
      return
    }

    setModalSaving(true)
    try {
      if (editingKurum?.id) {
        await saveKurum(modalFormData as KurumVerisi, editingKurum.id)
        showToast(`"${modalFormData.kurum_adi}" profili başarıyla güncellendi.`, 'success')
      } else {
        await createKurumProfile(modalFormData, modalSwitchImmediately)
        showToast(
          `"${modalFormData.kurum_adi}" kurumu yeni profil olarak eklendi${
            modalSwitchImmediately ? ' ve aktif yapıldı.' : '.'
          }`,
          'success'
        )
      }
      setShowAddModal(false)
    } catch (err: any) {
      alert(err.message || 'Profil işlemi sırasında bir hata oluştu.')
    } finally {
      setModalSaving(false)
    }
  }

  const handleSwitch = async (id: number, name: string) => {
    try {
      await switchActiveKurum(id)
      showToast(`Aktif kurum profili "${name}" olarak değiştirildi.`, 'success')
    } catch (err: any) {
      alert(err.message || 'Geçiş yapılamadı.')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`"${name}" kurum profilini silmek istediğinize emin misiniz?`)) {
      try {
        await deleteKurumProfile(id)
        showToast(`"${name}" profili silindi.`, 'success')
      } catch (err: any) {
        alert(err.message || 'Silinemedi.')
      }
    }
  }

  const getInitials = (name: string): string => {
    if (!name) return 'KP'
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading || isLoadingKurum) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] text-slate-500 font-medium">
        Yükleniyor...
      </div>
    )
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full pb-16">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-rose-600 text-white shadow-rose-500/20'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          ) : (
            <X className="w-5 h-5 text-rose-100" />
          )}
          {feedbackMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Kullanıcı Profili ve Güvenlik
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Kurum profillerinizi yönetin, birden fazla kurum arasında geçiş yapın ve kullanıcı giriş
            yetkilerini yapılandırın.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenAddModal}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4 text-sm font-semibold shadow-md shadow-blue-500/15"
          >
            <Plus className="w-4 h-4" /> Yeni Kurum Profili Ekle
          </Button>
        </div>
      </div>

      {/* 1. BÖLÜM: TANIMLI KURUM PROFİLLERİ (ÇOKLU KURUM YÖNETİMİ) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Tanımlı Kurum Profilleri ({allKurumlar.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            İşlem yapmak istediğiniz kurum profilini seçerek tüm şablon ve süreçleri o kurum adına
            yürütebilirsiniz.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allKurumlar.map((kurum) => {
            const isActive = kurum.id === activeKurumId
            return (
              <div
                key={kurum.id}
                className={`relative rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-50/60 to-white dark:from-blue-950/20 dark:to-slate-900 border-blue-500/60 shadow-lg shadow-blue-500/5 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-4 right-4 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Aktif Profil
                  </div>
                )}

                <div>
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-base shrink-0 overflow-hidden">
                      {kurum.logo_kurum ? (
                        <img
                          src={kurum.logo_kurum}
                          alt="Logo"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        getInitials(kurum.kurum_adi || 'Kurum')
                      )}
                    </div>
                    <div className="pr-16">
                      <h3
                        className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2"
                        title={kurum.kurum_adi}
                      >
                        {kurum.kurum_adi || 'İsimsiz Kurum'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
                        {kurum.makam_adi || kurum.ust_kurum_adi || 'Makam Belirtilmemiş'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-400">DETSİS / DTVT:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {kurum.detsis_kodu || kurum.dtvt_kodu || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">E-Bütçe Kodu:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {kurum.ebutce_kodu || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Limit / Tür:</span>
                      <span className="font-medium text-slate-600 dark:text-slate-400 capitalize">
                        {kurum.limit_tipi === 'buyuksehir' ? 'Büyükşehir' : 'Diğer İdareler'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(kurum)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      title="Profili Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => handleDelete(kurum.id!, kurum.kurum_adi || 'Kurum')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Profili Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isActive ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 py-1 px-2.5">
                      <BadgeCheck className="w-4 h-4" /> Seçili
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwitch(kurum.id!, kurum.kurum_adi || 'Kurum')}
                      className="text-xs font-semibold hover:bg-blue-600 hover:text-white rounded-lg px-3 py-1 border-slate-200 dark:border-slate-700"
                    >
                      Bu Profile Geç
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. BÖLÜM: YÖNETİCİ & GÜVENLİK BİLGİLERİ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Avatar & Özet Kartı */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center justify-between min-h-[340px]">
          <div className="flex flex-col items-center w-full">
            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-200 text-3xl font-bold shadow-inner mb-4 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
              {institutionLogo ? (
                <img
                  src={institutionLogo}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                getInitials(adminName)
              )}
            </div>
            <h2
              className="text-lg font-bold text-slate-850 dark:text-slate-100 truncate w-full px-2"
              title={adminName}
            >
              {adminName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              {adminTitle || 'Destek Sorumlusu'}
            </p>
          </div>

          <div className="w-full bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 text-left space-y-2.5 mt-6">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Kullanıcı Adı:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                {adminUsername}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Yetki Seviyesi:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Süpervizör / Admin
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Denetim Altyapısı:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Aktif (Audit BaseTable)
              </span>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Giriş Bilgileri Formu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Giriş ve Yönetici
                Bilgileri
              </h3>
              <span className="text-[11px] text-slate-400">
                Uygulama açılışında kimlik doğrulama için kullanılır
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Yönetici Adı Soyadı
                </label>
                <Input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Örn: İlyas Bozdemir"
                  className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Makam / Unvan
                </label>
                <Input
                  value={adminTitle}
                  onChange={(e) => setAdminTitle(e.target.value)}
                  placeholder="Örn: Muhasebe Müdürü"
                  className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Giriş Kullanıcı Adı
                </label>
                <Input
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Giriş Parolası
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* EKAP Entegrasyonu */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500" /> EKAP Entegrasyon Girişi (Opsiyonel)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    EKAP Kullanıcı Adı
                  </label>
                  <Input
                    value={ekapUsername}
                    onChange={(e) => setEkapUsername(e.target.value)}
                    placeholder="EKAP Kullanıcı Adı"
                    className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    EKAP Parola
                  </label>
                  <div className="relative">
                    <Input
                      type={showEkapPassword ? 'text' : 'password'}
                      value={ekapPassword}
                      onChange={(e) => setEkapPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-10 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEkapPassword(!showEkapPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showEkapPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveCredentials}
                disabled={saving}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-5 text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
              >
                <Save className="w-4 h-4" /> Bilgileri Kaydet
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BÖLÜM: DENETİM VE GÜVENLİK İZLEME (AUDIT TRAIL OVERVIEW) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Sistem Denetim ve Güvenlik Altyapısı (Audit Inheritance)
            </h3>
          </div>
          <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Tüm Tablolar İçin Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              İşlem İzleme Alanları
            </span>
            <p className="text-slate-500 leading-relaxed">
              Tüm operasyonel ve tanım tabloları{' '}
              <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">
                created_by
              </code>
              ,{' '}
              <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">
                created_at
              </code>
              ,{' '}
              <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">
                updated_by
              </code>
              ,{' '}
              <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">
                updated_at
              </code>{' '}
              kolonları ile izlenir.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Güvenli Silme (Soft Delete)
            </span>
            <p className="text-slate-500 leading-relaxed">
              Kayıtlar doğrudan silinmek yerine{' '}
              <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">
                is_deleted
              </code>{' '}
              bayrağı ile korunur ve Sayıştay denetim standartlarına uygun saklanır.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Çoklu Kurum İzolasyonu
            </span>
            <p className="text-slate-500 leading-relaxed">
              Aktif seçilen kurum profili, tüm yazdırma şablonlarına, onay belgelerine ve harcama
              talimatlarına anında yansır.
            </p>
          </div>
        </div>
      </div>

      {/* YENİ / DÜZENLEME KURUM PROFİLİ MODALI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-850 dark:text-slate-100 text-base">
                    {editingKurum ? 'Kurum Profilini Düzenle' : 'Yeni Kurum Profili Ekle'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingKurum
                      ? 'Kurum ve idari bilgilerini güncelleyin.'
                      : 'Yeni bir idare veya birim için bağımsız profil tanımlayın.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kurum Adı <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  value={modalFormData.kurum_adi || ''}
                  onChange={(e) =>
                    setModalFormData({ ...modalFormData, kurum_adi: e.target.value })
                  }
                  placeholder="Örn: İzmir Büyükşehir Belediyesi / Fen İşleri Dairesi"
                  className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sunulacak Makam Adı
                  </label>
                  <Input
                    value={modalFormData.makam_adi || ''}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, makam_adi: e.target.value })
                    }
                    placeholder="Örn: BAŞKANLIK MAKAMINA"
                    className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bağlı Olduğu Üst Kurum
                  </label>
                  <Input
                    value={modalFormData.ust_kurum_adi || ''}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, ust_kurum_adi: e.target.value })
                    }
                    placeholder="Örn: Çevre, Şehircilik ve İklim Değişikliği Bakanlığı"
                    className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    DETSİS Kodu
                  </label>
                  <Input
                    value={modalFormData.detsis_kodu || ''}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, detsis_kodu: e.target.value })
                    }
                    placeholder="Örn: 12345678"
                    className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-Bütçe Kodu
                  </label>
                  <Input
                    value={modalFormData.ebutce_kodu || ''}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, ebutce_kodu: e.target.value })
                    }
                    placeholder="Örn: 38.01.00.00"
                    className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Limit Tipi
                  </label>
                  <select
                    value={modalFormData.limit_tipi || 'diger'}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, limit_tipi: e.target.value })
                    }
                    className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="diger">Diğer İdareler (Standart Limit)</option>
                    <option value="buyuksehir">Büyükşehir Belediyesi Limitleri</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-Posta
                  </label>
                  <Input
                    value={modalFormData.eposta || ''}
                    onChange={(e) => setModalFormData({ ...modalFormData, eposta: e.target.value })}
                    placeholder="destek@kurum.gov.tr"
                    className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon
                  </label>
                  <Input
                    value={modalFormData.telefon || ''}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, telefon: e.target.value })
                    }
                    placeholder="0 (232) 000 00 00"
                    className="bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              {!editingKurum && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={modalSwitchImmediately}
                      onChange={(e) => setModalSwitchImmediately(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    Profil oluşturulduğunda hemen aktif profile geçiş yap
                  </label>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 text-xs font-semibold"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={modalSaving}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 text-xs font-semibold shadow-md shadow-blue-500/15"
                >
                  {modalSaving ? (
                    'Kaydediliyor...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" />{' '}
                      {editingKurum ? 'Değişiklikleri Kaydet' : 'Profili Oluştur'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
