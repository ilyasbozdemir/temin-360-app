export const TANIM_BirimDonusum = {
  name: 'TANIM_BirimDonusum',
  description: 'Ölçü birimleri arasındaki doğrusal ve formüllü dönüşüm ilişkileri tablosu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'kaynak_birim_id', type: 'INTEGER', notNull: true, description: 'Kaynak Ölçü Birimi ID (TANIM_OlcuBirimi.id)' },
    { name: 'hedef_birim_id', type: 'INTEGER', notNull: true, description: 'Hedef Ölçü Birimi ID (TANIM_OlcuBirimi.id)' },
    { name: 'donusum_faktoru', type: 'REAL', description: 'Doğrusal dönüşüm çarpanı (hedef = kaynak * donusum_faktoru)' },
    { name: 'formul', type: 'TEXT', description: 'Karmaşık dönüşüm formülü, örn: (x * 9/5) + 32' },
    { name: 'ters_formul', type: 'TEXT', description: 'Ters dönüşüm formülü, örn: (x - 32) * 5/9' },
    { name: 'aciklama', type: 'TEXT', description: 'Dönüşüm kuralı açıklaması' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mi?' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Oluşturulma Tarihi'
    }
  ],
  constraints: [
    'FOREIGN KEY (kaynak_birim_id) REFERENCES TANIM_OlcuBirimi(id) ON DELETE CASCADE',
    'FOREIGN KEY (hedef_birim_id) REFERENCES TANIM_OlcuBirimi(id) ON DELETE CASCADE',
    'UNIQUE(kaynak_birim_id, hedef_birim_id)'
  ],
  initialData: []
}
