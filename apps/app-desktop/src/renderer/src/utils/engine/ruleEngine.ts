/**
 * TEMİN 360 - KURAL VE AKSİYON MOTORU (RULE & ACTION ENGINE)
 *
 * Koşul (Condition Formula) -> Sonuç (Effect / Action) mimarisi.
 *
 * Sonuç Türleri:
 * 1. UYARI: Kullanıcıya bilgilendirme/ikaz mesajı gösterir (Süreç durmaz).
 * 2. ENGELLE: İlerlemeyi veya evrak üretimini durdurur (Hata durumu).
 * 3. ONAY_GEREKTIR: İlgili işlem için ihale/harcama yetkilisi onayı ister.
 * 4. DEGER_ATA: Hedef alana/değişkene hesaplanan değeri otomatik yazar.
 * 5. AKSIYON_TETIKLE: Süre başlatır, evrak üretir veya hareket defterine kayıt düşer.
 */

import { calistirFormul, FormulaContext, ValueType } from './formulaParser'

export type KuralSonucTipi = 'UYARI' | 'ENGELLE' | 'ONAY_GEREKTIR' | 'DEGER_ATA' | 'AKSIYON_TETIKLE'

export type AksiyonTuru =
  | 'EVRAK_URET'
  | 'ALAN_ATA'
  | 'GOREV_OLUSTUR'
  | 'BILDIRIM_GONDER'
  | 'SURE_BASLAT'
  | 'KAYIT_EKLE'

export interface KuralAksiyonu {
  tur: AksiyonTuru
  parametreler: Record<string, any>
}

export interface KuralTanimi {
  id: string
  ad: string
  aciklama?: string
  kosulFormulu: string // Örn: 'yaklasik_maliyet > esik("dogrudanTemin22d")'
  sonucTipi: KuralSonucTipi
  mesaj?: string // Örn: 'Tutar doğrudan temin limitini aşıyor!'
  hedefAlan?: string // DEGER_ATA durumunda hedef alan adı
  degerFormulu?: string // DEGER_ATA durumunda hesaplanacak formül
  aksiyon?: KuralAksiyonu
  aktifMi?: boolean
  oncelik?: number
}

export interface TetiklenenKuralSonucu {
  kural: KuralTanimi
  sonucTipi: KuralSonucTipi
  mesaj: string
  atananDeger?: { alan: string; deger: ValueType }
  tetiklenenAksiyon?: KuralAksiyonu
}

export interface KuralDegerlendirmeRaporu {
  toplamKural: number
  tetiklenenSayisi: number
  engellendiMi: boolean
  onayGerekliMi: boolean
  uyarilar: string[]
  engellemeler: string[]
  onayMesajlari: string[]
  atananDegerler: Record<string, ValueType>
  tetiklenenKurallar: TetiklenenKuralSonucu[]
}

/**
 * Verilen kuralları mevcut dosya/süreç context'i üzerinde çalıştırır ve rapor üretir.
 */
export function calistirKurallar(
  kurallar: KuralTanimi[],
  context: FormulaContext = {}
): KuralDegerlendirmeRaporu {
  const aktifKurallar = kurallar
    .filter((k) => k.aktifMi !== false)
    .sort((a, b) => (b.oncelik || 0) - (a.oncelik || 0))

  const uyarilar: string[] = []
  const engellemeler: string[] = []
  const onayMesajlari: string[] = []
  const atananDegerler: Record<string, ValueType> = {}
  const tetiklenenKurallar: TetiklenenKuralSonucu[] = []

  let engellendiMi = false
  let onayGerekliMi = false

  for (const kural of aktifKurallar) {
    const evalRes = calistirFormul(kural.kosulFormulu, {
      ...context,
      degiskenler: { ...context.degiskenler, ...atananDegerler }
    })

    // Koşul DOĞRU mu değerlendirildi?
    if (evalRes.success && Boolean(evalRes.result)) {
      const mesaj = kural.mesaj || kural.ad

      let atananDegerBilgisi: { alan: string; deger: ValueType } | undefined

      if (kural.sonucTipi === 'ENGELLE') {
        engellendiMi = true
        engellemeler.push(mesaj)
      } else if (kural.sonucTipi === 'UYARI') {
        uyarilar.push(mesaj)
      } else if (kural.sonucTipi === 'ONAY_GEREKTIR') {
        onayGerekliMi = true
        onayMesajlari.push(mesaj)
      } else if (kural.sonucTipi === 'DEGER_ATA' && kural.hedefAlan && kural.degerFormulu) {
        const valRes = calistirFormul(kural.degerFormulu, {
          ...context,
          degiskenler: { ...context.degiskenler, ...atananDegerler }
        })
        if (valRes.success) {
          atananDegerler[kural.hedefAlan] = valRes.result
          atananDegerBilgisi = { alan: kural.hedefAlan, deger: valRes.result }
        }
      }

      tetiklenenKurallar.push({
        kural,
        sonucTipi: kural.sonucTipi,
        mesaj,
        atananDeger: atananDegerBilgisi,
        tetiklenenAksiyon: kural.aksiyon
      })
    }
  }

  return {
    toplamKural: aktifKurallar.length,
    tetiklenenSayisi: tetiklenenKurallar.length,
    engellendiMi,
    onayGerekliMi,
    uyarilar,
    engellemeler,
    onayMesajlari,
    atananDegerler,
    tetiklenenKurallar
  }
}
