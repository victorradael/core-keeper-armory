import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { BuildCard } from './components/business/BuildCard';
import { RegistrationForm } from './components/business/RegistrationForm';
import { BulkEditTable } from './components/business/BulkEditTable';
import { SettingsForm } from './components/business/SettingsForm';
import { useSets } from './hooks/useSets';
import { useQuery } from '@tanstack/react-query';
import { api, getServerUrl } from './services/api';
import {
  Search, Loader2, Pickaxe, Trophy, Shield,
  User, Target, Clipboard, ScrollText, Settings
} from 'lucide-react';

function ConnectionError({ serverUrl, onGoToSettings }: { serverUrl: string; onGoToSettings: () => void }) {
  const isDefault = serverUrl === 'http://localhost:3000';
  return (
    <div className="pixel-card p-12 flex flex-col items-center gap-6 border-red-500/20 bg-red-500/5 max-w-lg mx-auto">
      <Shield className="w-12 h-12 text-red-500" />
      <div className="text-center space-y-3">
        <p className="text-2xl font-black text-white font-pixel uppercase">CONNECTION LOST</p>
        <p className="text-[10px] font-pixel text-[#938F99] uppercase">
          TRYING TO REACH: <span className="text-white">{serverUrl}</span>
        </p>
        {isDefault && (
          <p className="text-[10px] font-pixel text-yellow-500/80 uppercase">
            HINT: CONFIGURE SERVER URL IN SYSTEM SETTINGS
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          className="pixel-border bg-primary/10 border-primary/40 px-6 py-2 font-pixel text-xs hover:bg-primary/20 text-primary"
          onClick={onGoToSettings}
        >
          SYSTEM CONFIG
        </button>
        <button
          className="pixel-border bg-white/5 px-6 py-2 font-pixel text-xs hover:bg-white/10 text-white"
          onClick={() => window.location.reload()}
        >
          RETRY
        </button>
      </div>
    </div>
  );
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: sets, isLoading: isLoadingSets, isError } = useSets();
  
  const { data: catalog } = useQuery<Record<string, string>>({
    queryKey: ['catalog'],
    queryFn: async () => {
      const { data } = await api.get('/catalog');
      return data;
    }
  });

  // Filtro e Ordenação com Safety Checks
  const filteredSets = (sets || [])
    .filter(set => {
      const nameMatch = set.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const itemMatch = Object.values(set.equipment || {}).some(e => 
        e.custom_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return nameMatch || itemMatch;
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const incompleteSets = filteredSets.filter(s => !s._is_complete);
  const completeSets = filteredSets.filter(s => s._is_complete);

  const renderSetsGrid = (subset: any[]) => {
    const radaelSets = subset.filter(s => s.type === 'R');
    const carolSets = subset.filter(s => s.type === 'C');

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Coluna Carol (ESQUERDA) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 border-l-4 border-carol">
            <User className="w-5 h-5 text-carol" />
            <h4 className="text-xl font-bold font-pixel text-carol uppercase tracking-wider">CAROL</h4>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {carolSets.length > 0 ? carolSets.map(set => (
              <BuildCard key={set.id} set={set} catalog={catalog || {}} />
            )) : <p className="text-[10px] font-pixel text-[#938F99] px-2 italic uppercase">NO BLUEPRINTS FOR CAROL</p>}
          </div>
        </div>

        {/* Coluna Radael (DIREITA) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 border-l-4 border-radael">
            <User className="w-5 h-5 text-radael" />
            <h4 className="text-xl font-bold font-pixel text-radael uppercase tracking-wider">RADAEL</h4>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {radaelSets.length > 0 ? radaelSets.map(set => (
              <BuildCard key={set.id} set={set} catalog={catalog || {}} />
            )) : <p className="text-[10px] font-pixel text-[#938F99] px-2 italic uppercase">NO BLUEPRINTS FOR RADAEL</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      {(currentTab, setTab) => (
        <div key={currentTab} className="animate-in fade-in duration-300 ease-out h-full">
          {currentTab === 'checklist' && (
            <div className="space-y-8 pb-20">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-primary" />
                    <h2 className="text-5xl font-black text-white tracking-tighter font-pixel uppercase">ARMORY TRACKING</h2>
                  </div>
                  <p className="text-[#938F99] font-bold uppercase tracking-[0.2em] text-[10px] font-pixel">
                    Syncing with the Core...
                  </p>
                </div>
                
                <div className="w-full md:w-80 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#938F99] z-10" />
                  <input 
                    placeholder="SEARCH GEAR..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/10 px-11 py-3 text-xs font-pixel text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </header>

              {isLoadingSets ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="font-pixel text-xl text-[#938F99] animate-pulse uppercase text-center">DIGGING IN THE CAVES...</p>
                </div>
              ) : isError ? (
                <ConnectionError serverUrl={getServerUrl()} onGoToSettings={() => setTab('settings')} />
              ) : (sets || []).length === 0 ? (
                <div className="pixel-card p-20 flex flex-col items-center gap-6 border-dashed border-white/10 text-center">
                  <Pickaxe className="w-16 h-16 text-[#4A4458]" />
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-white font-pixel uppercase">THE CAVE IS EMPTY</p>
                    <p className="text-[10px] font-pixel text-[#938F99] uppercase">GO TO FORGE TO START YOUR FIRST BUILD</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-16">
                  {incompleteSets.length > 0 && (
                    <section className="space-y-10">
                      <div className="flex items-center gap-4">
                        <Pickaxe className="w-6 h-6 text-white" />
                        <h3 className="text-2xl font-black text-white font-pixel uppercase tracking-widest bg-white/5 px-4 py-1">IN PROGRESS</h3>
                        <div className="h-1 flex-1 bg-white/5" />
                      </div>
                      {renderSetsGrid(incompleteSets)}
                    </section>
                  )}

                  {completeSets.length > 0 && (
                    <section className="space-y-10">
                       <div className="flex items-center gap-4">
                        <Trophy className="w-6 h-6 text-secondary" />
                        <h3 className="text-2xl font-black text-secondary font-pixel uppercase tracking-widest bg-secondary/5 px-4 py-1">COMPLETED BUILDS</h3>
                        <div className="h-1 flex-1 bg-secondary/10" />
                      </div>
                      <div className="opacity-80 hover:opacity-100 transition-opacity">
                        {renderSetsGrid(completeSets)}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
          
          {currentTab === 'registration' && (
            <div className="space-y-8 pb-12">
               <header className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Clipboard className="w-8 h-8 text-white" />
                  <h2 className="text-5xl font-black text-white font-pixel uppercase tracking-tighter">NEW BLUEPRINT</h2>
                </div>
                <p className="text-[#938F99] font-pixel text-[10px] uppercase tracking-widest">Forge a new set of equipment</p>
              </header>
              <RegistrationForm 
                catalog={catalog || {}} 
                onSuccess={() => setTab('checklist')}
              />
            </div>
          )}

          {currentTab === 'bulk-edit' && (
            <div className="space-y-8 pb-12">
              <header className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <ScrollText className="w-8 h-8 text-white" />
                  <h2 className="text-5xl font-black text-white font-pixel uppercase tracking-tighter">MASTER LEDGER</h2>
                </div>
                <p className="text-[#938F99] font-pixel text-[10px] uppercase tracking-widest">Global inventory management</p>
              </header>
              <BulkEditTable 
                sets={sets || []} 
                catalog={catalog || {}} 
              />
            </div>
          )}

          {currentTab === 'settings' && (
             <div className="space-y-8 pb-12">
              <header className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Settings className="w-8 h-8 text-white" />
                  <h2 className="text-5xl font-black text-white font-pixel uppercase tracking-tighter">CORE CONFIG</h2>
                </div>
                <p className="text-[#938F99] font-pixel text-[10px] uppercase tracking-widest">Adjust system parameters</p>
              </header>
              <SettingsForm />
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}

export default App;
