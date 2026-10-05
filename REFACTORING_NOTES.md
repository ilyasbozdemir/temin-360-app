# TypeScript Tip Temizliği ve Mimari Refactoring İlkeleri

Bu belge, `MalzemeEkleModal.tsx` ve benzeri bileşenlerde tespit edilen `any` tip kullanımlarının kök nedenlerini, tip çıkarım (type inference) mekanizmalarını ve tip güvenliği mimarisini düzenleme ilkelerini içerir.

---

## 🎯 Temel Refactoring İlkeleri

### 1. Kök Tiplendirme ve Otomatik Tip Çıkarımı (Type Inference)
- **Sorun:** Bileşen girişindeki prop tipi `{ state }: { state: any }` şeklinde bırakıldığında, bileşen içindeki `libraryItems`, `filteredLibraryItems` ve `filteredSuggestions` gibi tüm türetilmiş veriler otomatik olarak `any` olur. Bu durum geliştiricileri alt satırlarda `(item: any)` veya `(prev: any)` gibi gereksiz tip zorlamalarına iter.
- **Çözüm:** Prop seviyesinde `state` doğru tiplendiğinde (örn. `UseMalzemeListesiReturn`), alt fonksiyonlardaki `libraryItems.filter(item => ...)` ve `filteredSuggestions.map(item => ...)` satırlarındaki `item` parametre tipi TypeScript tarafından **otomatik çıkarılır**.
- **Kural:** Tip açıklamalarını (`: any` veya `: LibraryItem`) satır satır tekrarlamak yerine, root veriyi tiplendirip alt satırlardaki gereksiz tip eklerini silmek yeterlidir.

### 2. State Updater parametrelerini (`prev`) Çift Tiplendirmemek
- **Sorun:** `setItemMiktarlar((prev: Record<number, number>) => ...)` yazmak tipi iki yerde tutmak demektir. Hook içindeki `useState<Record<number, number>>` tanımı zaten `prev` tipini belirler.
- **Çözüm:** `setItemMiktarlar(prev => ...)` şeklinde bırakmak en güvenli yoldur. Tipi iki yerde tanımlamak, ileride state tipi değiştiğinde kodun sessizce uyumsuzlaşmasına yol açar.

### 3. Katalog Verisi ile Dosya Kalemini Ayrıştırmak
- **Sorun:** `LibraryItem` için opsiyonel alanlarla (`tipi?`, `birim?`, `kdv_orani?`) tahmin dayalı geçici arayüzler yazmak tip sistemini zayıflatır.
- **Çözüm:**
  - Kütüphane katalog kalemleri (`@temin360/database` üzerindeki veritabanı şemalarından türetilmiş tip) ile ihale/dosya sürecine eklenmiş kalemler (`TeminKalemi`) iki ayrı iş kavramıdır (domain concept).
  - Tip tanımları `packages/database` veya `@temin360/domain` paketinden türetilmeli, ad-hoc opsiyonel `any` türevleri oluşturulmamalıdır.

### 4. Bileşen Prop Yüzeyini Daraltmak (`Pick` & Decoupling)
- **Sorun:** Hook'un döndürdüğü tüm state objesini (`UseMalzemeListesiReturn`) olduğu gibi modal bileşenine paslamak, modal bileşenini hook'un tüm iç detaylarına sıkı sıkıya bağlar (tight coupling).
- **Çözüm:** Modalın sadece ihtiyaç duyduğu alanları `Pick<UseMalzemeListesiReturn, 'libraryItems' | 'handleAddItem' | ...>` ile daraltmak veya modal için özel sorumluluğu olan daha küçük alt hook'lara bölmek bileşen modülerliğini sağlar.

### 5. Tip İhlallerini Önlemek İçin Otomatik Kontroller
- ESLint yapılandırmasında `@typescript-eslint/no-explicit-any` kuralı en azından `warning` olarak aktif tutulmalıdır.
- `tsconfig.json` dosyasında `strict: true` ve `noImplicitAny: true` seçenekleri zorunlu tutulmalıdır.
- Monorepo genelinde `pnpm typecheck` ve `pnpm lint` komutları CI pipeline süreçlerine bağlanmalıdır.

### 6. Dokümantasyonda Göreli Yol (Relative Path) Kullanımı
- Dokümantasyon belgelerinde `file:///d:/Github/...` veya eski depo isimleri (`dt-desktop-app`) gibi makineye özel mutlak yollar kullanılmamalıdır.
- Göreli yollar (örn. `apps/app-desktop/src/renderer/src/screens/dosya/...`) veya sembolik referanslar kullanılmalıdır.
