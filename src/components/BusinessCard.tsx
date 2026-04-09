"use client";

import { Folder, Globe, Package, AlertCircle, GitBranch, Box, FileClock, Play, Rocket } from 'lucide-react';
import type { Business } from '@/lib/scanner';

export function BusinessCard({ business }: { business: Business }) {
    const isError = business.status === 'error';
    const Icon = isError ? AlertCircle : (business.type === 'node-app' ? Globe : business.type === 'folder' ? Folder : Package);

    return (
        <div className={`bg-zinc-900 border rounded-xl p-6 transition-all group ${isError ? 'border-red-900/50 hover:border-red-700' : 'border-zinc-800 hover:border-zinc-700'
            }`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg transition-colors ${isError ? 'bg-red-900/20 text-red-500' : 'bg-zinc-800 group-hover:bg-blue-500/10 group-hover:text-blue-400'
                    }`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${isError ? 'bg-red-900/20 text-red-400' :
                        business.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                    {business.status}
                </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{business.name}</h3>
            <p className="text-zinc-500 text-sm truncate mb-4" title={business.path}>
                {business.path}
            </p>

            {business.error && (
                <p className="text-red-400 text-xs mb-4 bg-red-950/30 p-2 rounded">
                    {business.error}
                </p>
            )}

            <div className="flex items-center gap-3 mb-4 text-xs">
                {business.git && (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                            <GitBranch className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[100px]" title={business.git.branch}>
                                {business.git.branch}
                            </span>
                        </div>
                        {business.git.uncommittedChanges > 0 && (
                            <div className="flex items-center gap-1.5 text-amber-500 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded-md w-fit">
                                <FileClock className="w-3.5 h-3.5" />
                                <span>{business.git.uncommittedChanges} uncommitted</span>
                            </div>
                        )}
                    </div>
                )}
                {business.dependencies && (
                    <div className="flex items-center gap-1.5 text-zinc-400 ml-auto bg-zinc-800/50 px-2 py-1 rounded-md border border-zinc-700/50">
                        <Box className="w-3.5 h-3.5 text-purple-400" />
                        <span>{business.dependencies.count} deps</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-auto">
                {business.type === 'node-app' ? (
                    <>
                        <button 
                            onClick={async () => {
                                await fetch('/api/process', { 
                                    method: 'POST', 
                                    body: JSON.stringify({ action: 'start', id: `${business.name}-dev`, name: `${business.name} (Dev)`, cwd: business.path, command: 'npm run dev' }) 
                                });
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-white text-black py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">
                            <Play className="w-3.5 h-3.5" /> Start
                        </button>
                        <button 
                            onClick={async () => {
                                await fetch('/api/process', { 
                                    method: 'POST', 
                                    body: JSON.stringify({ action: 'start', id: `${business.name}-deploy`, name: `${business.name} (Deploy)`, cwd: business.path, command: 'npm run build' }) 
                                });
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-zinc-700 text-zinc-300 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 hover:text-white transition-colors">
                            <Rocket className="w-3.5 h-3.5" /> Build
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={async () => {
                            await fetch('/api/launchpad', { 
                                method: 'POST', 
                                body: JSON.stringify({ id: business.name, name: business.name, cwd: business.path }) 
                            });
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 transition-colors">
                        <Rocket className="w-4 h-4" /> The Launchpad
                    </button>
                )}
            </div>
        </div>
    );
}
