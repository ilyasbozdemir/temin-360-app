# ⚡ TEMİN 360 - PocketBase Self-Hosted Kurulum ve Senkronizasyon Rehberi

Supabase veya ağır veritabanları yerine, **PocketBase** tek bir dosyadan (single binary) çalışan, dahili SQLite veritabanı, Realtime WebSocket ve REST API desteği sunan son derece hafif ve hızlı bir self-hosted çözümdür.

---

## 🚀 1. Hızlı Başlatma (Docker Compose)

PocketBase servisini kendi sunucunuzda veya yerel bilgisayarınızda başlatmak için:

```bash
docker compose -f docker-compose.pocketbase.yml up -d
```

Servis başladıktan sonra:
- **PocketBase Admin Paneli:** `http://localhost:8090/_/`
- **PocketBase API Adresi:** `http://localhost:8090`

---

## 🛠️ 2. İlk Kurulum ve Koleksiyon Yapılandırması

1. Tarayıcınızda `http://localhost:8090/_/` adresini açın.
2. İlk girişte admin e-posta ve parolanızı belirleyin.
3. `New collection` (Yeni Koleksiyon) butonuna tıklayın:
   - **Koleksiyon Adı:** `workspaces` (veya `dosyalar`)
   - **Tür:** Base / File Collection
   - **Alanlar (Fields):**
     - `title` (Plain text)
     - `file_name` (Plain text)
     - `file` (File attachment - `.temin`, `.dtal`)
     - `data_json` (JSON)
     - `total_amount` (Number)

---

## 📲 3. TEMİN 360 Masaüstü Uygulamasından Webe Gönderme (Push)

1. TEMİN 360 uygulamasında üst menü çubuğundaki **Bulut/Eşitleme** simgesine tıklayın.
2. **⚡ PocketBase** sekmesini seçin.
3. PocketBase Sunucu URL adresinizi girin (Varsayılan: `http://localhost:8090`).
4. **Sına & Doğrula** butonuna basarak bağlantıyı onaylayın.
5. **⚡ Webe Gönder (PocketBase)** butonuna tıklayın.
6. Aktif `.temin` çalışma dosyanız anında PocketBase sunucunuza aktarılacak ve Web uygulamanız üzerinden erişilebilir hale gelecektir.

---

## 🌐 4. Web Uygulaması (Next.js) Entegrasyonu

Web uygulamanızın `.env` dosyasına PocketBase URL adresinizi ekleyin:

```env
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
```

`apps/app-web` içerisinde `pocketbaseWeb` yardımcı servisini kullanarak canlı veri çekebilir veya dosyalarınızı tarayıcıda görüntüleyebilirsiniz.
