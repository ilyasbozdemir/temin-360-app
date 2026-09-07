/* eslint-disable */
import Database from 'better-sqlite3'
import { TANIM_Mevzuat } from './tables/TANIM_Mevzuat'
import { TANIM_Personel } from './tables/TANIM_Personel'
import { TANIM_Roller } from './tables/TANIM_Roller'
import { TANIM_Birim } from './tables/TANIM_Birim'
import { TANIM_Kurum } from './tables/TANIM_Kurum'
import { TANIM_Asama } from './tables/TANIM_Asama'
import { DATA_TeminDosyasi } from './tables/DATA_TeminDosyasi'
import { TANIM_Firma } from './tables/TANIM_Firma'
import { TANIM_FirmaIletisimNotu } from './tables/TANIM_FirmaIletisimNotu'
import { TANIM_Ambar } from './tables/TANIM_Ambar'
import { TANIM_AlimTuru } from './tables/TANIM_AlimTuru'
import { TANIM_Sablon } from './tables/TANIM_Sablon'
import { TANIM_Placeholder } from './tables/TANIM_Placeholder'
import { TANIM_AlimTuru_Sablon } from './tables/TANIM_AlimTuru_Sablon'
import { TANIM_SurecTaslak } from './tables/TANIM_SurecTaslak'
import { SABLON_Placeholder } from './tables/SABLON_Placeholder'
import { TANIM_Kalem } from './tables/TANIM_Kalem'
import { TANIM_TasinirKod } from './tables/TANIM_TasinirKod'
import { TANIM_OkasKod } from './tables/TANIM_OkasKod'
import { TANIM_KodSozlugu } from './tables/TANIM_KodSozlugu'
import { TANIM_OlcuBirimi } from './tables/TANIM_OlcuBirimi'
import { TANIM_KomisyonGorevi } from './tables/TANIM_KomisyonGorevi'
import { TANIM_Komisyon } from './tables/TANIM_Komisyon'
import { TANIM_KomisyonUye } from './tables/TANIM_KomisyonUye'
import { TANIM_Komisyon_Sablon } from './tables/TANIM_Komisyon_Sablon'
import { TANIM_KikLimitDonemleri } from './tables/TANIM_KikLimitDonemleri'
import { DATA_TeminKalem } from './tables/DATA_TeminKalem'
import { DATA_TeminFirma } from './tables/DATA_TeminFirma'
import { DATA_TeminKalemTeklif } from './tables/DATA_TeminKalemTeklif'
import { DATA_TeminKomisyon } from './tables/DATA_TeminKomisyon'
import { DATA_TeminBelge } from './tables/DATA_TeminBelge'
import { DATA_TIF } from './tables/DATA_TIF'
import { DATA_TIF_Kalem } from './tables/DATA_TIF_Kalem'
import { DATA_AmbarStok } from './tables/DATA_AmbarStok'
import { LOG_SystemLog } from './tables/LOG_SystemLog'
import { DATA_DosyaSablonVeri } from './tables/DATA_DosyaSablonVeri'
import { runMigrations, CURRENT_SCHEMA_VERSION } from './migrate'
import { defineTable } from './BaseTable'

const rawTables = [
  TANIM_Kurum,
  TANIM_Mevzuat,
  TANIM_Birim,
  TANIM_Personel,
  TANIM_Roller,
  TANIM_Asama,
  TANIM_Firma,
  TANIM_FirmaIletisimNotu,
  TANIM_Ambar,
  TANIM_TasinirKod,
  TANIM_OkasKod,
  TANIM_Kalem,
  TANIM_OlcuBirimi,
  TANIM_AlimTuru,
  TANIM_Sablon,
  TANIM_Placeholder,
  TANIM_AlimTuru_Sablon,
  TANIM_SurecTaslak,
  SABLON_Placeholder,
  TANIM_KodSozlugu,
  TANIM_KomisyonGorevi,
  TANIM_Komisyon,
  TANIM_KomisyonUye,
  TANIM_Komisyon_Sablon,
  TANIM_KikLimitDonemleri,
  DATA_TeminDosyasi,
  DATA_TeminKalem,
  DATA_TeminFirma,
  DATA_TeminKalemTeklif,
  DATA_TeminKomisyon,
  DATA_TeminBelge,
  DATA_TIF,
  DATA_TIF_Kalem,
  DATA_AmbarStok,
  DATA_DosyaSablonVeri,
  LOG_SystemLog
]

export const schema = {
  database: 'DOGRUDAN_TEMIN_DB',
  app_title: 'TEMİN 360',
  tables: rawTables.map(defineTable)
}

export function initializeDatabase(db: Database.Database, institutionName: string, currentAppVersion: string = '1.0.0'): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS LOG_YedekGecmisi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hedef TEXT NOT NULL,
      dosya_adi TEXT NOT NULL,
      gdrive_file_id TEXT,
      boyut_bytes INTEGER,
      surum_no TEXT,
      tarih TEXT NOT NULL,
      aciklama TEXT
    );
    INSERT OR REPLACE INTO settings (key, value) VALUES ('institutionName', '${institutionName.replace(/'/g, "''")}');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('dbVersion', '${currentAppVersion}');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('dbSchemaVersion', '${CURRENT_SCHEMA_VERSION}');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('appTitle', '${schema.app_title}');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('adminName', 'İlyas BOZDEMİR');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('adminTitle', 'Sistem Yöneticisi');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('activeKurumId', '1');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('rates', '[{"id":"1","ad":"Damga Vergisi","oran":"9,48","tur":"binde","hesapKodu":""},{"id":"2","ad":"Karar Pulu","oran":"5,69","tur":"binde","hesapKodu":""},{"id":"3","ad":"KDV (Genel)","oran":"20","tur":"yuzde","hesapKodu":""},{"id":"4","ad":"KDV (İndirimli)","oran":"10","tur":"yuzde","hesapKodu":""},{"id":"5","ad":"KDV (Özel)","oran":"1","tur":"yuzde","hesapKodu":""}]');
  `)

  schema.tables.forEach((table: any) => {
    const columnsSql = table.columns
      .map((col: any) => {
        let colDef = '"' + col.name + '" ' + col.type
        if (col.primaryKey) colDef += ' PRIMARY KEY'
        if (col.autoIncrement) colDef += ' AUTOINCREMENT'
        if (col.unique) colDef += ' UNIQUE'
        if (col.notNull) colDef += ' NOT NULL'
        if (col.default !== undefined) {
          colDef += ' DEFAULT ' + (typeof col.default === 'string' ? col.default : col.default)
        }
        return colDef
      })
      .join(', ')

    const constraintsSql = table.constraints ? ', ' + table.constraints.join(', ') : ''
    db.exec('CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columnsSql + constraintsSql + ');')

    if (table.initialData && table.initialData.length > 0) {
      table.initialData.forEach((row: any) => {
        const keys = Object.keys(row)
        const values = Object.values(row).map((v) =>
          typeof v === 'string' ? "'" + (v as string).replace(/'/g, "''") + "'" : v
        )
        db.exec(
          `INSERT OR IGNORE INTO ${table.name} (${keys.join(', ')}) VALUES (${values.join(', ')});`
        )
      })
    }
  })

  // Indexes must be created after tables are created
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasinirkod_tam_kod ON TANIM_TasinirKod(tam_kod);
    CREATE INDEX IF NOT EXISTS idx_tasinirkod_hesap ON TANIM_TasinirKod(hesap_kodu);
    CREATE INDEX IF NOT EXISTS idx_okaskod_tam_kod ON TANIM_OkasKod(tam_kod);
  `)

  // Seed default test data in dev environment
  try {
    const persCountRes = db.prepare('SELECT COUNT(*) as cnt FROM TANIM_Personel').get() as {
      cnt: number
    }
    if (persCountRes.cnt === 0) {
      const testPersoneller = [
        { ad_soyad: 'İrtibat Yetkilisi (Test)', unvan: 'İrtibat Görevlisi', rol: 'ilgili_personel' },
        { ad_soyad: 'Dosyayı Hazırlayan (Test)', unvan: 'Hazırlayan Personel', rol: 'hazirlayan' },
        { ad_soyad: 'Talep Eden (Test)', unvan: 'Birim Sorumlusu', rol: 'talep_eden' },
        { ad_soyad: 'Sunan Personel (Test)', unvan: 'Sunan Görevli', rol: 'sunan_personel' },
        { ad_soyad: 'Harcama Yetkilisi (Test)', unvan: 'Harcama Yetkilisi', rol: 'harcama_yetkilisi' }
      ]

      const insertPers = db.prepare(
        `INSERT INTO TANIM_Personel (ad_soyad, unvan, aktif_mi) VALUES (?, ?, 1)`
      )
      const updateRol = db.prepare(
        `UPDATE TANIM_Roller SET varsayilan_personel_id = ? WHERE rol_kodu = ?`
      )

      db.transaction(() => {
        for (const p of testPersoneller) {
          const info = insertPers.run(p.ad_soyad, p.unvan)
          const newId = info.lastInsertRowid

          const checkRol = db.prepare('SELECT id FROM TANIM_Roller WHERE rol_kodu = ?').get(p.rol)
          if (!checkRol) {
            db.prepare(
              'INSERT INTO TANIM_Roller (rol_adi, rol_kodu, varsayilan_personel_id) VALUES (?, ?, ?)'
            ).run(p.rol.replace('_', ' ').toUpperCase(), p.rol, newId)
          } else {
            updateRol.run(newId, p.rol)
          }
        }
      })()
      console.log('Test personelleri (Seed) başarıyla eklendi.')
    }
  } catch (error) {
    console.error('Test personelleri eklenirken hata oluştu:', error)
  }
}

export { runMigrations, CURRENT_SCHEMA_VERSION }
export { TANIM_Placeholder } from './tables/TANIM_Placeholder'
export { manifests } from './schema-manifest/index'
export * from './migrate'
export * from './supabase/client'

