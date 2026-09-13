import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dosyaIdStr = searchParams.get('dosyaId')

    const where = dosyaIdStr ? { dosyaId: parseInt(dosyaIdStr, 10) } : {}
    const kalemler = await prisma.kalem.findMany({
      where,
      include: {
        teklifler: {
          include: { firma: true }
        }
      },
      orderBy: { siraNo: 'asc' }
    })

    return NextResponse.json({ success: true, count: kalemler.length, data: kalemler })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Kalemler listelenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      dosyaId,
      siraNo,
      malzemeAdi,
      aciklama,
      miktar,
      birim,
      yaklasikBirimFiyat,
      tasinirKodu,
      okasKodu
    } = body

    if (!dosyaId || !malzemeAdi) {
      return NextResponse.json(
        { success: false, error: 'dosyaId ve malzemeAdi zorunludur' },
        { status: 400 }
      )
    }

    const numMiktar = Number(miktar) || 1
    const numBirimFiyat = yaklasikBirimFiyat ? Number(yaklasikBirimFiyat) : null
    const yaklasikToplam = numBirimFiyat ? numMiktar * numBirimFiyat : null

    const created = await prisma.kalem.create({
      data: {
        dosyaId: parseInt(dosyaId, 10),
        siraNo: siraNo ? parseInt(siraNo, 10) : 1,
        malzemeAdi,
        aciklama: aciklama || null,
        miktar: numMiktar,
        birim: birim || 'Adet',
        yaklasikBirimFiyat: numBirimFiyat,
        yaklasikToplam,
        tasinirKodu: tasinirKodu || null,
        okasKodu: okasKodu || null
      }
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Kalem eklenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
