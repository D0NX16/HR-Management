const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');

const upload = multer({ dest: 'uploads/temp/' });

// Helper to prevent MySQL strict-mode crashes on empty dates
const safeDate = (val) => (val === '' || val === undefined) ? null : val;

// Helper to fix Excel Timezone shifting
const safeExcelDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) {
        val.setUTCHours(val.getUTCHours() + 24);
        return val.toISOString().split('T')[0];
    }
    return val;
};

// 1. Get all documents
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM documents ORDER BY id DESC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 2. Create a document
router.post('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const sql = `INSERT INTO documents 
            (doc_date, client_id, company_name, backend_id, description, date_received, docs_received_list, received_mode, date_enclosed, ct_person_name, cp_number, cp_email, ct_designation, advisor_name, advisor_contact) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values =[
            safeDate(req.body.doc_date), 
            req.body.client_id || null, 
            req.body.company_name || null, // Added missing company_name
            req.body.backend_id || null, 
            req.body.description || null,
            safeDate(req.body.date_received), 
            req.body.docs_received_list || null, 
            req.body.received_mode || null,
            safeDate(req.body.date_enclosed), 
            req.body.ct_person_name || null, 
            req.body.cp_number || null,
            req.body.cp_email || null, 
            req.body.ct_designation || null, 
            req.body.advisor_name || null, 
            req.body.advisor_contact || null
        ];

        const [result] = await connection.query(sql, values);
        res.status(201).json({ message: '✅ Document added successfully!', id: result.insertId });
    } catch (err) {
        console.error("Add Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 3. Update a document
router.put('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
const sql = `UPDATE documents SET doc_date=?, client_id=?, company_name=?, backend_id=?, description=?, date_received=?, docs_received_list=?, received_mode=?, date_enclosed=?, ct_person_name=?, cp_number=?, cp_email=?, ct_designation=?, advisor_name=?, advisor_contact=? WHERE id=?`;
        
        const values =[
            safeDate(req.body.doc_date), 
            req.body.client_id || null, 
            req.body.company_name || null, // Added missing company_name
            req.body.backend_id || null, 
            req.body.description || null,
            safeDate(req.body.date_received), 
            req.body.docs_received_list || null, 
            req.body.received_mode || null,
            safeDate(req.body.date_enclosed), 
            req.body.ct_person_name || null, 
            req.body.cp_number || null,
            req.body.cp_email || null, 
            req.body.ct_designation || null, 
            req.body.advisor_name || null, 
            req.body.advisor_contact || null,
            req.params.id
        ];

        await connection.query(sql, values);
        res.json({ message: '✅ Document updated successfully' });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 4. Delete a document
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM documents WHERE id = ?',[req.params.id]);
        res.json({ message: '✅ Document deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 5. Upload Excel
router.post('/upload-excel', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const workbook = XLSX.readFile(req.file.path, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        connection = await pool.getConnection();

        const sql = `INSERT INTO documents 
            (doc_date, client_id, company_name, backend_id, description, date_received, docs_received_list, received_mode, date_enclosed, ct_person_name, cp_number, cp_email, ct_designation, advisor_name, advisor_contact) 
            VALUES ?`;

        const values = sheetData.map(row =>[
            safeExcelDate(row.doc_date),
            row.client_id || null,
            row.company_name || null,
            row.backend_id || null,
            row.description || null,
            safeExcelDate(row.date_received),
            row.docs_received_list || null,
            row.received_mode || null,
            safeExcelDate(row.date_enclosed),
            row.ct_person_name || null,
            row.cp_number || null,
            row.cp_email || null,
            row.ct_designation || null,
            row.advisor_name || null,
            row.advisor_contact || null
        ]);

        if (values.length > 0) {
            await connection.query(sql, [values]);
        }

        fs.unlinkSync(req.file.path);
        res.json({ message: `✅ Successfully imported ${values.length} records!` });
    } catch (err) {
        console.error("Excel Upload Error:", err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;