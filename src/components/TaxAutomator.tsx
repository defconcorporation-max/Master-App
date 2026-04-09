'use client';

import React from 'react';
import { 
    FileText, 
    Download, 
    Calculator, 
    Percent, 
    TrendingUp, 
    Calendar,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';

interface TaxAutomatorProps {
    data: {
        totalBilled: number;
        totalCollected: number;
        totalPending: number;
        totalExpenses: number;
    }
}

export function TaxAutomator({ data }: TaxAutomatorProps) {
    // Basic Accounting Calculations
    const collectionRate = (data.totalCollected / data.totalBilled) * 100;
    const estimatedTax = (data.totalCollected - data.totalExpenses) * 0.25; // Simple 25% mock rate
    const netProfit = data.totalCollected - data.totalExpenses;

    const exportToAccountant = () => {
        alert("Preparing Financial Dossier for Export... \n\nCSV/PDF generation initiated in the background, Sir.");
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full group">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-emerald-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Tax-Ready Automator</h2>
                            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Admin & Compliance Suite</p>
                        </div>
                    </div>
                    <button 
                        onClick={exportToAccountant}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Download className="w-4 h-4" /> Export for CPA
                    </button>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Quarter Progress */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Q1 2026 Fiscal Progress</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                </div>

                {/* Key Accounting Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-black/40 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <Percent className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase">{collectionRate.toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Collection Efficiency</span>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${collectionRate}%` }} />
                        </div>
                    </div>

                    <div className="p-5 bg-black/40 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <Calculator className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase">Est. 25%</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Estimated Tax Liability</span>
                        <span className="text-lg font-black text-white italic tracking-tighter">
                            ${estimatedTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>

                {/* Ledger Summary */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-1">Financial Reconciliation</h3>
                    {[
                        { label: 'Gross Billed Revenue', value: data.totalBilled, color: 'text-zinc-400' },
                        { label: 'Total Deductible Expenses', value: data.totalExpenses, color: 'text-red-400' },
                        { label: 'Net Taxable Income', value: netProfit, color: 'text-emerald-400' },
                    ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-zinc-300">{row.label}</span>
                            <span className={`text-xs font-mono font-bold ${row.color}`}>
                                ${row.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-slate-950/40 border-t border-white/5 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none">Status</span>
                    <p className="text-[11px] text-white font-bold">Books are reconciled and ready for Q1 filing.</p>
                </div>
            </div>
        </div>
    );
}
