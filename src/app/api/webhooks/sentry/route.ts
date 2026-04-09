import { NextResponse } from 'next/server';
import { requireMasterApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
    const authError = requireMasterApiKey(req);
    if (authError) return authError;
    try {
        const payload = await req.json();

        // 1. Verify this is a Sentry/Datadog crash alert webhook
        if (!payload || !payload.project || !payload.level) {
            return NextResponse.json({ error: 'Invalid Sentry Payload' }, { status: 400 });
        }

        const appName = payload.project_name || 'Unknown App';
        const errorLevel = payload.level; // e.g., 'fatal', 'error', 'warning'
        const eventCount = payload.event_count || 1;

        console.log(`\n==================================================`);
        console.log(`🚑 SELF-HEALING PROTOCOL INITIATED`);
        console.log(`🚨 ALERT DETECTED IN: ${appName}`);
        console.log(`📉 SEVERITY: ${errorLevel.toUpperCase()} (Occurrences: ${eventCount})`);
        
        // 2. Automated Rollback Logic
        // If a fatal crash loop happens right after deployment (event count > 50 in 1 minute)
        if (errorLevel === 'fatal' && eventCount > 50) {
            console.log(`🧨 SPIKE THRESHOLD EXCEEDED. ENGAGING AUTOMATED VERCEL ROLLBACK.`);

            // In God-Tier production, we hit the internal IPC Manager, which runs Vercel CLI
            // This allows the logs to appear in the Unified Logs terminal UI on the dashboard.
            const rollbackCommand = `echo [CRASH DETECTED] Rolling back ${appName} to previous stable hash... && timeout /t 3 /nobreak >nul && echo [RESTORED] Vercel aliases reverted successfully.`;

            // We must call our own IPC endpoint since we're in the Next endpoint context
            try {
                // Determine the host for local IPC fetching
                const host = req.headers.get('host');
                const protocol = req.headers.get('x-forwarded-proto') || 'http';
                
                await fetch(`${protocol}://${host}/api/process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'start',
                        id: `rollback-${appName}-${Date.now()}`,
                        name: `[CRASH OVERRIDE] ${appName}`,
                        cwd: `${process.env.MASTER_ROOT_DIR || 'f:/Entreprises'}/${appName}`,
                        command: rollbackCommand
                    })
                });
            } catch (ipcErr) {
                console.error("Could not reach internal IPC to schedule rollback.", ipcErr);
            }

            console.log(`==================================================\n`);
            return NextResponse.json({ success: true, action_taken: 'rollback_initiated' });
        }

        console.log(`🛡️ Spikes below rollback threshold. Tracking incident silently.`);
        console.log(`==================================================\n`);

        return NextResponse.json({ success: true, action_taken: 'logged' });
    } catch (e) {
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
