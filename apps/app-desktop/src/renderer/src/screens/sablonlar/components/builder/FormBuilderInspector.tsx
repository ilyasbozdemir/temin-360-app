import React from 'react'
import {
  Sliders,
  Database,
  Settings,
  Plus,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Columns,
  Type,
  Palette
} from 'lucide-react'
import {
  FormFieldV2,
  TableRowItem,
  SignatureMemberItem
} from '../../types/formBuilder.types'
import { TYPE_LABELS } from '../../constants/formBuilder.constants'

interface FormBuilderInspectorProps {
  activeField: FormFieldV2 | undefined
  activeInspectorTab: 'properties' | 'data' | 'format'
  onSetActiveInspectorTab: (tab: 'properties' | 'data' | 'format') => void
  availableTabs: string[]
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

export const FormBuilderInspector: React.FC<FormBuilderInspectorProps> = ({
  activeField,
  activeInspectorTab,
  onSetActiveInspectorTab,
  availableTabs,
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
  const calculateTableTotal = (rows?: TableRowItem[]): number => {
    if (!rows || rows.length === 0) return 0
    return rows.reduce((acc, r) => {
      const top =
        typeof r.toplamFiyat === 'number' ? r.toplamFiyat : parseFloat(String(r.toplamFiyat)) || 0
      return acc + top
    }, 0)
  }

  return (
    <div className="w-80 bg-slate-50/90 dark:bg-slate-950/95 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-xs transition-colors shrink-0">
      {activeField ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Özellikler Başlığı */}
          <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Bileşen Ayarları
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono font-bold border border-blue-200 dark:border-blue-800/40">
                {activeField.id}
              </span>
            </div>

            {/* Bileşen Tipi ve Başlık Bilgisi */}
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold truncate">
                <span className="text-xs truncate max-w-[130px]">{activeField.label}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {TYPE_LABELS[activeField.type]}
              </span>
            </div>

            {/* 3'lü Sekmeler: [Canlı Veri] / [Biçim & Hizalama] / [Özellikler] */}
            <div className="grid grid-cols-3 p-1 mt-2 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onSetActiveInspectorTab('data')}
                className={`flex items-center justify-center gap-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeInspectorTab === 'data'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>Veri</span>
              </button>
              <button
                type="button"
                onClick={() => onSetActiveInspectorTab('format')}
                className={`flex items-center justify-center gap-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeInspectorTab === 'format'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>Biçim</span>
              </button>
              <button
                type="button"
                onClick={() => onSetActiveInspectorTab('properties')}
                className={`flex items-center justify-center gap-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeInspectorTab === 'properties'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-3 h-3" />
                <span>Özellik</span>
              </button>
            </div>
          </div>

          {/* İÇERİK: 1. CANLI VERİ SEKME GÖRÜNÜMÜ */}
          {activeInspectorTab === 'data' && (
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
                      onChange={(e) =>
                        onUpdateActiveField({ headerInstitution: e.target.value })
                      }
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
                      onChange={(e) =>
                        onUpdateActiveField({ headerDepartment: e.target.value })
                      }
                      placeholder="Örn: Destek Hizmetleri Dairesi Başkanlığı"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={activeField.headerLeftLogo ?? true}
                        onChange={(e) =>
                          onUpdateActiveField({ headerLeftLogo: e.target.checked })
                        }
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
                        onChange={(e) =>
                          onUpdateActiveField({ headerRightLogo: e.target.checked })
                        }
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
                      onChange={(e) =>
                        onUpdateActiveField({ staticContent: e.target.value })
                      }
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
                      {[
                        '{isin_aciklamasi}',
                        '{muhatap_firma}',
                        '{yaklasik_maliyet}',
                        '{tarih}'
                      ].map((tag) => (
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
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TABLO SATIR & KALEM YÖNETİCİSİ */}
              {activeField.type === 'table' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      Tablo Kalemleri ({activeField.tableRows?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={onAddTableRow}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Satır Ekle</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {activeField.tableRows?.map((row) => (
                      <div
                        key={row.id}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                            #{row.sira} Kalem
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteTableRow(row.id)}
                            className="text-slate-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                            title="Satırı Sil"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Mal / Hizmet Adı"
                            value={row.ad}
                            onChange={(e) =>
                              onUpdateTableRow(row.id, { ad: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          <div>
                            <label className="text-[9px] text-slate-500 block mb-0.5">
                              Miktar
                            </label>
                            <input
                              type="number"
                              value={row.miktar}
                              onChange={(e) =>
                                onUpdateTableRow(row.id, {
                                  miktar: parseFloat(e.target.value) || 0
                                })
                              }
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 block mb-0.5">
                              Birim
                            </label>
                            <input
                              type="text"
                              value={row.birim}
                              onChange={(e) =>
                                onUpdateTableRow(row.id, { birim: e.target.value })
                              }
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 block mb-0.5">
                              Birim Fiyat (₺)
                            </label>
                            <input
                              type="number"
                              value={row.birimFiyat}
                              onChange={(e) =>
                                onUpdateTableRow(row.id, {
                                  birimFiyat: parseFloat(e.target.value) || 0
                                })
                              }
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold flex justify-between text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span>Genel Toplam:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {calculateTableTotal(activeField.tableRows).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2
                      })}{' '}
                      ₺
                    </span>
                  </div>
                </div>
              )}

              {/* İMZA & KOMİSYON ÜYELERİ YÖNETİCİSİ */}
              {activeField.type === 'signature' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      İmza Yetkilileri ({activeField.signatureMembers?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={onAddSignatureMember}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Üye Ekle</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {activeField.signatureMembers?.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase font-mono">
                            {m.gorev || 'Görevli'}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteSignatureMember(m.id)}
                            className="text-slate-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                            title="Üyeyi Sil"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Ad Soyad"
                          value={m.adSoyad}
                          onChange={(e) =>
                            onUpdateSignatureMember(m.id, { adSoyad: e.target.value })
                          }
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold text-slate-900 dark:text-white"
                        />

                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            placeholder="Unvan (Örn: Mühendis)"
                            value={m.unvan}
                            onChange={(e) =>
                              onUpdateSignatureMember(m.id, { unvan: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-700 dark:text-slate-300"
                          />
                          <input
                            type="text"
                            placeholder="Görev (Örn: Üye)"
                            value={m.gorev}
                            onChange={(e) =>
                              onUpdateSignatureMember(m.id, { gorev: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-700 dark:text-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STANDART ALANLAR İÇİN CANLI ÖRNEK DEĞER GİRİŞİ */}
              {['text', 'textarea', 'money', 'date', 'number', 'select'].includes(
                activeField.type
              ) && (
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
                      value={
                        formData[activeField.variableName] ?? activeField.defaultValue ?? ''
                      }
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
                      onChange={(e) =>
                        onUpdateActiveField({ placeholder: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* İÇERİK: 2. BİÇİM VE HİZALAMA SEKME GÖRÜNÜMÜ */}
          {activeInspectorTab === 'format' && (
            <div className="flex-1 p-3 overflow-y-auto space-y-4">
              {/* Metin Hizalama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Metin Hizalama (Text Alignment)
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => onUpdateActiveField({ textAlign: 'left' })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                      (activeField.textAlign || 'left') === 'left'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Sola Hizala"
                  >
                    <AlignLeft className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-bold">Sol</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateActiveField({ textAlign: 'center' })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                      activeField.textAlign === 'center'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Ortala"
                  >
                    <AlignCenter className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-bold">Orta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateActiveField({ textAlign: 'right' })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                      activeField.textAlign === 'right'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Sağa Hizala"
                  >
                    <AlignRight className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-bold">Sağ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateActiveField({ textAlign: 'justify' })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                      activeField.textAlign === 'justify'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="İki Yana Yasla"
                  >
                    <AlignJustify className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-bold">Yasla</span>
                  </button>
                </div>
              </div>

              {/* Genişlik & Kolon Yerleşimi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Columns className="w-3.5 h-3.5 text-blue-500" />
                  Bileşen Genişliği (Satır Düzeni)
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  {[
                    { key: '100%', label: '%100', desc: 'Tam Satır' },
                    { key: '50%', label: '%50', desc: '2 Kolon' },
                    { key: '33%', label: '%33', desc: '3 Kolon' },
                    { key: '25%', label: '%25', desc: '4 Kolon' }
                  ].map((w) => (
                    <button
                      key={w.key}
                      type="button"
                      onClick={() =>
                        onUpdateActiveField({
                          width: w.key as '100%' | '50%' | '33%' | '25%'
                        })
                      }
                      className={`flex flex-col items-center justify-center p-1.5 rounded-lg cursor-pointer transition-all ${
                        (activeField.width || '100%') === w.key
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono text-xs">{w.label}</span>
                      <span className="text-[8px] opacity-75">{w.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Yazı Tipi & Vurgular */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-blue-500" />
                  Tipografi ve Stil Vurguları
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateActiveField({
                        fontWeight: activeField.fontWeight === 'bold' ? 'normal' : 'bold'
                      })
                    }
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all ${
                      activeField.fontWeight === 'bold'
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Bold className="w-4 h-4" />
                    <span>Kalın (Bold)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateActiveField({
                        fontStyle: activeField.fontStyle === 'italic' ? 'normal' : 'italic'
                      })
                    }
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all ${
                      activeField.fontStyle === 'italic'
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 italic'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                    <span>İtalik (Eğik)</span>
                  </button>
                </div>
              </div>

              {/* Paragraf Girintisi (Indent) */}
              {activeField.type === 'paragraph' && (
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={activeField.indent ?? false}
                      onChange={(e) => onUpdateActiveField({ indent: e.target.checked })}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Paragraf Girintisi (Resmi Yazışma İntenti)
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* İÇERİK: 3. ÖZELLİKLER GRID GÖRÜNÜMÜ */}
          {activeInspectorTab === 'properties' && (
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
                      onChange={(e) =>
                        onUpdateActiveField({ required: e.target.checked })
                      }
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Bu alan resmi belgede zorunludur
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium space-y-2">
          <Sliders className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto opacity-50" />
          <p>Özelliklerini düzenlemek için lütfen sayfadaki bir bileşene tıklayın.</p>
        </div>
      )}
    </div>
  )
}
