const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const pool = require('./db');

// Configure Multer for temporary file storage
const upload = multer({ dest: 'uploads/temp/' });

// ✅ 1. GET ALL RECORDS
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const sql = "SELECT id, DATE_FORMAT(record_date, '%Y-%m-%d') as record_date, name, role, experience, mobile_number, location FROM other_portals ORDER BY id DESC";
        const [results] = await connection.query(sql);
        res.json(results);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ 2. ADD SINGLE RECORD
router.post('/', async (req, res) => {
    let connection;
    try {
        const { date, name, role, experience, mobile, location } = req.body;
        connection = await pool.getConnection();
        
        const sql = "INSERT INTO other_portals (record_date, name, role, experience, mobile_number, location) VALUES (?, ?, ?, ?, ?, ?)";
        await connection.query(sql, [date, name, role, experience, mobile, location]);
        
        res.json({ message: "Record added successfully" });
    } catch (err) {
        console.error("Error adding record:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

function getExactExcelDatePlusOne(date) {
    if (!date || !(date instanceof Date)) {
        const today = new Date();
        today.setDate(today.getDate() + 1); // add 1 day
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
    const d = new Date(date);
    d.setDate(d.getDate() + 1); // add 1 day
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}


// ✅ 3. UPLOAD EXCEL FILE
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Read the file
        const workbook = xlsx.readFile(req.file.path, { cellDates: true }); // cellDates ensures dates are parsed correctly
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const rawData = xlsx.utils.sheet_to_json(sheet);

        // Prepare data for SQL
        const values = rawData.map(row => [
            // Handle date conversion if necessary, or fallback to current date
            getExactExcelDatePlusOne(row['Date']),
            row['Name'] || '',
            row['Role'] || '',
            row['Experience'] || '',
            String(row['Mobile'] || row['Mobile Number'] || ''), 
            row['Location'] || ''
        ]);

        if (values.length === 0) {
            fs.unlinkSync(req.file.path); // Cleanup
            return res.status(400).json({ error: "Excel file is empty or headers do not match." });
        }

        connection = await pool.getConnection();
        const sql = "INSERT INTO other_portals (record_date, name, role, experience, mobile_number, location) VALUES ?";
        
        await connection.query(sql, [values]);

        // Cleanup temp file
        fs.unlinkSync(req.file.path);

        res.json({ message: `Successfully imported ${values.length} records.` });

    } catch (err) {
        console.error("Error processing Excel:", err);
        // Try to delete file if error occurs
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;