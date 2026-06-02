const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'Appointment-' + Date.now() + path.extname(file.originalname))
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
        const [rows] = await connection.query('SELECT * FROM audit_appointments ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { app_date, advisor, company_name, contact_person, phone_no, mail_id, location, process, attended_by, app_time, status, google_reviews } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO audit_appointments (app_date, advisor, company_name, contact_person, phone_no, mail_id, location, process, attended_by, app_time, status, google_reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [formatDate(app_date), advisor, company_name, contact_person, phone_no, mail_id, location, process, attended_by, app_time, status, google_reviews]);
        res.status(201).json({ message: "Success", id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { app_date, advisor, company_name, contact_person, phone_no, mail_id, location, process, attended_by, app_time, status, google_reviews } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE audit_appointments SET app_date=?, advisor=?, company_name=?, contact_person=?, phone_no=?, mail_id=?, location=?, process=?, attended_by=?, app_time=?, status=?, google_reviews=? WHERE id=?`;
        await connection.execute(sql, [formatDate(app_date), advisor, company_name, contact_person, phone_no, mail_id, location, process, attended_by, app_time, status, google_reviews, id]);
        res.json({ message: "Updated successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM audit_appointments WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});


function formatExcelTime(val) {

    // Case 1: If already a Date object
    if (val instanceof Date) {
        return val.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Case 2: Excel serial number
    if (typeof val === "number") {
        const totalSeconds = Math.floor(val * 24 * 60 * 60);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Case 3: already string
    return val;
}
// 5. UPLOAD EXCEL
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null });
        const values = data.map(row => [
            formatDate(row["Date"]),
            row["Advisor"],
            row["Comapny Name"],
            row["Contact Person Name"],
            row["Phone No"],
            row["Mail Id"],
            row["Location"],
            row["Process"],
            row["Attended By"],
            formatExcelTime(row["Time"]),
            row["Status"],
            row["Google Reviews"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO audit_appointments (app_date, advisor, company_name, contact_person, phone_no, mail_id, location, process, attended_by, app_time, status, google_reviews) VALUES ?`;
        await connection.query(sql, [values]);
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records imported successfully` });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { if (connection) connection.release(); }
});

module.exports = router;