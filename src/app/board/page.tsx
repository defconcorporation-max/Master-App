"use client";

import { useState } from 'react';
import { Users, Send, Loader2, ArrowLeft, BrainCircuit, LineChart, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface AgentResponse {
    id: string;
    name: string;
    role: string;
    reply: string;
}

export default function BoardOfDirectors() {
    const [issue, setIssue] = useState('');
    const [discussions, setDiscussions] = useState<{ query: string, responses: AgentResponse[] }[]>([]);
    const [isDebating, setIsDebating] = useState(false);

    const submitToBoard = async () => {
        if (!issue.trim()) return;
        
        setIsDebating(true);
        const currentIssue = issue;
        setIssue('');
        
        try {
            const res = await fetch('/api/board', {
                method: 'POST',
                body: JSON.stringify({ issue: currentIssue })
            });
            const data = await res.json();
            
            if (data.responses) {
                setDiscussions(prev => [{ query: currentIssue, responses: data.responses }, ...prev]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsDebating(false);
        }
    };

    const getAgentIcon = (id: string) => {
        if (id === 'ceo') return <BrainCircuit className="w-5 h-5 text-purple-400" />;
        if (id === 'cfo') return <LineChart className="w-5 h-5 text-emerald-400" />;
        return <ShieldAlert className="w-5 h-5 text-blue-400" />;
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-indigo-500/30">
            <header className="max-w-5xl mx-auto flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <Users className="w-8 h-8 text-indigo-500" />
                            AI Board of Directors
                        </h1>
                        <p className="text-zinc-500 mt-1">Multi-Agent Strategic Simulation Engine</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto flex flex-col gap-8">
                {/* Input Area */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                    <h2 className="text-lg font-bold mb-4 text-zinc-300">Present a Proposal to the Board</h2>
                    <div className="flex items-start gap-4">
                        <textarea
                            className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none h-32 text-lg shadow-inner"
                            placeholder="e.g., 'Should we pivot Auclaire exclusively to B2B enterprise clients and double the pricing?'"
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submitToBoard();
                                }
                            }}
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={submitToBoard}
                            disabled={isDebating || !issue.trim()}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-900/50"
                        >
                            {isDebating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {isDebating ? 'The Board is Debating...' : 'Submit to Board'}
                        </button>
                    </div>
                </div>

                {/* Discussions Feed */}
                <div className="flex flex-col gap-12 mt-4">
                    {discussions.map((disc, i) => (
                        <div key={i} className="flex flex-col gap-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                            {/* User Query */}
                            <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-2xl p-6 self-start max-w-3xl">
                                <span className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-2 block">Your Proposal</span>
                                <p className="text-xl font-medium leading-relaxed">"{disc.query}"</p>
                            </div>

                            {/* Agent Responses Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {disc.responses.map((agent) => (
                                    <div key={agent.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg flex flex-col hover:border-zinc-700 transition">
                                        <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-4">
                                            <div className="p-2.5 bg-black rounded-lg border border-zinc-800/50">
                                                {getAgentIcon(agent.id)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{agent.name}</h3>
                                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{agent.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-zinc-300 text-sm leading-relaxed italic">
                                            "{agent.reply}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
