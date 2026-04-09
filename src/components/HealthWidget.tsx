'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

type Status = 'ok' | 'error' | 'off';
interface HealthItem {
  name: string;
  status: Status;
  latencyMs?: number;
  error?: string;
}

export function HealthWidget() {
  const [health, setHealth] = useState<{ status: string; apps: Record<string, HealthItem> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth({ status: 'error', apps: {} });
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <Activity className="w-4 h-4 text-zinc-500 animate-pulse" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Health...</span>
      </div>
    );
  }

  const apps = health?.apps ?? {};
  const entries = Object.entries(apps);
  const okCount = entries.filter(([, a]) => a.status === 'ok').length;
  const total = entries.length || 4;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl group">
      <Activity className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
      <div className="flex items-center gap-1.5">
        {entries.map(([key, item]) => {
          const Icon = item.status === 'ok' ? CheckCircle2 : item.status === 'error' ? XCircle : MinusCircle;
          const color = item.status === 'ok' ? 'text-emerald-500' : item.status === 'error' ? 'text-red-500' : 'text-zinc-500';
          const title = item.error ? `${item.name}: ${item.error}` : `${item.name} ${item.status === 'ok' ? (item.latencyMs ? `(${item.latencyMs}ms)` : '') : ''}`;
          return (
            <span key={key} className={`${color} transition-colors`} title={title}>
              <Icon className="w-4 h-4" />
            </span>
          );
        })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
        {health?.status === 'healthy' ? `${okCount}/${total} OK` : `${okCount}/${total} connectées`}
      </span>
    </div>
  );
}
