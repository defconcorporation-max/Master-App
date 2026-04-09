import { AppActivity } from '@/lib/db-clients';
import { formatDistanceToNow } from 'date-fns';
import { FileText, DollarSign, Wallet, CheckCircle, TrendingDown, Users } from 'lucide-react';

export function ActivityFeed({ activities }: { activities: AppActivity[] }) {
    if (!activities || activities.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'invoice_created': return <FileText className="w-4 h-4 text-blue-400" />;
            case 'payment_collected': return <DollarSign className="w-4 h-4 text-emerald-400" />;
            case 'expense_logged': return <TrendingDown className="w-4 h-4 text-red-400" />;
            case 'commission_paid': return <Users className="w-4 h-4 text-purple-400" />;
            case 'project_created': return <CheckCircle className="w-4 h-4 text-indigo-400" />;
            default: return <Wallet className="w-4 h-4 text-zinc-400" />;
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-lg">
            <div className="p-5 border-b border-zinc-800/50 bg-zinc-900/50 flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-wide uppercase text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Live Pulse
                </h3>
            </div>
            <div className="overflow-y-auto custom-scrollbar p-2" style={{ maxHeight: '420px' }}>
                <div className="flex flex-col gap-1">
                    {activities.map((act) => {
                        return (
                            <div key={act.id} className="p-3 hover:bg-zinc-800/80 rounded-xl transition border border-transparent hover:border-zinc-700/50 group">
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 p-2 bg-black/40 rounded-lg border border-zinc-800/50 group-hover:bg-zinc-900 group-hover:border-zinc-700 transition-colors">
                                        {getIcon(act.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider truncate">{act.appName}</p>
                                            <span className="text-[10px] font-medium text-zinc-500 whitespace-nowrap ml-2 uppercase">
                                                {formatDistanceToNow(new Date(act.date), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-200 truncate font-semibold">{act.title}</p>
                                        <p className="text-xs text-zinc-400 truncate mt-0.5">{act.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
