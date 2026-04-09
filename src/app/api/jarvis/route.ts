import { NextResponse } from 'next/server';
import { fetchGlobalStats } from '@/lib/db-clients';

export async function POST(req: Request) {
    try {
        const { command } = await req.json();
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        // Fetch real-time context to make Jarvis smarter
        const stats = await fetchGlobalStats();
        const contextString = JSON.stringify(stats, null, 2);

        const prompt = `
            You are J.A.R.V.I.S., a highly advanced, loyal, and witty AI advisor for the Master Command Center.
            Your creator is the Master (User). You are proactive, sophisticated, and you have access to the business's real-time data.

            CURRENT BUSINESS CONTEXT (JSON):
            ${contextString}

            USER COMMAND: "${command}"

            INSTRUCTIONS:
            1. Analyze the command.
            2. If the user asks about stats (revenue, users, etc.), use the context provided above to give precise answers.
            3. If the user asks about actions (e.g., "scan", "deploy", "migrate", "report"), identify them and set the "action" field.
            4. Keep the "response" elegant, concise, and slightly British (like the real Jarvis). Always call the user "Sir".

            RESPONSE FORMAT: JSON only.
            {
              "response": "Your verbal response here",
              "action": "optional_action_slug",
              "data": {}
            }
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            return NextResponse.json({ 
                response: "I'm having trouble connecting to my cognitive cores, Sir.",
                action: null
            });
        }

        const text = data.candidates[0].content.parts[0].text;
        
        // Handle pure JSON or Markdown wrapped JSON
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return NextResponse.json(parsed);

    } catch (error) {
        console.error("Jarvis API Error:", error);
        return NextResponse.json({ 
            response: "Apologies, Sir. A system error occurred in my neural pathways.",
            error: String(error)
        }, { status: 500 });
    }
}
