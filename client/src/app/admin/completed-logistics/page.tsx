'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { LogisticsItem } from '@/types';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CompletedLogisticsPage() {
    const [items, setItems] = useState<LogisticsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();
    
    const [cityFilter, setCityFilter] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const fetchItems = useCallback(async (currentPage: number = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (cityFilter) params.append('city', cityFilter);
            params.append('logistic_status', 'Completed');
            params.append('page', currentPage.toString());
            params.append('limit', '10');
            
            const res = await api.get(`/logistics?${params.toString()}`);
            if (res.data.data) {
                setItems(res.data.data);
                setTotalPages(res.data.totalPages);
                setPage(res.data.page);
            } else {
                setItems(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [cityFilter, page]);

    useEffect(() => {
        if (user && user.role !== 'Admin') {
            router.push('/');
            return;
        }
        if (user?.role === 'Admin') {
            fetchItems(1);
        }
    }, [cityFilter, user, router, fetchItems]);

    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
    }, [page, fetchItems]);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        setCityFilter('');
        setPage(1);
        try {
            await Promise.all([
                fetchItems(1),
                new Promise(resolve => setTimeout(resolve, 400))
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (user?.role !== 'Admin') return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent inline-block">Completed Logistics</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Archive of all successfully delivered items</p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="w-full sm:w-40 space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">City</label>
                    <input type="text" placeholder="Filter by City" value={cityFilter} onChange={e => setCityFilter(e.target.value)} 
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 flex-grow justify-end">
                    <button onClick={handleManualRefresh} disabled={isRefreshing} className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" title="Refresh">
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-emerald-50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4">Item Name</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Assigned To</th>
                                <th className="p-4">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                            {items.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500 dark:text-neutral-400 font-medium">
                                        No completed logistics found.
                                    </td>
                                </tr>
                            ) : items.map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-neutral-900 dark:text-white mb-1">{item.name}</div>
                                        <div className="flex gap-2 text-xs">
                                            <span className="text-neutral-500">{item.category}</span>
                                            <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                            <span className="text-neutral-500">Qty: {item.quantity}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-neutral-900 dark:text-white font-medium">{item.city}</div>
                                        {item.event && (
                                            <div className="text-xs text-indigo-500 mt-1">★ {item.event}</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Completed
                                        </span>
                                    </td>
                                    <td className="p-4 text-neutral-600 dark:text-neutral-400">
                                        {item.assigned_to_username ? (
                                            <span className="font-medium text-neutral-900 dark:text-white">
                                                {item.assigned_to_username}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 text-neutral-500 dark:text-neutral-400 text-xs">
                                        {new Date(item.last_updated).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/30">
                        <span className="text-sm text-neutral-500">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button 
                                disabled={page === 1} 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            <button 
                                disabled={page === totalPages} 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="px-3 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
