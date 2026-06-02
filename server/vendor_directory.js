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
        const [rows] = await connection.query('SELECT * FROM vendor_directory ORDER BY vendor_name ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { vendor_name, service_type, contact_person, mobile_number, email_id, address, contract_start_date, contract_end_date, branch, status } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO vendor_directory (vendor_name, service_type, contact_person, mobile_number, email_id, address, contract_start_date, contract_end_date, branch, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [vendor_name, service_type, contact_person, mobile_number, email_id, address, formatDate(contract_start_date), formatDate(contract_end_date), branch, status]);
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { vendor_name, service_type, contact_person, mobile_number, email_id, address, contract_start_date, contract_end_date, branch, status } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE vendor_directory SET vendor_name=?, service_type=?, contact_person=?, mobile_number=?, email_id=?, address=?, contract_start_date=?, contract_end_date=?, branch=?, status=? WHERE id=?`;
        await connection.execute(sql, [vendor_name, service_type, contact_person, mobile_number, email_id, address, formatDate(contract_start_date), formatDate(contract_end_date), branch, status, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM vendor_directory WHERE id = ?', [req.params.id]);
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
            row["Vendor Name"],
            row["Service Type"],
            row["Contact Person"],
            row["Mobile Number"],
            row["Email ID"],
            row["Address"],
            formatDate(row["Contract Start Date"]),
            formatDate(row["Contract End Date"]),
            row["Branch"],
            row["Status"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO vendor_directory (vendor_name, service_type, contact_person, mobile_number, email_id, address, contract_start_date, contract_end_date, branch, status) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} vendors imported` });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;