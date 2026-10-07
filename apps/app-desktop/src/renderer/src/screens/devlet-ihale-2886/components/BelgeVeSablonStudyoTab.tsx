import React, { useState, useMemo, useEffect } from 'react'
import {
  FileText,
  Save,
  Download,
  History,
  Sparkles,
  Building2,
  DollarSign,
  MapPin,
  CheckCircle2,
  Printer,
  Plus,
  Trash2,
  Sliders,
  Code2,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react'
import Mustache from 'mustache'
import { Dosya2886Item } from '../../../components/layout/temin-selector/teminSelector.types'
import {
  getInitial2886Dosyalar,
  persist2886Dosyalar,
  persist2886ActiveDosya
} from '../../../components/layout/temin-selector/teminSelector.storage'
import { A4Editor } from '../../../components/editor/A4Editor'
import { sayiyiYaziyaCevir } from '../../../constants/sayiEslesmeleri'

// Standart 2886 İhale Şablonları
const STANDARD_2886_TEMPLATES: {
  kod: string
  ad: string
  kategori: string
  templateHtml: string
}[] = [
  {
    kod: '2886-EVR-01',
    ad: 'Başkanlık Oluru / İhale Başlatma Onay Belgesi',
    kategori: '1. Aşama: Başlangıç & Yetki',
    templateHtml: `
<div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 25px;">
    <h3 style="margin: 0; font-size: 14pt; text-transform: uppercase;">T.C.</h3>
    <h3 style="margin: 0; font-size: 13pt; text-transform: uppercase;">{{kurum_adi}}</h3>
    <h4 style="margin: 5px 0 0 0; font-size: 11pt; color: #475569;">Emlak ve İstimlak Müdürlüğü</h4>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 10pt;">
    <div><strong>Sayı:</strong> {{dosya_no}} / {{sayi_no}}</div>
    <div><strong>Tarih:</strong> {{tarih}}</div>
  </div>

  <div style="text-align: center; margin: 25px 0; font-weight: bold; font-size: 12pt; text-decoration: underline;">
    BAŞKANLIK MAKAMINA (İHALE ONAY BELGESİ)
  </div>

  <p>
    Mülkiyeti idaremize ait aşağıda tapu ve nitelik bilgileri belirtilen taşınmazın, 
    <strong>2886 Sayılı Devlet İhale Kanunu'nun {{ihale_usulu}}</strong> hükümleri doğrultusunda 
    <strong>{{islem_turu_adi}}</strong> ihalesine çıkarılması planlanmaktadır.
  </p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10pt;" border="1" cellpadding="8">
    <tr style="background-color: #f8fafc;">
      <th style="width: 35%; text-align: left;">Dosya Kayıt No</th>
      <td>{{dosya_no}}</td>
    </tr>
    <tr>
      <th style="text-align: left;">İhale Konusu / Taşınmaz</th>
      <td>{{tasinmaz_adi}}</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <th style="text-align: left;">İşlem Türü</th>
      <td><strong>{{islem_turu_adi}}</strong></td>
    </tr>
    <tr>
      <th style="text-align: left;">Ada / Parsel / Mahalle</th>
      <td>{{ada_parsel}} ({{mahalle_ilce}})</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <th style="text-align: left;">Yüzölçümü & Niteliği</th>
      <td>{{yuzolcumu}} m² — {{tasinmaz_cinsi}}</td>
    </tr>
    <tr>
      <th style="text-align: left;">Tahmini Muhammen Bedel</th>
      <td><strong style="color: #059669;">₺{{muhammen_bedel}}</strong> ({{muhammen_bedel_yaziyla}})</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <th style="text-align: left;">Geçici Teminat Tutarı (%3)</th>
      <td><strong>₺{{gecici_teminat}}</strong></td>
    </tr>
    <tr>
      <th style="text-align: left;">İhale Tarihi & Saati</th>
      <td>{{ihale_tarihi}} — Saat: {{ihale_saati}}</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <th style="text-align: left;">İhale Yeri</th>
      <td>{{ihale_yeri}}</td>
    </tr>
    {{#imar_durumu}}
    <tr>
      <th style="text-align: left;">İmar Durumu</th>
      <td>{{imar_durumu}}</td>
    </tr>
    {{/imar_durumu}}
  </table>

  <p>
    Söz konusu ihalenin açılması, şartname ve eklerinin hazırlanması ve Encümene sevk edilmesi hususunu tensiplerinize arz ederim.
  </p>

  <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 10pt;">
    <div>
      <p><strong>Emlak ve İstimlak Müdürü</strong></p>
      <br/><br/>
      <p>İmza / Mühür</p>
    </div>
    <div>
      <p><strong>U Y G U N D U R</strong></p>
      <p><strong>Belediye Başkanı / İta Amiri</strong></p>
      <br/><br/>
      <p>İmza / Mühür</p>
    </div>
  </div>
</div>
`
  },
  {
    kod: '2886-EVR-02',
    ad: '2886 İhale Şartnamesi (Madde 45 / Açık Teklif)',
    kategori: '2. Aşama: Şartname & Esaslar',
    templateHtml: `
<div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 25px;">
    <h3 style="margin: 0; font-size: 13pt; text-transform: uppercase;">T.C. {{kurum_adi}} BAŞKANLIĞI</h3>
    <h4 style="margin: 5px 0 0 0; font-size: 12pt;">TAŞINMAZ {{islem_turu_adi}} İHALE ŞARTNAMESİ</h4>
    <p style="font-size: 10pt; color: #64748b; margin-top: 4px;">(2886 Sayılı Kanun Madde {{ihale_usulu}})</p>
  </div>

  <h4 style="font-size: 11pt; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px;">MADDE 1 — İŞİN KONUSU VE NİTELİĞİ</h4>
  <p style="font-size: 10pt;">
    Mülkiyeti idaremize ait, tapunun <strong>{{ada_parsel}}</strong> parsel numarasında kayıtlı, 
    <strong>{{yuzolcumu}} m²</strong> yüzölçümlü <strong>{{tasinmaz_cinsi}}</strong> vasıflı taşınmazın 
    2886 Sayılı Devlet İhale Kanunu hükümlerine göre <strong>{{islem_turu_adi}}</strong> ihalesidir.
  </p>

  <h4 style="font-size: 11pt; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px;">MADDE 2 — MUHAMMEN BEDEL VE GEÇİCİ TEMİNAT</h4>
  <p style="font-size: 10pt;">
    2.1. İhale konusu taşınmazın muhammen bedeli <strong>₺{{muhammen_bedel}}</strong> ({{muhammen_bedel_yaziyla}})'dir.<br/>
    2.2. İhaleye katılabilmek için muhammen bedelin en az %3'ü olan <strong>₺{{gecici_teminat}}</strong> tutarında geçici teminat yatırılması zorunludur.
  </p>

  <h4 style="font-size: 11pt; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px;">MADDE 3 — İHALE TARİHİ VE YERİ</h4>
  <p style="font-size: 10pt;">
    İhale, <strong>{{ihale_tarihi}}</strong> günü saat <strong>{{ihale_saati}}</strong>'da 
    <strong>{{ihale_yeri}}</strong> adresinde Belediye Encümeni huzurunda yapılacaktır.
  </p>

  <h4 style="font-size: 11pt; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px;">MADDE 4 — İHALEYE KATILMA ŞARTLARI</h4>
  <ul style="font-size: 10pt; padding-left: 20px;">
    <li>Kanuni ikametgâh belgesi ve T.C. Kimlik fotokopisi,</li>
    <li>Tüzel kişiler için Ticaret Odası faaliyet belgesi ve imza sirküleri,</li>
    <li>Geçici teminat makbuzu veya süresiz banka teminat mektubu,</li>
    <li>Belediyemize vadesi geçmiş borcu bulunmadığına dair borcu yoktur yazısı.</li>
  </ul>

  <div style="margin-top: 40px; text-align: right; font-size: 10pt;">
    <p><strong>İdare Yetkilisi / Encümen Başkanı</strong></p>
    <br/><br/>
    <p>İmza / Mühür</p>
  </div>
</div>
`
  },
  {
    kod: '2886-EVR-05',
    ad: 'Kıymet Takdir Komisyonu Karar Tutanağı & Muhammen Bedel',
    kategori: '2. Aşama: Kıymet Takdiri',
    templateHtml: `
<div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h3 style="margin: 0; font-size: 13pt;">T.C. {{kurum_adi}}</h3>
    <h4 style="margin: 5px 0; font-size: 11pt;">KIYMET TAKDİR KOMİSYONU KARAR TUTANAĞI</h4>
  </div>

  <div style="font-size: 10pt; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
    <div><strong>Dosya No:</strong> {{dosya_no}}</div>
    <div><strong>Karar Tarihi:</strong> {{tarih}}</div>
    <div><strong>Taşınmaz:</strong> {{tasinmaz_adi}} (Ada: {{ada}}, Parsel: {{parsel}}, Yüzölçümü: {{yuzolcumu}} m²)</div>
  </div>

  <p>
    2886 Sayılı Devlet İhale Kanunu'nun 13. Maddesi uyarınca teşekkül eden Kıymet Takdir Komisyonumuz toplanarak, 
    mahallinde yapılan incelemeler, emsal alım-satım/kira rayiçleri ve piyasa şartları göz önüne alınarak muhammen bedel tespiti yapılmıştır.
  </p>

  <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; margin: 20px 0; border-radius: 6px;">
    <p style="margin: 0; font-size: 11pt;"><strong>Takdir Edilen Muhammen Bedel:</strong> <span style="color: #059669; font-weight: bold;">₺{{muhammen_bedel}}</span> ({{muhammen_bedel_yaziyla}})</p>
    <p style="margin: 8px 0 0 0; font-size: 10pt;"><strong>%3 Geçici Teminat Tutarı:</strong> ₺{{gecici_teminat}}</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-top: 40px; text-align: center; font-size: 10pt;">
    <tr>
      <td><strong>Komisyon Başkanı</strong><br/><br/>Müdür<br/>İmza</td>
      <td><strong>Üye (Teknik)</strong><br/><br/>Harita Mühendisi<br/>İmza</td>
      <td><strong>Üye (Mali)</strong><br/><br/>Mali Hizmetler Yetkilisi<br/>İmza</td>
    </tr>
  </table>
</div>
`
  },
  {
    kod: '2886-EVR-07',
    ad: 'Basın İlan & Resmi Gazete İhale İlan Metni',
    kategori: '3. Aşama: İlan & Duyuru',
    templateHtml: `
<div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h3 style="margin: 0; font-size: 13pt;">{{kurum_adi}} BAŞKANLIĞINDAN TAŞINMAZ {{islem_turu_adi}} İHALE İLANI</h3>
  </div>

  <p style="font-size: 10pt;">
    <strong>1.</strong> Mülkiyeti Belediyemize ait aşağıda tapu ve nitelikleri belirtilen taşınmaz, 
    2886 Sayılı Devlet İhale Kanunu'nun <strong>{{ihale_usulu}}</strong> maddesi uyarınca ihale ile 
    <strong>{{islem_turu_adi}}</strong> yapılacaktır.
  </p>

  <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 9.5pt;" border="1" cellpadding="6">
    <tr style="background-color: #f1f5f9; text-align: center;">
      <th>Sıra</th>
      <th>Mahalle / Mevkii</th>
      <th>Ada / Parsel</th>
      <th>Yüzölçümü (m²)</th>
      <th>Muhammen Bedel (₺)</th>
      <th>Geçici Teminat (%3)</th>
      <th>İhale Tarihi & Saati</th>
    </tr>
    <tr style="text-align: center;">
      <td>1</td>
      <td>{{mahalle_ilce}}</td>
      <td>{{ada_parsel}}</td>
      <td>{{yuzolcumu}}</td>
      <td>₺{{muhammen_bedel}}</td>
      <td>₺{{gecici_teminat}}</td>
      <td>{{ihale_tarihi}} {{ihale_saati}}</td>
    </tr>
  </table>

  <p style="font-size: 10pt;">
    <strong>2. Şartname Temini:</strong> İhale şartnamesi mesai saatleri içinde Emlak ve İstimlak Müdürlüğünde görülebilir veya bedelsiz incelenebilir.<br/>
    <strong>3. İhale Yeri:</strong> {{ihale_yeri}}<br/>
    İlgililere ilanen duyurulur.
  </p>
</div>
`
  },
  {
    kod: '2886-EVR-12',
    ad: 'Encümen İhale Kararı & Karar Tutanağı (İhale Komisyonu)',
    kategori: '4. Aşama: İhale Kararı',
    templateHtml: `
<div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h3 style="margin: 0; font-size: 13pt;">T.C. {{kurum_adi}}</h3>
    <h4 style="margin: 5px 0; font-size: 11pt;">BELEDİYE ENCÜMENİ İHALE KARARI</h4>
  </div>

  <div style="display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 15px;">
    <div><strong>Karar No:</strong> {{karar_no}}</div>
    <div><strong>Karar Tarihi:</strong> {{tarih}}</div>
  </div>

  <p style="font-size: 10pt;">
    Belediyemiz Encümeni <strong>{{ihale_tarihi}}</strong> tarihinde Belediye Başkanı başkanlığında toplanarak, 
    2886 Sayılı Kanunun <strong>{{ihale_usulu}}</strong> maddesi uyarınca ilanı yapılan 
    <strong>{{tasinmaz_adi}} (Ada: {{ada_parsel}})</strong> taşınmazın ihalesine geçilmiştir.
  </p>

  <p style="font-size: 10pt;">
    Yapılan açık artırma / teklif zarflarının açılması neticesinde en yüksek geçerli teklif 
    <strong>₺{{muhammen_bedel}}</strong> bedelle verilmiş olup ihale uhdesinde kalmıştır.
  </p>

  <table style="width: 100%; border-collapse: collapse; margin-top: 35px; text-align: center; font-size: 9.5pt;">
    <tr>
      <td><strong>Encümen Başkanı</strong><br/><br/>İmza</td>
      <td><strong>Üye</strong><br/><br/>İmza</td>
      <td><strong>Üye</strong><br/><br/>İmza</td>
      <td><strong>Mali Hizmetler Müd.</strong><br/><br/>İmza</td>
    </tr>
  </table>
</div>
`
  }
]

interface CustomField {
  id: string
  key: string
  label: string
  tip: 'metin' | 'sayi' | 'para' | 'tarih' | 'secim' | 'cok_satirli'
  deger: string
  secenekler?: string[]
}

interface FormDataType {
  ihaleKayitNo: string
  ihaleAdi: string
  islemTuru: string
  usul: string
  muhammenBedel: number
  ihaleTarihi: string
  ihaleSaati: string
  ihaleYeri: string
  kurumAdi: string
  sayiNo: string
  kararNo: string
  il: string
  ilce: string
  mahalleKoy: string
  ada: string
  parsel: string
  yuzolcumuM2: number
  cinsi: string
  adres: string
}

function getFormDataForDosya(d: Dosya2886Item | null, totalDosyalar = 0): FormDataType {
  const todayStr = new Date().toISOString().split('T')[0]
  if (d) {
    return {
      ihaleKayitNo: d.ihaleKayitNo || '',
      ihaleAdi: d.ihaleAdi || '',
      islemTuru: d.islemTuru || 'satis',
      usul: d.usul || 'acik_teklif_45',
      muhammenBedel:
        d.muhammenBedel?.takdirEdilenMuhammenBedel ||
        d.muhammenBedel?.hesaplananBedel ||
        2500000,
      ihaleTarihi: d.ihaleTarihi || todayStr,
      ihaleSaati: d.ihaleSaati || '14:00',
      ihaleYeri: d.ihaleYeri || 'Belediye Encümen Toplantı Salonu',
      kurumAdi: 'ÇANKAYA BELEDİYESİ',
      sayiNo: 'E-84729103-755',
      kararNo: '2026/89',
      il: d.tasinmaz?.il || 'Ankara',
      ilce: d.tasinmaz?.ilce || 'Çankaya',
      mahalleKoy: d.tasinmaz?.mahalleKoy || 'Merkez Mah.',
      ada: d.tasinmaz?.ada || '101',
      parsel: d.tasinmaz?.parsel || '1',
      yuzolcumuM2: d.tasinmaz?.yuzolcumuM2 || 500,
      cinsi: d.tasinmaz?.cinsi || 'Ticari İmarlı Arsa',
      adres: d.tasinmaz?.adres || ''
    }
  }
  return {
    ihaleKayitNo: `2026/2886-ST-0${totalDosyalar + 1}`,
    ihaleAdi: 'Yeni 2886 Taşınmaz İhalesi',
    islemTuru: 'satis',
    usul: 'acik_teklif_45',
    muhammenBedel: 3000000,
    ihaleTarihi: todayStr,
    ihaleSaati: '14:00',
    ihaleYeri: 'Belediye Encümen Toplantı Salonu',
    kurumAdi: 'ÇANKAYA BELEDİYESİ',
    sayiNo: 'E-991823-01',
    kararNo: '2026/102',
    il: 'Ankara',
    ilce: 'Çankaya',
    mahalleKoy: 'Merkez Mah.',
    ada: '105',
    parsel: '4',
    yuzolcumuM2: 750,
    cinsi: 'Ticari İmarlı Arsa',
    adres: ''
  }
}

function getCustomFieldsForDosya(d: Dosya2886Item | null): CustomField[] {
  if (d?.ozelAlanlar && d.ozelAlanlar.length > 0) {
    return d.ozelAlanlar
  }
  return [
    {
      id: 'cf-1',
      key: 'imar_durumu',
      label: 'İmar Durumu & Emsal',
      tip: 'metin',
      deger: 'Emsal: 1.50, Hmax: Serbest, Ticaret + Konut Alanı'
    },
    {
      id: 'cf-2',
      key: 'ozel_sartlar',
      label: 'Özel Şartlar & Notlar',
      tip: 'cok_satirli',
      deger: 'İhale bedeli 15 gün içerisinde defaten ödenecektir. Tapu harç ve masrafları alıcıya aittir.'
    }
  ]
}

function getEditorContentForDosya(d: Dosya2886Item | null): string {
  if (d?.belgeIcerikHtml) {
    return d.belgeIcerikHtml
  }
  const found = STANDARD_2886_TEMPLATES.find((t) => t.kod === (d?.aktifSablonKodu || '2886-EVR-01'))
  return found ? found.templateHtml : STANDARD_2886_TEMPLATES[0].templateHtml
}

interface BelgeVeSablonStudyoTabProps {
  initialDosyaId?: string
}

export function BelgeVeSablonStudyoTab({
  initialDosyaId
}: BelgeVeSablonStudyoTabProps): React.JSX.Element {
  const [dosyalar, setDosyalar] = useState<Dosya2886Item[]>(() => getInitial2886Dosyalar())
  const [selectedDosyaId, setSelectedDosyaId] = useState<string>(() => {
    if (initialDosyaId) return initialDosyaId
    try {
      const activeRaw = localStorage.getItem('temin_2886_active_dosya')
      if (activeRaw) {
        const item = JSON.parse(activeRaw)
        return item.id || ''
      }
    } catch {
      // ignore
    }
    const initial = getInitial2886Dosyalar()
    return initial[0]?.id || 'new'
  })

  // Gerçek zamanlı senkronizasyon
  useEffect(() => {
    const handleReload = (): void => {
      setDosyalar(getInitial2886Dosyalar())
    }
    window.addEventListener('devlet-ihale-2886-reloaded', handleReload)
    window.addEventListener('storage', handleReload)
    return () => {
      window.removeEventListener('devlet-ihale-2886-reloaded', handleReload)
      window.removeEventListener('storage', handleReload)
    }
  }, [])

  const currentDosya = useMemo(() => {
    return dosyalar.find((d) => d.id === selectedDosyaId) || null
  }, [dosyalar, selectedDosyaId])

  // Form Değerleri
  const [formData, setFormData] = useState<FormDataType>(() => {
    const initialList = getInitial2886Dosyalar()
    const target = initialDosyaId ? initialList.find((d) => d.id === initialDosyaId) : initialList[0]
    return getFormDataForDosya(target || null, initialList.length)
  })

  // Özel Dinamik Form Builder Alanları
  const [customFields, setCustomFields] = useState<CustomField[]>(() => {
    const initialList = getInitial2886Dosyalar()
    const target = initialDosyaId ? initialList.find((d) => d.id === initialDosyaId) : initialList[0]
    return getCustomFieldsForDosya(target || null)
  })

  // Yeni Alan Ekleme Popover / Modal state
  const [newFieldKey, setNewFieldKey] = useState('')
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldTip, setNewFieldTip] = useState<
    'metin' | 'sayi' | 'para' | 'tarih' | 'secim' | 'cok_satirli'
  >('metin')
  const [newFieldVal, setNewFieldVal] = useState('')
  const [showAddField, setShowAddField] = useState(false)

  // Aktif Şablon ve TipTap HTML İçeriği
  const [selectedTemplateKod, setSelectedTemplateKod] = useState<string>('2886-EVR-01')
  const [editorContent, setEditorContent] = useState<string>(() => {
    const initialList = getInitial2886Dosyalar()
    const target = initialDosyaId ? initialList.find((d) => d.id === initialDosyaId) : initialList[0]
    return getEditorContentForDosya(target || null)
  })
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  // Sol Panel Sekmesi
  const [leftTab, setLeftTab] = useState<'form' | 'builder' | 'vars' | 'revisions'>('form')

  const handleSelectDosyaId = (dosyaId: string): void => {
    setSelectedDosyaId(dosyaId)
    const target = dosyalar.find((d) => d.id === dosyaId) || null
    setFormData(getFormDataForDosya(target, dosyalar.length))
    setCustomFields(getCustomFieldsForDosya(target))
    setEditorContent(getEditorContentForDosya(target))
    if (target?.aktifSablonKodu) {
      setSelectedTemplateKod(target.aktifSablonKodu)
    }
  }

  // Şablon Değiştirildiğinde
  const handleSelectTemplate = (kod: string): void => {
    setSelectedTemplateKod(kod)
    const t = STANDARD_2886_TEMPLATES.find((item) => item.kod === kod)
    if (t) {
      setEditorContent(t.templateHtml)
    }
  }

  // Değişken Değerleri Nesnesi (Interpolation Context)
  const templateContext = useMemo(() => {
    const bedelNum = Number(formData.muhammenBedel) || 0
    const geciciTeminatNum = Math.round(bedelNum * 0.03)

    const islemTuruLabels: Record<string, string> = {
      satis: 'Taşınmaz Satışı (Mülkiyet Devri)',
      kiralama: 'Taşınmaz Kiralaması',
      irtifak_hakki: 'Sınırlı Ayni Hak / İrtifak',
      trampa: 'Trampa (Mülkiyet Takası)'
    }

    const usulLabels: Record<string, string> = {
      acik_teklif_45: 'Madde 45 (Açık Teklif Usulü)',
      kapali_teklif_36: 'Madde 36 (Kapalı Teklif Usulü)',
      pazarlik_51: 'Madde 51 (Pazarlık Usulü)'
    }

    const baseCtx: Record<string, string | number> = {
      kurum_adi: formData.kurumAdi || 'İDARE BAŞKANLIĞI',
      dosya_no: formData.ihaleKayitNo,
      sayi_no: formData.sayiNo,
      karar_no: formData.kararNo,
      tarih: new Date().toLocaleDateString('tr-TR'),
      ihale_tarihi: formData.ihaleTarihi,
      ihale_saati: formData.ihaleSaati,
      ihale_yeri: formData.ihaleYeri,
      tasinmaz_adi: formData.ihaleAdi,
      islem_turu_adi: islemTuruLabels[formData.islemTuru] || formData.islemTuru,
      ihale_usulu: usulLabels[formData.usul] || formData.usul,
      ada: formData.ada,
      parsel: formData.parsel,
      ada_parsel: `${formData.ada} / ${formData.parsel}`,
      mahalle_ilce: `${formData.mahalleKoy} / ${formData.ilce} / ${formData.il}`,
      yuzolcumu: formData.yuzolcumuM2,
      tasinmaz_cinsi: formData.cinsi,
      muhammen_bedel: bedelNum.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      muhammen_bedel_yaziyla: sayiyiYaziyaCevir(bedelNum),
      gecici_teminat: geciciTeminatNum.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      gecici_teminat_yaziyla: sayiyiYaziyaCevir(geciciTeminatNum)
    }

    // Custom fields ekle
    customFields.forEach((cf) => {
      baseCtx[cf.key] = cf.deger
    })

    return baseCtx
  }, [formData, customFields])

  // Canlı Değişkenleri Belgeye Enjekte Et
  const handleInjectPlaceholders = (): void => {
    try {
      const rendered = Mustache.render(editorContent, templateContext)
      setEditorContent(rendered)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch {
      // ignore
    }
  }

  // Yeni Alan Ekleme
  const handleAddCustomField = (): void => {
    if (!newFieldLabel.trim()) return
    const key =
      newFieldKey.trim() ||
      newFieldLabel
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')

    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      key,
      label: newFieldLabel.trim(),
      tip: newFieldTip,
      deger: newFieldVal
    }

    setCustomFields([...customFields, newField])
    setNewFieldKey('')
    setNewFieldLabel('')
    setNewFieldVal('')
    setShowAddField(false)
  }

  // Özel Alan Silme
  const handleDeleteCustomField = (id: string): void => {
    setCustomFields(customFields.filter((cf) => cf.id !== id))
  }

  // Özel Alan Değerini Güncelleme
  const handleCustomFieldChange = (id: string, value: string): void => {
    setCustomFields(
      customFields.map((cf) => (cf.id === id ? { ...cf, deger: value } : cf))
    )
  }

  // Sürüm Kaydetme (Snapshot)
  const handleSaveRevision = (): void => {
    if (!currentDosya) return
    const currentRevisions = currentDosya.surumler || []
    const now = new Date()
    const timestamp = now.getTime()
    const newRev = {
      id: timestamp,
      baslik: `Sürüm ${currentRevisions.length + 1} (${now.toLocaleTimeString('tr-TR')})`,
      tarih: now.toLocaleString('tr-TR'),
      html: editorContent
    }
    const updatedDosya: Dosya2886Item = {
      ...currentDosya,
      surumler: [newRev, ...currentRevisions]
    }
    saveDosyaToStorage(updatedDosya)
  }

  // Tüm Değişiklikleri Dosyaya Kaydet
  const handleSaveDosya = (): void => {
    const bedel = Number(formData.muhammenBedel) || 0
    const geciciTeminat = Math.round(bedel * 0.03)
    const now = new Date()
    const autoId = `2886-${now.getTime()}`

    const dosyaToSave: Dosya2886Item = {
      id: currentDosya ? currentDosya.id : autoId,
      ihaleKayitNo: formData.ihaleKayitNo,
      ihaleAdi: formData.ihaleAdi,
      islemTuru: formData.islemTuru,
      usul: formData.usul,
      ihaleTarihi: formData.ihaleTarihi,
      ihaleSaati: formData.ihaleSaati,
      ihaleYeri: formData.ihaleYeri,
      tasinmaz: {
        il: formData.il,
        ilce: formData.ilce,
        mahalleKoy: formData.mahalleKoy,
        ada: formData.ada,
        parsel: formData.parsel,
        yuzolcumuM2: Number(formData.yuzolcumuM2) || 0,
        cinsi: formData.cinsi,
        hisseOrani: '1/1',
        mevcutDurumu: 'Boş',
        adres: formData.adres
      },
      muhammenBedel: {
        hesaplananBedel: bedel,
        takdirEdilenMuhammenBedel: bedel,
        geciciTeminatTutari: geciciTeminat,
        kdvOrani: 20
      },
      belgeIcerikHtml: editorContent,
      aktifSablonKodu: selectedTemplateKod,
      ozelAlanlar: customFields,
      surumler: currentDosya?.surumler || []
    }

    saveDosyaToStorage(dosyaToSave)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const saveDosyaToStorage = (savedItem: Dosya2886Item): void => {
    const exists = dosyalar.some((d) => d.id === savedItem.id)
    let updatedList: Dosya2886Item[]
    if (exists) {
      updatedList = dosyalar.map((d) => (d.id === savedItem.id ? savedItem : d))
    } else {
      updatedList = [savedItem, ...dosyalar]
      setSelectedDosyaId(savedItem.id)
    }
    setDosyalar(updatedList)
    persist2886Dosyalar(updatedList)
    persist2886ActiveDosya(savedItem)
  }

  // Word (.doc) Dışa Aktarma
  const handleExportWord = (): void => {
    const fileTitle = formData.ihaleAdi || '2886-Ihale-Belgesi'
    const cleanTitle = fileTitle.replace(/[^a-zA-Z0-9_-]/g, '_')
    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${formData.ihaleAdi}</title>
        <style>
          @page { size: A4 portrait; margin: 2cm; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; color: #000; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #999; padding: 6px 8px; font-size: 10.5pt; }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        ${editorContent}
      </body>
      </html>
    `
    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cleanTitle}_2886.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Yazdırma (Print)
  const handlePrint = (): void => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${formData.ihaleAdi} - 2886 Belge</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: Arial, sans-serif; color: #1e293b; padding: 10px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #cbd5e1; padding: 8px; }
            </style>
          </head>
          <body>
            ${editorContent}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  // Değişken Kopyalama
  const handleCopyVar = (key: string): void => {
    const tag = `{{${key}}}`
    navigator.clipboard.writeText(tag)
    setCopiedVar(key)
    setTimeout(() => setCopiedVar(null), 1800)
  }

  return (
    <div className="w-full space-y-4">
      {/* 1. ÜST KONTROL BAR / TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Dosya & Şablon Seçici */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Dinamik Belge & Form Builder Stüdyosu</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 font-mono">
                  TipTap + Mustache
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Form alanları ile belge şablonunu dinamik yer tutucularla eşleştirin ve yönetin.
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* Aktif Dosya Seçimi */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              İhale Dosyası:
            </span>
            <select
              value={selectedDosyaId}
              onChange={(e) => handleSelectDosyaId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer max-w-60"
            >
              <option value="new">+ Yeni 2886 Dosyası Başlat</option>
              {dosyalar.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ihaleKayitNo} — {d.ihaleAdi.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          {/* Şablon Seçimi */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Hazır Şablon:
            </span>
            <select
              value={selectedTemplateKod}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-200 cursor-pointer max-w-65"
            >
              {STANDARD_2886_TEMPLATES.map((t) => (
                <option key={t.kod} value={t.kod}>
                  {t.ad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Eylem Butonları */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleInjectPlaceholders}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Formdaki tüm değerleri {{yer_tutucular}} yerine metne dönüştürür"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Değerleri Belgeye Aktar</span>
          </button>

          <button
            type="button"
            onClick={handleExportWord}
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Word (.doc)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır</span>
          </button>

          <button
            type="button"
            onClick={handleSaveRevision}
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Şimdiki belge halini geri dönülebilir sürüm olarak kaydeder"
          >
            <History className="w-3.5 h-3.5" />
            <span>Sürüm Al</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDosya}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Kaydedildi!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Dosyayı Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. ANA ÇALIŞMA ALANI: SOL PANEL (FORM BUILDER) & SAĞ PANEL (A4 TIPTAP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SOL PANEL (5 Kolon) - FORM BUILDER & DEĞİŞKENLER */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-205 overflow-hidden">
          {/* Sol Panel Sekme Başlıkları */}
          <div className="shrink-0 flex items-center border-b border-slate-200 dark:border-slate-800 p-2 bg-slate-50/70 dark:bg-slate-850/50 gap-1 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setLeftTab('form')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                leftTab === 'form'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Form Verileri</span>
            </button>

            <button
              type="button"
              onClick={() => setLeftTab('builder')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                leftTab === 'builder'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Form Builder ({customFields.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setLeftTab('vars')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                leftTab === 'vars'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Yer Tutucular</span>
            </button>

            <button
              type="button"
              onClick={() => setLeftTab('revisions')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                leftTab === 'revisions'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Sürümler ({currentDosya?.surumler?.length || 0})</span>
            </button>
          </div>

          {/* Sol Panel İçeriği (Kaydırılabilir) */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
            {/* SEKME 1: TEMEL FORM VERİLERİ */}
            {leftTab === 'form' && (
              <div className="space-y-4">
                {/* 1. Genel İhale Tanımı */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <span>İhale & Dosya Bilgileri</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Kayıt No
                      </label>
                      <input
                        type="text"
                        value={formData.ihaleKayitNo}
                        onChange={(e) => setFormData({ ...formData, ihaleKayitNo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        İşlem Türü
                      </label>
                      <select
                        value={formData.islemTuru}
                        onChange={(e) => setFormData({ ...formData, islemTuru: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      >
                        <option value="satis">🏷️ Mülkiyet Satışı</option>
                        <option value="kiralama">🏢 Taşınmaz Kiralama</option>
                        <option value="irtifak_hakki">📜 Sınırlı Ayni Hak / İrtifak</option>
                        <option value="trampa">🔄 Trampa (Takas)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      İhale Konusu / Taşınmaz Adı
                    </label>
                    <input
                      type="text"
                      value={formData.ihaleAdi}
                      onChange={(e) => setFormData({ ...formData, ihaleAdi: e.target.value })}
                      placeholder="Örn: 104 Ada 12 Parsel Taşınmaz Satışı"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        İhale Usulü
                      </label>
                      <select
                        value={formData.usul}
                        onChange={(e) => setFormData({ ...formData, usul: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      >
                        <option value="acik_teklif_45">Madde 45 (Açık Teklif)</option>
                        <option value="kapali_teklif_36">Madde 36 (Kapalı Teklif)</option>
                        <option value="pazarlik_51">Madde 51 (Pazarlık)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        İhale Yeri
                      </label>
                      <input
                        type="text"
                        value={formData.ihaleYeri}
                        onChange={(e) => setFormData({ ...formData, ihaleYeri: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        İhale Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.ihaleTarihi}
                        onChange={(e) => setFormData({ ...formData, ihaleTarihi: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        İhale Saati
                      </label>
                      <input
                        type="time"
                        value={formData.ihaleSaati}
                        onChange={(e) => setFormData({ ...formData, ihaleSaati: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Tapu ve Taşınmaz Detayları */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>Tapu & Taşınmaz Bilgileri</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        İl / İlçe
                      </label>
                      <input
                        type="text"
                        value={`${formData.il} / ${formData.ilce}`}
                        onChange={(e) => {
                          const parts = e.target.value.split('/')
                          setFormData({
                            ...formData,
                            il: parts[0]?.trim() || '',
                            ilce: parts[1]?.trim() || ''
                          })
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Ada / Parsel
                      </label>
                      <input
                        type="text"
                        value={`${formData.ada} / ${formData.parsel}`}
                        onChange={(e) => {
                          const parts = e.target.value.split('/')
                          setFormData({
                            ...formData,
                            ada: parts[0]?.trim() || '',
                            parsel: parts[1]?.trim() || ''
                          })
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Yüzölçümü (m²)
                      </label>
                      <input
                        type="number"
                        value={formData.yuzolcumuM2 || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, yuzolcumuM2: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Taşınmaz Cinsi / Vasfı
                    </label>
                    <input
                      type="text"
                      value={formData.cinsi}
                      onChange={(e) => setFormData({ ...formData, cinsi: e.target.value })}
                      placeholder="Örn: Arsa, Kargir Bina, Dükkan"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* 3. Muhammen Bedel ve Teminat */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    <span>Muhammen Bedel & Teminat</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Muhammen Bedel (₺)
                      </label>
                      <input
                        type="number"
                        value={formData.muhammenBedel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            muhammenBedel: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        %3 Geçici Teminat (₺)
                      </label>
                      <div className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                        ₺{Math.round((Number(formData.muhammenBedel) || 0) * 0.03).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Kullanıcının Eklediği Özel Alanlar Girişi */}
                {customFields.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 border-b border-purple-100 dark:border-purple-950 pb-1.5">
                      <Sliders className="w-4 h-4" />
                      <span>Özel Form Alanları (Builder)</span>
                    </div>

                    {customFields.map((cf) => (
                      <div key={cf.id} className="text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {cf.label}
                          </label>
                          <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                            {`{{${cf.key}}}`}
                          </span>
                        </div>
                        {cf.tip === 'cok_satirli' ? (
                          <textarea
                            rows={2}
                            value={cf.deger}
                            onChange={(e) => handleCustomFieldChange(cf.id, e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                          />
                        ) : (
                          <input
                            type={cf.tip === 'sayi' || cf.tip === 'para' ? 'number' : 'text'}
                            value={cf.deger}
                            onChange={(e) => handleCustomFieldChange(cf.id, e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SEKME 2: DİNAMİK FORM BUILDER (ALAN TANIMLAMA) */}
            {leftTab === 'builder' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Özel Form Alanları Tasarımı
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      İhale belgenize özel yeni dinamik alanlar ve yer tutucular tanımlayın.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddField(!showAddField)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Alan Ekle</span>
                  </button>
                </div>

                {/* Yeni Alan Ekleme Formu */}
                {showAddField && (
                  <div className="bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl p-3.5 space-y-3">
                    <div className="text-xs font-bold text-purple-900 dark:text-purple-200">
                      Yeni Form Alanı Oluştur
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          Alan Başlığı (Label)
                        </label>
                        <input
                          type="text"
                          placeholder="Örn: İmar Durumu"
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          Değişken Kodu (Key)
                        </label>
                        <input
                          type="text"
                          placeholder="Örn: imar_durumu"
                          value={newFieldKey}
                          onChange={(e) => setNewFieldKey(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          Alan Tipi
                        </label>
                        <select
                          value={newFieldTip}
                          onChange={(e) =>
                            setNewFieldTip(
                              e.target.value as
                                | 'metin'
                                | 'sayi'
                                | 'para'
                                | 'tarih'
                                | 'secim'
                                | 'cok_satirli'
                            )
                          }
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        >
                          <option value="metin">📝 Tek Satır Metin</option>
                          <option value="cok_satirli">📄 Çok Satırlı Paragraf</option>
                          <option value="sayi">🔢 Sayısal Değer</option>
                          <option value="para">💰 Para (₺ Tutar)</option>
                          <option value="tarih">📅 Tarih</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          Varsayılan Değer
                        </label>
                        <input
                          type="text"
                          placeholder="Varsayılan değer..."
                          value={newFieldVal}
                          onChange={(e) => setNewFieldVal(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddField(false)}
                        className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs"
                      >
                        İptal
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold"
                      >
                        Alanı Ekle
                      </button>
                    </div>
                  </div>
                )}

                {/* Tanımlı Özel Alanlar Listesi */}
                <div className="space-y-2">
                  {customFields.map((cf) => (
                    <div
                      key={cf.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {cf.label}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono">
                            {`{{${cf.key}}}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-70 mt-0.5">
                          Tip: {cf.tip} • Değer: {cf.deger || '(Boş)'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyVar(cf.key)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 transition-colors"
                          title="Yer tutucu kodunu kopyala"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomField(cf.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Alanı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {customFields.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Henüz özel alan tanımlanmadı. &quot;Yeni Alan Ekle&quot; butonu ile ekleyebilirsiniz.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEKME 3: KULLANILABİLİR YER TUTUCULAR LİSTESİ */}
            {leftTab === 'vars' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 leading-relaxed">
                  Aşağıdaki rozetlere tıklayarak değişken etiketini kopyalayabilir ve şablon metninizin istediğiniz yerine yapıştırabilirsiniz:
                </div>

                <div className="space-y-2">
                  {Object.entries(templateContext).map(([key, val]) => (
                    <div
                      key={key}
                      onClick={() => handleCopyVar(key)}
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-700 bg-slate-50/60 dark:bg-slate-850/60 transition-all cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                            {`{{${key}}}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          Değer: <span className="font-semibold text-slate-700 dark:text-slate-300">{String(val)}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-slate-400 group-hover:text-purple-600">
                        {copiedVar === key ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEKME 4: SÜRÜMLER & GEÇMİŞ */}
            {leftTab === 'revisions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kayıtlı Belge Sürümleri
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveRevision}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Yeni Sürüm Al</span>
                  </button>
                </div>

                {currentDosya?.surumler && currentDosya.surumler.length > 0 ? (
                  <div className="space-y-2">
                    {currentDosya.surumler.map((rev) => (
                      <div
                        key={rev.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {rev.baslik}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {rev.tarih}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditorContent(rev.html)
                            setSavedSuccess(true)
                            setTimeout(() => setSavedSuccess(false), 2000)
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Geri Yükle</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Henüz kayıtlı bir sürüm bulunmuyor. &quot;Yeni Sürüm Al&quot; ile belge anlık halini dondurabilirsiniz.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SAĞ PANEL (7 Kolon) - A4 TIPTAP RESMİ BELGE EDİTÖRÜ */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-205 overflow-hidden">
          {/* Editör Üst Barı */}
          <div className="shrink-0 p-3 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                A4 Resmi İhale Belgesi Editörü
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                (TipTap Standart Sayfa Düzeni)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const t = STANDARD_2886_TEMPLATES.find((item) => item.kod === selectedTemplateKod)
                  if (t) setEditorContent(t.templateHtml)
                }}
                className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                title="Şablonu orijinal haline sıfırla"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[11px]">Şablonu Sıfırla</span>
              </button>
            </div>
          </div>

          {/* A4 Editör Konteynırı */}
          <div className="flex-1 p-4 bg-slate-100/60 dark:bg-slate-950/60 overflow-y-auto custom-scrollbar flex justify-center">
            <div className="w-full max-w-3xl bg-white text-slate-900 shadow-xl rounded-lg p-6 min-h-175 border border-slate-200">
              <A4Editor content={editorContent} onChange={(html) => setEditorContent(html)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
