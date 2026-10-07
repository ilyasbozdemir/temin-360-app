import React, { useState, useEffect } from 'react'
import { Sparkles, X, Loader2, Check, RefreshCw } from 'lucide-react'
import { cn } from '../../utils/cn'
import { sanitizeHtml } from '../../utils/sanitize'
import { AIPrivacyModal } from './AIPrivacyModal'

interface AITextGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fieldName: string
  initialSubject?: string
  initialPrompt?: string
  systemInstruction?: string
  isAdvisorMode?: boolean
  mode?: 'text' | 'json'
  expectedJsonFormat?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onApply: (generatedData: any) => void
  placeholderMappings?: Record<string, string>
}

function generateOfflineExpertResponse(
  prompt: string,
  _title: string,
  fieldName: string,
  isAdvisor: boolean
): string {
  if (isAdvisor) {
    return `### 📋 4734 Sayılı Kamu İhale Kanunu Süreç ve Mevzuat Rehberi

**1. İhale ve Temin Usulü Kontrolü:**
- 4734 Sayılı Kanun'un 22/d maddesi kapsamında doğrudan temin limitleri ve güncel parasal sınır kontrol edilmelidir.
- İhtiyacın kısımlara bölünerek doğrudan teminle karşılanması mevzuata aykırıdır; kalemlerin birbiriyle bütünlüğü gözetilmelidir.

**2. Yaklaşık Maliyet ve Piyasa Fiyat Araştırması:**
- En az 3 (tercihen 5) yetkili/faal firmadan piyasa fiyat araştırma mektubu ve birim fiyat teklif cetveli ile yazılı teklif alınmalıdır.
- Alınan teklifler tutanağa bağlanmalı ve KDV hariç en uygun teklif veren firma kazanan olarak belirlenmelidir.

**3. Görevlendirme ve Onay:**
- Harcama Yetkilisi tarafından "Onay Belgesi" veya "Piyasa Fiyat Araştırması Görevlendirmesi" imzalanmalıdır.
- Muayene ve Kabul Komisyonu veya kabul görevlileri yazılı olarak atanmalıdır.

**4. Kabul ve Ödeme Süreci:**
- Mal teslimi/hizmet ifası sonrası Taşınır İşlem Fişi (TİF) ve Muayene Kabul Tutanağı düzenlenmelidir.
- Fatura, banka bilgileri ve SGK/Vergi borcu yoktur kontrolleri tamamlanarak ödeme emri belgesi hazırlanmalıdır.`
  }

  return `İlgili kamu alımı kapsamında ihtiyaç duyulan ${fieldName.toLowerCase()} için 4734 sayılı Kamu İhale Kanunu ve ilgili mevzuat hükümlerine uygun olarak piyasa rayiçleri, teknik standartlar ve kurum ihtiyaçları gözetilerek işlem tesis edilmiştir.`
}

export function AITextGeneratorModal({
  isOpen,
  onClose,
  title,
  fieldName,
  initialSubject = '',
  initialPrompt = '',
  systemInstruction = '',
  isAdvisorMode = false,
  mode = 'text',
  expectedJsonFormat = '',
  onApply,
  placeholderMappings
}: AITextGeneratorModalProps): React.JSX.Element | null {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [showPrivacy, setShowPrivacy] = useState(false)

  // Set default prompt when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (localStorage.getItem('ai_consent_accepted') !== 'true') {
          setShowPrivacy(true)
        } else {
          setShowPrivacy(false)
        }
      }, 0)

      if (initialPrompt) {
        setPrompt(initialPrompt)
      } else if (initialSubject) {
        setPrompt(
          `"${initialSubject}" konusu için detaylı, resmi ve profesyonel bir kamu ihalesi ${fieldName.toLowerCase()} metni oluştur.`
        )
      } else {
        setPrompt('')
      }
      setResult('')
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) {
      setError('Lütfen yapay zekaya ne yapacağını söyleyen bir talimat girin.')
      return
    }

    setLoading(true)
    setError('')
    try {
      let finalPrompt = systemInstruction
        ? `${systemInstruction}\n\nKullanıcı İsteği:\n${prompt}`
        : prompt

      if (mode === 'json') {
        finalPrompt += `\n\nÖNEMLİ: Yanıtını SADECE geçerli bir JSON formatında dön. Başka hiçbir açıklama, markdown veya text ekleme. Sadece süslü parantezlerle başlayan ham JSON dön.\nBeklenen Format (örnek):\n${
          expectedJsonFormat || '{ "sonuc": "..." }'
        }`
      } else if (isAdvisorMode) {
        finalPrompt += `\n\nÖNEMLİ: Yanıtını LÜTFEN MARKDOWN FORMATINDA (**, ###, listeler vb. kullanarak) okunabilir ve yapılandırılmış olarak üret.`
      } else {
        finalPrompt += `\n\nÖNEMLİ: Yanıtını LÜTFEN HİÇBİR MARKDOWN İŞARETİ KULLANMADAN (**, ###, \`\`\` vb.) düz metin (plain text) olarak üret.`
      }

      // Automatically mask sensitive data in prompt before sending to AI
      if (placeholderMappings) {
        Object.entries(placeholderMappings).forEach(([placeholder, realValue]) => {
          if (realValue !== undefined && realValue !== null) {
            const strVal = String(realValue).trim()
            if (strVal && strVal !== 'Belirtilmemiş') {
              finalPrompt = finalPrompt.replaceAll(strVal, placeholder)
            }
          }
        })

        const placeholdersList = Object.keys(placeholderMappings).join(', ')
        finalPrompt += `\n\nÖNEMLİ GİZLİLİK KURALI: Metin içerisindeki ${placeholdersList} yer tutucularını yanıtında aynen koru. Gerçek değerleri tahmin etmeye çalışma ve bu yer tutucuları değiştirme.`
      }

      const res = await window.api.aiGenerate({
        prompt: finalPrompt,
        enableDatabaseAccess: isAdvisorMode
      })

      if (res.success && res.data) {
        let cleanData = res.data.trim()
        if (mode === 'json') {
          cleanData = cleanData
            .replace(/^```json\s*/, '')
            .replace(/^```\s*/, '')
            .replace(/```$/, '')
            .trim()
          // Validate JSON
          try {
            JSON.parse(cleanData)
          } catch (e) {
            console.warn('AI yanıtı geçerli bir JSON değil, ama yinede yansıtılıyor.', e)
          }
        } else if (!isAdvisorMode) {
          cleanData = cleanData
            .replace(/\*\*/g, '')
            .replace(/### /g, '')
            .replace(/## /g, '')
            .replace(/# /g, '')
            .replace(/```[a-z]*\n/g, '')
            .replace(/```/g, '')
            .trim()
        }
        if (placeholderMappings) {
          Object.entries(placeholderMappings).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              cleanData = cleanData.replaceAll(key, value)
            }
          })
        }
        setResult(cleanData)
      } else {
        const offlineDraft = generateOfflineExpertResponse(prompt, title, fieldName, isAdvisorMode)
        setResult(offlineDraft)
        setError(
          'API bağlantısı kurulamadı. Çevrimdışı mevzuat motoru ile standart uzman rehber metni hazırlandı.'
        )
      }
    } catch {
      const offlineDraft = generateOfflineExpertResponse(prompt, title, fieldName, isAdvisorMode)
      setResult(offlineDraft)
      setError('Çevrimdışı mevzuat motoru ile standart uzman rehber metni hazırlandı.')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (): void => {
    if (mode === 'json') {
      try {
        const parsedData = JSON.parse(result)
        onApply(parsedData)
      } catch {
        setError(
          'Oluşturulan metin geçerli bir JSON formatında değil. Lütfen düzenleyip tekrar deneyin.'
        )
        return
      }
    } else {
      onApply(result)
    }
    onClose()
  }

  if (!isOpen) return null

  if (showPrivacy) {
    return (
      <AIPrivacyModal
        onAccept={() => {
          localStorage.setItem('ai_consent_accepted', 'true')
          setShowPrivacy(false)
        }}
        onDecline={() => {
          setShowPrivacy(false)
          onClose()
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden',
          'animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100">{title}</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isAdvisorMode
                  ? 'Yapay zekaya danışın ve süreç hakkında bilgi alın'
                  : 'Yapay zeka ile metin oluşturun ve düzenleyin'}
              </p>
            </div>
          </div>
          <button
            title="Kapat"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
          {/* Instructions Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">
              {isAdvisorMode ? "Yapay Zeka'ya Mesajınız veya Sorunuz" : 'Yapay Zekaya Talimatınız'}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (!loading && prompt.trim()) {
                    handleGenerate()
                  }
                }
              }}
              placeholder={
                isAdvisorMode
                  ? 'Yapay zekaya sormak istediğiniz soruyu veya tavsiye konusunu yazın...'
                  : 'Yapay zekanın nasıl bir metin üretmesini istediğinizi yazın (örn: Belediye binası temizlik işi ihalesi için idari şartnameye uygun iş tanımı oluştur.)'
              }
              className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-800 dark:text-slate-250 font-semibold custom-scrollbar"
            />
          </div>

          {/* Quick templates */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 flex items-center mr-1">
              Örnekler:
            </span>

            {isAdvisorMode ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      'Bu dosyanın bir sonraki yasal/idari aşamalarını ve kritik süreçlerini listele.'
                    )
                  }
                  className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
                >
                  Sonraki Aşamalar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      'Bu doğrudan temin dosyası için mevzuata (4734 Sayılı Kanun) uygunluk analizi yap ve varsa riskli kısımları uyar.'
                    )
                  }
                  className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
                >
                  Mevzuat Analizi
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      'Bu tür bir alım için en doğru piyasa fiyat araştırması yöntemi ne olmalıdır? Nereden teklif istenmeli?'
                    )
                  }
                  className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
                >
                  Piyasa Araştırması
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      'Bu dosya için örnek bir komisyon onay yazısı veya gerekçe taslağı oluşturur musun?'
                    )
                  }
                  className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
                >
                  Onay Taslağı
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      `"${
                        initialSubject || 'Mal Alımı'
                      }" ihalesi için resmi teknik/idari açıklama hazırlığı yap.`
                    )
                  }
                  className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
                >
                  Resmi Açıklama
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      `"${
                        initialSubject || 'Hizmet Alımı'
                      }" işinin kapsamını maddeler halinde listele.`
                    )
                  }
                  className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
                >
                  Kapsam Maddeleri
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      `"${
                        initialSubject || 'Yapım İşi'
                      }" için ihale teknik şartnamesine uygun özet metin oluştur.`
                    )
                  }
                  className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
                >
                  Şartname Özeti
                </button>
              </>
            )}
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-2.5 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-500/20 disabled:opacity-55"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {isAdvisorMode ? 'Analiz Ediliyor...' : 'Metin Oluşturuluyor...'}
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {isAdvisorMode ? 'Yapay Zekaya Danış' : 'Metni Üret'}
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs">
              ⚠️ {error}
            </div>
          )}

          {/* AI Result Area */}
          {(result || loading) && (
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAdvisorMode
                    ? 'Sohbet & Tavsiye Sonucu'
                    : `Üretilen ${mode === 'json' ? 'JSON Verisi' : 'Metin'} (Düzenleyebilirsiniz)`}
                </label>
                {result && !isAdvisorMode && (
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 font-semibold border-none bg-transparent"
                  >
                    <RefreshCw size={10} /> Yenile
                  </button>
                )}
              </div>

              {isAdvisorMode ? (
                <div className="space-y-3 flex flex-col mt-2">
                  {/* User Balloon */}
                  <div className="flex gap-2.5 flex-row-reverse animate-in fade-in zoom-in-95">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-none">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-slate-600 dark:text-slate-300"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-tr-sm">
                      {prompt.split('\n').map((line, li) => (
                        <p key={li}>{line || <br />}</p>
                      ))}
                    </div>
                  </div>

                  {/* AI Balloon */}
                  <div className="flex gap-2.5 flex-row animate-in fade-in zoom-in-95 delay-100">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-none">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm">
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                          <span className="text-slate-500 italic">Asistan değerlendiriyor...</span>
                        </div>
                      ) : (
                        <div
                          className="space-y-1.5 [&>p]:mb-2 last:[&>p]:mb-0 [&_strong]:font-extrabold [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(
                              result
                                // Header
                                .replace(
                                  /### (.*?)\n/g,
                                  '<h3 class="text-sm font-bold mt-3 mb-1 text-purple-600 dark:text-purple-400">$1</h3>'
                                )
                                .replace(
                                  /## (.*?)\n/g,
                                  '<h2 class="text-base font-extrabold mt-4 mb-2 text-slate-900 dark:text-white">$1</h2>'
                                )
                                // Bold
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                // Italic
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                // Lists
                                .replace(/^- (.*)/gm, '<li>$1</li>')
                                // New lines (only if not wrapped in tags to avoid <br> between list items, simple logic: just newline)
                                // First wrap consecutive list items in <ul>
                                .replace(
                                  /(<li>.*<\/li>\n?)+/g,
                                  (match) => `<ul class="my-2">${match}</ul>`
                                )
                                // Then convert remaining \n to <br/>
                                .replace(/\n/g, '<br/>')
                                .replace(/<br\/><\/ul>/g, '</ul>')
                                .replace(/<br\/><li/g, '<li')
                            )
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {loading ? (
                    <div className="w-full h-40 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                      <span className="text-xs text-slate-450 italic">AI metin yazıyor...</span>
                    </div>
                  ) : (
                    <textarea
                      rows={mode === 'json' ? 10 : 6}
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white leading-normal font-semibold resize-y font-mono"
                    />
                  )}
                </>
              )}

              {result && !loading && !isAdvisorMode && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-xl text-[10px] font-semibold flex items-start gap-1.5 mt-3 mb-2 animate-in fade-in">
                  <span className="text-xs">⚠️</span>
                  <span className="leading-relaxed">
                    Yapay zeka tarafından üretilen içerikler, <b>ekonomik kodlar</b>, bütçe
                    tertipleri ve diğer teknik veriler hata veya tutarsızlık içerebilir. Lütfen
                    doğruluğunu <b>teyit etmeden</b> kaydetmeyiniz.
                  </span>
                </div>
              )}

              {result && !loading && (
                <button
                  type="button"
                  onClick={isAdvisorMode ? onClose : handleApply}
                  className={cn(
                    'w-full py-2.5 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md',
                    isAdvisorMode
                      ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20'
                      : 'bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20'
                  )}
                >
                  <Check size={14} />
                  {isAdvisorMode ? 'Teşekkürler, Kapat' : 'Forma Uygula ve Kapat'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
