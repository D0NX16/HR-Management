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


// 1. GET ALL
// URL: GET https://kgpl.net/api/hr_daily_reports/
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM hr_daily_task_reports ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 2. ADD NEW
// URL: POST https://kgpl.net/api/hr_daily_reports/
router.post('/', async (req, res) => {
    let connection;
    try {
        const {
            task_date, task_no, task_description, division, task_allocated_to, task_status,
            rec_date, rec_task_no, rec_description, department, nos_required, gender, 
            rec_allocated_to, rec_status, estimated_days
        } = req.body;

        connection = await pool.getConnection();

        const sql = `INSERT INTO hr_daily_task_reports 
        (task_date, task_no, task_description, division, task_allocated_to, task_status,
         rec_date, rec_task_no, rec_description, department, nos_required, gender, 
         rec_allocated_to, rec_status, estimated_days)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // Helper to handle empty dates
        const formatDate = (d) => (d === '' || d === undefined ? null : d);

        const [result] = await connection.execute(sql, [
            formatDate(task_date), task_no, task_description, division, task_allocated_to, task_status,
            formatDate(rec_date), rec_task_no, rec_description, department, nos_required, gender,
            rec_allocated_to, rec_status, estimated_days
        ]);

        res.status(201).json({ message: "Report added successfully", id: result.insertId });
    } catch (err) {
        console.error("Error adding report:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 3. DELETE
// URL: DELETE https://kgpl.net/api/hr_daily_reports/:id
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const [result] = await connection.query('DELETE FROM hr_daily_task_reports WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ID not found" });
        }

        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 4. UPDATE
// URL: PUT https://kgpl.net/api/hr_daily_reports/:id
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const {
            task_date, task_no, task_description, division, task_allocated_to, task_status,
            rec_date, rec_task_no, rec_description, department, nos_required, gender, 
            rec_allocated_to, rec_status, estimated_days
        } = req.body;
        
        connection = await pool.getConnection();
        
        const sql = `UPDATE hr_daily_task_reports SET
        task_date = ?, task_no = ?, task_description = ?, division = ?, task_allocated_to = ?, task_status = ?,
        rec_date = ?, rec_task_no = ?, rec_description = ?, department = ?, nos_required = ?, gender = ?,
        rec_allocated_to = ?, rec_status = ?, estimated_days = ?
        WHERE id = ?`;
        
        const formatDate = (d) => (d === '' || d === undefined ? null : d);
        
        const [result] = await connection.execute(sql, [
            formatDate(task_date), task_no, task_description, division, task_allocated_to, task_status,
            formatDate(rec_date), rec_task_no, rec_description, department, nos_required, gender,
            rec_allocated_to, rec_status, estimated_days,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ID not found" });
        }

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error("Error updating report:", err);
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
    getExactExcelDatePlusOne(row['Task Date']),        // task_date
    row['Task No'] || null,                            // task_no
    row['Task Description'] || null,                  // task_description
    row['Division'] || null,                          // division
    row['Task Allocated To'] || null,                 // task_allocated_to
    row['Task Status'] || 'Pending',                  // task_status
    getExactExcelDatePlusOne(row['Rec Date']),         // rec_date
    row['Rec Task No'] || null,                       // rec_task_no
    row['Rec Description'] || null,                   // rec_description
    row['Department'] || null,                        // department
    row['Nos Required'] || null,                      // nos_required
    row['Gender'] || null,                            // gender
    row['Rec Allocated To'] || null,                  // rec_allocated_to
    row['Rec Status'] || 'Pending',                   // rec_status
    row['Estimated Days'] || null                     // estimated_days
]);


        connection = await pool.getConnection();

const sql = `
    INSERT INTO hr_daily_task_reports (
        task_date,
        task_no,
        task_description,
        division,
        task_allocated_to,
        task_status,
        rec_date,
        rec_task_no,
        rec_description,
        department,
        nos_required,
        gender,
        rec_allocated_to,
        rec_status,
        estimated_days
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