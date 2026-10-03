import React from 'react'
import { lazyRoute } from '../../utils/lazyRoute'

export const routeComponents: Record<string, () => React.ReactElement> = {
  '/': lazyRoute(() => import('../../screens/dashboard/index2.screen')),
  '/projeler': lazyRoute(() => import('../../screens/projeler/index.screen')),
  '/hesaplama-araclari': lazyRoute(() => import('../../screens/araclar/HesaplamaAraclariScreen')),
  '/dosyalar': lazyRoute(() => import('../../screens/dosyalar/index.screen')),
  '/dosyalar/yeni': lazyRoute(
    () => import('../../screens/dosyalar/manage.screen'),
    'DosyaManageScreen'
  ),
  '/dosyalar/manage': lazyRoute(
    () => import('../../screens/dosyalar/manage.screen'),
    'DosyaManageScreen'
  ),
  '/devlet-ihale-2886': lazyRoute(() => import('../../screens/devlet-ihale-2886/index.screen')),
  '/firmalar': lazyRoute(() => import('../../screens/firmalar/index.screen')),
  '/personel': lazyRoute(() => import('../../screens/personel/index.screen')),
  '/sablonlar': lazyRoute(() => import('../../screens/sablonlar/index.screen')),
  '/form-builder': lazyRoute(() => import('../../screens/sablonlar/formBuilder.screen')),
  '/degiskenler': lazyRoute(() => import('../../screens/sablonlar/degiskenler.screen')),
  '/komisyonlar': lazyRoute(() => import('../../screens/komisyonlar/index.screen')),
  '/komisyonlar/detay': lazyRoute(() => import('../../screens/komisyonlar/detay.screen')),
  '/komisyon-gorevleri': lazyRoute(
    () => import('../../screens/komisyon-gorevleri/index.screen')
  ),
  '/takip': lazyRoute(() => import('../../screens/system/TakipScreen'), 'TakipScreen'),
  '/taslakyonetim': lazyRoute(() => import('../../screens/system/TaslakYoneticisi')),
  '/raporlar': lazyRoute(() => import('../../screens/raporlar/index.screen')),
  '/okaskod': lazyRoute(() => import('../../screens/okaskod/index.screen')),
  '/butcekod': lazyRoute(() => import('../../screens/butcekod/index.screen')),
  '/pozlar': lazyRoute(() => import('../../screens/pozlar/index.screen')),
  '/pozlar/yeni': lazyRoute(() => import('../../screens/pozlar/yeni.screen')),
  '/pozlar/detay': lazyRoute(() => import('../../screens/pozlar/detay.screen')),
  '/pozlar/toplu': lazyRoute(() => import('../../screens/pozlar/toplu.screen')),
  '/mevzuat': lazyRoute(() => import('../../screens/system/MevzuatScreen'), 'MevzuatScreen'),
  '/changelog': lazyRoute(() => import('../../screens/system/ChangelogScreen')),
  '/import': lazyRoute(() => import('../../screens/system/ImportScreen')),
  '/hizli-dosya-ekle': lazyRoute(() => import('../../screens/system/HizliDosyaEkle.screen')),
  '/ayarlar': lazyRoute(() => import('../../screens/ayarlar/index.screen')),
  '/tema': lazyRoute(() => import('../../screens/ayarlar/TemaScreen')),
  '/birimler': lazyRoute(() => import('../../screens/birimler/index.screen')),
  '/ambar': lazyRoute(() => import('../../screens/ambar/index.screen')),
  '/malzemeler': lazyRoute(() => import('../../screens/malzemeler/index.screen')),
  '/tasinirkod': lazyRoute(() => import('../../screens/tasinirkod/index.screen')),
  '/kurum': lazyRoute(() => import('../../screens/kurum/index.screen')),
  '/profil': lazyRoute(() => import('../../screens/profil/index.screen')),
  '/dosya/kunye': lazyRoute(() => import('../../screens/dosyalar/DosyaDataInspectorScreen')),
  '/dosya': lazyRoute(() => import('../../screens/system/TakipScreen'), 'TakipScreen'),
  '/dosya/hazirlik-ve-ihtiyac': lazyRoute(
    () => import('../../screens/dosya/SubScreens.screen'),
    'HazirlikVeIhtiyac'
  ),
  '/dosya/piyasa-fiyat-arastirmasi': lazyRoute(
    () => import('../../screens/dosya/SubScreens.screen'),
    'PiyasaFiyatArastirmasi'
  ),
  '/dosya/siparis-ve-sozlesme': lazyRoute(
    () => import('../../screens/dosya/SubScreens.screen'),
    'SiparisVeSozlesme'
  ),
  '/dosya/kabul-ve-odeme': lazyRoute(
    () => import('../../screens/dosya/SubScreens.screen'),
    'KabulVeOdeme'
  ),
  '/dosya/klasor-ve-kapaklar': lazyRoute(
    () => import('../../screens/dosya/SubScreens.screen'),
    'KlasorVeKapaklar'
  ),
  '/dosya/firmalar-maliyet/yaklasik': lazyRoute(
    () => import('../../screens/dosya/SubScreens.screen'),
    'YaklasikMaliyetCetveli'
  ),
  '/dosya/cikti-merkezi': lazyRoute(
    () => import('../../screens/dosya/CiktiMerkezi.screen'),
    'CiktiMerkeziScreen'
  ),
  '/dosya/veritabani': lazyRoute(
    () => import('../../screens/dosya/SubScreens.screen'),
    'DatabaseBrowserScreen'
  ),
  '/cikti-merkezi': lazyRoute(
    () => import('../../screens/dosya/CiktiMerkezi.screen'),
    'CiktiMerkeziScreen'
  ),
  '/dosya/fatura-ve-irsaliye': lazyRoute(
    () => import('../../screens/dosya/SubScreens.screen'),
    'FaturaVeIrsaliye'
  ),
  '/dosya/imzali-belgeler': lazyRoute(
    () => import('../../screens/dosya/SubScreens.screen'),
    'ImzaliBelgeler'
  ),
  '/olcubirimleri': lazyRoute(() => import('../../screens/olcubirimleri/index.screen')),
  '/malzemeler/yeni': lazyRoute(() => import('../../screens/malzemeler/yeni.screen')),
  '/hakedis': lazyRoute(() => import('../../screens/dashboard/HarcamaMerkeziScreen')),
  '/notlar': lazyRoute(() => import('../../screens/notlar/index.screen')),
  '/harcama-merkezi': lazyRoute(() => import('../../screens/dashboard/HarcamaMerkeziScreen')),
  '/dt-surec-akisi': lazyRoute(() => import('../../screens/system/DTSurecAkisiScreen')),
  '/surec-akisi': lazyRoute(() => import('../../screens/system/DTSurecAkisiScreen')),
  '/yardim': lazyRoute(() => import('../../screens/system/YardimScreen'))
}
