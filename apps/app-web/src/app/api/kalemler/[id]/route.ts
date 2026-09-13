import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Geçersiz kalem ID' }, { status: 400 })
    }

    const body = await req.json()
    const {
      siraNo,
      malzemeAdi,
      aciklama,
      miktar,
      birim,
      yaklasikBirimFiyat,
      tasinirKodu,
      okasKodu
    } = body

    const existing = await prisma.kalem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Kalem bulunamadı' }, { status: 404 })
    }

    const newMiktar = miktar !== undefined ? Number(miktar) : Number(existing.miktar)
    const newBirimFiyat =
      yaklasikBirimFiyat !== undefined
        ? Number(yaklasikBirimFiyat)
        : existing.yaklasikBirimFiyat
        ? Number(existing.yaklasikBirimFiyat)
        : null
    const newToplam = newBirimFiyat ? newMiktar * newBirimFiyat : null

    const updated = await prisma.kalem.update({
      where: { id },
      data: {
        ...(siraNo !== undefined && { siraNo: parseInt(siraNo, 10) }),
        ...(malzemeAdi !== undefined && { malzemeAdi }),
        ...(aciklama !== undefined && { aciklama }),
        ...(miktar !== undefined && { miktar: newMiktar }),
        ...(birim !== undefined && { birim }),
        ...(yaklasikBirimFiyat !== undefined && { yaklasikBirimFiyat: newBirimFiyat }),
        yaklasikToplam: newToplam,
        ...(tasinirKodu !== undefined && { tasinirKodu }),
        ...(okasKodu !== undefined && { okasKodu })
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Kalem güncellenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Geçersiz kalem ID' }, { status: 400 })
    }

    await prisma.kalem.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Kalem silindi' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Kalem silinirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
