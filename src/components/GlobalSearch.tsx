"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, User, Briefcase, FileText, LayoutList, History, Zap } from 'lucide-react';
import { performGlobalSearch } from '@/lib/server-actions';
import { OmniSearchResult } from '@/lib/types';
import { Terminal, Command } from 'lucide-react';

const SEARCH_HISTORY_KEY = 'master-app-search-history';
const MAX_HISTORY = 8;

function getHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function pushHistory(q: string) {
  const qq = q.trim();
  if (!qq) return;
  let h = getHistory().filter((x) => x.toLowerCase() !== qq.toLowerCase());
  h = [qq, ...h].slice(0, MAX_HISTORY);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(h));
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OmniSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [cmdFeedback, setCmdFeedback] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'invoice', label: 'Generate Invoice', icon: <FileText className="w-4 h-4" />, example: '/invoice [client]' },
    { id: 'task', label: 'Create Task', icon: <LayoutList className="w-4 h-4" />, example: '/task [name]' },
    { id: 'msg', label: 'Send Message', icon: <Zap className="w-5 h-5" />, example: '/msg [client]' },
    { id: 'ghost', label: 'Enable Ghost Mode', icon: <History className="w-4 h-4" />, example: '/ghost' },
    { id: 'cinema', label: 'Toggle Cinema Mode', icon: <Zap className="w-4 h-4" />, example: '/cinema' },
  ];

  const filteredCommands = query.startsWith('/') 
    ? commands.filter(c => c.id.startsWith(query.slice(1).split(' ')[0]))
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const onFocusSearch = () => {
      inputRef.current?.focus();
      if (!query.trim()) setShowHistory(true);
    };
    window.addEventListener('focus-global-search', onFocusSearch);
    return () => window.removeEventListener('focus-global-search', onFocusSearch);
  }, [query]);

  useEffect(() => {
    if (query.startsWith('/')) {
        setIsCommandMode(true);
        setResults([]);
        return;
    }
    setIsCommandMode(false);

    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await performGlobalSearch(query);
        setResults(res);
        pushHistory(query);
        setHistory(getHistory());
        setTimeout(() => {
            setIsLoading(false);
            setIsOpen(true);
            setShowHistory(false);
        }, 300);
      } catch (e) {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleCommandExec = (cmd: string) => {
    setCmdFeedback(`Executing: ${cmd}...`);
    window.dispatchEvent(new CustomEvent('command-executed', { detail: { command: cmd } }));
    setTimeout(() => {
        setCmdFeedback(null);
        setQuery('');
    }, 2000);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isCommandMode && filteredCommands.length > 0) {
        handleCommandExec(query);
    }
  };

  const onFocus = () => {
    if (query.length >= 2) setIsOpen(true);
    else {
      setShowHistory(true);
      setHistory(getHistory());
    }
  };

  const pickHistory = (q: string) => {
    setQuery(q);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'client': return <User className="w-4 h-4" />;
      case 'project': return <Briefcase className="w-4 h-4" />;
      case 'job': return <LayoutList className="w-4 h-4" />;
      case 'invoice': return <FileText className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={containerRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          ) : isCommandMode ? (
            <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : (
            <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          className={`block w-full pl-11 pr-11 py-3 bg-zinc-900 border rounded-2xl text-white placeholder-zinc-500 focus:outline-none transition-all text-sm backdrop-blur-md shadow-lg ${
            isCommandMode ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' : 'border-zinc-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50'
          }`}
          placeholder={isCommandMode ? "Type empire command..." : "Global Omni-Search (Ctrl+K) – name, email, project..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Command Results */}
      {isCommandMode && (
        <div className="absolute mt-3 w-full bg-zinc-950/90 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-2xl">
           <div className="p-2 max-h-[400px] overflow-y-auto">
                <div className="px-3 py-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest border-b border-emerald-500/10 mb-1 flex items-center gap-2">
                    <Command className="w-3 h-3" /> Execute Supreme Command
                </div>
                {filteredCommands.length > 0 ? (
                    filteredCommands.map((cmd) => (
                        <div 
                            key={cmd.id}
                            onClick={() => handleCommandExec(query || cmd.example)}
                            className="flex items-center gap-4 p-3 hover:bg-emerald-500/10 rounded-xl cursor-pointer group transition-colors"
                        >
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20">
                                {cmd.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white tracking-tight">{cmd.label}</p>
                                <p className="text-[10px] text-zinc-500 font-mono">{cmd.example}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                        Unknown Command Pattern
                    </div>
                )}
           </div>
        </div>
      )}

      {/* Action Feedback Toast-like overlay */}
      {cmdFeedback && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-black px-6 py-3 rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-in slide-in-from-top-4 duration-300">
            {cmdFeedback}
        </div>
      )}

      {isOpen && (results.length > 0) && (
        <div className="absolute mt-3 w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
          <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 mb-1">
                Search Results ({results.length})
            </div>
            {results.map((result) => (
              <div 
                key={result.id}
                className="flex items-center gap-4 p-3 hover:bg-zinc-800/80 rounded-xl cursor-pointer group transition-colors"
              >
                <div className="p-2 bg-black/50 rounded-lg border border-zinc-800 text-zinc-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white truncate">{result.title}</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700/50">
                      {result.appName}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{result.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-zinc-800/20 border-t border-zinc-800/50 text-center">
             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Master App Omni-Search Engine</p>
          </div>
        </div>
      )}

      {showHistory && history.length > 0 && !query.trim() && (
        <div className="absolute mt-3 w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 flex items-center gap-2">
            <History className="w-3 h-3" /> Récent
          </div>
          <div className="max-h-48 overflow-y-auto">
            {history.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickHistory(q)}
                className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="absolute mt-3 w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 text-center z-[100] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
              <Search className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 font-medium">No records found for "<span className="text-white">{query}</span>"</p>
              <p className="text-xs text-zinc-600 mt-1">Try searching by client name or email.</p>
          </div>
      )}
    </div>
  );
}
