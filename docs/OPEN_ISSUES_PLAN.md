# 📋 TEMİN 360 — Açık 8 Issue Çözüm ve Uygulama Rehberi

Bu belge, **TEMİN 360** projesinde açık durumda olan **8 GitHub Issue'nun** detaylı teknik analizini, çözüm önerilerini, kodlama adımlarını ve uygulanacak mimarileri içermektedir.

---

## 📌 Açık Issue Listesi Özet Tablosu

| # | Issue Başlığı | Öncelik / Sürüm | Etkilenen Bileşenler |
|---|---------------|-----------------|----------------------|
| **#18** | Düzenleme butonu çalışmıyor & Input veri girişi hatası | 🚨 Yüksek (Bug Fix) | `MalzemeTablosu.tsx`, `MalzemeEkleModal.tsx` |
| **#16** | Şablonlarda fazla kalem girildiğinde sayfa bölünme & imza alanı davranışları | 📐 Orta (Test/UI) | `packages/document-templates`, Paged.js |
| **#9** | Doğrudan Temin Dosyası Oluşturma Sihirbazı (Wizard) | 🪄 Orta (Feature) | `yeni.screen.tsx`, `DosyaSihirbaziModal.tsx` |
| **#11** | Kanban İş Akışı ile Doğrudan Temin Takip Paneli (`/takip`) | 📋 Orta (Feature) | `Takip.screen.tsx`, `KanbanBoard.tsx` |
| **#12** | Bütçe Tüketim ve 22/d Limit Analiz Göstergeleri (Dashboard) | 📊 Orta (Feature) | `Dashboard.tsx`, Recharts, `LimitIndicator.tsx` |
| **#13** | Erişilebilirlik (WCAG) ve Dinamik Yazı Boyutu Ayarı | ♿ Düşük (UI/UX) | `useAccessibilityStore.ts`, `PageWrapper.tsx` |
| **#6** | EKAP ve Harici Entegrasyonlar için Ham Veri Dışa Aktarım Asistanı | 📤 Orta (Feature) | `EkapExportModal.tsx`, `exceljs` |
| **#19** | Ortak SDK, Multi-DB Desteği ve Offline-First Senkronizasyon (v2.0.0) | 🏗️ v2.0.0 Mimari | `@dt/core`, Next.js API, SQLite/PostgreSQL |

---

## 🔍 Detaylı Analizler ve Kodlama Adımları

---

### 1️⃣ Issue #18: Malzeme Düzenleme Butonu ve Input Bug Fix

#### 🐛 Mevcut Durum
Malzemeler ekranında kayıtlı kalemler listelenirken "Düzenle" butonuna tıklandığında seçili kalemin verisi `MalzemeEkleModal` içine yüklenmiyor veya kaydetme sırasında güncelleme yerine yeni kayıt ekliyor.

#### 🛠️ Çözüm & Kodlama Adımları
1. [`MalzemeTablosu.tsx`](file:///d:/Github/ilyas-bozdemir/temin-360-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/components/MalzemeListesi/MalzemeTablosu.tsx) dosyasında düzenleme butonuna tıklanınca tetiklenen `onEditItem(item)` handler'ı kontrol edilecek.
2. Modal state'ine seçilen kalemin `id` değerinin aktarıldığından emin olunacak:
   ```typescript
   const handleEdit = (kalem: any) => {
     setSelectedKalem(kalem);
     setIsModalOpen(true);
   };
   ```
3. `MalzemeEkleModal.tsx` içinde `selectedKalem` prop'u varsa form `defaultValues` nesnesinin sıfırlanması (`reset(selectedKalem)`) sağlanacak.
4. Kaydet butonunda `id` varsa `UPDATE DATA_TeminKalem`, yoksa `INSERT INTO DATA_TeminKalem` çalıştırılacak.

---

### 2️⃣ Issue #16: Şablon Sayfa Bölünmesi (Page Break) ve İmza Yetim (Orphan) Önleme

#### 📐 Mevcut Durum
İhtiyaç Listesi veya Lüzum Müzekkeresi gibi çok kalemli evraklarda 20-30 satır eklendiğinde, tablonun sonundaki **OLUR / Onaylayan** imza blokları tek başına 2. veya 3. sayfaya sarkabilmekte ("yetim" imza bloğu).

#### 🛠️ Çözüm & Kodlama Adımları
1. Tüm TSX şablonlarında (`packages/document-templates/src/templates/...`) imza alanlarını içeren tablo satırlarına CSS `page-break-inside: avoid` ve `break-inside: avoid` kuralları eklenecek:
   ```css
   .signature-container {
     page-break-inside: avoid;
     break-inside: avoid;
     display: block;
   }
   ```
2. Tablo uzunluğu dinamik olarak ölçülerek, eğer son sayfanın alt marjinine 50px'den az kalıyorsa tablonun son satırı ile imza alanının birlikte bir sonraki sayfaya geçmesi sağlanacak (`break-before: page`).
3. `renderPdfBuffer` ve Paged.js render testleri için 5, 15, 30 ve 50 kalemlik test verileriyle otomatik PDF çıktı testi koşulacak.

---

### 3️⃣ Issue #9: Doğrudan Temin Dosya Oluşturma Sihirbazı (Wizard)

#### 🪄 Mevcut Durum
Yeni dosya oluşturma ekranı şu an tek parça uzun bir formdan oluşuyor. Kullanıcıları adım adım yönlendiren bir sihirbaz (Wizard) yapısı bulunmuyor.

#### 🛠️ Çözüm & Kodlama Adımları
1. `apps/app-desktop/src/renderer/src/screens/dosyalar/components/DosyaSihirbaziModal.tsx` bileşeni oluşturulacak.
2. **4 Adımlı Akış**:
   - **Adım 1: Temel Bilgiler** (İşin Adı, Alım Türü, İhale Usulü - 22/d, 22/a vb.)
   - **Adım 2: İhtiyaç Kalemleri** (Malzeme/Hizmet seçimi, miktar, birim)
   - **Adım 3: Bütçe & Limit Kontrolü** (Girilmiş tutar varsa K.İ.K 22/d limit kontrolü uyarısı)
   - **Adım 4: Komisyon & Yetkili Seçimi** (Harcama yetkilisi, gerçekleştirme görevlisi)
3. Her adım tamamlandığında `Zod` validation çalışarak bir sonraki adıma geçişe izin verecek.

---

### 4️⃣ Issue #11: Kanban İş Akışı ve Takip Paneli (`/takip`)

#### 📋 Mevcut Durum
Dosya takip ekranında tüm dosyalar liste şeklinde görünüyor. Süreçlerin durumlarına göre görsel olarak sürüklenebileceği bir tahta yok.

#### 🛠️ Çözüm & Kodlama Adımları
1. [`DosyaTakip.screen.tsx`](file:///d:/Github/ilyas-bozdemir/temin-360-app/apps/app-desktop/src/renderer/src/screens/dosya/sub-screens/DosyaTakip.screen.tsx) içerisine Kanban modları eklenecek (Liste Görünümü / Kanban Görünümü).
2. **4 Kolonlu Kanban Tahtası**:
   - 🟡 **Hazırlık Aşamasında** (`DURUM_HAZIRLIK`)
   - 🔵 **Teklif Toplanıyor** (`DURUM_TEKLIF_TOPLAMA`)
   - 🟣 **Muayene / Onayda** (`DURUM_ONAYDA`)
   - 🟢 **Tamamlandı / Ödendi** (`DURUM_TAMAMLANDI`)
3. Kartlar sürüklendiğinde veya bir sonraki kolona aktarıldığında `DATA_TeminDosyasi` tablosunda `durum` alanı SQLite IPC üzerinden otomatik güncellenecek.

---

### 5️⃣ Issue #12: Bütçe Tüketim ve 22/d Limit Analiz Göstergeleri (Dashboard)

#### 📊 Mevcut Durum
Ana ekranda genel istatistikler yer alıyor ancak 4734 Sayılı Kanun 22/d bütçe limit tüketim oranlarını ve harcama gruplarını gösteren detaylı grafiksel analiz alanı eksik.

#### 🛠️ Çözüm & Kodlama Adımları
1. `Dashboard.tsx` içine **22/d Bütçe Limit İlerleme Çubuğu** eklenecek:
   - *2026 Yılı 22/d Limiti:* 1.021.827,00 TL
   - *Harcaması Yapılan Toplam Tutar:* (Sistemdeki tamamlanan dosyaların toplam tutarı)
   - *Kalan Limit & Tüketim Yüzdesi* (Progress bar + Renkli risk Uyarısı: %80 üzeri sarı, %95 üzeri kırmızı)
2. `Recharts` kütüphanesi kullanılarak:
   - **Aylık Harcama Dağılım Grafiği** (Bar Chart)
   - **Alım Türlerine Göre Dağılım** (Mal / Hizmet / Yapım Pie Chart)

---

### 6️⃣ Issue #13: Erişilebilirlik (WCAG) ve Dinamik Yazı Boyutu Ayarı

#### ♿ Mevcut Durum
Uygulamada tüm yazılar sabit rem/px boyutlarında. Az gören veya büyük yazı tercih eden kullanıcılar için genel font ölçekleme düğmesi bulunmuyor.

#### 🛠️ Çözüm & Kodlama Adımları
1. `apps/app-desktop/src/renderer/src/store/useAccessibilityStore.ts` oluşturulacak:
   ```typescript
   export const useAccessibilityStore = create((set) => ({
     fontSizeScale: 1, // 0.85 (Küçük), 1.0 (Normal), 1.15 (Büyük), 1.3 (Çok Büyük)
     highContrast: false,
     setFontScale: (scale) => set({ fontSizeScale: scale }),
     toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast }))
   }));
   ```
2. [`PageWrapper.tsx`](file:///d:/Github/ilyas-bozdemir/temin-360-app/apps/app-desktop/src/renderer/src/components/layout/PageWrapper.tsx) ana elementine `style={{ fontSize: `${fontSizeScale * 100}%` }}` veya `data-contrast={highContrast}` özniteliği eklenecek.
3. Sidebar veya Üst Bar'a `A-`, `A+`, `Yüksek Kontrast` kısayol araçları yerleştirilecek.

---

### 7️⃣ Issue #6: EKAP ve Harici Entegrasyonlar için Ham Veri Dışa Aktarım Asistanı

#### 📤 Mevcut Durum
Kullanıcılar doğrudan temin verilerini Kamu İhale Kurumu'nun (EKAP) Doğrudan Temin Veri Girişi sistemine aktarırken elle tek tek girmek zorunda kalmaktadır.

#### 🛠️ Çözüm & Kodlama Adımları
1. `apps/app-desktop/src/renderer/src/screens/dosyalar/components/EkapExportModal.tsx` eklenecek.
2. **Filtreler**: Tarih aralığı, Alım Türü, Kazanan Firma, Bütçe Kodu.
3. **EKAP Uyumlu Excel Formatı**:
   - Kolonlar: *Dosya Kayıt No, Alım Adı, Alım Tarihi, Tedarikçi VKN/TCKN, Tedarikçi Unvanı, Sözleşme Bedeli (KDV Hariç), Onay Tarihi*.
4. `exceljs` ile oluşturulan Excel dosyası kullanıcının Masaüstüne/İndirilenler klasörüne kaydedilecek.

---

### 8️⃣ Issue #19: Ortak SDK, Multi-DB ve Offline-First Senkronizasyon (v2.0.0 Hedefleri)

#### 🏗️ Mimari Yol Haritası (v2.0.0)
Bu issue büyük ölçekli bir mimari dönüşüm epic'idir:

1. **`@dt/core` ve `@dt/sdk` Paketi**:
   - Tüm SQLite şema tanımları, iş kuralları ve KDV/Yaklaşık Maliyet hesap motorları masaüstü kopyasından bağımsız npm/monorepo paketine dönüştürülecek.
2. **Next.js & Express API Sunucusu**:
   - `@dt/sdk` paketi hem masaüstü Electron uygulamasında hem de web/cloud ortamında import edilecek.
3. **Dual DB Provider**:
   - Masaüstünde `better-sqlite3`, sunucuda ise `PostgreSQL` veya `MySQL` çalışabilecek ortak bir Repository / Query Abstraction Layer kurulacak.
4. **Offline-First Changelog Sync**:
   - Çevrimdışı yapılan her işlem `SYS_ChangeLog` tablosuna op-log olarak yazılacak; internet bağlandığında sunucu ile çift yönlü `diff` alınıp eşitlenecek.

---

## 📌 Sonraki Adım Önerisi

1. **Önce Hızlı Kazanım (Bug Fix)**: **Issue #18** (Malzeme düzenleme hatası) hemen çözülebilir.
2. **Ardından Kullanıcı Deneyimi**: **Issue #9** (Dosya Sihirbazı) ve **Issue #11** (Kanban Tahtası) ile uygulama v1.0.0 Stable için görsel olarak zenginleştirilebilir.
3. **Son Olarak Veri Verimliliği**: **Issue #6** (EKAP Export) ve **Issue #12** (Bütçe Göstergeleri) eklenerek v1.0.0 tamamlanabilir.
