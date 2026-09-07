import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RealtimeBus } from '@/lib/socket'

export async function GET() {
  try {
    const dosyalar = await prisma.teminDosyasi.findMany({
      include: {
        kurum: true,
        kazananFirma: true,
        kalemler: true,
        teklifler: {
          include: {
            firma: true
          }
        },
        belgeler: true,
        sablonVerileri: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, count: dosyalar.length, data: dosyalar })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Dosyalar listelenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dosyaNo, isAdi, alimTuru, usul, durum, yaklasikMaliyet, sozlesmeBedeli, kalemler } = body

    if (!dosyaNo || !isAdi) {
      return NextResponse.json(
        { success: false, error: 'dosyaNo ve isAdi zorunludur' },
        { status: 400 }
      )
    }

    const dosya = await prisma.teminDosyasi.upsert({
      where: { dosyaNo },
      update: {
        isAdi,
        alimTuru: alimTuru || 'mal',
        usul: usul || '22_d',
        durum: durum || 'taslak',
        yaklasikMaliyet: yaklasikMaliyet ?? undefined,
        sozlesmeBedeli: sozlesmeBedeli ?? undefined,
        updatedAt: new Date()
      },
      create: {
        dosyaNo,
        isAdi,
        alimTuru: alimTuru || 'mal',
        usul: usul || '22_d',
        durum: durum || 'taslak',
        yaklasikMaliyet: yaklasikMaliyet ?? undefined,
        sozlesmeBedeli: sozlesmeBedeli ?? undefined
      }
    })

    // If kalemler are supplied, sync them
    if (Array.isArray(kalemler) && kalemler.length > 0) {
      for (let i = 0; i < kalemler.length; i++) {
        const k = kalemler[i]
        await prisma.kalem.create({
          data: {
            dosyaId: dosya.id,
            siraNo: k.siraNo || i + 1,
            malzemeAdi: k.malzemeAdi || k.ad || `Kalem ${i + 1}`,
            miktar: k.miktar || 1,
            birim: k.birim || 'Adet',
            aciklama: k.aciklama || null,
            tasinirKodu: k.tasinirKodu || null
          }
        })
      }
    }

    // Broadcast real-time event
    RealtimeBus.emit({
      dosyaId: dosya.id,
      dosyaNo: dosya.dosyaNo,
      action: 'sync',
      source: 'web',
      timestamp: new Date().toISOString(),
      data: { isAdi: dosya.isAdi, durum: dosya.durum }
    })

    return NextResponse.json({ success: true, data: dosya })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Dosya kaydedilirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
