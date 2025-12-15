import React from 'react';
import { BarChart, Activity, Crosshair } from 'lucide-react';

export default function MyStats() {
    return (
        <div className="min-h-screen bg-game-dark text-white p-8 pt-24 font-sans flex items-center justify-center">
            <div className="text-center">
                <Activity className="w-24 h-24 text-game-red mx-auto mb-6 animate-pulse" />
                <h1 className="text-4xl font-black uppercase mb-4">Tactical <span className="text-game-yellow">Analytics</span></h1>
                <p className="text-gray-500 font-mono">MODULE UNDER DEVELOPMENT</p>
                <p className="text-xs text-game-gray mt-2">Connecting to neural link...</p>

                <div className="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto opacity-50">
                    <div className="h-32 bg-white/5 rounded animate-pulse" />
                    <div className="h-32 bg-white/5 rounded animate-pulse delay-100" />
                    <div className="h-32 bg-white/5 rounded animate-pulse delay-200" />
                    <div className="h-32 bg-white/5 rounded animate-pulse delay-300" />
                </div>
            </div>
        </div>
    );
}
