import React, { useState } from 'react'
import {
  FileText,
  Edit3,
  Download,
  Eye,
  CheckCircle2,
  FolderOpen
} from 'lucide-react'
import Mustache from 'mustache'
import { SurecEvrakiItem } from '../types/devletIhale2886.types'
import { DEFAULT_2886_EVRAKLAR } from './surecEvraklari.data'
import { Dosya2886Item } from './DosyaYonetimi2886Tab'
import { A4Editor } from '../../../components/editor/A4Editor'
import { sayiyiYaziyaCevir } from '../../../constants/sayiEslesmeleri'
import { sanitizeHtml } from '../../../utils/sanitize'

interface SurecEvraklariTabProps {
  selectedDosya?: Dosya2886Item | null
}

const ASAMA_BASLIKLARI: {
  id: SurecEvrakiItem['asama']
  title: string
  color: string
}[] = [
  {
    id: 'baslangic',
    title: '1. Aşama: Başlangıç ve Yetki Evrakları',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'kiymet_takdir',
    title: '2. Aşama: Kıymet Takdiri & Muhammen Bedel',
    color: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'sartname_ve_ilan',
    title: '3. Aşama: Şartname, İhale Kararı & İlan Süreci',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'ihale_gunu',
    title: '4. Aşama: İhale Günü, Açık Artırma & Encümen Kararı',
    color: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'onay_ve_sozlesme',
    title: '5. Aşama: İta Amiri Onayı, Tebligat & Sözleşme',
    color: 'text-emerald-600 dark:text-emerald-400'
  }
]

// Standart 2886 Şablon HTML İskeletleri
const DEFAULT_TEMPLATES_BY_CODE: Record<string, string> = {
  '2886-EVR-01': `
<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
  <div style="text-align: center; margin-bottom: 25px;">
    <h3 style="margin: 0; font-size: 14pt; text-transform: uppercase;">T.C.</h3>
    <h3 style="margin: 0; font-size: 13pt; text-transform: uppercase;">{{kurum_adi}}</h3>
    <h4 style="margin: 5px 0 0 0; font-size: 11pt;">Emlak ve İstimlak Müdürlüğü</h4>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 10pt;">
    <div><strong>Sayı:</strong> {{sayi_no}}</div>
    <div><strong>Tarih:</strong> {{tarih}}</div>
  </div>

  <div style="text-align: center; margin: 30px 0; font-weight: bold; font-size: 12pt;">
    BAŞKANLIK MAKAMINA (ONAY BELGESİ)
  </div>

  <p>
    Mülkiyeti idaremize ait aşağıda tapu ve nitelik bilgileri yazılı taşınmazın, 
    <strong>2886 Sayılı Devlet İhale Kanunu'nun {{ihale_usulu}}</strong> hükümleri doğrultusunda 
    <strong>{{islem_turu_adi}}</strong> ihalesine çıkarılması planlanmaktadır.
  </p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10pt;" border="1">
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 6px; text-align: left;">Dosya No</th>
      <td style="padding: 6px;">{{dosya_no}}</td>
    </tr>
    <tr>
      <th style="padding: 6px; text-align: left;">Taşınmaz Konusu</th>
      <td style="padding: 6px;">{{tasinmaz_adi}}</td>
    </tr>
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 6px; text-align: left;">Ada / Parsel</th>
      <td style="padding: 6px;">{{ada_parsel}}</td>
    </tr>
    <tr>
      <th style="padding: 6px; text-align: left;">Yüzölçümü</th>
      <td style="padding: 6px;">{{yuzolcumu}} m²</td>
    </tr>
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 6px; text-align: left;">Tahmini Muhammen Bedel</th>
      <td style="padding: 6px;"><strong>₺{{muhammen_bedel}}</strong> ({{muhammen_bedel_yaziyla}})</td>
    </tr>
    <tr>
      <th style="padding: 6px; text-align: left;">Geçici Teminat (%3)</th>
      <td style="padding: 6px;"><strong>₺{{gecici_teminat}}</strong></td>
    </tr>
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 6px; text-align: left;">Planlanan İhale Tarihi & Saati</th>
      <td style="padding: 6px;">{{ihale_tarihi}} - Saat: {{ihale_saati}}</td>
    </tr>
  </table>

  <p>
    Söz konusu ihalenin açılması, şartname ve eklerinin hazırlanması ve Encümene sevk edilmesi hususunu tensiplerinize arz ederim.
  </p>

  <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center;">
    <div>
      <p><strong>{{hazirlayan_unvan}}</strong></p>
      <br/><br/>
      <p>{{hazirlayan_ad}}</p>
    </div>
    <div>
      <p><strong>OLUR</strong></p>
      <p><strong>{{belediye_baskani_unvan}}</strong></p>
      <br/><br/>
      <p>{{belediye_baskani}}</p>
    </div>
  </div>
</div>
`,
  '2886-EVR-05': `
<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h3 style="margin: 0; font-size: 13pt;">T.C. {{kurum_adi}}</h3>
    <h4 style="margin: 5px 0; font-size: 11pt;">KIYMET TAKDİR KOMİSYONU KARAR TUTANAĞI</h4>
  </div>

  <div style="font-size: 10pt; margin-bottom: 15px;">
    <div><strong>Dosya No:</strong> {{dosya_no}}</div>
    <div><strong>Karar Tarihi:</strong> {{tarih}}</div>
    <div><strong>Taşınmaz:</strong> {{tasinmaz_adi}} (Ada/Parsel: {{ada_parsel}}, Alan: {{yuzolcumu}} m²)</div>
  </div>

  <p>
    2886 Sayılı Devlet İhale Kanunu'nun 13. Maddesi uyarınca teşekkül eden Kıymet Takdir Komisyonumuz toplanarak, 
    mahallinde yapılan incelemeler, emsal alım-satım/kira rayiçleri ve piyasa şartları göz önüne alınarak muhammen bedel tespiti yapılmıştır.
  </p>

  <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin: 15px 0; border-radius: 6px;">
    <p style="margin: 0;"><strong>Takdir Edilen Muhammen Bedel:</strong> ₺{{muhammen_bedel}} ({{muhammen_bedel_yaziyla}})</p>
    <p style="margin: 5px 0 0 0;"><strong>%3 Geçici Teminat Tutarı:</strong> ₺{{gecici_teminat}}</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-top: 30px; text-align: center; font-size: 10pt;">
    <tr>
      <td><strong>Komisyon Başkanı</strong><br/><br/>{{komisyon_baskani}}<br/>Müdür</td>
      <td><strong>Üye (Teknik)</strong><br/><br/>Harita Müh.<br/>Üye</td>
      <td><strong>Üye (Mali)</strong><br/><br/>Mali Hiz. Yetkilisi<br/>Üye</td>
    </tr>
  </table>
</div>
`
}

function getDurumBadge(durum: SurecEvrakiItem['durum']): React.JSX.Element {
  switch (durum) {
    case 'onaylandi':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          Onaylandı
        </span>
      )
    case 'taslak':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          Taslak
        </span>
      )
    case 'teblig_edildi':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          Tebliğ Edildi
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Hazırlanmadı
        </span>
      )
  }
}

export function SurecEvraklariTab({ selectedDosya }: SurecEvraklariTabProps): React.JSX.Element {
  const [evraklar] = useState<SurecEvrakiItem[]>(DEFAULT_2886_EVRAKLAR)
  const [activeEditorEvrak, setActiveEditorEvrak] = useState<SurecEvrakiItem | null>(null)
  const [editorHtml, setEditorHtml] = useState<string>('')
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor')

  // Aktif Dosya verileriyle birleştirilmiş dinamik değişken haritası (Mustache Placeholders)
  const templateVariables = React.useMemo(() => {
    const d = selectedDosya as any
    const bedel =
      d?.muhammenBedel?.takdirEdilenMuhammenBedel ||
      d?.muhammenBedel?.hesaplananBedel ||
      (typeof d?.muhammenBedel === 'number' ? d?.muhammenBedel : 4500000)
    const geciciTeminat = d?.muhammenBedel?.geciciTeminatTutari || Math.round(bedel * 0.03)

    return {
      kurum_adi: 'ÖRNEK BELEDİYE BAŞKANLIĞI',
      sayi_no: d ? `E-2886-${d.id}` : 'E-2886-2026/001',
      tarih: new Date().toLocaleDateString('tr-TR'),
      dosya_no: d?.ihaleKayitNo || d?.dosyaNo || '2026/2886-ST-01',
      tasinmaz_adi: d?.ihaleAdi || d?.tasinmazAdi || 'Merkez Mah. 104 Ada 12 Parsel 1.450 m² Ticari İmarlı Arsa Satışı İhalesi',
      islem_turu_adi:
        d?.islemTuru === 'satis'
          ? 'Mülkiyet Satışı'
          : d?.islemTuru === 'kiralama'
            ? 'Taşınmaz Kiralama'
            : d?.islemTuru === 'irtifak_hakki' || d?.islemTuru === 'irtifak'
              ? 'Sınırlı Ayni Hak / İrtifak'
              : 'Taşınmaz Trampası',
      ihale_usulu:
        d?.usul === 'acik_teklif_45'
          ? 'Madde 45 (Açık Teklif Usulü)'
          : d?.usul === 'kapali_teklif_36'
            ? 'Madde 36 (Kapalı Teklif Usulü)'
            : d?.usul === 'pazarlik_51'
              ? 'Madde 51 (Pazarlık Usulü)'
              : d?.usul || 'Madde 45 (Açık Teklif Usulü)',
      ada_parsel:
        d?.tasinmaz?.ada && d?.tasinmaz?.parsel
          ? `${d.tasinmaz.ada} / ${d.tasinmaz.parsel}`
          : d?.adaParsel || '104 / 12',
      yuzolcumu: d?.tasinmaz?.yuzolcumuM2 || d?.yuzolcumuM2 || 1450,
      muhammen_bedel: bedel.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      muhammen_bedel_yaziyla: sayiyiYaziyaCevir(bedel) + ' Türk Lirası',
      gecici_teminat: geciciTeminat.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      ihale_tarihi: d?.ihaleTarihi || '2026-10-15',
      ihale_saati: d?.ihaleSaati || '14:30',
      komisyon_baskani: 'Ahmet Yılmaz',
      hazirlayan_ad: 'Mehmet Demir',
      hazirlayan_unvan: 'Emlak ve İstimlak Müdürü',
      belediye_baskani: 'Av. Serdar Kaya',
      belediye_baskani_unvan: 'Belediye Başkanı'
    }
  }, [selectedDosya])

  const openDocumentEditor = (item: SurecEvrakiItem): void => {
    const rawTemplate =
      DEFAULT_TEMPLATES_BY_CODE[item.kod] ||
      `
<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
  <h3 style="text-align: center;">T.C. {{kurum_adi}}</h3>
  <h4 style="text-align: center;">${item.ad}</h4>
  <hr style="margin: 15px 0;"/>
  <p><strong>Dosya No:</strong> {{dosya_no}}</p>
  <p><strong>Taşınmaz Adı:</strong> {{tasinmaz_adi}}</p>
  <p><strong>İhale Usulü:</strong> {{ihale_usulu}}</p>
  <p><strong>Muhammen Bedel:</strong> ₺{{muhammen_bedel}}</p>
  <p><strong>İhale Tarihi:</strong> {{ihale_tarihi}} (Saat: {{ihale_saati}})</p>
  <div style="margin-top: 40px;">
    <p>İşbu evrak 2886 Sayılı Devlet İhale Kanunu kapsamında tanzim edilmiştir.</p>
  </div>
</div>
`
    setEditorHtml(rawTemplate)
    setActiveEditorEvrak(item)
    setViewMode('editor')
  }

  // Değişkenlerle Derlenmiş Canlı HTML (Mustache)
  const compiledHtml = React.useMemo(() => {
    try {
      return Mustache.render(editorHtml, templateVariables)
    } catch (e) {
      console.error('Şablon derleme hatası:', e)
      return editorHtml
    }
  }, [editorHtml, templateVariables])

  // Word (.docx) olarak kaydet / dışa aktar
  const handleExportDocx = async (): Promise<void> => {
    if (!activeEditorEvrak) return
    const filename = `${templateVariables.dosya_no}_${activeEditorEvrak.ad}`
    if (window.electron?.ipcRenderer) {
      try {
        await window.electron.ipcRenderer.invoke('export-docx', compiledHtml, filename)
        alert('Word (DOCX) belgesi başarıyla dışa aktarıldı!')
      } catch (err) {
        console.error('DOCX dışa aktarma hatası:', err)
      }
    } else {
      // Tarayıcı fallback
      const blob = new Blob([compiledHtml], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.doc`
      a.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Aktif Dosya Bilgi Kartı */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Aktif 2886 Dosyası & Dinamik Şablon Motoru
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>{selectedDosya ? selectedDosya.ihaleKayitNo : '2026/2886-ST-01'}</span>
              <span className="text-xs font-normal text-slate-500">
                — {selectedDosya ? selectedDosya.ihaleAdi : 'Merkez Mah. 104 Ada 12 Parsel 1.450 m² Ticari İmarlı Arsa Satışı İhalesi'}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            ₺{templateVariables.muhammen_bedel}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
            {templateVariables.ihale_usulu}
          </span>
        </div>
      </div>

      {/* 5 Aşamalı Süreç Evrak Listesi */}
      <div className="grid grid-cols-1 gap-4">
        {ASAMA_BASLIKLARI.map((asama) => {
          const items = evraklar.filter((e) => e.asama === asama.id)
          return (
            <div
              key={asama.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs"
            >
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${asama.color}`}>
                {asama.title}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 rounded-xl text-xs transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 group-hover:text-indigo-600 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                          <span>{item.ad}</span>
                          {item.sayiNo && (
                            <span className="text-[10px] font-mono text-slate-400">
                              ({item.sayiNo})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {item.kod} {item.tarih ? `• ${item.tarih}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {getDurumBadge(item.durum)}
                      <button
                        type="button"
                        onClick={() => openDocumentEditor(item)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        title="TipTap ile Şablonu Düzenle / Değişkenlerle Doldur"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Şablon & Word</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* TİPTAP VE WORD ŞABLON EDİTÖR MODALI */}
      {activeEditorEvrak && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[92vh] space-y-4">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {activeEditorEvrak.ad}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {activeEditorEvrak.kod} • Dinamik Değişkenli Şablon Editörü
                  </p>
                </div>
              </div>

              {/* Editör / Önizleme Butonları & Dışa Aktar */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('editor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      viewMode === 'editor'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Şablon Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      viewMode === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dolu Önizleme</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportDocx}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Word (.docx) Dosyası Olarak Kaydet"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Word (DOCX) İndir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEditorEvrak(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Değişken Kılavuzu Rozetleri */}
            <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] shrink-0">
              <span className="font-bold text-slate-600 dark:text-slate-300 mr-2">
                💡 Kullanılabilir Değişkenler:
              </span>
              {[
                '{{dosya_no}}',
                '{{tasinmaz_adi}}',
                '{{ada_parsel}}',
                '{{yuzolcumu}}',
                '{{muhammen_bedel}}',
                '{{muhammen_bedel_yaziyla}}',
                '{{gecici_teminat}}',
                '{{ihale_tarihi}}',
                '{{ihale_saati}}',
                '{{ihale_usulu}}',
                '{{kurum_adi}}'
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(tag)
                    alert(`"${tag}" panoya kopyalandı! Editörde dilediğiniz yere yapıştırabilirsiniz.`)
                  }}
                  className="inline-block font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 mr-1.5 mb-1 cursor-pointer"
                  title="Kopyalamak için tıkla"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Editör / Önizleme Gövdesi */}
            <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-950">
              {viewMode === 'editor' ? (
                <A4Editor content={editorHtml} onChange={setEditorHtml} />
              ) : (
                <div
                  className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm text-slate-900 dark:text-slate-100"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(compiledHtml) }}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Seçili ihale dosyasının verileriyle anında dinamik eşleşir.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEditorEvrak(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
