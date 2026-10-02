/**
 * TEMİN 360 - GÜVENLİK, DENETİM İZİ, KİLİTLEME/MÜHÜRLEME VE KVKK YARDIMCILARI
 *
 * 1. Denetim İzi (Audit Log): Değiştirilemez kim, ne zaman, eski değer -> yeni değer günlüğü
 * 2. Dosya Kilitleme ve Dijital Mühürleme: SHA-256 hash ile kurcalanmaya karşı koruma
 * 3. KVKK Kişisel Veri Maskeleme: TCKN, IBAN, Telefon, İsim maskeleme
 * 4. Yerel Şifreleme (Web Crypto AES-GCM): Hassas verileri anahtarla şifreleme/çözme
 * 5. Otomatik Yedekleme ve Sürüm Bütünlüğü Doğrulayıcı
 * 6. Oturum, Cihaz Tanımlama ve Çevrimdışı Eşitleme Durum Yöneticisi
 */

export type IslemTuru =
  | 'EKLEME'
  | 'GUNCELLEME'
  | 'SILME'
  | 'ONAYLAMA'
  | 'MUHURLEME'
  | 'KILIT_ACMA'
  | 'YEDEKLEME'
  | 'GERI_YUKLEME'

export interface DenetimIziKaydi {
  id: string
  zamanDamgasi: string // ISO string
  kullaniciId: string
  kullaniciAdi: string
  kullaniciRolu?: string
  cihazId?: string
  ipAdresi?: string
  dosyaId?: string | number
  dosyaNo?: string
  tabloAdi: string
  kayitId: string
  alanAdi: string
  eskiDeger: any
  yeniDeger: any
  islemTuru: IslemTuru
  gerekce?: string
}

/**
 * 1. DENETİM İZİ ÜRETİCİ (Append-Only Log)
 */
export function olusturDenetimKaydi(
  params: Omit<DenetimIziKaydi, 'id' | 'zamanDamgasi'>
): DenetimIziKaydi {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    zamanDamgasi: new Date().toISOString(),
    ...params
  }
}

/**
 * 2. DİJİTAL MÜHÜRLEME VE SHA-256 HASH İLE BÜTÜNLÜK DOĞRULAYICI
 */
export interface MuhurBilgisi {
  kilitliMi: boolean
  muhurTarihi?: string
  muhurleyenKullanici?: string
  revizyonNo: number
  sha256Hash?: string
  duzeltmeGerekcesi?: string
}

/**
 * Verilen metin veya nesnenin SHA-256 özetini (hash) hesaplar.
 */
export async function hesaplaSha256(veri: string | object): Promise<string> {
  const metin = typeof veri === 'string' ? veri : JSON.stringify(veri)
  const encoder = new TextEncoder()
  const data = encoder.encode(metin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Onaylanan dosya veya evrakı mühürleyip kilitler.
 */
export async function muhurleDosyaVerisi(
  dosyaIcerigi: object,
  kullaniciAdi: string,
  revizyonNo: number = 1
): Promise<MuhurBilgisi> {
  const hash = await hesaplaSha256(dosyaIcerigi)
  return {
    kilitliMi: true,
    muhurTarihi: new Date().toISOString(),
    muhurleyenKullanici: kullaniciAdi,
    revizyonNo,
    sha256Hash: hash
  }
}

/**
 * Mühürlü dosyanın kurcalanıp kurcalanmadığını doğrular.
 */
export async function dogrulaMuhurButunlugu(
  dosyaIcerigi: object,
  mevcutMuhur: MuhurBilgisi
): Promise<{
  gecerliMi: boolean
  mesaj: string
}> {
  if (!mevcutMuhur.kilitliMi || !mevcutMuhur.sha256Hash) {
    return { gecerliMi: false, mesaj: 'Dosya mühürlü değil veya mühür bilgisi eksik.' }
  }

  const yeniHash = await hesaplaSha256(dosyaIcerigi)
  if (yeniHash === mevcutMuhur.sha256Hash) {
    return {
      gecerliMi: true,
      mesaj: 'Dosya bütünlüğü doğrulandı; veride hiçbir değişiklik yapılmamış.'
    }
  }

  return {
    gecerliMi: false,
    mesaj: 'UYARI: Dosya içeriği mühürlendikten sonra değiştirilmiş! Bütünlük bozuldu.'
  }
}

/**
 * 3. KVKK KİŞİSEL VERİ MASKELEME YARDIMCILARI
 */
export function maskTCKN(tc: string | null | undefined): string {
  if (!tc) return ''
  const clean = tc.toString().trim()
  if (clean.length !== 11) return '***'
  return `${clean.slice(0, 3)}*****${clean.slice(8)}`
}

export function maskIBAN(iban: string | null | undefined): string {
  if (!iban) return ''
  const clean = iban.replace(/\s+/g, '')
  if (clean.length < 10) return 'TR** ****'
  return `${clean.slice(0, 4)} **** **** **** **** ${clean.slice(-4)}`
}

export function maskTelefon(tel: string | null | undefined): string {
  if (!tel) return ''
  const clean = tel.replace(/\D/g, '')
  if (clean.length < 10) return '05** *** ** **'
  return `${clean.slice(0, 4)} *** ** ${clean.slice(-2)}`
}

export function maskAdSoyad(adSoyad: string | null | undefined): string {
  if (!adSoyad) return ''
  return adSoyad
    .split(' ')
    .map((kelime) =>
      kelime.length > 2 ? `${kelime[0]}***${kelime[kelime.length - 1]}` : `${kelime[0]}*`
    )
    .join(' ')
}

/**
 * 4. YEREL ŞİFRELEME (Web Crypto AES-GCM 256-Bit)
 */
export async function sifreleHassasMetin(metin: string, parolaAnahtari: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(metin)

  // Anahtar türet (PBKDF2)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(parolaAnahtari),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)

  // Base64 olarak döndür
  return btoa(String.fromCharCode(...combined))
}

export async function cozHassasMetin(
  sifreliBase64: string,
  parolaAnahtari: string
): Promise<string> {
  const binary = atob(sifreliBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  const salt = bytes.slice(0, 16)
  const iv = bytes.slice(16, 28)
  const data = bytes.slice(28)

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(parolaAnahtari),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return new TextDecoder().decode(decrypted)
}

/**
 * 5. YEDEKLEME METADATA VE ADLANDIRICI
 */
export function uretYedekDosyaAdi(kurumKodu: string = 'TEMIN360'): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  return `${kurumKodu}_YEDEK_${yyyy}${mm}${dd}_${hh}${min}${ss}.temin`
}
