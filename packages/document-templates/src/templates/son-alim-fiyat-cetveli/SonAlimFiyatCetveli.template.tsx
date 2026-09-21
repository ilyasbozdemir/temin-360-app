import React from 'react';
import { DocumentLayout } from '../../document/DocumentLayout';
import { DocumentTable } from '../../document/DocumentTable';
import {
  ApprovalSignature,
  EditableOlurPlaceholder,
  MetadataBlock,
  PersonelCard,
} from '../../document/ApprovalSignature';
import { EditableField } from '../../document/EditableField';
import {
  DEFAULT_LIMITS,
  LANDSCAPE_LIMITS,
  paginateData,
} from '../../document/DynamicPaginatedTable';
import { SonAlimFiyatCetveliType } from './SonAlimFiyatCetveli.schema';

interface SonAlimFiyatCetveliProps {
  data?: Partial<SonAlimFiyatCetveliType> & Record<string, any>;
  pageSize?: 'A4' | 'A3';
  orientation?: 'portrait' | 'landscape';
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

export function SonAlimFiyatCetveli({
  data = {},
  pageSize = 'A4',
  orientation = 'portrait',
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: SonAlimFiyatCetveliProps) {
  const columns: any[] = [
    { key: 'siraNo', label: 'Sıra No', width: '5%', align: 'center' },
    { key: 'malzemeKodu', label: 'Malzeme Kodu', width: '12%', align: 'left' },
    { key: 'malzemeAdi', label: 'Malzeme Adı', width: '18%', align: 'left' },
    { key: 'ozelligi', label: 'Özelliği', width: '14%', align: 'left' },
    { key: 'birimi', label: 'Birimi', width: '7%', align: 'center' },
    { key: 'kdvOrani', label: 'KDV (%)', width: '6%', align: 'center' },
    { key: 'miktar', label: 'Miktar', width: '6%', align: 'right' },
    { key: 'birimFiyat', label: 'Birim Fiyat (TL)', width: '11%', align: 'right' },
    { key: 'toplamTutar', label: 'Toplam Tutar (TL)', width: '11%', align: 'right' },
    { key: 'kazananFirma', label: 'Kazanan Firma', width: '12%', align: 'left' },
    { key: 'alimTarihi', label: 'Alım Tarihi', width: '9%', align: 'center' },
  ];

  const rawItems = (data.fiyatKalemleri && data.fiyatKalemleri.length > 0)
    ? data.fiyatKalemleri
    : (data.ihtiyacKalemleri && data.ihtiyacKalemleri.length > 0)
    ? data.ihtiyacKalemleri.map((k: any, idx: number) => ({
        siraNo: k.siraNo || idx + 1,
        malzemeKodu: k.malzemeKodu || k.kodu || k.tasinir_kodu || '-',
        malzemeAdi: k.malzemeAdi || k.kalem_adi || '',
        ozelligi: k.ozelligi || k.aciklama || '',
        birimi: k.birimi || k.birim || '',
        kdvOrani: k.kdvOrani ? String(k.kdvOrani).replace('%', '') : '20',
        miktar: k.miktar || 1,
        birimFiyat: k.birimFiyat || k.enDusukFiyat || '0,00',
        toplamTutar: k.toplamTutar || k.toplamBedel || '0,00',
        kazananFirma: k.kazananFirma || k.enUygunFirmaAdi || '-',
        alimTarihi: k.alimTarihi || data.tarih || '-',
      }))
    : [];

  const fLimit = firstPageLimit ?? (data as any).firstPageLimit;
  const mLimit = middlePageLimit ?? (data as any).middlePageLimit;
  const lLimit = lastPageLimit ?? (data as any).lastPageLimit;

  const limits = {
    firstPage: fLimit !== undefined && fLimit !== null
      ? Number(fLimit)
      : (orientation === 'landscape'
        ? (LANDSCAPE_LIMITS.firstPage || 10)
        : (DEFAULT_LIMITS.firstPage || 8)),
    middle: mLimit !== undefined && mLimit !== null
      ? Number(mLimit)
      : (orientation === 'landscape'
        ? (LANDSCAPE_LIMITS.middle || 14)
        : (DEFAULT_LIMITS.middle || 12)),
    lastPage: lLimit !== undefined && lLimit !== null
      ? Number(lLimit)
      : (orientation === 'landscape'
        ? (LANDSCAPE_LIMITS.lastPage || 8)
        : (DEFAULT_LIMITS.lastPage || 6)),
  };

  const pages = paginateData(rawItems, limits);

  return (
    <>
      {pages.map((pageItems, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const isLastPage = pageIdx === pages.length - 1;

        return (
          <DocumentLayout
            key={pageIdx}
            data={data}
            hideFooter={false}
            pageSize={pageSize}
            orientation={orientation}
            pageNumber={pageIdx + 1}
            totalPages={pages.length}
            hideHeader={!isFirstPage}
          >
            {isFirstPage && (
              <>
                <MetadataBlock
                  evrakSayisi={data.evrakSayisi}
                  tarih={data.tarih || (data as any).dosya_acilis_tarihi || data.dosyaAcilisTarihi || data.dosyaTarihi}
                  dosyaKonusu={data.dosyaKonusu || data.isinAdi || "Mal Alımı"}
                  showBorder={false}
                />

                <div
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    fontSize: '13pt',
                    letterSpacing: '1px',
                    margin: '18px 0 12px 0',
                  }}
                >
                  SON ALIM FİYAT CETVELİ
                </div>

                <div
                  style={{
                    fontSize: '9pt',
                    color: '#444',
                    marginTop: '8px',
                    marginBottom: '16px',
                    borderLeft: '3px solid #cbd5e1',
                    paddingLeft: '8px',
                    lineHeight: 1.4,
                  }}
                >
                  <EditableField
                    name="bilgiNotuUst"
                    value={
                      (data as any).bilgiNotuUst ||
                      'Aşağıdaki tablo, belirtilen malzeme/hizmet kalemlerinin kurumumuzca en son gerçekleştirilen satın alma işlemlerine ait fiyat bilgilerini içermektedir.'
                    }
                    placeholder="Bilgi Notu"
                  />
                </div>
              </>
            )}

            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Kayıt bulunamadı"
              striped={false}
              startIndex={pageIdx === 0 ? 0 : limits.firstPage + (pageIdx - 1) * limits.middle}
              currentSplitIndex={fLimit ? Number(fLimit) : null}
            />

            {isLastPage && (
              <>
                {/* Genel Toplam Gösterimi */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '10pt',
                    fontWeight: 'bold',
                  }}
                >
                  <span style={{ marginRight: '16px', color: '#334155' }}>
                    Genel Toplam (KDV Dahil):
                  </span>
                  <span style={{ color: '#0f172a' }}>
                    <EditableField
                      name="genelToplam"
                      value={data.genelToplam || '0,00 TL'}
                      placeholder="0,00 TL"
                    />
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '9pt',
                    color: '#444',
                    marginTop: '14px',
                    marginBottom: '20px',
                    borderLeft: '3px solid #cbd5e1',
                    paddingLeft: '8px',
                    lineHeight: 1.4,
                  }}
                >
                  <EditableField
                    name="bilgiNotuAlt"
                    value={
                      (data as any).bilgiNotuAlt ||
                      'Bu cetvel, 4734 sayılı Kamu İhale Kanunu kapsamında piyasa fiyatı araştırması ve yaklaşık maliyet tespitine esas olmak üzere düzenlenmiştir.'
                    }
                    placeholder="Açıklama Notu"
                  />
                </div>

                {/* İmza Alanı */}
                <div
                  style={{
                    marginTop: '30px',
                    pageBreakInside: 'avoid',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'flex-start',
                      width: '100%',
                    }}
                  >
                    <div style={{ textAlign: "center", minWidth: "160px" }}>
                      <PersonelCard
                        adSoyad={data.hazirlayanPersonelAdi}
                        unvan={data.hazirlayanPersonelUnvan}
                        align="center"
                        marginTop={0}
                        marginBottom={4}
                        nameField="hazirlayanPersonelAdi"
                        unvanField="hazirlayanPersonelUnvan"
                      />
                      <div style={{ fontSize: "8pt", color: "#666" }}>Hazırlayan</div>
                    </div>

                    {data.kontrolEdenPersonelAdi && (
                      <div style={{ textAlign: "center", minWidth: "160px" }}>
                        <PersonelCard
                          adSoyad={data.kontrolEdenPersonelAdi}
                          unvan={data.kontrolEdenPersonelUnvan}
                          align="center"
                          marginTop={0}
                          marginBottom={4}
                          nameField="kontrolEdenPersonelAdi"
                          unvanField="kontrolEdenPersonelUnvan"
                        />
                        <div style={{ fontSize: "8pt", color: "#666" }}>Kontrol Eden</div>
                      </div>
                    )}

                    <div style={{ textAlign: "center", minWidth: "160px" }}>
                      <PersonelCard
                        adSoyad={data.onaylayanPersonelAdi}
                        unvan={data.onaylayanPersonelUnvan}
                        align="center"
                        marginTop={0}
                        marginBottom={4}
                        nameField="onaylayanPersonelAdi"
                        unvanField="onaylayanPersonelUnvan"
                      />
                      <div style={{ fontSize: "8pt", color: "#666" }}>Onaylayan</div>
                    </div>
                  </div>
                </div>

                {data.olurYazisi !== false && (
                  <ApprovalSignature
                    title="OLUR"
                    date={data.dosyaTarihi || data.onayTarihi || data.tarih}
                    adSoyad={data.onaylayanPersonelAdi}
                    unvan={data.onaylayanPersonelUnvan}
                    marginTop={30}
                    align="center"
                  />
                )}
              </>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
