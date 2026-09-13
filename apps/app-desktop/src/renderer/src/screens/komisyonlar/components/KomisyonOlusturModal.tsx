import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Eye, Plus, Search, Trash2, Users } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'

interface KomisyonOlusturModalProps {
  isOpen: boolean
  onClose: () => void
  komisyonId?: number | null
  onPreviewSablon?: (sablon: any) => void
}

// Hazır komisyon şablonları (initial roller)
// Bu veriler hem UI şablonu hem de DB seed kaynağı
const KOMISYON_SABLONLARI = {
  fiyat_arastirma: {
    dbId: 1, // TANIM_Komisyon.id — sabit beklenen ID
    label: 'Yaklaşık Maliyet Tespit Komisyonu',
    roller: [
      'Harcama Yetkilisi',
      'Satın Alma Harcama Yetkilisi',
      'Gerçekleştirme Görevlisi',
      'Muhasebe Yetkilisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi'
    ]
  },
  muayene_kabul: {
    dbId: 2, // TANIM_Komisyon.id — sabit beklenen ID (TANIM_Komisyon.ts initialData ile uyumlu)
    label: 'Muayene Kabul ve Tespit Komisyonu',
    roller: ['Komisyon Başkanı', 'Üye', 'Üye', 'Üye', 'Üye', 'Üye', 'Üye', 'Üye', 'Üye']
  }
} as const

type KomisyonTipi = keyof typeof KOMISYON_SABLONLARI | ''

interface UyeRow {
  id: number
  unvan: string // Görev unvanı (sabit, readonly)
  gorevId: number | string // DB'deki gorev_id (unvana göre eşleştirilen)
  personelId: number | null
  personelAdi: string // UI'da görüntülemek için
  personelArama: string
  asilMi: number
}

export function KomisyonOlusturModal({
  isOpen,
  onClose,
  komisyonId,
  onPreviewSablon
}: KomisyonOlusturModalProps): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const [ad, setAd] = useState('')
  const [seciliTip, setSeciliTip] = useState<KomisyonTipi>('')
  const [uyeler, setUyeler] = useState<UyeRow[]>([])
  const [seciliSablonlar, setSeciliSablonlar] = useState<number[]>([])
  const [aramaAcik, setAramaAcik] = useState<number | null>(null) // hangi satırın araması açık
  const [sablonArama, setSablonArama] = useState('')

  // Modal açılınca default komisyonları DB'ye seed et (yoksa oluştur)
  useEffect(() => {
    if (!isOpen) return

    const seedKomisyonlar = async () => {
      try {
        const ipc = (window as any).electron.ipcRenderer

        for (const [, sablon] of Object.entries(KOMISYON_SABLONLARI)) {
          const s = sablon as {
            dbId: number
            label: string
            roller: readonly string[]
          }

          // Komisyon var mı kontrol et (ID veya Ad ile)
          const check = await ipc.invoke(
            'db:query',
            'SELECT id, ad FROM TANIM_Komisyon WHERE id = ? OR ad = ?',
            [s.dbId, s.label]
          )

          let targetKomisyonId = s.dbId
          if (check.success && check.data && check.data.length > 0) {
            targetKomisyonId = check.data[0].id
            // Eski isimle kalmışsa doğru standart isme güncelle
            if (check.data[0].ad !== s.label) {
              await ipc.invoke('db:run', 'UPDATE TANIM_Komisyon SET ad = ? WHERE id = ?', [
                s.label,
                targetKomisyonId
              ])
            }
          } else {
            // Yok — oluştur (INSERT OR IGNORE ile id'yi koru)
            await ipc.invoke(
              'db:run',
              'INSERT OR IGNORE INTO TANIM_Komisyon (id, ad) VALUES (?, ?)',
              [s.dbId, s.label]
            )
          }

          // Komisyonda üye kaydı var mı kontrol et
          const existingUyeCheck = await ipc.invoke(
            'db:query',
            'SELECT id FROM TANIM_KomisyonUye WHERE komisyon_id = ? LIMIT 1',
            [targetKomisyonId]
          )

          if (
            !existingUyeCheck.success ||
            !existingUyeCheck.data ||
            existingUyeCheck.data.length === 0
          ) {
            // Her rol için TANIM_KomisyonGorevi bul/oluştur ve TANIM_KomisyonUye ekle
            for (const rolAd of s.roller) {
              let gorevId: number | null = null
              const gorevCheck = await ipc.invoke(
                'db:query',
                'SELECT id FROM TANIM_KomisyonGorevi WHERE ad = ? LIMIT 1',
                [rolAd]
              )
              if (gorevCheck.success && gorevCheck.data && gorevCheck.data.length > 0) {
                gorevId = gorevCheck.data[0].id
              } else {
                const gorevIns = await ipc.invoke(
                  'db:run',
                  'INSERT INTO TANIM_KomisyonGorevi (ad, aktif_mi) VALUES (?, 1)',
                  [rolAd]
                )
                if (gorevIns.success) gorevId = gorevIns.lastInsertRowid
              }

              if (gorevId !== null) {
                await ipc.invoke(
                  'db:run',
                  'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi) VALUES (?, ?, NULL, 1)',
                  [targetKomisyonId, gorevId]
                )
              }
            }
          }
        }
      } catch (e) {
        console.warn('Komisyon seed hatası:', e)
      }
    }

    seedKomisyonlar()
  }, [isOpen])

  // DB'deki görevler (unvan eşleştirmesi için)
  const { data: gorevler = [] } = useQuery({
    queryKey: ['komisyon_gorevleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_KomisyonGorevi WHERE aktif_mi = 1 ORDER BY id ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data as { id: number; ad: string }[]
    },
    enabled: isOpen
  })

  // Personel listesi (arama için)
  const { data: tumPersonel = [] } = useQuery({
    queryKey: ['personel_listesi_modal'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, ad, soyad, unvan FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data as {
        id: number
        ad: string
        soyad: string
        unvan: string
      }[]
    },
    enabled: isOpen
  })

  // Şablon seçenekleri
  const { data: tumSablonlar = [] } = useQuery({
    queryKey: ['komisyon_sablon_secenekleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Sablon WHERE aktif_mi = 1 ORDER BY ad ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: isOpen
  })

  // Edit modunda mevcut komisyonu çek
  useQuery({
    queryKey: ['komisyon_detay', komisyonId],
    queryFn: async () => {
      if (!komisyonId) return null

      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon WHERE id = ?',
        [komisyonId]
      )
      if (!res.success || !res.data[0]) {
        throw new Error(res.error || 'Komisyon bulunamadı')
      }
      setAd(res.data[0].ad)

      const membersRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT ku.*, kg.ad as gorev_ad,
          COALESCE(p.ad || ' ' || p.soyad, '') as personel_adi,
          ku.personel_id
         FROM TANIM_KomisyonUye ku
         LEFT JOIN TANIM_KomisyonGorevi kg ON kg.id = ku.gorev_id
         LEFT JOIN TANIM_Personel p ON p.id = ku.personel_id
         WHERE ku.komisyon_id = ?`,
        [komisyonId]
      )
      if (membersRes.success && membersRes.data) {
        setUyeler(
          membersRes.data.map((m: any) => ({
            id: Date.now() + Math.random(),
            unvan: m.gorev_ad || '',
            gorevId: m.gorev_id,
            personelId: m.personel_id || null,
            personelAdi: m.personel_adi || '',
            personelArama: '',
            asilMi: m.asil_mi
          }))
        )
      }

      const sablonRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
        [komisyonId]
      )
      if (sablonRes.success && sablonRes.data) {
        setSeciliSablonlar(sablonRes.data.map((s: any) => s.sablon_id))
      }

      return res.data[0]
    },
    enabled: !!komisyonId && isOpen
  })

  // Komisyon tipi seçilince hazır kadroyu yükle
  const handleTipSec = (tip: KomisyonTipi) => {
    setSeciliTip(tip)
    if (!tip) {
      setUyeler([])
      return
    }
    const sablon = KOMISYON_SABLONLARI[tip]
    setAd(sablon.label)
    setUyeler(
      sablon.roller.map((unvan, i) => {
        // DB'deki görevle eşleştirmeyi dene (tam eşleşme)
        const eslesen = gorevler.find((g) => g.ad.toLowerCase() === unvan.toLowerCase())
        return {
          id: Date.now() + i,
          unvan,
          gorevId: eslesen?.id ?? '',
          personelId: null,
          personelAdi: '',
          personelArama: '',
          asilMi: 1
        }
      })
    )
  }

  // El ile satır ekle
  const handleAddUye = () => {
    setUyeler([
      ...uyeler,
      {
        id: Date.now(),
        unvan: '',
        gorevId: '',
        personelId: null,
        personelAdi: '',
        personelArama: '',
        asilMi: 1
      }
    ])
  }

  const handleRemoveUye = (id: number) => {
    setUyeler(uyeler.filter((u) => u.id !== id))
  }

  const handleUyeChange = (id: number, field: string, value: any) => {
    setUyeler(uyeler.map((u) => (u.id === id ? { ...u, [field]: value } : u)))
  }

  // Personel seçilince satıra ata
  const handlePersonelSec = (
    uyeId: number,
    personel: { id: number; ad: string; soyad: string; unvan: string }
  ) => {
    setUyeler(
      uyeler.map((u) =>
        u.id === uyeId
          ? {
              ...u,
              personelId: personel.id,
              personelAdi: `${personel.ad} ${personel.soyad}`,
              personelArama: ''
            }
          : u
      )
    )
    setAramaAcik(null)
  }

  // Unvan değişince DB göreviyle eşleştir
  const handleUnvanChange = (id: number, unvan: string) => {
    const eslesen = gorevler.find((g) => g.ad.toLowerCase() === unvan.toLowerCase())
    setUyeler(uyeler.map((u) => (u.id === id ? { ...u, unvan, gorevId: eslesen?.id ?? '' } : u)))
  }

  const handleSablonToggle = (sablonId: number) => {
    setSeciliSablonlar((prev) =>
      prev.includes(sablonId) ? prev.filter((id) => id !== sablonId) : [...prev, sablonId]
    )
  }

  const handleClose = () => {
    onClose()
    setAd('')
    setSeciliTip('')
    setUyeler([])
    setSeciliSablonlar([])
    setAramaAcik(null)
    setSablonArama('')
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!ad) throw new Error('Lütfen komisyon adı giriniz.')

      // gorevId eksik satırlar için DB'de yoksa gorev kaydı oluşturabiliriz veya hata ver
      const eksikGorevler = uyeler.filter((u) => !u.gorevId && u.unvan)
      if (eksikGorevler.length > 0) {
        // Eksik görevler için DB'ye ekle
        for (const u of eksikGorevler) {
          const gRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            'INSERT INTO TANIM_KomisyonGorevi (ad, aktif_mi) VALUES (?, 1)',
            [u.unvan]
          )
          if (gRes.success) {
            u.gorevId = gRes.lastInsertRowid
          } else {
            // Eğer UNIQUE constraint gibi bir nedenle eklenemediyse var olanı bul
            const exRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              'SELECT id FROM TANIM_KomisyonGorevi WHERE ad = ?',
              [u.unvan]
            )
            if (exRes.success && exRes.data && exRes.data[0]) {
              u.gorevId = exRes.data[0].id
            } else {
              throw new Error('Görev eklenemedi: ' + gRes.error)
            }
          }
        }
      }

      if (komisyonId) {
        const updateRes = await window.electron.ipcRenderer.invoke('db:transaction', [
          {
            sql: 'UPDATE TANIM_Komisyon SET ad = ? WHERE id = ?',
            params: [ad, komisyonId]
          },
          {
            sql: 'DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
            params: [komisyonId]
          },
          {
            sql: 'DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
            params: [komisyonId]
          }
        ])
        if (!updateRes.success) {
          if (
            updateRes.error.includes('UNIQUE constraint failed') ||
            updateRes.error.includes('UNIQUE constraint')
          ) {
            throw new Error(
              `"${ad}" isminde bir komisyon zaten var. Listede göremiyorsanız, daha önce silinmiş bir komisyon bu ismi kullanıyor olabilir.`
            )
          }
          throw new Error(updateRes.error)
        }

        const uyeQueries = uyeler.map((u) => ({
          sql: 'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi) VALUES (?, ?, ?, ?)',
          params: [komisyonId, u.gorevId || null, u.personelId || null, u.asilMi]
        }))
        if (uyeQueries.length > 0) {
          const uyeRes = await window.electron.ipcRenderer.invoke('db:transaction', uyeQueries)
          if (!uyeRes.success) throw new Error(uyeRes.error)
        }

        const sablonQueries = seciliSablonlar.map((sId) => ({
          sql: 'INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id) VALUES (?, ?)',
          params: [komisyonId, sId]
        }))
        if (sablonQueries.length > 0) {
          const sR = await window.electron.ipcRenderer.invoke('db:transaction', sablonQueries)
          if (!sR.success) throw new Error(sR.error)
        }

        return komisyonId
      } else {
        const res = await window.electron.ipcRenderer.invoke('db:transaction', [
          { sql: 'INSERT INTO TANIM_Komisyon (ad) VALUES (?)', params: [ad] }
        ])
        if (!res.success) {
          if (
            res.error.includes('UNIQUE constraint failed') ||
            res.error.includes('UNIQUE constraint')
          ) {
            throw new Error(
              `"${ad}" isminde bir komisyon zaten var. Listede göremiyorsanız, daha önce silinmiş bir komisyon bu ismi kullanıyor olabilir.`
            )
          }
          throw new Error(res.error)
        }
        const newId = res.lastInsertRowid

        const uyeQueries = uyeler.map((u) => ({
          sql: 'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi) VALUES (?, ?, ?, ?)',
          params: [newId, u.gorevId || null, u.personelId || null, u.asilMi]
        }))
        if (uyeQueries.length > 0) {
          const uyeRes = await window.electron.ipcRenderer.invoke('db:transaction', uyeQueries)
          if (!uyeRes.success) throw new Error(uyeRes.error)
        }

        const sablonQueries = seciliSablonlar.map((sId) => ({
          sql: 'INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id) VALUES (?, ?)',
          params: [newId, sId]
        }))
        if (sablonQueries.length > 0) {
          const sR = await window.electron.ipcRenderer.invoke('db:transaction', sablonQueries)
          if (!sR.success) throw new Error(sR.error)
        }

        return newId
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      handleClose()
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={komisyonId ? 'Komisyonu Düzenle' : 'Yeni Komisyon Oluştur'}
      description="Komisyonun kadro ve kontenjanlarını belirleyin."
      className="max-w-5xl"
    >
      <div className="space-y-6" onClick={() => setAramaAcik(null)}>
        {saveMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {saveMutation.error?.message}
          </div>
        )}

        {/* Komisyon Tipi Seçimi (sadece yeni komisyon oluştururken) */}
        {!komisyonId && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Komisyon Tipi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                Object.entries(KOMISYON_SABLONLARI) as [
                  KomisyonTipi,
                  (typeof KOMISYON_SABLONLARI)[keyof typeof KOMISYON_SABLONLARI]
                ][]
              ).map(([tip, sablon]) => (
                <button
                  key={tip}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTipSec(tip)
                  }}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    seciliTip === tip
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <Users
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      seciliTip === tip ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div
                      className={`text-sm font-bold ${
                        seciliTip === tip
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sablon.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {sablon.roller.length} pozisyon
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Komisyon Adı */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Komisyon Adı
          </label>
          <Input
            type="text"
            placeholder="Örn: Bilişim Sistemleri Fiyat Araştırma Komisyonu"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Komisyon Rolleri Tablosu */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Komisyon Kadrosu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personel ataması isteğe bağlı — şimdi veya sonra yapılabilir.
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleAddUye()
              }}
              variant="outline"
              className="gap-2 text-sm border-dashed"
            >
              <Plus className="w-4 h-4" /> Satır Ekle
            </Button>
          </div>

          {uyeler.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 border-dashed">
              <Users className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Yukarıdan bir komisyon tipi seçin ya da "Satır Ekle" ile manuel kadro oluşturun.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-center w-10">#</th>
                    <th className="px-4 py-3 text-left">Komisyondaki Görevi</th>
                    <th className="px-4 py-3 text-left">Personel</th>
                    <th className="px-4 py-3 text-center w-24">Durum</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {uyeler.map((uye, index) => {
                    // Personel aramasına göre filtreleme
                    const filtreliPersonel =
                      uye.personelArama.trim().length > 0
                        ? tumPersonel
                            .filter((p) =>
                              `${p.ad} ${p.soyad} ${p.unvan || ''}`
                                .toLocaleLowerCase('tr-TR')
                                .includes(uye.personelArama.toLocaleLowerCase('tr-TR'))
                            )
                            .slice(0, 8)
                        : tumPersonel.slice(0, 8)

                    return (
                      <tr key={uye.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        {/* Sıra */}
                        <td className="px-4 py-2.5 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                            {index + 1}
                          </span>
                        </td>

                        {/* Görev Unvanı */}
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            list={`gorevler-${uye.id}`}
                            placeholder="Görev yazın veya seçin..."
                            value={uye.unvan}
                            onChange={(e) => handleUnvanChange(uye.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent border-0 border-b border-dashed border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm py-0.5 focus:outline-none focus:border-blue-400"
                          />
                          <datalist id={`gorevler-${uye.id}`}>
                            {gorevler.map((g) => (
                              <option key={g.id} value={g.ad}>
                                {g.ad}
                              </option>
                            ))}
                          </datalist>
                        </td>
                        {/* Personel Seçimi */}
                        <td className="px-4 py-2.5">
                          <select
                            value={uye.personelId || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              if (!val) {
                                // Clear selection
                                setUyeler(
                                  uyeler.map((u) =>
                                    u.id === uye.id
                                      ? {
                                          ...u,
                                          personelId: null,
                                          personelAdi: '',
                                          personelArama: ''
                                        }
                                      : u
                                  )
                                )
                                return
                              }
                              const pId = parseInt(val)
                              const p = tumPersonel.find((x) => x.id === pId)
                              if (p) handlePersonelSec(uye.id, p)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent border-0 border-b border-dashed border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm py-0.5 focus:outline-none focus:border-blue-400"
                          >
                            <option value="">-- Personel Seçin --</option>
                            {tumPersonel.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.ad} {p.soyad} - {p.unvan}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Asil/Yedek */}
                        <td className="px-4 py-2.5 text-center">
                          <select
                            value={uye.asilMi}
                            onChange={(e) =>
                              handleUyeChange(uye.id, 'asilMi', Number(e.target.value))
                            }
                            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                          >
                            <option value={1}>Asil</option>
                            <option value={0}>Yedek</option>
                          </select>
                        </td>

                        {/* Sil */}
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => handleRemoveUye(uye.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Şablonlar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Belge Şablonları
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Bu komisyonun üretebileceği belgeleri seçin.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Şablon ara..."
                value={sablonArama}
                onChange={(e) => setSablonArama(e.target.value)}
                className="pl-9 h-9 text-sm w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {tumSablonlar
              .filter(
                (sablon: any) =>
                  sablon.ad.toLowerCase().includes(sablonArama.toLowerCase()) ||
                  (sablon.aciklama &&
                    sablon.aciklama.toLowerCase().includes(sablonArama.toLowerCase()))
              )
              .map((sablon: any) => (
                <label
                  key={sablon.id}
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    seciliSablonlar.includes(sablon.id)
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-500/50'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      checked={seciliSablonlar.includes(sablon.id)}
                      onChange={() => handleSablonToggle(sablon.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {sablon.ad}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1">
                      {sablon.aciklama || 'Şablon'}
                    </div>
                  </div>
                  {onPreviewSablon && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onPreviewSablon(sablon)
                      }}
                      className="p-1.5 shrink-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Önizle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </label>
              ))}
            {tumSablonlar.length > 0 &&
              tumSablonlar.filter(
                (sablon: any) =>
                  sablon.ad.toLowerCase().includes(sablonArama.toLowerCase()) ||
                  (sablon.aciklama &&
                    sablon.aciklama.toLowerCase().includes(sablonArama.toLowerCase()))
              ).length === 0 && (
                <div className="col-span-full text-sm text-slate-500 text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 border-dashed">
                  Aramanıza uygun şablon bulunamadı.
                </div>
              )}
            {tumSablonlar.length === 0 && (
              <div className="col-span-full text-sm text-slate-500 text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                Sistemde tanımlı şablon bulunamadı.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={saveMutation.isPending}>
            İptal
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Kaydediliyor...' : komisyonId ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
