import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import type { EquipmentSet, AppConfig } from '../types';

export function useSets() {
  return useQuery<EquipmentSet[]>({
    queryKey: ['sets'],
    queryFn: async () => {
      const { data } = await api.get('/sets');
      return data;
    }
  });
}

export function useCreateSet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (newSet: Partial<EquipmentSet>) => {
      const { data } = await api.post('/sets', newSet);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
    },
    onError: () => {
      toast('Falha ao criar o set. Backend inacessível?');
    }
  });
}

export function useBulkUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (updates: any[]) => {
      const { data } = await api.put('/sets/bulk', updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
    },
    onError: () => {
      toast('Falha ao salvar alterações em massa.');
    }
  });
}

export function useConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery<AppConfig>({
    queryKey: ['config'],
    queryFn: async () => {
      const { data } = await api.get('/config');
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (newConfig: Partial<AppConfig>) => {
      const { data } = await api.post('/config', newConfig);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
    onError: () => {
      toast('Falha ao salvar configuração.');
    }
  });

  return { ...query, updateConfig: mutation };
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ setId, key, acquired }: { setId: string, key: string, acquired: boolean }) => {
      const { data } = await api.patch(`/sets/${setId}/items/${key}`, { acquired });
      return data;
    },
    onMutate: async ({ setId, key, acquired }) => {
      await queryClient.cancelQueries({ queryKey: ['sets'] });
      const previousSets = queryClient.getQueryData<EquipmentSet[]>(['sets']);

      queryClient.setQueryData<EquipmentSet[]>(['sets'], (old) => {
        if (!old) return [];
        return old.map(set => {
          if (set.id === setId) {
            const updatedEquipment = {
              ...set.equipment,
              [key]: { ...set.equipment[key], acquired }
            };

            const itemsInSet = Object.values(updatedEquipment).filter(i => i.has_in_set);
            const total = itemsInSet.length;
            const acquiredCount = itemsInSet.filter(i => i.acquired).length;

            return {
              ...set,
              equipment: updatedEquipment,
              _total_items: total,
              _acquired_items: acquiredCount,
              _is_complete: total > 0 && total === acquiredCount
            };
          }
          return set;
        });
      });

      return { previousSets };
    },
    onError: (err, variables, context) => {
      if (context?.previousSets) {
        queryClient.setQueryData(['sets'], context.previousSets);
      }
      toast('Falha ao atualizar item. Verifique a conexão com o backend.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
    }
  });
}

export function useDeleteSet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
    },
    onError: () => {
      toast('Falha ao deletar o set.');
    }
  });
}

export function useCloneSet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/sets/${id}/clone`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
    },
    onError: () => {
      toast('Falha ao clonar o set.');
    }
  });
}
