const express = require('express');
const router = express.Router();
const pool = require('./db'); // Ensure this points to your mysql2 pool configuration
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

// ✅ GET all payment bills
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM payment_bills ORDER BY due_date ASC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ GET a specific payment bill by ID
router.get('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const [rows] = await connection.query('SELECT * FROM payment_bills WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Payment bill not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ CREATE a new payment bill
router.post('/', async (req, res) => {
    let connection;
    try {
        const { title, vendor, amount, due_date, status } = req.body;
        connection = await pool.getConnection();
        
        const sql = 'INSERT INTO payment_bills (title, vendor, amount, due_date, status) VALUES (?, ?, ?, ?, ?)';
        const [result] = await connection.query(sql, [title, vendor, amount, due_date, status || 'Pending']);
        
        res.status(201).json({ message: '✅ Bill added successfully', id: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ UPDATE an existing payment bill
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { title, vendor, amount, due_date, status } = req.body;
        connection = await pool.getConnection();

        const sql = 'UPDATE payment_bills SET title = ?, vendor = ?, amount = ?, due_date = ?, status = ? WHERE id = ?';
        const [result] = await connection.query(sql, [title, vendor, amount, due_date, status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment bill not found' });
        }
        res.json({ message: '✅ Bill updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ DELETE a payment bill
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await pool.getConnection();
        
        const [result] = await connection.query('DELETE FROM payment_bills WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment bill not found' });
        }
        res.json({ message: '✅ Bill deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
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
            row['Title'] || null,
            row['Vendor'] || null,
            row['Amount'] || null,
            getExactExcelDatePlusOne(row['due_date']),
            row['status'] || 'Pending'
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO payment_bills (
                title,
                vendor,
                amount,
                due_date,
                status
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