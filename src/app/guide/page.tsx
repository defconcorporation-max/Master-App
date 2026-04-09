import Link from 'next/link';
import { BookOpen, Key, Mic, Terminal, ShieldAlert, Cpu, DatabaseZap, Workflow, Globe, ArrowLeft } from 'lucide-react';

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 md:p-16 selection:bg-indigo-500/30 font-sans custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition mb-10 text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Retour au Command Center
                </Link>

                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
                    Codex Opérationnel
                </h1>
                <p className="text-lg text-zinc-400 mb-16 leading-relaxed">
                    Guide d'intégration complet pour le Master Command Center (God-Tier Architecture). Ce document explique comment configurer et activer les 28 modules d'intelligence opérationnelle.
                </p>

                {/* Section 1: Prérequis / Clés API */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <Key className="w-6 h-6 text-emerald-400" /> 
                        1. Configuration des Variables d'Environnement
                    </h2>
                    <p className="text-zinc-400 mb-6 leading-relaxed">
                        Le Master App utilise des dizaines de connexions distantes. Créez un fichier <code className="text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded">.env.local</code> à la racine du projet et ajoutez :
                    </p>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-sm text-zinc-300 overflow-x-auto shadow-2xl">
                        <pre>
{`# Le Cerveau IA (J.A.R.V.I.S, Board of Directors, etc.)
GEMINI_API_KEY=votre_cle_gemini_ici

# Pour le système de paiement automatisé et Rev-Share 
STRIPE_SECRET_KEY=votre_cle_stripe_live

# Pour surveiller les dépôts GitHub (Git Health)
GITHUB_PAT=votre_cle_github_personal_access_token

# (Vercel et AWS si vous activez les connecteurs live du Cost Optimizer)
VERCEL_API_TOKEN=...
`}
                        </pre>
                    </div>
                </section>

                {/* Section 2: J.A.R.V.I.S & Intelligence */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <Mic className="w-6 h-6 text-blue-400" /> 
                        2. L'Orbe J.A.R.V.I.S. et IA
                    </h2>
                    <ul className="space-y-4">
                        <li className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <strong className="text-white block mb-1">🎙️ Contrôle Vocal Local :</strong> 
                            <span className="text-zinc-400 text-sm">Cliquez sur l'Orbe rotatif en bas à droite et autorisez le micro. Dites <code className="text-blue-400">"Analyse le projet Auclaire"</code>. Google Speech-to-Text envoie la requête locale vers Gemini API.</span>
                        </li>
                        <li className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <strong className="text-white block mb-1">🏛️ Board of Directors :</strong> 
                            <span className="text-zinc-400 text-sm">Cliquez sur "AI Board of Directors" en haut. Soumettez une idée pivotale. L'application simulera 3 agents IA distincts (CEO, CFO, CTO) qui débattront votre idée en temps réel.</span>
                        </li>
                    </ul>
                </section>

                {/* Section 3: Webhooks et Auto-Healing */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <Workflow className="w-6 h-6 text-indigo-400" /> 
                        3. Webhooks & Cross-Talk (Inter-App)
                    </h2>
                    <p className="text-zinc-400 mb-6 leading-relaxed">
                        Vos autres projets Next.js peuvent communiquer avec Master App. Demandez-leur d'envoyer une requête POST pour apparaître dans le Cross-Talk Stream.
                    </p>
                    <div className="bg-black border border-indigo-900/50 rounded-xl p-4 font-mono text-xs text-indigo-200 overflow-x-auto">
{`// Dans 'Auclaire' ou 'Defcon', lors d'une nouvelle inscription :
fetch('http://localhost:3000/api/webhooks', {
  method: 'POST',
  body: JSON.stringify({ 
    appId: "Auclaire", 
    event: "NEW_USER_SIGNUP", 
    payload: { user: "john@doe.com" } 
  })
});`}
                    </div>
                    <div className="mt-4 bg-black border border-red-900/50 rounded-xl p-4 font-mono text-xs text-red-200 overflow-x-auto">
{`// Pour le Self-Healing Code (Auto-Rollback) :
// Configurez Sentry pour envoyer ses Webhooks vers => http://votre_master_app/api/webhooks/sentry
// En cas d'erreur fatale répétée (> 50 fois), Master App forcera un rollback Vercel local !`}
                    </div>
                </section>

                {/* Section 4: Drones & Workers Node.js */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <Terminal className="w-6 h-6 text-amber-400" /> 
                        4. Protocol Drones (Scripts Backend)
                    </h2>
                    <p className="text-zinc-400 mb-6 leading-relaxed text-sm">
                        La zone "Autonomous Protocol Drones" exécute des scripts <code className="bg-zinc-800 px-1 rounded">ts-node</code> réels situés dans le dossier <code className="bg-zinc-800 px-1 rounded">src/workers/</code>. Assurez-vous d'avoir exécuté <code className="text-amber-400 font-bold">npm install -g tsx</code> ou <code className="text-amber-400 font-bold">npm install -g ts-node</code> sur votre machine pour qu'ils fonctionnent nativement.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <strong className="text-amber-400 text-sm block mb-1">SOC2 Enforcer</strong>
                            <p className="text-zinc-500 text-xs">Examine récursivement vos répertoires locaux à la recherche de clés d'API exposées (.env) ou de failles de sécurité.</p>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <strong className="text-amber-400 text-sm block mb-1">Neural Code Link</strong>
                            <p className="text-zinc-500 text-xs">Utilise Gemini pour extraire un composant React du projet A, le convertir pour l'architecture du projet B, et le sauvegarder via <code>fs</code>.</p>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <strong className="text-amber-400 text-sm block mb-1">Legal Black Box</strong>
                            <p className="text-zinc-500 text-xs">Lit votre <code>package.json</code>, détermine vos trackers/BDD, et génère une Politique de Confidentialité Markdown personnalisée via IA.</p>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <strong className="text-amber-400 text-sm block mb-1">Rev-Share Smart Contract</strong>
                            <p className="text-zinc-500 text-xs">Simule/Exécute une frappe de paiement Stripe (<code>stripe.transfers.create</code>) selon la Cap Table définie dans le script.</p>
                        </div>
                    </div>
                </section>

                {/* Section 5: Opérations Avancées */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <ShieldAlert className="w-6 h-6 text-red-500" /> 
                        5. Ghost Protocol & Overdrive
                    </h2>
                    <ul className="space-y-4">
                        <li className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-sm text-zinc-400">
                            <strong className="text-white">☠️ The Ghost Protocol :</strong> Bouton de panique. S'il est activé, l'interface simule la purge de vos processus de développement actifs (IPC), nettoie les caches Node.js locaux, et déconnecte les sockets distants.
                        </li>
                        <li className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-sm text-zinc-400">
                            <strong className="text-white">🎛️ Global Feature Flags :</strong> Activez/Désactivez des fonctionnalités de vos applications (ex: l'accès public) à distance. Ceci est prêt à être pluggé sur Vercel Edge Config.
                        </li>
                        <li className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-sm text-zinc-400">
                            <strong className="text-white">🤖 VC Outreach Agent :</strong> Un drone IA qui simule la recherche Crunchbase, la rédaction automatisée de mails par Gemini, et l'envoi de pitch decks par paquets de 25.
                        </li>
                        <li className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-sm text-zinc-400">
                            <strong className="text-white">🚀 Universal DB Migrator :</strong> Saisissez une ligne de SQL et cliquez sur Broadcast. Le script simulera le routage de l'ordre DDL vers toutes vos bases Supabase actives simultanément via Service Roles.
                        </li>
                    </ul>
                </section>

            </div>
        </div>
    );
}
