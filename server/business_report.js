const express = require('express');
const router = express.Router();
const pool = require('./db');
const xlsx = require('xlsx');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/temp/' });

// 1. GET ALL
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM business_reports ORDER BY report_month DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { report_month, department, kpi_name, target_val, actual_val, variance_val, performance_status, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO business_reports (report_month, department, kpi_name, target_val, actual_val, variance_val, performance_status, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [report_month, department, kpi_name, target_val, actual_val, variance_val, performance_status, remarks]);
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { report_month, department, kpi_name, target_val, actual_val, variance_val, performance_status, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE business_reports SET report_month=?, department=?, kpi_name=?, target_val=?, actual_val=?, variance_val=?, performance_status=?, remarks=? WHERE id=?`;
        await connection.execute(sql, [report_month, department, kpi_name, target_val, actual_val, variance_val, performance_status, remarks, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM business_reports WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
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
            row["Month"],
            row["Department"],
            row["KPI Name"],
            row["Target"],
            row["Actual"],
            (parseFloat(row["Actual"]) - parseFloat(row["Target"])), // Auto Variance Calc
            row["Performance Status"],
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO business_reports (report_month, department, kpi_name, target_val, actual_val, variance_val, performance_status, remarks) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} report records imported` });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;