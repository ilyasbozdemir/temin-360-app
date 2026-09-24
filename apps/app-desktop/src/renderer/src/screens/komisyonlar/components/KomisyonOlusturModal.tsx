import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import {
  KomisyonBilgileriSection,
  KomisyonOlusturModalProps,
  KomisyonSablonlarSection,
  KomisyonUyelerSection,
  useKomisyonOlustur
} from './komisyon-olustur'

export function KomisyonOlusturModal({
  isOpen,
  onClose,
  komisyonId,
  onPreviewSablon
}: KomisyonOlusturModalProps): React.JSX.Element | null {
  const {
    ad,
    setAd,
    seciliTip,
    uyeler,
    seciliSablonlar,
    sablonArama,
    setSablonArama,
    gorevler,
    tumPersonel,
    tumSablonlar,
    handleTipSec,
    handleAddUye,
    handleRemoveUye,
    handleUyeChange,
    handlePersonelSec,
    handleUnvanChange,
    handleSablonToggle,
    handleClose,
    saveMutation
  } = useKomisyonOlustur({ isOpen, onClose, komisyonId })

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={komisyonId ? 'Komisyonu Düzenle' : 'Yeni Komisyon Oluştur'}
      description="Komisyonun kadro ve kontenjanlarını belirleyin."
      className="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Hata Bildirimi */}
        {saveMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {saveMutation.error?.message}
          </div>
        )}

        {/* Bölüm 1: Komisyon Bilgileri & Şablon Tipi */}
        <KomisyonBilgileriSection
          ad={ad}
          setAd={setAd}
          seciliTip={seciliTip}
          onSelectTip={handleTipSec}
          isEdit={!!komisyonId}
        />

        {/* Bölüm 2: Kadro & Üyeler */}
        <KomisyonUyelerSection
          uyeler={uyeler}
          gorevler={gorevler}
          tumPersonel={tumPersonel}
          onAddUye={handleAddUye}
          onRemoveUye={handleRemoveUye}
          onUyeChange={handleUyeChange}
          onPersonelSec={handlePersonelSec}
          onUnvanChange={handleUnvanChange}
        />

        {/* Bölüm 3: İlişkili Belge Şablonları */}
        <KomisyonSablonlarSection
          tumSablonlar={tumSablonlar}
          seciliSablonlar={seciliSablonlar}
          sablonArama={sablonArama}
          setSablonArama={setSablonArama}
          onToggleSablon={handleSablonToggle}
          onPreviewSablon={onPreviewSablon}
        />

        {/* Alt Aksiyon Butonları */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={handleClose} className="cursor-pointer">
            İptal
          </Button>
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="cursor-pointer"
          >
            {saveMutation.isPending ? 'Kaydediliyor...' : komisyonId ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
