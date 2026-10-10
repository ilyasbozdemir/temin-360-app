import { ipcMain } from 'electron'
import os from 'os'
import { workspaceManager } from '../../database/workspace'

// Recovery code cache in memory (valid for 15 minutes)
let activeRecovery: { code: string; expiresAt: number; email: string } | null = null

export function savePasswordToHistory(
  db: any,
  user: string,
  pass: string,
  hostname: string
): void {
  if (!pass) return
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'passwordHistory'").get() as
      | { value?: string }
      | undefined
    let history: any[] = []
    if (row?.value) {
      try {
        history = JSON.parse(row.value)
      } catch {}
    }

    const alreadyExists = history.some(
      (h: any) => h.username === user && h.password === pass && h.hostname === hostname
    )
    if (!alreadyExists) {
      history.unshift({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        username: user,
        password: pass,
        hostname: hostname,
        osUsername: os.userInfo().username,
        createdAt: new Date().toISOString()
      })
      if (history.length > 100) {
        history = history.slice(0, 100)
      }
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('passwordHistory', ?)").run(
        JSON.stringify(history)
      )
    }
  } catch (e) {
    console.error('Save password history error:', e)
  }
}

export function checkPasswordHistory(db: any, user: string, pass: string): boolean {
  if (!pass) return false
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'passwordHistory'").get() as
      | { value?: string }
      | undefined
    if (row?.value) {
      const history = JSON.parse(row.value)
      if (Array.isArray(history)) {
        const matched = history.find(
          (h: any) =>
            (h.username === user || user === 'admin' || !h.username) && h.password === pass
        )
        if (matched) return true
      }
    }
  } catch (e) {
    console.error('Check password history error:', e)
  }
  return false
}

/**
 * <summary>
 * Veritabanı Kimlik Doğrulama ve Kullanıcı İşlemleri IPC İşleyicileri
 * </summary>
 * <description>
 * Oturum açma, ilk kurulum, şifre kontrolü ve e-posta ile kurtarma kodu gönderme/doğrulama işlemlerini yönetir.
 * </description>
 */
export function registerDbAuthHandlers(): void {
  /**
   * <summary>
   * Bilgisayar ve Cihaz Bilgilerini Getirici
   * </summary>
   */
  ipcMain.handle('system:get-pc-info', async () => {
    try {
      return {
        hostname: os.hostname(),
        platform: os.platform(),
        osUsername: os.userInfo().username
      }
    } catch {
      return {
        hostname: 'LOCAL-PC',
        platform: 'win32',
        osUsername: 'User'
      }
    }
  })

  /**
   * <summary>
   * Kimlik Doğrulama Kurulum Kontrolü
   * </summary>
   * <returns>Admin kullanıcı adı ve şifresi tanımlı mı bilgisi</returns>
   */
  ipcMain.handle('db:check-auth-setup', async () => {
    try {
      const db = workspaceManager.getDb()
      const userRow = db.prepare("SELECT value FROM settings WHERE key = 'adminUsername'").get() as
        | { value: string }
        | undefined
      const passRow = db.prepare("SELECT value FROM settings WHERE key = 'adminPassword'").get() as
        | { value: string }
        | undefined

      const hasUser = !!userRow?.value
      const hasPass = !!passRow?.value

      return { hasCredentials: hasUser && hasPass }
    } catch (error: any) {
      console.error('Check auth setup error:', error)
      return { hasCredentials: false, error: error.message }
    }
  })

  /**
   * <summary>
   * Şifre Geçmişi Listesini Getirici
   * </summary>
   */
  ipcMain.handle('db:get-password-history', async () => {
    try {
      const db = workspaceManager.getDb()
      const row = db.prepare("SELECT value FROM settings WHERE key = 'passwordHistory'").get() as
        | { value?: string }
        | undefined
      if (!row?.value) return { success: true, history: [] }
      const history = JSON.parse(row.value)
      return { success: true, history }
    } catch (error: any) {
      return { success: false, history: [], error: error.message }
    }
  })

  /**
   * <summary>
   * İlk Kullanıcı ve Kimlik Bilgileri Kurulumu (Cihaz/Kullanıcı Destekli)
   * </summary>
   * <param name="code">e-Bütçe Kurum Kodu</param>
   * <param name="user">Yönetici Kullanıcı Adı</param>
   * <param name="pass">Yönetici Şifresi</param>
   */
  ipcMain.handle('db:setup-auth', async (_, code: string, user: string, pass: string) => {
    try {
      const db = workspaceManager.getDb()
      const hostname = os.hostname()
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      stmt.run('eButceKodu', code)
      stmt.run('adminUsername', user)
      stmt.run('adminPassword', pass)
      stmt.run(`pcPass_${user}_${hostname}`, pass)

      // Save to password history log
      savePasswordToHistory(db, user, pass, hostname)

      // Update additionalUsers list with PC mapping
      let usersList: any[] = []
      const usersRow = db.prepare("SELECT value FROM settings WHERE key = 'additionalUsers'").get() as
        | { value: string }
        | undefined
      if (usersRow?.value) {
        try {
          usersList = JSON.parse(usersRow.value)
        } catch {}
      }

      const existingIndex = usersList.findIndex((u: any) => u.username === user)
      const userEntry = {
        username: user,
        password: pass,
        hostname: hostname,
        osUsername: os.userInfo().username,
        updatedAt: new Date().toISOString()
      }

      if (existingIndex >= 0) {
        usersList[existingIndex] = { ...usersList[existingIndex], ...userEntry }
      } else {
        usersList.push(userEntry)
      }

      stmt.run('additionalUsers', JSON.stringify(usersList))

      workspaceManager.recordMutation('SETTINGS')
      workspaceManager.save()
      return { success: true }
    } catch (error: any) {
      console.error('Setup auth error:', error)
      return { success: false, error: error.message }
    }
  })

  /**
   * <summary>
   * Kullanıcı Giriş İşleyicisi (Çoklu PC, Kullanıcı Profili & Şifre Geçmişi Fallback Uyumlu)
   * </summary>
   * <param name="_code">Opsiyonel Kod</param>
   * <param name="user">Giriş Yapılacak Kullanıcı Adı</param>
   * <param name="pass">Giriş Şifresi</param>
   * <returns>Giriş başarılı ise kullanıcı bilgileri</returns>
   */
  ipcMain.handle('db:login', async (_, _code: string, user: string, pass: string) => {
    try {
      const db = workspaceManager.getDb()
      const hostname = os.hostname()

      const userRow = db.prepare("SELECT value FROM settings WHERE key = 'adminUsername'").get() as
        | { value: string }
        | undefined
      const passRow = db.prepare("SELECT value FROM settings WHERE key = 'adminPassword'").get() as
        | { value: string }
        | undefined

      // Check device specific password
      const pcPassRow = db
        .prepare('SELECT value FROM settings WHERE key = ?')
        .get(`pcPass_${user}_${hostname}`) as { value: string } | undefined

      if (pcPassRow?.value && pcPassRow.value === pass) {
        return { success: true, username: user, hostname }
      }

      const expectedUser = userRow?.value || 'admin'
      const expectedPass = passRow?.value || ''

      if (user === expectedUser && pass === expectedPass) {
        return { success: true, username: expectedUser }
      }

      // Check additionalUsers in settings if multi-user setup exists
      const additionalUsersRow = db
        .prepare("SELECT value FROM settings WHERE key = 'additionalUsers'")
        .get() as { value: string } | undefined

      if (additionalUsersRow?.value) {
        try {
          const list = JSON.parse(additionalUsersRow.value)
          if (Array.isArray(list)) {
            const matched = list.find((u: any) => u.username === user && u.password === pass)
            if (matched) {
              return { success: true, username: matched.username, role: matched.role || 'user' }
            }
          }
        } catch (e) {
          console.error('Failed to parse additionalUsers:', e)
        }
      }

      // Check password history fallback for legacy/backup files
      if (checkPasswordHistory(db, user, pass)) {
        return {
          success: true,
          username: user,
          isHistoricalMatch: true,
          notice: 'Geçmiş şifre kaydıyla oturum açıldı.'
        }
      }

      return { success: false, error: 'Kullanıcı adı veya şifre hatalı!' }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  })

  /**
   * <summary>
   * Şifre Sıfırlama E-postası / 6 Haneli Doğrulama Kodu Gönderici
   * </summary>
   * <returns>Maskelenmiş e-posta adresi ve doğrulama durumu</returns>
   */
  ipcMain.handle('db:send-recovery-email', async () => {
    try {
      const db = workspaceManager.getDb()
      const getSetting = (key: string): string => {
        try {
          const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
            | { value?: string }
            | undefined
          return row?.value || ''
        } catch {
          return ''
        }
      }

      const smtpHost = getSetting('smtpHost') || getSetting('smtp_host')
      const smtpPort = parseInt(getSetting('smtpPort') || getSetting('smtp_port') || '587', 10)
      const smtpUser = getSetting('smtpUser') || getSetting('smtp_user')
      const smtpPass = getSetting('smtpPass') || getSetting('smtp_pass')
      const smtpSecure = getSetting('smtpSecure') === 'true' || getSetting('smtp_secure') === 'true'
      const targetEmail =
        getSetting('smtpReceiver') ||
        getSetting('smtp_receiver') ||
        getSetting('kurum_eposta') ||
        getSetting('kurumEposta') ||
        getSetting('adminEmail') ||
        getSetting('admin_email') ||
        smtpUser

      // Generate 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      activeRecovery = {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
        email: targetEmail || 'tanimsiz@kurum.gov.tr'
      }

      // Mask email for privacy (e.g. adm***@domain.com)
      const maskEmail = (mail: string): string => {
        if (!mail || !mail.includes('@')) return mail || 'kurum-eposta'
        const [local, dom] = mail.split('@')
        const maskedLocal = local.length <= 2 ? local + '***' : local.slice(0, 2) + '***'
        return `${maskedLocal}@${dom}`
      }

      const maskedDisplay = targetEmail ? maskEmail(targetEmail) : 'Kurum E-postası'

      // Check if SMTP is configured
      if (smtpHost && smtpUser && smtpPass) {
        try {
          const actualSecure =
            smtpPort === 465
              ? true
              : smtpPort === 587 || smtpPort === 25 || smtpPort === 2525
                ? false
                : smtpSecure

          const nodemailer = await import('nodemailer')
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: actualSecure,
            auth: {
              user: smtpUser,
              pass: smtpPass
            },
            tls: {
              rejectUnauthorized: false
            }
          })

          const institution = getSetting('institutionName') || 'TEMİN 360 Kurumu'
          await transporter.sendMail({
            from: `"${institution} (TEMİN 360)" <${smtpUser}>`,
            to: targetEmail || smtpUser,
            subject: `[TEMİN 360] Şifre Sıfırlama Kodu: ${code}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <h2 style="color: #1e293b; margin-top: 0;">TEMİN 360 Güvenlik Doğrulaması</h2>
                <p style="color: #475569; font-size: 14px;"><strong>${institution}</strong> çalışma dosyası için şifre sıfırlama talebinde bulunuldu.</p>
                <div style="background: #f1f5f9; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">${code}</span>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">Bu kod 15 dakika boyunca geçerlidir. Talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayınız.</p>
              </div>
            `
          })

          return {
            success: true,
            email: maskedDisplay,
            isTestMode: false,
            testCode: code
          }
        } catch (mailError: any) {
          console.warn('SMTP Send error, falling back to test mode code:', mailError?.message)
          return {
            success: true,
            email: maskedDisplay,
            isTestMode: true,
            testCode: code,
            warning: `SMTP e-posta gönderimi başarısız oldu (${mailError?.message || 'Bağlantı hatası'}). Test için doğrulama kodunuz hazırlandı.`
          }
        }
      }

      // SMTP not configured - enable test mode with generated code
      return {
        success: true,
        email: maskedDisplay,
        isTestMode: true,
        testCode: code,
        warning: 'SMTP sunucusu yapılandırılmadığı için test modu aktiftir.'
      }
    } catch (error: any) {
      console.error('Send recovery email error:', error)
      return { success: false, error: error.message }
    }
  })

  /**
   * <summary>
   * Kurtarma Kodu Doğrulama İşleyicisi
   * </summary>
   * <param name="inputCode">Kullanıcının girdiği 6 haneli doğrulama kodu</param>
   */
  ipcMain.handle('db:verify-recovery-code', async (_, inputCode: string) => {
    try {
      if (!activeRecovery) {
        return {
          success: false,
          error: 'Aktif bir kurtarma kodu bulunamadı. Lütfen tekrar kod isteyin.'
        }
      }
      if (Date.now() > activeRecovery.expiresAt) {
        activeRecovery = null
        return {
          success: false,
          error: 'Doğrulama kodunun geçerlilik süresi dolmuş (15 dk). Lütfen yeni kod isteyin.'
        }
      }
      const cleanInput = (inputCode || '').toString().trim()
      if (cleanInput !== activeRecovery.code) {
        return { success: false, error: 'Girdiğiniz 6 haneli doğrulama kodu hatalı!' }
      }
      return { success: true }
    } catch (error: any) {
      console.error('Verify recovery code error:', error)
      return { success: false, error: error.message }
    }
  })
}
