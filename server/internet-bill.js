const express = require('express');
const router = express.Router();
const pool = require('./db'); 
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/internet');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'InternetBill-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const formatDate = (d) => {
    if (!d) return null;
    return d instanceof Date ? d.toISOString().split('T')[0] : d;
};

// GET ALL
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM internet_bills ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { branch, bill_date, account_no, airtel_landline_id, plan_name, data_limit, bill_amount, payment_date, due_date, payment_mode, paid_by, remarks, reminder_status } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO internet_bills (branch, bill_date, account_no, airtel_landline_id, plan_name, data_limit, bill_amount, payment_date, due_date, payment_mode, paid_by, remarks, reminder_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        await connection.execute(sql, [branch, formatDate(bill_date), account_no, airtel_landline_id, plan_name, data_limit, bill_amount, formatDate(payment_date), formatDate(due_date), payment_mode, paid_by, remarks, reminder_status]);
        res.json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { branch, bill_date, account_no, airtel_landline_id, plan_name, data_limit, bill_amount, payment_date, due_date, payment_mode, paid_by, remarks, reminder_status } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE internet_bills SET branch=?, bill_date=?, account_no=?, airtel_landline_id=?, plan_name=?, data_limit=?, bill_amount=?, payment_date=?, due_date=?, payment_mode=?, paid_by=?, remarks=?, reminder_status=? WHERE id=?`;
        await connection.execute(sql, [branch, formatDate(bill_date), account_no, airtel_landline_id, plan_name, data_limit, bill_amount, formatDate(payment_date), formatDate(due_date), payment_mode, paid_by, remarks, reminder_status, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM internet_bills WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// EXCEL UPLOAD
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: "No file" });
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null });
        const values = data.map(row => [
            row["Branch"], formatDate(row["Bill Date"]), row["Account No."], row["Airtel ID / Landline No."], 
            row["Plan Name"], row["Data Limit"], row["Bill Amount (₹)"], formatDate(row["Payment Date"]), 
            formatDate(row["Payment Due Date"]), row["Payment Mode"], row["Paid By"], row["Remarks"], row["Reminder"]
        ]);
        connection = await pool.getConnection();
        await connection.query(`INSERT INTO internet_bills (branch, bill_date, account_no, airtel_landline_id, plan_name, data_limit, bill_amount, payment_date, due_date, payment_mode, paid_by, remarks, reminder_status) VALUES ?`, [values]);
        fs.unlinkSync(req.file.path);
        res.json({ message: "Imported successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;