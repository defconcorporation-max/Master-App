import { scanBusinesses } from '@/lib/scanner';
import { fetchGlobalStats, fetchOmniTasks, fetchGlobalClients, ChartDataPoint, AppActivity } from '@/lib/db-clients';
import { DashboardContainer } from '@/components/DashboardContainer';

export default async function Home() {
  const businesses = await scanBusinesses();
  const stats = await fetchGlobalStats();
  const tasks = await fetchOmniTasks();
  const clients = await fetchGlobalClients();

  // Highlight all 4 core apps in the premium tier (with stable id for filters)
  const deployedApps = [
    { ...stats.auclaire, id: 'auclaire' as const },
    { ...stats.defcon, id: 'defcon' as const },
    { ...stats.antigravity, id: 'antigravity' as const },
    { ...stats.drs, id: 'drs' as const },
  ];
  const totalUsers = deployedApps.reduce((sum, app) => sum + (app.users || 0), 0);
  const totalActivity = deployedApps.reduce((sum, app) => sum + (app.tasks || 0), 0);
  
  // Aggregate Advanced Financials globally
  let totalBilled = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let totalExpenses = 0;
  let totalCommissionsPaid = 0;
  let globalChartData: ChartDataPoint[] = [];
  let globalActivityFeed: AppActivity[] = [];

  deployedApps.forEach(app => {
      if (app.financials) {
          totalBilled += app.financials.billed || 0;
          totalCollected += app.financials.collected || 0;
          totalPending += app.financials.pending || 0;
          totalExpenses += app.financials.expenses || 0;
          totalCommissionsPaid += app.financials.commissionsPaid || 0;
      }
      if (app.chartData) {
          globalChartData = globalChartData.concat(app.chartData);
      }
      if (app.activityFeed) {
          globalActivityFeed = globalActivityFeed.concat(app.activityFeed);
      }
  });

  globalActivityFeed = globalActivityFeed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

  const appUrls = {
    auclaire: process.env.AUCLAIRE_APP_URL || '',
    defcon: process.env.DEFCON_APP_URL || '',
    antigravity: process.env.ANTIGRAVITY_APP_URL || '',
    drs: process.env.DRS_APP_URL || '',
  };

  const dashboardData = {
      businesses,
      stats,
      tasks,
      clients,
      deployedApps,
      totalUsers,
      totalActivity,
      totalBilled,
      totalCollected,
      totalPending,
      totalExpenses,
      totalCommissionsPaid,
      globalChartData,
      globalActivityFeed,
      appUrls,
  };

  return (
    <DashboardContainer data={dashboardData} />
  );
}
