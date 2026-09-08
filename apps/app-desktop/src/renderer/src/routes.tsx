import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { PageWrapper } from "./components/layout/PageWrapper";
import { APP_ROUTES } from "./constants/routeConstants";
import DashboardScreen from "./screens/dashboard/index2.screen";
import HarcamaMerkeziScreen from "./screens/dashboard/HarcamaMerkeziScreen";
import DosyalarScreen from "./screens/dosyalar/index.screen";
import FirmalarScreen from "./screens/firmalar/index.screen";

import { MevzuatScreen } from "./screens/system/MevzuatScreen";
import ChangelogScreen from "./screens/system/ChangelogScreen";
import ImportScreen from "./screens/system/ImportScreen";
import HizliDosyaEkleScreen from "./screens/system/HizliDosyaEkle.screen";
import YardimScreen from "./screens/system/YardimScreen";
import AyarlarScreen from "./screens/ayarlar/index.screen";
import TemaScreen from "./screens/ayarlar/TemaScreen";

import AmbarScreen from "./screens/ambar/index.screen";
import MalzemelerScreen from "./screens/malzemeler/index.screen";
import TasinirKodScreen from "./screens/tasinirkod/index.screen";
import KurumScreen from "./screens/kurum/index.screen";
import ProfilScreen from "./screens/profil/index.screen";

import SablonlarScreen from "./screens/sablonlar/index.screen";
import DegiskenlerScreen from "./screens/sablonlar/degiskenler.screen";
import RaporlarScreen from "./screens/raporlar/index.screen";
import OkasKodScreen from "./screens/okaskod/index.screen";
import PozlarScreen from "./screens/pozlar/index.screen";
import YeniPozScreen from "./screens/pozlar/yeni.screen";
import PozDetayScreen from "./screens/pozlar/detay.screen";
import OlcuBirimleriScreen from "./screens/olcubirimleri/index.screen";
import YeniMalzemeScreen from "./screens/malzemeler/yeni.screen";
import YeniDosyaScreen from "./screens/dosyalar/yeni.screen";
import KomisyonDetayScreen from "./screens/komisyonlar/detay.screen";

const rootRoute = createRootRoute({
  component: PageWrapper,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DASHBOARD,
  component: DashboardScreen,
});

const harcamaMerkeziRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HARCAMA_MERKEZI,
  component: HarcamaMerkeziScreen,
});

const dosyalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYALAR,
  component: DosyalarScreen,
});

const yeniDosyaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YENI_DOSYA,
  component: YeniDosyaScreen,
});

const firmalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.FIRMALAR,
  component: FirmalarScreen,
});

const personelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PERSONEL,
  component: KurumScreen,
});

const sablonlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.SABLONLAR,
  component: SablonlarScreen,
});

const degiskenlerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DEGISKENLER,
  component: DegiskenlerScreen,
});

const komisyonlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYONLAR,
  component: KurumScreen,
});

const komisyonDetayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_DETAY,
  component: KomisyonDetayScreen,
});

const komisyonGorevleriRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_GOREVLERI,
  component: KurumScreen,
});

import { TakipScreen } from "./screens/system/TakipScreen";
import { CiktiMerkeziScreen } from "./screens/dosya/CiktiMerkezi.screen";
import TaslakYoneticisi from "./screens/system/TaslakYoneticisi";
import DTSurecAkisiScreen from "./screens/system/DTSurecAkisiScreen";

// Dynamic routes
const surecAkisiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.SUREC_AKISI,
  component: DTSurecAkisiScreen,
});
const takipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TAKIP,
  component: TakipScreen,
});

const taslakYonetimiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TASLAK_YONETIM,
  component: TaslakYoneticisi,
});

const ciktiMerkeziDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.CIKTI_MERKEZI_DASHBOARD,
  component: CiktiMerkeziScreen,
});

const raporlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.RAPORLAR,
  component: RaporlarScreen,
});

const okasKodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.OKAS_KOD,
  component: OkasKodScreen,
});

const pozlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.POZLAR,
  component: PozlarScreen,
});

const yeniPozRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YENI_POZ,
  component: YeniPozScreen,
});

const pozDetayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.POZ_DETAY,
  component: PozDetayScreen,
});

const mevzuatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.MEVZUAT,
  component: MevzuatScreen,
});

const changelogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.CHANGELOG,
  component: ChangelogScreen,
});

const yardimRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YARDIM,
  component: YardimScreen,
});

const importRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.IMPORT,
  component: ImportScreen,
});

const hizliDosyaEkleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HIZLI_DOSYA_EKLE,
  component: HizliDosyaEkleScreen,
});

const ayarlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.AYARLAR,
  component: AyarlarScreen,
});

const temaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TEMA,
  component: TemaScreen,
});

const birimlerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.BIRIMLER,
  component: KurumScreen,
});

const ambarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.AMBAR,
  component: AmbarScreen,
});

const malzemelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.MALZEMELER,
  component: MalzemelerScreen,
});

const tasinirkodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TASINIR_KOD,
  component: TasinirKodScreen,
});

const kurumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KURUM,
  component: KurumScreen,
});

import {
  CiktiMerkezi,
  FaturaVeIrsaliye,
  HazirlikVeIhtiyac,
  ImzaliBelgeler,
  KabulVeOdeme,
  KlasorVeKapaklar,
  PiyasaFiyatArastirmasi,
  SiparisVeSozlesme,
  YaklasikMaliyetCetveli,
} from "./screens/dosya/SubScreens.screen";

const profilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PROFIL,
  component: ProfilScreen,
});

const dosyaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYA_DETAY,
  component: TakipScreen,
});

// Dosya Aşamaları
const hazirlikVeIhtiyacRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HAZIRLIK_VE_IHTIYAC,
  component: HazirlikVeIhtiyac,
});

const piyasaFiyatArastirmasiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI,
  component: PiyasaFiyatArastirmasi,
});

const siparisVeSozlesmeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.SIPARIS_VE_SOZLESME,
  component: SiparisVeSozlesme,
});

const kabulVeOdemeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KABUL_VE_ODEME,
  component: KabulVeOdeme,
});

const klasorVeKapaklarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KLASOR_VE_KAPAKLAR,
  component: KlasorVeKapaklar,
});

// Diğer Alt Modüller
const yaklasikMaliyetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YAKLASIK_MALIYET,
  component: YaklasikMaliyetCetveli,
});

const ciktiMerkeziRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYA_CIKTI_MERKEZI,
  component: CiktiMerkezi,
});

const olcubirimleriRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.OLCU_BIRIMLERI,
  component: OlcuBirimleriScreen,
});

const yeniMalzemeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YENI_MALZEME,
  component: YeniMalzemeScreen,
});

const faturaVeIrsaliyeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.FATURA_VE_IRSALIYE,
  component: FaturaVeIrsaliye,
});

const imzaliBelgelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.IMZALI_BELGELER,
  component: ImzaliBelgeler,
});

const hakedisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HAKEDIS,
  component: HarcamaMerkeziScreen,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  harcamaMerkeziRoute,
  dosyalarRoute,
  yeniDosyaRoute,
  firmalarRoute,
  personelRoute,
  sablonlarRoute,
  degiskenlerRoute,
  komisyonlarRoute,
  komisyonDetayRoute,
  komisyonGorevleriRoute,
  takipRoute,
  taslakYonetimiRoute,
  ciktiMerkeziDashboardRoute,
  raporlarRoute,
  okasKodRoute,
  pozlarRoute,
  yeniPozRoute,
  pozDetayRoute,
  mevzuatRoute,
  changelogRoute,
  importRoute,
  hizliDosyaEkleRoute,
  ayarlarRoute,
  temaRoute,
  birimlerRoute,
  ambarRoute,
  malzemelerRoute,
  yeniMalzemeRoute,
  tasinirkodRoute,
  olcubirimleriRoute,
  kurumRoute,
  profilRoute,
  dosyaRoute,
  hazirlikVeIhtiyacRoute,
  piyasaFiyatArastirmasiRoute,
  siparisVeSozlesmeRoute,
  kabulVeOdemeRoute,
  klasorVeKapaklarRoute,
  yaklasikMaliyetRoute,
  ciktiMerkeziRoute,
  faturaVeIrsaliyeRoute,
  imzaliBelgelerRoute,
  hakedisRoute,
  surecAkisiRoute,
  yardimRoute,
]);

const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
