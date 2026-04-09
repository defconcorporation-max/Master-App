import { Trophy, Star, Zap, Award } from 'lucide-react';

interface EmpireAchievementsProps {
    totalBilled: number;
    totalCollected: number;
    totalUsers: number;
    appsCount: number;
}

export function EmpireAchievements({ totalBilled, totalCollected, totalUsers, appsCount }: EmpireAchievementsProps) {
    // Define the achievements dynamically based on portfolio health
    const achievements = [];

    if (totalCollected > 100000) {
        achievements.push({
            id: '100k-club',
            title: '$100k Collected',
            desc: 'Six figures in the bank.',
            icon: <Trophy className="w-5 h-5 text-yellow-500" />,
            color: 'bg-yellow-500/10 border-yellow-500/30'
        });
    }

    if (totalUsers > 1000) {
        achievements.push({
            id: '1k-users',
            title: '1,000+ Users',
            desc: 'A massive active userbase.',
            icon: <Star className="w-5 h-5 text-blue-500" />,
            color: 'bg-blue-500/10 border-blue-500/30'
        });
    }

    if (appsCount >= 3) {
        achievements.push({
            id: 'empire-builder',
            title: 'Empire Builder',
            desc: 'Operating 3+ active platforms.',
            icon: <Award className="w-5 h-5 text-purple-500" />,
            color: 'bg-purple-500/10 border-purple-500/30'
        });
    }
    
    // Fallback if none
    if (achievements.length === 0) {
        achievements.push({
            id: 'first-steps',
            title: 'Startup Phase',
            desc: 'Deploy more apps or grow revenue.',
            icon: <Zap className="w-5 h-5 text-zinc-500" />,
            color: 'bg-zinc-900 border-zinc-800'
        });
    }

    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest flexitems-center gap-2">
                Empire Status
            </div>
            {achievements.map(ach => (
                <div key={ach.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${ach.color} transition-all hover:scale-105 cursor-default shadow-sm`}>
                    <div className="p-1.5 bg-black/20 rounded-md">
                        {ach.icon}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white leading-none mb-1">{ach.title}</h4>
                        <p className="text-[10px] text-zinc-400 font-medium leading-none">{ach.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
