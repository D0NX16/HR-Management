const express = require('express');
const router = express.Router();
const pool = require('./db'); // Your existing DB connection
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- FILE UPLOAD CONFIGURATION ---
// Ensure 'uploads' directory exists
const uploadDir = 'uploads/performance_docs';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Naming: empID_Month_OriginalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'DOC-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. GET: Fetch performance for a specific employee and month
router.get('/details', async (req, res) => {
    let connection;
    try {
        const { employee_id, month } = req.query; // Expecting ?employee_id=123&month=2023-10

        if (!employee_id || !month) {
            return res.status(400).json({ error: "Employee ID and Month are required" });
        }

        connection = await pool.getConnection();
        const sql = `SELECT * FROM employee_monthly_reviews WHERE employee_id = ? AND evaluation_month = ?`;
        const [rows] = await connection.query(sql, [employee_id, month]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            // Return empty structure if no record exists yet
            res.json(null);
        }
    } catch (err) {
        console.error("Error fetching details:", err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});

// 2. POST: Save/Update Performance (Handles File Upload)
router.post('/save', upload.single('document'), async (req, res) => {
    let connection;
    try {
        // Multer puts the file in req.file and text fields in req.body
        const {
            employee_id, employee_name, evaluation_month,
            avg_in_time, avg_out_time, permissions_taken, leaves_taken,
            uniform_worn, work_completion, creativity_score, comments
        } = req.body;

        const document_path = req.file ? req.file.path : null;

        connection = await pool.getConnection();

        // Check if record exists to decide on logic (or use INSERT ON DUPLICATE UPDATE)
        const checkSql = `SELECT id, document_path FROM employee_monthly_reviews WHERE employee_id = ? AND evaluation_month = ?`;
        const [existing] = await connection.query(checkSql, [employee_id, evaluation_month]);

        if (existing.length > 0) {
            // --- UPDATE EXISTING ---
            let updateSql = `
                UPDATE employee_monthly_reviews SET 
                avg_in_time=?, avg_out_time=?, permissions_taken=?, leaves_taken=?,
                uniform_worn=?, work_completion=?, creativity_score=?, comments=?
            `;
            const params = [
                avg_in_time, avg_out_time, permissions_taken, leaves_taken,
                uniform_worn, work_completion, creativity_score, comments
            ];

            // Only update file path if a new file was uploaded
            if (document_path) {
                updateSql += `, document_path=?`;
                params.push(document_path);
            }

            updateSql += ` WHERE id=?`;
            params.push(existing[0].id);

            await connection.query(updateSql, params);
            res.json({ message: "Performance updated successfully" });

        } else {
            // --- INSERT NEW ---
            const insertSql = `
                INSERT INTO employee_performance 
                (employee_id, employee_name, evaluation_month, avg_in_time, avg_out_time, 
                permissions_taken, leaves_taken, uniform_worn, work_completion, 
                creativity_score, comments, document_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.query(insertSql, [
                employee_id, employee_name, evaluation_month, avg_in_time, avg_out_time,
                permissions_taken, leaves_taken, uniform_worn, work_completion,
                creativity_score, comments, document_path
            ]);
            res.status(201).json({ message: "Performance created successfully" });
        }

    } catch (err) {
        console.error("Error saving performance:", err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (connection) connection.release();
    }
});

// 1. GET ALL EMPLOYEES (Populates the dropdown and table)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employees ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. ADD NEW EMPLOYEE
router.post('/add', async (req, res) => {
    try {
        const { name, email, designation, department } = req.body;

        // Basic Validation
        if (!name || !email) {
            return res.status(400).json({ error: "Name and Email are required" });
        }

        const sql = `INSERT INTO employees (name, email, designation, department) VALUES (?, ?, ?, ?)`;
        const [result] = await pool.query(sql, [name, email, designation, department]);

        res.status(201).json({ message: 'Employee added successfully', id: result.insertId });
    } catch (err) {
        console.error("Error adding employee:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE EMPLOYEE
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, designation, department } = req.body;

        const sql = `UPDATE employees SET name=?, email=?, designation=?, department=? WHERE id=?`;
        await pool.query(sql, [name, email, designation, department, id]);

        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        console.error("Error updating employee:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE EMPLOYEE
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM employees WHERE id = ?', [id]);
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error("Error deleting employee:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;