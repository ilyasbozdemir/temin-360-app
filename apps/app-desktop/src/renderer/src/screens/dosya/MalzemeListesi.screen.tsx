import React, { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSettingsStore } from '../../store/settingsStore'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Edit2,
  FileText,
  Package,
  Plus,
  Printer,
  Trash2,
  X
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Modal } from '../../components/ui/Modal'
import { SubScreen } from './SubScreen'

import { useMalzemeListesi } from './sub-screens/components/MalzemeListesi/useMalzemeListesi'

export function MalzemeListesi(): React.JSX.Element {
  const { isAiConfigured } = useSettingsStore()
  const { activeDosyaId } = useWorkspaceStore()

  const {
    items,
    units,
    libraryItems,
    loading,
    kalemAdi,
    setKalemAdi,
    tasinirKodu,
    setTasinirKodu,
    okasKodu,
    setOkasKodu,
    tipi,
    setTipi,
    birim,
    setBirim,
    miktar,
    setMiktar,
    kdvOrani,
    setKdvOrani,
    aciklama,
    setAciklama,
    searchQuery,
    setSearchQuery,
    showSuggestions,
    setShowSuggestions,
    aiLoading,
    isAddModalOpen,
    setIsAddModalOpen,
    activeTab,
    setActiveTab,
    selectedItemIds,
    setSelectedItemIds,
    itemMiktarlar,
    setItemMiktarlar,
    libSearchQuery,
    setLibSearchQuery,
    editingId,
    setEditingId,
    editMiktar,
    setEditMiktar,
    editBirim,
    setEditBirim,
    editKdv,
    setEditKdv,
    handleAiAçiklama,
    handleSelectSuggestion,
    handleAddItem,
    handleDeleteItem,
    handleStartEdit,
    handleSaveEdit,
    handleAddSelected
  } = useMalzemeListesi(activeDosyaId)

  // Madde / Şart states
  const [maddeler, setMaddeler] = useState<string[]>([])
  const [isMaddeModalOpen, setIsMaddeModalOpen] = useState(false)
  const [maddeInput, setMaddeInput] = useState('')
  const [editingMaddeIndex, setEditingMaddeIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!activeDosyaId) return
    window.electron.ipcRenderer
      .invoke(
        'db:query',
        'SELECT isin_aciklama_maddeleri FROM DATA_TeminDosyasi WHERE id = ?',
        [activeDosyaId]
      )
      .then((resDosya: any) => {
        if (resDosya.success && resDosya.data.length > 0) {
          const rawMaddeler = resDosya.data[0].isin_aciklama_maddeleri
          if (rawMaddeler) {
            try {
              const parsed = JSON.parse(rawMaddeler)
              if (Array.isArray(parsed)) setMaddeler(parsed)
            } catch (e) {
              console.error(e)
            }
          } else {
            setMaddeler([])
          }
        }
      })
  }, [activeDosyaId])

  const handleSaveMaddeler = async (newMaddeler: string[]) => {
    if (!activeDosyaId) return
    const rawMaddeler = JSON.stringify(newMaddeler)
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'UPDATE DATA_TeminDosyasi SET isin_aciklama_maddeleri = ? WHERE id = ?',
        [rawMaddeler, activeDosyaId]
      )
      if (res.success) {
        setMaddeler(newMaddeler)
      } else {
        alert('Hata: ' + (res.error || 'Kaydedilemedi'))
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handleMoveMadde = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1
    if (nextIdx < 0 || nextIdx >= maddeler.length) return
    const updated = [...maddeler]
    const temp = updated[index]
    updated[index] = updated[nextIdx]
    updated[nextIdx] = temp
    handleSaveMaddeler(updated)
  }

  const filteredSuggestions = searchQuery.trim()
    ? libraryItems
        .filter((item) => item.kalem_adi.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
    : []

  return (
    <SubScreen
      title="İhtiyaç Listesi"
      icon={Package}
      description="Dosya kapsamındaki malzeme, hizmet veya yapım işi ihtiyaçlarını listeleyin ve yönetin."
    >
      {/* ADD MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setSelectedItemIds(new Set())
          setItemMiktarlar({})
          setLibSearchQuery('')
        }}
        title="Dosyaya Kalem Ekle"
        description="Kütüphaneden seçin veya yeni bir kalem oluşturun."
      >
        {/* Sekmeler */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={cn(
              'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'library'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            📋 Kütüphaneden Seç
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={cn(
              'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'new'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            ✏️ Yeni Kalem
          </button>
        </div>

        {/* SEKME 1: KÜTÜPHANE LİSTESİ */}
        {activeTab === 'library' && (
          <div className="space-y-3">
            <input
              type="text"
              value={libSearchQuery}
              onChange={(e) => setLibSearchQuery(e.target.value)}
              placeholder="Kalem adı, tür veya kod ile arayın..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />

            {selectedItemIds.size > 0 && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  {selectedItemIds.size} kalem seçildi
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemIds(new Set())
                    setItemMiktarlar({})
                  }}
                  className="text-[10px] text-blue-500 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Seçimi Temizle
                </button>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
              {libraryItems
                .filter(
                  (item) =>
                    !libSearchQuery.trim() ||
                    item.kalem_adi.toLowerCase().includes(libSearchQuery.toLowerCase()) ||
                    (item.tasinir_kodu || '')
                      .toLowerCase()
                      .includes(libSearchQuery.toLowerCase()) ||
                    (item.okas_kodu || '').toLowerCase().includes(libSearchQuery.toLowerCase())
                )
                .map((item) => {
                  const isSelected = selectedItemIds.has(item.id)
                  const mkt = itemMiktarlar[item.id] ?? 1
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all cursor-pointer',
                        isSelected
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      )}
                      onClick={() => {
                        setSelectedItemIds((prev) => {
                          const next = new Set(prev)
                          if (next.has(item.id)) next.delete(item.id)
                          else next.add(item.id)
                          return next
                        })
                      }}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        )}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.kalem_adi}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={cn(
                              'text-[9px] font-black uppercase px-1 py-0.5 rounded',
                              item.tipi === 'Mal' && 'bg-blue-100 text-blue-600',
                              item.tipi === 'Hizmet' && 'bg-violet-100 text-violet-600',
                              item.tipi === 'Yapım' && 'bg-amber-100 text-amber-600',
                              item.tipi === 'Danışmanlık' && 'bg-pink-100 text-pink-600'
                            )}
                          >
                            {item.tipi}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {item.birim} · %{item.kdv_orani} KDV
                          </span>
                          {item.tasinir_kodu && (
                            <span className="text-[9px] text-slate-400 font-mono">
                              {item.tasinir_kodu}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div
                          className="flex items-center gap-1 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setItemMiktarlar((prev) => ({
                                ...prev,
                                [item.id]: Math.max(1, (prev[item.id] ?? 1) - 1)
                              }))
                            }
                            className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                            {mkt}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setItemMiktarlar((prev) => ({
                                ...prev,
                                [item.id]: (prev[item.id] ?? 1) + 1
                              }))
                            }
                            className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              {libraryItems.length === 0 && (
                <div className="text-center text-xs text-slate-400 py-8">
                  Kütüphanede henüz kayıtlı kalem yok. Yeni Kalem sekmesinden ekleyebilirsiniz.
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setSelectedItemIds(new Set())
                  setItemMiktarlar({})
                  setLibSearchQuery('')
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={selectedItemIds.size === 0}
                onClick={handleAddSelected}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {selectedItemIds.size > 0 ? `${selectedItemIds.size} Kalem Ekle` : 'Kalem Seçin'}
              </button>
            </div>
          </div>
        )}

        {/* SEKME 2: YENİ KALEM FORMU */}
        {activeTab === 'new' && (
          <form onSubmit={handleAddItem} className="space-y-3.5">
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Malzeme / Hizmet Adı
              </label>
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setKalemAdi(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Kütüphaneden arayın veya yeni yazın..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {filteredSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs text-slate-700 dark:text-slate-350 font-semibold transition-colors flex flex-col"
                    >
                      <span>{item.kalem_adi}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        Tip: {item.tipi} | KDV: %{item.kdv_orani}{' '}
                        {item.tasinir_kodu ? `| Taşınır: ${item.tasinir_kodu}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Taşınır Kodu
                </label>
                <input
                  type="text"
                  value={tasinirKodu}
                  onChange={(e) => setTasinirKodu(e.target.value)}
                  placeholder="Örn: 150.01.01"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  OKAS Kodu
                </label>
                <input
                  type="text"
                  value={okasKodu}
                  onChange={(e) => setOkasKodu(e.target.value)}
                  placeholder="Örn: 30192700"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Kalem Türü
                </label>
                <select
                  value={tipi}
                  onChange={(e) => setTipi(e.target.value)}
                  title="Kalem Türü"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200"
                >
                  <option value="Mal">Mal Alımı</option>
                  <option value="Hizmet">Hizmet Alımı</option>
                  <option value="Yapım">Yapım İşi</option>
                  <option value="Danışmanlık">Danışmanlık Alımı</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Ölçü Birimi
                </label>
                <select
                  value={birim}
                  onChange={(e) => setBirim(e.target.value)}
                  title="Ölçü Birimi"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200"
                >
                  {units.map((u, idx) => (
                    <option key={idx} value={u.ad}>
                      {u.ad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Miktar
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={miktar}
                  title="Miktar"
                  onChange={(e) => setMiktar(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  KDV Oranı (%)
                </label>
                <select
                  value={kdvOrani}
                  onChange={(e) => setKdvOrani(parseInt(e.target.value, 10))}
                  title="KDV Oranı"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200"
                >
                  <option value="0">%0</option>
                  <option value="1">%1</option>
                  <option value="10">%10</option>
                  <option value="20">%20</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Açıklama (Opsiyonel)
                </label>
                {isAiConfigured && (
                  <button
                    type="button"
                    onClick={handleAiAçiklama}
                    disabled={(!kalemAdi && !searchQuery) || aiLoading}
                    className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {aiLoading ? 'Düşünüyor...' : '✨ AI Önerisi'}
                  </button>
                )}
              </div>
              <textarea
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                placeholder="Özellikler, marka model veya teknik şartlar..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Kaydet ve Ekle
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ITEMS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col min-h-[400px] print:shadow-none print:border-none print:p-0 print:m-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Dosyadaki Kalemler
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">
              {items.length}
            </span>
          </h3>
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Yazdır
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Kalem Ekle
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
            Yükleniyor...
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs">
              Bu dosyada henüz herhangi bir malzeme/hizmet kalemi eklenmemiş.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3 pl-4">Kalem Adı</th>
                  <th className="p-3">Tür</th>
                  <th className="p-3 text-center">Miktar</th>
                  <th className="p-3">Birim</th>
                  <th className="p-3 text-center">KDV (%)</th>
                  <th className="p-3 text-right pr-4 print:hidden">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {items.map((item) => {
                  const isEditing = editingId === item.id
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-3 pl-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {item.kalem_adi}
                        </div>
                        {(item.tasinir_kodu || item.okas_kodu) && (
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                            {item.tasinir_kodu && `Taşınır: ${item.tasinir_kodu}`}
                            {item.tasinir_kodu && item.okas_kodu && ' · '}
                            {item.okas_kodu && `OKAS: ${item.okas_kodu}`}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase',
                            item.tipi === 'Mal' &&
                              'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                            item.tipi === 'Hizmet' &&
                              'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
                            item.tipi === 'Yapım' &&
                              'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
                            item.tipi === 'Danışmanlık' &&
                              'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                          )}
                        >
                          {item.tipi}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editMiktar}
                            onChange={(e) => setEditMiktar(parseFloat(e.target.value) || 1)}
                            className="w-16 p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-center text-xs font-bold"
                          />
                        ) : (
                          <span className="font-black text-slate-700 dark:text-slate-300">
                            {item.miktar}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={editBirim}
                            onChange={(e) => setEditBirim(e.target.value)}
                            className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded text-xs"
                          >
                            {units.map((u, idx) => (
                              <option key={idx} value={u.ad}>
                                {u.ad}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{item.birim}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <select
                            value={editKdv}
                            onChange={(e) => setEditKdv(parseInt(e.target.value, 10))}
                            className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded text-xs"
                          >
                            <option value="0">%0</option>
                            <option value="1">%1</option>
                            <option value="10">%10</option>
                            <option value="20">%20</option>
                          </select>
                        ) : (
                          <span>%{item.kdv_orani}</span>
                        )}
                      </td>
                      <td className="p-3 text-right pr-4 print:hidden">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Değişiklikleri Kaydet"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 rounded-lg transition-colors cursor-pointer"
                                title="İptal"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors cursor-pointer"
                                title="Kalemi Düzenle"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors cursor-pointer"
                                title="Kalemi Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AÇIKLAMA MADDELERİ LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col mt-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="p-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded">
              <FileText className="w-3.5 h-3.5" />
            </span>
            Özel Şartlar / Açıklama Maddeleri
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">
              {maddeler.length}
            </span>
          </h3>
          <button
            onClick={() => {
              setEditingMaddeIndex(null)
              setMaddeInput('')
              setIsMaddeModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Madde / Şart Ekle
          </button>
        </div>

        {maddeler.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs">
              Lüzum Müzekkeresinde malzeme tablosunun altında görünecek herhangi bir özel şart
              eklenmemiş.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {maddeler.map((madde, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl group transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500 mt-0.5">
                    {idx + 1}.
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {madde}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveMadde(idx, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                    title="Yukarı Taşı"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === maddeler.length - 1}
                    onClick={() => handleMoveMadde(idx, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                    title="Aşağı Taşı"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingMaddeIndex(idx)
                      setMaddeInput(madde)
                      setIsMaddeModalOpen(true)
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Bu maddeyi silmek istediğinize emin misiniz?')) {
                        const updated = maddeler.filter((_, i) => i !== idx)
                        handleSaveMaddeler(updated)
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MADDE ADD/EDIT MODAL */}
      <Modal
        isOpen={isMaddeModalOpen}
        onClose={() => setIsMaddeModalOpen(false)}
        title={editingMaddeIndex !== null ? 'Madde / Şart Düzenle' : 'Yeni Madde / Şart Ekle'}
        description="Belgede görünecek özel şart veya açıklama maddesi metni."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const text = maddeInput.trim()
            if (!text) return
            const updated = [...maddeler]
            if (editingMaddeIndex !== null) {
              updated[editingMaddeIndex] = text
            } else {
              updated.push(text)
            }
            handleSaveMaddeler(updated)
            setIsMaddeModalOpen(false)
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Madde / Şart Metni
            </label>
            <textarea
              required
              rows={4}
              value={maddeInput}
              onChange={(e) => setMaddeInput(e.target.value)}
              placeholder="Örn: Alınacak tüm malzemelerin garanti süresi en az 2 (iki) yıl olacaktır."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white leading-normal resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsMaddeModalOpen(false)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </form>
      </Modal>
    </SubScreen>
  )
}
