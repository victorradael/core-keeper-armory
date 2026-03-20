import { v4 as uuidv4 } from "uuid";
import type {
	EquipmentSet,
	NewEquipmentSet,
	PreparedEquipmentSet,
} from "../types";

/**
 * Prepara um conjunto para exibição.
 */
export function prepareSetForDisplay(set: EquipmentSet): PreparedEquipmentSet {
	const itemsInSet = Object.values(set.equipment).filter(
		(item) => item.has_in_set,
	);
	const totalItems = itemsInSet.length;
	const acquiredItems = itemsInSet.filter((item) => item.acquired).length;

	return {
		...set,
		_total_items: totalItems,
		_acquired_items: acquiredItems,
		_is_complete: totalItems > 0 && totalItems === acquiredItems,
	};
}

/**
 * Gera um nome único para um novo conjunto.
 */
export function getUniqueName(
	baseName: string,
	existingNames: string[],
): string {
	if (!existingNames.includes(baseName)) {
		return baseName;
	}

	const match = baseName.match(/^(.*?) (\d+)$/);
	const prefix = match ? (match[1] ?? "").trim() : baseName.trim();

	let maxNum = 0;
	for (const name of existingNames) {
		if (name === prefix) {
			maxNum = Math.max(maxNum, 0);
		} else {
			const nameMatch = name.match(
				new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} (\\d+)$`),
			);
			if (nameMatch) {
				maxNum = Math.max(maxNum, parseInt(nameMatch[1] ?? "0", 10));
			}
		}
	}

	return `${prefix} ${maxNum + 1}`;
}

/**
 * Cria um novo conjunto, garantindo ID e nome únicos.
 */
export function createSet(
	data: NewEquipmentSet,
	existingNames: string[],
): EquipmentSet {
	return {
		...data,
		id: uuidv4(),
		name: getUniqueName(data.name || "Novo Conjunto", existingNames),
		type: data.type || "R",
		equipment: data.equipment || {},
	} as EquipmentSet;
}

/**
 * Clona um conjunto existente.
 */
export function cloneSet(
	original: EquipmentSet,
	existingNames: string[],
): EquipmentSet {
	const cloned = JSON.parse(JSON.stringify(original));
	cloned.id = uuidv4();
	cloned.name = getUniqueName(`${cloned.name} (Clone)`, existingNames);
	return cloned;
}

/**
 * Atualiza o status de aquisição de um item específico.
 */
export function updateEquipmentAcquisition(
	set: EquipmentSet,
	equipmentKey: string,
	acquiredStatus: boolean,
): EquipmentSet {
	if (!set.equipment[equipmentKey]) {
		throw new Error(`Item '${equipmentKey}' não encontrado no set '${set.id}'`);
	}
	return {
		...set,
		equipment: {
			...set.equipment,
			[equipmentKey]: {
				...set.equipment[equipmentKey],
				acquired: acquiredStatus,
			},
		},
	};
}

/**
 * Atualiza múltiplos conjuntos a partir de um payload plano (tabela).
 */
export function bulkUpdateSets(
	sets: EquipmentSet[],
	updates: Record<string, unknown>[],
): EquipmentSet[] {
	const setsById = Object.fromEntries(sets.map((s) => [s.id, s]));

	for (const row of updates) {
		const id = String(row["id"] ?? "");
		const set = setsById[id];
		if (!set) continue;

		if (typeof row["Nome"] === "string") set.name = row["Nome"];
		if (row["Tipo"] === "R" || row["Tipo"] === "C") set.type = row["Tipo"];

		for (const [key, value] of Object.entries(row)) {
			if (["id", "Nome", "Tipo", "Completo"].includes(key)) continue;

			if (set.equipment[key]) {
				set.equipment[key].has_in_set = Boolean(value);
			} else {
				set.equipment[key] = {
					has_in_set: Boolean(value),
					acquired: false,
					custom_name: "",
				};
			}
		}
	}

	return Object.values(setsById);
}
