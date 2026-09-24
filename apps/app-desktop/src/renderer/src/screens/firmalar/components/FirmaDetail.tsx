import React, { useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Phone,
  Landmark,
  FileText,
  User,
  MapPin,
  ClipboardList,
  Info,
  Star,
  ShieldAlert,
  MessageSquarePlus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { FirmaGecmisTeminler } from './FirmaGecmisTeminler'
import { useFirmaNotlariHooks } from '../firmalar.hooks'
import { cn } from '../../../utils/cn'

interface FirmaDetailProps {
  viewingFirma: any
  setViewingFirma: (firma: any | null) => void
}

export const FirmaDetail: React.FC<FirmaDetailProps> = ({ viewingFirma, setViewingFirma }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'crm' | 'teminler'>('info')
  const { notlar, isLoadingNotlar, addNot, deleteNot } = useFirmaNotlariHooks(viewingFirma.id)

  const [newNot, setNewNot] = useState({
    not_metni: '',
    gorusen_kisi: viewingFirma.ilgili_adi || '',
    iletisim_tarihi: new Date().toISOString().split('T')[0]
  })
  const [isSubmittingNot, setIsSubmittingNot] = useState(false)

  const handleAddNot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNot.not_metni.trim()) return
    setIsSubmittingNot(true)
    try {
      await addNot({
        firma_id: viewingFirma.id,
        not_metni: newNot.not_metni,
        gorusen_kisi: newNot.gorusen_kisi,
        iletisim_tarihi: newNot.iletisim_tarihi
      })
      setNewNot((prev) => ({ ...prev, not_metni: '' }))
    } catch (err: any) {
      alert('Not eklenirken hata oluştu: ' + (err.message || err))
    } finally {
      setIsSubmittingNot(false)
    }
  }

  const handleDeleteNot = async (id: number) => {
    if (confirm('Bu iletişim notunu silmek istediğinize emin misiniz?')) {
      try {
        await deleteNot({ id, firma_id: viewingFirma.id })
      } catch {
        alert('Not silinemedi!')
      }
    }
  }

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-1 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
            )}
          />
        ))}
        <span className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-300">
          ({score}/5)
        </span>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <Button
        variant="ghost"
        onClick={() => setViewingFirma(null)}
        className="w-fit mb-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Listeye Geri Dön
      </Button>

      {/* Kara Liste Uyarı Paneli */}
      {viewingFirma.kara_liste === 1 && (
        <div className="bg-red-500/10 border-2 border-red-500/40 p-5 rounded-2xl flex items-start gap-4 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-red-700 dark:text-red-400 text-base flex items-center gap-2">
              ⚠️ DİKKAT: YASAKLI / KARA LİSTEDEKİ FİRMA!
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1 font-medium">
              Bu firma kurumsal güvenlik veya performans nedeniyle kara listeye alınmıştır.
            </p>
            {viewingFirma.kara_liste_neden && (
              <div className="mt-2.5 p-3 bg-red-100/50 dark:bg-red-950/60 rounded-xl border border-red-200 dark:border-red-900/50 text-xs font-bold text-red-800 dark:text-red-200">
                Gerekçe: {viewingFirma.kara_liste_neden}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        {/* Header Section */}
        <div className="flex items-start gap-5 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold shadow-sm shrink-0 border border-blue-200 dark:border-blue-800">
            <Building2 className="w-10 h-10" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {viewingFirma.firma_kodu && (
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-2.5 py-1 rounded">
                  {viewingFirma.firma_kodu}
                </span>
              )}
              {viewingFirma.uyrugu && (
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded uppercase tracking-wider">
                  {viewingFirma.uyrugu}
                </span>
              )}
              {viewingFirma.kara_liste === 1 ? (
                <span className="text-xs font-black text-red-600 bg-red-100 dark:bg-red-950 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900">
                  🚫 KARA LİSTE
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-900/40">
                  ✅ Güvenilir / Aktif
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2">
              {viewingFirma.unvan}
            </h2>
            {viewingFirma.istigal_konusu && (
              <div className="text-base text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-500">İştigal:</span>{' '}
                {viewingFirma.istigal_konusu}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 mb-6 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={cn(
              'flex items-center gap-1.5 py-2 px-4 text-xs font-black rounded-lg transition-all cursor-pointer border-0',
              activeTab === 'info'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-3xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent'
            )}
          >
            <Info className="w-3.5 h-3.5" />
            Firma Bilgileri
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crm')}
            className={cn(
              'flex items-center gap-1.5 py-2 px-4 text-xs font-black rounded-lg transition-all cursor-pointer border-0',
              activeTab === 'crm'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-3xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent'
            )}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            CRM & İletişim Notları
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teminler')}
            className={cn(
              'flex items-center gap-1.5 py-2 px-4 text-xs font-black rounded-lg transition-all cursor-pointer border-0',
              activeTab === 'teminler'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-3xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent'
            )}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Geçmiş Doğrudan Teminler
          </button>
        </div>

        {activeTab === 'info' && (
          /* FIRMA BİLGİLERİ TAB */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-200">
            {/* Sol Kolon: İletişim */}
            <div className="space-y-5">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Phone className="w-5 h-5 text-slate-400" /> İletişim & Adres
              </h4>

              <div className="space-y-4">
                {(viewingFirma.telefon || viewingFirma.faks) && (
                  <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Telefon / Faks
                    </span>
                    <div className="text-base text-slate-800 dark:text-slate-200 font-medium">
                      {viewingFirma.telefon && (
                        <span className="mr-4">📞 {viewingFirma.telefon}</span>
                      )}
                      {viewingFirma.faks && <span>📠 {viewingFirma.faks}</span>}
                    </div>
                  </div>
                )}

                {(viewingFirma.email || viewingFirma.web_adresi) && (
                  <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Dijital İletişim
                    </span>
                    <div className="text-base text-slate-800 dark:text-slate-200 font-medium">
                      {viewingFirma.email && <div className="mb-1">✉️ {viewingFirma.email}</div>}
                      {viewingFirma.web_adresi && (
                        <div>
                          🌐{' '}
                          <a
                            href={
                              viewingFirma.web_adresi.startsWith('http')
                                ? viewingFirma.web_adresi
                                : `https://${viewingFirma.web_adresi}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {viewingFirma.web_adresi}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Adres Bilgileri
                  </span>
                  <div className="text-base text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {viewingFirma.adres ? (
                      <div className="mb-2.5 font-medium leading-relaxed">{viewingFirma.adres}</div>
                    ) : (
                      <div className="text-slate-400 italic mb-2.5">Adres girilmemiş.</div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {viewingFirma.ilce && <span>{viewingFirma.ilce}</span>}
                      {viewingFirma.ilce && viewingFirma.il && <span>/</span>}
                      {viewingFirma.il && <span>{viewingFirma.il}</span>}
                      {viewingFirma.posta_kodu && (
                        <span className="ml-auto text-slate-400 font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                          {viewingFirma.posta_kodu}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {viewingFirma.ilgili_adi && (
                  <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4" /> İlgili Kişi
                    </span>
                    <div className="text-base text-slate-800 dark:text-slate-200 font-bold">
                      {viewingFirma.ilgili_adi}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Kolon: Banka & Vergi */}
            <div className="space-y-5">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Landmark className="w-5 h-5 text-slate-400" /> Finansal & Resmi Bilgiler
              </h4>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <span className="text-[11px] font-bold text-amber-600/70 dark:text-amber-500/70 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Vergi Bilgileri
                  </span>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Vergi Dairesi</div>
                      <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.vergi_dairesi || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Vergi No</div>
                      <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.vergi_no || '-'}
                      </div>
                    </div>
                    <div className="col-span-2 pt-3 border-t border-amber-200/50 dark:border-amber-800/50 mt-1">
                      <div className="text-xs text-slate-500 mb-1">TC Kimlik No</div>
                      <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.tc_kimlik_no || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[11px] font-bold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-4 h-4" /> Banka Bilgileri
                  </span>
                  <div className="space-y-4 mt-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Banka Adı</div>
                      <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.banka_adi || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Şube</div>
                      <div className="text-base font-medium text-slate-800 dark:text-slate-200">
                        {viewingFirma.sube_kodu_adi || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">IBAN / Hesap No</div>
                      <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.hesap_no || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          /* CRM & İLETİŞİM TAB */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Skor Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ⭐ Deneyim Skoru
                </span>
                <div>{renderStars(viewingFirma.deneyim_skoru || 0)}</div>
                <p className="text-[11px] text-slate-500">
                  {viewingFirma.deneyim_skoru > 3
                    ? 'Geçmiş alımlarda sorun yaşanmadı.'
                    : 'Performansı takibe değer.'}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  🎯 Kalite Skoru
                </span>
                <div>{renderStars(viewingFirma.kalite_skoru || 0)}</div>
                <p className="text-[11px] text-slate-500">
                  Teslim edilen mal/hizmet şartname kalitesi.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  💳 Ödeme & Sözleşme Disiplini
                </span>
                <div>
                  {viewingFirma.odeme_disiplini === 0 ? (
                    <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1.5 w-fit">
                      <AlertTriangle className="w-3.5 h-3.5" /> Gecikmeli / Sorunlu
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Zamanında & Düzenli
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Son İletişim: {viewingFirma.son_iletisim_tarihi || 'Belirtilmedi'}
                </p>
              </div>
            </div>

            {/* İletişim Notu Ekle Formu */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-blue-600" /> Yeni İletişim Notu Ekle
              </h4>
              <form onSubmit={handleAddNot} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Görüşülen / İlgili Kişi
                    </label>
                    <input
                      type="text"
                      value={newNot.gorusen_kisi}
                      onChange={(e) => setNewNot({ ...newNot, gorusen_kisi: e.target.value })}
                      placeholder="Firma yetkilisi adı"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 px-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      İletişim Tarihi
                    </label>
                    <input
                      type="date"
                      value={newNot.iletisim_tarihi}
                      onChange={(e) => setNewNot({ ...newNot, iletisim_tarihi: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 px-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Görüşme Notu / Açıklama
                  </label>
                  <textarea
                    value={newNot.not_metni}
                    onChange={(e) => setNewNot({ ...newNot, not_metni: e.target.value })}
                    placeholder="Örn: Fiyat teklifi konuşuldu, numune istendi veya teslimat tarihi teyit edildi..."
                    rows={3}
                    required
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmittingNot}
                    className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-4 py-2"
                  >
                    {isSubmittingNot ? 'Ekleniyor...' : 'Notu Kaydet'}
                  </Button>
                </div>
              </form>
            </div>

            {/* İletişim Notları Listesi */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Geçmiş İletişim Notları ({notlar.length})
              </h4>

              {isLoadingNotlar ? (
                <div className="text-xs text-slate-400">Notlar yükleniyor...</div>
              ) : notlar.length === 0 ? (
                <div className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center">
                  Henüz kaydedilmiş bir iletişim notu bulunmuyor.
                </div>
              ) : (
                <div className="space-y-2">
                  {notlar.map((notItem) => (
                    <div
                      key={notItem.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start justify-between gap-4 group"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {notItem.iletisim_tarihi}
                          </span>
                          {notItem.gorusen_kisi && (
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold">
                              <User className="w-3 h-3" /> {notItem.gorusen_kisi}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {notItem.not_metni}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteNot(notItem.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                        title="Notu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'teminler' && (
          /* GEÇMİŞ DOĞRUDAN TEMİNLER TAB */
          <FirmaGecmisTeminler firmaId={viewingFirma.id} firmaUnvan={viewingFirma.unvan} />
        )}
      </div>
    </div>
  )
}
