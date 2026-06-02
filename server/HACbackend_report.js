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
        cb(null, 'ProcessRecord-' + uniqueSuffix + path.extname(file.originalname));
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

// ✅ GET All Process Records
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM hac_records ORDER BY s_no DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ CREATE New Process Record
router.post('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const data = req.body;

        const sql = `
            INSERT INTO hac_records (
                record_date, backend_id, company_name, process, kop, 
                processing_days, fo_name, d_rec_date, front_end_status, app_sub_date, 
                be_status, be_status_2, be_date_updated, process_status, process_completion_date, 
                department, renewal_date, dept_location, original_doc_rec_mode, 
                quote_value, revised_value, work_update
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values =[
            formatDate(data.record_date), data.backend_id, data.company_name, data.process, data.kop,
            data.processing_days, data.fo_name, formatDate(data.d_rec_date), data.front_end_status, formatDate(data.app_sub_date),
            data.be_status, data.be_status_2, formatDate(data.be_date_updated), data.process_status, formatDate(data.process_completion_date),
            data.department, formatDate(data.renewal_date), data.dept_location, data.original_doc_rec_mode,
            data.quote_value, data.revised_value, data.work_update
        ];

        const [result] = await connection.query(sql, values);
        res.status(201).json({ message: "✅ Record added successfully", id: result.insertId });

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ UPDATE Process Record
router.put('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const data = req.body;

        const sql = `
            UPDATE hac_records SET 
                record_date=?, backend_id=?, company_name=?, process=?, kop=?, 
                processing_days=?, fo_name=?, d_rec_date=?, front_end_status=?, app_sub_date=?, 
                be_status=?, be_status_2=?, be_date_updated=?, process_status=?, process_completion_date=?, 
                department=?, renewal_date=?, dept_location=?, original_doc_rec_mode=?, 
                quote_value=?, revised_value=?, work_update=?
            WHERE s_no=?
        `;

        const values =[
            formatDate(data.record_date), data.backend_id, data.company_name, data.process, data.kop,
            data.processing_days, data.fo_name, formatDate(data.d_rec_date), data.front_end_status, formatDate(data.app_sub_date),
            data.be_status, data.be_status_2, formatDate(data.be_date_updated), data.process_status, formatDate(data.process_completion_date),
            data.department, formatDate(data.renewal_date), data.dept_location, data.original_doc_rec_mode,
            data.quote_value, data.revised_value, data.work_update, id
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

// ✅ DELETE Process Record
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const [result] = await connection.query('DELETE FROM hac_records WHERE s_no = ?', [id]);

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

        const values = data.map(row => [
            formatDate(row["Date"]),
            row["Backend Id"],
            row["Company Name"],
            row["Process"],
            row["KOP"],
            row["Processing Days"],
            row["FO Name"],
            formatDate(row["D-Rec-Date"]),
            row["Front End Status"],
            formatDate(row["App-Sub-Date"]),
            row["BE Status"],
            row["BE Status- 2"],
            formatDate(row["BE Date of Process Status Updated"]),
            row["Process Status"],
            formatDate(row["Process Completion Date"]),
            row["Department"],
            formatDate(row["Renewal Date"]),
            row["Dept Location"],
            row["Original Document Rec Mode"],
            row["Quote Value"],
            row["Revised Value"],
            row["Work Update"]
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO hac_records (
                record_date, backend_id, company_name, process, kop, 
                processing_days, fo_name, d_rec_date, front_end_status, app_sub_date, 
                be_status, be_status_2, be_date_updated, process_status, process_completion_date, 
                department, renewal_date, dept_location, original_doc_rec_mode, 
                quote_value, revised_value, work_update
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