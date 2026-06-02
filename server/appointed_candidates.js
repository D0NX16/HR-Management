const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); 
const multer = require('multer');
const { fileExcel } = require('fontawesome');

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

// GET ALL APPOINTED CANDIDATES
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM appointed_candidates ORDER BY id DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ADD NEW APPOINTED CANDIDATE
router.post('/', async (req, res) => {
    let connection;
    try {
        const {
            entry_date, branch, candidate_name, candidate_number, email,
            position, experience, brand, fixed_salary, source,
            appointment_date, hr_name, document_status, training_status
        } = req.body;

        connection = await pool.getConnection();
        const sql = `
            INSERT INTO appointed_candidates
            (entry_date, branch, candidate_name, candidate_number, email,
             position, experience, brand, fixed_salary, source,
             appointment_date, hr_name, document_status, training_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.query(sql, [
            entry_date, branch, candidate_name, candidate_number, email,
            position, experience, brand, fixed_salary, source,
            appointment_date, hr_name, document_status, training_status
        ]);

        res.json({ message: 'Appointed candidate added successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE APPOINTED CANDIDATE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await pool.getConnection();
        const [result] = await connection.query(
            'DELETE FROM appointed_candidates WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointed candidate not found' });
        }
        res.json({ message: 'Appointed candidate deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    finally {
        if (connection) connection.release();
    }
});

// UPDATE APPOINTED CANDIDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const {
            entry_date, branch, candidate_name, candidate_number, email,
            position, experience, brand, fixed_salary, source,
            appointment_date, hr_name, document_status, training_status
        } = req.body;
        connection = await pool.getConnection();
        const sql = `
            UPDATE appointed_candidates
            SET entry_date = ?, branch = ?, candidate_name = ?, candidate_number = ?, email = ?,
                position = ?, experience = ?, brand = ?, fixed_salary = ?, source = ?,
                appointment_date = ?, hr_name = ?, document_status = ?, training_status = ?
            WHERE id = ?
        `;

        const [result] = await connection.query(sql, [
            entry_date, branch, candidate_name, candidate_number, email,
            position, experience, brand, fixed_salary, source,
            appointment_date, hr_name, document_status, training_status,
            id
        ]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointed candidate not found' });
        }
        res.json({ message: 'Appointed candidate updated successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
    finally {
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
// UPLOAD fileExcel

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
            getExactExcelDatePlusOne(row['Entry Date']),        // entry_date
            row['Branch'] || null,
            row['Candidate Name'] || '',
            row['Candidate Number'] || null,
            row['Email'] || null,
            row['Position'] || null,
            row['Experience'] || null,
            row['Brand'] || null,
            row['Fixed Salary'] || null,
            row['Source'] || null,
            getExactExcelDatePlusOne(row['Appointment Date']), // appointment_date
            row['HR Name'] || null,
            row['Document Status'] || 'Pending',
            row['Training Status'] || 'Training'
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO appointed_candidates (
                entry_date,
                branch,
                candidate_name,
                candidate_number,
                email,
                position,
                experience,
                brand,
                fixed_salary,
                source,
                appointment_date,
                hr_name,
                document_status,
                training_status
            ) VALUES ?
        `;

        await connection.query(sql, [values]);

        fs.unlinkSync(req.file.path);

        res.json({
            message: `✅ ${values.length} candidates imported successfully`
        });

    } catch (err) {
        console.error('Candidate Upload Error:', err);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;