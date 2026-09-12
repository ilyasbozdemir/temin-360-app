/**
 * TEMPLATES/CONFIG/INDEX.TS
 *
 * Merkezi şablon kaydı ve başlatma
 * Tüm şablonlar burada TemplateManager'a kaydedilir
 */

import { templateManager, TemplateConfig } from '../utils/TemplateManager'
import { GLOBAL_THEME } from './theme.config'
import { IhtiyacListesiSchema } from '../schemas/ihtiyac-listesi.schema'
import { registerLegacyMappings } from '../utils/legacy-migration'
import { z } from 'zod'

/**
 * ==========================================
 * FASE 1: YENİ ŞABLONLAR (Zod ile)
 * ==========================================
 */

/**
 * 1. İhtiyaç Listesi (YAPILDI)
 */
const IhtiyacListesiConfig: TemplateConfig = {
  id: 'ihtiyac-listesi',
  name: 'İhtiyaç Listesi',
  category: 'İhtiyaç Listesi & Maliyet & Onay',
  version: '2.0',
  schema: IhtiyacListesiSchema,
  htmlPath: 'templates/html/ihtiyac-listesi.html',
  metadata: {
    pageSize: 'A4',
    margins: {
      top: GLOBAL_THEME.page.margins.top,
      right: GLOBAL_THEME.page.margins.right,
      bottom: GLOBAL_THEME.page.margins.bottom,
      left: GLOBAL_THEME.page.margins.left
    },
    locale: 'tr-TR'
  }
}

/**
 * ==========================================
 * FASE 2: ESKI ŞABLONLAR (Placeholder - z.record())
 * Her birinin schema yazılacak
 * ==========================================
 */

const LuzumMuzekkeresiConfig: TemplateConfig = {
  id: 'luzum-muzekkeresi',
  name: 'Lüzum Müzekkeresi',
  category: 'İhtiyaç Listesi & Maliyet & Onay',
  version: '1.5',
  schema: z.record(z.string(), z.any()), // TODO: Özel schema yazılacak
  htmlPath: 'templates/html/luzum-muzekkeresi.html',
  metadata: {
    pageSize: 'A4',
    margins: GLOBAL_THEME.page.margins,
    locale: 'tr-TR'
  }
}

const HarcamaTalimatiConfig: TemplateConfig = {
  id: 'harcama-talimati',
  name: 'Harcama Talimatı',
  category: 'Harcama',
  version: '1.0',
  schema: z.record(z.string(), z.any()), // TODO: Özel schema yazılacak
  htmlPath: 'templates/html/harcama-talimati.html',
  metadata: {
    pageSize: 'A4',
    margins: GLOBAL_THEME.page.margins,
    locale: 'tr-TR'
  }
}

/**
 * ==========================================
 * BAŞLATMA FONKSIYONU
 * ==========================================
 */

/**
 * Tüm şablonları TemplateManager'a kayıt et
 *
 * KULLANIM: App başlangıcında (main.tsx veya App.tsx):
 * ```typescript
 * import { initializeTemplates } from './templates/config'
 *
 * initializeTemplates()
 * ```
 */
export function initializeTemplates(): void {
  console.log('🚀 Şablonlar başlatılıyor...')

  // YENİ ŞABLONLAR
  templateManager.registerTemplate(IhtiyacListesiConfig)
  console.log('✅ İhtiyaç Listesi kaydedildi')

  templateManager.registerTemplate(LuzumMuzekkeresiConfig)
  console.log('✅ Lüzum Müzekkeresi kaydedildi')

  templateManager.registerTemplate(HarcamaTalimatiConfig)
  console.log('✅ Harcama Talimatı kaydedildi')

  // LEGACY MAPPINGS (Eski sistemle uyum)
  registerLegacyMappings(templateManager)
  console.log('✅ Legacy mappings kaydedildi')

  // RAPOR
  const info = templateManager.info()
  console.log(
    `TEMPLATE ENGINE BAŞLATILDI\n` +
      `Toplam Şablon: ${info.totalTemplates}\n` +
      `Kategoriler: ${info.categories.join(', ')}\n` +
      `Legacy Paths: ${info.legacyPaths}`
  )
}

/**
 * Singleton export
 */
export { templateManager } from '../utils/TemplateManager'

/**
 * Tüm config'leri export et (gerekirse)
 */
export const TemplateConfigs = {
  ihtiyac_listesi: IhtiyacListesiConfig,
  luzum_muzekkeresi: LuzumMuzekkeresiConfig,
  harcama_talimati: HarcamaTalimatiConfig
}

/**
 * Development: Tüm şablonları listele
 */
export function listAllTemplates(): void {
  const templates = templateManager.getAllTemplates()
  console.table(templates.map((t) => ({ id: t.id, name: t.name, category: t.category })))
}
