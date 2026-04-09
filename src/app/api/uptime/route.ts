import { NextResponse } from 'next/server';

const APPS_TO_MONITOR = [
    { name: 'Auclaire', url: 'https://auclaire-mock.vercel.app' },
    { name: 'Defcon', url: 'https://defcon-crm-mock.vercel.app' },
    { name: 'Antigravity', url: 'https://antigravity-mock.up.railway.app' }
];

export async function GET() {
    // In production, this would use fetch() with a timeout to actually ping the deployed URLs.
    // For now we simulate the responses to power the UI.
    const results = await Promise.all(
        APPS_TO_MONITOR.map(async (app) => {
            try {
                // Simulate network latency (20ms - 200ms)
                const latency = Math.floor(Math.random() * 180) + 20;
                
                // Randomly crash a server 5% of the time for simulation purposes
                const isDown = Math.random() < 0.05;
                
                if (isDown) throw new Error('Timeout');
                
                return {
                    name: app.name,
                    status: 'online',
                    latencyMs: latency,
                    timestamp: new Date().toISOString()
                };
            } catch (e) {
                return {
                    name: app.name,
                    status: 'offline',
                    latencyMs: -1,
                    timestamp: new Date().toISOString()
                };
            }
        })
    );

    return NextResponse.json({ pings: results });
}
