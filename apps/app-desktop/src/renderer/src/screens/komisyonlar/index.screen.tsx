import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Edit2,
  FileSearch,
  FileText,
  Filter,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Trash2,
  Users
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { KomisyonOlusturModal } from './components/KomisyonOlusturModal'
import { PersonelAtaModal } from './components/PersonelAtaModal'
import { useTabStore } from '../../store/tabStore'
import { useDosyaAsamasiSablons } from '../dosya/sub-screens/DosyaAsamalari/useDosyaAsamasiSablons'
import { DocumentPreviewModal } from '../dosya/components/DocumentPreviewModal'

export default function KomisyonlarScreen({
  isSubComponent = false
}: {
  isSubComponent?: boolean
}): React.JSX.Element {
  const { addTab } = useTabStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKomisyonId, setEditingKomisyonId] = useState<number | null>(null)

  const [isAtaModalOpen, setIsAtaModalOpen] = useState(false)
  const [ataRoleId, setAtaRoleId] = useState<number | null>(null)

  // Şablon Önizleme ve Çıktı Altyapısı
  const {
    activeDosyaId,
    masterHtml,
    dosyaContext,
    placeholders,
    contextsByPath,
    personelListesi,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    executePrint,
    executeExportPdf,
    refreshSnapshot,
    saveSnapshot
  } = useDosyaAsamasiSablons()
  const [ataKomisyonId, setAtaKomisyonId] = useState<number | null>(null)

  // Oluşturulmuş Komisyonları Çek
  const { data: komisyonlar = [], isLoading: isKomisyonLoading } = useQuery({
    queryKey: ['komisyonlar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon WHERE aktif_mi = 1 ORDER BY id DESC'
      )
      if (!res.success) throw new Error(res.error)

      // Get members for all active commissions
      const membersRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT u.id as role_id, u.komisyon_id, u.asil_mi, u.personel_id, p.ad_soyad, p.unvan, g.ad as gorev_adi 
         FROM TANIM_KomisyonUye u
         LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
         JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id`
      )

      const sablonlarRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT ks.komisyon_id, s.id, s.ad, s.aciklama, s.icerik, s.dosya_adi, s.route_path, s.test_verisi, s.kategori 
         FROM TANIM_Komisyon_Sablon ks
         JOIN TANIM_Sablon s ON ks.sablon_id = s.id
         WHERE s.aktif_mi = 1`
      )

      const komisyonlarData = res.data.map((k: any) => ({
        ...k,
        uyeler: membersRes.success
          ? membersRes.data.filter((m: any) => m.komisyon_id === k.id)
          : [],
        sablonlar: sablonlarRes.success
          ? sablonlarRes.data.filter((s: any) => s.komisyon_id === k.id)
          : []
      }))

      return komisyonlarData
    }
  })

  const [procurementFilter, setProcurementFilter] = useState<'all' | 'dogrudan_temin' | 'ihale'>(() => {
    const saved = localStorage.getItem('temin_procurement_mode')
    return (saved as 'dogrudan_temin' | 'ihale') || 'dogrudan_temin'
  })

  // Global mod değişimini dinle
  React.useEffect(() => {
    const handleMode = (e: any) => {
      if (e.detail?.mode) {
        setProcurementFilter(e.detail.mode)
      }
    }
    window.addEventListener('procurement-mode-change', handleMode)
    return () => window.removeEventListener('procurement-mode-change', handleMode)
  }, [])

  const getIconForTur = (ad: string) => {
    if (ad.toLowerCase().includes('fiyat')) {
      return <FileSearch className="w-4 h-4 shrink-0" />
    }
    if (ad.toLowerCase().includes('muayene') || ad.toLowerCase().includes('kabul')) {
      return <CheckCircle2 className="w-4 h-4 shrink-0" />
    }
    return <ShieldCheck className="w-4 h-4 shrink-0" />
  }

  const isKomisyonMatchingMode = (k: any, mode: 'all' | 'dogrudan_temin' | 'ihale'): boolean => {
    if (mode === 'all') return true
    const text = `${k.ad || ''} ${k.aciklama || ''}`.toLowerCase()
    if (mode === 'dogrudan_temin') {
      // Doğrudan Temin Komisyonları
      return (
        text.includes('fiyat') ||
        text.includes('piyasa') ||
        text.includes('doğrudan') ||
        text.includes('temin') ||
        text.includes('22') ||
        text.includes('maliyet') ||
        text.includes('muayene') ||
        text.includes('kabul') ||
        text.includes('teslim')
      )
    }
    if (mode === 'ihale') {
      // İhale Komisyonları & Muayene Kabul
      return (
        text.includes('ihale') ||
        text.includes('pazarlık') ||
        text.includes('şartname') ||
        text.includes('kik') ||
        text.includes('hakediş') ||
        text.includes('muayene') ||
        text.includes('kabul') ||
        text.includes('tespit') ||
        !text.includes('22')
      )
    }
    return true
  }

  const filteredKomisyonlar = komisyonlar.filter((k: any) => {
    const matchesSearch = k.ad.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMode = isKomisyonMatchingMode(k, procurementFilter)
    return matchesSearch && matchesMode
  })

  return (
    <div
      className={
        isSubComponent
          ? 'flex flex-col h-full space-y-6 w-full animate-in fade-in duration-200'
          : 'flex flex-col h-full space-y-6'
      }
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Komisyon Yönetimi {procurementFilter === 'dogrudan_temin' ? '(Doğrudan Temin)' : procurementFilter === 'ihale' ? '(İhale Süreçleri)' : ''}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kurum içi görevlendirilecek komisyon asil ve yedek üyelerini (KİK 22/d Fiyat Araştırma & KİK 19/21 İhale Heyetleri) buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            onClick={() => {
              setEditingKomisyonId(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4" /> Komisyon Oluştur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 items-start flex-1 min-h-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col overflow-hidden relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Komisyon adı veya üye ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              />
            </div>

            {/* Süreç Usulü Mod Filtreleyici */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setProcurementFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  procurementFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tümü ({komisyonlar.length})
              </button>
              <button
                type="button"
                onClick={() => setProcurementFilter('dogrudan_temin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  procurementFilter === 'dogrudan_temin'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <span>🛒 Doğrudan Temin</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  procurementFilter === 'dogrudan_temin' ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-800'
                }`}>
                  {komisyonlar.filter((k: any) => isKomisyonMatchingMode(k, 'dogrudan_temin')).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setProcurementFilter('ihale')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  procurementFilter === 'ihale'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <span>🏛️ İhale Komisyonları</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  procurementFilter === 'ihale' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800'
                }`}>
                  {komisyonlar.filter((k: any) => isKomisyonMatchingMode(k, 'ihale')).length}
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-xl flex flex-col p-6">
            {isKomisyonLoading ? (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                Yükleniyor...
              </div>
            ) : filteredKomisyonlar.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Kayıtlı Komisyon Bulunamadı
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Henüz bir komisyon tanımı bulunmuyor. Yeni bir komisyon eklemek için yukarıdaki
                    "Komisyon Oluştur" butonunu kullanabilirsiniz.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredKomisyonlar.map((komisyon: any) => (
                  <div
                    key={komisyon.id}
                    className="group flex flex-col p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                          {getIconForTur(komisyon.ad)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                            {komisyon.ad}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              <Users className="w-3.5 h-3.5" />
                              {komisyon.uyeler?.length || 0} Üye
                            </span>
                            {komisyon.sablonlar?.length > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <FileText className="w-3.5 h-3.5" />
                                {komisyon.sablonlar.length} Belge
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Top Actions */}
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingKomisyonId(komisyon.id)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Bu komisyonu silmek istediğinize emin misiniz?')) {
                              const res = await window.electron.ipcRenderer.invoke(
                                'db:run',
                                'UPDATE TANIM_Komisyon SET aktif_mi = 0 WHERE id = ?',
                                [komisyon.id]
                              )
                              if (res.success) {
                                queryClient.invalidateQueries({
                                  queryKey: ['komisyonlar']
                                })
                              } else {
                                alert('Silme işlemi başarısız oldu: ' + res.error)
                              }
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-5 flex-1 flex flex-col">
                      <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest px-1">
                        Üretilebilir Belgeler
                      </div>
                      {komisyon.sablonlar && komisyon.sablonlar.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {komisyon.sablonlar.map((sablon: any) => (
                            <button
                              key={sablon.id}
                              onClick={() => {
                                if (!activeDosyaId) {
                                  alert(
                                    'Lütfen önce sol menüden veya "Dosyalar" altından bir dosya/proje açın. Belgeler, aktif dosya verileri kullanılarak hazırlanmaktadır.'
                                  )
                                  return
                                }
                                handleOpenPreviewForSablon(sablon, sablon.ad)
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-left shadow-sm hover:shadow"
                            >
                              <Printer className="w-3.5 h-3.5 shrink-0" />
                              <span className="line-clamp-1">{sablon.ad}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 dark:text-slate-500 italic mb-4 px-1">
                          Bu komisyona atanmış belge şablonu bulunmuyor.
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        variant="outline"
                        className="w-full justify-center gap-2 rounded-xl border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-900/20 dark:text-slate-300 dark:hover:text-blue-400 font-bold shadow-sm transition-all h-10"
                        onClick={() => {
                          addTab('/komisyonlar/detay?id=' + komisyon.id)
                        }}
                      >
                        <Users className="w-4 h-4" />
                        Kadro ve Üyeleri Yönet
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <KomisyonOlusturModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingKomisyonId(null)
        }}
        komisyonId={editingKomisyonId}
        onPreviewSablon={(sablon) => {
          if (!activeDosyaId) {
            alert(
              'Lütfen önce sol menüden veya "Dosyalar" altından bir dosya/proje açın. Belgeler, aktif dosya verileri kullanılarak hazırlanmaktadır.'
            )
            return
          }
          handleOpenPreviewForSablon(sablon, sablon.ad)
        }}
      />

      <PersonelAtaModal
        isOpen={isAtaModalOpen}
        onClose={() => {
          setIsAtaModalOpen(false)
          setAtaRoleId(null)
          setAtaKomisyonId(null)
        }}
        roleId={ataRoleId}
        komisyonId={ataKomisyonId}
      />

      {previewData && previewModalOpen && (
        <DocumentPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title={previewData.title}
          templateHtml={previewData.templateHtml}
          masterHtml={masterHtml || ''}
          baseContext={
            previewData.snapshotContext || contextsByPath[previewData.processPath] || dosyaContext
          }
          placeholders={placeholders}
          personelListesi={personelListesi}
          onPrint={executePrint}
          onExportPdf={executeExportPdf}
          isInline={false}
          templateTestVerisi={previewData.templateTestVerisi}
          dosyaAdi={previewData.dosyaAdi}
          onRefreshSnapshot={refreshSnapshot}
          onSaveSnapshot={saveSnapshot}
        />
      )}
    </div>
  )
}
