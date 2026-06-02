const express = require('express');
const router = express.Router();
const pool = require('./db');

// 1. FETCH DEPARTMENTS (Distinct list from employment table)
router.get('/list-departments', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT DISTINCT department FROM employee_employment WHERE department IS NOT NULL AND department != "" ORDER BY department ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 2. FETCH EMPLOYEES BY DEPARTMENT (For the Modal dropdown)
router.get('/employees-by-dept', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { dept } = req.query;
        const sql = `
            SELECT e.employee_id, e.employee_name 
            FROM employees e 
            JOIN employee_employment ee ON e.employee_id = ee.employee_id 
            WHERE ee.department = ?`;
        const [rows] = await connection.query(sql, [dept]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 3. FETCH TASKS BY DEPARTMENT (For the Main Table)
router.get('/by-dept', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { dept } = req.query;
        const sql = `
            SELECT t.id, t.task_description, t.status, e.employee_name, ee.designation, ee.department, t.employee_id
            FROM employee_tasks t
            JOIN employees e ON t.employee_id = e.employee_id
            JOIN employee_employment ee ON t.employee_id = ee.employee_id
            WHERE ee.department = ?
            ORDER BY t.id DESC`;
        const [rows] = await connection.query(sql, [dept]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 4. SAVE TASK (Create/Update)
router.post('/save', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id, employee_id, task_description, status } = req.body;
        if (id) {
            await connection.query('UPDATE employee_tasks SET employee_id=?, task_description=?, status=? WHERE id=?', [employee_id, task_description, status, id]);
        } else {
            await connection.query('INSERT INTO employee_tasks (employee_id, task_description, status) VALUES (?, ?, ?)', [employee_id, task_description, status]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 5. DELETE TASK
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM employee_tasks WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;