import React from 'react'
import { Save, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { formatDosyaNo } from '../../../../utils/formatDosyaNo'

export interface DosyaManageFooterProps {
  activeTab: 'genel' | 'ihtiyac'
  isEdit: boolean
  editId?: number | null
  formData: any
  onGoBack: () => void
  onSave: (e: React.FormEvent | React.MouseEvent) => void
}

export const DosyaManageFooter: React.FC<DosyaManageFooterProps> = ({
  activeTab,
  isEdit,
  editId,
  formData,
  onGoBack,
  onSave
}) => {
  return (
    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
      <div className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
        {isEdit ? (
          <>
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <span>{formatDosyaNo({ ...formData, id: editId })}</span>
            <span className="text-slate-400">• Düzenleniyor</span>
          </>
        ) : formData.temin_no ? (
          <>
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span>{formatDosyaNo(formData)}</span>
            <span className="text-slate-400">• Yeni Kayıt</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Yeni Doğrudan Temin Kaydı Hazırlanıyor</span>
          </>
        )}
      </div>

      <div className="flex gap-3">
        {activeTab === 'ihtiyac' ? (
          <>
            <button
              type="button"
              onClick={onGoBack}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              Genel Bilgilere Dön
            </button>
            <button
              onClick={onSave}
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                isEdit
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              <Save size={16} />
              {isEdit ? 'Değişiklikleri Güncelle' : 'Dosyayı Oluştur'}
            </button>
          </>
        ) : (
          <button
            onClick={onSave}
            className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
              isEdit
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            <Save size={14} />
            {isEdit ? 'Güncelle' : 'Kaydet'}
          </button>
        )}
      </div>
    </div>
  )
}
