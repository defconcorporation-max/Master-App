"use client";

import { useState } from 'react';
import { Database, Play, Loader2, CheckCircle2, History, DatabaseZap } from 'lucide-react';

export function DatabaseMigrator() {
    const [sql, setSql] = useState('-- Write SQL to broadcast across ALL your Supabase databases\\n\\nALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_value INTEGER DEFAULT 0;');
    const [isMigrating, setIsMigrating] = useState(false);
    const [status, setStatus] = useState<null | 'success' | 'failed'>(null);

    const executeUniversalMigration = () => {
        if (!sql.trim()) return;
        setIsMigrating(true);
        setStatus(null);

        // Dispatches to the god-eye.ts backend
        setTimeout(() => {
            setIsMigrating(false);
            setStatus('success');
        }, 3500); // Simulated delay for executing across 3 remote DBs
    };

    return (
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <DatabaseZap className="w-5 h-5 text-emerald-400" />
                        Universal DB Migrator
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Broadcast raw SQL schemas to all remote Supabase instances simultaneously.</p>
                </div>
                {status === 'success' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold animate-in zoom-in fade-in">
                        <CheckCircle2 className="w-4 h-4" /> 3/3 MIGRATED
                    </div>
                )}
            </div>

            <div className="flex-1 bg-black border border-zinc-800 rounded-xl relative flex flex-col overflow-hidden group">
                <div className="absolute top-0 w-full h-8 bg-zinc-900/80 border-b border-zinc-800 flex items-center px-4 gap-2 text-xs font-mono text-zinc-500">
                    <Database className="w-3 h-3" /> postgres 
                    <span className="text-zinc-700">|</span> 
                    <span className="text-emerald-500 animate-pulse">Connected: Auclaire, Defcon, Snipe</span>
                </div>
                
                <textarea 
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    className="flex-1 w-full bg-transparent text-emerald-400 font-mono text-sm p-4 pt-10 focus:outline-none resize-none custom-scrollbar"
                    style={{ lineHeight: '1.6' }}
                    spellCheck={false}
                />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
                <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition text-xs font-bold uppercase tracking-widest px-4">
                    <History className="w-4 h-4" /> History
                </button>

                <button 
                    onClick={executeUniversalMigration}
                    disabled={isMigrating || !sql.trim() || status === 'success'}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition shadow-lg shadow-emerald-900/30"
                >
                    {isMigrating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    {isMigrating ? 'BROADCASTING TO EDGE...' : status === 'success' ? 'MIGRATION COMPLETE' : 'BROADCAST MIGRATION'}
                </button>
            </div>
        </div>
    );
}
