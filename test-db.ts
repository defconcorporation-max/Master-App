import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    // Dynamic import to ensure dotenv is loaded first
    const { fetchGlobalStats } = await import('./src/lib/db-clients.js');
    console.log("Fetching Global Stats...");
    const stats = await fetchGlobalStats();
    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
}

run();
