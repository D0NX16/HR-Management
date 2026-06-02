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
        cb(null, 'SOPTracker-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function formatDate(date) {
    if (!date) return null;
    if (date instanceof Date) {
        d = new Date(date);
        d.setDate(d.getDate() + 1); // Handles Excel timezone shifts
        return d.toISOString().split('T')[0];
    }
    return date;
}

// ✅ GET All Records
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM sop_tracker');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ CREATE New Record
router.post('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const data = req.body;

        const sql = `
            INSERT INTO sop_tracker (
                client_id, backend_id, company_name, service_type, front_end_advisor, 
                enquiry_date, quotation_sent_date, payment_received_date, docs_received_date, 
                forwarded_to_tn_backend, tn_backend_completion, forwarded_to_chn_backend, 
                ack_issued_date, ack_shared_to_client, current_status, 
                expected_completion_date, actual_completion_date, pending_payment, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values =[
            data.client_id, data.backend_id, data.company_name, data.service_type, data.front_end_advisor,
            formatDate(data.enquiry_date), formatDate(data.quotation_sent_date), formatDate(data.payment_received_date), formatDate(data.docs_received_date),
            formatDate(data.forwarded_to_tn_backend), formatDate(data.tn_backend_completion), formatDate(data.forwarded_to_chn_backend),
            formatDate(data.ack_issued_date), formatDate(data.ack_shared_to_client), data.current_status,
            formatDate(data.expected_completion_date), formatDate(data.actual_completion_date), data.pending_payment, data.remarks
        ];

        const [result] = await connection.query(sql, values);
        res.status(201).json({ message: "✅ Record added successfully", id: result.insertId });

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ UPDATE Record
router.put('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const data = req.body;

        const sql = `
            UPDATE sop_tracker SET 
                client_id=?, backend_id=?, company_name=?, service_type=?, front_end_advisor=?, 
                enquiry_date=?, quotation_sent_date=?, payment_received_date=?, docs_received_date=?, 
                forwarded_to_tn_backend=?, tn_backend_completion=?, forwarded_to_chn_backend=?, 
                ack_issued_date=?, ack_shared_to_client=?, current_status=?, 
                expected_completion_date=?, actual_completion_date=?, pending_payment=?, remarks=?
            WHERE s_no=?
        `;

        const values =[
            data.client_id, data.backend_id, data.company_name, data.service_type, data.front_end_advisor,
            formatDate(data.enquiry_date), formatDate(data.quotation_sent_date), formatDate(data.payment_received_date), formatDate(data.docs_received_date),
            formatDate(data.forwarded_to_tn_backend), formatDate(data.tn_backend_completion), formatDate(data.forwarded_to_chn_backend),
            formatDate(data.ack_issued_date), formatDate(data.ack_shared_to_client), data.current_status,
            formatDate(data.expected_completion_date), formatDate(data.actual_completion_date), data.pending_payment, data.remarks, 
            id
        ];

        const [result] = await connection.query(sql, values);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Record not found" });

        res.json({ message: "✅ Record updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ DELETE Record
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const [result] = await connection.query('DELETE FROM sop_tracker WHERE s_no = ?', [id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: "Record not found" });
        res.json({ message: "✅ Record deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ UPLOAD EXCEL
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = xlsx.utils.sheet_to_json(sheet, { defval: null });

        if (rawData.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        // Clean headers (Trim spaces) so matching never fails
        const data = rawData.map(row => {
            const cleanedRow = {};
            for (let key in row) {
                cleanedRow[key.trim()] = row[key];
            }
            return cleanedRow;
        });

        const values = data.map(row =>[
            row["Client ID"],
            row["BackEnd ID"],
            row["Company Name"],
            row["Service Type"],
            row["Front End Advisor"],
            formatDate(row["Enquiry Date"]),
            formatDate(row["Quotation Sent Date"]),
            formatDate(row["Payment Received Date"]),
            formatDate(row["Docs Received Date"]),
            formatDate(row["Forwarded to TN Backend"]),
            formatDate(row["TN Backend Completion"]),
            formatDate(row["Forwarded to CHN Backend"]),
            formatDate(row["ACK Issued Date"]),
            formatDate(row["ACK Shared to Client"]),
            row["Current Status"],
            formatDate(row["Expected Completion Date"]),
            formatDate(row["Actual Completion Date"]),
            row["Pending Payment"],
            row["Remarks"]
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO sop_tracker (
                client_id, backend_id, company_name, service_type, front_end_advisor, 
                enquiry_date, quotation_sent_date, payment_received_date, docs_received_date, 
                forwarded_to_tn_backend, tn_backend_completion, forwarded_to_chn_backend, 
                ack_issued_date, ack_shared_to_client, current_status, 
                expected_completion_date, actual_completion_date, pending_payment, remarks
            ) VALUES ?
        `;

        await connection.query(sql, [values]);
        fs.unlinkSync(req.file.path);

        res.json({ message: `✅ ${values.length} records imported successfully` });

    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;