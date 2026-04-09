"use client";

import { useEffect, useState, useRef } from 'react';
import { Activity, Radio, ArrowRightLeft } from 'lucide-react';

interface Event {
    id: string;
    source: string;
    type: string;
    data: any;
    timestamp: string;
}

export function CrossTalkStream() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLive, setIsLive] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLive) return;

        const checkEvents = async () => {
            try {
                const res = await fetch('/api/webhooks');
                const data = await res.json();
                if (data.events) {
                    setEvents(data.events);
                }
            } catch (e) {}
        };
        checkEvents();
        const poll = setInterval(checkEvents, 2000);
        return () => clearInterval(poll);
    }, [isLive]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    return (
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-80 relative font-mono text-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            
            <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <Radio className="w-4 h-4" />
                    Cross-Talk Event Stream
                </div>
                <button 
                    onClick={() => setIsLive(!isLive)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition"
                >
                    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`} />
                    {isLive ? 'LIVESTREAM' : 'PAUSED'}
                </button>
            </div>

            <div ref={scrollRef} className="p-4 overflow-y-auto flex-1 text-zinc-300 custom-scrollbar space-y-3 flex flex-col-reverse">
                {events.length === 0 ? (
                    <span className="text-zinc-600 m-auto">Waiting for Application Cross-Talk...</span>
                ) : (
                    events.map((ev, i) => (
                        <div key={ev.id} className="relative pl-4 border-l-2 border-zinc-800 py-1 hover:border-indigo-500 transition-colors group">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-xs">{ev.source}</span>
                                    {ev.type === 'cross_talk_dispatch' && <ArrowRightLeft className="w-3 h-3 text-indigo-400" />}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded tracking-widest uppercase ${
                                        ev.type === 'cross_talk_dispatch' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-800 text-zinc-400'
                                    }`}>
                                        {ev.type.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <span className="text-[10px] text-zinc-600">
                                    {new Date(ev.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <pre className="text-[10px] bg-black/40 p-2 rounded border border-zinc-800/50 text-zinc-400 overflow-x-auto">
                                {JSON.stringify(ev.data, null, 2)}
                            </pre>
                        </div>
                    ))
                )}
            </div>
            
            <button 
               onClick={async () => {
                   // Inject a test webhook
                   await fetch('/api/webhooks', {
                       method: 'POST',
                       body: JSON.stringify({ source: 'Auclaire', type: 'sale_completed', data: { user: 'simulated@test.com', mrr_boost: 49 } })
                   });
               }}
               className="mx-4 mb-4 mt-2 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 py-1.5 text-xs font-bold rounded-lg transition"
            >
               + SIMULATE WEBHOOK
            </button>
        </div>
    );
}
