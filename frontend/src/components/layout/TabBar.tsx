import React, { useState } from 'react';
import { LayoutGrid, Hammer, ScrollText, Settings, Copy, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useConfig } from '../../hooks/useSets';

export type TabId = 'checklist' | 'registration' | 'bulk-edit' | 'settings';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabItem[] = [
  { id: 'checklist', label: 'DASHBOARD', icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 'registration', label: 'FORGE', icon: <Hammer className="w-5 h-5" /> },
  { id: 'bulk-edit', label: 'LEDGER', icon: <ScrollText className="w-5 h-5" /> },
  { id: 'settings', label: 'SYSTEM', icon: <Settings className="w-5 h-5" /> },
];

function SessionBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-4 mb-3 px-5 py-3 border-2 border-white/10 bg-black/20">
      <span className="text-sm font-pixel text-[#938F99] uppercase tracking-widest">SESSION</span>
      <span className="text-xl font-pixel text-primary font-black tracking-widest">{code}</span>
      <button onClick={handleCopy} className="flex items-center transition-colors">
        {copied
          ? <Check className="w-5 h-5 text-secondary" />
          : <Copy className="w-5 h-5 text-[#938F99] hover:text-white" />
        }
      </button>
    </div>
  );
}

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { data: config } = useConfig();

  return (
    <div className="flex items-end justify-between bg-black/40 border-b-4 border-white/5 px-4 pt-4">
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 pb-3 px-8 transition-all duration-200 ease-out group",
                isActive ? "text-primary" : "text-[#938F99] hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 border-2 transition-all duration-200 ease-out",
                isActive ? "border-primary bg-primary/10" : "border-transparent group-hover:border-white/10"
              )}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-black tracking-widest font-pixel">
                {tab.label}
              </span>

              <div className={cn(
                "absolute bottom-0 left-4 right-4 h-1 transition-all duration-300 ease-out",
                isActive ? "bg-primary opacity-100" : "bg-transparent opacity-0"
              )} />
            </button>
          );
        })}
      </div>

      {config?.app_code && (
        <SessionBadge code={config.app_code} />
      )}
    </div>
  );
}
