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
          adSoyad={data.hazirlayanPersonelAdi}
          unvan={data.hazirlayanPersonelUnvan}
          nameField="hazirlayanPersonelAdi"
          unvanField="hazirlayanPersonelUnvan"
          rol="Hazırlayan"
        />
        {data.kontrolEdenPersonelAdi && (
          <ImzaKutusu
            adSoyad={data.kontrolEdenPersonelAdi}
            unvan={data.kontrolEdenPersonelUnvan}
            nameField="kontrolEdenPersonelAdi"
            unvanField="kontrolEdenPersonelUnvan"
            rol="Kontrol Eden"
          />
        )}
        <ImzaKutusu
          adSoyad={data.onaylayanPersonelAdi}
          unvan={data.onaylayanPersonelUnvan}
          nameField="onaylayanPersonelAdi"
          unvanField="onaylayanPersonelUnvan"
          rol="Onaylayan"
        />
      </div>
    </div>
  );
}
