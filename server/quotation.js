const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Helper to fix Excel date shifting
function getExactExcelDatePlusOne(dateVal) {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    d.setUTCHours(d.getUTCHours() + 24); 
    return d.toISOString().split('T')[0];
}

// Helper to prevent MySQL strict-mode crashes on empty numeric inputs ("")
const safeNum = (val) => (val === '' || val === null || isNaN(val)) ? 0.00 : parseFloat(val);

// 1. GET ALL QUOTATIONS
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query("SELECT * FROM quotation_data ORDER BY id DESC");
        res.json(results);
    } catch (err) {
        console.error("Error fetching quotations:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 2. ADD SINGLE QUOTATION
router.post('/', async (req, res) => {
    let connection;
    try {
        const {
            quotation_date, quotation_id, client_id, company_name, description,
            sub_total, gst_18, grand_total,
            ct_person_name, cp_number, cp_person_designation,
            advisor_name, advisor_ct_number, reversed_quotation, quote_sent_mode
        } = req.body;

        connection = await pool.getConnection();
        const q = `INSERT INTO quotation_data 
            (quotation_date, quotation_id, client_id, company_name, description, sub_total, gst_18, grand_total,
             ct_person_name, cp_number, cp_person_designation, advisor_name, advisor_ct_number,
             reversed_quotation, quote_sent_mode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await connection.query(q,[
            quotation_date || null, quotation_id, client_id, company_name, description,
            safeNum(sub_total), safeNum(gst_18), safeNum(grand_total),
            ct_person_name, cp_number, cp_person_designation,
            advisor_name, advisor_ct_number, reversed_quotation || 'No', quote_sent_mode || null
        ]);
        res.status(201).json({ message: "✅ Quotation created successfully" });
    } catch (err) {
        console.error("Add Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 3. UPDATE QUOTATION
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const {
            quotation_date, quotation_id, client_id, company_name, description,
            sub_total, gst_18, grand_total,
            ct_person_name, cp_number, cp_person_designation,
            advisor_name, advisor_ct_number, reversed_quotation, quote_sent_mode
        } = req.body;

        connection = await pool.getConnection();
        const q = `UPDATE quotation_data SET
            quotation_date=?, quotation_id=?, client_id=?, company_name=?, description=?,
            sub_total=?, gst_18=?, grand_total=?,
            ct_person_name=?, cp_number=?, cp_person_designation=?,
            advisor_name=?, advisor_ct_number=?, reversed_quotation=?, quote_sent_mode=?
            WHERE id=?`;
            
        const [result] = await connection.query(q,[
            quotation_date || null, quotation_id, client_id, company_name, description,
            safeNum(sub_total), safeNum(gst_18), safeNum(grand_total),
            ct_person_name, cp_number, cp_person_designation,
            advisor_name, advisor_ct_number, reversed_quotation || 'No', quote_sent_mode || null,
            id
        ]);
        res.json({ message: "✅ Quotation updated successfully", result });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 4. DELETE QUOTATION
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await pool.getConnection();
        const [result] = await connection.query("DELETE FROM quotation_data WHERE id=?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Quotation not found" });
        res.json({ message: "✅ Quotation deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 5. BULK UPLOAD QUOTATIONS via Excel
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (data.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        const values = data.map(row => [
            getExactExcelDatePlusOne(row['quotation_date']) || null,
            row['quotation_id'] || null,
            row['client_id'] || null,
            row['company_name'] || null,
            row['description'] || null,
            safeNum(row['sub_total']),
            safeNum(row['gst_18']),
            safeNum(row['grand_total']),
            row['ct_person_name'] || null,
            row['cp_number'] || null,
            row['cp_person_designation'] || null,
            row['advisor_name'] || null,
            row['advisor_ct_number'] || null,
            row['reversed_quotation'] || 'No',
            row['quote_sent_mode'] || null
        ]);

        connection = await pool.getConnection();
        
        const q = `INSERT INTO quotation_data 
            (quotation_date, quotation_id, client_id, company_name, description, sub_total, gst_18, grand_total,
             ct_person_name, cp_number, cp_person_designation, advisor_name, advisor_ct_number,
             reversed_quotation, quote_sent_mode)
            VALUES ?`;
            
        await connection.query(q, [values]);

        res.json({ message: `✅ ${values.length} quotations uploaded successfully` });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
});

// 6. GET QUOTATION BY ID
router.get('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await pool.getConnection();
        const [results] = await connection.query("SELECT * FROM quotation_data WHERE id = ?", [id]);
        if (results.length === 0) return res.status(404).json({ message: "Quotation not found" });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;