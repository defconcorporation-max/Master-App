"use client";

import { useState } from 'react';
import { Target, Search, Mail, Send, CheckCircle2, Bot, FileText, ArrowRight } from 'lucide-react';

export function VCOutreachAgent() {
    const [targetSector, setTargetSector] = useState('B2B AI SaaS');
    const [isRunning, setIsRunning] = useState(false);
    const [stage, setStage] = useState(0);

    const engageAutobot = () => {
        setIsRunning(true);
        setStage(1);
        
        setTimeout(() => setStage(2), 2000); // Scraping
        setTimeout(() => setStage(3), 4500); // Filtering & Gemini
        setTimeout(() => setStage(4), 7000); // Sending
        setTimeout(() => {
            setStage(0);
            setIsRunning(false);
        }, 9000);
    };

    return (
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden">
            {isRunning && <div className="absolute inset-0 bg-blue-500/5 animate-pulse z-0 pointer-events-none" />}
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Bot className="w-5 h-5 text-blue-400" />
                            Autonomous VC Outreach
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Scrapes Crunchbase, drafts emails via Gemini, sends PDF reports.</p>
                    </div>
                </div>

                <div className="bg-black border border-zinc-800 rounded-xl p-4 mb-4 flex items-center gap-3">
                    <Target className="w-5 h-5 text-zinc-500" />
                    <input 
                        type="text"
                        value={targetSector}
                        onChange={(e) => setTargetSector(e.target.value)}
                        placeholder="e.g. B2B SaaS, FinTech..."
                        className="bg-transparent border-none text-white text-sm focus:outline-none w-full font-bold"
                        disabled={isRunning}
                    />
                </div>

                <div className="flex-1 space-y-3 relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-zinc-800 z-0" />
                    
                    <div className={`relative z-10 flex items-center gap-4 bg-zinc-900/80 p-3 rounded-xl border ${stage >= 1 ? 'border-blue-500/50 text-blue-100' : 'border-zinc-800 text-zinc-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stage >= 1 ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                            <Search className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest">Crunchbase Scraping</p>
                            <p className="text-[10px] opacity-70 mt-0.5">Finding active seed investors in {targetSector}.</p>
                        </div>
                        {stage > 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>

                    <div className={`relative z-10 flex items-center gap-4 bg-zinc-900/80 p-3 rounded-xl border ${stage >= 2 ? 'border-purple-500/50 text-purple-100' : 'border-zinc-800 text-zinc-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stage >= 2 ? 'bg-purple-600' : 'bg-zinc-800'}`}>
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest">Gemini Mail Drafting</p>
                            <p className="text-[10px] opacity-70 mt-0.5">Generating 25 hyper-personalized pitch emails.</p>
                        </div>
                        {stage > 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>

                    <div className={`relative z-10 flex items-center gap-4 bg-zinc-900/80 p-3 rounded-xl border ${stage >= 3 ? 'border-emerald-500/50 text-emerald-100' : 'border-zinc-800 text-zinc-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stage >= 3 ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                            <Send className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest">Executing Delivery</p>
                            <p className="text-[10px] opacity-70 mt-0.5">Attaching AI Portfolio Report & bypassing spam filters.</p>
                        </div>
                        {stage > 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                </div>

                <button 
                    onClick={engageAutobot}
                    disabled={isRunning}
                    className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-300 disabled:opacity-50 text-white py-3 rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-blue-900/30 w-full"
                >
                    {isRunning ? (
                        <>
                            PROCESSING <span className="flex gap-0.5"><span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '100ms'}}>.</span><span className="animate-bounce" style={{animationDelay: '200ms'}}>.</span></span>
                        </>
                    ) : (
                        <>
                            ENGAGE OUTREACH DRONE <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
