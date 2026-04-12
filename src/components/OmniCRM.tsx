'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { EmpireContact } from '@/lib/types';
import { getOmniCRMData } from '@/lib/server-actions';
import { 
    Users, Search, Filter, Shield, Star, 
    TrendingUp, Mail, Phone, Calendar, ArrowUpRight,
    MapPin, Camera, Zap, Briefcase
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function OmniCRM() {
    const [contacts, setContacts] = useState<EmpireContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterApp, setFilterApp] = useState<string>('all');

    useEffect(() => {
        let mounted = true;
        getOmniCRMData().then((data) => {
            if (mounted) {
                setContacts(data);
                setLoading(false);
            }
        });
        return () => { mounted = false; };
    }, []);

    const filtered = useMemo(() => {
        return contacts.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                                  c.email.toLowerCase().includes(search.toLowerCase());
            const matchesApp = filterApp === 'all' || c.appName === filterApp;
            return matchesSearch && matchesApp;
        });
    }, [contacts, search, filterApp]);

    const getAppTag = (appName: string) => {
        if (appName.includes('Auclaire')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (appName.includes('Defcon')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (appName.includes('Viva')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        if (appName.includes('DRS')) return 'text-red-400 bg-red-500/10 border-red-500/20';
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    };

    const getAppIcon = (appName: string) => {
        if (appName.includes('Auclaire')) return <Briefcase className="w-4 h-4" />;
        if (appName.includes('Defcon')) return <Camera className="w-4 h-4" />;
        if (appName.includes('Viva')) return <MapPin className="w-4 h-4" />;
        if (appName.includes('DRS')) return <Zap className="w-4 h-4" />;
        return <Users className="w-4 h-4" />;
    };

    const getStatusStyle = (status: string) => {
        if (status === 'vip') return 'text-amber-400 bg-amber-500/10 shadow-[0_0_10px_rgba(251,191,36,0.2)] border-amber-500/20';
        if (status === 'active') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (status === 'lead') return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    };

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Intelligence */}
            <div className="glass-panel p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl bg-indigo-500/10">
                        <Shield className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Omni-CRM Intelligence</h2>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Carrefour Global des Profils</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <div className="glass-pill p-4 flex gap-6 items-center">
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Entités</p>
                            <p className="text-xl font-black text-slate-200 mt-0.5">{loading ? '--' : contacts.length}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div>
                            <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-widest flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400" /> VIP
                            </p>
                            <p className="text-xl font-black text-amber-400 mt-0.5">{loading ? '--' : contacts.filter(c => c.status === 'vip').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email..."
                        className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-white placeholder-slate-600 font-medium transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 p-1 glass-pill rounded-xl overflow-x-auto scrollbar-hide">
                    {['all', 'Auclaire', 'Defcon', 'Viva Vegas', 'DRS'].map(app => (
                        <button
                            key={app}
                            onClick={() => setFilterApp(app)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterApp === app ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {app === 'all' ? 'All Empire' : app}
                        </button>
                    ))}
                </div>
            </div>

            {/* Matrix Table */}
            <div className="glass-panel overflow-hidden flex-1 min-h-[400px]">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-[10px] font-black tracking-widest uppercase">Harvesting Data Across Empire...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Identité</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Origine</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Statut & Valeur</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Activité Récente</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {filtered.map((contact) => (
                                    <tr 
                                        key={contact.id} 
                                        className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        onClick={() => window.dispatchEvent(new CustomEvent('entity-selected', { detail: contact }))}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors">
                                                    {contact.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                                        {contact.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                        {contact.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`px-2 py-1 inline-flex items-center gap-1.5 rounded border text-[9px] font-black uppercase tracking-widest ${getAppTag(contact.appName)}`}>
                                                {getAppIcon(contact.appName)}
                                                {contact.appName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(contact.status)}`}>
                                                    {contact.status}
                                                </div>
                                                {contact.lifetimeValue > 0 ? (
                                                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" />
                                                        ${contact.lifetimeValue.toLocaleString()} LTV
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] text-slate-500 font-bold">{contact.metrics}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-slate-500" />
                                                {(() => {
                                                    try { return format(parseISO(contact.lastActive), 'dd MMM yyyy', { locale: fr }); }
                                                    catch(e) { return 'Date Inconnue'; }
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors group-hover:bg-black/30">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filtered.length === 0 && !loading && (
                            <div className="p-12 text-center text-slate-500 text-sm font-medium">
                                Aucun contact trouvé dans cette dimension.
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
