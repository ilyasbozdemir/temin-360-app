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
      return NextResponse.json({ success: false, error: 'Geçersiz firma ID' }, { status: 400 })
    }

    const body = await req.json()
    const {
      unvan,
      vergiNo,
      vergiDairesi,
      telefon,
      eposta,
      adres,
      il,
      ilce,
      yetkili,
      yasakliMi
    } = body

    const updated = await prisma.firma.update({
      where: { id },
      data: {
        ...(unvan !== undefined && { unvan }),
        ...(vergiNo !== undefined && { vergiNo }),
        ...(vergiDairesi !== undefined && { vergiDairesi }),
        ...(telefon !== undefined && { telefon }),
        ...(eposta !== undefined && { eposta }),
        ...(adres !== undefined && { adres }),
        ...(il !== undefined && { il }),
        ...(ilce !== undefined && { ilce }),
        ...(yetkili !== undefined && { yetkili }),
        ...(yasakliMi !== undefined && { yasakliMi: Boolean(yasakliMi) })
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Firma güncellenirken hata oluştu'
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
      return NextResponse.json({ success: false, error: 'Geçersiz firma ID' }, { status: 400 })
    }

    await prisma.firma.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Firma başarıyla silindi' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Firma silinirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
