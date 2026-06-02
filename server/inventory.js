const express = require('express');
const router = express.Router();
const pool = require('./db'); // Ensure this points to your DB config
const xlsx = require('xlsx');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/temp/' });

// 1. GET ALL
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM inventory_register ORDER BY entry_date DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 2. ADD NEW
router.post('/', async (req, res) => {
    let connection;
    try {
        const { item_name, category, qty_in, qty_out, balance_stock, unit, issued_to, entry_date, branch, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `INSERT INTO inventory_register (item_name, category, qty_in, qty_out, balance_stock, unit, issued_to, entry_date, branch, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await connection.execute(sql, [item_name, category, qty_in, qty_out, balance_stock, unit, issued_to, entry_date, branch, remarks]);
        res.status(201).json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 3. UPDATE
router.put('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { item_name, category, qty_in, qty_out, balance_stock, unit, issued_to, entry_date, branch, remarks } = req.body;
        connection = await pool.getConnection();
        const sql = `UPDATE inventory_register SET item_name=?, category=?, qty_in=?, qty_out=?, balance_stock=?, unit=?, issued_to=?, entry_date=?, branch=?, remarks=? WHERE id=?`;
        await connection.execute(sql, [item_name, category, qty_in, qty_out, balance_stock, unit, issued_to, entry_date, branch, remarks, id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM inventory_register WHERE id = ?', [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

// 5. EXCEL IMPORT
router.post('/upload', upload.single('file'), async (req, res) => {
    let connection;
    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        const values = sheetData.map(row => [
            row["Item Name"],
            row["Category"],
            row["Quantity In"] || 0,
            row["Quantity Out"] || 0,
            (parseInt(row["Quantity In"] || 0) - parseInt(row["Quantity Out"] || 0)),
            row["Unit"],
            row["Issued To"],
            row["Date"],
            row["Branch"],
            row["Remarks"]
        ]);

        connection = await pool.getConnection();
        const sql = `INSERT INTO inventory_register (item_name, category, qty_in, qty_out, balance_stock, unit, issued_to, entry_date, branch, remarks) VALUES ?`;
        await connection.query(sql, [values]);
        fs.unlinkSync(req.file.path);
        res.json({ message: "Imported successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;