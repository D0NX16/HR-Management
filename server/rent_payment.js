const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const upload = multer({ dest: 'uploads/temp/' });

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
        const [rows] = await connection.query('SELECT * FROM rent_payments ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { rent_date, description, amount, payment_date, payment_mode, status, paid_by, branch, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO rent_payments (rent_date, description, amount, payment_date, payment_mode, status, paid_by, branch, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [formatDate(rent_date), description, amount, formatDate(payment_date), payment_mode, status, paid_by, branch, remarks]);
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { rent_date, description, amount, payment_date, payment_mode, status, paid_by, branch, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE rent_payments SET rent_date=?, description=?, amount=?, payment_date=?, payment_mode=?, status=?, paid_by=?, branch=?, remarks=? WHERE id=?`;
        await connection.execute(sql, [formatDate(rent_date), description, amount, formatDate(payment_date), payment_mode, status, paid_by, branch, remarks, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM rent_payments WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 5. UPLOAD EXCEL
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        const values = data.map(row => [
            formatDate(row["Date"]),
            row["Description"],
            row["Amount"],
            formatDate(row["Payment Date"]),
            row["Payment Mode"],
            row["Status"],
            row["Paid By"],
            row["Branch"],
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO rent_payments (rent_date, description, amount, payment_date, payment_mode, status, paid_by, branch, remarks) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records imported` });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;