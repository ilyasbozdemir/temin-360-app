import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Personel {
  id: number
  ad_soyad: string
  unvan: string | null
  gorev?: string | null
  birim: string | null
  sicil_no: string | null
  telefon: string | null
  eposta: string | null
  aktif_mi: number
  notlar: string | null
  avatar?: string | null
}

export interface PersonelUnvanGecmisi {
  id: number
  personel_id: number
  unvan: string
  gorev: string | null
  birim: string | null
  baslangic_tarihi: string
  bitis_tarihi: string | null
  aktif_mi: number
  dayanak_belge: string | null
  aciklama: string | null
  created_at?: string
  updated_at?: string
}

export interface Rol {
  id: number
  rol_adi: string
  rol_kodu: string
  varsayilan_personel_id: number | null
  aciklama: string | null
}

export interface PersonelWithRoles extends Partial<Personel> {
  assignedRoles?: string[] // rol_kodu listesi
}

const ensureUnvanGecmisiTable = async (): Promise<void> => {
  // TANIM_Personel tablosunda gorev kolonu yoksa ekle (Self-healing)
  try {
    const tableInfo = await window.electron.ipcRenderer.invoke(
      'db:query',
      'PRAGMA table_info(TANIM_Personel)'
    )
    if (tableInfo.success && Array.isArray(tableInfo.data)) {
      const cols = tableInfo.data.map((c: { name: string }) => c.name)
      if (!cols.includes('gorev')) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'ALTER TABLE TANIM_Personel ADD COLUMN gorev TEXT;'
        )
      }
    }
  } catch {
    // Ignore if column already exists or table doesn't exist yet
  }

  await window.electron.ipcRenderer.invoke(
    'db:run',
    `CREATE TABLE IF NOT EXISTS TANIM_PersonelUnvanGecmisi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      personel_id INTEGER,
      unvan TEXT,
      gorev TEXT,
      birim TEXT,
      baslangic_tarihi TEXT,
      bitis_tarihi TEXT,
      aktif_mi INTEGER DEFAULT 1,
      dayanak_belge TEXT,
      aciklama TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(personel_id) REFERENCES TANIM_Personel(id) ON DELETE CASCADE
    );`
  )
}

const fetchPersonel = async (): Promise<Personel[]> => {
  await ensureUnvanGecmisiTable()
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Personel ORDER BY id DESC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

const fetchRoller = async (): Promise<Rol[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    "SELECT * FROM TANIM_Roller WHERE rol_kodu != 'ilgili_personel' ORDER BY id ASC"
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export const fetchPersonelUnvanGecmisi = async (
  personelId?: number
): Promise<PersonelUnvanGecmisi[]> => {
  if (!personelId) return []
  await ensureUnvanGecmisiTable()
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_PersonelUnvanGecmisi WHERE personel_id = ? ORDER BY baslangic_tarihi DESC, id DESC',
    [personelId]
  )
  if (!res.success) throw new Error(res.error)
  return res.data || []
}

/**
 * Belirtilen tarihteki personelin geçerli kadro unvanını ve görevini bulur.
 * Eğer o tarihe uyan geçmiş kaydı yoksa personelin güncel unvan/görevini döner.
 */
export const getPersonelUnvanAtDate = async (
  personelId: number,
  targetDate?: string | null
): Promise<{ unvan: string; gorev: string | null; birim: string | null }> => {
  try {
    await ensureUnvanGecmisiTable()
    const queryDate = targetDate ? targetDate.split('T')[0] : new Date().toISOString().split('T')[0]

    const res = await window.electron.ipcRenderer.invoke(
      'db:query',
      `SELECT unvan, gorev, birim 
       FROM TANIM_PersonelUnvanGecmisi 
       WHERE personel_id = ? 
         AND baslangic_tarihi <= ? 
         AND (bitis_tarihi IS NULL OR bitis_tarihi = '' OR bitis_tarihi >= ?)
       ORDER BY baslangic_tarihi DESC LIMIT 1`,
      [personelId, queryDate, queryDate]
    )

    if (res.success && res.data && res.data.length > 0) {
      return {
        unvan: res.data[0].unvan,
        gorev: res.data[0].gorev,
        birim: res.data[0].birim
      }
    }

    // Fallback: Personel ana tablosundaki güncel unvan
    const fallbackRes = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT unvan, gorev, birim FROM TANIM_Personel WHERE id = ? LIMIT 1',
      [personelId]
    )
    if (fallbackRes.success && fallbackRes.data && fallbackRes.data.length > 0) {
      return {
        unvan: fallbackRes.data[0].unvan || '',
        gorev: fallbackRes.data[0].gorev || null,
        birim: fallbackRes.data[0].birim || null
      }
    }
  } catch (err) {
    console.error('getPersonelUnvanAtDate hatası:', err)
  }

  return { unvan: '', gorev: null, birim: null }
}

export interface UsePersonelHooksReturn {
  personelList: Personel[]
  rollerList: Rol[]
  isLoading: boolean
  addPersonel: (personel: PersonelWithRoles) => Promise<unknown>
  updatePersonel: (personel: PersonelWithRoles & { id: number }) => Promise<unknown>
  deletePersonel: (id: number) => Promise<unknown>
}

export function usePersonelHooks(): UsePersonelHooksReturn {
  const queryClient = useQueryClient()

  const { data: personelList = [], isLoading: isPersonelLoading } = useQuery({
    queryKey: ['personel'],
    queryFn: fetchPersonel
  })

  const { data: rollerList = [], isLoading: isRollerLoading } = useQuery({
    queryKey: ['roller'],
    queryFn: fetchRoller
  })

  const addPersonelMutation = useMutation({
    mutationFn: async (personel: PersonelWithRoles) => {
      const sql = `INSERT INTO TANIM_Personel (ad_soyad, unvan, gorev, birim, sicil_no, telefon, eposta, aktif_mi, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      const params = [
        personel.ad_soyad,
        personel.unvan || null,
        personel.gorev || null,
        personel.birim || null,
        personel.sicil_no || null,
        personel.telefon || null,
        personel.eposta || null,
        personel.aktif_mi !== undefined ? personel.aktif_mi : 1,
        personel.avatar || null
      ]

      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)

      const newPersonelId = res.lastInsertRowid

      // Otomatik olarak unvan geçmişi başlangıç kaydı oluştur
      if (personel.unvan) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_PersonelUnvanGecmisi (personel_id, unvan, gorev, birim, baslangic_tarihi, aktif_mi, aciklama) 
           VALUES (?, ?, ?, ?, ?, 1, 'İlk Personel Kaydı / Atama')`,
          [
            newPersonelId,
            personel.unvan,
            personel.gorev || null,
            personel.birim || null,
            new Date().toISOString().split('T')[0]
          ]
        )
      }

      // Rol atamaları
      if (personel.assignedRoles && personel.assignedRoles.length > 0) {
        const transactions: { sql: string; params: unknown[] }[] = []
        for (const r of personel.assignedRoles) {
          transactions.push({
            sql: 'UPDATE TANIM_Roller SET varsayilan_personel_id = ? WHERE rol_kodu = ?',
            params: [newPersonelId, r]
          })
        }
        if (transactions.length > 0) {
          await window.electron.ipcRenderer.invoke('db:transaction', transactions)
        }
      }

      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] })
      queryClient.invalidateQueries({ queryKey: ['roller'] })
      queryClient.invalidateQueries({ queryKey: ['personel_unvan_gecmisi'] })
    }
  })

  const updatePersonelMutation = useMutation({
    mutationFn: async (personel: PersonelWithRoles & { id: number }) => {
      // Önceki unvanı kontrol et
      const oldRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT unvan, gorev, birim FROM TANIM_Personel WHERE id = ?',
        [personel.id]
      )
      const oldUnvan = oldRes.data?.[0]?.unvan || ''
      const oldGorev = oldRes.data?.[0]?.gorev || ''

      const sql = `UPDATE TANIM_Personel SET ad_soyad = ?, unvan = ?, gorev = ?, birim = ?, sicil_no = ?, telefon = ?, eposta = ?, aktif_mi = ?, avatar = ? WHERE id = ?`
      const params = [
        personel.ad_soyad,
        personel.unvan || null,
        personel.gorev || null,
        personel.birim || null,
        personel.sicil_no || null,
        personel.telefon || null,
        personel.eposta || null,
        personel.aktif_mi !== undefined ? personel.aktif_mi : 1,
        personel.avatar || null,
        personel.id
      ]

      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)

      // Eğer unvan veya görev değişmişse ve yeni unvan varsa, geçmişe otomatik olarak yeni dönem ekle
      if (personel.unvan && (personel.unvan !== oldUnvan || personel.gorev !== oldGorev)) {
        const today = new Date().toISOString().split('T')[0]
        // Önceki açık (bitiş tarihi olmayan) geçmiş kayıtlarını bugünün tarihiyle kapat
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `UPDATE TANIM_PersonelUnvanGecmisi 
           SET bitis_tarihi = ?, aktif_mi = 0 
           WHERE personel_id = ? AND (bitis_tarihi IS NULL OR bitis_tarihi = '')`,
          [today, personel.id]
        )

        // Yeni unvan kaydını başlat
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_PersonelUnvanGecmisi (personel_id, unvan, gorev, birim, baslangic_tarihi, aktif_mi, aciklama) 
           VALUES (?, ?, ?, ?, ?, 1, 'Unvan/Görev Güncellemesi')`,
          [personel.id, personel.unvan, personel.gorev || null, personel.birim || null, today]
        )
      }

      // Rol atamalarını güncelle
      if (personel.assignedRoles) {
        const transactions: { sql: string; params: unknown[] }[] = []
        transactions.push({
          sql: 'UPDATE TANIM_Roller SET varsayilan_personel_id = NULL WHERE varsayilan_personel_id = ?',
          params: [personel.id]
        })

        for (const r of personel.assignedRoles) {
          transactions.push({
            sql: 'UPDATE TANIM_Roller SET varsayilan_personel_id = ? WHERE rol_kodu = ?',
            params: [personel.id, r]
          })
        }

        await window.electron.ipcRenderer.invoke('db:transaction', transactions)
      }

      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] })
      queryClient.invalidateQueries({ queryKey: ['roller'] })
      queryClient.invalidateQueries({ queryKey: ['personel_unvan_gecmisi'] })
    }
  })

  const deletePersonelMutation = useMutation({
    mutationFn: async (id: number) => {
      const transactions = [
        {
          sql: 'UPDATE TANIM_Roller SET varsayilan_personel_id = NULL WHERE varsayilan_personel_id = ?',
          params: [id]
        },
        {
          sql: 'DELETE FROM TANIM_PersonelUnvanGecmisi WHERE personel_id = ?',
          params: [id]
        },
        {
          sql: 'DELETE FROM TANIM_Personel WHERE id = ?',
          params: [id]
        }
      ]
      const res = await window.electron.ipcRenderer.invoke('db:transaction', transactions)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] })
      queryClient.invalidateQueries({ queryKey: ['roller'] })
      queryClient.invalidateQueries({ queryKey: ['personel_unvan_gecmisi'] })
    }
  })

  return {
    personelList,
    rollerList,
    isLoading: isPersonelLoading || isRollerLoading,
    addPersonel: addPersonelMutation.mutateAsync,
    updatePersonel: updatePersonelMutation.mutateAsync,
    deletePersonel: deletePersonelMutation.mutateAsync
  }
}

export function usePersonelUnvanGecmisi(personelId?: number): {
  gecmisList: PersonelUnvanGecmisi[]
  isLoading: boolean
  addUnvanGecmisi: (
    item: Omit<PersonelUnvanGecmisi, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<unknown>
  updateUnvanGecmisi: (
    item: Partial<PersonelUnvanGecmisi> & { id: number }
  ) => Promise<unknown>
  deleteUnvanGecmisi: (id: number) => Promise<unknown>
} {
  const queryClient = useQueryClient()

  const { data: gecmisList = [], isLoading } = useQuery({
    queryKey: ['personel_unvan_gecmisi', personelId],
    queryFn: () => fetchPersonelUnvanGecmisi(personelId),
    enabled: Boolean(personelId)
  })

  const addUnvanGecmisiMutation = useMutation({
    mutationFn: async (
      item: Omit<PersonelUnvanGecmisi, 'id' | 'created_at' | 'updated_at'>
    ) => {
      await ensureUnvanGecmisiTable()
      const sql = `INSERT INTO TANIM_PersonelUnvanGecmisi 
        (personel_id, unvan, gorev, birim, baslangic_tarihi, bitis_tarihi, aktif_mi, dayanak_belge, aciklama) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      const params = [
        item.personel_id,
        item.unvan,
        item.gorev || null,
        item.birim || null,
        item.baslangic_tarihi,
        item.bitis_tarihi || null,
        item.aktif_mi ?? (item.bitis_tarihi ? 0 : 1),
        item.dayanak_belge || null,
        item.aciklama || null
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel_unvan_gecmisi'] })
      queryClient.invalidateQueries({ queryKey: ['personel'] })
    }
  })

  const updateUnvanGecmisiMutation = useMutation({
    mutationFn: async (
      item: Partial<PersonelUnvanGecmisi> & { id: number }
    ) => {
      await ensureUnvanGecmisiTable()
      const sql = `UPDATE TANIM_PersonelUnvanGecmisi SET 
        unvan = ?, gorev = ?, birim = ?, baslangic_tarihi = ?, bitis_tarihi = ?, aktif_mi = ?, dayanak_belge = ?, aciklama = ? 
        WHERE id = ?`
      const params = [
        item.unvan,
        item.gorev || null,
        item.birim || null,
        item.baslangic_tarihi,
        item.bitis_tarihi || null,
        item.aktif_mi ?? (item.bitis_tarihi ? 0 : 1),
        item.dayanak_belge || null,
        item.aciklama || null,
        item.id
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel_unvan_gecmisi'] })
      queryClient.invalidateQueries({ queryKey: ['personel'] })
    }
  })

  const deleteUnvanGecmisiMutation = useMutation({
    mutationFn: async (id: number) => {
      await ensureUnvanGecmisiTable()
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_PersonelUnvanGecmisi WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel_unvan_gecmisi'] })
      queryClient.invalidateQueries({ queryKey: ['personel'] })
    }
  })

  return {
    gecmisList,
    isLoading,
    addUnvanGecmisi: addUnvanGecmisiMutation.mutateAsync,
    updateUnvanGecmisi: updateUnvanGecmisiMutation.mutateAsync,
    deleteUnvanGecmisi: deleteUnvanGecmisiMutation.mutateAsync
  }
}
