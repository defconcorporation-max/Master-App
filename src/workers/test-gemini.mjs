import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env.local");
    process.exit(1);
}

const tests = [
    { name: 'v1beta/gemini-1.5-flash', url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}` },
    { name: 'v1/gemini-1.5-flash', url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}` },
    { name: 'v1/gemini-pro', url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}` },
];

async function runTests() {
    console.log(`🔍 Testing Gemini API Key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}\n`);

    for (const test of tests) {
        try {
            console.log(`[TESTING] ${test.name}...`);
            const res = await fetch(test.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
            });

            const data = await res.json();
            if (res.ok) {
                console.log(`✅ ${test.name}: SUCCESS!`);
                process.exit(0); // Stop at first success
            } else {
                console.log(`❌ ${test.name}: FAILED (${res.status}) - ${data?.error?.message || 'Unknown error'}`);
            }
        } catch (e) {
            console.log(`⚠️ ${test.name}: FETCH ERROR - ${e.message}`);
        }
    }
}

runTests();
