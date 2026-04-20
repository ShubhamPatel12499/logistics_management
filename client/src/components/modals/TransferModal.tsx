import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '@/services/api';
import { User } from '@/types';

export function TransferModal({ isOpen, onClose, onRefresh, itemId, currentOwnerId }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, itemId: number | null, currentOwnerId?: number | null }) {
    const [targetUserId, setTargetUserId] = useState('');
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
        if (!itemId || !targetUserId) return;
        if (Number(targetUserId) === currentOwnerId) {
            setError('Cannot transfer to the current owner.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post(`/logistics/${itemId}/transfer`, { targetUserId: Number(targetUserId) });
            onRefresh();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send transfer request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transfer Item">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-sm text-red-500 p-2 bg-red-500/10 rounded-lg">{error}</div>}
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Send a transfer request to another user. If they accept, you will no longer own this item.
                </p>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Select User</label>
                    <select value={targetUserId} onChange={e => setTargetUserId(e.target.value)} required
                        className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="" disabled>Select a user to transfer to</option>
                        {users.filter(u => u.id !== currentOwnerId).map(u => (
                            <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                        ))}
                    </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading || !targetUserId}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors disabled:opacity-50">
                        {loading ? 'Sending Request...' : 'Send Transfer Request'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
