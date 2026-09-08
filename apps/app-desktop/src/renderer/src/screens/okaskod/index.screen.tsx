import React, { useState, useMemo } from 'react'
import {
  Tag,
  Plus,
  Trash2,
  Search,
  Hash,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { ExcelActions } from '../../components/ui/ExcelActions'
import { useOkasKodHooks } from './okaskod.hooks'
import { cn } from '../../utils/cn'

// OKAS kod yapısı: 8 haneli sayısal
// İlk 2 hane: Bölüm, ilk 3 hane: Grup, ilk 4 hane: Sınıf, 8 hane: Ürün
function parseOkasKod(kod: string): {
  bolum: string | null
  grup: string | null
  sinif: string | null
} {
  const clean = kod.replace(/\D/g, '')
  if (clean.length < 2) return { bolum: null, grup: null, sinif: null }
  return {
    bolum: clean.slice(0, 2),
    grup: clean.length >= 3 ? clean.slice(0, 3) : null,
    sinif: clean.length >= 4 ? clean.slice(0, 4) : null
  }
}

// Düzey önizleme bileşeni
function OkasDuzeyOnizleme({ kod }: { kod: string }) {
  const clean = kod.replace(/\D/g, '')
  if (!clean || clean.length < 2) {
    return (
      <div className="text-xs text-slate-400 dark:text-slate-600 italic">
        Geçerli bir OKAS kodu girin (en az 2 hane)
      </div>
    )
  }

  const parcalar: { label: string; value: string; color: string; bg: string }[] = []

  if (clean.length >= 2) {
    parcalar.push({
      label: 'Bölüm (2 hane)',
      value: clean.slice(0, 2),
      color: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
    })
  }
  if (clean.length >= 3) {
    parcalar.push({
      label: 'Grup (3 hane)',
      value: clean.slice(0, 3),
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700'
    })
  }
  if (clean.length >= 4) {
    parcalar.push({
      label: 'Sınıf (4 hane)',
      value: clean.slice(0, 4),
      color: 'text-orange-700 dark:text-orange-300',
      bg: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700'
    })
  }
  if (clean.length >= 8) {
    parcalar.push({
      label: 'Ürün/Hizmet Kodu (8 hane)',
      value: clean.slice(0, 8),
      color: 'text-purple-700 dark:text-purple-300',
      bg: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700'
    })
  }

  return (
    <div className="space-y-1.5">
      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
        Kod Kırılımı
      </div>
      <div className="flex flex-wrap gap-1.5">
        {parcalar.map((p) => (
          <div
            key={p.label}
            className={cn(
              'flex flex-col items-center px-3 py-1.5 rounded-lg border text-center',
              p.bg
            )}
          >
            <span className={cn('text-base font-bold font-mono', p.color)}>{p.value}</span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OkasKodScreen(): React.JSX.Element {
  const { okasKodList, isLoading, addOkasKod, deleteOkasKod } = useOkasKodHooks()

  const [kod, setKod] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = (): void => {
    setKod('')
    setAciklama('')
    setIsModalOpen(true)
  }

  const handleKaydet = async (): Promise<void> => {
    const cleanKod = kod.replace(/\D/g, '').slice(0, 8)
    if (!cleanKod || cleanKod.length < 2) {
      alert('Geçerli bir OKAS kodu girin (en az 2 hane).')
      return
    }
    if (!aciklama.trim()) {
      alert('Açıklama alanı zorunludur.')
      return
    }
    const parsed = parseOkasKod(cleanKod)
    await addOkasKod({
      kod: cleanKod,
      bolum: parsed.bolum,
      grup: parsed.grup,
      sinif: parsed.sinif,
      aciklama: aciklama.trim()
    })
    setIsModalOpen(false)
  }

  const filteredList = useMemo(() => {
    if (!search.trim()) return okasKodList
    const q = search.toLowerCase()
    return okasKodList.filter(
      (k) =>
        k.kod.includes(q) ||
        k.aciklama.toLowerCase().includes(q) ||
        (k.bolum && k.bolum.includes(q)) ||
        (k.sinif && k.sinif.includes(q))
    )
  }, [okasKodList, search])

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">
                OKAS Kodu Yönetimi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ortak Kamu Alımları Sözlüğü Kodları
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
            <div className="text-left sm:text-right sm:border-r border-slate-200 dark:border-slate-700 sm:pr-6">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {okasKodList.length}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Kayıtlı Kod
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ExcelActions
                tableName="TANIM_OkasKod"
                title="OKAS Kodları"
                uniqueCol="kod"
                onImportSuccess={() => window.location.reload()}
              />
              <Button
                onClick={handleOpenModal}
                className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" /> Yeni Kod Ekle
              </Button>
            </div>
          </div>
        </div>

        {/* Bilgi Notu */}
        <div className="mx-6 mb-4 flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
          <div className="leading-relaxed">
            <p className="font-bold mb-1">OKAS Kodları Hakkında</p>
            <p>
              <strong>OKAS (Ortak Kamu Alımları Sözlüğü)</strong>, kamu alımlarında mal, hizmet ve
              yapım işlerini standart hale getirmek için kullanılan 8 haneli sayısal kodlama
              sistemidir (AB CPV uyarlaması). Resmi liste için{' '}
              <a
                href="https://ekap.kik.gov.tr"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold hover:text-amber-600 dark:hover:text-amber-200 inline-flex items-center gap-1 mx-1"
              >
                EKAP <ExternalLink className="w-3 h-3" />
              </a>{' '}
              veya{' '}
              <a
                href="https://www.kik.gov.tr"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold hover:text-amber-600 dark:hover:text-amber-200 inline-flex items-center gap-1 mx-1"
              >
                KİK <ExternalLink className="w-3 h-3" />
              </a>
              adreslerini ziyaret edin. Eklediğiniz özel kodlar yalnızca{' '}
              <strong>aktif .dtal (kurum) dosyanıza</strong> kaydedilir.
            </p>
          </div>
        </div>
      </div>

      {/* Arama & Tablo */}
      <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Kod veya açıklama ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-slate-400">
              Yükleniyor...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400 dark:text-slate-600">
              <Hash className="w-10 h-10" />
              <div className="text-sm text-center">
                {search ? 'Aramanızla eşleşen kod bulunamadı.' : 'Henüz OKAS kodu eklenmemiş.'}
                <br />
                <span className="text-xs">
                  "Yeni Kod Ekle" veya "Excel'den İçe Aktar" ile başlayın.
                </span>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[800px] text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left">OKAS Kodu</th>
                  <th className="px-4 py-3 text-left">Bölüm</th>
                  <th className="px-4 py-3 text-left">Grup</th>
                  <th className="px-4 py-3 text-left">Sınıf</th>
                  <th className="px-4 py-3 text-left">Açıklama</th>
                  <th className="px-4 py-3 text-center w-16">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item, i) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'border-t border-slate-100 dark:border-slate-700/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors',
                      i % 2 !== 0 && 'bg-slate-50/50 dark:bg-slate-800/30'
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                        {item.kod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.bolum ? (
                        <span className="font-mono text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                          {item.bolum}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.grup ? (
                        <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                          {item.grup}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.sinif ? (
                        <span className="font-mono text-xs text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                          {item.sinif}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {item.aciklama}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => deleteOkasKod(item.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni OKAS Kodu Ekle">
        <div className="space-y-4 p-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              OKAS Kodu <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Örn: 30192700"
              value={kod}
              onChange={(e) => setKod(e.target.value.replace(/\D/g, '').slice(0, 8))}
              maxLength={8}
              className="font-mono"
            />
            <div className="text-[10px] text-slate-400">
              8 haneli sayısal kod (2–8 hane arası girilebilir)
            </div>
          </div>

          {/* Düzey Kırılımı Önizleme */}
          {kod.length >= 2 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
              <OkasDuzeyOnizleme kod={kod} />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Açıklama <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Örn: Yazıcılar ve faks cihazları"
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
            >
              İptal
            </Button>
            <Button onClick={handleKaydet} className="bg-indigo-600 hover:bg-indigo-700">
              Kaydet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
