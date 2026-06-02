const express = require('express');
const router = express.Router();
const pool = require('./db'); // Update path to your database configuration
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

// File Upload Configuration
const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'AssetMaintenance-' + Date.now() + path.extname(file.originalname))
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
        const [rows] = await connection.query('SELECT * FROM asset_maintenance_log ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { maintenance_date, asset_id, asset_name, issue_reported, vendor, repair_cost, status, completed_date, remarks } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO asset_maintenance_log 
            (maintenance_date, asset_id, asset_name, issue_reported, vendor, repair_cost, status, completed_date, remarks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
        const [result] = await connection.execute(sql, [
            formatDate(maintenance_date), asset_id, asset_name, issue_reported, vendor, repair_cost, status, formatDate(completed_date), remarks
        ]);
        res.status(201).json({ message: "Success", id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { maintenance_date, asset_id, asset_name, issue_reported, vendor, repair_cost, status, completed_date, remarks } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE asset_maintenance_log SET 
            maintenance_date=?, asset_id=?, asset_name=?, issue_reported=?, vendor=?, repair_cost=?, status=?, completed_date=?, remarks=? 
            WHERE id=?`;
            
        await connection.execute(sql, [
            formatDate(maintenance_date), asset_id, asset_name, issue_reported, vendor, repair_cost, status, formatDate(completed_date), remarks, id
        ]);
        res.json({ message: "Updated successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM asset_maintenance_log WHERE id = ?', [req.params.id]);
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
            formatDate(row["Date"]),
            row["Asset ID"],
            row["Asset Name"],
            row["Issue Reported"],
            row["Vendor"],
            row["Repair Cost"],
            row["Status"],
            formatDate(row["Completed Date"]),
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO asset_maintenance_log 
            (maintenance_date, asset_id, asset_name, issue_reported, vendor, repair_cost, status, completed_date, remarks) 
            VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records imported successfully` });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { if (connection) connection.release(); }
});

module.exports = router;