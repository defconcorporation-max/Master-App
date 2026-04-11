'use client';

import React, { useState, useMemo } from 'react';
import { OmniTask, AppActivity } from '@/lib/db-clients';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Zap,
    Briefcase,
    DollarSign,
    FileText,
    TrendingDown,
    Camera
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
    isValid
} from 'date-fns';

interface OmniCalendarProps {
    tasks: OmniTask[];
    activities?: AppActivity[];
}

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    appName: string;
    kind: 'financial' | 'operational';
    type: 'payment' | 'invoice' | 'expense' | 'shoot' | 'job' | 'travel' | 'design' | 'other';
    amount?: number;
}

export function OmniCalendar({ tasks, activities = [] }: OmniCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const allEvents = useMemo(() => {
        const events: CalendarEvent[] = [];

        // 1. Add Operational Tasks
        tasks.forEach(t => {
            let parsed = new Date(t.date);
            const isInvalidDate = isNaN(parsed.getTime());
            
            // Keep active tasks visible by anchoring past pending ones OR ones without a date to today
            if (t.status !== 'done' && (isInvalidDate || parsed < new Date())) {
                parsed = new Date();
            } else if (isInvalidDate) {
                return; // Cannot display a completed task that has no historical date
            }
            
            let type: CalendarEvent['type'] = 'job';
            if (t.appName.includes('Defcon')) type = 'shoot';
            if (t.appName.includes('Viva')) type = 'travel';
            if (t.appName.includes('Auclaire')) type = 'design';

            events.push({
                id: `op-${t.id}`,
                title: t.title,
                date: parsed,
                appName: t.appName,
                kind: 'operational',
                type
            });
        });

        // 2. Add Financial Activities
        activities.forEach(a => {
            const parsed = new Date(a.date);
            if (isNaN(parsed.getTime())) return;

            let type: CalendarEvent['type'] = 'other';
            if (a.type === 'payment_collected') type = 'payment';
            else if (a.type === 'invoice_created') type = 'invoice';
            else if (a.type === 'expense_logged' || a.type === 'commission_paid') type = 'expense';

            events.push({
                id: `fin-${a.id}`,
                title: a.title,
                date: parsed,
                appName: a.appName,
                kind: 'financial',
                type,
                amount: a.amount
            });
        });

        // Sort events: Financials first, then Operational
        return events.sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === 'financial' ? -1 : 1;
            return a.title.localeCompare(b.title);
        });
    }, [tasks, activities]);

    const getEventStyles = (event: CalendarEvent) => {
        if (event.kind === 'financial') {
            if (event.type === 'payment') return { bg: 'bg-emerald-500/20', border: 'border-l-emerald-500', text: 'text-emerald-100', iconText: 'text-emerald-400', icon: <DollarSign className="w-3 h-3" /> };
            if (event.type === 'invoice') return { bg: 'bg-blue-500/20', border: 'border-l-blue-500', text: 'text-blue-100', iconText: 'text-blue-400', icon: <FileText className="w-3 h-3" /> };
            if (event.type === 'expense') return { bg: 'bg-red-500/20', border: 'border-l-red-500', text: 'text-red-100', iconText: 'text-red-400', icon: <TrendingDown className="w-3 h-3" /> };
        } else {
            if (event.type === 'shoot') return { bg: 'bg-amber-500/20', border: 'border-l-amber-500', text: 'text-amber-100', iconText: 'text-amber-400', icon: <Camera className="w-3 h-3" /> };
            if (event.type === 'travel') return { bg: 'bg-purple-500/20', border: 'border-l-purple-500', text: 'text-purple-100', iconText: 'text-purple-400', icon: <MapPin className="w-3 h-3" /> };
            if (event.type === 'job') return { bg: 'bg-slate-500/20', border: 'border-l-slate-500', text: 'text-slate-100', iconText: 'text-slate-400', icon: <Zap className="w-3 h-3" /> };
            if (event.type === 'design') return { bg: 'bg-cyan-500/20', border: 'border-l-cyan-500', text: 'text-cyan-100', iconText: 'text-cyan-400', icon: <Briefcase className="w-3 h-3" /> };
        }
        return { bg: 'bg-zinc-500/20', border: 'border-l-zinc-500', text: 'text-zinc-100', iconText: 'text-zinc-400', icon: <CalendarIcon className="w-3 h-3" /> };
    };

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const today = () => setCurrentDate(new Date());

    return (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <CalendarIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Global Agenda</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">Google Calendar Mode: Financials & Operations</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={today}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20"
                    >
                        Aujourd'hui
                    </button>
                    <div className="flex items-center bg-black/60 rounded-xl border border-white/5 p-1 px-2">
                        <button onClick={prevWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="text-sm font-black tracking-widest uppercase text-white min-w-[200px] text-center">
                            {format(startDate, 'd MMM')} — {format(endDate, 'd MMM yyyy')}
                        </h3>
                        <button onClick={nextWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid (Weekly Mode) */}
            <div className="flex-1 flex flex-col pt-4 px-4 pb-4 overflow-hidden">
                <div className="grid grid-cols-7 mb-3 gap-3">
                    {days.map(day => {
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div key={day.toString()} className="flex flex-col items-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    {format(day, 'EEE')}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isToday ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-slate-300'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="flex-1 grid grid-cols-7 gap-3">
                    {days.map((day, idx) => {
                        const isToday = isSameDay(day, new Date());
                        
                        const dayEvents = allEvents.filter(e => isSameDay(e.date, day));

                        return (
                            <div 
                                key={day.toString() + idx} 
                                className={`
                                    h-full rounded-2xl flex flex-col border border-white/[0.02] bg-zinc-900/40 relative overflow-hidden
                                    ${isToday ? 'bg-indigo-900/10 border-indigo-500/20 ring-1 ring-indigo-500/20' : ''}
                                `}
                            >
                                <div className="flex-1 overflow-y-auto space-y-2 p-2 scrollbar-hide">
                                    {dayEvents.length === 0 && (
                                        <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-zinc-600 font-bold uppercase">No events</span>
                                        </div>
                                    )}
                                    {dayEvents.map(event => {
                                        const styles = getEventStyles(event);
                                        return (
                                            <div 
                                                key={event.id} 
                                                title={`${event.appName} - ${event.title}`}
                                                className={`px-2.5 py-2 rounded-lg border-l-4 ${styles.bg} ${styles.border} flex flex-col group cursor-pointer hover:brightness-125 transition-all shadow-sm`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`flex items-center gap-1 ${styles.iconText}`}>
                                                        {styles.icon}
                                                        <span className="text-[8px] font-black uppercase tracking-wider line-clamp-1 max-w-[60px]">
                                                            {event.appName.replace(/app/i, '').trim()}
                                                        </span>
                                                    </span>
                                                    {typeof event.amount === 'number' && (
                                                        <span className={`text-[10px] font-black ${styles.text}`}>
                                                            ${event.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`text-xs font-semibold leading-tight ${styles.text} line-clamp-2`}>
                                                    {event.title}
                                                </span>
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
