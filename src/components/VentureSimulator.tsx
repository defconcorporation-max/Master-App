'use client';

import React, { useState } from 'react';
import { 
    Rocket, 
    PieChart, 
    TrendingUp, 
    DollarSign, 
    Zap,
    Users,
    ArrowRight,
    Search,
    BrainCircuit
} from 'lucide-react';

export function VentureSimulator() {
    const [ventureName, setVentureName] = useState('');
    const [budget, setBudget] = useState(5000);
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSimulate = () => {
        setIsSimulating(true);
        // Simulate "Thinking"
        setTimeout(() => {
            setResult({
                successProbability: Math.floor(Math.random() * 30) + 60,
                roiMonths: Math.floor(Math.random() * 8) + 4,
                marketSaturation: 'Medium',
                synergyScore: 85
            });
            setIsSimulating(false);
        }, 2000);
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full group">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-indigo-900/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Rocket className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Venture Simulator</h2>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Pre-Launch Market AI</p>
                    </div>
                </div>
            </div>

            <div className="p-8 flex-1 space-y-6">
                {!result ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Venture Concept</label>
                            <input 
                                type="text"
                                placeholder="e.g. AI Content Agency for Real Estate"
                                value={ventureName}
                                onChange={(e) => setVentureName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Investment</span>
                                <span className="text-xs font-mono text-white font-bold">${budget.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" min="1000" max="100000" step="1000" value={budget}
                                onChange={(e) => setBudget(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>

                        <button 
                            onClick={handleSimulate}
                            disabled={!ventureName || isSimulating}
                            className="w-full py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isSimulating ? (
                                <>
                                    <Zap className="w-4 h-4 animate-spin" /> Analyzing Market Synergy...
                                </>
                            ) : (
                                <>
                                    Run Empire Simulation <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                                <span className="text-sm font-bold text-white italic">Simulation Complete</span>
                            </div>
                            <button onClick={() => setResult(null)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase transition-colors">Reset</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-black/40 rounded-2xl border border-white/10 text-center">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Success Probability</span>
                                <span className="text-3xl font-black text-emerald-400">{result.successProbability}%</span>
                            </div>
                            <div className="p-5 bg-black/40 rounded-2xl border border-white/10 text-center">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">ROI Timeline</span>
                                <span className="text-3xl font-black text-indigo-300">{result.roiMonths}mo</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs p-3 bg-white/5 rounded-xl">
                                <span className="text-zinc-500 font-bold uppercase">Synergy Score</span>
                                <span className="text-white font-black">{result.synergyScore}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs p-3 bg-white/5 rounded-xl">
                                <span className="text-zinc-500 font-bold uppercase">Market Saturation</span>
                                <span className="text-amber-400 font-black">{result.marketSaturation}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                             <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                                "Sir, launching '{ventureName}' would leverage 42% of your existing Auclaire codebase and Defcon's media pipelines. It is a highly efficient expansion." 🦾🇬🇧
                             </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-950/40 border-t border-white/5 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <PieChart className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none">Venture Status</span>
                    <p className="text-[11px] text-white font-bold">Awaiting executive decision.</p>
                </div>
            </div>
        </div>
    );
}
