const express = require('express');
const router = express.Router();
const pool = require('./db'); // Ensure this points to your DB connection
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'AdvisorEntry-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const formatDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d.toISOString().split('T')[0];
    return d;
};

// 1. GET ALL (With Role filtering and Search logic)
router.get('/', async (req, res) => {
    let connection;
    try {
        const { role, userId, search } = req.query;
        connection = await pool.getConnection();

        let sql = 'SELECT * FROM advisor_entries WHERE 1=1';
        let params = [];

        // If user is ADVISOR -> Force filter by their userId so they ONLY see their data
        if (role && role.toUpperCase() === 'ADVISOR') {
            sql += ' AND user_id = ?';
            params.push(userId);
        } 
        // If user is GENERAL MANAGER / PM -> See all data initially. Filter ONLY if search exists.
        else if (role && ['GENERAL MANAGER', 'AUDIT PROJECT MANAGER'].includes(role.toUpperCase())) {
            if (search && search.trim() !== '') {
                sql += ' AND advisor LIKE ?';
                params.push(`%${search}%`);
            }
        }

        sql += ' ORDER BY id DESC';
        const [rows] = await connection.query(sql, params);
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    } finally { 
        if (connection) connection.release(); 
    }
});


// 2. POST (Add new entry, saving user_id)
router.post('/', async (req, res) => {
    let connection;
    try {
        const { user_id, entry_date, company_name, city, pincode, cp_name, cp_mobile, enquiry_details, quote_value, lead_source, advisor, status } = req.body;
        
        // FIX: Prevent MySQL crash if quote_value is empty string
        const safeQuoteValue = quote_value ? parseFloat(quote_value) : 0.00;

        connection = await pool.getConnection();
        const sql = `INSERT INTO advisor_entries (user_id, entry_date, company_name, city, pincode, cp_name, cp_mobile, enquiry_details, quote_value, lead_source, advisor, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(sql, [user_id, formatDate(entry_date), company_name, city, pincode, cp_name, cp_mobile, enquiry_details, safeQuoteValue, lead_source, advisor, status]);
        
        res.status(201).json({ message: "Inserted", id: result.insertId });
    } catch (err) { 
        console.error("POST ERROR: ", err.message); // This will print the exact DB error to your terminal
        res.status(500).json({ error: err.message }); 
    } finally { 
        if (connection) connection.release(); 
    }
});

// 3. PUT (Update)
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { entry_date, company_name, city, pincode, cp_name, cp_mobile, enquiry_details, quote_value, lead_source, advisor, status } = req.body;
        
        // FIX: Prevent MySQL crash if quote_value is empty string
        const safeQuoteValue = quote_value ? parseFloat(quote_value) : 0.00;

        connection = await pool.getConnection();
        const sql = `UPDATE advisor_entries SET entry_date=?, company_name=?, city=?, pincode=?, cp_name=?, cp_mobile=?, enquiry_details=?, quote_value=?, lead_source=?, advisor=?, status=? WHERE id=?`;
        await connection.execute(sql, [formatDate(entry_date), company_name, city, pincode, cp_name, cp_mobile, enquiry_details, safeQuoteValue, lead_source, advisor, status, id]);
        
        res.json({ message: "Updated" });
    } catch (err) { 
        console.error("PUT ERROR: ", err.message);
        res.status(500).json({ error: err.message }); 
    } finally { 
        if (connection) connection.release(); 
    }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM advisor_entries WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    } finally { 
        if (connection) connection.release(); 
    }
});

// 5. UPLOAD EXCEL
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const user_id = req.body.user_id; // Grab user ID from form data

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null });

        const values = data.map(row => [
            user_id,
            formatDate(row["Date"]),
            row["Company Name"],
            row["City"],
            row["Pincode"],
            row["CP Name"],
            row["CP Mobile"],
            row["Equiry Details"],
            row["Quote Value"],
            row["Lead Source"],
            row["ADVISOR"],
            row["STATUS"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO advisor_entries (user_id, entry_date, company_name, city, pincode, cp_name, cp_mobile, enquiry_details, quote_value, lead_source, advisor, status) VALUES ?`;
        await connection.query(sql, [values]);
        fs.unlinkSync(req.file.path);
        res.json({ message: `${values.length} records uploaded successfully` });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { 
        if (connection) connection.release(); 
    }
});

module.exports = router;