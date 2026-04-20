'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, User as UserIcon, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'Admin') {
            router.push('/');
            return;
        }
        
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users');
                setUsers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'Admin') {
            fetchUsers();
        }
    }, [user, router]);

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? All items assigned to them will be made available.')) return;
        try {
            await api.delete(`/users/${userId}`);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete user.');
        }
    };

    if (user?.role !== 'Admin') return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent inline-block">User Directory</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage system access</p>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden mt-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4">ID</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Role</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                    <td className="p-4 text-neutral-500 dark:text-neutral-400 font-mono">#{u.id}</td>
                                    <td className="p-4 font-medium text-neutral-900 dark:text-white flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-3">
                                            <UserIcon className="w-4 h-4 text-neutral-500" />
                                        </div>
                                        {u.username}
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
                                    <td className="p-4 text-right">
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
            </div>
        </div>
    );
}
