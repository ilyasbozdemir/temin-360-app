import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { APP_ROUTES } from '../../constants/routeConstants'
import {
  FileText,
  FolderTree,
  ListFilter,
  PackageSearch,
  Plus,
  Search,
  Tag,
  Trash2
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ExcelActions } from '../../components/ui/ExcelActions'
import { Kalem, useMalzemelerHooks } from './malzemeler.hooks'
import { cn } from '../../utils/cn'
import { DataViewMode, ViewToggle } from '../../components/ui/ViewToggle'
import { MalzemeGroupHeader } from './components/MalzemeGroupHeader'
import { MalzemeGridCard } from './components/MalzemeGridCard'
import { MalzemeListCard } from './components/MalzemeListCard'
import { MalzemeTableRow } from './components/MalzemeTableRow'

export default function MalzemelerScreen(): React.JSX.Element {
  const navigate = useNavigate()
  const { kalemList, isLoading: isKalemLoading, deleteKalem } = useMalzemelerHooks()

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Tümü') // Tümü, Mal, Hizmet, Personel, Hizmet, Diğer, Yapım
  const [viewMode, setViewMode] = useState<DataViewMode>('list')
  const [groupMode, setGroupMode] = useState<'none' | 'tasinir' | 'okas'>('none')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleEdit = (item: Kalem) => {
    navigate({
      to: APP_ROUTES.YENI_MALZEME,
      search: { id: item.id } as Record<string, unknown>
    })
  }

  const handleDeleteKalem = (item: Kalem) => {
    handleDelete(item.id, item.barkod_id, item.kalem_adi)
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredList.map((x) => x.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert('Lütfen silinecek kalemleri seçin.')
      return
    }

    if (!confirm(`Seçilen ${selectedIds.length} kalemi silmek istediğinize emin misiniz?`)) {
      return
    }

    let deletedCount = 0
    const inUseNames: string[] = []
    const failedNames: string[] = []

    for (const id of selectedIds) {
      const item = kalemList.find((x) => x.id === id)
      if (!item) continue

      try {
        const checkRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT COUNT(*) as sayi FROM DATA_TeminKalem WHERE barkod_id = ?`,
          [item.barkod_id]
        )
        if (checkRes.success && checkRes.data?.[0]?.sayi > 0) {
          inUseNames.push(item.kalem_adi)
          continue
        }

        await deleteKalem(id)
        deletedCount++
      } catch (err: any) {
        failedNames.push(`${item.kalem_adi} (${err.message})`)
      }
    }

    let msg = ''
    if (deletedCount > 0) {
      msg += `${deletedCount} adet kalem başarıyla silindi.\n`
    }
    if (inUseNames.length > 0) {
      msg += `\n⚠️ Aşağıdaki ${inUseNames.length} kalem doğrudan temin dosyalarında kullanıldığı için SİLİNEMEDİ:\n`
      msg += inUseNames.map((n) => `- ${n}`).join('\n') + '\n'
    }
    if (failedNames.length > 0) {
      msg += `\n❌ Aşağıdaki ${failedNames.length} kalemi silerken hata oluştu:\n`
      msg += failedNames.map((n) => `- ${n}`).join('\n') + '\n'
    }

    alert(msg)
    setSelectedIds([])
  }

  const handleDelete = async (id: number, barkod_id: string, kalem_adi: string) => {
    // Önce bu malzemenin herhangi bir doğrudan temin dosyasında kullanılıp kullanılmadığını kontrol et
    try {
      const checkRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT COUNT(*) as sayi FROM DATA_TeminKalem WHERE barkod_id = ?`,
        [barkod_id]
      )
      if (checkRes.success && checkRes.data?.[0]?.sayi > 0) {
        const kullanimSayisi = checkRes.data[0].sayi
        alert(
          `"${kalem_adi}" kalemi silinemez!\n\n` +
            `Bu malzeme/hizmet, ${kullanimSayisi} doğrudan temin dosyasında (kalem olarak) kullanılmaktadır.\n\n` +
            `Silmek istiyorsanız önce ilgili temin dosyalarından bu kalemi kaldırmanız gerekmektedir.`
        )
        return
      }
    } catch {
      // Kontrol başarısız olursa yine de silmeye izin vermiyoruz
      alert('Kullanım kontrolü yapılamadı. Lütfen tekrar deneyin.')
      return
    }

    if (confirm(`"${kalem_adi}" kaydını silmek istediğinize emin misiniz?`)) {
      try {
        await deleteKalem(id)
      } catch (error: any) {
        alert('Silinirken hata oluştu: ' + error.message)
      }
    }
  }



  const filteredList = kalemList.filter((m) => {
    const matchesSearch =
      m.kalem_adi.toLowerCase().includes(search.toLowerCase()) ||
      (m.tasinir_kodu || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.okas_kodu || '').toLowerCase().includes(search.toLowerCase()) ||
      m.barkod_id.toLowerCase().includes(search.toLowerCase())

    const matchesTab =
      activeTab === 'Tümü' ||
      m.tipi === activeTab ||
      (activeTab === 'Hizmet' && m.tipi?.startsWith('Hizmet'))

    return matchesSearch && matchesTab
  })

  const groupedItems = useMemo(() => {
    if (groupMode === 'none') {
      return { Tümü: filteredList }
    }

    const groups: Record<string, typeof filteredList> = {}

    filteredList.forEach((item) => {
      let key = 'Diğer / Kodsuz'
      if (groupMode === 'tasinir') {
        if (item.tasinir_kodu) {
          const parts = item.tasinir_kodu.split('.')
          if (parts.length >= 2) {
            key = `${parts[0]}.${parts[1]}`
          } else {
            key = parts[0]
          }
        } else {
          key = 'Taşınır Kodsuz'
        }
      } else if (groupMode === 'okas') {
        if (item.okas_kodu) {
          const cleanOkas = item.okas_kodu.replace(/[^0-9]/g, '')
          if (cleanOkas.length >= 2) {
            key = `${cleanOkas.substring(0, 2)}xx`
          } else if (cleanOkas.length > 0) {
            key = `${cleanOkas}x`
          } else {
            key = item.okas_kodu
          }
        } else {
          key = 'OKAS Kodsuz'
        }
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
    })

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const isAExtra = a.includes('Kodsuz') || a.includes('Diğer')
      const isBExtra = b.includes('Kodsuz') || b.includes('Diğer')
      if (isAExtra && !isBExtra) return 1
      if (!isAExtra && isBExtra) return -1
      return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    })

    const sortedGroups: Record<string, typeof filteredList> = {}
    sortedKeys.forEach((k) => {
      sortedGroups[k] = groups[k]
    })

    return sortedGroups
  }, [filteredList, groupMode])

  if (isKalemLoading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6 border-b border-slate-200 dark:border-slate-800 pb-6 shrink-0">
        <div className="w-full">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <PackageSearch className="w-8 h-8 text-blue-605" />
            Kayıtlı Mal / Hizmet / Yapım İşleri Listesi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-4xl">
            Yaklaşık maliyet hesaplarında ve teklif mektuplarında kullanılacak malzeme, hizmet ve
            yapım kalemlerini yönetin.
          </p>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <p className="mb-1">
                💡 <strong>İpucu:</strong> Güncel Taşınır Kodları listesine ulaşmak için{' '}
                <a
                  href="https://muhasebat.hmb.gov.tr/tasinir-kod-listesi"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-semibold hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Muhasebat Genel Müdürlüğü
                </a>{' '}
                sayfasını ziyaret edebilirsiniz.
              </p>
              <p>
                📣 Uygulama altyapımız bu kodları tamamen desteklemektedir. Hazır malzeme listesi ve
                kodlarının varsayılan olarak eklenmesi için{' '}
                <a
                  href="https://github.com/ilyasbozdemir/temin-360-app"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-semibold hover:text-blue-800 dark:hover:text-blue-200"
                >
                  GitHub sayfamızdan Issue açarak
                </a>{' '}
                bize veritabanı taleplerinizi iletebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-4 sm:pb-0 pr-0 sm:pr-6 w-full sm:w-auto">
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                {kalemList.length}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                Kayıtlı Kalem
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 justify-end w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                onClick={handleDeleteSelected}
                className="gap-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 flex items-center px-4 py-2 text-sm justify-center"
              >
                <Trash2 className="w-4 h-4 shrink-0 text-red-650" />
                <span className="whitespace-nowrap font-bold">
                  Seçilenleri Sil ({selectedIds.length})
                </span>
              </Button>
            )}
            <ExcelActions
              tableName="TANIM_Kalem"
              title="Malzemeler / Kalemler"
              uniqueCol="barkod_id"
              onImportSuccess={() => window.location.reload()}
            />
            <Link to="/tasinirkod" className="shrink-0">
              <Button
                variant="outline"
                className="w-full gap-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center px-4 py-2 text-sm justify-center"
              >
                <FolderTree className="w-4 h-4 text-emerald-600 shrink-0" />{' '}
                <span className="whitespace-nowrap">Taşınır Kodları</span>
              </Button>
            </Link>
            <Link to="/okaskod" className="shrink-0">
              <Button
                variant="outline"
                className="w-full gap-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center px-4 py-2 text-sm justify-center"
              >
                <Tag className="w-4 h-4 text-indigo-600 shrink-0" />{' '}
                <span className="whitespace-nowrap">OKAS Kodları</span>
              </Button>
            </Link>
            <Link to="/malzemeler/yeni" className="shrink-0">
              <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-5 py-2 text-sm justify-center text-white">
                <Plus className="w-4 h-4 shrink-0" />{' '}
                <span className="whitespace-nowrap font-semibold">Mal/Hizmet/Yapım İşi Ekle</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Mal Alımı (Malzeme)
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {kalemList.filter((m) => m.tipi === 'Mal').length} Kalem
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Hizmet Alımı
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {kalemList.filter((m) => m.tipi?.startsWith('Hizmet')).length} Kalem
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-450 flex items-center justify-center shrink-0">
            <PackageSearch className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Yapım İşi
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {kalemList.filter((m) => m.tipi === 'Yapım').length} Kalem
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
        {/* TABS, VIEW MODE & SEARCH */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg overflow-x-auto max-w-full">
            {['Tümü', 'Mal', 'Hizmet', 'Yapım'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap',
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                {tab === 'Mal'
                  ? 'Mal Alımı'
                  : tab === 'Hizmet'
                    ? 'Hizmet Alımı'
                    : tab === 'Yapım'
                      ? 'Yapım İşi'
                      : tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer hover:text-slate-850 dark:hover:text-slate-100 shrink-0">
              <input
                type="checkbox"
                checked={filteredList.length > 0 && selectedIds.length === filteredList.length}
                ref={(el) => {
                  if (el) {
                    el.indeterminate =
                      selectedIds.length > 0 && selectedIds.length < filteredList.length
                  }
                }}
                onChange={handleToggleSelectAll}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-905 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              Tümünü Seç ({selectedIds.length})
            </label>

            <select
              value={groupMode}
              onChange={(e) => setGroupMode(e.target.value as 'none' | 'tasinir' | 'okas')}
              className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-700 dark:text-slate-300 w-full sm:w-auto"
            >
              <option value="none">Gruplama Yok</option>
              <option value="tasinir">Taşınır Koduna Göre Grupla</option>
              <option value="okas">OKAS Koduna Göre Grupla</option>
            </select>

            <ViewToggle
              viewMode={viewMode}
              onChange={setViewMode}
              className="w-full sm:w-auto justify-center sm:justify-start"
            />

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ad, Barkod veya Taşınır Kodu ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* LIST / GRID / TABLE */}
        <div className="flex-1 overflow-auto p-4">
          {filteredList.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <ListFilter className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Kayıt Bulunamadı
              </h3>
              <p className="text-xs mt-1 text-slate-500">
                Arama veya filtreleme kriterlerine uygun kayıt bulunmuyor.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="flex flex-col gap-8">
              {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="flex flex-col gap-3">
                  <MalzemeGroupHeader
                    groupMode={groupMode}
                    groupName={groupName}
                    itemCount={items.length}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                      <MalzemeGridCard
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.includes(item.id)}
                        onToggleSelect={handleToggleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDeleteKalem}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-8">
              {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="flex flex-col gap-3">
                  <MalzemeGroupHeader
                    groupMode={groupMode}
                    groupName={groupName}
                    itemCount={items.length}
                  />
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <MalzemeListCard
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.includes(item.id)}
                        onToggleSelect={handleToggleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDeleteKalem}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredList.length > 0 && selectedIds.length === filteredList.length
                        }
                        ref={(el) => {
                          if (el) {
                            el.indeterminate =
                              selectedIds.length > 0 && selectedIds.length < filteredList.length
                          }
                        }}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap">ID / Barkod</th>
                    <th className="px-4 py-3 whitespace-nowrap">Taşınır / OKAS</th>
                    <th className="px-4 py-3">Kalem Adı</th>
                    <th className="px-4 py-3 whitespace-nowrap">Tipi</th>
                    <th className="px-4 py-3 whitespace-nowrap">Birim</th>
                    <th className="px-4 py-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {Object.entries(groupedItems).map(([groupName, items]) => (
                    <React.Fragment key={groupName}>
                      <MalzemeGroupHeader
                        groupMode={groupMode}
                        groupName={groupName}
                        itemCount={items.length}
                        isTableRow
                      />
                      {items.map((item) => (
                        <MalzemeTableRow
                          key={item.id}
                          item={item}
                          isSelected={selectedIds.includes(item.id)}
                          onToggleSelect={handleToggleSelect}
                          onEdit={handleEdit}
                          onDelete={handleDeleteKalem}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
