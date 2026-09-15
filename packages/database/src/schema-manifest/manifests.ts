/* eslint-disable */
export const manifests: any[] = [
  {
    "app": "1.0.0-alpha.1",
    "schema_min": 1,
    "schema_max": 1,
    "release_date": "2026-01-15",
    "changes": [
      {
        "schema": 1,
        "type": "init",
        "description": "İlk kurulum — temel tablolar oluşturuldu",
        "tables_added": [
          "TANIM_Mevzuat",
          "TANIM_Birim",
          "TANIM_Personel",
          "DATA_TeminDosyasi"
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.2",
    "schema_min": 1,
    "schema_max": 2,
    "release_date": "2026-03-10",
    "changes": [
      {
        "schema": 2,
        "type": "addTable",
        "description": "TANIM_Ambar tablosu eklendi",
        "tables_added": [
          "TANIM_Ambar"
        ],
        "columns_added": [
          {
            "table": "TANIM_Firma",
            "column": "vergi_no"
          },
          {
            "table": "TANIM_Birim",
            "column": "mudur_id"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.3",
    "schema_min": 1,
    "schema_max": 6,
    "release_date": "2026-05-25",
    "changes": [
      {
        "schema": 3,
        "type": "addColumn",
        "description": "Birim-Personel ilişkisi kuruldu",
        "columns_added": [
          {
            "table": "TANIM_Birim",
            "column": "ilgili_personel_id"
          }
        ]
      },
      {
        "schema": 4,
        "type": "addColumn",
        "description": "Kurum türü alanı eklendi",
        "columns_added": [
          {
            "table": "settings",
            "column": "kurumTuru"
          }
        ]
      },
      {
        "schema": 5,
        "type": "addTable",
        "description": "Şablon sistemi eklendi",
        "tables_added": [
          "TANIM_Sablon",
          "TANIM_Placeholder"
        ]
      },
      {
        "schema": 6,
        "type": "addTable",
        "description": "Alım türü-şablon eşleşme tabloları",
        "tables_added": [
          "TANIM_AlimTuru_Sablon",
          "SABLON_Placeholder"
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.4",
    "schema_min": 1,
    "schema_max": 6,
    "release_date": "2026-05-31",
    "changes": []
  },
  {
    "app": "1.0.0-alpha.5",
    "schema_min": 1,
    "schema_max": 8,
    "release_date": "2026-05-31",
    "changes": [
      {
        "schema": 7,
        "type": "create",
        "description": "TANIM_Kalem tablosu eklendi",
        "tables_added": [
          "TANIM_Kalem"
        ]
      },
      {
        "schema": 8,
        "type": "create",
        "description": "TANIM_TasinirKod tablosu eklendi",
        "tables_added": [
          "TANIM_TasinirKod"
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.6",
    "schema_min": 1,
    "schema_max": 10,
    "release_date": "2026-05-31",
    "changes": [
      {
        "schema": 9,
        "type": "create",
        "description": "TANIM_OkasKod tablosu eklendi (OKAS - Ortak Kamu Alımları Sözlüğü)",
        "tables_added": [
          "TANIM_OkasKod"
        ]
      },
      {
        "schema": 10,
        "type": "alter",
        "description": "TANIM_Kalem tablosuna okas_kodu kolonu eklendi",
        "columns_added": [
          {
            "table": "TANIM_Kalem",
            "column": "okas_kodu"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.7",
    "schema_min": 1,
    "schema_max": 11,
    "release_date": "2026-06-02",
    "changes": [
      {
        "schema": 11,
        "type": "create",
        "description": "TANIM_Birim ve TANIM_OlcuBirimi tabloları eklendi, TANIM_Kalem sütunları genişletildi",
        "tables_added": [
          "TANIM_Birim",
          "TANIM_OlcuBirimi"
        ],
        "columns_added": [
          {
            "table": "TANIM_Kalem",
            "column": "ozelligi"
          },
          {
            "table": "TANIM_Kalem",
            "column": "kdv_orani"
          },
          {
            "table": "TANIM_Kalem",
            "column": "mensei"
          },
          {
            "table": "TANIM_Kalem",
            "column": "is_personel"
          },
          {
            "table": "TANIM_Kalem",
            "column": "personel_asgari_fark_oran"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.8",
    "schema_min": 1,
    "schema_max": 13,
    "release_date": "2026-06-03",
    "changes": [
      {
        "schema": 12,
        "type": "create",
        "description": "TANIM_KodSozlugu tablosu eklendi",
        "tables_added": [
          "TANIM_KodSozlugu"
        ]
      },
      {
        "schema": 13,
        "type": "alter",
        "description": "DATA_TeminDosyasi tablosuna tüm eksik kolonlar eklendi",
        "columns_added": [
          {
            "table": "DATA_TeminDosyasi",
            "column": "birim_id"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "dosya_acilis_tarihi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "butce_yili"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "butce_tipi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "isin_aciklamasi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "antet_ek_satir"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "sunulacak_makam"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "ihtiyac_yeri"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "kurumsal_kod"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "muhasebe_birimi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "harcama_birimi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "finansman_kodu"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "talep_tarihi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "talep_sayisi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "ihale_tipi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "ihale_sekli"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "teklif_sozlesme_turu"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "alt_yuklenici_olacak_mi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "kismi_teklif_verilecek_mi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "fiyat_farki_dayanagi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "yatirim_proje_no"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "avans_verilecek_mi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "yaklasik_maliyet_hesaplamasi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "kdv"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "hesaplama_esasi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "komisyon_takdiri"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "tibbi_cihaz_alimi_mi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "irtibat_yetkilisi_id"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "son_teklif_verme_tarihi"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "onay_personel_id"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "hazirlayan_personel_id"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "durum_asama_id"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "mevzuat_id"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "notlar"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.9",
    "schema_min": 1,
    "schema_max": 14,
    "release_date": "2026-06-04",
    "changes": [
      {
        "schema": 14,
        "type": "create",
        "description": "Aktif Dosya İşlemleri için operasyonel DATA_ tabloları eklendi",
        "tables_added": [
          "DATA_TeminKalem",
          "DATA_TeminFirma",
          "DATA_TeminKalemTeklif",
          "DATA_TeminKomisyon",
          "DATA_TeminBelge"
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.10",
    "schema_min": 1,
    "schema_max": 15,
    "release_date": "2026-06-06",
    "changes": [
      {
        "schema": 15,
        "type": "create",
        "description": "Komisyon Görev Tanımları (Unvanlar) için tablo eklendi",
        "tables_added": [
          "TANIM_KomisyonGorevi"
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.11",
    "schema_min": 1,
    "schema_max": 16,
    "release_date": "2026-06-06",
    "changes": [
      {
        "schema": 16,
        "type": "create",
        "description": "Komisyon üye eşleşmeleri için yeni dinamik yapı",
        "tables_added": [
          "TANIM_Komisyon",
          "TANIM_KomisyonUye"
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.12",
    "schema_min": 1,
    "schema_max": 17,
    "release_date": "2026-06-06",
    "changes": [
      {
        "schema": 17,
        "type": "update",
        "description": "Komisyon türü altyapısı temizlendi"
      }
    ]
  },
  {
    "app": "1.0.0-alpha.13",
    "schema_min": 1,
    "schema_max": 18,
    "release_date": "2026-06-07",
    "changes": [
      {
        "schema": 18,
        "type": "update",
        "description": "TANIM_KomisyonUye personel_id nullable yapildi",
        "raw_sql": [
          "CREATE TABLE TANIM_KomisyonUye_new (id INTEGER PRIMARY KEY AUTOINCREMENT, komisyon_id INTEGER NOT NULL, personel_id INTEGER, gorev_id INTEGER NOT NULL, asil_mi BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(komisyon_id) REFERENCES TANIM_Komisyon(id) ON DELETE CASCADE, FOREIGN KEY(personel_id) REFERENCES TANIM_Personel(id) ON DELETE CASCADE, FOREIGN KEY(gorev_id) REFERENCES TANIM_KomisyonGorevi(id) ON DELETE CASCADE);",
          "INSERT INTO TANIM_KomisyonUye_new SELECT id, komisyon_id, personel_id, gorev_id, asil_mi, created_at, updated_at FROM TANIM_KomisyonUye;",
          "DROP TABLE TANIM_KomisyonUye;",
          "ALTER TABLE TANIM_KomisyonUye_new RENAME TO TANIM_KomisyonUye;"
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.16",
    "schema_min": 1,
    "schema_max": 19,
    "release_date": "2026-06-07",
    "changes": [
      {
        "schema": 19,
        "type": "addColumn",
        "description": "TANIM_Sablon tablosuna versiyonlama icin parent_id ve versiyon kolonlari eklendi",
        "tables_added": [
          "TANIM_Sablon"
        ],
        "columns_added": [
          {
            "table": "TANIM_Sablon",
            "column": "parent_id"
          },
          {
            "table": "TANIM_Sablon",
            "column": "versiyon"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.17",
    "schema_min": 1,
    "schema_max": 20,
    "release_date": "2026-06-07",
    "changes": [
      {
        "schema": 20,
        "type": "addTable",
        "description": "Komisyonlara şablon atamak için TANIM_Komisyon_Sablon tablosu eklendi",
        "tables_added": [
          "TANIM_Komisyon_Sablon"
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.18",
    "schema_min": 1,
    "schema_max": 21,
    "release_date": "2026-06-13",
    "changes": [
      {
        "schema": 21,
        "type": "ALTER",
        "description": "TANIM_Birim tablosuna detsis_kodu alanı eklendi",
        "columns_added": [
          {
            "table": "TANIM_Birim",
            "column": "detsis_kodu"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.19",
    "schema_min": 1,
    "schema_max": 22,
    "release_date": "2026-06-18",
    "changes": [
      {
        "schema": 22,
        "type": "ALTER",
        "description": "TANIM_Sablon tablosuna test_verisi alanı eklendi",
        "columns_added": [
          {
            "table": "TANIM_Sablon",
            "column": "test_verisi"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-alpha.59",
    "schema_min": 1,
    "schema_max": 23,
    "release_date": "2026-06-21",
    "changes": [
      {
        "schema": 23,
        "type": "ALTER",
        "description": "DATA_TeminFirma tablosuna yasaklilik_durumu ve yasaklilik_belgesi alanları eklendi",
        "columns_added": [
          {
            "table": "DATA_TeminFirma",
            "column": "yasaklilik_durumu"
          },
          {
            "table": "DATA_TeminFirma",
            "column": "yasaklilik_belgesi"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.8",
    "schema_min": 1,
    "schema_max": 24,
    "release_date": "2026-06-27",
    "changes": [
      {
        "schema": 24,
        "type": "ALTER",
        "description": "DATA_TeminDosyasi tablosuna ordered_docs, starred_docs ve skipped_docs alanları eklendi",
        "columns_added": [
          {
            "table": "DATA_TeminDosyasi",
            "column": "ordered_docs"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "starred_docs"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "skipped_docs"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.9",
    "schema_min": 1,
    "schema_max": 25,
    "release_date": "2026-07-01",
    "changes": [
      {
        "schema": 25,
        "type": "ADD_TABLE",
        "description": "DATA_DosyaSablonVeri tablosu eklendi",
        "tables_added": [
          "DATA_DosyaSablonVeri"
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.20",
    "schema_min": 1,
    "schema_max": 26,
    "release_date": "2026-07-01",
    "changes": [
      {
        "schema": 26,
        "type": "alter",
        "description": "DATA_TeminDosyasi tablosuna yillara_yaygin ve sozlesme_yapilacak_mi kolonlari eklendi",
        "columns_added": [
          {
            "table": "DATA_TeminDosyasi",
            "column": "yillara_yaygin"
          },
          {
            "table": "DATA_TeminDosyasi",
            "column": "sozlesme_yapilacak_mi"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.31",
    "schema_min": 1,
    "schema_max": 27,
    "release_date": "2026-07-07",
    "changes": [
      {
        "schema": 27,
        "type": "alter",
        "description": "DATA_TeminDosyasi tablosuna isin_aciklama_maddeleri kolonu eklendi",
        "columns_added": [
          {
            "table": "DATA_TeminDosyasi",
            "column": "isin_aciklama_maddeleri"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.32",
    "schema_min": 1,
    "schema_max": 27,
    "release_date": "2026-07-08",
    "changes": [
      {
        "schema": 27,
        "type": "alter",
        "description": "DATA_TeminDosyasi tablosuna isin_aciklama_maddeleri kolonu eklendi",
        "columns_added": [
          {
            "table": "DATA_TeminDosyasi",
            "column": "isin_aciklama_maddeleri"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.33",
    "schema_min": 1,
    "schema_max": 27,
    "release_date": "2026-07-08",
    "changes": [
      {
        "schema": 27,
        "type": "alter",
        "description": "DATA_TeminDosyasi tablosuna isin_aciklama_maddeleri kolonu eklendi",
        "columns_added": [
          {
            "table": "DATA_TeminDosyasi",
            "column": "isin_aciklama_maddeleri"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.34",
    "schema_min": 1,
    "schema_max": 28,
    "release_date": "2026-07-08",
    "changes": [
      {
        "schema": 28,
        "type": "alter",
        "description": "TANIM_Sablon tablosuna grup_adi ve grup_siralama kolonları eklendi - aynı gruptaki şablonlar tek kart altında birleştirilir",
        "columns_added": [
          {
            "table": "TANIM_Sablon",
            "column": "grup_adi"
          },
          {
            "table": "TANIM_Sablon",
            "column": "grup_siralama"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.52",
    "schema_min": 1,
    "schema_max": 29,
    "release_date": "2026-07-15",
    "changes": [
      {
        "schema": 29,
        "type": "alter",
        "description": "DATA_TeminDosyasi tablosuna yaklasik_maliyet_kdv_dahil_mi kolonu eklendi, Birim İhtiyaç Yerleri (ihtiyac_yeri_eki) alanlarının JSON dizi yapısı olarak saklanması sağlandı.",
        "columns_added": [
          {
            "table": "DATA_TeminDosyasi",
            "column": "yaklasik_maliyet_kdv_dahil_mi"
          },
          {
            "table": "TANIM_Birim",
            "column": "ihtiyac_yeri_eki"
          }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.53",
    "schema_min": 1,
    "schema_max": 29,
    "release_date": "2026-07-16",
    "changes": []
  },
  {
    "app": "1.0.0-beta.54",
    "schema_min": 1,
    "schema_max": 30,
    "release_date": "2026-07-18",
    "changes": [
      {
        "schema": 30,
        "type": "alter",
        "description": "DATA_TeminBelge tablosuna veri_json kolonu eklendi",
        "columns_added": [
          {
            "table": "DATA_TeminBelge",
            "column": "veri_json"
          }
        ]
      }
    ]
  }
,
  {
    "app": "1.0.0-beta.67",
    "schema_min": 1,
    "schema_max": 31,
    "release_date": "2026-07-22",
    "changes": [
      {
        "schema": 31,
        "type": "alter",
        "description": "TANIM_Firma tablosuna CRM alanlari ve TANIM_FirmaIletisimNotu tablosu eklendi",
        "tables_added": [
          "TANIM_FirmaIletisimNotu"
        ],
        "columns_added": [
          { "table": "TANIM_Firma", "column": "deneyim_skoru" },
          { "table": "TANIM_Firma", "column": "kalite_skoru" },
          { "table": "TANIM_Firma", "column": "odeme_disiplini" },
          { "table": "TANIM_Firma", "column": "kara_liste" },
          { "table": "TANIM_Firma", "column": "kara_liste_neden" },
          { "table": "TANIM_Firma", "column": "son_iletisim_tarihi" },
          { "table": "TANIM_Firma", "column": "sorumlu_personel_id" },
          { "table": "TANIM_Firma", "column": "iletisim_notlari" },
          { "table": "TANIM_Firma", "column": "updated_at" }
        ]
      }
    ]
  },
  {
    "app": "1.0.0-beta.123",
    "schema_min": 1,
    "schema_max": 32,
    "release_date": "2026-09-15",
    "changes": [
      {
        "schema": 32,
        "type": "alter",
        "description": "TANIM_Proje ve DATA_AmbarHareket tablolari eklendi, DATA_TeminDosyasi tablosuna proje ve etiket (tags) alanlari eklendi",
        "tables_added": [
          "TANIM_Proje",
          "DATA_AmbarHareket"
        ],
        "columns_added": [
          { "table": "DATA_TeminDosyasi", "column": "project_id" },
          { "table": "DATA_TeminDosyasi", "column": "proje_adi" },
          { "table": "DATA_TeminDosyasi", "column": "tags" }
        ]
      }
    ]
  }
];
