import React, { useMemo } from 'react'
import {
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Sparkles
} from 'lucide-react'
import { cn } from '../../../../../utils/cn'
import { YeniDosyaTabProps } from '../../../types'
import { useTeminNoChecker } from '../../../../../hooks/useTeminNoChecker'

export function GenelBilgilerVeIdariAntetSection(props: YeniDosyaTabProps): React.JSX.Element {
  const {
    formData,
    setFormData,
    birimler,
    dosyalar = [],
    isEdit,
    editId,
    isDescLoading,
    showKonuSuggestions,
    setShowKonuSuggestions,
    exactMatchCount,
    matchedSuggestions,
    handleAiDescGenerate,
    handleCopyKonuToAciklama,
    openTextGenerator,
    showBirimSearch,
    setShowBirimSearch,
    birimSearchQuery,
    setBirimSearchQuery,
    filteredBirimler,
    handleSelectBirim,
    getNextTeminNo,
    kurum
  } = props

  const targetYear = useMemo(() => {
    return (
      formData.butce_yili ||
      (formData.dosya_acilis_tarihi
        ? new Date(formData.dosya_acilis_tarihi).getFullYear()
        : new Date().getFullYear())
    )
  }, [formData.butce_yili, formData.dosya_acilis_tarihi])

  const currentTargetId = isEdit ? (editId || (formData as any)?.id || null) : ((formData as any)?.id || null)

  // Gerçek Zamanlı (Canlı) SQLite Temin No Mükerrerlik ve Müsaitlik Kontrolü
  const {
    isChecking: isCheckingTeminNo,
    isDuplicate: isDuplicateTeminNo,
    duplicateInfo,
    isAvailable: isAvailableTeminNo,
    nextAvailableNo
  } = useTeminNoChecker(
    formData.temin_no || '',
    targetYear,
    currentTargetId,
    formData.ihale_tipi || undefined
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-blue-500 w-5 h-5" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Genel Bilgiler &amp; İdari Antet Yapısı
          </h2>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Temin Formatı: <strong>{targetYear}/[Sıra No]</strong> (Yıllık Benzersiz)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            Bütçe Yılı *
          </label>
          <select
            value={formData.butce_yili || new Date().getFullYear()}
            onChange={(e) => {
              const newYear = parseInt(e.target.value, 10)
              const oldYear = formData.butce_yili
              let updatedTeminNo = formData.temin_no

              if (newYear && newYear !== oldYear) {
                const oldYearStr = oldYear ? oldYear.toString() : ''
                const isOldPattern =
                  !formData.temin_no ||
                  formData.temin_no.startsWith(`${oldYearStr}/`) ||
                  formData.temin_no.startsWith(`DT${oldYearStr}/`)

                if (isOldPattern && getNextTeminNo) {
                  updatedTeminNo = getNextTeminNo(newYear)
                }
              }

              setFormData({
                ...formData,
                butce_yili: newYear,
                temin_no: updatedTeminNo
              })
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-bold"
          >
            {(() => {
              const currentYear = new Date().getFullYear()
              const startYear = 2020
              const options: number[] = []
              for (let y = currentYear; y >= startYear; y--) {
                options.push(y)
              }
              return options.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))
            })()}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            Bütçe Tipi *
          </label>
          <select
            value={formData.butce_tipi || 'Genel Bütçe'}
            onChange={(e) =>
              setFormData({
                ...formData,
                butce_tipi: e.target.value
              })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-bold"
          >
            <option value="Genel Bütçe">Genel Bütçe</option>
            <option value="Döner Sermaye">Döner Sermaye</option>
            <option value="Özel Bütçe">Özel Bütçe</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-405 flex items-center gap-1.5">
              <span>Doğrudan Temin Numarası *</span>
            </label>
            {isCheckingTeminNo && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Kontrol ediliyor...
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={formData.temin_no || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  temin_no: e.target.value
                })
              }
              onBlur={(e) => {
                let val = e.target.value.trim()
                if (!val) return
                // Çift yıl temizliği (Örn: "2026/2026/1" -> "2026/1")
                const doubleMatch = val.match(/^(\d{4})[/-]\1[/-](\d+)$/)
                if (doubleMatch) {
                  val = `${doubleMatch[1]}/${doubleMatch[2]}`
                } else if (/^\d+$/.test(val)) {
                  // Sadece sayı girildiyse (Örn: "5" -> "2026/5")
                  val = `${targetYear}/${val}`
                }
                setFormData({
                  ...formData,
                  temin_no: val
                })
              }}
              placeholder={`Örn: ${targetYear}/1`}
              className={cn(
                'w-full pl-3.5 pr-24 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs focus:outline-none focus:ring-1 text-slate-800 dark:text-slate-200 font-bold transition-all',
                isDuplicateTeminNo
                  ? 'border-amber-300 dark:border-amber-700/60 focus:ring-amber-400/20 bg-amber-50/20'
                  : isAvailableTeminNo
                  ? 'border-emerald-300 dark:border-emerald-700/50 focus:ring-emerald-400/20'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500'
              )}
            />
            <button
              type="button"
              title="Sıradaki müsait benzersiz numarayı ata"
              onClick={() => {
                const nextNo = nextAvailableNo || (getNextTeminNo ? getNextTeminNo(targetYear) : `${targetYear}/1`)
                setFormData({ ...formData, temin_no: nextNo })
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border-none"
            >
              <RefreshCw size={11} /> Sıradaki No
            </button>
          </div>

          {/* KİBAR & ZARİF BİLGİLENDİRME SATIRI */}
          {isDuplicateTeminNo && duplicateInfo && (
            <div className="flex items-center justify-between gap-2 mt-1.5 px-3 py-1.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 rounded-lg text-xs text-amber-800 dark:text-amber-300 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-amber-500 shrink-0">ℹ️</span>
                <span className="truncate">
                  Bu numara <strong>#{duplicateInfo.id} - {duplicateInfo.konu}</strong> dosyasında kayıtlı.
                </span>
              </div>
              {nextAvailableNo && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, temin_no: nextAvailableNo })}
                  className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded text-[10px] font-semibold transition-colors shrink-0 cursor-pointer"
                >
                  Sıradaki: {nextAvailableNo}
                </button>
              )}
            </div>
          )}

          {isAvailableTeminNo && formData.temin_no && (
            <div className="flex items-center gap-1.5 mt-1 px-1 text-[11px] text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-150">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>Bu numara kullanılabilir.</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450">
              İhale / Dosya Konusu (İşin Adı) *
            </label>
            <button
              type="button"
              onClick={() =>
                openTextGenerator?.(
                  'konu',
                  'Konuyu AI ile Üret',
                  'İhale Konusu',
                  'Verilen metin veya alım işlemine göre en uygun, resmi ve kısa ihale konusunu (İşin Adı) üret. Başka hiçbir açıklama yazma. KESİNLİKLE metnin içerisine veya sonuna "Doğrudan Temin", "Doğrudan Temini" veya "Doğrudan Temin İşi" gibi ifadeler EKLEME. (Örn: "Bez Bayrak ve Sopalı Bayrak Alımı", "Kırtasiye Malzemesi Alımı" şeklinde bitir).'
                )
              }
              className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border-none"
            >
              <Sparkles size={11} /> AI ile Üret
            </button>
          </div>
          <input
            type="text"
            required
            value={formData.konu || ''}
            onChange={(e) => {
              setFormData({ ...formData, konu: e.target.value })
              setShowKonuSuggestions?.(true)
            }}
            onFocus={() => setShowKonuSuggestions?.(true)}
            onBlur={() => {
              setTimeout(() => setShowKonuSuggestions?.(false), 200)
            }}
            placeholder="Alımın konusunu resmi dilde açıklayıcı şekilde girin (Örn: Fen İşleri Kırtasiye Malzemesi Alımı)"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-200 font-semibold"
          />
          {(exactMatchCount ?? 0) > 0 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1.5 flex items-center gap-1 animate-in fade-in duration-200">
              ⚠️ Bu isimde daha önce {exactMatchCount} adet dosya açılmış. Kaydedildiğinde otomatik
              olarak &quot;({(exactMatchCount ?? 0) + 1})&quot; son eki eklenecektir.
            </p>
          )}
          {showKonuSuggestions && (matchedSuggestions ?? []).length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-955/50 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                {formData.konu ? 'Önceki İhale Konuları' : 'Sık Kullanılan İhale Konuları'}
              </div>
              <ul className="max-h-48 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                {(matchedSuggestions ?? []).map((suggestion, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          konu: suggestion
                        }))
                        setShowKonuSuggestions?.(false)
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
                    >
                      <FileText className="text-slate-400 w-3.5 h-3.5" />
                      <span>{suggestion}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
              İşin Açıklaması / Kapsamı{' '}
              <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                (Markdown Desteklenir)
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAiDescGenerate}
                disabled={isDescLoading}
                title="İşin adına göre yapay zeka ile profesyonel açıklama metni oluştur"
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded disabled:opacity-50"
              >
                {isDescLoading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Sparkles size={11} />
                )}
                {isDescLoading ? 'Üretiliyor...' : 'AI ile Üret'}
              </button>
              <button
                type="button"
                onClick={handleCopyKonuToAciklama}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded"
              >
                <Copy size={11} />
                İşin Adını Kopyala
              </button>
            </div>
          </div>
          <textarea
            rows={3}
            value={formData.isin_aciklamasi || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                isin_aciklamasi: e.target.value
              })
            }
            placeholder="İşin detaylı açıklaması veya şartnamedeki kapsam açıklaması..."
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white leading-normal resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Dosya Açılış Tarihi *
          </label>
          <input
            type="date"
            value={formData.dosya_acilis_tarihi || ''}
            onChange={(e) => {
              const newDate = e.target.value
              const oldDate = formData.dosya_acilis_tarihi
              const newYear = newDate ? new Date(newDate).getFullYear() : null
              const oldYear = oldDate ? new Date(oldDate).getFullYear() : null

              let updatedTeminNo = formData.temin_no
              if (newYear && newYear !== oldYear) {
                const oldYearStr = oldYear ? oldYear.toString() : ''
                const isOldPattern =
                  !formData.temin_no ||
                  formData.temin_no.startsWith(`${oldYearStr}/`) ||
                  formData.temin_no.startsWith(`DT${oldYearStr}/`)

                if (isOldPattern && getNextTeminNo) {
                  updatedTeminNo = getNextTeminNo(newYear)
                }
              }

              setFormData({
                ...formData,
                dosya_acilis_tarihi: newDate,
                butce_yili: newYear || formData.butce_yili,
                temin_no: updatedTeminNo
              })
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
          />
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            İhalesi Yapılacak Birim / Müdürlük
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBirimSearch?.(!showBirimSearch)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 text-left"
            >
              <span>
                {formData.birim_id
                  ? birimler.find((b) => b.id === formData.birim_id)?.birim_adi
                  : 'Birim Seçiniz...'}
              </span>
              <Search size={14} className="text-slate-400" />
            </button>

            {showBirimSearch && (
              <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="text"
                  placeholder="Birim ara..."
                  value={birimSearchQuery}
                  onChange={(e) => setBirimSearchQuery?.(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
                  {(filteredBirimler ?? []).length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-450">Birim bulunamadı.</div>
                  ) : (
                    (filteredBirimler ?? []).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBirim?.(b)}
                        className={cn(
                          'w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors',
                          formData.birim_id === b.id &&
                            'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 font-bold'
                        )}
                      >
                        {b.birim_adi}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Birim seçildiğinde antet, sunum makamı ve bütçe kodları otomatik doldurulur.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            İdari Antet Ek Satır
          </label>
          <input
            type="text"
            value={formData.antet_ek_satir || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                antet_ek_satir: e.target.value
              })
            }
            placeholder="Örn: Fen İşleri Dairesi Başkanlığı"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Evrakın Sunulacağı Makam
          </label>
          {(() => {
            const makamOptions = Array.from(
              new Set(
                [kurum?.makam_adi, ...(birimler ? birimler.map((b) => b.sunum_makami) : [])].filter(
                  Boolean
                )
              )
            )
            const isCustom =
              formData.sunulacak_makam && !makamOptions.includes(formData.sunulacak_makam)

            return (
              <div className="space-y-2">
                <select
                  value={isCustom ? 'custom' : formData.sunulacak_makam || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === 'custom') {
                      // Custom seçildiğinde inputu boşaltıp kullanıcının yazmasını bekleyelim
                      setFormData({ ...formData, sunulacak_makam: '' })
                    } else {
                      setFormData({ ...formData, sunulacak_makam: val })
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="">Seçiniz veya elle yazın...</option>
                  {makamOptions.map((makam) => (
                    <option key={makam} value={makam}>
                      {makam}
                    </option>
                  ))}
                  <option value="custom">✍️ Elle Özel Yaz...</option>
                </select>

                {(isCustom || formData.sunulacak_makam === '' || !formData.sunulacak_makam) && (
                  <input
                    type="text"
                    value={formData.sunulacak_makam || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sunulacak_makam: e.target.value
                      })
                    }
                    placeholder="Evrakın sunulacağı makamı yazın..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 animate-in slide-in-from-top-1 duration-200"
                  />
                )}
              </div>
            )
          })()}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            İhtiyaç Yeri
          </label>
          {(() => {
            const seciliBirim = birimler?.find((b) => b.id === formData.birim_id)
            const kurumAdi = kurum?.kurum_adi || ''

            let seciliBirimYerleri: string[] = []
            if (seciliBirim?.ihtiyac_yeri_eki) {
              try {
                if (seciliBirim.ihtiyac_yeri_eki.startsWith('[')) {
                  seciliBirimYerleri = JSON.parse(seciliBirim.ihtiyac_yeri_eki)
                } else {
                  seciliBirimYerleri = seciliBirim.ihtiyac_yeri_eki.split(',').map((s) => s.trim())
                }
              } catch {
                seciliBirimYerleri = [seciliBirim.ihtiyac_yeri_eki]
              }
            }

            const tumBirimYerleri: string[] = []
            if (birimler) {
              birimler.forEach((b) => {
                if (b.ihtiyac_yeri_eki) {
                  try {
                    if (b.ihtiyac_yeri_eki.startsWith('[')) {
                      const parsed = JSON.parse(b.ihtiyac_yeri_eki)
                      if (Array.isArray(parsed)) {
                        tumBirimYerleri.push(...parsed)
                      }
                    } else {
                      tumBirimYerleri.push(...b.ihtiyac_yeri_eki.split(',').map((s) => s.trim()))
                    }
                  } catch {
                    tumBirimYerleri.push(b.ihtiyac_yeri_eki)
                  }
                }
              })
            }

            const dinamikSecenekler = [
              ...seciliBirimYerleri,
              seciliBirim?.birim_adi ? `${seciliBirim.birim_adi} Hizmet Binası` : null,
              seciliBirim?.birim_adi ? `${seciliBirim.birim_adi} Şantiyesi` : null,
              seciliBirim?.birim_adi,
              kurumAdi ? `${kurumAdi} Hizmet Binası` : null
            ].filter(Boolean) as string[]

            const ihtiyacOptions = Array.from(
              new Set(
                [
                  ...dinamikSecenekler,
                  ...tumBirimYerleri,
                  ...(birimler
                    ? birimler.map((b) => (b.birim_adi ? `${b.birim_adi} Hizmet Binası` : null))
                    : [])
                ].filter(Boolean) as string[]
              )
            )
            const isCustom =
              formData.ihtiyac_yeri && !ihtiyacOptions.includes(formData.ihtiyac_yeri)

            return (
              <div className="space-y-2">
                <select
                  value={isCustom ? 'custom' : formData.ihtiyac_yeri || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === 'custom') {
                      setFormData({ ...formData, ihtiyac_yeri: '' })
                    } else {
                      setFormData({ ...formData, ihtiyac_yeri: val })
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="">Seçiniz veya elle yazın...</option>
                  {ihtiyacOptions.map((yer) => (
                    <option key={yer} value={yer}>
                      {yer}
                    </option>
                  ))}
                  <option value="custom">✍️ Elle Özel Yaz...</option>
                </select>

                {(isCustom || formData.ihtiyac_yeri === '' || !formData.ihtiyac_yeri) && (
                  <input
                    type="text"
                    value={formData.ihtiyac_yeri || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ihtiyac_yeri: e.target.value
                      })
                    }
                    placeholder="İhtiyaç yerini yazın..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 animate-in slide-in-from-top-1 duration-200"
                  />
                )}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
