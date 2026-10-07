import React from 'react';
import { DocumentLayout } from '../../document/DocumentLayout';
import { DocumentTable } from '../../document/DocumentTable';
import { EditableField } from '../../document/EditableField';
import { paginateData, type PageLimitConfig } from '../../document/DynamicPaginatedTable';
import {
  type EndeksKaydi,
  donemEtiketi,
  formatTL,
  guncelleYiUfe,
} from './sonAlimFiyat.helpers';
import { SonAlimImzaAlani } from './SonAlimImzaAlani';

const EK_KOLONLARI: any[] = [
  { key: 'siraNo', label: 'Sıra', width: '4%', align: 'center' },
  { key: 'malzemeAdi', label: 'Malzeme Adı', width: '18%', align: 'left' },
  { key: 'birimi', label: 'Birim', width: '6%', align: 'center' },
  { key: 'miktar', label: 'Miktar', width: '6%', align: 'right' },
  { key: 'alimTarihi', label: 'Alım Tarihi', width: '9%', align: 'center' },
  { key: 'sonAlimBirimFiyat', label: 'Son Alım B.F. (TL)', width: '10%', align: 'right' },
  { key: 'alimEndeksi', label: 'Alım Ayı Endeksi', width: '14%', align: 'center' },
  { key: 'guncelEndeks', label: 'Güncel Endeks', width: '8%', align: 'center' },
  { key: 'katsayi', label: 'Katsayı', width: '7%', align: 'center' },
  { key: 'guncelBirimFiyat', label: 'Güncel B.F. (TL)', width: '9%', align: 'right' },
  { key: 'guncelToplam', label: 'Güncel Toplam (TL)', width: '9%', align: 'right' },
];

const notStili: React.CSSProperties = {
  fontSize: '8.5pt',
  color: '#444',
  borderLeft: '3px solid #cbd5e1',
  paddingLeft: '8px',
  lineHeight: 1.45,
};

interface SonAlimYiUfeEkiProps {
  data: Record<string, any>;
  kalemler: any[];
  endeksler: EndeksKaydi[];
  limits: PageLimitConfig;
  pageSize: 'A4' | 'A3';
  orientation: 'portrait' | 'landscape';
}

/** EK-1: Son alım fiyatlarının TÜİK Yİ-ÜFE ile güncel aya taşınmış hali */
export function SonAlimYiUfeEki({
  data,
  kalemler,
  endeksler,
  limits,
  pageSize,
  orientation,
}: SonAlimYiUfeEkiProps) {
  const sonuc = guncelleYiUfe(kalemler, endeksler, {
    yil: data.yiUfeHedefYil,
    ay: data.yiUfeHedefAy,
  });
  if (!sonuc.hedef || sonuc.satirlar.length === 0) return null;

  const hedefDonem = donemEtiketi(sonuc.hedef.yil, sonuc.hedef.ay);
  const artisYuzde =
    sonuc.sonAlimToplam > 0
      ? ((sonuc.guncelToplam - sonuc.sonAlimToplam) / sonuc.sonAlimToplam) * 100
      : 0;
  const pages = paginateData(sonuc.satirlar, limits);

  return (
    <>
      {pages.map((pageItems, pageIdx) => {
        const isFirst = pageIdx === 0;
        const isLast = pageIdx === pages.length - 1;
        return (
          <DocumentLayout
            key={`ek-${pageIdx}`}
            data={data}
            hideFooter={false}
            pageSize={pageSize}
            orientation={orientation}
            pageNumber={pageIdx + 1}
            totalPages={pages.length}
            hideHeader
          >
            {isFirst && (
              <>
                <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '4px' }}>
                  EK-1
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    fontSize: '12pt',
                    margin: '8px 0 12px 0',
                  }}
                >
                  TÜİK Yİ-ÜFE İLE GÜNCELLENMİŞ SON ALIM FİYATLARI ({hedefDonem.toLocaleUpperCase('tr-TR')})
                </div>
                <div style={notStili}>
                  <EditableField
                    name="yiUfeEkiAciklama"
                    value={
                      data.yiUfeEkiAciklama ||
                      `Son alım fiyatları, Türkiye İstatistik Kurumu (TÜİK) tarafından yayımlanan Yurt İçi Üretici Fiyat Endeksi (Yİ-ÜFE, 2003=100) kullanılarak alım tarihindeki ay endeksinden ${hedefDonem} endeksine taşınmıştır. Hesaplama: Güncel Fiyat = Son Alım Fiyatı × (Güncel Endeks / Alım Ayı Endeksi).`
                    }
                    placeholder="Ek açıklaması"
                  />
                </div>
              </>
            )}

            <DocumentTable
              columns={EK_KOLONLARI}
              data={pageItems}
              emptyMessage="Kayıt bulunamadı"
              striped={false}
              startIndex={isFirst ? 0 : limits.firstPage + (pageIdx - 1) * limits.middle}
            />

            {isLast && (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '24px',
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '9.5pt',
                    fontWeight: 'bold',
                    color: '#334155',
                  }}
                >
                  <span>Son Alım Toplamı: {formatTL(sonuc.sonAlimToplam)} TL</span>
                  <span>
                    Güncel Toplam ({hedefDonem}): {formatTL(sonuc.guncelToplam)} TL
                  </span>
                  <span>Değişim: %{artisYuzde.toFixed(2).replace('.', ',')}</span>
                </div>

                <div style={{ ...notStili, marginTop: '12px' }}>
                  Bu ek bilgi amaçlıdır; tutarlar cetveldeki birim fiyatlar üzerinden hesaplanmıştır.
                  {sonuc.eksikEndeksVar &&
                    ' Alım tarihi okunamayan veya endeksi bulunmayan kalemlerde (—) son alım fiyatı aynen alınmıştır.'}
                </div>

                <SonAlimImzaAlani data={data} />
              </>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
