import { google } from 'googleapis'
import { Readable } from 'stream'

export interface GoogleDriveConfig {
  clientId?: string
  clientSecret?: string
  refreshToken?: string
  folderId?: string
}

export function getDriveClient(config: GoogleDriveConfig) {
  const clientId = config.clientId || process.env.GOOGLE_DRIVE_CLIENT_ID
  const clientSecret = config.clientSecret || process.env.GOOGLE_DRIVE_CLIENT_SECRET
  const refreshToken = config.refreshToken || process.env.GOOGLE_DRIVE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Drive API kimlik bilgileri (Client ID, Secret veya Refresh Token) eksik.')
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  )

  oauth2Client.setCredentials({ refresh_token: refreshToken })

  return google.drive({ version: 'v3', auth: oauth2Client })
}

export async function listDriveBackups(config: GoogleDriveConfig) {
  const drive = getDriveClient(config)
  const folderId = config.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID

  let query = "trashed = false"
  if (folderId) {
    query += ` and '${folderId}' in parents`
  }

  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: 50
  })

  return (res.data.files || []).map((f) => ({
    id: f.id || '',
    name: f.name || '',
    mimeType: f.mimeType || '',
    size: parseInt(f.size || '0', 10),
    createdTime: f.createdTime || '',
    modifiedTime: f.modifiedTime || ''
  }))
}

export async function uploadDriveBackup(
  config: GoogleDriveConfig,
  fileName: string,
  buffer: Buffer,
  mimeType: string = 'application/octet-stream'
) {
  const drive = getDriveClient(config)
  const folderId = config.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID

  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)

  const parents = folderId ? [folderId] : undefined

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents
    },
    media: {
      mimeType,
      body: stream
    },
    fields: 'id, name, size, modifiedTime'
  })

  return {
    id: res.data.id || '',
    name: res.data.name || '',
    size: parseInt(res.data.size || '0', 10),
    modifiedTime: res.data.modifiedTime || ''
  }
}

export async function downloadDriveFile(config: GoogleDriveConfig, fileId: string): Promise<Buffer> {
  const drive = getDriveClient(config)

  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  )

  return Buffer.from(res.data as ArrayBuffer)
}

export async function deleteDriveFile(config: GoogleDriveConfig, fileId: string) {
  const drive = getDriveClient(config)
  await drive.files.delete({ fileId })
  return { success: true }
}
