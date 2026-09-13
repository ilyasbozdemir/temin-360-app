import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RealtimeBus } from '@/lib/socket'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Geçersiz dosya ID' }, { status: 400 })
    }

    const dosya = await prisma.teminDosyasi.findUnique({
      where: { id },
      include: {
        kurum: true,
        birim: true,
        kazananFirma: true,
        kalemler: {
          orderBy: { siraNo: 'asc' }
        },
        teklifler: {
          include: { firma: true }
        },
        komisyon: {
          include: { personel: true },
          orderBy: { siraNo: 'asc' }
        },
        belgeler: true,
        sablonVerileri: true
      }
    })

    if (!dosya) {
      return NextResponse.json({ success: false, error: 'Dosya bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: dosya })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Dosya getirilirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Geçersiz dosya ID' }, { status: 400 })
    }

    const body = await req.json()
    const {
      isAdi,
      alimTuru,
      usul,
      durum,
      yil,
      yaklasikMaliyet,
      sozlesmeBedeli,
      kdvOrani,
      teklifSozlesmeTuru,
      sozlesmeYapilacakMi,
      kismiTeklifMi,
      harcamaYetkilisi,
      gerceklestirmeGorevli,
      piyasaArastirmaGorevli,
      acilisTarihi,
      sonTeklifTarihi,
      onayTarihi,
      teslimTarihi,
      kazananFirmaId,
      birimId
    } = body

    const updated = await prisma.teminDosyasi.update({
      where: { id },
      data: {
        ...(isAdi !== undefined && { isAdi }),
        ...(alimTuru !== undefined && { alimTuru }),
        ...(usul !== undefined && { usul }),
        ...(durum !== undefined && { durum }),
        ...(yil !== undefined && { yil: parseInt(yil, 10) }),
        ...(yaklasikMaliyet !== undefined && {
          yaklasikMaliyet: yaklasikMaliyet ? Number(yaklasikMaliyet) : null
        }),
        ...(sozlesmeBedeli !== undefined && {
          sozlesmeBedeli: sozlesmeBedeli ? Number(sozlesmeBedeli) : null
        }),
        ...(kdvOrani !== undefined && { kdvOrani: parseInt(kdvOrani, 10) }),
        ...(teklifSozlesmeTuru !== undefined && { teklifSozlesmeTuru }),
        ...(sozlesmeYapilacakMi !== undefined && {
          sozlesmeYapilacakMi: Boolean(sozlesmeYapilacakMi)
        }),
        ...(kismiTeklifMi !== undefined && {
          kismiTeklifMi: Boolean(kismiTeklifMi)
        }),
        ...(harcamaYetkilisi !== undefined && { harcamaYetkilisi }),
        ...(gerceklestirmeGorevli !== undefined && { gerceklestirmeGorevli }),
        ...(piyasaArastirmaGorevli !== undefined && { piyasaArastirmaGorevli }),
        ...(acilisTarihi !== undefined && {
          acilisTarihi: acilisTarihi ? new Date(acilisTarihi) : null
        }),
        ...(sonTeklifTarihi !== undefined && {
          sonTeklifTarihi: sonTeklifTarihi ? new Date(sonTeklifTarihi) : null
        }),
        ...(onayTarihi !== undefined && {
          onayTarihi: onayTarihi ? new Date(onayTarihi) : null
        }),
        ...(teslimTarihi !== undefined && {
          teslimTarihi: teslimTarihi ? new Date(teslimTarihi) : null
        }),
        ...(kazananFirmaId !== undefined && {
          kazananFirmaId: kazananFirmaId ? parseInt(kazananFirmaId, 10) : null
        }),
        ...(birimId !== undefined && {
          birimId: birimId ? parseInt(birimId, 10) : null
        }),
        updatedAt: new Date()
      }
    })

    RealtimeBus.emit({
      dosyaId: updated.id,
      dosyaNo: updated.dosyaNo,
      action: 'sync',
      source: 'web',
      timestamp: new Date().toISOString(),
      data: { isAdi: updated.isAdi, durum: updated.durum }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Dosya güncellenirken hata oluştu'
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
      return NextResponse.json({ success: false, error: 'Geçersiz dosya ID' }, { status: 400 })
    }

    await prisma.teminDosyasi.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: `ID ${id} numaralı dosya başarıyla silindi.`
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Dosya silinirken hata oluştu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
