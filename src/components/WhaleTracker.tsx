'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { EmpireContact, fetchOmniCRM } from '@/lib/db-clients';
import { Crown, TrendingUp, Users, ArrowUpRight, Zap, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function WhaleTracker() {
    const [contacts, setContacts] = useState<EmpireContact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetchOmniCRM().then(data => {
            if (mounted) { setContacts(data); setLoading(false); }
        });
        return () => { mounted = false; };
    }, []);

    // Top 10 whales by LTV
    const whales = useMemo(() => {
        return contacts
            .filter(c => c.lifetimeValue > 0)
            .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
            .slice(0, 10);
    }, [contacts]);

    const totalWhaleRevenue = whales.reduce((s, w) => s + w.lifetimeValue, 0);
    const totalEmpireRevenue = contacts.reduce((s, c) => s + c.lifetimeValue, 0);
    const whaleConcentration = totalEmpireRevenue > 0 ? Math.round((totalWhaleRevenue / totalEmpireRevenue) * 100) : 0;

    const getAppColor = (appName: string) => {
        if (appName.includes('Auclaire')) return 'text-blue-400';
        if (appName.includes('Defcon')) return 'text-emerald-400';
        if (appName.includes('Viva')) return 'text-purple-400';
        if (appName.includes('DRS')) return 'text-red-400';
        return 'text-slate-400';
    };

    return (
        <div className="glass-panel overflow-hidden flex flex-col h-full relative group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[80px] pointer-events-none group-hover:bg-amber-500/10 transition-all" />
            
            {/* Header */}
            <div className="p-6 border-b border-white/[0.05] relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 border border-amber-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl bg-amber-500/10">
                            <Crown className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-100 tracking-tight uppercase">Whale Tracker</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Top Revenue Generators</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="glass-pill p-3 rounded-xl text-center">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Whales</p>
                        <p className="text-xl font-black text-amber-400 mt-1">{loading ? '--' : whales.length}</p>
                    </div>
                    <div className="glass-pill p-3 rounded-xl text-center">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Revenue</p>
                        <p className="text-xl font-black text-emerald-400 mt-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            ${loading ? '--' : (totalWhaleRevenue / 1000).toFixed(0)}k
                        </p>
                    </div>
                    <div className="glass-pill p-3 rounded-xl text-center">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Concentration</p>
                        <p className="text-xl font-black text-indigo-400 mt-1">{loading ? '--' : whaleConcentration}%</p>
                    </div>
                </div>
            </div>

            {/* Whale List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    </div>
                ) : whales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                        <Users className="w-8 h-8" />
                        <p className="text-xs font-bold">Aucun client avec du revenu détecté.</p>
                    </div>
                ) : (
                    whales.map((whale, idx) => (
                        <div key={whale.id} className="flex items-center gap-3 p-3 glass-pill rounded-xl hover:bg-white/[0.04] transition-all group/item cursor-pointer">
                            {/* Rank */}
                            <div className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-black ${
                                idx === 0 ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.2)]' :
                                idx === 1 ? 'bg-slate-400/10 text-slate-300' :
                                idx === 2 ? 'bg-orange-800/20 text-orange-400' :
                                'bg-white/5 text-slate-500'
                            }`}>
                                {idx < 3 ? <Star className="w-3.5 h-3.5" /> : `#${idx + 1}`}
                            </div>

                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 group-hover/item:border-amber-500/30 transition-colors">
                                {whale.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-200 truncate group-hover/item:text-white transition-colors">
                                        {whale.name}
                                    </span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${getAppColor(whale.appName)}`}>
                                        {whale.appName}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono truncate">{whale.email}</p>
                            </div>

                            {/* LTV */}
                            <div className="text-right shrink-0">
                                <p className="text-sm font-black text-emerald-400 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    ${whale.lifetimeValue.toLocaleString()}
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">LTV</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Insight */}
            {!loading && whales.length > 0 && (
                <div className="p-4 border-t border-white/[0.05] bg-black/20 relative z-10">
                    <div className="flex items-center gap-2 text-[10px] text-amber-500/70 font-bold uppercase tracking-widest">
                        <Zap className="w-3 h-3 text-amber-400" />
                        {whaleConcentration > 60 
                            ? `Risque de concentration élevé : ${whaleConcentration}% des revenus viennent de ${whales.length} clients.`
                            : `Base de revenus diversifiée. Top ${whales.length} = ${whaleConcentration}% du CA.`
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
