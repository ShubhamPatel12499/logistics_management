import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
    const { user, logout } = useAuth();
    const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';
    
    return (
        <header className="h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-6 z-10">
            <button 
                className="lg:hidden p-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={onMenuClick}
            >
                <Menu className="w-5 h-5" />
            </button>
            <div className="lg:flex-1" />
            
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20 text-sm">
                        {initial}
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white text-base">{user?.username}</span>
                </div>
                <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
                <button 
                    onClick={logout}
                    className="flex items-center space-x-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
