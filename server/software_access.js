const express = require('express');
const router = express.Router();
const pool = require('./db');

// 1. GET ALL EMPLOYEES (Fetched from both tables for the dropdown)
router.get('/employee-list', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const sql = `
            SELECT e.employee_id, e.employee_name, em.department, em.branch 
            FROM employees e
            LEFT JOIN employee_employment em ON e.employee_id = em.employee_id
            ORDER BY e.employee_name ASC`;
        const [rows] = await connection.query(sql);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. GET ALL ACCESS RECORDS (With Joins for the Table View)
// 2. GET ALL ACCESS RECORDS (Updated to LEFT JOIN)
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const sql = `
            SELECT 
                sar.id, 
                sar.employee_id, 
                sar.software_name, 
                sar.access_level, 
                sar.status, 
                sar.remarks,
                e.employee_name, 
                em.department, 
                em.branch
            FROM software_access_register sar
            LEFT JOIN employees e ON sar.employee_id = e.employee_id
            LEFT JOIN employee_employment em ON sar.employee_id = em.employee_id
            ORDER BY sar.id DESC`;
            
        const [rows] = await connection.query(sql);
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
    finally { if (connection) connection.release(); }
});

// 3. ADD NEW ACCESS
router.post('/', async (req, res) => {
    let connection;
    try {
        const { employee_id, software_name, access_level, status, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO software_access_register (employee_id, software_name, access_level, status, remarks) VALUES (?, ?, ?, ?, ?)`;
        await connection.execute(sql, [employee_id, software_name, access_level, status, remarks]);
        res.status(201).json({ message: "Access Record Created" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});


// UPDATE ROUTE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { employee_id, software_name, access_level, status, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE software_access_register 
                     SET employee_id=?, software_name=?, access_level=?, status=?, remarks=? 
                     WHERE id=?`;
        await connection.execute(sql, [employee_id, software_name, access_level, status, remarks, id]);
        res.json({ message: "Updated Successfully" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM software_access_register WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;