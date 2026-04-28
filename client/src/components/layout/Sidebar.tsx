import Link from 'next/link';
import { Home, Package, Users, X, CheckCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Sidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
    const pathname = usePathname();
    const { user } = useAuth();
    
    const navItems = [
        { href: '/', label: 'Dashboard', icon: Home, adminOnly: false },
        { href: '/logistics', label: 'Logistics', icon: Package, adminOnly: false },
        { href: '/admin/completed-logistics', label: 'Completed Logistics', icon: CheckCircle, adminOnly: true },
        { href: '/users', label: 'User Directory', icon: Users, adminOnly: true },
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {open && (
                <div 
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md">
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Logistics</span>
                    <button className="lg:hidden text-neutral-500" onClick={() => setOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <nav className="p-4 space-y-1">
                    {navItems.filter(item => !item.adminOnly || user?.role === 'Admin').map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-500' : 'text-neutral-400'}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    );
}
