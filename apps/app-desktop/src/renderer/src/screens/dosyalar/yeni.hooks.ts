import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { TeminDosyasi, useDosyalarHooks } from './dosyalar.hooks'
import { useTabStore } from '../../store/tabStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useKikLimitDonemleri } from '../system/kik-limitleri.hooks'
import { DBBirim, DBPersonel, DBKodSozlugu } from './types'
import { buildAIFormContext } from './yeni.config'
import { AIFilledValues } from '../../components/ui/AIFormFillModal'
import { logActivity } from '../../utils/logger'
import { cloneDosyaWithItems, CloneDosyaCustomOptions } from '../../utils/cloneDosya'

export interface UseYeniDosyaScreenReturn {
  navigate: ReturnType<typeof useNavigate>
  dosyalar: TeminDosyasi[]
  institutionName: string
  donemTanimsizMi: (tarih?: string | Date) => boolean
  isDescLoading: boolean
  showKonuSuggestions: boolean
  setShowKonuSuggestions: React.Dispatch<React.SetStateAction<boolean>>
  isEdit: boolean
  editId: number | null
  birimler: DBBirim[]
  kurum?: any
  personeller: DBPersonel[]
  kodSozlugu: DBKodSozlugu[]
  loadingDb: boolean
  formData: Partial<TeminDosyasi>
  setFormData: React.Dispatch<React.SetStateAction<Partial<TeminDosyasi>>>
  activeTab: 'genel' | 'ihtiyac'
  setActiveTab: React.Dispatch<React.SetStateAction<'genel' | 'ihtiyac'>>
  showKopyalaModal: boolean
  setShowKopyalaModal: React.Dispatch<React.SetStateAction<boolean>>
  showBirimSearch: boolean
  setShowBirimSearch: React.Dispatch<React.SetStateAction<boolean>>
  birimSearchQuery: string
  setBirimSearchQuery: React.Dispatch<React.SetStateAction<string>>
  showPersonelSearch: 'irtibat' | 'hazirlayan' | 'onay' | 'talep_eden' | 'sunan' | null
  setShowPersonelSearch: React.Dispatch<
    React.SetStateAction<'irtibat' | 'hazirlayan' | 'onay' | 'talep_eden' | 'sunan' | null>
  >
  personelSearchQuery: string
  setPersonelSearchQuery: React.Dispatch<React.SetStateAction<string>>
  filteredBirimler: DBBirim[]
  filteredPersoneller: DBPersonel[]
  handleCopyKonuToAciklama: () => void
  handleCopyDosya: (eskiDosya: TeminDosyasi, options?: CloneDosyaCustomOptions) => Promise<void> | void
  showAIModal: boolean
  setShowAIModal: React.Dispatch<React.SetStateAction<boolean>>
  showAiMenu: boolean
  setShowAiMenu: React.Dispatch<React.SetStateAction<boolean>>
  textGenConfig: {
    isOpen: boolean
    title: string
    fieldName: string
    targetField: keyof TeminDosyasi
    systemInstruction?: string
  }
  setTextGenConfig: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean
      title: string
      fieldName: string
      targetField: keyof TeminDosyasi
      systemInstruction?: string
    }>
  >
  aiKalemConfig: {
    isOpen: boolean
  }
  setAiKalemConfig: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean
    }>
  >
  openTextGenerator: (
    targetField: keyof TeminDosyasi,
    title: string,
    fieldName: string,
    systemInstruction?: string
  ) => void
  getAIFormContext: () => ReturnType<typeof buildAIFormContext>
  handleAIApply: (values: AIFilledValues) => void
  handleAiDescGenerate: () => Promise<void>
  handleAiFormValidation: () => void
  handleAiFullFormGenerate: () => void
  handleSelectBirim: (b: DBBirim) => void
  handleSave: (e: React.FormEvent) => Promise<void>
  getIhaleSekliExplanation: (sekil: string | null | undefined) => string
  matchedSuggestions: string[]
  exactMatchCount: number
  getNextTeminNo: (year: number) => string
  validationError: string | null
  setValidationError: React.Dispatch<React.SetStateAction<string | null>>
}

export function useYeniDosyaScreen(): UseYeniDosyaScreenReturn {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const search: any = (routerState?.location?.search as any) || {}
  const { dosyalar, addDosya, updateDosya } = useDosyalarHooks()
  const { updateTabLabel } = useTabStore()
  const { institutionName, limitType } = useSettingsStore()
  const { donemTanimsizMi, donemler } = useKikLimitDonemleri()

  const [validationError, setValidationError] = useState<string | null>(null)
  const [isDescLoading, setIsDescLoading] = useState(false)
  const [showKonuSuggestions, setShowKonuSuggestions] = useState(false)
  const [showKopyalaModal, setShowKopyalaModal] = useState(false)

  // Get query params
  const searchParams = new URLSearchParams(window.location.search)
  const editIdRaw = search?.id || searchParams.get('id')
  const editId = editIdRaw ? parseInt(String(editIdRaw), 10) : null
  const isEdit = editId !== null && !isNaN(editId)
  const initialHrefRef = useRef(routerState.location.href)

  // Title & Tab title
  useEffect(() => {
    document.title = isEdit
      ? 'Doğrudan Temin Dosyası Düzenle - DT'
      : 'Yeni Doğrudan Temin Dosyası Ekle - DT'
    updateTabLabel(initialHrefRef.current, isEdit ? 'DT Dosyasını Düzenle' : 'Yeni DT Dosyası Ekle')
  }, [isEdit, updateTabLabel])

  // DB Collections state
  const [birimler, setBirimler] = useState<DBBirim[]>([])
  const [kurum, setKurum] = useState<any>(null)
  const [personeller, setPersoneller] = useState<DBPersonel[]>([])
  const [kodSozlugu, setKodSozlugu] = useState<DBKodSozlugu[]>([])
  const [loadingDb, setLoadingDb] = useState(true)

  // Form State
  const [formData, setFormData] = useState<Partial<TeminDosyasi>>({
    temin_no: '',
    dosya_acilis_tarihi: new Date().toISOString().split('T')[0],
    butce_yili: new Date().getFullYear(),
    butce_tipi: 'Genel Bütçe',
    konu: '',
    isin_aciklamasi: '',
    birim_id: null,
    antet_ek_satir: '',
    sunulacak_makam: '',
    ihtiyac_yeri: '',
    e_butce: '',
    fonksiyonel_kod: '',
    muhasebe_birimi: '',
    harcama_birimi: '',
    finansman_kodu: '1',
    ekonomik_kod: '',
    ihale_tipi: 'Doğrudan Temin',
    tur: 'mal',
    ihale_sekli: limitType === 'buyuksehir' ? '22/d*' : '22/d**',
    teklif_sozlesme_turu: 'Birim Fiyat',
    alt_yuklenici_olacak_mi: 0,
    kismi_teklif_verilecek_mi: 0,
    fiyat_farki_dayanagi: 'Fiyat Farkı Ödenmeyecek',
    yatirim_proje_no: '',
    avans_verilecek_mi: 0,
    yillara_yaygin: 0,
    sozlesme_yapilacak_mi: 0,
    yaklasik_maliyet_hesaplamasi: '',
    kdv: '20',
    hesaplama_esasi: '',
    komisyon_takdiri: 'Sadece araştırma fiyatları dikkate alınacak',
    tibbi_cihaz_alimi_mi: 0,
    irtibat_yetkilisi_id: null,
    talep_eden_personel_id: null,
    sunan_personel_id: null,
    son_teklif_verme_tarihi: new Date().toISOString().split('T')[0] + ' 10:00',
    teslim_tarihi: '',
    yaklasik_maliyet: 0,
    butce_kodu: '',
    notlar: ''
  })

  const currentLimit = useMemo(() => {
    if (!donemler || donemler.length === 0) return null
    const year = formData.butce_yili?.toString() || new Date().getFullYear().toString()
    const donem = donemler.find((d) => d.donem_kodu.startsWith(year)) || donemler[0]
    return limitType === 'buyuksehir' ? donem.buyuksehir_limit : donem.diger_limit
  }, [donemler, formData.butce_yili, limitType])

  const isLimitExceeded = useMemo(() => {
    if (!currentLimit || !formData.yaklasik_maliyet) return false
    return formData.yaklasik_maliyet > currentLimit
  }, [currentLimit, formData.yaklasik_maliyet])

  // Load Database values
  useEffect(() => {
    async function loadData() {
      setLoadingDb(true)
      try {
        const resBirim = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Birim WHERE aktif_mi = 1'
        )
        const resPers = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Personel WHERE aktif_mi = 1'
        )
        const resKod = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_KodSozlugu WHERE aktif_mi = 1'
        )
        const resRoller = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Roller'
        )
        const resKurum = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Kurum LIMIT 1'
        )

        if (resBirim.success) setBirimler(resBirim.data)
        if (resPers.success) setPersoneller(resPers.data)
        if (resKod.success) setKodSozlugu(resKod.data)
        if (resKurum.success && resKurum.data.length > 0) setKurum(resKurum.data[0])

        const roller = resRoller.success ? resRoller.data : []

        // Load existing document if in Edit Mode
        if (isEdit) {
          const resDoc = await window.electron.ipcRenderer.invoke(
            'db:query',
            'SELECT * FROM DATA_TeminDosyasi WHERE id = ?',
            [editId]
          )
          if (resDoc.success && resDoc.data.length > 0) {
            const doc = resDoc.data[0]
            // Format dates for html input tags
            const formatForInput = (val: any) => {
              if (!val) return ''
              return val.includes('T') ? val.split('T')[0] : val
            }
            setFormData({
              ...doc,
              dosya_acilis_tarihi: formatForInput(doc.dosya_acilis_tarihi),
              son_teklif_verme_tarihi: doc.son_teklif_verme_tarihi
                ? (/^\d{4}-\d{2}-\d{2}$/.test(String(doc.son_teklif_verme_tarihi).trim())
                    ? `${String(doc.son_teklif_verme_tarihi).trim()}T10:00`
                    : String(doc.son_teklif_verme_tarihi).replace(' ', 'T').slice(0, 16))
                : '',
              teslim_tarihi: formatForInput(doc.teslim_tarihi)
            })
          }
        } else {
          // Yeni dosya açılırken varsayılan personelleri set et ve URL parametrelerini işle
          const findDefaultId = (rolKodu: string) => {
            const found = roller.find((r: any) => r.rol_kodu === rolKodu)
            return found?.varsayilan_personel_id || null
          }

          const qParams = new URLSearchParams(window.location.search)
          const urlTur = search?.tur || qParams.get('tur')
          const isKopyala = search?.kopyala === '1' || search?.kopyala === true || qParams.get('kopyala') === '1'
          if (isKopyala) {
            setShowKopyalaModal(true)
          }

          setFormData((prev) => ({
            ...prev,
            tur: (urlTur as any) || prev.tur || 'mal',
            onay_personel_id:
              findDefaultId('harcama_yetkilisi') ||
              findDefaultId('onaylayan') ||
              prev.onay_personel_id,
            hazirlayan_personel_id: findDefaultId('hazirlayan') || prev.hazirlayan_personel_id,
            talep_eden_personel_id: findDefaultId('talep_eden') || prev.talep_eden_personel_id,
            sunan_personel_id:
              findDefaultId('ihale_yetkilisi') ||
              findDefaultId('talep_eden') ||
              prev.sunan_personel_id,
            irtibat_yetkilisi_id:
              findDefaultId('ilgili_personel') ||
              findDefaultId('hazirlayan') ||
              prev.irtibat_yetkilisi_id
          }))
        }
      } catch (err) {
        console.error('Veritabanı yüklenirken hata oluştu:', err)
      } finally {
        setLoadingDb(false)
      }
    }
    loadData()
  }, [isEdit, editId])

  // Yıla göre sıradaki Doğrudan Temin Numarasını Hesaplama (Örn: 2026/1, 2026/2)
  const getNextTeminNo = (year: number) => {
    const yearStr = year.toString()
    // Sadece aktif yılın silinmemiş dosyalarını filtrele
    const yearDosyalar = dosyalar.filter(
      (d) =>
        !d.is_deleted &&
        (d.butce_yili === year ||
          (d.temin_no && d.temin_no.includes(yearStr)) ||
          (d.created_at && d.created_at.startsWith(yearStr)) ||
          (d.dosya_acilis_tarihi && d.dosya_acilis_tarihi.startsWith(yearStr)))
    )

    let maxSeq = 0
    yearDosyalar.forEach((d) => {
      const raw = (d.temin_no || '').trim()
      if (!raw) return

      // Parçala: "2026/2026/1", "DT-2026/2", "2026/3", "4"
      const parts = raw.split(/[/_ -]+/)
      for (let i = parts.length - 1; i >= 0; i--) {
        const num = parseInt(parts[i], 10)
        if (!isNaN(num) && num !== year && num > 0) {
          if (num > maxSeq) {
            maxSeq = num
          }
          break
        }
      }
    })

    return `${yearStr}/${maxSeq + 1}`
  }

  // Otomatik Temin Numarası (2026/1) Oluşturma
  useEffect(() => {
    if (!isEdit && !formData.temin_no && !loadingDb) {
      const year = formData.dosya_acilis_tarihi
        ? new Date(formData.dosya_acilis_tarihi).getFullYear()
        : formData.butce_yili || new Date().getFullYear()
      setFormData((prev) => ({
        ...prev,
        temin_no: getNextTeminNo(year)
      }))
    }
  }, [isEdit, formData.temin_no, loadingDb, dosyalar, formData.dosya_acilis_tarihi, formData.butce_yili])

  // Active Tab (Stepper)
  const [activeTab, setActiveTab] = useState<'genel' | 'ihtiyac'>('genel')

  const handleCopyDosya = async (
    eskiDosya: TeminDosyasi,
    options?: CloneDosyaCustomOptions
  ) => {
    if (options) {
      const res = await cloneDosyaWithItems(eskiDosya, dosyalar, addDosya, options)
      setShowKopyalaModal(false)
      if (res.success && res.newId) {
        navigate({
          to: `/dosyalar/yeni?id=${res.newId}` as any
        })
      } else {
        alert('Kopyalama sırasında hata oluştu: ' + (res.error || 'Bilinmeyen hata'))
      }
      return
    }

    const targetYear = formData.dosya_acilis_tarihi
      ? new Date(formData.dosya_acilis_tarihi).getFullYear()
      : formData.butce_yili || new Date().getFullYear()
    const nextNo = getNextTeminNo(targetYear)

    setFormData((prev) => ({
      ...prev,
      konu: eskiDosya.konu ? `${eskiDosya.konu} (Kopya)` : '',
      isin_aciklamasi: eskiDosya.isin_aciklamasi || '',
      birim_id: eskiDosya.birim_id || null,
      antet_ek_satir: eskiDosya.antet_ek_satir || '',
      sunulacak_makam: eskiDosya.sunulacak_makam || '',
      ihtiyac_yeri: eskiDosya.ihtiyac_yeri || '',
      e_butce: eskiDosya.e_butce || '',
      fonksiyonel_kod: eskiDosya.fonksiyonel_kod || '',
      muhasebe_birimi: eskiDosya.muhasebe_birimi || '',
      harcama_birimi: eskiDosya.harcama_birimi || '',
      finansman_kodu: eskiDosya.finansman_kodu || '1',
      ekonomik_kod: eskiDosya.ekonomik_kod || '',
      ihale_tipi: eskiDosya.ihale_tipi || 'Doğrudan Temin',
      tur: eskiDosya.tur || 'mal',
      ihale_sekli: eskiDosya.ihale_sekli || '22/d*',
      teklif_sozlesme_turu: eskiDosya.teklif_sozlesme_turu || 'Birim Fiyat',
      alt_yuklenici_olacak_mi: eskiDosya.alt_yuklenici_olacak_mi || 0,
      kismi_teklif_verilecek_mi: eskiDosya.kismi_teklif_verilecek_mi || 0,
      fiyat_farki_dayanagi: eskiDosya.fiyat_farki_dayanagi || 'Fiyat Farkı Ödenmeyecek',
      yatirim_proje_no: eskiDosya.yatirim_proje_no || '',
      avans_verilecek_mi: eskiDosya.avans_verilecek_mi || 0,
      yillara_yaygin: eskiDosya.yillara_yaygin || 0,
      sozlesme_yapilacak_mi: eskiDosya.sozlesme_yapilacak_mi || 0,
      yaklasik_maliyet_hesaplamasi: eskiDosya.yaklasik_maliyet_hesaplamasi || '',
      kdv: eskiDosya.kdv || '20',
      hesaplama_esasi: eskiDosya.hesaplama_esasi || '',
      komisyon_takdiri: eskiDosya.komisyon_takdiri || 'Sadece araştırma fiyatları dikkate alınacak',
      tibbi_cihaz_alimi_mi: eskiDosya.tibbi_cihaz_alimi_mi || 0,
      yaklasik_maliyet: eskiDosya.yaklasik_maliyet || 0,
      butce_kodu: eskiDosya.butce_kodu || '',
      irtibat_yetkilisi_id: eskiDosya.irtibat_yetkilisi_id || null,
      hazirlayan_personel_id: eskiDosya.hazirlayan_personel_id || null,
      onay_personel_id: eskiDosya.onay_personel_id || null,
      talep_eden_personel_id: eskiDosya.talep_eden_personel_id || null,
      sunan_personel_id: eskiDosya.sunan_personel_id || null,
      notlar: eskiDosya.notlar || '',
      temin_no: nextNo,
      butce_yili: targetYear,
      dosya_acilis_tarihi: new Date().toISOString().split('T')[0],
      son_teklif_verme_tarihi: '',
      teslim_tarihi: ''
    }))
    setShowKopyalaModal(false)
    alert(
      `"${eskiDosya.konu}" başlıklı dosyadan veriler başarıyla aktarıldı.\nYeni Dosya Numarası: ${nextNo}`
    )
  }

  // Search states for custom select/autocomplete dropdowns
  const [showBirimSearch, setShowBirimSearch] = useState(false)
  const [birimSearchQuery, setBirimSearchQuery] = useState('')
  const [showPersonelSearch, setShowPersonelSearch] = useState<
    'irtibat' | 'hazirlayan' | 'onay' | 'talep_eden' | 'sunan' | null
  >(null)
  const [personelSearchQuery, setPersonelSearchQuery] = useState('')

  // Filtered lists
  const filteredBirimler = useMemo(() => {
    return birimler.filter((b) =>
      b.birim_adi.toLowerCase().includes(birimSearchQuery.toLowerCase())
    )
  }, [birimler, birimSearchQuery])

  const filteredPersoneller = useMemo(() => {
    return personeller.filter(
      (p) =>
        p.ad_soyad.toLowerCase().includes(personelSearchQuery.toLowerCase()) ||
        (p.unvan || '').toLowerCase().includes(personelSearchQuery.toLowerCase())
    )
  }, [personeller, personelSearchQuery])

  // Copy Konu (İşin Adı) to Açıklama
  const handleCopyKonuToAciklama = () => {
    setFormData((prev) => ({
      ...prev,
      isin_aciklamasi: prev.konu
    }))
  }

  // AI Form Fill Modal
  const [showAIModal, setShowAIModal] = useState(false)
  const [showAiMenu, setShowAiMenu] = useState(false)

  // Reusable AI Text Generator Modal
  const [textGenConfig, setTextGenConfig] = useState<{
    isOpen: boolean
    title: string
    fieldName: string
    targetField: keyof TeminDosyasi
    systemInstruction?: string
  }>({
    isOpen: false,
    title: '',
    fieldName: '',
    targetField: 'isin_aciklamasi'
  })

  // AI Kalem Asistanı State
  const [aiKalemConfig, setAiKalemConfig] = useState<{
    isOpen: boolean
  }>({ isOpen: false })

  const openTextGenerator = (
    targetField: keyof TeminDosyasi,
    title: string,
    fieldName: string,
    systemInstruction?: string
  ) => {
    setTextGenConfig({
      isOpen: true,
      title,
      fieldName,
      targetField,
      systemInstruction
    })
  }

  const getAIFormContext = () => {
    return buildAIFormContext(formData, birimler, institutionName)
  }

  const handleAIApply = (values: AIFilledValues) => {
    const numericFields = [
      'butce_yili',
      'yaklasik_maliyet',
      'alt_yuklenici_olacak_mi',
      'kismi_teklif_verilecek_mi',
      'avans_verilecek_mi',
      'tibbi_cihaz_alimi_mi'
    ]

    setFormData((prev) => {
      const updated: any = { ...prev }
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          if (numericFields.includes(key)) {
            updated[key] = Number(values[key]) || 0
          } else {
            updated[key] = String(values[key])
          }
        }
      })
      return updated
    })
  }

  const handleAiDescGenerate = async () => {
    if (!formData.konu?.trim()) {
      setValidationError('Lütfen önce dosya konusunu (İşin Adı) giriniz.')
      return
    }

    setIsDescLoading(true)
    try {
      const prompt = `Şu kamu alım işi/ihalesi için sadece 1-2 cümlelik, çok kısa ve öz bir "İşin Kapsamı ve Tanımı" metni oluştur. İhale/İş Adı: "${formData.konu}". Metin kurumsal bir dilde olmalı, ancak ASLA başlık (örn: 1. İşin konusu vb.), madde imi veya uzun paragraflar KULLANMA. İdare adını anonim olarak "İdaremiz" veya "Kurumumuz" şeklinde belirt, gerçek isim verme. Sadece doğrudan açıklamayı düz metin olarak ver.`

      const res = await window.api.aiGenerate({
        prompt,
        enableDatabaseAccess: false
      })
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          isin_aciklamasi: res.data?.trim() || ''
        }))
      } else {
        alert('Yapay zeka yanıt üretemedi: ' + (res.error || 'Bilinmeyen hata'))
      }
    } catch (err: any) {
      alert('Bir hata oluştu: ' + err.message)
    } finally {
      setIsDescLoading(false)
    }
  }

  const handleAiFormValidation = () => {
    const dataStr = JSON.stringify(formData, null, 2)
    openTextGenerator(
      'notlar',
      'AI Form Tutarsızlık Kontrolü',
      'Form Analiz Sonucu (İsterseniz Notlara Ekleyebilirsiniz)',
      `Sen bir Kamu İhale ve Muhasebe Uzmanısın. Kullanıcı bir Doğrudan Temin dosyası oluşturuyor ancak kaydetmeden önce sana kontrol ettirmek istedi.\n\nAşağıdaki form verilerini ihale mevzuatı (özellikle 22/d vb.), muhasebe kuralları (fonksiyonel kod, ekonomik kod uyumu) ve mantıksal tutarlılık açısından incele:\n\n${dataStr}\n\nEğer KDV, bütçe, ihale şekli, teslim tarihi gibi alanlarda bir hata, eksiklik veya mevzuata aykırılık görüyorsan kullanıcıyı uyar. Her şey normalse tebrik et.`
    )
  }

  const handleAiFullFormGenerate = () => {
    setShowAIModal(true)
  }

  const handleSelectBirim = (birim: DBBirim) => {
    setFormData((prev) => ({
      ...prev,
      birim_id: birim.id,
      antet_ek_satir: birim.antet_ek_satir || '',
      sunulacak_makam: birim.sunum_makami || '',
      ihtiyac_yeri: birim.ihtiyac_yeri_eki || '',
      e_butce: birim.e_butce || ''
    }))
    setShowBirimSearch(false)
    setBirimSearchQuery('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.konu?.trim()) {
      setValidationError('Lütfen dosya konusunu (İşin Adı) giriniz.')
      return
    }

    const normalizeTr = (s: string) => s.trim().toLocaleLowerCase('tr-TR')
    let baseKonu = formData.konu?.trim() || ''

    const baseMatch = baseKonu.match(/^(.*?)\s*\(\d+\)$/)
    if (baseMatch) {
      baseKonu = baseMatch[1].trim()
    }

    const targetKonu = normalizeTr(baseKonu)

    const currentYear =
      formData.butce_yili ||
      (formData.dosya_acilis_tarihi
        ? new Date(formData.dosya_acilis_tarihi).getFullYear()
        : new Date().getFullYear())
    const matches = dosyalar.filter((d) => {
      if (isEdit && d.id === editId) return false
      const dYear =
        d.butce_yili || (d.dosya_acilis_tarihi ? new Date(d.dosya_acilis_tarihi).getFullYear() : 0)
      if (dYear !== currentYear) return false

      const dBase = (d.konu || '')
        .trim()
        .replace(/\s*\(\d+\)$/, '')
        .trim()
      return normalizeTr(dBase) === targetKonu
    })

    let finalKonu = formData.konu?.trim() || ''
    let nextTekrarNo = 1

    if (matches.length > 0 && !isEdit) {
      const maxNo = Math.max(
        ...matches.map((d) => {
          const m = (d.konu || '').match(/\s*\((\d+)\)$/)
          const textualNo = m ? parseInt(m[1], 10) : 1
          return Math.max(d.tekrar_no || 1, textualNo)
        })
      )
      nextTekrarNo = maxNo + 1
      finalKonu = `${baseKonu} (${nextTekrarNo})`
    }

    let finalMaliyet = Number(formData.yaklasik_maliyet) || 0
    const kdvRate = Number(formData.kdv) || 0
    const isKdvDahil = Number(formData.yaklasik_maliyet_kdv_dahil_mi) === 1

    if (isKdvDahil && kdvRate > 0) {
      finalMaliyet = Number((finalMaliyet / (1 + kdvRate / 100)).toFixed(2))
    }

    let finalTeminNo = (formData.temin_no || '').trim()
    const targetYear = formData.butce_yili || new Date().getFullYear()

    if (!finalTeminNo) {
      finalTeminNo = getNextTeminNo(targetYear)
    } else {
      // Çift yıl temizliği (Örn: "2026/2026/1" -> "2026/1")
      const doubleMatch = finalTeminNo.match(/^(\d{4})[/-]\1[/-](\d+)$/)
      if (doubleMatch) {
        finalTeminNo = `${doubleMatch[1]}/${doubleMatch[2]}`
      } else if (/^\d+$/.test(finalTeminNo)) {
        finalTeminNo = `${targetYear}/${finalTeminNo}`
      }
    }

    // Veritabanı seviyesinde gerçek zamanlı mükerrerlik kontrolü (Kayıt öncesi kesin engel)
    try {
      const checkRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT id, temin_no, konu, butce_yili, dosya_acilis_tarihi 
         FROM DATA_TeminDosyasi 
         WHERE (is_deleted = 0 OR is_deleted IS NULL)`
      )
      if (checkRes.success && checkRes.data) {
        const existingCollision = checkRes.data.find((d: any) => {
          if (isEdit && Number(d.id) === Number(editId)) return false
          const dYear =
            Number(d.butce_yili) ||
            (d.dosya_acilis_tarihi ? new Date(d.dosya_acilis_tarihi).getFullYear() : targetYear)
          if (dYear !== targetYear && dYear !== 0) return false
          const cleanD = (d.temin_no || '').trim()
          if (!cleanD) return false
          return (
            cleanD.toLowerCase() === finalTeminNo.toLowerCase() ||
            cleanD.toLowerCase() === `${targetYear}/${finalTeminNo}`.toLowerCase() ||
            `${targetYear}/${cleanD}`.toLowerCase() === finalTeminNo.toLowerCase()
          )
        })

        if (existingCollision) {
          alert(
            `KAYIT ENGELLENDİ!\n\n"${finalTeminNo}" doğrudan temin numarası ${targetYear} yılında zaten başka bir dosya (Dosya #${existingCollision.id}: "${existingCollision.konu}") tarafından kullanılmaktadır.\n\nLütfen formu kontrol edip benzersiz bir numara veriniz veya "Sıradaki No" butonunu kullanınız.`
          )
          return
        }
      }
    } catch (err) {
      console.warn('Temin no doğrulama uyarısı:', err)
    }

    const payload = {
      ...formData,
      temin_no: finalTeminNo,
      konu: finalKonu,
      tekrar_no: nextTekrarNo,
      yaklasik_maliyet: finalMaliyet,
      yaklasik_maliyet_kdv_dahil_mi: 0
    }

    try {
      if (isEdit) {
        await updateDosya({ ...payload, id: editId! })
        await logActivity(
          'Dosya Güncellendi',
          `${payload.konu || 'İsimsiz'} isimli dosya güncellendi.`,
          'info'
        )
        alert('Doğrudan temin dosyası başarıyla güncellendi.')
      } else {
        await addDosya(payload)
        await logActivity(
          'Yeni Dosya Eklendi',
          `${payload.konu || 'İsimsiz'} konusuyla yeni bir temin dosyası oluşturuldu.`,
          'success'
        )
        alert('Yeni doğrudan temin dosyası başarıyla eklendi.')
      }
      navigate({ to: '/dosyalar' })
    } catch (error) {
      console.error(error)
      alert('Kaydetme sırasında bir hata oluştu: ' + (error as Error).message)
    }
  }

  const getIhaleSekliExplanation = (sekil: string | null | undefined) => {
    switch (sekil) {
      case '22/d*':
        return 'Büyükşehir belediyesi sınırları içindeki doğrudan temin limiti.'
      case '22/d**':
        return 'Diğer belediyeler ve idareler için doğrudan temin limiti.'
      case '22/a':
        return 'İhtiyacın sadece gerçek veya tüzel tek kişi tarafından karşılanabilmesi.'
      case '22/b':
        return 'Özel bir hakka sahip gerçek veya tüzel tek kişinin olması.'
      case '22/c':
        return 'Mevcut mal, ekipman, teknoloji veya hizmetlerle uyumun sağlanması için yapılacak alımlar.'
      default:
        return 'Doğrudan temin mevzuat maddesi.'
    }
  }

  const normalizeTr = (str: string) => (str || '').trim().toLocaleLowerCase('tr-TR')

  const konuFrequencies = useMemo(() => {
    return dosyalar.reduce(
      (acc, d) => {
        if (d.konu) {
          const k = d.konu.trim()
          acc[k] = (acc[k] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )
  }, [dosyalar])

  const sortedKonular = useMemo(() => {
    return Object.entries(konuFrequencies)
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
  }, [konuFrequencies])

  const matchedSuggestions = useMemo(() => {
    return formData.konu
      ? sortedKonular
          .filter(
            (k) =>
              normalizeTr(k).includes(normalizeTr(formData.konu || '')) &&
              normalizeTr(k) !== normalizeTr(formData.konu || '')
          )
          .slice(0, 8)
      : sortedKonular.slice(0, 8)
  }, [formData.konu, sortedKonular])

  const exactMatchCount = useMemo(() => {
    if (!formData.konu) return 0
    return dosyalar.filter((d) => {
      const dYear =
        d.butce_yili || (d.dosya_acilis_tarihi ? new Date(d.dosya_acilis_tarihi).getFullYear() : 0)
      const currentYear =
        formData.butce_yili ||
        (formData.dosya_acilis_tarihi
          ? new Date(formData.dosya_acilis_tarihi).getFullYear()
          : new Date().getFullYear())
      return (
        dYear === currentYear &&
        normalizeTr(d.konu) === normalizeTr(formData.konu || '') &&
        (!isEdit || d.id !== editId)
      )
    }).length
  }, [formData.konu, dosyalar, formData.butce_yili, formData.dosya_acilis_tarihi, isEdit, editId])

  return {
    navigate,
    dosyalar,
    institutionName,
    donemTanimsizMi,
    isDescLoading,
    showKonuSuggestions,
    setShowKonuSuggestions,
    isEdit,
    editId,
    birimler,
    personeller,
    kodSozlugu,
    loadingDb,
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    showKopyalaModal,
    setShowKopyalaModal,
    showBirimSearch,
    setShowBirimSearch,
    birimSearchQuery,
    setBirimSearchQuery,
    showPersonelSearch,
    setShowPersonelSearch,
    personelSearchQuery,
    setPersonelSearchQuery,
    filteredBirimler,
    filteredPersoneller,
    handleCopyKonuToAciklama,
    handleCopyDosya,
    showAIModal,
    setShowAIModal,
    showAiMenu,
    setShowAiMenu,
    textGenConfig,
    setTextGenConfig,
    aiKalemConfig,
    setAiKalemConfig,
    openTextGenerator,
    getAIFormContext,
    handleAIApply,
    handleAiDescGenerate,
    handleAiFormValidation,
    handleAiFullFormGenerate,
    handleSelectBirim,
    handleSave,
    getIhaleSekliExplanation,
    matchedSuggestions,
    exactMatchCount,
    getNextTeminNo,
    validationError,
    setValidationError,
    kurum
  }
}
