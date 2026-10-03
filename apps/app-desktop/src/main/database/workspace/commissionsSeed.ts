import Database from 'better-sqlite3'
import {
  DEFAULT_YAKLASIK_SABLONLAR,
  DEFAULT_MUAYENE_SABLONLAR
} from '../../../shared/constants/templateConstants'

export function seedDefaultCommissions(db: Database.Database): void {
  try {
    const checkKomisyon = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='TANIM_Komisyon'")
      .get()
    if (!checkKomisyon) return

    // 1. Yaklasik Maliyet Tespit Komisyonu
    const yaklasikExisting = db
      .prepare(
        `SELECT id, ad FROM TANIM_Komisyon 
         WHERE LOWER(TRIM(ad)) IN (
           'yaklaşık maliyet tespit komisyonu',
           'yaklasik maliyet tespit komisyonu',
           'fiyat araştırma komisyonu',
           'fiyat arastirma komisyonu',
           'fiyat araştırma ve yaklaşık maliyet tespit komisyonu',
           'fiyat arastirma ve yaklasik maliyet tespit komisyonu'
         )
         ORDER BY CASE WHEN LOWER(TRIM(ad)) LIKE '%yaklaşık%' OR LOWER(TRIM(ad)) LIKE '%yaklasik%' THEN 1 ELSE 2 END, id ASC`
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
        `SELECT id, ad FROM TANIM_Komisyon 
         WHERE LOWER(TRIM(ad)) IN (
           'muayene kabul ve tespit komisyonu',
           'muayene kabul ve teslim alma komisyonu'
         )
         ORDER BY CASE WHEN LOWER(TRIM(ad)) LIKE '%muayene kabul ve tespit%' THEN 1 ELSE 2 END, id ASC`
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

    // 3. Sablon baglantilari (TANIM_Komisyon_Sablon)
    const checkSablonTable = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='TANIM_Komisyon_Sablon'"
      )
      .get()
    if (checkSablonTable) {
      try {
        db.prepare(
          `DELETE FROM TANIM_Komisyon_Sablon 
           WHERE rowid NOT IN (
             SELECT MIN(rowid) FROM TANIM_Komisyon_Sablon GROUP BY komisyon_id, sablon_id
           )`
        ).run()

        db.prepare(
          `CREATE UNIQUE INDEX IF NOT EXISTS idx_komisyon_sablon_unique 
           ON TANIM_Komisyon_Sablon(komisyon_id, sablon_id)`
        ).run()
      } catch (_) {}

      const insertSablonStmt = db.prepare(`
        INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id)
        SELECT ?, id FROM TANIM_Sablon 
        WHERE dosya_adi = ?
          AND NOT EXISTS (
            SELECT 1 FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ? AND sablon_id = TANIM_Sablon.id
          )
      `)

      for (const s of DEFAULT_YAKLASIK_SABLONLAR) {
        try {
          insertSablonStmt.run(yaklasikId, s, yaklasikId)
        } catch (_) {}
      }
      for (const s of DEFAULT_MUAYENE_SABLONLAR) {
        try {
          insertSablonStmt.run(muayeneId, s, muayeneId)
        } catch (_) {}
      }
    }
  } catch (err: any) {
    console.error('Error normalizing default commissions:', err.message)
  }
}
