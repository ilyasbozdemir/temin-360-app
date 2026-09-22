export interface MenuItemOption {
  label?: string;
  onClick?: () => void;
  divider?: boolean;
}

export interface HeaderMenu {
  name: string;
  onClick?: () => void;
  items?: MenuItemOption[];
}

export interface DirtySummaryItem {
  tableName: string;
  title: string;
  action: string;
  actionLabel: string;
  count: number;
  lastTime: string;
}

export interface DirtySummaryData {
  totalChanges: number;
  lastModifiedAt: string | null;
  items: DirtySummaryItem[];
}
