export interface EquipmentItem {
	has_in_set: boolean;
	acquired: boolean;
	custom_name: string;
}

export interface NewEquipmentSet {
	name?: string;
	type?: "R" | "C";
	equipment?: Record<string, EquipmentItem>;
}

export interface EquipmentSet {
	id: string;
	name: string;
	type: "R" | "C";
	equipment: Record<string, EquipmentItem>;
}

export interface PreparedEquipmentSet extends EquipmentSet {
	_total_items: number;
	_acquired_items: number;
	_is_complete: boolean;
}
