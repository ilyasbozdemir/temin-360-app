import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RealtimeBus } from '@/lib/socket'
import { resolveKurumId } from '@/lib/kurumHelper'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const queryKurumId = searchParams.get('kurumId')
    const headerKurumId = req.headers.get('x-kurum-id')
    const durum = searchParams.get('durum')
    const alimTuru = searchParams.get('alimTuru')
    const q = searchParams.get('q')

    let targetKurumId: number | undefined = undefined
    if (queryKurumId !== 'all') {
      targetKurumId = await resolveKurumId(req, queryKurumId || headerKurumId)
    }

    const where: Record<string, unknown> = {}
    if (targetKurumId) {
      where.kurumId = targetKurumId
    }
    if (durum && durum !== 'hepsi') {
      where.durum = durum
    }
    if (alimTuru && alimTuru !== 'hepsi') {
      where.alimTuru = alimTuru
    }
    if (q) {
      where.OR = [
        { dosyaNo: { contains: q, mode: 'insensitive' } },
        { isAdi: { contains: q, mode: 'insensitive' } }
      ]
    }

    const dosyalar = await prisma.teminDosyasi.findMany({
      where,
      include: {
        kurum: true,
        birim: true,
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

    return NextResponse.json({
      success: true,
      count: dosyalar.length,
      kurumId: targetKurumId || 'all',
      data: dosyalar
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Dosyalar listelenirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      dosyaNo,
      isAdi,
      alimTuru,
      usul,
      durum,
      yaklasikMaliyet,
      sozlesmeBedeli,
      kalemler,
      kurumId: explicitKurumId,
      birimId
    } = body

    if (!dosyaNo || !isAdi) {
      return NextResponse.json(
        { success: false, error: 'dosyaNo ve isAdi zorunludur' },
        { status: 400 }
      )
    }

    const targetKurumId = await resolveKurumId(req, explicitKurumId)

    const dosya = await prisma.teminDosyasi.upsert({
      where: {
        kurumId_dosyaNo: {
          kurumId: targetKurumId,
          dosyaNo
        }
      },
      update: {
        isAdi,
        alimTuru: alimTuru || 'mal',
        usul: usul || '22_d',
        durum: durum || 'taslak',
        birimId: birimId ? parseInt(birimId, 10) : undefined,
        yaklasikMaliyet: yaklasikMaliyet !== undefined && yaklasikMaliyet !== '' ? Number(yaklasikMaliyet) : undefined,
        sozlesmeBedeli: sozlesmeBedeli !== undefined && sozlesmeBedeli !== '' ? Number(sozlesmeBedeli) : undefined,
        updatedAt: new Date()
      },
      create: {
        kurumId: targetKurumId,
        birimId: birimId ? parseInt(birimId, 10) : undefined,
        dosyaNo,
        isAdi,
        alimTuru: alimTuru || 'mal',
        usul: usul || '22_d',
        durum: durum || 'taslak',
        yaklasikMaliyet: yaklasikMaliyet !== undefined && yaklasikMaliyet !== '' ? Number(yaklasikMaliyet) : undefined,
        sozlesmeBedeli: sozlesmeBedeli !== undefined && sozlesmeBedeli !== '' ? Number(sozlesmeBedeli) : undefined
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
      data: { isAdi: dosya.isAdi, durum: dosya.durum, kurumId: targetKurumId }
    })

    return NextResponse.json({ success: true, data: dosya, kurumId: targetKurumId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Dosya kaydedilirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
