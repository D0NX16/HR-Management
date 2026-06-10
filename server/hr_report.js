const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); 
const multer = require('multer');


const uploadDir = path.join(__dirname, 'uploads/temp'); // FIXED: Absolute path
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

// 1. GET ALL REPORTS
// URL: GET https://kgpl.net/api/HrInterviewReport/reports
router.get('/reports', async (req, res) => { 
    let connection;
    try {
        connection = await pool.getConnection();
        // Ensure table name matches your database (e.g., 'reports' or 'hr_interview_reports')
        const sql = 'SELECT * FROM reports ORDER BY interview_date DESC';
        const [results] = await connection.query(sql);
        res.json(results);
    } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) connection.release();
    }
});

// 2. ADD NEW REPORT
// URL: POST https://kgpl.net/api/HrInterviewReport/reports
router.post('/reports', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Destructure matches the JSON sent from your HTML JS (reportData object)
        const { date, name, role, status, comments } = req.body;

        // Basic Validation
        if (!date || !name || !role) {
            return res.status(400).json({ error: 'Date, Candidate Name, and Role are required' });
        }

        const sql = `
            INSERT INTO reports 
            (interview_date, candidate_name, role, status, comments) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        // FIXED: Removed space between 'connection.' and 'query'
        const [result] = await connection.query(sql, [date, name, role, status, comments]);
        
        res.status(201).json({ 
            message: "Report added successfully",
            id: result.insertId
        });

    } catch (err) {
        console.error("Error inserting report:", err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) connection.release();
    }
});

// 3. UPDATE REPORT
// URL: PUT https://kgpl.net/api/HrInterviewReport/reports/:id
router.put('/reports/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const { date, name, role, status, comments } = req.body;

        const sql = `
            UPDATE reports 
            SET interview_date = ?, candidate_name = ?, role = ?, status = ?, comments = ? 
            WHERE id = ?
        `;
        
        const [result] = await connection.query(sql, [date, name, role, status, comments, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.json({ message: "Updated successfully" });

    } catch (err) {
        console.error("Error updating report:", err);
        res.status(500).json({ error: "Server Error" });
    } finally {
        if (connection) connection.release();
    }
});

// 4. DELETE REPORT
// URL: DELETE https://kgpl.net/api/HrInterviewReport/reports/:id
router.delete('/reports/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;

        const sql = 'DELETE FROM reports WHERE id = ?';
        const [result] = await connection.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("Error deleting report:", err);
        res.status(500).json({ error: "Server Error" });
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

router.post('/upload', upload.single('file'), async (req, res) => {
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
            getExactExcelDatePlusOne(row['Date'] || row['Interview Date']), 
            row['Candidate Name'] || row['Name'] || '',
            row['Role'] || row['Job Role'] || '',
            row['Status'] || 'Attended',
            row['Comments'] || ''
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO reports (
               interview_date,
                candidate_name,
                role,
                status,
                comments 
            ) VALUES ?
        `;

        await connection.query(sql, [values]);

        fs.unlinkSync(req.file.path);

        res.json({
            message: `✅ ${values.length} tasks imported successfully`
        });

    } catch (err) {
        console.error('Task Upload Error:', err);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});
module.exports = router;