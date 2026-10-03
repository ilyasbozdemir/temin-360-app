export const TANIM_ButceOdenek = {
  name: 'TANIM_ButceOdenek',
  description: 'Birim bazlı yıllık bütçe başlangıç ödenekleri ve %10 limit takip tanımları',
  columns: [
    {
      name: 'id',
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true,
      description: 'Kayıt ID'
    },
    { name: 'birim_id', type: 'INTEGER', description: 'İlgili Harcama Birimi ID' },
    { name: 'birim_adi', type: 'TEXT', notNull: true, description: 'Harcama Birimi Adı' },
    { name: 'kurumsal_kod', type: 'TEXT', description: 'Kurumsal Kod (Örn: 06.34.02.00)' },
    { name: 'butce_kodu', type: 'TEXT', notNull: true, description: 'Bütçe Tertibi / Ekonomik Kod' },
    { name: 'butce_kalemi', type: 'TEXT', notNull: true, description: 'Bütçe Kalemi Açıklaması' },
    { name: 'butce_turu', type: 'TEXT', default: "'Mal Alımı'", description: 'Alım Türü (Mal Alımı / Hizmet Alımı / Yapım İşi)' },
    { name: 'butce_yili', type: 'INTEGER', notNull: true, description: 'Bütçe Yılı' },
    { name: 'yillik_odenek', type: 'REAL', default: 0, description: 'Tahsis Edilen Yıllık Ödenek Tutarı' },
    { name: 'aciklama', type: 'TEXT', description: 'Açıklama / Notlar' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Oluşturulma Tarihi'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Son Güncelleme'
    }
  ],
  initialData: []
}
