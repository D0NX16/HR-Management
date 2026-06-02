const express = require('express');
const router = express.Router();
const pool = require('./db'); // Update path to your db config
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'OfficeVisit-' + Date.now() + path.extname(file.originalname))
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
        const [rows] = await connection.query('SELECT * FROM office_visits ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { 
            visit_date, institution_name, city, cp_name, designation, 
            cp_mobile_no, cp_whatsapp, email_id, award_category, ide, remarks 
        } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO office_visits 
            (visit_date, institution_name, city, cp_name, designation, cp_mobile_no, cp_whatsapp, email_id, award_category, ide, remarks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
        const [result] = await connection.execute(sql, [
            formatDate(visit_date), institution_name, city, cp_name, designation, 
            cp_mobile_no, cp_whatsapp, email_id, award_category, ide, remarks
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
            visit_date, institution_name, city, cp_name, designation, 
            cp_mobile_no, cp_whatsapp, email_id, award_category, ide, remarks 
        } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE office_visits SET 
            visit_date=?, institution_name=?, city=?, cp_name=?, designation=?, 
            cp_mobile_no=?, cp_whatsapp=?, email_id=?, award_category=?, ide=?, remarks=? 
            WHERE id=?`;
            
        await connection.execute(sql, [
            formatDate(visit_date), institution_name, city, cp_name, designation, 
            cp_mobile_no, cp_whatsapp, email_id, award_category, ide, remarks, id
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
        await connection.query('DELETE FROM office_visits WHERE id = ?', [req.params.id]);
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
            row["Institution Name"] || row["Institution Name "], // Accommodating possible trailing space
            row["City"],
            row["CP Name"],
            row["Designation"],
            row["CP Mobile No."],
            row["CP Whatsapp"],
            row["Email ID"],
            row["Award Category"],
            row["IDE"],
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO office_visits 
            (visit_date, institution_name, city, cp_name, designation, cp_mobile_no, cp_whatsapp, email_id, award_category, ide, remarks) 
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