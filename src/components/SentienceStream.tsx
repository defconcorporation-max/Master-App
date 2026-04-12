'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Zap, Lightbulb, ShieldCheck, Activity } from 'lucide-react';

interface AgentLog {
    id: string;
    timestamp: Date;
    agent: 'Jarvis' | 'Alpha' | 'Sentinel';
    action: string;
    type: 'process' | 'insight' | 'security' | 'success';
}

const MOCK_ACTIONS = [
    { agent: 'Jarvis', action: 'Optimisation de la vélocité financière sur Defcon...', type: 'process' },
    { agent: 'Sentinel', action: 'Scan périmétrique terminé : 0 intrusion détectée.', type: 'security' },
    { agent: 'Alpha', action: 'Insight : Le taux de conversion Auclaire est exceptionnel (+12%).', type: 'insight' },
    { agent: 'Jarvis', action: 'Génération du rapport de rentabilité hebdomadaire...', type: 'process' },
    { agent: 'Sentinel', action: 'Mise à jour des pare-feu DRS effectuée avec succès.', type: 'success' },
    { agent: 'Alpha', action: 'Observation : 3 baleines potentielles identifiées dans le flux.', type: 'insight' },
];

export function SentienceStream() {
    const [logs, setLogs] = useState<AgentLog[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial logs
        const initial = Array.from({ length: 4 }).map((_, i) => ({
            id: `init-${i}`,
            timestamp: new Date(Date.now() - (4 - i) * 10000),
            ...MOCK_ACTIONS[i % MOCK_ACTIONS.length]
        })) as AgentLog[];
        setLogs(initial);

        // Simulation loop
        const interval = setInterval(() => {
            const randomAction = MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)];
            const newLog: AgentLog = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
                ...randomAction as any
            };
            setLogs(prev => [...prev.slice(-30), newLog]);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getIcon = (type: AgentLog['type']) => {
        switch (type) {
            case 'process': return <Cpu className="w-3 h-3 text-blue-400" />;
            case 'insight': return <Zap className="w-3 h-3 text-amber-400" />;
            case 'security': return <ShieldCheck className="w-3 h-3 text-emerald-400" />;
            case 'success': return <Activity className="w-3 h-3 text-emerald-500" />;
        }
    };

    return (
        <div className="glass-panel flex flex-col h-full bg-black/60 border border-white/5 overflow-hidden group">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-zinc-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Sentience Stream</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-500/80 uppercase">Live Intelligence</span>
                </div>
            </div>

            {/* Terminal Feed */}
            <div 
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-3 font-mono scrollbar-hide"
            >
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
                        <span className="text-[9px] text-zinc-600 mt-1 shrink-0">
                            [{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                        </span>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                    log.agent === 'Jarvis' ? 'text-blue-400' : 
                                    log.agent === 'Alpha' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                    {log.agent}
                                </span>
                                {getIcon(log.type)}
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-relaxed">
                                {log.action}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Footer */}
            <div className="p-3 bg-black border-t border-white/5 flex items-center justify-between">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Neural Link Active</p>
                <div className="flex gap-1">
                    <div className="w-4 h-1 bg-blue-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-2/3 animate-[pulse_2s_infinite]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
