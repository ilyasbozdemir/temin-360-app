import React from 'react';
import { DocumentLayout } from '../../document/DocumentLayout';
import { DocumentTable } from '../../document/DocumentTable';
import { ApprovalSignature, MetadataBlock } from '../../document/ApprovalSignature';
import { EditableField } from '../../document/EditableField';
import { paginateData } from '../../document/DynamicPaginatedTable';
import { SonAlimFiyatCetveliType } from './SonAlimFiyatCetveli.schema';
import {
  ANA_TABLO_KOLONLARI,
  type EndeksKaydi,
  normalizeKalemler,
  resolvePageLimits,
} from './sonAlimFiyat.helpers';
import { SonAlimImzaAlani } from './SonAlimImzaAlani';
import { SonAlimYiUfeEki } from './SonAlimYiUfeEki';

interface SonAlimFiyatCetveliProps {
  data?: Partial<SonAlimFiyatCetveliType> & Record<string, any>;
  pageSize?: 'A4' | 'A3';
  orientation?: 'portrait' | 'landscape';
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

const notStili: React.CSSProperties = {
  fontSize: '9pt',
  color: '#444',
  borderLeft: '3px solid #cbd5e1',
  paddingLeft: '8px',
  lineHeight: 1.4,
};

export function SonAlimFiyatCetveli({
  data = {},
  pageSize = 'A4',
  orientation = 'portrait',
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: SonAlimFiyatCetveliProps) {
  const kalemler = normalizeKalemler(data);
  const fLimit = firstPageLimit ?? data.firstPageLimit;
  const limits = resolvePageLimits(orientation, {
    first: fLimit,
    middle: middlePageLimit ?? data.middlePageLimit,
    last: lastPageLimit ?? data.lastPageLimit,
  });
  const pages = paginateData(kalemler, limits);

  const endeksler: EndeksKaydi[] = Array.isArray(data.yiUfeEndeksleri) ? data.yiUfeEndeksleri : [];
  const ekGoster = data.yiUfeEkiGoster !== false && endeksler.length > 0;

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
                  tarih={data.tarih || data.dosya_acilis_tarihi || data.dosyaAcilisTarihi || data.dosyaTarihi}
                  dosyaKonusu={data.dosyaKonusu || data.isinAdi || 'Mal Alımı'}
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
                <div style={{ ...notStili, marginTop: '8px', marginBottom: '16px' }}>
                  <EditableField
                    name="bilgiNotuUst"
                    value={
                      data.bilgiNotuUst ||
                      'Aşağıdaki tablo, belirtilen malzeme/hizmet kalemlerinin kurumumuzca en son gerçekleştirilen satın alma işlemlerine ait fiyat bilgilerini içermektedir.'
                    }
                    placeholder="Bilgi Notu"
                  />
                </div>
              </>
            )}

            <DocumentTable
              columns={ANA_TABLO_KOLONLARI}
              data={pageItems}
              emptyMessage="Kayıt bulunamadı"
              striped={false}
              startIndex={isFirstPage ? 0 : limits.firstPage + (pageIdx - 1) * limits.middle}
              currentSplitIndex={fLimit ? Number(fLimit) : null}
            />

            {isLastPage && (
              <>
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

                <div style={{ ...notStili, marginTop: '14px', marginBottom: '20px' }}>
                  <EditableField
                    name="bilgiNotuAlt"
                    value={
                      data.bilgiNotuAlt ||
                      'Bu cetvel, 4734 sayılı Kamu İhale Kanunu kapsamında piyasa fiyatı araştırması ve yaklaşık maliyet tespitine esas olmak üzere düzenlenmiştir.'
                    }
                    placeholder="Açıklama Notu"
                  />
                </div>

                {ekGoster && (
                  <div style={{ fontSize: '9pt', marginBottom: '8px' }}>
                    <strong>Ek:</strong> EK-1 TÜİK Yİ-ÜFE ile Güncellenmiş Son Alım Fiyatları
                  </div>
                )}

                <SonAlimImzaAlani data={data} />

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

      {ekGoster && (
        <SonAlimYiUfeEki
          data={data}
          kalemler={kalemler}
          endeksler={endeksler}
          limits={limits}
          pageSize={pageSize}
          orientation={orientation}
        />
      )}
    </>
  );
}
