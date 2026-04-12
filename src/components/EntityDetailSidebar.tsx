'use client';

import React from 'react';
import { 
    X, 
    Calendar, 
    User, 
    DollarSign, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Gem, 
    Camera, 
    Zap, 
    MapPin, 
    MoreHorizontal,
    Mail,
    Phone,
    TrendingUp,
    ExternalLink,
    Shield,
    Trash2
} from 'lucide-react';
import { OmniTask, EmpireContact, ExpenseItem, AppActivity } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

type Entity = OmniTask | EmpireContact | ExpenseItem | AppActivity;

interface EntityDetailSidebarProps {
    entity: Entity | null;
    onClose: () => void;
}

export function EntityDetailSidebar({ entity, onClose }: EntityDetailSidebarProps) {
    if (!entity) return null;

    const isTask = (e: Entity): e is OmniTask => 'status' in e && ('priority' in e || 'jewelryType' in e);
    const isContact = (e: Entity): e is EmpireContact => 'email' in e && 'lifetimeValue' in e;
    const isExpense = (e: Entity): e is ExpenseItem => 'category' in e && 'amount' in e && !('status' in e);
    const isActivity = (e: Entity): e is AppActivity => 'type' in e && 'title' in e && !isTask(e) && !isContact(e);

    const getAppIcon = (appName: string) => {
        if (appName.includes('Auclaire')) return <Gem className="w-5 h-5 text-blue-400" />;
        if (appName.includes('Defcon')) return <Camera className="w-5 h-5 text-emerald-400" />;
        if (appName.includes('Viva')) return <MapPin className="w-5 h-5 text-purple-400" />;
        if (appName.includes('DRS')) return <Zap className="w-5 h-5 text-red-400" />;
        return <Shield className="w-5 h-5 text-zinc-400" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done':
            case 'vip':
            case 'active':
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'in_progress':
            case 'todo':
                return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'lead':
            case 'backlog':
                return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
            case 'critical':
                return 'text-red-400 bg-red-500/10 border-red-500/20';
            default:
                return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), 'PPP à HH:mm', { locale: fr });
        } catch {
            return dateString;
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <aside className="fixed top-0 right-0 h-full w-full sm:max-w-lg bg-zinc-950/80 backdrop-blur-3xl border-l border-white/10 z-[101] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 opacity-50" />
                
                {/* Close Button */}
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                            {getAppIcon(entity.appName)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-1">{entity.appName}</p>
                            <h2 className="text-xl font-black text-white leading-none">
                                {isTask(entity) || isContact(entity) || isActivity(entity) ? (entity as any).title || (entity as any).name : 'Dépense'}
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8 scrollbar-hide">
                    
                    {/* Primary Stats section */}
                    <div className="grid grid-cols-2 gap-4">
                        {isTask(entity) && (
                            <>
                                <div className="glass-panel p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Statut</span>
                                    <span className={`text-xs font-black uppercase px-2 py-1 rounded inline-block w-fit mt-1 border ${getStatusColor(entity.status)}`}>
                                        {entity.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="glass-panel p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Priorité</span>
                                    <span className={`text-xs font-black uppercase px-2 py-1 rounded inline-block w-fit mt-1 border ${getStatusColor(entity.priority)}`}>
                                        {entity.priority}
                                    </span>
                                </div>
                            </>
                        )}
                        {isContact(entity) && (
                            <>
                                <div className="glass-panel p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">LTV</span>
                                    <span className="text-lg font-black text-emerald-400">${entity.lifetimeValue.toLocaleString()}</span>
                                </div>
                                <div className="glass-panel p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Type</span>
                                    <span className={`text-xs font-black uppercase px-2 py-1 rounded inline-block w-fit mt-1 border ${getStatusColor(entity.status)}`}>
                                        {entity.status}
                                    </span>
                                </div>
                            </>
                        )}
                        {isExpense(entity) && (
                            <>
                                <div className="glass-panel p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Montant</span>
                                    <span className="text-lg font-black text-red-400">-${entity.amount.toLocaleString()}</span>
                                </div>
                                <div className="glass-panel p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Catégorie</span>
                                    <span className="text-xs font-black uppercase text-zinc-300 mt-1">{entity.category}</span>
                                </div>
                            </>
                        )}
                        {isActivity(entity) && (
                            <>
                                <div className="glass-panel p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Type d'Activité</span>
                                    <span className="text-xs font-black uppercase text-indigo-400 mt-1">{entity.type.replace('_', ' ')}</span>
                                </div>
                                {entity.amount && (
                                    <div className="glass-panel p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Volume/Impact</span>
                                        <span className="text-lg font-black text-white">${entity.amount.toLocaleString()}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Details section */}
                    <div className="space-y-6">
                        {isTask(entity) && (
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Calendar className="w-5 h-5 text-zinc-500 mt-1" />
                                    <div>
                                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Date de l'événement</p>
                                        <p className="text-sm text-zinc-200 mt-1">{formatDate(entity.date)}</p>
                                    </div>
                                </div>
                                {entity.clientName && (
                                    <div className="flex items-start gap-4">
                                        <User className="w-5 h-5 text-zinc-500 mt-1" />
                                        <div>
                                            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Client</p>
                                            <p className="text-sm text-zinc-200 mt-1">{entity.clientName}</p>
                                        </div>
                                    </div>
                                )}
                                {entity.budget && (
                                    <div className="flex items-start gap-4">
                                        <DollarSign className="w-5 h-5 text-zinc-500 mt-1" />
                                        <div>
                                            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Valeur Estimée</p>
                                            <p className="text-sm text-emerald-400 font-bold mt-1">${entity.budget.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isContact(entity) && (
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-blue-500/30 transition-all cursor-pointer">
                                    <Mail className="w-5 h-5 text-blue-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Email</p>
                                        <p className="text-sm text-zinc-200 mt-1">{entity.email}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-blue-400" />
                                </div>
                                {entity.phone && (
                                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-emerald-500/30 transition-all cursor-pointer">
                                        <Phone className="w-5 h-5 text-emerald-400 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Mobile</p>
                                            <p className="text-sm text-zinc-200 mt-1">{entity.phone}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400" />
                                    </div>
                                )}
                                <div className="flex items-start gap-4">
                                    <Clock className="w-5 h-5 text-zinc-500 mt-1" />
                                    <div>
                                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Dernière activité</p>
                                        <p className="text-sm text-zinc-200 mt-1">{formatDate(entity.lastActive)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <TrendingUp className="w-5 h-5 text-zinc-500 mt-1" />
                                    <div>
                                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Métriques Intelligence</p>
                                        <p className="text-sm text-zinc-200 mt-1">{entity.metrics}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isExpense(entity) && (
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Calendar className="w-5 h-5 text-zinc-500 mt-1" />
                                    <div>
                                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Date</p>
                                        <p className="text-sm text-zinc-200 mt-1">{formatDate(entity.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 border-t border-white/5 pt-6">
                                    <div>
                                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Description</p>
                                        <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
                                            {entity.description || 'Acunne description fournie pour cette charge.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isActivity(entity) && (
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Calendar className="w-5 h-5 text-zinc-500 mt-1" />
                                    <div>
                                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Date</p>
                                        <p className="text-sm text-zinc-200 mt-1">{formatDate(entity.date)}</p>
                                    </div>
                                </div>
                                {entity.description && (
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                        <p className="text-sm text-zinc-300 leading-relaxed italic">
                                            "{entity.description}"
                                        </p>
                                    </div>
                                )}
                                {entity.metadata && (
                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                        <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Metadata</p>
                                        <p className="text-xs text-zinc-400 font-mono">
                                            {entity.metadata}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Insight Box */}
                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl relative overflow-hidden group/ai">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px]" />
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Jarvis Insight</span>
                        </div>
                        <p className="text-xs text-blue-200/60 leading-relaxed italic">
                            {isTask(entity) && entity.priority === 'critical' ? (
                                "Monsieur, cette tâche bloque potentiellement d'autres livrables. Je recommande de prioriser ce client dès maintenant."
                            ) : isContact(entity) && entity.status === 'vip' ? (
                                "Ce profil a une LTV exceptionnelle. Il serait judicieux de planifier un appel direct pour entretenir la relation."
                            ) : (
                                "Aucune anomalie détectée sur cette entité. Elle suit son cycle opérationnel normal."
                            )}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 md:p-6 bg-black/40 border-t border-white/5 flex flex-wrap gap-3">
                    <button className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase text-zinc-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
                        <MoreHorizontal className="w-4 h-4" /> Détails Complets
                    </button>
                    {isTask(entity) && entity.status !== 'done' && (
                        <button className="flex-1 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-black uppercase text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2 group">
                            <CheckCircle2 className="w-4 h-4 group-hover:scale-110" /> Marquer Terminé
                        </button>
                    )}
                    {isExpense(entity) && (
                        <button className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-black uppercase text-red-400 hover:bg-red-500/20 transition-all">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
