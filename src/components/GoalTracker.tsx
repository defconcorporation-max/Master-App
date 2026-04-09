import type { AppStats } from '@/lib/db-clients';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

// Hardcoded monthly targets for the demonstration/V4. 
// In a full production app, these would be fetched from a dedicated 'goals' table.
const MONTHLY_TARGETS: Record<string, number> = {
    'Auclaire APP': 50000,
    'Viva Vegas': 100000,
    'Defcon App': 15000,
    'DRS Auto Detailing': 10000
};

export function GoalTracker({ apps }: { apps: AppStats[] }) {
    
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold tracking-wide uppercase text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Monthly Objectives (OKRs)
                </h3>
                <span className="text-xs font-medium px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                    Q1 / Current Month
                </span>
            </div>

            <div className="flex flex-col gap-6">
                {apps.map(app => {
                    if (app.status === 'error' || app.status === 'offline') return null;

                    const target = MONTHLY_TARGETS[app.name] || 0;
                    if (target === 0) return null;

                    const collected = app.financials?.collected || 0;
                    const percent = Math.min(Math.round((collected / target) * 100), 100);
                    const isCompleted = percent >= 100;
                    const isAtRisk = percent < 30; // arbitrary threshold for UI

                    return (
                        <div key={app.name} className="flex flex-col gap-2 relative group">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-zinc-200">{app.name}</span>
                                <div className="flex items-end gap-2 text-right">
                                    <span className="text-sm font-black text-white">
                                        ${collected.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-xs font-medium text-zinc-500 mb-0.5">
                                        / ${target.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="h-3 w-full bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700/50 relative">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                                        isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-blue-400'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                >
                                    {/* Shimmer effect */}
                                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs mt-1">
                                <span className={isCompleted ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-zinc-500'}>
                                    {isCompleted && <TrendingUp className="w-3 h-3" />}
                                    {percent}% Achieved
                                </span>
                                {isAtRisk && !isCompleted && (
                                    <span className="text-amber-500/80 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Off Track
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
