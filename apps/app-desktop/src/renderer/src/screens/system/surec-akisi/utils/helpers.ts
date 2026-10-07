import { Belge } from '../types'

export const dosyaBoyutFormatla = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const getStatusColor = (status: string): string =>
  ({
    completed:
      'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'in-progress':
      'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    pending:
      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  })[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'

export const getStatusLabel = (status: string): string =>
  ({
    completed: '✓ Tamamlandı',
    'in-progress': '◉ Yapılıyor',
    pending: '◯ Bekleniyor'
  })[status] || '◯ Bekleniyor'

export const getLineColor = (status: string): string =>
  ({
    completed: 'bg-emerald-500',
    'in-progress': 'bg-blue-500',
    pending: 'bg-slate-300 dark:bg-slate-700'
  })[status] || 'bg-slate-300'

export const getFirmaStatusBadge = (durumu: string): string =>
  ({
    seçildi:
      'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    teklif:
      'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    bekliyor:
      'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    reddedildi:
      'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  })[durumu] ||
  'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200'

export const getFirmaStatusLabel = (durumu: string): string =>
  ({
    seçildi: '✓ Kazanan / Yüklenici Firma',
    teklif: '◉ Teklif Verildi',
    bekliyor: '◯ Teklif Bekleniyor',
    reddedildi: '✗ Seçilmedi / Elendi'
  })[durumu] || '◯ Teklif Bekleniyor'

export const getBelgeDurumBadge = (durum: string): string =>
  ({
    imzalandı:
      'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    imza_bekliyor:
      'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    oluşturuldu:
      'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    taslak:
      'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    oluşturulmadı:
      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  })[durum] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'

export const getBelgeDurumLabel = (durum: string): string =>
  ({
    imzalandı: 'İmzalandı',
    imza_bekliyor: 'İmzadan Dönüş Bekleniyor',
    oluşturuldu: 'Oluşturuldu',
    taslak: 'Taslak',
    oluşturulmadı: 'Oluşturulmadı'
  })[durum] || 'Oluşturulmadı'

export const getKomisyonDurumBadge = (durum: string): string =>
  ({
    aktif:
      'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    tamamlandı:
      'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    bekliyor:
      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  })[durum] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'

export const getKomisyonDurumLabel = (durum: string): string =>
  ({
    aktif: '◉ Aktif',
    tamamlandı: '✓ Tamamlandı',
    bekliyor: '◯ Henüz Görevlendirilmedi'
  })[durum] || '◯ Bekliyor'

export const belgeSonrakiDurum = (durum: string): Belge['durum'] =>
  ({
    oluşturulmadı: 'taslak' as const,
    taslak: 'oluşturuldu' as const,
    oluşturuldu: 'imza_bekliyor' as const,
    imza_bekliyor: 'imzalandı' as const,
    imzalandı: 'imzalandı' as const
  })[durum] || 'taslak'

export const resolveSurecBelgeKod = (belge: Belge | string): string => {
  const name = typeof belge === 'string' ? belge : (belge.kod || belge.ad || '')
  const n = name.toLowerCase().trim()
  if (n.includes('malzeme talep') || n.includes('ihtiyaç talep') || n.includes('ihtiyac talep') || n.includes('talep formu')) return 'ihtiyac-talep-formu'
  if (n.includes('komisyon görevlendirme') || n.includes('komisyon gorevlendirme')) return 'komisyon-gorevlendirme-onayi'
  if (n.includes('piyasa') && (n.includes('tutanak') || n.includes('araştırma') || n.includes('arastirma'))) return 'piyasa-fiyat-arastirma-tutanagi'
  if (n.includes('yaklaşık maliyet') || n.includes('yaklasik maliyet')) return 'yaklasik-maliyet-cetveli'
  if (n.includes('onay belgesi') || n.includes('doğrudan temin onay') || n.includes('dogrudan temin onay')) return 'dogrudan-temin-onay-belgesi'
  if (n.includes('sipariş') || n.includes('siparis') || n.includes('sözleşmeye davet') || n.includes('sozlesmeye davet')) return 'sozlesmeye-davet'
  if (n.includes('sözleşme') || n.includes('sozlesme')) return 'dogrudan-temin-sozlesmesi'
  if (n.includes('muayene') || n.includes('kabul')) return 'muayene-kabul-tutanagi'
  if (n.includes('taşınır') || n.includes('tasinir') || n.includes('kayıt yetkilisi') || n.includes('islem fisi')) return 'tasinir-kayit-yetkilisi-gorusu'
  if (n.includes('ödeme') || n.includes('odeme')) return 'odeme-yazisi'
  if (n.includes('lüzum') || n.includes('luzum')) return 'luzum-muzekkeresi'
  if (n.includes('harcama talimat')) return 'harcama-talimati'
  if (n.includes('harcama pusula')) return 'harcama-pusulasi'
  if (n.includes('fiyat araştırma mektubu') || n.includes('teklif mektubu')) return 'birim-fiyat-teklif-mektubu'
  return n.replace(/\s+/g, '-')
}

