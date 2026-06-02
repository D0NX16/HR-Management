const express = require('express');
const router = express.Router();
const pool = require('./db'); 
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// 1. GET ALL CLIENTS
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query("SELECT * FROM client_data ORDER BY id DESC");
        res.json(results);
    } catch (err) {
        console.error("Error fetching clients:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 2. ADD SINGLE CLIENT
router.post('/', async (req, res) => {
    let connection;
    try {
        // ADDED missing fields here
        const { date_val, client_id, company_name, description, ct_person_name, ct_number, ct_email_id, ct_person_designation, advisor_name, advisor_ct_no, source_of_contact, status } = req.body;
        
        connection = await pool.getConnection();
        const q = "INSERT INTO client_data (date_val, client_id, company_name, description, ct_person_name, ct_number, ct_email_id, ct_person_designation, advisor_name, advisor_ct_no, source_of_contact, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        await connection.query(q,[date_val, client_id, company_name, description, ct_person_name, ct_number, ct_email_id, ct_person_designation, advisor_name, advisor_ct_no, source_of_contact, status]);
        res.status(201).json({ message: "✅ Client created successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 3. UPDATE CLIENT
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        // ADDED missing fields here
        const { date_val, client_id, company_name, description, ct_person_name, ct_number, ct_email_id, ct_person_designation, advisor_name, advisor_ct_no, source_of_contact, status } = req.body;
        
        connection = await pool.getConnection();
        const q = "UPDATE client_data SET date_val=?, client_id=?, company_name=?, description=?, ct_person_name=?, ct_number=?, ct_email_id=?, ct_person_designation=?, advisor_name=?, advisor_ct_no=?, source_of_contact=?, status=? WHERE id=?";
        
        const [result] = await connection.query(q,[date_val, client_id, company_name, description, ct_person_name, ct_number, ct_email_id, ct_person_designation, advisor_name, advisor_ct_no, source_of_contact, status, id]);
        
        if (result.affectedRows === 0) return res.status(404).json({ message: "Client not found" });
        res.json({ message: "✅ Client updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 4. DELETE CLIENT
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await pool.getConnection();
        await connection.query("DELETE FROM client_data WHERE id = ?", [id]);
        res.json({ message: "✅ Client deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 5. UPLOAD EXCEL
// Helper function to fix Excel date shifting
function getExactExcelDatePlusOne(dateVal) {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    // Excel dates can sometimes be off by 1 day due to UTC conversion
    d.setUTCHours(d.getUTCHours() + 24); 
    return d.toISOString().split('T')[0];
}

// 5. UPLOAD EXCEL
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

        // Mapping exact headers from your uploaded image
        const values = data.map(row =>[
            getExactExcelDatePlusOne(row['date_val']) || null, // date_val
            row['client_id'] || null,                          // client_id
            row['company_name'] || null,                       // company_name
            row['description'] || null,                        // description
            row['ct_person_name'] || null,                     // ct_person_name
            row['ct_number'] || null,                          // ct_number
            row['ct_email_id'] || null,                        // ct_email_id
            row['ct_person_designation'] || null,              // ct_person_designation
            row['advisor_name'] || null,                       // advisor_name
            row['advisor_ct_no'] || null,                      // advisor_ct_no
            row['source_of_contact'] || null,                  // source_of_contact
            row['status'] || 'Active'                          // status
        ]);

        connection = await pool.getConnection();

        const sql = `
            INSERT INTO client_data (
                date_val,
                client_id,
                company_name,
                description,
                ct_person_name,
                ct_number,
                ct_email_id,
                ct_person_designation,
                advisor_name,
                advisor_ct_no,
                source_of_contact,
                status
            ) VALUES ?
        `;

        await connection.query(sql, [values]);

        fs.unlinkSync(req.file.path);

        res.json({
            message: `✅ ${values.length} clients imported successfully`
        });

    } catch (err) {
        console.error('Client Upload Error:', err);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;