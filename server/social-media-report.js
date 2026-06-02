const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configure Multer for File Uploads
const uploadDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'SocialMedia-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const knownPlatforms = ["Whatsapp", "Telegram", "LinkedIn", "Instagram", "X", "Pintrest", "Quora", "YouTube", "Facebook"];

// 1. GET DATA FOR A SPECIFIC DATE AND DEPT
router.get('/:date', async (req, res) => {
    let connection;
    try {
        const { date } = req.params;
        const dept = req.query.dept || 'Auditor'; // Get dept from query

        connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM social_media_reports WHERE report_date = ? AND department = ?', 
            [date, dept]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); } 
    finally { if (connection) connection.release(); }
});

// 2. SAVE/UPDATE DATA (From Frontend Grid)
router.post('/', async (req, res) => {
    let connection;
    try {
        const { date, dept, records } = req.body;
        if (!date) return res.status(400).json({ error: "Date is required" });
        if (!dept) return res.status(400).json({ error: "Department is required" });

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Clear existing records ONLY for this date AND department
        await connection.query('DELETE FROM social_media_reports WHERE report_date = ? AND department = ?', [date, dept]);

        // Insert new records
        if (records && records.length > 0) {
            const values = records.map(r => [dept, date, r.employee, r.platform, r.task, r.status_value]);
            const sql = `INSERT INTO social_media_reports (department, report_date, employee_name, platform, task, status_value) VALUES ?`;
            await connection.query(sql, [values]);
        }

        await connection.commit();
        res.status(200).json({ message: "Report saved successfully" });
    } catch (err) { 
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message }); 
    } finally { if (connection) connection.release(); }
});

// 3. UPLOAD EXCEL (Parse Matrix Layout)
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        
        const { uploadDate, dept } = req.body; 
        if (!uploadDate) return res.status(400).json({ error: "Upload Date is required" });
        if (!dept) return res.status(400).json({ error: "Department is required" });

        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null }); 

        const headers = data[0]; 
        let currentPlatform = "";
        const recordsToInsert = [];

        for(let i = 1; i < data.length; i++) {
            const row = data[i];
            const cellB = row[1]; 
            
            if(!cellB) continue;

            if(knownPlatforms.includes(cellB.toString().trim())) {
                currentPlatform = cellB.toString().trim();
                continue; 
            }

            if(currentPlatform) {
                for(let colIndex = 2; colIndex < headers.length; colIndex++) {
                    const empName = headers[colIndex];
                    const cellValue = row[colIndex];
                    
                    if(cellValue !== null && cellValue !== "" && cellValue !== undefined) {
                        recordsToInsert.push([
                            dept, // Added Department
                            uploadDate, 
                            empName, 
                            currentPlatform, 
                            cellB.toString().trim(),
                            cellValue.toString().trim()
                        ]);
                    }
                }
            }
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // Delete only for this date and dept
        await connection.query('DELETE FROM social_media_reports WHERE report_date = ? AND department = ?', [uploadDate, dept]);
        
        if (recordsToInsert.length > 0) {
            const sql = `INSERT INTO social_media_reports (department, report_date, employee_name, platform, task, status_value) VALUES ?`;
            await connection.query(sql, [recordsToInsert]);
        }
        
        await connection.commit();
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${recordsToInsert.length} records imported successfully to ${dept} for ${uploadDate}` });

    } catch (err) {
        if (connection) await connection.rollback();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    } finally { if (connection) connection.release(); }
});

module.exports = router; 