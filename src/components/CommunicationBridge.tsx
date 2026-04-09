'use client';

import React, { useState } from 'react';
import { 
    Send, 
    Mail, 
    MessageSquare, 
    Phone, 
    Users, 
    Globe, 
    Smartphone,
    CheckCircle2,
    Loader2
} from 'lucide-react';

export function CommunicationBridge() {
    const [channel, setChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSend = () => {
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setIsSent(true);
            setTimeout(() => setIsSent(false), 3000);
        }, 1500);
    };

    const channels = [
        { id: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email', color: 'text-blue-400' },
        { id: 'sms', icon: <Smartphone className="w-4 h-4" />, label: 'SMS', color: 'text-purple-400' },
        { id: 'whatsapp', icon: <MessageSquare className="w-4 h-4" />, label: 'WhatsApp', color: 'text-emerald-400' },
    ];

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-slate-900 to-slate-900/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                        <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Comms Bridge</h2>
                        <p className="text-xs text-slate-400">Empire-wide messaging relay</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-hide">
                {/* Channel Selector */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Protocol Selector</label>
                    <div className="grid grid-cols-3 gap-2">
                        {channels.map((ch) => (
                            <button
                                key={ch.id}
                                onClick={() => setChannel(ch.id as any)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                                    channel === ch.id 
                                        ? 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                                }`}
                            >
                                <div className={channel === ch.id ? ch.color : 'text-slate-500'}>
                                    {ch.icon}
                                </div>
                                <span className={`text-[10px] font-bold mt-2 ${channel === ch.id ? 'text-white' : 'text-slate-500'}`}>
                                    {ch.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recipient Input */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Target Identity</label>
                    <div className="relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search client globally..."
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>
                </div>

                {/* Message Content */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Payload Content</label>
                    <textarea 
                        rows={4}
                        placeholder="Compose message mission profile..."
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                    />
                </div>
            </div>

            <div className="p-6 bg-slate-950/40 border-t border-white/5">
                <button
                    onClick={handleSend}
                    disabled={isSending || isSent}
                    className={`w-full group relative overflow-hidden flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
                        isSent 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]'
                    }`}
                >
                    {isSending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Transmitting...
                        </>
                    ) : isSent ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Relay Success
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Broadcast Payload
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
