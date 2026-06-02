const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

/* ================= UPLOAD CONFIG ================= */
const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        cb(null, 'AdvancePayment-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const getExactDate = (d) => d ? new Date(new Date(d).getTime() + 86400000).toISOString().split('T')[0] : null;
const sNum = (val) => (val === '' || val == null || isNaN(val)) ? 0.00 : parseFloat(val);

const TABLE_NAME = "balance_payment"; // <--- Change to your exact MySQL Table Name!

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const[rows] = await conn.query(`SELECT * FROM ${TABLE_NAME} ORDER BY id DESC`);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (conn) conn.release(); }
});

router.post('/', async (req, res) => {
    let conn;
    try {
        const d = req.body;
        conn = await pool.getConnection();
        const q = `INSERT INTO ${TABLE_NAME} 
            (payment_date, quotation_id, proforma_id, client_id, company_name, description,
             paid_advance, gst_18, grand_total, balance_amount, payment_mode, bank_name,
             ct_person, ct_number, ct_email, cp_designation, advisor_name, advisor_ct_no)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await conn.query(q,[
            d.payment_date || null, d.quotation_id || null, d.proforma_id || null, d.client_id || null, 
            d.company_name || null, d.description || null, sNum(d.paid_advance), sNum(d.gst_18), 
            sNum(d.grand_total), sNum(d.balance_amount), d.payment_mode || null, d.bank_name || null, 
            d.ct_person || null, d.ct_number || null, d.ct_email || null, d.cp_designation || null, 
            d.advisor_name || null, d.advisor_ct_no || null
        ]);
        res.status(201).json({ message: "Record added" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (conn) conn.release(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    try {
        const d = req.body;
        conn = await pool.getConnection();
        const q = `UPDATE ${TABLE_NAME} SET
            payment_date=?, quotation_id=?, proforma_id=?, client_id=?, company_name=?, description=?,
            paid_advance=?, gst_18=?, grand_total=?, balance_amount=?, payment_mode=?, bank_name=?, 
            ct_person=?, ct_number=?, ct_email=?, cp_designation=?, advisor_name=?, advisor_ct_no=?
            WHERE id=?`;
            
        await conn.query(q,[
            d.payment_date || null, d.quotation_id || null, d.proforma_id || null, d.client_id || null, 
            d.company_name || null, d.description || null, sNum(d.paid_advance), sNum(d.gst_18), 
            sNum(d.grand_total), sNum(d.balance_amount), d.payment_mode || null, d.bank_name || null, 
            d.ct_person || null, d.ct_number || null, d.ct_email || null, d.cp_designation || null, 
            d.advisor_name || null, d.advisor_ct_no || null, req.params.id
        ]);
        res.json({ message: "Record updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (conn) conn.release(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`DELETE FROM ${TABLE_NAME} WHERE id=?`,[req.params.id]);
        res.json({ message: "Record deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (conn) conn.release(); }
});

router.post('/upload', upload.single('file'), async (req, res) => {
    let conn;
    try {
        if (!req.file) return res.status(400).json({ error: "No file" });
        const wb = xlsx.readFile(req.file.path, { cellDates: true });
        const data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        
        const values = data.map(r => [
            getExactDate(r['payment_date']) || null, r['quotation_id'] || null, r['proforma_id'] || null, 
            r['client_id'] || null, r['company_name'] || null, r['description'] || null, 
            sNum(r['paid_advance']), sNum(r['gst_18']), sNum(r['grand_total']), sNum(r['balance_amount']), 
            r['payment_mode'] || null, r['bank_name'] || null, r['ct_person'] || null, 
            r['ct_number'] || null, r['ct_email'] || null, r['cp_designation'] || null, 
            r['advisor_name'] || null, r['advisor_ct_no'] || null
        ]);

        conn = await pool.getConnection();
        await conn.query(`INSERT INTO ${TABLE_NAME} (payment_date, quotation_id, proforma_id, client_id, company_name, description, paid_advance, gst_18, grand_total, balance_amount, payment_mode, bank_name, ct_person, ct_number, ct_email, cp_designation, advisor_name, advisor_ct_no) VALUES ?`, [values]);
        
        res.json({ message: "Uploaded" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { 
        if (conn) conn.release(); 
        if (req.file) fs.unlinkSync(req.file.path); 
    }
});

module.exports = router;