// departments.js
const express = require('express');
const router = express.Router();
const pool = require('./db'); // Assuming db.js is in the same directory

// ✅ ADD new department
router.post('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { department_name, department_head, total_employees } = req.body;

    if (!department_name || !department_head || total_employees === undefined) {
      return res.status(400).json({ error: 'All department fields are required.' });
    }

    const sql = 'INSERT INTO Departments (department_name, department_head, total_employees) VALUES (?, ?, ?)';
    const [result] = await connection.query(sql, [department_name, department_head, total_employees]);

    res.status(201).json({ message: '✅ Department added successfully!', departmentId: result.insertId });
  } catch (err) {
    console.error('Error adding department:', err);
    if (err.code === 'ER_DUP_ENTRY' && err.message.includes('department_name')) {
      return res.status(409).json({ error: 'Department name already exists.' });
    }
    res.status(500).json({ error: 'Internal server error adding department.' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ GET all departments
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query('SELECT id, department_name, department_head, total_employees FROM Departments ORDER BY department_name ASC');
    res.json(results);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Internal server error fetching departments.' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ GET single department by ID
router.get('/:id', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { id } = req.params;
      const [results] = await connection.query('SELECT id, department_name, department_head, total_employees FROM Departments WHERE id = ?', [id]);
      if (results.length === 0) {
        return res.status(404).json({ message: 'Department not found.' });
      }
      res.json(results[0]);
    } catch (err) {
      console.error('Error fetching department:', err);
      res.status(500).json({ error: 'Internal server error fetching department.' });
    } finally {
      if (connection) connection.release();
    }
  });

// ✅ UPDATE department
router.put('/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const { department_name, department_head, total_employees } = req.body;

    if (!department_name || !department_head || total_employees === undefined) {
      return res.status(400).json({ error: 'All department fields are required for update.' });
    }

    const sql = 'UPDATE Departments SET department_name = ?, department_head = ?, total_employees = ? WHERE id = ?';
    const [result] = await connection.query(sql, [department_name, department_head, total_employees, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Department not found or no changes made.' });
    }
    res.json({ message: '✅ Department updated successfully!' });
  } catch (err) {
    console.error('Error updating department:', err);
    if (err.code === 'ER_DUP_ENTRY' && err.message.includes('department_name')) {
      return res.status(409).json({ error: 'Department name already in use by another department.' });
    }
    res.status(500).json({ error: 'Internal server error updating department.' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ DELETE department
router.delete('/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const [result] = await connection.query('DELETE FROM Departments WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    res.json({ message: '✅ Department deleted successfully!' });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ error: 'Internal server error deleting department.' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;