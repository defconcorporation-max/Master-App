'use client';

import { Filter, Calendar, LayoutGrid, Layers, Boxes } from 'lucide-react';

export type AppId = 'auclaire' | 'defcon' | 'antigravity' | 'drs';
export type DateRange = '7d' | '30d' | '90d' | 'all';
export type ViewMode = 'empire' | 'per-app';

const APP_LABELS: Record<AppId, string> = {
  auclaire: 'Auclaire',
  defcon: 'Defcon',
  antigravity: 'Viva Vegas',
  drs: 'DRS',
};

const DATE_LABELS: Record<DateRange, string> = {
  '7d': '7 jours',
  '30d': '30 jours',
  '90d': '90 jours',
  all: 'Tout',
};

interface DashboardFiltersProps {
  selectedApps: AppId[];
  dateRange: DateRange;
  viewMode: ViewMode;
  onAppsChange: (apps: AppId[]) => void;
  onDateRangeChange: (range: DateRange) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function DashboardFilters({
  selectedApps,
  dateRange,
  viewMode,
  onAppsChange,
  onDateRangeChange,
  onViewModeChange,
}: DashboardFiltersProps) {
  const toggleApp = (id: AppId) => {
    if (selectedApps.includes(id)) {
      if (selectedApps.length === 1) return;
      onAppsChange(selectedApps.filter((a) => a !== id));
    } else {
      onAppsChange([...selectedApps, id].sort());
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-6">
      <div className="flex items-center gap-2 text-zinc-500">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Filtres</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(APP_LABELS) as AppId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => toggleApp(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              selectedApps.includes(id)
                ? 'bg-blue-600 text-white border border-blue-500'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-600 hover:text-zinc-300'
            }`}
          >
            {APP_LABELS[id]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-zinc-500" />
        {(Object.keys(DATE_LABELS) as DateRange[]).map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => onDateRangeChange(range)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateRange === range ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {DATE_LABELS[range]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 border-l border-zinc-700 pl-4">
        <button
          type="button"
          onClick={() => onViewModeChange('empire')}
          className={`p-2 rounded-lg transition-all ${viewMode === 'empire' ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Vue Empire (agrégée)"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('per-app')}
          className={`p-2 rounded-lg transition-all ${viewMode === 'per-app' ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Vue par app"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => window.location.href = '/tv-dashboard'}
          className="p-2 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all hover:bg-indigo-600/10"
          title="Lancer le Moteur 3D"
        >
          <Boxes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


export function filterChartDataByDateRange<T extends { date: string }>(data: T[], range: DateRange): T[] {
  if (range === 'all') return data;
  const now = Date.now();
  const ms = { '7d': 7 * 24 * 60 * 60 * 1000, '30d': 30 * 24 * 60 * 60 * 1000, '90d': 90 * 24 * 60 * 60 * 1000 }[range];
  const cut = now - ms;
  return data.filter((p) => new Date(p.date).getTime() >= cut);
}

export function filterActivityByDateRange<T extends { date: string }>(data: T[], range: DateRange): T[] {
  return filterChartDataByDateRange(data, range);
}
