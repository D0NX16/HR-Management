// routes/detailed_performance.js
const express = require('express');
const router = express.Router();
const pool = require('./db'); // Adjust path to your db.js connection
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- 1. CONFIGURATION: File Uploads ---
const uploadDir = 'uploads/performance_docs';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Filename format: EMPID-TIMESTAMP.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'DOC-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- 2. GET: Fetch Performance Details ---
// Usage: GET /api/detailed-performance/details?employee_id=EMP001&month=2026-01
router.get('/details', async (req, res) => {
    let connection;
    try {
        const { employee_id, month } = req.query;

        if (!employee_id || !month) {
            return res.status(400).json({ error: "Employee ID and Month are required" });
        }

        connection = await pool.getConnection();
        
        const sql = `SELECT * FROM employee_monthly_reviews WHERE employee_id = ? AND evaluation_month = ?`;
        const [rows] = await connection.query(sql, [employee_id, month]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json(null); // No record found (Front-end should show empty form)
        }
    } catch (err) {
        console.error("Error fetching details:", err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (connection) connection.release();
    }
});

// --- 3. POST: Save or Update Performance ---
router.post('/save', upload.single('document'), async (req, res) => {
    let connection;
    try {
        const {
            employee_id, 
            evaluation_month,
            avg_in_time, 
            avg_out_time, 
            permissions_taken, 
            leaves_taken,
            uniform_worn, 
            work_completion, 
            creativity_score, 
            comments
        } = req.body;

        const document_path = req.file ? req.file.path.replace(/\\/g, "/") : null;

        connection = await pool.getConnection();

        // Check if a record already exists for this Emp + Month
        const checkSql = `SELECT id, document_path FROM employee_monthly_reviews WHERE employee_id = ? AND evaluation_month = ?`;
        const [existing] = await connection.query(checkSql, [employee_id, evaluation_month]);

        if (existing.length > 0) {
            // --- UPDATE EXISTING RECORD ---
            let updateSql = `
                UPDATE employee_monthly_reviews SET 
                avg_in_time=?, avg_out_time=?, permissions_taken=?, leaves_taken=?,
                uniform_worn=?, work_completion=?, creativity_score=?, comments=?
            `;
            const params = [
                avg_in_time, avg_out_time, permissions_taken, leaves_taken,
                uniform_worn, work_completion, creativity_score, comments
            ];

            // Only update document path if a new file was uploaded
            if (document_path) {
                updateSql += `, document_path=?`;
                params.push(document_path);
            }

            updateSql += ` WHERE id=?`;
            params.push(existing[0].id);

            await connection.query(updateSql, params);
            res.json({ message: "Performance updated successfully!" });

        } else {
            // --- INSERT NEW RECORD ---
            const insertSql = `
                INSERT INTO employee_monthly_reviews 
                (employee_id, evaluation_month, avg_in_time, avg_out_time, 
                permissions_taken, leaves_taken, uniform_worn, work_completion, 
                creativity_score, comments, document_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.query(insertSql, [
                employee_id, evaluation_month, avg_in_time, avg_out_time,
                permissions_taken, leaves_taken, uniform_worn, work_completion,
                creativity_score, comments, document_path
            ]);
            res.status(201).json({ message: "Performance saved successfully!" });
        }

    } catch (err) {
        console.error("Error saving performance:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;