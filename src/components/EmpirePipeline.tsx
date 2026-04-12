'use client';

import React, { useMemo } from 'react';
import { OmniTask } from '@/lib/types';
import { Layers, ArrowRight, Clock, CheckCircle2, Circle, AlertTriangle, Gem, Camera, Zap, MapPin } from 'lucide-react';

interface EmpirePipelineProps {
    tasks: OmniTask[];
}

export function EmpirePipeline({ tasks }: EmpirePipelineProps) {
    const pipeline = useMemo(() => {
        const stages = [
            { key: 'backlog', label: 'Backlog', icon: <Circle className="w-3.5 h-3.5" />, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
            { key: 'todo', label: 'À Faire', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { key: 'in_progress', label: 'En Cours', icon: <Clock className="w-3.5 h-3.5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
            { key: 'done', label: 'Complété', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        ];

        return stages.map(stage => ({
            ...stage,
            tasks: tasks.filter(t => t.status === stage.key),
            value: tasks.filter(t => t.status === stage.key).reduce((s, t) => s + (t.budget || 0), 0),
        }));
    }, [tasks]);

    const totalActive = tasks.filter(t => t.status !== 'done').length;
    const totalValue = tasks.reduce((s, t) => s + (t.budget || 0), 0);

    // Group active tasks by app for the breakdown bar
    const appBreakdown = useMemo(() => {
        const map = new Map<string, { count: number; value: number }>();
        tasks.filter(t => t.status !== 'done').forEach(t => {
            const existing = map.get(t.appName) || { count: 0, value: 0 };
            existing.count++;
            existing.value += t.budget || 0;
            map.set(t.appName, existing);
        });
        return Array.from(map.entries()).sort((a, b) => b[1].value - a[1].value);
    }, [tasks]);

    const getAppIcon = (appName: string) => {
        if (appName.includes('Auclaire')) return <Gem className="w-3 h-3" />;
        if (appName.includes('Defcon')) return <Camera className="w-3 h-3" />;
        if (appName.includes('DRS')) return <Zap className="w-3 h-3" />;
        if (appName.includes('Viva')) return <MapPin className="w-3 h-3" />;
        return <Layers className="w-3 h-3" />;
    };

    const getAppColor = (appName: string) => {
        if (appName.includes('Auclaire')) return 'bg-blue-500/60';
        if (appName.includes('Defcon')) return 'bg-emerald-500/60';
        if (appName.includes('DRS')) return 'bg-red-500/60';
        if (appName.includes('Viva')) return 'bg-purple-500/60';
        return 'bg-slate-500/60';
    };

    const getAppText = (appName: string) => {
        if (appName.includes('Auclaire')) return 'text-blue-400';
        if (appName.includes('Defcon')) return 'text-emerald-400';
        if (appName.includes('DRS')) return 'text-red-400';
        if (appName.includes('Viva')) return 'text-purple-400';
        return 'text-slate-400';
    };

    return (
        <div className="glass-panel overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
            
            {/* Header */}
            <div className="p-6 border-b border-white/[0.05] relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 border border-cyan-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl bg-cyan-500/10">
                            <Layers className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-100 tracking-tight uppercase">Empire Pipeline</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Projets Actifs Inter-Apps</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="glass-pill px-3 py-2 rounded-lg text-center">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Actifs</p>
                            <p className="text-lg font-black text-cyan-400">{totalActive}</p>
                        </div>
                        <div className="glass-pill px-3 py-2 rounded-lg text-center">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Valeur</p>
                            <p className="text-lg font-black text-emerald-400">${(totalValue / 1000).toFixed(0)}k</p>
                        </div>
                    </div>
                </div>

                {/* App breakdown bar */}
                {totalActive > 0 && (
                    <div className="space-y-2">
                        <div className="flex rounded-lg overflow-hidden h-2 bg-black/30">
                            {appBreakdown.map(([app, data]) => (
                                <div
                                    key={app}
                                    className={`${getAppColor(app)} transition-all`}
                                    style={{ width: `${(data.count / totalActive) * 100}%` }}
                                    title={`${app}: ${data.count} projets`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            {appBreakdown.map(([app, data]) => (
                                <div key={app} className={`flex items-center gap-1.5 text-[9px] font-bold ${getAppText(app)}`}>
                                    {getAppIcon(app)}
                                    {app.replace(' APP', '')}: {data.count}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Pipeline Stages */}
            <div className="grid grid-cols-4 divide-x divide-white/[0.03] relative z-10">
                {pipeline.map((stage) => (
                    <div key={stage.key} className="p-4 hover:bg-white/[0.02] transition-all">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={stage.color}>{stage.icon}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stage.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-black text-white">{stage.tasks.length}</span>
                            {stage.value > 0 && (
                                <span className="text-[10px] font-bold text-emerald-500">${stage.value.toLocaleString()}</span>
                            )}
                        </div>
                        
                        {/* Top 3 tasks in this stage */}
                        <div className="space-y-1.5 mt-3">
                            {stage.tasks.slice(0, 3).map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => window.dispatchEvent(new CustomEvent('entity-selected', { detail: task }))}
                                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white/[0.03] transition-all group/task cursor-pointer"
                                >
                                    <div className={`w-1 h-6 rounded-full shrink-0 ${
                                        task.priority === 'critical' ? 'bg-red-500' :
                                        task.priority === 'high' ? 'bg-amber-500' :
                                        task.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-600'
                                    }`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] text-zinc-300 truncate font-medium group-hover/task:text-white transition-colors">
                                            {task.title}
                                        </p>
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase truncate">
                                            {task.appName.replace(' APP', '')}
                                            {task.clientName ? ` · ${task.clientName}` : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {stage.tasks.length > 3 && (
                                <p className="text-[9px] text-slate-600 font-bold pl-3">+{stage.tasks.length - 3} autres</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
