import { describe, it, expect } from 'vitest';
import {
  prepareSetForDisplay,
  getUniqueName,
  createSet,
  cloneSet,
  updateEquipmentAcquisition,
  bulkUpdateSets,
} from '../core/equipment-manager';
import type { EquipmentSet } from '../types';

// ---------- Fixtures ----------

function makeItem(has_in_set: boolean, acquired: boolean) {
  return { has_in_set, acquired, custom_name: '' };
}

function makeSet(overrides: Partial<EquipmentSet> = {}): EquipmentSet {
  return {
    id: 'test-id',
    name: 'Test Set',
    type: 'R',
    equipment: {},
    ...overrides,
  };
}

// ---------- prepareSetForDisplay ----------

describe('prepareSetForDisplay', () => {
  it('retorna zeros para set sem itens', () => {
    const result = prepareSetForDisplay(makeSet());
    expect(result._total_items).toBe(0);
    expect(result._acquired_items).toBe(0);
    expect(result._is_complete).toBe(false);
  });

  it('conta apenas itens com has_in_set=true', () => {
    const set = makeSet({
      equipment: {
        capacete: makeItem(true, false),
        peitoral: makeItem(false, false),
      },
    });
    const result = prepareSetForDisplay(set);
    expect(result._total_items).toBe(1);
    expect(result._acquired_items).toBe(0);
    expect(result._is_complete).toBe(false);
  });

  it('marca como completo quando todos os itens do set foram adquiridos', () => {
    const set = makeSet({
      equipment: {
        capacete: makeItem(true, true),
        peitoral: makeItem(true, true),
        calças: makeItem(false, false),
      },
    });
    const result = prepareSetForDisplay(set);
    expect(result._total_items).toBe(2);
    expect(result._acquired_items).toBe(2);
    expect(result._is_complete).toBe(true);
  });

  it('não marca como completo quando set parcialmente adquirido', () => {
    const set = makeSet({
      equipment: {
        capacete: makeItem(true, true),
        peitoral: makeItem(true, false),
      },
    });
    const result = prepareSetForDisplay(set);
    expect(result._is_complete).toBe(false);
  });
});

// ---------- getUniqueName ----------

describe('getUniqueName', () => {
  it('retorna o nome original se não há duplicata', () => {
    expect(getUniqueName('Scarlet', ['Iron', 'Gold'])).toBe('Scarlet');
  });

  it('retorna o nome sem alteração quando a lista está vazia', () => {
    expect(getUniqueName('Novo Set', [])).toBe('Novo Set');
  });

  it('adiciona sufixo numérico quando o nome já existe', () => {
    expect(getUniqueName('Scarlet', ['Scarlet'])).toBe('Scarlet 1');
  });

  it('incrementa além do maior número existente', () => {
    expect(getUniqueName('Scarlet', ['Scarlet', 'Scarlet 1', 'Scarlet 2'])).toBe('Scarlet 3');
  });

  it('trata nomes com número no sufixo corretamente', () => {
    expect(getUniqueName('Set 2', ['Set 2'])).toBe('Set 3');
  });
});

// ---------- createSet ----------

describe('createSet', () => {
  it('gera um id no formato uuid', () => {
    const set = createSet({ name: 'Armor', type: 'R', equipment: {} }, []);
    expect(set.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('usa o nome fornecido quando não há duplicata', () => {
    const set = createSet({ name: 'Armor', type: 'R', equipment: {} }, []);
    expect(set.name).toBe('Armor');
  });

  it('resolve nome duplicado automaticamente', () => {
    const set = createSet({ name: 'Armor', type: 'R', equipment: {} }, ['Armor']);
    expect(set.name).toBe('Armor 1');
  });

  it('usa "Novo Conjunto" como nome padrão quando nome não é fornecido', () => {
    const set = createSet({ type: 'R', equipment: {} }, []);
    expect(set.name).toBe('Novo Conjunto');
  });

  it('usa tipo "R" como padrão quando tipo não é fornecido', () => {
    const set = createSet({ name: 'Armor', equipment: {} }, []);
    expect(set.type).toBe('R');
  });

  it('preserva os dados de equipment fornecidos', () => {
    const equipment = { capacete: { has_in_set: true, acquired: false, custom_name: 'Viseira' } };
    const set = createSet({ name: 'Build Alpha', type: 'R', equipment }, []);
    expect(set.equipment.capacete?.custom_name).toBe('Viseira');
  });
});

// ---------- cloneSet ----------

describe('cloneSet', () => {
  it('gera um novo id diferente do original', () => {
    const original = makeSet({ id: 'original-id', name: 'Armor' });
    const clone = cloneSet(original, ['Armor']);
    expect(clone.id).not.toBe('original-id');
  });

  it('adiciona "(Clone)" ao nome', () => {
    const original = makeSet({ name: 'Armor' });
    const clone = cloneSet(original, ['Armor']);
    expect(clone.name).toBe('Armor (Clone)');
  });

  it('resolve nome de clone duplicado', () => {
    const original = makeSet({ name: 'Armor' });
    const clone = cloneSet(original, ['Armor', 'Armor (Clone)']);
    expect(clone.name).toBe('Armor (Clone) 1');
  });

  it('copia os dados de equipment do original', () => {
    const original = makeSet({
      name: 'Armor',
      equipment: { capacete: makeItem(true, true) },
    });
    const clone = cloneSet(original, ['Armor']);
    expect(clone.equipment.capacete).toEqual({ has_in_set: true, acquired: true, custom_name: '' });
  });

  it('o clone é uma cópia profunda — não compartilha referências', () => {
    const original = makeSet({
      name: 'Armor',
      equipment: { capacete: makeItem(true, false) },
    });
    const clone = cloneSet(original, ['Armor']);
    clone.equipment.capacete.acquired = true;
    expect(original.equipment.capacete.acquired).toBe(false);
  });
});

// ---------- updateEquipmentAcquisition ----------

describe('updateEquipmentAcquisition', () => {
  it('atualiza o status de acquired de um item existente', () => {
    const set = makeSet({ equipment: { capacete: makeItem(true, false) } });
    const updated = updateEquipmentAcquisition(set, 'capacete', true);
    expect(updated.equipment.capacete.acquired).toBe(true);
  });

  it('não modifica o set original (imutabilidade)', () => {
    const set = makeSet({ equipment: { capacete: makeItem(true, false) } });
    updateEquipmentAcquisition(set, 'capacete', true);
    expect(set.equipment.capacete.acquired).toBe(false);
  });

  it('lança erro quando o item não existe no set', () => {
    const set = makeSet({ equipment: {} });
    expect(() => updateEquipmentAcquisition(set, 'inexistente', true)).toThrow();
  });

  it('preserva os outros campos do item ao atualizar', () => {
    const set = makeSet({
      equipment: { capacete: { has_in_set: true, acquired: false, custom_name: 'Helm of Doom' } },
    });
    const updated = updateEquipmentAcquisition(set, 'capacete', true);
    expect(updated.equipment.capacete.custom_name).toBe('Helm of Doom');
    expect(updated.equipment.capacete.has_in_set).toBe(true);
  });
});

// ---------- bulkUpdateSets ----------

describe('bulkUpdateSets', () => {
  it('atualiza o nome de um set pelo id', () => {
    const sets = [makeSet({ id: 'a', name: 'Old Name' })];
    const result = bulkUpdateSets(sets, [{ id: 'a', Nome: 'New Name' }]);
    expect(result.find(s => s.id === 'a')?.name).toBe('New Name');
  });

  it('atualiza o tipo de um set', () => {
    const sets = [makeSet({ id: 'a', type: 'R' })];
    const result = bulkUpdateSets(sets, [{ id: 'a', Tipo: 'C' }]);
    expect(result.find(s => s.id === 'a')?.type).toBe('C');
  });

  it('ignora ids que não existem na lista', () => {
    const sets = [makeSet({ id: 'a', name: 'Armor' })];
    const result = bulkUpdateSets(sets, [{ id: 'nao-existe', Nome: 'Ghost' }]);
    expect(result.find(s => s.id === 'a')?.name).toBe('Armor');
  });

  it('atualiza has_in_set de um item de equipment existente', () => {
    const sets = [makeSet({ id: 'a', equipment: { capacete: makeItem(false, false) } })];
    const result = bulkUpdateSets(sets, [{ id: 'a', capacete: true }]);
    expect(result.find(s => s.id === 'a')?.equipment.capacete.has_in_set).toBe(true);
  });

  it('cria o item de equipment se não existir no set', () => {
    const sets = [makeSet({ id: 'a', equipment: {} })];
    const result = bulkUpdateSets(sets, [{ id: 'a', capacete: true }]);
    const item = result.find(s => s.id === 'a')?.equipment.capacete;
    expect(item).toBeDefined();
    expect(item?.has_in_set).toBe(true);
  });

  it('processa múltiplos sets em uma única chamada', () => {
    const sets = [
      makeSet({ id: 'a', name: 'Alpha' }),
      makeSet({ id: 'b', name: 'Beta' }),
    ];
    const result = bulkUpdateSets(sets, [
      { id: 'a', Nome: 'Alpha Updated' },
      { id: 'b', Nome: 'Beta Updated' },
    ]);
    expect(result.find(s => s.id === 'a')?.name).toBe('Alpha Updated');
    expect(result.find(s => s.id === 'b')?.name).toBe('Beta Updated');
  });
});
