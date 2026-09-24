import React from 'react'
import { Eye, Printer } from 'lucide-react'
import { FormFieldV2, DocumentSettings, TableRowItem } from '../../types/formBuilder.types'

interface FormBuilderPreviewProps {
  fields: FormFieldV2[]
  docSettings: DocumentSettings
  formData: Record<string, string>
  selectedTab: string
}

export const FormBuilderPreview: React.FC<FormBuilderPreviewProps> = ({
  fields,
  docSettings,
  formData,
  selectedTab
}) => {
  const getPageDimensions = (): { width: string; minHeight: string } => {
    const isA3 = docSettings.pageSize === 'A3'
    const isLandscape = docSettings.orientation === 'landscape'

    if (isA3) {
      return isLandscape
        ? { width: '420mm', minHeight: '297mm' }
        : { width: '297mm', minHeight: '420mm' }
    }
    return isLandscape
      ? { width: '297mm', minHeight: '210mm' }
      : { width: '210mm', minHeight: '297mm' }
  }

  const getPagePadding = (): string => {
    switch (docSettings.margins) {
      case 'compact':
        return '1.2cm 1cm'
      case 'wide':
        return '2.5cm 2.2cm'
      case 'normal':
      default:
        return '1.8cm 1.5cm'
    }
  }

  const calculateTableTotal = (rows?: TableRowItem[]): number => {
    if (!rows || rows.length === 0) return 0
    return rows.reduce((acc, r) => {
      const top =
        typeof r.toplamFiyat === 'number' ? r.toplamFiyat : parseFloat(String(r.toplamFiyat)) || 0
      return acc + top
    }, 0)
  }

  const getTextAlignClass = (align?: 'left' | 'center' | 'right' | 'justify'): string => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      case 'justify':
        return 'text-justify'
      case 'left':
      default:
        return 'text-left'
    }
  }

  const getWidthClass = (width?: '100%' | '50%' | '33%' | '25%'): string => {
    switch (width) {
      case '50%':
        return 'w-full md:w-[calc(50%-6px)] inline-block'
      case '33%':
        return 'w-full md:w-[calc(33.33%-8px)] inline-block'
      case '25%':
        return 'w-full md:w-[calc(25%-9px)] inline-block'
      case '100%':
      default:
        return 'w-full'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-200/70 dark:bg-slate-950 transition-colors">
      {/* Üst Bar: Bilgi & Yazdır Butonu */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs select-none">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-800 dark:text-slate-200 font-bold">
            Resmi Belge Önizlemesi ({docSettings.pageSize} -{' '}
            {docSettings.orientation === 'portrait' ? 'Dikey' : 'Yatay'})
          </span>
          {selectedTab !== 'Tümü' && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
              Sekme: {selectedTab}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır / PDF Olarak Kaydet</span>
          </button>
        </div>
      </div>

      {/* Önizleme Sayfası */}
      <div className="flex-1 p-8 overflow-y-auto flex justify-center items-start">
        <div
          style={{
            ...getPageDimensions(),
            padding: getPagePadding()
          }}
          className="bg-white text-slate-900 shadow-2xl border border-slate-300 rounded-xs font-serif text-[10pt] leading-normal"
        >
          <div className="flex flex-wrap gap-2.5 items-start">
            {fields.map((f) => (
              <div
                key={f.id}
                className={`${getWidthClass(f.width)} ${getTextAlignClass(f.textAlign)} ${
                  f.fontWeight === 'bold' ? 'font-bold' : ''
                } ${f.fontStyle === 'italic' ? 'italic' : ''}`}
              >
                {f.type === 'header' ? (
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 text-center w-full">
                    {f.headerLeftLogo && (
                      <div className="w-16 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8pt] text-slate-400 shrink-0">
                        [Sol Amblem]
                      </div>
                    )}
                    <div className="font-bold text-center px-4 leading-tight flex-1">
                      <div className="text-[11pt]">
                        {f.headerInstitution || 'T.C. İÇİŞLERİ BAKANLIĞI'}
                      </div>
                      <div className="text-[10pt]">
                        {f.headerDepartment || 'Destek Hizmetleri Dairesi Başkanlığı'}
                      </div>
                    </div>
                    {f.headerRightLogo && (
                      <div className="w-16 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8pt] text-slate-400 shrink-0">
                        [Sağ Amblem]
                      </div>
                    )}
                  </div>
                ) : f.type === 'paragraph' ? (
                  <div
                    className={`text-[9.5pt] leading-relaxed text-slate-800 ${
                      f.indent ? 'indent-6' : ''
                    }`}
                  >
                    {f.staticContent || 'Resmi gerekçe metni...'}
                  </div>
                ) : f.type === 'table' ? (
                  <div className="border border-slate-800 text-[8.5pt] w-full">
                    <div className="grid grid-cols-7 bg-slate-100 font-bold border-b border-slate-800 text-center py-1">
                      <div>Sıra</div>
                      <div className="col-span-3 text-left px-2">Mal/Hizmet Adı</div>
                      <div>Miktar</div>
                      <div>Birim</div>
                      <div>Birim Fiyat</div>
                    </div>
                    {f.tableRows?.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-7 text-center py-1 border-b border-slate-200"
                      >
                        <div>{row.sira}</div>
                        <div className="col-span-3 text-left px-2">{row.ad}</div>
                        <div>{row.miktar}</div>
                        <div>{row.birim}</div>
                        <div className="text-right px-2 font-mono">
                          {Number(row.birimFiyat).toLocaleString('tr-TR', {
                            minimumFractionDigits: 2
                          })}{' '}
                          ₺
                        </div>
                      </div>
                    ))}
                    <div className="bg-slate-50 text-right font-bold py-1 px-3 border-t border-slate-800 flex justify-between">
                      <span>Toplam Kalem: {f.tableRows?.length || 0}</span>
                      <span>
                        Toplam Tutar:{' '}
                        {calculateTableTotal(f.tableRows).toLocaleString('tr-TR', {
                          minimumFractionDigits: 2
                        })}{' '}
                        ₺
                      </span>
                    </div>
                  </div>
                ) : f.type === 'signature' ? (
                  <div className="pt-2 w-full">
                    {f.signatureType === 'olur' ? (
                      <div className="w-48 ml-auto text-center space-y-1 p-2 border border-slate-300 rounded">
                        <div className="font-bold text-slate-800 text-[9pt]">O L U R</div>
                        <div className="text-[8pt] text-slate-500">24.09.2026</div>
                        <div className="font-bold text-slate-900 pt-2">
                          {f.signatureMembers?.[0]?.adSoyad || 'Mustafa ÖZTÜRK'}
                        </div>
                        <div className="text-slate-600 text-[8pt]">
                          {f.signatureMembers?.[0]?.unvan || 'Daire Başkanı'}
                        </div>
                        <div className="text-slate-400 text-[8pt] italic">[ İmza / Mühür ]</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-center pt-4 text-[9pt]">
                        {f.signatureMembers?.map((m) => (
                          <div key={m.id} className="space-y-1">
                            <div className="font-bold text-slate-900">{m.adSoyad}</div>
                            <div className="text-slate-600 text-[8pt]">{m.unvan}</div>
                            <div className="text-slate-400 text-[7.5pt] uppercase font-semibold">
                              {m.gorev}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[9.5pt]">
                    <strong>{f.label}:</strong>{' '}
                    <span>
                      {formData[f.variableName] || f.defaultValue || f.placeholder || '-'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
