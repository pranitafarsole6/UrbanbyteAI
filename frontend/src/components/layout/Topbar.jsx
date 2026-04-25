import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title = 'Dashboard' }) {
    const { user } = useAuth();
    
    // Simple rank mapping
    const getRank = (score) => {
        if (score >= 90) return "Eco Legend";
        if (score >= 70) return "Digital Forester";
        if (score >= 40) return "Green Path Explorer";
        return "Eco Beginner";
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
            <h1 className="text-xl font-semibold text-eco-text">{title}</h1>

            <div className="flex items-center gap-4">
                <button className="p-2 text-eco-muted hover:bg-gray-50 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-eco-primary rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200/60">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-eco-muted font-medium">{getRank(user?.eco_score || 0)}</p>
                    </div>
                    <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200/60 shadow-sm">
                        <User className="w-5 h-5 text-eco-muted" />
                    </div>
                </div>
            </div>
        </header>
    );
}
