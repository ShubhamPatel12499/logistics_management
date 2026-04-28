const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const authRoutes = require('./routes/authRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/users', userRoutes);

const bcrypt = require('bcryptjs');
const { run, get } = require('./db/promise');

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

async function seedAdmin() {
    try {
        const adminExists = await get("SELECT id, email FROM users WHERE username = 'admin'");
        if (!adminExists) {
            const hash = await bcrypt.hash('admin123', 10);
            await run("INSERT INTO users (username, password_hash, email, role, status) VALUES ('admin', ?, 'admin@ngo.org', 'Admin', 'Approved')", [hash]);
            console.log('Seeded hardcoded Admin user -> admin / admin123 (email: admin@ngo.org)');
        } else {
            await run("UPDATE users SET email = 'admin@ngo.org', status = 'Approved' WHERE username = 'admin'");
            console.log('Retroactively ensured admin account is approved and has email');
        }
    } catch(err) {
        console.error('Error seeding admin', err);
    }
}

seedAdmin().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
