// src/workers/soc2-enforcer.ts

import fs from 'fs';
import path from 'path';

// Define the root directory to scan
const ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';

console.log("==================================================");
console.log("🛡️ INITIATING SOC2 SECURITY SWEEP");
console.log("==================================================");

function scanDirectoryForSecrets(dirPath: string) {
    let violations = 0;
    
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name.startsWith('.') && entry.name !== '.env' && entry.name !== '.env.local') continue;
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next') continue;

            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                violations += scanDirectoryForSecrets(fullPath);
            } else if (entry.name.includes('.env')) {
                // Read .env file to look for hardcoded sensitive strings (Simulation)
                const content = fs.readFileSync(fullPath, 'utf-8');
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.includes('STRIPE_SECRET_KEY=sk_test_') || line.includes('sk_live_')) {
                        console.error(`[CRITICAL] Hardcoded Stripe Secret found: ${fullPath}:${index + 1}`);
                        violations++;
                    }
                    if (line.includes('API_KEY=') && line.length > 20 && !line.startsWith('#')) {
                        console.warn(`[WARNING] Potential unencrypted API Key found: ${fullPath}:${index + 1}`);
                        violations++;
                    }
                });
            } else if (entry.name === 'package.json') {
                const content = fs.readFileSync(fullPath, 'utf-8');
                if (content.includes('"next": "^12') || content.includes('"react": "^17')) {
                    console.warn(`[TECH DEBT] Outdated core framework detected in ${fullPath}. Migration required for strict compliance.`);
                    violations++;
                }
            }
        }
    } catch (e) {
        // Skip inaccessible folders
    }
    
    return violations;
}

try {
    const apps = fs.readdirSync(ROOT_DIR, { withFileTypes: true })
        .filter(dir => dir.isDirectory() && dir.name !== 'master app' && !dir.name.startsWith('.'))
        .map(dir => dir.name);

    console.log(`[SCANNING] Targets identified: ${apps.join(', ')}`);

    let totalViolations = 0;
    
    apps.forEach(appName => {
        console.log(`\nScanning ${appName}...`);
        const appPath = path.join(ROOT_DIR, appName);
        const appViolations = scanDirectoryForSecrets(appPath);
        
        if (appViolations === 0) {
            console.log(`✅ ${appName} passed SOC2 preliminary checks.`);
        }
        totalViolations += appViolations;
    });

    console.log("\n==================================================");
    if (totalViolations > 0) {
        console.log(`❌ SWEEP FAILED. Found ${totalViolations} security/compliance violations.`);
        process.exit(1);
    } else {
        console.log(`✅ SWEEP SUCCESSFUL. Zero critical violations found across all active workspaces.`);
        process.exit(0);
    }
} catch (error) {
    console.error(`Fatal error during sweep:`, error);
    process.exit(1);
}
