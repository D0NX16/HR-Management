// userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('./db'); // Assuming db.js is in the same directory or accessible

// Middleware to parse JSON bodies
router.use(express.json());

// ✅ GET all users
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT id, name, email, role, created_at FROM users');
        res.json(results);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal server error fetching users.' });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ GET a single user by ID
router.get('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const [results] = await connection.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        res.status(500).json({ error: 'Internal server error fetching user.' });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ ADD new user (Registration)
router.post('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Name, email, password, and role are required.' });
        }

        // Check if email already exists
        const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())';
        const [result] = await connection.query(sql, [name, email, hashedPassword, role]);

        res.status(201).json({ message: '✅ User added successfully!', userId: result.insertId });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Internal server error adding user.' });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ UPDATE user
router.put('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ error: 'Name, email, and role are required for update.' });
        }

        let sql = 'UPDATE users SET name = ?, email = ?, role = ?';
        const values = [name, email, role];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql += ', password = ?';
            values.push(hashedPassword);
        }
        sql += ' WHERE id = ?';
        values.push(id);

        const [result] = await connection.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made.' });
        }
        res.json({ message: '✅ User updated successfully!' });
    } catch (err) {
        console.error('Error updating user:', err);
        if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
            return res.status(409).json({ error: 'Email already in use by another user.' });
        }
        res.status(500).json({ error: 'Internal server error updating user.' });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ DELETE user
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ message: '✅ User deleted successfully!' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal server error deleting user.' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;