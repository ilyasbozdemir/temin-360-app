export type CommissionCategory = 'maliyet' | 'muayene' | 'ihale' | 'unmapped';

export interface CommissionResolutionInput {
  komisyon_id?: number | string | null;
  komisyon_turu?: string | null;
  komisyon_adi?: string | null;
  gorev?: string | null;
  belge_kapsami?: string | null;
  belgeKapsami?: string | null;
  [key: string]: any;
}

/**
 * Central, type-safe commission category resolver.
 * Replaces scattered includes() and magic numbers with layered precedence:
 * 1. Explicit scope (belge_kapsami / belgeKapsami)
 * 2. Database ID fallback (komisyon_id = 1 -> maliyet, 2 -> muayene)
 * 3. Text classification fallback (komisyon_turu / komisyon_adi / gorev)
 */
export function resolveCommissionCategory(
  input: CommissionResolutionInput | null | undefined
): CommissionCategory {
  if (!input) return 'unmapped';

  // 1. Explicit Scope Precedence
  const rawScope = input.belge_kapsami ?? input.belgeKapsami;
  if (rawScope !== undefined && rawScope !== null) {
    const scope = String(rawScope).trim().toLowerCase();
    if (scope === 'piyasa_arastirma' || scope === 'yaklasik_maliyet') {
      return 'maliyet';
    }
    if (scope === 'muayene_kabul') {
      return 'muayene';
    }
    if (scope === 'ihale_komisyonu' || scope === 'ihale') {
      return 'ihale';
    }
    if (scope === 'gizli' || scope === 'none') {
      return 'unmapped';
    }
  }

  // 2. Verified Database ID Precedence
  const rawId = input.komisyon_id;
  if (rawId !== undefined && rawId !== null && rawId !== '') {
    const numId = Number(rawId);
    if (numId === 1) return 'maliyet';
    if (numId === 2) return 'muayene';
  }

  // 3. Normalized Text Classification Fallback
  const textSource = `${input.komisyon_turu || ''} ${input.komisyon_adi || ''} ${input.gorev || ''}`.trim().toLowerCase();
  if (!textSource) return 'unmapped';

  if (
    textSource.includes('fiyat') ||
    textSource.includes('maliyet') ||
    textSource.includes('araştırma') ||
    textSource.includes('arastirma') ||
    textSource.includes('piyasa')
  ) {
    return 'maliyet';
  }

  if (textSource.includes('muayene') || textSource.includes('kabul')) {
    return 'muayene';
  }

  if (textSource.includes('ihale')) {
    return 'ihale';
  }

  return 'unmapped';
}
