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
    filename: (req, file, cb) => cb(null, 'AssetMaster-' + Date.now() + path.extname(file.originalname))
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
        const [rows] = await connection.query('SELECT * FROM asset_master_register ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { 
            asset_id, branch, department, asset_name, asset_category, 
            brand_model, serial_no, purchase_date, vendor, invoice_no, 
            purchase_value, custodian, asset_condition, warranty_expiry, 
            asset_tag_no, last_verification_date, remarks 
        } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO asset_master_register 
            (asset_id, branch, department, asset_name, asset_category, brand_model, serial_no, purchase_date, vendor, invoice_no, purchase_value, custodian, asset_condition, warranty_expiry, asset_tag_no, last_verification_date, remarks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
        const [result] = await connection.execute(sql, [
            asset_id, branch, department, asset_name, asset_category, 
            brand_model, serial_no, formatDate(purchase_date), vendor, invoice_no, 
            purchase_value, custodian, asset_condition, formatDate(warranty_expiry), 
            asset_tag_no, formatDate(last_verification_date), remarks
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
        const { 
            asset_id, branch, department, asset_name, asset_category, 
            brand_model, serial_no, purchase_date, vendor, invoice_no, 
            purchase_value, custodian, asset_condition, warranty_expiry, 
            asset_tag_no, last_verification_date, remarks 
        } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE asset_master_register SET 
            asset_id=?, branch=?, department=?, asset_name=?, asset_category=?, 
            brand_model=?, serial_no=?, purchase_date=?, vendor=?, invoice_no=?, 
            purchase_value=?, custodian=?, asset_condition=?, warranty_expiry=?, 
            asset_tag_no=?, last_verification_date=?, remarks=? WHERE id=?`;
            
        await connection.execute(sql, [
            asset_id, branch, department, asset_name, asset_category, 
            brand_model, serial_no, formatDate(purchase_date), vendor, invoice_no, 
            purchase_value, custodian, asset_condition, formatDate(warranty_expiry), 
            asset_tag_no, formatDate(last_verification_date), remarks, id
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
        await connection.query('DELETE FROM asset_master_register WHERE id = ?', [req.params.id]);
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
            row["Asset ID"],
            row["Branch"],
            row["Department"],
            row["Asset Name"],
            row["Asset Category"],
            row["Brand/Model"],
            row["Serial No"],
            formatDate(row["Purchase Date"]),
            row["Vendor"],
            row["Invoice No"],
            row["Purchase Value"],
            row["Custodian (Employee)"],
            row["Condition"],
            formatDate(row["Warranty Expiry"]),
            row["Asset Tag No"],
            formatDate(row["Last Verification Date"]),
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO asset_master_register 
            (asset_id, branch, department, asset_name, asset_category, brand_model, serial_no, purchase_date, vendor, invoice_no, purchase_value, custodian, asset_condition, warranty_expiry, asset_tag_no, last_verification_date, remarks) 
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