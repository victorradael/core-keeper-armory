export const EQUIPMENT_CATALOG = {
  capacete: "Capacete",
  peitoral: "Peitoral",
  calças: "Calças",
  anel_1: "Anel 1",
  anel_2: "Anel 2",
  colar: "Colar",
  mochila: "Mochila",
  mao_secundaria: "Mão Secundária",
} as const;

export type EquipmentKey = keyof typeof EQUIPMENT_CATALOG;
