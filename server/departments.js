const express = require('express');
const router = express.Router();
const pool = require('./db');

// 1. GET ALL DEPARTMENTS
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM Departments ORDER BY id DESC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 3. ADD NEW DEPARTMENT
router.post('/', async (req, res) => {
    let connection;
    try {
        const { department_name, department_head, total_employees } = req.body;
        if (!department_name || !department_head) {
            return res.status(400).json({ error: 'Name and Head are required.' });
        }
        connection = await pool.getConnection();
        const sql = 'INSERT INTO Departments (department_name, department_head, total_employees) VALUES (?, ?, ?)';
        const [result] = await connection.query(sql, [department_name, department_head, total_employees || 0]);
        res.status(201).json({ message: '✅ Added successfully!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 4. UPDATE DEPARTMENT
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { department_name, department_head, total_employees } = req.body;
        connection = await pool.getConnection();
        const sql = 'UPDATE Departments SET department_name = ?, department_head = ?, total_employees = ? WHERE id = ?';
        const [result] = await connection.query(sql, [department_name, department_head, total_employees, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: '✅ Updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 5. DELETE DEPARTMENT
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query('DELETE FROM Departments WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: '✅ Deleted successfully!' });
    } catch (err) {
        // Handle Foreign Key errors (e.g. if employees are still assigned to this dept)
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ error: 'Cannot delete: Employees are assigned to this department.' });
        }
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;