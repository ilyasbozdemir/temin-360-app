import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    const where = q
      ? {
          OR: [
            { unvan: { contains: q, mode: 'insensitive' as const } },
            { vergiNo: { contains: q, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const firmalar = await prisma.firma.findMany({
      where,
      orderBy: { unvan: 'asc' }
    })

    return NextResponse.json({ success: true, count: firmalar.length, data: firmalar })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Firmalar listelenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
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
      yetkili
    } = body

    if (!unvan) {
      return NextResponse.json(
        { success: false, error: 'Firma unvanı zorunludur' },
        { status: 400 }
      )
    }

    const created = await prisma.firma.create({
      data: {
        unvan,
        vergiNo: vergiNo || null,
        vergiDairesi: vergiDairesi || null,
        telefon: telefon || null,
        eposta: eposta || null,
        adres: adres || null,
        il: il || null,
        ilce: ilce || null,
        yetkili: yetkili || null
      }
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Firma eklenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
