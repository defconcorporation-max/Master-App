"use client";

import { Activity, Wallet, Clock, Users, TrendingDown, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { useState } from 'react';

interface PortfolioProps {
    totalCollected: number;
    totalBilled: number;
    totalPending: number;
    totalCommissionsPaid: number;
    totalExpenses: number;
}

const EXCHANGE_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.78
};

export function GlobalFinancialPortfolio({ 
    totalCollected, 
    totalBilled, 
    totalPending, 
    totalCommissionsPaid, 
    totalExpenses 
}: PortfolioProps) {
    const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');

    const format = (value: number) => {
        const converted = value * EXCHANGE_RATES[currency];
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(converted);
    };

    return (
        <div className="mb-10 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-black flex items-center gap-2 text-slate-100 tracking-tight uppercase">
                    <Activity className="w-5 h-5 text-blue-500" /> 
                    Global Financial Portfolio
                </h2>

                <div className="flex glass-pill rounded-lg p-1">
                    <button 
                        onClick={() => setCurrency('USD')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black tracking-widest transition-all ${currency === 'USD' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <DollarSign className="w-3 h-3" /> USD
                    </button>
                    <button 
                        onClick={() => setCurrency('EUR')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black tracking-widest transition-all ${currency === 'EUR' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Euro className="w-3 h-3" /> EUR
                    </button>
                    <button 
                        onClick={() => setCurrency('GBP')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black tracking-widest transition-all ${currency === 'GBP' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <PoundSterling className="w-3 h-3" /> GBP
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* KPI: Cash Collected */}
                <div className="glass-panel bg-emerald-500/5 border border-emerald-500/10 p-6 relative overflow-hidden group hover:bg-emerald-500/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Wallet className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-black text-emerald-500 mb-2 uppercase tracking-wide">Cash Collected</p>
                    <h3 className="text-4xl font-extrabold text-emerald-400 tracking-tight financial-data drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        {format(totalCollected)}
                    </h3>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <span>Total Billed: <span className="font-black text-zinc-200 financial-data">{format(totalBilled)}</span></span>
                    </div>
                    </div>
                </div>

                {/* KPI: Pending */}
                <div className="glass-panel bg-amber-500/5 border border-amber-500/10 p-6 relative overflow-hidden group hover:bg-amber-500/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Clock className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-black text-amber-500 mb-2 uppercase tracking-wide">Pending</p>
                    <h3 className="text-4xl font-extrabold text-amber-400 tracking-tight financial-data">
                        {format(totalPending)}
                    </h3>
                    <div className="mt-4 flex items-center text-[10px] font-bold text-amber-500/70 uppercase tracking-widest">
                        Awaiting collection
                    </div>
                    </div>
                </div>

                {/* KPI: Commissions Paid */}
                <div className="glass-panel bg-purple-500/5 border border-purple-500/10 p-6 relative overflow-hidden group hover:bg-purple-500/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Users className="w-24 h-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-black text-purple-500 mb-2 uppercase tracking-wide">Commissions</p>
                    <h3 className="text-4xl font-extrabold text-purple-400 tracking-tight financial-data">
                        {format(totalCommissionsPaid)}
                    </h3>
                    <div className="mt-4 flex items-center text-[10px] font-bold text-purple-500/70 uppercase tracking-widest">
                        Included in Exp.
                    </div>
                    </div>
                </div>

                {/* KPI: Expenses */}
                <div className="glass-panel bg-red-500/5 border border-red-500/10 p-6 relative overflow-hidden group hover:bg-red-500/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-black text-red-500 mb-2 uppercase tracking-wide">Total Expenses</p>
                    <h3 className="text-4xl font-extrabold text-red-400 tracking-tight financial-data">
                        {format(totalExpenses)}
                    </h3>
                    <div className="mt-4 flex items-center text-[10px] font-bold text-red-500/70 uppercase tracking-widest">
                        Operational costs
                    </div>
                    </div>
                </div>

                {/* KPI: Gross Profit */}
                <div className="glass-panel bg-indigo-500/5 border border-indigo-500/10 p-6 relative overflow-hidden group hover:bg-indigo-500/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-24 h-24 text-indigo-400" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-black text-indigo-400 mb-2 uppercase tracking-wide">Profit Estimate</p>
                    <h3 className="text-4xl font-extrabold text-indigo-300 tracking-tight financial-data drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        {format(totalCollected - totalExpenses)}
                    </h3>
                    <div className="mt-4 flex items-center text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest">
                        Collected - Expenses
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
