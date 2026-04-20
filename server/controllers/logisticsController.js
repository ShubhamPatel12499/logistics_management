const { run, get, all } = require('../db/promise');

exports.getAllItems = async (req, res) => {
    try {
        const { city, status, category, event } = req.query;
        let query = 'SELECT items.*, users.username as assigned_to_username FROM items LEFT JOIN users ON items.assigned_to = users.id WHERE 1=1';
        let params = [];
        
        if (city) {
            query += ' AND city LIKE ?';
            params.push(`%${city}%`);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (event) {
            query += ' AND event = ?';
            params.push(event);
        }
        
        // Ensure consistent sorting
        query += ' ORDER BY id DESC';

        const items = await all(query, params);
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createItem = async (req, res) => {
    try {
        const { name, category, event, quantity, city } = req.body;
        if (!name || !category || quantity == null || !city) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const assigned_to = req.user.role === 'Admin' ? null : req.user.id;
        const status = req.user.role === 'Admin' ? 'Available' : 'Assigned';
        const result = await run(
            'INSERT INTO items (name, category, event, quantity, city, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, category, event || null, quantity, city, status, assigned_to]
        );
        if (assigned_to) {
            await run('INSERT INTO history (item_id, user_id, action) VALUES (?, ?, ?)', [result.lastID, assigned_to, 'Created & Assigned']);
        }
        res.status(201).json({ message: 'Item created', id: result.lastID });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, event, quantity, city } = req.body;
        
        const items = await all('SELECT * FROM items WHERE id = ?', [id]);
        if (items.length === 0) return res.status(404).json({ error: 'Item not found' });
        const item = items[0];

        // Access control: Admin or the assigned User
        if (req.user.role !== 'Admin' && item.assigned_to !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to update this item' });
        }

        await run(
            'UPDATE items SET name = ?, category = ?, event = ?, quantity = ?, city = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
            [name || item.name, category || item.category, event !== undefined ? event : item.event, quantity || item.quantity, city || item.city, id]
        );

        await run('INSERT INTO history (item_id, user_id, action) VALUES (?, ?, ?)', [id, req.user.id, 'Updated Data']);
        
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM items WHERE id = ?', [id]);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.assignItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        
        if (!userId) return res.status(400).json({ error: 'userId required' });

        const item = await get('SELECT * FROM items WHERE id = ?', [id]);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        if (item.quantity <= 0) {
            return res.status(400).json({ error: 'Item is out of stock / quantity is 0' });
        }
        if (item.status === 'Assigned' && item.assigned_to === userId) {
             return res.status(400).json({ error: 'Item is already assigned to this user' });
        }

        await run(
            'UPDATE items SET assigned_to = ?, status = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
            [userId, 'Assigned', id]
        );
        
        await run(
            'INSERT INTO history (item_id, user_id, action) VALUES (?, ?, ?)',
            [id, userId, 'Assigned']
        );
        
        res.json({ message: 'Item assigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.unassignItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const item = await get('SELECT * FROM items WHERE id = ?', [id]);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        const currentUserId = item.assigned_to;
        
        await run(
             'UPDATE items SET assigned_to = NULL, status = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
            ['Available', id]
        );
        
        if (currentUserId) {
            await run(
                'INSERT INTO history (item_id, user_id, action) VALUES (?, ?, ?)',
                [id, currentUserId, 'Returned']
            );
        }
        
        res.json({ message: 'Item unassigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
         const { id } = req.params;
         const history = await all(
            'SELECT history.*, users.username FROM history LEFT JOIN users ON history.user_id = users.id WHERE item_id = ? ORDER BY timestamp DESC',
             [id]
         );
         res.json(history);
    } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Server error' });
    }
};

exports.getDashboardStats = async (req, res) => {
     try {
         const totalItems = await get('SELECT SUM(quantity) as count FROM items');
         const availableItems = await get('SELECT SUM(quantity) as count FROM items WHERE status = "Available"');
         const assignedItems = await get('SELECT SUM(quantity) as count FROM items WHERE status = "Assigned"');
         
         const cityBreakdown = await all('SELECT city, SUM(quantity) as count FROM items GROUP BY city');
         
         res.json({
             total: totalItems.count || 0,
             available: availableItems.count || 0,
             assigned: assignedItems.count || 0,
             byCity: cityBreakdown
         });
     } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Server error' });
     }
};

exports.requestTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetUserId } = req.body;
        
        if (!targetUserId) return res.status(400).json({ error: 'Target user ID is required' });

        const item = await get('SELECT * FROM items WHERE id = ?', [id]);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        if (req.user.role !== 'Admin' && item.assigned_to !== req.user.id) {
            return res.status(403).json({ error: 'You do not own this item' });
        }

        const existingReq = await get('SELECT * FROM transfer_requests WHERE item_id = ? AND status = "Pending"', [id]);
        if (existingReq) return res.status(400).json({ error: 'A transfer request already exists for this item' });

        if (item.assigned_to === Number(targetUserId)) {
            return res.status(400).json({ error: 'Item is already owned by this user.' });
        }

        await run(
            'INSERT INTO transfer_requests (item_id, from_user_id, to_user_id, status) VALUES (?, ?, ?, ?)',
            [id, req.user.id, targetUserId, 'Pending']
        );
        
        res.json({ message: 'Transfer request sent successfully' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await all(`
            SELECT t.*, i.name as item_name, u.username as from_username
            FROM transfer_requests t
            LEFT JOIN items i ON t.item_id = i.id
            LEFT JOIN users u ON t.from_user_id = u.id
            WHERE t.to_user_id = ? AND t.status = 'Pending'
        `, [req.user.id]);
        
        res.json(requests);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.acceptTransfer = async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const transfer = await get('SELECT * FROM transfer_requests WHERE id = ?', [requestId]);
        if (!transfer || transfer.status !== 'Pending') return res.status(404).json({ error: 'Pending transfer not found' });
        
        if (req.user.role !== 'Admin' && transfer.to_user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to accept this transfer' });
        }

        await run('UPDATE transfer_requests SET status = "Accepted" WHERE id = ?', [requestId]);
        await run('UPDATE items SET assigned_to = ?, status = "Assigned", last_updated = CURRENT_TIMESTAMP WHERE id = ?', [transfer.to_user_id, transfer.item_id]);
        await run('INSERT INTO history (item_id, user_id, action) VALUES (?, ?, ?)', [transfer.item_id, transfer.from_user_id, 'Transferred Out']);
        await run('INSERT INTO history (item_id, user_id, action) VALUES (?, ?, ?)', [transfer.item_id, transfer.to_user_id, 'Transferred In']);
        
        res.json({ message: 'Transfer accepted' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.rejectTransfer = async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const transfer = await get('SELECT * FROM transfer_requests WHERE id = ?', [requestId]);
        if (!transfer || transfer.status !== 'Pending') return res.status(404).json({ error: 'Pending transfer not found' });
        
        if (req.user.role !== 'Admin' && transfer.to_user_id !== req.user.id && transfer.from_user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to reject this transfer' });
        }

        await run('UPDATE transfer_requests SET status = "Rejected" WHERE id = ?', [requestId]);
        
        res.json({ message: 'Transfer rejected' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getCategories = async (req, res) => {
    try {
        const categories = await all('SELECT * FROM categories ORDER BY name ASC');
        res.json(categories);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Category name required' });
        
        const existing = await get('SELECT id FROM categories WHERE name = ?', [name]);
        if (existing) return res.status(400).json({ error: 'Category already exists' });

        const result = await run('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.lastID, name });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getEvents = async (req, res) => {
    try {
        const events = await all('SELECT * FROM events ORDER BY name ASC');
        res.json(events);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.addEvent = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Event name required' });
        
        const existing = await get('SELECT id FROM events WHERE name = ?', [name]);
        if (existing) return res.status(400).json({ error: 'Event already exists' });

        const result = await run('INSERT INTO events (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.lastID, name });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const targetEvent = await get('SELECT name FROM events WHERE id = ?', [id]);
        
        if (!targetEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Nullify the string tag dynamically on all existing underlying physical items mapping to it
        await run('UPDATE items SET event = NULL WHERE event = ?', [targetEvent.name]);
        
        // Delete the core target
        await run('DELETE FROM events WHERE id = ?', [id]);
        
        res.json({ message: 'Event permanently deleted and removed from affected elements' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
