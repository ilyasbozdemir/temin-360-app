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
  const hasOlur = data.olurYazisi !== false;

  const hazirlayanAd = data.hazirlayanPersonelAdi || data.hazirlayanAdi || data.personelAdi;
  const hazirlayanUnvan = data.hazirlayanPersonelUnvan || data.hazirlayanUnvan || data.personelUnvan;

  const kontrolAd = data.kontrolEdenPersonelAdi || data.kontrolEdenAdi;
  const kontrolUnvan = data.kontrolEdenPersonelUnvan || data.kontrolEdenUnvan;

  // Altta OLUR (Harcama Yetkilisi) bloğu olduğunda, üst sağdaki imza Harcama Yetkilisini mükerrer göstermemeli.
  // Birim Amiri / Kontrol Eden / Talep Eden personeli varsayılan olmalıdır.
  const sagAd = hasOlur
    ? (kontrolAd || data.talepEdenPersonelAdi || data.sunanPersonelAdi || data.birimAmiriAdi || '')
    : (data.onaylayanPersonelAdi || data.harcamaYetkilisiAdi || data.baskanAdi);

  const sagUnvan = hasOlur
    ? (kontrolUnvan || data.talepEdenPersonelUnvan || data.sunanPersonelUnvan || data.birimAmiriUnvan || '')
    : (data.onaylayanPersonelUnvan || data.harcamaYetkilisiUnvan || data.baskanUnvan);

  const sagRol = hasOlur
    ? (kontrolAd ? 'Kontrol Eden' : 'Birim Amiri')
    : 'Onaylayan';

  const sagNameField = hasOlur
    ? (kontrolAd ? 'kontrolEdenPersonelAdi' : 'talepEdenPersonelAdi')
    : 'onaylayanPersonelAdi';

  const sagUnvanField = hasOlur
    ? (kontrolUnvan ? 'kontrolEdenPersonelUnvan' : 'talepEdenPersonelUnvan')
    : 'onaylayanPersonelUnvan';

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
        {kontrolAd && (
          <ImzaKutusu
            adSoyad={kontrolAd}
            unvan={kontrolUnvan}
            nameField="kontrolEdenPersonelAdi"
            unvanField="kontrolEdenPersonelUnvan"
            rol="Kontrol Eden"
          />
        )}
        <ImzaKutusu
          adSoyad={sagAd}
          unvan={sagUnvan}
          nameField={sagNameField}
          unvanField={sagUnvanField}
          rol={sagRol}
        />
      </div>
    </div>
  );
}
