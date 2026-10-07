import React from 'react';
import { PersonelCard } from '../../document/ApprovalSignature';

interface ImzaKutusuProps {
  adSoyad?: string;
  unvan?: string;
  nameField: string;
  unvanField: string;
  rol: string;
}

function ImzaKutusu({ adSoyad, unvan, nameField, unvanField, rol }: ImzaKutusuProps) {
  return (
    <div style={{ textAlign: 'center', minWidth: '160px' }}>
      <PersonelCard
        adSoyad={adSoyad}
        unvan={unvan}
        align="center"
        marginTop={0}
        marginBottom={4}
        nameField={nameField}
        unvanField={unvanField}
      />
      <div style={{ fontSize: '8pt', color: '#666' }}>{rol}</div>
    </div>
  );
}

/** Hazırlayan / (Kontrol Eden) / Onaylayan imza satırı */
export function SonAlimImzaAlani({ data }: { data: Record<string, any> }) {
  const hazirlayanAd = data.hazirlayanPersonelAdi || data.hazirlayanAdi || data.personelAdi;
  const hazirlayanUnvan = data.hazirlayanPersonelUnvan || data.hazirlayanUnvan || data.personelUnvan;

  const kontrolAd = data.kontrolEdenPersonelAdi || data.kontrolEdenAdi;
  const kontrolUnvan = data.kontrolEdenPersonelUnvan || data.kontrolEdenUnvan;

  const onaylayanAd = data.onaylayanPersonelAdi || data.harcamaYetkilisiAdi || data.baskanAdi;
  const onaylayanUnvan = data.onaylayanPersonelUnvan || data.harcamaYetkilisiUnvan || data.baskanUnvan;

  return (
    <div style={{ marginTop: '30px', pageBreakInside: 'avoid' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <ImzaKutusu
          adSoyad={hazirlayanAd}
          unvan={hazirlayanUnvan}
          nameField="hazirlayanPersonelAdi"
          unvanField="hazirlayanPersonelUnvan"
          rol="Hazırlayan"
        />
        {(kontrolAd || data.kontrolEdenPersonelAdi) && (
          <ImzaKutusu
            adSoyad={kontrolAd}
            unvan={kontrolUnvan}
            nameField="kontrolEdenPersonelAdi"
            unvanField="kontrolEdenPersonelUnvan"
            rol="Kontrol Eden"
          />
        )}
        <ImzaKutusu
          adSoyad={onaylayanAd}
          unvan={onaylayanUnvan}
          nameField="onaylayanPersonelAdi"
          unvanField="onaylayanPersonelUnvan"
          rol="Onaylayan"
        />
      </div>
    </div>
  );
}
