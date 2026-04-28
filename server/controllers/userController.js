const { all, run, get } = require('../db/promise');

exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const users = await all('SELECT id, username, email, role, status FROM users ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
        const total = await get('SELECT COUNT(*) as count FROM users');
        
        res.json({
            data: users,
            total: total.count,
            page,
            totalPages: Math.ceil(total.count / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const user = await get('SELECT id FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        await run('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        
        res.json({ message: 'User status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await get('SELECT id, role FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        await run('UPDATE items SET assigned_to = NULL, status = "Available" WHERE assigned_to = ?', [id]);
        
        await run('UPDATE history SET user_id = NULL WHERE user_id = ?', [id]);
        
        await run('DELETE FROM transfer_requests WHERE from_user_id = ? OR to_user_id = ?', [id, id]);
        
        await run('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
