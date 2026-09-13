import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let kurum = await prisma.kurum.findFirst({
      include: {
        birimler: { where: { aktif: true } },
        personeller: { where: { aktif: true } }
      }
    })

    if (!kurum) {
      kurum = await prisma.kurum.create({
        data: {
          kurumAdi: 'T.C. KURUM BAŞKANLIĞI'
        },
        include: {
          birimler: true,
          personeller: true
        }
      })
    }

    return NextResponse.json({ success: true, data: kurum })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Kurum bilgisi alınırken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      id,
      kurumAdi,
      kurumKodu,
      il,
      ilce,
      vergiDairesi,
      vergiNo,
      telefon,
      eposta,
      adres,
      logoUrl
    } = body

    let targetId = id ? parseInt(id, 10) : undefined
    if (!targetId) {
      const first = await prisma.kurum.findFirst()
      targetId = first?.id
    }

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Kurum bulunamadı' }, { status: 404 })
    }

    const updated = await prisma.kurum.update({
      where: { id: targetId },
      data: {
        ...(kurumAdi !== undefined && { kurumAdi }),
        ...(kurumKodu !== undefined && { kurumKodu }),
        ...(il !== undefined && { il }),
        ...(ilce !== undefined && { ilce }),
        ...(vergiDairesi !== undefined && { vergiDairesi }),
        ...(vergiNo !== undefined && { vergiNo }),
        ...(telefon !== undefined && { telefon }),
        ...(eposta !== undefined && { eposta }),
        ...(adres !== undefined && { adres }),
        ...(logoUrl !== undefined && { logoUrl })
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Kurum güncellenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
