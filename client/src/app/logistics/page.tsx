'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { LogisticsItem, LogisticStatus } from '@/types';
import { ItemModal } from '@/components/modals/ItemModal';
import { AssignModal } from '@/components/modals/AssignModal';
import { TransferModal } from '@/components/modals/TransferModal';
import { EventManagementModal } from '@/components/modals/EventManagementModal';
import { Plus, RefreshCw, Trash2, UserPlus, UserMinus, Send, Settings, Edit2, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LogisticsPage() {
    const [items, setItems] = useState<LogisticsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isItemModalOpen, setItemModalOpen] = useState(false);
    const [isEventModalOpen, setEventModalOpen] = useState(false);
    const [assignModalItemId, setAssignModalItemId] = useState<number | null>(null);
    const [transferModalItemId, setTransferModalItemId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<LogisticsItem | null>(null);
    const { user } = useAuth();
    
    const [cityFilter, setCityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [logisticStatusFilter, setLogisticStatusFilter] = useState('');
    const [eventFilter, setEventFilter] = useState('');
    const [eventsList, setEventsList] = useState<{id: number, name: string}[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const fetchItems = useCallback(async (currentPage: number = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (cityFilter) params.append('city', cityFilter);
            if (statusFilter) params.append('status', statusFilter);
            if (logisticStatusFilter) params.append('logistic_status', logisticStatusFilter);
            if (eventFilter) params.append('event', eventFilter);
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
    }, [cityFilter, statusFilter, logisticStatusFilter, eventFilter, page]);

    useEffect(() => {
        if (!user) return;
        fetchItems(1);
        api.get('/logistics/events').then(res => setEventsList(res.data)).catch(console.error);
    }, [cityFilter, statusFilter, logisticStatusFilter, eventFilter, user]);

    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
    }, [page, fetchItems]);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        setCityFilter('');
        setStatusFilter('');
        setLogisticStatusFilter('');
        setEventFilter('');
        setPage(1);
        try {
            await Promise.all([
                fetchItems(1),
                api.get('/logistics/events').then(res => setEventsList(res.data)).catch(console.error),
                new Promise(resolve => setTimeout(resolve, 400))
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/logistics/${id}`);
            fetchItems();
        } catch (err) {
            console.error(err);
            alert('Failed to delete item.');
        }
    };

    const handleUnassign = async (id: number) => {
        try {
            await api.post(`/logistics/${id}/unassign`);
            fetchItems();
        } catch (err) {
            console.error(err);
            alert('Failed to unassign item.');
        }
    };
    
    const handleUpdateLogisticStatus = async (id: number, newStatus: string) => {
        try {
            await api.put(`/logistics/${id}`, { logistic_status: newStatus });
            fetchItems();
        } catch (err) {
            console.error(err);
            alert('Failed to update logistic status.');
        }
    }

    const handleEditClick = (item: LogisticsItem) => {
        setEditingItem(item);
        setItemModalOpen(true);
    };

    const handleCloseModal = () => {
        setItemModalOpen(false);
        setEditingItem(null);
    };
    
    const handleDownloadExcel = async () => {
        try {
            const res = await api.get('/logistics/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Logistics_Master_Sheet.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error(err);
            alert('Failed to download Excel sheet');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Logistics Inventory</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage and track your supplies</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {user?.role === 'Admin' && (
                        <button 
                            onClick={handleDownloadExcel}
                            className="inline-flex items-center justify-center px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium transition-colors border border-neutral-200 dark:border-neutral-700"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Master Sheet
                        </button>
                    )}
                    <button 
                        onClick={() => setItemModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Item
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="w-full sm:w-40 space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">City</label>
                    <input type="text" placeholder="City" value={cityFilter} onChange={e => setCityFilter(e.target.value)} 
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                <div className="w-full sm:w-40 space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stock Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                        <option value="">All</option>
                        <option value="Available">Available</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>
                <div className="w-full sm:w-40 space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Logistic Status</label>
                    <select value={logisticStatusFilter} onChange={e => setLogisticStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                        <option value="">All</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div className="w-full sm:w-40 space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Event</label>
                    <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                        <option value="">All Events</option>
                        {eventsList.map(ev => (
                            <option key={ev.id} value={ev.name}>{ev.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 flex-grow justify-end">
                    {user?.role === 'Admin' && (
                        <button onClick={() => setEventModalOpen(true)} className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors" title="Manage Options">
                            <Settings className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={handleManualRefresh} disabled={isRefreshing} className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" title="Refresh">
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4">Item Name</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Logistic Status</th>
                                <th className="p-4">Stock Status</th>
                                <th className="p-4">Assigned To</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-neutral-500 dark:text-neutral-400 font-medium">
                                        No items match your criteria.
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
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${
                                                item.logistic_status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                item.logistic_status === 'In Progress' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                'bg-neutral-400'
                                            }`} />
                                            {user?.role === 'Admin' || item.assigned_to === user?.id ? (
                                                <select 
                                                    value={item.logistic_status || 'Pending'} 
                                                    onChange={(e) => handleUpdateLogisticStatus(item.id, e.target.value)}
                                                    className="bg-transparent border-0 text-sm font-medium focus:ring-0 cursor-pointer p-0 m-0 text-neutral-700 dark:text-neutral-300"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            ) : (
                                                <span className="text-sm font-medium">{item.logistic_status || 'Pending'}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            item.status === 'Available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                            item.status === 'Assigned' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                            'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/10 dark:text-neutral-400'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-neutral-600 dark:text-neutral-400">
                                        {item.status === 'Assigned' ? (
                                            <span className="font-medium text-neutral-900 dark:text-white">
                                                {item.assigned_to_username}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 flex items-center justify-end space-x-2">
                                        {(user?.role === 'Admin' || item.assigned_to === user?.id) && (
                                            <button onClick={() => handleEditClick(item)} className="p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors" title="Edit Properties">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        {(user?.role === 'Admin' || item.assigned_to === user?.id) && item.status === 'Assigned' && (
                                            <button onClick={() => setTransferModalItemId(item.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Transfer Request">
                                                <Send className="w-4 h-4" />
                                            </button>
                                        )}

                                        {user?.role === 'Admin' && (
                                            <>
                                                {item.status === 'Available' ? (
                                                    <button onClick={() => setAssignModalItemId(item.id)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title="Assign">
                                                        <UserPlus className="w-5 h-5" />
                                                    </button>
                                                ) : item.status === 'Assigned' ? (
                                                    <button onClick={() => handleUnassign(item.id)} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors" title="Unassign">
                                                        <UserMinus className="w-5 h-5" />
                                                    </button>
                                                ) : <div className="w-8" />}
                                                
                                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
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

            <EventManagementModal isOpen={isEventModalOpen} onClose={() => setEventModalOpen(false)} onRefresh={() => { fetchItems(); api.get('/logistics/events').then(res => setEventsList(res.data)); }} />
            <AssignModal isOpen={assignModalItemId !== null} onClose={() => setAssignModalItemId(null)} onRefresh={fetchItems} itemId={assignModalItemId} />
            <ItemModal 
                isOpen={isItemModalOpen} 
                onClose={handleCloseModal} 
                onRefresh={fetchItems} 
                item={editingItem}
            />
            <TransferModal 
                isOpen={transferModalItemId !== null} 
                onClose={() => setTransferModalItemId(null)} 
                onRefresh={fetchItems} 
                itemId={transferModalItemId} 
                currentOwnerId={items.find(i => i.id === transferModalItemId)?.assigned_to}
            />
        </div>
    );
}
