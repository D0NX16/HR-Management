const express = require('express');
const router = express.Router();
const pool = require('./db'); // Adjust this path if your db.js is located elsewhere
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

// Multer for Excel uploads
const upload = multer({ dest: 'uploads/temp/' });

// Helper to safely parse numbers and prevent MySQL strict-mode crashes
const safeNum = (val) => (val === '' || val === null || isNaN(val)) ? 0.00 : parseFloat(val);

// Helper to convert empty string dropdowns to NULL for ENUM columns
const safeEnum = (val) => (val === '' || val === undefined) ? null : val;

// ── GET ALL PROFORMA INVOICES ────────────────────────────
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM proforma_voice ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching proformas:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ── GET ONE PROFORMA INVOICE ─────────────────────────────
router.get('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM proforma_voice WHERE id = ?', [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ── CREATE NEW PROFORMA INVOICE ──────────────────────────
router.post('/', async (req, res) => {
    let connection;
    try {
        const {
            date, quotation_id, proforma_id, client_id, company_name,
            description, sub_total, gst_18, grand_total, ct_person_name,
            ct_number, cp_number, ct_email_id, cp_person_designation, 
            advisor_name, advisor_ct_number, quote_sent_mode
        } = req.body;

        if (!quotation_id || !company_name) {
            return res.status(400).json({ error: 'Quotation ID and Company Name are required.' });
        }

        // Catch HTML "cp_number" mapping to DB "ct_number"
        const final_ct_number = ct_number || cp_number || null;

        connection = await pool.getConnection();
        const sql = `
            INSERT INTO proforma_voice (
                date, quotation_id, proforma_id, client_id, company_name,
                description, sub_total, gst_18, grand_total, ct_person_name,
                ct_number, ct_email_id, cp_person_designation,
                advisor_name, advisor_ct_number, quote_sent_mode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values =[
            date || null, quotation_id, proforma_id || null, client_id || null,
            company_name, description || null,
            safeNum(sub_total), safeNum(gst_18), safeNum(grand_total),
            ct_person_name || null, final_ct_number, ct_email_id || null,
            cp_person_designation || null, advisor_name || null,
            advisor_ct_number || null, safeEnum(quote_sent_mode)
        ];

        const [result] = await connection.query(sql, values);
        res.status(201).json({ message: '✅ Proforma Invoice added!', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Quotation ID already exists.' });
        }
        console.error("Add Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ── UPDATE PROFORMA INVOICE ──────────────────────────────
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const {
            date, quotation_id, proforma_id, client_id, company_name,
            description, sub_total, gst_18, grand_total, ct_person_name,
            ct_number, cp_number, ct_email_id, cp_person_designation,
            advisor_name, advisor_ct_number, quote_sent_mode
        } = req.body;

        if (!quotation_id || !company_name) {
            return res.status(400).json({ error: 'Quotation ID and Company Name are required.' });
        }

        const final_ct_number = ct_number || cp_number || null;

        connection = await pool.getConnection();
        const sql = `
            UPDATE proforma_voice SET
                date = ?, quotation_id = ?, proforma_id = ?, client_id = ?,
                company_name = ?, description = ?, sub_total = ?, gst_18 = ?,
                grand_total = ?, ct_person_name = ?, ct_number = ?,
                ct_email_id = ?, cp_person_designation = ?,
                advisor_name = ?, advisor_ct_number = ?, quote_sent_mode = ?
            WHERE id = ?
        `;
        const values =[
            date || null, quotation_id, proforma_id || null, client_id || null,
            company_name, description || null,
            safeNum(sub_total), safeNum(gst_18), safeNum(grand_total),
            ct_person_name || null, final_ct_number, ct_email_id || null,
            cp_person_designation || null, advisor_name || null,
            advisor_ct_number || null, safeEnum(quote_sent_mode),
            req.params.id
        ];

        const [result] = await connection.query(sql, values);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found.' });
        res.json({ message: '✅ Proforma Invoice updated!' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Quotation ID already exists.' });
        }
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ── DELETE PROFORMA INVOICE ──────────────────────────────
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(
            'DELETE FROM proforma_voice WHERE id = ?',[req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found.' });
        res.json({ message: '✅ Proforma Invoice deleted!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ── UPLOAD EXCEL ─────────────────────────────────────────
router.post('/upload/excel', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: 'Excel file is required.' });

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        if (!rows.length) return res.status(400).json({ error: 'Excel file is empty.' });

        connection = await pool.getConnection();
        await connection.beginTransaction();

        let imported = 0;
        const errors =[];

        for (const row of rows) {
            if (!row.quotation_id || !row.company_name) {
                errors.push(`Skipped row — missing quotation_id or company_name`);
                continue;
            }

            // Format date to prevent timezone shifting
            let dateVal = null;
            if (row.date) {
                if (row.date instanceof Date) {
                    row.date.setUTCHours(row.date.getUTCHours() + 24); 
                    dateVal = row.date.toISOString().slice(0, 10);
                } else {
                    dateVal = row.date;
                }
            }

            const sub = safeNum(row.sub_total);
            const gst = sub * 0.18;
            const grand = sub + gst;
            
            // Allow column flexibility if Excel headers say cp_number instead of ct_number
            const final_ct_number = row.ct_number || row.cp_number || null;

            const sql = `
                INSERT INTO proforma_voice (
                    date, quotation_id, proforma_id, client_id, company_name,
                    description, sub_total, gst_18, grand_total, ct_person_name,
                    ct_number, ct_email_id, cp_person_designation,
                    advisor_name, advisor_ct_number, quote_sent_mode
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    company_name = VALUES(company_name),
                    description = VALUES(description),
                    sub_total = VALUES(sub_total),
                    gst_18 = VALUES(gst_18),
                    grand_total = VALUES(grand_total),
                    updated_at = NOW()
            `;
            await connection.query(sql,[
                dateVal,
                row.quotation_id, row.proforma_id || null, row.client_id || null,
                row.company_name, row.description || null,
                sub,
                safeNum(row.gst_18) || gst,
                safeNum(row.grand_total) || grand,
                row.ct_person_name || null, final_ct_number,
                row.ct_email_id || null, row.cp_person_designation || null,
                row.advisor_name || null, row.advisor_ct_number || null,
                safeEnum(row.quote_sent_mode)
            ]);
            imported++;
        }

        await connection.commit();
        res.json({
            message: `✅ ${imported} Proforma invoices imported successfully.`,
            skipped: errors
        });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Upload Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
});

module.exports = router;