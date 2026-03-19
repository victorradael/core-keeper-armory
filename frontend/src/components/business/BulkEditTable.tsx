import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useBulkUpdate } from '../../hooks/useSets';
import type { EquipmentSet } from '../../types';
import { cn } from '../../utils/cn';
import { 
  Save, Check, HardHat, Shirt, Footprints, 
  Circle, Gem, Backpack, ShieldAlert, ShieldCheck 
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  capacete: HardHat,
  peitoral: Shirt,
  calças: Footprints,
  anel_1: Circle,
  anel_2: Circle,
  colar: Gem,
  mochila: Backpack,
  mao_secundaria: ShieldAlert
};

interface BulkEditTableProps {
  sets: EquipmentSet[];
  catalog: Record<string, string>;
}

export function BulkEditTable({ sets = [], catalog = {} }: BulkEditTableProps) {
  const bulkUpdate = useBulkUpdate();
  const [localData, setLocalData] = useState<any[]>([]);

  useEffect(() => {
    if (!sets || !catalog) return;
    
    const flatData = sets.map(set => ({
      id: set.id,
      Nome: set.name || '',
      Tipo: set.type || 'R',
      ...Object.keys(catalog).reduce((acc, key) => ({
        ...acc,
        [key]: set.equipment?.[key]?.has_in_set || false
      }), {})
    }));
    setLocalData(flatData);
  }, [sets, catalog]);

  const handleInputChange = (id: string, field: string, value: any) => {
    setLocalData(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSave = () => {
    bulkUpdate.mutate(localData);
  };

  const equipmentKeys = Object.keys(catalog || {});

  if (localData.length === 0 && sets.length > 0) {
    return <div className="text-center py-12 font-pixel text-[#938F99]">PROCESSING DATA...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="pixel-card overflow-x-auto p-0 border-primary/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b-2 border-white/10">
              <th className="p-4 text-xs font-black text-primary uppercase tracking-[0.2em] font-pixel">SET DESIGNATION</th>
              <th className="p-4 text-xs font-black text-primary uppercase tracking-[0.2em] font-pixel text-center">OWNER</th>
              {equipmentKeys.map(key => {
                const Icon = ICON_MAP[key] || ShieldCheck;
                return (
                  <th key={key} className="p-4 text-xs font-black text-primary uppercase tracking-[0.2em] font-pixel text-center">
                     <div className="flex flex-col items-center gap-1">
                        <Icon className="w-4 h-4" />
                        <span className="text-[8px]">{catalog[key]?.toUpperCase() || key}</span>
                     </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-black/20">
            {localData.map((row) => (
              <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-2 min-w-[200px]">
                  <input 
                    type="text" 
                    value={row.Nome}
                    onChange={(e) => handleInputChange(row.id, 'Nome', e.target.value)}
                    className="w-full bg-transparent border-2 border-transparent focus:border-primary/40 focus:bg-black/20 px-3 py-2 text-xs font-bold text-white transition-all font-pixel"
                  />
                </td>
                <td className="p-2 text-center">
                   <select 
                    value={row.Tipo}
                    onChange={(e) => handleInputChange(row.id, 'Tipo', e.target.value)}
                    className={cn(
                      "bg-[#1a1a24] border-2 border-white/10 px-3 py-1 text-[10px] font-black cursor-pointer font-pixel transition-all uppercase",
                      row.Tipo === 'R' ? "text-radael border-radael/30" : "text-carol border-carol/30"
                    )}
                  >
                    <option value="R">RADAEL</option>
                    <option value="C">CAROL</option>
                  </select>
                </td>
                {equipmentKeys.map(key => (
                  <td key={key} className="p-2 text-center">
                    <label className="inline-flex items-center justify-center cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-all">
                      <input 
                        type="checkbox" 
                        checked={!!row[key]}
                        onChange={(e) => handleInputChange(row.id, key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={cn(
                        "w-6 h-6 rounded border-2 transition-all flex items-center justify-center",
                        row[key] 
                          ? "bg-primary border-primary text-black" 
                          : "border-white/10 text-transparent"
                      )}>
                        <Check className="w-4 h-4" />
                      </div>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          isLoading={bulkUpdate.isPending}
          className="min-w-[300px] h-14 text-xl font-pixel tracking-[0.2em] bg-primary text-black pixel-border hover:bg-secondary transition-colors"
        >
          <Save className="w-5 h-5 mr-3" />
          {bulkUpdate.isPending ? 'SYNCING...' : 'COMMIT CHANGES'}
        </Button>
      </div>
    </div>
  );
}
