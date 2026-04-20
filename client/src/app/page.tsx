'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { DashboardStats } from '@/types';
import { Package, CheckCircle, Clock, MapPin, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const { user } = useAuth();
    
    const fetchDashboardData = () => {
        api.get('/logistics/stats').then(res => setStats(res.data)).catch(console.error);
        api.get('/logistics/transfers/pending').then(res => setPendingRequests(res.data)).catch(console.error);
    };

    useEffect(() => {
        if (!user) return;
        fetchDashboardData();
    }, [user]);

    const handleTransferAction = async (requestId: number, action: 'accept' | 'reject') => {
        try {
            await api.post(`/logistics/transfer/${requestId}/${action}`);
            fetchDashboardData();
        } catch (err: any) {
            alert(err.response?.data?.error || `Failed to ${action} request`);
        }
    };

    const statCards = [
        { label: 'Total Items', value: stats?.total || 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Available', value: stats?.available || 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Assigned', value: stats?.assigned || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent inline-block">Dashboard Overview</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Welcome back, {user?.username}. Here is what's happening with your inventory.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{s.label}</p>
                                <p className="text-3xl font-bold mt-2 text-neutral-900 dark:text-white">{s.value}</p>
                            </div>
                            <div className={`p-4 rounded-xl ${s.bg}`}>
                                <s.icon className={`w-8 h-8 ${s.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold flex items-center text-neutral-900 dark:text-white">
                        <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                        Logistics by City
                    </h2>
                </div>
                <div className="p-6">
                    {stats?.byCity?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.byCity.map((c, i) => (
                                <div key={i} className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl flex justify-between items-center border border-neutral-200/50 dark:border-neutral-700/50 transition-all hover:border-indigo-500/30">
                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{c.city}</span>
                                    <span className="bg-white dark:bg-neutral-800 px-3 py-1 rounded-full text-sm font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-neutral-200 dark:border-neutral-700">
                                        {c.count} items
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-neutral-400">No items available to display.</div>
                    )}
                </div>
            </div>
            
            {pendingRequests.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl shadow-sm overflow-hidden mt-8 animate-in slide-in-from-bottom-5">
                    <div className="p-6 border-b border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10">
                        <h2 className="text-lg font-bold flex items-center text-indigo-900 dark:text-indigo-300">
                            <Bell className="w-5 h-5 mr-2 animate-bounce" />
                            Pending Transfer Requests
                        </h2>
                    </div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                <div>
                                    <p className="font-semibold text-neutral-900 dark:text-white">
                                        {req.from_username} wants to transfer <span className="text-indigo-500">"{req.item_name}"</span> to you
                                    </p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Requested at {new Date(req.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                                    <button onClick={() => handleTransferAction(req.id, 'reject')} className="px-5 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                                        Reject
                                    </button>
                                    <button onClick={() => handleTransferAction(req.id, 'accept')} className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25">
                                        Accept Transfer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
