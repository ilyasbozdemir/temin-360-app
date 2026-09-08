import React, { useState } from 'react'
import {
  FolderTree,
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
import { useTasinirKodHooks } from './tasinirkod.hooks'
import { cn } from '../../utils/cn'

export default function TasinirKodScreen(): React.JSX.Element {
  const { tasinirKodList, isLoading, addTasinirKod, deleteTasinirKod } = useTasinirKodHooks()

  const [tamKod, setTamKod] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setTamKod('')
    setAciklama('')
    setIsModalOpen(true)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tamKod.trim() || !aciklama.trim()) return

    const parts = tamKod.trim().split('.')
    const hesapKodu = parts[0] || ''
    const d1 = parts[1] || ''
    const d2 = parts[2] || ''
    const d3 = parts[3] || ''
    const d4 = parts[4] || ''
    const d5 = parts[5] || ''

    if (hesapKodu !== '150' && hesapKodu !== '253' && hesapKodu !== '255') {
      alert('Ana hesap kodu 150, 253 veya 255 olmalıdır.')
      return
    }

    try {
      await addTasinirKod({
        tam_kod: tamKod.trim(),
        hesap_kodu: hesapKodu,
        duzey_1: d1 || null,
        duzey_2: d2 || null,
        duzey_3: d3 || null,
        duzey_4: d4 || null,
        duzey_5: d5 || null,
        aciklama: aciklama.trim()
      })
      setIsModalOpen(false)
    } catch (error: any) {
      alert('Kayıt eklenirken hata oluştu: ' + error.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Bu taşınır kodunu silmek istediğinize emin misiniz?')) {
      try {
        await deleteTasinirKod(id)
      } catch (error: any) {
        alert('Silinirken hata oluştu: ' + error.message)
      }
    }
  }

  const filteredList = tasinirKodList.filter(
    (m) =>
      m.aciklama.toLowerCase().includes(search.toLowerCase()) ||
      m.tam_kod.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <FolderTree className="w-8 h-8 text-emerald-600" />
            Taşınır Kod Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Muhasebat Genel Müdürlüğü standartlarına uygun taşınır kod ağacını (150.xx.xx) yönetin.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          <div className="text-left sm:text-right sm:border-r border-slate-200 dark:border-slate-800 sm:pr-6">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {tasinirKodList.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Kayıtlı Kod
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExcelActions
              tableName="TANIM_TasinirKod"
              title="Taşınır Kodları"
              uniqueCol="tam_kod"
              onImportSuccess={() => window.location.reload()}
            />
            <Button
              onClick={handleOpenModal}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Yeni Kod Ekle
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm text-amber-800 dark:text-amber-400">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold mb-1">Taşınır Kodları Eklerken Dikkat Edin!</p>
          <p>
            Sistemdeki varsayılan taşınır listesi{' '}
            <a
              href="https://muhasebat.hmb.gov.tr/tasinir-kod-listesi"
              target="_blank"
              rel="noreferrer"
              className="underline font-semibold hover:text-amber-600 dark:hover:text-amber-300 inline-flex items-center gap-1 mx-1"
            >
              Muhasebat Genel Müdürlüğü <ExternalLink className="w-3 h-3" />
            </a>{' '}
            standartlarına uygun olarak sisteme gömülüdür. Eğer yeni bir kod eklerseniz, bu kod
            yalnızca <strong>aktif .dtal (kurum) dosyanıza</strong> kaydedilir. Listeyi veya
            eklediğiniz özel kodları başka kurumlara da taşımak isterseniz, ilerleyen
            güncellemelerde "Dışa Aktar (.dte)" menüsü ile bu verileri paylaşabilirsiniz. Lütfen
            kodu noktalarla (150.xx.xx) girmeye özen gösterin.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Kod (150.01) veya Açıklama ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-0">
          <table className="w-full min-w-[800px] text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 sticky top-0">
              <tr>
                <th className="px-4 py-3 font-semibold">Hesap Kodu</th>
                <th className="px-4 py-3 font-semibold">I. Düzey</th>
                <th className="px-4 py-3 font-semibold">II. Düzey</th>
                <th className="px-4 py-3 font-semibold">III. Düzey</th>
                <th className="px-4 py-3 font-semibold">IV. Düzey</th>
                <th className="px-4 py-3 font-semibold">V. Düzey</th>
                <th className="px-4 py-3 font-semibold">Açıklama</th>
                <th className="px-4 py-3 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <Hash className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.hesap_kodu}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{item.duzey_1 || '-'}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{item.duzey_2 || '-'}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{item.duzey_3 || '-'}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{item.duzey_4 || '-'}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{item.duzey_5 || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {item.aciklama}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        title="Sil"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Taşınır Kod Ekle"
        description="Tam kodu (Örn: 150.01.01.01) aralara nokta koyarak girin. Sistem düzeyleri otomatik ayıracaktır."
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-455 mb-1.5">
              Tam Taşınır Kodu <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={tamKod}
              onChange={(e) => setTamKod(e.target.value)}
              placeholder="Örn: 150.01.01.01"
              className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 font-mono"
            />
            {tamKod.trim() && (
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-slate-500 font-semibold mr-1">
                  Düzey Kırılımı:
                </span>
                {tamKod.split('.').map((part, i) => (
                  <span
                    key={i}
                    className={cn(
                      'px-2 py-0.5 rounded text-[11px] font-mono font-bold border',
                      i === 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50'
                        : i === 1
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
                          : i === 2
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50'
                            : i === 3
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
                              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    )}
                  >
                    {part || '?'}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-455 mb-1.5">
              Kod Açıklaması (Grup/Malzeme Adı) <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Örn: Roller Kalemler"
              className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
              Ağaca Ekle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
