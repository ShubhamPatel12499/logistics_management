import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '@/services/api';
import { Trash2 } from 'lucide-react';

export function EventManagementModal({ isOpen, onClose, onRefresh }: { isOpen: boolean, onClose: () => void, onRefresh: () => void }) {
    const [events, setEvents] = useState<{id: number, name: string}[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchEvents = () => {
        setLoading(true);
        api.get('/logistics/events').then(res => {
            setEvents(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setError('Failed to load events');
            setLoading(false);
        });
    };

    useEffect(() => {
        if (isOpen) {
            fetchEvents();
        }
    }, [isOpen]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event? This will remove the event tag from all associated items.')) return;
        try {
            await api.delete(`/logistics/events/${id}`);
            fetchEvents();
            onRefresh(); // Refresh the main logistics items view
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete event');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Events">
            <div className="space-y-4">
                {error && <div className="text-sm text-red-500 p-2 bg-red-500/10 rounded-lg">{error}</div>}
                
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Warning: Deleting an event will permanently remove it from the system and cleanly strip its tag off any existing assigned logistics items.
                </p>

                {loading ? (
                    <div className="py-8 text-center text-neutral-400 text-sm">Loading events...</div>
                ) : (
                    <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-neutral-200 dark:border-neutral-700/50 max-h-60 overflow-y-auto">
                        <ul className="divide-y divide-neutral-200 dark:divide-neutral-700/50">
                            {events.length === 0 && (
                                <li className="p-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">No custom events have been created yet.</li>
                            )}
                            {events.map(ev => (
                                <li key={ev.id} className="flex items-center justify-between p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                    <span className="font-medium text-neutral-900 dark:text-white text-sm">{ev.name}</span>
                                    <button 
                                        onClick={() => handleDelete(ev.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete Event"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="pt-2 flex justify-end">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
