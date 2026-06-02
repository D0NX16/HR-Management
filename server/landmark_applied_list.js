const express = require('express');
const router = express.Router();
const pool = require('./db'); // Ensure your DB connection file is correct
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'LandmarkAppliedList-' + Date.now() + path.extname(file.originalname))
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
        const [rows] = await connection.query('SELECT * FROM landmark_applied_list ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { 
            date, company_name, city, cp_name, designation, cp_mobile_no, 
            cp_whatsapp, email_id, products, industry, preference, site_location, 
            plot_no, land_size, source, ide, remarks
        } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO landmark_applied_list 
            (date, company_name, city, cp_name, designation, cp_mobile_no, cp_whatsapp, email_id, products, industry, preference, site_location, plot_no, land_size, source, ide, remarks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
        const [result] = await connection.execute(sql, [
            formatDate(date), company_name, city, cp_name, designation, cp_mobile_no, 
            cp_whatsapp, email_id, products, industry, preference, site_location, 
            plot_no, land_size, source, ide, remarks
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
            date, company_name, city, cp_name, designation, cp_mobile_no, 
            cp_whatsapp, email_id, products, industry, preference, site_location, 
            plot_no, land_size, source, ide, remarks
        } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE landmark_applied_list SET 
            date=?, company_name=?, city=?, cp_name=?, designation=?, cp_mobile_no=?, cp_whatsapp=?, email_id=?, products=?, industry=?, preference=?, site_location=?, plot_no=?, land_size=?, source=?, ide=?, remarks=? 
            WHERE id=?`;
            
        await connection.execute(sql, [
            formatDate(date), company_name, city, cp_name, designation, cp_mobile_no, 
            cp_whatsapp, email_id, products, industry, preference, site_location, 
            plot_no, land_size, source, ide, remarks, id
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
        await connection.query('DELETE FROM landmark_applied_list WHERE id = ?', [req.params.id]);
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
            row["Company Name"],
            row["City"],
            row["CP Name"],
            row["Designation"],
            row["CP Mobile No."] || row["CP Mobile No"], 
            row["CP Whatsapp"],
            row["Email ID"],
            row["Products"],
            row["Industry"],
            row["Preference"],
            row["Site Location"],
            row["Plot No"],
            row["Land Size"],
            row["Source"],
            row["IDE"],
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO landmark_applied_list 
            (date, company_name, city, cp_name, designation, cp_mobile_no, cp_whatsapp, email_id, products, industry, preference, site_location, plot_no, land_size, source, ide, remarks) 
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