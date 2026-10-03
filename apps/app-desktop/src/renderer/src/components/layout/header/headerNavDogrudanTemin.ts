import { NavigateFn } from '@tanstack/react-router'
import { HeaderMenu } from './header.types'

export function getDogrudanTeminMenus(
  navigate: NavigateFn,
  activeDosyaId: number | null
): HeaderMenu[] {
  return [
    {
      name: 'Doğrudan Temin (KİK 22)',
      onClick: (): Promise<void> => navigate({ to: '/dosyalar' }),
      items: [
        {
          label: 'Tüm Doğrudan Temin Dosyaları',
          onClick: (): Promise<void> => navigate({ to: '/dosyalar' })
        },
        {
          label: '📁 Proje Yönetimi & Yatırımlar',
          onClick: (): Promise<void> => navigate({ to: '/projeler' })
        },
        {
          label: 'Yeni Doğrudan Temin Dosyası',
          onClick: (): Promise<void> => navigate({ to: '/dosyalar/yeni' })
        },
        {
          label: 'Hızlı Dosya Ekle / Güncelle',
          onClick: (): Promise<void> => navigate({ to: '/hizli-dosya-ekle' })
        },
        {
          label: 'Süreç Akış Haritası (Beta)',
          onClick: (): Promise<void> => navigate({ to: '/surec-akisi' })
        },
        {
          label: '📊 Harcama & Sayıştay Raporları',
          onClick: (): Promise<void> => navigate({ to: '/raporlar' })
        }
      ]
    },
    ...(activeDosyaId
      ? [
          {
            name: 'Süreç Yönetimi',
            items: [
              {
                label: 'Süreç Takip & Durum Paneli',
                onClick: (): Promise<void> => navigate({ to: '/takip' })
              },
              {
                label: '🧭 Süreç Akış Haritası (Beta - Tablar)',
                onClick: (): Promise<void> => navigate({ to: '/surec-akisi' })
              },
              {
                label: 'Belge Çıktı Merkezi',
                onClick: (): Promise<void> => navigate({ to: '/cikti-merkezi' })
              },
              {
                label: 'Hızlı Dosya Ekle / Güncelle',
                onClick: (): Promise<void> => navigate({ to: '/hizli-dosya-ekle' })
              },
              {
                label: 'Şablon & Taslak Yöneticisi',
                onClick: (): Promise<void> => navigate({ to: '/taslakyonetim' })
              },
              {
                label: '📝 Dosya Notları & Yapılacaklar (To-Do)',
                onClick: (): Promise<void> => navigate({ to: '/notlar' })
              }
            ]
          },
          {
            name: 'Adım Adım Süreç',
            items: [
              {
                label: '1. İhtiyaç Listesi & Maliyet & Onay',
                onClick: (): Promise<void> => navigate({ to: '/dosya/hazirlik-ve-ihtiyac' })
              },
              {
                label: '2. Piyasa Fiyat Araştırması',
                onClick: (): Promise<void> => navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' })
              },
              {
                label: '3. Sipariş & Sözleşme',
                onClick: (): Promise<void> => navigate({ to: '/dosya/siparis-ve-sozlesme' })
              },
              {
                label: '4. Muayene & Kabul & Ödeme İşlemleri',
                onClick: (): Promise<void> => navigate({ to: '/dosya/kabul-ve-odeme' })
              },
              {
                label: '5. Klasör & Kapaklar',
                onClick: (): Promise<void> => navigate({ to: '/dosya/klasor-ve-kapaklar' })
              }
            ]
          }
        ]
      : []),
    {
      name: 'Mevzuat & Limitler',
      items: [
        {
          label: '🧮 İhale & Kamu Maliyesi Hesaplama Araçları',
          onClick: (): Promise<void> => navigate({ to: '/hesaplama-araclari' })
        },
        {
          label: '4734 Sayılı Kamu İhale Kanunu (KİK Md. 22)',
          onClick: (): Promise<void> => navigate({ to: '/mevzuat' })
        },
        {
          label: 'Doğrudan Temin Parasal Limitleri (22/a, 22/d)',
          onClick: (): Promise<void> =>
            navigate({ to: '/mevzuat', search: { tab: 'limitler' } as Record<string, string> })
        },
        {
          label: 'TÜİK Yİ-ÜFE Endeksleri & Değerleme',
          onClick: (): Promise<void> =>
            navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as Record<string, string> })
        }
      ]
    }
  ]
}
