"use client";

import { useState, useEffect } from 'react';
import { Globe, Users, DollarSign, Activity, AlertCircle, Server, ActivitySquare } from 'lucide-react';
import type { AppStats } from '@/lib/db-clients';
import Link from 'next/link';

type AppId = 'auclaire' | 'defcon' | 'antigravity' | 'drs';

export function DeployedAppCard({ stats }: { stats: AppStats & { id?: AppId } }) {
  const [liveStatus, setLiveStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
      const appIdFromName = (): AppId => {
        if (stats.id) return stats.id;
        const n = stats.name.toLowerCase();
        if (n.includes('auclaire')) return 'auclaire';
        if (n.includes('defcon')) return 'defcon';
        if (n.includes('viva') || n.includes('antigravity')) return 'antigravity';
        return 'drs';
      };

      const checkHealth = async () => {
          try {
          const appId = appIdFromName();
          const res = await fetch('/api/health');
          const data = await res.json();
          const h = data?.apps?.[appId];
          if (!h) {
            setLiveStatus('offline');
            setLatency(null);
            return;
          }

          if (h.status === 'ok') {
            setLiveStatus('online');
            setLatency(typeof h.latencyMs === 'number' && h.latencyMs >= 0 ? h.latencyMs : null);
          } else {
            setLiveStatus('offline');
            setLatency(null);
          }
          } catch (e) {
          setLiveStatus('offline');
          setLatency(null);
          }
      };
      
      checkHealth();
      const interval = setInterval(checkHealth, 30000);
      return () => clearInterval(interval);
  }, [stats.name, stats.id]);

  const isError = liveStatus === 'offline' || stats.status === 'error';
  const slug = stats.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <Link href={`/apps/${slug}`} className="block group">
      <div className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all h-full ${
        isError ? 'border-red-900/50 hover:border-red-700' : 'border-zinc-800 hover:border-zinc-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10'
      }`}>
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/50 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isError ? 'bg-red-900/20 text-red-500' : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors'
            }`}>
              {isError ? <AlertCircle className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{stats.name}</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
            liveStatus === 'checking' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' :
            isError ? 'bg-red-900/20 text-red-400 border border-red-900/50' :
            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
             {liveStatus === 'checking' && <ActivitySquare className="w-3 h-3 animate-pulse" />}
             {liveStatus === 'online' && latency && <span className="text-[10px] mr-1 opacity-80">{latency}ms</span>}
            {liveStatus.toUpperCase()}
          </div>
        </div>

        {/* Body Metrics */}
        <div className="p-5 relative flex flex-col gap-4">
          
          {/* Top Row: Users & Records */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-800/50">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Users</span>
              </div>
              <span className="text-xl font-bold text-white">
                {(stats.users || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Records</span>
              </div>
              <span className="text-xl font-bold text-white">
                {(stats.tasks || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bottom Row: Advanced Financials Mini-Grid */}
          {stats.financials && (
            <div className="grid grid-cols-3 gap-y-3 gap-x-4">
              {/* Billed */}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-widest mb-0.5">Billed</span>
                <span className="text-sm font-medium text-blue-100">${(stats.financials.billed || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              
              {/* Collected */}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-0.5">Collected</span>
                <span className="text-sm font-bold text-emerald-400">${(stats.financials.collected || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              
              {/* Pending */}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-amber-500/80 uppercase tracking-widest mb-0.5">Pending</span>
                <span className="text-sm font-medium text-amber-200">${(stats.financials.pending || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>

              {/* Comm. Paid */}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-purple-400/80 uppercase tracking-widest mb-0.5">Commissions</span>
                <span className="text-sm font-medium text-purple-200">${(stats.financials.commissionsPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>

              {/* Expenses */}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-red-400/80 uppercase tracking-widest mb-0.5">Expenses</span>
                <span className="text-sm font-medium text-red-200">${(stats.financials.expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>

              {/* Profit */}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-indigo-400/80 uppercase tracking-widest mb-0.5">Net Profit</span>
                <span className="text-sm font-bold text-indigo-300">${(stats.financials.profit || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {stats.errorMsg && (
            <div className="absolute inset-0 bg-zinc-900/95 p-4 flex flex-col justify-center backdrop-blur-sm">
              <p className="text-red-400 text-xs font-mono break-words line-clamp-3">
                {stats.errorMsg}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
