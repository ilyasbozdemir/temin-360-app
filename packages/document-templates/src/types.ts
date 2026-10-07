import React from 'react';

export type CommissionTypeCategory =
  | 'piyasa_fiyat'
  | 'muayene_kabul'
  | 'yaklasik_maliyet'
  | 'ihale_komisyonu'
  | 'all'
  | 'none';

export type RoleVisibility = 'show' | 'hide' | 'optional';

export type RoleCode =
  | 'harcama_yetkilisi'
  | 'ihale_yetkilisi'
  | 'muhasebe'
  | 'hazirlayan'
  | 'talep_eden'
  | 'onaylayan'
  | 'gerceklestirme_gorevlisi';

export interface TemplateCapabilities {
  supportsOlur: boolean;
  supportsCommission: boolean;
  supportedCommissionTypes: CommissionTypeCategory[];
  supportsPersonnelList: boolean;
  supportsKalemListesi: boolean;
  supportsFirmaListesi: boolean;
  roleVisibility?: Partial<Record<RoleCode, RoleVisibility>>;
  commissionRoleVisibility?: Record<string, RoleVisibility>;
}

export type TemplateGroup = 'piyasa_arastirma' | 'muayene_kabul' | 'olur_onay';

export type TemplateType = {
  id: string;
  name: string;
  title: string;
  category: string;
  group?: TemplateGroup;
  description?: string;
  capabilities: TemplateCapabilities;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TemplateComponentProps<T = any> {
  data: T;
  onChange?: (data: Partial<T>) => void;
  orientation?: "portrait" | "landscape";
  pageSize?: "A4" | "A3";
}

export type TemplateComponentType = React.ComponentType<TemplateComponentProps>;
