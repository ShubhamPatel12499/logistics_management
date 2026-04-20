const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'logistics.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Database connected');
        db.run('PRAGMA foreign_keys = ON');

        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error creating schema', err);
            } else {
                console.log('Schema initialized');
                
                db.run('ALTER TABLE users ADD COLUMN email TEXT', (alterErr) => {
                    if (alterErr && !alterErr.message.includes('duplicate column')) {
                    } else if (!alterErr) {
                        console.log('Migration: Added email column to users table');
                    }
                });

                db.run('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)', (err) => {
                    if (!err) {
                        const defaultCategories = ['Flags', 'Postcards', 'Tri-folds', 'Medical kits', 'Other'];
                        defaultCategories.forEach(cat => {
                            db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [cat]);
                        });
                    }
                });

                db.run('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)');
                db.run('ALTER TABLE items ADD COLUMN event TEXT', (alterErr) => {
                    // ignore column errors
                });
            }
        });
    }
});

module.exports = db;
