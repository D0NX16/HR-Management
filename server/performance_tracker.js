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
        const [rows] = await connection.query('SELECT * FROM performance_tracker ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { track_date, advisor_name, follow_up_calls, connected_calls, missed_calls, new_enquiries, not_reachable, interested_leads, total_leads, quotation_sent, payment_received, converted_clients, documents_received, process_initiated, sent_to_backend, process_completion, acknowledgement_shared, confirmation_mail_sent, review_received, hard_copy_received, courier_dispatched, pending_payment, pending_client_approval, backend_queries } = req.body;
        
        connection = await pool.getConnection();
        const sql = `INSERT INTO performance_tracker (track_date, advisor_name, follow_up_calls, connected_calls, missed_calls, new_enquiries, not_reachable, interested_leads, total_leads, quotation_sent, payment_received, converted_clients, documents_received, process_initiated, sent_to_backend, process_completion, acknowledgement_shared, confirmation_mail_sent, review_received, hard_copy_received, courier_dispatched, pending_payment, pending_client_approval, backend_queries) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [formatDate(track_date), advisor_name, follow_up_calls, connected_calls, missed_calls, new_enquiries, not_reachable, interested_leads, total_leads, quotation_sent, payment_received, converted_clients, documents_received, process_initiated, sent_to_backend, process_completion, acknowledgement_shared, confirmation_mail_sent, review_received, hard_copy_received, courier_dispatched, pending_payment, pending_client_approval, backend_queries];
        
        const [result] = await connection.execute(sql, values);
        res.status(201).json({ message: "Success", id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { track_date, advisor_name, follow_up_calls, connected_calls, missed_calls, new_enquiries, not_reachable, interested_leads, total_leads, quotation_sent, payment_received, converted_clients, documents_received, process_initiated, sent_to_backend, process_completion, acknowledgement_shared, confirmation_mail_sent, review_received, hard_copy_received, courier_dispatched, pending_payment, pending_client_approval, backend_queries } = req.body;
        
        connection = await pool.getConnection();
        const sql = `UPDATE performance_tracker SET track_date=?, advisor_name=?, follow_up_calls=?, connected_calls=?, missed_calls=?, new_enquiries=?, not_reachable=?, interested_leads=?, total_leads=?, quotation_sent=?, payment_received=?, converted_clients=?, documents_received=?, process_initiated=?, sent_to_backend=?, process_completion=?, acknowledgement_shared=?, confirmation_mail_sent=?, review_received=?, hard_copy_received=?, courier_dispatched=?, pending_payment=?, pending_client_approval=?, backend_queries=? WHERE id=?`;
        const values = [formatDate(track_date), advisor_name, follow_up_calls, connected_calls, missed_calls, new_enquiries, not_reachable, interested_leads, total_leads, quotation_sent, payment_received, converted_clients, documents_received, process_initiated, sent_to_backend, process_completion, acknowledgement_shared, confirmation_mail_sent, review_received, hard_copy_received, courier_dispatched, pending_payment, pending_client_approval, backend_queries, id];
        
        await connection.execute(sql, values);
        res.json({ message: "Updated successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM performance_tracker WHERE id = ?', [req.params.id]);
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
            row["Follow-up Calls Made"],
            row["Connected Calls"],
            row["Missed calls"],
            row["New Enquiries Received"],
            row["Not Reachable Leads"],
            row["Interested Leads"],
            row["Total Leads Received"],
            row["Quotation Sent"],
            row["Payment Received"],
            row["Converted Clients"],
            row["Documents Received"],
            row["Process Initiated"],
            row["Sent to Backend"],
            row["Process Completion"],
            row["Acknowledgement Shared"],
            row["Confirmation Mail Sent"],
            row["Review Received"],
            row["Hard Copy Received"],
            row["Courier Dispatched"],
            row["Pending Payment"],
            row["Pending Client Approval"],
            row["Backend Queries"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO performance_tracker (track_date, advisor_name, follow_up_calls, connected_calls, missed_calls, new_enquiries, not_reachable, interested_leads, total_leads, quotation_sent, payment_received, converted_clients, documents_received, process_initiated, sent_to_backend, process_completion, acknowledgement_shared, confirmation_mail_sent, review_received, hard_copy_received, courier_dispatched, pending_payment, pending_client_approval, backend_queries) VALUES ?`;
        await connection.query(sql, [values]);
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records imported successfully` });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { if (connection) connection.release(); }
});

module.exports = router;