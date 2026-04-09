'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, parseISO, isValid } from 'date-fns';

interface ChartPoint {
  date: string;
  revenue: number;
  expenses?: number;
}

interface PeriodComparisonProps {
  chartData: ChartPoint[];
}

export function PeriodComparison({ chartData }: PeriodComparisonProps) {
  const { thisMonth, lastMonth, revenueChange, expenseChange } = useMemo(() => {
    const now = new Date();
    const thisStart = startOfMonth(now);
    const thisEnd = endOfMonth(now);
    const lastStart = startOfMonth(subMonths(now, 1));
    const lastEnd = endOfMonth(subMonths(now, 1));

    let thisRev = 0,
      thisExp = 0,
      lastRev = 0,
      lastExp = 0;

    chartData.forEach((p) => {
      const d = parseISO(p.date);
      if (!isValid(d)) return;
      const t = d.getTime();
      if (t >= thisStart.getTime() && t <= thisEnd.getTime()) {
        thisRev += p.revenue ?? 0;
        thisExp += p.expenses ?? 0;
      } else if (t >= lastStart.getTime() && t <= lastEnd.getTime()) {
        lastRev += p.revenue ?? 0;
        lastExp += p.expenses ?? 0;
      }
    });

    const revenueChange = lastRev === 0 ? (thisRev > 0 ? 100 : 0) : ((thisRev - lastRev) / lastRev) * 100;
    const expenseChange = lastExp === 0 ? (thisExp > 0 ? 100 : 0) : ((thisExp - lastExp) / lastExp) * 100;

    return {
      thisMonth: { revenue: thisRev, expenses: thisExp },
      lastMonth: { revenue: lastRev, expenses: lastExp },
      revenueChange,
      expenseChange,
    };
  }, [chartData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
          Ce mois ({format(new Date(), 'MMMM yyyy')})
        </p>
        <p className="text-2xl font-bold text-emerald-400">
          ${thisMonth.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          <span className="text-sm font-normal text-zinc-500 ml-1">revenus</span>
        </p>
        <p className="text-lg font-medium text-red-400/90 mt-1">
          ${thisMonth.expenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          <span className="text-sm font-normal text-zinc-500 ml-1">dépenses</span>
        </p>
      </div>
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Vs mois dernier</p>
        <div className="flex items-center gap-2">
          {revenueChange >= 0 ? (
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
          <span className={revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            Revenus {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {expenseChange >= 0 ? (
            <TrendingUp className="w-5 h-5 text-red-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-emerald-500" />
          )}
          <span className={expenseChange <= 0 ? 'text-emerald-400' : 'text-red-400'}>
            Dépenses {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
