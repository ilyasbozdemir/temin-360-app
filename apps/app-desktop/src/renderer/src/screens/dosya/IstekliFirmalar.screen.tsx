import React, { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import {
  Building2,
  Compass,
  Copy,
  Eye,
  FileText,
  Search,
  Trash2,
  Upload,
  UserPlus,
  X
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { SubScreen } from './SubScreen'

export function IstekliFirmalar(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [associatedFirms, setAssociatedFirms] = useState<any[]>([])
  const [allFirms, setAllFirms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFirmaForQuery, setActiveFirmaForQuery] = useState<any | null>(null)

  const loadFirms = async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resAssoc = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT df.id as temin_firma_id, f.*, df.teklif_durumu, df.yasaklilik_durumu, df.yasaklilik_belgesi 
         FROM DATA_TeminFirma df 
         JOIN TANIM_Firma f ON df.firma_id = f.id 
         WHERE df.temin_dosya_id = ?`,
        [activeDosyaId]
      )
      const resAll = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY unvan ASC'
      )
      if (resAssoc.success) setAssociatedFirms(resAssoc.data)
      if (resAll.success) setAllFirms(resAll.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFirms()
  }, [activeDosyaId])

  const handleAddFirm = async (firma: any): Promise<void> => {
    // Check if the firm is already added
    if (associatedFirms.some((af) => af.id === firma.id || af.firma_id === firma.id)) {
      alert('Bu firma zaten eklenmiş.')
      return
    }
    if (firma.kara_liste === 1) {
      const confirmAdd = confirm(
        `⚠️ DİKKAT: "${firma.unvan}" firması KARA LİSTEDEDİR!\n\n` +
          `Gerekçe: ${firma.kara_liste_neden || 'Belirtilmemiş.'}\n\n` +
          `Yine de bu doğrudan temin dosyasına eklemek istiyor musunuz?`
      )
      if (!confirmAdd) return
    }
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        "INSERT INTO DATA_TeminFirma (temin_dosya_id, firma_id, teklif_durumu) VALUES (?, ?, 'Davet Edildi')",
        [activeDosyaId, firma.id]
      )
      if (res.success) {
        loadFirms()
      } else {
        alert('Firma eklenirken hata: ' + res.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleRemoveFirm = async (teminFirmaId: number): Promise<void> => {
    if (!confirm('Bu tedarikçiyi dosyadan çıkarmak istediğinize emin misiniz?')) return
    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKalemTeklif WHERE temin_firma_id = ?',
        [teminFirmaId]
      )
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminFirma WHERE id = ?',
        [teminFirmaId]
      )
      if (res.success) loadFirms()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const unassociatedFirms = allFirms.filter(
    (f) =>
      !associatedFirms.some((af) => af.id === f.id) &&
      f.unvan.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SubScreen
      title="İstekli Tedarikçi Firmalar"
      icon={Compass}
      description="Piyasa araştırması kapsamında davet mektubu gönderilecek veya teklif verecek firmaları ekleyin."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* INVITE NEW FIRM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Tedarikçi Davet Et
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Firma ünvanı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
            />
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/50 pr-1">
            {unassociatedFirms.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 italic">
                Eklenecek yeni firma bulunamadı.
              </div>
            ) : (
              unassociatedFirms.map((firma) => (
                <div key={firma.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="block text-xs font-bold text-slate-800 dark:text-slate-250 truncate"
                        title={firma.unvan}
                      >
                        {firma.unvan}
                      </span>
                      {firma.kara_liste === 1 && (
                        <span className="text-[8px] font-black text-red-600 bg-red-100 dark:bg-red-950 px-1 py-0.2 rounded shrink-0">
                          🚫 KARA LİSTE
                        </span>
                      )}
                    </div>
                    <span className="block text-[9px] text-slate-400">
                      Vergi No: {firma.vergi_no || 'Belirtilmemiş'}{' '}
                      {firma.deneyim_skoru ? `| ⭐ ${firma.deneyim_skoru}/5` : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddFirm(firma)}
                    className={cn(
                      'px-2.5 py-1 text-[10px] font-black rounded-lg cursor-pointer transition-colors shrink-0',
                      firma.kara_liste === 1
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-300'
                        : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    )}
                  >
                    Ekle
                  </button>
                </div>
              ))
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            Eksik firmaları sol menüdeki <strong>İstekli Firma Yönetimi</strong> panelinden sisteme
            kaydedebilirsiniz.
          </p>
        </div>

        {/* ASSOCIATED FIRMS */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
            Dosyaya Davet Edilen İstekli Listesi ({associatedFirms.length})
          </h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
              Yükleniyor...
            </div>
          ) : associatedFirms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs">
                Henüz bu doğrudan temin dosyası için herhangi bir istekli firma eklenmemiş.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[450px] custom-scrollbar pr-1">
              {associatedFirms.map((f) => (
                <div
                  key={f.id}
                  className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all bg-slate-50/20 dark:bg-slate-950/20"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4
                        className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex-1"
                        title={f.unvan}
                      >
                        {f.unvan}
                      </h4>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold">
                          {f.teklif_durumu}
                        </span>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider',
                            f.yasaklilik_durumu === 'Yasaklı' &&
                              'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30',
                            f.yasaklilik_durumu === 'Temiz' &&
                              'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30',
                            (f.yasaklilik_durumu === 'Sorgulanmadı' || !f.yasaklilik_durumu) &&
                              'bg-slate-50 text-slate-500 dark:bg-slate-900/30 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                          )}
                        >
                          {f.yasaklilik_durumu === 'Yasaklı' && '🔴 Yasaklı'}
                          {f.yasaklilik_durumu === 'Temiz' && '🟢 Temiz'}
                          {(f.yasaklilik_durumu === 'Sorgulanmadı' || !f.yasaklilik_durumu) &&
                            '⚪ Sorgulanmadı'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      {f.telefon && <p>📞 Telefon: {f.telefon}</p>}
                      {f.email && <p>✉️ E-posta: {f.email}</p>}
                      {f.adres && (
                        <p className="truncate" title={f.adres}>
                          📍 Adres: {f.adres}
                        </p>
                      )}
                      <p>
                        🏦 Vergi: {f.vergi_dairesi || '-'} / {f.vergi_no || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                    <div>
                      {f.yasaklilik_belgesi && (
                        <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                          📄 Belge Yüklendi
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveFirmaForQuery(f)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Sorgula / Belge
                      </button>
                      <button
                        onClick={() => handleRemoveFirm(f.temin_firma_id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/15 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Çıkar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* YASAKLI SORGULAMA DETAY MODAL */}
      {activeFirmaForQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                Yasaklılık Sorgulama & Belge Yükleme
              </h3>
              <button
                onClick={() => {
                  setActiveFirmaForQuery(null)
                  loadFirms()
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                1. Sorgulanacak İstekli Bilgileri
              </span>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-3">
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">
                    Yasaklanan Adı / Ünvan
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 break-all">
                      {activeFirmaForQuery.unvan}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeFirmaForQuery.unvan)
                        alert('Ünvan kopyalandı.')
                      }}
                      className="px-2 py-1 text-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400 rounded-lg font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Kopyala
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">
                      Vergi / Kimlik No
                    </label>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        {activeFirmaForQuery.vergi_no || '-'}
                      </span>
                      {activeFirmaForQuery.vergi_no && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activeFirmaForQuery.vergi_no)
                            alert('Vergi numarası kopyalandı.')
                          }}
                          className="px-2 py-1 text-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400 rounded-lg font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          Kopyala
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">
                      Vergi Dairesi
                    </label>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {activeFirmaForQuery.vergi_dairesi || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                2. Sorgulama Kanalları (Yeni Pencerede Aç)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    window.electron?.ipcRenderer.send('window:open-external', {
                      url: 'https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama',
                      title: 'EKAP Kamu İhale Yasaklı Sorgulama'
                    })
                  }
                  className="flex flex-col items-center text-center p-4 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-blue-50/10 dark:hover:bg-blue-900/5 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="h-10 flex items-center justify-center mb-2">
                    <img
                      src="https://ekapv2.kik.gov.tr/authzsvc/assets/ekap-logo-paths.svg"
                      alt="EKAP Logo"
                      className="h-7 object-contain brightness-95 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const el = e.currentTarget.parentElement?.querySelector('.fallback-text')
                        if (el) (el as HTMLElement).style.display = 'block'
                      }}
                    />
                    <span className="fallback-text hidden text-sm font-bold text-slate-700 dark:text-slate-350">
                      EKAP Portal
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    EKAP Yasaklı Sorgula
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                    İhale Kayıt No, Vergi/TCKN, Unvan ile detaylı KİK sorgulaması yapın.
                  </p>
                </button>
                <button
                  onClick={() =>
                    window.electron?.ipcRenderer.send('window:open-external', {
                      url: 'https://www.turkiye.gov.tr/kik-yasakli-sorgula',
                      title: 'e-Devlet KİK Yasaklılık Sorgulama'
                    })
                  }
                  className="flex flex-col items-center text-center p-4 border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-700 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-red-50/10 dark:hover:bg-red-900/5 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="h-10 flex items-center justify-center mb-2">
                    <img
                      src="https://cdn.e-devlet.gov.tr/downloads/kurumsal-kimlik/logo/e-devlet-logo.png"
                      alt="e-Devlet Logo"
                      className="h-8 object-contain brightness-95 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const el = e.currentTarget.parentElement?.querySelector('.fallback-text')
                        if (el) (el as HTMLElement).style.display = 'block'
                      }}
                    />
                    <span className="fallback-text hidden text-sm font-bold text-slate-700 dark:text-slate-350">
                      e-Devlet Kapısı
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    e-Devlet Yasaklı Sorgula
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                    Vergi No, Yasaklanan Adı ve TCKN/VKN ile e-Devlet kapısı üzerinden sorgulama
                    yapın.
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                3. Sorgu Sonuç Belgesi Yükleme (PDF / Görsel)
              </span>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-3">
                <p className="text-[10px] text-slate-500 leading-normal">
                  Sorgulama sonucunu içeren ekran çıktısını PDF veya Görsel olarak kaydedip dosyaya
                  ekleyin.
                </p>
                {activeFirmaForQuery.yasaklilik_belgesi ? (
                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                        {activeFirmaForQuery.yasaklilik_belgesi.split('/').pop()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            const res = await window.electron.ipcRenderer.invoke(
                              'workspace:open-file',
                              activeFirmaForQuery.yasaklilik_belgesi
                            )
                            if (!res.success) alert('Dosya açılamadı.')
                          } catch (err: any) {
                            alert('Hata: ' + err.message)
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                        title="Dosyayı Aç"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            !confirm('Bu belgeyi dosyadan kaldırmak istediğinize emin misiniz?')
                          ) {
                            return
                          }
                          try {
                            const res = await window.electron.ipcRenderer.invoke(
                              'db:run',
                              'UPDATE DATA_TeminFirma SET yasaklilik_belgesi = NULL WHERE id = ?',
                              [activeFirmaForQuery.temin_firma_id]
                            )
                            if (res.success) {
                              setActiveFirmaForQuery({
                                ...activeFirmaForQuery,
                                yasaklilik_belgesi: null
                              })
                            }
                          } catch (err: any) {
                            alert('Belge kaldırılırken hata: ' + err.message)
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                        title="Belgeyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        const openRes =
                          await window.electron.ipcRenderer.invoke('dialog:showOpenDialog')
                        if (openRes.success && openRes.filePaths && openRes.filePaths.length > 0) {
                          const uploadRes = await window.electron.ipcRenderer.invoke(
                            'workspace:upload-file',
                            openRes.filePaths[0]
                          )
                          if (uploadRes.success) {
                            const dbRes = await window.electron.ipcRenderer.invoke(
                              'db:run',
                              'UPDATE DATA_TeminFirma SET yasaklilik_belgesi = ? WHERE id = ?',
                              [uploadRes.relativePath, activeFirmaForQuery.temin_firma_id]
                            )
                            if (dbRes.success) {
                              setActiveFirmaForQuery({
                                ...activeFirmaForQuery,
                                yasaklilik_belgesi: uploadRes.relativePath
                              })
                              alert('Sorgulama belgesi başarıyla dosyaya kaydedildi.')
                            } else {
                              alert('Veritabanına kaydedilirken hata: ' + dbRes.error)
                            }
                          } else {
                            alert('Dosya yüklenirken hata: ' + uploadRes.error)
                          }
                        }
                      } catch (err: any) {
                        alert('Hata: ' + err.message)
                      }
                    }}
                    className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:bg-blue-500/5 transition-all cursor-pointer text-slate-500 hover:text-blue-600"
                  >
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-[11px] font-bold">Sonuç Belgesi Seçin ve Yükleyin</span>
                    <span className="text-[9px] text-slate-400">
                      PDF, JPG, PNG formatları desteklenir.
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                4. Yasaklılık Durumunu İşaretleyin
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl">
                {['Sorgulanmadı', 'Temiz', 'Yasaklı'].map((status) => {
                  const isActive = activeFirmaForQuery.yasaklilik_durumu === status
                  return (
                    <button
                      key={status}
                      onClick={async () => {
                        try {
                          const res = await window.electron.ipcRenderer.invoke(
                            'db:run',
                            'UPDATE DATA_TeminFirma SET yasaklilik_durumu = ? WHERE id = ?',
                            [status, activeFirmaForQuery.temin_firma_id]
                          )
                          if (res.success) {
                            setActiveFirmaForQuery({
                              ...activeFirmaForQuery,
                              yasaklilik_durumu: status
                            })
                          }
                        } catch (err: any) {
                          alert('Durum güncellenirken hata: ' + err.message)
                        }
                      }}
                      className={cn(
                        'flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center',
                        isActive
                          ? status === 'Yasaklı'
                            ? 'bg-red-600 text-white shadow-md'
                            : status === 'Temiz'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-slate-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      )}
                    >
                      {status === 'Sorgulanmadı' && '⚪ Sorgulanmadı'}
                      {status === 'Temiz' && '🟢 Temiz'}
                      {status === 'Yasaklı' && '🔴 Yasaklı'}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setActiveFirmaForQuery(null)
                  loadFirms()
                }}
                className="bg-slate-850 hover:bg-slate-900 text-white text-xs font-bold rounded-xl px-5 py-2 cursor-pointer"
              >
                Kapat ve Listeyi Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </SubScreen>
  )
}
