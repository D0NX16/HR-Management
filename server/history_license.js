const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); 
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'HistoryOfLicense-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function formatDate(date) {
    if (!date) return null;
    if (date instanceof Date) {
        d = new Date(date);
        d.setDate(d.getDate() + 1); // Handles Excel timezone shifts
        return d.toISOString().split('T')[0];
    }
    return date;
}

// ✅ GET All Records
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM history_of_license ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ CREATE New Record
router.post('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const data = req.body;

        const sql = `
            INSERT INTO history_of_license (
                backend_id, client_id, service, license_no, issue_date, renewal_date, 
                ct_person, ct_number, ct_person_designation, ct_person_mail, 
                advisor_name, advisor_ct_no, address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values =[
            data.backend_id, data.client_id, data.service, data.license_no, 
            formatDate(data.issue_date), formatDate(data.renewal_date), 
            data.ct_person, data.ct_number, data.ct_person_designation, data.ct_person_mail, 
            data.advisor_name, data.advisor_ct_no, data.address
        ];

        const [result] = await connection.query(sql, values);
        res.status(201).json({ message: "✅ Record added successfully", id: result.insertId });

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ UPDATE Record
router.put('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const data = req.body;

        const sql = `
            UPDATE history_of_license SET 
                backend_id=?, client_id=?, service=?, license_no=?, issue_date=?, renewal_date=?, 
                ct_person=?, ct_number=?, ct_person_designation=?, ct_person_mail=?, 
                advisor_name=?, advisor_ct_no=?, address=?
            WHERE id=?
        `;

        const values =[
            data.backend_id, data.client_id, data.service, data.license_no, 
            formatDate(data.issue_date), formatDate(data.renewal_date), 
            data.ct_person, data.ct_number, data.ct_person_designation, data.ct_person_mail, 
            data.advisor_name, data.advisor_ct_no, data.address, 
            id
        ];

        const [result] = await connection.query(sql, values);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Record not found" });

        res.json({ message: "✅ Record updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ DELETE Record
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const [result] = await connection.query('DELETE FROM history_of_license WHERE id = ?', [id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: "Record not found" });
        res.json({ message: "✅ Record deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ UPLOAD EXCEL
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = xlsx.utils.sheet_to_json(sheet, { defval: null });

        if (rawData.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        // Clean headers (Trim spaces)
        const data = rawData.map(row => {
            const cleanedRow = {};
            for (let key in row) {
                if(key) cleanedRow[key.trim()] = row[key];
            }
            return cleanedRow;
        });

        const values = data.map(row => [
            row["BackEnd ID"] || row["Backend ID"], 
            row["Client ID"],
            row["Service"],
            row["License No"],
            formatDate(row["Issue Date"]),
            formatDate(row["Renewal Date"]),
            row["CT. Person"],
            row["CT. Number"],
            row["CT Person Designation"] || row["CT Person D"], // Handle cut-off headers
            row["CT Person Mail"] || row["CT Person M"],
            row["Advisor Name"],
            row["Advisor CT No"] || row["Advisor CT No."],
            row["Address"]
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO history_of_license (
                backend_id, client_id, service, license_no, issue_date, renewal_date, 
                ct_person, ct_number, ct_person_designation, ct_person_mail, 
                advisor_name, advisor_ct_no, address
            ) VALUES ?
        `;

        await connection.query(sql, [values]);
        fs.unlinkSync(req.file.path);

        res.json({ message: `✅ ${values.length} records imported successfully` });

    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;