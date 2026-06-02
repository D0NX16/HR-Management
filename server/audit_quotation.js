const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'Quotation-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const formatDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d.toISOString().split('T')[0];
    return d;
};

// 1. GET ALL
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM audit_quotations ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. POST (Add)
router.post('/', async (req, res) => {
    let connection;
    try {
        const { q_date, location, company_name, cp_name, cp_contact, process, quote_value, email_id, lead_source, advisor_name } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO audit_quotations (q_date, location, company_name, cp_name, cp_contact, process, quote_value, email_id, lead_source, advisor_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [formatDate(q_date), location, company_name, cp_name, cp_contact, process, quote_value, email_id, lead_source, advisor_name]);
        res.status(201).json({ message: "Inserted", id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. PUT (Update)
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { q_date, location, company_name, cp_name, cp_contact, process, quote_value, email_id, lead_source, advisor_name } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE audit_quotations SET q_date=?, location=?, company_name=?, cp_name=?, cp_contact=?, process=?, quote_value=?, email_id=?, lead_source=?, advisor_name=? WHERE id=?`;
        await connection.execute(sql, [formatDate(q_date), location, company_name, cp_name, cp_contact, process, quote_value, email_id, lead_source, advisor_name, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM audit_quotations WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 5. UPLOAD EXCEL (Maps your specific headers)
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: "No file" });
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null });

        const values = data.map(row => [
            formatDate(row["Date"]),
            row["Location"],
            row["Company Name"],
            row["CP Name"],
            row["CP Contact"],
            row["Process"],
            row["Quote Value"],
            row["Email ID"],
            row["Source of Lead"],
            row["Advisor Name"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO audit_quotations (q_date, location, company_name, cp_name, cp_contact, process, quote_value, email_id, lead_source, advisor_name) VALUES ?`;
        await connection.query(sql, [values]);
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records uploaded` });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { if (connection) connection.release(); }
});

module.exports = router;