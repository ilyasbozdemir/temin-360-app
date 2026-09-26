import React from 'react'
import { Lock } from 'lucide-react'
import { FormFieldV2 } from '../../../types/formBuilder.types'

interface InspectorPropertiesTabProps {
  activeField: FormFieldV2
  availableTabs: string[]
  onUpdateActiveField: (updates: Partial<FormFieldV2>) => void
}

export const InspectorPropertiesTab: React.FC<InspectorPropertiesTabProps> = ({
  activeField,
  availableTabs,
  onUpdateActiveField
}) => {
  return (
    <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
      {/* Kategori 1: Bölüm & Sekme Konumu */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
          1. Bölüm ve Sekme Konumu
        </span>
        <div>
          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
            Ait Olduğu Belge Sekmesi:
          </label>
          <select
            value={activeField.tabName || availableTabs[0] || 'Genel Bilgiler'}
            onChange={(e) => onUpdateActiveField({ tabName: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
          >
            {availableTabs.map((tab) => (
              <option key={tab} value={tab}>
                📁 {tab}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kategori 2: Tanım & Veri Alanı */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
          2. Tanım ve Değişken Eşleme
        </span>
        <div>
          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
            Bileşen Başlığı / Etiketi:
          </label>
          <input
            type="text"
            value={activeField.label}
            onChange={(e) => onUpdateActiveField({ label: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
            Veri Değişken Adı:
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
              {'{'}
            </span>
            <input
              type="text"
              value={activeField.variableName}
              onChange={(e) =>
                onUpdateActiveField({
                  variableName: e.target.value.toLowerCase().replace(/\s+/g, '_')
                })
              }
              className="w-full pl-5 pr-5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-blue-600 dark:text-blue-400 font-mono focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
              {'}'}
            </span>
          </div>
        </div>
      </div>

      {/* Kategori 3: Açıklama & Zorunluluk */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
          3. Açıklama ve Zorunluluk
        </span>
        <div>
          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
            Yardımcı Bilgi / İpucu Notu:
          </label>
          <input
            type="text"
            value={activeField.helpText || ''}
            onChange={(e) => onUpdateActiveField({ helpText: e.target.value })}
            placeholder="İpucu notu..."
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeField.required}
              onChange={(e) => onUpdateActiveField({ required: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Bu alan resmi belgede zorunludur
            </span>
          </label>
        </div>
      </div>

      {/* Kategori 4: Davranış ve Görünürlük Kapsamı */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
          4. Davranış ve Görünürlük Kapsamı
        </span>

        {/* Görünürlük Modu */}
        <div>
          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
            Görünürlük Kapsamı (Yazdırma / Form Modu):
          </label>
          <select
            value={activeField.visibilityMode || 'all'}
            onChange={(e) =>
              onUpdateActiveField({
                visibilityMode: e.target.value as
                  | 'all'
                  | 'print-only'
                  | 'edit-only'
                  | 'screen-only'
              })
            }
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
          >
            <option value="all">🌐 Hem Ekranda Hem Yazdırmada (Tüm Modlar)</option>
            <option value="print-only">🖨️ Sadece Yazdırmada / PDF Çıktısında Göster</option>
            <option value="edit-only">💻 Sadece Form Düzenleme Modunda Göster</option>
            <option value="screen-only">🖥️ Sadece Ekranda Göster (Yazdırmada Gizle)</option>
          </select>
        </div>

        {/* Sayfa Kesme (Page Break) Davranışı */}
        <div>
          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
            Sayfa Bölünme (Page Break) Kontrolü:
          </label>
          <select
            value={activeField.pageBreak || 'none'}
            onChange={(e) =>
              onUpdateActiveField({
                pageBreak: e.target.value as 'none' | 'before' | 'after' | 'inside-avoid'
              })
            }
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
          >
            <option value="none">📄 Standart (Otomatik Sayfa Akışı)</option>
            <option value="before">✂️ Bileşenden Önce Yeni Sayfaya Geç</option>
            <option value="after">✂️ Bileşenden Sonra Yeni Sayfaya Geç</option>
            <option value="inside-avoid">🛡️ Bileşenin Sayfa Ortasında Bölünmesini Engelle</option>
          </select>
        </div>

        {/* Salt Okunur / Kilit Durumu */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeField.readOnly ?? false}
              onChange={(e) => onUpdateActiveField({ readOnly: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              Salt Okunur (Düzenlemeye Kilitli Alan)
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
