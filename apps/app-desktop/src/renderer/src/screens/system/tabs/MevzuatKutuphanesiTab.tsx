import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  Scale,
  Search,
  Sparkles
} from 'lucide-react'
import { MEVZUAT_KUTUPHANESI, MevzuatItem, MevzuatMadde } from '../data/mevzuat.data'
import { cn } from '../../../utils/cn'

export function MevzuatKutuphanesiTab(): React.JSX.Element {
  const [selectedKategori, setSelectedKategori] = useState<string>('Tümü')
  const [selectedMevzuatId, setSelectedMevzuatId] = useState<string>(MEVZUAT_KUTUPHANESI[0].id)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedMaddeler, setExpandedMaddeler] = useState<Record<string, boolean>>({})
  const [copiedMaddeNo, setCopiedMaddeNo] = useState<string | null>(null)

  const kategoriler = [
    'Tümü',
    'Kanun',
    'Yönetmelik',
    'Muayene ve Kabul',
    'Tebliğ',
    'Esaslar ve Fiyat Farkı',
    'Şartname'
  ]

  // Filtered legislations list
  const filteredMevzuatlar = useMemo(() => {
    return MEVZUAT_KUTUPHANESI.filter((item) => {
      const matchKategori =
        selectedKategori === 'Tümü' || item.kategori === selectedKategori

      if (!searchQuery.trim()) return matchKategori

      const q = searchQuery.toLowerCase()
      const matchHeader =
        item.baslik.toLowerCase().includes(q) ||
        (item.kisaBaslik && item.kisaBaslik.toLowerCase().includes(q)) ||
        item.aciklama.toLowerCase().includes(q)

      const matchMadde = item.maddeler.some(
        (m) =>
          m.no.toLowerCase().includes(q) ||
          m.baslik.toLowerCase().includes(q) ||
          m.metin.toLowerCase().includes(q)
      )

      return matchKategori && (matchHeader || matchMadde)
    })
  }, [selectedKategori, searchQuery])

  // Active legislation selected
  const activeMevzuat = useMemo(() => {
    return (
      filteredMevzuatlar.find((m) => m.id === selectedMevzuatId) ||
      filteredMevzuatlar[0] ||
      MEVZUAT_KUTUPHANESI[0]
    )
  }, [filteredMevzuatlar, selectedMevzuatId])

  // Filtered articles inside active legislation
  const displayedMaddeler = useMemo(() => {
    if (!activeMevzuat) return []
    if (!searchQuery.trim()) return activeMevzuat.maddeler

    const q = searchQuery.toLowerCase()
    return activeMevzuat.maddeler.filter(
      (m) =>
        m.no.toLowerCase().includes(q) ||
        m.baslik.toLowerCase().includes(q) ||
        m.metin.toLowerCase().includes(q)
    )
  }, [activeMevzuat, searchQuery])

  const toggleMadde = (no: string) => {
    setExpandedMaddeler((prev) => ({
      ...prev,
      [no]: !prev[no]
    }))
  }

  const expandAll = () => {
    if (!activeMevzuat) return
    const nextState: Record<string, boolean> = {}
    activeMevzuat.maddeler.forEach((m) => {
      nextState[m.no] = true
    })
    setExpandedMaddeler(nextState)
  }

  const collapseAll = () => {
    setExpandedMaddeler({})
  }

  const handleCopyMadde = async (item: MevzuatItem, madde: MevzuatMadde) => {
    const textToCopy = `【${item.baslik}】\n${madde.no} - ${madde.baslik}\n\n${madde.metin}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedMaddeNo(madde.no)
      setTimeout(() => setCopiedMaddeNo(null), 2000)
    } catch (err) {
      console.error('Kopyalama hatası:', err)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-5 p-6">
      {/* BAŞLIK & BİLGİ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
              KİK & Herpoz Mevzuat Havuzu
            </span>
            <span className="text-xs text-slate-400 font-medium">26 Temel Mevzuat Metni</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Kamu İhale Mevzuat Kütüphanesi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kanun, uygulama yönetmelikleri, tebliğler, muayene-kabul ve genel şartnamelerin madde madde fihristi ve arama sistemi.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Madde no, başlık veya kelime ara..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
      </div>

      {/* SORUMLULUK & REHBER BİLGİLENDİRME BANNERI */}
      <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            Önemli Bilgilendirme & Sorumluluk Reddi (Ücretsiz Yardımcı Yazılım)
          </p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Bu uygulama, kamu personeli ve satın alma birimlerinin iş süreçlerini hızlandırmak, evrak düzenini sağlamak ve dosya takibini kolaylaştırmak amacıyla geliştirilmiş <strong>ücretsiz bir yardımcı araçtır</strong>. Resmî mevzuat hükümleri, parasal limitler ve tebliğler değişkenlik gösterebileceğinden; işlemlerinizde nihai teyit ve kontrol sorumluluğu kullanıcıya (kamu görevlisine / idareye) aittir. Resmî güncel metinler için <strong>Resmî Gazete</strong>, <strong>mevzuat.gov.tr</strong> ve <strong>ihale.gov.tr</strong> kaynaklarını düzenli olarak kontrol ediniz.
          </p>
        </div>
      </div>

      {/* KATEGORİ CHIP'LERİ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {kategoriler.map((kat) => (
          <button
            key={kat}
            onClick={() => setSelectedKategori(kat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
              selectedKategori === kat
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            {kat === 'Kanun' && <Scale className="w-3.5 h-3.5" />}
            {kat === 'Yönetmelik' && <FileText className="w-3.5 h-3.5" />}
            {kat === 'Muayene ve Kabul' && <FileCheck2 className="w-3.5 h-3.5" />}
            {kat === 'Tebliğ' && <Layers className="w-3.5 h-3.5" />}
            {kat === 'Esaslar ve Fiyat Farkı' && <Sparkles className="w-3.5 h-3.5" />}
            {kat}
          </button>
        ))}
      </div>

      {/* İKİ KOLONLU MEVZUAT GEZGİNİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 items-start">
        {/* SOL FİHRİST LİSTESİ */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col max-h-[600px] overflow-hidden">
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Mevzuat Metinleri ({filteredMevzuatlar.length})</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 lowercase font-medium">
              seçim yapın
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {filteredMevzuatlar.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Aramaya uygun mevzuat bulunamadı.
              </div>
            ) : (
              filteredMevzuatlar.map((m) => {
                const isSelected = activeMevzuat?.id === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMevzuatId(m.id)}
                    className={cn(
                      'w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-1 border',
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-semibold shadow-xs'
                        : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800/60'
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="truncate flex-1">{m.baslik}</span>
                      <span
                        className={cn(
                          'text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0',
                          m.kategori === 'Kanun'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : m.kategori === 'Yönetmelik'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                              : m.kategori === 'Muayene ve Kabul'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        )}
                      >
                        {m.kategori}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal line-clamp-1">
                      {m.aciklama}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* SAĞ MADDE DETAY PANELİ */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {activeMevzuat ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              {/* Mevzuat Başlığı ve Dış Bağlantı */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                      {activeMevzuat.kategori}
                    </span>
                    {activeMevzuat.resmiGazete && (
                      <span className="text-[11px] text-slate-400">
                        R.G: {activeMevzuat.resmiGazete}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {activeMevzuat.baslik}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activeMevzuat.aciklama}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeMevzuat.mevzuatGovTrUrl && (
                    <a
                      href={activeMevzuat.mevzuatGovTrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                      title="Mevzuat.gov.tr veya KİK resmi metnine git"
                    >
                      <span>Resmi Metin</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={expandAll}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Tümünü Aç
                  </button>
                  <button
                    onClick={collapseAll}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>

              {/* Maddeler Akordeon Listesi */}
              <div className="mt-4 space-y-3">
                {displayedMaddeler.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Arama kriterine uygun madde bulunamadı.
                  </div>
                ) : (
                  displayedMaddeler.map((madde) => {
                    const isOpen = expandedMaddeler[madde.no] ?? true
                    const isCopied = copiedMaddeNo === madde.no

                    return (
                      <div
                        key={madde.no}
                        className={cn(
                          'rounded-xl border transition-all overflow-hidden',
                          isOpen
                            ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                        )}
                      >
                        {/* Madde Başlık Çubuğu */}
                        <div
                          onClick={() => toggleMadde(madde.no)}
                          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-bold text-xs text-teal-700 dark:text-teal-400 shrink-0 bg-teal-50 dark:bg-teal-950/40 px-2 py-1 rounded-md border border-teal-200 dark:border-teal-800/50">
                              {madde.no}
                            </span>
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                              {madde.baslik}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyMadde(activeMevzuat, madde)
                              }}
                              className={cn(
                                'p-1.5 rounded-md text-xs transition-colors flex items-center gap-1',
                                isCopied
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                              )}
                              title="Maddeyi Kopyala"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-[10px] font-bold">Kopyalandı</span>
                                </>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <ChevronDown
                              className={cn(
                                'w-4 h-4 text-slate-400 transition-transform duration-200',
                                isOpen && 'rotate-180 text-teal-600'
                              )}
                            />
                          </div>
                        </div>

                        {/* Madde Metni */}
                        {isOpen && (
                          <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line bg-white dark:bg-slate-900/80">
                            {madde.metin}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              Lütfen soldaki listeden incelemek istediğiniz bir mevzuat seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
