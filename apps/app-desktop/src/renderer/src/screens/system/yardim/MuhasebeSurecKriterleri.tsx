import React from 'react'

export const MuhasebeSurecKriterleri: React.FC = () => {
  return (
    <>
      {/* 3. ÖDENEK VE YAKLAŞIK MALİYET */}
      <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-255 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          3. Ödenek Kontrolü ve Yaklaşık Maliyet Esasları
        </h3>
        <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
          <li>
            <strong>Ödenek Zorunluluğu:</strong> Ödeneği bulunmayan hiçbir iş için ihaleye/alıma
            çıkılamaz (4734 Sayılı Kanun Md. 5). Kamu idareleri, bütçelerinde yer alan ödeneklerin
            üzerinde harcama yapamaz (5018 Sayılı Kanun Md. 20/d).
          </li>
          <li>
            <strong>Yaklaşık Maliyet Tespiti:</strong> 22/d kapsamındaki yapım işlerinde yaklaşık
            maliyet çalışması yapılması zorunludur (Genel Tebliğ 22.5.1). Ayrıca, alım limiti
            parasal sınıra yakınsa, limit aşımı olup olmadığının tespiti için yaklaşık maliyetin
            belirlenmesi şarttır.
          </li>
          <li>
            <strong>Fiyat Tespit Kaynakları:</strong> Yaklaşık maliyet hesaplanırken; piyasadan
            proforma faturalar, idarenin önceki benzer alım fiyatları, kamu kurumlarının yayınladığı
            rayiçler veya ilgili meslek odası fiyatları esas alınabilir.
          </li>
        </ul>
      </div>

      {/* 4. ŞARTNAME, SÖZLEŞME VE EKAP BİLDİRİMİ */}
      <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-255 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          4. Şartname, Yazılı Sözleşme ve EKAP Bildirim Kuralları
        </h3>
        <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
          <li>
            <strong>Şartname ve Sözleşme:</strong> Doğrudan teminde şartname ve sözleşme düzenlenmesi
            idarenin takdirindedir. Ancak <strong>süreli alımlarda</strong> (işin gerçekleştirilmesinin
            belli bir süreye bağlı olduğu hizmet veya mal alımlarında) yazılı sözleşme düzenlenmesi
            gerekmektedir.
          </li>
          <li>
            <strong>EKAP Yasaklılık Teyidi:</strong> 22/d kapsamındaki alımlarda, alım yapılacak
            gerçek veya tüzel kişinin EKAP üzerinden yasaklılar listesinde olup olmadığı sorgulanmalı
            ve <strong>yasaklı olduğu tespit edilen kişilerden kesinlikle alım yapılmamalıdır</strong>{' '}
            (KİK Genel Tebliği Md. 30.5.4).
          </li>
          <li>
            <strong>EKAP Bildirim Süresi:</strong> Doğrudan temin yoluyla gerçekleştirilen alımlara
            ilişkin &quot;Doğrudan Temin Kayıt Formu&quot;, alım tarihini takip eden{' '}
            <strong>ayın 10 uncu gününe kadar</strong> EKAP üzerinden Kuruma bildirilmelidir.
          </li>
        </ul>
      </div>

      {/* 5. MUAYENE, KABUL VE TİF İSTİSNALARI */}
      <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-255 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          5. Muayene Kabul İşlemleri ve TİF Düzenlenmeyen Durumlar
        </h3>
        <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
          <li>
            <strong>Muayene ve Kabul Komisyonu:</strong> Alımı yapılan mal veya iş, idarece
            kurulacak <strong>en az 3 kişilik</strong> muayene ve kabul komisyonu tarafından
            incelenir. İş yüklenici tarafından teslim edilmedikçe muayene kabul işlemleri yapılamaz.
          </li>
          <li>
            <strong>Taşınır İşlem Fişi (TİF) İstisnaları:</strong> Aşağıdaki alımlarda Taşınır İşlem
            Fişi (TİF) düzenlenmesi zorunlu değildir:
            <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-500">
              <li>
                Satın alındığı andan itibaren tüketilen su, doğalgaz, kum, çakıl, bahçe toprağı,
                gübre alımları.
              </li>
              <li>
                Kısa sürede tüketilen mutfak tüpleri, yangın söndürme tüpü dolumları ve yazıcı
                kartuşu dolumları.
              </li>
              <li>
                Servislerde yapılan bakım-onarımlarda kullanılan yedek parçalar ile doğrudan
                depolarına konulan akaryakıt, yağ alımları.
              </li>
              <li>
                Dergi, gazete gibi süreli yayın alımları ile arşivlenme niteliği olmayan kütüphane
                materyalleri.
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {/* 6. YASAL SORUMLULUK */}
      <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-255 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          6. Yasal Sorumluluk ve Sayıştay Kararları
        </h3>
        <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
          Sürecin her aşamasında görev alan ilgililer görevlerini kanuni gereklere uygun ve
          tarafsızlıkla yapmalıdır:
        </p>
        <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
          <li>
            <strong>Cezai Sorumluluk:</strong> Görevini kötüye kullanan veya ihmal edenlere disiplin
            cezası uygulanır ve oluşan kamu zararları rücu edilir.
          </li>
          <li>
            <strong>Sayıştay İçtihatları:</strong> Sayıştay kararları uyarınca, doğrudan temin
            alımlarında da temel ilkeler gözetilerek{' '}
            <strong>sağlıklı bir piyasa fiyat araştırması yapılması</strong> zorunludur.
          </li>
        </ul>
      </div>

      {/* 7. ÖDEME ONAY KRİTERLERİ */}
      <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          7. Muhasebe Yetkilisi İmza ve Kontrol Kriterleri
        </h3>
        <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
          Harcama belgeleri muhasebe birimine teslim edildiğinde, Muhasebe Yetkilisi ödemeyi
          yapmadan önce 5018 Sayılı Kanun uyarınca şu hususları kontrol etmekle yükümlüdür:
        </p>
        <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
          <li>
            <strong>Görevler Ayrılığı İlkesi:</strong> Harcama belgesini düzenleyen Gerçekleştirme
            Görevlisi (Örn. Piyasa Fiyat Komisyon Üyesi) ile Muhasebe Yetkilisi{' '}
            <strong>kesinlikle aynı kişi olamaz</strong>.
          </li>
          <li>
            <strong>Maddi Hata Kontrolü:</strong> Faturadaki birim fiyat, miktar ve KDV hesaplamaları
            ile Muayene Kabul Tutanağındaki ve Yaklaşık Maliyet Cetvelindeki rakamların matematiksel
            olarak birbirini doğrulaması gerekir.
          </li>
          <li>
            <strong>Borç Sorgulaması (Kamu Alacakları):</strong> 6183 Sayılı Kanun gereğince, ödeme
            tutarı vadesi geçmiş borç limitlerinin üzerindeyse (Örn: Vergi borcunda 5.000 TL, SGK
            borcunda asgari ücretin 1 katı üzeri), ödeme yapılmadan önce Yüklenicinin vergi
            dairesinden ve SGK sisteminden &quot;Borcu Yoktur&quot; belgesi veya kesinti talimatı
            sorgulanır. Borç varsa muhasebe birimi ödemeden kesinti yaparak ilgili kuruma aktarır.
          </li>
        </ul>
      </div>
    </>
  )
}
