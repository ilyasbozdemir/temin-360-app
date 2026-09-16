# 📄 Mal Alımı Evrak ve Doküman Şablonları Test Rehberi

Bu belge, **TEMİN 360** sisteminde **Mal Alımı (Doğrudan Temin / 4734 Madde 22/d
& İhale)** süreçlerinde otomatik üretilen tüm resmi evrak ve doküman
şablonlarının tam listesini, mevzuat dayanaklarını ve test kontrol listesini
içerir.

> **Nasıl Kullanılır?** İncelediğiniz veya sistemde aktif/öncelikli olmasını
> istediğiniz şablonların başındaki `[ ]` kutucuğunu `[+]` veya `[x]` olarak
> işaretleyebilirsiniz.

---

## 📑 ŞABLON LİSTESİ GENEL TABLOSU

| Durum | Şablon ID                                | Şablon Adı                            | Aşama              | Olur/Onay Desteği | Mevzuat Dayanağı                  |
| :---: | ---------------------------------------- | ------------------------------------- | ------------------ | :---------------: | --------------------------------- |
|  [ ]  | `ihtiyac-listesi`                        | İhtiyaç Listesi                       | 1. Başlangıç       |        ❌         | İlgili Birim İhtiyaç Bildirimi    |
|  [ ]  | `ihtiyac-talep-formu`                    | İhtiyaç Talep Formu                   | 1. Başlangıç       |        ❌         | Taşınır / İdare İhtiyaç Talebi    |
|  [ ]  | `luzum-muzekkeresi`                      | Lüzum Müzekkeresi                     | 1. Başlangıç       |        ✅         | Harcama Yetkilisi Onayı           |
|  [ ]  | `luzum-muzekkeresi-onay-eki`             | Lüzum Müzekkeresi Onay Eki            | 1. Başlangıç       |        ❌         | Malzeme Detay Cetveli             |
|  [ ]  | `luzum-muzekkeresi-teslim-tesellum`      | Lüzum Müzekkeresi Teslim Tesellüm     | 1. Başlangıç       |        ❌         | Ön Teslim Tutanağı                |
|  [ ]  | `harcama-talimati`                       | Harcama Talimatı / Onay Belgesi       | 1. Başlangıç       |        ✅         | 5018 SK / 4734 SK Madde 22        |
|  [ ]  | `komisyon-gorevlendirme-onayi`           | Komisyon Görevlendirme Onayı          | 1. Başlangıç       |        ✅         | Harcama Yetkilisi Oluru           |
|  [ ]  | `komisyon-gorevlendirme-onayi-eki`       | Komisyon Görevlendirme Eki            | 1. Başlangıç       |        ❌         | Asıl / Yedek Üye Dağılımı         |
|  [ ]  | `piyasa-fiyat-arastirma-gorevlendirmesi` | Piyasa Araştırma Görevlendirmesi      | 1. Başlangıç       |        ✅         | Piyasa Araştırma Görevlisi        |
|  [ ]  | `son-alim-fiyat-cetveli`                 | Son Alım Fiyat Cetveli                | 1. Başlangıç       |        ✅         | Yaklaşık Maliyet Dayanağı         |
|  [ ]  | `fiyat-arastirma-mektubu`                | Fiyat Araştırma Mektubu               | 2. Piyasa & Teklif |        ❌         | Firmalara Gönderilen Yazı         |
|  [ ]  | `birim-fiyat-teklif-mektubu`             | Birim Fiyat Teklif Mektubu            | 2. Piyasa & Teklif |        ❌         | Standart İstekli Teklif Mektubu   |
|  [ ]  | `arastirma-mektubu`                      | Piyasa Fiyat İsteme Formu             | 2. Piyasa & Teklif |        ❌         | Faks / E-Posta Teklif Formu       |
|  [ ]  | `yaklasik-maliyet-cetveli`               | Yaklaşık Maliyet Hesap Cetveli        | 2. Piyasa & Teklif |        ❌         | 4734 SK Madde 9 / KİK Tebliği     |
|  [ ]  | `piyasa-fiyat-arastirma-tutanagi`        | Piyasa Fiyat Araştırma Tutanağı       | 2. Piyasa & Teklif |        ✅         | KİK Doğrudan Temin Standart Formu |
|  [ ]  | `kabul-edilen-teklif`                    | Kabul Edilen Teklif / Sipariş Mektubu | 3. Karar & Sipariş |        ❌         | En Uygun Teklif Sahibine Bildirim |
|  [ ]  | `dogrudan-temin-sonuc-onay-belgesi`      | Doğrudan Temin Sonuç Onay Belgesi     | 3. Karar & Sipariş |        ✅         | Harcama Yetkilisi Kesin Kararı    |
|  [ ]  | `sozlesmeye-davet`                       | Sözleşmeye Davet Mektubu              | 3. Karar & Sipariş |        ❌         | İhale / Doğrudan Temin Daveti     |
|  [ ]  | `dogrudan-temin-sozlesmesi`              | Doğrudan Temin Mal Alımı Sözleşmesi   | 3. Karar & Sipariş |        ❌         | Tip Mal Alımı Sözleşmesi          |
|  [ ]  | `muayene-kabul-komisyonu`                | Muayene ve Kabul Komisyonu Tutanağı   | 4. Kabul & Muayene |        ✅         | Taşınır Mal Yönetmeliği / TİF     |
|  [ ]  | `harcama-pusulasi`                       | Harcama Pusulası                      | 4. Ödeme           |        ❌         | Vergi Usul Kanunu / Esnaf Alımı   |

---

## 🔍 AŞAMA AŞAMA ŞABLON DETAYLARI VE TEST SENARYOLARI

### 🟢 1. AŞAMA: İHTİYAÇ TESPİTİ VE BAŞLANGIÇ BELGELERİ

#### [ ] 1.1. İhtiyaç Listesi (`ihtiyac-listesi`)

- **Amaç:** Birimin talep ettiği mal alımı kalemlerini (adı, miktarı, ölçü
  birimi, taşınır kodu ve gerekçesi) tablo halinde düzenler.
- **Mal Alımında Test Edilecek Alanlar:**
  - Kalemlerin sıra numarası, taşınır kodları (`150.01.01...`)
  - Ölçü birimleri (`Adet`, `Paket`, `Kutu`, `Metre` vb.)
  - Talep eden personelin unvanı ve imzası.

#### [ ] 1.2. İhtiyaç Talep Formu (`ihtiyac-talep-formu`)

- **Amaç:** Taşınır kayıt yetkilisine veya ambar birimine iletilen resmi ambar
  çıkış / temin talep formudur.
- **Mal Alımında Test Edilecek Alanlar:**
  - İhtiyaç duyulan malzemenin ambar stok durumu kontrolü.
  - Talep eden birim ve onaylayan şube müdürü bilgileri.

#### [ ] 1.3. Lüzum Müzekkeresi (`luzum-muzekkeresi`) & Ekleri

- **Amaç:** Harcama yetkilisinden alımın başlatılması için onay talep edilen
  resmi gerekçe yazısıdır.
- **Bileşenler:**
  - `luzum-muzekkeresi` (Ana metin ve Harcama Yetkilisi Olur/Onay bloğu)
  - `luzum-muzekkeresi-onay-eki` (Ekli detaylı malzeme listesi)
  - `luzum-muzekkeresi-teslim-tesellum` (Varsa ön teslim/numune tutanağı)
- **Mal Alımında Test Edilecek Alanlar:**
  - Bütçe tertibi ve kullanılabilir ödenek tutarı.
  - "UYGUNDUR / OLUR" imza bloğu (Harcama Yetkilisi, Gerçekleştirme Görevlisi).

#### [ ] 1.4. Harcama Talimatı / Onay Belgesi (`harcama-talimati`)

- **Amaç:** 5018 Sayılı Kamu Mali Yönetimi ve Kontrol Kanunu uyarınca doğrudan
  temin mal alımının resmi başlatma belgesidir.
- **Mal Alımında Test Edilecek Alanlar:**
  - İhale/Temin Usulü: `4734 Sayılı Kanun 22/d Maddesi (Doğrudan Temin)`
  - Alım Konusu & Niteliği (Mal Alımı)
  - Yaklaşık Maliyet (Sayı ve **Yazı ile TL** çevirisi)
  - Kullanılabilir Ödenek Tutarı ve Bütçe Tertibi
  - Görevlendirilen Piyasa Fiyat Araştırması Görevlileri.

#### [ ] 1.5. Piyasa Fiyat Araştırması Görevlendirmesi (`piyasa-fiyat-arastirma-gorevlendirmesi`)

- **Amaç:** Harcama yetkilisi tarafından piyasada fiyat araştırması yapmak üzere
  1 veya daha fazla personelin görevlendirildiği resmi yazıdır.
- **Mal Alımında Test Edilecek Alanlar:**
  - Görevlendirilen personellerin adı, soyadı, unvanı.
  - İnceleme ve araştırma için verilen süre.

#### [ ] 1.6. Son Alım Fiyat Cetveli (`son-alim-fiyat-cetveli`)

- **Amaç:** Yaklaşık maliyete dayanak olmak üzere, idarenin aynı malzemeyi son
  1-2 yıl içinde kaça aldığını gösteren tarihli kayıt cetvelidir.
- **Mal Alımında Test Edilecek Alanlar:**
  - Önceki fatura / sözleşme tarihleri, birim fiyatları, TEFE/ÜFE endeksleme
    oranları.

---

### 🟡 2. AŞAMA: PİYASA FİYAT ARAŞTIRMASI VE TEKLİF BELGELERİ

#### [ ] 2.1. Fiyat Araştırma Mektubu (`fiyat-arastirma-mektubu`)

- **Amaç:** Piyasada faaliyet gösteren isteklilere/firmalara gönderilen resmi
  teklif isteme davet yazısıdır.
- **Mal Alımında Test Edilecek Alanlar:**
  - Malzemelerin teknik özellikleri, teslim yeri (İdare ambarı/adresi), teslim
    süresi (Örn: 15 iş günü).
  - Tekliflerin son teslim tarihi ve saati.
  - İdare iletişim bilgileri ve vergi dairesi/numarası.

#### [ ] 2.2. Birim Fiyat Teklif Mektubu & Cetveli (`birim-fiyat-teklif-mektubu`)

- **Amaç:** İsteklilerin doldurup kaşe-imza ile idareye sunduğu standart fiyat
  teklif belgesidir.
- **Mal Alımında Test Edilecek Alanlar:**
  - İstekli firma unvanı, VKN/TCKN, adres ve iletişim bilgileri.
  - Her bir mal kalemi için KDV Hariç Birim Fiyat ve Toplam Tutar.
  - Genel Toplam Tutar (Rakamla ve **Yazıyla TL** formatında).
  - Teklif geçerlilik süresi (Örn: 30 takvim günü).

#### [ ] 2.3. Yaklaşık Maliyet Hesap Cetveli (`yaklasik-maliyet-cetveli`)

- **Amaç:** 4734 Sayılı Kanun Madde 9 ve ilgili KİK Tebliğleri uyarınca
  firmalardan gelen tekliflerin aritmetik ortalaması, standart sapması veya en
  düşük fiyatıyla yaklaşık maliyetin hesaplandığı resmi cetveldir.
- **Mal Alımında Test Edilecek Alanlar:**
  - Firma 1, Firma 2, Firma 3 vb. birim teklif sütunları.
  - Ortalama / Ağırlıklı birim fiyat hesaplamaları.
  - KDV Hariç Yaklaşık Maliyet Tutarı (Rakam ve **Yazı ile**).
  - Piyasa araştırma görevlilerinin asıl/yedek imzaları.

#### [ ] 2.4. Piyasa Fiyat Araştırma Tutanağı (`piyasa-fiyat-arastirma-tutanagi`)

- **Amaç:** Alınan tekliflerin karşılaştırılıp en uygun avantajlı teklifi veren
  firmanın gerekçeli olarak belirlendiği karar tutanağıdır.
- **Mal Alımında Test Edilecek Alanlar:**
  - Teklif veren firmaların listesi ve teklif tutarları sıralaması.
  - En uygun teklifi veren firmanın (Kazanan İstekli) açık unvanı ve teklif
    tutarı.
  - Komisyon / Görevli personellerin gerekçeli kararı ve imzaları.
  - Harcama Yetkilisi "ONAYLANMIŞTIR" onay bloğu.

---

### 🔵 3. AŞAMA: SİPARİŞ, SÖZLEŞME VE KARAR BELGELERİ

#### [ ] 3.1. Kabul Edilen Teklif / Sipariş Mektubu (`kabul-edilen-teklif`)

- **Amaç:** Teklifi en uygun bulunan firmaya bildirilen, sipariş onayını ve
  teslim şartlarını içeren resmi tebligat mektubudur.
- **Mal Alımında Test Edilecek Alanlar:**
  - Sipariş verilen malzemelerin dökümü, birim ve toplam fiyatları.
  - Malın teslim edileceği depo/adres, mesai saatleri.
  - Muayene kabul ve fatura kesim kuralları.

#### [ ] 3.2. Doğrudan Temin Sonuç Onay Belgesi (`dogrudan-temin-sonuc-onay-belgesi`)

- **Amaç:** Alımın hangi firmadan, ne kadar bedelle yapıldığını kesinleştiren
  Harcama Yetkilisi Onayıdır.
- **Mal Alımında Test Edilecek Alanlar:**
  - Yüklenici Adı/Unvanı, Vergi No.
  - Kesinleşen Sözleşme/Sipariş Bedeli (Sayıyla ve **Yazıyla**).
  - Bütçe Tertibi, Ödenek Durumu ve KDV Tevkifatı (varsa).

#### [ ] 3.3. Sözleşmeye Davet Mektubu (`sozlesmeye-davet`)

- **Amaç:** Sözleşme yapılması öngörülen doğrudan temin veya ihale alımlarında
  firmanın sözleşme imzalamaya çağrıldığı yazıdır.
- **Mal Alımında Test Edilecek Alanlar:**
  - Sözleşme imza süresi (Örn: 10 gün içinde).
  - İstenen belgeler (Vergi borcu yoktur, SGK borcu yoktur, kesin teminat vb.).

#### [ ] 3.4. Doğrudan Temin Mal Alımı Sözleşmesi (`dogrudan-temin-sozlesmesi`)

- **Amaç:** İdare ile Yüklenici arasında imzalanan tip mal alımı sözleşmesidir.
- **Mal Alımında Test Edilecek Alanlar:**
  - Sözleşmenin konusu, süresi, teslim şartları.
  - Gecikme cezası oranları (%0.5 vb.).
  - Garanti süresi, ayıplı mal değişimi, ihtilafların çözümü (Yetkili
    Mahkemeler).

---

### 🟣 4. AŞAMA: KABUL, MUAYENE VE ÖDEME İŞLEMLERİ

#### [ ] 4.1. Muayene ve Kabul Komisyonu Tutanağı (`muayene-kabul-komisyonu`)

- **Amaç:** Taşınır Mal Yönetmeliği ve Mal Alımları Denetim, Muayene ve Kabul
  İşlemlerine Dair Yönetmelik gereğince malın idareye eksiksiz ve teknik
  şartnameye uygun teslim alındığını belgeleyen tutanaktır.
- **Mal Alımında Test Edilecek Alanlar:**
  - Fatura Tarih ve Numarası, İrsaliye Numarası.
  - Malzemelerin fiziksel kontrolü, parti/seri no veya son kullanma tarihleri.
  - Komisyon Başkanı, Uzman Üye ve Ambar Yetkilisi imzaları.
  - "Muayene ve Kabulü Yapılmıştır / Taşınır İşlem Fişi (TİF) Kesilebilir"
    onayı.

#### [ ] 4.2. Harcama Pusulası (`harcama-pusulasi`)

- **Amaç:** Vergi mükellefi olmayan şahıslardan yapılan küçük çaplı mal/hizmet
  alımlarında ve esnaf muaflığı kapsamında düzenlenen ödeme belgesidir.
- **Mal Alımında Test Edilecek Alanlar:**
  - Satıcının TCKN, Adres ve İmzası.
  - Gelir vergisi stopaj oranı ve net ödenen tutar (Sayı ve **Yazı ile**).

---

## 🧪 TEST SENARYOLARI (Mal Alımı İçin Uçtan Uca)

### Senaryo 1: Standart Mal Alımı (Kırtasiye / Sarf)

1. **Giriş:** 5 Kalem Kırtasiye Malzemesi girilir (`A4 Kağıt`, `Dosya`,
   `Klasör`, `Kalem`, `Zımba`).
2. **Onay:** `harcama-talimati` üretilir -> Yaklaşık maliyet ve yazı ile tutar
   kontrol edilir.
3. **Teklif:** 3 Farklı İstekli için `fiyat-arastirma-mektubu` üretilir.
4. **Cetvel:** `yaklasik-maliyet-cetveli` ve `piyasa-fiyat-arastirma-tutanagi`
   oluşturulur -> En düşük teklif seçilir.
5. **Sonuç:** `dogrudan-temin-sonuc-onay-belgesi` ve `kabul-edilen-teklif`
   üretilir.
6. **Kabul:** Mal teslim alınınca `muayene-kabul-komisyonu` tutanağı oluşturulup
   imzaya açılır.

### Senaryo 2: Sözleşmeli Mal Alımı (Donanım / Cihaz Alımı)

- Senaryo 1'e ek olarak `sozlesmeye-davet` ve `dogrudan-temin-sozlesmesi`
  üretilerek cezai şartlar, garanti maddeleri ve teslim terminleri doğrulanır.
