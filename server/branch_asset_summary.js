const express = require('express');
const router = express.Router();
const pool = require('./db'); // Ensure this points to your database connection file
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

// File Upload Configuration
const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'BranchAssetSummary-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 1. GET ALL
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM branch_asset_summary ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { branch, total_assets, it_equipment, furniture, machinery, total_asset_value } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO branch_asset_summary 
            (branch, total_assets, it_equipment, furniture, machinery, total_asset_value) 
            VALUES (?, ?, ?, ?, ?, ?)`;
            
        const [result] = await connection.execute(sql, [
            branch, total_assets || 0, it_equipment || 0, furniture || 0, machinery || 0, total_asset_value
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
        const { branch, total_assets, it_equipment, furniture, machinery, total_asset_value } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE branch_asset_summary SET 
            branch=?, total_assets=?, it_equipment=?, furniture=?, machinery=?, total_asset_value=? 
            WHERE id=?`;
            
        await connection.execute(sql, [
            branch, total_assets || 0, it_equipment || 0, furniture || 0, machinery || 0, total_asset_value, id
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
        await connection.query('DELETE FROM branch_asset_summary WHERE id = ?', [req.params.id]);
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
            row["Branch"] || '',
            row["Total Assets"] || 0,
            row["IT Equipment"] || 0,
            row["Furniture"] || 0,
            row["Machinery"] || 0,
            row["Total Asset Value"] || ''
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO branch_asset_summary 
            (branch, total_assets, it_equipment, furniture, machinery, total_asset_value) 
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