const express = require('express');
const router = express.Router();
const pool = require('./db');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); 
const multer = require('multer');


const uploadDir = path.join(__dirname, 'uploads/temp'); // FIXED: Absolute path
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'Resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }); 


// GET ALL REPORTS
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM admin_reports ORDER BY id DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ADD NEW REPORT
router.post('/', async (req, res) => {
    let connection;
    try {
        const {
            task_id, task_description, task_assigned_by, assigned_to,
            priority, start_date, target_completion_date,
            final_status, actual_completion_date, reason_for_delay, submitted_to
        } = req.body;

        const formatNullDate = (d) => (!d ? null : d);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO admin_reports
            (task_id, task_description, task_assigned_by, assigned_to, priority,
             start_date, target_completion_date, final_status,
             actual_completion_date, reason_for_delay, submitted_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(sql, [
            task_id,
            task_description,
            task_assigned_by,
            assigned_to,
            priority,
            formatNullDate(start_date),
            formatNullDate(target_completion_date),
            final_status,
            formatNullDate(actual_completion_date),
            reason_for_delay,
            submitted_to
        ]);

        res.status(201).json({ message: 'Report added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// GET REPORT BY ID
router.get('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM admin_reports WHERE id = ?',
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// UPDATE REPORT
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const formatNullDate = (d) => (!d ? null : d);
        connection = await pool.getConnection();

        const sql = `
            UPDATE admin_reports SET
            task_id=?, task_description=?, task_assigned_by=?, assigned_to=?,
            priority=?, start_date=?, target_completion_date=?, final_status=?,
            actual_completion_date=?, reason_for_delay=?, submitted_to=?
            WHERE id=?
        `;

        const [result] = await connection.execute(sql, [
            req.body.task_id,
            req.body.task_description,
            req.body.task_assigned_by,
            req.body.assigned_to,
            req.body.priority,
            formatNullDate(req.body.start_date),
            formatNullDate(req.body.target_completion_date),
            req.body.final_status,
            formatNullDate(req.body.actual_completion_date),
            req.body.reason_for_delay,
            req.body.submitted_to,
            req.params.id
        ]);

        if (!result.affectedRows)
            return res.status(404).json({ error: 'Not found' });

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE REPORT
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'DELETE FROM admin_reports WHERE id = ?',
            [req.params.id]
        );
        if (!result.affectedRows)
            return res.status(404).json({ error: 'Not found' });

        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

function getExactExcelDatePlusOne(date) {
  if (!date || !(date instanceof Date)) {
    const today = new Date();
    today.setDate(today.getDate() + 1); // add 1 day
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }
  const d = new Date(date);
  d.setDate(d.getDate() + 1); // add 1 day
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        const values = data.map(row => [
            row['Task ID'] || null,
            row['Task Description'] || null,
            row['Assigned By'] || null,
            row['Assigned To'] || null,
            row['Priority'] || 'Medium',
            getExactExcelDatePlusOne(row['Start Date']),
            getExactExcelDatePlusOne(row['Target Completion Date']),
            row['Final Status'] || 'Pending',
            getExactExcelDatePlusOne(row['Actual Completion Date']),
            row['Reason For Delay'] || null,
            row['Submitted To'] || null
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO admin_reports (
                task_id,
                task_description,
                task_assigned_by,
                assigned_to,
                priority,
                start_date,
                target_completion_date,
                final_status,
                actual_completion_date,
                reason_for_delay,
                submitted_to
            ) VALUES ?
        `;

        await connection.query(sql, [values]);

        fs.unlinkSync(req.file.path);

        res.json({
            message: `✅ ${values.length} tasks imported successfully`
        });

    } catch (err) {
        console.error('Task Upload Error:', err);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;
