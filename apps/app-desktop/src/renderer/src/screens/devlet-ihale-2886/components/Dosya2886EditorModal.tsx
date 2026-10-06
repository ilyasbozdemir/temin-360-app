import React, { useState, useMemo, useEffect } from 'react'
import {
  FolderPlus,
  FileText,
  Save,
  Download,
  History,
  Sparkles,
  Layers,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Printer
} from 'lucide-react'
import Mustache from 'mustache'
import { Dosya2886Item } from '../../../components/layout/temin-selector/teminSelector.types'
import { A4Editor } from '../../../components/editor/A4Editor'
import { sayiyiYaziyaCevir } from '../../../constants/sayiEslesmeleri'

interface Dosya2886EditorModalProps {
  isOpen: boolean
  editingDosya: Dosya2886Item | null
  onClose: () => void
  onSave: (savedDosya: Dosya2886Item) => void
  totalCount: number
}

// Hazır 2886 Standart Şablonları
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
    kod: '2886-EVR-06',
    ad: '2886 İdari Şartname ve Tip Sözleşme Taslağı',
    kategori: '3. Aşama: Şartname ve İlan',
    templateHtml: `
<div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 25px;">
    <h3 style="margin: 0; font-size: 14pt;">T.C. {{kurum_adi}}</h3>
    <h4 style="margin: 5px 0; font-size: 12pt;">2886 SAYILI DEVLET İHALE KANUNU KAPSAMINDA TAŞINMAZ {{islem_turu_adi}} İDARİ ŞARTNAMESİ</h4>
  </div>

  <p><strong>Madde 1 - İdarenin Bilgileri:</strong></p>
  <p>İdare Adı: {{kurum_adi}}, İhale Yeri: {{ihale_yeri}}</p>

  <p><strong>Madde 2 - İhale Konusu ve Usulü:</strong></p>
  <p>
    {{dosya_no}} kayıt numaralı dosya kapsamında {{tasinmaz_adi}} işi, 
    <strong>2886 Sayılı Devlet İhale Kanunu'nun {{ihale_usulu}}</strong> maddesine göre ihale edilecektir.
  </p>

  <p><strong>Madde 3 - Muhammen Bedel ve Geçici Teminat:</strong></p>
  <p>
    İşin tahmini muhammen bedeli <strong>₺{{muhammen_bedel}}</strong> olup, %3 geçici teminat tutarı <strong>₺{{gecici_teminat}}</strong>'dir.
  </p>

  <p><strong>Madde 4 - İhale Tarihi ve Saati:</strong></p>
  <p>
    İhale <strong>{{ihale_tarihi}} günü saat {{ihale_saati}}</strong>'de yapılacaktır.
  </p>
</div>
`
  }
]

export function Dosya2886EditorModal({
  isOpen,
  editingDosya,
  onClose,
  onSave,
  totalCount
}: Dosya2886EditorModalProps): React.JSX.Element | null {
  // Form State
  const [formData, setFormData] = useState({
    ihaleKayitNo: '',
    ihaleAdi: '',
    islemTuru: 'satis',
    usul: 'acik_teklif_45',
    muhammenBedel: 2500000,
    ihaleTarihi: new Date().toISOString().split('T')[0],
    ihaleSaati: '14:00',
    ihaleYeri: 'Belediye Encümen Toplantı Salonu',
    il: 'Ankara',
    ilce: 'Çankaya',
    mahalleKoy: 'Merkez Mah.',
    ada: '104',
    parsel: '12',
    yuzolcumuM2: 1250,
    cinsi: 'Arsa',
    adres: ''
  })

  const [selectedTemplateKod, setSelectedTemplateKod] = useState<string>('2886-EVR-01')
  const [editorHtml, setEditorHtml] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

  // Sürüm Yönetimi (Revisions)
  const [revisions, setRevisions] = useState<{ id: number; baslik: string; tarih: string; html: string }[]>([])
  const [selectedRevisionId, setSelectedRevisionId] = useState<number | null>(null)
  const [savedNotification, setSavedNotification] = useState<string | null>(null)

  // İlk Yükleme
  useEffect(() => {
    if (editingDosya) {
      setFormData({
        ihaleKayitNo: editingDosya.ihaleKayitNo || '',
        ihaleAdi: editingDosya.ihaleAdi || '',
        islemTuru: editingDosya.islemTuru || 'satis',
        usul: editingDosya.usul || 'acik_teklif_45',
        muhammenBedel:
          editingDosya.muhammenBedel?.takdirEdilenMuhammenBedel ||
          editingDosya.muhammenBedel?.hesaplananBedel ||
          2500000,
        ihaleTarihi: editingDosya.ihaleTarihi || new Date().toISOString().split('T')[0],
        ihaleSaati: editingDosya.ihaleSaati || '14:00',
        ihaleYeri: editingDosya.ihaleYeri || 'Belediye Encümen Toplantı Salonu',
        il: editingDosya.tasinmaz?.il || 'Ankara',
        ilce: editingDosya.tasinmaz?.ilce || 'Çankaya',
        mahalleKoy: editingDosya.tasinmaz?.mahalleKoy || 'Merkez Mah.',
        ada: editingDosya.tasinmaz?.ada || '104',
        parsel: editingDosya.tasinmaz?.parsel || '12',
        yuzolcumuM2: editingDosya.tasinmaz?.yuzolcumuM2 || 1250,
        cinsi: editingDosya.tasinmaz?.cinsi || 'Arsa',
        adres: editingDosya.tasinmaz?.adres || ''
      })

      const initialHtml =
        editingDosya.belgeIcerikHtml ||
        STANDARD_2886_TEMPLATES[0].templateHtml
      setEditorHtml(initialHtml)
      setSelectedTemplateKod(editingDosya.aktifSablonKodu || '2886-EVR-01')

      if (editingDosya.surumler && editingDosya.surumler.length > 0) {
        setRevisions(editingDosya.surumler)
        setSelectedRevisionId(editingDosya.surumler[editingDosya.surumler.length - 1].id)
      } else {
        const initialRev = {
          id: 1,
          baslik: 'Sürüm 1 (Orijinal Başlangıç)',
          tarih: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          html: initialHtml
        }
        setRevisions([initialRev])
        setSelectedRevisionId(1)
      }
    } else {
      // Yeni Dosya
      const defaultNo = `2026/2886-ST-0${totalCount + 1}`
      setFormData({
        ihaleKayitNo: defaultNo,
        ihaleAdi: 'Merkez Mah. 104 Ada 12 Parsel Taşınmaz Satışı İhalesi',
        islemTuru: 'satis',
        usul: 'acik_teklif_45',
        muhammenBedel: 3500000,
        ihaleTarihi: new Date().toISOString().split('T')[0],
        ihaleSaati: '14:00',
        ihaleYeri: 'Belediye Encümen Toplantı Salonu',
        il: 'Ankara',
        ilce: 'Çankaya',
        mahalleKoy: 'Merkez Mah.',
        ada: '104',
        parsel: '12',
        yuzolcumuM2: 1250,
        cinsi: 'Ticari İmarlı Arsa',
        adres: ''
      })
      const tpl = STANDARD_2886_TEMPLATES[0].templateHtml
      setEditorHtml(tpl)
      setSelectedTemplateKod('2886-EVR-01')
      const initialRev = {
        id: 1,
        baslik: 'Sürüm 1 (İlk Taslak)',
        tarih: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        html: tpl
      }
      setRevisions([initialRev])
      setSelectedRevisionId(1)
    }
  }, [editingDosya, totalCount, isOpen])

  // Dinamik Değişken Haritası
  const dynamicVariables = useMemo(() => {
    const bedel = Number(formData.muhammenBedel) || 0
    const geciciTeminat = Math.round(bedel * 0.03)
    const yaziyla = sayiyiYaziyaCevir(bedel)

    return {
      kurum_adi: 'ÖRNEK BELEDİYE BAŞKANLIĞI',
      dosya_no: formData.ihaleKayitNo || '2026/2886-ST-01',
      sayi_no: `E-2886/${formData.ihaleKayitNo.replace(/[^0-9]/g, '') || '101'}`,
      tarih: new Date().toLocaleDateString('tr-TR'),
      tasinmaz_adi: formData.ihaleAdi || 'Taşınmaz İhalesi',
      islem_turu_adi:
        formData.islemTuru === 'satis'
          ? 'Mülkiyet Satışı'
          : formData.islemTuru === 'kiralama'
            ? 'Taşınmaz Kiralama'
            : formData.islemTuru === 'irtifak_hakki'
              ? 'Sınırlı Ayni Hak / İrtifak'
              : 'Trampa (Takas)',
      ihale_usulu:
        formData.usul === 'acik_teklif_45'
          ? '45. Maddesi (Açık Teklif Usulü)'
          : formData.usul === 'kapali_teklif_35'
            ? '35/a Maddesi (Kapalı Teklif Usulü)'
            : '51/g Maddesi (Pazarlık Usulü)',
      ada_parsel: `${formData.ada} Ada / ${formData.parsel} Parsel`,
      ada: formData.ada,
      parsel: formData.parsel,
      mahalle_ilce: `${formData.mahalleKoy}, ${formData.ilce}/${formData.il}`,
      yuzolcumu: formData.yuzolcumuM2?.toLocaleString('tr-TR') || '0',
      tasinmaz_cinsi: formData.cinsi || 'Arsa',
      muhammen_bedel: bedel.toLocaleString('tr-TR'),
      muhammen_bedel_yaziyla: yaziyla ? `${yaziyla} Türk Lirası` : '',
      gecici_teminat: geciciTeminat.toLocaleString('tr-TR'),
      ihale_tarihi: formData.ihaleTarihi,
      ihale_saati: formData.ihaleSaati,
      ihale_yeri: formData.ihaleYeri
    }
  }, [formData])

  // Şablon Değiştirme
  const handleSelectTemplate = (kod: string): void => {
    setSelectedTemplateKod(kod)
    const tplObj = STANDARD_2886_TEMPLATES.find((t) => t.kod === kod)
    if (tplObj) {
      setEditorHtml(tplObj.templateHtml)
    }
  }

  // Değişkenleri Şablona Canlı Enjekte Et
  const handleInjectVariables = (): void => {
    const tplObj = STANDARD_2886_TEMPLATES.find((t) => t.kod === selectedTemplateKod)
    const baseHtml = tplObj ? tplObj.templateHtml : editorHtml
    try {
      const rendered = Mustache.render(baseHtml, dynamicVariables)
      setEditorHtml(rendered)
      showNotification('✅ Değişkenler şablon metnine başarıyla işlendi!')
    } catch (err) {
      console.error('Template render error:', err)
    }
  }

  // Yeni Sürüm Kaydet (Snapshot)
  const handleSaveRevision = (): void => {
    const newId = revisions.length + 1
    const newRev = {
      id: newId,
      baslik: `Sürüm ${newId} (${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})`,
      tarih: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      html: editorHtml
    }
    const updated = [...revisions, newRev]
    setRevisions(updated)
    setSelectedRevisionId(newId)
    showNotification(`💾 Sürüm ${newId} kaydedildi!`)
  }

  // Sürüme Geri Dön
  const handleRestoreRevision = (revId: number): void => {
    const found = revisions.find((r) => r.id === revId)
    if (found) {
      setSelectedRevisionId(revId)
      setEditorHtml(found.html)
      showNotification(`↩️ ${found.baslik} geri yüklendi!`)
    }
  }

  const showNotification = (msg: string): void => {
    setSavedNotification(msg)
    setTimeout(() => setSavedNotification(null), 3000)
  }

  // Word (DOCX / HTML) Olarak İndir
  const handleExportDocx = (): void => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${formData.ihaleKayitNo}</title></head><body>`
    const footer = '</body></html>'
    const sourceHtml = header + editorHtml + footer

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHtml)
    const fileDownload = document.createElement('a')
    document.body.appendChild(fileDownload)
    fileDownload.href = source
    fileDownload.download = `${formData.ihaleKayitNo || '2886-Ihale-Evrak'}.doc`
    fileDownload.click()
    document.body.removeChild(fileDownload)
  }

  // Ana Kaydetme
  const handleFormSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!formData.ihaleAdi.trim()) return

    const bedel = Number(formData.muhammenBedel) || 0
    const geciciTeminat = Math.round(bedel * 0.03)

    const resultDosya: Dosya2886Item = {
      id: editingDosya ? editingDosya.id : `2886-${Date.now()}`,
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
        hisseOrani: editingDosya?.tasinmaz?.hisseOrani || '1/1',
        mevcutDurumu: editingDosya?.tasinmaz?.mevcutDurumu || 'Boş',
        adres: formData.adres
      },
      muhammenBedel: {
        hesaplananBedel: bedel,
        takdirEdilenMuhammenBedel: bedel,
        geciciTeminatTutari: geciciTeminat,
        kdvOrani: editingDosya?.muhammenBedel?.kdvOrani ?? 20
      },
      belgeIcerikHtml: editorHtml,
      aktifSablonKodu: selectedTemplateKod,
      surumler: revisions
    }

    onSave(resultDosya)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* ÜST BAŞLIK & BİLDİRİM */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-purple-900/90 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-purple-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600/60 rounded-xl border border-purple-400/40">
              <Building2 className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>{editingDosya ? '2886 İhale Dosyasını ve Şablonunu Düzenle' : 'Yeni 2886 İhale Dosyası & Dinamik Şablon Stüdyosu'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200">
                  {formData.ihaleKayitNo || 'Yeni'}
                </span>
              </h2>
              <p className="text-[11px] text-purple-200/70">
                Form yer tutucularını TipTap A4 editörü ile yönetin, sürümleri anlık kaydedin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedNotification && (
              <div className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold animate-in fade-in">
                {savedNotification}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-purple-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ANA ÇALIŞMA ALANI (SOL: FORM & YER TUTUCULAR, SAĞ: TİPTAP A4 EDİTÖR) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* ════════ SOL PANEL: DOSYA METADATA & DİNAMİK YER TUTUCULAR ════════ */}
          <div className="w-full lg:w-[420px] bg-slate-50/70 dark:bg-slate-950/70 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto space-y-4 shrink-0 custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                İhale & Taşınmaz Değişkenleri
              </span>
              <button
                type="button"
                onClick={handleInjectVariables}
                className="px-2.5 py-1 text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                title="Formdaki verileri sağdaki şablon metnine yerleştirir"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Şablona Doldur
              </button>
            </div>

            {/* Form Alanları */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  İhale Kayıt No
                </label>
                <input
                  type="text"
                  required
                  value={formData.ihaleKayitNo}
                  onChange={(e) => setFormData({ ...formData, ihaleKayitNo: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-purple-600 dark:text-purple-400 font-bold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  İhale Konusu / Başlığı
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.ihaleAdi}
                  onChange={(e) => setFormData({ ...formData, ihaleAdi: e.target.value })}
                  placeholder="Örn: Merkez Mah. 104 Ada 12 Parsel Taşınmaz Satışı İhalesi"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs resize-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    İşlem Türü
                  </label>
                  <select
                    value={formData.islemTuru}
                    onChange={(e) => setFormData({ ...formData, islemTuru: e.target.value })}
                    className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                  >
                    <option value="satis">🏷️ Satış</option>
                    <option value="kiralama">🏢 Kiralama</option>
                    <option value="irtifak_hakki">📜 İrtifak Hakkı</option>
                    <option value="trampa">🔄 Trampa (Takas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    İhale Usulü
                  </label>
                  <select
                    value={formData.usul}
                    onChange={(e) => setFormData({ ...formData, usul: e.target.value })}
                    className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                  >
                    <option value="acik_teklif_45">Md. 45 (Açık Teklif)</option>
                    <option value="kapali_teklif_35">Md. 35/a (Kapalı Teklif)</option>
                    <option value="pazarlik_51">Md. 51 (Pazarlık)</option>
                  </select>
                </div>
              </div>

              {/* Tapu & Taşınmaz Bilgileri */}
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  Taşınmaz Bilgileri
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="İl"
                    value={formData.il}
                    onChange={(e) => setFormData({ ...formData, il: e.target.value })}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="İlçe"
                    value={formData.ilce}
                    onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Ada"
                    value={formData.ada}
                    onChange={(e) => setFormData({ ...formData, ada: e.target.value })}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Parsel"
                    value={formData.parsel}
                    onChange={(e) => setFormData({ ...formData, parsel: e.target.value })}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="number"
                    placeholder="m² Alan"
                    value={formData.yuzolcumuM2 || ''}
                    onChange={(e) => setFormData({ ...formData, yuzolcumuM2: Number(e.target.value) })}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Cinsi (Örn: Ticari İmarlı Arsa / Dükkan)"
                  value={formData.cinsi}
                  onChange={(e) => setFormData({ ...formData, cinsi: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              {/* Muhammen Bedel & Teminat */}
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                    Muhammen Bedel & Teminat
                  </span>
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                    %3 Geçici Teminat
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Muhammen Bedel (₺)
                  </label>
                  <input
                    type="number"
                    value={formData.muhammenBedel || ''}
                    onChange={(e) => setFormData({ ...formData, muhammenBedel: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 rounded-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <span className="text-slate-500">Hesaplanan Teminat (%3):</span>
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                    ₺{Math.round((Number(formData.muhammenBedel) || 0) * 0.03).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* İhale Tarih, Saat, Yer */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    İhale Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.ihaleTarihi}
                    onChange={(e) => setFormData({ ...formData, ihaleTarihi: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    İhale Saati
                  </label>
                  <input
                    type="time"
                    value={formData.ihaleSaati}
                    onChange={(e) => setFormData({ ...formData, ihaleSaati: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  İhale Yeri
                </label>
                <input
                  type="text"
                  value={formData.ihaleYeri}
                  onChange={(e) => setFormData({ ...formData, ihaleYeri: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              {/* Yer Tutucular Çipleri */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Dinamik Değişkenler:
                </span>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(dynamicVariables).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`{{${key}}}`)
                        showNotification(`📋 {{${key}}} kopyalandı!`)
                      }}
                      className="px-2 py-0.5 rounded-md bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-mono text-[10px] transition-colors cursor-pointer"
                      title="Kopyalamak için tıklayın"
                    >
                      {`{{${key}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ════════ SAĞ PANEL: TİPTAP A4 EDİTÖR & SÜRÜM YÖNETİMİ ════════ */}
          <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden">
            {/* Şablon & Sürüm Kontrol Araç Çubuğu */}
            <div className="p-3 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Belge Şablonu:
                </span>
                <select
                  value={selectedTemplateKod}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 cursor-pointer"
                >
                  {STANDARD_2886_TEMPLATES.map((t) => (
                    <option key={t.kod} value={t.kod}>
                      {t.ad}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sürümleme & Dışa Aktarma Butonları */}
              <div className="flex items-center gap-2">
                {/* Sürüm Listesi */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedRevisionId || ''}
                    onChange={(e) => handleRestoreRevision(Number(e.target.value))}
                    className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer border-none outline-hidden"
                  >
                    {revisions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.baslik}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSaveRevision}
                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Mevcut metni yeni bir sürüm olarak sakla"
                >
                  <Save className="w-3.5 h-3.5" />
                  Sürüm Kaydet
                </button>

                <button
                  type="button"
                  onClick={handleExportDocx}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Word (.doc) Olarak İndir"
                >
                  <Download className="w-3.5 h-3.5" />
                  Word (DOC)
                </button>
              </div>
            </div>

            {/* TipTap A4 Editör Alanı */}
            <div className="flex-1 overflow-hidden p-4">
              <A4Editor
                content={editorHtml}
                onChange={setEditorHtml}
              />
            </div>
          </div>
        </div>

        {/* ════════ ALT BUTONLAR (KAYDET & KAPAT) ════════ */}
        <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Toplam <span className="font-bold text-purple-600">{revisions.length}</span> sürüm ve{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200">{formData.ihaleKayitNo}</span> dosyası kaydedilecek.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingDosya ? 'Değişiklikleri ve Şablonu Kaydet' : '2886 İhale Dosyasını ve Şablonunu Başlat'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
