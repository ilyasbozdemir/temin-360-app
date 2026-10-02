import React, { useState } from 'react'
import {
  FileText,
  CheckCircle,
  Clock,
  Printer,
  FileCheck,
  Send,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react'
import { SurecEvrakiItem } from '../types/devletIhale2886.types'

export function SurecEvraklariTab(): React.JSX.Element {
  const [evraklar, setEvraklar] = useState<SurecEvrakiItem[]>([
    // 1. Başlangıç ve Yetki
    {
      id: '1',
      ad: 'Başkanlık Oluru / İhale Başlatma Onay Belgesi',
      kod: '2886-EVR-01',
      asama: 'baslangic',
      zorunluMu: true,
      durum: 'onaylandi',
      tarih: '2026-03-01',
      sayiNo: 'E-2026/104'
    },
    {
      id: '2',
      ad: 'Belediye Encümeni Satış / Kiralama Yetki Kararı',
      kod: '2886-EVR-02',
      asama: 'baslangic',
      zorunluMu: true,
      durum: 'onaylandi',
      tarih: '2026-03-05',
      sayiNo: 'Karar No: 2026/112'
    },
    // 2. Kıymet Takdiri
    {
      id: '3',
      ad: 'Kıymet Takdir Komisyonu Görevlendirme Yazısı',
      kod: '2886-EVR-03',
      asama: 'kiymet_takdir',
      zorunluMu: true,
      durum: 'onaylandi',
      tarih: '2026-03-08'
    },
    {
      id: '4',
      ad: 'Emsal Fiyat Araştırma Yazıları (Oda / Muhtarlık vb.)',
      kod: '2886-EVR-04',
      asama: 'kiymet_takdir',
      zorunluMu: true,
      durum: 'onaylandi',
      tarih: '2026-03-12'
    },
    {
      id: '5',
      ad: 'Kıymet Takdir Komisyonu Kararı & Muhammen Bedel Cetveli',
      kod: '2886-EVR-05',
      asama: 'kiymet_takdir',
      zorunluMu: true,
      durum: 'onaylandi',
      tarih: '2026-03-15',
      sayiNo: '2026/08-KT'
    },
    // 3. Şartname ve İlan
    {
      id: '6',
      ad: 'İdari Şartname ve Tip Sözleşme Taslağı (Genel & Özel Şartlar)',
      kod: '2886-EVR-06',
      asama: 'sartname_ve_ilan',
      zorunluMu: true,
      durum: 'onaylandi',
      tarih: '2026-03-18'
    },
    {
      id: '7',
      ad: 'Encümen İhale Kararı (İlan Onayı ve Tarih Tespiti)',
      kod: '2886-EVR-07',
      asama: 'sartname_ve_ilan',
      zorunluMu: true,
      durum: 'onaylandi',
      tarih: '2026-03-20',
      sayiNo: 'Karar No: 2026/135'
    },
    {
      id: '8',
      ad: 'Belediye / Kaymakamlık / Web İlan Metinleri',
      kod: '2886-EVR-08',
      asama: 'sartname_ve_ilan',
      zorunluMu: true,
      durum: 'onaylandi',
      tarih: '2026-03-22'
    },
    {
      id: '9',
      ad: 'Askıya Çıkarma ve Askıdan İndirme Tutanakları',
      kod: '2886-EVR-09',
      asama: 'sartname_ve_ilan',
      zorunluMu: true,
      durum: 'taslak'
    },
    // 4. İhale Günü
    {
      id: '10',
      ad: 'Şartname Satın Alma / Alınma Belgesi Kaydı',
      kod: '2886-EVR-10',
      asama: 'ihale_gunu',
      zorunluMu: true,
      durum: 'taslak'
    },
    {
      id: '11',
      ad: 'İhale Cetveli (Açık Artırma & Teklif Zarfı Açma Tutanağı)',
      kod: '2886-EVR-11',
      asama: 'ihale_gunu',
      zorunluMu: true,
      durum: 'taslak'
    },
    {
      id: '12',
      ad: 'İhale Komisyonu (Encümen) İhale Kararı',
      kod: '2886-EVR-12',
      asama: 'ihale_gunu',
      zorunluMu: true,
      durum: 'taslak'
    },
    // 5. Onay ve Sözleşme
    {
      id: '13',
      ad: 'İta Amiri (Belediye Başkanı) İhale Onay Belgesi',
      kod: '2886-EVR-13',
      asama: 'onay_ve_sozlesme',
      zorunluMu: true,
      durum: 'hazirlanmadi'
    },
    {
      id: '14',
      ad: 'Kesinleşen İhale Kararı Tebligat Yazısı',
      kod: '2886-EVR-14',
      asama: 'onay_ve_sozlesme',
      zorunluMu: true,
      durum: 'hazirlanmadi'
    },
    {
      id: '15',
      ad: 'Taşınmaz Satış / Kira Sözleşmesi & Ödeme Planı',
      kod: '2886-EVR-15',
      asama: 'onay_ve_sozlesme',
      zorunluMu: true,
      durum: 'hazirlanmadi'
    },
    {
      id: '16',
      ad: 'Taşınmaz / İşyeri Yer Teslim Tutanağı',
      kod: '2886-EVR-16',
      asama: 'onay_ve_sozlesme',
      zorunluMu: true,
      durum: 'hazirlanmadi'
    }
  ])

  const asamaBasliklari: {
    id: SurecEvrakiItem['asama']
    title: string
    color: string
  }[] = [
    { id: 'baslangic', title: '1. Aşama: Başlangıç ve Yetki Evrakları', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'kiymet_takdir', title: '2. Aşama: Kıymet Takdiri & Muhammen Bedel', color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'sartname_ve_ilan', title: '3. Aşama: Şartname, İhale Kararı & İlan Süreci', color: 'text-purple-600 dark:text-purple-400' },
    { id: 'ihale_gunu', title: '4. Aşama: İhale Günü, Açık Artırma & Encümen Kararı', color: 'text-amber-600 dark:text-amber-400' },
    { id: 'onay_ve_sozlesme', title: '5. Aşama: İta Amiri Onayı, Tebligat & Sözleşme', color: 'text-emerald-600 dark:text-emerald-400' }
  ]

  const getDurumBadge = (durum: SurecEvrakiItem['durum']) => {
    switch (durum) {
      case 'onaylandi':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle className="w-3 h-3" /> Hazır & Onaylı
          </span>
        )
      case 'taslak':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3 h-3" /> Taslak / Bekliyor
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Hazırlanmadı
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {asamaBasliklari.map((asama) => {
        const items = evraklar.filter((e) => e.asama === asama.id)
        return (
          <div
            key={asama.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs"
          >
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${asama.color}`}>
              {asama.title}
            </h4>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                        <span>{item.ad}</span>
                        {item.sayiNo && (
                          <span className="text-[10px] font-mono text-slate-400">
                            ({item.sayiNo})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.kod} {item.tarih ? `• Tarih: ${item.tarih}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getDurumBadge(item.durum)}
                    <button
                      type="button"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Belgeyi Önizle / Yazdır"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
