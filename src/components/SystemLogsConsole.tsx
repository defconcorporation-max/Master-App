'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Shield, Cpu, Activity, Zap, Server, Globe, CheckCircle2, ChevronRight, Minimize2, Maximize2 } from 'lucide-react';

interface LogEntry {
    id: string;
    timestamp: string;
    service: string;
    message: string;
    status: 'info' | 'success' | 'warning' | 'error';
}

export function SystemLogsConsole() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const services = ['TURSO', 'SUPABASE', 'MONGODB', 'VERCEL_EDGE', 'GHL_WEBHOOK', 'OPENAI_V4', 'PRISMA_ENGINE'];
    const messages = [
        'Query executed successfully in 42ms',
        'Connection established via US-East Gateway',
        'Cache hit for client inventory (auclaire)',
        'Webhook payload received from GoHighLevel',
        'Analytical processing for Top 10 Whales complete',
        'Security handshake successful (JWT Rotation)',
        'Index optimization performed on Defcon table',
        'CRM data harvested from DRS Production',
    ];

    useEffect(() => {
        // Initial logs
        setLogs([
            { id: '1', timestamp: new Date().toLocaleTimeString(), service: 'SYSTEM', message: 'Master App Command Center v4.0 Initialized', status: 'success' },
            { id: '2', timestamp: new Date().toLocaleTimeString(), service: 'AUTH', message: 'Shield Protocol Active: Multi-Tenant Isolation confirmed', status: 'info' },
        ]);

        const interval = setInterval(() => {
            const newLog: LogEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                service: services[Math.floor(Math.random() * services.length)],
                message: messages[Math.floor(Math.random() * messages.length)],
                status: Math.random() > 0.05 ? 'info' : (Math.random() > 0.5 ? 'success' : 'warning'),
            };
            setLogs(prev => [...prev.slice(-20), newLog]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className={`glass-panel border-white/5 bg-black/60 relative overflow-hidden transition-all duration-500 flex flex-col ${isExpanded ? 'h-[800px] shadow-2xl scale-[1.01]' : 'h-[400px]'}`}>
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Empire System Kernel Logs</span>
                </div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
            </div>

            {/* Logs Window */}
            <div 
                ref={scrollRef}
                className="flex-1 p-4 font-mono text-[11px] overflow-y-auto scrollbar-hide space-y-1.5"
            >
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-4 group hover:bg-white/[0.02] py-0.5 rounded px-2">
                        <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                        <span className={`font-black shrink-0 w-24 text-right ${
                            log.service === 'SYSTEM' ? 'text-indigo-400' : 'text-slate-400 opacity-60'
                        }`}>{log.service}</span>
                        <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0 mt-0.5" />
                        <span className={`flex-1 ${
                            log.status === 'success' ? 'text-emerald-400' :
                            log.status === 'warning' ? 'text-amber-400' : 
                            log.status === 'error' ? 'text-red-400' : 'text-zinc-300'
                        }`}>
                            {log.message}
                        </span>
                    </div>
                ))}
                
                {/* Simulated prompt */}
                <div className="flex gap-2 items-center px-2 py-2">
                    <span className="text-indigo-500 font-bold">THE_MASTER@ANTIGRAVITY:~$</span>
                    <span className="w-1.5 h-3.5 bg-indigo-500/50 animate-pulse" />
                </div>
            </div>

            {/* Status Footer */}
            <div className="px-4 py-2 bg-indigo-500/5 border-t border-indigo-500/10 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-indigo-400/60">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Server className="w-3 h-3" /> US-EST-NODES: ACTIVE
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3" /> KERNEL: 4.0.12-LTS
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                    ESTABLISHED ENCRYPTED TUNNEL
                </div>
            </div>
        </div>
    );
}
