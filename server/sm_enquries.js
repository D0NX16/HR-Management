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
    filename: (req, file, cb) => cb(null, 'SMEnquiry-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 1. GET ALL
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM sm_enquiries ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { categories, client_name, mobile_no, mobile_no_2, school_name, address, feedback, status } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO sm_enquiries (categories, client_name, mobile_no, mobile_no_2, school_name, address, feedback, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [categories, client_name, mobile_no, mobile_no_2, school_name, address, feedback, status]);
        res.status(201).json({ message: "Success", id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { categories, client_name, mobile_no, mobile_no_2, school_name, address, feedback, status } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE sm_enquiries SET categories=?, client_name=?, mobile_no=?, mobile_no_2=?, school_name=?, address=?, feedback=?, status=? WHERE id=?`;
        await connection.execute(sql, [categories, client_name, mobile_no, mobile_no_2, school_name, address, feedback, status, id]);
        res.json({ message: "Updated successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM sm_enquiries WHERE id = ?', [req.params.id]);
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
            row["Categories"],
            row["Client Name"],
            row["Mobile No."],
            row["Mobile No 2"],
            row["School Name"],
            row["Address"],
            row["Feedback"],
            row["Status"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO sm_enquiries (categories, client_name, mobile_no, mobile_no_2, school_name, address, feedback, status) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records imported successfully` });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { if (connection) connection.release(); }
});

module.exports = router;