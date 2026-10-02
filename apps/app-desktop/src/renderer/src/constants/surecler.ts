import {
  PackageSearch,
  FileText,
  FileCheck,
  Users,
  Compass,
  CreditCard,
  Printer,
  FolderTree
} from 'lucide-react'
import { APP_ROUTES } from './routeConstants'

export interface ProcessStage {
  name: string
  path: string
  icon: any
  stage: number
  hideFromToolbar?: boolean
}

export const subPagesMapping: ProcessStage[] = [
  {
    name: 'İhtiyaç Listesi & Maliyet & Onay',
    path: APP_ROUTES.HAZIRLIK_VE_IHTIYAC,
    icon: PackageSearch,
    stage: 1
  },
  {
    name: 'Teklifler & Piyasa Fiyat Araştırması',
    path: APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI,
    icon: PackageSearch,
    stage: 2
  },
  { name: 'Yaklaşık Maliyet', path: APP_ROUTES.YAKLASIK_MALIYET, icon: Compass, stage: 2 },
  {
    name: 'Yüklenici & Sipariş İşlemleri',
    path: APP_ROUTES.SIPARIS_VE_SOZLESME,
    icon: FileCheck,
    stage: 3
  },
  {
    name: 'Muayene & Kabul & Ödeme İşlemleri',
    path: APP_ROUTES.KABUL_VE_ODEME,
    icon: CreditCard,
    stage: 4
  },
  { name: 'Fatura & İrsaliye', path: APP_ROUTES.FATURA_VE_IRSALIYE, icon: CreditCard, stage: 4 },
  { name: 'Klasör & Kapaklar', path: APP_ROUTES.KLASOR_VE_KAPAKLAR, icon: FolderTree, stage: 5 },
  { name: 'İmzalı Belgeler', path: APP_ROUTES.IMZALI_BELGELER, icon: FileCheck, stage: 5 }
]
