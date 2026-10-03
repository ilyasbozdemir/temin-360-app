import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter
} from '@tanstack/react-router'
import { PageWrapper } from './components/layout/PageWrapper'
import { APP_ROUTES } from './constants/routeConstants'
import { lazyRoute } from './utils/lazyRoute'

// Lazy-loaded Screens
const DashboardScreen = lazyRoute(() => import('./screens/dashboard/index2.screen'))
const HarcamaMerkeziScreen = lazyRoute(() => import('./screens/dashboard/HarcamaMerkeziScreen'))
const DosyalarScreen = lazyRoute(() => import('./screens/dosyalar/index.screen'))
const FirmalarScreen = lazyRoute(() => import('./screens/firmalar/index.screen'))
const MevzuatScreen = lazyRoute(() => import('./screens/system/MevzuatScreen'), 'MevzuatScreen')
const ChangelogScreen = lazyRoute(() => import('./screens/system/ChangelogScreen'))
const ImportScreen = lazyRoute(() => import('./screens/system/ImportScreen'))
const HizliDosyaEkleScreen = lazyRoute(() => import('./screens/system/HizliDosyaEkle.screen'))
const YardimScreen = lazyRoute(() => import('./screens/system/YardimScreen'))
const AyarlarScreen = lazyRoute(() => import('./screens/ayarlar/index.screen'))
const TemaScreen = lazyRoute(() => import('./screens/ayarlar/TemaScreen'))
const AmbarScreen = lazyRoute(() => import('./screens/ambar/index.screen'))
const BirimlerScreen = lazyRoute(() => import('./screens/birimler/index.screen'))
const PersonelScreen = lazyRoute(() => import('./screens/personel/index.screen'))
const KomisyonlarScreen = lazyRoute(() => import('./screens/komisyonlar/index.screen'))
const KomisyonGorevleriScreen = lazyRoute(
  () => import('./screens/komisyon-gorevleri/index.screen')
)
const MalzemelerScreen = lazyRoute(() => import('./screens/malzemeler/index.screen'))
const TasinirKodScreen = lazyRoute(() => import('./screens/tasinirkod/index.screen'))
const KurumScreen = lazyRoute(() => import('./screens/kurum/index.screen'))
const ProfilScreen = lazyRoute(() => import('./screens/profil/index.screen'))
const SablonlarScreen = lazyRoute(() => import('./screens/sablonlar/index.screen'))
const FormBuilderScreen = lazyRoute(() => import('./screens/sablonlar/formBuilder.screen'))
const DegiskenlerScreen = lazyRoute(() => import('./screens/sablonlar/degiskenler.screen'))
const RaporlarScreen = lazyRoute(() => import('./screens/raporlar/index.screen'))
const OkasKodScreen = lazyRoute(() => import('./screens/okaskod/index.screen'))
const ButceKodScreen = lazyRoute(() => import('./screens/butcekod/index.screen'))
const PozlarScreen = lazyRoute(() => import('./screens/pozlar/index.screen'))
const YeniPozScreen = lazyRoute(() => import('./screens/pozlar/yeni.screen'))
const PozDetayScreen = lazyRoute(() => import('./screens/pozlar/detay.screen'))
const TopluPozEkleScreen = lazyRoute(() => import('./screens/pozlar/toplu.screen'))
const OlcuBirimleriScreen = lazyRoute(() => import('./screens/olcubirimleri/index.screen'))
const YeniMalzemeScreen = lazyRoute(() => import('./screens/malzemeler/yeni.screen'))
const DosyaManageScreen = lazyRoute(
  () => import('./screens/dosyalar/manage.screen'),
  'DosyaManageScreen'
)
const KomisyonDetayScreen = lazyRoute(() => import('./screens/komisyonlar/detay.screen'))
const DosyaDataInspectorScreen = lazyRoute(
  () => import('./screens/dosyalar/DosyaDataInspectorScreen')
)
const NotlarVeGorevlerScreen = lazyRoute(() => import('./screens/notlar/index.screen'))
const PlaygroundScreen = lazyRoute(() => import('./screens/playground/index.screen'))
const ProjelerScreen = lazyRoute(() => import('./screens/projeler/index.screen'))
const DevletIhale2886Screen = lazyRoute(() => import('./screens/devlet-ihale-2886/index.screen'))
const HesaplamaAraclariScreen = lazyRoute(() => import('./screens/araclar/HesaplamaAraclariScreen'))
const DTSurecAkisiScreen = lazyRoute(() => import('./screens/system/DTSurecAkisiScreen'))
const TakipScreen = lazyRoute(() => import('./screens/system/TakipScreen'), 'TakipScreen')
const TaslakYoneticisi = lazyRoute(() => import('./screens/system/TaslakYoneticisi'))
const CiktiMerkeziScreen = lazyRoute(
  () => import('./screens/dosya/CiktiMerkezi.screen'),
  'CiktiMerkeziScreen'
)

// SubScreens
const HazirlikVeIhtiyac = lazyRoute(
  () => import('./screens/dosya/SubScreens.screen'),
  'HazirlikVeIhtiyac'
)
const PiyasaFiyatArastirmasi = lazyRoute(
  () => import('./screens/dosya/SubScreens.screen'),
  'PiyasaFiyatArastirmasi'
)
const SiparisVeSozlesme = lazyRoute(
  () => import('./screens/dosya/SubScreens.screen'),
  'SiparisVeSozlesme'
)
const KabulVeOdeme = lazyRoute(
  () => import('./screens/dosya/SubScreens.screen'),
  'KabulVeOdeme'
)
const KlasorVeKapaklar = lazyRoute(
  () => import('./screens/dosya/SubScreens.screen'),
  'KlasorVeKapaklar'
)
const YaklasikMaliyetCetveli = lazyRoute(
  () => import('./screens/dosya/SubScreens.screen'),
  'YaklasikMaliyetCetveli'
)
const FaturaVeIrsaliye = lazyRoute(
  () => import('./screens/dosya/SubScreens.screen'),
  'FaturaVeIrsaliye'
)
const ImzaliBelgeler = lazyRoute(
  () => import('./screens/dosya/SubScreens.screen'),
  'ImzaliBelgeler'
)

const rootRoute = createRootRoute({
  component: PageWrapper
})

const hesaplamaAraclariRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HESAPLAMA_ARACLARI,
  component: HesaplamaAraclariScreen
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DASHBOARD,
  component: DashboardScreen
})

const harcamaMerkeziRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HARCAMA_MERKEZI,
  component: HarcamaMerkeziScreen
})

const projelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PROJELER,
  component: ProjelerScreen
})

const devletIhale2886Route = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DEVLET_IHALE_2886,
  component: DevletIhale2886Screen
})

const dosyalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYALAR,
  component: DosyalarScreen
})

const yeniDosyaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YENI_DOSYA,
  component: DosyaManageScreen
})

const dosyaManageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYA_MANAGE,
  component: DosyaManageScreen
})

const firmalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.FIRMALAR,
  component: FirmalarScreen
})

const personelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PERSONEL,
  component: PersonelScreen
})

const sablonlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.SABLONLAR,
  component: SablonlarScreen
})

const formBuilderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.FORM_BUILDER,
  component: FormBuilderScreen
})

const degiskenlerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DEGISKENLER,
  component: DegiskenlerScreen
})

const komisyonlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYONLAR,
  component: KomisyonlarScreen
})

const komisyonDetayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_DETAY,
  component: KomisyonDetayScreen
})

const komisyonGorevleriRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_GOREVLERI,
  component: KomisyonGorevleriScreen
})

// Dynamic routes
const surecAkisiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.SUREC_AKISI,
  component: DTSurecAkisiScreen
})

const takipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TAKIP,
  component: TakipScreen
})

const taslakYonetimiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TASLAK_YONETIM,
  component: TaslakYoneticisi
})

const ciktiMerkeziDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.CIKTI_MERKEZI_DASHBOARD,
  component: CiktiMerkeziScreen
})

const raporlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.RAPORLAR,
  component: RaporlarScreen
})

const okasKodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.OKAS_KOD,
  component: OkasKodScreen
})

const butceKodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.BUTCE_KOD,
  component: ButceKodScreen
})

const pozlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.POZLAR,
  component: PozlarScreen
})

const yeniPozRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YENI_POZ,
  component: YeniPozScreen
})

const pozDetayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.POZ_DETAY,
  component: PozDetayScreen
})

const topluPozRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TOPLU_POZ_EKLE,
  component: TopluPozEkleScreen
})

const mevzuatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.MEVZUAT,
  component: MevzuatScreen
})

const changelogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.CHANGELOG,
  component: ChangelogScreen
})

const yardimRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YARDIM,
  component: YardimScreen
})

const importRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.IMPORT,
  component: ImportScreen
})

const hizliDosyaEkleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HIZLI_DOSYA_EKLE,
  component: HizliDosyaEkleScreen
})

const ayarlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.AYARLAR,
  component: AyarlarScreen
})

const temaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TEMA,
  component: TemaScreen
})

const birimlerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.BIRIMLER,
  component: BirimlerScreen
})

const ambarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.AMBAR,
  component: AmbarScreen
})

const malzemelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.MALZEMELER,
  component: MalzemelerScreen
})

const tasinirkodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TASINIR_KOD,
  component: TasinirKodScreen
})

const kurumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KURUM,
  component: KurumScreen
})

const profilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PROFIL,
  component: ProfilScreen
})

const dosyaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYA_DETAY,
  component: TakipScreen
})

const dosyaKunyeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYA_KUNYE,
  component: DosyaDataInspectorScreen
})

// Dosya Aşamaları
const hazirlikVeIhtiyacRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HAZIRLIK_VE_IHTIYAC,
  component: HazirlikVeIhtiyac
})

const piyasaFiyatArastirmasiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI,
  component: PiyasaFiyatArastirmasi
})

const siparisVeSozlesmeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.SIPARIS_VE_SOZLESME,
  component: SiparisVeSozlesme
})

const kabulVeOdemeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KABUL_VE_ODEME,
  component: KabulVeOdeme
})

const klasorVeKapaklarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KLASOR_VE_KAPAKLAR,
  component: KlasorVeKapaklar
})

// Diğer Alt Modüller
const yaklasikMaliyetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YAKLASIK_MALIYET,
  component: YaklasikMaliyetCetveli
})

const ciktiMerkeziRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYA_CIKTI_MERKEZI,
  component: CiktiMerkeziScreen
})

const olcubirimleriRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.OLCU_BIRIMLERI,
  component: OlcuBirimleriScreen
})

const yeniMalzemeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YENI_MALZEME,
  component: YeniMalzemeScreen
})

const faturaVeIrsaliyeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.FATURA_VE_IRSALIYE,
  component: FaturaVeIrsaliye
})

const imzaliBelgelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.IMZALI_BELGELER,
  component: ImzaliBelgeler
})

const hakedisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HAKEDIS,
  component: HarcamaMerkeziScreen
})

const notlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.NOTLAR,
  component: NotlarVeGorevlerScreen
})

const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PLAYGROUND,
  component: PlaygroundScreen
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  harcamaMerkeziRoute,
  projelerRoute,
  devletIhale2886Route,
  dosyalarRoute,
  yeniDosyaRoute,
  dosyaManageRoute,
  firmalarRoute,
  personelRoute,
  sablonlarRoute,
  formBuilderRoute,
  degiskenlerRoute,
  komisyonlarRoute,
  komisyonDetayRoute,
  komisyonGorevleriRoute,
  takipRoute,
  taslakYonetimiRoute,
  ciktiMerkeziDashboardRoute,
  raporlarRoute,
  okasKodRoute,
  butceKodRoute,
  pozlarRoute,
  yeniPozRoute,
  pozDetayRoute,
  topluPozRoute,
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
  dosyaKunyeRoute,
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
  notlarRoute,
  playgroundRoute,
  surecAkisiRoute,
  yardimRoute,
  hesaplamaAraclariRoute
])

const hashHistory = createHashHistory()

export const router = createRouter({
  routeTree,
  history: hashHistory
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
