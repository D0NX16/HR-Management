const express = require('express');
const router = express.Router();
const pool = require('./db'); // Adjust path to your db pool
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'AdvisorPerf-' + Date.now() + path.extname(file.originalname))
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
        const [rows] = await connection.query('SELECT * FROM advisor_performance ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { track_date, advisor_name, enquiry_of_the_day, advisor_call_count, payment_received, quotation_value, documents_received, process_move_to_backend, process_completion, acknowledgement, advance_reminder, reviews, hot_copy_received, moving_courier, confirmation_mail } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO advisor_performance (track_date, advisor_name, enquiry_of_the_day, advisor_call_count, payment_received, quotation_value, documents_received, process_move_to_backend, process_completion, acknowledgement, advance_reminder, reviews, hot_copy_received, moving_courier, confirmation_mail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [formatDate(track_date), advisor_name, enquiry_of_the_day, advisor_call_count, payment_received, quotation_value, documents_received, process_move_to_backend, process_completion, acknowledgement, advance_reminder, reviews, hot_copy_received, moving_courier, confirmation_mail]);
        res.status(201).json({ message: "Success", id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { track_date, advisor_name, enquiry_of_the_day, advisor_call_count, payment_received, quotation_value, documents_received, process_move_to_backend, process_completion, acknowledgement, advance_reminder, reviews, hot_copy_received, moving_courier, confirmation_mail } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE advisor_performance SET track_date=?, advisor_name=?, enquiry_of_the_day=?, advisor_call_count=?, payment_received=?, quotation_value=?, documents_received=?, process_move_to_backend=?, process_completion=?, acknowledgement=?, advance_reminder=?, reviews=?, hot_copy_received=?, moving_courier=?, confirmation_mail=? WHERE id=?`;
        await connection.execute(sql, [formatDate(track_date), advisor_name, enquiry_of_the_day, advisor_call_count, payment_received, quotation_value, documents_received, process_move_to_backend, process_completion, acknowledgement, advance_reminder, reviews, hot_copy_received, moving_courier, confirmation_mail, id]);
        res.json({ message: "Updated successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM advisor_performance WHERE id = ?', [req.params.id]);
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
            row["Advisor Name"],
            row["Enquiry of the day"],
            row["Advisor call Count"],
            row["Payment Received"],
            row["Quotation Value"],
            row["Documents Received from Clients"],
            row["Process move to backend"],
            row["Process completion"],
            row["Acknowledgement"],
            row["Advance Reminder of process"],
            row["Reviews of our service"],
            row["Hot Copy Received from backend"],
            row["Moving Courier"],
            row["Confirmation mail"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO advisor_performance (track_date, advisor_name, enquiry_of_the_day, advisor_call_count, payment_received, quotation_value, documents_received, process_move_to_backend, process_completion, acknowledgement, advance_reminder, reviews, hot_copy_received, moving_courier, confirmation_mail) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records imported successfully` });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { if (connection) connection.release(); }
});

module.exports = router;