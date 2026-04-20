import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '@/services/api';
import { User } from '@/types';

export function AssignModal({ isOpen, onClose, onRefresh, itemId }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, itemId: number | null }) {
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            api.get('/users').then(res => setUsers(res.data)).catch(console.error);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemId || !userId) return;
        setLoading(true);
        setError('');
        try {
            await api.post(`/logistics/${itemId}/assign`, { userId: Number(userId) });
            onRefresh();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to assign item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Item">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-sm text-red-500 p-2 bg-red-500/10 rounded-lg">{error}</div>}
                
                <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Select User</label>
                    <select value={userId} onChange={e => setUserId(e.target.value)} required
                        className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="" disabled>Select a user to assign to</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                        ))}
                    </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading || !userId}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors disabled:opacity-50">
                        {loading ? 'Assigning...' : 'Assign User'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
