"use client";

import { useState } from 'react';
import { CloudRain, Server, Zap, Database, ArrowDownRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export function CloudCostOptimizer() {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimized, setOptimized] = useState(false);

    const runOptimizer = () => {
        setIsOptimizing(true);
        setTimeout(() => {
            setIsOptimizing(false);
            setOptimized(true);
        }, 2500);
    };

    return (
        <div className="bg-gradient-to-br from-zinc-950 to-black border border-zinc-900 rounded-2xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden">
            {optimized && (
                <div className="absolute inset-0 bg-emerald-500/5 z-0 pointer-events-none transition-opacity" />
            )}

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <CloudRain className="w-5 h-5 text-blue-400" />
                            Cloud Cost Optimizer
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Cross-analyzing AWS, Vercel, and API billing rates.</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-black text-white ${optimized ? 'text-emerald-400' : ''}`}>
                            {optimized ? '$18' : '$43'}
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Current MRR Burn</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-black border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                        <Server className="w-8 h-8 text-zinc-700" />
                        <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Vercel Edge</p>
                            <span className="text-sm font-bold text-emerald-400">$0 <span className="text-[10px] text-zinc-500">(Hobby)</span></span>
                        </div>
                    </div>
                    <div className="bg-black border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                        <Database className="w-8 h-8 text-emerald-700" />
                        <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Supabase DB</p>
                            <span className="text-sm font-bold text-zinc-300">$25</span>
                            {/* Warning Indicator */}
                            {!optimized && <ArrowDownRight className="inline-block w-3 h-3 text-red-500 ml-1 mb-1" />}
                        </div>
                    </div>
                    <div className="bg-black border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                        <Zap className="w-8 h-8 text-amber-700" />
                        <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">OpenAI API</p>
                            <span className="text-sm font-bold text-zinc-300">$18</span>
                        </div>
                    </div>
                    <div className="bg-black border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                        <CloudRain className="w-8 h-8 text-blue-700" />
                        <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">AWS S3</p>
                            <span className="text-sm font-bold text-emerald-400">$0 <span className="text-[10px] text-zinc-500">(Free Tier)</span></span>
                        </div>
                    </div>
                </div>

                {!optimized ? (
                    <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full" />
                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            AI Recommendation
                        </h4>
                        <p className="text-sm text-blue-100/80 leading-relaxed font-medium">
                            Supabase database pools for Auclaire and Defcon are over-provisioned for current traffic. Downgrading compute instances will save <strong>$25/mo</strong> without affecting latency.
                        </p>
                        <button 
                            onClick={runOptimizer} 
                            disabled={isOptimizing}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50"
                        >
                            {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {isOptimizing ? 'Executing Downgrade...' : 'Execute Downgrade Autonomously'}
                        </button>
                    </div>
                ) : (
                    <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 mt-auto">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mb-1">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h4 className="text-sm font-bold text-emerald-400">Optimization Complete</h4>
                        <p className="text-xs text-emerald-100/60 font-medium">Compute downgraded successfully. Saving $25/mo immediately.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
