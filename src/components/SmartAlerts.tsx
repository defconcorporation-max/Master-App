import type { AppStats } from '@/lib/db-clients';
import { AlertCircle, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Alert {
    id: string;
    appName: string;
    type: 'error' | 'warning' | 'success' | 'info';
    message: string;
    description: string;
}

export function SmartAlerts({ apps }: { apps: AppStats[] }) {
    const alerts: Alert[] = [];

    apps.forEach(app => {
        const financials = app.financials;
        
        // 1. Critical Errors
        if (app.status === 'error') {
            alerts.push({
                id: `${app.name}-error`,
                appName: app.name,
                type: 'error',
                message: 'Connection Failed',
                description: app.errorMsg || 'Database is unreachable. Check credentials.'
            });
            return; // Skip further alerts for this app if it's down
        }

        if (!financials) return;

        // 2. High Pending Collections (Receivables Risk)
        const pendingRatio = financials.billed > 0 ? (financials.pending / financials.billed) : 0;
        if (pendingRatio > 0.3) { // Over 30% pending
            alerts.push({
                id: `${app.name}-pending`,
                appName: app.name,
                type: 'warning',
                message: 'High Pending Receivables',
                description: `$${financials.pending.toLocaleString()} is currently uncollected (${Math.round(pendingRatio * 100)}% of total billed).`
            });
        }

        // 3. Profit Margin Check (Only if there is revenue)
        if (financials.collected > 0) {
            const margin = financials.profit / financials.collected;
            if (margin < 0.1) { // Under 10% margin
                alerts.push({
                    id: `${app.name}-margin`,
                    appName: app.name,
                    type: 'warning',
                    message: 'Low Profit Margin',
                    description: `Profit margin is currently at ${Math.round(margin * 100)}%. Expenses might be out of control.`
                });
            } else if (margin > 0.5) { // High performance
                alerts.push({
                    id: `${app.name}-growth`,
                    appName: app.name,
                    type: 'success',
                    message: 'Strong Performance',
                    description: `Exceptional profit margin of ${Math.round(margin * 100)}% this cycle.`
                });
            }
        }

        // 4. Activity Check
        if (app.tasks === 0) {
             alerts.push({
                id: `${app.name}-stagnant`,
                appName: app.name,
                type: 'info',
                message: 'Stagnant Activity',
                description: 'No new projects or records detected in this billing cycle.'
            });
        }
    });

    if (alerts.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'success': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
            default: return <AlertCircle className="w-5 h-5 text-blue-500" />;
        }
    };

    const getColorClass = (type: string) => {
        switch (type) {
            case 'error': return 'border-red-500/20 bg-red-500/5 text-red-200';
            case 'warning': return 'border-amber-500/20 bg-amber-500/5 text-amber-200';
            case 'success': return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200';
            default: return 'border-blue-500/20 bg-blue-500/5 text-blue-200';
        }
    };

    return (
        <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Intelligent Insights Engine</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {alerts.map(alert => (
                    <div 
                        key={alert.id} 
                        className={`p-4 rounded-xl border flex flex-col gap-1 shadow-sm transition-all hover:scale-[1.02] cursor-default ${getColorClass(alert.type)}`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {getIcon(alert.type)}
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 truncate">{alert.appName}</span>
                        </div>
                        <h5 className="font-bold text-sm text-white leading-tight">{alert.message}</h5>
                        <p className="text-xs opacity-80 leading-relaxed mt-1 line-clamp-2">{alert.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
