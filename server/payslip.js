const express = require('express');
const router = express.Router();
const pool = require('./db');

// 1. GET ALL: Updated to include new display headers
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // Calculated 'total_deduction' as sum of pf, esic, advance, and professional_tax
        const sql = `SELECT id, employee_id, employee_name, department, designation, basic_salary, 
                    (pf + esic + advance + professional_tax) as total_deduction, 
                    net_salary, salary_date, payment_date, payment_mode, payment_status, remarks 
                    FROM Payslips ORDER BY id DESC`;
        const [rows] = await connection.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 2. GET SINGLE: Fetch full details
router.get('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const sql = `SELECT * FROM Payslips WHERE id = ?`;
        const [rows] = await connection.query(sql, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Payslip not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 3. POST: Add New Payslip (Includes New Columns)
router.post('/add', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const d = req.body;
        const sql = `
            INSERT INTO Payslips (
                salary_month, salary_year, employee_name, employee_id, designation, 
                date_of_joining, pan_number, department, uan_no, esi_no, bank_account_number,
                total_days, worked_days, lop_days, 
                basic_salary, da, hra, ca, pf, esic, advance, professional_tax, net_salary,
                salary_date, payment_date, payment_mode, payment_status, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            d.month, d.year, d.employee_name, d.employee_id, d.designation,
            d.date_of_joining, d.pan, d.department, d.uan_no, d.esi_no, d.bank_account_number,
            d.total_days, d.worked_days, d.lop,
            d.basic_salary, d.da, d.hra, d.ca, d.pf, d.esic, d.advance, d.professional_tax, d.net_salary,
            d.salary_date, d.payment_date, d.payment_mode, d.payment_status, d.remarks
        ];
        await connection.query(sql, values);
        res.json({ message: '✅ Payslip generated successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 4. PUT: Update Existing Payslip
router.put('/update/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const d = req.body;
        const sql = `
            UPDATE Payslips SET 
                salary_month=?, salary_year=?, employee_name=?, employee_id=?, designation=?, 
                date_of_joining=?, pan_number=?, department=?, uan_no=?, esi_no=?, bank_account_number=?,
                total_days=?, worked_days=?, lop_days=?, 
                basic_salary=?, da=?, hra=?, ca=?, pf=?, esic=?, advance=?, professional_tax=?, net_salary=?,
                salary_date=?, payment_date=?, payment_mode=?, payment_status=?, remarks=?
            WHERE id = ?
        `;
        const values = [
            d.month, d.year, d.employee_name, d.employee_id, d.designation,
            d.date_of_joining, d.pan, d.department, d.uan_no, d.esi_no, d.bank_account_number,
            d.total_days, d.worked_days, d.lop,
            d.basic_salary, d.da, d.hra, d.ca, d.pf, d.esic, d.advance, d.professional_tax, d.net_salary,
            d.salary_date, d.payment_date, d.payment_mode, d.payment_status, d.remarks, req.params.id
        ];
        await connection.query(sql, values);
        res.json({ message: '✅ Payslip updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

router.delete('/delete/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('DELETE FROM Payslips WHERE id = ?', [req.params.id]);
        res.json({ message: '✅ Deleted successfully!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) connection.release(); }
});

module.exports = router;