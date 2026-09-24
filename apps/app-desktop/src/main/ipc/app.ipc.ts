import { ipcMain, app, BrowserWindow } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { manifests } from '@dt/database'
import { recentFilesStore } from '../store/recentFiles'

interface ChangelogSection {
  version: string
  date?: string
  notes: string
  isBacklog: boolean
}

function parseChangelogFile(filePath: string): ChangelogSection[] | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null
    }
    const content = fs.readFileSync(filePath, 'utf8')
    const sections: ChangelogSection[] = []

    const parts = content.split(/\n##\s+/)
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim()
      if (!part) continue

      const lines = part.split('\n')
      const headerLine = lines[0].trim()
      const body = lines.slice(1).join('\n').trim()

      const versionMatch = headerLine.match(/\[?([^\]\s]+)\]?(?:\s*-\s*([\d-]+))?/)
      if (!versionMatch) continue

      const version = versionMatch[1]
      const date = versionMatch[2] || undefined
      const isBacklog =
        version.toLowerCase() === 'unreleased' ||
        headerLine.toLowerCase().includes('unreleased') ||
        headerLine.toLowerCase().includes('backlog')

      sections.push({
        version,
        date,
        notes: body,
        isBacklog
      })
    }
    return sections
  } catch (e) {
    return null
  }
}

export function registerAppIpcHandlers(
  setForceQuit: () => void,
  initialFilePath: string | null
): void {
  // Realtime multi-window / tab data event relay
  ipcMain.on('app:data-changed', (event, msg) => {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed() && win.webContents.id !== event.sender.id) {
        win.webContents.send('app:data-changed', msg)
      }
    }
  })

  ipcMain.handle('app:get-version', () => {
    return app.getVersion()
  })

  ipcMain.handle('app:isPackaged', () => {
    return app.isPackaged
  })

  ipcMain.handle('app:force-quit', () => {
    setForceQuit()
    app.quit()
  })

  ipcMain.handle('app:get-recent-files', () => {
    return recentFilesStore.getRecentFiles()
  })

  ipcMain.handle('app:add-recent-file', (_, filePath: string, name: string) => {
    recentFilesStore.addRecentFile(filePath, name)
    return recentFilesStore.getRecentFiles()
  })

  ipcMain.handle('app:remove-recent-file', (_, filePath: string) => {
    recentFilesStore.removeRecentFile(filePath)
    return recentFilesStore.getRecentFiles()
  })

  // Register both app:get-initial-file and legacy get-initial-file
  let initialFileConsumed = false
  const initialFileHandler = (): string | null => {
    if (initialFileConsumed) return null
    initialFileConsumed = true
    return initialFilePath
  }
  ipcMain.handle('app:get-initial-file', initialFileHandler)
  ipcMain.handle('get-initial-file', initialFileHandler)

  // Register both app:get-changelog and legacy get-changelog
  const changelogHandler = async () => {
    const allChanges: { version: string; date?: string; notes: string; schema_max: number }[] = []
    const backlog: { title: string; items: string[] }[] = []

    const changelogPath = join(app.getAppPath(), 'CHANGELOG.md')
    const parsed = parseChangelogFile(changelogPath)

    if (parsed) {
      parsed.forEach((section) => {
        if (section.isBacklog) {
          const items: string[] = []
          const lines = section.notes.split('\n')
          lines.forEach((line) => {
            const trimmed = line.trim()
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
              items.push(trimmed.replace(/^[-*]\s*/, '').trim())
            }
          })
          backlog.push({
            title: section.version === 'Unreleased' ? 'Planlanan / Gelecek Sürüm' : section.version,
            items
          })
        } else {
          const matchingManifest = manifests.find((m: any) => m.app === section.version)
          const schema_max = matchingManifest ? matchingManifest.schema_max : 20
          allChanges.push({
            version: section.version,
            date: section.date,
            notes: section.notes,
            schema_max
          })
        }
      })
    }

    const appUpdates = [
      {
        version: '1.0.0-beta.31',
        notes:
          '- Hızlı Dosya Ekle / Güncelle: Excel benzeri arayüzle doğrudan temin dosyalarını toplu ekleme, panodan kopyala-yapıştır ile veri aktarma ve toplu güncelleme (UPDATE) desteği eklendi.\n- Toplu İşlemler Paneli: Seçilen doğrudan temin dosyalarına toplu aşama değiştirme, toplu tür değiştirme ve onaylama aşamalı toplu silme özellikleri eklendi.\n- Komisyon Yönetimi: Komisyon detay ekranından dinamik olarak yeni kontenjan (asil/yedek rolü) ekleme ve atama arayüzü eklendi.\n- Malzemeler: Doğrudan temin dosyalarında kullanılan malzemelerin/hizmetlerin silinmesini engelleyen silme koruması eklendi.\n- Sıralama Güncellemesi: Dosya listelerinin tarihe (dosya açılış tarihi) göre en yeniden en eskiye doğru sıralanması sağlandı.\n- Sekme/Tab Entegrasyonu: Komisyon üyeleri atama tab ve yönlendirme parametresi uyumsuzluğu giderildi.',
        schema_max: 20
      }
    ]

    const mergedMap = new Map<
      string,
      { version: string; date?: string; notes: string; schema_max: number }
    >()
    allChanges.forEach((item) => mergedMap.set(item.version, item))
    appUpdates.forEach((item) => {
      if (!mergedMap.has(item.version)) {
        mergedMap.set(item.version, item)
      }
    })

    const finalChanges = Array.from(mergedMap.values())
    return {
      success: true,
      currentVersion: app.getVersion(),
      appUpdates: finalChanges,
      backlog
    }
  }

  ipcMain.handle('app:get-changelog', changelogHandler)
  ipcMain.handle('get-changelog', changelogHandler)
}
