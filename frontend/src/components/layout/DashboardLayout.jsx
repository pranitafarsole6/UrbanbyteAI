import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children, title = "Dashboard" }) {
    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden text-slate-800">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Topbar title={title} />
                <main className="flex-1 overflow-y-auto px-6 py-8 lg:p-10">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
}
