import React, { useState, useEffect } from 'react'
import { Coins, Calculator, TrendingUp, Sparkles } from 'lucide-react'
import { yiUfeService, AY_ISIMLERI } from '../../../services/yiUfeService'

export function FiyatFarkiTab(): React.JSX.Element {
  const [ffHakedis, setFfHakedis] = useState<string>('150000')
  const [ffPnDirect, setFfPnDirect] = useState<string>('1.085')
  const [ffTemelEndeks, setFfTemelEndeks] = useState<string>('1200')
  const [ffGuncelEndeks, setFfGuncelEndeks] = useState<string>('1302')
  const [ffEndeksModu, setFfEndeksModu] = useState<boolean>(false)
  const [ffAlimTuru, setFfAlimTuru] = useState<'mal' | 'hizmet'>('mal')
  const [showUfePicker, setShowUfePicker] = useState<boolean>(false)
  const [temelYil, setTemelYil] = useState<number>(2025)
  const [temelAy, setTemelAy] = useState<number>(1)
  const [guncelYil, setGuncelYil] = useState<number>(2026)
  const [guncelAy, setGuncelAy] = useState<number>(8)
  const ffKdvOrani = 0.2

  useEffect(() => {
    yiUfeService.loadFromDatabase().catch(() => {})
  }, [])

  const loadFfSample = (type: 'mal' | 'hizmet'): void => {
    // Rastgele sayı üretici (min - max arası)
    const randomRange = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min
    const randomFloat = (min: number, max: number, decimals: number) =>
      (Math.random() * (max - min) + min).toFixed(decimals)

    if (type === 'mal') {
      const temel = randomRange(2500, 3500) + Math.random()
      const guncel = temel + randomRange(100, 500) + Math.random()

      setFfHakedis(randomRange(100000, 750000).toString())
      setFfEndeksModu(true)
      setFfTemelEndeks(temel.toFixed(2))
      setFfGuncelEndeks(guncel.toFixed(2))
      setFfAlimTuru('mal')
    } else {
      setFfHakedis(randomRange(250000, 950000).toString())
      setFfEndeksModu(false)
      setFfPnDirect(randomFloat(1.02, 1.25, 4))
      setFfAlimTuru('hizmet')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800/30">
        <Coins className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Fiyat Farkı Kararnameleri ve Mevzuat Yapısı</p>
          <p className="leading-relaxed text-xs">
            4734 Sayılı Kamu İhale Kanunu kapsamında gerçekleştirilen alımlarda, piyasa
            koşullarındaki fiyat değişimlerinin (enflasyon, işçilik vb.) sözleşme bedeline
            yansıtılması bu esaslara göre yapılır. Doğrudan temin (Madde 22) alımlarında fiyat farkı
            verilmesi zorunlu olmamakla birlikte, idarenin uygun görmesi ve sözleşme tasarısında
            açıkça belirtilmesi halinde kararnamelere göre ödeme yapılabilir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Option 1: Fiyat Farkı Ödenmeyecek */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors relative flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-3 border border-slate-200 dark:border-slate-700 font-bold text-sm">
              FF0
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">
              Fiyat Farkı Ödenmeyecek
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Süreçte herhangi bir fiyat farkı hesaplaması yapılmaz. İhale veya teklif tarihindeki
              birim fiyatlar sözleşme/alım sonuna kadar sabit kalır. Doğrudan temin alımlarının
              büyük kısmında bu seçenek tercih edilir.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Varsayılan Uygulama Modu
          </div>
        </div>

        {/* Option 2: Mal Alımı Kararnamesi */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors relative flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-200/50 dark:border-emerald-800/30 font-bold text-sm">
              FF1
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">
              Mal Alımı Fiyat Farkı
            </h3>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
              <strong>31.08.2013 Tarih ve 2013/5216 Sayılı</strong> Mal Alımı İhalelerinde Fiyat
              Farkı Hesaplanmasına İlişkin Esaslar uygulanır.
            </p>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              Malın teslim süresi içinde teslim edilememesi durumunda gecikilen süreler için fiyat
              farkı hesabı, endekslerin değişim oranlarına göre (TÜİK ÜFE) hesaplanır.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Karar No: 2013/5216
          </div>
        </div>

        {/* Option 3: Hizmet Alımı Kararnamesi */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors relative flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-955/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 border border-blue-200/50 dark:border-blue-800/30 font-bold text-sm">
              FF2
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">
              Hizmet Alımı Fiyat Farkı
            </h3>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
              <strong>31.08.2013 Tarih ve 2013/5215 Sayılı</strong> Hizmet Alımlarında Fiyat Farkı
              Hesaplanmasına İlişkin Esaslar uygulanır.
            </p>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              Personel çalıştırılmasına dayalı hizmet alımlarında asgari ücret artışları, akaryakıt
              endeksi değişimleri ve diğer girdi kalemlerindeki (ÜFE) değişimler formüle edilerek
              hesaplanır.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
            Karar No: 2013/5215
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
          Fiyat Farkı Formül Yapısı (K.İ.K Standartı)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Fiyat farkı hesabı, sözleşme bedeli veya hakediş tutarı üzerinden aşağıdaki KİK
              formülüyle hesaplanır:
            </p>
            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-3.5 rounded-xl border border-slate-800 text-center shadow-inner">
              F = An x (Pn - 1)
            </div>
            <ul className="text-[11px] text-slate-500 dark:text-slate-450 space-y-1 leading-relaxed">
              <li>
                <strong>F:</strong> Ödenecek/kesilecek fiyat farkı tutarı (TL)
              </li>
              <li>
                <strong>An:</strong> Fiyat farkı uygulanacak hakediş tutarı
              </li>
              <li>
                <strong>Pn:</strong> Fiyat farkı katsayısı
              </li>
            </ul>
          </div>
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-350">
              Mevzuat Uygulama Kriterleri
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
              Doğrudan teminlerde fiyat farkı verilmek isteniyorsa, yaklaşık maliyetin limitlerin
              altında kalması formülü değiştirmez. Ancak ödeme aşamalarında aksaklık yaşanmaması
              için ihale onay belgesi düzenlenirken ve yaklaşık maliyet onaylanırken fiyat farkı
              maddesinin seçilmiş olması ve firmaya iletilen sipariş mektubunda/sözleşmede bu
              kararnamenin adının geçmesi şarttır.
            </p>
          </div>
        </div>
      </div>

      {/* Fiyat Farkı Hesaplama Oyun Alanı / Simülatörü */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/20 dark:bg-slate-955/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-250/50 dark:border-slate-800/50">
          <div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
              <Calculator className="w-4.5 h-4.5 text-blue-500" />
              Fiyat Farkı Hesaplama Oyun Alanı (Simülatör) 🎮
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Seçtiğiniz parametrelere göre KİK standartlarına uygun anlık fiyat farkı hesabı simüle
              edin.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadFfSample('mal')}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/40 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Örnek Mal Alımı Yükle
            </button>
            <button
              type="button"
              onClick={() => loadFfSample('hizmet')}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-450 bg-blue-50 dark:bg-blue-955/20 border border-blue-250/40 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-955/40 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Örnek Hizmet Alımı Yükle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol Taraf: İnteraktif Girdiler */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-350">
                  Hakediş / Uygulama Tutarı (An - KDV Hariç)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ffHakedis}
                    onChange={(e) => setFfHakedis(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1.5 focus:ring-blue-500/50 font-medium"
                    placeholder="Örn: 150000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                    ₺
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-350">
                  Alım Kararnamesi Türü
                </label>
                <select
                  value={ffAlimTuru}
                  onChange={(e) => setFfAlimTuru(e.target.value as 'mal' | 'hizmet')}
                  title="Alım Kararnamesi Türü"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1.5 focus:ring-blue-500/50 font-medium"
                >
                  <option value="mal">Mal Alımı (ÜFE Bazlı)</option>
                  <option value="hizmet">Hizmet Alımı (Formül/Endeks/Asgari Ücret)</option>
                </select>
              </div>
            </div>

            {/* Mod Değiştirici: Doğrudan Katsayı vs Endeks */}
            <div className="bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400">
                Katsayı Giriş Yöntemi
              </span>
              <div className="flex rounded-lg bg-slate-200/80 dark:bg-slate-950/60 p-0.5 border border-slate-300/30">
                <button
                  type="button"
                  onClick={() => setFfEndeksModu(false)}
                  className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${
                    !ffEndeksModu
                      ? 'bg-white dark:bg-slate-800 text-blue-650 dark:text-blue-400 shadow-sm cursor-default'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer'
                  }`}
                >
                  Katsayı (Pn) Gir
                </button>
                <button
                  type="button"
                  onClick={() => setFfEndeksModu(true)}
                  className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${
                    ffEndeksModu
                      ? 'bg-white dark:bg-slate-800 text-blue-650 dark:text-blue-400 shadow-sm cursor-default'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer'
                  }`}
                >
                  Endeks Gir (Pn = Yn / Y0)
                </button>
              </div>
            </div>

            {/* Değişken Alanlar */}
            {!ffEndeksModu ? (
              <div className="space-y-1.5 max-w-xs animate-in fade-in duration-200">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-350">
                  Fiyat Farkı Katsayısı (Pn)
                </label>
                <input
                  type="text"
                  value={ffPnDirect}
                  onChange={(e) => setFfPnDirect(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1.5 focus:ring-blue-500/50 font-mono font-bold"
                  placeholder="Örn: 1.085"
                />
                <p className="text-[9px] text-slate-400 dark:text-slate-500">
                  Katsayının 1'den büyük olması durumunda ek ödeme, küçük olması durumunda ise
                  kesinti yapılır.
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-350">
                      Temel Endeks (Y0 / İhale Tarihi)
                    </label>
                    <input
                      type="text"
                      value={ffTemelEndeks}
                      onChange={(e) => setFfTemelEndeks(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1.5 focus:ring-blue-500/50 font-mono"
                      placeholder="Örn: 1200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-350">
                      Güncel Endeks (Yn / Hakediş Dönemi)
                    </label>
                    <input
                      type="text"
                      value={ffGuncelEndeks}
                      onChange={(e) => setFfGuncelEndeks(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1.5 focus:ring-blue-500/50 font-mono"
                      placeholder="Örn: 1302"
                    />
                  </div>
                </div>

                {/* TÜİK Yİ-ÜFE Otomatik Endeks Seçici Asistanı */}
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>TÜİK Resmî Yİ-ÜFE Endeks Asistanı (1994 - 2026)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUfePicker(!showUfePicker)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                    >
                      {showUfePicker ? 'Kapat ▲' : 'Endeksleri Seç ▼'}
                    </button>
                  </div>

                  {showUfePicker && (
                    <div className="pt-2 border-t border-blue-100 dark:border-blue-900/40 space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Temel Endeks Seçimi */}
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">
                            İhale / Baz Dönem (Y0)
                          </span>
                          <div className="flex gap-1.5">
                            <select
                              value={temelYil}
                              onChange={(e) => {
                                const y = Number(e.target.value)
                                setTemelYil(y)
                                const val = yiUfeService.getIndex(y, temelAy)
                                if (val) setFfTemelEndeks(val.toFixed(2))
                              }}
                              className="w-1/2 p-1 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded"
                            >
                              {Array.from({ length: 33 }, (_, i) => 2026 - i).map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                            <select
                              value={temelAy}
                              onChange={(e) => {
                                const a = Number(e.target.value)
                                setTemelAy(a)
                                const val = yiUfeService.getIndex(temelYil, a)
                                if (val) setFfTemelEndeks(val.toFixed(2))
                              }}
                              className="w-1/2 p-1 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded"
                            >
                              {AY_ISIMLERI.map((m, idx) => (
                                <option key={idx + 1} value={idx + 1}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="text-[10px] text-slate-500 flex justify-between pt-0.5">
                            <span>Seçilen Endeks:</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                              {yiUfeService.getIndex(temelYil, temelAy)?.toFixed(2) || 'Açıklanmadı'}
                            </span>
                          </div>
                        </div>

                        {/* Güncel Endeks Seçimi */}
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">
                            Hakediş / Uygulama Dönemi (Yn)
                          </span>
                          <div className="flex gap-1.5">
                            <select
                              value={guncelYil}
                              onChange={(e) => {
                                const y = Number(e.target.value)
                                setGuncelYil(y)
                                const val = yiUfeService.getIndex(y, guncelAy)
                                if (val) setFfGuncelEndeks(val.toFixed(2))
                              }}
                              className="w-1/2 p-1 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded"
                            >
                              {Array.from({ length: 33 }, (_, i) => 2026 - i).map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                            <select
                              value={guncelAy}
                              onChange={(e) => {
                                const a = Number(e.target.value)
                                setGuncelAy(a)
                                const val = yiUfeService.getIndex(guncelYil, a)
                                if (val) setFfGuncelEndeks(val.toFixed(2))
                              }}
                              className="w-1/2 p-1 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded"
                            >
                              {AY_ISIMLERI.map((m, idx) => (
                                <option key={idx + 1} value={idx + 1}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="text-[10px] text-slate-500 flex justify-between pt-0.5">
                            <span>Seçilen Endeks:</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {yiUfeService.getIndex(guncelYil, guncelAy)?.toFixed(2) || 'Açıklanmadı'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const tVal = yiUfeService.getIndex(temelYil, temelAy)
                            const gVal = yiUfeService.getIndex(guncelYil, guncelAy)
                            if (tVal) setFfTemelEndeks(tVal.toFixed(2))
                            if (gVal) setFfGuncelEndeks(gVal.toFixed(2))
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Seçilenleri Hesaplayıcıya Aktar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sağ Taraf: Canlı Hesaplama Sonuç Kartı */}
          <div className="lg:col-span-5 flex flex-col">
            {(() => {
              const hakedisVal = parseFloat(ffHakedis.replace(/,/g, '.')) || 0
              let pnVal = 1
              if (ffEndeksModu) {
                const temel = parseFloat(ffTemelEndeks.replace(/,/g, '.')) || 1
                const guncel = parseFloat(ffGuncelEndeks.replace(/,/g, '.')) || 1
                pnVal = temel !== 0 ? guncel / temel : 1
              } else {
                pnVal = parseFloat(ffPnDirect.replace(/,/g, '.')) || 1
              }
              const ffVal = hakedisVal * (pnVal - 1)
              const kdvVal = ffVal * ffKdvOrani // seçilen KDV oranı
              const toplamFf = ffVal + kdvVal

              const formattedHakedis = new Intl.NumberFormat('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(hakedisVal)
              const formattedPn = new Intl.NumberFormat('tr-TR', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4
              }).format(pnVal)
              const formattedFark = new Intl.NumberFormat('tr-TR', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4
              }).format(pnVal - 1)
              const formattedFf = new Intl.NumberFormat('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(Math.abs(ffVal))
              const formattedKdv = new Intl.NumberFormat('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(Math.abs(kdvVal))
              const formattedToplam = new Intl.NumberFormat('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(Math.abs(toplamFf))

              const isPositive = ffVal > 0
              const isZero = ffVal === 0

              return (
                <div
                  className={`flex-1 rounded-2xl border p-4.5 flex flex-col justify-between ${
                    isZero
                      ? 'bg-slate-100/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : isPositive
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-250/30 dark:border-emerald-900/20'
                        : 'bg-rose-50/45 dark:bg-rose-955/10 border-rose-250/30 dark:border-rose-900/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Simülasyon Sonuç Raporu
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isZero
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                            : isPositive
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {ffAlimTuru === 'mal' ? 'Mal Alımı (FF1)' : 'Hizmet Alımı (FF2)'}
                      </span>
                    </div>

                    <div className="text-center py-4 bg-white dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800/40 rounded-xl mb-4 shadow-sm">
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold block mb-0.5">
                        {isZero
                          ? 'Fiyat Farkı Tutar'
                          : isPositive
                            ? 'Yükleniciye Ödenecek Fiyat Farkı'
                            : 'Yükleniciden Kesilecek Fiyat Farkı'}
                      </span>
                      <div
                        className={`text-xl font-bold font-mono ${
                          isZero
                            ? 'text-slate-600 dark:text-slate-350'
                            : isPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : isZero ? '' : '-'}
                        {formattedFf} ₺
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">
                        (KDV Hariç)
                      </span>
                    </div>

                    <div className="space-y-2 border-b border-dashed border-slate-250/80 dark:border-slate-800 pb-3 mb-3 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Hakediş Tutarı (An)</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {formattedHakedis} ₺
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Katsayı Katsayısı (Pn)</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {formattedPn}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Katsayı Farkı (Pn - 1)</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {formattedFark}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between font-medium text-slate-550 dark:text-slate-400">
                        <span>Hesaplanan Net KDV (%20)</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {formattedKdv} ₺
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white pt-1">
                        <span>KDV Dahil Toplam Etki</span>
                        <span className="font-mono text-sm">{formattedToplam} ₺</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-400/90 dark:text-slate-500 italic leading-relaxed text-center">
                    Formül Yapısı: F = {formattedHakedis} x ({formattedPn} - 1)
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
