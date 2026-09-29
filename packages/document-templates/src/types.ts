import React from 'react';

export type CommissionTypeCategory =
  | 'piyasa_fiyat'
  | 'muayene_kabul'
  | 'yaklasik_maliyet'
  | 'ihale_komisyonu'
  | 'all'
  | 'none';

export interface TemplateCapabilities {
  supportsOlur: boolean;
  supportsCommission: boolean;
  supportedCommissionTypes: CommissionTypeCategory[];
  supportsPersonnelList: boolean;
  supportsKalemListesi: boolean;
  supportsFirmaListesi: boolean;
}

export type TemplateType = {
  id: string;
  name: string;
  title: string;
  category: string;
  description?: string;
  capabilities: TemplateCapabilities;
  supportsOlur?: boolean; // Legacy fallback
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TemplateComponentProps<T = any> {
  data: T;
  onChange?: (data: Partial<T>) => void;
  orientation?: "portrait" | "landscape";
  pageSize?: "A4" | "A3";
}

export type TemplateComponentType = React.ComponentType<TemplateComponentProps>;
