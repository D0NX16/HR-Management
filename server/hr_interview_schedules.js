const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');


// --- 1. CONFIGURATION FOR RESUME UPLOAD ---
const uploadDir = path.join(__dirname, 'uploads/resumes'); // FIXED: Absolute path
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'Resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- 2. ROUTES ---

// GET ALL CANDIDATES
router.get('/api/candidates', async (req, res) => {
    let connection;
    try {
        console.log("Fetching candidates..."); // Debug Log
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM candidates ORDER BY interview_date DESC'
        );
        console.log(`Found ${rows.length} candidates.`); // Debug Log
        res.json(rows);
    } catch (err) {
        console.error("DATABASE ERROR:", err); // detailed error in terminal
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ADD NEW CANDIDATE
router.post('/api/candidates', upload.single('resume'), async (req, res) => {
    let connection;
    try {
        const {
            interview_date, branch, candidate_name, email,
            candidate_number, position, experience, status,
            hr_name, gender, location
        } = req.body;

        const resume_path = req.file ? req.file.path : null;

        connection = await pool.getConnection();
        const sql = `
            INSERT INTO candidates 
            (interview_date, branch, candidate_name, email, candidate_number, position, experience, status, hr_name, gender, location, resume_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.query(sql, [
            interview_date, branch, candidate_name, email,
            candidate_number, position, experience, status,
            hr_name, gender, location, resume_path
        ]);

        res.json({ message: 'Candidate added successfully', id: result.insertId });
    } catch (err) {
        console.error("INSERT ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE CANDIDATE
router.delete('/api/candidates/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Delete file first
        const [rows] = await connection.query('SELECT resume_path FROM candidates WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].resume_path) {
            fs.unlink(rows[0].resume_path, (err) => {
                if(err) console.error("File deletion error (non-fatal):", err);
            });
        }

        await connection.query('DELETE FROM candidates WHERE id = ?', [req.params.id]);
        res.json({ message: 'Candidate deleted successfully' });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// UPDATE CANDIDATE STATUS
router.put('/api/candidates/:id/status', async (req, res) => {
    let connection;
    try {
        const { status } = req.body;
        connection = await pool.getConnection();
        await connection.query('UPDATE candidates SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error("UPDATE ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

function getExactExcelDatePlusOne(date) {
  if (!date || !(date instanceof Date)) {
    const today = new Date();
    today.setDate(today.getDate() + 1); // add 1 day
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }
  const d = new Date(date);
  d.setDate(d.getDate() + 1); // add 1 day
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

router.post('/api/candidates/upload', upload.single('file'), async (req, res) => {
    let connection;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        const values = data.map(row => [
            getExactExcelDatePlusOne(row['Interview Date']),
            row['Branch'] || '',
            row['Candidate Name'] || '',
            row['Email'] || '',
            row['Candidate Number'] || '',
            row['Position'] || '',
            row['Experience'] || '',
            row['Status'] || '',
            row['HR Name'] || '',
            row['Gender'] || '',
            row['Location'] || ''
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO candidates (
                interview_date, branch, candidate_name, email, candidate_number,
                position, experience, status, hr_name, gender, location
            ) VALUES ?
        `;

        await connection.query(sql, [values]);

        fs.unlinkSync(req.file.path);

        res.json({
            message: `✅ ${values.length} interview records imported successfully`
        });

    } catch (err) {
        console.error('Interview Upload Error:', err);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;