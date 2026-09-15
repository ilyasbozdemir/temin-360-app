import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Ambar {
  id: number
  ambar_adi: string
  aciklama: string
  adres: string
  semt: string
  posta_kodu: string
  sehir: string
  telefon: string
  faks: string
  web_adresi: string
  email: string
  tasinir_kodu: string
  tasinir_adi: string
  aktif_mi: number
  created_at: string
}

export type AmbarInput = Omit<Ambar, 'id' | 'aktif_mi' | 'created_at'>

export interface AmbarStok {
  id: number
  ambar_id: number
  ambar_adi?: string
  tasinir_kodu?: string
  kalem_adi: string
  olcu_birimi?: string
  toplam_miktar: number
  birim_fiyat?: number
  toplam_tutar?: number
  son_guncelleme?: string
}

export interface AmbarHareket {
  id: number
  ambar_id: number
  ambar_adi?: string
  stok_id?: number
  temin_dosya_id?: number
  dosya_no?: string
  dosya_adi?: string
  hareket_turu: 'giris' | 'cikis' | 'zimmet' | 'iade' | 'hasar'
  tasinir_kodu?: string
  kalem_adi: string
  miktar: number
  olcu_birimi?: string
  birim_fiyat?: number
  toplam_tutar?: number
  belge_turu?: string
  belge_no?: string
  kisi_veya_birim?: string
  raf_lokasyon?: string
  lot_no?: string
  son_kullanma_tarihi?: string
  aciklama?: string
  islem_tarihi?: string
}

export interface TifKayit {
  id: number
  temin_dosya_id: number
  dosya_no?: string
  dosya_adi?: string
  ambar_id: number
  ambar_adi?: string
  fis_no?: string
  fis_tarihi?: string
  fis_turu: 'giris' | 'cikis'
  aciklama?: string
  olusturan_personel_id?: number
  durum: 'taslak' | 'onaylandi' | 'iptal'
  created_at?: string
  kalem_sayisi?: number
  toplam_tutar?: number
  kalemler?: TifKalem[]
}

export interface TifKalem {
  id?: number
  tif_id?: number
  temin_kalem_id?: number
  kalem_adi: string
  miktar: number
  olcu_birimi?: string
  birim_fiyat?: number
  tasinir_kodu?: string
}

export interface CreateTifInput {
  temin_dosya_id: number
  ambar_id: number
  fis_no: string
  fis_tarihi: string
  fis_turu: 'giris' | 'cikis'
  aciklama?: string
  kisi_veya_birim?: string
  raf_lokasyon?: string
  lot_no?: string
  son_kullanma_tarihi?: string
  durum?: 'taslak' | 'onaylandi'
  kalemler: Array<{
    temin_kalem_id?: number
    kalem_adi: string
    miktar: number
    olcu_birimi?: string
    birim_fiyat?: number
    tasinir_kodu?: string
  }>
}

export interface CreateHareketInput {
  ambar_id: number
  stok_id?: number
  temin_dosya_id?: number
  hareket_turu: 'giris' | 'cikis' | 'zimmet' | 'iade' | 'hasar'
  tasinir_kodu?: string
  kalem_adi: string
  miktar: number
  olcu_birimi?: string
  birim_fiyat?: number
  belge_turu?: string
  belge_no?: string
  kisi_veya_birim?: string
  raf_lokasyon?: string
  lot_no?: string
  son_kullanma_tarihi?: string
  aciklama?: string
}

const fetchAmbarlar = async (): Promise<Ambar[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Ambar ORDER BY ambar_adi ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data || []
}

const fetchAmbarStoklar = async (ambarId?: number): Promise<AmbarStok[]> => {
  let sql = `
    SELECT 
      s.*, 
      a.ambar_adi,
      (s.toplam_miktar * COALESCE(s.birim_fiyat, 0)) as toplam_tutar
    FROM DATA_AmbarStok s
    LEFT JOIN TANIM_Ambar a ON a.id = s.ambar_id
  `
  const params: any[] = []
  if (ambarId) {
    sql += ' WHERE s.ambar_id = ?'
    params.push(ambarId)
  }
  sql += ' ORDER BY s.kalem_adi ASC'

  const res = await window.electron.ipcRenderer.invoke('db:query', sql, params)
  if (!res.success) throw new Error(res.error)
  return res.data || []
}

const fetchAmbarHareketler = async (ambarId?: number): Promise<AmbarHareket[]> => {
  let sql = `
    SELECT 
      h.*, 
      a.ambar_adi,
      d.dosya_no,
      d.dosya_adi
    FROM DATA_AmbarHareket h
    LEFT JOIN TANIM_Ambar a ON a.id = h.ambar_id
    LEFT JOIN DATA_TeminDosyasi d ON d.id = h.temin_dosya_id
  `
  const params: any[] = []
  if (ambarId) {
    sql += ' WHERE h.ambar_id = ?'
    params.push(ambarId)
  }
  sql += ' ORDER BY h.islem_tarihi DESC, h.id DESC'

  const res = await window.electron.ipcRenderer.invoke('db:query', sql, params)
  if (!res.success) throw new Error(res.error)
  return res.data || []
}

const fetchTifListesi = async (teminDosyaId?: number): Promise<TifKayit[]> => {
  let sql = `
    SELECT 
      t.*,
      a.ambar_adi,
      d.dosya_no,
      d.dosya_adi,
      (SELECT COUNT(*) FROM DATA_TIF_Kalem k WHERE k.tif_id = t.id) as kalem_sayisi,
      (SELECT SUM(k.miktar * COALESCE(k.birim_fiyat, 0)) FROM DATA_TIF_Kalem k WHERE k.tif_id = t.id) as toplam_tutar
    FROM DATA_TIF t
    LEFT JOIN TANIM_Ambar a ON a.id = t.ambar_id
    LEFT JOIN DATA_TeminDosyasi d ON d.id = t.temin_dosya_id
  `
  const params: any[] = []
  if (teminDosyaId) {
    sql += ' WHERE t.temin_dosya_id = ?'
    params.push(teminDosyaId)
  }
  sql += ' ORDER BY t.created_at DESC, t.id DESC'

  const res = await window.electron.ipcRenderer.invoke('db:query', sql, params)
  if (!res.success) throw new Error(res.error)
  return res.data || []
}

export function useAmbarHooks(selectedAmbarId?: number, selectedDosyaId?: number) {
  const queryClient = useQueryClient()

  const { data: ambarlar = [], isLoading: isLoadingAmbarlar } = useQuery({
    queryKey: ['ambarlar'],
    queryFn: fetchAmbarlar
  })

  const { data: stoklar = [], isLoading: isLoadingStoklar } = useQuery({
    queryKey: ['ambar_stoklar', selectedAmbarId],
    queryFn: () => fetchAmbarStoklar(selectedAmbarId)
  })

  const { data: hareketler = [], isLoading: isLoadingHareketler } = useQuery({
    queryKey: ['ambar_hareketler', selectedAmbarId],
    queryFn: () => fetchAmbarHareketler(selectedAmbarId)
  })

  const { data: tifler = [], isLoading: isLoadingTifler } = useQuery({
    queryKey: ['tif_listesi', selectedDosyaId],
    queryFn: () => fetchTifListesi(selectedDosyaId)
  })

  const invalidateAllAmbar = () => {
    queryClient.invalidateQueries({ queryKey: ['ambarlar'] })
    queryClient.invalidateQueries({ queryKey: ['ambar_stoklar'] })
    queryClient.invalidateQueries({ queryKey: ['ambar_hareketler'] })
    queryClient.invalidateQueries({ queryKey: ['tif_listesi'] })
  }

  const addAmbarMutation = useMutation({
    mutationFn: async (ambar: AmbarInput) => {
      const cols = [
        'ambar_adi',
        'aciklama',
        'adres',
        'semt',
        'posta_kodu',
        'sehir',
        'telefon',
        'faks',
        'web_adresi',
        'email',
        'tasinir_kodu',
        'tasinir_adi'
      ]
      const placeholders = cols.map(() => '?').join(', ')
      const values = cols.map((col) => (ambar as any)[col] || '')
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Ambar (${cols.join(', ')}) VALUES (${placeholders})`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: invalidateAllAmbar
  })

  const updateAmbarMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AmbarInput }) => {
      const cols = Object.keys(data)
      const setClause = cols.map((col) => `${col} = ?`).join(', ')
      const values = cols.map((col) => (data as any)[col] || '')
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Ambar SET ${setClause} WHERE id = ?`,
        [...values, id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: invalidateAllAmbar
  })

  const deleteAmbarMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_Ambar WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: invalidateAllAmbar
  })

  // Tekil Stok Hareketi Ekleme (Zimmet, Hasar, Doğrudan Çıkış/Giriş)
  const addHareketMutation = useMutation({
    mutationFn: async (input: CreateHareketInput) => {
      const toplamTutar = (Number(input.miktar) || 0) * (Number(input.birim_fiyat) || 0)

      // 1. DATA_AmbarHareket kaydı ekle
      const hareketCols = [
        'ambar_id',
        'stok_id',
        'temin_dosya_id',
        'hareket_turu',
        'tasinir_kodu',
        'kalem_adi',
        'miktar',
        'olcu_birimi',
        'birim_fiyat',
        'toplam_tutar',
        'belge_turu',
        'belge_no',
        'kisi_veya_birim',
        'raf_lokasyon',
        'lot_no',
        'son_kullanma_tarihi',
        'aciklama'
      ]
      const placeholders = hareketCols.map(() => '?').join(', ')
      const values = [
        input.ambar_id,
        input.stok_id || null,
        input.temin_dosya_id || null,
        input.hareket_turu,
        input.tasinir_kodu || '',
        input.kalem_adi,
        Number(input.miktar) || 0,
        input.olcu_birimi || '',
        Number(input.birim_fiyat) || 0,
        toplamTutar,
        input.belge_turu || '',
        input.belge_no || '',
        input.kisi_veya_birim || '',
        input.raf_lokasyon || '',
        input.lot_no || '',
        input.son_kullanma_tarihi || null,
        input.aciklama || ''
      ]

      const resHareket = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_AmbarHareket (${hareketCols.join(', ')}) VALUES (${placeholders})`,
        values
      )
      if (!resHareket.success) throw new Error(resHareket.error)

      // 2. DATA_AmbarStok güncelle
      const isIncrease = input.hareket_turu === 'giris' || input.hareket_turu === 'iade'
      const delta = isIncrease ? Number(input.miktar) : -Number(input.miktar)

      // Stok var mı kontrol et
      const existingRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_AmbarStok WHERE ambar_id = ? AND kalem_adi = ?',
        [input.ambar_id, input.kalem_adi]
      )

      if (existingRes.success && existingRes.data && existingRes.data.length > 0) {
        const existing = existingRes.data[0]
        const newMiktar = Math.max(0, (existing.toplam_miktar || 0) + delta)
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_AmbarStok SET toplam_miktar = ?, birim_fiyat = ?, tasinir_kodu = COALESCE(NULLIF(?, ""), tasinir_kodu), son_guncelleme = CURRENT_TIMESTAMP WHERE id = ?',
          [newMiktar, Number(input.birim_fiyat) || existing.birim_fiyat || 0, input.tasinir_kodu || '', existing.id]
        )
      } else {
        const initialMiktar = isIncrease ? Number(input.miktar) : 0
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT INTO DATA_AmbarStok (ambar_id, tasinir_kodu, kalem_adi, olcu_birimi, toplam_miktar, birim_fiyat) VALUES (?, ?, ?, ?, ?, ?)',
          [
            input.ambar_id,
            input.tasinir_kodu || '',
            input.kalem_adi,
            input.olcu_birimi || '',
            initialMiktar,
            Number(input.birim_fiyat) || 0
          ]
        )
      }

      return resHareket
    },
    onSuccess: invalidateAllAmbar
  })

  // Temin Dosyasından TİF & Ambar Girişi Oluşturma
  const createTifFromDosyaMutation = useMutation({
    mutationFn: async (input: CreateTifInput) => {
      // 1. DATA_TIF oluştur
      const tifRes = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_TIF (temin_dosya_id, dosya_id, ambar_id, fis_no, fis_tarihi, fis_turu, aciklama, durum) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.temin_dosya_id,
          input.temin_dosya_id,
          input.ambar_id,
          input.fis_no,
          input.fis_tarihi,
          input.fis_turu || 'giris',
          input.aciklama || '',
          input.durum || 'onaylandi'
        ]
      )
      if (!tifRes.success) throw new Error(tifRes.error)
      const tifId = tifRes.lastInsertRowid || tifRes.data?.lastInsertRowid

      // 2. Her kalem için DATA_TIF_Kalem, DATA_AmbarStok ve DATA_AmbarHareket ekle/güncelle
      for (const item of input.kalemler) {
        if (!item.kalem_adi) continue

        const miktar = Number(item.miktar) || 0
        const birimFiyat = Number(item.birim_fiyat) || 0
        const toplamTutar = miktar * birimFiyat

        // TIF Kalem kaydı
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TIF_Kalem (tif_id, temin_kalem_id, kalem_adi, miktar, olcu_birimi, birim_fiyat, tasinir_kodu)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            tifId,
            item.temin_kalem_id || null,
            item.kalem_adi,
            miktar,
            item.olcu_birimi || '',
            birimFiyat,
            item.tasinir_kodu || ''
          ]
        )

        // Ambar Hareket kaydı
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_AmbarHareket (
            ambar_id, temin_dosya_id, hareket_turu, tasinir_kodu, kalem_adi, 
            miktar, olcu_birimi, birim_fiyat, toplam_tutar, belge_turu, 
            belge_no, kisi_veya_birim, raf_lokasyon, lot_no, son_kullanma_tarihi, aciklama
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.ambar_id,
            input.temin_dosya_id,
            input.fis_turu || 'giris',
            item.tasinir_kodu || '',
            item.kalem_adi,
            miktar,
            item.olcu_birimi || '',
            birimFiyat,
            toplamTutar,
            input.fis_turu === 'cikis' ? 'TIF_CIKIS' : 'TIF_GIRIS',
            input.fis_no,
            input.kisi_veya_birim || '',
            input.raf_lokasyon || '',
            input.lot_no || '',
            input.son_kullanma_tarihi || null,
            input.aciklama || 'Temin dosyasından otomatik TİF aktarımı'
          ]
        )

        // Stok miktarını artır / güncelle
        const existingRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_AmbarStok WHERE ambar_id = ? AND kalem_adi = ?',
          [input.ambar_id, item.kalem_adi]
        )

        if (existingRes.success && existingRes.data && existingRes.data.length > 0) {
          const existing = existingRes.data[0]
          const newMiktar = (existing.toplam_miktar || 0) + miktar
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_AmbarStok SET toplam_miktar = ?, birim_fiyat = ?, tasinir_kodu = COALESCE(NULLIF(?, ""), tasinir_kodu), son_guncelleme = CURRENT_TIMESTAMP WHERE id = ?',
            [newMiktar, birimFiyat || existing.birim_fiyat || 0, item.tasinir_kodu || '', existing.id]
          )
        } else {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'INSERT INTO DATA_AmbarStok (ambar_id, tasinir_kodu, kalem_adi, olcu_birimi, toplam_miktar, birim_fiyat) VALUES (?, ?, ?, ?, ?, ?)',
            [
              input.ambar_id,
              item.tasinir_kodu || '',
              item.kalem_adi,
              item.olcu_birimi || '',
              miktar,
              birimFiyat
            ]
          )
        }
      }

      return { success: true, tifId }
    },
    onSuccess: invalidateAllAmbar
  })

  // TIF Silme
  const deleteTifMutation = useMutation({
    mutationFn: async (tifId: number) => {
      await window.electron.ipcRenderer.invoke('db:run', 'DELETE FROM DATA_TIF_Kalem WHERE tif_id = ?', [tifId])
      const res = await window.electron.ipcRenderer.invoke('db:run', 'DELETE FROM DATA_TIF WHERE id = ?', [tifId])
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: invalidateAllAmbar
  })

  // TIF Durum Değiştirme
  const updateTifDurumMutation = useMutation({
    mutationFn: async ({ id, durum }: { id: number; durum: 'taslak' | 'onaylandi' | 'iptal' }) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TIF SET durum = ? WHERE id = ?',
        [durum, id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: invalidateAllAmbar
  })

  return {
    ambarlar,
    isLoadingAmbarlar,
    stoklar,
    isLoadingStoklar,
    hareketler,
    isLoadingHareketler,
    tifler,
    isLoadingTifler,
    addAmbar: addAmbarMutation.mutateAsync,
    updateAmbar: updateAmbarMutation.mutateAsync,
    deleteAmbar: deleteAmbarMutation.mutateAsync,
    addHareket: addHareketMutation.mutateAsync,
    createTifFromDosya: createTifFromDosyaMutation.mutateAsync,
    deleteTif: deleteTifMutation.mutateAsync,
    updateTifDurum: updateTifDurumMutation.mutateAsync
  }
}
