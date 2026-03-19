import React from 'react';
import { Minus, Square, X, Pickaxe } from 'lucide-react';

export function TitleBar() {
  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = () => window.electronAPI?.maximize();
  const handleClose = () => window.electronAPI?.close();

  return (
    <div className="h-12 bg-black flex items-center justify-between select-none border-b-4 border-white/5">
      <div className="flex-1 h-full flex items-center px-6 gap-3" style={{ WebkitAppRegion: 'drag' } as any}>
        <Pickaxe className="w-5 h-5 text-secondary" />
        <span className="text-sm font-black text-white tracking-[0.2em] font-pixel">CORE KEEPER • ARMORY</span>
      </div>

      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button 
          onClick={handleMinimize}
          className="w-14 h-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button 
          onClick={handleMaximize}
          className="w-14 h-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
        >
          <Square className="w-4 h-4" />
        </button>
        <button 
          onClick={handleClose}
          className="w-14 h-full flex items-center justify-center hover:bg-red-600 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
