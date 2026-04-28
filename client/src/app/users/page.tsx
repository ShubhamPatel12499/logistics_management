'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { User, UserStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, User as UserIcon, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useAuth();
    const router = useRouter();

    const fetchUsers = useCallback(async (currentPage: number) => {
        try {
            setLoading(true);
            const res = await api.get(`/users?page=${currentPage}&limit=10`);
            if (res.data.data) {
                setUsers(res.data.data);
                setTotalPages(res.data.totalPages);
                setPage(res.data.page);
            } else {
                setUsers(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user && user.role !== 'Admin') {
            router.push('/');
            return;
        }
        if (user?.role === 'Admin') {
            fetchUsers(page);
        }
    }, [user, router, page, fetchUsers]);

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? All items assigned to them will be made available.')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers(page);
        } catch (err) {
            console.error(err);
            alert('Failed to delete user.');
        }
    };

    const handleUpdateStatus = async (userId: number, newStatus: UserStatus) => {
        try {
            await api.put(`/users/${userId}/status`, { status: newStatus });
            fetchUsers(page);
        } catch (err) {
            console.error(err);
            alert('Failed to update user status.');
        }
    };

    if (user?.role !== 'Admin') return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent inline-block">User Directory</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage system access and approvals</p>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden mt-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4">ID</th>
                                <th className="p-4">Username / Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                    <td className="p-4 text-neutral-500 dark:text-neutral-400 font-mono">#{u.id}</td>
                                    <td className="p-4 font-medium text-neutral-900 dark:text-white">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-3">
                                                <UserIcon className="w-4 h-4 text-neutral-500" />
                                            </div>
                                            <div>
                                                <div>{u.username}</div>
                                                <div className="text-xs text-neutral-500 font-normal">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {u.role === 'Admin' ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                                                <ShieldCheck className="w-3 h-3 mr-1" />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-500/10 dark:text-neutral-400">
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                            ${u.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                              u.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                              'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}
                                        >
                                            {u.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {u.id !== user.id && u.status !== 'Approved' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(u.id, 'Approved')}
                                                className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors inline-block" 
                                                title="Approve User"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        {u.id !== user.id && u.status !== 'Rejected' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(u.id, 'Rejected')}
                                                className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors inline-block" 
                                                title="Reject User"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        {u.id !== user.id && (
                                            <button 
                                                onClick={() => handleDelete(u.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors inline-block" 
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
        </div>
    );
}
