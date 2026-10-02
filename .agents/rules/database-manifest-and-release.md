# Veritabanı Şema Değişiklikleri, Migration Manifest (.yaml/.ts) ve Release Kuralları

Bu kural, TEMİN 360 projesinde veritabanı şemasında yapılan her değişiklik ve her yeni sürüm/release için **ZORUNLUDUR**.

---

## 📌 1. Yeni Sütun, Yeni Tablo veya Şema Değişikliği Kuralları

Veritabanında herhangi bir tabloya yeni sütun (`ALTER TABLE ADD COLUMN`), yeni bir tablo (`CREATE TABLE`) veya yapısal değişiklik eklendiğinde:

1. **Manifest YAML Dosyası Oluşturulması / Güncellenmesi**:
   - `packages/database/src/schema-manifest/<versiyon>.yaml` dosyası oluşturulmalıdır.
   - Eğer yeni sütunlar varsa `columns_added` dizisine `{ table: "TABLO_ADI", column: "SUTUN_ADI" }` şeklinde eksiksiz eklenmelidir.
   - Eğer yeni tablolar varsa `tables_added` dizisine `["YENI_TABLO_1", "YENI_TABLO_2"]` şeklinde eklenmelidir.
   - Schema versiyon numarası (`schema_max`) artırılmalıdır.

2. **TypeScript Manifest Dosyası**:
   - `packages/database/src/schema-manifest/versions/<surum_kisa_adi>.ts` dosyası oluşturulmalıdır.
   - `packages/database/src/schema-manifest/manifests.ts` dosyasına `import` edilerek `manifests` dizisine eklenmelidir.

3. **Versions JSON Kaydı**:
   - `packages/database/versions.json` dosyasına yeni sürüm numarası (`1.0.0-beta.XYZ`) eklenmelidir.

4. **Derleme & Senkronizasyon (@dt/database)**:
   - `pnpm --filter @dt/database build` komutu mutlaka çalıştırılmalıdır (manifest yaml'larının `dist/schema-manifest` klasörüne kopyalanması ve tsc derlemesi için).

---

## 🏷️ 2. Release, Tag ve Versiyon Bump Kuralları

Yeni bir sürüm yayınlanırken veya tag alınırken:

1. `apps/app-desktop/package.json` içindeki `"version"` alanı yeni versiyona yükseltilir.
2. `packages/database/versions.json` kontrol edilir.
3. `pnpm --filter app-desktop typecheck` çalıştırılarak sıfır hata olduğu doğrulanır.
4. `apps/app-desktop/scripts/release.js` çalıştırılarak otomatik tag ve changelog oluşturulur ya da `git tag -a vX.Y.Z -m "Release vX.Y.Z"` ile tag oluşturulur.
5. Migration çalıştırıcıları (`runMigrations` in `migrate.ts`) yeni şemayı otomatik olarak algılayıp uygulayacaktır.
