
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const drsUrl = process.env.DRS_DATABASE_URL;

async function testConn() {
    console.log('Testing DRS Connection to:', drsUrl ? drsUrl.split('@')[1] : 'UNDEFINED');
    
    if (!drsUrl) {
        console.error('ERROR: DRS_DATABASE_URL is not defined in .env.local');
        return;
    }

    const pool = new Pool({ 
        connectionString: drsUrl,
        ssl: { rejectUnauthorized: false } 
    });

    try {
        const start = Date.now();
        const res = await pool.query('SELECT COUNT(*) as count FROM "Job"');
        console.log('SUCCESS!');
        console.log('Job Count:', res.rows[0].count);
        console.log('Latency:', Date.now() - start, 'ms');
        
        const clientRes = await pool.query('SELECT id FROM "ClientProfile" LIMIT 1');
        console.log('ClientProfile accessible:', !!clientRes.rows[0]);

    } catch (err) {
        console.error('CONNECTION FAILED!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
    } finally {
        await pool.end();
    }
}

testConn();
