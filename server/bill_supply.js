const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); 
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const multiUpload = upload.fields([
    { name: 'quotation_file', maxCount: 1 },
    { name: 'proforma_file', maxCount: 1 },
    { name: 'receipt_file', maxCount: 1 },
    { name: 'invoice_file', maxCount: 1 }
]);

// Helper to handle undefined or empty strings (Prevents 'undefined' SQL crash)
const sanitizeText = (val) => {
    if (val === undefined || val === null || val === '') return null;
    return String(val).trim();
};

// Helper to handle empty dates
const formatDate = (d) => {
    if (!d || d === '') return null;
    if (d instanceof Date) return d.toISOString().split('T')[0];
    return String(d).trim();
};

// Helper to handle empty decimal/number fields
const formatDecimal = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
};

// Route to view the uploaded files
router.get('/view-file/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

/* ==================================================
   1. GET ALL
================================================== */
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM bill_supply ORDER BY id DESC');
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
router.post('/', multiUpload, async (req, res) => {
    let connection;
    try {
        const {
            payment_date, quotation_id, proforma_id, invoice_id,
            client_id, company_name, description,
            invoice_paid_amount, gst_18, grand_total,
            payment_mode, bank_name,
            ct_person, ct_number, ct_designation,
            advisor_name, advisor_ct_no
        } = req.body;

        const quotation_file = req.files && req.files.quotation_file ? req.files.quotation_file[0].filename : null;
        const proforma_file = req.files && req.files.proforma_file ? req.files.proforma_file[0].filename : null;
        const receipt_file = req.files && req.files.receipt_file ? req.files.receipt_file[0].filename : null;
        const invoice_file = req.files && req.files.invoice_file ? req.files.invoice_file[0].filename : null;

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO bill_supply (
                payment_date, quotation_id, proforma_id, invoice_id,
                client_id, company_name, description,
                invoice_paid_amount, gst_18, grand_total,
                payment_mode, bank_name,
                ct_person, ct_number, ct_designation,
                advisor_name, advisor_ct_no,
                quotation_file, proforma_file, receipt_file, invoice_file
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Safely map and wrap fields with helpers
        const [result] = await connection.execute(sql, [
            formatDate(payment_date), sanitizeText(quotation_id), sanitizeText(proforma_id), sanitizeText(invoice_id),
            sanitizeText(client_id), sanitizeText(company_name), sanitizeText(description),
            formatDecimal(invoice_paid_amount), formatDecimal(gst_18), formatDecimal(grand_total),
            sanitizeText(payment_mode), sanitizeText(bank_name),
            sanitizeText(ct_person), sanitizeText(ct_number), sanitizeText(ct_designation),
            sanitizeText(advisor_name), sanitizeText(advisor_ct_no),
            sanitizeText(quotation_file), sanitizeText(proforma_file), sanitizeText(receipt_file), sanitizeText(invoice_file)
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
router.put('/:id', multiUpload, async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const {
            payment_date, quotation_id, proforma_id, invoice_id,
            client_id, company_name, description,
            invoice_paid_amount, gst_18, grand_total,
            payment_mode, bank_name,
            ct_person, ct_number, ct_designation,
            advisor_name, advisor_ct_no,
            remove_quotation_file, remove_proforma_file, remove_receipt_file, remove_invoice_file
        } = req.body;

        connection = await pool.getConnection();

        let updateFields = `
            payment_date = ?, quotation_id = ?, proforma_id = ?, invoice_id = ?,
            client_id = ?, company_name = ?, description = ?,
            invoice_paid_amount = ?, gst_18 = ?, grand_total = ?,
            payment_mode = ?, bank_name = ?,
            ct_person = ?, ct_number = ?, ct_designation = ?,
            advisor_name = ?, advisor_ct_no = ?
        `;
        
        let queryParams = [
            formatDate(payment_date), sanitizeText(quotation_id), sanitizeText(proforma_id), sanitizeText(invoice_id),
            sanitizeText(client_id), sanitizeText(company_name), sanitizeText(description),
            formatDecimal(invoice_paid_amount), formatDecimal(gst_18), formatDecimal(grand_total),
            sanitizeText(payment_mode), sanitizeText(bank_name),
            sanitizeText(ct_person), sanitizeText(ct_number), sanitizeText(ct_designation),
            sanitizeText(advisor_name), sanitizeText(advisor_ct_no)
        ];

        // 1. Quotation File Logic
        if (req.files && req.files.quotation_file) { 
            updateFields += `, quotation_file = ?`; 
            queryParams.push(req.files.quotation_file[0].filename); 
        } else if (remove_quotation_file === 'true') {
            updateFields += `, quotation_file = NULL`; 
        }

        // 2. Proforma File Logic
        if (req.files && req.files.proforma_file) { 
            updateFields += `, proforma_file = ?`; 
            queryParams.push(req.files.proforma_file[0].filename); 
        } else if (remove_proforma_file === 'true') {
            updateFields += `, proforma_file = NULL`; 
        }

        // 3. Receipt File Logic
        if (req.files && req.files.receipt_file) { 
            updateFields += `, receipt_file = ?`; 
            queryParams.push(req.files.receipt_file[0].filename); 
        } else if (remove_receipt_file === 'true') {
            updateFields += `, receipt_file = NULL`; 
        }

        // 4. Invoice File Logic
        if (req.files && req.files.invoice_file) { 
            updateFields += `, invoice_file = ?`; 
            queryParams.push(req.files.invoice_file[0].filename); 
        } else if (remove_invoice_file === 'true') {
            updateFields += `, invoice_file = NULL`; 
        }

        queryParams.push(id);
        const sql = `UPDATE bill_supply SET ${updateFields} WHERE id = ?`;

        const [result] = await connection.execute(sql, queryParams);

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
        const [result] = await connection.query('DELETE FROM bill_supply WHERE id = ?', [id]);
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
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { defval: null });

        if (data.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Excel is empty" });
        }

        // Apply helper wrappers so missing/empty Excel columns won't crash the query with `undefined`
        const values = data.map(row => [
            formatDate(row["Date"]),
            sanitizeText(row["Quotation ID"]),
            sanitizeText(row["Proforma ID"]),
            sanitizeText(row["Invoice ID"]),
            sanitizeText(row["Client ID"]),
            sanitizeText(row["Company Name"]),
            sanitizeText(row["Description"]),
            formatDecimal(row["Invoice Paid Amount"]),
            formatDecimal(row["GST 18%"]),
            formatDecimal(row["Grand Total"]),
            sanitizeText(row["Mode of Payment"]),
            sanitizeText(row["Bank Name"]),
            sanitizeText(row["CT. Person Name"]),
            sanitizeText(row["CT. Number"]),
            sanitizeText(row["CT Person Desigination"]),
            sanitizeText(row["Advisor Name"]),
            sanitizeText(row["Advisor CT No."])
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO bill_supply (
                payment_date, quotation_id, proforma_id, invoice_id,
                client_id, company_name, description,
                invoice_paid_amount, gst_18, grand_total,
                payment_mode, bank_name,
                ct_person, ct_number, ct_designation,
                advisor_name, advisor_ct_no
            ) VALUES ?
        `;

        await connection.query(sql, [values]);

        fs.unlinkSync(req.file.path);

        res.json({
            message: `✅ ${values.length} records uploaded successfully`
        });

    } catch (err) {
        if (req.file && fs.existsSync(req.file.path))
            fs.unlinkSync(req.file.path);

        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;