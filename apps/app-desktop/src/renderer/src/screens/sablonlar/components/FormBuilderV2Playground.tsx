import React, { useState } from 'react'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Settings,
  Eye,
  Code,
  Sparkles,
  Move,
  CheckSquare,
  Calendar,
  DollarSign,
  AlignLeft,
  ListFilter,
  Users,
  Grid,
  Copy,
  Check,
  RefreshCw,
  Play
} from 'lucide-react'

export interface FormFieldV2 {
  id: string
  label: string
  variableName: string
  type: 'text' | 'textarea' | 'number' | 'money' | 'date' | 'select' | 'checkbox' | 'table' | 'signature'
  required: boolean
  placeholder?: string
  options?: string[]
  helpText?: string
  defaultValue?: string
}

const INITIAL_FIELDS: FormFieldV2[] = [
  {
    id: 'f-1',
    label: 'Temin / İş Konusu',
    variableName: 'isin_aciklamasi',
    type: 'text',
    required: true,
    placeholder: 'Örn: Bilgisayar Alımı İşi',
    helpText: 'Resmi onay belgelerinde görünecek iş başlığı'
  },
  {
    id: 'f-2',
    label: 'Tahmini Yaklaşık Maliyet',
    variableName: 'yaklasik_maliyet',
    type: 'money',
    required: true,
    placeholder: '0,00 ₺'
  },
  {
    id: 'f-3',
    label: 'Son Teklif Tarihi',
    variableName: 'son_teklif_tarihi',
    type: 'date',
    required: true
  },
  {
    id: 'f-4',
    label: 'Alım Türü',
    variableName: 'alim_turu',
    type: 'select',
    required: true,
    options: ['Mal Alımı', 'Hizmet Alımı', 'Yapım İşi', 'Danışmanlık']
  },
  {
    id: 'f-5',
    label: 'Komisyon Üyeleri',
    variableName: 'komisyon_listesi',
    type: 'signature',
    required: false,
    helpText: 'İmza bloğu ve görevliler tablosu'
  }
]

export function FormBuilderV2Playground({ onBack }: { onBack: () => void }): React.JSX.Element {
  const [fields, setFields] = useState<FormFieldV2[]>(INITIAL_FIELDS)
  const [activeFieldId, setActiveFieldId] = useState<string | null>('f-1')
  const [mode, setMode] = useState<'design' | 'preview' | 'json'>('design')
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({
    isin_aciklamasi: 'Kırtasiye ve Büro Malzemesi Alımı',
    yaklasik_maliyet: '45.000,00 ₺',
    son_teklif_tarihi: '2026-10-01',
    alim_turu: 'Mal Alımı'
  })

  const activeField = fields.find((f) => f.id === activeFieldId)

  const handleAddField = (type: FormFieldV2['type']) => {
    const newId = `f-${Date.now()}`
    const typeLabels: Record<FormFieldV2['type'], string> = {
      text: 'Metin Alanı',
      textarea: 'Açıklama / Paragraf',
      number: 'Sayısal Değer',
      money: 'Tutar (₺)',
      date: 'Tarih Seçici',
      select: 'Seçim Kutusu',
      checkbox: 'Onay Kutusu',
      table: 'Dinamik Tablo',
      signature: 'İmza Bloğu'
    }

    const newField: FormFieldV2 = {
      id: newId,
      label: `Yeni ${typeLabels[type]}`,
      variableName: `degisken_${fields.length + 1}`,
      type,
      required: false,
      placeholder: ''
    }

    setFields([...fields, newField])
    setActiveFieldId(newId)
  }

  const handleUpdateActiveField = (updates: Partial<FormFieldV2>) => {
    if (!activeFieldId) return
    setFields((prev) =>
      prev.map((f) => (f.id === activeFieldId ? { ...f, ...updates } : f))
    )
  }

  const handleDeleteField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFields((prev) => prev.filter((f) => f.id !== id))
    if (activeFieldId === id) {
      setActiveFieldId(null)
    }
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fields, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in duration-300">
      {/* ÜST TOOLBAR */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
            title="Şablon Listesine Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Form Builder v2 Oyun Alanı (Playground)
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white uppercase tracking-wider">
                v2 Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gelişmiş Form Tasarım Motoru — Varolan şablon sistemini bozmadan canlı test alanı
            </p>
          </div>
        </div>

        {/* MOD DEĞİŞTİRİCİ (Tasarım ↔ Önizleme ↔ JSON) */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('design')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'design'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Tasarım Modu</span>
          </button>

          <button
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'preview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Canlı Form Testi</span>
          </button>

          <button
            onClick={() => setMode('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'json'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON Şema</span>
          </button>
        </div>
      </div>

      {/* İÇERİK ALANI */}
      {mode === 'design' && (
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">
          {/* 1. SOL: BİLEŞEN PALETİ (PALETTE) */}
          <div className="col-span-3 bg-slate-950/40 border-r border-slate-800/80 p-4 overflow-y-auto space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Form Elemanları
            </h2>

            <div className="space-y-2">
              <button
                onClick={() => handleAddField('text')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
              >
                <AlignLeft className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Tek Satır Metin</span>
              </button>

              <button
                onClick={() => handleAddField('textarea')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
              >
                <AlignLeft className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Çok Satırlı Metin</span>
              </button>

              <button
                onClick={() => handleAddField('money')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
              >
                <DollarSign className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Para Birimi (₺ Tutar)</span>
              </button>

              <button
                onClick={() => handleAddField('date')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
              >
                <Calendar className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Tarih Seçici</span>
              </button>

              <button
                onClick={() => handleAddField('select')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
              >
                <ListFilter className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Açılır Liste (Select)</span>
              </button>

              <button
                onClick={() => handleAddField('checkbox')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
              >
                <CheckSquare className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Onay Kutusu (Checkbox)</span>
              </button>

              <button
                onClick={() => handleAddField('table')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
              >
                <Grid className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Dinamik Kalem Tablosu</span>
              </button>

              <button
                onClick={() => handleAddField('signature')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
              >
                <Users className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>İmza / Komisyon Bloğu</span>
              </button>
            </div>
          </div>

          {/* 2. ORTA: CANVAS & TASARIM SAHNESİ */}
          <div className="col-span-6 p-6 overflow-y-auto bg-slate-900/40">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Form Tuvali ({fields.length} Alan)
                </span>
                <button
                  onClick={() => setFields(INITIAL_FIELDS)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Varsayılana Sıfırla
                </button>
              </div>

              {fields.map((field, idx) => {
                const isSelected = field.id === activeFieldId
                return (
                  <div
                    key={field.id}
                    onClick={() => setActiveFieldId(field.id)}
                    className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-blue-500 shadow-lg ring-2 ring-blue-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Move className="w-4 h-4 text-slate-500 group-hover:text-slate-300 cursor-grab" />
                        <span className="text-xs font-bold text-white">{field.label}</span>
                        {field.required && (
                          <span className="text-red-400 text-xs font-bold">*</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-semibold">
                          {`{${field.variableName}}`}
                        </span>
                        <button
                          onClick={(e) => handleDeleteField(field.id, e)}
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                          title="Alanı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Pre-render mockup */}
                    <div className="mt-2 pointer-events-none opacity-80">
                      {field.type === 'textarea' ? (
                        <div className="h-14 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-500">
                          {field.placeholder || 'Paragraf açıklaması...'}
                        </div>
                      ) : field.type === 'select' ? (
                        <div className="h-9 bg-slate-900 border border-slate-800 rounded-lg px-3 flex items-center justify-between text-xs text-slate-400">
                          <span>{field.options?.[0] || 'Seçiniz...'}</span>
                          <span>▼</span>
                        </div>
                      ) : field.type === 'signature' ? (
                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-center text-xs text-slate-400 font-mono">
                          [ İMZA VE KOMİSYON ÜYELERİ TABLOSU MODÜLÜ ]
                        </div>
                      ) : field.type === 'table' ? (
                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-center text-xs text-slate-400 font-mono">
                          [ DİNAMİK MALZEME / HİZMET KALEMLERİ TABLOSU ]
                        </div>
                      ) : (
                        <div className="h-9 bg-slate-900 border border-slate-800 rounded-lg px-3 flex items-center text-xs text-slate-500">
                          {field.placeholder || `${field.label} değeri...`}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. SAĞ: ALAN AYARLARI DENETÇİSİ (FIELD INSPECTOR) */}
          <div className="col-span-3 bg-slate-950/40 border-l border-slate-800/80 p-4 overflow-y-auto">
            {activeField ? (
              <div className="space-y-4">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-4">
                  <Settings className="w-4 h-4 text-blue-400" /> Alan Özellikleri
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alan Etiketi (Başlık)
                  </label>
                  <input
                    type="text"
                    value={activeField.label}
                    onChange={(e) => handleUpdateActiveField({ label: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sistem Değişken Adı (Tag)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">
                      {'{'}
                    </span>
                    <input
                      type="text"
                      value={activeField.variableName}
                      onChange={(e) =>
                        handleUpdateActiveField({
                          variableName: e.target.value.toLowerCase().replace(/\s+/g, '_')
                        })
                      }
                      className="w-full pl-6 pr-6 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">
                      {'}'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Şablonda {`{${activeField.variableName}}`} etiketiyle otomatik basılır.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Placeholder (İpucu İfadesi)
                  </label>
                  <input
                    type="text"
                    value={activeField.placeholder || ''}
                    onChange={(e) => handleUpdateActiveField({ placeholder: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={activeField.required}
                      onChange={(e) => handleUpdateActiveField({ required: e.target.checked })}
                      className="rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-300">Bu Alan Zorunlu Mu?</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">
                Düzenlemek için bir alana tıklayın.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CANLI FORM TESTİ (PREVIEW) */}
      {mode === 'preview' && (
        <div className="flex-1 p-8 overflow-y-auto bg-slate-950/60">
          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Form Builder v2 — Canlı Test</h3>
                <p className="text-xs text-slate-400">
                  Form verisi doldurulduğunda otomatik üretilen JSON çıktısını test edin.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" /> Aktif Simülatör
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                alert('Form başarıyla doğrulandı ve gönderildi!')
              }}
              className="space-y-4"
            >
              {fields.map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      required={f.required}
                      placeholder={f.placeholder}
                      value={formData[f.variableName] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.variableName]: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      required={f.required}
                      value={formData[f.variableName] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.variableName]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'date' ? 'date' : 'text'}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={formData[f.variableName] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.variableName]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Form Verisini Doğrula ve Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* JSON ŞEMA KODU (JSON SCHEME) */}
      {mode === 'json' && (
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/80 font-mono relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Form Builder v2 JSON Şema Çıktısı
            </span>
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-sans font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Şemayı Kopyala'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-purple-300 overflow-x-auto">
            {JSON.stringify(fields, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
