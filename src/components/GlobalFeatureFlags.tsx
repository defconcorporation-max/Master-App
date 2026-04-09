"use client";

import { useState } from 'react';
import { ToggleRight, Link2, Sparkles, CreditCard, Users, ShieldAlert, Loader2 } from 'lucide-react';

export function GlobalFeatureFlags() {
    const [toggles, setToggles] = useState<Record<string, Record<string, boolean>>>({
        Auclaire: { ai_drafts: true, live_billing: true, public_signup: true },
        Defcon: { ai_drafts: false, live_billing: true, public_signup: false },
        SalesSniper: { ai_drafts: true, live_billing: false, public_signup: true }
    });
    const [loadingKey, setLoadingKey] = useState<string | null>(null);

    const handleToggle = (app: string, feature: string) => {
        const key = `${app}-${feature}`;
        setLoadingKey(key);
        
        // Simulating writing to remote Supabase Edge Config
        setTimeout(() => {
            setToggles(prev => ({
                ...prev,
                [app]: {
                    ...prev[app],
                    [feature]: !prev[app][feature]
                }
            }));
            setLoadingKey(null);
        }, 800);
    };

    const getIcon = (feature: string) => {
        if (feature === 'ai_drafts') return <Sparkles className="w-4 h-4 text-purple-400" />;
        if (feature === 'live_billing') return <CreditCard className="w-4 h-4 text-emerald-400" />;
        if (feature === 'public_signup') return <Users className="w-4 h-4 text-blue-400" />;
        return <ToggleRight className="w-4 h-4 text-zinc-400" />;
    };

    const getFeatureName = (feature: string) => {
        return feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 shadow-2xl h-[450px] flex flex-col">
            <div className="flex items-center justify-between mx-1 mb-6 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ToggleRight className="w-5 h-5 text-indigo-400" />
                        Global Feature Switchboard
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Remotely enable/disable core modules instantly across production edge nodes.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-black px-3 py-1.5 rounded-lg border border-zinc-800">
                    <Link2 className="w-3 h-3 text-indigo-400" /> Edge Sync Live
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {Object.entries(toggles).map(([appName, features]) => (
                    <div key={appName} className="bg-black border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-1">{appName}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {Object.entries(features).map(([featureKey, isActive]) => {
                                const isLoading = loadingKey === `${appName}-${featureKey}`;
                                
                                return (
                                    <div key={featureKey} className="flex flex-col gap-3 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            {getIcon(featureKey)}
                                            <span className="text-xs font-bold text-zinc-300 truncate">{getFeatureName(featureKey)}</span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleToggle(appName, featureKey)}
                                            disabled={isLoading}
                                            className={`relative w-full h-8 rounded-md transition-all flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase overflow-hidden ${
                                                isActive 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                                                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-zinc-800'
                                            } disabled:opacity-50`}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                                            ) : (
                                                <>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                                                    {isActive ? 'ENABLED' : 'DISABLED'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="shrink-0 mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed font-bold">
                    WARNING: Disabling billing modules removes paywalls instantly. Ensure fallback logic exists on client applications to prevent unmetered usage spikes.
                </p>
            </div>
        </div>
    );
}
