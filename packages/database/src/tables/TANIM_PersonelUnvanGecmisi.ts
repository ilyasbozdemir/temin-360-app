export const TANIM_PersonelUnvanGecmisi = {
  name: 'TANIM_PersonelUnvanGecmisi',
  description: 'Personelin tarih bazlı kadro unvanı ve görev geçmişi',
  columns: [
    {
      name: 'id',
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true,
      description: 'Sıra / ID'
    },
    {
      name: 'personel_id',
      type: 'INTEGER',
      description: 'Personel ID'
    },
    {
      name: 'unvan',
      type: 'TEXT',
      description: 'Kadro Unvanı (Mühendis, Şube Müdürü, Tekniker, Memur, vb.)'
    },
    {
      name: 'gorev',
      type: 'TEXT',
      description: 'İdari / İhale Görevi (Komisyon Başkanı, Üye, Piyasa Araştırma Görevlisi, vb.)'
    },
    {
      name: 'birim',
      type: 'TEXT',
      description: 'Bağlı Olduğu Birim / Müdürlük'
    },
    {
      name: 'baslangic_tarihi',
      type: 'TEXT',
      description: 'Unvan/Görev Başlangıç Tarihi (YYYY-MM-DD)'
    },
    {
      name: 'bitis_tarihi',
      type: 'TEXT',
      description: 'Unvan/Görev Bitiş Tarihi (YYYY-MM-DD veya NULL ise Halen Devam Ediyor)'
    },
    {
      name: 'aktif_mi',
      type: 'INTEGER',
      default: 1,
      description: 'Aktif / Güncel Kayıt mı?'
    },
    {
      name: 'dayanak_belge',
      type: 'TEXT',
      description: 'Atama Kararnamesi, Onay Yazısı veya Dayanak Belge No'
    },
    {
      name: 'aciklama',
      type: 'TEXT',
      description: 'Açıklama / Notlar'
    },
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
  constraints: [
    'FOREIGN KEY(personel_id) REFERENCES TANIM_Personel(id) ON DELETE CASCADE'
  ],
  initialData: []
}
