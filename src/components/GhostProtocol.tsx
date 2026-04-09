"use client";

import { useState } from 'react';
import { Skull, ShieldAlert, Loader2, KeyRound, WifiOff, TerminalSquare } from 'lucide-react';

export function GhostProtocol() {
    const [isEngaged, setIsEngaged] = useState(false);
    const [stage, setStage] = useState(0);

    const engageGhostMode = () => {
        setIsEngaged(true);
        setStage(1);

        // Sequence simulations
        setTimeout(() => setStage(2), 1500); // Killing IPC tasks
        setTimeout(() => setStage(3), 3000); // Wiping .env cache from memory
        setTimeout(() => setStage(4), 4500); // Disconnecting Supabase real-time clients
        setTimeout(() => {
            setStage(0);
            setIsEngaged(false);
            alert("GHOST PROTOCOL COMPLETE. All local nodes terminated. Traces erased. Network dark.");
        }, 6500);
    };

    return (
        <div className="bg-gradient-to-br from-red-950/40 to-black border border-red-900/30 rounded-2xl p-6 shadow-[0_0_30px_-10px_rgba(220,38,38,0.2)] h-[450px] flex flex-col items-center justify-center relative overflow-hidden text-center group">
            
            {/* Visual Pulse effect when active */}
            {isEngaged && (
                <div className="absolute inset-0 bg-red-600/10 animate-pulse z-0 pointer-events-none" />
            )}

            <div className="relative z-10 w-full flex flex-col items-center">
                <div className={`p-4 rounded-full border-4 shadow-2xl transition-all duration-1000 ${
                    isEngaged ? 'bg-red-600 border-red-500 shadow-red-600/50 scale-110' : 'bg-black border-red-900 shadow-zinc-900/50 group-hover:border-red-600'
                }`}>
                    <Skull className={`w-12 h-12 ${isEngaged ? 'text-white animate-pulse' : 'text-red-900 group-hover:text-red-500 transition-colors'}`} />
                </div>

                <h3 className="text-xl font-black text-white mt-6 mb-2 tracking-widest uppercase">The "Ghost Protocol"</h3>
                <p className="text-xs text-zinc-500 mb-8 max-w-[250px] leading-relaxed">
                    Instantly terminate all active dev processes, flush `.env` keys from memory, and disconnect all remote DB connections. 
                </p>

                <div className="flex flex-col gap-3 w-full max-w-xs text-left mb-8">
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${stage >= 1 ? 'border-red-500 bg-red-950/50' : 'border-zinc-800 bg-black'}`}>
                        {stage === 1 ? <Loader2 className="w-4 h-4 text-red-500 animate-spin" /> : <TerminalSquare className={`w-4 h-4 ${stage > 1 ? 'text-red-500' : 'text-zinc-600'}`} />}
                        <span className={`text-xs font-bold ${stage >= 1 ? 'text-red-100' : 'text-zinc-500'}`}>Terminate IPC Node Handlers</span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${stage >= 2 ? 'border-red-500 bg-red-950/50' : 'border-zinc-800 bg-black'}`}>
                        {stage === 2 ? <Loader2 className="w-4 h-4 text-red-500 animate-spin" /> : <KeyRound className={`w-4 h-4 ${stage > 2 ? 'text-red-500' : 'text-zinc-600'}`} />}
                        <span className={`text-xs font-bold ${stage >= 2 ? 'text-red-100' : 'text-zinc-500'}`}>Flush Global Auth Tokens</span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${stage >= 3 ? 'border-red-500 bg-red-950/50' : 'border-zinc-800 bg-black'}`}>
                        {stage === 3 ? <Loader2 className="w-4 h-4 text-red-500 animate-spin" /> : <WifiOff className={`w-4 h-4 ${stage > 3 ? 'text-red-500' : 'text-zinc-600'}`} />}
                        <span className={`text-xs font-bold ${stage >= 3 ? 'text-red-100' : 'text-zinc-500'}`}>Sever Remote God-Eye DB Links</span>
                    </div>
                </div>

                <button 
                    onClick={engageGhostMode}
                    disabled={isEngaged}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-red-950 disabled:border-red-900 disabled:text-red-800 disabled:cursor-not-allowed border-2 border-transparent text-white w-full max-w-xs py-3 rounded-xl font-black tracking-widest uppercase transition-all shadow-lg shadow-red-900/50 hover:shadow-red-500/50"
                >
                    {isEngaged ? 'EXECUTING ZERO-FOOTPRINT...' : (
                        <>
                            <ShieldAlert className="w-5 h-5" />
                            ENGAGE GHOST MODE
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
