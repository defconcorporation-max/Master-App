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
    X,
    User,
    Tag,
    AlertCircle,
    Info,
    CreditCard
} from 'lucide-react';
import { 
    format, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameDay, 
    addWeeks,
    subWeeks
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
    rawTask?: OmniTask;
    rawActivity?: AppActivity;
}

const HOUR_HEIGHT = 48; // Compactness requested by user (1 hour = 48 pixels)

export function OmniCalendar({ tasks, activities = [] }: OmniCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Lock to a 7-day grid view (standard calendar)
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); 
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const allEvents = useMemo(() => {
        const events: CalendarEvent[] = [];

        tasks.forEach(t => {
            let parsed = new Date(t.date);
            const isInvalidDate = isNaN(parsed.getTime());
            
            // Pending tasks with no date fall back to today at a default time, else ignore
            if (isInvalidDate && t.status !== 'done') {
                parsed = new Date();
                parsed.setHours(9,0,0,0); // generic morning placement
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
                type,
                amount: t.budget,
                rawTask: t
            });
        });

        // Add Financial Activities
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
                hasSpecificTime: true, // Enforced to plot properly on timeline
                rawActivity: a
            });
        });

        return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [tasks, activities]);

    const getEventStyles = (event: CalendarEvent) => {
        if (event.kind === 'financial') {
            if (event.type === 'payment') return { bg: 'bg-emerald-500/90', text: 'text-emerald-50', icon: <DollarSign className="w-2.5 h-2.5" /> };
            if (event.type === 'invoice') return { bg: 'bg-blue-500/90', text: 'text-blue-50', icon: <FileText className="w-2.5 h-2.5" /> };
            if (event.type === 'expense') return { bg: 'bg-red-500/90', text: 'text-red-50', icon: <TrendingDown className="w-2.5 h-2.5" /> };
        } else {
            if (event.type === 'shoot') return { bg: 'bg-amber-500/20 border-l-amber-500 border border-amber-500/20 text-amber-100', icon: <Camera className="w-3 h-3 text-amber-400" /> };
            if (event.type === 'travel') return { bg: 'bg-purple-500/20 border-l-purple-500 border border-purple-500/20 text-purple-100', icon: <MapPin className="w-3 h-3 text-purple-400" /> };
            if (event.type === 'job') return { bg: 'bg-slate-500/20 border-l-slate-500 border border-slate-500/20 text-slate-100', icon: <Zap className="w-3 h-3 text-slate-400" /> };
            if (event.type === 'design') return { bg: 'bg-cyan-500/20 border-l-cyan-500 border border-cyan-500/20 text-cyan-100', icon: <Briefcase className="w-3 h-3 text-cyan-400" /> };
        }
        return { bg: 'bg-zinc-500/20 border-l-zinc-500 border border-white/5 text-zinc-300', icon: <CalendarIcon className="w-3 h-3 text-zinc-400" /> };
    };

    const nextPeriod = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevPeriod = () => setCurrentDate(subWeeks(currentDate, 1));
    const today = () => setCurrentDate(new Date());

    const wrapperClasses = isFullscreen 
        ? "fixed inset-0 z-[100] p-4 sm:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in" 
        : "h-full w-full";
        
    const containerClasses = isFullscreen
        ? "flex flex-col h-full bg-slate-900 border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 mx-auto"
        : "flex flex-col h-full bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative";

    const fetchDayEvents = (targetDay: Date) => {
        return allEvents.filter(e => {
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

    const calculateTop = (date: Date) => {
        const h = date.getHours();
        const m = date.getMinutes();
        return h * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
    };

    const calculateHeight = (event: CalendarEvent) => {
        if (event.kind === 'financial') return 20; // Hyper compact height for financial items (doesn't take time)
        
        if (event.endDate && event.endDate.getTime() > event.date.getTime()) {
            const dur = (event.endDate.getTime() - event.date.getTime()) / (1000 * 60 * 60);
            // Cap height visually if it spans multiple days to just finish at midnight for this specific visual column
            return Math.max(HOUR_HEIGHT, dur * HOUR_HEIGHT);
        }
        return Math.max(HOUR_HEIGHT, HOUR_HEIGHT * 1.5); // Default assumed duration 1.5 hours for operational events
    };

    return (
        <>
            <div className={wrapperClasses}>
                <div className={containerClasses}>
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between shrink-0 bg-zinc-900/40">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight leading-snug">Agenda Omni-Opérationnel</h2>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Vue Dense Structurée</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={today}
                                className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20 shrink-0"
                            >
                                Aujourd'hui
                            </button>
                            <div className="flex items-center bg-black/60 rounded-xl border border-white/5 p-1 px-2 shrink-0">
                                <button onClick={prevPeriod} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <h3 className="text-xs font-black tracking-widest uppercase text-white min-w-[140px] text-center">
                                    {format(startDate, 'd MMM')} — {format(endDate, 'd MMM yyyy')}
                                </h3>
                                <button onClick={nextPeriod} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white border border-white/5 hidden sm:block shrink-0"
                                title={isFullscreen ? "Réduire" : "Plein écran"}
                            >
                                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Grid Layout (Header Days) */}
                    <div className="flex border-b border-white/5 bg-black/20 shrink-0 pr-2">
                        <div className="w-[50px] shrink-0 border-r border-white/5" /> {/* Empty corner for time axis */}
                        <div className="flex-1 grid grid-cols-7">
                            {days.map(day => {
                                const isToday = isSameDay(day, new Date());
                                return (
                                    <div key={day.toString()} className="flex flex-col items-center py-2 border-r border-white/5 last:border-r-0">
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                                            {format(day, 'EEE', { locale: fr })}
                                        </span>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isToday ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-300'}`}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* All-Day / General Events Zone */}
                    <div className="flex border-b border-white/10 shrink-0 pr-2 bg-zinc-900/60 shadow-md z-30">
                        <div className="w-[50px] shrink-0 border-r border-white/5 flex items-center justify-center p-1">
                            <span className="text-[7.5px] font-black text-slate-500 uppercase -rotate-90 tracking-widest opacity-60">Général</span>
                        </div>
                        <div className="flex-1 grid grid-cols-7">
                            {days.map(day => {
                                const allDayEvents = fetchDayEvents(day).filter(e => !e.hasSpecificTime && e.kind !== 'financial');
                                return (
                                    <div key={`allday-${day.toString()}`} className="border-r border-white/5 last:border-r-0 p-1 flex flex-col gap-1 min-h-[40px] max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                        {allDayEvents.map(event => {
                                            const styles = getEventStyles(event);
                                            return (
                                                <div 
                                                    key={`ad-${event.id}`} 
                                                    title={`${event.appName} - ${event.title}`}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className={`px-1.5 py-1 rounded text-[9px] font-bold truncate ${styles.bg} border-l-[3px] text-white shadow-sm cursor-pointer hover:brightness-125 transition-all`}
                                                >
                                                    {event.title}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Grid Layout (Time Tracking Body) */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <div className="flex min-w-[600px] relative">
                            {/* Time Axis (Left Spine) */}
                            <div className="w-[50px] shrink-0 border-r border-white/5 relative bg-black/20 z-20">
                                {hours.map(h => (
                                    <div key={`time-${h}`} className="relative border-b border-white/5" style={{ height: HOUR_HEIGHT }}>
                                        <span className="absolute -top-[7px] right-2 text-[9px] text-slate-500 font-bold font-mono">
                                            {h.toString().padStart(2, '0')}:00
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* 7-Days Columns Container */}
                            <div className="flex-1 grid grid-cols-7 relative">
                                {/* Horizontal grid lines for aesthetics */}
                                <div className="absolute inset-0 pointer-events-none flex flex-col">
                                    {hours.map(h => (
                                        <div key={`line-${h}`} className="border-b border-white/[0.03] w-full" style={{ height: HOUR_HEIGHT }} />
                                    ))}
                                </div>

                                {/* Daily event columns */}
                                {days.map(day => {
                                    const timedEvents = fetchDayEvents(day).filter(e => e.hasSpecificTime || e.kind === 'financial');
                                    return (
                                        <div 
                                            key={`col-${day.toString()}`} 
                                            className="relative border-r border-white/5 last:border-r-0 h-[1152px]" // 24 * 48px
                                        >
                                            {timedEvents.map((event, idx) => {
                                                const styles = getEventStyles(event);
                                                const topOffset = calculateTop(new Date(event.date));
                                                const isFinancial = event.kind === 'financial';
                                                
                                                if (isFinancial) {
                                                    // Tiny financial blip perfectly placed
                                                    return (
                                                        <div 
                                                            key={`${event.id}-${idx}`}
                                                            title={`${event.title} - $${event.amount}`}
                                                            onClick={() => setSelectedEvent(event)}
                                                            className={`absolute left-1 right-1 sm:left-2 sm:right-2 rounded ${styles.bg} shadow-md flex items-center gap-1.5 px-1.5 overflow-hidden group cursor-pointer hover:scale-105 transition-transform z-20`}
                                                            style={{ top: topOffset, height: calculateHeight(event) }}
                                                        >
                                                            {styles.icon}
                                                            <span className={`text-[8px] font-black uppercase truncate ${styles.text}`}>
                                                                {event.appName.substring(0, 3)}: ${event.amount?.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                // Substantial Operational Block
                                                return (
                                                    <div 
                                                        key={`${event.id}-${idx}`}
                                                        title={`${event.title}`}
                                                        onClick={() => setSelectedEvent(event)}
                                                        className={`absolute left-1 right-1 sm:left-1.5 sm:right-1.5 rounded-md border-l-[3px] ${styles.bg} p-1.5 flex flex-col gap-0.5 overflow-hidden group hover:brightness-125 cursor-pointer hover:z-30 transition-all z-10 shadow-sm`}
                                                        style={{ 
                                                            top: topOffset, 
                                                            height: calculateHeight(event),
                                                            minHeight: HOUR_HEIGHT 
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[8px] font-black font-mono tracking-tighter opacity-70">
                                                                {event.hasSpecificTime ? format(event.date, 'HH:mm') : ''}
                                                            </span>
                                                            <div className="hidden sm:block">
                                                                {styles.icon}
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] sm:text-[10px] font-bold leading-tight line-clamp-2 pr-1 text-white">
                                                            {event.title}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${getEventStyles(selectedEvent).bg} border border-white/10`}>
                                    {getEventStyles(selectedEvent).icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/5 bg-black/40 ${getEventStyles(selectedEvent).text}`}>
                                    {selectedEvent.appName}
                                </span>
                            </div>
                            <button 
                                onClick={() => setSelectedEvent(null)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                                    {selectedEvent.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-300">
                                    <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                                        <CalendarIcon className="w-4 h-4 text-indigo-400" />
                                        {format(selectedEvent.date, 'EEEE d MMM yyyy', { locale: fr })}
                                    </div>
                                    {selectedEvent.hasSpecificTime && (
                                        <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                                            <Clock className="w-4 h-4 text-indigo-400" />
                                            {format(selectedEvent.date, 'HH:mm')}
                                            {selectedEvent.endDate && ` - ${format(selectedEvent.endDate, 'HH:mm')}`}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional OmniTask Metadata */}
                            {selectedEvent.rawTask && (
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedEvent.rawTask.clientName && (
                                        <div className="col-span-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Client Associé</p>
                                                <p className="text-sm text-slate-200 font-semibold">{selectedEvent.rawTask.clientName}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-slate-400" />
                                        <div>
                                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Statut</p>
                                            <p className="text-xs text-slate-200 font-semibold capitalize">{selectedEvent.rawTask.status || 'Inconnu'}</p>
                                        </div>
                                    </div>

                                    {selectedEvent.rawTask.stage && (
                                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                            <div>
                                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Étape (Stage)</p>
                                                <p className="text-xs text-slate-200 font-semibold capitalize">{selectedEvent.rawTask.stage}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedEvent.rawTask.jewelryType && (
                                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-purple-400" />
                                            <div>
                                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Type de Bijou</p>
                                                <p className="text-xs text-slate-200 font-semibold capitalize">{selectedEvent.rawTask.jewelryType}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Additional AppActivity Metadata */}
                            {selectedEvent.rawActivity && (
                                <div className="space-y-3">
                                    {selectedEvent.rawActivity.description && (
                                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                                <Info className="w-3 h-3" /> Description de la transaction
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium">
                                                {selectedEvent.rawActivity.description}
                                            </p>
                                        </div>
                                    )}
                                    {selectedEvent.rawActivity.metadata && (
                                        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {selectedEvent.rawActivity.metadata}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Financial Total */}
                            {selectedEvent.amount !== undefined && selectedEvent.amount > 0 && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CreditCard className="w-5 h-5" />
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/70">
                                            {selectedEvent.kind === 'financial' ? 'Montant de la Transaction' : 'Budget Est./Associé'}
                                        </span>
                                    </div>
                                    <span className="text-xl font-black text-emerald-400">
                                        ${selectedEvent.amount.toLocaleString()} <span className="text-sm font-bold opacity-70">USD</span>
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {/* Footer Action */}
                        <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end">
                            <button 
                                onClick={() => setSelectedEvent(null)}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
