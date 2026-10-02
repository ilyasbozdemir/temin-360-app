import React, { useState } from 'react'
import { Cpu, AlertTriangle } from 'lucide-react'
import { calistirFormul, STANDART_FORMUL_KATALOGU, formatTL } from '../../../utils/ihale'

export function FormulMotoruTab(): React.JSX.Element {
  const [customFormul, setCustomFormul] = useState<string>(
    'sozlesme_bedeli * parametre("damgaVergisiSozlesme") + eger(sozlesme_bedeli > 1000000, 5000, 0)'
  )
  const [formulDegiskenler, setFormulDegiskenler] = useState<string>(
    JSON.stringify({ sozlesme_bedeli: 1200000 }, null, 2)
  )

  let parsedVars = {}
  try {
    parsedVars = JSON.parse(formulDegiskenler)
  } catch {}
  const formulSonuc = calistirFormul(customFormul, { degiskenler: parsedVars })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Cpu size={16} className="text-purple-600" />
          Sıfır-Eval Dinamik Formül Editörü
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Formül İfadesi
          </label>
          <textarea
            rows={3}
            value={customFormul}
            onChange={(e) => setCustomFormul(e.target.value)}
            className="w-full font-mono text-xs p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Test Değişkenleri (JSON)
          </label>
          <textarea
            rows={4}
            value={formulDegiskenler}
            onChange={(e) => setFormulDegiskenler(e.target.value)}
            className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Sandbox Çalıştırma Sonucu
        </h3>

        <div className="p-5 bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-slate-800 rounded-2xl border border-purple-200 dark:border-purple-800 min-h-25 flex flex-col justify-center">
          {formulSonuc.success ? (
            <div>
              <span className="text-xs text-purple-600 dark:text-purple-400 block font-bold">
                HESAPLANAN DEĞER:
              </span>
              <span className="text-2xl md:text-3xl font-mono font-black text-purple-900 dark:text-purple-100">
                {typeof formulSonuc.result === 'number'
                  ? formatTL(formulSonuc.result)
                  : String(formulSonuc.result)}
              </span>
            </div>
          ) : (
            <div className="text-xs text-rose-600 font-bold flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{formulSonuc.error}</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-slate-500">
          <span className="font-bold text-slate-700 dark:text-slate-300 block">
            Hazır Şablonlar (Tıklayıp Yükleyin):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STANDART_FORMUL_KATALOGU.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setCustomFormul(f.formul)
                  setFormulDegiskenler(JSON.stringify(f.ornekGirdiler, null, 2))
                }}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {f.etiket}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
