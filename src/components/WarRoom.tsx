'use client';

import React, { useMemo } from 'react';
import { OmniTask } from '@/lib/db-clients';
import { 
    Shield, 
    Target, 
    Activity, 
    Briefcase,
    DollarSign,
    User,
    AlertTriangle,
    Clock
} from 'lucide-react';

interface WarRoomProps {
    tasks: OmniTask[];
}

export function WarRoom({ tasks }: WarRoomProps) {
    const criticalOps = useMemo(() => {
        return tasks.filter(t => 
            t.status !== 'done' && 
            (t.priority === 'critical' || t.priority === 'high' || (t.budget && t.budget > 1000))
        ).sort((a, b) => (b.budget || 0) - (a.budget || 0)).slice(0, 5);
    }, [tasks]);

    const activeOps = useMemo(() => {
        return tasks.filter(t => t.status === 'in_progress').slice(0, 4);
    }, [tasks]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
            {/* Header: Executive Dashboard Style */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-slate-900 to-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">War Room</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">High-Value Dependencies</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critical Value</span>
                    <span className="text-sm font-black text-red-400">
                        ${criticalOps.reduce((s, t) => s + (t.budget || 0), 0).toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="flex-1 p-5 space-y-6 overflow-y-auto scrollbar-hide">
                {/* Critical Targets */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                        <Target className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">High Priority</span>
                    </div>

                    <div className="space-y-2">
                        {criticalOps.length === 0 ? (
                            <div className="p-4 border border-dashed border-white/5 rounded-2xl text-center text-slate-500">
                                <span className="text-xs">No critical operations detected.</span>
                            </div>
                        ) : (
                            criticalOps.map((op) => (
                                <div key={op.id} className="group p-3 bg-red-500/5 border border-red-500/20 rounded-2xl hover:bg-red-500/10 transition-colors flex flex-col gap-2 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                                    <div className="flex items-center justify-between pl-1">
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase className="w-3 h-3 text-red-400" />
                                            <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">
                                                {op.appName}
                                            </span>
                                        </div>
                                        {op.budget ? (
                                            <span className="text-[10px] font-black text-white bg-red-500/20 px-2 py-0.5 rounded">
                                                ${op.budget.toLocaleString()}
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3 className="text-sm font-bold text-white leading-tight pl-1">
                                        {op.title}
                                    </h3>
                                    <div className="flex items-center flex-wrap gap-2 pl-1 mt-1">
                                        {op.clientName && (
                                            <div className="flex items-center gap-1 text-[9px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-white/5">
                                                <User className="w-2.5 h-2.5" />
                                                {op.clientName}
                                            </div>
                                        )}
                                        {op.stage && (
                                            <div className="flex items-center gap-1 text-[9px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                                                {op.stage.replace('_', ' ')}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 text-[9px] text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/10 uppercase font-bold">
                                            Priority: {op.priority}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Active Operations */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Execution</span>
                    </div>

                    <div className="space-y-2">
                        {activeOps.map((op) => (
                            <div key={op.id} className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider">
                                        {op.appName}
                                    </span>
                                    {op.date && (
                                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {new Date(op.date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xs font-semibold text-white">
                                    {op.title}
                                </h3>
                                {op.clientName && (
                                    <p className="text-[10px] text-slate-400">Client: {op.clientName}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
