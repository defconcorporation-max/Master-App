'use client';

import React, { useState, useMemo } from 'react';
import { 
    Calculator, 
    TrendingUp, 
    ArrowUpRight, 
    RotateCcw, 
    Zap,
    DollarSign,
    Target,
    BarChart3
} from 'lucide-react';

export function RevenueSimulator() {
    // Current Baseline (Mocked or passed from central stats)
    const baseline = {
        traffic: 12500,
        convRate: 2.5, // 2.5%
        avgOrder: 450, // CAD
    };

    const [traffic, setTraffic] = useState(baseline.traffic);
    const [convRate, setConvRate] = useState(baseline.convRate);
    const [avgOrder, setAvgOrder] = useState(baseline.avgOrder);

    const projectedRevenue = useMemo(() => {
        return traffic * (convRate / 100) * avgOrder;
    }, [traffic, convRate, avgOrder]);

    const currentRevenue = baseline.traffic * (baseline.convRate / 100) * baseline.avgOrder;
    const lift = ((projectedRevenue - currentRevenue) / currentRevenue) * 100;

    const reset = () => {
        setTraffic(baseline.traffic);
        setConvRate(baseline.convRate);
        setAvgOrder(baseline.avgOrder);
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full group">
            <div className="p-6 border-b border-white/5 bg-gradient-to-br from-slate-900 to-indigo-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <Calculator className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">"What-If" Engine</h2>
                            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Strategic Revenue Predictor</p>
                        </div>
                    </div>
                    <button onClick={reset} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-8 flex flex-col gap-8">
                {/* Result HUD */}
                <div className="p-6 bg-slate-950/60 rounded-3xl border border-white/5 relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BarChart3 className="w-16 h-16 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-2 block">Projected Monthly Volume</span>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-black text-white italic tracking-tighter">
                            ${projectedRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-sm font-bold text-slate-500 uppercase font-mono">CAD</span>
                    </div>
                    <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${lift >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                        {lift >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                        {Math.abs(lift).toFixed(1)}% LIFT FROM BASELINE
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    {/* Traffic Slider */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Global Traffic</span>
                            </div>
                            <span className="text-xs font-mono text-white font-bold">{traffic.toLocaleString()}</span>
                        </div>
                        <input 
                            type="range" min="1000" max="100000" step="500" value={traffic}
                            onChange={(e) => setTraffic(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-1"
                        />
                    </div>

                    {/* Conversion Rate */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <Target className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Conversion Rate</span>
                            </div>
                            <span className="text-xs font-mono text-white font-bold">{convRate.toFixed(1)}%</span>
                        </div>
                        <input 
                            type="range" min="0.1" max="15" step="0.1" value={convRate}
                            onChange={(e) => setConvRate(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* Avg Order Value */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Avg Ticket</span>
                            </div>
                            <span className="text-xs font-mono text-white font-bold">${avgOrder}</span>
                        </div>
                        <input 
                            type="range" min="50" max="5000" step="50" value={avgOrder}
                            onChange={(e) => setAvgOrder(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-950/40 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                        <Zap className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Jarvis Analysis</span>
                        <p className="text-[11px] text-white leading-tight">
                            "A {convRate}% conversion rate at this scale is aggressive, Sir. Focus on retention."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
