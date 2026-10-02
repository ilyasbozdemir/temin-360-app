import { NavigateFn } from '@tanstack/react-router'
import { HeaderMenu } from './header.types'

export function getSistemTanimlariMenu(
  navigate: NavigateFn,
  procurementMode: 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'
): HeaderMenu {
  if (procurementMode === 'dogrudan_temin') {
    return {
      name: 'Sistem Tanımları (DT)',
      items: [
        {
          label: '🛒 Kurum & Harcama Birimi Bilgileri',
          onClick: (): Promise<void> => navigate({ to: '/kurum' })
        },
        {
          label: '🛒 Doğrudan Temin Birimleri',
          onClick: (): Promise<void> => navigate({ to: '/birimler' })
        },
        {
          label: '🛒 Harcama Yetkilileri & Personel',
          onClick: (): Promise<void> => navigate({ to: '/personel' })
        },
        {
          label: '🛒 Piyasa Fiyat Araştırma Görevlileri',
          onClick: (): Promise<void> => navigate({ to: '/komisyonlar' })
        },
        {
          label: '🛒 Muayene & Kabul Komisyonları',
          onClick: (): Promise<void> => navigate({ to: '/komisyonlar' })
        },
        {
          label: '🛒 Görev & Yetki Tanımları',
          onClick: (): Promise<void> => navigate({ to: '/komisyon-gorevleri' })
        },
        { divider: true },
        {
          label: '🛒 Doğrudan Temin İstekli Firmaları',
          onClick: (): Promise<void> => navigate({ to: '/firmalar' })
        },
        {
          label: '📁 Yatırım ve Alım Projeleri',
          onClick: (): Promise<void> => navigate({ to: '/projeler' })
        },
        {
          label: '🛒 Mal / Hizmet / Tüketim Listesi',
          onClick: (): Promise<void> => navigate({ to: '/malzemeler' })
        },
        {
          label: '🛒 Taşınır Kodları & Ölçü Birimleri',
          onClick: (): Promise<void> => navigate({ to: '/tasinirkod' })
        },
        {
          label: '🛒 Ambar & Depo Tanımları',
          onClick: (): Promise<void> => navigate({ to: '/ambar' })
        },
        {
          label: '📈 Yİ-ÜFE Endeksleri (TÜİK & hakedis.org)',
          onClick: (): Promise<void> =>
            navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as Record<string, string> })
        }
      ]
    }
  }

  if (procurementMode === 'devlet_ihale_2886') {
    return {
      name: 'Sistem Tanımları (2886 Gelir)',
      items: [
        {
          label: '🏛️ İdare & Gelir/Kiralama Makamı Bilgileri',
          onClick: (): Promise<void> => navigate({ to: '/kurum' })
        },
        {
          label: '🏛️ İhale / Emlak & İstimlak Servisleri',
          onClick: (): Promise<void> => navigate({ to: '/birimler' })
        },
        {
          label: '🏛️ Encümen Üyeleri & Takdir Komisyonu',
          onClick: (): Promise<void> => navigate({ to: '/komisyonlar' })
        },
        {
          label: '🏛️ İhale İdare Yetkilileri & Raportörler',
          onClick: (): Promise<void> => navigate({ to: '/personel' })
        },
        {
          label: '🏛️ Encümen & Komisyon Görev Tanımları',
          onClick: (): Promise<void> => navigate({ to: '/komisyon-gorevleri' })
        },
        { divider: true },
        {
          label: '🏢 İstekli Firmalar & Şahıslar (Kiracı / Alıcı)',
          onClick: (): Promise<void> => navigate({ to: '/firmalar' })
        },
        {
          label: '🏢 Mal, Varlık & Taşınmaz Kataloğu',
          onClick: (): Promise<void> => navigate({ to: '/malzemeler' })
        },
        {
          label: '🏢 Taşınmaz / Taşınır Kodları',
          onClick: (): Promise<void> => navigate({ to: '/tasinirkod' })
        },
        {
          label: '📈 TÜİK Yİ-ÜFE Kira Artış Endeksleri',
          onClick: (): Promise<void> =>
            navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as Record<string, string> })
        }
      ]
    }
  }

  return {
    name: 'Sistem Tanımları (4734 İhale)',
    items: [
      {
        label: '🏛️ İdare & İhale Makamı Bilgileri',
        onClick: (): Promise<void> => navigate({ to: '/kurum' })
      },
      {
        label: '🏛️ İhale / İhale Kayıt Birimleri (EKAP)',
        onClick: (): Promise<void> => navigate({ to: '/birimler' })
      },
      {
        label: '🏛️ İhale Yetkilileri & Raportörler',
        onClick: (): Promise<void> => navigate({ to: '/personel' })
      },
      {
        label: '🏛️ İhale Komisyonları (KİK Md. 6 - Asıl/Yedek)',
        onClick: (): Promise<void> => navigate({ to: '/komisyonlar' })
      },
      {
        label: '🏛️ Muayene, Denetim ve Kabul Heyetleri',
        onClick: (): Promise<void> => navigate({ to: '/komisyonlar' })
      },
      {
        label: '🏛️ Komisyon Görev ve Yetki Matrisi',
        onClick: (): Promise<void> => navigate({ to: '/komisyon-gorevleri' })
      },
      { divider: true },
      {
        label: '🏛️ İhale İsteklileri & Müteahhit Firmalar',
        onClick: (): Promise<void> => navigate({ to: '/firmalar' })
      },
      {
        label: '🏛️ ÇŞB Birim Fiyat Pozları (Yapım & Onarım)',
        onClick: (): Promise<void> => navigate({ to: '/pozlar' })
      },
      {
        label: '🏛️ OKAS (Kamu Alımları Sözlüğü) Kodları',
        onClick: (): Promise<void> => navigate({ to: '/okaskod' })
      },
      {
        label: '🏛️ İhale Eşik Değerleri ve Limit Parametreleri',
        onClick: (): Promise<void> =>
          navigate({ to: '/mevzuat', search: { tab: 'limitler' } as Record<string, string> })
      },
      {
        label: '📈 Yİ-ÜFE Fiyat Farkı & Değerleme Endeksleri',
        onClick: (): Promise<void> =>
          navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as Record<string, string> })
      }
    ]
  }
}
