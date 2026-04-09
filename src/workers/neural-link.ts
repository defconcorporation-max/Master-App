// src/workers/neural-link.ts

import fs from 'fs';
import path from 'path';

// Usage: ts-node neural-link.ts <SourceApp> <SourceFile> <TargetApp> <TargetFile>
const [,, srcApp, srcFile, tgtApp, tgtFile] = process.argv;

if (!srcApp || !srcFile || !tgtApp || !tgtFile) {
    console.error("❌ ERROR: Invalid Neural Link Telemetry.");
    console.log("Usage: node neural-link.js <SourceApp> <src/components/MyCard.tsx> <TargetApp> <src/components/MyCard.tsx>");
    process.exit(1);
}

const ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';
const srcPath = path.join(ROOT_DIR, srcApp, srcFile);
const tgtPath = path.join(ROOT_DIR, tgtApp, tgtFile);

console.log("==================================================");
console.log(`🧠 NEURAL LINK INITIATED`);
console.log(`📡 SOURCE: ${srcApp} -> ${srcFile}`);
console.log(`🎯 TARGET: ${tgtApp} -> ${tgtFile}`);
console.log("==================================================");

if (!fs.existsSync(srcPath)) {
    console.error(`❌ ERROR: Source file not found: ${srcPath}`);
    process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing. Neural Link offline.");
    process.exit(1);
}

async function portCodebase() {
    console.log(`[READING] Extracting synaptic code patterns from ${srcApp}...`);
    const sourceCode = fs.readFileSync(srcPath, 'utf-8');

    const prompt = `
        You are NEURAL LINK, a highly advanced cross-codebase porting agent. 
        Analyze the following source code from a React/NextJS project named ${srcApp}.
        Rewrite and adapt this code so it functions natively within a new project named ${tgtApp}.
        Ensure all imports match standard architecture, adapt naming conventions if necessary, and fix any contextual bugs.

        DO NOT use markdown \`\`\` wrappers. Just return the raw code file.

        SOURCE CODE:
        ${sourceCode}
    `;

    console.log("[INJECTING] Bridging Neural Link sequence to AI Core...");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            fs.mkdirSync(path.dirname(tgtPath), { recursive: true });
            
            const cleanText = text.replace(/```[a-z]*\n/gi, '').replace(/```\n?$/g, '').trim();
            
            fs.writeFileSync(tgtPath, cleanText);
            console.log(`\n✅ TRANSFER COMPLETE: Biological code successfully transplanted to ${tgtPath}`);
        } else {
            console.error("❌ ERROR: Neural Link extraction failed. Blank thought received.");
        }
    } catch (e) {
        console.error("❌ FATAL: Neural pathway severed during transfer.", e);
    }
}

portCodebase();
