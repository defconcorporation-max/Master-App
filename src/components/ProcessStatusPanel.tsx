'use client';

import { useState, useEffect } from 'react';
import { Rocket, Loader2, Square, Terminal } from 'lucide-react';

interface ProcessInfo {
  id: string;
  name: string;
  status: string;
  logs?: string[];
}

export function ProcessStatusPanel() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logsMap, setLogsMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const res = await fetch('/api/process?all=true');
        const data = await res.json();
        setProcesses(data.processes ?? []);
      } catch {
        setProcesses([]);
      }
    };
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!expandedId) return;
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/process?id=${encodeURIComponent(expandedId)}`);
        const data = await res.json();
        setLogsMap((prev) => ({ ...prev, [expandedId]: data.logs ?? [] }));
      } catch {
        setLogsMap((prev) => ({ ...prev, [expandedId]: [] }));
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [expandedId]);

  if (processes.length === 0) {
    return (
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 h-full min-h-[200px] flex flex-col items-center justify-center text-zinc-500">
        <Rocket className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm font-medium">Aucun processus en cours</p>
        <p className="text-xs mt-1">Les workers lancés depuis le dashboard apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-blue-500" />
        Processus en cours
      </h3>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {processes.map((proc) => (
          <div
            key={proc.id}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === proc.id ? null : proc.id)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-800/50 transition-colors"
            >
              {proc.status === 'running' ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <span className="text-sm font-medium text-white truncate flex-1">{proc.name}</span>
              <span className="text-[10px] font-bold uppercase text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">
                {proc.status}
              </span>
            </button>
            {expandedId === proc.id && (
              <div className="border-t border-zinc-800 p-3 bg-black/40">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                  <Terminal className="w-3 h-3" />
                  <span className="text-xs font-bold uppercase">Logs</span>
                </div>
                <pre className="text-[11px] font-mono text-zinc-400 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                  {(logsMap[proc.id] ?? []).slice(-80).join('\n') || 'No logs yet.'}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
