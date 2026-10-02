import React from 'react'
import { AlertCircle, Eye, Search } from 'lucide-react'

interface KomisyonSablonlarSectionProps {
  tumSablonlar: any[]
  seciliSablonlar: number[]
  sablonArama: string
  setSablonArama: (val: string) => void
  onToggleSablon: (id: number) => void
  onPreviewSablon?: (sablon: any) => void
}

export const KomisyonSablonlarSection: React.FC<KomisyonSablonlarSectionProps> = ({
  tumSablonlar,
  seciliSablonlar,
  sablonArama,
  setSablonArama,
  onToggleSablon,
  onPreviewSablon
}) => {
  const filteredSablonlar = tumSablonlar.filter(
    (s: any) =>
      s.ad?.toLowerCase().includes(sablonArama.toLowerCase()) ||
      s.aciklama?.toLowerCase().includes(sablonArama.toLowerCase())
  )

  return (
    <div className="space-y-3">
      {/* V1 / V2 Info Notice */}
      <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-blue-800 dark:text-blue-300 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div>
          <span className="font-bold block text-blue-900 dark:text-blue-200">
            ℹ️ Şablon Yönetimi (V1 Klasik - Template Registry Entegreli):
          </span>
          <p className="mt-0.5 text-[11px] text-blue-700 dark:text-blue-300/90 leading-relaxed">
            Şablon bağlantıları geriye dönük uyumluluk için V1 varsayılanlarıyla tutulmakta olup,
            belgeler dinamik olarak{' '}
            <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded font-semibold text-blue-900 dark:text-blue-200">
              TEMPLATE_REGISTRY
            </code>{' '}
            üzerinden beslenmektedir. Yakında V2 Form Builder entegrasyonu aktifleşecektir.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            İlişkili Belge Şablonları ({seciliSablonlar.length})
          </label>
          <p className="text-xs text-slate-400">
            Bu komisyona ait üyeler seçilen şablonlardaki imza bloklarına otomatik aktarılır.
          </p>
        </div>

        {/* Şablon Arama */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Şablon ara..."
            value={sablonArama}
            onChange={(e) => setSablonArama(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 custom-scrollbar">
        {filteredSablonlar.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">Şablon bulunamadı</div>
        ) : (
          filteredSablonlar.map((sablon: any, idx: number) => {
            const isChecked = seciliSablonlar.includes(sablon.id)
            return (
              <div
                key={`sablon-${sablon.id}-${idx}`}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleSablon(sablon.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 rounded-sm cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {sablon.ad}
                    </span>
                    {sablon.aciklama && (
                      <span className="text-[11px] text-slate-400 block truncate">
                        {sablon.aciklama}
                      </span>
                    )}
                  </div>
                </label>

                {onPreviewSablon && (
                  <button
                    type="button"
                    onClick={() => onPreviewSablon(sablon)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                    title="Şablonu Önizle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
