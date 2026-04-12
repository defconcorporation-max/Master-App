'use client';

import React, { useState } from 'react';
import { Gem, Camera, MapPin, Zap, LayoutDashboard, TrendingUp, Users, DollarSign } from 'lucide-react';
import { AppStats } from '@/lib/types';

interface EmpireMapProps {
    stats: AppStats[];
}

export function EmpireMap({ stats }: EmpireMapProps) {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Node Positions (Relative to 800x600 canvas)
    const nodes = [
        { id: 'auclaire', name: 'Maison Auclaire', icon: <Gem />, x: 200, y: 150, color: '#60a5fa' },
        { id: 'defcon', name: 'Defcon', icon: <Camera />, x: 600, y: 150, color: '#10b981' },
        { id: 'antigravity', name: 'Viva Vegas', icon: <MapPin />, x: 200, y: 450, color: '#a78bfa' },
        { id: 'drs', name: 'DRS', icon: <Zap />, x: 600, y: 450, color: '#f87171' },
        { id: 'master', name: 'Master Command', icon: <LayoutDashboard />, x: 400, y: 300, color: '#f3f4f6', isCenter: true },
    ];

    const getAppStats = (id: string) => stats.find(s => s.id === id || s.name.toLowerCase().includes(id));

    return (
        <div className="glass-panel w-full aspect-[4/3] relative overflow-hidden bg-black/40 group">
            <div className="absolute top-6 left-6 z-10">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Empire Topography
                </h2>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Architectural Flow View</p>
            </div>

            <svg viewBox="0 0 800 600" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    
                    <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(59,130,246,0)" />
                        <stop offset="50%" stopColor="rgba(59,130,246,0.3)" />
                        <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                    </linearGradient>
                </defs>

                {/* Edges from Apps to Master Command */}
                {nodes.filter(n => !n.isCenter).map(node => (
                    <g key={`edge-${node.id}`}>
                        <path
                            d={`M ${node.x} ${node.y} Q 400 300 400 300`}
                            stroke="url(#edge-grad)"
                            strokeWidth="2"
                            fill="none"
                            className="transition-opacity duration-500"
                        />
                        {/* Moving Particles */}
                        <circle r="2" fill={node.color} filter="url(#glow)">
                            <animateMotion 
                                dur={`${Math.random() * 2 + 1}s`} 
                                repeatCount="indefinite"
                                path={`M ${node.x} ${node.y} L 400 300`}
                            />
                        </circle>
                    </g>
                ))}

                {/* Nodes */}
                {nodes.map((node) => {
                    const appStats = getAppStats(node.id);
                    const isHovered = hoveredNode === node.id;
                    const size = node.isCenter ? 45 : 35;

                    return (
                        <g 
                            key={node.id} 
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            className="cursor-pointer"
                        >
                            {/* Glow Ring */}
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={size + 10}
                                fill={`${node.color}10`}
                                className={`${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                            />
                            
                            {/* Main Circle */}
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={size}
                                fill="#09090b"
                                stroke={node.color}
                                strokeWidth={isHovered ? 3 : 1}
                                className="transition-all duration-300"
                            />

                            {/* Icon Placeholder (Rendered via foreignObject) */}
                            <foreignObject 
                                x={node.x - 12} 
                                y={node.y - 12} 
                                width="24" 
                                height="24"
                                className="pointer-events-none"
                            >
                                <div style={{ color: node.color }}>
                                    {node.icon}
                                </div>
                            </foreignObject>

                            <text
                                x={node.x}
                                y={node.y + size + 20}
                                textAnchor="middle"
                                className="text-[10px] font-black uppercase tracking-widest fill-zinc-400 pointer-events-none"
                            >
                                {node.name}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Hover Data Portal */}
            {hoveredNode && (
                <div className="absolute bottom-8 right-8 w-64 glass-panel p-5 animate-in fade-in slide-in-from-bottom-2 duration-300 border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                            {nodes.find(n => n.id === hoveredNode)?.icon}
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tighter">
                            {nodes.find(n => n.id === hoveredNode)?.name}
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                <DollarSign className="w-3 h-3" /> Revenu
                            </span>
                            <span className="text-xs font-black text-emerald-400">
                                ${getAppStats(hoveredNode)?.financials.collected.toLocaleString() || '0'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Users className="w-3 h-3" /> Utilisateurs
                            </span>
                            <span className="text-xs font-black text-white">
                                {getAppStats(hoveredNode)?.users.toLocaleString() || '0'}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                    style={{ width: '95%' }}
                                />
                            </div>
                            <div className="flex justify-between mt-1.5">
                                <span className="text-[8px] font-black text-zinc-600 uppercase">Health Score</span>
                                <span className="text-[8px] font-black text-indigo-400 uppercase">95%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
