'use client';

import React, { useMemo } from 'react';
import { 
    Star, 
    TrendingUp, 
    Gift, 
    MessageCircle, 
    Zap,
    Users,
    ArrowUpRight,
    Award
} from 'lucide-react';
import { EmpireContact, fetchOmniCRM } from '@/lib/db-clients';

export function LoyaltyPredictor() {
    const [clients, setClients] = React.useState<EmpireContact[]>([]);

    React.useEffect(() => {
        let mounted = true;
        fetchOmniCRM().then(data => {
            if (mounted) setClients(data);
        });
        return () => { mounted = false; };
    }, []);

    // Logic: Identify VIPs
    const vips = useMemo(() => {
        return clients.slice(0, 4).map(c => ({
            ...c,
            score: Math.floor(Math.random() * 20) + 80, // Mocked loyalty score
            churnRisk: 'Low',
            potentialLTV: '+$5k - $12k'
        }));
    }, [clients]);

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full group">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-amber-900/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Loyalty Predictor</h2>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Retention AI Engine</p>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                           {i}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {vips.map((vip) => (
                        <div key={vip.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group/item">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-wide group-hover/item:text-amber-400 transition-colors">
                                        {vip.name}
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase">{vip.appName}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        <span className="text-[10px] font-black text-white">{vip.score}%</span>
                                    </div>
                                    <span className="text-[9px] text-emerald-500 font-bold uppercase">Loyalty Score</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Award className="w-3 h-3 text-indigo-400" />
                                    <span className="text-[9px] text-zinc-400 font-bold uppercase">Action:</span>
                                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-tighter">Send VIP Upgrade</span>
                                </div>
                                <button className="p-1.5 hover:bg-indigo-500/20 rounded-lg transition-colors text-indigo-400">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Global Opportunity */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Growth Opportunity</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                        82% of your client base is one step away from becoming "VIP". Reward the top 10% now to boost LTV.
                    </p>
                </div>
            </div>

            <div className="p-6 bg-slate-950/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Gift className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Rewards Active</span>
                        <p className="text-[11px] text-white font-bold">2 automated promos pending.</p>
                    </div>
                </div>
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-black uppercase text-white transition-all">
                    Batch Reward
                </button>
            </div>
        </div>
    );
}
