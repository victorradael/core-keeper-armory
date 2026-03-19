export interface EquipmentItem {
  has_in_set: boolean;
  acquired: boolean;
  custom_name: string;
}

export interface EquipmentSet {
  id: string;
  name: string;
  type: 'R' | 'C';
  equipment: Record<string, EquipmentItem>;
  _total_items: number;
  _acquired_items: number;
  _is_complete: boolean;
}

export type EquipmentCatalog = Record<string, string>;

export interface AppConfig {
  app_code: string;
}
