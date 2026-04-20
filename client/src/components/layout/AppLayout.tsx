'use client';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }
    
    if (!user) {
        return <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">{children}</div>;
    }
    
    return (
        <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto xl:px-4">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
