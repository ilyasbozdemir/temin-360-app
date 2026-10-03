import { describe, it, expect } from 'vitest'
import { schema, manifests, CURRENT_SCHEMA_VERSION, getMaxSchemaVersion } from '@dt/database'

describe('Database Schema Integrity & Manifest Tests', () => {
  it('should have all tables properly defined in @dt/database schema', () => {
    expect(schema.tables).toBeDefined()
    expect(schema.tables.length).toBeGreaterThanOrEqual(30)

    const tableNames = new Set(schema.tables.map((t: any) => t.name))

    // All 43 database tables must exist
    const allTables = [
      'TANIM_Kurum',
      'TANIM_Mevzuat',
      'TANIM_Birim',
      'TANIM_Personel',
      'TANIM_PersonelUnvanGecmisi',
      'TANIM_Roller',
      'TANIM_Asama',
      'TANIM_Firma',
      'TANIM_FirmaIletisimNotu',
      'TANIM_Ambar',
      'TANIM_Proje',
      'TANIM_TasinirKod',
      'TANIM_OkasKod',
      'TANIM_ButceKod',
      'TANIM_ButceOdenek',
      'TANIM_Kalem',
      'TANIM_OlcuBirimi',
      'TANIM_BirimDonusum',
      'TANIM_AlimTuru',
      'TANIM_Sablon',
      'TANIM_Placeholder',
      'TANIM_AlimTuru_Sablon',
      'TANIM_SurecTaslak',
      'SABLON_Placeholder',
      'TANIM_KodSozlugu',
      'TANIM_KomisyonGorevi',
      'TANIM_Komisyon',
      'TANIM_KomisyonUye',
      'TANIM_Komisyon_Sablon',
      'TANIM_KikLimitDonemleri',
      'DATA_TeminDosyasi',
      'DATA_TeminKalem',
      'DATA_TeminFirma',
      'DATA_TeminKalemTeklif',
      'DATA_TeminKomisyon',
      'DATA_TeminBelge',
      'DATA_TIF',
      'DATA_TIF_Kalem',
      'DATA_AmbarStok',
      'DATA_AmbarHareket',
      'DATA_DosyaSablonVeri',
      'DATA_NotVeGorev',
      'LOG_SystemLog'
    ]

    for (const tbl of allTables) {
      expect(tableNames.has(tbl), `Table "${tbl}" must be registered in schema`).toBe(true)
    }
  })

  it('should have valid column definitions for each table', () => {
    const validTypes = new Set(['INTEGER', 'TEXT', 'REAL', 'DATE', 'DATETIME', 'BLOB', 'NUMERIC'])

    for (const table of schema.tables) {
      expect(table.name).toBeTruthy()
      expect(Array.isArray(table.columns), `Table "${table.name}" columns must be an array`).toBe(true)
      expect(table.columns.length, `Table "${table.name}" must have at least one column`).toBeGreaterThan(0)

      const colNames = new Set<string>()
      for (const col of table.columns) {
        expect(col.name, `Column in "${table.name}" must have a name`).toBeTruthy()
        expect(colNames.has(col.name), `Duplicate column "${col.name}" in table "${table.name}"`).toBe(false)
        colNames.add(col.name)

        const rawType = (col.type || '').toUpperCase()
        expect(validTypes.has(rawType), `Invalid column type "${col.type}" for column "${col.name}" in table "${table.name}"`).toBe(true)
      }
    }
  })

  it('should have correct columns in DATA_TeminDosyasi and TANIM_ButceOdenek', () => {
    const teminDosyasi = schema.tables.find((t: any) => t.name === 'DATA_TeminDosyasi')
    expect(teminDosyasi).toBeDefined()
    const teminCols = new Set(teminDosyasi.columns.map((c: any) => c.name))
    expect(teminCols.has('birim'), 'DATA_TeminDosyasi must have "birim" column').toBe(true)
    expect(teminCols.has('harcama_birimi'), 'DATA_TeminDosyasi must have "harcama_birimi" column').toBe(true)
    expect(teminCols.has('butce_yili'), 'DATA_TeminDosyasi must have "butce_yili" column').toBe(true)
    expect(teminCols.has('tur'), 'DATA_TeminDosyasi must have "tur" column').toBe(true)

    const butceOdenek = schema.tables.find((t: any) => t.name === 'TANIM_ButceOdenek')
    expect(butceOdenek).toBeDefined()
    const odenekCols = new Set(butceOdenek.columns.map((c: any) => c.name))
    expect(odenekCols.has('birim_adi'), 'TANIM_ButceOdenek must have "birim_adi" column').toBe(true)
    expect(odenekCols.has('butce_kodu'), 'TANIM_ButceOdenek must have "butce_kodu" column').toBe(true)
    expect(odenekCols.has('yillik_odenek'), 'TANIM_ButceOdenek must have "yillik_odenek" column').toBe(true)
  })

  it('should have consistent schema version and migration manifests', () => {
    expect(manifests).toBeDefined()
    expect(manifests.length).toBeGreaterThan(0)

    const maxVersion = getMaxSchemaVersion()
    expect(maxVersion).toBeGreaterThanOrEqual(37)
    expect(CURRENT_SCHEMA_VERSION).toBe(maxVersion)

    const latestManifest = manifests[manifests.length - 1]
    expect(latestManifest.app).toBeDefined()
    expect(latestManifest.schema_max).toBe(CURRENT_SCHEMA_VERSION)
  })
})
