# Teklif Birim Fiyat Hakediş

## Yapım İşlerinde Detaylı Hesaplama ve Prosedür

---

## 🎯 Giriş: Hakediş Nedir?

**Hakediş**, yapım işlerinde:

- Gerçekleştirilen **imalat miktarları** karşılığında
- Yükleniciye **ödenecek tutarın hesaplanması** sürecidir

**Teklif Birim Fiyat Hakedişinde** ise:

- Sözleşmede tanımlanan **birim fiyatlar** kullanılır
- **Yapılan miktar × Birim Fiyat = Ödenecek Tutar**

---

## 📋 TEKLIF BİRİM FİYAT HAKEDIŞ SÜRECİ

### 1️⃣ HAKEDIŞ DÜZENLEME (Metraj Tanımlanması)

**Amaç:** Sözleşme pozlarına ait miktar verilerini sisteme girmek

```
Metraj Cetveli Penceresinde Tanımlanacaklar:
├─ Sözleşme Pozu ve Kodu
├─ Genel Metraj (m², m³, adet vb.)
├─ Profil Metrajı (kesit bilgileri)
├─ Demir Metrajı (çelik donatı)
├─ Ataşman Metrajı (çizimli detaylar)
├─ Hafriyat Metrajı (kazı bilgileri)
├─ Tesisat Metrajı (boru, tel vb.)
└─ Bu Hakediş Miktarı (gerçekleşen miktar)
```

**Çıktılar:**

- ✓ Metraj Cetveli Raporu
- ✓ Profil Metrajı Raporu
- ✓ Demir Metrajı Raporu
- ✓ Ataşman Raporu
- ✓ Tesisat Metrajı Raporu

#### Metraj Cetveli Formülü:

```
Toplam Metraj = Genişlik × Yükseklik × Uzunluk (vb. geometrik hesaplar)
Bu Hakediş Miktarı = Gerçekleşen Çalışmanın Miktarı
```

**Örnek:**

```
Poz: "İnşaat Malzemesi - Beton m³"
├─ Yapılacak Toplam: 500 m³
├─ 1. Hakediş: 150 m³
├─ 2. Hakediş: 200 m³ (Bu Hakediş)
└─ 3. Hakediş: 150 m³ (Kalan)
```

---

### 2️⃣ YEŞİL DEFTER (Metraj İcmali) RAPORU

**Tanım:** Hacediş miktarlarının **kümülatif** olarak gösterildiği kısım

**İçerik:**

| Öğe                        | Tanım                                    |
| -------------------------- | ---------------------------------------- |
| **Toplam Hakediş Miktarı** | Sözleşmedeki toplam poz miktarı          |
| **Önceki Hakediş Miktarı** | Bir önceki hakedişe kadar yapılan toplam |
| **Bu Hakediş Miktarı**     | Mevcut hakedişte yapılan miktar          |

#### Yeşil Defter Formülü:

```
Toplam Hakediş Miktarı = Sözleşmede Tanımlanan Toplam Miktar
Önceki Hakediş Miktarı = Kümülatif Önceki Hakedişler
Bu Hakediş Miktarı = Bu Dönemdeki Gerçekleşme

Doğrulama:
Toplam Hakediş Miktarı = Önceki Hakediş Miktarı + Bu Hakediş Miktarı
```

**Örnek Tablo:**

```
Poz         Toplam      Önceki      Bu Hakediş
           Miktar      Hakediş     Miktarı
─────────────────────────────────────────────
Beton       500 m³      350 m³      150 m³
Demir       50 ton      30 ton      20 ton
Kalıp      2000 m²     1500 m²     500 m²
```

**Doğrulama:** 350 + 150 = 500 ✓

---

### 3️⃣ YAPILAN İŞLER LİSTESİ (Çarşaf)

**Tanım:** Hakedişin **tutarlarının** gösterildiği kısım

**İçerik:**

- Birim Fiyat (Sözleşmede tanımlandığı gibi)
- Toplam Hakediş Tutarı
- Önceki Hakediş Tutarı
- **Bu Hakediş Tutarı**

#### Yapılan İşler Listesi Formülü:

```
Toplam Hakediş Tutarı = Toplam Hakediş Miktarı × Sözleşme Birim Fiyatı

Önceki Hakediş Tutarı = (Önceki Hakediş Miktarı × Birim Fiyat)
                        [Bir Önceki Hakedişten Alınır]

Bu Hakediş Tutarı = Toplam Hakediş Tutarı - Önceki Hakediş Tutarı
```

**Örnek Hesaplama:**

```
POZ: Beton İşleri (m³)
Sözleşme Birim Fiyatı: 1.500 TL/m³

1. HAKEDIŞ:
├─ Toplam Miktar: 500 m³
├─ Toplam Tutarı: 500 × 1.500 = 750.000 TL
├─ Önceki Hakediş: 0 TL
└─ Bu Hakediş: 750.000 TL

2. HAKEDIŞ (Mevcut):
├─ Bu Hakediş Miktarı: 150 m³
├─ Toplam Tutarı: 500 × 1.500 = 750.000 TL
├─ Önceki Hakediş: 750.000 TL
└─ Bu Hakediş: 0 TL (Bir sonraki hakedişte artacak)

3. HAKEDIŞ:
├─ Bu Hakediş Miktarı: 150 m³
├─ Toplam Tutarı: 500 × 1.500 = 750.000 TL
├─ Önceki Hakediş: 750.000 TL
└─ Bu Hakediş: 0 TL (Tamamlandı)
```

---

### 4️⃣ REVİZE BİRİM FİYAT HESABI

**Tanım:** KİK 4734 uyarınca revize yapılması gereken pozların yeni fiyatı

**Revize Ne Zaman Yapılır?**

```
✓ Miktar %5'ten fazla artış/azalış
✓ Teknik şartname değişikliği
✓ Pazar koşullarında önemli değişim
✓ Yeni işlerin eklenmesi
```

#### Revize Birim Fiyat Formülü:

```
Revize Birim Fiyat = Orijinal Birim Fiyat × (Endeks Değişimi / 100)

VEYA

Revize Birim Fiyat = (Orijinal Maliyet + Kar Marjı) × Düzeltme Faktörü
```

**Örnek:**

```
Orijinal Birim Fiyat: 1.500 TL/m³
Pazar Endeksi Artışı: %15
Revize Birim Fiyat: 1.500 × 1,15 = 1.725 TL/m³

Revize Tutarı Farkı = (1.725 - 1.500) × Miktarı
```

**Revize Birim Fiyat Raporu İçeriği:**

- Orijinal Birim Fiyat
- Revize Nedeni
- Endeks/Maliyet Analizi
- **Revize Birim Fiyat**
- Fark Tutarı

---

### 5️⃣ FİYAT FARKI HESABI

**Tanım:** Sözleşme imzalanmasından sonra **pazar koşullarındaki değişimler**
nedeniyle yapılan ek ödeme

**Fiyat Farkı Ne İçin Yapılır?**

```
✓ Malzeme fiyatlarının artması
✓ İşçilik maliyetlerinin değişmesi
✓ Dış ticaret koşullarının değişmesi
✓ Vergi/gümrük oranlarının değişmesi
```

#### Fiyat Farkı Hesaplama Yöntemleri:

**A) DİLİM YÖNTEMİ:**

```
Ödenek dilimlerine göre yapılan hesaplama

Örnek:
1. Dilim (0-100M TL)     : %3
2. Dilim (100-200M TL)   : %5
3. Dilim (200M+ TL)      : %7

Toplam İmalat: 250 M TL ise:
├─ 1. Dilim: 100M × %3 = 3M TL
├─ 2. Dilim: 100M × %5 = 5M TL
└─ 3. Dilim: 50M × %7 = 3,5M TL
   TOPLAM FD: 11,5M TL
```

**B) GENEL ENDEKSİ YÖNTEMİ:**

```
Fiyat Farkı = Sözleşme Bedeli × (Son Endeks - İlk Endeks) / İlk Endeks

Örnek:
Sözleşme Bedeli: 100.000 TL
İmza Tarihi Endeksi: 1000
Hakediş Tarihi Endeksi: 1150

FD = 100.000 × (1150 - 1000) / 1000 = 15.000 TL
```

#### Fiyat Farkı Raporu:

```
Fiyat Farkı Hesabı Raporu İçeriği:
├─ Sözleşme Bedeli
├─ Hakediş Tutarı
├─ Uygulanan Yöntem (Dilim/Endeks)
├─ Hesaplama Detayları
└─ Toplam Fiyat Farkı Tutarı
```

---

### 6️⃣ HAKEDIŞ İCMALİ (İş Grupları Bazında)

**Tanım:** İş gruplarına ait **toplam tutarların** gösterildiği özet bölüm

#### İcmal İçeriği:

| Öğe                        | Tanım                              |
| -------------------------- | ---------------------------------- |
| **Yapılan İşler Toplam**   | Tüm pozların toplam tutarı         |
| **Önceki Hakediş Toplamı** | Bir önceki hakedişin toplam tutarı |
| **Bu Hakediş Toplamı**     | Mevcut hakedişin toplam tutarı     |

#### İcmal Formülü:

```
Yapılan İşler Toplam = Tüm pozların (Miktar × Birim Fiyat) toplamı

Bu Hakediş Toplamı = Bu Hakediş Tutarlarının Toplamı

Doğrulama:
Bu Hakediş Toplamı = Yapılan İşler Toplam - Önceki Hakediş Toplamı
```

**Örnek İcmal Tablosu:**

```
İŞ GRUBU          YAPILAN    ÖNCEKİ      BU HAKEDİŞ
                 TOPLAM     HAKEDİŞ      TOPLAMI
─────────────────────────────────────────────────────
A. Temel İşleri  200.000     0          200.000
B. Üstyapı       500.000     200.000    300.000
C. Dış Cephe     300.000     300.000    0
D. Tesisat       150.000     150.000    0
─────────────────────────────────────────────────────
TOPLAM           1.150.000   650.000    500.000
```

---

### 7️⃣ HAKEDIŞ ÖN KAPAĞI (1. Kapak)

**Tanım:** Hakedişin **başlangıç** sayfası - sözleşme bilgileri

**İçerik:**

```
YAPILARİŞLERİ HAKEDIŞ ÖN KAPAĞI
═════════════════════════════════════

Sözleşme Bilgileri:
├─ Sözleşme No        : ... / ...
├─ Sözleşme Tarihi    : __/__/____
├─ İdari Sözleşme     : Müteahhit ve Müşteri
├─ Mali Sözleşme      : Sözleşme Bedeli
├─ Sözleşme Bedeli    : _____ TL
├─ KDV Oranı          : %___
├─ KDV Tutarı         : _____ TL
└─ Toplam Sözleşme    : _____ TL

Değişiklikler (Varsa):
├─ Sözleşme Artışı/Azalışı : _____ TL
├─ Süre Uzatımı           : ___ gün
└─ Açıklama               : ...

Hakediş Bilgileri:
├─ Hakediş Tarihi     : __/__/____
├─ Hakediş Dönemi     : ___ Dönem
└─ Hazırlanma Tarihi  : __/__/____
```

**Rapor Adı:** "Yapım İşleri Hakediş 1. Kapak (Ön Kapak) Raporu"

---

### 8️⃣ DİZİ PUSULASI

**Tanım:** Hakediş dosyasında **yer alan evrakların listesi**

**İçerik:**

```
HAKEDIŞ DİZİ PUSULASI
═════════════════════════════════════

Sıra  Belge Adı                    Sayfa    Adet
────────────────────────────────────────────────
1.    Ön Kapak                     1        1
2.    Metraj Cetveli               2-3      2
3.    Yeşil Defter Raporu          4-5      2
4.    Yapılan İşler Listesi        6-7      2
5.    Revize Birim Fiyat Hesabı    8        1
6.    Fiyat Farkı Hesabı           9-10     2
7.    İcmal Raporu                 11       1
8.    Arka Kapak                   12       1
9.    Dizi Pusulası                13       1
────────────────────────────────────────────────
TOPLAM SAYFA: 13
TOPLAM BELGE: 9
```

---

### 9️⃣ HAKEDIŞ İCMALİ (Özet - Kesintilerle)

**Tanım:** Yapılan işin **toplam tutarı** - kesintiler varsa oluşturulur

**İçerik:**

```
HAKEDIŞ İCMALİ (ÖZET)
═════════════════════════════════════

Bu Hakediş Brüt Tutarı        : _____ TL  (+)
Fiyat Farkı Tutarı            : _____ TL  (+)
─────────────────────────────────────────────
Toplam İmalat Tutarı          : _____ TL
KDV (%8)                      : _____ TL  (+)
─────────────────────────────────────────────
TOPLAM BRÜT TUTAR             : _____ TL

KESİNTİLER:
Gelir Vergisi Stopajı (%20)   : _____ TL  (-)
FON Payı (%2)                 : _____ TL  (-)
Diğer Mahsuplar               : _____ TL  (-)
─────────────────────────────────────────────
TOPLAM KESİNTİ               : _____ TL

NET ÖDENECEK TUTAR            : _____ TL
```

---

### 🔟 HAKEDIŞ ARKA KAPAĞΙ (4. Kapak)

**Tanım:** Hakedişin **kapanış** sayfası - ödeme bilgileri

**İçerik:**

```
YAPIM İŞLERİ HAKEDIŞ ARKA KAPAĞΙ
═════════════════════════════════════

SÖZLEŞME BİLGİLERİ:
Sözleşme Bedeli               : _____ TL
Sözleşme Artışları (Varsa)    : _____ TL
REVİZE BİRİM FİYAT FARK       : _____ TL
─────────────────────────────────────────────
TOPLAM SÖZLEŞME BEDELİ        : _____ TL

BU HAKEDIŞ TUTARLARI:
Brüt İmalat Tutarı            : _____ TL
Fiyat Farkı Tutarı            : _____ TL
─────────────────────────────────────────────
TOPLAM İMALAT TUTARI          : _____ TL
KDV (%8)                      : _____ TL
─────────────────────────────────────────────
TOPLAM BRÜT TUTAR             : _____ TL

KESINTILER VE MAHSUPLAR:
Gelir Vergisi Stopajı (%20)   : _____ TL
FON Payları                   : _____ TL
İcra Kararı / Mahsup          : _____ TL
─────────────────────────────────────────────
TOPLAM KESİNTİ               : _____ TL

ÖNCEKİ DÖNEMDE FAZLA ÖDENEN   : _____ TL

KÜMÜLATİF DURUMU:
Toplam Yapılan İş             : _____ TL
Toplam Ödenen Tutar           : _____ TL
Kalan Sözleşme Bedeli         : _____ TL

YÜKLENECIYE ÖDENECEK TUTAR    : _____ TL
```

**Rapor Adı:** "Yapım İşleri Hakediş 4. Kapak (Arka Kapak) Raporu"

---

### 1️⃣1️⃣ HAKEDIŞ ÖZETİ

**Tanım:** **Tüm hakedişlerin** toplu gösterimi

**İçerik:**

```
YAPIM İŞLERİ HAKEDİŞ ÖZETİ
═════════════════════════════════════════════════════════════

Hakediş  Dönem Tarihi   İmalat Tutarı  Fiyat Farkı   Toplam Tutar
────────────────────────────────────────────────────────────────
1        01/02/2024    500.000 TL     15.000 TL     515.000 TL
2        01/03/2024    350.000 TL     10.500 TL     360.500 TL
3        01/04/2024    200.000 TL      6.000 TL     206.000 TL
4        01/05/2024    100.000 TL      3.000 TL     103.000 TL
────────────────────────────────────────────────────────────────
TOPLAM                1.150.000 TL    34.500 TL   1.184.500 TL
```

---

## 📊 HAKEDIŞLE İLGİLİ RAPORLAR TABLOSU

| #   | Rapor Adı             | İçerik                               | Excel/Word | Hazırlanış Süresi |
| --- | --------------------- | ------------------------------------ | ---------- | ----------------- |
| 1   | Metraj Cetveli        | Sözleşme pozlarının miktar bilgileri | ✓          | 2-3 gün           |
| 2   | Profil Metrajı        | Kesit/profil bilgileri               | ✓          | 2 gün             |
| 3   | Demir Metrajı         | Donatı çeliği bilgileri              | ✓          | 2 gün             |
| 4   | Ataşman Raporu        | Çizimli detaylar                     | ✓          | 3 gün             |
| 5   | Tesisat Metrajı       | Tesisat bilgileri                    | ✓          | 2 gün             |
| 6   | Yeşil Defter          | Kümülatif miktar takibi              | ✓          | 1 gün             |
| 7   | Yapılan İşler Listesi | Tutarların gösterimi                 | ✓          | 1 gün             |
| 8   | Revize Birim Fiyat    | Fiyat güncellemeleri                 | ✓          | 2 gün             |
| 9   | Fiyat Farkı Hesabı    | Pazar değişim tutarları              | ✓          | 1-2 gün           |
| 10  | İcmal Raporu          | İş grupları toplamları               | ✓          | 1 gün             |
| 11  | Ön Kapak              | Sözleşme bilgileri                   | ✓          | 1 gün             |
| 12  | Dizi Pusulası         | Evrakların listesi                   | ✓          | 1 gün             |
| 13  | İcmali Özet           | Kesintilerle toplam                  | ✓          | 1 gün             |
| 14  | Arka Kapak            | Ödeme bilgileri                      | ✓          | 1 gün             |
| 15  | Hakediş Özeti         | Tüm hakedişler toplu                 | ✓          | 1 gün             |

---

## ⚡ HAKEDIŞTE DİKKAT EDİLECEK NOKTALAR

### 🔴 Yaygın Hatalar:

```
❌ 1. Yeşil Defter Tutarsızlığı
    Kümülatif takip yapılmayması
    ✓ ÇÖZÜM: Her hakediş öncekiyle ilişkilendir

❌ 2. Birim Fiyat Yanlışlığı
    Sözleşme birim fiyatı yanlış kullanılması
    ✓ ÇÖZÜM: Sözleşmeyi tekrar kontrol et

❌ 3. Revize Yapılmaması
    Gerekli revize edilmesi gereken pozlar ihmal edilmesi
    ✓ ÇÖZÜM: KİK 4734'ü ve revize şartlarını takip et

❌ 4. Fiyat Farkı Hesap Hatası
    Yanlış dilim veya endeks kullanılması
    ✓ ÇÖZÜM: Fiyat Farkı Kararnamesini dikkatle oku

❌ 5. Kesinti Hataları
    Gelir vergisi, FON payları yanlış hesaplanması
    ✓ ÇÖZÜM: Güncel vergi tarifelerini kullan

❌ 6. Metraj Bilgileri Eksik
    Profil, demir, tesisat metrajları girilmemesi
    ✓ ÇÖZÜM: Tüm metraj kategorilerini tamamla

❌ 7. Arka Kapak Verileri Tutarsız
    Önceki hakedişler ile uyuşmazlık
    ✓ ÇÖZÜM: Her kapak kapatılmadan önceki kontrol et
```

---

## 📝 HAKEDIŞTE KONTROL LİSTESİ

### Hakedişin Başlangıcı:

- [ ] Sözleşme bilgileri kontrol edildi mi?
- [ ] Sözleşme bedeli ve KDV oranı doğru mu?
- [ ] Birim fiyatlar sözleşmeden alındı mı?

### Metraj Hazırlığı:

- [ ] Tüm pozlar için miktar girildi mi?
- [ ] Profil, demir, tesisat metrajları tamamlandı mı?
- [ ] Metraj raporları oluşturuldu mu?

### Yeşil Defter:

- [ ] Kümülatif miktar doğru mu?
- [ ] Önceki hakedişlerle tutarlı mı?
- [ ] Toplam metraj sözleşme miktarına eşit mi?

### Yapılan İşler Listesi:

- [ ] Tutarlar doğru hesaplandı mı?
- [ ] Birim fiyatlar uygulandı mı?
- [ ] Toplam tutarlar yeşil defter ile uyuşuyor mu?

### Revize ve Fiyat Farkı:

- [ ] Revize gereken pozlar belirlendi mi?
- [ ] Fiyat Farkı Kararnamesine göre hesaplama yapıldı mı?
- [ ] Dilim veya Endeks yöntemi doğru seçildi mi?

### Kesintiler:

- [ ] Gelir vergisi %20 doğru hesaplandı mı?
- [ ] FON payları (2+1+0.5) doğru mu?
- [ ] İcra kararları vb. mahsuplar kontrol edildi mi?

### Raporlar:

- [ ] Tüm 15 rapor oluşturuldu mu?
- [ ] Raporlar arasında tutarlılık var mı?
- [ ] İmza ve mühürler yetkilendirme yapılmış mı?

### Son Kontrol:

- [ ] Ön kapak bilgileri doğru mu?
- [ ] Arka kapak ödeme tutarı kontrol edildi mi?
- [ ] Hakediş Özeti tüm hakedişleri kapşıyor mu?
- [ ] Dizi Pusulası tüm sayfaları numaralandırıyor mu?

---

## 💡 ÖRNEK SENARYO

### Veriler:

```
Sözleşme:
├─ Bedeli: 1.000.000 TL
├─ KDV: %8
├─ Süresi: 4 ay

Pozlar:
├─ Poz A (Beton): 500 m³ × 1.500 TL/m³
├─ Poz B (Demir): 50 ton × 5.000 TL/ton
└─ Poz C (Kalıp): 2.000 m² × 100 TL/m²

1. HAKEDIŞ (Şubat):
├─ Poz A: 150 m³
├─ Poz B: 15 ton
└─ Poz C: 600 m²
```

### Hesaplamalar:

```
1. METRAJLARİN TUTARLARA DÖNÜŞTÜRÜLMESİ:

Poz A: 150 m³ × 1.500 TL/m³ = 225.000 TL
Poz B: 15 ton × 5.000 TL/ton = 75.000 TL
Poz C: 600 m² × 100 TL/m² = 60.000 TL
─────────────────────────────────
Bu Hakediş Brüt Tutarı: 360.000 TL

2. FİYAT FARKI HESABI:
Dilim Yöntemi: %2 = 360.000 × 0,02 = 7.200 TL

3. KDV HESABI:
(360.000 + 7.200) × %8 = 29.376 TL

4. KESİNTİLER:
Gelir Vergisi: 367.200 × %20 = 73.440 TL
FON Payı: 367.200 × %3 = 11.016 TL

5. NET ÖDEME:
360.000 + 7.200 + 29.376 - 73.440 - 11.016 = 312.120 TL
```

---

## 📚 İLGİLİ KANUNLAR VE YÖNETMELIKLER

1. **Kamu İhale Kanunu (KİK) No: 4734**
   - Madde 5-7: Satın alma yöntemleri
   - Madde 37: İhale prosedürleri

2. **Kamu İhale Yönetmeliği (KİY)**
   - Madde 22: Götürü ve birim fiyat işleri
   - Madde 55: Fiyat farkı hesabı
   - Madde 75: Defin ve muhasebeleştirme

3. **Vergi Kanunları**
   - Gelir Vergisi Kanunu (GVK)
   - Katma Değer Vergisi Kanunu (KVVK)

4. **SGK Kanunu**
   - Sosyal sigortalar ve genel sağlık sigortası

---

## 🎯 ÖZET: HAKEDIŞTEN ÖDEMEYE AKIŞ

```
1. METRAJLAR GİRİŞİ
   ↓
2. YEŞİL DEFTER OLUŞTURMA (Kümülatif Takip)
   ↓
3. YAPILAN İŞLER LİSTESİ (Tutarlar)
   ↓
4. REVİZE BİRİM FİYAT (Varsa)
   ↓
5. FİYAT FARKI HESABI
   ↓
6. İCMAL RAPORLARI
   ↓
7. KESİNTİLER VE MAHSUPLAR
   ↓
8. KDV HESABI
   ↓
9. NET ÖDEME TUTARININ HESAPLANMASI
   ↓
10. ÖN VE ARKA KAPAK
    ↓
11. YÜKLENECIYE ÖDEME
```

---

## ✅ ÖZETİ YAPIŞI

**Teklif Birim Fiyat Hakediş:**

- ✓ Miktar × Birim Fiyat = Tutar
- ✓ Yeşil Defter ile kümülatif takip
- ✓ Revize birim fiyatlar (KİK 4734)
- ✓ Fiyat Farkı (Dilim/Endeks)
- ✓ Kesintiler (Vergi, FON vb.)
- ✓ 15 ayrı rapor
- ✓ NET ÖDEME

---

**Hazırlayan:** Yapı Yönetim Sistemleri\
**Versiyon:** 3.0\
**Son Güncelleme:** Ağustos 2024
