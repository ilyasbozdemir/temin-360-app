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

  const boxes: React.ReactNode[] = [];

  const hasHazirlayan = Boolean(hazirlayanAd || hazirlayanUnvan);
  if (hasHazirlayan) {
    boxes.push(
      <ImzaKutusu
        key="hazirlayan"
        adSoyad={hazirlayanAd}
        unvan={hazirlayanUnvan}
        nameField="hazirlayanPersonelAdi"
        unvanField="hazirlayanPersonelUnvan"
        rol="Hazırlayan"
      />
    );
  }

  if (kontrolAd || kontrolUnvan) {
    boxes.push(
      <ImzaKutusu
        key="kontrol"
        adSoyad={kontrolAd}
        unvan={kontrolUnvan}
        nameField="kontrolEdenPersonelAdi"
        unvanField="kontrolEdenPersonelUnvan"
        rol="Kontrol Eden"
      />
    );
  }

  const hasSag = Boolean(sagAd || sagUnvan);
  if (hasSag) {
    boxes.push(
      <ImzaKutusu
        key="sag"
        adSoyad={sagAd}
        unvan={sagUnvan}
        nameField={sagNameField}
        unvanField={sagUnvanField}
        rol={sagRol}
      />
    );
  }

  // Varsayılan görünüm: Eğer özel kisi yoksa Hazırlayan ve Amir/Onaylayan kutularını göster
  if (boxes.length === 0) {
    boxes.push(
      <ImzaKutusu
        key="hazirlayan"
        adSoyad={hazirlayanAd}
        unvan={hazirlayanUnvan}
        nameField="hazirlayanPersonelAdi"
        unvanField="hazirlayanPersonelUnvan"
        rol="Hazırlayan"
      />,
      <ImzaKutusu
        key="sag"
        adSoyad={sagAd}
        unvan={sagUnvan}
        nameField={sagNameField}
        unvanField={sagUnvanField}
        rol={sagRol}
      />
    );
  }

  const justifyContent =
    boxes.length === 1
      ? 'flex-end'
      : 'space-between';

  return (
    <div style={{ marginTop: '30px', pageBreakInside: 'avoid' }}>
      <div
        style={{
          display: 'flex',
          justifyContent,
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        {boxes}
      </div>
    </div>
  );
}
