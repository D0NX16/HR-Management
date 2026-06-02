const express = require('express');
const router = express.Router();
const pool = require('./db'); // Ensure this points to your DB connection file
const xlsx = require('xlsx');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/temp/' });

// 1. GET ALL RECORDS
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM petrol_allowances ORDER BY entry_date DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW RECORD
router.post('/', async (req, res) => {
    let connection;
    try {
        const { entry_date, employee_name, department, in_time, from_kms, out_time, end_kms, total_kms, verified_by, total_amount, payment_mode, payment_cleared_date, branch, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO petrol_allowances (entry_date, employee_name, department, in_time, from_kms, out_time, end_kms, total_kms, verified_by, total_amount, payment_mode, payment_cleared_date, branch, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [entry_date, employee_name, department, in_time, from_kms, out_time, end_kms, total_kms, verified_by, total_amount, payment_mode, payment_cleared_date, branch, remarks]);
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE RECORD
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { entry_date, employee_name, department, in_time, from_kms, out_time, end_kms, total_kms, verified_by, total_amount, payment_mode, payment_cleared_date, branch, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE petrol_allowances SET entry_date=?, employee_name=?, department=?, in_time=?, from_kms=?, out_time=?, end_kms=?, total_kms=?, verified_by=?, total_amount=?, payment_mode=?, payment_cleared_date=?, branch=?, remarks=? WHERE id=?`;
        await connection.execute(sql, [entry_date, employee_name, department, in_time, from_kms, out_time, end_kms, total_kms, verified_by, total_amount, payment_mode, payment_cleared_date, branch, remarks, id]);
        res.json({ message: "Updated Successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE RECORD
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM petrol_allowances WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted Successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 5. UPLOAD EXCEL
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        const workbook = xlsx.readFile(req.file.path);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        const values = data.map(row => [
            row["Date"],
            row["Employee Name"],
            row["Department/Division"],
            row["In Time"],
            row["From kms"],
            row["Out Time"],
            row["End kms"],
            (parseFloat(row["End kms"]) - parseFloat(row["From kms"])), // Auto-calc total kms
            row["Verified By"],
            row["Total Amount"],
            row["Payment Mode"],
            row["Payment Cleared Date"],
            row["Branch"],
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO petrol_allowances (entry_date, employee_name, department, in_time, from_kms, out_time, end_kms, total_kms, verified_by, total_amount, payment_mode, payment_cleared_date, branch, remarks) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records imported` });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;