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
    Map,
    Terminal,
    Menu
} from 'lucide-react';
import { useRouter } from 'next/navigation';


// Components
import { DailyCommandBriefing } from '@/components/DailyCommandBriefing';
import { GlobalFinancialPortfolio } from '@/components/GlobalFinancialPortfolio';
import { GlobalChart } from '@/components/GlobalChart';
import { OmniKanban } from '@/components/OmniKanban';
import { OmniCalendar } from '@/components/OmniCalendar';
import { OmniCRM } from '@/components/OmniCRM';
import { WarRoom } from '@/components/WarRoom';
import { GlobalActivityStream } from '@/components/GlobalActivityStream';
import { RevenueSimulator } from '@/components/RevenueSimulator';
import { ComparativeAnalytics } from '@/components/ComparativeAnalytics';
import { ExitValuator } from '@/components/ExitValuator';
import { GoalTracker } from '@/components/GoalTracker';
import { EmpireAdvisor } from '@/components/EmpireAdvisor';
import { CommunicationBridge } from '@/components/CommunicationBridge';
import { TicketAggregator } from '@/components/TicketAggregator';
import { BusinessCard } from '@/components/BusinessCard';
import { DeployedAppCard } from '@/components/DeployedAppCard';
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
import { EmpirePipeline } from '@/components/EmpirePipeline';
import { WhaleTracker } from '@/components/WhaleTracker';
import { EntityDetailSidebar } from '@/components/EntityDetailSidebar';
import { PredictiveCashflow } from '@/components/PredictiveCashflow';
import { CyberPulseSynthesis } from '@/components/CyberPulseSynthesis';
import { WealthForecast } from '@/components/WealthForecast';
import { CommandOrb } from '@/components/CommandOrb';
import { ExpenseRadar } from '@/components/ExpenseRadar';
import { SystemHealthGrid } from '@/components/SystemHealthGrid';
import { SystemLogsConsole } from '@/components/SystemLogsConsole';
import { EmpireMap } from '@/components/EmpireMap';
import { SentienceStream } from '@/components/SentienceStream';
import { OmniTask, EmpireContact, ExpenseItem, AppStats } from '@/lib/types';

type Tab = 'pulse' | 'ops' | 'strategy' | 'comms' | 'systems';

interface DashboardContainerProps {
    data: {
        businesses: any[];
        stats: any;
        tasks: any[];
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
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [opsView, setOpsView] = useState<'board' | 'calendar'>('board');
    const [localTasks, setLocalTasks] = useState<OmniTask[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<OmniTask | EmpireContact | ExpenseItem | null>(null);
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
        const allActivities = apps.flatMap((a) => (a.activityFeed ?? []));
        const activityFeed = filterActivityByDateRange(
            allActivities,
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
            allActivities,
            totalBilled,
            totalCollected,
            totalPending,
            totalExpenses,
            totalCommissionsPaid,
            totalUsers,
            totalActivity,
            stats: { ...data.stats, auclaire: apps.find((a) => a.id === 'auclaire') ?? data.stats.auclaire, defcon: apps.find((a) => a.id === 'defcon') ?? data.stats.defcon, antigravity: apps.find((a) => a.id === 'antigravity') ?? data.stats.antigravity, drs: apps.find((a) => a.id === 'drs') ?? data.stats.drs },
            tasks: [...data.tasks, ...localTasks].filter(t => selectedApps.includes(t.appName.toLowerCase().split(' ')[0] as any)),
        };
    }, [data, selectedApps, dateRange, localTasks]);

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
        const onEntitySelect = (e: any) => {
            if (e.detail) {
                setSelectedEntity(e.detail);
            }
        };

        const onCommand = (e: any) => {
            const { command } = e.detail;
            if (command.startsWith('/ghost')) setIsGhostMode(prev => !prev);
            if (command.startsWith('/cinema')) setPresentationMode(prev => !prev);
            if (command.startsWith('/task ')) {
                const title = command.replace('/task ', '').trim();
                const newTask: OmniTask = {
                    id: `local-${Date.now()}`,
                    appName: 'Master app',
                    title: title,
                    status: 'todo',
                    priority: 'medium',
                    date: new Date().toISOString()
                };
                setLocalTasks(prev => [newTask, ...prev]);
            }
            if (command.startsWith('/reset')) {
                setIsGhostMode(false);
                setPresentationMode(false);
                setActiveTab('pulse');
                setSelectedApps(['auclaire', 'defcon', 'antigravity', 'drs']);
            }
        };

        window.addEventListener('keydown', onKey);
        window.addEventListener('entity-selected' as any, onEntitySelect);
        window.addEventListener('command-executed' as any, onCommand);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('entity-selected' as any, onEntitySelect);
            window.removeEventListener('command-executed' as any, onCommand);
        };
    }, []);

    const navigation = [
        { id: 'pulse', label: 'Pulse', icon: <Activity className="w-5 h-5" />, description: 'Empire Vitals', status: 'normal' },
        { id: 'ops', label: 'Ops', icon: <Rocket className="w-5 h-5" />, description: 'Tactical Board', badge: filteredData.tasks.filter(t => t.status !== 'done').length },
        { id: '3d', label: '3D City', icon: <Boxes className="w-5 h-5" />, description: 'Visual Engine', status: 'special', action: handle3DLaunch },
        { id: 'strategy', label: 'Strategy', icon: <TrendingUp className="w-5 h-5" />, description: 'Growth Lab', status: 'normal' },
        { id: 'comms', label: 'Comms', icon: <MessageSquare className="w-5 h-5" />, description: 'Messaging', status: 'normal' },
        { id: 'systems', label: 'Systems', icon: <Shield className="w-5 h-5" />, description: 'Core Infra', status: 'secure' },
    ];

    const handleMapSelect = (id: string | 'all') => {
        if (id === 'all') {
            setSelectedApps(['auclaire', 'defcon', 'antigravity', 'drs']);
        } else {
            setSelectedApps([id as AppId]);
        }
    };

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
                        {/* High Intelligence AI Layer */}
                        <CyberPulseSynthesis 
                            stats={filteredData.deployedApps} 
                            tasks={filteredData.tasks} 
                        />

                        {/* Strategic Wealth Model */}
                        <WealthForecast 
                            stats={filteredData.deployedApps} 
                            tasks={filteredData.tasks} 
                            isGhostMode={isGhostMode}
                        />

                        {/* Intelligent Tactical Briefing */}
                        <DailyCommandBriefing 
                            tasks={filteredData.tasks} 
                            activities={filteredData.allActivities} 
                            deployedApps={filteredData.deployedApps} 
                            totalPending={filteredData.totalPending} 
                        />

                        <EmpirePipeline tasks={filteredData.tasks} />
                        
                        <DashboardFilters
                            selectedApps={selectedApps}
                            dateRange={dateRange}
                            viewMode={viewMode}
                            onAppsChange={setSelectedApps}
                            onDateRangeChange={setDateRange}
                            onViewModeChange={setViewMode}
                        />
                        <GlobalFinancialPortfolio 
                            totalCollected={filteredData.totalCollected} 
                            totalBilled={filteredData.totalBilled} 
                            totalPending={filteredData.totalPending} 
                            totalExpenses={filteredData.totalExpenses}
                            totalCommissionsPaid={filteredData.totalCommissionsPaid}
                            isGhostMode={isGhostMode}
                        />

                        <PeriodComparison chartData={filteredData.globalChartData} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <PredictiveCashflow apps={filteredData.deployedApps} />
                            </div>
                            <div className="lg:col-span-1">
                                <SentienceStream />
                            </div>
                        </div>

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
                        <div className="min-h-[850px] h-[85vh] relative">
                            {opsView === 'board' ? (
                                <OmniKanban tasks={filteredData.tasks} />
                            ) : (
                                <OmniCalendar tasks={filteredData.tasks} activities={filteredData.allActivities} />
                            )}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="h-[500px]">
                                <EmpireMap 
                                    stats={filteredData.deployedApps} 
                                    isGhostMode={isGhostMode} 
                                    onAppSelect={handleMapSelect}
                                />
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
                             <TrendingUp className="w-6 h-6" /> Strategic Intelligence Lab
                        </h2>

                        {/* Visual Empire Topography */}
                        <div className="w-full h-[600px] mb-8">
                            <EmpireMap 
                                stats={filteredData.deployedApps} 
                                isGhostMode={isGhostMode} 
                                onAppSelect={handleMapSelect}
                            />
                        </div>

                        {/* Deep Data: Whale Tracker + Expense Radar */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="h-[600px]">
                                <WhaleTracker />
                            </div>
                            <div className="h-[600px]">
                                <ExpenseRadar />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <ComparativeAnalytics apps={filteredData.deployedApps} />
                            <LoyaltyPredictor />
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <RevenueSimulator />
                            <AutoSocialArchitect stats={filteredData.stats} />
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
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[85vh]">
                        <OmniCRM />
                    </div>
                );
            case 'systems':
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section>
                            <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                                <Shield className="w-6 h-6" /> System Infrastructure Health
                            </h2>
                            <SystemHealthGrid />
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <section className="space-y-6">
                                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <Terminal className="w-4 h-4" /> Live System Logs
                                </h2>
                                <SystemLogsConsole />
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <Rocket className="w-4 h-4" /> Operational Processes
                                </h2>
                                <div className="h-[400px]">
                                    <ProcessStatusPanel />
                                </div>
                            </section>
                        </div>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Distributed Nodes & Apps
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {filteredData.deployedApps.map((app) => (
                                    <DeployedAppCard key={app.name} stats={app} />
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                                <Map className="w-4 h-4" /> Core Workspaces
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
        <div className={`flex h-screen overflow-hidden bg-black text-[var(--foreground)] relative font-sans ${presentationMode ? 'presentation-mode' : ''}`}>
            
            {/* Background Base Effects */}
            <div className="absolute inset-0 oled-grid pointer-events-none" />
            <div className="ambient-glow ambient-cyan" />
            <div className="ambient-glow ambient-indigo" />

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden animate-in fade-in transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Minimal & Powerful Jewel Sidebar */}
            <aside className={`fixed md:relative inset-y-0 left-0 w-72 md:w-72 m-4 rounded-[2rem] glass-panel flex flex-col z-[110] md:z-20 transition-all duration-500 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'}
                ${presentationMode ? 'hidden' : ''}
            `}>
                <div className="p-6 pb-4">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black tracking-tight leading-none uppercase">Master App</span>
                            <span className="text-[9px] font-bold text-zinc-500 tracking-widest mt-1">GLOBAL_OS_VER_4.0</span>
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
                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }}
                                className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                                    activeTab === item.id 
                                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_20px_rgba(59,130,246,0.15)]' 
                                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                                }`}
                            >
                                <div className={`transition-all duration-300 ${activeTab === item.id ? 'text-blue-400 scale-110' : 'group-hover:text-zinc-200'}`}>
                                    {item.icon}
                                </div>
                                <div className="flex flex-col items-start relative">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                                        {item.id === 'systems' && (
                                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                                        )}
                                        {item.badge && item.badge > 0 && (
                                            <span className="px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[8px] font-black text-indigo-400">
                                                {item.badge}
                                            </span>
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

                <div className="mt-auto p-6 pt-4">
                    <div className="p-3 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-inner">
                        <div className="relative">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/80 to-purple-500/80 rounded-xl border border-white/10" />
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase text-slate-200 tracking-wide">The Master</span>
                            <span className="text-[8px] font-bold text-indigo-400/80 uppercase tracking-widest">Empire Owner</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Universal Detail Sidebar */}
            <EntityDetailSidebar 
                entity={selectedEntity} 
                onClose={() => setSelectedEntity(null)} 
            />

            {/* Strategic Command Orb */}
            <CommandOrb 
                isPresentation={presentationMode}
                onTogglePresentation={() => setPresentationMode(!presentationMode)}
                onExport={handleExportCSV}
            />

            {/* Main Content Area */}
            <main className={`flex-1 overflow-y-auto scrollbar-hide transition-all duration-700 z-10 ${presentationMode ? 'p-0 bg-[#020617]' : 'p-4 md:p-8 lg:p-10'}`}>
                
                {/* Mobile Header Toggle */}
                <div className={`flex items-center justify-between mb-4 md:hidden transition-all duration-500 ${presentationMode ? 'opacity-0 h-0 p-0 mb-0 overflow-hidden' : 'p-2'}`}>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all shadow-xl"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <LayoutDashboard className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-white">Ops Center</span>
                    </div>
                </div>

                <header className={`flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 transition-all duration-500 ${presentationMode ? 'opacity-0 h-0 p-0 mb-0 overflow-hidden' : 'opacity-100'}`}>
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
                            className="p-3 glass-pill rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                            title={presentationMode ? 'Quitter le mode présentation' : 'Mode présentation'}
                        >
                            {presentationMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button className="p-3 glass-pill rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                            <Bell className="w-4 h-4" />
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
