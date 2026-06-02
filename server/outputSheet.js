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
        cb(null, 'OutputSheet-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function formatDate(date) {
    if (!date) return null;
    if (date instanceof Date) {
        const d = new Date(date); // ✅ Added 'const'
        d.setDate(d.getDate() + 1); 
        return d.toISOString().split('T')[0];
    }
    return date;
}

// ✅ GET All Records
router.get('/', async (req, res) => {
    let connection;
    try {
        const dept = req.query.dept || 'Auditor'; // Get dept from frontend
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM output_sheet WHERE department = ? ORDER BY id DESC', [dept]);
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
            INSERT INTO output_sheet (
                department, record_date, advisor_name, 
                slot_09_10, slot_10_11, slot_11_12, slot_12_01, 
                slot_0130_02, slot_02_03, slot_03_04, slot_04_05, 
                slot_05_06, slot_06_0630
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values =[
            data.department, // Add department here
            formatDate(data.record_date), data.advisor_name,
            data.slot_09_10, data.slot_10_11, data.slot_11_12, data.slot_12_01,
            data.slot_0130_02, data.slot_02_03, data.slot_03_04, data.slot_04_05,
            data.slot_05_06, data.slot_06_0630
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
            UPDATE output_sheet SET 
                record_date=?, advisor_name=?, 
                slot_09_10=?, slot_10_11=?, slot_11_12=?, slot_12_01=?, 
                slot_0130_02=?, slot_02_03=?, slot_03_04=?, slot_04_05=?, 
                slot_05_06=?, slot_06_0630=?
            WHERE id=?
        `;

        const values =[
            formatDate(data.record_date), data.advisor_name,
            data.slot_09_10, data.slot_10_11, data.slot_11_12, data.slot_12_01,
            data.slot_0130_02, data.slot_02_03, data.slot_03_04, data.slot_04_05,
            data.slot_05_06, data.slot_06_0630, 
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
        const [result] = await connection.query('DELETE FROM output_sheet WHERE id = ?', [id]);

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
        
        const dept = req.body.department || 'Auditor'; // Read department from formData

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = xlsx.utils.sheet_to_json(sheet, { defval: null });

        if (rawData.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        const data = rawData.map(row => {
            const cleanedRow = {};
            for (let key in row) {
                if(key) cleanedRow[key.trim()] = row[key];
            }
            return cleanedRow;
        });

        const values = data.map(row =>[
            dept, // Insert department for every row from Excel
            formatDate(row["DATE"] || row["Date"]),
            row["Advisor Name"],
            row["09AM-10AM"],
            row["10AM-11AM"],
            row["11AM-12PM"],
            row["12PM-1PM"],
            row["1:30PM-2PM"],
            row["2PM-3PM"],
            row["3PM-4PM"],
            row["4PM-5PM"],
            row["5PM-6PM"],
            row["6PM-6.30PM"] || row["6PM-6:30PM"]
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO output_sheet (
                department, record_date, advisor_name, 
                slot_09_10, slot_10_11, slot_11_12, slot_12_01, 
                slot_0130_02, slot_02_03, slot_03_04, slot_04_05, 
                slot_05_06, slot_06_0630
            ) VALUES ?
        `;
                           
        await connection.query(sql, [values]);
        fs.unlinkSync(req.file.path);

        res.json({ message: `✅ ${values.length} records imported successfully to ${dept}` });

    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ EXPORT EXCEL (By Dept and Date Range)
router.get('/export', async (req, res) => {
    let connection;
    try {
        const dept = req.query.dept || 'Auditor';
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let sql = 'SELECT * FROM output_sheet WHERE department = ?';
        const values = [dept];

        // Add date filtering if dates are provided
        if (startDate && endDate) {
            sql += ' AND record_date BETWEEN ? AND ?';
            values.push(startDate, endDate);
        }

        sql += ' ORDER BY record_date DESC, id DESC';

        connection = await pool.getConnection();
        const [rows] = await connection.query(sql, values);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No records found for the selected date range.' });
        }

        // 1. Map SQL data to match exact Excel headers
        const excelData = rows.map(row => {
            // Format the date properly for Excel
            const formattedDate = row.record_date ? new Date(row.record_date).toISOString().split('T')[0] : '';
            return {
                "DATE": formattedDate,
                "Advisor Name": row.advisor_name || '',
                "09AM-10AM": row.slot_09_10 || '',
                "10AM-11AM": row.slot_10_11 || '',
                "11AM-12PM": row.slot_11_12 || '',
                "12PM-1PM": row.slot_12_01 || '',
                "1:30PM-2PM": row.slot_0130_02 || '',
                "2PM-3PM": row.slot_02_03 || '',
                "3PM-4PM": row.slot_03_04 || '',
                "4PM-5PM": row.slot_04_05 || '',
                "5PM-6PM": row.slot_05_06 || '',
                "6PM-6.30PM": row.slot_06_0630 || ''
            };
        });

        // 2. Generate Excel Buffer
        const worksheet = xlsx.utils.json_to_sheet(excelData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Report");

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // 3. Send to Client
        const filename = `${dept}_Report_${startDate || 'All'}_to_${endDate || 'All'}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;