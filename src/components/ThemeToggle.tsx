'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'master-app-theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Theme | null;
    const initial: Theme = stored && ['light', 'dark', 'auto'].includes(stored) ? stored : 'dark';
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (t === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(t);
    }
  };

  const handleChange = (t: Theme) => {
    setTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  };

  return (
    <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
      <button
        type="button"
        onClick={() => handleChange('light')}
        className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-zinc-700 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        title="Clair"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => handleChange('dark')}
        className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-zinc-700 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        title="Sombre"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => handleChange('auto')}
        className={`p-2 rounded-md transition-all ${theme === 'auto' ? 'bg-zinc-700 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        title="Système"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
