'use client';

import React, { useState, useMemo } from 'react';
import { 
    Zap, 
    Share2, 
    Copy, 
    Check, 
    Linkedin, 
    Instagram, 
    Twitter, 
    Sparkles, 
    BarChart2,
    Calendar,
    ArrowRight
} from 'lucide-react';

interface AutoSocialArchitectProps {
    stats: any;
}

export function AutoSocialArchitect({ stats }: AutoSocialArchitectProps) {
    const [platform, setPlatform] = useState<'linkedin' | 'x' | 'instagram'>('linkedin');
    const [copied, setCopied] = useState(false);

    // Dynamic Post Generation Logic
    const draft = useMemo(() => {
        const totalRev = stats.auclaire.financials.collected + stats.defcon.financials.collected;
        const totalUsers = stats.auclaire.users + stats.drs.users || 0;
        
        const variants = {
            linkedin: {
                title: 'LinkedIn: The Professional Flex',
                content: `🚀 Milestone Reached: Our ecosystem just crossed $${totalRev.toLocaleString()} in monthly volume! \n\nIncredible to see how our platforms are scaling. From project management at Auclaire to media production at Defcon, the synergy is real. \n\nShoutout to our ${totalUsers} users for the trust. This is just the beginning of the Global Master App. \n\n#SaaS #Growth #Automation #Empire`
            },
            x: {
                title: 'X: The Hype Build',
                content: `Empire status: UNLOCKED 🔓\n\n$${totalRev.toLocaleString()} MRR aggregated across the board.\n${totalUsers} active users scaling with us.\n\nJarvis AI is officially live in the Master Command Center. \n\nBuilding the future of autonomous operations. 🦾✨ #BuildInPublic #SaaS`
            },
            instagram: {
                title: 'Instagram: The Visual Vibe',
                content: `The Master Dashboard is online. 🖥️✨ \n\nTurning numbers into momentum. Crossing $${totalRev.toLocaleString()} this month was a team effort. \n\nNext stop: Phase 11. \n\n🦾 [Link in bio to see how we build] \n\n#Entrepreneur #TechLife #AIAgent #Motivation`
            }
        };

        return variants[platform];
    }, [platform, stats]);

    const handleCopy = () => {
        navigator.clipboard.writeText(draft.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full group">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-indigo-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:rotate-12 transition-transform">
                            <Share2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Social Architect</h2>
                            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Autonomous Viral Engine</p>
                        </div>
                    </div>
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                        <button 
                            onClick={() => setPlatform('linkedin')}
                            className={`p-2 rounded-lg transition-all ${platform === 'linkedin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Linkedin className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setPlatform('x')}
                            className={`p-2 rounded-lg transition-all ${platform === 'x' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Twitter className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setPlatform('instagram')}
                            className={`p-2 rounded-lg transition-all ${platform === 'instagram' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Instagram className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-8 flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Suggestion - Based on Recent Success</span>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 relative group/content">
                    <div className="text-xs text-white/90 font-medium leading-relaxed whitespace-pre-wrap">
                        {draft.content}
                    </div>
                    
                    <button 
                        onClick={handleCopy}
                        className="absolute bottom-4 right-4 p-2 bg-indigo-600 rounded-lg text-white opacity-0 group-hover/content:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-black uppercase"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy Draft'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <BarChart2 className="w-4 h-4 text-emerald-400 mb-2" />
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Est. Reach</span>
                        <span className="text-sm font-black text-white">4.2k - 8.1k</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <Calendar className="w-4 h-4 text-blue-400 mb-2" />
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Best Time</span>
                        <span className="text-sm font-black text-white">Tomorrow, 9:15 AM</span>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-950/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Post Enabled</span>
                </div>
                <button className="flex items-center gap-2 py-2 px-4 bg-indigo-600/10 border border-indigo-600/20 rounded-full text-[10px] font-black text-indigo-400 uppercase hover:bg-indigo-600 hover:text-white transition-all">
                    Refine Script <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
