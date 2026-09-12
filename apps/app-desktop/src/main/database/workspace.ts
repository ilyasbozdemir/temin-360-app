import AdmZip from 'adm-zip'
import Database from 'better-sqlite3'
import { app, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { initializeDatabase, schema } from './index'
import { runMigrations, CURRENT_SCHEMA_VERSION, getPendingMigrations } from '@dt/database'
import tasinirKodlariSeed from './seed/tasinir_kodlari.json'
import yiUfeSeed from './seed/yi_ufe_endeksleri.json'
import { recentFilesStore } from '../store/recentFiles'

export interface WorkspaceMeta {
  dtal_version: string
  app_version: string
  created_at: string
  institution: string
  schema_version: number
  platform: string
  file_version: number
  active_db_file?: string
  updated_at?: string
  integrity_hash?: string
  warnings?: string[]
}

function calculateIntegrityHash(meta: Partial<WorkspaceMeta>): string {
  const payload = {
    dtal_version: meta.dtal_version,
    app_version: meta.app_version,
    schema_version: meta.schema_version,
    created_at: meta.created_at,
    institution: meta.institution,
    platform: meta.platform
  }
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

function normalizeMeta(raw: any): WorkspaceMeta {
  return {
    dtal_version: raw.dtal_version || raw.dtm_version || '1.0',
    app_version: raw.app_version || raw.version || '1.0.0',
    created_at:
      raw.created_at ||
      (raw.createdAt ? raw.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    institution: raw.institution || raw.institutionName || 'Bilinmeyen Kurum',
    schema_version: parseInt(raw.schema_version || raw.schemaVersion || '1', 10) || 1,
    platform: raw.platform || process.platform,
    file_version: raw.file_version || parseInt(raw.fileVersion || '1', 10) || 1,
    active_db_file: raw.active_db_file || 'database.sqlite',
    updated_at: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    integrity_hash: raw.integrity_hash,
    warnings: []
  }
}

export function ensureSchemaIntegrity(db: Database.Database): void {
  // Explicit migration for TANIM_Firma CRM columns to guarantee backwards-compatibility
  const firmaCrmColumns = [
    { name: 'deneyim_skoru', def: 'INTEGER DEFAULT 0' },
    { name: 'kalite_skoru', def: 'INTEGER DEFAULT 0' },
    { name: 'odeme_disiplini', def: 'INTEGER DEFAULT 1' },
    { name: 'kara_liste', def: 'INTEGER DEFAULT 0' },
    { name: 'kara_liste_neden', def: 'TEXT' },
    { name: 'son_iletisim_tarihi', def: 'TEXT' },
    { name: 'sorumlu_personel_id', def: 'INTEGER' },
    { name: 'iletisim_notlari', def: 'TEXT' }
  ]
  for (const c of firmaCrmColumns) {
    try {
      db.exec(`ALTER TABLE TANIM_Firma ADD COLUMN "${c.name}" ${c.def};`)
      console.log(`[Schema Self-Healing] Explicitly added TANIM_Firma.${c.name}`)
    } catch (e: any) {
      // Ignored if column already exists
    }
  }

  // Explicit migration for DATA_TeminDosyasi columns
  const teminDosyasiColumns = [
    { name: 'teslim_gun', def: 'INTEGER DEFAULT 7' },
    { name: 'teslim_tarihi', def: 'DATE' },
    { name: 'sozlesme_yapilacak_mi', def: 'INTEGER DEFAULT 0' },
    { name: 'sablon_tercihleri', def: "TEXT DEFAULT '{}'" },
    { name: 'ordered_docs', def: 'TEXT' },
    { name: 'starred_docs', def: 'TEXT' },
    { name: 'skipped_docs', def: 'TEXT' },
    { name: 'isin_aciklama_maddeleri', def: 'TEXT' },
    { name: 'yaklasik_maliyet_kdv_dahil_mi', def: 'INTEGER DEFAULT 0' }
  ]
  for (const c of teminDosyasiColumns) {
    try {
      db.exec(`ALTER TABLE DATA_TeminDosyasi ADD COLUMN "${c.name}" ${c.def};`)
      console.log(`[Schema Self-Healing] Explicitly added DATA_TeminDosyasi.${c.name}`)
    } catch (e: any) {
      // Ignored if column already exists
    }
  }

  // Explicit migration for DATA_DosyaSablonVeri columns
  try {
    db.exec(`ALTER TABLE DATA_DosyaSablonVeri ADD COLUMN "sablon_kodu" TEXT;`)
    console.log(`[Schema Self-Healing] Explicitly added DATA_DosyaSablonVeri.sablon_kodu`)
  } catch (e: any) {
    // Ignored if column already exists
  }

  // Explicit backward-compatibility alias: Ensure dosya_id exists and stays in sync with temin_dosya_id on all child tables
  const dosyaChildTables = [
    'DATA_TeminKalem',
    'DATA_TeminFirma',
    'DATA_TeminKomisyon',
    'DATA_TeminBelge',
    'DATA_TeminKalemTeklif',
    'DATA_DosyaSablonVeri',
    'DATA_TIF'
  ]
  for (const tbl of dosyaChildTables) {
    try {
      db.exec(`ALTER TABLE ${tbl} ADD COLUMN dosya_id INTEGER;`)
      console.log(`[Schema Self-Healing] Explicitly added ${tbl}.dosya_id alias column`)
    } catch {
      // Column already exists
    }
    try {
      db.exec(
        `UPDATE ${tbl} SET dosya_id = temin_dosya_id WHERE dosya_id IS NULL AND temin_dosya_id IS NOT NULL;`
      )
      db.exec(
        `UPDATE ${tbl} SET temin_dosya_id = dosya_id WHERE temin_dosya_id IS NULL AND dosya_id IS NOT NULL;`
      )
    } catch {}
    try {
      db.exec(`
        CREATE TRIGGER IF NOT EXISTS trg_${tbl}_sync_dosya_id_ins
        AFTER INSERT ON ${tbl}
        BEGIN
          UPDATE ${tbl} SET 
            dosya_id = COALESCE(NEW.dosya_id, NEW.temin_dosya_id),
            temin_dosya_id = COALESCE(NEW.temin_dosya_id, NEW.dosya_id)
          WHERE id = NEW.id;
        END;
      `)
      db.exec(`
        CREATE TRIGGER IF NOT EXISTS trg_${tbl}_sync_dosya_id_upd
        AFTER UPDATE OF dosya_id, temin_dosya_id ON ${tbl}
        BEGIN
          UPDATE ${tbl} SET 
            dosya_id = COALESCE(NEW.dosya_id, NEW.temin_dosya_id),
            temin_dosya_id = COALESCE(NEW.temin_dosya_id, NEW.dosya_id)
          WHERE id = NEW.id;
        END;
      `)
    } catch {}
  }

  // Explicit migration for TANIM_Kalem and DATA_TeminKalem extended columns
  const kalemExtendedColumns = [
    { name: 'poz_no', def: 'TEXT' },
    { name: 'poz_yili', def: 'INTEGER' },
    { name: 'poz_tanimi', def: 'TEXT' },
    { name: 'poz_grubu_ref_id', def: 'TEXT' },
    { name: 'olcu_birimi', def: 'TEXT' },
    { name: 'yapi_sinifi', def: 'TEXT' },
    { name: 'hizmet_kodu', def: 'TEXT' },
    { name: 'hizmet_sinifi', def: 'TEXT' },
    { name: 'sure', def: 'TEXT' },
    { name: 'personel_sayisi', def: 'INTEGER' },
    { name: 'meslek_kodu', def: 'TEXT' },
    { name: 'fiyat_donemi', def: 'TEXT' },
    { name: 'gorsel_url', def: 'TEXT' },
    { name: 'gorseller', def: 'TEXT' },
    { name: 'eski_poz_no', def: 'TEXT' },
    { name: 'fasikul', def: 'TEXT' },
    { name: 'poz_tipi', def: "TEXT DEFAULT 'Analiz'" },
    { name: 'birim_fiyatlar', def: 'TEXT' },
    { name: 'birim_fiyat', def: 'REAL DEFAULT 0' }
  ]
  for (const c of kalemExtendedColumns) {
    try {
      db.exec(`ALTER TABLE TANIM_Kalem ADD COLUMN "${c.name}" ${c.def};`)
    } catch {}
    try {
      db.exec(`ALTER TABLE DATA_TeminKalem ADD COLUMN "${c.name}" ${c.def};`)
    } catch {}
  }

  // Explicit migration for TANIM_OlcuBirimi extended columns
  const olcuBirimiExtendedColumns = [
    { name: 'kisa_ad', def: 'TEXT' },
    { name: 'kategori', def: "TEXT DEFAULT 'Adet/Miktar'" },
    { name: 'sembol', def: 'TEXT' },
    { name: 'donusum_faktoru', def: 'REAL DEFAULT 1.0' },
    { name: 'temel_birim_mi', def: 'INTEGER DEFAULT 0' },
    { name: 'donusum_tipi', def: "TEXT DEFAULT 'linear'" },
    { name: 'ondalik_basamak', def: 'INTEGER DEFAULT 2' },
    { name: 'iliskili_birimler', def: 'TEXT' },
    { name: 'aciklama', def: 'TEXT' }
  ]
  for (const c of olcuBirimiExtendedColumns) {
    try {
      db.exec(`ALTER TABLE TANIM_OlcuBirimi ADD COLUMN "${c.name}" ${c.def};`)
    } catch {}
  }

  // Ensure default unit conversions exist in TANIM_BirimDonusum
  try {
    const donusumCountRes = db.prepare('SELECT COUNT(*) as cnt FROM TANIM_BirimDonusum').get() as { cnt: number }
    if (donusumCountRes.cnt === 0) {
      const getBirimId = (ad: string) => {
        const row = db.prepare('SELECT id FROM TANIM_OlcuBirimi WHERE ad = ? COLLATE NOCASE').get(ad) as { id: number } | undefined
        return row?.id
      }

      const insertDonusum = db.prepare(`
        INSERT OR IGNORE INTO TANIM_BirimDonusum (kaynak_birim_id, hedef_birim_id, donusum_faktoru, formul, ters_formul, aciklama, aktif_mi)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `)

      const defaultConversions = [
        // Ağırlık
        { from: 'Kilogram', to: 'Gram', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 kg = 1000 g' },
        { from: 'Gram', to: 'Kilogram', factor: 0.001, formula: 'x / 1000', rev: 'x * 1000', desc: '1 g = 0.001 kg' },
        { from: 'Ton', to: 'Kilogram', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 ton = 1000 kg' },
        { from: 'Kilogram', to: 'Ton', factor: 0.001, formula: 'x / 1000', rev: 'x * 1000', desc: '1 kg = 0.001 ton' },
        { from: 'Gram', to: 'Miligram', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 g = 1000 mg' },

        // Uzunluk
        { from: 'Kilometre', to: 'Metre', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 km = 1000 m' },
        { from: 'Metre', to: 'Kilometre', factor: 0.001, formula: 'x / 1000', rev: 'x * 1000', desc: '1 m = 0.001 km' },
        { from: 'Metre', to: 'Santimetre', factor: 100, formula: 'x * 100', rev: 'x / 100', desc: '1 m = 100 cm' },
        { from: 'Santimetre', to: 'Metre', factor: 0.01, formula: 'x / 100', rev: 'x * 100', desc: '1 cm = 0.01 m' },
        { from: 'Metre', to: 'Milimetre', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 m = 1000 mm' },
        { from: 'Santimetre', to: 'Milimetre', factor: 10, formula: 'x * 10', rev: 'x / 10', desc: '1 cm = 10 mm' },
        { from: 'İnç', to: 'Santimetre', factor: 2.54, formula: 'x * 2.54', rev: 'x / 2.54', desc: '1 in = 2.54 cm' },

        // Alan
        { from: 'Metrekare', to: 'Santimetrekare', factor: 10000, formula: 'x * 10000', rev: 'x / 10000', desc: '1 m² = 10.000 cm²' },
        { from: 'Hektar', to: 'Metrekare', factor: 10000, formula: 'x * 10000', rev: 'x / 10000', desc: '1 ha = 10.000 m²' },
        { from: 'Dönüm', to: 'Metrekare', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 dönüm = 1000 m²' },

        // Hacim
        { from: 'Litre', to: 'Mililitre', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 L = 1000 ml' },
        { from: 'Mililitre', to: 'Litre', factor: 0.001, formula: 'x / 1000', rev: 'x * 1000', desc: '1 ml = 0.001 L' },
        { from: 'Metreküp', to: 'Litre', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 m³ = 1000 L' },
        { from: 'Galon', to: 'Litre', factor: 3.78541, formula: 'x * 3.78541', rev: 'x / 3.78541', desc: '1 gal ≈ 3.785 L' },

        // Adet
        { from: 'Deste', to: 'Adet', factor: 10, formula: 'x * 10', rev: 'x / 10', desc: '1 deste = 10 adet' },
        { from: 'Düzine', to: 'Adet', factor: 12, formula: 'x * 12', rev: 'x / 12', desc: '1 düzine = 12 adet' },
        { from: 'Çift', to: 'Adet', factor: 2, formula: 'x * 2', rev: 'x / 2', desc: '1 çift = 2 adet' },

        // Zaman
        { from: 'Gün', to: 'Saat', factor: 24, formula: 'x * 24', rev: 'x / 24', desc: '1 gün = 24 saat' },
        { from: 'Saat', to: 'Dakika', factor: 60, formula: 'x * 60', rev: 'x / 60', desc: '1 sa = 60 dk' },
        { from: 'Hafta', to: 'Gün', factor: 7, formula: 'x * 7', rev: 'x / 7', desc: '1 hafta = 7 gün' },
        { from: 'Ay', to: 'Gün', factor: 30, formula: 'x * 30', rev: 'x / 30', desc: '1 ay ≈ 30 gün' },
        { from: 'Yıl', to: 'Gün', factor: 365, formula: 'x * 365', rev: 'x / 365', desc: '1 yıl = 365 gün' },

        // Sıcaklık (Formüllü)
        { from: 'Santigrat', to: 'Fahrenhayt', factor: 0, formula: '(x * 9/5) + 32', rev: '(x - 32) * 5/9', desc: '°F = (°C × 9/5) + 32' },
        { from: 'Fahrenhayt', to: 'Santigrat', factor: 0, formula: '(x - 32) * 5/9', rev: '(x * 9/5) + 32', desc: '°C = (°F - 32) × 5/9' },
        { from: 'Santigrat', to: 'Kelvin', factor: 0, formula: 'x + 273.15', rev: 'x - 273.15', desc: 'K = °C + 273.15' },
        { from: 'Kelvin', to: 'Santigrat', factor: 0, formula: 'x - 273.15', rev: 'x + 273.15', desc: '°C = K - 273.15' }
      ]

      for (const conv of defaultConversions) {
        const fromId = getBirimId(conv.from)
        const toId = getBirimId(conv.to)
        if (fromId && toId) {
          insertDonusum.run(fromId, toId, conv.factor, conv.formula, conv.rev, conv.desc)
        }
      }
    }
  } catch {}

  // Ensure TANIM_YiUfeEndeks exists and is seeded
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS TANIM_YiUfeEndeks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        yil INTEGER NOT NULL,
        ay INTEGER NOT NULL,
        ay_adi TEXT NOT NULL,
        endeks REAL NOT NULL,
        aylik_degisim REAL,
        yillik_degisim REAL,
        kaynak TEXT DEFAULT 'TÜİK / hakedis.org',
        aciklama TEXT,
        olusturulma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
        guncellenme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(yil, ay)
      );
    `)

    const ufeCount = db.prepare('SELECT COUNT(*) as cnt FROM TANIM_YiUfeEndeks').get() as { cnt: number }
    if (ufeCount.cnt === 0 && (yiUfeSeed as any)?.monthly) {
      const insertUfe = db.prepare(`
        INSERT OR IGNORE INTO TANIM_YiUfeEndeks (yil, ay, ay_adi, endeks, kaynak)
        VALUES (?, ?, ?, ?, ?)
      `)
      const insertMany = db.transaction((rows: any[]) => {
        for (const r of rows) {
          insertUfe.run(r.yil, r.ay, r.ay_adi, r.endeks, 'TÜİK / hakedis.org')
        }
      })
      insertMany((yiUfeSeed as any).monthly)
      console.log(`[Schema Self-Healing] Seeded ${(yiUfeSeed as any).monthly.length} Yİ-ÜFE monthly records into TANIM_YiUfeEndeks`)
    }
  } catch (e: any) {
    console.error('[Schema Self-Healing] TANIM_YiUfeEndeks initialization failed:', e.message)
  }

  for (const table of schema.tables as any[]) {
    try {
      const tableInfo = db.prepare(`PRAGMA table_info(${table.name})`).all() as any[]
      if (tableInfo.length === 0) {
        console.log(`[Schema Self-Healing] Creating missing table ${table.name}`)
        const columnsSql = table.columns
          .map((col: any) => {
            let colDef = '"' + col.name + '" ' + col.type
            if (col.primaryKey) colDef += ' PRIMARY KEY'
            if (col.autoIncrement) colDef += ' AUTOINCREMENT'
            if (col.unique) colDef += ' UNIQUE'
            if (col.notNull) colDef += ' NOT NULL'
            if (col.default !== undefined) {
              const d = col.default
              if (typeof d === 'string') {
                if (d.toUpperCase() === 'CURRENT_TIMESTAMP') {
                  colDef += ' DEFAULT CURRENT_TIMESTAMP'
                } else if (d.startsWith("'") || d.startsWith('"')) {
                  colDef += ' DEFAULT ' + d
                } else {
                  colDef += " DEFAULT '" + d.replace(/'/g, "''") + "'"
                }
              } else {
                colDef += ' DEFAULT ' + d
              }
            }
            return colDef
          })
          .join(', ')
        const constraintsSql = table.constraints ? ', ' + table.constraints.join(', ') : ''
        db.exec(
          'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columnsSql + constraintsSql + ');'
        )
      } else {
        const existingColumns = new Set(tableInfo.map((c) => c.name))
        for (const col of table.columns as any[]) {
          if (!existingColumns.has(col.name)) {
            // SQLite ALTER TABLE ADD COLUMN does NOT support UNIQUE or NOT NULL constraints.
            // These are only valid at CREATE TABLE time. We skip them here to avoid errors.
            let sqlDef = '"' + col.name + '" ' + col.type
            if (col.default !== undefined) {
              const d = col.default
              if (typeof d === 'string') {
                const upper = d.trim().toUpperCase()
                if (
                  upper === 'CURRENT_TIMESTAMP' ||
                  upper === 'CURRENT_DATE' ||
                  upper === 'CURRENT_TIME'
                ) {
                  // SQLite ALTER TABLE ADD COLUMN does NOT allow non-constant defaults
                } else if (d.startsWith("'") || d.startsWith('"')) {
                  sqlDef += ' DEFAULT ' + d
                } else {
                  sqlDef += " DEFAULT '" + d.replace(/'/g, "''") + "'"
                }
              } else {
                sqlDef += ' DEFAULT ' + d
              }
            }
            console.log(`[Schema Self-Healing] Adding missing column ${table.name}.${col.name}`)
            db.exec(`ALTER TABLE ${table.name} ADD COLUMN ${sqlDef};`)
          }
        }
      }
      // Self-heal missing initial data
      if (table.initialData && table.initialData.length > 0) {
        table.initialData.forEach((row: any) => {
          const keys = Object.keys(row)
          const values = Object.values(row).map((v) =>
            typeof v === 'string' ? "'" + (v as string).replace(/'/g, "''") + "'" : v
          )
          db.exec(
            `INSERT OR IGNORE INTO ${table.name} (${keys.join(', ')}) VALUES (${values.join(
              ', '
            )});`
          )
        })
      }
    } catch (err: any) {
      console.error(`Error self-healing table ${table.name}:`, err.message)
    }
  }

  // Legacy snapshots migration: Force kurumIci to true if it was false/null/undefined
  try {
    const tableCheck = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_DosyaSablonVeri'")
      .get()
    if (tableCheck) {
      const rows = db.prepare('SELECT id, veri_json FROM DATA_DosyaSablonVeri').all() as any[]
      const stmt = db.prepare('UPDATE DATA_DosyaSablonVeri SET veri_json = ? WHERE id = ?')
      let migratedCount = 0
      for (const row of rows) {
        if (row.veri_json) {
          try {
            const parsed = JSON.parse(row.veri_json)
            if (
              parsed.kurumIci === false ||
              parsed.kurumIci === undefined ||
              parsed.kurumIci === null
            ) {
              parsed.kurumIci = true
              stmt.run(JSON.stringify(parsed), row.id)
              migratedCount++
            }
          } catch {
            // ignore
          }
        }
      }
      if (migratedCount > 0) {
        console.log(
          `[Migration] Migrated ${migratedCount} legacy document snapshots: forced kurumIci to true`
        )
      }
    }
  } catch (err: any) {
    console.error('Error migrating legacy snapshots:', err.message)
  }
}

const TEMPLATE_NAMES: Record<string, string> = {
  'harcama-talimati': 'HARCAMA TALİMATI',
  'ihtiyac-listesi': 'İHTİYAÇ LİSTESİ',
  'ihtiyac-talep-formu': 'İHTİYAÇ TALEP FORMU',
  'komisyon-gorevlendirme-onayi':
    'KOMİSYON GÖREVLENDİRME ONAYI (MUAYENE VE KABUL VE FİYAT ARAŞTIRMASI)',
  'komisyon-gorevlendirme-onayi-eki':
    'KOMİSYON GÖREVLENDİRME ONAYI EKİ (MUAYENE VE KABUL VE FİYAT ARAŞTIRMASI)',
  'luzum-muzekkeresi': 'LÜZUM MÜZEKKERESİ',
  'luzum-muzekkeresi-onay-eki': 'LÜZUM MÜZEKKERESİ ONAY EKİ',
  'luzum-muzekkeresi-teslim-tesellum': 'LÜZUM MÜZEKKERESİ TESLİM TESELLÜM',
  'son-alim-fiyat-cetveli': 'SON ALIM FİYAT CETVELİ',
  'arastirma-mektubu': 'ARAŞTIRMA MEKTUBU',
  'birim-fiyat-teklif-cetveli': 'BİRİM FİYAT TEKLİF CETVELİ',
  'birim-fiyat-teklif-mektubu': 'BİRİM FİYAT TEKLİF MEKTUBU',
  'dagitim-cizelgesi': 'DAĞITIM ÇİZELGESİ',
  'dagitim-cizelgesi-karma': 'DAĞITIM ÇİZELGESİ (KARMA)',
  'fiyat-arastirma-mektubu': 'FİYAT ARAŞTIRMA MEKTUBU',
  'fiyat-arastirmasi': 'FİYAT ARAŞTIRMASI',
  'piyasa-fiyat-arastirma-gorevlendirmesi': 'PİYASA FİYAT ARAŞTIRMA GÖREVLENDİRMESİ',
  'piyasa-fiyat-arastirma-tutanagi': 'PİYASA FİYAT ARAŞTIRMA TUTANAĞI',
  'teklif-mektubu-dagitim-cizelgesi': 'TEKLİF MEKTUBU DAĞITIM ÇİZELGESİ',
  'yaklasik-maliyet-cetveli': 'YAKLAŞIK MALİYET CETVELİ',
  'yaklasik-maliyet-teklif-mektubu': 'YAKLAŞIK MALİYET TEKLİF MEKTUBU',
  'butce-sorgusu': 'BÜTÇE SORGUSU',
  'dogrudan-temin-onay-belgesi': 'DOĞRUDAN TEMİN ONAY BELGESİ',
  'dogrudan-temin-sonuc-onay-belgesi': 'DOĞRUDAN TEMİN SONUÇ ONAY BELGESİ',
  'dogrudan-temin-sozlesmesi': 'DOĞRUDAN TEMİN SÖZLEŞMESİ',
  'dogrudan-temin-sozlesmesi-alternatif': 'DOĞRUDAN TEMİN SÖZLEŞMESİ (ALTERNATİF)',
  'dogrudan-temin-sozlesmesi-uzun': 'DOĞRUDAN TEMİN SÖZLEŞMESİ (UZUN)',
  'idare-onay-belgesi': 'İDARE ONAY BELGESİ',
  'ihale-komisyon-karari': 'İHALE KOMİSYON KARARI',
  'kabul-edilen-teklif': 'KABUL EDİLEN TEKLİF',
  'kabul-edilen-teklif-alternatif': 'KABUL EDİLEN TEKLİF (ALTERNATİF)',
  'sozlesmeye-davet': 'SÖZLEŞMEYE DAVET',
  'teklif-mektubu': 'TEKLİF MEKTUBU',
  'gunluk-calisma-puantaj-cizelgesi': 'GÜNLÜK ÇALIŞMA PUANTAJ ÇİZELGESİ',
  'hakedis-raporu': 'HAKEDİŞ RAPORU',
  'harcama-pusulasi': 'HARCAMA PUSULASI',
  'hizmet-isleri-kabul-teklif-belgesi': 'HİZMET İŞLERİ KABUL TEKLİF BELGESİ',
  'hizmet-isleri-kabul-tutanagi': 'HİZMET İŞLERİ KABUL TUTANAĞI',
  'muayene-kabul-komisyonu': 'MUAYENE VE KABUL KOMİSYONU',
  'muayene-kabul-tutanagi': 'MUAYENE VE KABUL TUTANAĞI',
  'odeme-emri-belgesi': 'ÖDEME EMRİ BELGESİ',
  'odeme-yazisi': 'ÖDEME YAZISI',
  'tasinir-islem-fisi': 'TAŞINIR İŞLEM FİŞİ',
  'ihale-kapagi': 'İHALE KAPAĞI',
  'kapak-ici-indeks-sablonu': 'KAPAK İÇİ İNDEKS ŞABLONU',
  'klasor-sirtligi-3cm': 'KLASÖR SIRTLIĞI (3 CM)',
  'klasor-sirtligi-5cm': 'KLASÖR SIRTLIĞI (5 CM)',
  'klasor-sirtligi-7-5cm': 'KLASÖR SIRTLIĞI (7.5 CM)'
}

/**
 * TEMPLATE_GROUPS — hangi şablonlar aynı kart altında gösterilir?
 *
 * Her entry bir gruptur. "grup" değeri DB'ye grup_adi olarak yazar.
 * Dizi sırası = grup_siralama (0-indexed). İlk eleman her zaman "Ana Belge" görünür.
 * Buraya ekleme/çıkarma yapılınca uygulama yeniden başlatıldığında DB güncellenir.
 */
const TEMPLATE_GROUPS: Array<{
  grup: string
  sablonlar: Array<{ dosya_adi: string; etiket: string }>
}> = [
  // İhtiyaç Listesi ailesi
  {
    grup: 'ihtiyac-listesi',
    sablonlar: [
      { dosya_adi: 'ihtiyac-listesi', etiket: 'İhtiyaç Listesi' },
      { dosya_adi: 'ihtiyac-talep-formu', etiket: 'Talep Formu' }
    ]
  },
  // Lüzum Müzekkeresi ailesi
  {
    grup: 'luzum-muzekkeresi',
    sablonlar: [
      { dosya_adi: 'luzum-muzekkeresi', etiket: 'Lüzum Müzekkeresi' },
      { dosya_adi: 'luzum-muzekkeresi-onay-eki', etiket: 'Onay Eki' },
      { dosya_adi: 'luzum-muzekkeresi-teslim-tesellum', etiket: 'Teslim Tesellüm' }
    ]
  },
  // Komisyon Görevlendirme ailesi
  {
    grup: 'komisyon-gorevlendirme',
    sablonlar: [
      { dosya_adi: 'komisyon-gorevlendirme-onayi', etiket: 'Komisyon Atama' },
      { dosya_adi: 'komisyon-gorevlendirme-onayi-eki', etiket: 'Onay Eki' }
    ]
  },
  // Onay Belgesi ailesi
  {
    grup: 'onay-belgesi',
    sablonlar: [
      { dosya_adi: 'dogrudan-temin-onay-belgesi', etiket: 'Doğrudan Temin' },
      { dosya_adi: 'idare-onay-belgesi', etiket: 'İhale' },
      { dosya_adi: 'butce-sorgusu', etiket: 'Bütçe Sorgusu' }
    ]
  },
  // Harcama ailesi
  {
    grup: 'harcama',
    sablonlar: [
      { dosya_adi: 'harcama-talimati', etiket: 'Harcama Talimatı' },
      { dosya_adi: 'harcama-pusulasi', etiket: 'Harcama Pusulası' }
    ]
  },
  // Doğrudan Temin Sözleşmesi ailesi
  {
    grup: 'dt-sozlesmesi',
    sablonlar: [
      { dosya_adi: 'dogrudan-temin-sozlesmesi', etiket: 'Standart' },
      { dosya_adi: 'dogrudan-temin-sozlesmesi-alternatif', etiket: 'Alternatif' },
      { dosya_adi: 'dogrudan-temin-sozlesmesi-uzun', etiket: 'Uzun Form' }
    ]
  },
  // Dağıtım Çizelgesi ailesi
  {
    grup: 'dagitim-cizelgesi',
    sablonlar: [
      { dosya_adi: 'dagitim-cizelgesi', etiket: 'Standart' },
      { dosya_adi: 'dagitim-cizelgesi-karma', etiket: 'Karma' }
    ]
  },
  // Klasör Sırtlığı ailesi
  {
    grup: 'klasor-sirtligi',
    sablonlar: [
      { dosya_adi: 'klasor-sirtligi-3cm', etiket: '3 cm' },
      { dosya_adi: 'klasor-sirtligi-5cm', etiket: '5 cm' },
      { dosya_adi: 'klasor-sirtligi-7-5cm', etiket: '7.5 cm' }
    ]
  },
  // Kabul Edilen Teklif ailesi
  {
    grup: 'kabul-edilen-teklif',
    sablonlar: [
      { dosya_adi: 'kabul-edilen-teklif', etiket: 'Standart' },
      { dosya_adi: 'kabul-edilen-teklif-alternatif', etiket: 'Alternatif' }
    ]
  },
  // Muayene & Kabul ailesi
  {
    grup: 'muayene-kabul',
    sablonlar: [
      { dosya_adi: 'muayene-kabul-komisyonu', etiket: 'Komisyon' },
      { dosya_adi: 'muayene-kabul-tutanagi', etiket: 'Tutanak' }
    ]
  }
]

// Hızlı lookup: dosya_adi → { grup_adi, grup_siralama, etiket }
const TEMPLATE_GROUP_MAP = new Map<
  string,
  { grup_adi: string; grup_siralama: number; etiket: string }
>()
for (const g of TEMPLATE_GROUPS) {
  g.sablonlar.forEach((s, i) => {
    TEMPLATE_GROUP_MAP.set(s.dosya_adi, { grup_adi: g.grup, grup_siralama: i, etiket: s.etiket })
  })
}

const TEMPLATE_CATEGORIES: Record<string, string> = {
  '1-ihtiyac-tespiti-ve-baslangic': '1. İhtiyaç Tespiti & Başlangıç',
  '2-piyasa-fiyat-arastirmasi': '2. Piyasa Fiyat Araştırması',
  '3-siparis-ve-sozlesme': '3. Sipariş & Sözleşme',
  '4-kabul-ve-odeme-islemleri': '4. Muayene & Kabul & Ödeme İşlemleri',
  '5-klasor-ve-kapaklar': '5. Klasör & Kapaklar'
}

function seedTemplates(db: Database.Database): void {
  try {
    const templatesDirDev = path.join(app.getAppPath(), 'resources', 'templates')
    const templatesDirProd = path.join(process.resourcesPath, 'templates')
    const targetDir = fs.existsSync(templatesDirProd) ? templatesDirProd : templatesDirDev

    if (!fs.existsSync(targetDir)) return

    // Her şablonun navigasyon route'u — dosya_adi (uzantsız) → app route
    const ROUTE_BY_DOSYA_ADI: Record<string, string> = {
      // Komisyon
      'fiyat-arastirma-komisyonu-atama': '/dosya/komisyon/fiyat-arastirma',
      'komisyon-gorevlendirme-onayi': '/dosya/komisyon/fiyat-arastirma',
      'muayene-kabul-komisyonu-atama': '/dosya/komisyon/muayene-kabul',
      'muayene-kabul-komisyonu': '/dosya/komisyon/muayene-kabul',
      'fiyat-arastirma-ve-muayene-komisyonu': '/dosya/komisyon/fiyat-muayene',
      'komisyon-atama-onay-eki': '/dosya/komisyon/onay-eki',
      'komisyon-gorevlendirme-onayi-eki': '/dosya/komisyon/onay-eki',
      // Malzemeler
      'ihtiyac-listesi': '/dosya/malzemeler/liste',
      'ihtiyac-talep-formu': '/dosya/luzum/talep-formu',
      'malzeme-hizmet-kalem-listesi': '/dosya/malzemeler/liste',
      'son-alim-fiyat-cetveli': '/dosya/malzemeler/son-alim',
      // Lüzum
      'luzum-muzekkeresi-belgesi': '/dosya/luzum/belge',
      'luzum-muzekkeresi': '/dosya/luzum/belge',
      'luzum-onay-eki': '/dosya/luzum/onay-eki',
      'luzum-muzekkeresi-onay-eki': '/dosya/luzum/onay-eki',
      'teslim-tesellum-belgesi': '/dosya/luzum/teslim-tesellum',
      'luzum-muzekkeresi-teslim-tesellum': '/dosya/luzum/teslim-tesellum',
      // Firmalar / Maliyet
      'istekli-tedarikci-firmalar': '/dosya/firmalar-maliyet/istekliler',
      'yaklasik-maliyet-hesap-cetveli': '/dosya/firmalar-maliyet/yaklasik',
      'yaklasik-maliyet-cetveli': '/dosya/firmalar-maliyet/yaklasik',
      'piyasa-fiyat-arastirma-tutanagi': '/dosya/firmalar-maliyet/tutanak',
      // Onay
      'dogrudan-temin-onay-belgesi': '/dosya/onay/dt-onay',
      'ihale-onay-belgesi': '/dosya/onay/ihale-onay',
      'idare-onay-belgesi': '/dosya/onay/ihale-onay',
      'butce-sorgusu': '/dosya/onay/butce-sorgu',
      // Harcama
      'harcama-talimati': '/dosya/harcama/talimat',
      'harcama-pusulasi': '/dosya/harcama/pusula',
      // Kabul ve Ödeme İşlemleri (pure printable)
      'hakedis-raporu': '/dosya/cikti-merkezi',
      'hizmet-isleri-kabul-teklif-belgesi': '/dosya/cikti-merkezi',
      'hizmet-isleri-kabul-tutanagi': '/dosya/cikti-merkezi',
      'odeme-emri-belgesi': '/dosya/cikti-merkezi',
      'odeme-yazisi': '/dosya/cikti-merkezi',
      'tasinir-islem-fisi': '/dosya/cikti-merkezi',
      // Klasör ve Kapaklar
      'ihale-kapagi': '/dosya/cikti-merkezi',
      'kapak-ici-indeks-sablonu': '/dosya/cikti-merkezi',
      'klasor-sirtligi-3cm': '/dosya/cikti-merkezi',
      'klasor-sirtligi-5cm': '/dosya/cikti-merkezi',
      'klasor-sirtligi-7-5cm': '/dosya/cikti-merkezi',
      // Diğer Safha 2 ve 3 Belgeleri (pure printable)
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
          `
          INSERT INTO TANIM_Sablon (ad, dosya_adi, dosya_turu, icerik, aciklama, aktif_mi, kategori, test_verisi, html_yolu, json_yolu, route_path, grup_adi, grup_siralama)
          VALUES (?, ?, 'html', ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
        `
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
        console.log(`[Seed] Seeded default template: ${dosya_adi} in category: ${kategori}`)
      } else {
        if (existing.versiyon === 1) {
          db.prepare(
            `
            UPDATE TANIM_Sablon 
            SET ad = ?, kategori = ?, icerik = ?, test_verisi = ?, html_yolu = ?, json_yolu = ?, route_path = COALESCE(route_path, ?), grup_adi = ?, grup_siralama = ?
            WHERE id = ?
          `
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
          console.log(`[Seed] Updated default template: ${dosya_adi}`)
        } else {
          db.prepare(
            `
            UPDATE TANIM_Sablon 
            SET html_yolu = COALESCE(html_yolu, ?), json_yolu = COALESCE(json_yolu, ?), route_path = COALESCE(route_path, ?)
            WHERE id = ?
          `
          ).run(relativeHtmlPath, relativeJsonPath, route_path, existing.id)
        }
      }

      // Ayrıca bu şablonun bir sürece (route_path) bağlı olduğu belirtilmişse, bunu varsayılan ayar olarak settings tablosuna ekle.
      if (route_path) {
        let sablonId = existing ? existing.id : null
        if (!sablonId) {
          const newRow = db
            .prepare('SELECT id FROM TANIM_Sablon WHERE dosya_adi = ?')
            .get(dosya_adi) as any
          if (newRow) sablonId = newRow.id
        }
        if (sablonId) {
          const mappingKey = `MAPPING_${route_path}_SABLON_ID`
          // Sadece daha önce ayarlanmamışsa ekle (kullanıcı değiştirdiyse ezme)
          db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`).run(
            mappingKey,
            sablonId.toString()
          )
        }
      }
    }

    // ---- GRUP METAVERISI ZORUNLU GUNCELLEME ----
    // Her uygulama açılışında, TEMPLATE_GROUPS'taki tüm şablonların
    // grup_adi ve grup_siralama alanlarını güncelle.
    // versiyon fark etmeksizin — bu bir metadata alanıdır, kullanıcı verisini etkilemez.
    const updateGrup = db.prepare(
      `UPDATE TANIM_Sablon SET grup_adi = ?, grup_siralama = ? WHERE dosya_adi = ?`
    )
    for (const [dosyaAdi, bilgi] of TEMPLATE_GROUP_MAP.entries()) {
      updateGrup.run(bilgi.grup_adi, bilgi.grup_siralama, `${dosyaAdi}.html`)
    }
    console.log(`[Seed] Grup metadata güncellendi: ${TEMPLATE_GROUP_MAP.size} şablon`)
    // NULL yapmak istiyorsak (grup dışına çıkarılan eski şablonlar için) bunu atlayabiliriz.
    // Şimdilik sadece aktif grupları güncelliyoruz.
  } catch (err: any) {
    console.error('Error seeding templates:', err)
  }
}

export class DtmWorkspace {
  private tempDir: string
  private db: Database.Database | null = null
  private currentFilePath: string | null = null
  private meta: WorkspaceMeta | null = null
  private initialHash: string = ''

  constructor() {
    this.tempDir = path.join(app.getPath('userData'), 'dtm_temp', Date.now().toString())
  }

  public openWorkspace(filePath: string, allowMigration: boolean = false): WorkspaceMeta {
    const lockPath = filePath + '.lock'
    if (fs.existsSync(lockPath)) {
      try {
        const pidStr = fs.readFileSync(lockPath, 'utf-8')
        const pid = parseInt(pidStr, 10)
        if (!isNaN(pid) && pid !== process.pid) {
          let isRunning = false
          try {
            process.kill(pid, 0)
            isRunning = true
          } catch (e) {
            isRunning = false
          }
          if (!isRunning) {
            // Ölü kilit dosyası tespit edildi, sil ve devam et
            fs.unlinkSync(lockPath)
          } else {
            throw new Error(
              'LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.'
            )
          }
        } else if (isNaN(pid)) {
          throw new Error(
            'LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.'
          )
        }
      } catch (err: any) {
        if (err.message.startsWith('LOCKED|')) throw err
        throw new Error(
          'LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.'
        )
      }
    }

    try {
      fs.writeFileSync(lockPath, process.pid.toString(), { encoding: 'utf-8' })
    } catch (err: any) {
      throw new Error(`Kilit dosyası oluşturulamadı: ${err.message}`)
    }

    this.currentFilePath = filePath
    this.ensureTempDir()

    const zipBuffer = fs.readFileSync(filePath)

    // Sağ Tık -> Yeni ile oluşturulmuş 0 baytlık bir dosya ise,
    // yeni bir çalışma alanı olarak başlat (boş zip hatası almamak için)
    if (zipBuffer.length === 0) {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath)
      }
      return this.createWorkspace(filePath, 'Yeni Kurum')
    }

    const zip = new AdmZip(zipBuffer)
    zip.extractAllTo(this.tempDir, true)

    const metaPath = path.join(this.tempDir, 'meta.json')
    let rawMeta: any = {}
    if (fs.existsSync(metaPath)) {
      const rawMetaContent = fs.readFileSync(metaPath, 'utf-8')
      rawMeta = JSON.parse(rawMetaContent)
    } else {
      throw new Error('Geçersiz dosya: meta.json bulunamadı.')
    }

    const meta = normalizeMeta(rawMeta)

    // Hash Validation
    if (meta.integrity_hash) {
      const expectedHash = calculateIntegrityHash(meta)
      if (meta.integrity_hash !== expectedHash) {
        meta.warnings?.push(
          'UYARI: meta.json değerleri bozulmuş veya dışarıdan değiştirilmiş olabilir (Hash uyuşmazlığı).'
        )
      }
    }

    const SUPPORTED_DTAL_VERSION = 1.0
    if (parseFloat(meta.dtal_version) > SUPPORTED_DTAL_VERSION) {
      throw new Error(`Bu dosya daha yeni bir dtal formatı gerektirir.`)
    }

    if (meta.schema_version > CURRENT_SCHEMA_VERSION) {
      meta.warnings?.push(
        `UYARI: Bu dosya (v${meta.schema_version}) daha yeni bir uygulama sürümü gerektiriyor olabilir. Uyumsuzluk yaşamamak için lütfen uygulamanızı güncelleyin.`
      )
    }

    const fromVersion = meta.schema_version || 1

    if (fromVersion < CURRENT_SCHEMA_VERSION) {
      if (!allowMigration) {
        const pendingUpdates = getPendingMigrations(fromVersion)
        if (pendingUpdates.length > 0) {
          const payload = JSON.stringify({ requiresMigration: true, pendingUpdates })
          throw new Error(`MIGRATION_REQUIRED|${payload}`)
        }
      }

      const backupPath = filePath + '.bak'
      try {
        fs.copyFileSync(filePath, backupPath)
      } catch (err: any) {
        throw new Error(`Dosya yedeklenirken hata oluştu: ${err.message}`)
      }

      try {
        const dbFileName = meta.active_db_file || 'database.sqlite'
        const dbPath = path.join(this.tempDir, dbFileName)
        this.db = new Database(dbPath)

        runMigrations(this.db, fromVersion, schema)
        ensureSchemaIntegrity(this.db)

        meta.schema_version = CURRENT_SCHEMA_VERSION
        meta.app_version = app.getVersion()
        meta.platform = process.platform
        meta.file_version = (meta.file_version || 0) + 1
        meta.updated_at = new Date().toISOString()
        meta.integrity_hash = calculateIntegrityHash(meta)
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))

        this.saveWorkspace()

        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath)
        }
      } catch (migrationError: any) {
        console.error(
          'Veritabanı güncellemesi başarısız oldu, değişiklikler geri alınıyor:',
          migrationError
        )

        if (this.db) {
          try {
            this.db.close()
          } catch (e) {}
          this.db = null
        }

        try {
          if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, filePath)
            fs.unlinkSync(backupPath)
          }
        } catch (rollbackErr: any) {
          console.error('Yedek dosya geri yüklenirken hata oluştu:', rollbackErr)
        }

        this.ensureTempDir()
        throw new Error(
          `Dosya güncellenirken kritik bir hata oluştu ve işlem iptal edildi. Veri kaybı olmaması için dosya eski haline döndürüldü.\nHata Detayı: ${migrationError.message}`
        )
      }
    } else {
      const dbFileName = meta.active_db_file || 'database.sqlite'
      const dbPath = path.join(this.tempDir, dbFileName)
      this.db = new Database(dbPath)
    }

    if (this.db) {
      ensureSchemaIntegrity(this.db)
      seedTemplates(this.db)
    }

    // Cross Validation
    if (this.db) {
      try {
        const row = this.db
          .prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'")
          .get() as { value: string } | undefined
        const dbSchemaVer = row && row.value ? parseInt(row.value, 10) : 1
        if (dbSchemaVer !== meta.schema_version) {
          meta.warnings?.push(
            `UYARI: meta.json içindeki sürüm (${meta.schema_version}) ile veritabanı sürümü (${dbSchemaVer}) uyuşmuyor. Dosya elle değiştirilmiş olabilir.`
          )
        }
      } catch (e) {
        // Silently ignore
      }
    }

    // Otomatik uzantıyı .hkmp yapma mantığı (Eski formatlar için)
    if (!filePath.toLowerCase().endsWith('.hkmp')) {
      const ext = path.extname(filePath)
      const fileName = path.basename(filePath)
      const response = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Evet, (.hkmp) Formatına Yükselt (Önerilen)', 'Hayır, Eski Uzantıda Devam Et'],
        defaultId: 0,
        title: 'Dosya Formatı Yükseltme',
        message: `"${fileName}" dosyası eski bir formatta (${ext || 'uzantısız'}).\n\nUygulama performansı ve tam uyumluluk için dosyanın yeni TEMİN 360 (.hkmp) formatına yükseltilmesi önerilir.\n\nDosya formatı .hkmp olarak güncellensin mi?`
      })

      if (response === 0) {
        const newFilePath = filePath.substring(0, filePath.length - ext.length) + '.hkmp'

        const newLockPath = newFilePath + '.lock'
        try {
          fs.writeFileSync(newLockPath, process.pid.toString(), { encoding: 'utf-8' })

          // Asıl dosyayı da yeniden adlandır ki kullanıcı eski dosyayı tekrar açmasın
          if (fs.existsSync(filePath)) {
            fs.renameSync(filePath, newFilePath)
          }

          if (fs.existsSync(lockPath)) {
            fs.unlinkSync(lockPath)
          }
          this.currentFilePath = newFilePath

          // Son açılanlar listesini güncelle
          try {
            recentFilesStore.removeRecentFile(filePath)
            const instName = meta.institution || path.basename(newFilePath, '.hkmp')
            recentFilesStore.addRecentFile(newFilePath, instName)
          } catch (recentErr) {
            console.error('Son açılanlar güncellenirken hata:', recentErr)
          }
        } catch (err: any) {
          console.error('Uzantı değiştirilirken hata oluştu:', err)
          // Eğer adlandırma başarısız olursa (ör. izin hatası), en azından orijinal yolda kal
          this.currentFilePath = filePath
        }
      }
    }

    this.meta = meta
    this.initialHash = this.calculateCurrentHash()
    return meta
  }

  public createWorkspace(filePath: string, institutionName: string): WorkspaceMeta {
    if (!filePath.toLowerCase().endsWith('.hkmp')) {
      const ext = path.extname(filePath)
      filePath = (ext ? filePath.substring(0, filePath.length - ext.length) : filePath) + '.hkmp'
    }
    const lockPath = filePath + '.lock'
    if (fs.existsSync(lockPath)) {
      try {
        const lockContent = fs.readFileSync(lockPath, 'utf-8')
        const pid = parseInt(lockContent.trim(), 10)
        if (!isNaN(pid) && pid !== process.pid) {
          let isRunning = false
          try {
            process.kill(pid, 0)
            isRunning = true
          } catch (e) {
            isRunning = false
          }
          if (!isRunning) {
            fs.unlinkSync(lockPath)
          } else {
            throw new Error(
              'LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.'
            )
          }
        } else if (pid === process.pid) {
          fs.unlinkSync(lockPath)
        }
      } catch (err: any) {
        if (err.message.startsWith('LOCKED|')) throw err
        throw new Error(
          'LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.'
        )
      }
    }

    try {
      fs.writeFileSync(lockPath, process.pid.toString(), { encoding: 'utf-8' })
    } catch (err: any) {
      throw new Error(`Kilit dosyası oluşturulamadı: ${err.message}`)
    }

    try {
      this.currentFilePath = filePath
      this.ensureTempDir()

      const dbPath = path.join(this.tempDir, 'database.sqlite')
      this.db = new Database(dbPath)

      initializeDatabase(this.db, institutionName)

      try {
        const insertStmt = this.db.prepare(`
          INSERT OR IGNORE INTO TANIM_TasinirKod (tam_kod, hesap_kodu, duzey_1, duzey_2, duzey_3, duzey_4, duzey_5, aciklama)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        const seedTx = this.db.transaction((rows: any[]) => {
          for (const row of rows) {
            insertStmt.run(
              row.tam_kod,
              row.hesap_kodu,
              row.duzey_1,
              row.duzey_2,
              row.duzey_3,
              row.duzey_4,
              row.duzey_5,
              row.aciklama
            )
          }
        })
        seedTx(tasinirKodlariSeed)
      } catch (err) {
        console.error('Tasinir Kodlari tohumlama sirasinda hata:', err)
      }

      const meta: WorkspaceMeta = {
        dtal_version: '1.0',
        app_version: app.getVersion(),
        created_at: new Date().toISOString().split('T')[0],
        institution: institutionName,
        schema_version: CURRENT_SCHEMA_VERSION,
        platform: process.platform,
        file_version: 1,
        active_db_file: 'database.sqlite',
        updated_at: new Date().toISOString(),
        warnings: []
      }
      meta.integrity_hash = calculateIntegrityHash(meta)

      const metaPath = path.join(this.tempDir, 'meta.json')
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))

      fs.mkdirSync(path.join(this.tempDir, 'attachments'))

      seedTemplates(this.db)

      this.saveWorkspace()

      this.meta = meta
      this.initialHash = this.calculateCurrentHash()
      return meta
    } catch (createErr: any) {
      if (fs.existsSync(lockPath)) {
        try {
          fs.unlinkSync(lockPath)
        } catch (e) {}
      }
      this.currentFilePath = null
      throw createErr
    }
  }

  public saveWorkspace(): void {
    if (!this.currentFilePath || !this.db) {
      throw new Error('Hiçbir veri dosyası açık değil.')
    }

    try {
      const checkpointInfo = this.db.pragma('wal_checkpoint(TRUNCATE)')
      console.log('WAL Checkpoint result:', checkpointInfo)
    } catch (err) {
      console.error('WAL Checkpoint failed:', err)
    }

    const metaPath = path.join(this.tempDir, 'meta.json')
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as WorkspaceMeta
      meta.updated_at = new Date().toISOString()
      meta.app_version = app.getVersion()
      meta.platform = process.platform

      try {
        const row = this.db
          .prepare("SELECT value FROM settings WHERE key = 'institutionName'")
          .get() as { value: string } | undefined
        if (row && row.value) {
          meta.institution = row.value
        }
      } catch (e) {
        console.error('Failed to sync institution name from DB to meta.json:', e)
      }

      try {
        const row = this.db
          .prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'")
          .get() as { value: string } | undefined
        if (row && row.value) {
          meta.schema_version = parseInt(row.value, 10) || CURRENT_SCHEMA_VERSION
        }
      } catch (e) {
        console.error('Failed to sync dbSchemaVersion from DB to meta.json:', e)
      }

      meta.integrity_hash = calculateIntegrityHash(meta)
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
      this.meta = meta
    }

    try {
      console.log(`Starting to zip temp folder: ${this.tempDir} into ${this.currentFilePath}`)
      const zip = new AdmZip()
      zip.addLocalFolder(this.tempDir)
      zip.writeZip(this.currentFilePath)
      console.log('Workspace saved successfully to zip.')
    } catch (zipErr) {
      console.error('Error while writing zip file:', zipErr)
      throw new Error('Dosya kaydedilirken hata oluştu: ' + (zipErr as Error).message)
    }
  }

  public closeWorkspace(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }

    if (this.currentFilePath) {
      const lockPath = this.currentFilePath + '.lock'
      if (fs.existsSync(lockPath)) {
        try {
          fs.unlinkSync(lockPath)
        } catch (e) {}
      }
    }

    this.currentFilePath = null
    this.meta = null

    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true })
    }
  }

  public replaceDatabase(sourceSqlitePath: string): void {
    if (!this.currentFilePath || !this.db || !this.meta) {
      throw new Error('Açık bir çalışma alanı yok.')
    }

    // Close current connection
    this.db.close()

    // Replace the database file with a versioned name
    const newDbName = `database_${Date.now()}.sqlite`
    const dbPath = path.join(this.tempDir, newDbName)
    fs.copyFileSync(sourceSqlitePath, dbPath)

    // Update meta
    this.meta.active_db_file = newDbName

    // Reopen connection
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')

    // Ensure schema integrity on the imported database
    ensureSchemaIntegrity(this.db)

    // Save to the .dtal file
    this.saveWorkspace()
  }

  public getDb(): Database.Database {
    if (!this.db) throw new Error('Veritabanı bağlı değil.')
    return this.db
  }

  public getDbPath(): string {
    if (!this.tempDir) throw new Error('Geçici dizin yok.')
    const dbFileName = this.meta?.active_db_file || 'database.sqlite'
    return path.join(this.tempDir, dbFileName)
  }

  public getMeta(): WorkspaceMeta | null {
    return this.meta
  }

  public getCurrentFilePath(): string | null {
    return this.currentFilePath
  }

  public calculateCurrentHash(): string {
    if (!this.db || !this.tempDir) return ''
    try {
      try {
        this.db.pragma('wal_checkpoint(TRUNCATE)')
      } catch {}
      const dbPath = path.join(this.tempDir, 'database.sqlite')
      if (!fs.existsSync(dbPath)) return ''
      const content = fs.readFileSync(dbPath)
      const hash = crypto.createHash('sha256').update(content)
      const attachDir = path.join(this.tempDir, 'attachments')
      if (fs.existsSync(attachDir)) {
        const files = fs.readdirSync(attachDir)
        for (const f of files.sort()) {
          const fPath = path.join(attachDir, f)
          try {
            const stat = fs.statSync(fPath)
            hash.update(`${f}:${stat.size}:${stat.mtimeMs}`)
          } catch {}
        }
      }
      return hash.digest('hex')
    } catch (e) {
      console.error('Error calculating workspace hash:', e)
      return ''
    }
  }

  public hasChanges(target: 'gdrive' | 'email' | 'any' = 'any'): boolean {
    if (!this.db || !this.currentFilePath) return false
    const current = this.calculateCurrentHash()
    if (!current) return false

    if (target === 'gdrive') {
      try {
        const row = this.db
          .prepare("SELECT value FROM settings WHERE key = 'lastGdriveSyncHash'")
          .get() as { value?: string }
        if (row?.value) {
          return row.value !== current
        }
      } catch {}
      return current !== this.initialHash
    }

    if (target === 'email') {
      try {
        const row = this.db
          .prepare("SELECT value FROM settings WHERE key = 'lastEmailSyncHash'")
          .get() as { value?: string }
        if (row?.value) {
          return row.value !== current
        }
      } catch {}
      return current !== this.initialHash
    }

    return current !== this.initialHash
  }

  public markSynced(target: 'gdrive' | 'email'): void {
    if (!this.db) return
    const current = this.calculateCurrentHash()
    if (!current) return
    try {
      const key = target === 'gdrive' ? 'lastGdriveSyncHash' : 'lastEmailSyncHash'
      this.db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).run(key, current)
      console.log(`[Workspace] Marked ${target} synced with hash: ${current.substring(0, 8)}...`)
    } catch (err) {
      console.error(`Failed to mark ${target} synced:`, err)
    }
  }

  private ensureTempDir() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true })
    }
    fs.mkdirSync(this.tempDir, { recursive: true })
  }
}

let activeWorkspace: DtmWorkspace | null = null

export const workspaceManager = {
  create: (filePath: string, institutionName: string) => {
    if (activeWorkspace) activeWorkspace.closeWorkspace()
    activeWorkspace = new DtmWorkspace()
    return activeWorkspace.createWorkspace(filePath, institutionName)
  },
  open: (filePath: string, allowMigration: boolean = false) => {
    if (activeWorkspace) activeWorkspace.closeWorkspace()
    activeWorkspace = new DtmWorkspace()
    return activeWorkspace.openWorkspace(filePath, allowMigration)
  },
  save: () => {
    if (activeWorkspace) activeWorkspace.saveWorkspace()
  },
  hasChanges: (target?: 'gdrive' | 'email' | 'any') => {
    if (!activeWorkspace) return false
    return activeWorkspace.hasChanges(target)
  },
  markSynced: (target: 'gdrive' | 'email') => {
    if (!activeWorkspace) return
    activeWorkspace.markSynced(target)
  },
  getCurrentHash: () => {
    if (!activeWorkspace) return ''
    return activeWorkspace.calculateCurrentHash()
  },
  close: () => {
    if (activeWorkspace) {
      activeWorkspace.closeWorkspace()
      activeWorkspace = null
    }
  },
  getDb: () => {
    if (!activeWorkspace) throw new Error('Açık bir veri dosyası yok.')
    return activeWorkspace.getDb()
  },
  getMeta: () => {
    if (!activeWorkspace) return null
    return activeWorkspace.getMeta()
  },
  getCurrentFilePath: () => {
    if (!activeWorkspace) return null
    return activeWorkspace.getCurrentFilePath()
  },
  getDbPath: () => {
    if (!activeWorkspace) throw new Error('Açık bir çalışma dosyası yok.')
    return activeWorkspace.getDbPath()
  },
  replaceDatabase: (sourceSqlitePath: string) => {
    if (!activeWorkspace) throw new Error('Açık bir çalışma dosyası yok.')
    activeWorkspace.replaceDatabase(sourceSqlitePath)
  },
  getDatabaseSchema: () => {
    if (!activeWorkspace) return null
    try {
      const db = activeWorkspace.getDb()
      const tables = db
        .prepare(
          "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        .all() as { name: string; sql: string }[]
      return tables.map((t) => t.sql).join('\n\n')
    } catch (e) {
      console.error('Failed to get schema for AI:', e)
      return null
    }
  },
  uploadAttachment: (sourcePath: string) => {
    if (!activeWorkspace) throw new Error('Açık bir çalışma dosyası yok.')
    const tempDir = (activeWorkspace as any).tempDir
    if (!tempDir) throw new Error('Geçici çalışma dizini bulunamadı.')

    const attachmentsDir = path.join(tempDir, 'attachments')
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir, { recursive: true })
    }

    const fileExt = path.extname(sourcePath)
    const baseName = path.basename(sourcePath, fileExt)
    const safeName = `${baseName}_${Date.now()}${fileExt}`.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const destPath = path.join(attachmentsDir, safeName)

    fs.copyFileSync(sourcePath, destPath)
    activeWorkspace.saveWorkspace()
    return { fileName: safeName, relativePath: `attachments/${safeName}` }
  },
  openAttachment: async (relativePath: string) => {
    if (!activeWorkspace) throw new Error('Açık bir çalışma dosyası yok.')
    const tempDir = (activeWorkspace as any).tempDir
    if (!tempDir) throw new Error('Geçici çalışma dizini bulunamadı.')

    const fullPath = path.join(tempDir, relativePath)
    if (fs.existsSync(fullPath)) {
      const { shell } = require('electron')
      await shell.openPath(fullPath)
      return true
    }
    return false
  }
}

// Ensure lock is cleared if the process exits
process.on('exit', () => {
  if (activeWorkspace) {
    try {
      activeWorkspace.closeWorkspace()
    } catch (e) {}
  }
})
