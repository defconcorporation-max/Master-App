'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
    Car,
    Wrench,
    Maximize2,
    Minimize2,
    X,
    User,
    Tag,
    AlertCircle,
    Info,
    CreditCard,
    Plus,
    Loader2
} from 'lucide-react';
import { 
    format, 
    startOfWeek, 
    endOfWeek, 
    startOfMonth,
    endOfMonth,
    eachDayOfInterval, 
    isSameDay,
    isSameMonth,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    addDays,
    subDays,
    getDay
} from 'date-fns';
import { fr } from 'date-fns/locale';

type ViewMode = 'week' | 'month' | 'day';

interface OmniCalendarProps {
    tasks: OmniTask[];
    activities?: AppActivity[];
    onShootCreated?: () => void;
}

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    appName: string;
    kind: 'financial' | 'operational';
    type: 'payment' | 'invoice' | 'expense' | 'shoot' | 'job' | 'travel' | 'design' | 'detailing' | 'other';
    amount?: number;
    clientName?: string;
    endDate?: Date;
    hasSpecificTime?: boolean;
    rawTask?: OmniTask;
    rawActivity?: AppActivity;
}

interface DefconClient {
    id: number;
    name: string;
    company_name: string;
}

const HOUR_HEIGHT = 44;

export function OmniCalendar({ tasks, activities = [], onShootCreated }: OmniCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showAddShoot, setShowAddShoot] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [defconClients, setDefconClients] = useState<DefconClient[]>([]);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [shootForm, setShootForm] = useState({
        title: '', date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '12:00',
        clientId: '', color: 'amber'
    });

    // Auto-scroll to 6am on mount and when view changes
    useEffect(() => {
        if (scrollRef.current && viewMode !== 'month') {
            scrollRef.current.scrollTop = 6 * HOUR_HEIGHT;
        }
    }, [viewMode, currentDate]);

    // Load Defcon clients when modal opens
    useEffect(() => {
        if (showAddShoot && defconClients.length === 0) {
            fetch('/api/shoots/clients').then(r => r.json()).then(d => {
                if (d.clients) setDefconClients(d.clients);
            }).catch(() => {});
        }
    }, [showAddShoot, defconClients.length]);

    const handleCreateShoot = useCallback(async () => {
        if (!shootForm.title || !shootForm.date) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/shoots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: shootForm.title,
                    date: shootForm.date,
                    startTime: shootForm.startTime,
                    endTime: shootForm.endTime,
                    clientId: shootForm.clientId ? Number(shootForm.clientId) : null,
                    color: shootForm.color
                })
            });
            if (res.ok) {
                setShowAddShoot(false);
                setShootForm({ title: '', date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '12:00', clientId: '', color: 'amber' });
                onShootCreated?.();
            }
        } catch (e) { console.error(e); }
        setIsSubmitting(false);
    }, [shootForm, onShootCreated]);

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
            if (t.appName.includes('DRS')) type = 'detailing';

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
                clientName: t.clientName,
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
            if (event.type === 'detailing') return { bg: 'bg-orange-500/20 border-l-orange-500 border border-orange-500/20 text-orange-100', icon: <Car className="w-3 h-3 text-orange-400" /> };
            if (event.type === 'travel') return { bg: 'bg-purple-500/20 border-l-purple-500 border border-purple-500/20 text-purple-100', icon: <MapPin className="w-3 h-3 text-purple-400" /> };
            if (event.type === 'job') return { bg: 'bg-slate-500/20 border-l-slate-500 border border-slate-500/20 text-slate-100', icon: <Zap className="w-3 h-3 text-slate-400" /> };
            if (event.type === 'design') return { bg: 'bg-cyan-500/20 border-l-cyan-500 border border-cyan-500/20 text-cyan-100', icon: <Briefcase className="w-3 h-3 text-cyan-400" /> };
        }
        return { bg: 'bg-zinc-500/20 border-l-zinc-500 border border-white/5 text-zinc-300', icon: <CalendarIcon className="w-3 h-3 text-zinc-400" /> };
    };

    const nextPeriod = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
        else setCurrentDate(addWeeks(currentDate, 1));
    };
    const prevPeriod = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
        else setCurrentDate(subWeeks(currentDate, 1));
    };
    const today = () => setCurrentDate(new Date());

    const wrapperClasses = isFullscreen 
        ? "fixed inset-0 z-[100] p-4 sm:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in" 
        : "h-full w-full";
        
    const containerClasses = isFullscreen
        ? "flex flex-col h-full glass-panel border border-indigo-500/30 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 mx-auto"
        : "flex flex-col h-full glass-panel overflow-hidden relative";

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

    // Collision detection: place overlapping events side-by-side
    const layoutEvents = (events: CalendarEvent[]) => {
        if (events.length === 0) return [];

        // Sort by start time, then by duration (longer first)
        const sorted = [...events].sort((a, b) => {
            const diff = a.date.getTime() - b.date.getTime();
            if (diff !== 0) return diff;
            const aDur = (a.endDate?.getTime() || (a.date.getTime() + 90 * 60000)) - a.date.getTime();
            const bDur = (b.endDate?.getTime() || (b.date.getTime() + 90 * 60000)) - b.date.getTime();
            return bDur - aDur; // longer events first
        });

        // For each event, compute its end time in pixels
        const getEnd = (e: CalendarEvent) => {
            const topPx = calculateTop(e.date);
            const heightPx = calculateHeight(e);
            return topPx + heightPx;
        };

        // Assign columns using a greedy algorithm
        const columns: { endPx: number }[][] = [];
        const result: { event: CalendarEvent; col: number; totalCols: number }[] = [];

        sorted.forEach(event => {
            const topPx = calculateTop(event.date);
            let placed = false;

            for (let c = 0; c < columns.length; c++) {
                // Check if this column has space (no overlap with last event in this column)
                const lastInCol = columns[c][columns[c].length - 1];
                if (topPx >= lastInCol.endPx - 1) { // -1px tolerance
                    columns[c].push({ endPx: getEnd(event) });
                    result.push({ event, col: c, totalCols: 0 }); // totalCols computed later
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                columns.push([{ endPx: getEnd(event) }]);
                result.push({ event, col: columns.length - 1, totalCols: 0 });
            }
        });

        // Now compute totalCols for each group of overlapping events
        // Simple approach: for each event, find how many columns overlap with it
        result.forEach(r => {
            const topPx = calculateTop(r.event.date);
            const bottomPx = getEnd(r.event);
            let maxCol = r.col;
            result.forEach(other => {
                const otherTop = calculateTop(other.event.date);
                const otherBottom = getEnd(other.event);
                if (otherTop < bottomPx && otherBottom > topPx) {
                    maxCol = Math.max(maxCol, other.col);
                }
            });
            r.totalCols = maxCol + 1;
        });

        return result;
    };

    return (
        <>
            <div className={wrapperClasses}>
                <div className={containerClasses}>
                    {/* Header */}
                    <div className="p-3 sm:p-5 border-b border-white/[0.05] flex flex-wrap gap-2 sm:gap-4 items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 sm:p-2.5 border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl bg-indigo-500/10">
                                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-lg font-black text-slate-100 tracking-tight leading-snug uppercase">Agenda</h2>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black hidden sm:block">Omni-Opérationnel</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-3 flex-wrap justify-end">
                            {/* View Mode Toggle */}
                            <div className="flex bg-black/60 rounded-lg border border-white/5 p-0.5">
                                {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`px-2 sm:px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                                            viewMode === mode 
                                                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/30' 
                                                : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                    >
                                        {mode === 'day' ? 'Jour' : mode === 'week' ? 'Sem.' : 'Mois'}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => setShowAddShoot(true)}
                                className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 hover:text-amber-300 rounded-lg transition-colors border border-amber-500/30 shrink-0"
                                title="Planifier un tournage Defcon"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={today}
                                className="px-2 sm:px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20 shrink-0"
                            >
                                Auj.
                            </button>
                            <div className="flex items-center bg-black/60 rounded-xl border border-white/5 p-1 px-1 sm:px-2 shrink-0">
                                <button onClick={prevPeriod} className="p-1 sm:p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <h3 className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-white min-w-[80px] sm:min-w-[140px] text-center">
                                    {viewMode === 'month'
                                        ? format(currentDate, 'MMMM yyyy', { locale: fr })
                                        : viewMode === 'day'
                                            ? format(currentDate, 'EEE d MMM', { locale: fr })
                                            : `${format(startDate, 'd MMM')} — ${format(endDate, 'd MMM')}`
                                    }
                                </h3>
                                <button onClick={nextPeriod} className="p-1 sm:p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
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

                    {/* === MONTH VIEW === */}
                    {viewMode === 'month' && (() => {
                        const monthStart = startOfMonth(currentDate);
                        const monthEnd = endOfMonth(currentDate);
                        const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
                        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
                        const calDays = eachDayOfInterval({ start: calStart, end: calEnd });
                        const weekDayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

                        return (
                            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                                <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden">
                                    {weekDayNames.map(d => (
                                        <div key={d} className="py-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-500 bg-black/40">
                                            {d}
                                        </div>
                                    ))}
                                    {calDays.map(day => {
                                        const dayEvents = fetchDayEvents(day);
                                        const isCurrentMonth = isSameMonth(day, currentDate);
                                        const isToday = isSameDay(day, new Date());
                                        return (
                                            <div
                                                key={day.toISOString()}
                                                onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                                                className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 cursor-pointer transition-colors hover:bg-white/5 ${
                                                    isCurrentMonth ? 'bg-black/20' : 'bg-black/40 opacity-40'
                                                } ${isToday ? 'ring-1 ring-indigo-500/50' : ''}`}
                                            >
                                                <span className={`text-[10px] sm:text-xs font-bold ${isToday ? 'bg-indigo-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center' : 'text-slate-400'}`}>
                                                    {format(day, 'd')}
                                                </span>
                                                <div className="mt-1 flex flex-col gap-0.5">
                                                    {dayEvents.slice(0, 3).map(ev => {
                                                        const styles = getEventStyles(ev);
                                                        return (
                                                            <div key={ev.id} className={`text-[7px] sm:text-[8px] font-bold truncate px-1 py-0.5 rounded ${styles.bg}`}>
                                                                {ev.title}
                                                            </div>
                                                        );
                                                    })}
                                                    {dayEvents.length > 3 && (
                                                        <span className="text-[7px] text-slate-500 font-bold">+{dayEvents.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    {/* === DAY VIEW === */}
                    {viewMode === 'day' && (() => {
                        const dayEvents = fetchDayEvents(currentDate);
                        const timedEvents = dayEvents.filter(e => e.hasSpecificTime || e.kind === 'financial');
                        const allDayEvents = dayEvents.filter(e => !e.hasSpecificTime && e.kind !== 'financial');

                        return (
                            <>
                                {/* All-day events */}
                                {allDayEvents.length > 0 && (
                                    <div className="border-b border-white/10 p-2 bg-zinc-900/60 flex flex-wrap gap-1 shrink-0">
                                        {allDayEvents.map(ev => {
                                            const styles = getEventStyles(ev);
                                            return (
                                                <div key={ev.id} className={`px-2 py-1 rounded text-[10px] font-bold ${styles.bg} border-l-[3px]`}>
                                                    {ev.title} {ev.clientName && `— ${ev.clientName}`}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {/* Time grid — single column */}
                                <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                    <div className="flex relative">
                                        <div className="w-[50px] shrink-0 border-r border-white/5 bg-black/20">
                                            {hours.map(h => (
                                                <div key={h} className="relative border-b border-white/5" style={{ height: HOUR_HEIGHT }}>
                                                    <span className="absolute -top-[7px] right-2 text-[9px] text-slate-500 font-bold font-mono">
                                                        {h.toString().padStart(2, '0')}:00
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 relative" style={{ height: 24 * HOUR_HEIGHT }}>
                                            {hours.map(h => (
                                                <div key={h} className="absolute w-full border-b border-white/[0.03]" style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }} />
                                            ))}
                                            {layoutEvents(timedEvents).map(({ event, col, totalCols }, idx) => {
                                                const styles = getEventStyles(event);
                                                const topOffset = calculateTop(new Date(event.date));
                                                const isFinancial = event.kind === 'financial';
                                                const widthPct = 100 / totalCols;
                                                const leftPct = col * widthPct;
                                                return (
                                                    <div
                                                        key={`${event.id}-${idx}`}
                                                        title={event.title}
                                                        onClick={() => window.dispatchEvent(new CustomEvent('entity-selected', { detail: event.rawTask || event.rawActivity }))}
                                                        className={`absolute rounded-md ${isFinancial ? '' : 'border-l-[3px]'} ${styles.bg} p-1.5 sm:p-2 overflow-hidden cursor-pointer hover:brightness-125 transition-all z-10 shadow-sm`}
                                                        style={{ 
                                                            top: topOffset, 
                                                            height: calculateHeight(event), 
                                                            minHeight: isFinancial ? 20 : HOUR_HEIGHT,
                                                            left: `calc(${leftPct}% + 2px)`,
                                                            width: `calc(${widthPct}% - 4px)`
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            {styles.icon}
                                                            <span className="text-[9px] sm:text-[10px] font-black font-mono opacity-70">
                                                                {event.hasSpecificTime ? format(event.date, 'HH:mm') : ''}
                                                                {event.endDate && event.hasSpecificTime ? ` — ${format(event.endDate, 'HH:mm')}` : ''}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 text-white mt-0.5">{event.title}</span>
                                                        {event.clientName && <span className="text-[9px] sm:text-[10px] opacity-50 truncate block">{event.clientName}</span>}
                                                        {isFinancial && event.amount && <span className="text-[9px] font-bold text-emerald-300">${event.amount.toLocaleString()}</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}

                    {/* === WEEK VIEW === */}
                    {viewMode === 'week' && (
                        <>
                            {/* Day Headers */}
                            <div className="hidden sm:flex border-b border-white/5 bg-black/20 shrink-0 pr-2">
                                <div className="w-[50px] shrink-0 border-r border-white/5" />
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

                            {/* All-Day Zone */}
                            <div className="hidden sm:flex border-b border-white/10 shrink-0 pr-2 bg-zinc-900/60 shadow-md z-30">
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
                                                            onClick={() => window.dispatchEvent(new CustomEvent('entity-selected', { detail: event.rawTask || event.rawActivity }))}
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

                            {/* Time Grid */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hidden sm:block">
                                <div className="flex relative">
                                    <div className="w-[50px] shrink-0 border-r border-white/5 relative bg-black/20 z-20">
                                        {hours.map(h => (
                                            <div key={`time-${h}`} className="relative border-b border-white/5" style={{ height: HOUR_HEIGHT }}>
                                                <span className="absolute -top-[7px] right-2 text-[9px] text-slate-500 font-bold font-mono">
                                                    {h.toString().padStart(2, '0')}:00
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 grid grid-cols-7 relative">
                                        <div className="absolute inset-0 pointer-events-none flex flex-col">
                                            {hours.map(h => (
                                                <div key={`line-${h}`} className="border-b border-white/[0.03] w-full" style={{ height: HOUR_HEIGHT }} />
                                            ))}
                                        </div>
                                        {days.map(day => {
                                            const timedEvents = fetchDayEvents(day).filter(e => e.hasSpecificTime || e.kind === 'financial');
                                            return (
                                                <div key={`col-${day.toString()}`} className="relative border-r border-white/5 last:border-r-0" style={{ height: 24 * HOUR_HEIGHT }}>
                                                    {layoutEvents(timedEvents).map(({ event, col, totalCols }, idx) => {
                                                        const styles = getEventStyles(event);
                                                        const topOffset = calculateTop(new Date(event.date));
                                                        const isFinancial = event.kind === 'financial';
                                                        const widthPct = 100 / totalCols;
                                                        const leftPct = col * widthPct;
                                                        if (isFinancial) {
                                                            return (
                                                                <div key={`${event.id}-${idx}`} title={`${event.title} - $${event.amount}`}
                                                                    onClick={() => window.dispatchEvent(new CustomEvent('entity-selected', { detail: event.rawTask || event.rawActivity }))}
                                                                    className={`absolute rounded ${styles.bg} shadow-md flex items-center gap-1 px-1 overflow-hidden cursor-pointer hover:scale-105 transition-transform z-20`}
                                                                    style={{ top: topOffset, height: calculateHeight(event), left: `calc(${leftPct}% + 1px)`, width: `calc(${widthPct}% - 2px)` }}
                                                                >
                                                                    {styles.icon}
                                                                    <span className={`text-[8px] font-black uppercase truncate ${styles.text}`}>
                                                                        ${event.amount?.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div key={`${event.id}-${idx}`} title={event.title}
                                                                onClick={() => window.dispatchEvent(new CustomEvent('entity-selected', { detail: event.rawTask || event.rawActivity }))}
                                                                className={`absolute rounded-md border-l-[3px] ${styles.bg} p-1 flex flex-col gap-0.5 overflow-hidden cursor-pointer hover:brightness-125 hover:z-30 transition-all z-10 shadow-sm`}
                                                                style={{ top: topOffset, height: calculateHeight(event), minHeight: HOUR_HEIGHT, left: `calc(${leftPct}% + 1px)`, width: `calc(${widthPct}% - 2px)` }}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-[8px] font-black font-mono tracking-tighter opacity-70">
                                                                        {event.hasSpecificTime ? format(event.date, 'HH:mm') : ''}
                                                                    </span>
                                                                    {styles.icon}
                                                                </div>
                                                                <span className="text-[9px] font-bold leading-tight line-clamp-2 text-white">{event.title}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile: show day view fallback */}
                            <div className="sm:hidden flex-1 overflow-y-auto p-2">
                                <p className="text-[10px] text-slate-500 text-center mb-2 font-bold">Utilisez la vue Jour pour mobile</p>
                                <button onClick={() => setViewMode('day')} className="w-full py-3 bg-indigo-500/20 text-indigo-300 rounded-xl text-sm font-bold border border-indigo-500/30">
                                    Passer en vue Jour
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Add Shoot Modal */}
                {showAddShoot && (
                    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-lg font-black text-white uppercase tracking-wide">Nouveau Tournage</h3>
                                </div>
                                <button onClick={() => setShowAddShoot(false)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Titre du Shoot *</label>
                                    <input
                                        value={shootForm.title}
                                        onChange={e => setShootForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Ex: Vidéo corporative XYZ"
                                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Date *</label>
                                        <input
                                            type="date"
                                            value={shootForm.date}
                                            onChange={e => setShootForm(p => ({ ...p, date: e.target.value }))}
                                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Début</label>
                                        <input
                                            type="time"
                                            value={shootForm.startTime}
                                            onChange={e => setShootForm(p => ({ ...p, startTime: e.target.value }))}
                                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Fin</label>
                                        <input
                                            type="time"
                                            value={shootForm.endTime}
                                            onChange={e => setShootForm(p => ({ ...p, endTime: e.target.value }))}
                                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Client Defcon</label>
                                    <select
                                        value={shootForm.clientId}
                                        onChange={e => setShootForm(p => ({ ...p, clientId: e.target.value }))}
                                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50"
                                    >
                                        <option value="">— Sélectionner un client —</option>
                                        {defconClients.map(c => (
                                            <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setShowAddShoot(false)}
                                    className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleCreateShoot}
                                    disabled={isSubmitting || !shootForm.title || !shootForm.date}
                                    className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-black bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    Créer le Shoot
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
