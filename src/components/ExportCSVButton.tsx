'use client';

import { Download } from 'lucide-react';

interface ExportCSVButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

export function ExportCSVButton({ onExport, disabled }: ExportCSVButtonProps) {
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}

export function buildStatsCSV(data: {
  deployedApps: Array<{ name: string; id?: string; users?: number; financials?: { billed: number; collected: number; pending: number; expenses: number; profit: number }; tasks?: number }>;
  globalActivityFeed: Array<{ appName: string; type: string; title: string; amount?: number; date: string }>;
}): string {
  const rows: string[] = [];
  rows.push('App,Users,Billed,Collected,Pending,Expenses,Profit,Records');
  data.deployedApps.forEach((app) => {
    const f = app.financials ?? { billed: 0, collected: 0, pending: 0, expenses: 0, profit: 0 };
    rows.push(
      [
        `"${(app.name ?? '').replace(/"/g, '""')}"`,
        app.users ?? 0,
        f.billed,
        f.collected,
        f.pending,
        f.expenses,
        f.profit,
        app.tasks ?? 0,
      ].join(',')
    );
  });
  rows.push('');
  rows.push('Activity,App,Type,Title,Amount,Date');
  data.globalActivityFeed.forEach((a) => {
    rows.push(`"${(a.title ?? '').replace(/"/g, '""')}","${(a.appName ?? '').replace(/"/g, '""')}","${a.type}","${(a.title ?? '').replace(/"/g, '""')}",${a.amount ?? ''},"${a.date}"`);
  });
  return rows.join('\n');
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
