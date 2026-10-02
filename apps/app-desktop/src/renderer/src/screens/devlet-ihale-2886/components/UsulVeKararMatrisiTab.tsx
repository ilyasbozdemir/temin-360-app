import React, { useState } from 'react'
import {
  Gavel,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  HelpCircle,
  Clock,
  ShieldAlert
} from 'lucide-react'
import { Usul2886 } from '../types/devletIhale2886.types'

export function UsulVeKararMatrisiTab(): React.JSX.Element {
  const [selectedUsul, setSelectedUsul] = useState<Usul2886>('acik_teklif_45')

  const usuller: {
    id: Usul2886
    madde: string
    title: string
    description: string
    kriterler: string[]
    surec: string
    uygunluk: string
  }[] = [
    {
      id: 'acik_teklif_45',
      madde: '2886 Sayılı Kanun Madde 45',
      title: 'Açık Teklif Usulü (Açık Artırma)',
      description:
        'Taşınmaz kiralama ve satışlarında parasal limit dahilinde en çok tercih edilen açık artırma yöntemi.',
      kriterler: [
        'Muhammen bedel kanuni parasal sınırın altında olan satış ve kiralamalar',
        'İsteyen her isteklinin katılımına açık',
        'Sözlü veya pey sürme usulü ile en yüksek teklifin belirlenmesi'
      ],
      surec:
        'İlan → Şartname → Geçici Teminat → Açık Artırma (Sözlü/Pey) → Encümen Kararı → İta Amiri Onayı',
      uygunluk: 'Dükkan, kantin, arsa satışı ve standart kiralamalar için idealdir.'
    },
    {
      id: 'kapali_teklif_36',
      madde: '2886 Sayılı Kanun Madde 36',
      title: 'Kapalı Teklif Usulü (Asıl Usul)',
      description:
        'Kanunun ana ihale usulüdür. Yüksek değerli taşınmaz satışları ve büyük projelerde uygulanır.',
      kriterler: [
        'Parasal limiti aşan büyük ölçekli taşınmaz satışları',
        'Tekliflerin çift zarf usulüyle yazılı sunulması',
        'Zarflar açıldıktan sonra son yazılı tekliflerin alınması veya açık artırmaya geçilmesi'
      ],
      surec:
        'Geniş Kapsamlı İlan → Kapalı Zarf Teslimi → Zarf Açılışı & İnceleme → Son Teklifler → Karar',
      uygunluk: 'Büyük arsa/bina satışları, mülkiyet devirleri ve yüksek bedelli ihaleler.'
    },
    {
      id: 'pazarlik_51',
      madde: '2886 Sayılı Kanun Madde 51',
      title: 'Pazarlık Usulü',
      description:
        'İhalenin yapılamaması, ivedilik veya özel kanuni bentlerde sayılan durumlarda doğrudan pazarlık yapılması.',
      kriterler: [
        'Daha önce ihaleye çıkarılıp istekli çıkmayan veya iptal edilen işler',
        'Acil ve ivedi durumlar (Madde 51/a, 51/g vb.)',
        'İdarece belirlenen isteklilerle şartlar üzerinde pazarlık yapılması'
      ],
      surec: 'Davet / Çağrı → İsteklilerle Komisyon Görüşmesi → Pazarlık Tutanağı → Onay',
      uygunluk: 'İhalesi sonuçsuz kalan taşınmazların yeniden kiralanması veya satışı.'
    },
    {
      id: 'belli_istekliler_44',
      madde: '2886 Sayılı Kanun Madde 44',
      title: 'Belli İstekliler Arasında Kapalı Teklif',
      description:
        'Ön yeterlik değerlendirmesi sonucu uzmanlık veya yeterlilik sahibi isteklilerin davet edildiği usul.',
      kriterler: [
        'Özel uzmanlık, teknik kapasite veya finansal yeterlik gerektiren durumlar',
        'Ön yeterlik ilanı ve şartnamesi düzenlenmesi'
      ],
      surec:
        'Ön Yeterlik İlanı → Başvuruların Değerlendirilmesi → Yeterli İsteklilere Davet → İhale',
      uygunluk: 'Özel tesisler, marina, tema parkı, enerji yatırımı vb. kompleks projeler.'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
              2886 İhale Usulü Seçimi ve Karar Matrisi
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Seçilen Usul:{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">Madde 45 Açık Teklif</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {usuller.map((u) => {
          const isSelected = selectedUsul === u.id
          return (
            <div
              key={u.id}
              onClick={() => setSelectedUsul(u.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 font-mono">
                    {u.madde}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {u.title}
                  </h4>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                {u.description}
              </p>

              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-[11px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Uygulama Kriterleri:
                </div>
                {u.kriterler.map((crit, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400"
                  >
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{crit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-850 rounded-lg text-[11px] text-slate-500 border border-slate-200/60 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Özet Süreç:{' '}
                </span>
                {u.surec}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
