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
        cb(null, 'ClientDocuments-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const formatDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d.toISOString().split('T')[0];
    return d;
};

/* ==================================================
   1. GET ALL
================================================== */
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM audit_backend ORDER BY id DESC'
        );
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
            client_id, backend_id, company_name, description,
            ct_person_name, ct_number, alt_contact_number,
            ct_person_designation,
            document_rec_date, payment_rec_date,
            document_rec_mode, app_sub_date,
            fo_name, status, issue_date,
            performance, advisor_name, mail
        } = req.body;

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO audit_backend (
                client_id, backend_id, company_name, description,
                ct_person_name, ct_number, alt_contact_number,
                ct_person_designation,
                document_rec_date, payment_rec_date,
                document_rec_mode, app_sub_date,
                fo_name, status, issue_date,
                performance, advisor_name, mail
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(sql, [
            client_id,
            backend_id,
            company_name,
            description,
            ct_person_name,
            ct_number,
            alt_contact_number,
            ct_person_designation,
            formatDate(document_rec_date),
            formatDate(payment_rec_date),
            document_rec_mode,
            formatDate(app_sub_date),
            fo_name,
            status,
            formatDate(issue_date),
            performance,
            advisor_name,
            mail
        ]);

        res.status(201).json({
            message: "Inserted successfully",
            id: result.insertId
        });

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
            client_id, backend_id, company_name, description,
            ct_person_name, ct_number, alt_contact_number,
            ct_person_designation,
            document_rec_date, payment_rec_date,
            document_rec_mode, app_sub_date,
            fo_name, status, issue_date,
            performance, advisor_name, mail
        } = req.body;

        connection = await pool.getConnection();

        const sql = `
            UPDATE audit_backend SET
                client_id = ?, backend_id = ?, company_name = ?, description = ?,
                ct_person_name = ?, ct_number = ?, alt_contact_number = ?,
                ct_person_designation = ?,
                document_rec_date = ?, payment_rec_date = ?,
                document_rec_mode = ?, app_sub_date = ?,
                fo_name = ?, status = ?, issue_date = ?,
                performance = ?, advisor_name = ?, mail = ?
            WHERE id = ?
        `;

        const [result] = await connection.execute(sql, [
            client_id,
            backend_id,
            company_name,
            description,
            ct_person_name,
            ct_number,
            alt_contact_number,
            ct_person_designation,
            formatDate(document_rec_date),
            formatDate(payment_rec_date),
            document_rec_mode,
            formatDate(app_sub_date),
            fo_name,
            status,
            formatDate(issue_date),
            performance,
            advisor_name,
            mail,
            id
        ]);

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "ID not found" });

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

        const [result] = await connection.query(
            'DELETE FROM audit_backend WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "ID not found" });

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

        const values = data.map(row => [
            row["Client ID"],
            row["BackEnd ID"],
            row["Company Name"],
            row["Description"],
            row["CT. Person Name"],
            row["CT. Number"],
            row["Alt Contact Number"],
            row["CT Person Desigination"],
            formatDate(row["Document Rec-Date"]),
            formatDate(row["Payment Rec-Date"]),
            row["Document Rec Mode"],
            formatDate(row["App-Sub-Date"]),
            row["FO Name"],
            row["Status"],
            formatDate(row["Issue Date"]),
            row["Performance"],
            row["Advisor Name"],
            row["Mail"]
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO audit_backend (
                client_id, backend_id, company_name, description,
                ct_person_name, ct_number, alt_contact_number,
                ct_person_designation,
                document_rec_date, payment_rec_date,
                document_rec_mode, app_sub_date,
                fo_name, status, issue_date,
                performance, advisor_name, mail
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