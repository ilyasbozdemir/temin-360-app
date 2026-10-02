import React from 'react'
import { Edit, Info } from 'lucide-react'

interface TakipDosyaDetayBilgileriProps {
  activeDosya: any
  komisyonlar: any[]
  onEditClick: () => void
}

export function TakipDosyaDetayBilgileri({
  activeDosya,
  komisyonlar,
  onEditClick
}: TakipDosyaDetayBilgileriProps): React.JSX.Element {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Dosya Şartname ve İdari Bilgileri (Görüntüleme Modu)
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
            Salt Okunur
          </span>
        </div>
        <button
          onClick={onEditClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
        >
          <Edit size={13} />
          Formu Düzenle
        </button>
      </div>

      {/* 1. İhale & Genel Parametreler */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          1. Temel & İhale Parametreleri
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">İhale / Alım Türü</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
              {activeDosya.tur || 'Mal'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">İhale Şekli (Madde)</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.ihale_sekli || '22/d*'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">
              Teklif / Sözleşme Türü
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.teklif_sozlesme_turu || 'Birim Fiyat'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Bütçe Yılı</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.butce_yili || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">KDV Oranı</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              %{activeDosya.kdv || '20'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Sözleşme Durumu</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.sozlesme_yapilacak_mi ? 'Sözleşme Yapılacak' : 'Sözleşme Yapılmayacak'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Fiyat Farkı</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {activeDosya.fiyat_farki_dayanagi || 'Ödenmeyecek'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Kısmi Teklif</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.kismi_teklif_verilecek_mi ? 'Verilebilir' : 'Verilemez'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. İdari Birim & Personeller */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          2. İdari Birim ve Görevli Personeller
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Talep Eden Birim</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.birim_adi || 'Birim Yok'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">İhtiyaç Yeri</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.ihtiyac_yeri || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">İrtibat Yetkilisi</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.irtibat_ad || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">
              Harcama Yetkilisi (Onaylayan)
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.onaylayan_ad || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">
              Gerçekleştirme Görevlisi
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.sunan_ad || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">
              Dosyayı Hazırlayan Personel
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.hazirlayan_ad || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Talep Eden Personel</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.talep_eden_ad || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bütçe & Muhasebe Tertipleri */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          3. Bütçe & Muhasebe Tertibi
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Harcama Birimi</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
              {activeDosya.harcama_birimi || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Muhasebe Birimi</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
              {activeDosya.muhasebe_birimi || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Bütçe Kodu</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.butce_kodu || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Fonksiyonel Kod</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.fonksiyonel_kod || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Finansman Kodu</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.finansman_kodu || '-'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block">Ekonomik Kod</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {activeDosya.ekonomik_kod || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Komisyon Üyeleri (Varsa) */}
      {komisyonlar.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            4. Görevli Komisyon Üyeleri ({komisyonlar.length} Üye)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {komisyonlar.map((c: any) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {c.ad_soyad}
                  </span>
                  <span className="text-[10px] text-slate-400">{c.unvan || 'Üye'}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {c.gorevi || 'Üye'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
