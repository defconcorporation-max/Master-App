'use client';

import React, { useMemo } from 'react';
import { OmniTask } from '@/lib/db-clients';
import { 
    Zap, 
    Shield, 
    Target, 
    Activity, 
    AlertTriangle, 
    ArrowRight,
    Radio,
    Clock
} from 'lucide-react';

interface WarRoomProps {
    tasks: OmniTask[];
}

export function WarRoom({ tasks }: WarRoomProps) {
    const activeOps = useMemo(() => {
        return tasks.filter(t => t.status === 'in_progress').slice(0, 5);
    }, [tasks]);

    const upcomingEvents = useMemo(() => {
        return tasks
            .filter(t => t.status !== 'done')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
    }, [tasks]);

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.1)] flex flex-col h-full">
            {/* Header: Combat HUD Style */}
            <div className="p-5 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Shield className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">The War Room</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Global Ops Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-zinc-800/80 rounded border border-zinc-700 font-mono text-[10px] text-zinc-400">
                        LAT: 48.85 / LON: 2.35
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-8">
                {/* Critical Targets */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Target className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Missions</span>
                        </div>
                        <span className="text-[10px] text-blue-500 font-bold">{activeOps.length} DETECTED</span>
                    </div>

                    <div className="space-y-3">
                        {activeOps.length === 0 ? (
                            <div className="p-4 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-600">
                                <span className="text-xs">No active tactical operations.</span>
                            </div>
                        ) : (
                            activeOps.map((op) => (
                                <div key={op.id} className="relative group p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-blue-500/30 transition-all flex items-center justify-between overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50 group-hover:bg-blue-400 transition-colors" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-tighter italic">
                                            {op.appName} // SECURE_LINE
                                        </span>
                                        <h3 className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors truncate max-w-[180px]">
                                            {op.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] text-zinc-500 font-mono">STATUS</span>
                                            <span className="text-[9px] font-bold text-emerald-500 font-mono">ENGAGED</span>
                                        </div>
                                        <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Tactical Timeline */}
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500/80">Imminent Ops</span>
                    </div>

                    <div className="space-y-3">
                        {upcomingEvents.map((ev, i) => (
                            <div key={ev.id} className="flex items-start gap-4">
                                <div className="flex flex-col items-center pt-1">
                                    <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                                    {i < upcomingEvents.length - 1 && <div className="w-px h-10 bg-zinc-800" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase">
                                            {new Date(ev.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5 text-zinc-600" />
                                            <span className="text-[8px] text-zinc-600 font-mono italic">ETA: UNKNOWN</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 leading-tight">
                                        {ev.title} <span className="text-zinc-700 italic">[{ev.appName}]</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Metrics */}
            <div className="mt-auto p-4 bg-zinc-900/60 border-t border-zinc-900 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Threat Level</span>
                    <div className="flex items-center gap-1">
                        <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-1/4" />
                        </div>
                        <span className="text-[9px] font-bold text-emerald-500 font-mono">LOW</span>
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Sync Health</span>
                    <div className="flex items-center gap-1">
                        <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-full" />
                        </div>
                        <span className="text-[9px] font-bold text-blue-500 font-mono">100%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
