import React from 'react'
import DashboardScreen from '../../screens/dashboard/index2.screen'
import DosyalarScreen from '../../screens/dosyalar/index.screen'
import FirmalarScreen from '../../screens/firmalar/index.screen'
import PersonelScreen from '../../screens/personel/index.screen'
import { MevzuatScreen } from '../../screens/system/MevzuatScreen'
import ChangelogScreen from '../../screens/system/ChangelogScreen'
import ImportScreen from '../../screens/system/ImportScreen'
import HizliDosyaEkleScreen from '../../screens/system/HizliDosyaEkle.screen'
import HarcamaMerkeziScreen from '../../screens/dashboard/HarcamaMerkeziScreen'
import YardimScreen from '../../screens/system/YardimScreen'
import AyarlarScreen from '../../screens/ayarlar/index.screen'
import TemaScreen from '../../screens/ayarlar/TemaScreen'
import BirimlerScreen from '../../screens/birimler/index.screen'
import AmbarScreen from '../../screens/ambar/index.screen'
import MalzemelerScreen from '../../screens/malzemeler/index.screen'
import TasinirKodScreen from '../../screens/tasinirkod/index.screen'
import KurumScreen from '../../screens/kurum/index.screen'
import ProfilScreen from '../../screens/profil/index.screen'

import SablonlarScreen from '../../screens/sablonlar/index.screen'
import DegiskenlerScreen from '../../screens/sablonlar/degiskenler.screen'
import RaporlarScreen from '../../screens/raporlar/index.screen'
import OkasKodScreen from '../../screens/okaskod/index.screen'
import PozlarScreen from '../../screens/pozlar/index.screen'
import YeniPozScreen from '../../screens/pozlar/yeni.screen'
import PozDetayScreen from '../../screens/pozlar/detay.screen'
import TopluPozEkleScreen from '../../screens/pozlar/toplu.screen'
import OlcuBirimleriScreen from '../../screens/olcubirimleri/index.screen'
import YeniMalzemeScreen from '../../screens/malzemeler/yeni.screen'
import YeniDosyaScreen from '../../screens/dosyalar/yeni.screen'
import KomisyonlarScreen from '../../screens/komisyonlar/index.screen'
import KomisyonDetayScreen from '../../screens/komisyonlar/detay.screen'
import KomisyonGorevleriScreen from '../../screens/komisyon-gorevleri/index.screen'
import { TakipScreen } from '../../screens/system/TakipScreen'
import {
  HazirlikVeIhtiyac,
  PiyasaFiyatArastirmasi,
  SiparisVeSozlesme,
  KabulVeOdeme,
  KlasorVeKapaklar,
  YaklasikMaliyetCetveli,
  CiktiMerkeziScreen,
  CiktiMerkezi,
  DatabaseBrowserScreen
} from '../../screens/dosya/SubScreens.screen'

import TaslakYoneticisi from '../../screens/system/TaslakYoneticisi'
import DTSurecAkisiScreen from '../../screens/system/DTSurecAkisiScreen'

export const routeComponents: Record<string, React.ComponentType> = {
  '/': DashboardScreen,
  '/dosyalar': DosyalarScreen,
  '/dosyalar/yeni': YeniDosyaScreen,
  '/firmalar': FirmalarScreen,
  '/personel': PersonelScreen,
  '/sablonlar': SablonlarScreen,
  '/degiskenler': DegiskenlerScreen,
  '/komisyonlar': KomisyonlarScreen,
  '/komisyonlar/detay': KomisyonDetayScreen,
  '/komisyon-gorevleri': KomisyonGorevleriScreen,
  '/takip': TakipScreen,
  '/taslakyonetim': TaslakYoneticisi,
  '/raporlar': RaporlarScreen,
  '/okaskod': OkasKodScreen,
  '/pozlar': PozlarScreen,
  '/pozlar/yeni': YeniPozScreen,
  '/pozlar/detay': PozDetayScreen,
  '/pozlar/toplu': TopluPozEkleScreen,
  '/mevzuat': MevzuatScreen,
  '/changelog': ChangelogScreen,
  '/import': ImportScreen,
  '/hizli-dosya-ekle': HizliDosyaEkleScreen,
  '/ayarlar': AyarlarScreen,
  '/tema': TemaScreen,
  '/birimler': BirimlerScreen,
  '/ambar': AmbarScreen,
  '/malzemeler': MalzemelerScreen,
  '/tasinirkod': TasinirKodScreen,
  '/kurum': KurumScreen,
  '/profil': ProfilScreen,
  '/dosya': TakipScreen,
  '/dosya/hazirlik-ve-ihtiyac': HazirlikVeIhtiyac,
  '/dosya/piyasa-fiyat-arastirmasi': PiyasaFiyatArastirmasi,
  '/dosya/siparis-ve-sozlesme': SiparisVeSozlesme,
  '/dosya/kabul-ve-odeme': KabulVeOdeme,
  '/dosya/klasor-ve-kapaklar': KlasorVeKapaklar,
  '/dosya/firmalar-maliyet/yaklasik': YaklasikMaliyetCetveli,
  '/dosya/cikti-merkezi': CiktiMerkezi,
  '/dosya/veritabani': DatabaseBrowserScreen,
  '/cikti-merkezi': CiktiMerkeziScreen,
  '/olcubirimleri': OlcuBirimleriScreen,
  '/malzemeler/yeni': YeniMalzemeScreen,
  '/hakedis': HarcamaMerkeziScreen,
  '/harcama-merkezi': HarcamaMerkeziScreen,
  '/dt-surec-akisi': DTSurecAkisiScreen,
  '/surec-akisi': DTSurecAkisiScreen,
  '/yardim': YardimScreen
}
