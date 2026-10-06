import React, { useState, useMemo } from 'react'
import {
  Calculator,
  Plus,
  Trash2,
  Download,
  Upload,
  Sparkles,
  TrendingDown,
  Building2,
  FileSpreadsheet,
  CheckCircle,
  Save,
  Clock,
  ChevronRight
} from 'lucide-react'

export interface CetvelKalem {
  id: string
  siraNo: number
  kalemAdi: string
  birim: string
  miktar: number
  birimFiyat: number
  kdvOrani: number // %0, %1, %10, %20
}

export interface FirmaTeklif {
  id: string
  firmaAdi: string
  teklifler: Record<string, number> // kalemId -> birimFiyat
}

interface HesapCetveliGridProps {
  initialKalemler?: CetvelKalem[]
  initialFirmalar?: FirmaTeklif[]
  onSave?: (data: { kalemler: CetvelKalem[]; firmalar: FirmaTeklif[]; genelToplam: number }) => void
  onSaveVersion?: (versionTitle: string) => void
  readOnly?: boolean
}

export function HesapCetveliGrid({
  initialKalemler = [
    {
      id: '1',
      siraNo: 1,
      kalemAdi: 'Masaüstü Bilgisayar (İ7 / 16GB RAM / 512GB SSD)',
      birim: 'Adet',
      miktar: 5,
      birimFiyat: 24500,
      kdvOrani: 20
    },
    {
      id: '2',
      siraNo: 2,
      kalemAdi: 'A4 Lazer Yazıcı (Çift Taraflı Baskı)',
      birim: 'Adet',
      miktar: 2,
      birimFiyat: 11200,
      kdvOrani: 20
    }
  ],
  initialFirmalar = [
    { id: 'f1', firmaAdi: 'A Teknoloji Ltd. Şti.', teklifler: { '1': 24000, '2': 11000 } },
    { id: 'f2', firmaAdi: 'B Bilişim A.Ş.', teklifler: { '1': 24800, '2': 10900 } },
    { id: 'f3', firmaAdi: 'C Sistem Dağıtım', teklifler: { '1': 23900, '2': 11500 } }
  ],
  onSave,
  onSaveVersion,
  readOnly = false
}: HesapCetveliGridProps): React.JSX.Element {
  const [kalemler, setKalemler] = useState<CetvelKalem[]>(initialKalemler)
  const [firmalar, setFirmalar] = useState<FirmaTeklif[]>(initialFirmalar)
  const [activeTab, setActiveTab] = useState<'yaklasik' | 'piyasa'>('yaklasik')
  const [versionNote, setVersionNote] = useState('')
  const [showVersionModal, setShowVersionModal] = useState(false)

  // Calcs
  const Ozet = useMemo(() => {
    let araToplam = 0
    let kdvToplam = 0

    kalemler.forEach((k) => {
      const tutar = (k.miktar || 0) * (k.birimFiyat || 0)
      const kdv = tutar * ((k.kdvOrani || 0) / 100)
      araToplam += tutar
      kdvToplam += kdv
    })

    return {
      araToplam,
      kdvToplam,
      genelToplam: araToplam + kdvToplam
    }
  }, [kalemler])

  // Lowest offer finder per item
  const EnDusukTeklifler = useMemo(() => {
    const result: Record<string, { firmaAdi: string; fiyat: number }> = {}
    kalemler.forEach((k) => {
      let minFiyat = Infinity
      let minFirma = ''
      firmalar.forEach((f) => {
        const fiyat = f.teklifler[k.id]
        if (fiyat && fiyat < minFiyat) {
          minFiyat = fiyat
          minFirma = f.firmaAdi
        }
      })
      if (minFiyat !== Infinity) {
        result[k.id] = { firmaAdi: minFirma, fiyat: minFiyat }
      }
    })
    return result
  }, [kalemler, firmalar])

  const handleAddKalem = () => {
    const newId = String(Date.now())
    setKalemler([
      ...kalemler,
      {
        id: newId,
        siraNo: kalemler.length + 1,
        kalemAdi: 'Yeni İhale / Temin Kalemi',
        birim: 'Adet',
        miktar: 1,
        birimFiyat: 0,
        kdvOrani: 20
      }
    ])
  }

  const handleRemoveKalem = (id: string) => {
    setKalemler(
      kalemler
        .filter((k) => k.id !== id)
        .map((k, idx) => ({ ...k, siraNo: idx + 1 }))
    )
  }

  const handleKalemChange = (id: string, field: keyof CetvelKalem, val: any) => {
    setKalemler(
      kalemler.map((k) => (k.id === id ? { ...k, [field]: val } : k))
    )
  }

  const handleFirmaTeklifChange = (firmaId: string, kalemId: string, val: number) => {
    setFirmalar(
      firmalar.map((f) => {
        if (f.id === firmaId) {
          return {
            ...f,
            teklifler: { ...f.teklifler, [kalemId]: val }
          }
        }
        return f
      })
    )
  }

  const handleAddFirma = () => {
    const newId = 'f_' + Date.now()
    setFirmalar([
      ...firmalar,
      {
        id: newId,
        firmaAdi: `İstekli Firma ${firmalar.length + 1}`,
        teklifler: {}
      }
    ])
  }

  const formatTL = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* HEADER & TABS */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              2886 & 4734 Hesap Cetveli Modülü
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Canlı Formül
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Yaklaşık maliyet hesap cetveli, piyasa fiyat araştırması ve teklif karşılaştırma gridi.
            </p>
          </div>
        </div>

        {/* TABS & ACTIONS */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('yaklasik')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'yaklasik'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" /> Yaklaşık Maliyet Cetveli
            </button>
            <button
              onClick={() => setActiveTab('piyasa')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'piyasa'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" /> Piyasa Fiyat Araştırma Gridi
            </button>
          </div>

          {!readOnly && (
            <>
              <button
                onClick={() => setShowVersionModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                title="Versiyon Kaydet"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Sürüm Oluştur
              </button>

              <button
                onClick={() => onSave?.({ kalemler, firmalar, genelToplam: Ozet.genelToplam })}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all"
              >
                <Save className="w-3.5 h-3.5" /> Kaydet
              </button>
            </>
          )}
        </div>
      </div>

      {/* CONTENT TAB 1: YAKLAŞIK MALİYET CETVELİ */}
      {activeTab === 'yaklasik' && (
        <div className="flex-1 p-4 overflow-auto">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="p-3 w-12 text-center">S.No</th>
                  <th className="p-3">Mal / Hizmet / Yapım İşinin Tanımı</th>
                  <th className="p-3 w-24">Birim</th>
                  <th className="p-3 w-24 text-right">Miktar</th>
                  <th className="p-3 w-36 text-right">Birim Fiyat (TL)</th>
                  <th className="p-3 w-20 text-center">KDV %</th>
                  <th className="p-3 w-36 text-right">Ara Tutar (TL)</th>
                  <th className="p-3 w-36 text-right">Toplam (KDV Dahil)</th>
                  {!readOnly && <th className="p-3 w-12 text-center">İşlem</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {kalemler.map((k) => {
                  const araTutar = (k.miktar || 0) * (k.birimFiyat || 0)
                  const kdvTutar = araTutar * ((k.kdvOrani || 0) / 100)
                  const toplam = araTutar + kdvTutar

                  return (
                    <tr key={k.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-2.5 text-center font-sans font-medium text-slate-500">
                        {k.siraNo}
                      </td>
                      <td className="p-2">
                        {readOnly ? (
                          <span className="font-sans text-slate-200">{k.kalemAdi}</span>
                        ) : (
                          <input
                            type="text"
                            value={k.kalemAdi}
                            onChange={(e) => handleKalemChange(k.id, 'kalemAdi', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded px-2 py-1 text-xs text-slate-100 font-sans focus:outline-none"
                          />
                        )}
                      </td>
                      <td className="p-2">
                        {readOnly ? (
                          <span className="font-sans text-slate-300">{k.birim}</span>
                        ) : (
                          <input
                            type="text"
                            value={k.birim}
                            onChange={(e) => handleKalemChange(k.id, 'birim', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded px-2 py-1 text-xs text-slate-100 font-sans focus:outline-none"
                          />
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {readOnly ? (
                          <span>{k.miktar}</span>
                        ) : (
                          <input
                            type="number"
                            value={k.miktar}
                            onChange={(e) =>
                              handleKalemChange(k.id, 'miktar', parseFloat(e.target.value) || 0)
                            }
                            className="w-full text-right bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none"
                          />
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {readOnly ? (
                          <span>{formatTL(k.birimFiyat)}</span>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            value={k.birimFiyat}
                            onChange={(e) =>
                              handleKalemChange(
                                k.id,
                                'birimFiyat',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full text-right bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded px-2 py-1 text-xs text-emerald-400 focus:outline-none font-semibold"
                          />
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {readOnly ? (
                          <span>%{k.kdvOrani}</span>
                        ) : (
                          <select
                            value={k.kdvOrani}
                            onChange={(e) =>
                              handleKalemChange(k.id, 'kdvOrani', parseInt(e.target.value) || 0)
                            }
                            className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded px-1.5 py-1 text-xs text-slate-300 focus:outline-none"
                          >
                            <option value={0}>%0</option>
                            <option value={1}>%1</option>
                            <option value={10}>%10</option>
                            <option value={20}>%20</option>
                          </select>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-medium text-slate-300">
                        {formatTL(araTutar)}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-emerald-400">
                        {formatTL(toplam)}
                      </td>
                      {!readOnly && (
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveKalem(k.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Kalemi Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {!readOnly && (
              <div className="p-3 bg-slate-900/50 border-t border-slate-800/80">
                <button
                  onClick={handleAddKalem}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Yeni Kalem Ekle
                </button>
              </div>
            )}
          </div>

          {/* SUMMARY CARDS */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase">Ara Toplam</p>
                <p className="text-lg font-mono font-bold text-slate-200">
                  {formatTL(Ozet.araToplam)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                ₺
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase">Toplam KDV</p>
                <p className="text-lg font-mono font-bold text-sky-400 font-semibold">
                  {formatTL(Ozet.kdvToplam)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                %
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-950 p-3.5 rounded-xl border border-emerald-500/30 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase">
                  Genel Toplam (Yaklaşık Maliyet)
                </p>
                <p className="text-xl font-mono font-bold text-emerald-400">
                  {formatTL(Ozet.genelToplam)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT TAB 2: PIYASA FIYAT ARAŞTIRMA GRIDI */}
      {activeTab === 'piyasa' && (
        <div className="flex-1 p-4 overflow-auto">
          <div className="mb-3 flex justify-between items-center">
            <p className="text-xs text-slate-400">
              İstekli firmalardan alınan birim fiyat tekliflerini karşılaştırın. En uygun (en düşük)
              teklifler otomatik vurgulanır.
            </p>
            {!readOnly && (
              <button
                onClick={handleAddFirma}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Building2 className="w-3.5 h-3.5" /> Firma Ekle
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="p-3 w-12 text-center">S.No</th>
                  <th className="p-3">Mal / Hizmet Kalemi</th>
                  <th className="p-3 w-20 text-right">Miktar</th>
                  {firmalar.map((f) => (
                    <th key={f.id} className="p-3 text-right min-w-[140px] text-blue-400">
                      {f.firmaAdi}
                    </th>
                  ))}
                  <th className="p-3 text-right min-w-[140px] text-emerald-400">En Uygun Teklif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {kalemler.map((k) => {
                  const minInfo = EnDusukTeklifler[k.id]

                  return (
                    <tr key={k.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-2.5 text-center font-sans font-medium text-slate-500">
                        {k.siraNo}
                      </td>
                      <td className="p-2.5 font-sans font-medium text-slate-200">{k.kalemAdi}</td>
                      <td className="p-2.5 text-right font-sans text-slate-400">
                        {k.miktar} {k.birim}
                      </td>

                      {firmalar.map((f) => {
                        const offer = f.teklifler[k.id] || 0
                        const isLowest = minInfo && minInfo.fiyat === offer && offer > 0

                        return (
                          <td
                            key={f.id}
                            className={`p-2 text-right ${
                              isLowest ? 'bg-emerald-950/40 font-bold text-emerald-400' : ''
                            }`}
                          >
                            {readOnly ? (
                              <span>{formatTL(offer)}</span>
                            ) : (
                              <input
                                type="number"
                                step="0.01"
                                value={offer || ''}
                                onChange={(e) =>
                                  handleFirmaTeklifChange(
                                    f.id,
                                    k.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0.00 TL"
                                className={`w-full text-right bg-slate-900 border rounded px-2 py-1 text-xs focus:outline-none ${
                                  isLowest
                                    ? 'border-emerald-500/60 text-emerald-300 font-bold'
                                    : 'border-slate-800 text-slate-200'
                                }`}
                              />
                            )}
                          </td>
                        )
                      })}

                      <td className="p-2.5 text-right font-bold text-emerald-400 bg-emerald-950/20">
                        {minInfo ? (
                          <div>
                            <div>{formatTL(minInfo.fiyat * k.miktar)}</div>
                            <div className="text-[10px] text-emerald-500 font-sans font-normal">
                              ({minInfo.firmaAdi})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VERSION MODAL */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-400" /> Sürüm Kaydı Oluştur
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Mevcut cetvel ve metin durumunun anlık görüntüsünü revizyon geçmişine kaydeder.
            </p>

            <label className="block text-xs font-medium text-slate-300 mb-1">
              Revizyon Notu / Başlık
            </label>
            <input
              type="text"
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              placeholder="Örn: Yaklaşık Maliyet Güncellemesi v1.1"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (onSaveVersion) onSaveVersion(versionNote || 'Revizyon')
                  setShowVersionModal(false)
                  setVersionNote('')
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium shadow-md shadow-amber-900/30"
              >
                Sürümü Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
