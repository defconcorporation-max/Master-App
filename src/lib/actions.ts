"use server";

import { searchGlobal, AppStats } from "@/lib/db-clients";
import type { OmniSearchResult } from "@/lib/god-eye";

export async function performGlobalSearch(query: string): Promise<OmniSearchResult[]> {
    const raw = await searchGlobal(query.trim());
    return raw.map((r): OmniSearchResult => ({
        id: r.id,
        appName: r.appName,
        type: r.type === 'other' ? 'client' : r.type,
        title: r.title,
        subtitle: r.subtitle ?? ''
    }));
}

export async function getAiExecutiveSummary(apps: AppStats[]): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        return "DEBUG_ERROR_01: GEMINI_API_KEY is missing in .env.local.";
    }
    console.log(`[MASTER_AI_DEBUG] Calling Gemini with key starting in: ${apiKey.substring(0, 6)}`);

    try {
        const dataString = apps.map(app => (
            `App: ${app.name}
             Status: ${app.status}
             Billed: $${app.financials?.billed}
             Collected: $${app.financials?.collected}
             Pending: $${app.financials?.pending}
             Expenses: $${app.financials?.expenses}
             Profit: $${app.financials?.profit}
             Activity (last 24h): ${app.tasks} records`
        )).join('\n\n');

        const prompt = `
            You are the AI Executive Assistant for the Master Command Center.
            Analyze the following multi-company business data and provide a concise, high-impact executive summary.
            
            Focus on:
            1. Overall Portfolio Health.
            2. Any alarming trends (e.g., high pending receivables, low profits).
            3. Top performer of the cycle.
            4. One actionable recommendation for the CEO.
            
            Keep the tone professional, direct, and premium. Use bullet points for readability.
            Max 200 words.
            
            DATA:
            ${dataString}
        `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const error = await response.json();
            return `AI_CORE_ERROR: ${error?.error?.message || response.statusText}`;
        }

        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";
    } catch (error: any) {
        return `CONNECTION_ERROR: ${error.message}`;
    }
} catch (error: any) {
        console.error("Fetch Error:", error);
        return "An error occurred while connecting to the AI engine. Please check your internet connection.";
    }
}
