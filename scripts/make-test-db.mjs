import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const dbPath = path.join(rootDir, 'test-sample.db')
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)

let db
try {
  const req = createRequire(path.join(rootDir, 'packages', 'database', 'package.json'))
  const Database = req('better-sqlite3')
  db = new Database(dbPath)
} catch {
  const { DatabaseSync } = await import('node:sqlite')
  db = new DatabaseSync(dbPath)
}
db.exec(`
  CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT);
  INSERT INTO settings (key, value) VALUES ('dbSchemaVersion', '38');
  INSERT INTO settings (key, value) VALUES ('institutionName', 'Test Kurumu');

  CREATE TABLE DATA_TeminKomisyon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temin_dosya_id INTEGER,
    personel_id INTEGER,
    gorev TEXT,
    ad_soyad TEXT,
    belgede_goster INTEGER DEFAULT 1,
    belge_kapsami TEXT DEFAULT 'tumu',
    hedef_belgeler TEXT DEFAULT '["*"]'
  );

  CREATE TABLE TANIM_KomisyonUye (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    komisyon_id INTEGER,
    gorev_id INTEGER,
    personel_id INTEGER,
    asil_mi INTEGER DEFAULT 1,
    sira INTEGER DEFAULT 1,
    belgede_goster INTEGER DEFAULT 1,
    belge_kapsami TEXT DEFAULT 'tumu',
    hedef_belgeler TEXT DEFAULT '["*"]'
  );

  INSERT INTO DATA_TeminKomisyon (temin_dosya_id, gorev, ad_soyad, belgede_goster, belge_kapsami, hedef_belgeler)
  VALUES (1, 'Harcama Yetkilisi', 'Ahmet Test', 1, 'olur_onay', '["*"]');

  INSERT INTO DATA_TeminKomisyon (temin_dosya_id, gorev, ad_soyad, belgede_goster, belge_kapsami, hedef_belgeler)
  VALUES (1, 'Muhasebe Yetkilisi', 'Mehmet Test', 0, 'gizli', '["*"]');

  -- Çelişkili satır örneği: belgede_goster = 0 ama kapsam piyasa_arastirma
  INSERT INTO DATA_TeminKomisyon (temin_dosya_id, gorev, ad_soyad, belgede_goster, belge_kapsami, hedef_belgeler)
  VALUES (1, 'Fiyat Görevlisi', 'Ali Celiskili', 0, 'piyasa_arastirma', '["*"]');

  -- Bozuk JSON örneği
  INSERT INTO DATA_TeminKomisyon (temin_dosya_id, gorev, ad_soyad, belgede_goster, belge_kapsami, hedef_belgeler)
  VALUES (1, 'Bozuk JSON Uye', 'Bozuk JSON', 1, 'ozel', 'invalid-json');
`)

db.close()
console.log('Test DB başarıyla üretildi:', dbPath)
