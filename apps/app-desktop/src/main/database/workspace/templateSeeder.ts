import Database from 'better-sqlite3'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import {
  TEMPLATE_NAMES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_GROUPS
} from '../../../shared/constants/templateConstants'

const TEMPLATE_GROUP_MAP = new Map<
  string,
  { grup_adi: string; grup_siralama: number; etiket: string }
>()
for (const g of TEMPLATE_GROUPS) {
  g.sablonlar.forEach((s, i) => {
    TEMPLATE_GROUP_MAP.set(s.dosya_adi, { grup_adi: g.grup, grup_siralama: i, etiket: s.etiket })
  })
}

const ROUTE_BY_DOSYA_ADI: Record<string, string> = {
  'fiyat-arastirma-komisyonu-atama': '/dosya/komisyon/fiyat-arastirma',
  'komisyon-gorevlendirme-onayi': '/dosya/komisyon/fiyat-arastirma',
  'muayene-kabul-komisyonu-atama': '/dosya/komisyon/muayene-kabul',
  'muayene-kabul-komisyonu': '/dosya/komisyon/muayene-kabul',
  'fiyat-arastirma-ve-muayene-komisyonu': '/dosya/komisyon/fiyat-muayene',
  'komisyon-atama-onay-eki': '/dosya/komisyon/onay-eki',
  'komisyon-gorevlendirme-onayi-eki': '/dosya/komisyon/onay-eki',
  'ihtiyac-listesi': '/dosya/malzemeler/liste',
  'ihtiyac-talep-formu': '/dosya/luzum/talep-formu',
  'malzeme-hizmet-kalem-listesi': '/dosya/malzemeler/liste',
  'son-alim-fiyat-cetveli': '/dosya/malzemeler/son-alim',
  'luzum-muzekkeresi-belgesi': '/dosya/luzum/belge',
  'luzum-muzekkeresi': '/dosya/luzum/belge',
  'luzum-onay-eki': '/dosya/luzum/onay-eki',
  'luzum-muzekkeresi-onay-eki': '/dosya/luzum/onay-eki',
  'teslim-tesellum-belgesi': '/dosya/luzum/teslim-tesellum',
  'luzum-muzekkeresi-teslim-tesellum': '/dosya/luzum/teslim-tesellum',
  'istekli-tedarikci-firmalar': '/dosya/firmalar-maliyet/istekliler',
  'yaklasik-maliyet-hesap-cetveli': '/dosya/firmalar-maliyet/yaklasik',
  'yaklasik-maliyet-cetveli': '/dosya/firmalar-maliyet/yaklasik',
  'piyasa-fiyat-arastirma-tutanagi': '/dosya/firmalar-maliyet/tutanak',
  'dogrudan-temin-onay-belgesi': '/dosya/onay/dt-onay',
  'ihale-onay-belgesi': '/dosya/onay/ihale-onay',
  'idare-onay-belgesi': '/dosya/onay/ihale-onay',
  'butce-sorgusu': '/dosya/onay/butce-sorgu',
  'harcama-talimati': '/dosya/harcama/talimat',
  'harcama-pusulasi': '/dosya/harcama/pusula',
  'hakedis-raporu': '/dosya/cikti-merkezi',
  'hizmet-isleri-kabul-teklif-belgesi': '/dosya/cikti-merkezi',
  'hizmet-isleri-kabul-tutanagi': '/dosya/cikti-merkezi',
  'odeme-emri-belgesi': '/dosya/cikti-merkezi',
  'odeme-yazisi': '/dosya/cikti-merkezi',
  'tasinir-islem-fisi': '/dosya/cikti-merkezi',
  'ihale-kapagi': '/dosya/cikti-merkezi',
  'kapak-ici-indeks-sablonu': '/dosya/cikti-merkezi',
  'klasor-sirtligi-3cm': '/dosya/cikti-merkezi',
  'klasor-sirtligi-5cm': '/dosya/cikti-merkezi',
  'klasor-sirtligi-7-5cm': '/dosya/cikti-merkezi',
  'arastirma-mektubu': '/dosya/cikti-merkezi',
  'birim-fiyat-teklif-cetveli': '/dosya/cikti-merkezi',
  'birim-fiyat-teklif-mektubu': '/dosya/cikti-merkezi',
  'dagitim-cizelgesi': '/dosya/cikti-merkezi',
  'dagitim-cizelgesi-karma': '/dosya/cikti-merkezi',
  'fiyat-arastirma-mektubu': '/dosya/cikti-merkezi',
  'fiyat-arastirmasi': '/dosya/cikti-merkezi',
  'piyasa-fiyat-arastirma-gorevlendirmesi': '/dosya/cikti-merkezi',
  'teklif-mektubu-dagitim-cizelgesi': '/dosya/cikti-merkezi',
  'dogrudan-temin-sonuc-onay-belgesi': '/dosya/cikti-merkezi',
  'dogrudan-temin-sozlesmesi': '/dosya/cikti-merkezi',
  'dogrudan-temin-sozlesmesi-alternatif': '/dosya/cikti-merkezi',
  'dogrudan-temin-sozlesmesi-uzun': '/dosya/cikti-merkezi',
  'ihale-komisyon-karari': '/dosya/cikti-merkezi',
  'kabul-edilen-teklif': '/dosya/cikti-merkezi',
  'kabul-edilen-teklif-alternatif': '/dosya/cikti-merkezi',
  'sozlesmeye-davet': '/dosya/cikti-merkezi',
  'teklif-mektubu': '/dosya/cikti-merkezi'
}

export function seedTemplates(db: Database.Database): void {
  try {
    const templatesDirDev = path.join(app.getAppPath(), 'resources', 'templates')
    const templatesDirProd = path.join(process.resourcesPath, 'templates')
    const targetDir = fs.existsSync(templatesDirProd) ? templatesDirProd : templatesDirDev

    if (!fs.existsSync(targetDir)) return

    const findHtmlFiles = (dir: string): string[] => {
      let results: string[] = []
      const list = fs.readdirSync(dir)
      for (const file of list) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        if (stat && stat.isDirectory()) {
          results = results.concat(findHtmlFiles(filePath))
        } else if (file.endsWith('.html')) {
          results.push(filePath)
        }
      }
      return results
    }

    const htmlFiles = findHtmlFiles(targetDir)
    for (const filePath of htmlFiles) {
      const file = path.basename(filePath)
      const content = fs.readFileSync(filePath, 'utf-8')
      let dosya_adi = file
      let ad = file.replace('.html', '').replace(/-/g, ' ').toUpperCase()
      let kategori = 'Genel Şablonlar'
      const parentDir = path.basename(path.dirname(filePath))

      if (file === 'index.html' && parentDir && parentDir !== 'templates') {
        dosya_adi = `${parentDir}.html`
        ad = TEMPLATE_NAMES[parentDir] || parentDir.replace(/-/g, ' ').toUpperCase()
      }

      if (parentDir !== 'templates') {
        const relPath = path.relative(targetDir, filePath)
        const pathParts = relPath.split(path.sep)
        if (pathParts.length > 1) {
          const topLevelFolder = pathParts[0]
          kategori =
            TEMPLATE_CATEGORIES[topLevelFolder] ||
            topLevelFolder.charAt(0).toUpperCase() + topLevelFolder.slice(1).replace(/-/g, ' ')
        }
      }

      const jsonFilePath = filePath + '.json'
      let testJsonContent: string | null = null
      if (fs.existsSync(jsonFilePath)) {
        testJsonContent = fs.readFileSync(jsonFilePath, 'utf-8')
      }

      const relativeHtmlPath = path.relative(targetDir, filePath)
      const relativeJsonPath = fs.existsSync(jsonFilePath)
        ? path.relative(targetDir, jsonFilePath)
        : null

      const existing = db
        .prepare('SELECT * FROM TANIM_Sablon WHERE dosya_adi = ?')
        .get(dosya_adi) as any

      const dosya_adi_no_ext = dosya_adi.replace(/\.html$/, '')
      const route_path = ROUTE_BY_DOSYA_ADI[dosya_adi_no_ext] || null
      const grupBilgi = TEMPLATE_GROUP_MAP.get(dosya_adi_no_ext) || null

      if (!existing) {
        db.prepare(
          `INSERT INTO TANIM_Sablon (ad, dosya_adi, dosya_turu, icerik, aciklama, aktif_mi, kategori, test_verisi, html_yolu, json_yolu, route_path, grup_adi, grup_siralama)
           VALUES (?, ?, 'html', ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          ad,
          dosya_adi,
          content,
          'Sistem varsayılan şablonu',
          kategori,
          testJsonContent,
          relativeHtmlPath,
          relativeJsonPath,
          route_path,
          grupBilgi?.grup_adi ?? null,
          grupBilgi?.grup_siralama ?? 0
        )
      } else {
        if (existing.versiyon === 1) {
          db.prepare(
            `UPDATE TANIM_Sablon 
             SET ad = ?, kategori = ?, icerik = ?, test_verisi = ?, html_yolu = ?, json_yolu = ?, route_path = COALESCE(route_path, ?), grup_adi = ?, grup_siralama = ?
             WHERE id = ?`
          ).run(
            ad,
            kategori,
            content,
            testJsonContent,
            relativeHtmlPath,
            relativeJsonPath,
            route_path,
            grupBilgi?.grup_adi ?? null,
            grupBilgi?.grup_siralama ?? 0,
            existing.id
          )
        } else {
          db.prepare(
            `UPDATE TANIM_Sablon 
             SET html_yolu = COALESCE(html_yolu, ?), json_yolu = COALESCE(json_yolu, ?), route_path = COALESCE(route_path, ?)
             WHERE id = ?`
          ).run(relativeHtmlPath, relativeJsonPath, route_path, existing.id)
        }
      }

      if (route_path) {
        let sablonId = existing ? existing.id : null
        if (!sablonId) {
          const newRow = db.prepare('SELECT id FROM TANIM_Sablon WHERE dosya_adi = ?').get(dosya_adi) as any
          if (newRow) sablonId = newRow.id
        }
        if (sablonId) {
          const mappingKey = `MAPPING_${route_path}_SABLON_ID`
          db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`).run(
            mappingKey,
            sablonId.toString()
          )
        }
      }
    }

    const updateGrup = db.prepare(
      `UPDATE TANIM_Sablon SET grup_adi = ?, grup_siralama = ? WHERE dosya_adi = ?`
    )
    for (const [dosyaAdi, bilgi] of TEMPLATE_GROUP_MAP.entries()) {
      updateGrup.run(bilgi.grup_adi, bilgi.grup_siralama, `${dosyaAdi}.html`)
    }
  } catch (err: any) {
    console.error('Error seeding templates:', err)
  }
}
