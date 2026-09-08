import React, { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Building2,
  CheckCircle2,
  ExternalLink,
  Filter,
  PlusCircle,
  Search,
  Sparkles,
  X
} from 'lucide-react'
import {
  getDinamikFiyatDonemleri,
  POZ_KURUMLARI,
  PozItem
} from './pozKitaplari.data'
import { useTabStore } from '../../../store/tabStore'
import { APP_ROUTES } from '../../../constants/routeConstants'

export type SelectedPozData = PozItem

interface PozSecimModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPoz: (data: SelectedPozData) => void
  currentPozNo?: string
  currentYear?: number
}

export const PozSecimModal: React.FC<PozSecimModalProps> = ({
  isOpen,
  onClose,
  onSelectPoz,
  currentPozNo = '',
  currentYear = new Date().getFullYear()
}) => {
  const [activeTab, setActiveTab] = useState<'katalog' | 'ozel_poz'>('katalog')

  // Veritabanından Yapım Pozları
  const [dbPozlar, setDbPozlar] = useState<PozItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Filtreler
  const [selectedKurum, setSelectedKurum] = useState<string>('ALL')
  const [selectedYil, setSelectedYil] = useState<number>(currentYear)
  const [selectedDonem, setSelectedDonem] = useState<string>(`${currentYear}/1`)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Özel Poz Form State
  const [ozelPozNo, setOzelPozNo] = useState<string>(
    currentPozNo?.startsWith('ÖZEL') || currentPozNo?.startsWith('ÖZ')
      ? currentPozNo
      : 'ÖZEL.01'
  )
  const [ozelPozAdi, setOzelPozAdi] = useState<string>('')
  const [ozelPozBirim, setOzelPozBirim] = useState<string>('m²')
  const [ozelPozKurum, setOzelPozKurum] = useState<string>('ÇŞB')
  const [ozelPozYili, setOzelPozYili] = useState<number>(currentYear)
  const [ozelFiyatDonemi, setOzelFiyatDonemi] = useState<string>(`${currentYear}/1`)
  const [ozelOkasKodu, setOzelOkasKodu] = useState<string>('45000000')
  const [ozelYapiSinifi, setOzelYapiSinifi] = useState<string>('Genel Yapım İşleri')
  const [ozelAnalizTarifi, setOzelAnalizTarifi] = useState<string>('')

  // Dinamik Fiyat Araştırma Dönemleri Listesi
  const katalogDinamikDonemler = useMemo(
    () => getDinamikFiyatDonemleri(selectedYil),
    [selectedYil]
  )

  const ozelPozDinamikDonemler = useMemo(
    () => getDinamikFiyatDonemleri(ozelPozYili),
    [ozelPozYili]
  )

  // Pozları veritabanından dinamik çek
  useEffect(() => {
    if (!isOpen) return

    const loadPozlar = async () => {
      try {
        setIsLoading(true)
        if (window.electron?.ipcRenderer) {
          const res = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT * FROM TANIM_Kalem 
             WHERE tipi = 'Yapım' 
                OR (poz_no IS NOT NULL AND poz_no != '')
             ORDER BY id DESC`
          )
          if (res?.success && Array.isArray(res.data)) {
            const mapped: PozItem[] = res.data.map((item: any) => ({
              id: item.id,
              poz_no: item.poz_no || item.barkod_id || `POZ-${item.id}`,
              kalem_adi: item.kalem_adi,
              poz_tanimi: item.poz_tanimi || item.kalem_adi,
              birim: item.birim || item.olcu_birimi || 'm²',
              poz_kurumu: item.kategori || item.poz_grubu_ref_id || 'ÇŞB',
              poz_yili: item.poz_yili ? Number(item.poz_yili) : undefined,
              fiyat_donemi: item.fiyat_donemi || '',
              okas_kodu: item.okas_kodu || '45000000',
              yapi_sinifi: item.yapi_sinifi || item.kategori || 'Genel Yapım İşleri',
              ozelligi: item.ozelligi || item.notlar || ''
            }))
            setDbPozlar(mapped)
          }
        }
      } catch (e) {
        console.error('Pozlar yüklenemedi:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadPozlar()
  }, [isOpen])

  // Filtreleme
  const filteredPozlar = useMemo(() => {
    return dbPozlar.filter((item) => {
      // Kurum Filtresi
      if (selectedKurum !== 'ALL') {
        const itemKurum = (item.poz_kurumu || '').toLowerCase()
        const targetKurum = selectedKurum.toLowerCase()
        if (
          !itemKurum.includes(targetKurum) &&
          !POZ_KURUMLARI.find((k) => k.id === selectedKurum)?.name.toLowerCase().includes(itemKurum)
        ) {
          return false
        }
      }

      // Yıl Filtresi
      if (selectedYil && item.poz_yili && item.poz_yili !== selectedYil) {
        return false
      }

      // Arama
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchNo = item.poz_no?.toLowerCase().includes(q)
        const matchAdi = item.kalem_adi?.toLowerCase().includes(q)
        const matchTanim = item.poz_tanimi?.toLowerCase().includes(q)
        const matchKurum = item.poz_kurumu?.toLowerCase().includes(q)
        const matchYapi = item.yapi_sinifi?.toLowerCase().includes(q)
        const matchOkas = item.okas_kodu?.toLowerCase().includes(q)
        return matchNo || matchAdi || matchTanim || matchKurum || matchYapi || matchOkas
      }

      return true
    })
  }, [dbPozlar, selectedKurum, selectedYil, searchQuery])

  if (!isOpen) return null

  const handleSelectPozItem = (item: PozItem) => {
    onSelectPoz({
      ...item,
      fiyat_donemi: selectedDonem || item.fiyat_donemi || `${selectedYil}/1`,
      poz_yili: selectedYil || item.poz_yili
    })
    onClose()
  }

  const handleOpenPozlarScreen = () => {
    onClose()
    useTabStore.getState().addTab(APP_ROUTES.POZLAR)
  }

  const handleApplyOzelPoz = () => {
    if (!ozelPozAdi.trim()) {
      alert('Lütfen Poz / İmalat Tanımı ve Adını giriniz.')
      return
    }
    if (!ozelPozNo.trim()) {
      alert('Lütfen Poz Numarasını giriniz.')
      return
    }

    onSelectPoz({
      poz_no: ozelPozNo.trim(),
      kalem_adi: ozelPozAdi.trim(),
      poz_tanimi: ozelPozAdi.trim(),
      birim: ozelPozBirim,
      yapi_sinifi: ozelYapiSinifi,
      okas_kodu: ozelOkasKodu.trim(),
      poz_yili: ozelPozYili,
      fiyat_donemi: ozelFiyatDonemi,
      poz_kurumu: ozelPozKurum.trim(),
      ozelligi: ozelAnalizTarifi.trim() || `Özel Analizli Poz (${ozelPozNo})`
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Birim Fiyat Pozları & Özel İmalat Seçimi
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                  Yapım İşleri
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resmî Bakanlık/İdare Birim Fiyat Kitapları (ÇŞB, KGM, DSİ vb.) ve Kuruma Özel Pozlar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleOpenPozlarScreen}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              title="Birim Fiyat Pozları yönetim ekranını tam sayfa aç"
            >
              <ExternalLink size={13} />
              <span>Birim Fiyat Pozları Ekranı</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Bilgilendirme Bannerı */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-50 via-amber-50/50 to-orange-50 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <Sparkles size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Hızlı Poz Aktarımı:</strong> Bakanlık/idare pozlarını veya özel pozlarınızı <em>Birim Fiyat Pozları</em> ekranından (Excel veya tek tek) ekleyip bu havuzdan anında tek tıkla kaleminize aktarabilirsiniz.
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('katalog')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'katalog'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen size={16} />
            <span>Kayıtlı Poz Havuzu ({filteredPozlar.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ozel_poz')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ozel_poz'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PlusCircle size={16} />
            <span>Kitapta Olmayan Özel Poz Tanımla (Analizli & Detaylı)</span>
          </button>
        </div>

        {/* Tab 1: Kayıtlı Poz Havuzu */}
        {activeTab === 'katalog' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Filtre ve Arama Alanı */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              {/* Kurumlar Yatay Filtre */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Filter size={12} /> Kurum:
                </span>
                {POZ_KURUMLARI.map((kurum) => (
                  <button
                    key={kurum.id}
                    type="button"
                    onClick={() => setSelectedKurum(kurum.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
                      selectedKurum === kurum.id
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    {kurum.badge}
                  </button>
                ))}
              </div>

              {/* Yıl, Fiyat Araştırma Dönemi ve Arama Inputu */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Poz / Fiyat Yılı
                  </label>
                  <input
                    type="number"
                    value={selectedYil}
                    onChange={(e) => setSelectedYil(Number(e.target.value) || new Date().getFullYear())}
                    placeholder="Yıl (Örn: 2026)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Fiyat Araştırma Dönemi
                  </label>
                  <input
                    type="text"
                    list="katalog-fiyat-donem-list"
                    value={selectedDonem}
                    onChange={(e) => setSelectedDonem(e.target.value)}
                    placeholder="Dönem (Örn: 2026/1)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                  />
                  <datalist id="katalog-fiyat-donem-list">
                    {katalogDinamikDonemler.map((d) => (
                      <option key={d.kod} value={d.kod}>
                        {d.etiket}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div className="sm:col-span-6 relative">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Hızlı Filtrele & Ara
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={15}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Poz No, İmalat Adı veya OKAS Kodu Ara..."
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Poz Listesi */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {isLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs">Pozlar yükleniyor...</div>
              ) : filteredPozlar.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                  <Building2 size={40} className="opacity-30 text-amber-600" />
                  <div className="space-y-1 max-w-md">
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      Kayıtlı poz bulunamadı.
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Resmî birim fiyat kitaplarından pozları eklemek için <strong>Birim Fiyat Pozları</strong> ekranını kullanabilir veya kitap dışı analizli özel poz tanımlayabilirsiniz.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ozel_poz')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <PlusCircle size={14} /> Yeni Özel Poz Tanımla
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenPozlarScreen}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink size={14} /> Poz Yönetim Ekranı
                    </button>
                  </div>
                </div>
              ) : (
                filteredPozlar.map((item) => (
                  <div
                    key={item.id || item.poz_no}
                    onClick={() => handleSelectPozItem(item)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-slate-900/90 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
                          {item.poz_no}
                        </span>
                        {item.poz_kurumu && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.poz_kurumu}
                          </span>
                        )}
                        {item.yapi_sinifi && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                            {item.yapi_sinifi}
                          </span>
                        )}
                        {item.okas_kodu && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                            CPV: {item.okas_kodu}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-900 dark:group-hover:text-amber-300 line-clamp-2 leading-relaxed">
                        {item.kalem_adi || item.poz_tanimi}
                      </p>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-medium">Birim</span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">
                          {item.birim || 'm²'}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 group-hover:scale-105"
                      >
                        <CheckCircle2 size={14} /> Seç
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Kitapta Olmayan Özel Poz / Resmî Poz Tanımla */}
        {activeTab === 'ozel_poz' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-3">
              <Sparkles className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>Özel & Resmî Poz Tanımlama:</strong> Bakanlık kitaplarında yer almayan veya idarenizce özel analiz gerektiren yapım işleri için poz numarası, fiyat araştırma dönemi (yıl/dönem/ay) ve teknik tarif belirleyebilirsiniz.
              </div>
            </div>

            {/* 1. Satır: Kurum ve Poz No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kurum / Kitap Türü <span className="text-red-500">*</span>
                </label>
                <select
                  value={ozelPozKurum}
                  onChange={(e) => setOzelPozKurum(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  {POZ_KURUMLARI.filter((k) => k.id !== 'ALL').map((k) => (
                    <option key={k.id} value={k.name}>
                      {k.badge} - {k.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Poz Numarası <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ozelPozNo}
                  onChange={(e) => setOzelPozNo(e.target.value)}
                  placeholder="Örn: 15.150.1002 veya ÖZEL.01"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Hızlı Şablon:</span>
                  {['ÖZEL.01', 'ÖZEL.YPM.01', 'İDARE.01', '15.150.1002', 'DSİ.01', 'KGM.01'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setOzelPozNo(tag)}
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-900/40 dark:hover:text-amber-300 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Satır: Poz / İmalat Tanımı ve Adı (Tam Genişlik) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Poz / İmalat Tanımı ve Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ozelPozAdi}
                onChange={(e) => setOzelPozAdi(e.target.value)}
                placeholder="Örn: C 25/30 basınç dayanım sınıfında hazır beton dökülmesi veya Özel İmalat Ahşap Akustik Panel Kaplama..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 3. Satır: Poz Yılı ve Fiyat Araştırma Dönemi (Yan yana!) + Ölçü Birimi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Poz / Fiyat Yılı <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={ozelPozYili}
                  onChange={(e) => setOzelPozYili(Number(e.target.value) || new Date().getFullYear())}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fiyat Araştırma Dönemi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="ozel-fiyat-donem-list"
                  value={ozelFiyatDonemi}
                  onChange={(e) => setOzelFiyatDonemi(e.target.value)}
                  placeholder={`Örn: ${ozelPozYili}/1 veya ${ozelPozYili} Ocak`}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
                <datalist id="ozel-fiyat-donem-list">
                  {ozelPozDinamikDonemler.map((d) => (
                    <option key={d.kod} value={d.kod}>
                      {d.etiket}
                    </option>
                  ))}
                </datalist>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  (1. Dönem: Yıl Başı / Ocak-Haziran, 2. Dönem: Temmuz-Aralık veya Ay bazlı)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ölçü Birimi <span className="text-red-500">*</span>
                </label>
                <select
                  value={ozelPozBirim}
                  onChange={(e) => setOzelPozBirim(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="m²">Metrekare (m²)</option>
                  <option value="m³">Metreküp (m³)</option>
                  <option value="mt">Metre / Metretül (mt)</option>
                  <option value="ton">Ton (ton)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="Adet">Adet (Adet)</option>
                  <option value="Set">Set / Takım (Set)</option>
                  <option value="Götürü">Götürü Bedel (Götürü)</option>
                </select>
              </div>
            </div>

            {/* 4. Satır: OKAS Kodu ve Yapı Sınıfı */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  İlgili OKAS / CPV Kodu
                </label>
                <input
                  type="text"
                  value={ozelOkasKodu}
                  onChange={(e) => setOzelOkasKodu(e.target.value)}
                  placeholder="Örn: 45000000 (İnşaat İşleri)"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Yapı Sınıfı / İş Grubu
                </label>
                <input
                  type="text"
                  value={ozelYapiSinifi}
                  onChange={(e) => setOzelYapiSinifi(e.target.value)}
                  placeholder="Örn: III. Sınıf A Grubu Yapılar veya Genel Yapım İşleri"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* 5. Satır: Analiz Tarifi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Analiz Tarifi & Teknik Şartname Açıklaması
              </label>
              <textarea
                value={ozelAnalizTarifi}
                onChange={(e) => setOzelAnalizTarifi(e.target.value)}
                placeholder="Pozun analiz içeriği, malzeme gereksinimleri, işçilik tarifleri ve piyasa rayiç araştırma esasları..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 min-h-[90px] resize-y"
              />
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {activeTab === 'katalog' ? (
              <span>💡 Veritabanında kayıtlı pozlardan seçebilir veya yeni poz ekleyebilirsiniz.</span>
            ) : (
              <span>✨ Poz bilgileri form alanlarına ve yaklaşık maliyet cetvellerine aktarılır.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              Vazgeç
            </button>

            {activeTab === 'ozel_poz' && (
              <button
                type="button"
                onClick={handleApplyOzelPoz}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                Pozu Forma Aktar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
