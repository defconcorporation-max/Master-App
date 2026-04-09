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
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-blue-500" /> 
                    Global Financial Portfolio
                </h2>

                <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                    <button 
                        onClick={() => setCurrency('USD')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === 'USD' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <DollarSign className="w-3 h-3" /> USD
                    </button>
                    <button 
                        onClick={() => setCurrency('EUR')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === 'EUR' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Euro className="w-3 h-3" /> EUR
                    </button>
                    <button 
                        onClick={() => setCurrency('GBP')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === 'GBP' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <PoundSterling className="w-3 h-3" /> GBP
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* KPI: Cash Collected */}
                <div className="bg-gradient-to-br from-emerald-950/40 to-black border border-emerald-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Wallet className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-semibold text-emerald-400/80 mb-2 uppercase tracking-wide">Cash Collected</p>
                    <h3 className="text-4xl font-extrabold text-emerald-400 tracking-tight financial-data">
                        {format(totalCollected)}
                    </h3>
                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                        <span>Total Billed: <span className="font-semibold text-zinc-200 financial-data">{format(totalBilled)}</span></span>
                    </div>
                    </div>
                </div>

                {/* KPI: Pending */}
                <div className="bg-gradient-to-br from-amber-950/30 to-black border border-amber-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Clock className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-semibold text-amber-500/80 mb-2 uppercase tracking-wide">Pending (Receivables)</p>
                    <h3 className="text-4xl font-extrabold text-amber-300 tracking-tight financial-data">
                        {format(totalPending)}
                    </h3>
                    <div className="mt-4 flex items-center text-xs text-amber-500/70 font-medium">
                        Awaiting payment collection
                    </div>
                    </div>
                </div>

                {/* KPI: Commissions Paid */}
                <div className="bg-gradient-to-br from-purple-950/30 to-black border border-purple-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Users className="w-24 h-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-semibold text-purple-500/80 mb-2 uppercase tracking-wide">Commissions Paid</p>
                    <h3 className="text-4xl font-extrabold text-purple-400 tracking-tight financial-data">
                        {format(totalCommissionsPaid)}
                    </h3>
                    <div className="mt-4 flex items-center text-xs text-purple-500/70 font-medium">
                        Included in Total Expenses
                    </div>
                    </div>
                </div>

                {/* KPI: Expenses */}
                <div className="bg-gradient-to-br from-red-950/30 to-black border border-red-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-red-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-semibold text-red-500/80 mb-2 uppercase tracking-wide">Total Expenses</p>
                    <h3 className="text-4xl font-extrabold text-red-400 tracking-tight financial-data">
                        {format(totalExpenses)}
                    </h3>
                    <div className="mt-4 flex items-center text-xs text-red-500/70 font-medium">
                        Recorded operational costs
                    </div>
                    </div>
                </div>

                {/* KPI: Gross Profit */}
                <div className="bg-gradient-to-br from-indigo-950/30 to-black border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-24 h-24 text-indigo-400" />
                    </div>
                    <div className="relative z-10">
                    <p className="text-sm font-semibold text-indigo-400/80 mb-2 uppercase tracking-wide">Calculated Profit</p>
                    <h3 className="text-4xl font-extrabold text-indigo-300 tracking-tight financial-data">
                        {format(totalCollected - totalExpenses)}
                    </h3>
                    <div className="mt-4 flex items-center text-xs text-indigo-300/70 font-medium">
                        Cash Collected - Expenses
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
