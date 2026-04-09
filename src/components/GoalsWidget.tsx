'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Edit2 } from 'lucide-react';

const STORAGE_KEY = 'master-app-goals';

interface Goal {
  id: string;
  label: string;
  targetAmount: number;
  currentAmount: number;
}

const defaultGoals: Goal[] = [
  { id: 'revenue', label: 'Revenus (collecté)', targetAmount: 50000, currentAmount: 0 },
  { id: 'pending', label: 'Encaissements en attente', targetAmount: 10000, currentAmount: 0 },
];

export function GoalsWidget({
  totalCollected,
  totalPending,
}: {
  totalCollected: number;
  totalPending: number;
}) {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setGoals(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === 'revenue') return { ...g, currentAmount: totalCollected };
        if (g.id === 'pending') return { ...g, currentAmount: totalPending };
        return g;
      })
    );
  }, [totalCollected, totalPending]);

  const saveGoals = (next: Goal[]) => {
    setGoals(next);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updateTarget = (id: string, targetAmount: number) => {
    const next = goals.map((g) => (g.id === id ? { ...g, targetAmount } : g));
    saveGoals(next);
    setEditing(null);
  };

  const progress = (g: Goal) => (g.targetAmount <= 0 ? 0 : Math.min(100, (g.currentAmount / g.targetAmount) * 100));

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 text-amber-500" />
        Objectifs
      </h3>
      <div className="space-y-4">
        {goals.map((g) => (
          <div key={g.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-zinc-300">{g.label}</span>
              {editing === g.id ? (
                <input
                  type="number"
                  defaultValue={g.targetAmount}
                  onBlur={(e) => updateTarget(g.id, Number(e.target.value) || 0)}
                  onKeyDown={(e) => e.key === 'Enter' && updateTarget(g.id, Number((e.target as HTMLInputElement).value) || 0)}
                  className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-white"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(g.id)}
                  className="text-zinc-500 hover:text-zinc-300 p-0.5"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  progress(g) >= 100 ? 'bg-emerald-500' : progress(g) >= 50 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress(g)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              ${g.currentAmount.toLocaleString()} / ${g.targetAmount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
