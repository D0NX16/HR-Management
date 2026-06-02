const express = require('express');
const router = express.Router();
const pool = require('./db'); 
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/recharge');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'Recharge-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const formatDate = (d) => {
    if (!d) return null;
    return d instanceof Date ? d.toISOString().split('T')[0] : d;
};

router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM mobile_recharges ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

router.post('/', async (req, res) => {
    let connection;
    try {
        const { branch, name, mobile_number, network, recharge_date, recharge_amount, validity, next_bill_date, recharged_by, remarks, recharge_reminder } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO mobile_recharges (branch, name, mobile_number, network, recharge_date, recharge_amount, validity, next_bill_date, recharged_by, remarks, recharge_reminder) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
        await connection.execute(sql, [branch, name, mobile_number, network, formatDate(recharge_date), recharge_amount, validity, formatDate(next_bill_date), recharged_by, remarks, recharge_reminder]);
        res.json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { branch, name, mobile_number, network, recharge_date, recharge_amount, validity, next_bill_date, recharged_by, remarks, recharge_reminder } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE mobile_recharges SET branch=?, name=?, mobile_number=?, network=?, recharge_date=?, recharge_amount=?, validity=?, next_bill_date=?, recharged_by=?, remarks=?, recharge_reminder=? WHERE id=?`;
        await connection.execute(sql, [branch, name, mobile_number, network, formatDate(recharge_date), recharge_amount, validity, formatDate(next_bill_date), recharged_by, remarks, recharge_reminder, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM mobile_recharges WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: "No file" });
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null });
        const values = data.map(row => [
            row["Branch"], row["Name"], row["Mobile Number"], row["Network"],
            formatDate(row["Recharge Date"]), row["Recharge Amount"], row["Validity"],
            formatDate(row["Next Bill Date"]), row["Recharged By"], row["Remarks"], row["Recharge Reminder"]
        ]);
        connection = await pool.getConnection();
        await connection.query(`INSERT INTO mobile_recharges (branch, name, mobile_number, network, recharge_date, recharge_amount, validity, next_bill_date, recharged_by, remarks, recharge_reminder) VALUES ?`, [values]);
        fs.unlinkSync(req.file.path);
        res.json({ message: "Imported successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;