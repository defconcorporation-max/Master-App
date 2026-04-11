'use client';

import React, { useState } from 'react';
import { OmniTask } from '@/lib/db-clients';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Zap,
    Briefcase
} from 'lucide-react';
import { 
    format, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addWeeks,
    subWeeks,
    parseISO
} from 'date-fns';

interface OmniCalendarProps {
    tasks: OmniTask[];
}

export function OmniCalendar({ tasks }: OmniCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getAppTag = (appName: string) => {
        if (appName.includes('Auclaire')) return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
        if (appName.includes('Defcon')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
        if (appName.includes('Viva')) return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
        if (appName.includes('DRS')) return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
        return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' };
    };

    const getIconForApp = (appName: string) => {
        if (appName.includes('Auclaire')) return <Briefcase className="w-3 h-3" />;
        if (appName.includes('Defcon')) return <Clock className="w-3 h-3" />;
        if (appName.includes('Viva')) return <MapPin className="w-3 h-3" />;
        if (appName.includes('DRS')) return <Zap className="w-3 h-3" />;
        return <CalendarIcon className="w-3 h-3" />;
    };

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const today = () => setCurrentDate(new Date());

    return (
        <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <CalendarIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Global Agenda</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">Empire-wide operations and events</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={today}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20"
                    >
                        Today
                    </button>
                    <div className="flex items-center bg-black/40 rounded-xl border border-white/5 p-1">
                        <button onClick={prevWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="text-sm font-black tracking-widest uppercase text-white min-w-[180px] text-center">
                            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                        </h3>
                        <button onClick={nextWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="grid grid-cols-7 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="flex-1 grid grid-cols-7 grid-rows-1 gap-3">
                    {days.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());
                        
                        // Find tasks for this day
                        const dayTasks = tasks.filter(t => {
                            try {
                                const tDate = parseISO(t.date);
                                return isSameDay(tDate, day);
                            } catch (e) {
                                return false; // Skip invalid dates
                            }
                        });

                        return (
                            <div 
                                key={day.toString() + idx} 
                                className={`
                                    h-full rounded-xl p-3 flex flex-col border transition-all duration-200
                                    ${isCurrentMonth ? 'bg-slate-800/20 border-white/5 hover:border-white/10' : 'bg-transparent border-transparent opacity-40'}
                                    ${isToday ? 'ring-1 ring-indigo-500/50 bg-indigo-500/5' : ''}
                                `}
                            >
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className={`text-xs font-bold ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayTasks.length > 0 && (
                                        <span className="text-[9px] font-black shrink-0 px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                            {dayTasks.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
                                    {dayTasks.map(task => {
                                        const theme = getAppTag(task.appName);
                                        const icon = getIconForApp(task.appName);
                                        return (
                                            <div 
                                                key={task.id} 
                                                title={task.title}
                                                className={`px-2 py-1.5 rounded-lg border ${theme.bg} ${theme.border} group cursor-pointer hover:opacity-80 transition-opacity`}
                                            >
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className={`text-[8px] font-black uppercase tracking-wider ${theme.text} line-clamp-1`}>
                                                        {task.appName}
                                                    </span>
                                                    <span className={theme.text}>
                                                        {icon}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-semibold text-white/90 leading-tight line-clamp-2 truncate">
                                                    {task.title}
                                                </p>
                                                {task.stage && (
                                                    <p className="text-[9px] text-white/40 mt-0.5 truncate uppercase tracking-widest font-medium">
                                                        {task.stage.replace('_', ' ')}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
