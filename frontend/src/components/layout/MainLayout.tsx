import React, { useState } from 'react';
import { TitleBar } from './TitleBar';
import { TabBar, type TabId } from './TabBar';

interface MainLayoutProps {
  children: (activeTab: TabId, setActiveTab: (tab: TabId) => void) => React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('checklist');

  return (
    <div className="flex flex-col h-screen w-full bg-[#0c0c14] text-[#E6E1E5] overflow-hidden border-2 border-white/5">
      <TitleBar />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scroll">
        <div className="max-w-7xl mx-auto min-h-full">
          {children(activeTab, setActiveTab)}
        </div>
      </main>
    </div>
  );
}
