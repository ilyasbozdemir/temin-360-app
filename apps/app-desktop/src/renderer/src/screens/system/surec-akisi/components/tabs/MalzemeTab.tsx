import React from 'react'
import { Eye, HelpCircle, Package, Plus, Printer, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Belge, Kalem } from '../../types'
import { IlgiliBelgeCubugu } from '../IlgiliBelgeCubugu'
import { useWorkspaceStore } from '../../../../../store/workspaceStore'
import { useMalzemeListesi } from '../../../../dosya/sub-screens/components/MalzemeListesi/useMalzemeListesi'
import { MalzemeEkleModal } from '../../../../dosya/sub-screens/components/MalzemeListesi/MalzemeEkleModal'

interface MalzemeTabProps {
  kalemler: Kalem[]
  toplamBedel: number
  belgeler: Belge[]
  onPreview: (belge: Belge) => void
  onDosyalariEkle: (files: FileList | null, targetId: number) => void
  onNavigateCiktiMerkezi: () => void
  onSelectTab: (tab: string) => void
}

export const MalzemeTab: React.FC<MalzemeTabProps> = ({
  kalemler,
  toplamBedel,
  belgeler,
  onPreview,
  onDosyalariEkle,
  onNavigateCiktiMerkezi,
  onSelectTab
}) => {
  const { activeDosyaId } = useWorkspaceStore()
  const malzemeState = useMalzemeListesi(activeDosyaId)

  const handleDeleteItem = async (id: number) => {
    if (confirm('Bu ihtiyaç kalemini silmek istediğinize emin misiniz?')) {
      await malzemeState.handleDeleteItem(id)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* MODAL INTEGRATION FOR ADDING ITEMS DIRECTLY IN SUREC AKISI */}
      <MalzemeEkleModal state={malzemeState} />

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Package size={18} className="text-blue-600 dark:text-blue-400" />
            Malzeme Kalemleri ({kalemler.length} Kalem)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Doğrudan temin kapsamında talep edilen malzeme, hizmet veya yapım işi listesi
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => malzemeState.setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            İhtiyaç Kalemi Ekle
          </button>
          <Link
            to="/dosya/hazirlik-ve-ihtiyac"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-3.5 py-2 transition-colors"
          >
            Tam Ekran Modülü
          </Link>
          <button
            onClick={() => {
              const b = belgeler.find((x) => x.ad === 'Yaklaşık Maliyet Cetveli')
              if (b) onPreview(b)
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-3.5 py-2 cursor-pointer transition-colors"
          >
            <Eye size={14} className="text-blue-500" /> Önizle
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-3.5 py-2 cursor-pointer transition-colors"
          >
            <Printer size={14} /> Yazdır
          </button>
        </div>
      </div>

      <IlgiliBelgeCubugu
        belgeAdi="Yaklaşık Maliyet Cetveli"
        belgeler={belgeler}
        onPreview={onPreview}
        onDosyalariEkle={onDosyalariEkle}
        onNavigateCiktiMerkezi={onNavigateCiktiMerkezi}
        onSelectTab={onSelectTab}
      />

      {/* TABLE OR EMPTY STATE */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {kalemler.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
              <Package size={28} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Henüz Malzeme veya Hizmet Kalemi Eklenmemiş
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Bu doğrudan temin dosyasına ait malzeme veya hizmet kalemlerini eklemek için aşağıdaki
              buton ile taşınır kütüphanesinden seçebilir veya yeni ekleyebilirsiniz.
            </p>
            <button
              onClick={() => malzemeState.setIsAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={15} /> İhtiyaç Kalemi Ekle
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900 uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">#</th>
                  <th className="px-6 py-3.5">Malzeme / Hizmet Adı</th>
                  <th className="px-6 py-3.5">Tür / Taşınır Kodu</th>
                  <th className="px-6 py-3.5 text-center">Miktar & Birim</th>
                  <th className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1 font-bold">
                      <span>Yaklaşık Birim Fiyat</span>
                      <span
                        className="cursor-help text-slate-400 hover:text-blue-500 transition-colors"
                        title="Yaklaşık birim fiyat; dosya hazırlık aşamasında girilen birim fiyatlardan veya Piyasa Fiyat Araştırması (PFA) sürecinde firmaların sunduğu tekliflerin ortalaması/en düşüğünden otomatik hesaplanır."
                      >
                        <HelpCircle size={13} />
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 font-bold">
                      <span>Toplam Bedel</span>
                      <span
                        className="cursor-help text-slate-400 hover:text-blue-500 transition-colors"
                        title="Toplam Bedel = Miktar × Yaklaşık Birim Fiyat"
                      >
                        <HelpCircle size={13} />
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-center w-14">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {kalemler.map((kalem, index) => (
                  <tr
                    key={kalem.id}
                    className={
                      index % 2 === 0
                        ? 'bg-white dark:bg-slate-955'
                        : 'bg-slate-50/50 dark:bg-slate-900/30'
                    }
                  >
                    <td className="px-4 py-4 text-center font-semibold text-slate-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-900 dark:text-slate-100 font-bold">
                        {kalem.malzemeAdi}
                      </div>
                      {kalem.aciklama && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {kalem.aciklama}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {kalem.tipi && (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {kalem.tipi}
                          </span>
                        )}
                        <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-bold">
                          {kalem.tasinirKodu}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {kalem.miktar} {kalem.birim}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {kalem.birimFiyat > 0 ? (
                        `${kalem.birimFiyat.toLocaleString('tr-TR')} ₺`
                      ) : (
                        <span
                          className="text-slate-400 italic text-[11px] font-normal cursor-help"
                          title="Piyasa Fiyat Araştırması (PFA) firmalardan teklif alındıktan sonra bu alana işlenecektir."
                        >
                          — (PFA ile Belirlenir)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-right text-slate-900 dark:text-slate-100">
                      {kalem.toplamBedel > 0 ? (
                        `${kalem.toplamBedel.toLocaleString('tr-TR')} ₺`
                      ) : (
                        <span
                          className="text-slate-400 italic text-[11px] font-normal cursor-help"
                          title="Yaklaşık birim fiyat netleştikten sonra hesaplanır."
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDeleteItem(kalem.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50/60 dark:bg-blue-950/30 border-t-2 border-slate-200 dark:border-slate-800 font-bold">
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-right text-slate-800 dark:text-slate-200 font-extrabold uppercase text-xs"
                  >
                    GENEL TOPLAM BEDEL:
                  </td>
                  <td
                    colSpan={2}
                    className="px-6 py-4 text-right text-blue-600 dark:text-blue-400 text-sm font-black"
                  >
                    {toplamBedel > 0
                      ? `${toplamBedel.toLocaleString('tr-TR')} ₺`
                      : '— (PFA Sonrası)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
