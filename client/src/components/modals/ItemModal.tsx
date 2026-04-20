import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Plus } from 'lucide-react';

import { LogisticsItem } from '@/types';

export function ItemModal({ isOpen, onClose, onRefresh, item }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, item?: LogisticsItem | null }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
    const [newCategoryMode, setNewCategoryMode] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [event, setEvent] = useState('');
    const [events, setEvents] = useState<{id: number, name: string}[]>([]);
    const [newEventMode, setNewEventMode] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen) {
            api.get('/logistics/categories').then(res => {
                setCategories(res.data);
                if (res.data.length > 0 && !category && !item) setCategory(res.data[0].name);
            }).catch(console.error);

            api.get('/logistics/events').then(res => {
                setEvents(res.data);
            }).catch(console.error);

            if (item) {
                setName(item.name);
                setCategory(item.category);
                setEvent(item.event || '');
                setQuantity(item.quantity);
                setCity(item.city);
            } else {
                setName('');
                setCategory('');
                setEvent('');
                setQuantity(1);
                setCity('');
            }
        }
    }, [isOpen, item]);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await api.post('/logistics/categories', { name: newCategoryName });
            setCategories([...categories, res.data]);
            setCategory(res.data.name);
            setNewCategoryMode(false);
            setNewCategoryName('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create category');
        }
    };

    const handleCreateEvent = async () => {
        if (!newEventName.trim()) return;
        try {
            const res = await api.post('/logistics/events', { name: newEventName });
            setEvents([...events, res.data]);
            setEvent(res.data.name);
            setNewEventMode(false);
            setNewEventName('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create event');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (item) {
                await api.put(`/logistics/${item.id}`, { name, category, event, quantity, city });
            } else {
                await api.post('/logistics', { name, category, event, quantity, city });
            }
            onRefresh();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose} title={item ? "Edit Item" : "Add New Item"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-sm text-red-500 p-2 bg-red-500/10 rounded-lg">{error}</div>}
                
                <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required 
                        className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500" 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
                            {user?.role === 'Admin' && (
                                <button type="button" onClick={() => setNewCategoryMode(true)} className="text-xs font-medium text-emerald-500 hover:text-emerald-600 flex items-center">
                                    <Plus className="w-3 h-3 mr-0.5" /> Add New
                                </button>
                            )}
                        </div>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Quantity</label>
                        <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required 
                            className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500" 
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Event Tag (Optional)</label>
                        <button type="button" onClick={() => setNewEventMode(true)} className="text-xs font-medium text-emerald-500 hover:text-emerald-600 flex items-center">
                            <Plus className="w-3 h-3 mr-0.5" /> Add New Event
                        </button>
                    </div>
                    <select
                        value={event}
                        onChange={e => setEvent(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">No Event Attached</option>
                        {events.map(ev => (
                            <option key={ev.id} value={ev.name}>{ev.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} required 
                        className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500" 
                    />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Item'}
                    </button>
                </div>
            </form>
        </Modal>

        <Modal isOpen={newCategoryMode} onClose={() => setNewCategoryMode(false)} title="Add New Category">
            <div className="space-y-4">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="E.g. Medical Supplies"
                    autoFocus
                />
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setNewCategoryMode(false)} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">Cancel</button>
                    <button type="button" onClick={handleCreateCategory} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">Save Category</button>
                </div>
            </div>
        </Modal>

        <Modal isOpen={newEventMode} onClose={() => setNewEventMode(false)} title="Add New Event">
            <div className="space-y-4">
                <input
                    type="text"
                    value={newEventName}
                    onChange={e => setNewEventName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="E.g. Blood Donation Camp"
                    autoFocus
                />
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setNewEventMode(false)} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">Cancel</button>
                    <button type="button" onClick={handleCreateEvent} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">Save Event</button>
                </div>
            </div>
        </Modal>
        </>
    );
}
