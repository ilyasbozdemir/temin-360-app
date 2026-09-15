export const DATA_AmbarHareket = {
  name: 'DATA_AmbarHareket',
  description: 'Ambar giriş/çıkış/zimmet ve iade stok hareket kayıtları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ambar_id', type: 'INTEGER', notNull: true, description: 'Ambar FK' },
    { name: 'stok_id', type: 'INTEGER', description: 'Stok FK (DATA_AmbarStok)' },
    { name: 'temin_dosya_id', type: 'INTEGER', description: 'İlişkili Temin Dosyası FK' },
    { name: 'hareket_turu', type: 'TEXT', notNull: true, default: "'giris'", description: 'giris | cikis | zimmet | iade | hasar' },
    { name: 'tasinir_kodu', type: 'TEXT', description: 'Taşınır Kodu' },
    { name: 'kalem_adi', type: 'TEXT', notNull: true, description: 'Kalem Adı' },
    { name: 'miktar', type: 'REAL', notNull: true, default: 0, description: 'İşlem Miktarı' },
    { name: 'olcu_birimi', type: 'TEXT', description: 'Ölçü Birimi' },
    { name: 'birim_fiyat', type: 'REAL', default: 0, description: 'Birim Fiyat' },
    { name: 'toplam_tutar', type: 'REAL', default: 0, description: 'Toplam Tutar' },
    { name: 'belge_turu', type: 'TEXT', description: 'TIF_GIRIS | TIF_CIKIS | ZIMMET | IRSALIYE' },
    { name: 'belge_no', type: 'TEXT', description: 'Fiş/Belge No' },
    { name: 'kisi_veya_birim', type: 'TEXT', description: 'Teslim Alan / Teslim Eden' },
    { name: 'raf_lokasyon', type: 'TEXT', description: 'Raf/Depo Bölümü' },
    { name: 'lot_no', type: 'TEXT', description: 'Seri/Lot Numarası' },
    { name: 'son_kullanma_tarihi', type: 'DATE', description: 'Son Kullanma Tarihi' },
    { name: 'aciklama', type: 'TEXT', description: 'Hareket Açıklaması' },
    {
      name: 'islem_tarihi',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'İşlem Tarihi'
    }
  ],
  initialData: []
}
