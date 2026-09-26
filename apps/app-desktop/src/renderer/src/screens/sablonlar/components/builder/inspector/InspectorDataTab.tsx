import React from 'react'
import { Scissors } from 'lucide-react'
import { FormFieldV2, TableRowItem, SignatureMemberItem } from '../../../types/formBuilder.types'
import { InspectorTableManager } from './InspectorTableManager'
import { InspectorSignatureManager } from './InspectorSignatureManager'
import { InspectorOptionsManager } from './InspectorOptionsManager'

interface InspectorDataTabProps {
  activeField: FormFieldV2
  formData: Record<string, string>
  onUpdateFormData: (key: string, val: string) => void
  onUpdateActiveField: (updates: Partial<FormFieldV2>) => void
  onAddTableRow: () => void
  onUpdateTableRow: (rowId: string, updates: Partial<TableRowItem>) => void
  onDeleteTableRow: (rowId: string) => void
  onAddSignatureMember: () => void
  onUpdateSignatureMember: (memberId: string, updates: Partial<SignatureMemberItem>) => void
  onDeleteSignatureMember: (memberId: string) => void
}

export const InspectorDataTab: React.FC<InspectorDataTabProps> = ({
  activeField,
  formData,
  onUpdateFormData,
  onUpdateActiveField,
  onAddTableRow,
  onUpdateTableRow,
  onDeleteTableRow,
  onAddSignatureMember,
  onUpdateSignatureMember,
  onDeleteSignatureMember
}) => {
  return (
    <div className="flex-1 p-3 overflow-y-auto space-y-4">
      {/* HEADER (ANTET) CANLI VERİ AYARLARI */}
      {activeField.type === 'header' && (
        <div className="space-y-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-[11px] text-blue-700 dark:text-blue-300">
            Resmi kurum başlığı ve amblem görünümünü buradan düzenleyebilirsiniz.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Üst Kurum Adı
            </label>
            <input
              type="text"
              value={activeField.headerInstitution || ''}
              onChange={(e) => onUpdateActiveField({ headerInstitution: e.target.value })}
              placeholder="Örn: T.C. İÇİŞLERİ BAKANLIĞI"
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alt Birim / Daire Başkanlığı
            </label>
            <input
              type="text"
              value={activeField.headerDepartment || ''}
              onChange={(e) => onUpdateActiveField({ headerDepartment: e.target.value })}
              placeholder="Örn: Destek Hizmetleri Dairesi Başkanlığı"
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeField.headerLeftLogo ?? true}
                onChange={(e) => onUpdateActiveField({ headerLeftLogo: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Sol Bakanlık / Kurum Logosu
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeField.headerRightLogo ?? true}
                onChange={(e) => onUpdateActiveField({ headerRightLogo: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Sağ Birim / İl Logosu
              </span>
            </label>
          </div>
        </div>
      )}

      {/* PARAGRAF METNİ CANLI VERİ AYARLARI */}
      {activeField.type === 'paragraph' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Yasal Metin / Gerekçe İçeriği
            </label>
            <textarea
              rows={6}
              value={activeField.staticContent || ''}
              onChange={(e) => onUpdateActiveField({ staticContent: e.target.value })}
              placeholder="Gerekçe veya dayanak metnini buraya yazın..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
            />
          </div>

          {/* Hızlı Değişken Ekleme Butonları */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Metne Hızlı Değişken Ekle:
            </label>
            <div className="flex flex-wrap gap-1">
              {['{isin_aciklamasi}', '{muhatap_firma}', '{yaklasik_maliyet}', '{tarih}'].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const curr = activeField.staticContent || ''
                      onUpdateActiveField({ staticContent: `${curr} ${tag}` })
                    }}
                    className="px-2 py-1 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 text-[10px] font-mono rounded border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
                  >
                    + {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* GRID / KOLON AYARLARI */}
      {activeField.type === 'grid' && (
        <div className="space-y-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-[11px] text-blue-700 dark:text-blue-300">
            Grid kutusu, alt bileşenleri yan yana 2, 3 veya 4 kolon halinde hizalamanızı sağlar.
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Sütun (Kolon) Sayısı
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              {[2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => onUpdateActiveField({ gridCols: cols as 2 | 3 | 4 })}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    (activeField.gridCols || 2) === cols
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cols} Kolon
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kolonlar Arası Boşluk (Gap)
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              {[
                { key: 'sm', label: 'Dar' },
                { key: 'md', label: 'Normal' },
                { key: 'lg', label: 'Geniş' }
              ].map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => onUpdateActiveField({ gap: g.key as 'sm' | 'md' | 'lg' })}
                  className={`py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    (activeField.gap || 'md') === g.key
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BÖLÜCÜ ÇİZGİ AYARLARI */}
      {activeField.type === 'divider' && (
        <div className="space-y-3">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-400">
            Form veya belgedeki ana bölümleri birbirinden ayıran yatay ayırıcı çizgi.
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Çizgi Stili
            </label>
            <select
              value={activeField.borderStyle || 'solid'}
              onChange={(e) =>
                onUpdateActiveField({
                  borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted'
                })
              }
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
            >
              <option value="solid">Düz Çizgi (Solid)</option>
              <option value="dashed">Kesikli Çizgi (Dashed)</option>
              <option value="dotted">Noktalı Çizgi (Dotted)</option>
            </select>
          </div>
        </div>
      )}

      {/* SAYFA SONU KESMESİ (PAGE BREAK) BİLGİSİ */}
      {activeField.type === 'page_break' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2 text-amber-800 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <Scissors className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Sayfa Kesme Noktası
          </div>
          <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
            Bu bileşenin yerleştiği noktada belge yazdırmada veya PDF üretiminde otomatik olarak yeni
            sayfaya geçecektir.
          </p>
        </div>
      )}

      {/* SEÇENEKLİ ALANLAR (SELECT / RADIO / CHECKBOX) YÖNETİMİ */}
      {['select', 'radio', 'checkbox'].includes(activeField.type) && (
        <InspectorOptionsManager
          activeField={activeField}
          onUpdateActiveField={onUpdateActiveField}
        />
      )}

      {/* TABLO SATIR & KALEM YÖNETİCİSİ */}
      {activeField.type === 'table' && (
        <InspectorTableManager
          activeField={activeField}
          onAddTableRow={onAddTableRow}
          onUpdateTableRow={onUpdateTableRow}
          onDeleteTableRow={onDeleteTableRow}
        />
      )}

      {/* İMZA & KOMİSYON ÜYELERİ YÖNETİCİSİ */}
      {activeField.type === 'signature' && (
        <InspectorSignatureManager
          activeField={activeField}
          onAddSignatureMember={onAddSignatureMember}
          onUpdateSignatureMember={onUpdateSignatureMember}
          onDeleteSignatureMember={onDeleteSignatureMember}
        />
      )}

      {/* STANDART ALANLAR İÇİN CANLI ÖRNEK DEĞER GİRİŞİ */}
      {['text', 'textarea', 'money', 'date', 'number', 'select'].includes(activeField.type) && (
        <div className="space-y-3">
          <div className="p-2.5 bg-blue-50 dark:bg-slate-900 rounded-xl text-[11px] text-blue-700 dark:text-slate-400 border border-blue-200 dark:border-slate-800">
            Bu alana yazacağınız canlı değer, tuvaldeki belgenizde anında görüntülenecektir.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Canlı Test / Örnek Değer
            </label>
            <input
              type="text"
              value={formData[activeField.variableName] ?? activeField.defaultValue ?? ''}
              onChange={(e) => {
                const val = e.target.value
                onUpdateFormData(activeField.variableName, val)
                onUpdateActiveField({ defaultValue: val })
              }}
              placeholder={activeField.placeholder || 'Örnek değer girin...'}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Varsayılan İpucu / Yer Tutucu (Placeholder)
            </label>
            <input
              type="text"
              value={activeField.placeholder || ''}
              onChange={(e) => onUpdateActiveField({ placeholder: e.target.value })}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
        </div>
      )}
    </div>
  )
}
