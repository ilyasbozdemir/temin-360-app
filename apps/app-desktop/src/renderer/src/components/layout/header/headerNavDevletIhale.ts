import { NavigateFn } from '@tanstack/react-router'
import { HeaderMenu } from './header.types'

export function getDevletIhale2886Menus(navigate: NavigateFn): HeaderMenu[] {
  return [
    {
      name: '2886 Devlet İhale',
      onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' }),
      items: [
        {
          label: '📁 2886 İhale Dosyaları Yönetimi (Liste / Ekle / Sil)',
          onClick: (): Promise<void> =>
            navigate({
              to: '/devlet-ihale-2886',
              search: { tab: 'dosyalar' } as Record<string, string>
            })
        },
        {
          label: '🏛️ 2886 Satış & Kiralama Çalışma Masası',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '➕ Yeni Satış / Kiralama Dosyası Başlat',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '🏢 Taşınmaz & Kiralama Portföyü',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        { divider: true },
        {
          label: '📊 Taşınmaz & Muhammen Bedel Tespiti',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '⚖️ İhale Usulü Seçimi (Md. 45 / 36 / 51)',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '📑 2886 Süreç ve İlan Evrakları (16 Evrak)',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '🔨 Açık Artırma & Teklif Turları',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '💰 Kira Artış & Satış Taksit Planı (5018 Gelir)',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        }
      ]
    },
    {
      name: '2886 Süreç Adımları',
      items: [
        {
          label: '1. Taşınmaz & Muhammen Bedel Tespiti',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '2. İhale Usulü & Karar Matrisi (Md. 45 / 36 / 51)',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '3. İhale Günü & Açık Artırma / Teklifler',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '4. 2886 Şartname, İlan & Süreç Evrakları',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        },
        {
          label: '5. Kira Artış & 5018 Gelir Tahsilat Takibi',
          onClick: (): Promise<void> => navigate({ to: '/devlet-ihale-2886' })
        }
      ]
    },
    {
      name: '2886 Mevzuatı',
      items: [
        {
          label: '2886 Sayılı Devlet İhale Kanunu',
          onClick: (): Promise<void> => navigate({ to: '/mevzuat' })
        },
        {
          label: 'Kıymet Takdir ve Encümen Esasları',
          onClick: (): Promise<void> => navigate({ to: '/mevzuat' })
        },
        {
          label: 'Taşınmaz Kiralama ve Satış Genelgeleri',
          onClick: (): Promise<void> => navigate({ to: '/mevzuat' })
        },
        {
          label: '📈 Yİ-ÜFE Kira Artış Oranları & Endeksler',
          onClick: (): Promise<void> =>
            navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as Record<string, string> })
        }
      ]
    }
  ]
}
