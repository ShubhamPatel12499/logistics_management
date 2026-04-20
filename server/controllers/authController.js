const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get } = require('../db/promise');

exports.register = async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, email and password are required' });
        }

        const existingUser = await get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role === 'Admin' ? 'Admin' : 'User';
        
        const result = await run(
            'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email, userRole]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.lastID });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await get('SELECT id, username FROM users WHERE email = ?', [email]);
        if (!user) {
             return res.status(404).json({ error: 'No account exists with this email' });
        }

        // Generate an 8-character random password
        const newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);

        // Mocking an email sent to the user
        console.log(`\n============================`);
        console.log(`[MOCK EMAIL SERVER]`);
        console.log(`To: ${email}`);
        console.log(`Subject: Password Reset Request`);
        console.log(`Hello ${user.username},`);
        console.log(`We've generated a new password for you. Please use this password to login:`);
        console.log(`New Password: ${newPassword}`);
        console.log(`============================\n`);

         // Normally, you wouldn't return the password in the UI payload, 
         // but for demo purposes if there is no real SMTP, returning it helps the user test!
        res.json({ message: 'Password has been reset and sent to your email.', mockDelivery: newPassword });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
