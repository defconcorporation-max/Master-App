'use client';

import React, { useMemo, useState } from 'react';
import { AppStats, AppActivity } from '@/lib/db-clients';
import { 
    Clock, 
    CreditCard, 
    Briefcase, 
    AlertCircle, 
    TrendingUp, 
    X,
    Flame,
    CalendarDays
} from 'lucide-react';

interface GlobalActivityStreamProps {
    allStats: {
        auclaire: AppStats;
        defcon: AppStats;
        antigravity: AppStats;
        drs: AppStats;
    };
}

export function GlobalActivityStream({ allStats }: GlobalActivityStreamProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Combine all activity feeds from all apps
    const allUnifiedActivities = useMemo(() => {
        const combined: AppActivity[] = [];
        Object.values(allStats).forEach(app => {
            if (app.activityFeed) {
                combined.push(...app.activityFeed);
            }
        });
        
        // Sort by date descending
        return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allStats]);

    // Dashboard only shows top 20 to keep it clean
    const recentActivities = useMemo(() => allUnifiedActivities.slice(0, 20), [allUnifiedActivities]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'invoice_created': return <CreditCard className="w-4 h-4 text-blue-400" />;
            case 'payment_collected': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
            case 'project_created': return <Briefcase className="w-4 h-4 text-purple-400" />;
            case 'commission_paid': return <Flame className="w-4 h-4 text-orange-400" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const getAppColor = (appName: string) => {
        if (appName.includes('Auclaire')) return 'border-blue-500/30 bg-blue-500/5';
        if (appName.includes('Defcon')) return 'border-emerald-500/30 bg-emerald-500/5';
        if (appName.includes('Viva')) return 'border-purple-500/30 bg-purple-500/5';
        if (appName.includes('DRS')) return 'border-slate-500/30 bg-slate-500/5';
        return 'border-slate-700 bg-slate-800/50';
    };

    const renderActivityList = (activities: AppActivity[]) => {
        if (activities.length === 0) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 py-10">
                    <Clock className="w-12 h-12 opacity-20" />
                    <p className="text-sm">Waiting for incoming transmission...</p>
                </div>
            );
        }

        let lastDateString = '';
        const elements: React.ReactNode[] = [];

        activities.forEach((activity) => {
            const dateObj = new Date(activity.date);
            const currentDateString = dateObj.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            if (currentDateString !== lastDateString) {
                // Add Date Separator
                elements.push(
                    <div key={`date-${currentDateString}`} className="flex items-center gap-3 py-4 my-2">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 shadow-sm">
                            <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                {currentDateString}
                            </span>
                        </div>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                );
                lastDateString = currentDateString;
            }

            // Add Activity Item
            elements.push(
                <div 
                    key={activity.id} 
                    className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg mb-3 ${getAppColor(activity.appName)}`}
                >
                    <div className="flex-shrink-0 mt-1">
                        <div className="p-2 bg-slate-900/80 rounded-lg border border-white/10 group-hover:border-white/20 shadow-inner">
                            {getIcon(activity.type)}
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {activity.appName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono" suppressHydrationWarning>
                                {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                        </div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {activity.title}
                        </h3>
                        
                        {activity.clientName && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-200 bg-blue-500/10 w-fit px-2 py-0.5 rounded border border-blue-500/20">
                                <Briefcase className="w-3 h-3" />
                                <span className="font-medium">{activity.clientName}</span>
                            </div>
                        )}

                        <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {activity.description}
                        </p>
                        
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {activity.amount ? (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    (activity.type === 'expense_logged' || activity.type === 'commission_paid') 
                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                                        : (activity.type === 'invoice_created' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]')
                                }`}>
                                    {(activity.type === 'expense_logged' || activity.type === 'commission_paid') ? '- ' : '+ '}${activity.amount.toLocaleString()}
                                </span>
                            ) : null}
                            {activity.metadata && (
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-medium border border-white/5 uppercase">
                                    {activity.metadata}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            );
        });

        return elements;
    };

    return (
        <>
            {/* WIDGET VIEW */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl relative">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-900/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Flame className="w-5 h-5 text-blue-400 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Empire Newsroom</h2>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Live operational activity stream</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 scrollbar-hide">
                    {renderActivityList(recentActivities)}
                </div>

                <div className="p-3 bg-slate-950/80 border-t border-white/5 text-center shrink-0 backdrop-blur-md">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-4 py-2 rounded-full font-bold uppercase tracking-widest transition-all"
                    >
                        View Full Command Log
                    </button>
                </div>
            </div>

            {/* FULL SCREEN MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative w-full max-w-4xl max-h-full bg-slate-900 border border-slate-700/50 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <Clock className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">Archive Intel</h2>
                                    <p className="text-xs text-blue-400/80 uppercase tracking-widest mt-1">Complete Historical Record</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-default bg-slate-900/50">
                            <div className="max-w-2xl mx-auto">
                                {renderActivityList(allUnifiedActivities)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
