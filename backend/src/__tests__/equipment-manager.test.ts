import { describe, it, expect } from 'vitest';
import { 
  prepareSetForDisplay, 
  getUniqueName, 
  cloneSet, 
  updateEquipmentAcquisition,
  bulkUpdateSets,
  createSet 
} from '../core/equipment-manager';
import type { EquipmentSet } from '../types';

describe('EquipmentManager Logic (TDD)', () => {
  // ... (testes anteriores omitidos para brevidade)

  describe('createSet', () => {
    it('deve criar um novo conjunto com ID gerado e nome validado', () => {
      const newSetData: Omit<EquipmentSet, 'id' | '_total_items' | '_acquired_items' | '_is_complete'> = {
        name: 'Build Alpha',
        type: 'R',
        equipment: {
          capacete: { has_in_set: true, acquired: false, custom_name: 'Viseira' }
        }
      };
      const existingNames = ['Build Alpha'];

      const created = createSet(newSetData as any, existingNames);
      
      expect(created.id).toBeDefined();
      expect(created.name).toBe('Build Alpha 1'); // Deve ter usado getUniqueName
      expect(created.equipment.capacete?.custom_name).toBe('Viseira');
    });
  });
});
