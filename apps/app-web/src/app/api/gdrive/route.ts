import { NextRequest, NextResponse } from 'next/server'
import { listDriveBackups, uploadDriveBackup, deleteDriveFile } from '@/lib/gdrive'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const folderId = searchParams.get('folderId') || undefined

    const gdriveSettings = await prisma.googleDriveAyarlari.findUnique({ where: { id: 1 } })

    const config = {
      clientId: gdriveSettings?.clientId || undefined,
      clientSecret: gdriveSettings?.clientSecret || undefined,
      refreshToken: gdriveSettings?.refreshToken || undefined,
      folderId: folderId || gdriveSettings?.folderId || undefined
    }

    const files = await listDriveBackups(config)

    return NextResponse.json({ success: true, files })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Google Drive dosyaları listelenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const dosyaIdStr = formData.get('dosyaId') as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya seçilmedi' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const gdriveSettings = await prisma.googleDriveAyarlari.findUnique({ where: { id: 1 } })

    const config = {
      clientId: gdriveSettings?.clientId || undefined,
      clientSecret: gdriveSettings?.clientSecret || undefined,
      refreshToken: gdriveSettings?.refreshToken || undefined,
      folderId: gdriveSettings?.folderId || undefined
    }

    const uploaded = await uploadDriveBackup(config, file.name, buffer, file.type)

    // Save backup record to PostgreSQL
    const dosyaId = dosyaIdStr ? parseInt(dosyaIdStr, 10) : null
    await prisma.yedekKaydi.create({
      data: {
        dosyaId: !isNaN(dosyaId as number) ? dosyaId : null,
        hedef: 'gdrive',
        dosyaAdi: uploaded.name,
        boyutBytes: uploaded.size,
        gdriveFileId: uploaded.id,
        aciklama: 'Web paneli üzerinden Google Drive bulutuna yüklendi',
        durum: 'tamamlandi'
      }
    })

    return NextResponse.json({ success: true, file: uploaded })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Dosya Google Drive yüklenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ success: false, error: 'fileId parametresi gerekli' }, { status: 400 })
    }

    const gdriveSettings = await prisma.googleDriveAyarlari.findUnique({ where: { id: 1 } })

    const config = {
      clientId: gdriveSettings?.clientId || undefined,
      clientSecret: gdriveSettings?.clientSecret || undefined,
      refreshToken: gdriveSettings?.refreshToken || undefined
    }

    await deleteDriveFile(config, fileId)

    return NextResponse.json({ success: true, message: 'Dosya Google Drive üzerinden silindi' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Google Drive dosyası silinirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
