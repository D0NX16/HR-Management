const express = require('express');
const router = express.Router();
const pool = require('./db'); // SAME pool used in server.js

// 1. GET ALL
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM resigned_candidates ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Resigned GET error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
  let connection;
  try {
    const {
      interview_date,
      branch,
      name,
      mobile_no,
      joining_date,
      position,
      days_worked,
      reason_left,
      doc_handover,
      salary_status
    } = req.body;

    connection = await pool.getConnection();

    const sql = `
      INSERT INTO resigned_candidates
      (interview_date, branch, name, mobile_no, joining_date, position,
       days_worked, reason_left, doc_handover, salary_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(sql, [
      interview_date,
      branch,
      name,
      mobile_no,
      joining_date,
      position,
      days_worked,
      reason_left,
      doc_handover,
      salary_status
    ]);

    res.status(201).json({
      message: 'Candidate added successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('Resigned POST error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const data = req.body;

    connection = await pool.getConnection();

    const sql = `
      UPDATE resigned_candidates SET
      interview_date=?, branch=?, name=?, mobile_no=?, joining_date=?,
      position=?, days_worked=?, reason_left=?, doc_handover=?, salary_status=?
      WHERE id=?
    `;

    await connection.query(sql, [
      data.interview_date,
      data.branch,
      data.name,
      data.mobile_no,
      data.joining_date,
      data.position,
      data.days_worked,
      data.reason_left,
      data.doc_handover,
      data.salary_status,
      id
    ]);

    res.json({ message: 'Candidate updated successfully' });
  } catch (err) {
    console.error('Resigned UPDATE error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();

    await connection.query(
      'DELETE FROM resigned_candidates WHERE id = ?',
      [id]
    );

    res.json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    console.error('Resigned DELETE error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;