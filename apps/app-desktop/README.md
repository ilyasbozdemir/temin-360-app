# Doğrudan Temin Masaüstü Yönetim Uygulaması

<p align="center">
  <img src="resources/icon.png" alt="Doğrudan Temin Yönetimi İkonu" width="128" />
</p>

<p align="center">
  <a href="https://github.com/ilyasbozdemir/temin-360-app/actions"><img src="https://img.shields.io/github/actions/workflow/status/ilyasbozdemir/temin-360-app/release.yml?style=flat-square&logo=github&label=Build%20Status" alt="Build Status"></a>
  <a href="https://github.com/ilyasbozdemir/temin-360-app/releases/latest"><img src="https://img.shields.io/github/v/release/ilyasbozdemir/temin-360-app?style=flat-square&logo=github&label=Latest%20Release" alt="Latest Release"></a>
  <a href="https://github.com/ilyasbozdemir/temin-360-app/releases"><img src="https://img.shields.io/github/downloads/ilyasbozdemir/temin-360-app/total?style=flat-square&logo=github&color=blue" alt="Downloads"></a>
</p>

**4734 Sayılı Kamu İhale Kanunu Madde 22 kapsamında doğrudan temin yoluyla
yapılan alımları yönetmek için geliştirilmiş masaüstü uygulama.**

## 📥 Masaüstü Uygulamasını İndirin (Download Desktop App)

Uygulamanın en güncel sürümünü (Windows `.exe` yükleyicisi, güncelleme
yansımaları vb.) aşağıdaki resmi kaynaklardan indirebilirsiniz:

👉
**[En Son Sürümü İndir (GitHub Releases)](https://github.com/ilyasbozdemir/temin-360-app/releases/latest)**
👉
**[Tüm Sürümler ve Paketler (Releases Archive)](https://github.com/ilyasbozdemir/temin-360-app/releases)**

_Not: Windows için indirilen `.exe` dosyasını çalıştırarak kurulumu
tamamlayabilirsiniz. Otomatik güncelleme desteği sayesinde uygulama açıkken yeni
sürümler arka planda otomatik olarak denetlenip güncellenir._

---

## Hakkında

Doğrudan Temin Programı, varsayılan olarak internet bağlantısı gerektirmeyen,
tamamen **çevrimdışı (offline)** çalışan bir masaüstü uygulamasıdır. Ancak yeni
nesil **Ağ Senkronizasyonu (EBYS Mimarisi)** sayesinde kurumunuzdaki diğer
birimlerle (Satın Alma, Muhasebe vb.) yerel ağ (LAN) üzerinden anında eşzamanlı
veri paylaşımı yapabilirsiniz.

Uygulama, tüm verilerini `.dtal` uzantılı dosyalarda saklar. Bu dosya formatı,
tıpkı `.docx`, `.xlsx` veya `.pptx` gibi uygulamaya özgü bir yapıya sahiptir;
içinde SQLite veritabanı ve ilgili meta veriler yer alır. Dosyalarınızı
yedekleyebilir, taşıyabilir, paylaşabilir veya yerel ağdaki bir Host üzerinden
tüm birimlerle canlı olarak çalışabilirsiniz.

---

## Özellikler

- **Mevzuata tam uygunluk** — 4734 Sayılı Kamu İhale Kanunu Madde 22 ve Kamu
  İhale Kurumu standartları eksiksiz karşılanmaktadır.
- **Tek girdi, sonsuz kullanım** — Temin sürecinde kullanılan belgeleri
  kurumunuza özgü bir kez düzenleyin, her zaman kullanın. Sık kullanılan benzer
  alımlarınız için Tip Onay Belgesi oluşturun.
- **Sınırsız Esneklik** — En düşük fiyatlı firmadan mı, tüm kalemleri aynı
  firmadan mı, yoksa her kalem için istediğiniz firmadan mı alım
  gerçekleştireceksiniz?
- **Yaklaşık Maliyet Kolaylığı** — Yaklaşık maliyeti ister programla detaylı
  hesaplayın, isterseniz doğrudan elinizdeki veriyi girin.
- **EBYS ve Çoklu Birim Mimarisi** — Yerleşik Socket.io altyapısı ile
  uygulamanızı bir Ana Sunucu (Host) haline getirip, kurumdaki diğer
  istemcilerin (Client) size bağlanmasını sağlayın. Dosya durum güncellemelerini
  anında tüm birimlerde görün.
- **Birim Yetkilendirme** — Birimlere (Örn: Fen İşleri, Destek Hizmetleri) özel
  yetkilendirme sistemi sayesinde evraklarda güvenli Okuma/Yazma (RBAC) kontrolü
  yapın.
- **Dinamik şablon yönetimi** — Belgelerinizi uygulama içinden düzenleyebilir,
  anlık önizleyebilir ve `.xlsx` ya da `.docx` formatında dışa aktarabilirsiniz.
- **Tamamen çevrimdışı veya Yerel Ağ** — İnternet bağlantısı gerekmez.
  Verileriniz buluta gitmez, yalnızca sizin bilgisayarınızda veya kurumunuzun
  yerel ağında (LAN) durur.

---

## Ekran Görüntüleri

<p align="center">
  <img src="docs/screenshots/launcher_screen.png" alt="Başlatıcı Ekranı" width="600" />
  <br/>
  <em>Kurum veya çalışma dosyası seçimi</em>
</p>

<p align="center">
  <img src="docs/screenshots/login_screen.png" alt="Giriş Ekranı" width="600" />
  <br/>
  <em>Dosya giriş ekranı</em>
</p>

<p align="center">
  <img src="docs/screenshots/dashboard_screen.png" alt="Gösterge Paneli" width="800" />
  <br/>
  <em>Süreçlerinizi ve istatistikleri görüntüleyebileceğiniz ana gösterge paneli</em>
</p>

---

## Kimler Kullanabilir?

Kamu İhale Kanunu kapsamında **Doğrudan Temin** ile alım yapan tüm kurum ve
kuruluşlar için tasarlanmıştır:

- **Belediyeler** (Büyük, orta ve küçük ölçekli ihale düzenleyen tüm
  müdürlükler)
- **İl Özel İdareleri**
- **Hastaneler** ve **Üniversiteler**
- **İl Milli Eğitim Müdürlükleri**
- **İçişleri Bakanlığı** Merkez ve Taşra Müdürlükleri
- **Milli Savunma Bakanlığı** ve ilgili Başkanlıkları
- **Karayolları, DSİ, İller Bankası**, **Adalet Bakanlığı Ceza İnfaz Kurumları**
- **Sosyal Güvenlik Kurumları**

---

## Basıma Hazır Alabileceğiniz Belgeler

Sistemden saniyeler içinde otomatik olarak üretip çıktısını alabileceğiniz
belgeler:

- Doğrudan Temin Onay Belgesi
- Yaklaşık Maliyet Hesap Cetveli ve Görevlendirme Yazısı
- İhtiyaç Listesi ve Talep Yazısı (Lüzum Müzekkeresi)
- Firmalardan Teklif İsteme Yazısı
- Piyasa Araştırma Tutanağı
- Geçmiş Alımlar Tutanağı
- Doğrudan Temin Gerekçe Tutanağı
- Sipariş Formu ve Sözleşme
- Kabul Tutanağı ve Ödeme Emri Yazısı
- Doğrudan Temin Kayıt Formu
- Doğrudan Temin Arşiv Dosyaları...

---

## Gelişmiş Raporlama

Bütçe harcama raporlarınız tek tuşla elinizin altında:

- Hangi bütçe kaleminden?
- Hangi tarih aralığında?
- Hangi temin şeklinden veya iş türlerinde?
- Ne kadar alım gerçekleştirdiniz?

Tüm bu soruların yanıtlarını güçlü ve dinamik raporlama ekranlarıyla anında
alabilirsiniz.

---

## Dosya Formatı

`.dtal` dosyaları ZIP tabanlı bir yapıya sahiptir. İçeriği:

```
dosya.dtal
├── database.sqlite    ← Tüm veriler
├── meta.json          ← Sürüm ve şema bilgisi
└── attachments/       ← Varsa ek dosyalar
```

Bu yapı sayesinde dosyalarınız hem taşınabilir hem de versiyon uyumluluğu
açısından yönetilebilirdir.

---

## Kurulum

```bash
# Bağımlılıkları yükle
pnpm install

# Geliştirme modunda çalıştır
pnpm run dev

# Üretim için derle (Windows)
pnpm run build:win

# Linux veya Mac için derle (İsteğe bağlı)
pnpm run build:linux
pnpm run build:mac
```

---

## Teknolojiler

- [Electron.js](https://www.electronjs.org/) — Masaüstü uygulama çatısı
- [Radix UI](https://www.radix-ui.com/) — Erişilebilirlik odaklı, headless
  bileşen kütüphanesi
- [Tailwind CSS](https://tailwindcss.com/) — `rem` tabanlı, responsive
  utility-first stil sistemi
- [SQLite](https://www.sqlite.org/) /
  [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — Yerel
  veritabanı
- [Socket.io](https://socket.io/) — Çoklu birimler arası yerel ağda (LAN) gerçek
  zamanlı WebSockets senkronizasyonu
- [node-windows](https://github.com/coreybutler/node-windows) — Windows servis
  entegrasyonu

---

## Lisans

Bu proje [GNU Affero General Public License v3.0](./LICENSE) lisansı ile
lisanslanmıştır.

```
hakim-pro-app - Kamu Harcama, İhale ve Hakediş Yönetim Sistemi
Copyright (C) 2026  İlyas Bozdemir
```

---

## Yasal Uyarı ve Sorumluluk Reddi

**ÖNEMLİ:** Bu uygulama, kamu kurumları ve diğer kuruluşların Doğrudan Temin
süreçlerini dijitalleştirmek ve kolaylaştırmak amacıyla **yardımcı bir araç**
olarak geliştirilmiştir. Uygulama üzerinden üretilen belgelerin doğruluğunu,
mevzuata uygunluğunu ve güncelliğini kontrol etmek **tamamen kullanıcının
(idarenin) sorumluluğundadır**. Geliştirici; uygulama üzerinden üretilen hatalı
hesaplamalar, eksik belgeler, mevzuata aykırı işlemler veya veri kayıplarından
dolayı **hiçbir hukuki, idari veya mali sorumluluk kabul etmez**. Kullanıcılar
kritik tutar ve belgeleri her zaman manuel olarak veya ilgili yasal mevzuata
göre son kez gözden geçirmelidir.
