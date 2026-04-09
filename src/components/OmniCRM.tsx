'use client';

import React, { useState, useMemo } from 'react';
import { OmniClient } from '@/lib/db-clients';
import { 
    Search, 
    Filter, 
    User, 
    Users,
    Mail, 
    ExternalLink, 
    Star, 
    MoreHorizontal,
    Briefcase,
    Zap
} from 'lucide-react';

interface OmniCRMProps {
    clients: OmniClient[];
}

export function OmniCRM({ clients }: OmniCRMProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredClients = useMemo(() => {
        return clients.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.appName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [clients, searchQuery]);

    const getAppTheme = (appName: string) => {
        if (appName.includes('Auclaire')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (appName.includes('Defcon')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (appName.includes('DRS')) return 'text-slate-400 bg-white/5 border-white/10';
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Users className="w-6 h-6 text-blue-500" />
                        Global Empire CRM
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">
                        Unified Client Dossiers ({clients.length} Total)
                    </p>
                </div>

                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Search by name, email or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                        <div 
                            key={client.id}
                            className="bg-black/20 border border-white/5 rounded-2xl p-5 hover:bg-black/40 hover:border-blue-500/20 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap className="w-16 h-16 text-blue-400" />
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5">
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${getAppTheme(client.appName)}`}>
                                    {client.appName}
                                </div>
                            </div>

                            <h3 className="text-base font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                                {client.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs">
                                <Mail className="w-3 h-3 text-slate-600" />
                                <span className="truncate">{client.email}</span>
                            </div>

                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-600 font-bold uppercase">Status</span>
                                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-tighter">Verified Active</span>
                                </div>
                                <button className="p-2 bg-white/5 rounded-lg hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 transition-all">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-4">
                    Showing {filteredClients.length} Profiles
                </span>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-white/10 transition-colors">
                        Export Global CSV
                    </button>
                </div>
            </div>
        </div>
    );
}
