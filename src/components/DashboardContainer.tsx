'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Activity, 
    Target, 
    MessageSquare, 
    ChevronRight,
    Bell,
    TrendingUp,
    Shield,
    Globe,
    Rocket,
    Maximize2,
    Minimize2,
    Boxes,
    Map
} from 'lucide-react';
import { useRouter } from 'next/navigation';


// Components
import { AISummary } from '@/components/AISummary';
import { GlobalFinancialPortfolio } from '@/components/GlobalFinancialPortfolio';
import { GlobalChart } from '@/components/GlobalChart';
import { OmniKanban } from '@/components/OmniKanban';
import { OmniCalendar } from '@/components/OmniCalendar';
import { WarRoom } from '@/components/WarRoom';
import { GlobalActivityStream } from '@/components/GlobalActivityStream';
import { RevenueSimulator } from '@/components/RevenueSimulator';
import { ComparativeAnalytics } from '@/components/ComparativeAnalytics';
import { ExitValuator } from '@/components/ExitValuator';
import { GoalTracker } from '@/components/GoalTracker';
import { EmpireAdvisor } from '@/components/EmpireAdvisor';
import { CommunicationBridge } from '@/components/CommunicationBridge';
import { TicketAggregator } from '@/components/TicketAggregator';
import { DeployedAppCard } from '@/components/DeployedAppCard';
import { OmniCRM } from '@/components/OmniCRM';
import { BusinessCard } from '@/components/BusinessCard';
import { GhostProtocol } from '@/components/GhostProtocol';
import { GlobalFeatureFlags } from '@/components/GlobalFeatureFlags';
import { LoyaltyPredictor } from '@/components/LoyaltyPredictor';
import { VentureSimulator } from '@/components/VentureSimulator';
import { GlobalSearch } from '@/components/GlobalSearch';
import { AutoSocialArchitect } from '@/components/AutoSocialArchitect';
import { TaxAutomator } from '@/components/TaxAutomator';
import { DashboardFilters, filterChartDataByDateRange, filterActivityByDateRange, type AppId, type DateRange, type ViewMode } from '@/components/DashboardFilters';
import { HealthWidget } from '@/components/HealthWidget';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ExportCSVButton, buildStatsCSV, downloadCSV } from '@/components/ExportCSVButton';
import { GoalsWidget } from '@/components/GoalsWidget';
import { PeriodComparison } from '@/components/PeriodComparison';
import { ProcessStatusPanel } from '@/components/ProcessStatusPanel';
import { AttentionBlock } from '@/components/AttentionBlock';
import { AppStats } from '@/lib/db-clients';

type Tab = 'pulse' | 'ops' | 'strategy' | 'comms' | 'systems';

interface DashboardContainerProps {
    data: {
        businesses: any[];
        stats: any;
        tasks: any[];
        clients: any[];
        deployedApps: AppStats[];
        totalUsers: number;
        totalActivity: number;
        totalBilled: number;
        totalCollected: number;
        totalPending: number;
        totalExpenses: number;
        totalCommissionsPaid: number;
        globalChartData: Array<{ date: string; revenue: number; expenses?: number }>;
        globalActivityFeed: Array<{ appName: string; type: string; title: string; amount?: number; date: string }>;
        appUrls?: { auclaire: string; defcon: string; antigravity: string; drs: string };
    }
}

export function DashboardContainer({ data }: DashboardContainerProps) {
    const [activeTab, setActiveTab] = useState<Tab>('pulse');
    const [selectedApps, setSelectedApps] = useState<AppId[]>(['auclaire', 'defcon', 'antigravity', 'drs']);
    const [dateRange, setDateRange] = useState<DateRange>('30d');
    const [viewMode, setViewMode] = useState<ViewMode>('empire');
    const [presentationMode, setPresentationMode] = useState(false);
    const [opsView, setOpsView] = useState<'board' | 'calendar'>('board');
    const router = useRouter();

    const handle3DLaunch = () => {
        router.push('/tv-dashboard');
    };

    const filteredData = useMemo(() => {
        const apps = data.deployedApps.filter((app: any) => app.id && selectedApps.includes(app.id as AppId));
        const chartData = filterChartDataByDateRange(
            apps.flatMap((a) => (a.chartData ?? [])),
            dateRange
        );
        const activityFeed = filterActivityByDateRange(
            apps.flatMap((a) => (a.activityFeed ?? [])),
            dateRange
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);
        const totalBilled = apps.reduce((s, a) => s + (a.financials?.billed ?? 0), 0);
        const totalCollected = apps.reduce((s, a) => s + (a.financials?.collected ?? 0), 0);
        const totalPending = apps.reduce((s, a) => s + (a.financials?.pending ?? 0), 0);
        const totalExpenses = apps.reduce((s, a) => s + (a.financials?.expenses ?? 0), 0);
        const totalCommissionsPaid = apps.reduce((s, a) => s + (a.financials?.commissionsPaid ?? 0), 0);
        const totalUsers = apps.reduce((s, a) => s + (a.users ?? 0), 0);
        const totalActivity = apps.reduce((s, a) => s + (a.tasks ?? 0), 0);
        return {
            deployedApps: apps,
            globalChartData: chartData,
            globalActivityFeed: activityFeed,
            totalBilled,
            totalCollected,
            totalPending,
            totalExpenses,
            totalCommissionsPaid,
            totalUsers,
            totalActivity,
            stats: { ...data.stats, auclaire: apps.find((a) => a.id === 'auclaire') ?? data.stats.auclaire, defcon: apps.find((a) => a.id === 'defcon') ?? data.stats.defcon, antigravity: apps.find((a) => a.id === 'antigravity') ?? data.stats.antigravity, drs: apps.find((a) => a.id === 'drs') ?? data.stats.drs },
            tasks: data.tasks,
            clients: data.clients,
        };
    }, [data, selectedApps, dateRange]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'k') {
                    e.preventDefault();
                    window.dispatchEvent(new Event('focus-global-search'));
                }
                if (e.key >= '1' && e.key <= '5') {
                    e.preventDefault();
                    const tabs: Tab[] = ['pulse', 'ops', 'strategy', 'comms', 'systems'];
                    setActiveTab(tabs[Number(e.key) - 1]);
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const navigation = [
        { id: 'pulse', label: 'Pulse', icon: <Activity className="w-5 h-5" />, description: 'Empire Vitals', isNew: false },
        { id: 'ops', label: 'Ops', icon: <Rocket className="w-5 h-5" />, description: 'Tactical Board', isNew: true },
        { id: '3d', label: '3D City', icon: <Boxes className="w-5 h-5" />, description: 'Visual Engine', isNew: true, action: handle3DLaunch },
        { id: 'strategy', label: 'Strategy', icon: <TrendingUp className="w-5 h-5" />, description: 'Growth Lab', isNew: false },
        { id: 'comms', label: 'Comms', icon: <MessageSquare className="w-5 h-5" />, description: 'Messaging', isNew: false },
        { id: 'systems', label: 'Systems', icon: <Shield className="w-5 h-5" />, description: 'Infrastructure', isNew: false },
    ];

    const handleExportCSV = () => {
        const csv = buildStatsCSV({
            deployedApps: filteredData.deployedApps,
            globalActivityFeed: filteredData.globalActivityFeed,
        });
        downloadCSV(csv, `master-app-stats-${new Date().toISOString().slice(0, 10)}.csv`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'pulse':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AttentionBlock
                            deployedApps={filteredData.deployedApps}
                            totalPending={filteredData.totalPending}
                            appUrls={data.appUrls ?? { auclaire: '', defcon: '', antigravity: '', drs: '' }}
                        />
                        <DashboardFilters
                            selectedApps={selectedApps}
                            dateRange={dateRange}
                            viewMode={viewMode}
                            onAppsChange={setSelectedApps}
                            onDateRangeChange={setDateRange}
                            onViewModeChange={setViewMode}
                        />
                        <AISummary apps={filteredData.deployedApps} />
                        <GlobalFinancialPortfolio 
                            totalCollected={filteredData.totalCollected} 
                            totalBilled={filteredData.totalBilled} 
                            totalPending={filteredData.totalPending} 
                            totalExpenses={filteredData.totalExpenses}
                            totalCommissionsPaid={filteredData.totalCommissionsPaid}
                        />
                        <PeriodComparison chartData={filteredData.globalChartData} />
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-1">
                                <GoalsWidget totalCollected={filteredData.totalCollected} totalPending={filteredData.totalPending} />
                            </div>
                            <div className="lg:col-span-3">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2">
                                        <GlobalChart data={filteredData.globalChartData} />
                                    </div>
                                    <div className="xl:col-span-1">
                                        <EmpireAdvisor tasks={filteredData.tasks} stats={filteredData.stats} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'ops':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <Rocket className="w-6 h-6" /> Operations Center
                            </h2>
                            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5 shadow-inner">
                                <button
                                    onClick={() => setOpsView('board')}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                                        opsView === 'board' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    Board
                                </button>
                                <button
                                    onClick={() => setOpsView('calendar')}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                                        opsView === 'calendar' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    Agenda
                                </button>
                            </div>
                        </div>
                        <div className="h-[650px] relative">
                            {opsView === 'board' ? (
                                <OmniKanban tasks={filteredData.tasks} />
                            ) : (
                                <OmniCalendar tasks={filteredData.tasks} />
                            )}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="h-[500px]">
                                <WarRoom tasks={filteredData.tasks} />
                            </div>
                            <div className="h-[500px]">
                                <GlobalActivityStream allStats={filteredData.stats} />
                            </div>
                        </div>
                    </div>
                );
            case 'strategy':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                             <TrendingUp className="w-6 h-6" /> Strategic Planning Lab
                        </h2>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <RevenueSimulator />
                            <AutoSocialArchitect stats={filteredData.stats} />
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <ComparativeAnalytics apps={filteredData.deployedApps} />
                            <LoyaltyPredictor clients={filteredData.clients} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <VentureSimulator />
                            <GoalTracker apps={filteredData.deployedApps} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ExitValuator apps={filteredData.deployedApps} />
                        </div>
                    </div>
                );
            case 'comms':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-[600px]">
                            <OmniCRM clients={filteredData.clients} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 h-[600px]">
                                <CommunicationBridge />
                            </div>
                            <div className="lg:col-span-2 h-[600px]">
                                <TicketAggregator />
                            </div>
                        </div>
                    </div>
                );
            case 'systems':
                return (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                                <Rocket className="w-4 h-4" /> Deployed Systems
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {filteredData.deployedApps.map((app) => (
                                    <DeployedAppCard key={app.name} stats={app} />
                                ))}
                            </div>
                        </section>
                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                                <Rocket className="w-4 h-4" /> Processus en cours
                            </h2>
                            <div className="h-[280px]">
                                <ProcessStatusPanel />
                            </div>
                        </section>
                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Local Workspaces Found
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {data.businesses.map((business) => (
                                    <BusinessCard key={business.path} business={business} />
                                ))}
                            </div>
                        </section>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <TaxAutomator data={{
                                    totalBilled: filteredData.totalBilled,
                                    totalCollected: filteredData.totalCollected,
                                    totalPending: filteredData.totalPending,
                                    totalExpenses: filteredData.totalExpenses
                                }} />
                            </div>
                            <div className="lg:col-span-1">
                                <GhostProtocol />
                            </div>
                            <div className="lg:col-span-1">
                                <GlobalFeatureFlags />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`flex h-screen overflow-hidden font-sans bg-[var(--background)] text-[var(--foreground)] ${presentationMode ? 'presentation-mode' : ''}`}>
            {/* Minimal & Powerful Sidebar */}
            <aside className={`w-72 border-r flex flex-col z-20 shadow-2xl transition-all duration-300 bg-[var(--sidebar-bg)] border-[var(--border)] ${presentationMode ? 'hidden' : ''}`}>
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight leading-none uppercase">Master App</span>
                            <span className="text-[10px] font-bold text-zinc-600 tracking-widest mt-1">GLOBAL_OS_VER_3.0</span>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {navigation.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if ((item as any).action) {
                                        (item as any).action();
                                    } else {
                                        setActiveTab(item.id as Tab);
                                    }
                                }}
                                className={`w-full group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
                                    activeTab === item.id 
                                        ? 'bg-blue-600/10 border border-blue-500/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <div className={`transition-colors ${activeTab === item.id ? 'text-blue-500' : 'group-hover:text-zinc-300'}`}>
                                    {item.icon}
                                </div>
                                <div className="flex flex-col items-start relative">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                                        {item.isNew && (
                                            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        )}
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{item.description}</span>
                                </div>
                                {activeTab === item.id && (
                                    <ChevronRight className="ml-auto w-4 h-4 text-blue-500" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 pt-4">
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase text-white">The Master</span>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase">Empire Owner</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide transition-all duration-300 ${presentationMode ? 'max-w-full' : ''} bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black`}>
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                    <div className="flex-1 max-w-2xl">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <HealthWidget />
                        <ThemeToggle />
                        <ExportCSVButton onExport={handleExportCSV} />
                        <button
                            type="button"
                            onClick={() => setPresentationMode((p) => !p)}
                            className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors text-zinc-400"
                            title={presentationMode ? 'Quitter le mode présentation' : 'Mode présentation'}
                        >
                            {presentationMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors text-zinc-400">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                <p className="text-[10px] text-zinc-600 mb-4">
                    Raccourcis : <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Ctrl+K</kbd> recherche · <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Ctrl+1</kbd>–<kbd className="px-1 py-0.5 bg-zinc-800 rounded">5</kbd> onglets
                </p>

                <div className="relative">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
