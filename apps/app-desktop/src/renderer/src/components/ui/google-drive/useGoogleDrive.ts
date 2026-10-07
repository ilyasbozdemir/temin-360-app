import React, { useEffect, useState } from 'react'
import {
  AuthTab,
  GDriveFile,
  StatusMsg,
  StatusType,
  cleanAccessToken,
  cleanSecret,
  errorText,
  isSupportedBackup
} from './gdriveUtils'

const ipc = (channel: string, payload?: unknown): Promise<any> =>
  window.electron.ipcRenderer.invoke(channel, payload)

const tokenPayload = (token: string): { token?: string } => (token ? { token } : {})

export function useGoogleDrive(isOpen: boolean, onClose: () => void) {
  const [authTab, setAuthTab] = useState<AuthTab>('api')
  const [token, setToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [isSavedToken, setIsSavedToken] = useState(false)
  const [files, setFiles] = useState<GDriveFile[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<StatusMsg | null>(null)

  const isConnected = Boolean(token || refreshToken || isSavedToken)
  const notify = (text: string, type: StatusType): void => setStatusMsg({ text, type })

  const fetchDriveFiles = async (currentToken?: string): Promise<void> => {
    const useToken = cleanAccessToken(currentToken !== undefined ? currentToken : token)
    setIsLoadingList(true)
    setStatusMsg(null)
    try {
      const res = await ipc('workspace:list-gdrive-files', tokenPayload(useToken))
      if (!res.success) return notify(res.error || 'Google Drive dosyaları çekilemedi.', 'error')
      const validList = (res.files || []).filter((f: GDriveFile) => isSupportedBackup(f.name))
      setFiles(validList)
      setIsSavedToken(true)
      if (validList.length === 0) {
        notify('TEMIN_360_YEDEKLER klasöründe henüz proje yedek dosyası bulunamadı.', 'info')
      }
    } catch (err) {
      notify(errorText(err, 'Listeleme sırasında bir hata oluştu.'), 'error')
    } finally {
      setIsLoadingList(false)
    }
  }

  // Kayıtlı ayarları SQLite'tan yükle
  useEffect(() => {
    if (!isOpen) return
    window.electron?.ipcRenderer
      .invoke('db:get-settings')
      .then((settings) => {
        let hasAccess = false
        if (settings?.gdriveAccessToken) {
          const clean = cleanAccessToken(settings.gdriveAccessToken)
          setToken(clean)
          setIsSavedToken(true)
          hasAccess = true
          fetchDriveFiles(clean)
        }
        if (settings?.gdriveRefreshToken) {
          setRefreshToken(cleanSecret(settings.gdriveRefreshToken))
          setIsSavedToken(true)
          if (!hasAccess) fetchDriveFiles()
        }
        if (settings?.gdriveClientId) setClientId(settings.gdriveClientId.trim())
        if (settings?.gdriveClientSecret) setClientSecret(settings.gdriveClientSecret.trim())

        // Kayıtlı veriye göre aktif sekmeyi seç
        if (settings?.gdriveClientId && settings?.gdriveClientSecret) setAuthTab('api')
        else if (settings?.gdriveAccessToken) setAuthTab('manual')
      })
      .catch(console.error)
  }, [isOpen])

  const handleStartGoogleOAuth = async (): Promise<void> => {
    const cId = cleanSecret(clientId)
    const cSecret = cleanSecret(clientSecret)
    if (!cId || !cSecret) {
      return notify(
        "Lütfen önce Client ID ve Client Secret alanlarını doldurun veya 'client_secret.json Yükle' butonunu kullanın.",
        'error'
      )
    }
    setIsAuthenticating(true)
    notify(
      "Tarayıcınız açılıyor... Lütfen açılan sayfada Google hesabınızı seçip Temin 360'a izin verin.",
      'info'
    )
    try {
      const res = await ipc('workspace:start-gdrive-oauth', { clientId: cId, clientSecret: cSecret })
      if (!res.success) {
        return notify(res.error || 'Google ile oturum açma işlemi tamamlanamadı.', 'error')
      }
      if (res.accessToken) setToken(res.accessToken)
      if (res.refreshToken) setRefreshToken(res.refreshToken)
      setIsSavedToken(true)
      notify(
        '🎉 Google Hesabınız başarıyla bağlandı! Kalıcı yetki alındı, yedekleme sistemi anında aktif edildi.',
        'success'
      )
      fetchDriveFiles(res.accessToken)
    } catch (err) {
      notify(`Oturum açma hatası: ${errorText(err, '')}`, 'error')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleOpenGoogleAuth = (): void => {
    const authUrl = 'https://developers.google.com/oauthplayground'
    if (window.electron?.ipcRenderer) window.electron.ipcRenderer.send('open-external-url', authUrl)
    else window.open(authUrl, '_blank')
    notify(
      "OAuth Playground tarayıcıda açıldı. Sağ üstteki ⚙️ Dişli simgesinden kendi Client ID ve Secret'ınızı girip Drive API v3 seçerek kalıcı yetki alabilirsiniz.",
      'info'
    )
  }

  const handleImportClientJson = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string)
        const data = parsed.installed || parsed.web || parsed
        if (data.client_id) setClientId(data.client_id.trim())
        if (data.client_secret) setClientSecret(data.client_secret.trim())
        if (data.client_id || data.client_secret) {
          notify(
            "✅ JSON dosyasından Client ID ve Client Secret başarıyla okundu! Aşağıdaki 'Kaydet ve Kalıcı Modu Aktif Et' butonuna basarak kaydedebilirsiniz.",
            'success'
          )
          setAuthTab('api')
        } else {
          notify('JSON dosyasında geçerli client_id veya client_secret bulunamadı.', 'error')
        }
      } catch {
        notify('Geçersiz veya bozuk JSON dosyası.', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // 1. YÖNTEM: Google Cloud API (Client ID & Secret + Refresh Token)
  const handleSaveApiSettings = async (): Promise<void> => {
    const cId = cleanSecret(clientId)
    const cSecret = cleanSecret(clientSecret)
    const cRefresh = cleanSecret(refreshToken)
    const cToken = cleanAccessToken(token)
    if (!cId || !cSecret) {
      return notify(
        "Lütfen Client ID ve Client Secret alanlarını doldurun veya 'client_secret.json Yükle' butonunu kullanın.",
        'error'
      )
    }
    try {
      await ipc('db:save-settings', {
        gdriveClientId: cId,
        gdriveClientSecret: cSecret,
        ...(cRefresh ? { gdriveRefreshToken: cRefresh } : {}),
        ...(cToken ? { gdriveAccessToken: cToken } : {})
      })
      if (cRefresh || cToken) {
        setIsSavedToken(true)
        notify('✅ Google Cloud API bilgileri ve Yetki Anahtarı kaydedildi! Kalıcı mod aktif.', 'success')
        fetchDriveFiles(cToken || undefined)
      } else {
        notify(
          "✅ Client ID ve Secret kaydedildi. Şimdi aşağıdaki 'Google ile Oturum Aç & Drive'a Bağlan' butonuna basarak tek tıkla yetki alabilirsiniz.",
          'info'
        )
      }
    } catch (err) {
      notify(`Kaydetme hatası: ${errorText(err, '')}`, 'error')
    }
  }

  // 2. YÖNTEM: Hızlı Manuel Access Token
  const handleSaveManualToken = async (): Promise<void> => {
    const cToken = cleanAccessToken(token)
    if (!cToken) return notify('Lütfen geçerli bir Access Token (ya29...) girin.', 'error')
    try {
      await ipc('db:save-settings', { gdriveAccessToken: cToken })
      setToken(cToken)
      setIsSavedToken(true)
      notify('✅ Manuel Access Token kaydedildi. Google Drive dosyalarınız çekiliyor...', 'success')
      fetchDriveFiles(cToken)
    } catch (err) {
      notify(`Token kaydetme hatası: ${errorText(err, '')}`, 'error')
    }
  }

  const handleUploadCurrentFile = async (): Promise<void> => {
    const cToken = cleanAccessToken(token)
    if (!cToken && !refreshToken && !isSavedToken) {
      return notify(
        "Lütfen önce yukarıdaki 'Google ile Oturum Aç' butonuyla bağlanın veya token tanımlayın.",
        'error'
      )
    }
    setIsUploading(true)
    notify('Aktif dosya tarih damgasıyla Google Drive bulutuna yükleniyor...', 'info')
    try {
      const res = await ipc('workspace:backup-gdrive', tokenPayload(cToken))
      if (!res.success) return notify(res.error || 'Yükleme başarısız.', 'error')
      notify(res.message || 'Dosya Google Drive hesabınıza başarıyla yüklendi.', 'success')
      fetchDriveFiles(cToken || undefined)
    } catch (err) {
      notify(errorText(err, 'Yükleme hatası oluştu.'), 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadFile = async (file: GDriveFile, overwriteActive = true): Promise<void> => {
    if (
      overwriteActive &&
      !window.confirm(
        `"${file.name}" bulut yedeği doğrudan mevcut aktif çalışma dosyanıza yazılacak ve geri yüklenecektir.\n\n(Güvenlik için mevcut dosyanızın otomatik .bak yedeği alınır).\n\nDevam etmek istiyor musunuz?`
      )
    ) {
      return
    }
    const cToken = cleanAccessToken(token)
    setDownloadingId(file.id)
    notify(
      overwriteActive
        ? `${file.name} indiriliyor ve aktif çalışma dosyanıza geri yükleniyor...`
        : `${file.name} Masaüstüne indiriliyor ve açılıyor...`,
      'info'
    )
    try {
      const res = await ipc('workspace:download-gdrive-file', {
        fileId: file.id,
        fileName: file.name,
        ...tokenPayload(cToken),
        overwriteActive
      })
      if (!res.success) return notify(res.error || 'İndirme hatası oluştu.', 'error')
      notify(res.message || 'Dosya başarıyla yüklendi ve açıldı.', 'success')
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 1200)
    } catch (err) {
      notify(errorText(err, 'İndirme işlemi sırasında hata oluştu.'), 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDeleteFile = async (file: GDriveFile): Promise<void> => {
    if (
      !window.confirm(
        `"${file.name}" yedeğini Google Drive'dan kalıcı olarak silmek istediğinize emin misiniz?`
      )
    ) {
      return
    }
    const cToken = cleanAccessToken(token)
    setDeletingId(file.id)
    try {
      const res = await ipc('workspace:delete-gdrive-file', {
        fileId: file.id,
        ...tokenPayload(cToken)
      })
      if (!res.success) return notify(res.error || 'Silme işlemi başarısız oldu.', 'error')
      notify(`${file.name} Google Drive'dan başarıyla silindi.`, 'success')
      fetchDriveFiles(cToken || undefined)
    } catch (err) {
      notify(errorText(err, 'Silme işlemi sırasında hata oluştu.'), 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return {
    authTab, setAuthTab, token, setToken, refreshToken, setRefreshToken,
    clientId, setClientId, clientSecret, setClientSecret,
    isSavedToken, isConnected, files, statusMsg,
    isLoadingList, isUploading, isAuthenticating, downloadingId, deletingId,
    fetchDriveFiles, handleStartGoogleOAuth, handleOpenGoogleAuth, handleImportClientJson,
    handleSaveApiSettings, handleSaveManualToken, handleUploadCurrentFile,
    handleDownloadFile, handleDeleteFile
  }
}

export type GoogleDriveState = ReturnType<typeof useGoogleDrive>
