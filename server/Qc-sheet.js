const express = require('express');
const router = express.Router();
const pool = require('./db'); // Ensure your DB pool path is correct
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'QC-Sheet-' + Date.now() + path.extname(file.originalname))
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
        const [rows] = await connection.query('SELECT * FROM qc_sheets ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { 
            qc_date, client_id, company_name, description, mode_of_document_received, 
            quotation_value, document_received, advance_payment, client_person_name, 
            client_person_number, client_person_mail_id, client_designation, advisor_name,
            update_1, update_2, update_3, update_4, update_5, update_6, remarks
        } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO qc_sheets (
            qc_date, client_id, company_name, description, mode_of_document_received, 
            quotation_value, document_received, advance_payment, client_person_name, 
            client_person_number, client_person_mail_id, client_designation, advisor_name,
            update_1, update_2, update_3, update_4, update_5, update_6, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await connection.execute(sql, [
            formatDate(qc_date), client_id, company_name, description, mode_of_document_received, 
            quotation_value, document_received, advance_payment, client_person_name, 
            client_person_number, client_person_mail_id, client_designation, advisor_name,
            update_1, update_2, update_3, update_4, update_5, update_6, remarks
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
            qc_date, client_id, company_name, description, mode_of_document_received, 
            quotation_value, document_received, advance_payment, client_person_name, 
            client_person_number, client_person_mail_id, client_designation, advisor_name,
            update_1, update_2, update_3, update_4, update_5, update_6, remarks
        } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE qc_sheets SET 
            qc_date=?, client_id=?, company_name=?, description=?, mode_of_document_received=?, 
            quotation_value=?, document_received=?, advance_payment=?, client_person_name=?, 
            client_person_number=?, client_person_mail_id=?, client_designation=?, advisor_name=?,
            update_1=?, update_2=?, update_3=?, update_4=?, update_5=?, update_6=?, remarks=? 
            WHERE id=?`;
            
        await connection.execute(sql, [
            formatDate(qc_date), client_id, company_name, description, mode_of_document_received, 
            quotation_value, document_received, advance_payment, client_person_name, 
            client_person_number, client_person_mail_id, client_designation, advisor_name,
            update_1, update_2, update_3, update_4, update_5, update_6, remarks, id
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
        await connection.query('DELETE FROM qc_sheets WHERE id = ?', [req.params.id]);
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
            row["Client ID"],
            row["Company Name"],
            row["Description"],
            row["Mode of document received"],
            row["Quotation Value"],
            row["Document received"],
            row["Advance Payment"],
            row["Client Person Name"],
            row["Client Person Number"],
            row["Client Person Mail ID"],
            row["Client Designation"],
            row["Advisor Name"],
            row["1st update"],
            row["2nd update"],
            row["3rd update"],
            row["4th update"],
            row["5th update"],
            row["6th update"],
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO qc_sheets (
            qc_date, client_id, company_name, description, mode_of_document_received, 
            quotation_value, document_received, advance_payment, client_person_name, 
            client_person_number, client_person_mail_id, client_designation, advisor_name,
            update_1, update_2, update_3, update_4, update_5, update_6, remarks
        ) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records imported successfully` });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { if (connection) connection.release(); }
});

module.exports = router;