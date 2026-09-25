import AdmZip from 'adm-zip'
import Database from 'better-sqlite3'
import { app, BrowserWindow, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { initializeDatabase, schema } from './index'
import { runMigrations, CURRENT_SCHEMA_VERSION, getPendingMigrations } from '@dt/database'
import tasinirKodlariSeed from './seed/tasinir_kodlari.json'
import yiUfeSeed from './seed/yi_ufe_endeksleri.json'
import { allExtensions, defaultFormat } from '../config/fileFormats'
import { TABLE_FRIENDLY_NAMES } from '../../shared/constants/databaseConstants'
import {
  TEMPLATE_NAMES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_GROUPS,
  DEFAULT_YAKLASIK_SABLONLAR,
  DEFAULT_MUAYENE_SABLONLAR
} from '../../shared/constants/templateConstants'

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

export interface MutationSummaryItem {
  tableName: string
  title: string
  action: 'insert' | 'update' | 'delete' | 'other'
  actionLabel: string
  count: number
  lastTime: string
}

export { TABLE_FRIENDLY_NAMES }

export function extractTableAndAction(sql: string): {
  tableName: string
  action: 'insert' | 'update' | 'delete' | 'other'
} {
  if (!sql || typeof sql !== 'string') return { tableName: 'Veritabanı', action: 'other' }
  const clean = sql.trim().replace(/\s+/g, ' ')
  const upper = clean.toUpperCase()
  let action: 'insert' | 'update' | 'delete' | 'other' = 'other'

  if (upper.startsWith('INSERT')) action = 'insert'
  else if (upper.startsWith('UPDATE')) action = 'update'
  else if (upper.startsWith('DELETE')) action = 'delete'

  let tableName = 'Veritabanı'
  const match = clean.match(
    /(?:FROM|INTO|UPDATE)\s+(?:["`'\[]?[A-Za-z0-9_]+["`'\]]?\.)?["`'\[]?([A-Za-z0-9_]+)["`'\]]?/i
  )
  if (match && match[1]) {
    tableName = match[1]
  }
  return { tableName, action }
}

export function ensureSchemaIntegrity(db: Database.Database): void {
  // Ensure basic settings & migrations tracking tables exist
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `)
  } catch {}

  // Automatic versioned migration check inside ensureSchemaIntegrity
  try {
    const row = db
      .prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'")
      .get() as { value?: string } | undefined
    const currentDbVer = row?.value ? parseInt(row.value, 10) || 1 : 1
    if (currentDbVer < CURRENT_SCHEMA_VERSION) {
      console.log(`[Schema Self-Healing] Running pending migrations from v${currentDbVer} to v${CURRENT_SCHEMA_VERSION}`)
      runMigrations(db, currentDbVer, schema)
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('dbSchemaVersion', ?)").run(
        CURRENT_SCHEMA_VERSION.toString()
      )
    }
  } catch (err: any) {
    console.warn('[Schema Self-Healing] Could not run versioned migrations check:', err.message)
  }

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
    { name: 'tarih', def: 'DATE' },
    { name: 'temin_tarihi', def: 'DATE' },
    { name: 'dosya_acilis_tarihi', def: 'DATE' },
    { name: 'temin_no', def: 'TEXT' },
    { name: 'evrak_sayisi', def: 'TEXT' },
    { name: 'hesaplama_esasi', def: "TEXT DEFAULT 'ortalama'" },
    { name: 'komisyon_takdiri', def: 'TEXT' },
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

  // Explicit migration for TANIM_Personel extended columns
  const personelExtendedColumns = [
    { name: 'gorev', def: 'TEXT' },
    { name: 'unvan', def: 'TEXT' },
    { name: 'birim', def: 'TEXT' },
    { name: 'avatar', def: 'TEXT' }
  ]
  for (const c of personelExtendedColumns) {
    try {
      db.exec(`ALTER TABLE TANIM_Personel ADD COLUMN "${c.name}" ${c.def};`)
    } catch {}
  }

  // Ensure default unit conversions exist in TANIM_BirimDonusum
  try {
    const donusumCountRes = db.prepare('SELECT COUNT(*) as cnt FROM TANIM_BirimDonusum').get() as {
      cnt: number
    }
    if (donusumCountRes.cnt === 0) {
      const getBirimId = (ad: string) => {
        const row = db
          .prepare('SELECT id FROM TANIM_OlcuBirimi WHERE ad = ? COLLATE NOCASE')
          .get(ad) as { id: number } | undefined
        return row?.id
      }

      const insertDonusum = db.prepare(`
        INSERT OR IGNORE INTO TANIM_BirimDonusum (kaynak_birim_id, hedef_birim_id, donusum_faktoru, formul, ters_formul, aciklama, aktif_mi)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `)

      const defaultConversions = [
        // Ağırlık
        {
          from: 'Kilogram',
          to: 'Gram',
          factor: 1000,
          formula: 'x * 1000',
          rev: 'x / 1000',
          desc: '1 kg = 1000 g'
        },
        {
          from: 'Gram',
          to: 'Kilogram',
          factor: 0.001,
          formula: 'x / 1000',
          rev: 'x * 1000',
          desc: '1 g = 0.001 kg'
        },
        {
          from: 'Ton',
          to: 'Kilogram',
          factor: 1000,
          formula: 'x * 1000',
          rev: 'x / 1000',
          desc: '1 ton = 1000 kg'
        },
        {
          from: 'Kilogram',
          to: 'Ton',
          factor: 0.001,
          formula: 'x / 1000',
          rev: 'x * 1000',
          desc: '1 kg = 0.001 ton'
        },
        {
          from: 'Gram',
          to: 'Miligram',
          factor: 1000,
          formula: 'x * 1000',
          rev: 'x / 1000',
          desc: '1 g = 1000 mg'
        },

        // Uzunluk
        {
          from: 'Kilometre',
          to: 'Metre',
          factor: 1000,
          formula: 'x * 1000',
          rev: 'x / 1000',
          desc: '1 km = 1000 m'
        },
        {
          from: 'Metre',
          to: 'Kilometre',
          factor: 0.001,
          formula: 'x / 1000',
          rev: 'x * 1000',
          desc: '1 m = 0.001 km'
        },
        {
          from: 'Metre',
          to: 'Santimetre',
          factor: 100,
          formula: 'x * 100',
          rev: 'x / 100',
          desc: '1 m = 100 cm'
        },
        {
          from: 'Santimetre',
          to: 'Metre',
          factor: 0.01,
          formula: 'x / 100',
          rev: 'x * 100',
          desc: '1 cm = 0.01 m'
        },
        {
          from: 'Metre',
          to: 'Milimetre',
          factor: 1000,
          formula: 'x * 1000',
          rev: 'x / 1000',
          desc: '1 m = 1000 mm'
        },
        {
          from: 'Santimetre',
          to: 'Milimetre',
          factor: 10,
          formula: 'x * 10',
          rev: 'x / 10',
          desc: '1 cm = 10 mm'
        },
        {
          from: 'İnç',
          to: 'Santimetre',
          factor: 2.54,
          formula: 'x * 2.54',
          rev: 'x / 2.54',
          desc: '1 in = 2.54 cm'
        },

        // Alan
        {
          from: 'Metrekare',
          to: 'Santimetrekare',
          factor: 10000,
          formula: 'x * 10000',
          rev: 'x / 10000',
          desc: '1 m² = 10.000 cm²'
        },
        {
          from: 'Hektar',
          to: 'Metrekare',
          factor: 10000,
          formula: 'x * 10000',
          rev: 'x / 10000',
          desc: '1 ha = 10.000 m²'
        },
        {
          from: 'Dönüm',
          to: 'Metrekare',
          factor: 1000,
          formula: 'x * 1000',
          rev: 'x / 1000',
          desc: '1 dönüm = 1000 m²'
        },

        // Hacim
        {
          from: 'Litre',
          to: 'Mililitre',
          factor: 1000,
          formula: 'x * 1000',
          rev: 'x / 1000',
          desc: '1 L = 1000 ml'
        },
        {
          from: 'Mililitre',
          to: 'Litre',
          factor: 0.001,
          formula: 'x / 1000',
          rev: 'x * 1000',
          desc: '1 ml = 0.001 L'
        },
        {
          from: 'Metreküp',
          to: 'Litre',
          factor: 1000,
          formula: 'x * 1000',
          rev: 'x / 1000',
          desc: '1 m³ = 1000 L'
        },
        {
          from: 'Galon',
          to: 'Litre',
          factor: 3.78541,
          formula: 'x * 3.78541',
          rev: 'x / 3.78541',
          desc: '1 gal ≈ 3.785 L'
        },

        // Adet
        {
          from: 'Deste',
          to: 'Adet',
          factor: 10,
          formula: 'x * 10',
          rev: 'x / 10',
          desc: '1 deste = 10 adet'
        },
        {
          from: 'Düzine',
          to: 'Adet',
          factor: 12,
          formula: 'x * 12',
          rev: 'x / 12',
          desc: '1 düzine = 12 adet'
        },
        {
          from: 'Çift',
          to: 'Adet',
          factor: 2,
          formula: 'x * 2',
          rev: 'x / 2',
          desc: '1 çift = 2 adet'
        },

        // Zaman
        {
          from: 'Gün',
          to: 'Saat',
          factor: 24,
          formula: 'x * 24',
          rev: 'x / 24',
          desc: '1 gün = 24 saat'
        },
        {
          from: 'Saat',
          to: 'Dakika',
          factor: 60,
          formula: 'x * 60',
          rev: 'x / 60',
          desc: '1 sa = 60 dk'
        },
        {
          from: 'Hafta',
          to: 'Gün',
          factor: 7,
          formula: 'x * 7',
          rev: 'x / 7',
          desc: '1 hafta = 7 gün'
        },
        {
          from: 'Ay',
          to: 'Gün',
          factor: 30,
          formula: 'x * 30',
          rev: 'x / 30',
          desc: '1 ay ≈ 30 gün'
        },
        {
          from: 'Yıl',
          to: 'Gün',
          factor: 365,
          formula: 'x * 365',
          rev: 'x / 365',
          desc: '1 yıl = 365 gün'
        },

        // Sıcaklık (Formüllü)
        {
          from: 'Santigrat',
          to: 'Fahrenhayt',
          factor: 0,
          formula: '(x * 9/5) + 32',
          rev: '(x - 32) * 5/9',
          desc: '°F = (°C × 9/5) + 32'
        },
        {
          from: 'Fahrenhayt',
          to: 'Santigrat',
          factor: 0,
          formula: '(x - 32) * 5/9',
          rev: '(x * 9/5) + 32',
          desc: '°C = (°F - 32) × 5/9'
        },
        {
          from: 'Santigrat',
          to: 'Kelvin',
          factor: 0,
          formula: 'x + 273.15',
          rev: 'x - 273.15',
          desc: 'K = °C + 273.15'
        },
        {
          from: 'Kelvin',
          to: 'Santigrat',
          factor: 0,
          formula: 'x - 273.15',
          rev: 'x + 273.15',
          desc: '°C = K - 273.15'
        }
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

    const ufeCount = db.prepare('SELECT COUNT(*) as cnt FROM TANIM_YiUfeEndeks').get() as {
      cnt: number
    }
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
      console.log(
        `[Schema Self-Healing] Seeded ${(yiUfeSeed as any).monthly.length} Yİ-ÜFE monthly records into TANIM_YiUfeEndeks`
      )
    }
  } catch (e: any) {
    console.error('[Schema Self-Healing] TANIM_YiUfeEndeks initialization failed:', e.message)
  }

  // Ensure DATA_NotVeGorev exists for Notes & To-Do List functionality
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS DATA_NotVeGorev (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        temin_dosya_id INTEGER,
        baslik TEXT NOT NULL,
        icerik TEXT,
        tip TEXT DEFAULT 'todo',
        kategori TEXT DEFAULT 'Genel',
        oncelik TEXT DEFAULT 'orta',
        tamamlandi INTEGER DEFAULT 0,
        tamamlanma_tarihi DATETIME,
        vade_tarihi TEXT,
        renk TEXT DEFAULT 'slate',
        sabitlendi INTEGER DEFAULT 0,
        sira INTEGER DEFAULT 0,
        etiketler TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_notlar_temin_dosya ON DATA_NotVeGorev(temin_dosya_id);
      CREATE INDEX IF NOT EXISTS idx_notlar_tamamlandi ON DATA_NotVeGorev(tamamlandi);
      CREATE INDEX IF NOT EXISTS idx_notlar_tip ON DATA_NotVeGorev(tip);
    `)
  } catch (e: any) {
    console.error('[Schema Self-Healing] DATA_NotVeGorev initialization failed:', e.message)
  }

  // Ensure TANIM_DetsisCache exists for DETSİS Verification & Caching
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS TANIM_DetsisCache (
        detsis_no TEXT PRIMARY KEY,
        is_verified INTEGER DEFAULT 0,
        birim_adi TEXT,
        kurum_adi TEXT,
        kurum_hiyerarsisi TEXT,
        ulke_adi TEXT,
        il_adi TEXT,
        ilce_adi TEXT,
        kategori_adi TEXT,
        statu_adi TEXT,
        logo_base64 TEXT,
        ingilizce_adi TEXT,
        url TEXT,
        status_code INTEGER,
        response_data TEXT,
        verified_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_detsis_no ON TANIM_DetsisCache(detsis_no);
    `)

    // Self-healing columns for existing cache tables
    const detsisCols = [
      'kurum_hiyerarsisi',
      'ulke_adi',
      'il_adi',
      'ilce_adi',
      'kategori_adi',
      'statu_adi',
      'logo_base64',
      'ingilizce_adi'
    ]
    const currentCols = (db.prepare(`PRAGMA table_info(TANIM_DetsisCache)`).all() as any[]).map(
      (c) => c.name
    )
    for (const col of detsisCols) {
      if (!currentCols.includes(col)) {
        try {
          db.exec(`ALTER TABLE TANIM_DetsisCache ADD COLUMN ${col} TEXT;`)
        } catch {}
      }
    }
  } catch (e: any) {
    console.error('[Schema Self-Healing] TANIM_DetsisCache initialization failed:', e.message)
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
            try {
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
            } catch (colErr: any) {
              if (!colErr.message?.includes('duplicate column name')) {
                console.warn(`[Schema Self-Healing] Could not add column ${table.name}.${col.name}:`, colErr.message)
              }
            }
          }
        }
      }
      // Self-heal missing initial data
      if (table.initialData && table.initialData.length > 0) {
        table.initialData.forEach((row: any) => {
          try {
            const keys = Object.keys(row)
            const values = Object.values(row).map((v) =>
              typeof v === 'string' ? "'" + (v as string).replace(/'/g, "''") + "'" : v
            )
            db.exec(
              `INSERT OR IGNORE INTO ${table.name} (${keys.join(', ')}) VALUES (${values.join(
                ', '
              )});`
            )
          } catch {}
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

  // Ensure DATA_TeminKomisyon and TANIM_KomisyonUye have necessary columns
  try {
    const checkTK = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_TeminKomisyon'")
      .get()
    if (checkTK) {
      const cols = (db.prepare('PRAGMA table_info(DATA_TeminKomisyon)').all() as any[]).map(
        (c) => c.name
      )
      if (!cols.includes('komisyon_turu')) {
        db.prepare('ALTER TABLE DATA_TeminKomisyon ADD COLUMN komisyon_turu TEXT').run()
      }
      if (!cols.includes('belgede_goster')) {
        db.prepare(
          'ALTER TABLE DATA_TeminKomisyon ADD COLUMN belgede_goster INTEGER DEFAULT 1'
        ).run()
      }
    }
    const checkKU = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='TANIM_KomisyonUye'")
      .get()
    if (checkKU) {
      const cols = (db.prepare('PRAGMA table_info(TANIM_KomisyonUye)').all() as any[]).map(
        (c) => c.name
      )
      if (!cols.includes('belgede_goster')) {
        db.prepare(
          'ALTER TABLE TANIM_KomisyonUye ADD COLUMN belgede_goster INTEGER DEFAULT 1'
        ).run()
      }
    }
  } catch (err: any) {
    console.error('Error migrating komisyon columns:', err.message)
  }

  // Normalize default direct procurement commissions
  try {
    const checkKomisyon = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='TANIM_Komisyon'")
      .get()
    if (checkKomisyon) {
      // 1. Yaklaşık Maliyet Tespit Komisyonu
      const yaklasikExisting = db
        .prepare(
          `
        SELECT id, ad FROM TANIM_Komisyon 
        WHERE LOWER(TRIM(ad)) IN (
          'yaklaşık maliyet tespit komisyonu',
          'yaklasik maliyet tespit komisyonu',
          'fiyat araştırma komisyonu',
          'fiyat arastirma komisyonu',
          'fiyat araştırma ve yaklaşık maliyet tespit komisyonu',
          'fiyat arastirma ve yaklasik maliyet tespit komisyonu'
        )
        ORDER BY CASE WHEN LOWER(TRIM(ad)) LIKE '%yaklaşık%' OR LOWER(TRIM(ad)) LIKE '%yaklasik%' THEN 1 ELSE 2 END, id ASC
      `
        )
        .all() as { id: number; ad: string }[]

      let yaklasikId = 1
      if (yaklasikExisting.length > 0) {
        yaklasikId = yaklasikExisting[0].id
        db.prepare(
          "UPDATE TANIM_Komisyon SET ad = 'Yaklaşık Maliyet Tespit Komisyonu', aktif_mi = 1 WHERE id = ?"
        ).run(yaklasikId)
        for (let i = 1; i < yaklasikExisting.length; i++) {
          const dupId = yaklasikExisting[i].id
          db.prepare(
            'UPDATE OR IGNORE TANIM_KomisyonUye SET komisyon_id = ? WHERE komisyon_id = ?'
          ).run(yaklasikId, dupId)
          db.prepare('DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?').run(dupId)
          db.prepare('DELETE FROM TANIM_Komisyon WHERE id = ?').run(dupId)
        }
      } else {
        db.prepare(
          "INSERT OR IGNORE INTO TANIM_Komisyon (id, ad, aktif_mi) VALUES (1, 'Yaklaşık Maliyet Tespit Komisyonu', 1)"
        ).run()
      }

      // 2. Muayene Kabul ve Tespit Komisyonu
      const muayeneExisting = db
        .prepare(
          `
        SELECT id, ad FROM TANIM_Komisyon 
        WHERE LOWER(TRIM(ad)) IN (
          'muayene kabul ve tespit komisyonu',
          'muayene kabul ve teslim alma komisyonu'
        )
        ORDER BY CASE WHEN LOWER(TRIM(ad)) LIKE '%muayene kabul ve tespit%' THEN 1 ELSE 2 END, id ASC
      `
        )
        .all() as { id: number; ad: string }[]

      let muayeneId = 2
      if (muayeneExisting.length > 0) {
        muayeneId = muayeneExisting[0].id
        db.prepare(
          "UPDATE TANIM_Komisyon SET ad = 'Muayene Kabul ve Tespit Komisyonu', aktif_mi = 1 WHERE id = ?"
        ).run(muayeneId)
        for (let i = 1; i < muayeneExisting.length; i++) {
          const dupId = muayeneExisting[i].id
          db.prepare(
            'UPDATE OR IGNORE TANIM_KomisyonUye SET komisyon_id = ? WHERE komisyon_id = ?'
          ).run(muayeneId, dupId)
          db.prepare('DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?').run(dupId)
          db.prepare('DELETE FROM TANIM_Komisyon WHERE id = ?').run(dupId)
        }
      } else {
        db.prepare(
          "INSERT OR IGNORE INTO TANIM_Komisyon (id, ad, aktif_mi) VALUES (2, 'Muayene Kabul ve Tespit Komisyonu', 1)"
        ).run()
      }

      // 3. Şablon bağlantıları (TANIM_Komisyon_Sablon)
      const checkSablonTable = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='TANIM_Komisyon_Sablon'"
        )
        .get()
      if (checkSablonTable) {
        const insertSablonStmt = db.prepare(`
          INSERT OR IGNORE INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id)
          SELECT ?, id FROM TANIM_Sablon WHERE dosya_adi = ?
        `)

        for (const s of DEFAULT_YAKLASIK_SABLONLAR) {
          try {
            insertSablonStmt.run(yaklasikId, s)
          } catch (_) {}
        }
        for (const s of DEFAULT_MUAYENE_SABLONLAR) {
          try {
            insertSablonStmt.run(muayeneId, s)
          } catch (_) {}
        }
      }
    }
  } catch (err: any) {
    console.error('Error normalizing default commissions:', err.message)
  }
}

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

function extractDbInfo(
  sqliteFilePath: string,
  fallbackName: string
): { schemaVersion: number; institutionName: string } {
  let schemaVersion = 1
  let institutionName = fallbackName
  try {
    const tempDb = new Database(sqliteFilePath, { readonly: true })
    try {
      const row = tempDb
        .prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'")
        .get() as { value: string } | undefined
      if (row?.value) {
        const parsed = parseInt(row.value, 10)
        if (!isNaN(parsed) && parsed > 0) {
          schemaVersion = parsed
        }
      } else {
        const migRow = tempDb
          .prepare('SELECT MAX(version) as max_v FROM schema_migrations')
          .get() as { max_v: number } | undefined
        if (migRow?.max_v && migRow.max_v > 0) {
          schemaVersion = migRow.max_v
        }
      }
    } catch {
      // settings / schema_migrations tablosu yoksa varsayılan 1
    }

    try {
      const instRow = tempDb
        .prepare("SELECT value FROM settings WHERE key = 'institutionName'")
        .get() as { value: string } | undefined
      if (instRow?.value && instRow.value.trim()) {
        institutionName = instRow.value.trim()
      }
    } catch {
      // institutionName yoksa dosya adı
    }

    tempDb.close()
  } catch (e) {
    console.warn('[Workspace] DB bilgileri okunurken uyarı:', e)
  }
  return { schemaVersion, institutionName }
}

export class DtmWorkspace {
  private tempDir: string
  private db: Database.Database | null = null
  private currentFilePath: string | null = null
  private meta: WorkspaceMeta | null = null
  private initialHash: string = ''
  private initialDataVersion: number = 0
  private userMutationCount: number = 0
  private isDirty: boolean = false
  private mutationMap: Map<string, MutationSummaryItem> = new Map()
  private lastMutationTime: string | null = null

  constructor() {
    this.tempDir = path.join(app.getPath('userData'), 'dtm_temp', Date.now().toString())
  }

  public openWorkspace(filePath: string, allowMigration: boolean = false): WorkspaceMeta {
    filePath = filePath.replace(/^"+|"+$/g, '').trim()
    if (!fs.existsSync(filePath)) {
      throw new Error(`Dosya bulunamadı: ${filePath}`)
    }

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
          } catch {
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

    const metaPath = path.join(this.tempDir, 'meta.json')
    let rawMeta: any = {}

    // Akıllı Format Tespiti:
    // Dosya uzantısı ne olursa olsun (.temin, .hkmp, .dtal veya kullanıcı elle .temin yapmış olsun)
    // İlk 512 baytta SQLite format 3 imzası varsa dosya doğrudan SQLite veritabanıdır.
    const headerPrefix = zipBuffer.subarray(0, Math.min(zipBuffer.length, 512)).toString('latin1')
    const isRawSqlite = headerPrefix.includes('SQLite format 3')

    if (isRawSqlite) {
      // Doğrudan SQLite dosyası: Zip açmaya çalışma, dosyayı temp dizine kopyala
      const targetDb = path.join(this.tempDir, 'database.sqlite')
      fs.copyFileSync(filePath, targetDb)
      const dbInfo = extractDbInfo(targetDb, path.basename(filePath, path.extname(filePath)))
      rawMeta = {
        dtal_version: '1.0',
        schema_version: dbInfo.schemaVersion,
        institution_name: dbInfo.institutionName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active_db_file: 'database.sqlite'
      }
      fs.writeFileSync(metaPath, JSON.stringify(rawMeta, null, 2))
    } else {
      // Standart Zip formatı (.temin, paketlenmiş .dtal, .tmn360 vb.)
      let zipOpened = false
      try {
        const zip = new AdmZip(zipBuffer)
        zip.extractAllTo(this.tempDir, true)
        zipOpened = true
      } catch (zipErr: any) {
        console.warn(
          `[Workspace] Zip açma başarısız: ${zipErr.message}. Akıllı SQLite kurtarma deneniyor...`
        )
        // Eğer zip açma başarısız olduysa ve dosya içinde yine de sqlite varsa kurtar
        const containsSqlite =
          headerPrefix.includes('SQLite format 3') ||
          zipBuffer
            .subarray(0, Math.min(zipBuffer.length, 4096))
            .toString('latin1')
            .includes('SQLite format 3')
        if (containsSqlite) {
          const targetDb = path.join(this.tempDir, 'database.sqlite')
          fs.copyFileSync(filePath, targetDb)
          const dbInfo = extractDbInfo(targetDb, path.basename(filePath, path.extname(filePath)))
          rawMeta = {
            dtal_version: '1.0',
            schema_version: dbInfo.schemaVersion,
            institution_name: dbInfo.institutionName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            active_db_file: 'database.sqlite'
          }
          fs.writeFileSync(metaPath, JSON.stringify(rawMeta, null, 2))
          zipOpened = true
        } else {
          throw new Error(`Dosya formatı okunamadı (${path.extname(filePath)}): ${zipErr.message}`)
        }
      }

      if (fs.existsSync(metaPath)) {
        const rawMetaContent = fs.readFileSync(metaPath, 'utf-8')
        rawMeta = JSON.parse(rawMetaContent)
      } else {
        // meta.json yoksa: .tmn360 arşiv paketi mi kontrol et
        const archiveMetaPath = path.join(this.tempDir, 'archive_meta.json')
        if (fs.existsSync(archiveMetaPath)) {
          try {
            const aMeta = JSON.parse(fs.readFileSync(archiveMetaPath, 'utf-8'))
            const hasArchiveSqlite = fs.existsSync(path.join(this.tempDir, 'archive.sqlite'))
            rawMeta = {
              dtal_version: '1.0',
              schema_version: aMeta.schema_version || 1,
              institution_name:
                aMeta.institution_name || path.basename(filePath, path.extname(filePath)),
              created_at: aMeta.archived_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
              active_db_file: hasArchiveSqlite ? 'archive.sqlite' : 'database.sqlite'
            }
            fs.writeFileSync(metaPath, JSON.stringify(rawMeta, null, 2))
          } catch {
            // Arşiv meta okunamadı
          }
        } else {
          // Temp dizininde herhangi bir .sqlite veya .db dosyası var mı ara
          const files = fs.readdirSync(this.tempDir)
          let sqliteFile = files.find((f) => f.endsWith('.sqlite') || f.endsWith('.db'))
          if (!sqliteFile) {
            for (const f of files) {
              const fullP = path.join(this.tempDir, f)
              try {
                if (fs.statSync(fullP).isFile()) {
                  const buf = Buffer.alloc(16)
                  const fd = fs.openSync(fullP, 'r')
                  fs.readSync(fd, buf, 0, 16, 0)
                  fs.closeSync(fd)
                  if (buf.toString('latin1').includes('SQLite format 3')) {
                    sqliteFile = f
                    break
                  }
                }
              } catch {
                // Dosya okuma atlandı
              }
            }
          }

          if (sqliteFile) {
            const dbInfo = extractDbInfo(
              path.join(this.tempDir, sqliteFile),
              path.basename(filePath, path.extname(filePath))
            )
            rawMeta = {
              dtal_version: '1.0',
              schema_version: dbInfo.schemaVersion,
              institution_name: dbInfo.institutionName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              active_db_file: sqliteFile
            }
            fs.writeFileSync(metaPath, JSON.stringify(rawMeta, null, 2))
          } else {
            throw new Error('Geçersiz dosya: meta.json veya veritabanı dosyası bulunamadı.')
          }
        }
      }
    }

    // Attachments klasörünün varlığını garanti et
    const attachmentsDir = path.join(this.tempDir, 'attachments')
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir, { recursive: true })
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

      if (meta.schema_version < CURRENT_SCHEMA_VERSION) {
        meta.schema_version = CURRENT_SCHEMA_VERSION
        try {
          meta.app_version = app.getVersion()
        } catch {}
        meta.updated_at = new Date().toISOString()
        meta.integrity_hash = calculateIntegrityHash(meta)
        try {
          fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
        } catch {}
      }
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

    this.meta = meta
    this.initialHash = this.calculateCurrentHash()
    this.initialDataVersion = this.getDataVersion()
    this.userMutationCount = 0
    this.mutationMap.clear()
    this.lastMutationTime = null
    this.isDirty = false
    this.notifyDirtyChange(false)
    return meta
  }

  public createWorkspace(filePath: string, institutionName: string): WorkspaceMeta {
    const ext = path.extname(filePath).toLowerCase().replace(/^\./, '')
    // Kullanıcının seçtiği geçerli uzantıyı (.temin, .hkmp, .dtal, .dtm, .dte, .dta) koru
    // Eğer uzantı girilmemişse veya desteklenmeyen bir uzantıysa varsayılan .temin uzantısını ekle
    if (!ext || !allExtensions.includes(ext)) {
      const base = ext ? filePath.substring(0, filePath.length - (ext.length + 1)) : filePath
      filePath = `${base}.${defaultFormat.ext}`
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
      this.initialDataVersion = this.getDataVersion()
      this.userMutationCount = 0
      this.mutationMap.clear()
      this.lastMutationTime = null
      this.isDirty = false
      this.notifyDirtyChange(false)
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
      this.initialHash = this.calculateCurrentHash()
      this.resetDirty()
    } catch (zipErr) {
      console.error('Error while writing zip file:', zipErr)
      throw new Error('Dosya kaydedilirken hata oluştu: ' + (zipErr as Error).message)
    }
  }

  public convertToTemin(): { success: boolean; newPath?: string; error?: string } {
    if (!this.currentFilePath || !this.db) {
      return { success: false, error: 'Açık bir çalışma alanı yok.' }
    }

    if (this.currentFilePath.toLowerCase().endsWith('.temin')) {
      this.saveWorkspace()
      return { success: true, newPath: this.currentFilePath }
    }

    const dir = path.dirname(this.currentFilePath)
    const baseName = path.basename(this.currentFilePath, path.extname(this.currentFilePath))
    const newPath = path.join(dir, `${baseName}.temin`)

    // Eski kilidi temizle
    const oldLock = this.currentFilePath + '.lock'
    if (fs.existsSync(oldLock)) {
      try {
        fs.unlinkSync(oldLock)
      } catch {
        // İhmal et
      }
    }

    this.currentFilePath = newPath
    const newLock = newPath + '.lock'
    try {
      fs.writeFileSync(newLock, process.pid.toString(), 'utf-8')
    } catch {
      // İhmal et
    }

    this.saveWorkspace()
    return { success: true, newPath }
  }

  public saveAs(targetFilePath: string): { success: boolean; newPath?: string; error?: string } {
    if (!this.currentFilePath || !this.db) {
      return { success: false, error: 'Açık bir çalışma alanı yok.' }
    }

    const newPath = targetFilePath.toLowerCase().endsWith('.temin')
      ? targetFilePath
      : `${targetFilePath}.temin`

    const oldLock = this.currentFilePath + '.lock'
    if (fs.existsSync(oldLock)) {
      try {
        fs.unlinkSync(oldLock)
      } catch {}
    }

    this.currentFilePath = newPath
    const newLock = newPath + '.lock'
    try {
      fs.writeFileSync(newLock, process.pid.toString(), 'utf-8')
    } catch {}

    this.saveWorkspace()
    return { success: true, newPath }
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
      const dbFileName = this.meta?.active_db_file || 'database.sqlite'
      const dbPath = path.join(this.tempDir, dbFileName)
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

  public getDataVersion(): number {
    if (!this.db) return 0
    try {
      const row = this.db.prepare('PRAGMA data_version').get() as { data_version?: number }
      return row?.data_version ?? 0
    } catch {
      return 0
    }
  }

  public recordMutation(tableName?: string, action?: string, count: number = 1): void {
    const table = tableName || 'Veritabanı'
    const tableUpper = table.toUpperCase()
    if (
      tableUpper === 'LOG_SYSTEMLOG' ||
      tableUpper === 'SETTINGS' ||
      tableUpper === 'SCHEMA_MIGRATIONS' ||
      tableUpper === 'SQLITE_SEQUENCE' ||
      tableUpper === 'TANIM_SABLON' ||
      tableUpper === 'TANIM_DETSISCACHE' ||
      tableUpper === 'TANIM_TASINIRKOD' ||
      tableUpper.startsWith('SYS_')
    ) {
      return // Sistem logları, ayarları, varsayılan şablonlar ve önbellekler kullanıcı mutasyonu değildir!
    }

    this.userMutationCount += count
    this.isDirty = true
    const now = new Date()
    const timeStr = now.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    this.lastMutationTime = timeStr

    const act = (action as 'insert' | 'update' | 'delete' | 'other') || 'other'
    const key = `${table}_${act}`
    const existing = this.mutationMap.get(key)

    const actionLabels: Record<string, string> = {
      insert: 'Yeni Kayıt Eklendi',
      update: 'Bilgiler Güncellendi',
      delete: 'Kayıt Silindi',
      other: 'Veri Düzenlendi'
    }

    const title = TABLE_FRIENDLY_NAMES[table] || table

    if (existing) {
      existing.count += count
      existing.lastTime = timeStr
    } else {
      this.mutationMap.set(key, {
        tableName: table,
        title,
        action: act,
        actionLabel: actionLabels[act] || 'İşlem',
        count,
        lastTime: timeStr
      })
    }

    this.notifyDirtyChange(true)
  }

  public isDirtyState(): boolean {
    if (!this.db || !this.currentFilePath) return false
    // Kullanıcı tarafından gerçekleştirilen en az bir gerçek mutasyon varsa kirli kabul et
    if (this.isDirty && this.userMutationCount > 0) return true
    return false
  }

  public resetDirty(): void {
    this.isDirty = false
    this.userMutationCount = 0
    this.mutationMap.clear()
    this.lastMutationTime = null
    this.initialDataVersion = this.getDataVersion()
    this.initialHash = this.calculateCurrentHash()
    this.notifyDirtyChange(false)
  }

  public getDirtySummary(): {
    isDirty: boolean
    totalChanges: number
    lastModifiedAt: string | null
    items: MutationSummaryItem[]
  } {
    const isDirty = this.isDirtyState()
    const items = Array.from(this.mutationMap.values())

    if (isDirty && items.length === 0) {
      items.push({
        tableName: 'Veritabanı',
        title: 'Çalışma Dosyası Değişiklikleri',
        action: 'other',
        actionLabel: 'Düzenlendi',
        count: Math.max(this.userMutationCount, 1),
        lastTime: this.lastMutationTime || 'Az önce'
      })
    }

    return {
      isDirty,
      totalChanges: isDirty
        ? Math.max(
            this.userMutationCount,
            items.reduce((acc, it) => acc + (it.count || 1), 0),
            1
          )
        : 0,
      lastModifiedAt: this.lastMutationTime,
      items: isDirty ? items : []
    }
  }

  public notifyDirtyChange(dirty: boolean): void {
    try {
      const windows = BrowserWindow.getAllWindows()
      for (const win of windows) {
        if (!win.isDestroyed()) {
          win.webContents.send('workspace:dirty-changed', dirty)
          if (this.currentFilePath) {
            const base = path.basename(this.currentFilePath)
            win.setTitle(`${dirty ? '● ' : ''}${base} - TEMİN 360`)
          }
        }
      }
    } catch {
      // Ignore if called outside electron browser window cycle
    }
  }

  public hasChanges(target: 'gdrive' | 'email' | 'any' = 'any'): boolean {
    if (!this.db || !this.currentFilePath) return false

    // Kullanıcı tarafından gerçekleştirilen en az bir gerçek mutasyon yoksa hasChanges false dönmeli
    if (!this.isDirtyState()) return false

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
      return true
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
      return true
    }

    return current !== this.initialHash
  }

  public markSynced(target: 'gdrive' | 'email'): void {
    if (!this.db) return
    const current = this.calculateCurrentHash()
    if (!current) return
    try {
      const key = target === 'gdrive' ? 'lastGdriveSyncHash' : 'lastEmailSyncHash'
      this.db
        .prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`)
        .run(key, current)
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
  convertToTemin: () => {
    if (!activeWorkspace) return { success: false, error: 'Açık bir çalışma alanı yok.' }
    return activeWorkspace.convertToTemin()
  },
  saveAs: (targetFilePath: string) => {
    if (!activeWorkspace) return { success: false, error: 'Açık bir çalışma alanı yok.' }
    return activeWorkspace.saveAs(targetFilePath)
  },
  recordMutation: (tableName?: string, action?: string, count: number = 1) => {
    if (activeWorkspace) activeWorkspace.recordMutation(tableName, action, count)
  },
  getDirtySummary: () => {
    if (!activeWorkspace) {
      return { isDirty: false, totalChanges: 0, lastModifiedAt: null, items: [] }
    }
    return activeWorkspace.getDirtySummary()
  },
  isDirty: () => {
    if (!activeWorkspace) return false
    return activeWorkspace.isDirtyState()
  },
  resetDirty: () => {
    if (activeWorkspace) activeWorkspace.resetDirty()
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
    activeWorkspace.recordMutation()
    activeWorkspace.saveWorkspace()
    return { fileName: safeName, relativePath: `attachments/${safeName}` }
  },
  openAttachment: async (relativePath: string) => {
    if (!activeWorkspace) throw new Error('Açık bir çalışma dosyası yok.')
    const tempDir = (activeWorkspace as any).tempDir
    if (!tempDir) throw new Error('Geçici çalışma dizini bulunamadı.')

    const fullPath = path.join(tempDir, relativePath)
    if (fs.existsSync(fullPath)) {
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
