'use client';

import React, { useMemo } from 'react';
import { OmniTask } from '@/lib/db-clients';
import { 
    LayoutDashboard, 
    MoreVertical, 
    Calendar, 
    Zap,
    Circle,
    CheckCircle2,
    Clock
} from 'lucide-react';

interface OmniKanbanProps {
    tasks: OmniTask[];
}

export function OmniKanban({ tasks }: OmniKanbanProps) {
    const columns = [
        { id: 'todo', title: 'To Do', color: 'text-slate-400' },
        { id: 'in_progress', title: 'Active Ops', color: 'text-blue-400' },
        { id: 'done', title: 'Complete', color: 'text-emerald-400' }
    ];

    const getStatusGroup = (status: string) => {
        if (status === 'done') return 'done';
        if (status === 'in_progress') return 'in_progress';
        return 'todo';
    };

    const getAppTag = (appName: string) => {
        if (appName.includes('Auclaire')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (appName.includes('Defcon')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (appName.includes('Viva')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    return (
        <div className="flex flex-col h-full glass-panel overflow-hidden">
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl bg-indigo-500/10">
                        <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-slate-100 uppercase">Tactical Ops Board</h2>
                        <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Omni-Empire Force</p>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {[1,2].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-center text-[9px] font-black tracking-widest text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                            AI
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-x-auto p-6 flex gap-6 scrollbar-hide">
                {columns.map(col => (
                    <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-black uppercase tracking-widest ${col.color}`}>
                                    {col.title}
                                </span>
                                <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-slate-500 font-bold">
                                    {tasks.filter(t => getStatusGroup(t.status) === col.id).length}
                                </span>
                            </div>
                            <MoreVertical className="w-4 h-4 text-slate-600" />
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                            {tasks
                                .filter(t => getStatusGroup(t.status) === col.id)
                                .map(task => (
                                    <div 
                                        key={task.id}
                                        className="p-4 glass-pill group hover:border-white/20 transition-all cursor-pointer rounded-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] blur-xl group-hover:bg-indigo-500/10 transition-colors" />
                                        
                                        <div className="flex items-center justify-between mb-3 relative z-10">
                                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ${getAppTag(task.appName)}`}>
                                                {task.appName}
                                            </span>
                                            <Zap className={`w-3 h-3 ${task.priority === 'high' || task.priority === 'critical' ? 'text-orange-400 fill-orange-400/20' : 'text-slate-600'}`} />
                                        </div>
                                        
                                        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-snug mb-4 relative z-10">
                                            {task.title}
                                        </h3>

                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 relative z-10">
                                            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[10px]">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(task.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {task.status === 'done' ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                ) : (
                                                    <Clock className="w-4 h-4 text-slate-600" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
