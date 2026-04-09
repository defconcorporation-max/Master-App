"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

export function ShowroomToggle() {
    const [isPristine, setIsPristine] = useState(false);

    useEffect(() => {
        if (isPristine) {
            document.body.classList.add("showroom-mode");
        } else {
            document.body.classList.remove("showroom-mode");
        }
        
        return () => {
            document.body.classList.remove("showroom-mode");
        }
    }, [isPristine]);

    return (
        <button 
            onClick={() => setIsPristine(!isPristine)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition shadow-lg ${
                isPristine 
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800'
            }`}
            title="Toggle Showroom Mode (Hides Sensitive Data)"
        >
            {isPristine ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            <span className="hidden md:inline text-xs font-bold tracking-wider uppercase">
                {isPristine ? 'Showroom Active' : 'Showroom Mode'}
            </span>
        </button>
    );
}
