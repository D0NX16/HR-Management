const express = require('express');
const router = express.Router();
const pool = require('./db');
const xlsx = require('xlsx');
const multer = require('multer');
const fs = require('fs');

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
        const [rows] = await connection.query('SELECT * FROM compliance_tracker ORDER BY due_date ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { compliance_name, dept, due_date, responsible_person, status, filing_date, branch, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO compliance_tracker (compliance_name, dept, due_date, responsible_person, status, filing_date, branch, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [compliance_name, dept, formatDate(due_date), responsible_person, status, formatDate(filing_date), branch, remarks]);
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { compliance_name, dept, due_date, responsible_person, status, filing_date, branch, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE compliance_tracker SET compliance_name=?, dept=?, due_date=?, responsible_person=?, status=?, filing_date=?, branch=?, remarks=? WHERE id=?`;
        await connection.execute(sql, [compliance_name, dept, formatDate(due_date), responsible_person, status, formatDate(filing_date), branch, remarks, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM compliance_tracker WHERE id = ?', [req.params.id]);
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
            row["Compliance Name"],
            row["G. Dept"],
            formatDate(row["Due Date"]),
            row["Responsible Person"],
            row["Status"],
            formatDate(row["Filing Date"]),
            row["Branch"],
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO compliance_tracker (compliance_name, dept, due_date, responsible_person, status, filing_date, branch, remarks) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} compliance tasks imported` });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;