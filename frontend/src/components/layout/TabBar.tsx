import React from 'react';
import { LayoutGrid, Hammer, ScrollText, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';

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

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex justify-center bg-black/40 border-b-4 border-white/5 px-4 pt-4">
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 pb-3 px-8 transition-all group",
                isActive ? "text-primary" : "text-[#938F99] hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 border-2 transition-all",
                isActive ? "border-primary bg-primary/10" : "border-transparent group-hover:border-white/10"
              )}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-black tracking-widest font-pixel">
                {tab.label}
              </span>
              
              {isActive && (
                <div className="absolute bottom-0 left-4 right-4 h-1 bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
