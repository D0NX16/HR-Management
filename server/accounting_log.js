const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); 
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

// Helpers to handle undefined or empty strings (Prevents 'undefined' SQL crash)
const sanitizeText = (val) => {
    if (val === undefined || val === null || val === '') return null;
    return String(val).trim();
};

const formatDate = (d) => {
    if (!d || d === '') return null;
    if (d instanceof Date) return d.toISOString().split('T')[0];
    return String(d).trim();
};

const formatDecimal = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
};

/* ==================================================
   1. GET ALL
================================================== */
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM accounting_log ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

/* ==================================================
   2. ADD NEW
================================================== */
router.post('/', async (req, res) => {
    let connection;
    try {
        const {
            log_date, company_name, scope_of_work,
            amount_of_advance, balance_payment, sub_total, gst_18, grand_total,
            kind_of_advance, mode_of_payment, bank_name,
            ct_person_name, ct_number, ct_person_designation,
            payment_confirmation, advisor_name
        } = req.body;

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO accounting_log (
                log_date, company_name, scope_of_work,
                amount_of_advance, balance_payment, sub_total, gst_18, grand_total,
                kind_of_advance, mode_of_payment, bank_name,
                ct_person_name, ct_number, ct_person_designation,
                payment_confirmation, advisor_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(sql, [
            formatDate(log_date), sanitizeText(company_name), sanitizeText(scope_of_work),
            formatDecimal(amount_of_advance), formatDecimal(balance_payment), formatDecimal(sub_total), 
            formatDecimal(gst_18), formatDecimal(grand_total),
            sanitizeText(kind_of_advance), sanitizeText(mode_of_payment), sanitizeText(bank_name),
            sanitizeText(ct_person_name), sanitizeText(ct_number), sanitizeText(ct_person_designation),
            sanitizeText(payment_confirmation), sanitizeText(advisor_name)
        ]);

        res.status(201).json({ message: "Inserted successfully", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

/* ==================================================
   3. UPDATE
================================================== */
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const {
            log_date, company_name, scope_of_work,
            amount_of_advance, balance_payment, sub_total, gst_18, grand_total,
            kind_of_advance, mode_of_payment, bank_name,
            ct_person_name, ct_number, ct_person_designation,
            payment_confirmation, advisor_name
        } = req.body;

        connection = await pool.getConnection();

        const sql = `
            UPDATE accounting_log SET 
                log_date = ?, company_name = ?, scope_of_work = ?,
                amount_of_advance = ?, balance_payment = ?, sub_total = ?, gst_18 = ?, grand_total = ?,
                kind_of_advance = ?, mode_of_payment = ?, bank_name = ?,
                ct_person_name = ?, ct_number = ?, ct_person_designation = ?,
                payment_confirmation = ?, advisor_name = ?
            WHERE id = ?
        `;

        const [result] = await connection.execute(sql, [
            formatDate(log_date), sanitizeText(company_name), sanitizeText(scope_of_work),
            formatDecimal(amount_of_advance), formatDecimal(balance_payment), formatDecimal(sub_total), 
            formatDecimal(gst_18), formatDecimal(grand_total),
            sanitizeText(kind_of_advance), sanitizeText(mode_of_payment), sanitizeText(bank_name),
            sanitizeText(ct_person_name), sanitizeText(ct_number), sanitizeText(ct_person_designation),
            sanitizeText(payment_confirmation), sanitizeText(advisor_name),
            id
        ]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "ID not found" });

        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

/* ==================================================
   4. DELETE
================================================== */
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const [result] = await connection.query('DELETE FROM accounting_log WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "ID not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

/* ==================================================
   5. UPLOAD EXCEL
================================================== */
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { defval: null });

        if (data.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Excel is empty" });
        }

        const values = data.map(row => [
            formatDate(row["Date"]),
            sanitizeText(row["Name of Company"]),
            sanitizeText(row["Scope of Work"]),
            formatDecimal(row["Amount of Advance"]),
            formatDecimal(row["Balance Payment"]),
            formatDecimal(row["Sub Total"]),
            formatDecimal(row["GST 18%"]),
            formatDecimal(row["Grand Total"]),
            sanitizeText(row["Kind of Advance"]),
            sanitizeText(row["Mode of Payment"]),
            sanitizeText(row["Bank Name"]),
            sanitizeText(row["CT. Person Name"]),
            sanitizeText(row["CT. Number"]),
            sanitizeText(row["CT Person Desigination"]),
            sanitizeText(row["Payment Confirmation"]),
            sanitizeText(row["Advisor Name"])
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO accounting_log (
                log_date, company_name, scope_of_work,
                amount_of_advance, balance_payment, sub_total, gst_18, grand_total,
                kind_of_advance, mode_of_payment, bank_name,
                ct_person_name, ct_number, ct_person_designation,
                payment_confirmation, advisor_name
            ) VALUES ?
        `;

        await connection.query(sql, [values]);

        fs.unlinkSync(req.file.path);
        res.json({ message: `✅ ${values.length} records uploaded successfully` });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;