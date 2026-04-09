import { NextResponse } from 'next/server';
import { requireMasterApiKey } from '@/lib/api-auth';

// In a real local command center this might be sqlite or just the Node process memory
const eventLog: any[] = [
    { id: 'mock-1', source: 'Auclaire', type: 'user_signup', data: { email: 'test@example.com' }, timestamp: new Date(Date.now() - 50000).toISOString() },
    { id: 'mock-2', source: 'Defcon', type: 'invoice_paid', data: { amount: 450 }, timestamp: new Date(Date.now() - 15000).toISOString() }
];

export async function POST(req: Request) {
    const authError = requireMasterApiKey(req);
    if (authError) return authError;
    try {
        const payload = await req.json();
        
        const event = {
            id: Date.now().toString(),
            source: payload.source || 'Unknown App',
            type: payload.type || 'generic_event',
            data: payload.data || {},
            timestamp: new Date().toISOString()
        };

        eventLog.unshift(event);
        if (eventLog.length > 50) eventLog.pop();

        // Simulating the Cross-Talk routing logic
        if (event.source === 'Auclaire' && event.type === 'sale_completed') {
            console.log('[CROSS-TALK ENGINE] Detected Auclaire Sale. Broadcasting to Defcon CRM for fulfillment...');
            eventLog.unshift({
                id: Date.now().toString() + '-broadcast',
                source: 'Master Base',
                type: 'cross_talk_dispatch',
                data: { target: 'Defcon', action: 'trigger_fulfillment', ref: event.id },
                timestamp: new Date().toISOString()
            });
        }

        return NextResponse.json({ success: true, event });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json({ events: eventLog });
}
