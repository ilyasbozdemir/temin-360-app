import React from 'react'
import { AlertCircle, CheckCircle2, Eye } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import {
  HizliKadroFooter,
  HizliKadroGuncelleModalProps,
  HizliKadroRow,
  HizliKadroToolbar,
  useHizliKadro
} from './hizli-kadro'

export function HizliKadroGuncelleModal({
  isOpen,
  onClose,
  komisyonId,
  komisyonAdi = 'Komisyon',
  activeDosyaId
}: HizliKadroGuncelleModalProps): React.JSX.Element | null {
  const {
    rows,
    personeller,
    gorevler,
    syncToActiveFile,
    setSyncToActiveFile,
    searchPersonelTerm,
    setSearchPersonelTerm,
    activeDropdownRowId,
    setActiveDropdownRowId,
    statusMessage,
    handleAddRow,
    handleRemoveRow,
    handleSelectPersonel,
    handleSelectGorev,
    handleToggleAsil,
    handleToggleBelgedeGoster,
    handleLoadStandardTemplate,
    saveMutation
  } = useHizliKadro({
    isOpen,
    onClose,
    komisyonId,
    komisyonAdi,
    activeDosyaId
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Kadro & Üye Güncelle: ${komisyonAdi}`}
      description="Görevlileri, asil/yedek durumunu ve belgede gösterilip gösterilmeyeceğini tek yerden yönetin."
      className="max-w-5xl"
    >
      <div className="flex flex-col max-h-[78vh] -mx-6 -my-4 px-6 py-4">
        {/* Durum Bildirimi */}
        {statusMessage && (
          <div
            className={`mb-4 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Üst Toolbar ve İstatistikler */}
        <HizliKadroToolbar
          rows={rows}
          onLoadStandardTemplate={handleLoadStandardTemplate}
          onAddRow={handleAddRow}
        />

        {/* Tablo Başlıkları */}
        <div
          className="grid gap-2 px-3.5 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1"
          style={{ gridTemplateColumns: '28px 190px 1fr 80px 70px 32px' }}
        >
          <span>#</span>
          <span>Görevi / Rolü</span>
          <span>Personel</span>
          <span className="text-center">Asil/Yedek</span>
          <span className="text-center flex items-center justify-center gap-1">
            <Eye className="w-3 h-3" /> Belgede
          </span>
          <span />
        </div>

        {/* Tablo Satırları */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Henüz görevli atanmamış. &quot;Üye Ekle&quot; veya &quot;Standart Yükle&quot; butonuna
              tıklayabilirsiniz.
            </div>
          ) : (
            rows.map((row, index) => (
              <HizliKadroRow
                key={row.id}
                row={row}
                index={index}
                gorevler={gorevler}
                personeller={personeller}
                isDropdownOpen={activeDropdownRowId === row.id}
                onToggleDropdown={() =>
                  setActiveDropdownRowId(activeDropdownRowId === row.id ? null : row.id)
                }
                searchTerm={searchPersonelTerm}
                onSearchChange={setSearchPersonelTerm}
                onSelectGorev={handleSelectGorev}
                onSelectPersonel={handleSelectPersonel}
                onToggleAsil={handleToggleAsil}
                onToggleBelgedeGoster={handleToggleBelgedeGoster}
                onRemoveRow={handleRemoveRow}
              />
            ))
          )}
        </div>

        {/* Alt Footer & Aksiyonlar */}
        <HizliKadroFooter
          syncToActiveFile={syncToActiveFile}
          onToggleSyncToActiveFile={setSyncToActiveFile}
          activeDosyaId={activeDosyaId}
          onClose={onClose}
          onSave={() => saveMutation.mutate()}
          isPending={saveMutation.isPending}
        />
      </div>
    </Modal>
  )
}
