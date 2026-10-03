export const TANIM_KomisyonUye = {
  name: 'TANIM_KomisyonUye',
  description: 'Oluşturulan komisyondaki personeller ve görevleri',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'komisyon_id', type: 'INTEGER', notNull: true, description: 'Komisyon ID' }, // TANIM_Komisyon
    { name: 'personel_id', type: 'INTEGER', description: 'Personel ID' }, // TANIM_Personel (Boş olabilir, rol açılıp sonra atanabilir)
    { name: 'gorev_id', type: 'INTEGER', notNull: true, description: 'Gorev ID' }, // TANIM_KomisyonGorevi (Örn: Başkan, Üye)
    { name: 'asil_mi', type: 'BOOLEAN', default: 1, description: 'Asil mı?' }, // Asil Üye mi Yedek Üye mi?
    { name: 'sira', type: 'INTEGER', default: 0, description: 'Sıralama (üyelerin liste içindeki sırası)' },
    { name: 'belgede_goster', type: 'INTEGER', default: 1, description: 'Belgede Gösterilsin mi (1: Evet, 0: Hayır)' },
    { name: 'belge_kapsami', type: 'TEXT', default: "'tumu'", description: 'Belge Kapsamı' },
    { name: 'hedef_belgeler', type: 'TEXT', default: "'[\"*\"]'", description: 'Hedef Belgeler' },
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
    'FOREIGN KEY(komisyon_id) REFERENCES TANIM_Komisyon(id) ON DELETE CASCADE',
    'FOREIGN KEY(personel_id) REFERENCES TANIM_Personel(id) ON DELETE CASCADE',
    'FOREIGN KEY(gorev_id) REFERENCES TANIM_KomisyonGorevi(id) ON DELETE CASCADE'
  ],
  initialData: []
}
