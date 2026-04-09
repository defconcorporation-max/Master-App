"use client";

import { useState } from 'react';
import { FileText, Loader2, X, Download, Presentation } from 'lucide-react';
import { getAiExecutiveSummary } from '@/lib/actions';
import type { AppStats } from '@/lib/db-clients';

export function InvestorReportModal({ apps }: { apps: AppStats[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsOpen(true);
        setIsGenerating(true);
        try {
            const result = await getAiExecutiveSummary(apps);
            setReport(result);
        } catch (e) {
            setReport("Failed to generate investor report.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <button 
                onClick={handleGenerate}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-colors"
            >
                <Presentation className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">Generate Report</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10">
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <FileText className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Master Command Executive Brief</h2>
                                    <p className="text-xs text-zinc-500">Auto-Generated AI Portfolio Report</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {report && !isGenerating && (
                                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                                        <Download className="w-4 h-4" /> Export PDF
                                    </button>
                                )}
                                <button 
                                    onClick={() => { setIsOpen(false); setReport(null); }}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Body - The Report */}
                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-black/30">
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-4">
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    <p className="text-zinc-400 font-mono text-sm animate-pulse">Aggregating global financials & summoning Gemini AI...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-indigo max-w-none">
                                    {report?.split('\n').map((line, i) => {
                                        if (line.trim().startsWith('* **')) {
                                            // Handle bolding in lists
                                            const parts = line.replace(/^\*\s*/, '').split('**');
                                            return <li key={i} className="mb-2 text-zinc-300"><strong className="text-indigo-300">{parts[1]}</strong>{parts[2]}</li>;
                                        }
                                        if (line.trim().startsWith('*')) {
                                            return <li key={i} className="mb-2 text-zinc-300">{line.replace(/^\*\s*/, '')}</li>;
                                        }
                                        if (line.trim().startsWith('##')) {
                                            return <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-4 border-b border-zinc-800 pb-2">{line.replace(/^##\s*/, '')}</h2>;
                                        }
                                        if (line.trim() === '') return <br key={i} />;
                                        return <p key={i} className="text-zinc-300 leading-relaxed mb-4">{line}</p>;
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-zinc-900 border-t border-zinc-800 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            Confidential • Generated by J.A.R.V.I.S Engine • {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
