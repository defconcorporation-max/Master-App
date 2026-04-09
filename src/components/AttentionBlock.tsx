'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, Wallet, CheckCircle2, XCircle, MinusCircle, Boxes } from 'lucide-react';

type AppId = 'auclaire' | 'defcon' | 'antigravity' | 'drs';

const APP_LABELS: Record<AppId, string> = {
  auclaire: 'Auclaire',
  defcon: 'Defcon',
  antigravity: 'Viva Vegas',
  drs: 'DRS',
};

interface AppUrls {
  auclaire: string;
  defcon: string;
  antigravity: string;
  drs: string;
}

interface AppInfo {
  id?: AppId;
  name: string;
  status?: string;
  errorMsg?: string;
  financials?: { pending?: number };
}

interface HealthItem {
  name: string;
  status: 'ok' | 'error' | 'off';
  error?: string;
}

interface AttentionBlockProps {
  deployedApps: AppInfo[];
  totalPending: number;
  appUrls: AppUrls;
}

export function AttentionBlock({ deployedApps, totalPending, appUrls }: AttentionBlockProps) {
  const [health, setHealth] = useState<Record<string, HealthItem> | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealth(data.apps ?? {});
      } catch {
        setHealth({});
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 60_000);
    return () => clearInterval(interval);
  }, []);

  const appsWithIssues = deployedApps.filter((app) => {
    const id = app.id as AppId | undefined;
    if (!id) return false;
    const h = health?.[id];
    return h?.status === 'error' || h?.status === 'off' || app.status === 'error';
  });

  const connectedCount = health
    ? Object.values(health).filter((a) => a.status === 'ok').length
    : 0;
  const totalApps = 4;

  return (
    <section className="mb-8 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          À l&apos;attention de
        </h2>
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">
            {connectedCount}/{totalApps} apps connectées
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Alertes (apps en erreur / offline) */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 min-h-[120px]">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            {appsWithIssues.length > 0 ? (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
            État des apps
          </h3>
          {appsWithIssues.length === 0 ? (
            <p className="text-sm text-emerald-400/90">Toutes les apps sont joignables.</p>
          ) : (
            <ul className="space-y-2">
              {appsWithIssues.map((app) => {
                const id = app.id as AppId;
                const h = health?.[id];
                const msg = app.errorMsg || h?.error || (h?.status === 'off' ? 'Non configurée' : 'Erreur');
                return (
                  <li key={app.name} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-white font-medium truncate">{app.name}</span>
                    <span className="text-zinc-500 text-xs truncate" title={msg}>
                      {msg.length > 40 ? `${msg.slice(0, 40)}…` : msg}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Impayés */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 min-h-[120px]">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-amber-500" />
            Encaissements en attente
          </h3>
          <p className="text-2xl font-bold text-amber-400 mb-2">
            ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <ul className="space-y-1 text-xs text-zinc-400">
            {deployedApps
              .filter((a) => (a.financials?.pending ?? 0) > 0)
              .map((app) => (
                <li key={app.name} className="flex justify-between gap-2">
                  <span className="truncate">{app.name}</span>
                  <span className="text-amber-400/90 font-medium flex-shrink-0">
                    ${(app.financials?.pending ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </li>
              ))}
            {deployedApps.every((a) => (a.financials?.pending ?? 0) === 0) && totalPending === 0 && (
              <li>Aucun impayé pour le moment.</li>
            )}
          </ul>
        </div>

        {/* Moteur Visuel (3D City Launcher) */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-5 min-h-[120px] flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-indigo-500/10" />
          <div>
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Boxes className="w-3.5 h-3.5" />
              Moteur Tycoon 3D
            </h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-4 leading-relaxed">
              Visualisation temps-réel de l&apos;empire en Dollhouse 3D.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/tv-dashboard'}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Lancer le Dashboard
          </button>
        </div>

        {/* Liens rapides */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 min-h-[120px]">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            Ouvrir une app
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(APP_LABELS) as AppId[]).map((id) => {
              const url = appUrls[id];
              const label = APP_LABELS[id];
              const hasUrl = !!url && url.startsWith('http');
              return (
                <a
                  key={id}
                  href={hasUrl ? url : '#'}
                  target={hasUrl ? '_blank' : undefined}
                  rel={hasUrl ? 'noopener noreferrer' : undefined}
                  onClick={(e) => !hasUrl && e.preventDefault()}
                  className={`flex items-center justify-between gap-2 px-2 py-2 rounded-lg border text-[10px] font-bold transition-colors ${
                    hasUrl
                      ? 'bg-zinc-800/80 border-zinc-700 text-white hover:bg-zinc-700 hover:border-blue-500/50'
                      : 'border-zinc-800 text-zinc-500 cursor-not-allowed opacity-75'
                  }`}
                  title={hasUrl ? `Ouvrir ${label}` : `Définir ${id.toUpperCase()}_APP_URL dans .env.local`}
                >
                  <span className="truncate">{label}</span>
                  {hasUrl ? (
                    <ExternalLink className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                  ) : (
                    <MinusCircle className="w-3 h-3 flex-shrink-0" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}
