"use client";

import { CheckCircle2, CircleDashed, Github, Trello, Copy, MoreHorizontal } from 'lucide-react';

const MOCK_TICKETS = [
    { id: 'AUC-142', app: 'Auclaire', title: 'Implement Stripe webhook for failed payments', status: 'todo', source: 'linear' },
    { id: 'DEF-89', app: 'Defcon', title: 'Database migration causing high latency', status: 'in-progress', source: 'github' },
    { id: 'MSTR-12', app: 'Master App', title: 'Connect Sentry webhook parser', status: 'todo', source: 'github' },
    { id: 'AUC-141', app: 'Auclaire', title: 'Update landing page hero copy', status: 'done', source: 'linear' },
];

export function TicketAggregator() {
    return (
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mx-1 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                        Cross-App Ticket Aggregator
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Unified inbox pulling from GitHub, Linear, and Jira.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-black px-3 py-1.5 rounded-lg border border-zinc-800">
                    4 Open Issues
                </div>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
                {MOCK_TICKETS.map((ticket, i) => (
                    <div key={i} className="group relative flex items-center gap-4 p-3 bg-black border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all cursor-pointer">
                        <div className="shrink-0">
                            {ticket.status === 'done' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : ticket.status === 'in-progress' ? (
                                <CircleDashed className="w-5 h-5 text-blue-500 animate-spin-slow" />
                            ) : (
                                <CircleDashed className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold truncate ${ticket.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                {ticket.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{ticket.app}</span>
                                <span className="text-xs text-zinc-600 shrink-0">•</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{ticket.id}</span>
                            </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-3">
                            {ticket.source === 'github' ? <Github className="w-4 h-4 text-zinc-500" /> : <Trello className="w-4 h-4 text-blue-400" />}
                            <button className="text-zinc-600 hover:text-white transition opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-4 w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold tracking-widest uppercase transition">
                Create Global Issue +
            </button>
        </div>
    );
}
