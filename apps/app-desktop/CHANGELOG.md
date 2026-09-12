# Değişiklik Günlüğü (Changelog)

Bu dosyada Doğrudan Temin (DT) Masaüstü Uygulaması'nın her sürümünde yapılan
önemli değişiklikler listelenmektedir.

## [1.0.0-beta.16] - 2026-07-01

### Düzeltilenler (Fixed)

- **Aktif Dosya Araç Çubuğu Düzeltmesi**: `ActiveFileToolbar` bileşenindeki
  `dosya_no` / `temin_no` tip uyumsuzluğu giderildi ve geri dönüş butonunun
  yazısı `"Aktif Dosyadan Çık"` olarak güncellendi.

## [Unreleased]

### Planlanan / Gelecek Sürüm (v1.0.0 Backlog)

- **Fatura ve İrsaliye Yönetimi**: İlgili doğrudan temin dosyalarına ödeme
  faturaları ve irsaliyelerin yüklenmesi için sistematik bir dosya yönetim
  alanı.
- **İmzalı Belge Yönetimi**: İmzalanan evrakların toplu olarak ZIP dosyası ile
  sisteme yüklenebilmesi ve yönetimi.

## [1.0.0-beta.15] - 2026-06-30

### Eklenenler (Added)

- **İmza Toggle Desteği**: Üretilen Belgeler ve İmza Takibi bölümünde imza
  durumu artık çift yönlü toggle switch ile değiştirilebilir (İmzalandı ↔
  Bekliyor).
- **Genel Metrik Paneli (Takip Ekranı)**: Aktif dosya seçilmediğinde toplam
  dosya sayısı, imza bekleyen/imzalanan belge sayıları, toplam yaklaşık maliyet
  ve aşama dağılım grafiği gösterilir.
- **Otomatik Release Scripti** (`scripts/release.js`): `npm run release`
  komutuyla versions.json güncelleme, commit, tag oluşturma ve push işlemleri
  tek komutla yapılabilir. `--dry-run`, `--no-push`, `--patch`, `--message`
  flag'leri desteklenir.
- Lüzum Müzekkeresi, Lüzum Onay Eki, Teslim Tesellüm ve Son
  Alım Fiyat Cetveli mapping dosyaları eklendi.
- Şablon dosya adı ↔ kategori eşleştirme sabiti (`sablonKategorileri.ts`)
  eklendi.

### Eklenenler (Added)

- `SubScreens.screen.tsx` dosyası daha iyi bir kod organizasyonu için ayrı
  parçalara/bileşenlere bölündü (17 ayrı ekrana ayrıştırıldı).
- İhtiyaç Listesi yazdırma işlemi ana liste ekranı içerisine (PDF olarak
  kaydet/yazdır butonu ile) entegre edildi.
- Sidebar ve menü yönlendirmelerinde "Malzeme Listesi" terimi "İhtiyaç Listesi"
  olarak güncellendi.
- Eksik olan `CONTRIBUTING.md` ve `CHANGELOG.md` dosyaları eklendi.
- Dağınık duran dokümantasyon dosyaları (`.md` uzantılı dosyalar) `docs/`
  klasörü altına taşınarak düzen sağlandı.

### Düzeltilenler (Fixed)

- Çeşitli lint ve tip uyarıları giderildi.

### Kaldırılanlar (Removed)

- Kullanılmayan `IhtiyacListesiTalepFormu` rotası ve `IhtiyacListesi.screen.tsx`
  tamamen silindi.
