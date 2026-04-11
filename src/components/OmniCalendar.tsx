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
    Camera,
    Maximize2,
    Minimize2,
    LayoutGrid,
    List
} from 'lucide-react';
import { 
    format, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameDay, 
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    isSameMonth
} from 'date-fns';
import { fr } from 'date-fns/locale';

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
    endDate?: Date;
    hasSpecificTime?: boolean;
}

export function OmniCalendar({ tasks, activities = [] }: OmniCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const allEvents = useMemo(() => {
        const events: CalendarEvent[] = [];

        // 1. Add Operational Tasks
        tasks.forEach(t => {
            let parsed = new Date(t.date);
            const isInvalidDate = isNaN(parsed.getTime());
            
            // Only fallback to today if we literally have no date at all for a pending task.
            if (isInvalidDate && t.status !== 'done') {
                parsed = new Date();
            } else if (isInvalidDate) {
                return;
            }

            let parsedEnd: Date | undefined;
            if (t.endDate) {
                parsedEnd = new Date(t.endDate);
                if (isNaN(parsedEnd.getTime())) parsedEnd = undefined;
            }
            
            let type: CalendarEvent['type'] = 'job';
            if (t.appName.includes('Defcon')) type = 'shoot';
            if (t.appName.includes('Viva')) type = 'travel';
            if (t.appName.includes('Auclaire')) type = 'design';

            events.push({
                id: `op-${t.id}`,
                title: t.title,
                date: parsed,
                endDate: parsedEnd,
                hasSpecificTime: t.hasSpecificTime,
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
                amount: a.amount,
                hasSpecificTime: true // Enforced so financials sort chronologically in Day View
            });
        });

        // Sort events chronologically inside the day
        return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [tasks, activities]);

    const getEventStyles = (event: CalendarEvent) => {
        if (event.kind === 'financial') {
            if (event.type === 'payment') return { bg: 'bg-emerald-500/10', border: 'border-l-emerald-500', text: 'text-emerald-300', iconText: 'text-emerald-400', icon: <DollarSign className="w-3 h-3" /> };
            if (event.type === 'invoice') return { bg: 'bg-blue-500/10', border: 'border-l-blue-500', text: 'text-blue-300', iconText: 'text-blue-400', icon: <FileText className="w-3 h-3" /> };
            if (event.type === 'expense') return { bg: 'bg-red-500/10', border: 'border-l-red-500', text: 'text-red-300', iconText: 'text-red-400', icon: <TrendingDown className="w-3 h-3" /> };
        } else {
            if (event.type === 'shoot') return { bg: 'bg-amber-500/20', border: 'border-l-amber-500', text: 'text-amber-100', iconText: 'text-amber-400', icon: <Camera className="w-3 h-3" />, highContrastBg: 'bg-amber-500/40 border border-amber-500' };
            if (event.type === 'travel') return { bg: 'bg-purple-500/20', border: 'border-l-purple-500', text: 'text-purple-100', iconText: 'text-purple-400', icon: <MapPin className="w-3 h-3" />, highContrastBg: 'bg-purple-500/40 border border-purple-500' };
            if (event.type === 'job') return { bg: 'bg-slate-500/20', border: 'border-l-slate-500', text: 'text-slate-100', iconText: 'text-slate-400', icon: <Zap className="w-3 h-3" />, highContrastBg: 'bg-slate-500/40 border border-slate-500' };
            if (event.type === 'design') return { bg: 'bg-cyan-500/20', border: 'border-l-cyan-500', text: 'text-cyan-100', iconText: 'text-cyan-400', icon: <Briefcase className="w-3 h-3" />, highContrastBg: 'bg-cyan-500/40 border border-cyan-500' };
        }
        return { bg: 'bg-zinc-500/10', border: 'border-l-zinc-500', text: 'text-zinc-300', iconText: 'text-zinc-400', icon: <CalendarIcon className="w-3 h-3" />, highContrastBg: 'bg-zinc-500/30' };
    };

    const nextPeriod = () => setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1));
    const prevPeriod = () => setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : subDays(currentDate, 1));
    const today = () => setCurrentDate(new Date());

    const wrapperClasses = isFullscreen 
        ? "fixed inset-0 z-[100] p-4 sm:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in" 
        : "h-full";
        
    const containerClasses = isFullscreen
        ? "flex flex-col h-full bg-slate-900 border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        : "flex flex-col h-full bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl";

    const fetchDayEvents = (targetDay: Date) => {
        return allEvents.filter(e => {
            // Spanning multiday logic
            const eStart = new Date(e.date);
            eStart.setHours(0,0,0,0);
            const checkDay = new Date(targetDay);
            checkDay.setHours(0,0,0,0);
            
            if (e.endDate) {
                const eEnd = new Date(e.endDate);
                eEnd.setHours(23,59,59,999);
                return checkDay >= eStart && checkDay <= eEnd;
            }
            return isSameDay(e.date, targetDay);
        });
    }

    return (
        <div className={wrapperClasses}>
            <div className={containerClasses}>
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-black/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <CalendarIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Global Agenda</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 capitalize">Mode: {viewMode === 'week' ? 'Vue Hebdomadaire (Résumé)' : 'Vue Journalière (Détaillée)'}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex bg-black border border-white/10 rounded-xl overflow-hidden">
                            <button 
                                onClick={() => setViewMode('day')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${viewMode === 'day' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            >
                                <List className="w-3.5 h-3.5" />
                                Jour
                            </button>
                            <div className="w-[1px] bg-white/10" />
                            <button 
                                onClick={() => setViewMode('week')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${viewMode === 'week' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Semaine
                            </button>
                        </div>
                        
                        <button 
                            onClick={today}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20"
                        >
                            Aujourd'hui
                        </button>
                        <div className="flex items-center bg-black/60 rounded-xl border border-white/5 p-1 px-2">
                            <button onClick={prevPeriod} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h3 className="text-sm font-black tracking-widest uppercase text-white min-w-[200px] text-center">
                                {viewMode === 'week' 
                                    ? <>{format(startDate, 'd MMM')} — {format(endDate, 'd MMM yyyy')}</>
                                    : <>{format(currentDate, "EEEE d MMMM yyyy", { locale: fr })}</>
                                }
                            </h3>
                            <button onClick={nextPeriod} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white border border-white/5 hidden sm:block"
                            title={isFullscreen ? "Minimize" : "Expand to Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Calendar Body */}
                <div className="flex-1 flex flex-col pt-4 px-4 pb-4 overflow-hidden">
                    
                    {viewMode === 'week' ? (
                        <>
                            {/* WEEKLY GRID (Summarized view) */}
                            <div className="grid grid-cols-7 mb-3 gap-3">
                                {days.map(day => {
                                    const isToday = isSameDay(day, new Date());
                                    return (
                                        <div key={day.toString()} className="flex flex-col items-center">
                                            <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                {format(day, 'EEE', { locale: fr })}
                                            </span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isToday ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-slate-300'}`}>
                                                {format(day, 'd')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="flex-1 grid grid-cols-7 gap-3 min-h-0">
                                {days.map((day, idx) => {
                                    const isToday = isSameDay(day, new Date());
                                    const dayEvents = fetchDayEvents(day);

                                    return (
                                        <div 
                                            key={day.toString() + idx} 
                                            className={`
                                                h-full rounded-2xl flex flex-col border border-white/[0.02] bg-zinc-900/40 relative overflow-hidden
                                                ${isToday ? 'bg-indigo-900/10 border-indigo-500/20 ring-1 ring-indigo-500/20' : ''}
                                            `}
                                        >
                                            <div className="flex-1 overflow-y-auto space-y-2 p-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent">
                                                {dayEvents.length === 0 && (
                                                    <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] text-zinc-600 font-bold uppercase">Rien de prévu</span>
                                                    </div>
                                                )}
                                                {dayEvents.map(event => {
                                                    const styles = getEventStyles(event);
                                                    const isFinancial = event.kind === 'financial';

                                                    if (isFinancial) {
                                                        // Compact Financial Event (Week)
                                                        return (
                                                            <div 
                                                                key={event.id}
                                                                title={`${event.appName} - ${event.title}`}
                                                                className={`px-2 py-1 rounded border border-white/5 ${styles.bg} flex items-center justify-between group cursor-pointer hover:brightness-125 transition-all mb-1`}
                                                            >
                                                                <div className={`flex items-center gap-1 ${styles.iconText} truncate`}>
                                                                    {styles.icon}
                                                                    <span className="text-[9px] font-bold uppercase truncate max-w-[50px]">{event.title}</span>
                                                                </div>
                                                                {typeof event.amount === 'number' && (
                                                                    <span className={`text-[9px] font-black ${styles.text}`}>
                                                                        ${event.amount.toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    // Standard Operational Event (Week)
                                                    return (
                                                        <div 
                                                            key={event.id} 
                                                            title={`${event.appName} - ${event.title}`}
                                                            className={`px-2.5 py-2 rounded-lg border-l-4 ${styles.bg} ${styles.border} flex flex-col group cursor-pointer hover:brightness-125 transition-all shadow-sm`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className={`flex items-center gap-1 ${styles.iconText}`}>
                                                                    {styles.icon}
                                                                    {event.hasSpecificTime ? (
                                                                        <span className="text-[9px] font-black tracking-widest uppercase">
                                                                            {format(event.date, 'HH:mm')}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[8px] font-black uppercase tracking-wider line-clamp-1 max-w-[60px]">
                                                                            {event.appName.replace(/app/i, '').trim()}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <span className={`text-xs font-bold leading-tight ${styles.text} line-clamp-2`}>
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
                        </>
                    ) : (
                        /* DAILY VIEW (Time-Grid View) */
                        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900/40 rounded-2xl border border-white/5 relative">
                            <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                <div className="flex flex-col min-w-max md:min-w-0">
                                    {Array.from({ length: 24 }).map((_, hour) => {
                                        const eventsInHour = fetchDayEvents(currentDate).filter(e => {
                                            const eHour = new Date(e.date).getHours();
                                            return eHour === hour;
                                        });

                                        return (
                                            <div key={hour} className="flex min-h-[60px] border-b border-white/5 group hover:bg-white/[0.02] transition-colors relative">
                                                {/* Left Time Axis */}
                                                <div className="w-16 sm:w-20 pt-2 pr-2 sm:pr-4 text-right border-r border-white/5 shrink-0 flex flex-col items-end">
                                                    <span className={`text-[10px] sm:text-xs font-mono font-bold ${eventsInHour.length > 0 ? 'text-indigo-400' : 'text-slate-600'}`}>
                                                        {hour.toString().padStart(2, '0')}:00
                                                    </span>
                                                </div>

                                                {/* Events Container for this Hour */}
                                                <div className="flex-1 p-2 flex flex-col gap-2 relative">
                                                    {eventsInHour.map(event => {
                                                        const styles = getEventStyles(event);
                                                        const isFinancial = event.kind === 'financial';
                                                        const exactMinute = new Date(event.date).getMinutes();
                                                        
                                                        // Compact Financial Block
                                                        if (isFinancial) {
                                                            return (
                                                                <div 
                                                                    key={event.id}
                                                                    title={event.title}
                                                                    className={`px-3 py-1.5 rounded-lg border border-white/5 ${styles.bg} inline-flex items-center gap-3 hover:brightness-125 transition-all shadow-sm max-w-xl group/fin cursor-default`}
                                                                >
                                                                    <div className={`p-1 rounded-md border border-white/5 ${styles.highContrastBg}`}>
                                                                        {styles.icon}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] sm:text-xs font-black uppercase text-slate-400 min-w-[36px]">
                                                                            {hour.toString().padStart(2, '0')}:{exactMinute.toString().padStart(2, '0')}
                                                                        </span>
                                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/40 ${styles.text}`}>
                                                                            {event.appName}
                                                                        </span>
                                                                        <span className="text-[10px] sm:text-xs font-bold text-slate-300 truncate max-w-[150px] sm:max-w-xs">{event.title}</span>
                                                                    </div>
                                                                    {typeof event.amount === 'number' && (
                                                                        <span className={`text-xs font-black ml-auto ${styles.text} drop-shadow-sm`}>
                                                                            ${event.amount.toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        }

                                                        // Compact Operational Card
                                                        return (
                                                            <div 
                                                                key={event.id} 
                                                                className={`p-2.5 sm:p-3 rounded-xl shadow-lg border-l-4 ${styles.bg} ${styles.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10 hover:brightness-110 transition-all max-w-4xl`}
                                                            >
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                                                        <span className="text-[10px] sm:text-lg font-black font-mono text-white tracking-tighter">
                                                                            {event.hasSpecificTime ? `${hour.toString().padStart(2, '0')}:${exactMinute.toString().padStart(2, '0')}` : hour.toString().padStart(2, '0') + ':00'}
                                                                        </span>
                                                                        <div className={`p-1.5 rounded-lg border border-white/10 shadow-inner ${styles.highContrastBg}`}>
                                                                            {styles.icon}
                                                                        </div>
                                                                        <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/5 bg-black/40 ${styles.text}`}>
                                                                            {event.appName}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="flex flex-col flex-1 min-w-0">
                                                                        <span className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                                                                            {event.title}
                                                                        </span>
                                                                        {event.endDate && event.date < event.endDate && (
                                                                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                                                Jusqu'à {format(event.endDate, 'HH:mm')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {typeof event.amount === 'number' && event.amount > 0 && (
                                                                    <div className="px-3 py-1 sm:py-1.5 rounded-lg bg-black/40 border border-white/5 shrink-0 flex flex-col items-end">
                                                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Budget</span>
                                                                        <span className="text-xs sm:text-sm font-black text-emerald-400">
                                                                            ${event.amount.toLocaleString()}
                                                                        </span>
                                                                    </div>
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
                    )}
                </div>
            </div>
        </div>
    );
}
