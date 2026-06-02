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
    filename: (req, file, cb) => cb(null, 'PGEnquiry-' + Date.now() + path.extname(file.originalname))
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
        const [rows] = await connection.query('SELECT * FROM pg_enquiries ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { enq_date, location, company_name, cp_name, cp_contact, process, email_id, advisor_name,remarks_1, remarks_2, remarks_3, remarks_4, remarks_5 } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO pg_enquiries (enq_date, location, company_name, cp_name, cp_contact, process, email_id, advisor_name, remarks_1, remarks_2, remarks_3, remarks_4, remarks_5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
        const [result] = await connection.execute(sql, [formatDate(enq_date), location, company_name, cp_name, cp_contact, process, email_id, advisor_name, remarks_1, remarks_2, remarks_3, remarks_4, remarks_5]);
        res.status(201).json({ message: "Success", id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { enq_date, location, company_name, cp_name, cp_contact, process, email_id, advisor_name, remarks_1, remarks_2, remarks_3, remarks_4, remarks_5 } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE pg_enquiries SET enq_date=?, location=?, company_name=?, cp_name=?, cp_contact=?, process=?, email_id=?, advisor_name=?, remarks_1=? , remarks_2=?, remarks_3=?, remarks_4=?, remarks_5=? WHERE id=?`;
        await connection.execute(sql, [formatDate(enq_date), location, company_name, cp_name, cp_contact, process, email_id, advisor_name , remarks_1 , remarks_2, remarks_3, remarks_4, remarks_5, id]);
        res.json({ message: "Updated successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM pg_enquiries WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 5. UPLOAD EXCEL
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null });
        
        const values = data.map(row => [
            formatDate(row["DATE"]),
            row["LOCATION"],
            row["COMPANY NAME"],
            row["CP NAME"],
            row["CP CONTACT"],
            row["PROCESS"],
            row["EMAIL ID"],
            row["ADVISOR NAME"],
            row["Remarks 1"],
            row["Remarks 2"],
            row["Remarks 3"],
            row["Remarks 4"],
            row["Remarks 5"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO pg_enquiries (enq_date, location, company_name, cp_name, cp_contact, process, email_id, advisor_name , remarks_1 , remarks_2, remarks_3, remarks_4, remarks_5) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records imported successfully` });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { if (connection) connection.release(); }
});

module.exports = router;