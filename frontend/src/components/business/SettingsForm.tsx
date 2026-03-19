import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { useConfig } from '../../hooks/useSets';
import { Save, Info, CheckCircle2, Monitor } from 'lucide-react';

export function SettingsForm() {
  const { data: config, updateConfig, isLoading } = useConfig();
  const [appCode, setAppCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setAppCode(config.app_code);
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate({ app_code: appCode }, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    });
  };

  if (isLoading) return <div className="text-center py-12 animate-pulse text-[#938F99] font-pixel text-xl uppercase">LOADING CORE CONFIG...</div>;

  return (
    <Card className="pixel-card max-w-xl mx-auto space-y-8 border-primary/20">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-black text-primary uppercase tracking-[0.2em] font-pixel">IDENTIFICATION</h3>
          <div className="h-px flex-1 bg-primary/10" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-pixel text-xs text-primary uppercase tracking-widest ml-1">APP CODE</label>
            <input 
              value={appCode}
              onChange={(e) => setAppCode(e.target.value.toUpperCase())}
              className="w-full bg-black/40 border-2 border-white/10 px-4 py-3 text-sm font-pixel text-white focus:outline-none focus:border-primary transition-all"
              placeholder="ENTER SYSTEM CODE..."
            />
            <p className="text-[9px] font-pixel text-[#938F99] uppercase tracking-wider ml-1">This code identifies your armory instance.</p>
          </div>
          
          <Button 
            onClick={handleSave} 
            isLoading={updateConfig.isPending}
            className="w-full h-14 bg-primary text-black font-pixel text-xl tracking-widest hover:bg-secondary transition-colors"
          >
            <Save className="w-5 h-5 mr-3" />
            {updateConfig.isPending ? 'SYNCING...' : 'SAVE CONFIGURATION'}
          </Button>

          {showSuccess && (
            <div className="flex items-center justify-center gap-2 text-green-400 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-pixel">SYSTEM UPDATED!</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-black text-[#938F99] uppercase tracking-[0.2em] font-pixel">SYSTEM INFO</h3>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="p-4 bg-black/20 border-2 border-white/5 flex items-start gap-4">
          <Monitor className="w-5 h-5 text-[#938F99] mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-white font-pixel uppercase tracking-widest">Build Keeper Electron v1.0.0</p>
            <p className="text-[10px] text-[#938F99] font-pixel uppercase">CONNECTED TO CORE BACKEND (DOCKER)</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
