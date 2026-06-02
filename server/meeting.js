const express = require('express');
const router = express.Router();
const pool = require('./db');

// 1. GET ALL DEPARTMENTS (For the Modal Dropdown)
router.get('/departments', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT department_name FROM departments ORDER BY department_name ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. GET ALL TRACKER ENTRIES
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM meeting_tracker ORDER BY meeting_date DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. ADD ENTRY
router.post('/', async (req, res) => {
    let connection;
    try {
        const { meeting_date, department_name, discussion_summary, category, assigned_to, deadline, branch, status, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO meeting_tracker (meeting_date, department_name, discussion_summary, category, assigned_to, deadline, branch, status, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await connection.execute(sql, [meeting_date, department_name, discussion_summary, category, assigned_to, deadline, branch, status, remarks]);
        res.status(201).json({ message: "Entry Saved" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. UPDATE ENTRY
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { meeting_date, department_name, discussion_summary, category, assigned_to, deadline, branch, status, remarks } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        const sql = `UPDATE meeting_tracker SET meeting_date=?, department_name=?, discussion_summary=?, category=?, assigned_to=?, deadline=?, branch=?, status=?, remarks=? WHERE id=?`;
        await connection.execute(sql, [meeting_date, department_name, discussion_summary, category, assigned_to, deadline, branch, status, remarks, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 5. DELETE ENTRY
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM meeting_tracker WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;