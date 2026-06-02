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
        cb(null, 'ClientSteps-' + Date.now() + path.extname(file.originalname));
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
            'SELECT * FROM backend_task ORDER BY id DESC'
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
            record_date, client_id, backend_id,
            advisor_name, advisor_ct_no,
            company_name, description,
            step_1, step_2, step_3, step_4, step_5,
            step_6, step_7, step_8, step_9, step_10,
            step_11, step_12, step_13, step_14, step_15,
            status, status_update_date,
            issue_date, performance, cp_mail, comments
        } = req.body;

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO backend_task (
                record_date, client_id, backend_id,
                advisor_name, advisor_ct_no,
                company_name, description,
                step_1, step_2, step_3, step_4, step_5,
                step_6, step_7, step_8, step_9, step_10,
                step_11, step_12, step_13, step_14, step_15,
                status, status_update_date,
                issue_date, performance, cp_mail, comments
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?
            )
        `;

        const [result] = await connection.execute(sql, [
            formatDate(record_date),
            client_id,
            backend_id,
            advisor_name,
            advisor_ct_no,
            company_name,
            description,
            step_1, step_2, step_3, step_4, step_5,
            step_6, step_7, step_8, step_9, step_10,
            step_11, step_12, step_13, step_14, step_15,
            status,
            formatDate(status_update_date),
            formatDate(issue_date),
            performance,
            cp_mail,
            comments
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
            record_date, client_id, backend_id,
            advisor_name, advisor_ct_no,
            company_name, description,
            step_1, step_2, step_3, step_4, step_5,
            step_6, step_7, step_8, step_9, step_10,
            step_11, step_12, step_13, step_14, step_15,
            status, status_update_date,
            issue_date, performance, cp_mail, comments
        } = req.body;

        connection = await pool.getConnection();

        const sql = `
            UPDATE backend_task SET
                record_date = ?, client_id = ?, backend_id = ?,
                advisor_name = ?, advisor_ct_no = ?,
                company_name = ?, description = ?,
                step_1 = ?, step_2 = ?, step_3 = ?, step_4 = ?, step_5 = ?,
                step_6 = ?, step_7 = ?, step_8 = ?, step_9 = ?, step_10 = ?,
                step_11 = ?, step_12 = ?, step_13 = ?, step_14 = ?, step_15 = ?,
                status = ?, status_update_date = ?,
                issue_date = ?, performance = ?, cp_mail = ?, comments = ?
            WHERE id = ?
        `;

        const [result] = await connection.execute(sql, [
            formatDate(record_date),
            client_id,
            backend_id,
            advisor_name,
            advisor_ct_no,
            company_name,
            description,
            step_1, step_2, step_3, step_4, step_5,
            step_6, step_7, step_8, step_9, step_10,
            step_11, step_12, step_13, step_14, step_15,
            status,
            formatDate(status_update_date),
            formatDate(issue_date),
            performance,
            cp_mail,
            comments,
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
            'DELETE FROM backend_task WHERE id = ?',
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
            formatDate(row["Date"]),
            row["Client ID"],
            row["BackEnd ID"],
            row["Advisor Name"],
            row["Advisor CT No."],
            row["Company Name"],
            row["Description"],
            row["Step 1"], row["Step 2"], row["Step 3"], row["Step 4"], row["Step 5"],
            row["Step 6"], row["Step 7"], row["Step 8"], row["Step 9"], row["Step 10"],
            row["Step 11"], row["Step 12"], row["Step 13"], row["Step 14"], row["Step 15"],
            row["Status"],
            formatDate(row["Dates of Status Updation"]),
            formatDate(row["Issue Date"]),
            row["Performance"],
            row["CP Mail"],
            row["Comments"]
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO backend_task (
                record_date, client_id, backend_id,
                advisor_name, advisor_ct_no,
                company_name, description,
                step_1, step_2, step_3, step_4, step_5,
                step_6, step_7, step_8, step_9, step_10,
                step_11, step_12, step_13, step_14, step_15,
                status, status_update_date,
                issue_date, performance, cp_mail, comments
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