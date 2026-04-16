'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Zap, Database, Globe, Cpu, Server, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SystemNode {
    id: string;
    name: string;
    type: 'db' | 'api' | 'provider';
    status: 'online' | 'degraded' | 'offline' | 'checking';
    latency?: number;
    region?: string;
}

export function SystemHealthGrid() {
    const [nodes, setNodes] = useState<SystemNode[]>([
        { id: 'turso', name: 'Turso (Defcon DB)', type: 'db', status: 'checking', region: 'us-east-1' },
        { id: 'supabase-auc', name: 'Supabase (Auclaire)', type: 'db', status: 'checking', region: 'eu-west-1' },
        { id: 'supabase-drs', name: 'Supabase (DRS)', type: 'db', status: 'checking', region: 'us-west-2' },
        { id: 'mongodb', name: 'MongoDB (Antigravity)', type: 'db', status: 'checking', region: 'atlas-global' },
        { id: 'openai', name: 'OpenAI API (Intelligence)', type: 'provider', status: 'checking' },
        { id: 'vercel', name: 'Vercel Edge (Runtime)', type: 'provider', status: 'checking' },
    ]);

    useEffect(() => {
        // Simulated health check logic
        const timer = setTimeout(() => {
            setNodes(prev => prev.map(node => ({
                ...node,
                status: Math.random() > 0.1 ? 'online' : 'degraded',
                latency: Math.floor(Math.random() * 80) + 20
            })));
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const getStatusStyles = (status: SystemNode['status']) => {
        switch (status) {
            case 'online': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]';
            case 'degraded': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'offline': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-500 bg-slate-500/5 border-white/5 animate-pulse';
        }
    };

    const getTypeIcon = (type: SystemNode['type']) => {
        switch (type) {
            case 'db': return <Database className="w-4 h-4" />;
            case 'api': return <Cpu className="w-4 h-4" />;
            case 'provider': return <Globe className="w-4 h-4" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nodes.map((node) => (
                <div key={node.id} className={`glass-panel p-5 relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] border ${getStatusStyles(node.status)}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 border border-white/5 rounded-lg bg-black/40">
                                {getTypeIcon(node.type)}
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest">{node.name}</h3>
                                <p className="text-[10px] opacity-50 font-bold uppercase tracking-tighter">{node.region || 'Global Infrastructure'}</p>
                            </div>
                        </div>
                        {node.status === 'checking' ? (
                            <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                        ) : node.status === 'online' ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Status</p>
                            <p className="text-xs font-black uppercase">{node.status}</p>
                        </div>
                        {node.latency && (
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Latency</p>
                                <p className="text-sm font-black mono">{node.latency}ms</p>
                            </div>
                        )}
                    </div>

                    {/* Miniature "pulse" wave effect in bottom */}
                    {node.status === 'online' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                    )}
                </div>
            ))}
        </div>
    );
}
