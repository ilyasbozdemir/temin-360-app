/**
 * TEMİN 360 - E-POSTA VE TAKVİM ENTEGRASYON YARDIMCILARI
 *
 * 1. iCalendar (.ics) Dosyası Üretici (Outlook, Google Calendar, Apple Calendar)
 * 2. Google Calendar Hızlı Web Linki Üretici
 * 3. Fiyat Teklifi İsteme ve Tebligat E-posta Şablonu Oluşturucu (mailto: ve zengin HTML)
 */

export interface TakvimEtkinligi {
  baslik: string
  aciklama?: string
  konum?: string
  baslangicTarihi: Date | string
  bitisTarihi?: Date | string
  dosyaNo?: string
  hatirlaticiDakika?: number // Örn: 1440 (1 gün önce)
}

/**
 * iCalendar (.ics) formatında metin içeriği üretir.
 * Bu dosya indirildiğinde Outlook, Mac Calendar veya cep telefonlarında doğrudan takvime eklenir.
 */
export function uretICalendarDosyasi(etkinlik: TakvimEtkinligi): string {
  const dStart = new Date(etkinlik.baslangicTarihi)
  const dEnd = etkinlik.bitisTarihi
    ? new Date(etkinlik.bitisTarihi)
    : new Date(dStart.getTime() + 60 * 60 * 1000)

  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const now = formatICSDate(new Date())
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@temin360.local`

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Temin 360//Ihale ve Sure Yonetim Sistemi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatICSDate(dStart)}`,
    `DTEND:${formatICSDate(dEnd)}`,
    `SUMMARY:${etkinlik.baslik}${etkinlik.dosyaNo ? ` [Dosya: ${etkinlik.dosyaNo}]` : ''}`,
    `DESCRIPTION:${(etkinlik.aciklama || '').replace(/\n/g, '\\n')}`,
    etkinlik.konum ? `LOCATION:${etkinlik.konum}` : '',
    'STATUS:CONFIRMED',
    etkinlik.hatirlaticiDakika
      ? [
          'BEGIN:VALARM',
          `TRIGGER:-PT${etkinlik.hatirlaticiDakika}M`,
          'ACTION:DISPLAY',
          `DESCRIPTION:${etkinlik.baslik}`,
          'END:VALARM'
        ].join('\r\n')
      : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean)

  return icsLines.join('\r\n')
}

/**
 * .ics dosyasını tarayıcıda / masaüstünde dosya olarak indirir.
 */
export function indirICalendarDosyasi(
  etkinlik: TakvimEtkinligi,
  dosyaAdi: string = 'ihale_etkinlik.ics'
): void {
  const icsContent = uretICalendarDosyasi(etkinlik)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.setAttribute('download', dosyaAdi)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Google Calendar için doğrudan "Takvime Ekle" web URL'i üretir.
 */
export function uretGoogleCalendarUrl(etkinlik: TakvimEtkinligi): string {
  const dStart = new Date(etkinlik.baslangicTarihi)
  const dEnd = etkinlik.bitisTarihi
    ? new Date(etkinlik.bitisTarihi)
    : new Date(dStart.getTime() + 60 * 60 * 1000)

  const formatGDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const title = encodeURIComponent(
    `${etkinlik.baslik}${etkinlik.dosyaNo ? ` [${etkinlik.dosyaNo}]` : ''}`
  )
  const details = encodeURIComponent(etkinlik.aciklama || '')
  const location = encodeURIComponent(etkinlik.konum || '')
  const dates = `${formatGDate(dStart)}/${formatGDate(dEnd)}`

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`
}

/**
 * FİYAT TEKLİF İSTEME VE TEBLİGAT E-POSTA ŞABLONU OLUŞTURUCU
 */
export interface TeklifIstemeEpostaInput {
  aliciFirmaAdi: string
  aliciEposta?: string
  dosyaNo: string
  isBasligi: string
  sonTeklifTarihi: string | Date
  kurumAdi: string
  birimAdi: string
  yetkiliAdSoyad?: string
  yetkiliUnvan?: string
  iletisimTelefon?: string
}

export function uretFiyatTeklifEpostasi(input: TeklifIstemeEpostaInput): {
  mailtoUrl: string
  konu: string
  icerikMetin: string
  icerikHtml: string
} {
  const formatTarih = (d: string | Date) =>
    new Date(d).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  const konu = `${input.kurumAdi} - Fiyat Teklifi İsteme [Dosya No: ${input.dosyaNo}]`

  const icerikMetin = `Sayın ${input.aliciFirmaAdi} Yetkilisi,

Kurumumuz ${input.birimAdi} tarafından 4734 sayılı Kamu İhale Kanunu kapsamında gerçekleştirilecek olan "${input.isBasligi}" işine ilişkin birim fiyat teklif mektubu ve teknik şartname ekte yer almaktadır.

Fiyat teklifinizi en geç ${formatTarih(input.sonTeklifTarihi)} tarihine kadar kaşeli ve imzalı olarak bu e-posta adresine veya birimimize iletmenizi rica ederiz.

Saygılarımızla,

${input.kurumAdi}
${input.birimAdi}
${input.yetkiliAdSoyad ? `${input.yetkiliAdSoyad} (${input.yetkiliUnvan || ''})` : ''}
${input.iletisimTelefon ? `İletişim: ${input.iletisimTelefon}` : ''}`

  const icerikHtml = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <p>Sayın <b>${input.aliciFirmaAdi}</b> Yetkilisi,</p>
  <p>Kurumumuz <b>${input.birimAdi}</b> tarafından 4734 sayılı Kamu İhale Kanunu kapsamında gerçekleştirilecek olan <b>&quot;${input.isBasligi}&quot;</b> işine ilişkin birim fiyat teklif mektubu ve teknik şartname ekte yer almaktadır.</p>
  <div style="background-color: #f0f7ff; border-left: 4px solid #0066cc; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
    <strong>Son Teklif Verme Tarihi ve Saati:</strong> ${formatTarih(input.sonTeklifTarihi)}
  </div>
  <p>Fiyat teklifinizi belirtilen tarihe kadar kaşeli ve imzalı olarak bu e-posta adresine veya birimimize iletmenizi rica ederiz.</p>
  <br/>
  <p>Saygılarımızla,<br/>
  <b>${input.kurumAdi}</b><br/>
  ${input.birimAdi}<br/>
  ${input.yetkiliAdSoyad ? `<i>${input.yetkiliAdSoyad} - ${input.yetkiliUnvan || ''}</i><br/>` : ''}
  ${input.iletisimTelefon ? `<small>Tel: ${input.iletisimTelefon}</small>` : ''}
  </p>
</div>`

  const mailtoUrl = `mailto:${input.aliciEposta || ''}?subject=${encodeURIComponent(konu)}&body=${encodeURIComponent(icerikMetin)}`

  return {
    mailtoUrl,
    konu,
    icerikMetin,
    icerikHtml
  }
}
