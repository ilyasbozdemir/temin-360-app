import React from 'react'
import { BookOpen } from 'lucide-react'
import { MuhasebeKanitlayiciBelgeler } from './MuhasebeKanitlayiciBelgeler'
import { MuhasebeSurecKriterleri } from './MuhasebeSurecKriterleri'

export const DogrudanTeminMuhasebeRehberi: React.FC = () => {
  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Doğrudan Temin Muhasebe ve Ödeme Süreci Kılavuzu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maliye mevzuatı, harcama evrakları, vergi kesintileri (Damga Vergisi, KDV Tevkifatı) ve
            ödeme emri onay kriterleri
          </p>
        </div>

        <MuhasebeKanitlayiciBelgeler />
        <MuhasebeSurecKriterleri />
      </div>
    </div>
  )
}
