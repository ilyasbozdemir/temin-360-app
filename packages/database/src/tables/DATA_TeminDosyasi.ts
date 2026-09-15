export const DATA_TeminDosyasi = {
  name: 'DATA_TeminDosyasi',
  description: 'Doğrudan temin dosyalarının ana kayıtları',
  columns: [
    {
      name: 'id',
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true,
      description: 'Kayıt Numarası'
    },
    { name: 'temin_no', type: 'TEXT', description: 'Kurum İçi Dosya Numarası' }, // Kurum içi numara (Örn: 2026/DT-001)
    { name: 'dosya_acilis_tarihi', type: 'DATE', description: 'Dosya Açılış Tarihi' },
    { name: 'butce_yili', type: 'INTEGER', description: 'Butce Yili' },
    { name: 'butce_tipi', type: 'TEXT', description: 'Butce Tipi' }, // Tümü | Genel Bütçe | Döner Sermaye | Diğer
    { name: 'konu', type: 'TEXT', notNull: true, description: 'İşin Adı / Temin Konusu' }, // Temin konusu (İşin Adı)
    { name: 'isin_aciklamasi', type: 'TEXT', description: 'İşin Detaylı Açıklaması' },
    { name: 'birim_id', type: 'INTEGER', description: 'Birim ID' }, // İhalesi yapılacak birim (TANIM_Birim)

    // Antet / İdari Alanlar
    { name: 'antet_ek_satir', type: 'TEXT', description: 'Antet Ek Satir' },
    { name: 'sunulacak_makam', type: 'TEXT', description: 'Sunulacak Makam' },
    { name: 'ihtiyac_yeri', type: 'TEXT', description: 'Ihtiyac Yeri' },

    // Mali Kodlar
    { name: 'e_butce', type: 'TEXT', description: 'E Butce' },
    { name: 'say2000i', type: 'TEXT', description: 'Say2000i' },
    { name: 'fonksiyonel_kod', type: 'TEXT', description: 'Fonksiyonel Kod' },
    { name: 'muhasebe_birimi', type: 'TEXT', description: 'Muhasebe Birimi' },
    { name: 'harcama_birimi', type: 'TEXT', description: 'Harcama Birimi' },
    { name: 'finansman_kodu', type: 'TEXT', description: 'Finansman Kodu' },
    { name: 'ekonomik_kod', type: 'TEXT', description: 'Ekonomik Kod' },

    // İhale / Alım Türü
    { name: 'ihale_tipi', type: 'TEXT', default: "'Doğrudan Temin'", description: 'Ihale Tipi' },
    { name: 'tur', type: 'TEXT', notNull: true, default: "'mal'", description: 'Tur' }, // Alım Türü: mal | hizmet | yapim_isi | danismanlik
    { name: 'ihale_sekli', type: 'TEXT', description: 'Ihale Sekli' }, // 22/d*, 22/a vb.

    // Teklif ve Sözleşme
    { name: 'teklif_sozlesme_turu', type: 'TEXT', description: 'Teklif Sozlesme Turu' }, // Birim Fiyat | Götürü Bedel
    {
      name: 'alt_yuklenici_olacak_mi',
      type: 'INTEGER',
      default: 0,
      description: 'Alt Yuklenici Olacak mı?'
    },
    {
      name: 'kismi_teklif_verilecek_mi',
      type: 'INTEGER',
      default: 0,
      description: 'Kismi Teklif Verilecek mı?'
    },
    { name: 'yatirim_proje_no', type: 'TEXT', description: 'Yatirim Proje Numarası' },
    { name: 'project_id', type: 'INTEGER', description: 'Bağlı Olduğu Proje ID (TANIM_Proje)' },
    { name: 'proje_adi', type: 'TEXT', description: 'Bağlı Olduğu Proje Adı' },
    { name: 'tags', type: 'TEXT', default: "'[]'", description: 'Etiketler (JSON Array örn: ["#Acil", "#Tadilat"])' },
    { name: 'avans_verilecek_mi', type: 'INTEGER', default: 0, description: 'Avans Verilecek mı?' },
    {
      name: 'yillara_yaygin',
      type: 'INTEGER',
      default: 0,
      description: 'Yıllara Yaygın Hizmet Alımı mı?'
    },
    {
      name: 'sozlesme_yapilacak_mi',
      type: 'INTEGER',
      default: 0,
      description: 'Sözleşme Yapılacak mı?'
    },
    {
      name: 'isin_aciklama_maddeleri',
      type: 'TEXT',
      description: 'İşin Açıklama Maddeleri (JSON Array)'
    },

    // Hesaplama ve Maliyet
    {
      name: 'yaklasik_maliyet_hesaplamasi',
      type: 'TEXT',
      description: 'Yaklasik Maliyet Hesaplamasi'
    },
    {
      name: 'yaklasik_maliyet_kdv_dahil_mi',
      type: 'INTEGER',
      default: 0,
      description: 'Yaklasik Maliyet KDV Dahil mi?'
    },
    { name: 'kdv', type: 'TEXT', description: 'Kdv' },
    { name: 'hesaplama_esasi', type: 'TEXT', description: 'Hesaplama Esasi' },
    { name: 'komisyon_takdiri', type: 'TEXT', description: 'Komisyon Takdiri' },
    {
      name: 'tibbi_cihaz_alimi_mi',
      type: 'INTEGER',
      default: 0,
      description: 'Tibbi Cihaz Alimi mı?'
    },

    // Süreç / Tarihler / Kişiler
    { name: 'irtibat_yetkilisi_id', type: 'INTEGER', description: 'Irtibat Yetkilisi ID' }, // Personel referans
    { name: 'son_teklif_verme_tarihi', type: 'DATETIME', description: 'Son Teklif Verme Tarihi' },
    { name: 'teslim_tarihi', type: 'DATE', description: 'Teslim Tarihi' }, // Tahmini bitiş tarihi
    { name: 'teslim_gun', type: 'INTEGER', default: 7, description: 'Teslim Süresi (Gün)' },

    { name: 'yaklasik_maliyet', type: 'REAL', default: 0, description: 'Yaklasik Maliyet' },
    { name: 'kesinti_damga', type: 'REAL', default: 0, description: 'Damga Vergisi Kesintisi' },
    { name: 'kesinti_karar_pulu', type: 'REAL', default: 0, description: 'Karar Pulu Kesintisi' },
    {
      name: 'kesinti_kdv_tevkifat',
      type: 'REAL',
      default: 0,
      description: 'KDV Tevkifat Kesintisi'
    },
    { name: 'net_odenen', type: 'REAL', default: 0, description: 'Net Ödenen Tutar' },
    { name: 'butce_kodu', type: 'TEXT', description: 'Butce Kodu' },
    { name: 'temin_tarihi', type: 'DATE', description: 'Temin Tarihi' },
    { name: 'firma_id', type: 'INTEGER', description: 'Firma ID' }, // Seçilen kazanan firma
    { name: 'onay_personel_id', type: 'INTEGER', description: 'Onay Personel ID' }, // Onay veren / harcama yetkilisi
    { name: 'hazirlayan_personel_id', type: 'INTEGER', description: 'Hazirlayan Personel ID' },
    { name: 'talep_eden_personel_id', type: 'INTEGER', description: 'Talep Eden Personel ID' },
    { name: 'sunan_personel_id', type: 'INTEGER', description: 'Sunan Personel ID' },
    { name: 'durum_asama_id', type: 'INTEGER', description: 'Durum Asama ID' }, // TANIM_Asama referansı
    { name: 'mevzuat_id', type: 'INTEGER', description: 'Mevzuat ID' }, // TANIM_Mevzuat kaydına referans
    { name: 'surec_taslak_id', type: 'INTEGER', description: 'Surec Taslak ID' }, // TANIM_SurecTaslak referansı
    { name: 'ordered_docs', type: 'TEXT', description: 'Ordered Docs' }, // Dosyaya özel belge sıralaması (JSON array)
    { name: 'starred_docs', type: 'TEXT', description: 'Starred Docs' }, // Dosyaya özel yıldızlı belgeler (JSON array)
    { name: 'skipped_docs', type: 'TEXT', description: 'Skipped Docs' }, // Dosyaya özel atlanmış belgeler (JSON array)
    { name: 'sablon_tercihleri', type: 'TEXT', default: "'{}'", description: 'Dosyada seçilen şablon tercihleri ve parametreleri (JSON)' },
    { name: 'notlar', type: 'TEXT', description: 'Notlar' },
    { name: 'tekrar_no', type: 'INTEGER', default: 1, description: 'Tekrar Numarası' },
    { name: 'status', type: 'TEXT', default: "'devam_ediyor'", description: 'Status' }, // devam_ediyor, tamamlandi, iptal
    { name: 'is_deleted', type: 'INTEGER', default: 0, description: 'Is Deleted' }, // 0: Aktif, 1: Silinmiş
    { name: 'ekap_no', type: 'TEXT', description: 'Ekap Numarası' }, // EKAP Kayıt Numarası
    { name: 'is_ekap_sent', type: 'INTEGER', default: 0, description: 'Is Ekap Sent' }, // 0: Gönderilmedi, 1: Gönderildi
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Updated At'
    }
  ],
  initialData: []
}
