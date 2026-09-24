import { useEffect } from 'react'

export function useDocumentTitle(pathname: string): void {
  useEffect(() => {
    let title = 'TEMİN 360'

    if (pathname === '/') title += ' — Gösterge Paneli'
    else if (pathname.startsWith('/dosyalar')) title += ' — Doğrudan Teminler'
    else if (pathname.startsWith('/firmalar')) title += ' — Firmalar'
    else if (pathname.startsWith('/personel')) title += ' — Personel'
    else if (pathname.startsWith('/mevzuat')) title += ' — Mevzuat & Limitler'
    else if (pathname.startsWith('/ayarlar')) title += ' — Ayarlar'
    else if (pathname.startsWith('/birimler')) title += ' — Birim Yönetimi'
    else if (pathname.startsWith('/ambar')) title += ' - Ambar Tanımları'
    else if (pathname.startsWith('/olcubirimleri')) title += ' - Ölçü Birimleri'
    else if (pathname.startsWith('/malzemeler/yeni')) {
      title += ' - Yeni Kayıt (Mal/Hizmet/Yapım İşi)'
    } else if (pathname.startsWith('/malzemeler')) {
      title += ' - Mal, Hizmet & Yapım Kataloğu'
    } else if (pathname.startsWith('/kurum')) title += ' - Kurum Bilgileri'
    else if (pathname.startsWith('/profil')) title += ' — Kullanıcı Profili'
    else if (pathname.startsWith('/hakedis')) {
      title += ' — Hakediş & Süreç Yönetimi (Beta)'
    } else if (pathname.startsWith('/notlar')) {
      title += ' — Notlar & Yapılacaklar (To-Do)'
    }

    document.title = title
  }, [pathname])
}
