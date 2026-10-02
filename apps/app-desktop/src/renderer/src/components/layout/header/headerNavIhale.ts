import { NavigateFn } from '@tanstack/react-router'
import { HeaderMenu } from './header.types'

export function getIhaleMenus(navigate: NavigateFn, activeDosyaId: number | null): HeaderMenu[] {
  return [
    {
      name: 'İhale Süreçleri (KİK 19/21)',
      onClick: () => navigate({ to: '/harcama-merkezi' }),
      items: [
        {
          label: 'Açık İhale Süreçleri (KİK Md. 19)',
          onClick: () => navigate({ to: '/harcama-merkezi' })
        },
        {
          label: 'Pazarlık Usulü İhale (KİK Md. 21)',
          onClick: () => navigate({ to: '/harcama-merkezi' })
        },
        { label: 'İhale Hakediş & Harcama Raporları', onClick: () => navigate({ to: '/hakedis' }) },
        { divider: true },
        { label: 'Şablon & Kategori Yönetimi', onClick: () => navigate({ to: '/degiskenler' }) },
        { label: 'Taslak & Belge Havuzu', onClick: () => navigate({ to: '/taslakyonetim' }) }
      ]
    },
    ...(activeDosyaId
      ? [
          {
            name: 'İhale Süreç Adımları',
            items: [
              {
                label: '1. İhale Onay Belgesi & Şartnameler',
                onClick: () => navigate({ to: '/dosya/hazirlik-ve-ihtiyac' })
              },
              {
                label: '2. İhale İlanı & Davet Mektupları',
                onClick: () => navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' })
              },
              {
                label: '3. Teklif Değerlendirme & Komisyon Kararı',
                onClick: () => navigate({ to: '/dosya/siparis-ve-sozlesme' })
              },
              {
                label: '4. Sözleşme & Teminat İşlemleri',
                onClick: () => navigate({ to: '/dosya/kabul-ve-odeme' })
              },
              {
                label: '5. İhale Klasörü & Arşivleme',
                onClick: () => navigate({ to: '/dosya/klasor-ve-kapaklar' })
              }
            ]
          },
          {
            name: 'İhale İşlemleri',
            items: [
              { label: 'İhale Dosya Durumu & Takip', onClick: () => navigate({ to: '/takip' }) },
              {
                label: 'İhale Belge Çıktı Merkezi',
                onClick: () => navigate({ to: '/cikti-merkezi' })
              },
              { label: 'Hakediş & Ödeme Takibi', onClick: () => navigate({ to: '/hakedis' }) }
            ]
          }
        ]
      : []),
    {
      name: 'İhale Mevzuatı',
      items: [
        {
          label: '🧮 İhale & Kamu Maliyesi Hesaplama Araçları',
          onClick: (): Promise<void> => navigate({ to: '/hesaplama-araclari' })
        },
        {
          label: 'İhale Eşik Değerleri & Limitler',
          onClick: (): Promise<void> => navigate({ to: '/mevzuat' })
        },
        {
          label: 'KİK Standart Şablon & Formlar',
          onClick: () => navigate({ to: '/taslakyonetim' })
        },
        { label: 'Mevzuat & Genelgeler', onClick: () => navigate({ to: '/mevzuat' }) }
      ]
    }
  ]
}
