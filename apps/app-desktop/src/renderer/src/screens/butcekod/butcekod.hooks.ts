import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface ButceKod {
  id: number
  kod: string // örn: 03.2.1.01
  duzey_1: string | null // örn: 03
  duzey_2: string | null // örn: 03.2
  duzey_3: string | null // örn: 03.2.1
  duzey_4: string | null // örn: 03.2.1.01
  duzey: number // 1, 2, 3, 4
  hesap_kodu: string | null // örn: 630.03.02.01.01
  hesap_adi: string
  butce_turu: string | null // Mal Alımı, Hizmet Alımı, Yapım İşi, Danışmanlık
  aciklama: string | null
  aktif_mi: number
  created_at?: string
  updated_at?: string
}

// Helper: 4 Düzey Parse Fonksiyonu
export function parseButceKod(kod: string): {
  duzey_1: string | null
  duzey_2: string | null
  duzey_3: string | null
  duzey_4: string | null
  duzey: number
} {
  const clean = kod.trim()
  if (!clean) {
    return { duzey_1: null, duzey_2: null, duzey_3: null, duzey_4: null, duzey: 1 }
  }

  const parts = clean.split('.').filter(Boolean)
  
  if (parts.length >= 4) {
    return {
      duzey_1: parts[0],
      duzey_2: `${parts[0]}.${parts[1]}`,
      duzey_3: `${parts[0]}.${parts[1]}.${parts[2]}`,
      duzey_4: `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3]}`,
      duzey: 4
    }
  }
  if (parts.length === 3) {
    return {
      duzey_1: parts[0],
      duzey_2: `${parts[0]}.${parts[1]}`,
      duzey_3: `${parts[0]}.${parts[1]}.${parts[2]}`,
      duzey_4: null,
      duzey: 3
    }
  }
  if (parts.length === 2) {
    return {
      duzey_1: parts[0],
      duzey_2: `${parts[0]}.${parts[1]}`,
      duzey_3: null,
      duzey_4: null,
      duzey: 2
    }
  }
  return {
    duzey_1: parts[0] || clean,
    duzey_2: null,
    duzey_3: null,
    duzey_4: null,
    duzey: 1
  }
}

const ensureTableAndFetch = async (): Promise<ButceKod[]> => {
  // Ensure table exists
  await window.electron.ipcRenderer.invoke(
    'db:run',
    `CREATE TABLE IF NOT EXISTS TANIM_ButceKod (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kod TEXT UNIQUE NOT NULL,
      duzey_1 TEXT,
      duzey_2 TEXT,
      duzey_3 TEXT,
      duzey_4 TEXT,
      duzey INTEGER DEFAULT 4,
      hesap_kodu TEXT,
      hesap_adi TEXT NOT NULL,
      butce_turu TEXT DEFAULT 'Mal Alımı',
      aciklama TEXT,
      aktif_mi INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  )

  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_ButceKod ORDER BY kod ASC'
  )
  if (!res.success) throw new Error(res.error)

  // If table is empty, insert initial default entries
  if (!res.data || res.data.length === 0) {
    const initialRecords: Array<Omit<ButceKod, 'id'>> = [
      { kod: '03', duzey_1: '03', duzey_2: null, duzey_3: null, duzey_4: null, duzey: 1, hesap_kodu: '03', hesap_adi: 'Mal ve Hizmet Alım Giderleri', butce_turu: 'Genel', aciklama: 'Mal ve hizmet alımları ana grubu', aktif_mi: 1 },
      { kod: '06', duzey_1: '06', duzey_2: null, duzey_3: null, duzey_4: null, duzey: 1, hesap_kodu: '06', hesap_adi: 'Sermaye Giderleri', butce_turu: 'Yapım İşi', aciklama: 'Yatırım ve gayrimenkul harcamaları', aktif_mi: 1 },
      { kod: '03.2', duzey_1: '03', duzey_2: '03.2', duzey_3: null, duzey_4: null, duzey: 2, hesap_kodu: '03.2', hesap_adi: 'Tüketime Yönelik Mal ve Malzeme Alımları', butce_turu: 'Mal Alımı', aciklama: 'Kırtasiye, enerji, su, temizlik sarfları', aktif_mi: 1 },
      { kod: '03.5', duzey_1: '03', duzey_2: '03.5', duzey_3: null, duzey_4: null, duzey: 2, hesap_kodu: '03.5', hesap_adi: 'Hizmet Alımları', butce_turu: 'Hizmet Alımı', aciklama: 'Bakım-onarım, haberleşme, kiralama', aktif_mi: 1 },
      { kod: '03.7', duzey_1: '03', duzey_2: '03.7', duzey_3: null, duzey_4: null, duzey: 2, hesap_kodu: '03.7', hesap_adi: 'Menkul Mal, Gayrimaddi Hak Alım, Bakım ve Onarım', butce_turu: 'Mal Alımı', aciklama: 'Büro mobilyası, bilgisayar, donanım', aktif_mi: 1 },
      { kod: '03.2.1.01', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.1', duzey_4: '03.2.1.01', duzey: 4, hesap_kodu: '630.03.02.01.01', hesap_adi: 'Kırtasiye Alımları', butce_turu: 'Mal Alımı', aciklama: 'Kağıt, kalem, toner, sarf malzemeleri', aktif_mi: 1 },
      { kod: '03.2.1.02', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.1', duzey_4: '03.2.1.02', duzey: 4, hesap_kodu: '630.03.02.01.02', hesap_adi: 'Büro Malzemesi Alımları', butce_turu: 'Mal Alımı', aciklama: 'Hesap makinesi, zımba, dosya klasörleri', aktif_mi: 1 },
      { kod: '03.2.1.05', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.1', duzey_4: '03.2.1.05', duzey: 4, hesap_kodu: '630.03.02.01.05', hesap_adi: 'Baskı ve Cilt Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Kitap, broşür, dergi basımı ve ciltleme', aktif_mi: 1 },
      { kod: '03.2.2.01', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.2', duzey_4: '03.2.2.01', duzey: 4, hesap_kodu: '630.03.02.02.01', hesap_adi: 'Su Alımları', butce_turu: 'Mal Alımı', aciklama: 'Damacana su, içme suyu ve şebeke suyu', aktif_mi: 1 },
      { kod: '03.2.2.02', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.2', duzey_4: '03.2.2.02', duzey: 4, hesap_kodu: '630.03.02.02.02', hesap_adi: 'Temizlik Malzemesi Alımları', butce_turu: 'Mal Alımı', aciklama: 'Deterjan, dezenfektan ve temizlik sarfları', aktif_mi: 1 },
      { kod: '03.2.3.01', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.3', duzey_4: '03.2.3.01', duzey: 4, hesap_kodu: '630.03.02.03.01', hesap_adi: 'Akaryakıt ve Yağ Alımları', butce_turu: 'Mal Alımı', aciklama: 'Hizmet araçları benzin, motorin, yağ alımları', aktif_mi: 1 },
      { kod: '03.2.3.02', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.3', duzey_4: '03.2.3.02', duzey: 4, hesap_kodu: '630.03.02.03.02', hesap_adi: 'Elektrik Alımları', butce_turu: 'Mal Alımı', aciklama: 'Bina ve tesis elektrik tüketim bedelleri', aktif_mi: 1 },
      { kod: '03.2.3.03', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.3', duzey_4: '03.2.3.03', duzey: 4, hesap_kodu: '630.03.02.03.03', hesap_adi: 'Doğalgaz Alımları', butce_turu: 'Mal Alımı', aciklama: 'Isınma ve mutfak doğalgaz giderleri', aktif_mi: 1 },
      { kod: '03.2.5.01', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.5', duzey_4: '03.2.5.01', duzey: 4, hesap_kodu: '630.03.02.05.01', hesap_adi: 'Giyecek Alımları', butce_turu: 'Mal Alımı', aciklama: 'İş kıyafeti, koruyucu giysi ve ayakkabı alımları', aktif_mi: 1 },
      { kod: '03.5.1.01', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.1', duzey_4: '03.5.1.01', duzey: 4, hesap_kodu: '630.03.05.01.01', hesap_adi: 'Posta ve Telgraf Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Resmi posta, tebligat ve kargo gönderileri', aktif_mi: 1 },
      { kod: '03.5.1.04', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.1', duzey_4: '03.5.1.04', duzey: 4, hesap_kodu: '630.03.05.01.04', hesap_adi: 'İnternet Erişim Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Kurumsal internet ve veri hattı abonelikleri', aktif_mi: 1 },
      { kod: '03.5.2.01', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.2', duzey_4: '03.5.2.01', duzey: 4, hesap_kodu: '630.03.05.02.01', hesap_adi: 'Hizmet Binası Bakım ve Onarım Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Boya, tadilat ve bina küçük onarım hizmetleri', aktif_mi: 1 },
      { kod: '03.5.2.02', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.2', duzey_4: '03.5.2.02', duzey: 4, hesap_kodu: '630.03.05.02.02', hesap_adi: 'Taşıt Bakım ve Onarım Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Araç periyodik bakım, yedek parça ve işçilik', aktif_mi: 1 },
      { kod: '03.5.2.03', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.2', duzey_4: '03.5.2.03', duzey: 4, hesap_kodu: '630.03.05.02.03', hesap_adi: 'İş Makinesi Bakım ve Onarımı', butce_turu: 'Hizmet Alımı', aciklama: 'İş makinesi yedek parça ve tamir işleri', aktif_mi: 1 },
      { kod: '03.5.2.90', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.2', duzey_4: '03.5.2.90', duzey: 4, hesap_kodu: '630.03.05.02.90', hesap_adi: 'Diğer Bakım ve Onarım Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Çeşitli makine ve tesisat onarımları', aktif_mi: 1 },
      { kod: '03.5.4.01', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.4', duzey_4: '03.5.4.01', duzey: 4, hesap_kodu: '630.03.05.04.01', hesap_adi: 'İlan ve Reklam Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Basın ilan ve duyuru giderleri', aktif_mi: 1 },
      { kod: '03.5.4.02', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.4', duzey_4: '03.5.4.02', duzey: 4, hesap_kodu: '630.03.05.04.02', hesap_adi: 'Sigorta Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Kasko, trafik ve yangın sigorta poliçeleri', aktif_mi: 1 },
      { kod: '03.5.5.01', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.5', duzey_4: '03.5.5.01', duzey: 4, hesap_kodu: '630.03.05.05.01', hesap_adi: 'Taşıt Kiralama Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Hizmet aracı ve minibüs kiralamaları', aktif_mi: 1 },
      { kod: '03.7.1.01', duzey_1: '03', duzey_2: '03.7', duzey_3: '03.7.1', duzey_4: '03.7.1.01', duzey: 4, hesap_kodu: '630.03.07.01.01', hesap_adi: 'Büro ve İşyeri Mal ve Malzeme Alımları', butce_turu: 'Mal Alımı', aciklama: 'Masa, sandalye, klima, perde ve ofis donanımları', aktif_mi: 1 },
      { kod: '03.7.2.01', duzey_1: '03', duzey_2: '03.7', duzey_3: '03.7.2', duzey_4: '03.7.2.01', duzey: 4, hesap_kodu: '630.03.07.02.01', hesap_adi: 'Bilgisayar ve Donanım Alımları', butce_turu: 'Mal Alımı', aciklama: 'PC, dizüstü, monitör, yazıcı, sunucu alımları', aktif_mi: 1 },
      { kod: '03.7.2.02', duzey_1: '03', duzey_2: '03.7', duzey_3: '03.7.2', duzey_4: '03.7.2.02', duzey: 4, hesap_kodu: '630.03.07.02.02', hesap_adi: 'Yazılım ve Lisans Alımları', butce_turu: 'Hizmet Alımı', aciklama: 'Yazılım lisans ve güncelleme alımları', aktif_mi: 1 },
      { kod: '06.1.1.01', duzey_1: '06', duzey_2: '06.1', duzey_3: '06.1.1', duzey_4: '06.1.1.01', duzey: 4, hesap_kodu: '630.06.01.01.01', hesap_adi: 'Hizmet Binası Yapım Giderleri', butce_turu: 'Yapım İşi', aciklama: 'Yeni hizmet binası ve tesis inşaat yapımı', aktif_mi: 1 },
      { kod: '06.5.1.01', duzey_1: '06', duzey_2: '06.5', duzey_3: '06.5.1', duzey_4: '06.5.1.01', duzey: 4, hesap_kodu: '630.06.05.01.01', hesap_adi: 'Müşavirlik ve Danışmanlık Giderleri', butce_turu: 'Danışmanlık', aciklama: 'Proje, etüt, kontrollük danışmanlık hizmetleri', aktif_mi: 1 }
    ]

    for (const rec of initialRecords) {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT OR IGNORE INTO TANIM_ButceKod 
         (kod, duzey_1, duzey_2, duzey_3, duzey_4, duzey, hesap_kodu, hesap_adi, butce_turu, aciklama, aktif_mi) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rec.kod,
          rec.duzey_1,
          rec.duzey_2,
          rec.duzey_3,
          rec.duzey_4,
          rec.duzey,
          rec.hesap_kodu,
          rec.hesap_adi,
          rec.butce_turu,
          rec.aciklama,
          rec.aktif_mi
        ]
      )
    }

    const reFetch = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT * FROM TANIM_ButceKod ORDER BY kod ASC'
    )
    return reFetch.data || []
  }

  return res.data
}

export function useButceKodHooks() {
  const queryClient = useQueryClient()

  const { data: butceKodList = [], isLoading } = useQuery({
    queryKey: ['butce_kodlar'],
    queryFn: ensureTableAndFetch
  })

  // Add Mutation
  const addButceKodMutation = useMutation({
    mutationFn: async (kayit: Omit<ButceKod, 'id'>) => {
      const parsed = parseButceKod(kayit.kod)
      const sql = `INSERT INTO TANIM_ButceKod 
        (kod, duzey_1, duzey_2, duzey_3, duzey_4, duzey, hesap_kodu, hesap_adi, butce_turu, aciklama, aktif_mi) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      const params = [
        kayit.kod.trim(),
        kayit.duzey_1 || parsed.duzey_1,
        kayit.duzey_2 || parsed.duzey_2,
        kayit.duzey_3 || parsed.duzey_3,
        kayit.duzey_4 || parsed.duzey_4,
        kayit.duzey || parsed.duzey,
        kayit.hesap_kodu || kayit.kod.trim(),
        kayit.hesap_adi.trim(),
        kayit.butce_turu || 'Mal Alımı',
        kayit.aciklama || '',
        kayit.aktif_mi ?? 1
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['butce_kodlar'] })
    }
  })

  // Update Mutation
  const updateButceKodMutation = useMutation({
    mutationFn: async (kayit: ButceKod) => {
      const parsed = parseButceKod(kayit.kod)
      const sql = `UPDATE TANIM_ButceKod SET
        kod = ?,
        duzey_1 = ?,
        duzey_2 = ?,
        duzey_3 = ?,
        duzey_4 = ?,
        duzey = ?,
        hesap_kodu = ?,
        hesap_adi = ?,
        butce_turu = ?,
        aciklama = ?,
        aktif_mi = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      const params = [
        kayit.kod.trim(),
        kayit.duzey_1 || parsed.duzey_1,
        kayit.duzey_2 || parsed.duzey_2,
        kayit.duzey_3 || parsed.duzey_3,
        kayit.duzey_4 || parsed.duzey_4,
        kayit.duzey || parsed.duzey,
        kayit.hesap_kodu || kayit.kod.trim(),
        kayit.hesap_adi.trim(),
        kayit.butce_turu || 'Mal Alımı',
        kayit.aciklama || '',
        kayit.aktif_mi ?? 1,
        kayit.id
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['butce_kodlar'] })
    }
  })

  // Delete Mutation
  const deleteButceKodMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_ButceKod WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['butce_kodlar'] })
    }
  })

  return {
    butceKodList,
    isLoading,
    addButceKod: addButceKodMutation.mutateAsync,
    updateButceKod: updateButceKodMutation.mutateAsync,
    deleteButceKod: deleteButceKodMutation.mutateAsync
  }
}
