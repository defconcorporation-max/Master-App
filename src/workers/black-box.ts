// src/workers/black-box.ts

import fs from 'fs';
import path from 'path';

// Parse arguments (e.g., ts-node black-box.ts Auclaire)
const targetApp = process.argv[2];

if (!targetApp) {
    console.error("❌ ERROR: You must specify a target app folder.");
    console.log("Usage: node black-box.js <AppName>");
    process.exit(1);
}

const ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';
const appPath = path.join(ROOT_DIR, targetApp);
const pkgPath = path.join(appPath, 'package.json');

console.log("==================================================");
console.log(`⚖️ INITIATING BLACK BOX LEGAL GENERATOR FOR: ${targetApp}`);
console.log("==================================================");

if (!fs.existsSync(pkgPath)) {
    console.error(`❌ ERROR: No package.json found in ${appPath}`);
    process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing from environment variables.");
    process.exit(1);
}

async function generateLegalDocs() {
    console.log(`[ANALYSIS] Reading dependencies for ${targetApp}...`);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    const deps = Object.keys(pkg.dependencies || {}).join(', ');
    console.log(`[ANALYSIS] Found dependencies: ${deps.substring(0, 100)}...`);

    const prompt = `
        You are an expert technology lawyer generating a GDPR and CCPA compliant Privacy Policy for a software application named "${targetApp}".

        The application uses the following libraries: ${deps}

        If you see "stripe" or similar payment gateways, explicitly include a clause about financial data processing.
        If you see "supabase" or "firebase", include clauses about cloud data storage and authentication.
        If you see "posthog" or "mixpanel" or "google-analytics", include tracking/cookie clauses.

        Write a professional, comprehensive Privacy Policy in Markdown format. Be definitive and protective of the company.
    `;

    console.log("[GENERATING] Engaging Gemini Legal AI...");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            const outputPath = path.join(appPath, 'PrivacyPolicy.md');
            fs.writeFileSync(outputPath, text);
            console.log(`\n✅ SUCCESS: Highly customized Privacy Policy generated and saved to ${outputPath}`);
        } else {
            console.error("❌ ERROR: AI returned an empty response.");
        }
    } catch (e) {
        console.error("❌ FATAL: Could not connect to the Legal AI Engine.", e);
    }
}

generateLegalDocs();
