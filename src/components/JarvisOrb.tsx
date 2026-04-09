"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Send } from 'lucide-react';

export function JarvisOrb() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Web Speech API if supported
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                
                recognition.onresult = (event: any) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(currentTranscript);
                };

                recognition.onend = () => {
                    setIsListening(false);
                    if (transcript) {
                        processCommand(transcript);
                    }
                };
                
                recognitionRef.current = recognition;
            }
        }
    }, [transcript]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setTranscript('');
            setResponse('');
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Speech recognition error:", e);
                setResponse("Voice command not supported in this browser. You can type your command.");
            }
        }
    };

    const processCommand = async (command: string) => {
        if (!command.trim()) return;
        setIsProcessing(true);
        setResponse('');
        
        try {
            // Send command to our internal AI route
            const res = await fetch('/api/jarvis', {
                method: 'POST',
                body: JSON.stringify({ command })
            });
            const data = await res.json();
            setResponse(data.response || "I didn't quite catch that, sir.");
            
            // Execute any action returned by J.A.R.V.I.S
            if (data.action === 'deploy') {
                await fetch('/api/process', { 
                    method: 'POST', 
                    body: JSON.stringify({ action: 'start', id: `voice-deploy`, name: `Voice Deploy`, cwd: 'master-app', command: 'npm run build' }) 
                });
                setResponse("Deployment sequence initiated, sir.");
            }
        } catch (e) {
            setResponse("Connection to the server mainframe lost.");
        } finally {
            setIsProcessing(false);
            setTranscript('');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-4">
            {/* J.A.R.V.I.S Chat Window */}
            {isOpen && (
                <div className="bg-black/80 backdrop-blur-xl border border-blue-500/30 w-80 rounded-2xl p-4 shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-2 mb-3 border-b border-blue-900/40 pb-2">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-black tracking-widest text-blue-300 uppercase">J.A.R.V.I.S. Core</span>
                    </div>
                    
                    <div className="min-h-24 max-h-48 overflow-y-auto mb-3 text-sm">
                        {isListening && <p className="text-zinc-400 italic">Listening: {transcript}...</p>}
                        {isProcessing && <p className="text-blue-400 animate-pulse flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Processing directive...</p>}
                        {response && <p className="text-emerald-400 font-mono text-xs">{response}</p>}
                        {!isListening && !isProcessing && !response && (
                            <p className="text-zinc-500">Awaiting your command, sir.</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="text"
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            placeholder="Type command..."
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') processCommand(transcript);
                            }}
                        />
                        <button 
                            onClick={() => processCommand(transcript)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition"
                        >
                            <Send className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {[
                            'Quel est le CA total ?',
                            'Résumé des impayés',
                            'Top app ce mois',
                            'Déploie Master App',
                        ].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => { setTranscript(s); processCommand(s); }}
                                className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Glowing Orb Button */}
            <button 
                onClick={() => {
                    if (!isOpen) setIsOpen(true);
                    else toggleListening();
                }}
                className={`relative group flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 ${
                    isListening ? 'bg-blue-600 scale-110' : 'bg-black border border-blue-500/50 hover:border-blue-400'
                }`}
            >
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${
                    isListening ? 'bg-blue-500/60 animate-pulse' : 'bg-blue-600/20 group-hover:bg-blue-500/40'
                }`} />
                
                <div className="relative z-10 text-white">
                    {isListening ? (
                        <Mic className="w-6 h-6 animate-pulse" />
                    ) : (
                        <Sparkles className={`w-6 h-6 ${isOpen ? 'text-blue-400' : 'text-zinc-400 group-hover:text-blue-300'}`} />
                    )}
                </div>
                
                {/* Rotating ring */}
                <div className={`absolute inset-[-2px] rounded-full border border-transparent border-t-blue-400 transition-transform duration-[3000ms] ${
                    isListening ? 'animate-spin opacity-100' : 'opacity-0'
                }`} />
            </button>
        </div>
    );
}
