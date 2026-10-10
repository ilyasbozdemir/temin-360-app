import React, { useState } from 'react'
import { Settings2, Trash2 } from 'lucide-react'
import { DOC_GROUPS } from '@temin360/document-templates'
import { GorevItem, MemberRow, PersonelItem } from './types'
import { HizliKadroPersonelSelect } from './HizliKadroPersonelSelect'
import { HizliKadroBelgeSecimModal } from './HizliKadroBelgeSecimModal'

interface HizliKadroRowProps {
  row: MemberRow
  index: number
  gorevler: GorevItem[]
  personeller: PersonelItem[]
  isDropdownOpen: boolean
  onToggleDropdown: () => void
  searchTerm: string
  onSearchChange: (val: string) => void
  onSelectGorev: (
    rowId: string | number,
    gorevAd: string,
    gorevId: number | null
  ) => void
  onSelectPersonel: (rowId: string | number, pId: number | null) => void
  onToggleAsil: (rowId: string | number) => void
  onChangeBelgeSablonIds: (rowId: string | number, sablonIds: string[] | null) => void
  onRemoveRow: (rowId: string | number) => void
}

export const HizliKadroRow: React.FC<HizliKadroRowProps> = ({
  row,
  index,
  gorevler,
  personeller,
  isDropdownOpen,
  onToggleDropdown,
  searchTerm,
  onSearchChange,
  onSelectGorev,
  onSelectPersonel,
  onToggleAsil,
  onChangeBelgeSablonIds,
  onRemoveRow
}) => {
  const [isBelgeModalOpen, setIsBelgeModalOpen] = useState(false)
  const assignedPerson = personeller.find((p) => p.id === row.personelId)
  const isHidden = Array.isArray(row.belgeSablonIds) && row.belgeSablonIds.length === 0

  const getPresetKey = (sablonIds: string[] | null): string => {
    if (sablonIds === null) return 'tumu'
    if (sablonIds.length === 0) return 'gizli'

    const equalsGroup = (groupKey: keyof typeof DOC_GROUPS) => {
      const group = DOC_GROUPS[groupKey]
      if (sablonIds.length !== group.length) return false
      return group.every((id) => sablonIds.includes(id))
    }

    if (equalsGroup('piyasa_arastirma')) return 'piyasa_arastirma'
    if (equalsGroup('muayene_kabul')) return 'muayene_kabul'
    if (equalsGroup('olur_onay')) return 'olur_onay'

    return 'ozel'
  }

  const currentPreset = getPresetKey(row.belgeSablonIds)
  const selectedDocCount = Array.isArray(row.belgeSablonIds) ? row.belgeSablonIds.length : 0

  return (
    <div
      className={`grid gap-2 items-center px-3.5 py-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
        isHidden ? 'opacity-55' : ''
      } ${isDropdownOpen ? 'relative z-40' : 'relative z-0'}`}
      style={{ gridTemplateColumns: '28px 180px 1fr 80px 200px 32px' }}
    >
      {/* # Sıra No */}
      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-mono font-bold flex items-center justify-center">
        {index + 1}
      </span>

      {/* Görev Seçimi */}
      <select
        value={row.gorevAd}
        onChange={(e) => {
          const val = e.target.value
          const matched = gorevler.find((g) => g.ad === val)
          onSelectGorev(row.id, val, matched ? matched.id : null)
        }}
        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
      >
        {gorevler.length > 0 ? (
          gorevler.map((g) => (
            <option key={g.id} value={g.ad}>
              {g.ad}
            </option>
          ))
        ) : (
          <>
            <option value="Harcama Yetkilisi">Harcama Yetkilisi</option>
            <option value="Gerçekleştirme Görevlisi">Gerçekleştirme Görevlisi</option>
            <option value="Komisyon Başkanı">Komisyon Başkanı</option>
            <option value="Fiyat Araştırma Görevlisi">Fiyat Araştırma Görevlisi</option>
            <option value="Üye">Üye</option>
            <option value="Yedek Üye">Yedek Üye</option>
          </>
        )}
        {!gorevler.some((g) => g.ad === row.gorevAd) && (
          <option value={row.gorevAd}>{row.gorevAd}</option>
        )}
      </select>

      {/* Personel Arama & Seçimi */}
      <HizliKadroPersonelSelect
        rowId={row.id}
        personelId={row.personelId}
        assignedPerson={assignedPerson}
        isOpen={isDropdownOpen}
        onToggleOpen={onToggleDropdown}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onSelectPersonel={(pId) => onSelectPersonel(row.id, pId)}
        personeller={personeller}
      />

      {/* Asil / Yedek Butonu */}
      <button
        type="button"
        onClick={() => onToggleAsil(row.id)}
        className={`px-2 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer w-full text-center ${
          row.asilMi === 1
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        }`}
      >
        {row.asilMi === 1 ? '✓ Asil' : '⟳ Yedek'}
      </button>

      {/* Belge Kapsamı Seçimi & Granüler Şablon Butonu */}
      <div className="flex items-center gap-1.5 w-full">
        <select
          value={currentPreset}
          onChange={(e) => {
            const val = e.target.value
            if (val === 'tumu') {
              onChangeBelgeSablonIds(row.id, null)
            } else if (val === 'gizli') {
              onChangeBelgeSablonIds(row.id, [])
            } else if (val === 'piyasa_arastirma') {
              onChangeBelgeSablonIds(row.id, [...DOC_GROUPS.piyasa_arastirma])
            } else if (val === 'muayene_kabul') {
              onChangeBelgeSablonIds(row.id, [...DOC_GROUPS.muayene_kabul])
            } else if (val === 'olur_onay') {
              onChangeBelgeSablonIds(row.id, [...DOC_GROUPS.olur_onay])
            } else if (val === 'ozel') {
              setIsBelgeModalOpen(true)
            }
          }}
          title="Bu personelin hangi belgelerde görüneceğini belirler"
          className={`w-full text-xs font-semibold rounded-xl px-2 py-1.5 border outline-none cursor-pointer transition-all ${
            isHidden
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
              : currentPreset === 'ozel'
                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 focus:ring-2 focus:ring-indigo-500/20'
                : 'bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-500/20'
          }`}
        >
          <option value="tumu">📄 Tüm Belgelerde</option>
          <option value="piyasa_arastirma">🛒 Sadece Fiyat Araştırma</option>
          <option value="muayene_kabul">🔬 Sadece Muayene & Kabul</option>
          <option value="olur_onay">📑 Sadece Olur / Onay</option>
          <option value="ozel">
            🎯 Özel Şablon Seçimi {currentPreset === 'ozel' && selectedDocCount > 0 ? `(${selectedDocCount})` : ''}
          </option>
          <option value="gizli">🚫 Hiçbir Belgede (Gizli)</option>
        </select>

        {row.belgeSablonIds !== null && (
          <button
            type="button"
            onClick={() => setIsBelgeModalOpen(true)}
            className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors shrink-0"
            title="Şablonları Düzenle / İnce Ayar"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sil Butonu */}
      <button
        type="button"
        onClick={() => onRemoveRow(row.id)}
        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
        title="Bu Görevi Kaldır"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Granüler Şablon Seçim Modalı */}
      {isBelgeModalOpen && (
        <HizliKadroBelgeSecimModal
          isOpen={isBelgeModalOpen}
          onClose={() => setIsBelgeModalOpen(false)}
          memberName={assignedPerson?.ad_soyad || ''}
          memberGorev={row.gorevAd}
          selectedDocs={row.belgeSablonIds || []}
          onSave={(docs) => {
            onChangeBelgeSablonIds(row.id, docs)
          }}
        />
      )}
    </div>
  )
}
