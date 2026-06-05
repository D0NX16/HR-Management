const express = require('express');
const router = express.Router();
const pool = require('./db');

// 1. GET ALL
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM interview_tracker ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { candidate_name, position, experience, applied_date, round, interview_date, interviewer, status } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO interview_tracker (candidate_name, position, experience, applied_date, round, interview_date, interviewer, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await connection.execute(sql, [candidate_name, position, experience, applied_date, round, interview_date, interviewer, status]);
        res.status(201).json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { candidate_name, position, experience, applied_date, round, interview_date, interviewer, status } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE interview_tracker SET candidate_name=?, position=?, experience=?, applied_date=?, round=?, interview_date=?, interviewer=?, status=? WHERE id=?`;
        await connection.execute(sql, [candidate_name, position, experience, applied_date, round, interview_date, interviewer, status, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM interview_tracker WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;
