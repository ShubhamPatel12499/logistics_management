const { all, run, get } = require('../db/promise');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await all('SELECT id, username, role FROM users');
        res.json(users);
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
        
        await run('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
