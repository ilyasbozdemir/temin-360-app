import React, { useState, useRef } from 'react'
import {
  FileText,
  Image as ImageIcon,
  Sliders,
  Download,
  UploadCloud,
  FileCheck2,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  Loader2,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

type SubTool = 'docx-to-pdf' | 'images-to-pdf' | 'image-converter'

interface ImageItem {
  id: string
  name: string
  size: number
  dataUrl: string
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
}

export function BelgeDonusturucuTab(): React.JSX.Element {
  const [activeSubTool, setActiveSubTool] = useState<SubTool>('docx-to-pdf')

  // --- DOCX TO PDF STATE ---
  const [docxFile, setDocxFile] = useState<{
    name: string
    size: number
    base64?: string
    filePath?: string
  } | null>(null)
  const [docxFont, setDocxFont] = useState("'Segoe UI', Roboto, Helvetica, Arial, sans-serif")
  const [docxFontSize, setDocxFontSize] = useState('11pt')
  const [docxMargin, setDocxMargin] = useState('20mm')
  const [docxLineHeight, setDocxLineHeight] = useState('1.6')
  const [isConvertingDocx, setIsConvertingDocx] = useState(false)
  const [docxPreviewHtml, setDocxPreviewHtml] = useState<string | null>(null)
  const [convertedPdfBase64, setConvertedPdfBase64] = useState<string | null>(null)
  const [docxStatusMessage, setDocxStatusMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // --- IMAGES TO PDF STATE ---
  const [imagesList, setImagesList] = useState<ImageItem[]>([])
  const [imagesFit, setImagesFit] = useState<'contain' | 'cover' | 'fill'>('contain')
  const [imagesMargin, setImagesMargin] = useState<'0mm' | '10mm' | '15mm'>('0mm')
  const [pdfTitle, setPdfTitle] = useState('Birlestirilmis_Gorseller')
  const [isGeneratingImgPdf, setIsGeneratingImgPdf] = useState(false)
  const [imgPdfStatus, setImgPdfStatus] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // --- IMAGE CONVERTER STATE ---
  const [sourceImg, setSourceImg] = useState<{
    name: string
    size: number
    dataUrl: string
    width: number
    height: number
    type: string
  } | null>(null)
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>(
    'image/jpeg'
  )
  const [imgQuality, setImgQuality] = useState(85)
  const [resizePercent, setResizePercent] = useState(100)
  const [convertedImgData, setConvertedImgData] = useState<{
    dataUrl: string
    size: number
    width: number
    height: number
  } | null>(null)
  const [isProcessingImg, setIsProcessingImg] = useState(false)

  const docxInputRef = useRef<HTMLInputElement>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const singleImgInputRef = useRef<HTMLInputElement>(null)

  // -------------------------------------------------------------
  // 1. WORD (.DOCX) ➔ PDF HANDLERS
  // -------------------------------------------------------------
  const handleDocxSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setDocxFile({
        name: file.name,
        size: file.size,
        base64
      })
      setDocxPreviewHtml(null)
      setConvertedPdfBase64(null)
      setDocxStatusMessage(null)
    }
    reader.readAsDataURL(file)
  }

  const handleNativeDocxPick = async () => {
    if (!window.electron?.ipcRenderer) return
    try {
      setIsConvertingDocx(true)
      setDocxStatusMessage(null)
      const res = await window.electron.ipcRenderer.invoke('belge:convert-docx-to-pdf', {
        fontFamily: docxFont,
        fontSize: docxFontSize,
        margins: docxMargin,
        lineHeight: docxLineHeight
      })

      if (res?.success) {
        setDocxFile({
          name: res.fileName || 'Dokuman.docx',
          size: 0
        })
        setDocxPreviewHtml(res.html || '')
        setConvertedPdfBase64(res.data || null)
        setDocxStatusMessage({
          type: 'success',
          text: 'Word dokümanı başarıyla çözümlendi ve Türkçe karakter uyumlu PDF haline getirildi.'
        })
      } else if (res?.error && res.error !== 'Dosya seçimi iptal edildi') {
        setDocxStatusMessage({ type: 'error', text: res.error })
      }
    } catch (err: unknown) {
      setDocxStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Dönüştürme hatası'
      })
    } finally {
      setIsConvertingDocx(false)
    }
  }

  const handleConvertDocx = async (saveImmediately = false) => {
    if (!docxFile?.base64 || !window.electron?.ipcRenderer) return
    setIsConvertingDocx(true)
    setDocxStatusMessage(null)

    try {
      const res = await window.electron.ipcRenderer.invoke('belge:convert-docx-to-pdf', {
        base64: docxFile.base64,
        fileName: docxFile.name,
        fontFamily: docxFont,
        fontSize: docxFontSize,
        margins: docxMargin,
        lineHeight: docxLineHeight,
        saveImmediately
      })

      if (res?.success) {
        setDocxPreviewHtml(res.html || '')
        setConvertedPdfBase64(res.data || null)
        setDocxStatusMessage({
          type: 'success',
          text: saveImmediately
            ? `PDF başarıyla kaydedildi: ${res.filePath || ''}`
            : 'PDF başarıyla hazırlandı! Aşağıdan önizleyebilir veya indirebilirsiniz.'
        })
      } else {
        setDocxStatusMessage({
          type: 'error',
          text: res?.error || 'Dönüştürme sırasında hata oluştu'
        })
      }
    } catch (err: unknown) {
      setDocxStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'İşlem hatası'
      })
    } finally {
      setIsConvertingDocx(false)
    }
  }

  const handleSavePdf = async () => {
    if (!convertedPdfBase64 || !window.electron?.ipcRenderer) return
    const defaultName = (docxFile?.name || 'Dokuman').replace(/\.docx$/i, '') + '.pdf'
    const res = await window.electron.ipcRenderer.invoke('belge:save-base64-file', {
      dataBase64: convertedPdfBase64,
      defaultFilename: defaultName,
      filterName: 'PDF Dokümanı',
      extensions: ['pdf']
    })
    if (res?.success) {
      setDocxStatusMessage({
        type: 'success',
        text: `Dosya kaydedildi: ${res.filePath}`
      })
    }
  }

  const handlePreviewPdfExternal = async () => {
    if (!docxPreviewHtml || !window.electron?.ipcRenderer) return
    await window.electron.ipcRenderer.invoke('belge:open-pdf-external', docxPreviewHtml)
  }

  // -------------------------------------------------------------
  // 2. IMAGES ➔ PDF HANDLERS
  // -------------------------------------------------------------
  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        const img = new Image()
        img.onload = () => {
          const isLandscape = img.width > img.height
          setImagesList((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              name: file.name,
              size: file.size,
              dataUrl,
              width: img.width,
              height: img.height,
              orientation: isLandscape ? 'landscape' : 'portrait'
            }
          ])
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    })
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImagesList((prev) => {
      const newList = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newList.length) return prev
      const temp = newList[index]
      newList[index] = newList[targetIndex]
      newList[targetIndex] = temp
      return newList
    })
  }

  const removeImage = (id: string) => {
    setImagesList((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleImageOrientation = (id: string) => {
    setImagesList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, orientation: item.orientation === 'portrait' ? 'landscape' : 'portrait' }
          : item
      )
    )
  }

  const handleGenerateImagesPdf = async () => {
    if (imagesList.length === 0 || !window.electron?.ipcRenderer) return
    setIsGeneratingImgPdf(true)
    setImgPdfStatus(null)

    try {
      const res = await window.electron.ipcRenderer.invoke('belge:convert-images-to-pdf', {
        images: imagesList.map((img) => ({
          name: img.name,
          dataUrl: img.dataUrl,
          orientation: img.orientation
        })),
        fit: imagesFit,
        margins: imagesMargin,
        title: pdfTitle,
        saveImmediately: true
      })

      if (res?.success) {
        setImgPdfStatus({
          type: 'success',
          text: `🎉 ${imagesList.length} görselden oluşan A4 PDF başarıyla oluşturuldu ve kaydedildi: ${
            res.filePath || ''
          }`
        })
      } else if (res?.error && res.error !== 'Kaydetme iptal edildi') {
        setImgPdfStatus({ type: 'error', text: res.error })
      }
    } catch (err: unknown) {
      setImgPdfStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'PDF oluşturma hatası'
      })
    } finally {
      setIsGeneratingImgPdf(false)
    }
  }

  // -------------------------------------------------------------
  // 3. IMAGE CONVERTER / COMPRESSOR HANDLERS
  // -------------------------------------------------------------
  const handleSingleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        setSourceImg({
          name: file.name,
          size: file.size,
          dataUrl,
          width: img.width,
          height: img.height,
          type: file.type
        })
        setConvertedImgData(null)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const handleProcessImage = () => {
    if (!sourceImg) return
    setIsProcessingImg(true)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = resizePercent / 100
      const newWidth = Math.round(img.width * scale)
      const newHeight = Math.round(img.height * scale)

      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setIsProcessingImg(false)
        return
      }

      // Fill white background for JPEG if transparency
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, newWidth, newHeight)
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      const qualityRatio = imgQuality / 100
      const outputDataUrl = canvas.toDataURL(targetFormat, qualityRatio)

      // Estimate byte size from dataUrl
      const base64Str = outputDataUrl.split(',')[1] || ''
      const approxBytes = Math.round((base64Str.length * 3) / 4)

      setConvertedImgData({
        dataUrl: outputDataUrl,
        size: approxBytes,
        width: newWidth,
        height: newHeight
      })
      setIsProcessingImg(false)
    }
    img.src = sourceImg.dataUrl
  }

  const handleSaveConvertedImage = async () => {
    if (!convertedImgData || !sourceImg || !window.electron?.ipcRenderer) return
    const ext =
      targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/png' ? 'png' : 'webp'
    const cleanBaseName = sourceImg.name.substring(0, sourceImg.name.lastIndexOf('.')) || 'gorsel'
    const defaultName = `${cleanBaseName}_donusturuldu.${ext}`

    await window.electron.ipcRenderer.invoke('belge:save-base64-file', {
      dataBase64: convertedImgData.dataUrl,
      defaultFilename: defaultName,
      filterName: `${ext.toUpperCase()} Görseli`,
      extensions: [ext]
    })
  }

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Üst Alt-Araç Seçim Sekmeleri */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-900/90 rounded-2xl border border-slate-300/60 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSubTool('docx-to-pdf')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTool === 'docx-to-pdf'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Word (.docx) ➔ PDF Çevirici</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTool('images-to-pdf')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTool === 'images-to-pdf'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Görsellerden (JPG/PNG) ➔ Çoklu PDF</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTool('image-converter')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTool === 'image-converter'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Görsel Format & Boyut Sıkıştırıcı (EKAP)</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. SEKME: WORD (.DOCX) ➔ PDF ÇEVİRİCİ */}
      {/* ------------------------------------------------------------- */}
      {activeSubTool === 'docx-to-pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Sol Kolon: Dosya Yükleme & Ayarlar */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  Word (.docx) Dosyası Seçimi
                </h2>
              </div>

              {/* Gizli Input */}
              <input
                type="file"
                ref={docxInputRef}
                accept=".docx"
                onChange={handleDocxSelect}
                className="hidden"
              />

              {/* Yükleme Alanı */}
              <div
                onClick={() => docxInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 dark:border-blue-900/60 hover:border-blue-500 rounded-2xl p-6 text-center bg-blue-50/40 dark:bg-blue-950/20 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {docxFile ? docxFile.name : 'Word (.docx) dosyasını buraya tıklayarak seçin'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {docxFile
                    ? `Boyut: ${formatBytes(docxFile.size)}`
                    : 'Microsoft Word .docx formatındaki evrak, şartname veya sözleşmeler'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNativeDocxPick}
                  disabled={isConvertingDocx}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
                  <span>Doğrudan Bilgisayardan Seç & Çevir</span>
                </button>
              </div>

              {/* Türkçe Karakter & Tipografi Ayarları */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Türkçe Tipografi & PDF Düzen Ayarları</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Yazı Tipi (Türkçe Güvenli)
                    </label>
                    <select
                      value={docxFont}
                      onChange={(e) => setDocxFont(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
                    >
                      <option value="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
                        Segoe UI (Modern Kamu)
                      </option>
                      <option value="'Times New Roman', Times, serif">
                        Times New Roman (Resmi)
                      </option>
                      <option value="'Arial', sans-serif">Arial</option>
                      <option value="'Calibri', Candara, Segoe, sans-serif">Calibri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Yazı Boyutu
                    </label>
                    <select
                      value={docxFontSize}
                      onChange={(e) => setDocxFontSize(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
                    >
                      <option value="10pt">10 pt (Kompakt)</option>
                      <option value="11pt">11 pt (Standart)</option>
                      <option value="12pt">12 pt (Büyük Resmi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Sayfa Kenar Boşluğu
                    </label>
                    <select
                      value={docxMargin}
                      onChange={(e) => setDocxMargin(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
                    >
                      <option value="10mm">10 mm (Dar / Çok Verili)</option>
                      <option value="20mm">20 mm (Standart A4)</option>
                      <option value="25mm">25 mm (Geniş Resmi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Satır Aralığı
                    </label>
                    <select
                      value={docxLineHeight}
                      onChange={(e) => setDocxLineHeight(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
                    >
                      <option value="1.3">1.3 (Sıkı)</option>
                      <option value="1.6">1.6 (Standart)</option>
                      <option value="1.8">1.8 (Ferah)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={!docxFile?.base64 || isConvertingDocx}
                  onClick={() => handleConvertDocx(false)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isConvertingDocx ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>PDF Dönüştürülüyor...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Önizleme Oluştur & Hazırla</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!docxFile?.base64 || isConvertingDocx}
                  onClick={() => handleConvertDocx(true)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Doğrudan PDF Olarak Kaydet</span>
                </button>
              </div>

              {/* Durum Mesajı */}
              {docxStatusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    docxStatusMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {docxStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  )}
                  <span>{docxStatusMessage.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon: PDF & İçerik Önizleme */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Dönüştürülen Doküman Önizlemesi
                  </h3>
                </div>

                {convertedPdfBase64 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePreviewPdfExternal}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Sistem PDF Görüntüleyicisinde Aç / Yazdır"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Harici Görüntüle</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSavePdf}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF İndir</span>
                    </button>
                  </div>
                )}
              </div>

              {docxPreviewHtml ? (
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[600px] custom-scrollbar shadow-inner">
                  <div
                    className="max-w-[750px] mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl shadow-md text-slate-800 dark:text-slate-200 leading-relaxed text-xs"
                    style={{
                      fontFamily: docxFont,
                      fontSize: docxFontSize,
                      lineHeight: docxLineHeight
                    }}
                    dangerouslySetInnerHTML={{ __html: docxPreviewHtml }}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500 space-y-2">
                  <FileText className="w-12 h-12 opacity-30" />
                  <p className="text-xs font-semibold">Henüz bir Word dokümanı dönüştürülmedi.</p>
                  <p className="text-[11px] max-w-sm">
                    Sol taraftan bir .docx dosyası yükleyip &ldquo;Önizleme Oluştur & Hazırla&rdquo;
                    butonuna bastığınızda burada canlı A4 çıktısını göreceksiniz.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. SEKME: GÖRSELLERDEN ➔ ÇOKLU PDF */}
      {/* ------------------------------------------------------------- */}
      {activeSubTool === 'images-to-pdf' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                Görsellerden Çok Sayfalı A4 PDF Oluşturma
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Taranmış evrakları, fatura veya tutanak fotoğraflarını sıralayarak tek bir resmî PDF
                dosyası haline getirin.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={imgInputRef}
                multiple
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleImagesSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Görsel(ler) Ekle</span>
              </button>

              {imagesList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setImagesList([])}
                  className="px-3 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Listeyi Temizle
                </button>
              )}
            </div>
          </div>

          {/* PDF Sayfa Ayarları */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                PDF Doküman Adı
              </label>
              <input
                type="text"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="Evraklar_Birlestirilmis"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Görsel Sayfa Yerleşimi
              </label>
              <select
                value={imagesFit}
                onChange={(e) => setImagesFit(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium"
              >
                <option value="contain">Sayfaya Sığdır (Oranları Koru - Önerilen)</option>
                <option value="cover">Sayfayı Tam Kapla (Doldur)</option>
                <option value="fill">Uzat & Yay</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Sayfa Kenar Boşluğu
              </label>
              <select
                value={imagesMargin}
                onChange={(e) => setImagesMargin(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium"
              >
                <option value="0mm">0 mm (Kenarlıksız Tam Sayfa)</option>
                <option value="10mm">10 mm (İnce Kenarlık)</option>
                <option value="15mm">15 mm (Standart Kenarlık)</option>
              </select>
            </div>
          </div>

          {/* Görsel Listesi */}
          {imagesList.length === 0 ? (
            <div
              onClick={() => imgInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 dark:border-emerald-900/60 hover:border-emerald-500 rounded-3xl p-12 text-center bg-emerald-50/20 dark:bg-emerald-950/10 cursor-pointer transition-all"
            >
              <ImageIcon className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                PDF Yapmak İstediğiniz Görselleri Yükleyin
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Birden fazla PNG, JPG veya WEBP görseli seçebilir, sırasını değiştirebilir ve her
                sayfa için Dikey/Yatay yönü özelleştirebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
                <span>Eklenen Görseller ({imagesList.length} Sayfa)</span>
                <span>Sıralama ve Sayfa Yönü</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imagesList.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative group bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col gap-2 shadow-xs"
                  >
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-bold text-[10px] backdrop-blur-xs">
                      Sayfa #{idx + 1}
                    </div>

                    <div className="w-full h-36 bg-slate-200/50 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="text-[11px] truncate font-semibold text-slate-700 dark:text-slate-300" title={img.name}>
                      {img.name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{formatBytes(img.size)}</span>
                      <span>
                        {img.width}x{img.height} px
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => toggleImageOrientation(img.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          img.orientation === 'landscape'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}
                        title="Sayfa Yönünü Değiştir"
                      >
                        {img.orientation === 'landscape' ? 'Yatay A4' : 'Dikey A4'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'up')}
                          className="p-1 rounded bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                          title="Öne Taşı"
                        >
                          <MoveUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === imagesList.length - 1}
                          onClick={() => moveImage(idx, 'down')}
                          className="p-1 rounded bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                          title="Arkaya Taşı"
                        >
                          <MoveDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="p-1 rounded bg-red-100 dark:bg-red-950/40 hover:bg-red-200 text-red-600 cursor-pointer ml-1"
                          title="Sil"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PDF Üretim Butonu */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Toplam <strong>{imagesList.length}</strong> sayfalık A4 dokümanı hazırlanacak.
                </div>

                <button
                  type="button"
                  disabled={isGeneratingImgPdf}
                  onClick={handleGenerateImagesPdf}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingImgPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>PDF Üretiliyor...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>Birleştirilmiş PDF Olarak Kaydet</span>
                    </>
                  )}
                </button>
              </div>

              {imgPdfStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    imgPdfStatus.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{imgPdfStatus.text}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. SEKME: GÖRSEL FORMAT & BOYUT SIKIŞTIRICI (EKAP) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTool === 'image-converter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Sol Kolon: Giriş & Ayarlar */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  Görsel Dönüştürücü & Sıkıştırıcı
                </h2>
              </div>

              <input
                type="file"
                ref={singleImgInputRef}
                accept="image/*"
                onChange={handleSingleImageSelect}
                className="hidden"
              />

              <div
                onClick={() => singleImgInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-300 dark:border-indigo-900/60 hover:border-indigo-500 rounded-2xl p-6 text-center bg-indigo-50/30 dark:bg-indigo-950/20 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {sourceImg ? sourceImg.name : 'Dönüştürülecek Görseli Seçin'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {sourceImg
                    ? `${sourceImg.width}x${sourceImg.height} px • ${formatBytes(sourceImg.size)}`
                    : 'PNG, JPG, WEBP veya BMP formatları'}
                </p>
              </div>

              {sourceImg && (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {/* Format Seçimi */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Hedef Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTargetFormat('image/jpeg')}
                        className={`py-1.5 rounded-xl font-bold cursor-pointer ${
                          targetFormat === 'image/jpeg'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        JPG / JPEG
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetFormat('image/png')}
                        className={`py-1.5 rounded-xl font-bold cursor-pointer ${
                          targetFormat === 'image/png'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetFormat('image/webp')}
                        className={`py-1.5 rounded-xl font-bold cursor-pointer ${
                          targetFormat === 'image/webp'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        WEBP (Hafif)
                      </button>
                    </div>
                  </div>

                  {/* Kalite Ayarı */}
                  {targetFormat !== 'image/png' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-medium text-slate-500">
                          Sıkıştırma Kalitesi: <strong>%{imgQuality}</strong>
                        </label>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          {imgQuality < 60
                            ? 'Yüksek Sıkıştırma (En Küçük Dosya)'
                            : imgQuality < 85
                              ? 'Dengeli (EKAP İdeal)'
                              : 'Maksimum Kalite'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={imgQuality}
                        onChange={(e) => setImgQuality(parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Ölçekleme / Boyutlandırma */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-medium text-slate-500">
                        Çözünürlük Ölçeği: <strong>%{resizePercent}</strong> (
                        {Math.round((sourceImg.width * resizePercent) / 100)}x
                        {Math.round((sourceImg.height * resizePercent) / 100)} px)
                      </label>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="100"
                      step="5"
                      value={resizePercent}
                      onChange={(e) => setResizePercent(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isProcessingImg}
                    onClick={handleProcessImage}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingImg ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>Dönüştür ve Boyutu Hesapla</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon: Karşılaştırma & İndirme */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Dönüştürülen Çıktı & Boyut Kazancı
                </h3>
                {convertedImgData && (
                  <button
                    type="button"
                    onClick={handleSaveConvertedImage}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Görseli Kaydet</span>
                  </button>
                )}
              </div>

              {convertedImgData && sourceImg ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Karşılaştırma İstatistikleri */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Orijinal Dosya</span>
                      <strong className="text-slate-700 dark:text-slate-300">
                        {formatBytes(sourceImg.size)}
                      </strong>
                      <div className="text-[10px] text-slate-500">
                        {sourceImg.width}x{sourceImg.height} px
                      </div>
                    </div>

                    <div>
                      <span className="text-emerald-500 block text-[10px]">Yeni Sıkıştırılmış</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {formatBytes(convertedImgData.size)}
                      </strong>
                      <div className="text-[10px] text-slate-500">
                        {convertedImgData.width}x{convertedImgData.height} px (
                        {Math.round((1 - convertedImgData.size / sourceImg.size) * 100)}% Kazanç)
                      </div>
                    </div>
                  </div>

                  {/* Görsel Önizleme */}
                  <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-2xl p-3 flex items-center justify-center overflow-hidden max-h-[300px]">
                    <img
                      src={convertedImgData.dataUrl}
                      alt="Dönüştürülmüş"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500 space-y-2">
                  <Sliders className="w-10 h-10 opacity-30" />
                  <p className="text-xs font-semibold">Görsel dönüştürme bekleniyor</p>
                  <p className="text-[11px] max-w-xs">
                    Sol kısımdan bir görsel yükleyip hedef formatı ve sıkıştırmayı seçin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
