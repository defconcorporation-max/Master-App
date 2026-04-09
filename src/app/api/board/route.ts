import { NextResponse } from 'next/server';

const AGENTS = [
    { 
        id: 'ceo', 
        name: 'Alexander V.',
        role: 'Visionary CEO', 
        prompt: 'You are the Visionary CEO of a software empire. Evaluate the following business proposal based on aggressive market expansion, brand impact, and 10x growth potential. Be extremely ambitious, confident, and decisive. Keep it under 3 sentences.' 
    },
    { 
        id: 'cfo', 
        name: 'Sarah Chen',
        role: 'Conservative CFO', 
        prompt: 'You are the Conservative CFO of a software empire. Evaluate the following business proposal based exclusively on risk, profit margins, ROI, and runway. Be highly skeptical. Demand financial justification. Keep it under 3 sentences.' 
    },
    { 
        id: 'cto', 
        name: 'Dr. Aris',
        role: 'Pragmatic CTO', 
        prompt: 'You are the Pragmatic CTO of a software empire. Evaluate the following business proposal based on tech debt, system architecture, engineering hours, and AI automation potential. Focus on whether it scales. Keep it under 3 sentences.' 
    }
];

export async function POST(req: Request) {
    const { issue } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY missing from environment variables." }, { status: 500 });
    }

    try {
        // Run all 3 LLM agent inferences in parallel to simulate a real-time debate
        const responses = await Promise.all(
            AGENTS.map(async (agent) => {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${agent.prompt}\n\nPROPOSAL TO EVALUATE: "${issue}"` }] }]
                    })
                });
                
                const result = await res.json();
                let replyText = "No comment.";
                
                if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts) {
                    replyText = result.candidates[0].content.parts[0].text;
                }
                
                return {
                    id: agent.id,
                    name: agent.name,
                    role: agent.role,
                    reply: replyText.replace(/\n/g, ' ').trim()
                };
            })
        );
        
        return NextResponse.json({ responses });
    } catch (error) {
        console.error("Board API Error:", error);
        return NextResponse.json({ error: "The Board of Directors is currently unreachable due to a network disruption." }, { status: 500 });
    }
}
