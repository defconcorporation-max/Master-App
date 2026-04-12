'use client';

import React, { useState } from 'react';
import { 
    Zap, 
    Maximize2, 
    Minimize2, 
    Search, 
    FileDown, 
    RefreshCcw, 
    Settings,
    Shield,
    Menu,
    X
} from 'lucide-react';

interface CommandOrbProps {
    onTogglePresentation: () => void;
    isPresentation: boolean;
    onExport: () => void;
}

export function CommandOrb({ onTogglePresentation, isPresentation, onExport }: CommandOrbProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-3">
            
            {/* Action Menu (Expands UP) */}
            <div className={`flex flex-col gap-3 transition-all duration-500 overflow-hidden ${isOpen ? 'h-64 opacity-100 mb-2' : 'h-0 opacity-0 mb-0'}`}>
                {/* Search */}
                <button 
                    onClick={() => {
                        window.dispatchEvent(new Event('focus-global-search'));
                        setIsOpen(false);
                    }}
                    className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-xl group"
                    title="Spotlight Search"
                >
                    <Search className="w-5 h-5 group-hover:scale-110" />
                </button>

                {/* Export */}
                <button 
                    onClick={() => {
                        onExport();
                        setIsOpen(false);
                    }}
                    className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-xl group"
                    title="Export Global Stats"
                >
                    <FileDown className="w-5 h-5 group-hover:scale-110" />
                </button>

                {/* Presentation Mode */}
                <button 
                    onClick={() => {
                        onTogglePresentation();
                        setIsOpen(false);
                    }}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-xl group ${isPresentation ? 'bg-blue-500 border-blue-400 text-white' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                    title="Cinema Mode"
                >
                    {isPresentation ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5 group-hover:scale-110" />}
                </button>

                {/* Refresh */}
                <button 
                    onClick={() => {
                        window.location.reload();
                    }}
                    className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-xl group"
                    title="Intelligence Global Refresh"
                >
                    <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                </button>
            </div>

            {/* Main Orb Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative w-16 h-16 rounded-3xl border-2 transition-all duration-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] overflow-hidden
                    ${isOpen ? 'bg-zinc-900 border-zinc-700 -rotate-90' : 'bg-blue-600/20 border-blue-500/40 hover:scale-110 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]'}
                `}
            >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-20 group-hover:opacity-40 transition-opacity" />
                
                {isOpen ? (
                    <X className="w-7 h-7 text-white" />
                ) : (
                    <Zap className="w-7 h-7 text-white animate-pulse" />
                )}

                {/* Pulse Effect */}
                {!isOpen && (
                    <div className="absolute inset-0 rounded-3xl border border-blue-400 animate-ping opacity-20" />
                )}
            </button>
        </div>
    );
}
