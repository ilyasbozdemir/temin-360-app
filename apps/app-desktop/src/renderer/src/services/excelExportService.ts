import ExcelJS from 'exceljs'
import { formatDosyaNo } from '../utils/formatDosyaNo'
import { buildExportFileName } from '../utils/exportFileName'

export interface MasterExcelExportData {
  dosya: any
  kalemler: any[]
  firmalar?: any[]
  teklifler?: any[]
  komisyon?: any[]
  kurum?: any
  sablons?: any[]
}

/**
 * 2026 Yılı KİK Doğrudan Temin (22/d) Parasal Eşik Değer Sabiti
 */
export const KIK_2026_ESIK_DEGER_TL = 1021827.0

/**
 * Generates and downloads an official, multi-sheet Doğrudan Temin Master Excel Workbook
 * formatted in official Turkish State Bureaucracy style (Times New Roman, subtle elegant grays,
 * sharp borders, live Excel formulas, and printable A4 document sheets with signature boxes).
 */
export async function exportDogrudanTeminMasterExcel(data: MasterExcelExportData): Promise<void> {
  const {
    dosya,
    kalemler = [],
    firmalar = [],
    teklifler = [],
    komisyon = [],
    kurum,
    sablons = []
  } = data

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'TEMİN 360 - Kamu Alımları ve Doğrudan Temin Sistemi'
  workbook.lastModifiedBy = 'TEMİN 360'
  workbook.created = new Date()
  workbook.modified = new Date()

  // -------------------------------------------------------------------------
  // RESMİ KURUMSAL TİPOGRAFİ VE STİL SABİTLERİ (Times New Roman & Resmi Tonlar)
  // -------------------------------------------------------------------------
  const FONT_FAMILY = 'Times New Roman'

  // Başlık ve Vurgu Dolguları (Resmi, Sade, Renksiz / Açık Gri Standart)
  const headerFillOfficial: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' } // Sade Kurumsal Açık Gri (Yazıcı Dostu & Resmi)
  }

  const subHeaderFillOfficial: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' } // Çok Açık Resmi Gri
  }

  const softGrayFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF9FAFB' } // Açık Soft Zemin Grisi
  }

  const zebraFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' } // Sade Düz Beyaz
  }

  const softHighlightFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' } // Vurgulu Satır Grisi
  }

  // Kenarlıklar (Resmi Çizgili & Net)
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    right: { style: 'thin', color: { argb: 'FF9CA3AF' } }
  }

  const doubleBottomBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF4B5563' } },
    left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    bottom: { style: 'double', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF9CA3AF' } }
  }

  const boxBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'medium', color: { argb: 'FF374151' } },
    left: { style: 'medium', color: { argb: 'FF374151' } },
    bottom: { style: 'medium', color: { argb: 'FF374151' } },
    right: { style: 'medium', color: { argb: 'FF374151' } }
  }

  const dosyaNoStr = formatDosyaNo(dosya)
  const kurumAdi = (kurum?.ad || kurum?.kurum_adi || 'T.C. KAMU İDARESİ').toUpperCase()
  const birimAdi = (
    dosya?.birim_adi ||
    dosya?.harcama_birimi ||
    kurum?.birim_adi ||
    'Satınalma / Destek Hizmetleri Birimi'
  ).toUpperCase()
  const dosyaKonusu = dosya?.konu || dosya?.isin_adi || 'Doğrudan Temin Alım İşi'
  const ihaleSekli = dosya?.ihale_sekli || '4734 Sayılı KİK Madde 22/d (Doğrudan Temin)'
  const turLabel =
    dosya?.tur === 'yapim_isi' || dosya?.tur === 'yapim'
      ? 'Yapım İşi / Onarım'
      : dosya?.tur === 'hizmet'
        ? 'Hizmet Alımı'
        : 'Mal Alımı'

  // Tevkifat orani belirleme
  const isYapim = dosya?.tur === 'yapim_isi' || dosya?.tur === 'yapim'
  const isHizmet = dosya?.tur === 'hizmet'
  const tevkifatOraniText = isYapim ? '4/10' : isHizmet ? '7/10' : '0 (Tevkifatsız)'
  const tevkifatCarpani = isYapim ? 0.4 : isHizmet ? 0.7 : 0.0

  const effectiveFirms =
    firmalar.length > 0
      ? firmalar
      : [
          { id: 1, unvan: '1. İstekli Firma', vergi_no: '1234567890' },
          { id: 2, unvan: '2. İstekli Firma', vergi_no: '2345678901' },
          { id: 3, unvan: '3. İstekli Firma', vergi_no: '3456789012' }
        ]

  const kalemCount = kalemler.length > 0 ? kalemler.length : 1
  const kalemlerSheetName = 'Kalemler & Maliyet'
  const kalemEndRow = 4 + kalemCount
  const kalemTotalRow = kalemEndRow + 1

  // =========================================================================
  // SAYFA 1: SÜREÇ TAKİBİ & GENEL BÜTÇE KONTROLÜ
  // =========================================================================
  const wsDash = workbook.addWorksheet('Süreç Takibi & Özet', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
      showGridLines: true
    },
    views: [{ showGridLines: true }]
  })

  wsDash.columns = [
    { width: 4 }, // A
    { width: 30 }, // B
    { width: 38 }, // C
    { width: 24 }, // D
    { width: 28 }, // E
    { width: 24 }, // F
    { width: 4 } // G
  ]

  // Header Banner
  wsDash.mergeCells('B2:F2')
  const titleCell = wsDash.getCell('B2')
  titleCell.value = `${kurumAdi} - ${birimAdi}`
  titleCell.font = { name: FONT_FAMILY, size: 13, bold: true, color: { argb: 'FF000000' } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  titleCell.fill = headerFillOfficial

  wsDash.mergeCells('B3:F3')
  const subTitleCell = wsDash.getCell('B3')
  subTitleCell.value = `4734 SAYILI KAMU İHALE KANUNU DOĞRUDAN TEMİN DOSYA EXCEL RAPORU`
  subTitleCell.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FF374151' } }
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  subTitleCell.fill = subHeaderFillOfficial

  wsDash.getRow(2).height = 26
  wsDash.getRow(3).height = 20

  // 1. Dosya Kimlik Kartı
  wsDash.mergeCells('B5:F5')
  const infoHeader = wsDash.getCell('B5')
  infoHeader.value = '1. DOSYA VE DOĞRUDAN TEMİN GENEL BİLGİLERİ'
  infoHeader.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: 'FF000000' } }
  infoHeader.fill = subHeaderFillOfficial
  infoHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(5).height = 24

  const infoRows = [
    ['Temin / Dosya No:', dosyaNoStr, 'Alım / İhale Türü:', turLabel],
    [
      'Yasal Dayanak / Madde:',
      ihaleSekli,
      'Bütçe Yılı & Kod:',
      `${dosya?.butce_yili || '2026'} / ${dosya?.butce_kodu || dosya?.ekonomik_kod || '03.2'}`
    ],
    [
      'Dosya / İşin Konusu:',
      dosyaKonusu,
      'Sözleşme / Teklif Türü:',
      dosya?.teklif_sozlesme_turu || 'Birim Fiyat Teklif Cetveli'
    ],
    [
      'Talep Eden Birim:',
      birimAdi,
      'Dosya Açılış Tarihi:',
      dosya?.tarih || dosya?.dosya_acilis_tarihi || new Date().toLocaleDateString('tr-TR')
    ],
    [
      'Süreç / Aşama Durumu:',
      dosya?.status || 'Aktif / İşlemde',
      'Toplam Kalem Sayısı:',
      `${kalemler.length} Kalem`
    ]
  ]

  let curRow = 6
  for (const r of infoRows) {
    wsDash.getRow(curRow).height = 21
    wsDash.getCell(`B${curRow}`).value = r[0]
    wsDash.getCell(`B${curRow}`).font = {
      name: FONT_FAMILY,
      size: 10,
      bold: true,
      color: { argb: 'FF1F2937' }
    }
    wsDash.getCell(`B${curRow}`).fill = softGrayFill
    wsDash.getCell(`B${curRow}`).border = thinBorder

    wsDash.getCell(`C${curRow}`).value = r[1]
    wsDash.getCell(`C${curRow}`).font = {
      name: FONT_FAMILY,
      size: 10,
      bold: r[0].includes('No') || r[0].includes('Konu')
    }
    wsDash.getCell(`C${curRow}`).border = thinBorder

    wsDash.getCell(`D${curRow}`).value = r[2]
    wsDash.getCell(`D${curRow}`).font = {
      name: FONT_FAMILY,
      size: 10,
      bold: true,
      color: { argb: 'FF1F2937' }
    }
    wsDash.getCell(`D${curRow}`).fill = softGrayFill
    wsDash.getCell(`D${curRow}`).border = thinBorder

    wsDash.mergeCells(`E${curRow}:F${curRow}`)
    wsDash.getCell(`E${curRow}`).value = r[3]
    wsDash.getCell(`E${curRow}`).font = {
      name: FONT_FAMILY,
      size: 10,
      bold: r[2].includes('Kalem') || r[2].includes('Türü')
    }
    wsDash.getCell(`E${curRow}`).border = thinBorder
    wsDash.getCell(`F${curRow}`).border = thinBorder
    curRow++
  }

  // 2. 2026 Yılı KİK Eşik Değer & Bütçe Limit Kontrolü
  curRow += 1
  wsDash.mergeCells(`B${curRow}:F${curRow}`)
  const esikHeader = wsDash.getCell(`B${curRow}`)
  esikHeader.value = '2. 2026 YILI KİK BÜTÇE LİMİTİ VE EŞİK DEĞER KONTROLÜ (Md. 22/d)'
  esikHeader.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: 'FF000000' } }
  esikHeader.fill = subHeaderFillOfficial
  esikHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(curRow).height = 24

  curRow++
  const esikValRow = curRow
  wsDash.getRow(curRow).height = 22
  wsDash.getCell(`B${curRow}`).value = '2026 Yılı KİK Md. 22/d Parasal Sınırı:'
  wsDash.getCell(`B${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`B${curRow}`).fill = softGrayFill
  wsDash.getCell(`B${curRow}`).border = thinBorder

  wsDash.getCell(`C${curRow}`).value = KIK_2026_ESIK_DEGER_TL
  wsDash.getCell(`C${curRow}`).numFmt = '#,##0.00 "₺"'
  wsDash.getCell(`C${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`C${curRow}`).border = thinBorder

  wsDash.getCell(`D${curRow}`).value = 'Dosya Yaklaşık Maliyet Toplamı:'
  wsDash.getCell(`D${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`D${curRow}`).fill = softGrayFill
  wsDash.getCell(`D${curRow}`).border = thinBorder

  wsDash.mergeCells(`E${curRow}:F${curRow}`)
  wsDash.getCell(`E${curRow}`).value = { formula: `'${kalemlerSheetName}'!J${kalemTotalRow}` }
  wsDash.getCell(`E${curRow}`).numFmt = '#,##0.00 "₺"'
  wsDash.getCell(`E${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`E${curRow}`).border = thinBorder
  wsDash.getCell(`F${curRow}`).border = thinBorder
  curRow++

  // Kalan Limit & Kullanım Oranı
  wsDash.getRow(curRow).height = 22
  wsDash.getCell(`B${curRow}`).value = 'Kalan Eşik Değer Limiti:'
  wsDash.getCell(`B${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`B${curRow}`).fill = softGrayFill
  wsDash.getCell(`B${curRow}`).border = thinBorder

  wsDash.getCell(`C${curRow}`).value = { formula: `MAX(0, C${esikValRow} - E${esikValRow})` }
  wsDash.getCell(`C${curRow}`).numFmt = '#,##0.00 "₺"'
  wsDash.getCell(`C${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`C${curRow}`).border = thinBorder

  wsDash.getCell(`D${curRow}`).value = 'Eşik Değer Kullanım Oranı (%):'
  wsDash.getCell(`D${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`D${curRow}`).fill = softGrayFill
  wsDash.getCell(`D${curRow}`).border = thinBorder

  wsDash.mergeCells(`E${curRow}:F${curRow}`)
  wsDash.getCell(`E${curRow}`).value = { formula: `E${esikValRow}/C${esikValRow}` }
  wsDash.getCell(`E${curRow}`).numFmt = '0.00%'
  wsDash.getCell(`E${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`E${curRow}`).border = thinBorder
  wsDash.getCell(`F${curRow}`).border = thinBorder
  curRow++

  // Mevzuat Uygunluk Durumu
  wsDash.getRow(curRow).height = 22
  wsDash.getCell(`B${curRow}`).value = 'Mevzuat Uygunluk Durumu:'
  wsDash.getCell(`B${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`B${curRow}`).fill = softGrayFill
  wsDash.getCell(`B${curRow}`).border = thinBorder

  wsDash.getCell(`C${curRow}`).value = {
    formula: `IF(E${esikValRow}<=C${esikValRow}, "Eşik Değer Altında (Doğrudan Temin Usulü Uygundur)", "Eşik Değer Aşımı (İhale Usulü Gereklidir)")`
  }
  wsDash.getCell(`C${curRow}`).font = { name: FONT_FAMILY, size: 9, bold: true }
  wsDash.getCell(`C${curRow}`).border = thinBorder

  wsDash.getCell(`D${curRow}`).value = 'Tevkifat Uygulama Durumu:'
  wsDash.getCell(`D${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`D${curRow}`).fill = softGrayFill
  wsDash.getCell(`D${curRow}`).border = thinBorder

  wsDash.mergeCells(`E${curRow}:F${curRow}`)
  wsDash.getCell(`E${curRow}`).value = `KDV Tevkifatı: ${tevkifatOraniText}`
  wsDash.getCell(`E${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`E${curRow}`).border = thinBorder
  wsDash.getCell(`F${curRow}`).border = thinBorder
  curRow++

  // 3. Finansal Göstergeler & KDV Tevkifat Matrisi
  curRow += 1
  wsDash.mergeCells(`B${curRow}:F${curRow}`)
  const finHeader = wsDash.getCell(`B${curRow}`)
  finHeader.value = '3. FİNANSAL GÖSTERGELER VE KDV TEVKİFAT MATRİSİ (CANLI FORMÜLLÜ)'
  finHeader.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: 'FF000000' } }
  finHeader.fill = subHeaderFillOfficial
  finHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(curRow).height = 24

  curRow++
  const finStartRow = curRow

  wsDash.getRow(curRow).height = 22
  wsDash.getCell(`B${curRow}`).value = 'Yaklaşık Maliyet (KDV Hariç):'
  wsDash.getCell(`B${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`B${curRow}`).fill = softGrayFill
  wsDash.getCell(`B${curRow}`).border = thinBorder

  wsDash.getCell(`C${curRow}`).value = { formula: `'${kalemlerSheetName}'!J${kalemTotalRow}` }
  wsDash.getCell(`C${curRow}`).numFmt = '#,##0.00 "₺"'
  wsDash.getCell(`C${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`C${curRow}`).border = thinBorder

  wsDash.getCell(`D${curRow}`).value = 'Hesaplanan KDV Tutarı (%20):'
  wsDash.getCell(`D${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`D${curRow}`).fill = softGrayFill
  wsDash.getCell(`D${curRow}`).border = thinBorder

  wsDash.mergeCells(`E${curRow}:F${curRow}`)
  wsDash.getCell(`E${curRow}`).value = { formula: `C${finStartRow} * 0.20` }
  wsDash.getCell(`E${curRow}`).numFmt = '#,##0.00 "₺"'
  wsDash.getCell(`E${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`E${curRow}`).border = thinBorder
  wsDash.getCell(`F${curRow}`).border = thinBorder
  curRow++

  // Tevkifat Oranı & Kesilecek Tevkifat
  wsDash.getRow(curRow).height = 22
  wsDash.getCell(`B${curRow}`).value = 'Tevkifat Oranı:'
  wsDash.getCell(`B${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`B${curRow}`).fill = softGrayFill
  wsDash.getCell(`B${curRow}`).border = thinBorder

  wsDash.getCell(`C${curRow}`).value = tevkifatOraniText
  wsDash.getCell(`C${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`C${curRow}`).border = thinBorder

  wsDash.getCell(`D${curRow}`).value = 'Kesilecek Tevkifat Tutarı:'
  wsDash.getCell(`D${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`D${curRow}`).fill = softGrayFill
  wsDash.getCell(`D${curRow}`).border = thinBorder

  wsDash.mergeCells(`E${curRow}:F${curRow}`)
  wsDash.getCell(`E${curRow}`).value = { formula: `E${finStartRow} * ${tevkifatCarpani}` }
  wsDash.getCell(`E${curRow}`).numFmt = '#,##0.00 "₺"'
  wsDash.getCell(`E${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`E${curRow}`).border = thinBorder
  wsDash.getCell(`F${curRow}`).border = thinBorder
  curRow++

  // KDV Dahil Toplam & Net Ödenecek
  wsDash.getRow(curRow).height = 22
  wsDash.getCell(`B${curRow}`).value = 'KDV Dahil Toplam Tutar:'
  wsDash.getCell(`B${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`B${curRow}`).fill = softGrayFill
  wsDash.getCell(`B${curRow}`).border = thinBorder

  wsDash.getCell(`C${curRow}`).value = { formula: `C${finStartRow} + E${finStartRow}` }
  wsDash.getCell(`C${curRow}`).numFmt = '#,##0.00 "₺"'
  wsDash.getCell(`C${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`C${curRow}`).border = thinBorder

  wsDash.getCell(`D${curRow}`).value = 'Yükleniciye Ödenecek Net Tutar:'
  wsDash.getCell(`D${curRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsDash.getCell(`D${curRow}`).fill = softGrayFill
  wsDash.getCell(`D${curRow}`).border = thinBorder

  wsDash.mergeCells(`E${curRow}:F${curRow}`)
  wsDash.getCell(`E${curRow}`).value = { formula: `C${curRow} - E${curRow - 1}` }
  wsDash.getCell(`E${curRow}`).numFmt = '#,##0.00 "₺"'
  wsDash.getCell(`E${curRow}`).font = { name: FONT_FAMILY, size: 11, bold: true }
  wsDash.getCell(`E${curRow}`).border = thinBorder
  wsDash.getCell(`F${curRow}`).border = thinBorder
  curRow++

  // 4. Doğrudan Temin Süreç Adımları
  curRow += 1
  wsDash.mergeCells(`B${curRow}:F${curRow}`)
  const stHeader = wsDash.getCell(`B${curRow}`)
  stHeader.value = '4. DOĞRUDAN TEMİN MEVZUAT SÜREÇ ADIMLARI VE İLERLEME DURUMU'
  stHeader.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: 'FF000000' } }
  stHeader.fill = subHeaderFillOfficial
  stHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(curRow).height = 24

  curRow++
  const procCols = [
    'Adım',
    'Süreç Aşaması',
    'Mevzuat Dayanağı',
    'Üretilen Belgeler / Çıktılar',
    'Durum'
  ]
  const procColCells = ['B', 'C', 'D', 'E', 'F']
  wsDash.getRow(curRow).height = 22
  procCols.forEach((pc, i) => {
    const c = wsDash.getCell(`${procColCells[i]}${curRow}`)
    c.value = pc
    c.font = { name: FONT_FAMILY, size: 10, bold: true }
    c.fill = softHighlightFill
    c.border = thinBorder
    c.alignment = { vertical: 'middle', horizontal: i === 0 ? 'center' : 'left' }
  })

  const processSteps = [
    [
      '1',
      'İhtiyaç Tespiti & Lüzum',
      '4734 Sayılı KİK Md. 22',
      'İhtiyaç Listesi, Lüzum Müzekkeresi, Talep Formu',
      'Tamamlandı'
    ],
    [
      '2',
      'Harcama Yetkilisi Onayı',
      'KİK Md. 22 & Tebliğ',
      'Doğrudan Temin Onay Belgesi, Harcama Talimatı',
      'Tamamlandı'
    ],
    [
      '3',
      'Piyasa Fiyat Araştırması',
      'KİK Md. 22/d',
      'Görevlendirme Oluru, Teklif İsteme Mektubu',
      'Tamamlandı'
    ],
    [
      '4',
      'Yaklaşık Maliyet & Fiyat Tespiti',
      'KİK Tebliği Md. 22',
      'Piyasa Fiyat Araştırma Tutanağı, Fiyat Karşılaştırma',
      'Tamamlandı'
    ],
    [
      '5',
      'Sipariş / Sözleşme İşlemleri',
      '4734 / Borçlar Kanunu',
      'Sözleşme Tasarısı, Sipariş Mektubu, Taahhütname',
      'Tamamlandı'
    ],
    [
      '6',
      'Muayene Kabul & Ödeme',
      'Muayene ve Kabul Yön.',
      'Muayene ve Kabul Tutanağı, Taşınır İşlem Fişi',
      'İşlemde / Hazır'
    ]
  ]

  for (const step of processSteps) {
    curRow++
    wsDash.getRow(curRow).height = 22
    step.forEach((val, i) => {
      const c = wsDash.getCell(`${procColCells[i]}${curRow}`)
      c.value = val
      c.font = { name: FONT_FAMILY, size: 10, bold: i === 0 || i === 4 }
      c.border = thinBorder
      c.alignment = { vertical: 'middle', horizontal: i === 0 ? 'center' : 'left' }
    })
  }

  // =========================================================================
  // SAYFA 2: KALEMLER & MALİYET CETVELİ (MASTER VERİ TABLOSU)
  // =========================================================================
  const wsKalem = workbook.addWorksheet(kalemlerSheetName, {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
      showGridLines: true
    },
    views: [{ state: 'frozen', ySplit: 4, showGridLines: true }]
  })

  wsKalem.columns = [
    { width: 6 }, // A: Sıra No
    { width: 14 }, // B: Tür
    { width: 22 }, // C: Taşınır / Poz No
    { width: 16 }, // D: OKAS Kodu
    { width: 44 }, // E: Kalem / İmalat Tanımı
    { width: 12 }, // F: Birim
    { width: 14 }, // G: Miktar
    { width: 12 }, // H: KDV (%)
    { width: 20 }, // I: Yaklaşık Birim (₺)
    { width: 24 }, // J: Toplam Tutar (₺)
    { width: 35 } // K: Açıklama / Teknik Özellik
  ]

  // Sheet Title
  wsKalem.mergeCells('A1:K1')
  const kTitle = wsKalem.getCell('A1')
  kTitle.value = `${dosyaNoStr} - İHTİYAÇ, MALZEME VE İMALAT LİSTESİ CETVELİ`
  kTitle.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: 'FF000000' } }
  kTitle.fill = headerFillOfficial
  kTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsKalem.getRow(1).height = 26

  wsKalem.mergeCells('A2:K2')
  const kSub = wsKalem.getCell('A2')
  kSub.value = `İşin Adı: ${dosyaKonusu} | Alım Türü: ${turLabel} | İdare: ${kurumAdi}`
  kSub.font = { name: FONT_FAMILY, size: 10, color: { argb: 'FF374151' } }
  kSub.fill = subHeaderFillOfficial
  kSub.alignment = { vertical: 'middle', horizontal: 'center' }
  wsKalem.getRow(2).height = 20

  // Column Headers
  const kalemHeaders = [
    'Sıra',
    'Tür',
    'Taşınır Kod / Poz No',
    'OKAS Kodu',
    'Kalem / İş / İmalat Tanımı',
    'Birim',
    'Miktar',
    'KDV (%)',
    'Yaklaşık Birim (₺)',
    'Toplam Tutar (₺)',
    'Açıklama / Teknik Özellik'
  ]
  const kHeaderRow = wsKalem.getRow(4)
  kHeaderRow.height = 24
  kalemHeaders.forEach((h, idx) => {
    const c = kHeaderRow.getCell(idx + 1)
    c.value = h
    c.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FF000000' } }
    c.fill = subHeaderFillOfficial
    c.border = thinBorder
    c.alignment = {
      vertical: 'middle',
      horizontal: ['Sıra', 'Tür', 'Birim', 'Miktar', 'KDV (%)', 'OKAS Kodu'].includes(h)
        ? 'center'
        : ['Yaklaşık Birim (₺)', 'Toplam Tutar (₺)'].includes(h)
          ? 'right'
          : 'left'
    }
  })

  let kRowIdx = 5
  kalemler.forEach((k, idx) => {
    const row = wsKalem.getRow(kRowIdx)
    row.height = 22
    const isZebra = idx % 2 === 1

    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(2).value =
      k.tipi ||
      (dosya?.tur === 'yapim_isi' || dosya?.tur === 'yapim'
        ? 'Yapım'
        : dosya?.tur === 'hizmet'
          ? 'Hizmet'
          : 'Mal')
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(3).value = k.tasinir_kodu || k.poz_no || '-'
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' }

    row.getCell(4).value = k.okas_kodu || '-'
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(5).value = k.kalem_adi || k.adi || ''
    row.getCell(5).font = { name: FONT_FAMILY, size: 10, bold: true }

    row.getCell(6).value = k.birim || 'Adet'
    row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(7).value = Number(k.miktar || 0)
    row.getCell(7).numFmt = '#,##0.00'
    row.getCell(7).alignment = { vertical: 'middle', horizontal: 'right' }

    row.getCell(8).value = Number(k.kdv_orani ?? 20) / 100
    row.getCell(8).numFmt = '0%'
    row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' }

    const birimFiyat = Number(k.yaklasik_maliyet || k.birim_fiyat || 0)
    row.getCell(9).value = birimFiyat
    row.getCell(9).numFmt = '#,##0.00 "₺"'
    row.getCell(9).alignment = { vertical: 'middle', horizontal: 'right' }

    // Formula for Total = Miktar * Birim Fiyat (Column G * Column I)
    row.getCell(10).value = {
      formula: `G${kRowIdx}*I${kRowIdx}`,
      result: Number(k.miktar || 0) * birimFiyat
    }
    row.getCell(10).numFmt = '#,##0.00 "₺"'
    row.getCell(10).font = { name: FONT_FAMILY, size: 10, bold: true }
    row.getCell(10).alignment = { vertical: 'middle', horizontal: 'right' }

    row.getCell(11).value = k.aciklama || ''

    for (let c = 1; c <= 11; c++) {
      const cell = row.getCell(c)
      cell.font = cell.font || { name: FONT_FAMILY, size: 10 }
      cell.border = thinBorder
      if (isZebra) cell.fill = zebraFill
    }

    kRowIdx++
  })

  // Summary Row for Kalemler
  const kTotRow = wsKalem.getRow(kalemTotalRow)
  kTotRow.height = 26
  wsKalem.mergeCells(`A${kalemTotalRow}:I${kalemTotalRow}`)
  const totLabel = wsKalem.getCell(`A${kalemTotalRow}`)
  totLabel.value = 'GENEL YAKLAŞIK MALİYET TOPLAMI (KDV HARİÇ):'
  totLabel.font = { name: FONT_FAMILY, size: 10, bold: true }
  totLabel.alignment = { vertical: 'middle', horizontal: 'right' }
  totLabel.fill = softHighlightFill

  const totFormula = wsKalem.getCell(`J${kalemTotalRow}`)
  totFormula.value = {
    formula: `SUM(J5:J${kalemTotalRow - 1})`
  }
  totFormula.numFmt = '#,##0.00 "₺"'
  totFormula.font = { name: FONT_FAMILY, size: 11, bold: true }
  totFormula.fill = softHighlightFill
  totFormula.alignment = { vertical: 'middle', horizontal: 'right' }

  for (let c = 1; c <= 11; c++) {
    wsKalem.getCell(kalemTotalRow, c).border = doubleBottomBorder
  }

  // =========================================================================
  // SAYFA 3: TEKLİFLER & PİYASA FİYAT ARAŞTIRMASI MATRİSİ
  // =========================================================================
  const wsTeklif = workbook.addWorksheet('Teklifler & Piyasa', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
      showGridLines: true
    },
    views: [{ state: 'frozen', ySplit: 4, showGridLines: true }]
  })

  const tColDefs: Partial<ExcelJS.Column>[] = [
    { width: 6 }, // A: Sıra
    { width: 38 }, // B: Kalem
    { width: 10 }, // C: Birim
    { width: 12 } // D: Miktar
  ]

  effectiveFirms.forEach(() => {
    tColDefs.push({ width: 18 }) // Birim
    tColDefs.push({ width: 20 }) // Toplam
  })

  tColDefs.push({ width: 20 }) // En Uygun Birim
  tColDefs.push({ width: 22 }) // En Uygun Toplam

  wsTeklif.columns = tColDefs

  const totalColsCount = 4 + effectiveFirms.length * 2 + 2
  const lastColLetter = getColumnLetter(totalColsCount)

  wsTeklif.mergeCells(`A1:${lastColLetter}1`)
  const tTitle = wsTeklif.getCell('A1')
  tTitle.value = `${dosyaNoStr} - PİYASA FİYAT ARAŞTIRMASI VE TEKLİF KARŞILAŞTIRMA CETVELİ`
  tTitle.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: 'FF000000' } }
  tTitle.fill = headerFillOfficial
  tTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsTeklif.getRow(1).height = 26

  wsTeklif.mergeCells(`A2:${lastColLetter}2`)
  const tSub = wsTeklif.getCell('A2')
  tSub.value = `4734 Sayılı Kanun Madde 22/d Uyarınca Alınan Birim Fiyat Teklifleri ve En Avantajlı Fiyat Tespiti (${effectiveFirms.length} İstekli)`
  tSub.font = { name: FONT_FAMILY, size: 10, color: { argb: 'FF374151' } }
  tSub.fill = subHeaderFillOfficial
  tSub.alignment = { vertical: 'middle', horizontal: 'center' }
  wsTeklif.getRow(2).height = 20

  // Header row 4
  const tHeaderRow = wsTeklif.getRow(4)
  tHeaderRow.height = 26
  const tHeaders = ['Sıra', 'İhtiyaç Kalemi / İş Tanımı', 'Birim', 'Miktar']

  effectiveFirms.forEach((f) => {
    const fName = f.unvan || f.ad || 'İstekli'
    tHeaders.push(`${fName} (Birim)`)
    tHeaders.push(`${fName} (Toplam)`)
  })

  tHeaders.push('En Uygun Birim (₺)')
  tHeaders.push('En Uygun Toplam (₺)')

  tHeaders.forEach((th, idx) => {
    const c = tHeaderRow.getCell(idx + 1)
    c.value = th
    c.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FF000000' } }
    c.fill = subHeaderFillOfficial
    c.border = thinBorder
    c.alignment = {
      vertical: 'middle',
      horizontal: ['Sıra', 'Birim', 'Miktar'].includes(th) ? 'center' : 'right'
    }
  })

  let tRowIdx = 5
  kalemler.forEach((k, idx) => {
    const row = wsTeklif.getRow(tRowIdx)
    row.height = 22
    const isZebra = idx % 2 === 1

    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // Reference to Kalemler sheet for Kalem Adı, Birim, Miktar
    row.getCell(2).value = { formula: `'${kalemlerSheetName}'!E${idx + 5}` }
    row.getCell(2).font = { name: FONT_FAMILY, size: 10, bold: true }

    row.getCell(3).value = { formula: `'${kalemlerSheetName}'!F${idx + 5}` }
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(4).value = { formula: `'${kalemlerSheetName}'!G${idx + 5}` }
    row.getCell(4).numFmt = '#,##0.00'
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' }

    const firmUnitColLetters: string[] = []
    let colCursor = 5

    effectiveFirms.forEach((f, fIdx) => {
      const unitCol = colCursor
      const totCol = colCursor + 1
      const unitColLetter = getColumnLetter(unitCol)
      firmUnitColLetters.push(unitColLetter)

      const fBid = Number(
        teklifler.find((t) => t.temin_kalem_id === k.id && t.firma_id === f.id)?.birim_fiyat ||
          (fIdx === 0 ? k.yaklasik_maliyet || 0 : (k.yaklasik_maliyet || 0) * (1 + fIdx * 0.05))
      )

      row.getCell(unitCol).value = fBid
      row.getCell(unitCol).numFmt = '#,##0.00 "₺"'
      row.getCell(totCol).value = {
        formula: `D${tRowIdx}*${unitColLetter}${tRowIdx}`
      }
      row.getCell(totCol).numFmt = '#,##0.00 "₺"'

      colCursor += 2
    })

    // Min formula for best unit price
    const minUnitCol = colCursor
    const minTotCol = colCursor + 1
    const minUnitColLetter = getColumnLetter(minUnitCol)

    const minFormulaCells = firmUnitColLetters.map((l) => `${l}${tRowIdx}`).join(',')
    row.getCell(minUnitCol).value = { formula: `MIN(${minFormulaCells})` }
    row.getCell(minUnitCol).numFmt = '#,##0.00 "₺"'
    row.getCell(minUnitCol).font = { name: FONT_FAMILY, size: 10, bold: true }

    row.getCell(minTotCol).value = {
      formula: `D${tRowIdx}*${minUnitColLetter}${tRowIdx}`
    }
    row.getCell(minTotCol).numFmt = '#,##0.00 "₺"'
    row.getCell(minTotCol).font = { name: FONT_FAMILY, size: 10, bold: true }

    for (let c = 1; c <= totalColsCount; c++) {
      const cell = row.getCell(c)
      cell.font = cell.font || { name: FONT_FAMILY, size: 10 }
      cell.border = thinBorder
      if (isZebra) cell.fill = zebraFill
    }

    tRowIdx++
  })

  // Summary Row for Teklifler
  const tTotRow = wsTeklif.getRow(tRowIdx)
  tTotRow.height = 26
  wsTeklif.mergeCells(`A${tRowIdx}:D${tRowIdx}`)
  wsTeklif.getCell(`A${tRowIdx}`).value = 'FİRMA TEKLİF TOPLAMLARI (KDV HARİÇ):'
  wsTeklif.getCell(`A${tRowIdx}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsTeklif.getCell(`A${tRowIdx}`).alignment = { vertical: 'middle', horizontal: 'right' }
  wsTeklif.getCell(`A${tRowIdx}`).fill = softHighlightFill

  let summaryCursor = 5
  effectiveFirms.forEach(() => {
    const totCol = summaryCursor + 1
    const totColLetter = getColumnLetter(totCol)
    wsTeklif.getCell(`${totColLetter}${tRowIdx}`).value = {
      formula: `SUM(${totColLetter}5:${totColLetter}${tRowIdx - 1})`
    }
    wsTeklif.getCell(`${totColLetter}${tRowIdx}`).numFmt = '#,##0.00 "₺"'
    wsTeklif.getCell(`${totColLetter}${tRowIdx}`).font = { name: FONT_FAMILY, size: 10, bold: true }
    wsTeklif.getCell(`${totColLetter}${tRowIdx}`).fill = softHighlightFill
    summaryCursor += 2
  })

  const minTotColLetter = getColumnLetter(totalColsCount)
  wsTeklif.getCell(`${minTotColLetter}${tRowIdx}`).value = {
    formula: `SUM(${minTotColLetter}5:${minTotColLetter}${tRowIdx - 1})`
  }
  wsTeklif.getCell(`${minTotColLetter}${tRowIdx}`).numFmt = '#,##0.00 "₺"'
  wsTeklif.getCell(`${minTotColLetter}${tRowIdx}`).font = {
    name: FONT_FAMILY,
    size: 11,
    bold: true
  }
  wsTeklif.getCell(`${minTotColLetter}${tRowIdx}`).fill = softHighlightFill

  for (let c = 1; c <= totalColsCount; c++) {
    wsTeklif.getCell(tRowIdx, c).border = doubleBottomBorder
  }

  // =========================================================================
  // SAYFA 4: 📑 A4 - İHTİYAÇ LİSTESİ & TALEP FORMU (RESMİ BASKIYA HAZIR)
  // =========================================================================
  const wsA4Ihtiyac = workbook.addWorksheet('A4 - İhtiyaç Listesi Formu', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
      showGridLines: true
    },
    views: [{ showGridLines: true }]
  })

  wsA4Ihtiyac.columns = [
    { width: 6 }, // A: Sıra
    { width: 20 }, // B: Kod / Poz
    { width: 38 }, // C: Malzeme / Hizmet Adı
    { width: 12 }, // D: Miktar
    { width: 12 }, // E: Birim
    { width: 22 } // F: Açıklama
  ]

  // A4 Document Header (Official Republic of Turkey Bureaucratic Style)
  wsA4Ihtiyac.mergeCells('A1:F1')
  wsA4Ihtiyac.getCell('A1').value = `T.C.`
  wsA4Ihtiyac.getCell('A1').font = { name: FONT_FAMILY, size: 12, bold: true }
  wsA4Ihtiyac.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }

  wsA4Ihtiyac.mergeCells('A2:F2')
  wsA4Ihtiyac.getCell('A2').value = kurumAdi
  wsA4Ihtiyac.getCell('A2').font = { name: FONT_FAMILY, size: 12, bold: true }
  wsA4Ihtiyac.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' }

  wsA4Ihtiyac.mergeCells('A3:F3')
  wsA4Ihtiyac.getCell('A3').value = birimAdi
  wsA4Ihtiyac.getCell('A3').font = { name: FONT_FAMILY, size: 11, bold: true }
  wsA4Ihtiyac.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' }

  wsA4Ihtiyac.mergeCells('A5:F5')
  wsA4Ihtiyac.getCell('A5').value = `İHTİYAÇ LİSTESİ VE TALEP FORMU`
  wsA4Ihtiyac.getCell('A5').font = { name: FONT_FAMILY, size: 13, bold: true, underline: true }
  wsA4Ihtiyac.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' }
  wsA4Ihtiyac.getRow(5).height = 24

  // Info Block
  wsA4Ihtiyac.getCell('A7').value = 'Dosya No:'
  wsA4Ihtiyac.getCell('A7').font = { name: FONT_FAMILY, size: 10, bold: true }
  wsA4Ihtiyac.getCell('B7').value = dosyaNoStr
  wsA4Ihtiyac.getCell('B7').font = { name: FONT_FAMILY, size: 10 }

  wsA4Ihtiyac.getCell('E7').value = 'Tarih:'
  wsA4Ihtiyac.getCell('E7').font = { name: FONT_FAMILY, size: 10, bold: true }
  wsA4Ihtiyac.getCell('F7').value = dosya?.tarih || new Date().toLocaleDateString('tr-TR')
  wsA4Ihtiyac.getCell('F7').font = { name: FONT_FAMILY, size: 10 }

  wsA4Ihtiyac.getCell('A8').value = 'İşin Konusu:'
  wsA4Ihtiyac.getCell('A8').font = { name: FONT_FAMILY, size: 10, bold: true }
  wsA4Ihtiyac.mergeCells('B8:F8')
  wsA4Ihtiyac.getCell('B8').value = dosyaKonusu
  wsA4Ihtiyac.getCell('B8').font = { name: FONT_FAMILY, size: 10 }

  // A4 Table Header
  const a4Headers = [
    'Sıra No',
    'Taşınır / Poz No',
    'Malzeme / Hizmet / İmalat Tanımı',
    'Miktar',
    'Birim',
    'Açıklama'
  ]
  const a4HeaderRow = wsA4Ihtiyac.getRow(10)
  a4HeaderRow.height = 22
  a4Headers.forEach((ah, idx) => {
    const c = a4HeaderRow.getCell(idx + 1)
    c.value = ah
    c.font = { name: FONT_FAMILY, size: 10, bold: true }
    c.fill = softGrayFill
    c.border = thinBorder
    c.alignment = {
      vertical: 'middle',
      horizontal: idx === 0 || idx === 3 || idx === 4 ? 'center' : 'left'
    }
  })

  let a4RowIdx = 11
  kalemler.forEach((_, idx) => {
    const row = wsA4Ihtiyac.getRow(a4RowIdx)
    row.height = 20

    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // Live reference to Kalemler Sheet
    row.getCell(2).value = { formula: `'${kalemlerSheetName}'!C${idx + 5}` }
    row.getCell(3).value = { formula: `'${kalemlerSheetName}'!E${idx + 5}` }
    row.getCell(4).value = { formula: `'${kalemlerSheetName}'!G${idx + 5}` }
    row.getCell(4).numFmt = '#,##0.00'
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' }

    row.getCell(5).value = { formula: `'${kalemlerSheetName}'!F${idx + 5}` }
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(6).value = { formula: `'${kalemlerSheetName}'!K${idx + 5}` }

    for (let c = 1; c <= 6; c++) {
      row.getCell(c).border = thinBorder
      row.getCell(c).font = { name: FONT_FAMILY, size: 10 }
    }
    a4RowIdx++
  })

  // Signatures on A4
  a4RowIdx += 2
  wsA4Ihtiyac.mergeCells(`A${a4RowIdx}:C${a4RowIdx}`)
  wsA4Ihtiyac.getCell(`A${a4RowIdx}`).value = 'Talep Eden / Hazırlayan Görevli'
  wsA4Ihtiyac.getCell(`A${a4RowIdx}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsA4Ihtiyac.getCell(`A${a4RowIdx}`).alignment = { horizontal: 'center' }

  wsA4Ihtiyac.mergeCells(`D${a4RowIdx}:F${a4RowIdx}`)
  wsA4Ihtiyac.getCell(`D${a4RowIdx}`).value = 'Birim Yetkilisi / Harcama Yetkilisi'
  wsA4Ihtiyac.getCell(`D${a4RowIdx}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsA4Ihtiyac.getCell(`D${a4RowIdx}`).alignment = { horizontal: 'center' }

  a4RowIdx++
  wsA4Ihtiyac.mergeCells(`A${a4RowIdx}:C${a4RowIdx}`)
  wsA4Ihtiyac.getCell(`A${a4RowIdx}`).value = 'İmza'
  wsA4Ihtiyac.getCell(`A${a4RowIdx}`).font = { name: FONT_FAMILY, size: 9, italic: true }
  wsA4Ihtiyac.getCell(`A${a4RowIdx}`).alignment = { horizontal: 'center' }

  wsA4Ihtiyac.mergeCells(`D${a4RowIdx}:F${a4RowIdx}`)
  wsA4Ihtiyac.getCell(`D${a4RowIdx}`).value = 'İmza / Mühür'
  wsA4Ihtiyac.getCell(`D${a4RowIdx}`).font = { name: FONT_FAMILY, size: 9, italic: true }
  wsA4Ihtiyac.getCell(`D${a4RowIdx}`).alignment = { horizontal: 'center' }

  // =========================================================================
  // SAYFA 5: 📑 A4 - DOĞRUDAN TEMİN ONAY BELGESİ (HARCAMA TALİMATI)
  // =========================================================================
  const wsA4Onay = workbook.addWorksheet('A4 - Doğrudan Temin Onayı', {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
      showGridLines: true
    },
    views: [{ showGridLines: true }]
  })

  wsA4Onay.columns = [{ width: 6 }, { width: 28 }, { width: 44 }]

  wsA4Onay.mergeCells('A1:C1')
  wsA4Onay.getCell('A1').value = kurumAdi
  wsA4Onay.getCell('A1').font = { name: FONT_FAMILY, size: 12, bold: true }
  wsA4Onay.getCell('A1').alignment = { horizontal: 'center' }

  wsA4Onay.mergeCells('A2:C2')
  wsA4Onay.getCell('A2').value = `DOĞRUDAN TEMİN ONAY BELGESİ (HARCAMA TALİMATI)`
  wsA4Onay.getCell('A2').font = { name: FONT_FAMILY, size: 12, bold: true, underline: true }
  wsA4Onay.getCell('A2').alignment = { horizontal: 'center' }
  wsA4Onay.getRow(2).height = 24

  const onayFields = [
    ['1', 'İdarenin Adı:', kurumAdi],
    ['2', 'Harcama Birimi:', birimAdi],
    ['3', 'İşin / Alımın Adı ve Niteliği:', dosyaKonusu],
    ['4', 'Alım / İhale Usulü:', ihaleSekli],
    [
      '5',
      'Bütçe Tertibi & Yılı:',
      `${dosya?.butce_yili || '2026'} / ${dosya?.butce_kodu || '03.2'}`
    ],
    [
      '6',
      'Yaklaşık Maliyet Tutarı (KDV Hariç):',
      { formula: `'${kalemlerSheetName}'!J${kalemTotalRow}` }
    ],
    ['7', 'Kullanılabilir Ödenek Tutarı:', { formula: `'${kalemlerSheetName}'!J${kalemTotalRow}` }],
    [
      '8',
      'Piyasa Fiyat Araştırması Görevlileri:',
      komisyon
        .map((k) => k.ad_soyad || k.personel_adi)
        .filter(Boolean)
        .join(', ') || 'Satınalma Görevlileri'
    ],
    [
      '9',
      'Açıklamalar / Gerekçe:',
      '4734 Sayılı Kanun Madde 22/d uyarınca doğrudan temin usulüyle yapılması uygundur.'
    ]
  ]

  let oRow = 4
  for (const f of onayFields) {
    wsA4Onay.getRow(oRow).height = 24
    wsA4Onay.getCell(`A${oRow}`).value = f[0]
    wsA4Onay.getCell(`A${oRow}`).alignment = { horizontal: 'center', vertical: 'middle' }
    wsA4Onay.getCell(`A${oRow}`).border = thinBorder
    wsA4Onay.getCell(`A${oRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }

    wsA4Onay.getCell(`B${oRow}`).value = f[1]
    wsA4Onay.getCell(`B${oRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
    wsA4Onay.getCell(`B${oRow}`).fill = softGrayFill
    wsA4Onay.getCell(`B${oRow}`).border = thinBorder
    wsA4Onay.getCell(`B${oRow}`).alignment = { vertical: 'middle' }

    wsA4Onay.getCell(`C${oRow}`).value = f[2] as any
    wsA4Onay.getCell(`C${oRow}`).font = { name: FONT_FAMILY, size: 10 }
    wsA4Onay.getCell(`C${oRow}`).border = thinBorder
    wsA4Onay.getCell(`C${oRow}`).alignment = { vertical: 'middle' }
    if (f[0] === '6' || f[0] === '7') {
      wsA4Onay.getCell(`C${oRow}`).numFmt = '#,##0.00 "₺"'
      wsA4Onay.getCell(`C${oRow}`).font = { name: FONT_FAMILY, size: 11, bold: true }
    }
    oRow++
  }

  // Onay Kutusu
  oRow += 2
  wsA4Onay.mergeCells(`A${oRow}:C${oRow}`)
  wsA4Onay.getCell(`A${oRow}`).value = 'HARCAMA YETKİLİSİ ONAYI'
  wsA4Onay.getCell(`A${oRow}`).font = { name: FONT_FAMILY, size: 11, bold: true }
  wsA4Onay.getCell(`A${oRow}`).fill = softGrayFill
  wsA4Onay.getCell(`A${oRow}`).alignment = { horizontal: 'center' }
  wsA4Onay.getCell(`A${oRow}`).border = thinBorder

  oRow++
  wsA4Onay.mergeCells(`A${oRow}:C${oRow}`)
  wsA4Onay.getCell(`A${oRow}`).value =
    'Yukarıda belirtilen harcamanın 4734 Sayılı Kanun Md. 22/d uyarınca doğrudan temin usulüyle yapılması UYGUNDUR.'
  wsA4Onay.getCell(`A${oRow}`).font = { name: FONT_FAMILY, size: 10, italic: true }
  wsA4Onay.getCell(`A${oRow}`).alignment = { horizontal: 'center' }
  wsA4Onay.getCell(`A${oRow}`).border = thinBorder

  oRow++
  wsA4Onay.mergeCells(`A${oRow}:C${oRow}`)
  wsA4Onay.getCell(`A${oRow}`).value = 'Harcama Yetkilisi\nAdı Soyadı / Ünvanı\nİmza ve Mühür'
  wsA4Onay.getCell(`A${oRow}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsA4Onay.getCell(`A${oRow}`).alignment = { horizontal: 'center', wrapText: true }
  wsA4Onay.getRow(oRow).height = 40
  wsA4Onay.getCell(`A${oRow}`).border = boxBorder

  // =========================================================================
  // SAYFA 6: 📑 A4 - PİYASA FİYAT ARAŞTIRMA TUTANAĞI (RESMİ BASKIYA HAZIR)
  // =========================================================================
  const wsA4Piyasa = workbook.addWorksheet('A4 - Piyasa Fiyat Tutanağı', {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
      showGridLines: true
    },
    views: [{ showGridLines: true }]
  })

  wsA4Piyasa.columns = [
    { width: 6 }, // A: Sıra
    { width: 34 }, // B: Kalem
    { width: 10 }, // C: Birim
    { width: 12 }, // D: Miktar
    { width: 18 }, // E: Firma 1
    { width: 18 }, // F: Firma 2
    { width: 18 }, // G: Firma 3
    { width: 22 } // H: En Uygun Teklif
  ]

  wsA4Piyasa.mergeCells('A1:H1')
  wsA4Piyasa.getCell('A1').value = `${kurumAdi} - ${birimAdi}`
  wsA4Piyasa.getCell('A1').font = { name: FONT_FAMILY, size: 12, bold: true }
  wsA4Piyasa.getCell('A1').alignment = { horizontal: 'center' }

  wsA4Piyasa.mergeCells('A2:H2')
  wsA4Piyasa.getCell('A2').value = `PİYASA FİYAT ARAŞTIRMASI TUTANAĞI`
  wsA4Piyasa.getCell('A2').font = { name: FONT_FAMILY, size: 12, bold: true, underline: true }
  wsA4Piyasa.getCell('A2').alignment = { horizontal: 'center' }

  wsA4Piyasa.getCell('A4').value = `İşin Konusu: ${dosyaKonusu} | Dosya No: ${dosyaNoStr}`
  wsA4Piyasa.mergeCells('A4:H4')
  wsA4Piyasa.getCell('A4').font = { name: FONT_FAMILY, size: 10, italic: true }

  const pHeaders = [
    'Sıra',
    'İhtiyaç Kalemi Tanımı',
    'Birim',
    'Miktar',
    effectiveFirms[0]?.unvan || '1. Firma',
    effectiveFirms[1]?.unvan || '2. Firma',
    effectiveFirms[2]?.unvan || '3. Firma',
    'En Uygun Teklif (₺)'
  ]

  const pHeaderRow = wsA4Piyasa.getRow(6)
  pHeaderRow.height = 22
  pHeaders.forEach((ph, idx) => {
    const c = pHeaderRow.getCell(idx + 1)
    c.value = ph
    c.font = { name: FONT_FAMILY, size: 10, bold: true }
    c.fill = softGrayFill
    c.border = thinBorder
    c.alignment = {
      vertical: 'middle',
      horizontal: idx === 0 || idx === 2 ? 'center' : idx >= 3 ? 'right' : 'left'
    }
  })

  let pRowIdx = 7
  kalemler.forEach((_, idx) => {
    const r = wsA4Piyasa.getRow(pRowIdx)
    r.height = 20

    r.getCell(1).value = idx + 1
    r.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

    r.getCell(2).value = { formula: `'${kalemlerSheetName}'!E${idx + 5}` }
    r.getCell(3).value = { formula: `'${kalemlerSheetName}'!F${idx + 5}` }
    r.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' }

    r.getCell(4).value = { formula: `'${kalemlerSheetName}'!G${idx + 5}` }
    r.getCell(4).numFmt = '#,##0.00'
    r.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' }

    // Teklifler sheet formulas
    r.getCell(5).value = { formula: `'Teklifler & Piyasa'!E${idx + 5}` }
    r.getCell(5).numFmt = '#,##0.00 "₺"'

    r.getCell(6).value = { formula: `'Teklifler & Piyasa'!G${idx + 5}` }
    r.getCell(6).numFmt = '#,##0.00 "₺"'

    r.getCell(7).value = { formula: `'Teklifler & Piyasa'!I${idx + 5}` }
    r.getCell(7).numFmt = '#,##0.00 "₺"'

    const lastColLetterOfTeklif = getColumnLetter(totalColsCount - 1)
    r.getCell(8).value = { formula: `'Teklifler & Piyasa'!${lastColLetterOfTeklif}${idx + 5}` }
    r.getCell(8).numFmt = '#,##0.00 "₺"'
    r.getCell(8).font = { name: FONT_FAMILY, size: 10, bold: true }

    for (let c = 1; c <= 8; c++) {
      r.getCell(c).border = thinBorder
      r.getCell(c).font = r.getCell(c).font || { name: FONT_FAMILY, size: 10 }
    }
    pRowIdx++
  })

  // Piyasa Araştırması İmzaları
  pRowIdx += 2
  wsA4Piyasa.mergeCells(`A${pRowIdx}:D${pRowIdx}`)
  wsA4Piyasa.getCell(`A${pRowIdx}`).value = 'Piyasa Fiyat Araştırma Görevlisi'
  wsA4Piyasa.getCell(`A${pRowIdx}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsA4Piyasa.getCell(`A${pRowIdx}`).alignment = { horizontal: 'center' }

  wsA4Piyasa.mergeCells(`E${pRowIdx}:H${pRowIdx}`)
  wsA4Piyasa.getCell(`E${pRowIdx}`).value = 'Piyasa Fiyat Araştırma Görevlisi'
  wsA4Piyasa.getCell(`E${pRowIdx}`).font = { name: FONT_FAMILY, size: 10, bold: true }
  wsA4Piyasa.getCell(`E${pRowIdx}`).alignment = { horizontal: 'center' }

  pRowIdx++
  wsA4Piyasa.mergeCells(`A${pRowIdx}:D${pRowIdx}`)
  wsA4Piyasa.getCell(`A${pRowIdx}`).value = 'Adı Soyadı / İmza'
  wsA4Piyasa.getCell(`A${pRowIdx}`).font = { name: FONT_FAMILY, size: 9, italic: true }
  wsA4Piyasa.getCell(`A${pRowIdx}`).alignment = { horizontal: 'center' }

  wsA4Piyasa.mergeCells(`E${pRowIdx}:H${pRowIdx}`)
  wsA4Piyasa.getCell(`E${pRowIdx}`).value = 'Adı Soyadı / İmza'
  wsA4Piyasa.getCell(`E${pRowIdx}`).font = { name: FONT_FAMILY, size: 9, italic: true }
  wsA4Piyasa.getCell(`E${pRowIdx}`).alignment = { horizontal: 'center' }

  // =========================================================================
  // SAYFA 7: GÖREVLENDİRME & KOMİSYON LİSTESİ
  // =========================================================================
  const wsKom = workbook.addWorksheet('Komisyon ve Görevliler', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
      showGridLines: true
    },
    views: [{ showGridLines: true }]
  })

  wsKom.columns = [
    { width: 6 },
    { width: 28 },
    { width: 24 },
    { width: 28 },
    { width: 24 },
    { width: 30 }
  ]

  wsKom.mergeCells('A1:F1')
  const komTitle = wsKom.getCell('A1')
  komTitle.value = `${dosyaNoStr} - DOĞRUDAN TEMİN GÖREVLENDİRME VE KOMİSYON LİSTESİ`
  komTitle.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: 'FF000000' } }
  komTitle.fill = headerFillOfficial
  komTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsKom.getRow(1).height = 26

  const komHeaders = [
    'Sıra',
    'Adı Soyadı',
    'Ünvanı / Mesleği',
    'Komisyon Türü',
    'Görevi / Rolü',
    'İmza ve Görev Durumu'
  ]
  const komHeaderRow = wsKom.getRow(3)
  komHeaderRow.height = 24
  komHeaders.forEach((kh, idx) => {
    const c = komHeaderRow.getCell(idx + 1)
    c.value = kh
    c.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FF000000' } }
    c.fill = subHeaderFillOfficial
    c.border = thinBorder
    c.alignment = { vertical: 'middle', horizontal: idx === 0 ? 'center' : 'left' }
  })

  let komRowIdx = 4
  const memberList =
    komisyon.length > 0
      ? komisyon
      : [
          {
            ad_soyad: 'Piyasa Araştırma Görevlisi 1',
            unvan: 'Mühendis / Uzman',
            komisyon_turu: 'Piyasa Fiyat Araştırma',
            rol: 'Başkan'
          },
          {
            ad_soyad: 'Piyasa Araştırma Görevlisi 2',
            unvan: 'Tekniker / Memur',
            komisyon_turu: 'Piyasa Fiyat Araştırma',
            rol: 'Üye'
          },
          {
            ad_soyad: 'Muayene Kabul Yetkilisi',
            unvan: 'Şube Müdürü',
            komisyon_turu: 'Muayene ve Kabul',
            rol: 'Başkan'
          },
          {
            ad_soyad: 'Harcama Yetkilisi',
            unvan: 'Daire Başkanı / Harcama Yetkilisi',
            komisyon_turu: 'Harcama ve Onay',
            rol: 'Harcama Yetkilisi'
          }
        ]

  memberList.forEach((m, idx) => {
    const row = wsKom.getRow(komRowIdx)
    row.height = 22
    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
    row.getCell(2).value = m.ad_soyad || m.personel_adi || ''
    row.getCell(2).font = { name: FONT_FAMILY, size: 10, bold: true }
    row.getCell(3).value = m.unvan || '-'
    row.getCell(4).value = m.komisyon_turu || 'Doğrudan Temin Görevlendirmesi'
    row.getCell(5).value = m.rol || m.gorev || 'Üye'
    row.getCell(6).value = 'Görevlendirme Onaylandı'

    for (let c = 1; c <= 6; c++) {
      const cell = row.getCell(c)
      cell.font = cell.font || { name: FONT_FAMILY, size: 10 }
      cell.border = thinBorder
      if (idx % 2 === 1) cell.fill = zebraFill
    }
    komRowIdx++
  })

  // =========================================================================
  // SAYFA 8: KİK ŞABLON & BELGE ENVANTERİ
  // =========================================================================
  const wsSablon = workbook.addWorksheet('Belge ve Şablon Envanteri', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
      showGridLines: true
    },
    views: [{ showGridLines: true }]
  })

  wsSablon.columns = [
    { width: 6 },
    { width: 34 },
    { width: 24 },
    { width: 28 },
    { width: 24 },
    { width: 45 }
  ]

  wsSablon.mergeCells('A1:F1')
  const sabTitle = wsSablon.getCell('A1')
  sabTitle.value = `${dosyaNoStr} - 4734 SAYILI KİK DOĞRUDAN TEMİN STANDART ŞABLON VE EVRAK ENVANTERİ`
  sabTitle.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: 'FF000000' } }
  sabTitle.fill = headerFillOfficial
  sabTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsSablon.getRow(1).height = 26

  const sabHeaders = [
    'Sıra',
    'Standart Şablon / Belge Adı',
    'Süreç Aşaması',
    'Şablon Dosyası (.html / .docx)',
    'Mevzuat Maddesi',
    'Belgenin Amacı ve Hukuki Niteliği'
  ]
  const sabHeaderRow = wsSablon.getRow(3)
  sabHeaderRow.height = 24
  sabHeaders.forEach((sh, idx) => {
    const c = sabHeaderRow.getCell(idx + 1)
    c.value = sh
    c.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FF000000' } }
    c.fill = subHeaderFillOfficial
    c.border = thinBorder
    c.alignment = { vertical: 'middle', horizontal: idx === 0 ? 'center' : 'left' }
  })

  const standardDocs =
    sablons.length > 0
      ? sablons.map((s, idx) => [
          String(idx + 1),
          s.ad || 'Şablon',
          s.kategori || 'Doğrudan Temin Süreci',
          s.dosya_adi || s.route_path || `${s.id}.html`,
          '4734 Sayılı KİK & Tebliğ',
          s.aciklama || 'Doğrudan temin süreci resmi evrak çıktısı'
        ])
      : [
          [
            '1',
            'İhtiyaç Listesi & Talep Formu',
            '1. İhtiyaç & Başlangıç',
            'ihtiyac-listesi.html',
            'KİK Md. 22',
            'Birimlerin talep ettiği malzeme/hizmet kalemlerinin resmi dökümü'
          ],
          [
            '2',
            'Lüzum Müzekkeresi',
            '1. İhtiyaç & Başlangıç',
            'luzum-muzekkeresi.html',
            'KİK Md. 22',
            'Alımın idari ve teknik gerekçesini belirten resmi talep yazısı'
          ],
          [
            '3',
            'Doğrudan Temin Onay Belgesi / Harcama Talimatı',
            '1. İhtiyaç & Başlangıç',
            'harcama-talimati.html',
            'KİK Md. 22 & Tebliğ',
            'Harcama yetkilisinden alım izni ve bütçe kullanımı onayı'
          ],
          [
            '4',
            'Piyasa Fiyat Araştırma Görevlendirmesi',
            '2. Teklifler & Piyasa',
            'piyasa-fiyat-arastirma-gorevlendirmesi.html',
            'KİK Md. 22/d',
            'Piyasa fiyat araştırması yapacak personelin görev onayı'
          ],
          [
            '5',
            'Birim Fiyat Teklif Mektubu',
            '2. Teklifler & Piyasa',
            'birim-fiyat-teklif-mektubu.html',
            'KİK Md. 22/d',
            'İstekli firmalara fiyat teklifi vermeleri için gönderilen davet mektubu'
          ],
          [
            '6',
            'Piyasa Fiyat Araştırma Tutanağı',
            '2. Teklifler & Piyasa',
            'piyasa-fiyat-arastirma-tutanagi.html',
            'KİK Md. 22/d & Tebliğ',
            'Alınan tüm tekliflerin karşılaştırılarak en uygunun belirlendiği tutanak'
          ],
          [
            '7',
            'Yaklaşık Maliyet Hesap Cetveli',
            '2. Teklifler & Piyasa',
            'yaklasik-maliyet-cetveli.html',
            'KİK Tebliği Md. 22',
            'Alımın tahmini bütçe ve piyasa ortalama maliyetinin tespit cetveli'
          ],
          [
            '8',
            'Doğrudan Temin Sözleşmesi',
            '3. Sipariş & Sözleşme',
            'dogrudan-temin-sozlesmesi.html',
            '4734 / Borçlar Kanunu',
            'Yüklenici firma ile idare arasında yapılan resmi alım sözleşmesi'
          ],
          [
            '9',
            'Sipariş Mektubu / Taahhütname',
            '3. Sipariş & Sözleşme',
            'siparis-mektubu.html',
            'KİK Md. 22',
            'Sözleşme yapılmayan hallerde işin yapılmasını bildiren resmi sipariş emri'
          ],
          [
            '10',
            'Muayene ve Kabul Tutanağı',
            '4. Muayene & Ödeme',
            'muayene-kabul-tutanagi.html',
            'Muayene ve Kabul Yön.',
            'Mal veya hizmetin teknik şartlara uygun teslim alındığına dair kabul tutanağı'
          ],
          [
            '11',
            'Harcama Pusulası & Ödeme Emri',
            '4. Muayene & Ödeme',
            'harcama-pusulasi.html',
            '5018 Sayılı KMYKK',
            'Faturanın muhasebeleştirilip yükleniciye ödeme yapılması talimatı'
          ]
        ]

  let sabRowIdx = 4
  standardDocs.forEach((sd, idx) => {
    const row = wsSablon.getRow(sabRowIdx)
    row.height = 22
    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
    row.getCell(2).value = sd[1]
    row.getCell(2).font = { name: FONT_FAMILY, size: 10, bold: true }
    row.getCell(3).value = sd[2]
    row.getCell(4).value = sd[3]
    row.getCell(5).value = sd[4]
    row.getCell(6).value = sd[5]

    for (let c = 1; c <= 6; c++) {
      const cell = row.getCell(c)
      cell.font = cell.font || { name: FONT_FAMILY, size: 10 }
      cell.border = thinBorder
      if (idx % 2 === 1) cell.fill = zebraFill
    }
    sabRowIdx++
  })

  // Export buffer & trigger file download with standardized filename: butceYili-dtNo-Master_Excel_Raporu.xlsx
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  const downloadFileName = buildExportFileName({
    dosya,
    belgeAdi: 'Dosya_Excel_Raporu',
    extension: 'xlsx'
  })

  link.setAttribute('download', downloadFileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Excel Column index (1-based) to Letter converter (1 -> A, 27 -> AA, etc.)
 */
function getColumnLetter(colIndex: number): string {
  let temp = colIndex
  let letter = ''
  while (temp > 0) {
    const mod = (temp - 1) % 26
    letter = String.fromCharCode(65 + mod) + letter
    temp = Math.floor((temp - mod) / 26)
  }
  return letter
}
