import { fetchGlobalStats } from '@/lib/db-clients';
import { notFound } from 'next/navigation';
import { ArrowLeft, Globe, DollarSign, Users, Activity, ExternalLink, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { GlobalChart } from '@/components/GlobalChart';

export default async function AppDetail({ params }: { params: { name: string } }) {
  // Must await params in Next.js 15+ dynamic routes
  const resolvedParams = await Promise.resolve(params);
  const { name } = resolvedParams;
  
  const stats = await fetchGlobalStats();

  let appData;
  if (name === 'auclaire-app') appData = stats.auclaire;
  else if (name === 'defcon-app') appData = stats.defcon;
  else if (name === 'viva-vegas' || name === 'antigravity-agents') appData = stats.antigravity;
  else if (name === 'drs-auto-detailing') appData = stats.drs;

  if (!appData) {
    notFound();
  }

  const isError = appData.status === 'error' || appData.status === 'offline';

  const productionUrl =
    name === 'auclaire-app'
      ? process.env.AUCLAIRE_APP_URL
      : name === 'defcon-app'
        ? process.env.DEFCON_APP_URL
        : name === 'viva-vegas' || name === 'antigravity-agents'
          ? process.env.ANTIGRAVITY_APP_URL
          : name === 'drs-auto-detailing'
            ? process.env.DRS_APP_URL
            : undefined;

  const openLabel =
    name === 'auclaire-app'
      ? 'Ouvrir Auclaire'
      : name === 'defcon-app'
        ? 'Ouvrir Defcon'
        : name === 'viva-vegas' || name === 'antigravity-agents'
          ? 'Ouvrir Viva Vegas'
          : name === 'drs-auto-detailing'
            ? 'Ouvrir DRS'
            : 'Open Production App';

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Command Center
        </Link>
      </nav>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-6 pb-8 border-b border-zinc-900">
        <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${
              isError ? 'bg-red-900/20 text-red-500 border border-red-900/50' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">
                {appData.name}
              </h1>
              <div className="flex items-center gap-3">
                 <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    isError ? 'bg-red-900/20 text-red-400 border border-red-900/50' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {appData.status}
                  </span>
                  {!isError && (
                    <span className="text-sm text-zinc-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sync Active
                    </span>
                  )}
              </div>
            </div>
        </div>
        <div className="flex gap-3">
            {productionUrl ? (
              <a
                href={productionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm font-medium transition flex items-center gap-2 text-zinc-300"
              >
                <ExternalLink className="w-4 h-4" /> {openLabel}
              </a>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium transition flex items-center gap-2 text-zinc-500 opacity-60 cursor-not-allowed"
              >
                <ExternalLink className="w-4 h-4" /> Set *_APP_URL
              </button>
            )}
        </div>
      </header>

      {/* Error State */}
      {isError && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 mb-12">
           <h3 className="text-red-400 font-bold mb-2">Connection Error</h3>
           <p className="text-red-400/80 font-mono text-sm max-w-4xl">{appData.errorMsg}</p>
        </div>
      )}

      {/* Advanced Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        
        {/* Billed */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <DollarSign className="w-16 h-16 text-blue-500" />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80 mb-1">Total Billed</h2>
            <h3 className="text-3xl font-extrabold text-blue-100 tracking-tight">
              ${(appData.financials?.billed || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
        </div>

        {/* Collected */}
        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <DollarSign className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-1">Cash Collected</h2>
            <h3 className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              ${(appData.financials?.collected || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
        </div>

        {/* Pending */}
        <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <DollarSign className="w-16 h-16 text-amber-500" />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 mb-1">Pending Receivables</h2>
            <h3 className="text-3xl font-extrabold text-amber-300 tracking-tight">
              ${(appData.financials?.pending || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
        </div>

        {/* Commissions Paid */}
        <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <Users className="w-16 h-16 text-purple-500" />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-purple-500/80 mb-1">Commissions Paid</h2>
            <h3 className="text-3xl font-extrabold text-purple-400 tracking-tight">
              ${(appData.financials?.commissionsPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
        </div>

        {/* Expenses */}
        <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <DollarSign className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-red-500/80 mb-1">Total Expenses</h2>
            <h3 className="text-3xl font-extrabold text-red-400 tracking-tight">
              ${(appData.financials?.expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        {/* App-Specific Chart */}
        <div className="xl:col-span-2">
            <GlobalChart data={appData.chartData || []} />
        </div>

        {/* Operational Stats Column */}
        <div className="flex flex-col gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col justify-center flex-1 h-full shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Users className="w-16 h-16 text-purple-500" />
                </div>
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold tracking-wide uppercase text-xs">Registered Clients</span>
                </div>
                <span className="text-4xl font-black text-white">{(appData.users || 0).toLocaleString()}</span>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col justify-center flex-1 h-full shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Activity className="w-16 h-16 text-blue-500" />
                </div>
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Activity className="w-5 h-5" />
                    <span className="font-semibold tracking-wide uppercase text-xs">System Records</span>
                </div>
                <span className="text-4xl font-black text-white">{(appData.tasks || 0).toLocaleString()}</span>
            </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-10">
         <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Recent activity
         </h2>
         {(appData.activityFeed?.length ?? 0) > 0 ? (
            <div className="space-y-3">
               {appData.activityFeed!.slice(0, 10).map((a: any) => (
                  <div
                     key={a.id}
                     className="bg-black/20 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4"
                  >
                     <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{a.title}</p>
                        <p className="text-xs text-zinc-500 truncate">
                           {a.type} · {new Date(a.date).toLocaleString('en-US')}
                        </p>
                        {a.description ? (
                           <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{a.description}</p>
                        ) : null}
                     </div>
                     <div className="flex-shrink-0 flex flex-col items-end">
                        {typeof a.amount === 'number' ? (
                           <span className="text-sm font-bold text-emerald-400">
                              ${a.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                           </span>
                        ) : (
                           <span className="text-xs text-zinc-500">—</span>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <p className="text-zinc-500 text-sm">No activity feed available for this app yet.</p>
         )}
      </div>

    </div>
  );
}
