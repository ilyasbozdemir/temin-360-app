import { useState, useEffect, useCallback } from 'react'
import { Sablon } from '../sablonlar/sablonlar.hooks'
import { subPagesMapping } from '../../constants/surecler'
import {
  getDefaultMappingForProcess,
  ProcessMapping,
  processMappingRegistry
} from '../../constants/mappings'
import { buildDocumentContext, formatDateString } from './CiktiMerkezi.contextBuilder'
import { filterContextForTemplate } from './CiktiMerkezi.mediator'
import { defaultTemplatesByPath } from '../sablonlar/components/defaultTemplates'
import { useAppEventListener } from '../../utils/appEvents'
export interface UseCiktiMerkeziDataResult {
  sablons: Sablon[]
  loading: boolean
  masterHtml: string
  dosyaContext: any
  activeDosya: any
  placeholders: any[]
  contextsByPath: Record<string, Record<string, unknown>>
  personelListesi: any[]
  settings: any
  refresh: (isBackgroundRefresh?: boolean) => Promise<void>
}

export function useCiktiMerkeziData(activeDosyaId: number | null): UseCiktiMerkeziDataResult {
  const [sablons, setSablons] = useState<Sablon[]>([])
  const [loading, setLoading] = useState(true)
  const [masterHtml, setMasterHtml] = useState('')
  const [dosyaContext, setDosyaContext] = useState<any>({})
  const [contextsByPath, setContextsByPath] = useState<Record<string, Record<string, unknown>>>({})
  const [activeDosya, setActiveDosya] = useState<any>(null)
  const [placeholders, setPlaceholders] = useState<any[]>([])
  const [personelListesi, setPersonelListesi] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)

  const loadData = useCallback(
    async (isBackgroundRefresh = false): Promise<void> => {
      if (!activeDosyaId) return
      if (!isBackgroundRefresh) setLoading(true)
      try {
        // 1. Single-shot ultra fast server-side resolution via Node.js
        if (window.electron?.ipcRenderer) {
          try {
            const fastRes = await window.electron.ipcRenderer.invoke('belge:get-all-cikti-data', {
              dosyaId: activeDosyaId
            })
            if (fastRes && fastRes.success && fastRes.data) {
              const d = fastRes.data
              if (d.sablons) setSablons(d.sablons)
              if (d.masterHtml) setMasterHtml(d.masterHtml)
              if (d.dosyaContext) setDosyaContext(d.dosyaContext)
              if (d.placeholders) setPlaceholders(d.placeholders)
              if (d.personelListesi) setPersonelListesi(d.personelListesi)
              if (d.settings) setSettings(d.settings)
              if (d.activeDosya) setActiveDosya(d.activeDosya)
              if (d.contextsByPath) setContextsByPath(d.contextsByPath)
              setLoading(false)
              return
            }
          } catch {
            // Fallback to manual resolution if IPC fails
          }
        }

        // Master HTML'i al
        const mHtml = await window.electron.ipcRenderer.invoke(
          'template:read-system',
          'master.html'
        )
        if (typeof mHtml === 'string') setMasterHtml(mHtml)

        // Şablonları al (sadece en güncel versiyonlar)
        const sablonsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Sablon WHERE id IN (SELECT MAX(id) FROM TANIM_Sablon WHERE aktif_mi = 1 GROUP BY COALESCE(parent_id, id)) ORDER BY kategori ASC, ad ASC'
        )
        if (sablonsRes.success) setSablons(sablonsRes.data)

        // Dinamik Değişken Tanımlarını Çek (TANIM_Placeholder)
        const placeholdersRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Placeholder'
        )
        if (placeholdersRes.success) {
          setPlaceholders(placeholdersRes.data)
        }

        // Tüm aktif personelleri çek (önizleme dropdown'ları için)
        const personelRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT id, ad_soyad, unvan, telefon, eposta FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC'
        )
        if (personelRes.success) {
          setPersonelListesi(personelRes.data)
        }

        // Aktif dosya verisini al (Temel dosya bilgisi, onaylayan personel ve kalemler)
        const dosyaRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT d.*, 
                  b.antet_ek_satir as birim_antet_ek_satir,
                  b.birim_adi as birim_tablo_adi,
                  b.harcama_kodu as harcama_birim_kodu,
                  b.muhasebe_kodu,
                  p.ad_soyad as onaylayan_ad_soyad, p.unvan as onaylayan_unvan, p.telefon as onaylayan_telefon,
                  h.ad_soyad as hazirlayan_ad_soyad, h.unvan as hazirlayan_unvan,
                  h.telefon as hazirlayan_telefon, h.eposta as hazirlayan_eposta,
                  te.ad_soyad as talep_eden_ad_soyad, te.unvan as talep_eden_unvan, te.telefon as talep_eden_telefon,
                  su.ad_soyad as sunan_ad_soyad, su.unvan as sunan_unvan, su.telefon as sunan_telefon,
                  iy.ad_soyad as irtibat_ad_soyad, iy.unvan as irtibat_unvan, iy.telefon as irtibat_telefon,
                  f.unvan as yuklenici_firma_adi,
                  f.adres as yuklenici_firma_adresi,
                  f.ilce as yuklenici_firma_ilcesi,
                  f.il as yuklenici_firma_ili,
                  f.telefon as yuklenici_firma_telefon,
                  f.faks as yuklenici_firma_faks,
                  f.email as yuklenici_firma_email,
                  f.vergi_dairesi as yuklenici_firma_vergi_dairesi,
                  f.vergi_no as yuklenici_firma_vergi_no
           FROM DATA_TeminDosyasi d 
           LEFT JOIN TANIM_Birim b ON d.birim_id = b.id
           LEFT JOIN TANIM_Personel p ON d.onay_personel_id = p.id 
           LEFT JOIN TANIM_Personel h ON d.hazirlayan_personel_id = h.id
           LEFT JOIN TANIM_Personel te ON d.talep_eden_personel_id = te.id
           LEFT JOIN TANIM_Personel su ON d.sunan_personel_id = su.id
           LEFT JOIN TANIM_Personel iy ON d.irtibat_yetkilisi_id = iy.id
           LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
           WHERE d.id = ?`,
          [activeDosyaId]
        )
        const kalemlerRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
          [activeDosyaId]
        )

        // Firmaları çek (DATA_TeminFirma ve TANIM_Firma birleşimi)
        const firmsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT df.id as temin_firma_id, f.unvan, f.id as firma_id 
           FROM DATA_TeminFirma df 
           JOIN TANIM_Firma f ON df.firma_id = f.id 
           WHERE df.temin_dosya_id = ?`,
          [activeDosyaId]
        )
        let firms = firmsRes.success ? firmsRes.data : []
        const seenFirmaIds = new Set<number>()
        firms = firms.filter((f: any) => {
          if (seenFirmaIds.has(f.firma_id)) return false
          seenFirmaIds.add(f.firma_id)
          return true
        })

        // Teklifleri çek
        const bidsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )
        const bids = bidsRes.success ? bidsRes.data : []
        const bidsMap: Record<string, number> = {}
        bids.forEach((b: any) => {
          bidsMap[`${b.temin_kalem_id}_${b.temin_firma_id}`] = b.birim_fiyat || 0
        })

        // Komisyon üyelerini çek
        const komsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT tk.*, 
                  COALESCE(NULLIF(tk.ad_soyad, ''), NULLIF(p.ad_soyad, ''), '') as ad_soyad, 
                  COALESCE(NULLIF(tk.unvan, ''), NULLIF(p.unvan, ''), '') as unvan,
                  COALESCE(NULLIF(tk.gorev, ''), 'Üye') as gorevi
           FROM DATA_TeminKomisyon tk 
           LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id 
           WHERE tk.temin_dosya_id = ?`,
          [activeDosyaId]
        )
        let allCommission = komsRes.success ? komsRes.data : []

        if (!allCommission || allCommission.length === 0) {
          const fallbackRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT u.*, 
                    p.ad_soyad as ad_soyad, 
                    p.unvan as unvan, 
                    COALESCE(g.ad, 'Üye') as gorevi
             FROM TANIM_KomisyonUye u
             JOIN TANIM_Komisyon k ON u.komisyon_id = k.id
             LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
             LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
             WHERE (k.aktif_mi = 1 OR k.aktif_mi IS NULL)`
          )
          if (fallbackRes.success && fallbackRes.data) {
            allCommission = fallbackRes.data
          }
        }

        let commission = allCommission.filter(
          (c: any) =>
            c.komisyon_turu?.toLowerCase().includes('fiyat') ||
            c.komisyon_turu?.toLowerCase().includes('piyasa') ||
            c.komisyon_turu?.toLowerCase().includes('araştırma')
        )
        if (commission.length === 0) {
          commission = allCommission
        }

        let muayeneKomisyonu = allCommission.filter(
          (c: any) =>
            c.komisyon_turu?.toLowerCase().includes('muayene') ||
            c.komisyon_turu?.toLowerCase().includes('kabul')
        )
        if (muayeneKomisyonu.length === 0) {
          muayeneKomisyonu = allCommission
        }

        const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
        setSettings(settings)
        // TANIM_Kurum'dan kurum bilgilerini al (yeni tablo)
        const kurumRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Kurum WHERE id = 1'
        )
        const kurum = kurumRes.success && kurumRes.data?.length > 0 ? kurumRes.data[0] : null

        const belgelerRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT belge_adi, belge_tarihi FROM DATA_TeminBelge WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )

        // Dynamic mapping resolver (Isolated per path)
        const resolvedMappingsByPath: Record<string, Record<string, any>> = {}
        const allPathsToResolve = new Set<string>()
        subPagesMapping.forEach((p) => allPathsToResolve.add(p.path))
        if (sablonsRes.success && sablonsRes.data) {
          sablonsRes.data.forEach((s: any) => {
            if (s.route_path) allPathsToResolve.add(s.route_path)
            if (s.dosya_adi) allPathsToResolve.add(s.dosya_adi)
          })
        }
        Object.keys(processMappingRegistry).forEach((p) => allPathsToResolve.add(p))

        for (const path of allPathsToResolve) {
          let lookupPath = path
          if (path.endsWith('.html')) {
            const associatedRoute = Object.keys(defaultTemplatesByPath).find((route) => {
              const boundId = settings?.[`MAPPING_${route}_SABLON_ID`]
              if (boundId && sablonsRes.success && sablonsRes.data) {
                const sablon = sablonsRes.data.find(
                  (s: any) => s.id.toString() === boundId.toString()
                )
                if (sablon && sablon.dosya_adi === path) return true
              }
              return defaultTemplatesByPath[route] === path
            })
            if (associatedRoute) {
              lookupPath = associatedRoute
            }
          }

          const defaultMap = getDefaultMappingForProcess(lookupPath)
          const overridesKey = `MAPPING_${lookupPath}_PLACEHOLDERS`
          let overriddenMap: ProcessMapping = {}
          if (settings && settings[overridesKey]) {
            try {
              overriddenMap = JSON.parse(settings[overridesKey])
            } catch {
              // Hata durumunda varsayılan boş eşleme kalır
            }
          }
          const activeMap = { ...defaultMap, ...overriddenMap }

          const processMappings: Record<string, any> = {}

          for (const [sablonKey, colMap] of Object.entries(activeMap)) {
            if (colMap) {
              let val: any = null

              if (colMap.deger !== undefined) {
                val = colMap.deger
              } else if (colMap.formul) {
                val = colMap.formul.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
                  const parts = path.trim().split('.')
                  if (parts.length === 2) {
                    const [tbl, col] = parts
                    if (tbl === 'TANIM_Kurum' && kurum) {
                      return kurum[col] !== undefined && kurum[col] !== null
                        ? String(kurum[col])
                        : ''
                    }
                    if (tbl === 'DATA_TeminDosyasi' && dosyaRes.data?.[0]) {
                      if (col === 'temin_no_clean') {
                        const rawNo = dosyaRes.data[0].temin_no || ''
                        return rawNo.includes('/')
                          ? rawNo.split('/').pop()
                          : rawNo.includes('-')
                            ? rawNo.split('-').pop()
                            : rawNo
                      }
                      return dosyaRes.data[0][col] !== undefined && dosyaRes.data[0][col] !== null
                        ? String(dosyaRes.data[0][col])
                        : ''
                    }
                  }
                  return match
                })
              } else if (colMap.tablo && colMap.sutun) {
                if (colMap.iliskili_id) {
                  // Dynamic query filtered by activeDosyaId
                  try {
                    const queryStr =
                      colMap.sutun === '*'
                        ? `SELECT * FROM ${colMap.tablo} WHERE ${colMap.iliskili_id} = ?`
                        : `SELECT ${colMap.sutun} FROM ${colMap.tablo} WHERE ${colMap.iliskili_id} = ? LIMIT 1`

                    const dynamicRes = await window.electron.ipcRenderer.invoke(
                      'db:query',
                      queryStr,
                      [activeDosyaId]
                    )
                    if (dynamicRes.success && dynamicRes.data) {
                      if (colMap.sutun === '*') {
                        let rows = dynamicRes.data
                        if (colMap.altEslestirme && Array.isArray(rows)) {
                          rows = rows.map((row: any, idx: number) => {
                            const mapped: any = { siraNo: idx + 1 }
                            for (const [mustacheKey, dbCol] of Object.entries(
                              colMap.altEslestirme!
                            )) {
                              mapped[mustacheKey] = row[dbCol]
                            }
                            return mapped
                          })
                        }
                        val = rows
                      } else {
                        val = dynamicRes.data[0]?.[colMap.sutun]
                      }
                    }
                  } catch {
                    // Hata durumunda val null kalır
                  }
                } else if (colMap.tablo === 'TANIM_Kurum' && kurum) {
                  val = kurum[colMap.sutun as keyof typeof kurum]
                } else if (colMap.tablo === 'DATA_TeminDosyasi' && dosyaRes.data?.[0]) {
                  val = dosyaRes.data[0][colMap.sutun]
                }
              }

              if (val === null || val === undefined || val === '') {
                val =
                  colMap.varsayilan !== undefined
                    ? colMap.varsayilan
                    : `[Belirtilmedi: ${colMap.aciklama || sablonKey}]`
              }

              if (val !== null && val !== undefined) {
                if (
                  typeof val === 'string' &&
                  ((val.startsWith('[') && val.endsWith(']')) ||
                    (val.startsWith('{') && val.endsWith('}')))
                ) {
                  try {
                    val = JSON.parse(val)
                  } catch {
                    // JSON formatında değilse ham string olarak kalır
                  }
                }
                processMappings[sablonKey] = val
              }
            }
          }
          resolvedMappingsByPath[path] = processMappings
        }

        // Master JSON verisini oku
        const mJson = await window.electron.ipcRenderer.invoke(
          'template:read-system',
          'master.html.json'
        )
        let mJsonParsed = {}
        if (typeof mJson === 'string') {
          try {
            mJsonParsed = JSON.parse(mJson)
          } catch {
            // Hata durumunda master.html.json yok sayılır
          }
        }

        // 1. Genel / Base Context (boş resolvedMappings ile)
        let baseContext = buildDocumentContext(
          dosyaRes.data?.[0],
          kalemlerRes.data || [],
          firms,
          bidsMap,
          commission,
          muayeneKomisyonu,
          kurum,
          settings,
          {}
        )
        baseContext = { ...mJsonParsed, ...baseContext }
        setDosyaContext(baseContext)

        // 2. Her sürecin kendi izole bağlamı
        const pathContexts: Record<string, any> = {}
        for (const path of allPathsToResolve) {
          const pathMappings = resolvedMappingsByPath[path] || {}
          let contextForPath = buildDocumentContext(
            dosyaRes.data?.[0],
            kalemlerRes.data || [],
            firms,
            bidsMap,
            commission,
            muayeneKomisyonu,
            kurum,
            settings,
            pathMappings
          )
          contextForPath = { ...mJsonParsed, ...contextForPath }

          if (belgelerRes.success && belgelerRes.data) {
            const doc = (belgelerRes.data as any[]).find((b: any) => {
              const lowerName = b.belge_adi.toLowerCase()
              if (path.includes('yaklasik') && lowerName.includes('yaklaşık maliyet')) return true
              if (
                path.includes('piyasa-fiyat-arastirmasi') &&
                lowerName.includes('piyasa fiyat araştırma')
              )
                return true
              if (path.includes('tutanak') && lowerName.includes('piyasa fiyat araştırma'))
                return true
              return false
            })
            if (doc && doc.belge_tarihi) {
              const formattedDate = formatDateString(doc.belge_tarihi)
              if (formattedDate) {
                contextForPath.tarih = formattedDate
                contextForPath.dosyaTarihi = formattedDate
              }
            }
          }

          contextForPath = filterContextForTemplate(path, contextForPath)
          pathContexts[path] = contextForPath
        }

        setContextsByPath(pathContexts)
        setActiveDosya(dosyaRes.data?.[0] || null)
      } catch (err) {
        console.error('Veri yükleme hatası:', err)
      } finally {
        setLoading(false)
      }
    },
    [activeDosyaId]
  )

  // Listen to realtime socket/broadcast events across all screens
  useAppEventListener(
    [
      'items:changed',
      'bids:changed',
      'documents:changed',
      'dossier:updated',
      'status:changed',
      'print_queue:updated',
      'workspace:refreshed'
    ],
    () => {
      loadData(true)
    }
  )

  useEffect(() => {
    if (!activeDosyaId) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()

    const unlisten = window.electron.ipcRenderer.on('db:invalidated', () => {
      loadData(true)
    })

    return () => {
      if (unlisten) unlisten()
    }
  }, [activeDosyaId, loadData])

  return {
    sablons,
    loading,
    masterHtml,
    dosyaContext,
    activeDosya,
    placeholders,
    contextsByPath,
    personelListesi,
    settings,
    refresh: loadData
  }
}
