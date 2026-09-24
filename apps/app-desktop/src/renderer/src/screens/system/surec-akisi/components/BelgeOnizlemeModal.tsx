import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Modal } from '../../../../components/ui/Modal'
import { FileCheck2, FileText, Printer, Upload } from 'lucide-react'
import { Belge, FirmaItem, Kalem, Komisyon } from '../types'
import { getBelgeDurumBadge, getBelgeDurumLabel } from '../utils/helpers'

interface BelgeOnizlemeModalProps {
  previewBelge: Belge | null
  onClose: () => void
  dosya: { dosyaNo: string; tarih: string; kanunMaddesi: string }
  kalemler: Kalem[]
  firmalar: FirmaItem[]
  komisyonlar: Komisyon[]
  toplamBedel: number
  dosyaContext: any
  onBelgeOlustur: (id: number) => void
  onDosyalariEkle: (files: FileList | null, targetId: number) => void
}

export const BelgeOnizlemeModal: React.FC<BelgeOnizlemeModalProps> = ({
  previewBelge,
  onClose,
  dosya,
  kalemler,
  firmalar,
  komisyonlar,
  toplamBedel,
  dosyaContext,
  onDosyalariEkle
}) => {
  const navigate = useNavigate()

  if (!previewBelge) return null

  const belgeOnizlemeIcerigi = (belge: Belge) => {
    const piyasaKomisyonu = komisyonlar.find((k) => k.tur.includes('Piyasa'))
    const enUygun = [...firmalar]
      .filter((f) => f.teklifBedeli)
      .sort((a, b) => (a.teklifBedeli || 0) - (b.teklifBedeli || 0))[0]

    if (belge.ad === 'Malzeme Talep Formu') {
      return (
        <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200">
          <div className="text-center font-bold text-sm mb-2 uppercase border-b pb-2 border-slate-200 dark:border-slate-800">
            T.C. İÇİŞLERİ BAKANLIĞI — MALZEME VE İHTİYAÇ TALEP FORMU
          </div>
          <div className="grid grid-cols-2 text-xs gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <strong>Talep Eden Birim:</strong> Destek Hizmetleri Dairesi
            </div>
            <div>
              <strong>Talep Tarihi:</strong> {dosya.tarih}
            </div>
            <div>
              <strong>Dosya Referans:</strong> {dosya.dosyaNo}
            </div>
            <div>
              <strong>Dayanak:</strong> {dosya.kanunMaddesi}
            </div>
          </div>
          <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 font-bold">
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-left">
                  Sıra
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-left">
                  Malzeme Açıklaması
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                  Miktar / Birim
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                  Taşınır Kodu
                </th>
              </tr>
            </thead>
            <tbody>
              {kalemler.map((k, i) => (
                <tr key={k.id}>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2">
                    {i + 1}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 font-semibold">
                    {k.malzemeAdi}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                    {k.miktar} {k.birim}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center font-mono">
                    {k.tasinirKodu}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between text-xs pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <div>
              <div className="font-bold">Talep Eden Personel</div>
              <div className="text-slate-500 mt-1">
                {dosyaContext?.hazirlayanPersonelAdi || '—'}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-2">✓ İmzalandı</div>
            </div>
            <div>
              <div className="font-bold">Birim Amiri / Onaylayan</div>
              <div className="text-slate-500 mt-1">{dosyaContext?.onaylayanPersonelAdi || '—'}</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-2">✓ İmzalandı</div>
            </div>
          </div>
        </div>
      )
    }

    if (belge.ad === 'Komisyon Görevlendirme Yazısı') {
      return (
        <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200">
          <div className="text-center font-bold text-sm mb-2 uppercase border-b pb-2 border-slate-200 dark:border-slate-800">
            KOMİSYON GÖREVLENDİRME MAKAM ONAY YAZISI
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {dosya.dosyaNo} kayıt numaralı Doğrudan Temin alım dosyası kapsamında Piyasa Fiyat
            Araştırması yapmak üzere 4734 Sayılı Kamu İhale Kanununun ilgili hükümleri uyarınca
            aşağıda kimlikleri belirtilen personel komisyon olarak görevlendirilmiştir.
          </p>
          <div className="space-y-3">
            {komisyonlar.map((k) => (
              <div
                key={k.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-900"
              >
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400 mb-2">
                  {k.tur} ({k.dayanak})
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {k.uyeler.map((u) => (
                    <div
                      key={u.id}
                      className="p-2 bg-white dark:bg-slate-955 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {u.adSoyad}
                      </div>
                      <div className="text-[11px] text-slate-500">{u.unvan}</div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                        {u.gorev}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (belge.ad === 'Yaklaşık Maliyet Cetveli') {
      return (
        <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200">
          <div className="text-center font-bold text-sm mb-2 uppercase border-b pb-2 border-slate-200 dark:border-slate-800">
            Yaklaşık Maliyet Hesap Cetveli
          </div>
          <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 font-bold">
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-left">
                  Sıra
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-left">
                  Malzeme Adı
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                  Miktar
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                  Birim Fiyat
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right">
                  Tutar
                </th>
              </tr>
            </thead>
            <tbody>
              {kalemler.map((k, i) => (
                <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2">
                    {i + 1}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 font-semibold">
                    {k.malzemeAdi}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                    {k.miktar} {k.birim}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                    {k.birimFiyat.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right font-bold">
                    {k.toplamBedel.toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 dark:bg-slate-900 font-black">
                <td
                  colSpan={4}
                  className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right uppercase"
                >
                  TOPLAM YAKLAŞIK MALİYET
                </td>
                <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right text-blue-600 dark:text-blue-400 text-sm">
                  {toplamBedel.toLocaleString('tr-TR')} ₺
                </td>
              </tr>
            </tbody>
          </table>
          {piyasaKomisyonu && (
            <div className="grid grid-cols-3 gap-4 text-xs text-center mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
              {piyasaKomisyonu.uyeler.map((u) => (
                <div key={u.id} className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{u.adSoyad}</div>
                  <div className="text-[11px] text-slate-500">{u.gorev}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {u.imza}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (belge.ad === 'Piyasa Araştırması Tutanağı') {
      return (
        <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200">
          <div className="text-center font-bold text-sm mb-2 uppercase border-b pb-2 border-slate-200 dark:border-slate-800">
            Piyasa Fiyat Araştırması Tutanağı
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {dosya.dosyaNo} sayılı dosya kapsamında ihtiyaç duyulan malzemelerin temini için aşağıda
            unvanları yazılı firmalardan fiyat teklifi alınmış olup, sonuçlar aşağıda
            gösterilmiştir.
          </p>
          <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 font-bold">
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-left">
                  Firma Unvanı
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                  Teklif Tarihi
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right">
                  Teklif Bedeli
                </th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                  Değerlendirme
                </th>
              </tr>
            </thead>
            <tbody>
              {firmalar.map((f) => (
                <tr
                  key={f.id}
                  className={
                    f.durumu === 'seçildi' ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
                  }
                >
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 font-semibold">
                    {f.unvan}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">
                    {f.teklifTarihi || '—'}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right font-bold">
                    {f.teklifBedeli ? `${f.teklifBedeli.toLocaleString('tr-TR')} ₺` : '—'}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center font-bold">
                    {f.durumu === 'seçildi'
                      ? '✓ Seçildi'
                      : f.durumu === 'teklif'
                        ? '◉ Bekleniyor'
                        : '✗ Reddedildi'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enUygun && (
            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
              Yapılan değerlendirme sonucunda en uygun teklifin{' '}
              <strong className="text-blue-600 dark:text-blue-400">{enUygun.unvan}</strong>{' '}
              firmasından geldiği tespit edilmiş olup{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {enUygun.teklifBedeli?.toLocaleString('tr-TR')} ₺
              </strong>{' '}
              bedelle işlem yapılması komisyonumuzca uygun görülmüştür.
            </p>
          )}
          {piyasaKomisyonu && (
            <div className="grid grid-cols-3 gap-4 text-xs text-center mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
              {piyasaKomisyonu.uyeler.map((u) => (
                <div key={u.id} className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{u.adSoyad}</div>
                  <div className="text-[11px] text-slate-500">{u.gorev}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (belge.ad === 'Doğrudan Temin Onay Belgesi') {
      return (
        <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200">
          <div className="text-center font-bold text-sm mb-2 uppercase border-b pb-2 border-slate-200 dark:border-slate-800">
            DOĞRUDAN TEMİN ONAY BELGESİ
          </div>
          <div className="grid grid-cols-2 text-xs gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <strong>Harcama Birimi:</strong> Destek Hizmetleri
            </div>
            <div>
              <strong>İhale Usulü:</strong> Doğrudan Temin (22/d)
            </div>
            <div>
              <strong>Yaklaşık Maliyet:</strong> {toplamBedel.toLocaleString('tr-TR')} ₺
            </div>
            <div>
              <strong>Kazanan Tedarikçi:</strong> {enUygun?.unvan || 'TEKNOLOJİ A.Ş.'}
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Yukarıda belirtilen ihtiyacın temini amacıyla piyasa fiyat araştırması yapılmış ve en
            uygun teklifi sunan yükleniciden alımın yapılması Harcama Yetkilisince onaylanmıştır.
          </p>
          <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="font-extrabold text-xs">HARCAMA YETKİLİSİ</div>
            <div className="text-slate-500 text-xs mt-1">İmza / Mühür</div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200">
        <div className="text-center font-bold text-sm mb-2 uppercase border-b pb-2 border-slate-200 dark:border-slate-800">
          T.C. KAMU ALIM RESMİ BELGESİ — {belge.ad.toUpperCase()}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div>
            <strong>Belge Adı:</strong> {belge.ad}
          </div>
          <div>
            <strong>Aşama:</strong> {belge.asama}
          </div>
          <div>
            <strong>Dosya Numarası:</strong> {dosya.dosyaNo}
          </div>
          <div>
            <strong>İşlem Durumu:</strong> {getBelgeDurumLabel(belge.durum)}
          </div>
          {belge.pdfDosyaAdi && (
            <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-2">
              <FileCheck2 size={15} /> İmzalı PDF Yüklendi: {belge.pdfDosyaAdi} (
              {belge.pdfYuklenmeTarihi})
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center">
          Bu resmi süreç belgesi Çıktı Merkezi üzerinden mevzuata uygun şablonla dinamik
          oluşturulmaktadır.
        </p>
      </div>
    )
  }

  const handleOpenOfficialTemplate = () => {
    onClose()
    const adLower = (previewBelge.ad || '').toLowerCase()
    if (adLower.includes('talep') || adLower.includes('ihtiyaç') || adLower.includes('onay')) {
      navigate({ to: '/dosya/hazirlik-ve-ihtiyac' as any })
    } else if (
      adLower.includes('piyasa') ||
      adLower.includes('fiyat') ||
      adLower.includes('teklif')
    ) {
      navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' as any })
    } else if (adLower.includes('maliyet')) {
      navigate({ to: '/dosya/firmalar-maliyet/yaklasik' as any })
    } else if (
      adLower.includes('siparis') ||
      adLower.includes('sözleşme') ||
      adLower.includes('sozlesme')
    ) {
      navigate({ to: '/dosya/siparis-ve-sozlesme' as any })
    } else if (
      adLower.includes('muayene') ||
      adLower.includes('kabul') ||
      adLower.includes('ödeme') ||
      adLower.includes('odeme')
    ) {
      navigate({ to: '/dosya/kabul-ve-odeme' as any })
    } else {
      navigate({ to: '/cikti-merkezi' as any })
    }
  }

  return (
    <Modal
      isOpen={Boolean(previewBelge)}
      onClose={onClose}
      title={`Resmi Belge Önizleme: ${previewBelge.ad}`}
      description={`${previewBelge.asama} Aşaması — İhale/Temin Kodu: ${dosya.dosyaNo}`}
      className="max-w-4xl"
    >
      <div className="p-6 bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner max-h-[70vh] overflow-y-auto custom-scrollbar">
        {belgeOnizlemeIcerigi(previewBelge)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold ${
              previewBelge.pdfDosyaAdi
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                : getBelgeDurumBadge(previewBelge.durum)
            }`}
          >
            {previewBelge.pdfDosyaAdi
              ? '✓ İmzalı PDF Teslim Alındı'
              : getBelgeDurumLabel(previewBelge.durum)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all">
            <Upload size={14} /> İmzalı PDF Yükle
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => onDosyalariEkle(e.target.files, previewBelge.id)}
            />
          </label>
          <button
            onClick={handleOpenOfficialTemplate}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            title="Belgeyi resmi şablon motorunda açar ve düzenleme imkanı sağlar"
          >
            <FileText size={14} /> Şablonda Aç
          </button>
          <button
            onClick={handleOpenOfficialTemplate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 transition-all"
            title="Resmi kamu şablonu çıktısını hazırlar"
          >
            <Printer size={14} /> Resmi Belgeyi Yazdır
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  )
}
