"use client";

import { useEffect, useState, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface ProcessLog {
    id: string;
    name: string;
    status: string;
    logs: string[];
}

export function UnifiedLogs() {
    const [processes, setProcesses] = useState<ProcessLog[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Poll for active processes and their logs every 2 seconds
        const poll = setInterval(async () => {
            try {
                const res = await fetch('/api/process?all=true');
                const data = await res.json();
                
                if (data.processes) {
                    // Fetch logs for each process
                    const fullProcesses = await Promise.all(data.processes.map(async (p: any) => {
                        const logRes = await fetch(`/api/process?id=${p.id}`);
                        const logData = await logRes.json();
                        return { ...p, logs: logData.logs || [] };
                    }));
                    setProcesses(fullProcesses);
                    
                    if (!activeTab && fullProcesses.length > 0) {
                        setActiveTab(fullProcesses[0].id);
                    }
                }
            } catch (e) {}
        }, 2000);

        return () => clearInterval(poll);
    }, [activeTab]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [processes, activeTab]);

    if (processes.length === 0) {
        return null;
    }

    const currentLogs = processes.find(p => p.id === activeTab)?.logs || [];

    return (
        <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-80 font-mono text-sm">
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center gap-4 overflow-x-auto custom-scrollbar">
                <Terminal className="w-4 h-4 text-zinc-500 shrink-0" />
                {processes.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setActiveTab(p.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md transition whitespace-nowrap ${activeTab === p.id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${p.status === 'running' ? 'bg-emerald-500 animate-pulse' : p.status === 'failed' ? 'bg-red-500' : 'bg-zinc-500'}`} />
                        {p.name}
                    </button>
                ))}
            </div>
            <div ref={scrollRef} className="p-4 overflow-y-auto flex-1 text-zinc-300 custom-scrollbar leading-relaxed">
                {currentLogs.length === 0 ? (
                    <span className="text-zinc-600">Waiting for logs...</span>
                ) : (
                    currentLogs.map((log, i) => (
                        <div key={i} className="whitespace-pre-wrap font-mono text-[11px] md:text-xs">
                            {log}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
